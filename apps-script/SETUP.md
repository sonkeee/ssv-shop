Google Apps Script Setup

1. Oeffne das bestehende Google Apps Script hinter `APPS_SCRIPT_ENDPOINT`.
2. Ersetze den bisherigen Script-Inhalt durch [Code.gs](/Users/sonkebrauch/Nextcloud/03-SSV/projects/ssv-shop/git/apps-script/Code.gs:1).
3. Oeffne im Apps Script Editor auch die Projektmanifest-Datei `appsscript.json`.
4. Ersetze deren Inhalt durch [appsscript.json](/Users/sonkebrauch/Nextcloud/03-SSV/projects/ssv-shop/git/apps-script/appsscript.json:1).
5. Passe oben im Script diese Werte an:
   `ADMIN_EMAIL`: deine eigene E-Mail fuer neue Bestellungen
   `NTFY_TOPIC_URL`: optional fuer Handy-Push, z. B. `https://ntfy.sh/dein-geheimer-shop-topic`
6. Speichern.
7. Fuehre im Apps Script Editor die Funktion `sendTestMail_` manuell aus.
8. Bestaetige dabei alle abgefragten Berechtigungen.
9. Deploye das Script neu als Web App.
10. Wenn du Handy-Push willst:
   Installiere die `ntfy` App auf dem Handy und abonniere genau denselben Topic.

Wichtig fuer Google Sheets

- Das neue Script schreibt jetzt genau eine Zeile pro Bestellung.
- Alle bestellten Artikel stehen zusammen in einer Spalte `Artikel-Zusammenfassung`.
- Wenn deine Tabelle schon mit dem alten Format befuellt wurde, loesche am besten das alte Tabellenblatt `Bestellungen` und lass es vom Script neu anlegen.
- Alternative: Lege manuell ein neues Blatt mit dem Namen `Bestellungen` an und loesche die alten verschobenen Spalten.

Was danach passiert

- Der Verein bekommt eine E-Mail bei jeder neuen Bestellung.
- Die bestellende Person bekommt automatisch eine Bestaetigungs-E-Mail mit ihrer Bestellung.
- Optional geht zusaetzlich eine Push-Nachricht aufs Handy.

Fehlersuche fuer E-Mails

- Nach einer Testbestellung pruefe im Blatt `Bestellungen` die drei letzten Spalten:
  `Admin-Mail Status`
  `Kunden-Mail Status`
  `Handy-Benachrichtigung Status`
- Wenn bei `Kunden-Mail Status` `OK` steht, wurde die Mail vom Script versendet.
- Wenn dort `FEHLER: ...` steht, siehst du direkt den Grund.
- Nach Aenderungen am Apps Script immer:
  1. Speichern
  2. Bereitstellung aktualisieren
  3. Beim ersten Aufruf Berechtigungen erneut bestaetigen, falls Google danach fragt
- Wenn kein Popup erscheint, fuehre im Apps Script Editor die Funktion `authorizeMailAccess_` manuell aus.
- Diese Funktion zwingt Google dazu, die Mail-Berechtigung anzufragen.
- Noch besser: Fuehre `sendTestMail_` aus. Diese Funktion nutzt exakt dieselbe Berechtigung wie die echten Bestellmails.
- Danach die Web-App erneut mit neuer Version bereitstellen.
