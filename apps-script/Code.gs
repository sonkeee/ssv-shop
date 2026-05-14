const SHEET_NAME = "Bestellungen";
const ADMIN_EMAIL = "soenke.brauch@ssv-volleyball.de";
const NTFY_TOPIC_URL = "";

function authorizeMailAccess_() {
  const quota = MailApp.getRemainingDailyQuota();
  Logger.log("Mail quota: " + quota);
  return quota;
}

function sendTestMail_() {
  MailApp.sendEmail({
    to: ADMIN_EMAIL,
    subject: "SSV Shop Testmail",
    body: "Wenn du diese Mail bekommst, ist die Mail-Berechtigung korrekt aktiv.",
    name: "SSV Shop"
  });
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    const orderId = payload.orderId || createOrderId_();
    const rowNumber = writeOrderToSheet_(orderId, payload);
    const adminEmailStatus = runSafely_(function() {
      sendAdminEmail_(orderId, payload);
      return "OK";
    });
    const customerEmailStatus = runSafely_(function() {
      sendCustomerEmail_(orderId, payload);
      return "OK";
    });
    const phoneStatus = runSafely_(function() {
      sendPhoneNotification_(orderId, payload);
      return NTFY_TOPIC_URL ? "OK" : "DEAKTIVIERT";
    });

    updateDeliveryStatus_(rowNumber, adminEmailStatus, customerEmailStatus, phoneStatus);

    return jsonResponse_({
      ok: true,
      orderId: orderId,
      message: "Bestellung gespeichert.",
      adminEmailStatus: adminEmailStatus,
      customerEmailStatus: customerEmailStatus,
      phoneStatus: phoneStatus
    });
  } catch (error) {
    return jsonResponse_({
      ok: false,
      error: String(error)
    });
  }
}

function writeOrderToSheet_(orderId, payload) {
  const sheet = getSheet_();
  const items = payload.items || [];
  const itemSummary = items.map(function(item) {
    return [
      item.name || "",
      (item.group || "") + " / " + (item.size || ""),
      item.color || "",
      "Menge " + (item.qty || 0),
      item.withInitials ? "mit Initialen" : "ohne Initialen"
    ].join(" | ");
  }).join("\n");

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Zeitstempel",
      "Bestellnummer",
      "Name",
      "E-Mail",
      "Team",
      "Initialen",
      "Bemerkungen",
      "Artikel-Zusammenfassung",
      "Artikel-Anzahl",
      "Zwischensumme",
      "Initialen-Kosten",
      "Gesamt",
      "Admin-Mail Status",
      "Kunden-Mail Status",
      "Handy-Benachrichtigung Status"
    ]);
  }

  sheet.appendRow([
    payload.timestamp || new Date().toISOString(),
    orderId,
    payload.buyerName || "",
    payload.buyerEmail || "",
    payload.buyerTeam || "",
    payload.initials || "",
    payload.notes || "",
    itemSummary,
    items.reduce(function(sum, item) {
      return sum + Number(item.qty || 0);
    }, 0),
    payload.totals?.subtotal || 0,
    payload.totals?.initialsCost || 0,
    payload.totals?.total || 0,
    "",
    "",
    ""
  ]);

  const lastRow = sheet.getLastRow();
  const summaryRange = sheet.getRange(lastRow, 8);
  summaryRange.setWrap(true);
  return lastRow;
}

function updateDeliveryStatus_(rowNumber, adminEmailStatus, customerEmailStatus, phoneStatus) {
  const sheet = getSheet_();
  sheet.getRange(rowNumber, 13, 1, 3).setValues([[
    adminEmailStatus,
    customerEmailStatus,
    phoneStatus
  ]]);
}

function sendAdminEmail_(orderId, payload) {
  if (!ADMIN_EMAIL) {
    return;
  }

  const subject = "Neue Shop-Bestellung: " + orderId;
  const body = buildPlainTextSummary_(orderId, payload);
  const htmlBody = buildHtmlSummary_(orderId, payload, true);

  MailApp.sendEmail({
    to: ADMIN_EMAIL,
    subject: subject,
    body: body,
    htmlBody: htmlBody,
    name: "SSV Shop"
  });
}

function sendCustomerEmail_(orderId, payload) {
  const customerEmail = String(payload.buyerEmail || "").trim();
  if (!customerEmail) {
    throw new Error("Keine Kunden-E-Mail uebergeben.");
  }

  if (!isValidEmail_(customerEmail)) {
    throw new Error("Ungueltige Kunden-E-Mail: " + customerEmail);
  }

  const subject = "Deine SSV-Shop-Bestellung " + orderId;
  const body = [
    "Hallo " + (payload.buyerName || ""),
    "",
    "deine Bestellung ist eingegangen.",
    "",
    buildPlainTextSummary_(orderId, payload),
    "",
    "Viele Gruesse",
    "SSV Vogelstang Volleyball"
  ].join("\n");

  const htmlBody = buildHtmlSummary_(orderId, payload, false);

  MailApp.sendEmail({
    to: customerEmail,
    subject: subject,
    body: body,
    htmlBody: htmlBody,
    name: "SSV Shop"
  });
}

function sendPhoneNotification_(orderId, payload) {
  if (!NTFY_TOPIC_URL) {
    return;
  }

  const itemCount = (payload.items || []).reduce(function(sum, item) {
    return sum + Number(item.qty || 0);
  }, 0);

  const message = [
    "Neue Bestellung",
    orderId,
    (payload.buyerName || "Unbekannt") + " · " + itemCount + " Artikel",
    formatCurrency_(payload.totals?.total || 0)
  ].join("\n");

  UrlFetchApp.fetch(NTFY_TOPIC_URL, {
    method: "post",
    contentType: "text/plain; charset=utf-8",
    payload: message,
    headers: {
      "Title": "SSV Shop",
      "Priority": "default",
      "Tags": "shopping_bags"
    },
    muteHttpExceptions: true
  });
}

function buildPlainTextSummary_(orderId, payload) {
  const itemLines = (payload.items || []).map(function(item) {
    return [
      "- " + item.name,
      item.group + " / " + item.size,
      item.color,
      "Menge " + item.qty,
      formatCurrency_(Number(item.unitPrice || 0) * Number(item.qty || 0)),
      item.withInitials ? "mit Initialen" : "ohne Initialen"
    ].join(" | ");
  });

  return [
    "Bestellnummer: " + orderId,
    "Name: " + (payload.buyerName || ""),
    "E-Mail: " + (payload.buyerEmail || ""),
    "Team: " + (payload.buyerTeam || ""),
    payload.initials ? "Initialen/Nummer: " + payload.initials : "",
    payload.notes ? "Bemerkung: " + payload.notes : "",
    "",
    "Artikel:",
    itemLines.join("\n"),
    "",
    "Zwischensumme: " + formatCurrency_(payload.totals?.subtotal || 0),
    "Initialen: " + formatCurrency_(payload.totals?.initialsCost || 0),
    "Gesamt: " + formatCurrency_(payload.totals?.total || 0)
  ].filter(Boolean).join("\n");
}

function buildHtmlSummary_(orderId, payload, includeCustomerLine) {
  const rows = (payload.items || []).map(function(item) {
    return "<tr>" +
      "<td style='padding:8px;border-bottom:1px solid #ddd;'>" + escapeHtml_(item.name || "") + "</td>" +
      "<td style='padding:8px;border-bottom:1px solid #ddd;'>" + escapeHtml_((item.group || "") + " / " + (item.size || "")) + "</td>" +
      "<td style='padding:8px;border-bottom:1px solid #ddd;'>" + escapeHtml_(item.color || "") + "</td>" +
      "<td style='padding:8px;border-bottom:1px solid #ddd;'>" + escapeHtml_(String(item.qty || 0)) + "</td>" +
      "<td style='padding:8px;border-bottom:1px solid #ddd;'>" + escapeHtml_(formatCurrency_(Number(item.unitPrice || 0) * Number(item.qty || 0))) + "</td>" +
      "</tr>";
  }).join("");

  return [
    "<div style='font-family:Arial,sans-serif;color:#182028;'>",
    "<h2>SSV Shop Bestellung</h2>",
    "<p><strong>Bestellnummer:</strong> " + escapeHtml_(orderId) + "</p>",
    "<p><strong>Name:</strong> " + escapeHtml_(payload.buyerName || "") + "</p>",
    includeCustomerLine ? "<p><strong>E-Mail:</strong> " + escapeHtml_(payload.buyerEmail || "") + "</p>" : "",
    payload.buyerTeam ? "<p><strong>Team:</strong> " + escapeHtml_(payload.buyerTeam) + "</p>" : "",
    payload.initials ? "<p><strong>Initialen / Nummer:</strong> " + escapeHtml_(payload.initials) + "</p>" : "",
    payload.notes ? "<p><strong>Bemerkung:</strong> " + escapeHtml_(payload.notes) + "</p>" : "",
    "<table style='width:100%;border-collapse:collapse;margin-top:16px;'>",
    "<thead><tr>",
    "<th style='text-align:left;padding:8px;border-bottom:2px solid #999;'>Artikel</th>",
    "<th style='text-align:left;padding:8px;border-bottom:2px solid #999;'>Groesse</th>",
    "<th style='text-align:left;padding:8px;border-bottom:2px solid #999;'>Farbe</th>",
    "<th style='text-align:left;padding:8px;border-bottom:2px solid #999;'>Menge</th>",
    "<th style='text-align:left;padding:8px;border-bottom:2px solid #999;'>Preis</th>",
    "</tr></thead>",
    "<tbody>" + rows + "</tbody>",
    "</table>",
    "<p style='margin-top:16px;'><strong>Zwischensumme:</strong> " + escapeHtml_(formatCurrency_(payload.totals?.subtotal || 0)) + "<br>",
    "<strong>Initialen:</strong> " + escapeHtml_(formatCurrency_(payload.totals?.initialsCost || 0)) + "<br>",
    "<strong>Gesamt:</strong> " + escapeHtml_(formatCurrency_(payload.totals?.total || 0)) + "</p>",
    "</div>"
  ].filter(Boolean).join("");
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }
  return sheet;
}

function createOrderId_() {
  return "SSV-" + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd-HHmmss");
}

function formatCurrency_(value) {
  return Utilities.formatString("%.2f EUR", Number(value || 0)).replace(".", ",");
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function escapeHtml_(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isValidEmail_(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function runSafely_(fn) {
  try {
    return fn();
  } catch (error) {
    return "FEHLER: " + String(error);
  }
}
