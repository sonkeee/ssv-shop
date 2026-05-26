# SSV Shop

Kleiner Vereinsshop für die SSV Vogelstang Volleyball Kollektion 2026.

Die Website zeigt Produkte, Produktdetailseiten, einen gemeinsamen Warenkorb und eine Bestellstrecke. Die Bestellung wird per Google Apps Script entgegengenommen, in ein Google Sheet geschrieben und optional per E-Mail sowie Handy-Benachrichtigung gemeldet.

## Projektaufbau

- `code/index.html`: Startseite mit Produktuebersicht
- `code/product.html`: Produktdetailseite
- `code/cart.html`: Warenkorb und Bestellabschluss
- `code/styles.css`: komplettes Styling und Responsive Layout
- `code/shop.js`: Warenkorb, Preislogik, Interaktionen, Checkout
- `code/product.js`: Rendering der Produktdetailseite
- `code/product-data.js`: Produktdaten, Preise, Konfiguration, Apps-Script-Endpoint
- `code/media/`: Bilder und weitere Medien
- `apps-script/Code.gs`: Backend für Bestellungen
- `apps-script/appsscript.json`: Apps-Script-Manifest

## Funktionen

- Produktuebersicht mit eigener Detailseite pro Artikel
- Live-Preis auf der Produktseite anhand von:
  - Kinder / Erwachsene
  - Menge
  - Initialen-Aufpreis
- Warenkorb im `localStorage`
- Direktes Feedback beim Hinzufuegen zum Warenkorb
- Link auf der Produktseite, der aktuelle Auswahl direkt in den Warenkorb legt und zur Bestellung führt
- Checkout-Formular mit Versand an Google Apps Script
- Speicherung der Bestellung in Google Sheets
- Admin- und Kunden-E-Mail
- Optionale Push-Benachrichtigung über `ntfy`

## Lokale Nutzung

Da es sich um statische Dateien handelt, kann der Shop direkt ueber einen einfachen lokalen Webserver gestartet werden.

Beispiel:

```bash
cd code
python3 -m http.server 8000
```

Danach im Browser `http://localhost:8000` oeffnen.

## Shop konfigurieren

Die wichtigsten Frontend-Konstanten stehen in `code/product-data.js`.

- `APPS_SCRIPT_ENDPOINT`: URL des veroeffentlichten Google Apps Script Web Apps Endpoints
- `INITIALS_PRICE`: Aufpreis pro Artikel mit Initialen
- `CART_STORAGE_KEY`: Local-Storage-Key fuer den Warenkorb

Neue Produkte werden ebenfalls in `code/product-data.js` gepflegt. Dort werden Name, Kategorie, Farben, Groessen, Bilder, Preise und Initialen-Option definiert.

## Bestell-Backend einrichten

Das Backend liegt in `apps-script/Code.gs` und erwartet `POST`-Requests mit den Bestelldaten.

### Konfiguration in `Code.gs`

Folgende Konstanten sollten angepasst werden:

- `SHEET_NAME`: Ziel-Tabelle fuer Bestellungen
- `ADMIN_EMAIL`: Empfaenger fuer Admin-Benachrichtigungen
- `REPLY_TO_EMAIL`: Reply-To fuer versendete Mails
- `NTFY_TOPIC_URL`: optionaler `ntfy`-Endpoint fuer Push-Nachrichten

### Erwartetes Verhalten

Beim Eingang einer Bestellung macht das Script Folgendes:

1. Liest die Bestelldaten aus dem Request.
2. Schreibt eine neue Zeile in das Google Sheet.
3. Versendet optional eine Admin-E-Mail.
4. Versendet eine Bestellbestaetigung an den Kunden.
5. Sendet optional eine Push-Benachrichtigung.
6. Schreibt den Versandstatus zurück ins Sheet.

### Deployment von Apps Script

1. Neues Google Apps Script Projekt anlegen.
2. Inhalt aus `apps-script/Code.gs` uebernehmen.
3. `appsscript.json` mit den benoetigten Scopes hinterlegen.
4. Mit einem Google Sheet verbinden.
5. Als Web App deployen.
6. Den Web-App-Link in `code/product-data.js` als `APPS_SCRIPT_ENDPOINT` eintragen.

## Datenfluss einer Bestellung

1. Nutzer waehlt Produkt, Groessengruppe, Groesse, Farbe, Menge und optional Initialen.
2. Die Produktseite berechnet den aktuellen Preis live.
3. Artikel wird dem Warenkorb im Browser hinzugefuegt.
4. Im Checkout werden Kontaktdaten eingegeben.
5. Das Frontend sendet die Bestellung an das Apps Script.
6. Das Apps Script speichert und verteilt die Bestellung weiter.

## Hinweise

- Der Warenkorb ist browserlokal und wird über `localStorage` gespeichert.
- Bildpfade in den Produktdaten sind relativ zur `code/`-Struktur angelegt.

## Weiterentwicklung

Sinnvolle naechste Schritte:

- echtes Bestell-Feedback nach erfolgreicher Server-Antwort
- Bearbeiten von Mengen direkt im Warenkorb
