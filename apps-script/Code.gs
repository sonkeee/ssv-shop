const SHEET_NAME = "Bestellungen";
const ADMIN_EMAIL = "soenke.brauch@ssv-volleyball.de";
const REPLY_TO_EMAIL = "soenke.brauch@ssv-volleyball.de";
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
    htmlBody: buildMailShell_(
      "SSV Shop Testmail",
      "<p style='margin:0 0 16px;'>Wenn du diese Mail bekommst, ist die Mail-Berechtigung korrekt aktiv.</p>",
      false
    ),
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
    replyTo: REPLY_TO_EMAIL,
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
    replyTo: REPLY_TO_EMAIL,
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
      "<td style='padding:12px 10px;border-bottom:1px solid #ece7de;'>" + escapeHtml_(item.name || "") + "</td>" +
      "<td style='padding:12px 10px;border-bottom:1px solid #ece7de;'>" + escapeHtml_((item.group || "") + " / " + (item.size || "")) + "</td>" +
      "<td style='padding:12px 10px;border-bottom:1px solid #ece7de;'>" + escapeHtml_(item.color || "") + "</td>" +
      "<td style='padding:12px 10px;border-bottom:1px solid #ece7de;'>" + escapeHtml_(String(item.qty || 0)) + "</td>" +
      "<td style='padding:12px 10px;border-bottom:1px solid #ece7de;white-space:nowrap;'>" + escapeHtml_(formatCurrency_(Number(item.unitPrice || 0) * Number(item.qty || 0))) + "</td>" +
      "</tr>";
  }).join("");

  const introText = includeCustomerLine
    ? "Es ist eine neue Bestellung im SSV-Shop eingegangen."
    : "deine Bestellung ist erfolgreich bei uns eingegangen.";

  const content = [
    "<p style='margin:0 0 18px;font-size:16px;line-height:1.65;'>Hallo " + escapeHtml_(payload.buyerName || "") + ",</p>",
    "<p style='margin:0 0 22px;font-size:15px;line-height:1.7;color:#4f5965;'>" + introText + "</p>",
    "<div style='background:#f8f3ea;border:1px solid #ece2d2;border-radius:18px;padding:18px 20px;margin:0 0 24px;'>",
    "<div style='font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#8b1629;font-weight:700;margin-bottom:8px;'>Bestellübersicht</div>",
    "<div style='font-size:15px;line-height:1.8;'>",
    "<strong>Bestellnummer:</strong> " + escapeHtml_(orderId) + "<br>",
    "<strong>Name:</strong> " + escapeHtml_(payload.buyerName || "") + "<br>",
    (includeCustomerLine ? "<strong>E-Mail:</strong> " + escapeHtml_(payload.buyerEmail || "") + "<br>" : ""),
    (payload.buyerTeam ? "<strong>Team:</strong> " + escapeHtml_(payload.buyerTeam) + "<br>" : ""),
    (payload.initials ? "<strong>Initialen / Nummer:</strong> " + escapeHtml_(payload.initials) + "<br>" : ""),
    (payload.notes ? "<strong>Bemerkung:</strong> " + escapeHtml_(payload.notes) + "<br>" : ""),
    "</div>",
    "</div>",
    "<table style='width:100%;border-collapse:collapse;background:#ffffff;border-radius:18px;overflow:hidden;'>",
    "<thead><tr style='background:#f1ebe1;'>",
    "<th style='text-align:left;padding:12px 10px;border-bottom:1px solid #e2d7c5;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;'>Artikel</th>",
    "<th style='text-align:left;padding:12px 10px;border-bottom:1px solid #e2d7c5;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;'>Größe</th>",
    "<th style='text-align:left;padding:12px 10px;border-bottom:1px solid #e2d7c5;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;'>Farbe</th>",
    "<th style='text-align:left;padding:12px 10px;border-bottom:1px solid #e2d7c5;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;'>Menge</th>",
    "<th style='text-align:left;padding:12px 10px;border-bottom:1px solid #e2d7c5;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;'>Preis</th>",
    "</tr></thead>",
    "<tbody>" + rows + "</tbody>",
    "</table>",
    "<div style='margin-top:22px;background:#ffffff;border:1px solid #eee5d8;border-radius:18px;padding:18px 20px;'>",
    "<div style='display:block;font-size:15px;line-height:1.85;'>",
    "<strong>Zwischensumme:</strong> " + escapeHtml_(formatCurrency_(payload.totals?.subtotal || 0)) + "<br>",
    "<strong>Initialen / Nummern:</strong> " + escapeHtml_(formatCurrency_(payload.totals?.initialsCost || 0)) + "<br>",
    "<strong>Gesamt:</strong> <span style='color:#8b1629;'>" + escapeHtml_(formatCurrency_(payload.totals?.total || 0)) + "</span>",
    "</div>",
    "</div>",
    (!includeCustomerLine
      ? "<p style='margin:22px 0 0;font-size:14px;line-height:1.7;color:#4f5965;'>Wir melden uns bei dir, sobald die Sammelbestellung weiterbearbeitet wird. Bitte antworte bei Fragen einfach auf diese Mail.</p>"
      : "<p style='margin:22px 0 0;font-size:14px;line-height:1.7;color:#4f5965;'>Diese Nachricht wurde automatisch aus dem Vereins-Shop versendet.</p>")
  ].filter(Boolean).join("");

  return buildMailShell_(
    includeCustomerLine ? "Neue Bestellung im SSV-Shop" : "Danke für deine Bestellung",
    content,
    true
  );
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

function buildMailShell_(headline, innerHtml, includeReplyFooter) {
  return [
    "<div style='margin:0;padding:24px 12px;background:#f6f1e8;font-family:Arial,sans-serif;color:#182028;'>",
    "<div style='max-width:760px;margin:0 auto;background:#fffdf9;border-radius:28px;overflow:hidden;box-shadow:0 18px 50px rgba(24,32,40,0.08);'>",
    "<div style='padding:28px 32px;background:linear-gradient(135deg,#8b1629 0%,#c41e3a 100%);color:#ffffff;'>",
    "<div style='font-size:12px;letter-spacing:0.1em;text-transform:uppercase;opacity:0.92;font-weight:700;'>SSV Vogelstang Volleyball</div>",
    "<h1 style='margin:10px 0 0;font-size:28px;line-height:1.15;'>" + escapeHtml_(headline) + "</h1>",
    "</div>",
    "<div style='padding:30px 32px 24px;'>" + innerHtml + "</div>",
    "<div style='padding:20px 32px 26px;background:#f7f2ea;border-top:1px solid #ece2d2;'>",
    "<div style='font-size:13px;line-height:1.7;color:#5b6470;'>",
    includeReplyFooter && REPLY_TO_EMAIL
      ? "Fragen zu deiner Bestellung? Antworte einfach auf diese Mail oder schreibe an <a href='mailto:" + escapeHtml_(REPLY_TO_EMAIL) + "' style='color:#8b1629;text-decoration:none;font-weight:700;'>" + escapeHtml_(REPLY_TO_EMAIL) + "</a>."
      : "SSV Vogelstang Volleyball",
    "</div>",
    "</div>",
    "</div>",
    "</div>"
  ].join("");
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
