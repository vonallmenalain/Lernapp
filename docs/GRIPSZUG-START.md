# Gripszug verkaufen: Was noch zu tun ist

Die App kann verkauft werden – die Kasse, der Webhook, die Kinderkonten, die Schranke, die
Willkommensseite und die Rechtstexte sind gebaut und geprüft. Was fehlt, sind die Dinge, die
nur du tun kannst: Konten anlegen, Schlüssel eintragen, das Impressum ausfüllen, einmal
bezahlen. Der Reihe nach, mit Haken zum Abhaken. Rechne mit einer knappen Stunde, die
Testzahlung eingeschlossen.

Die Details zu Firebase, Regeln und Server stehen in [FIREBASE_SETUP.md](../FIREBASE_SETUP.md)
(Abschnitte 1, 3, 3b und 6). Hier steht nur, was zu tun ist, in der Reihenfolge, in der es
klappt.

## Was schon läuft – nichts zu tun

- Die **Firestore-Regeln** sind live: `entitlements/{uid}` kann nur der Server schreiben, die
  Familie (`parentUid`, `children`) auch. Jeder Regel-PR wird vorher im Emulator durchgespielt.
- Netlify **baut** bei jedem Merge die App samt Server-Funktionen. Veröffentlicht wird nichts
  von selbst („Stop auto publishing") – das bleibt dein Knopf.
- Die **Konten von vorher** (Kinder mit Name und Passwort, ohne Elternkonto) bleiben frei:
  Gründer-Zugang. Nur neue Konten laufen über Eltern und Kauf.

## 1. Firebase: ein Dienstkonto für den Server  ☐

Der Server (die Netlify-Funktionen) legt Kinderkonten an und schreibt den Kauf. Dafür
braucht er ein **eigenes** Dienstkonto – nicht das, mit dem der Workflow die Regeln
veröffentlicht.

1. [Google Cloud Console → IAM → Dienstkonten](https://console.cloud.google.com/iam-admin/serviceaccounts?project=lernapp-8d944),
   Projekt `lernapp-8d944`.
2. **Dienstkonto erstellen**: Name `gripszug-server`.
3. Rollen: **Cloud Datastore User** und **Firebase Authentication Admin**. Sonst nichts – es
   darf Daten schreiben und Nutzer anlegen, aber keine Regeln ändern.
4. Beim Konto: **Schlüssel → Schlüssel hinzufügen → JSON**. Die Datei wird heruntergeladen;
   ihr Inhalt kommt in Schritt 3 zu Netlify. Danach die Datei löschen – sie ist ein Passwort.

## 2. Stripe: Produkt, Schlüssel, Webhook  ☐

Alles zuerst im **Testmodus** (Schalter oben rechts im Dashboard). Live kommt in Schritt 6.

1. **Produkt**: Produktkatalog → Produkt hinzufügen. Name „Gripszug Familie", Preis
   **CHF 30**, **einmalig** (nicht wiederkehrend). Nach dem Speichern die **Preis-ID**
   kopieren (beginnt mit `price_`).
2. **Geheimer Schlüssel**: Entwickler → API-Schlüssel → *Geheimer Schlüssel* (beginnt mit
   `sk_test_`). Anzeigen, kopieren.
3. **Webhook**: Entwickler → Webhooks → Endpunkt hinzufügen.
   - URL: `https://kids.alae.app/api/stripe-webhook`
   - Ereignisse: `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
     `charge.refunded`
   - Nach dem Anlegen das **Signaturgeheimnis** kopieren (beginnt mit `whsec_`).
4. **AGB und Datenschutz bei Stripe hinterlegen** – ohne das lehnt Stripe die Kasse ab, weil
   sie die Zustimmung zu den AGB verlangt (das Widerrufsrecht erlischt bei digitalen
   Inhalten, siehe [agb.html](../agb.html)):
   [Einstellungen → Öffentliche Unternehmensangaben](https://dashboard.stripe.com/settings/public):
   *Nutzungsbedingungen* `https://kids.alae.app/agb.html`, *Datenschutzrichtlinie*
   `https://kids.alae.app/datenschutz.html`. Dort auch Name und Support-Adresse eintragen –
   sie stehen auf der Quittung.
5. Schön, nicht nötig: Einstellungen → Branding (Icon aus `icons/`, Farbe `#6c5ce7`), und
   Einstellungen → E-Mails → *Quittungen bei erfolgreichen Zahlungen* einschalten.

Und einmal bei Netlify, für das Feld „Neue Spiele? Sag mir Bescheid" auf der
Willkommensseite: [Forms → *Enable form detection*](https://app.netlify.com/projects/lernappkinder/forms).
Die Adressen sammelt dann Netlify (Forms → neuigkeiten); ohne den Schalter geht der Eintrag
ins Leere. Wer sich einträgt, bekommt nichts Automatisches – schreiben musst du selbst.

## 3. Netlify: die vier Umgebungsvariablen  ☐

[Netlify → lernappkinder → Site configuration → Environment variables](https://app.netlify.com/projects/lernappkinder/configuration/env).
Für jede: **Add a variable**, Haken bei *Contains secret values*, Scope kann auf *Functions*
bleiben oder *All*.

| Variable | Wert |
| --- | --- |
| `FIREBASE_SERVICE_ACCOUNT` | der ganze Inhalt der JSON-Datei aus Schritt 1 (in einer Zeile oder mit Umbrüchen, beides geht) |
| `STRIPE_SECRET_KEY` | `sk_test_…` aus Schritt 2 |
| `STRIPE_PRICE_ID` | `price_…` aus Schritt 2 |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` aus Schritt 2 |

Umgebungsvariablen gelten erst für den **nächsten Build**: Deploys → *Trigger deploy →
Deploy site*. Wenn der Build grün ist: **Publish deploy**. Erst jetzt ist der neue Stand
live – mit Kasse, Kinderkonten, Schranke, Willkommensseite und Rechtstexten auf einmal.

## 4. Die Rechtstexte  ☑ (ausgefüllt, gegenlesen)

Impressum, Datenschutzerklärung und AGB tragen deine Angaben: Alain von Allmen,
3414 Oberburg, `kontakt@alae.app`, Stand September 2026, Gerichtsstand Oberburg,
Firebase-Region Europe West. Die Entwurfs-Hinweise sind weg, die Seiten sind so, wie
Besucher sie sehen. Vor dem Veröffentlichen einmal selbst lesen:

- [impressum.html](../impressum.html) – ohne Strasse und Nummer. Das reicht, damit dich
  jemand erreicht; wer es genau nimmt, ergänzt sie, weil das Gesetz gegen unlauteren
  Wettbewerb (Art. 3 Abs. 1 lit. s UWG) eine vollständige Adresse verlangt.
- [datenschutz.html](../datenschutz.html) – die Region stimmt mit deinem Firestore
  überein? Firebase Console → Projekteinstellungen → *Standardspeicherort für Cloud
  Firestore*.
- [agb.html](../agb.html) – Preis, 30 Tage Geld zurück und der Satz zum Widerrufsrecht
  müssen mit der Kasse und der Preiskarte zusammenpassen (siehe unten).

Die Texte sind von mir geschrieben, nicht von einer Juristin geprüft. Für einen
Einmalkauf von CHF 30 an Privatpersonen in der Schweiz ist das üblich – wenn du
ruhiger schläfst, lass sie einmal gegenlesen.
- [willkommen.html](../willkommen.html), Abschnitt „Fragen": die Mailadresse für Praxen und
  Schulen (`PLATZHALTER@example.com`).

Die AGB ([agb.html](../agb.html)) passen zur Kasse: Einmalkauf, sofortige Freischaltung mit
Verzicht auf das Widerrufsrecht, trotzdem 30 Tage Geld zurück auf eine Mail hin. Wenn du
etwas davon änderst, muss es an drei Stellen gleich lauten: AGB, der Satz an der Kasse
(`netlify/functions/checkout.mjs`, `custom_text`) und die Preiskarte auf der
Willkommensseite.

## 5. Die Testzahlung  ☐

Noch mit den Testschlüsseln – es fliesst kein Geld.

1. Auf **kids.alae.app** ein **Elternkonto** anlegen: Profil-Knopf → Reiter *Eltern* → mit
   E-Mail-Adresse registrieren (oder Google).
2. Im Profil steht die Karte **Gripszug Familie** mit *Jetzt kaufen · CHF 30*. Tippen → die
   Kasse von Stripe öffnet sich.
3. Testkarte `4242 4242 4242 4242`, ein Datum in der Zukunft, irgendein CVC, irgendeine
   PLZ. Haken bei den AGB. Bezahlen.
4. Zurück in der App öffnet sich das Profil von selbst mit einem grünen Satz; die Karte
   zeigt innert Sekunden **Gripszug Familie ✓**. Falls nicht: unten bei „Wenn etwas hakt".
5. **Kind anlegen** (Karte *Kinder*): Name und Passwort. Auf einem **zweiten Gerät** als
   Kind anmelden (Reiter *Kind*) → alle Häuser, alle Karten der Reise, alle Welten offen,
   kein Tor.
6. **Rückerstattung**: Stripe → Zahlungen → die Zahlung → *Rückerstatten* (ganz). Der
   Webhook setzt den Kauf auf inaktiv – Eltern und Kind sehen wieder die Schranke, die
   Kaufkarte sagt *Der Kauf wurde zurückerstattet* mit *Erneut kaufen*.
7. Zur Kontrolle in Firestore: `entitlements/{uid}` der Eltern (`active`, `stripeSessionId`)
   und der Kinder (`via` = uid der Eltern).

Was das Kind sieht, ohne Kauf: Haus 1 jedes Bereichs (Rucksack packen, Schwarm-Fokus,
Tier-Sprung, Raumdetektiv, Buchstabenjagd), dort nur die Welt *Wiese*, und die ersten zehn
Stationen der Reise. Alles andere zeigt den Zug vor der Schranke; *Für Eltern* führt über
ein Rechenrätsel (zwei zweistellige Zahlen addieren) ins Profil. Wo die Grenze liegt, steht
in `entitlement.js` ganz oben (`STATIONS_FREE`, `FREE_DIFFICULTY`, die Tabelle der Bereiche).

## 6. Live schalten  ☐

1. Stripe-Konto aktivieren (Unternehmensangaben, Bankkonto für Auszahlungen).
2. In den **Live-Modus** wechseln. Testdaten gelten dort nicht, also noch einmal: Produkt
   und Preis (beim Produkt gibt es *In den Live-Modus kopieren*), Webhook-Endpunkt mit
   denselben drei Ereignissen, und die öffentlichen Angaben mit AGB und Datenschutz.
3. Bei Netlify die drei Stripe-Variablen durch die Live-Werte ersetzen (`sk_live_…`, neue
   `price_…`, neues `whsec_…`). *Trigger deploy*, dann *Publish deploy*.
4. Einmal selbst mit einer echten Karte kaufen und die Zahlung in Stripe zurückerstatten –
   dann weisst du, dass es geht, und es hat dich die Stripe-Gebühr gekostet, sonst nichts.

## Wenn etwas hakt

**Zuerst immer:** [`https://kids.alae.app/api/status`](https://kids.alae.app/api/status) im
Browser öffnen. Kommt dort JSON mit `node` und einer Liste der Umgebungsvariablen, läuft der
Server und es fehlt höchstens eine Variable (`false` heisst: nicht gesetzt). Kommt dort ein
Fehler von Netlify, läuft nicht einmal das – dann sagt Netlify → Logs → Functions, warum.

Dann [`/api/status-tief`](https://kids.alae.app/api/status-tief): Die Seite lädt dasselbe wie
die Kasse und fragt Firebase Auth, Firestore und Stripe wirklich an, mit Zeiten – beim
Stripe-Preis steht der gefundene Betrag dabei, so siehst du, ob Preis und Schlüssel
zusammenpassen. Antwortet *sie* mit einem Netlify-Fehler, während `/api/status` JSON gibt,
liegt es an den Paketen und nicht an den Variablen. Inhalte von Schlüsseln stehen auf keiner
der beiden Seiten, nur ob sie gesetzt sind.

| Was du siehst | Woran es liegt | Was hilft |
| --- | --- | --- |
| *This function has crashed* mit `ERR_REQUIRE_ESM` | Ein CommonJS-Paket lädt ein Paket, das nur ESM kann – die Lambda erlaubt das nicht | war bei `jwks-rsa`/`jose` so und ist behoben (siehe FIREBASE_SETUP.md, Abschnitt 3b). Trifft es ein anderes Paar: in der package.json unter `overrides` die ESM-Fassung gegen eine mit CommonJS tauschen |
| *Der Server hat zu lange gebraucht* beim Kaufen (im Browser-Protokoll: 502) | Die Funktion war kalt und hat die Zeit überschritten – oder eine Umgebungsvariable fehlt und Firebase wartet ins Leere | noch einmal tippen (die zweite Anfrage trifft sie wach an); bleibt es dabei: `/api/status-tief` aufrufen und nachsehen, welche Prüfung hängt |
| *Auf dem Server ist etwas schiefgegangen* beim Kaufen oder Kind anlegen | eine Umgebungsvariable fehlt oder ist falsch (die Funktion sagt in ihrem Log, welche) | Netlify → Logs → Functions → `checkout` bzw. `kind-anlegen` |
| Die Kasse öffnet sich nicht, im Log steht etwas von *terms of service* | AGB-URL bei Stripe nicht hinterlegt (Schritt 2.4) | eintragen, noch einmal |
| Bezahlt, aber die Karte zeigt keinen Haken | der Webhook ist nicht angekommen oder wurde abgelehnt | Stripe → Entwickler → Webhooks → Endpunkt → *Ereignisse*: rot = Antwort ansehen (meist falsches `whsec_`, Test statt Live oder umgekehrt), dann *Erneut senden* |
| *Diese Anmeldung ist abgelaufen* | das Token des Kontos ist alt | abmelden, anmelden |
| Ein Kind sieht das Tor, obwohl die Eltern gekauft haben | das Kind wurde vor dem Kauf angelegt und der Webhook hat es nicht erwischt – oder es ist ein Konto ohne Elternkonto (dann ist es frei, kein Tor) | in Firestore `entitlements/{uid des Kindes}` anschauen; im Zweifel das Kind neu anlegen |
| Der Build bei Netlify ist rot mit *secret* im Log | der Geheimnis-Scanner hat etwas gefunden | `netlify.toml`, `SECRETS_SCAN_SMART_DETECTION_OMIT_VALUES` – der Web-Schlüssel von Firebase ist dort schon ausgenommen |

Die Prüfungen, die alles absichern, laufen lokal so:

```bash
npm ci                                   # einmal
npm run test:rules                       # Regeln im Emulator (braucht Java)
npm run test:functions                   # Kasse, Webhook, Kinderkonten im Emulator
node scripts/validate-schranke.mjs       # die Schranke rechnet richtig
NODE_PATH=… node scripts/check-seiten.mjs         # Willkommen und Rechtstexte
NODE_PATH=… node scripts/check-schranke.mjs       # das Tor im Browser (Playwright)
NODE_PATH=… node scripts/check-elternbereich.mjs  # der Elternbereich im Browser
```

## Was offen bleibt

- **Rucksack packen** schneidet auf schmalen Handys einzelne Gegenstände an
  (`scripts/check-handy.mjs` meldet es) – das war schon vor dem Umbau so und hat mit dem
  Kauf nichts zu tun.
- Werbung, Instagram, Englisch: nichts davon ist gebaut. Die Willkommensseite ist die
  Adresse, die man weitergibt: `https://kids.alae.app/willkommen.html`.
- Die Levelmodus-Karte („Alle Levels freischalten") gibt es nicht mehr; das Feld
  `levelAccess.unlockAllLevels` steht noch in alten Konten und tut nichts Schlimmes.
