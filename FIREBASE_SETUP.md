# Firebase Setup für Gripszug

Diese App verwendet Firebase Authentication und Cloud Firestore. Kinder melden sich nur mit **Name + Passwort** an. Intern erzeugt die App daraus eine technische Firebase-Login-Adresse wie `anna@lernapp.local`; diese Adresse ist nur für Firebase Auth da und wird Kindern nicht angezeigt.

Der Web-API-Key in `firebase.js` ist bei Firebase-Webapps öffentlich; geschützt werden die Daten durch Authentication und Firestore Security Rules.

## 1. Authentication aktivieren

1. Öffne die Firebase Console für `lernapp-8d944`.
2. Gehe zu **Build > Authentication > Sign-in method**.
3. Aktiviere **Email/Password**. Das ist auch für Name + Passwort nötig, weil die App im Hintergrund eine technische Adresse erzeugt.
4. Aktiviere zusätzlich **Google** als Provider. Der Admin-Bereich ist nur über das verifizierte Google-Konto `Alain.sc2@gmail.com` freigegeben.
5. Unter **Authentication > Settings > Authorized domains** müssen deine Domains stehen. Für lokale Tests ist `localhost` normalerweise vorhanden. Für ein Deployment musst du die finale Domain ergänzen.

Hinweis: Firebase Auth verlangt intern mindestens 6 Passwortzeichen. Die App erlaubt den Kindern trotzdem Passwörter ab 4 Zeichen und hängt intern eine feste Endung an, damit Firebase die Anmeldung akzeptiert. Das ist bewusst einfach gehalten und für eine kleine Kindergruppe gedacht.

### Eltern melden sich mit ihrer E-Mail-Adresse an

Der Anmeldedialog hat zwei Reiter. **Kind:** Name und Passwort, wie bisher. **Eltern:** eine
echte E-Mail-Adresse mit Passwort (mindestens 6 Zeichen, ohne feste Endung – ein gewöhnliches
Firebase-Konto) oder Google. Beides läuft über denselben Provider **Email/Password**; es ist
also nichts zusätzlich zu aktivieren.

Ein Elternkonto kann **Passwort vergessen** nutzen. Die Mail dazu verschickt seit dem Umbau
nicht mehr Firebase, sondern Gripszug selbst, über Resend und mit `kids@alae.app` als
Absender (Abschnitt 10). Firebase rechnet nur noch den Link aus. Damit er auf die App zeigt,
muss `kids.alae.app` weiterhin unter **Authentication → Settings → Authorized domains**
stehen. Die Vorlagen unter **Authentication → Templates** sind damit ohne Belang – ausser als
Rückfalllösung: Antwortet der Server nicht, verschickt der Client die Mail wieder über
Firebase, damit ein vergessenes Passwort nie an einer schlafenden Funktion hängenbleibt.

Beim **Anlegen** eines Elternkontos verschickt Firebase ebenfalls nichts mehr. Die Begrüssung
kommt von Gripszug und enthält den Bestätigungslink als Angebot; bestätigen muss ihn niemand.

Ein neues **Kinderkonto** legt nicht mehr das Kind selbst an, sondern das Elternkonto über
den Server (siehe Netlify-Funktionen). Der Kind-Reiter hat deshalb keinen Knopf „Neues Konto"
mehr; Konten aus der Zeit davor melden sich unverändert an.

## 2. Firestore Database aktivieren

1. Gehe zu **Build > Firestore Database**.
2. Erstelle die Datenbank, falls sie noch nicht existiert.
3. Wähle den passenden Standort.
4. Verwende nicht die temporären Testregeln, weil diese nach kurzer Zeit auslaufen und bis dahin zu offen sind.

## 3. Firestore Rules hinterlegen

Die Regeln werden **nicht mehr von Hand in die Console kopiert**. Das übernimmt der
Workflow [`.github/workflows/firestore-rules.yml`](./.github/workflows/firestore-rules.yml):

| Wann | Was passiert |
| --- | --- |
| Pull Request, der `firestore.rules` ändert | Firebase liest die Regeln gegen (`--dry-run`), sofern die Vorabprüfung eingerichtet ist. Nichts wird veröffentlicht. |
| Merge nach `main` | Die Regeln werden veröffentlicht und gelten sofort. |
| **Actions → Firestore-Regeln → Run workflow** auf `main` | Dasselbe von Hand, ohne Änderung an der Datei. |

Damit ist [`firestore.rules`](./firestore.rules) die Wahrheit: Was in dieser Datei auf
`main` steht, gilt in der Datenbank. Wer die Regeln stattdessen in der Console bearbeitet,
verliert seine Änderung beim nächsten Merge – dort also nur noch nachsehen, nicht mehr
schreiben.

### Wo der Schlüssel liegt, und warum nicht im Repository

Der Deploy-Schlüssel liegt **nicht** als gewöhnliches Repository-Secret, sondern in der
GitHub-Umgebung **`produktion`**, die nur von `main` aus erreichbar ist.

Das ist kein Zierrat. Bei einem Pull Request aus demselben Repository stellt GitHub die
Repository-Secrets bereit, und ausgeführt wird der Workflow in der Fassung, die im Pull
Request steht – samt Änderungen an der Workflow-Datei selbst. Läge der Schlüssel im
Repository, könnte jeder, der einen Branch pushen darf, den Workflow im Pull Request
umschreiben und damit veröffentlichen, ohne je nach `main` mergen zu dürfen. Der
Branchschutz wäre wirkungslos, und das Konto darf die Regeln der Produktionsdatenbank
überschreiben.

Eine Umgebung gibt ihre Secrets nur an einen Job, der sie mit `environment:` anfordert, und
nur von den Branches, die in ihrer Regel stehen. Entfernt jemand die Zeile, bekommt der Job
den Schlüssel nicht mehr; lässt er sie stehen, kommt er von einem anderen Branch nicht durch.

| | Deploy | Vorabprüfung (freiwillig) |
| --- | --- | --- |
| Secret | `FIREBASE_SERVICE_ACCOUNT` | `FIREBASE_SERVICE_ACCOUNT_PRUEFUNG` |
| liegt in | Umgebung `produktion` (nur `main`) | Repository-Secrets |
| Dienstkonto | `firestore-rules-deploy` | `firestore-rules-pruefung` |
| Rollen | **Firebase Rules Admin** (`roles/firebaserules.admin`) **und** **Service Usage Consumer** (`roles/serviceusage.serviceUsageConsumer`) | eigene Rolle, siehe unten |
| kann | Regeln erstellen **und** freischalten | Regeln nur erstellen, nie freischalten |

Fehlt das Deploy-Secret, bricht der Lauf auf `main` mit einer deutlichen Meldung ab, statt
stillschweigend nichts zu tun – ein grüner Lauf ohne Deploy sähe aus wie ein erfolgreicher.

#### Warum zwei Rollen, und nicht nur Firebase Rules Admin

Weil die Firebase CLI vor dem Deploy nachsieht, ob die Firestore-API überhaupt aktiv ist:

```text
i  firestore: ensuring required API firestore.googleapis.com is enabled...
```

Dafür fragt sie `serviceusage.googleapis.com`, und **Firebase Rules Admin** darf das nicht.
Ohne die zweite Rolle scheitert der Lauf mit `HTTP Error: 403, Permission denied to get
service [firestore.googleapis.com]` – einer Meldung, die nach einem Firestore-Problem
aussieht, aber eine fehlende Berechtigung bei einem ganz anderen Dienst meint. Umgehen lässt
sich die Prüfung nicht: Für Firestore ruft die CLI `ensure()` und nicht die fehlertolerante
Variante `bestEffortEnsure()`.

**Service Usage Consumer** erlaubt nur, den Zustand einer API zu lesen und sie zu nutzen –
kein Aktivieren von APIs, kein Zugriff auf Daten.

Das gilt auch für das Prüfkonto: `--dry-run` überspringt nur das Veröffentlichen, nicht die
Vorbereitung. In `deploy/index.js` steht die Deploy-Phase hinter `if (!options.dryRun)`, die
`prepare`-Phase mit dem API-Check läuft immer.

### Die Regeln werden durchgespielt, nicht gelesen

`npm run test:rules` lädt `firestore.rules` in den Firestore-Emulator und probiert für jede
Rolle – Kind, Gruppenmitglied, Fremde, andere Gruppe, Admin, Admin ohne verifizierte Adresse,
Gast – rund siebzig Zugriffe: was sie darf und was nicht. Läuft ohne Netz und ohne
Zugangsdaten; braucht Java und einmalig `npm install`. Derselbe Lauf steht im Workflow vor
jedem Pull Request, der die Regeln berührt, und braucht dort kein Secret.

Der Anlass war eine Lücke, die Lesen nicht gefunden hätte: Unter `users/{userId}` stand ein
rekursiver Platzhalter `match /{document=**}`, gedacht für die Unterkollektionen. In
`rules_version = '2'` passt er aber auf null oder mehr Pfadstücke – also auch auf das Konto
selbst. Sein `allow write: if isOwner(userId)` galt damit für das Kontodokument, und weil
Regeln, die etwas erlauben, mit ODER verknüpft sind, gewann er über die Regel, die `group`
vor dem Kind schützt. **Ein Kind konnte sich in jede Gruppe schreiben und deren Fortschritt
mitlesen.** Jetzt stehen dort die beiden Unterkollektionen, die es gibt, `levelProgress` und
`sessions` – und sonst nichts. Mit `RULES_DATEI=/pfad/zur/alten.rules` lässt sich das gegen
jede frühere Fassung nachvollziehen.

### Die Vorabprüfung nachrüsten

Ohne das zweite Secret werden die Regeln erst beim Merge von Firebase gegengelesen. Das ist
ein gültiger Zustand: Ein ungültiges Regelwerk wird beim Deploy abgelehnt, **bevor** etwas
freigeschaltet wird – die bisherigen Regeln bleiben dann unverändert stehen, `main` ist nur
kurz rot. Wer den Fehler schon im Pull Request sehen will, legt ein zweites Dienstkonto an:

1. Eigene Rolle in der Google Cloud Console erstellen (**IAM → Rollen → Rolle erstellen**),
   mit genau diesen Berechtigungen:
   - `firebaserules.rulesets.create`
   - `firebaserules.rulesets.get`
   - `resourcemanager.projects.get`
2. Dienstkonto `firestore-rules-pruefung` anlegen, ihm diese Rolle geben und zusätzlich
   **Service Usage Consumer** – aus dem Grund im Abschnitt davor.
3. Den JSON-Schlüssel als Repository-Secret `FIREBASE_SERVICE_ACCOUNT_PRUEFUNG` hinterlegen.

Dieses Konto kann Regelwerke zur Prüfung hochladen, aber keines davon freischalten
(`firebaserules.releases.*` fehlt). Selbst wenn jemand das Secret aus einem Pull Request
heraus missbraucht, entsteht nichts als ein unbenutztes Regelwerk.

Geprüft wird das Format beider Schlüssel von `scripts/pruefe-dienstkonto.mjs`, bevor sie an
Firebase gehen – ohne Netz, und ohne dass der Schlüssel je im Protokoll landet.

Die Regeln erlauben eingeloggten Nutzern Zugriff auf ihren eigenen Bereich:

```text
users/{uid}
users/{uid}/levelProgress/{levelKey}
users/{uid}/sessions/{sessionId}
```

Zusätzlich darf das verifizierte Admin-Google-Konto `Alain.sc2@gmail.com` alle `users`-Dokumente und deren Unterkollektionen **lesen** sowie einen fremden Account **zurücksetzen**. Für das Zurücksetzen ist genau zweierlei erlaubt: Dokumente unter `users/{uid}` löschen und am Profil die Felder `stats`, `gameState`, `progressReset` und `updatedAt` ändern. Name, Rolle, Lok und Levelmodus bleiben dem Admin verwehrt, und Fortschritt schreiben kann er nirgends – wegräumen ja, erfinden nein. Alle anderen Dokumente sind gesperrt.

Wer in derselben **Gruppe** ist (Feld `group.id` am Konto), darf ausserdem die Konten der anderen Mitglieder und deren `levelProgress` **lesen** – mehr nicht: Sitzungen bleiben privat, und geschrieben wird beim anderen nirgends. Das Feld `group` selbst ist dem Admin vorbehalten; ein Kind kann es weder anlegen noch ändern, sonst schriebe es sich in eine fremde Gruppe und läse deren Fortschritt mit.

## 3b. Die Server-Funktionen bei Netlify

> Was du einmalig einrichten musst, damit verkauft werden kann – Dienstkonto, Stripe,
> Umgebungsvariablen, Impressum, Testzahlung –, steht Schritt für Schritt in
> [docs/GRIPSZUG-START.md](./docs/GRIPSZUG-START.md).

Was kein Client darf, tut der Server: Kinderkonten anlegen, die Eltern an die Kasse von
Stripe schicken, nach der Zahlung freischalten. Das sind vier kleine Funktionen unter
[`netlify/functions/`](./netlify/functions/), die Netlify neben der App ausliefert.

`netlify.toml` sagt Netlify zweierlei: wo die Funktionen liegen – und dass **`dist/`**
veröffentlicht wird, nicht das Wurzelverzeichnis. Seit die Funktionen Pakete brauchen,
installiert Netlify vor jedem Deploy `node_modules` (gut hundert Megabyte), und die dürfen
nicht mit auf die Site. [`netlify/build.mjs`](./netlify/build.mjs) kopiert deshalb nur die
App – Seiten, Skripte, Stylesheet, Manifest, Icons – nach `dist/`. Gebaut wird dabei nichts;
es sind dieselben Dateien. Die Site-Einstellung „Publish directory" bei Netlify wird davon
überschrieben.

| Pfad | Wer ruft | Was |
| --- | --- | --- |
| `POST /api/kind-anlegen` | Elternkonto (Bearer-Token) | legt Auth-Nutzer und Konto des Kindes an, trägt es bei den Eltern ein, gibt den Kauf mit, falls vorhanden |
| `POST /api/kind-passwort` | Elternkonto | setzt das Passwort eines eigenen Kindes neu |
| `POST /api/familie` | jedes Konto einer Familie | gibt allen Kindern eines Elternkontos dieselbe `group.id` (`familie-<uid der Eltern>`), damit die Geschwister die Züge der anderen auf dem Startbild sehen. Neue Kinder bekommen sie beim Anlegen; der Client holt sie für ältere Konten einmal nach. |
| `POST /api/checkout` | Elternkonto | erstellt die Kasse bei Stripe und gibt ihre URL zurück |
| `POST /api/stripe-webhook` | Stripe (mit Unterschrift) | verbucht `checkout.session.completed` und `checkout.session.async_payment_succeeded` als Kauf für Eltern und Kinder, `charge.refunded` als Rücknahme |
| `GET /api/status` | jeder | sagt, welche Node-Fassung läuft und welche Umgebungsvariablen gesetzt sind – nur ob, nie der Inhalt. Lädt nichts (keine import-Zeile), antwortet deshalb auch, wenn die anderen es nicht tun. |
| `GET /api/status-tief` | jeder | lädt dasselbe wie die Kasse und fragt Firebase Auth, Firestore, Stripe und Resend wirklich an, mit Zeiten. Antwortet sie mit 502, während `/api/status` 200 gibt, liegt es an den Paketen. |
| `POST /api/willkommen` | Elternkonto | schickt die Begrüssung samt Bestätigungslink – einmal je Konto (Abschnitt 10) |
| `POST /api/passwort-mail` | jeder, ohne Anmeldung | schickt den Link für ein neues Passwort, nur an Adressen mit Konto und höchstens einmal je 90 Sekunden |
| `POST /api/mail-eingang` | der Cloudflare-Worker (mit Geheimnis im Kopf) | nimmt Post an kids@alae.app an, archiviert sie und leitet sie weiter |
| `POST /api/mail-einstellungen` | Admin | liest und setzt die Weiterleitungsadresse, verschickt die Testmail |
| `POST /api/konto-loeschen` | Admin | entfernt ein Konto restlos – Anmeldung, Profil, Level, Sitzungen, Kauf und Mails; ein Elternkonto nur samt seinen Kindern (Abschnitt 4) |

Die Funktionen brauchen **Umgebungsvariablen** (Netlify: *Site configuration → Environment
variables*). Ohne sie antworten sie mit einem klaren Fehler statt zu raten:

| Variable | Woher |
| --- | --- |
| `FIREBASE_SERVICE_ACCOUNT` | Ein **eigenes** Dienstkonto `gripszug-server` (nicht das Deploy-Konto!) mit den Rollen **Cloud Datastore User** und **Firebase Authentication Admin**. JSON-Schlüssel im Klartext. Es darf Daten schreiben und Nutzer anlegen, aber keine Regeln ändern. |
| `STRIPE_SECRET_KEY` | Stripe-Dashboard → Developers → API keys. Zum Testen der Testschlüssel, fürs Echte der Live-Schlüssel (beide beginnen mit `sk_`). |
| `STRIPE_PRICE_ID` | Der Preis des Produkts „Gripszug Familie" (Einmalkauf, CHF 30); die Kennung beginnt mit `price` und einem Unterstrich. Wer stattdessen die Produkt-Kennung einträgt (`prod` und Unterstrich, im Dashboard steht sie zuoberst), bekommt den Standardpreis dieses Produkts; die Statusseite schreibt dann dazu, woher der Preis kommt. |
| `STRIPE_WEBHOOK_SECRET` | Stripe-Dashboard → Developers → Webhooks → Endpunkt `https://kids.alae.app/api/stripe-webhook` mit den Ereignissen `checkout.session.completed`, `checkout.session.async_payment_succeeded` (Zahlarten, die erst später bestätigt werden) und `charge.refunded` → *Signing secret* (beginnt mit `whsec` und einem Unterstrich). |
| `SITE_URL` | optional; Netlify setzt `URL` ohnehin. Fallback `https://kids.alae.app`. |
| `RESEND_API_KEY` | Resend-Dashboard → API Keys → *Sending access*. Ohne ihn verschickt Gripszug keine Mails – sonst läuft alles weiter. Siehe Abschnitt 10. |
| `MAIL_WEBHOOK_SECRET` | selbst erfunden (`openssl rand -hex 32`), muss beim Cloudflare-Worker als `MAIL_GEHEIMNIS` genauso stehen. Ohne ihn nimmt `/api/mail-eingang` nichts an. |
| `MAIL_ABSENDER` / `MAIL_ABSENDER_NAME` | optional; Vorgabe `kids@alae.app` und `Gripszug`. |

**Unter `jwks-rsa` liegt jose 5, nicht 6** (`overrides` in der package.json). firebase-admin
prüft die Unterschrift eines echten ID-Tokens mit den öffentlichen Schlüsseln von Google und
rechnet sie mit `jwks-rsa` um; `jwks-rsa` ist CommonJS und macht `require("jose")`. jose 6 ist
reines ESM. Node kann seit 20.19/22.12 ESM auch requiren – die Lambda bei Netlify nicht, sie
antwortet mit `ERR_REQUIRE_ESM`, und die ganze Funktion stürzt mit 502 ab, bevor unser Code
dran ist. jose 5 bringt einen CommonJS-Einstieg mit und kann dasselbe. Gegen den Emulator
fällt das nie auf: Der überspringt die Signaturprüfung. `npm run test:functions` lädt deshalb
`jwks-rsa` eigens mit abgeschaltetem `require(esm)` und rechnet einen Schlüssel durch.

**Firestore spricht REST, nicht gRPC.** Eine Funktion lebt ein paar Sekunden; gRPC baut
dafür jedes Mal eine HTTP/2-Verbindung samt Protokolldateien auf, was Sekunden kostet und
in einer Lambda-Umgebung gern hängen bleibt – der Anrufer sieht dann kein Ergebnis, sondern
502. `preferRest` in [`_lib/firebase.mjs`](./netlify/functions/_lib/firebase.mjs) schaltet
das um. Gegen den Emulator bleibt es bei gRPC: Der verlangt über REST ein echtes
Google-Token und weist den Wegwerf-Schlüssel der Prüfung mit 403 ab.

Wie ein Kinderkonto heisst, rechnet der Server in
[`netlify/functions/_lib/kind.mjs`](./netlify/functions/_lib/kind.mjs) genauso wie der
Client beim Anmelden – Zeile für Zeile. `npm run test:functions` prüft das gegen Auth- und
Firestore-Emulator, samt Kasse (Stripe nachgebaut) und Webhook (echte Unterschrift, von der
Stripe-Bibliothek ohne Netz gerechnet). Derselbe Lauf steht im Workflow.

## 4. Admin-Bereich

Wenn du dich in der App mit Google und `Alain.sc2@gmail.com` anmeldest, erscheint im Profil oben rechts zusätzlich der **Admin-Bereich**. Dort werden alle Accounts geladen und pro User folgende Daten angezeigt:

- Profil und letzte Aktivität aus `users/{uid}`
- Gesamtwerte aus `stats`
- Fortschritt pro Rätselart und Level aus `users/{uid}/levelProgress`
- einzelne Sitzungen aus `users/{uid}/sessions`
- abgebrochene Sitzungen als Sessions ohne `solved`, aber mit `endedAt`

Das Feld `role: "admin"` bzw. `isAdmin: true` im eigenen Profil dient nur als Anzeige/Metadatum. Die echte Berechtigung liegt in `firestore.rules` und prüft das verifizierte Auth-Token mit der Admin-E-Mail.

### Der Reiter „Spiele": ein Spiel unbegrenzt freigeben

Jede Spielkarte trägt den Haken **„Gratis ohne Limite"**. Er schreibt die Kennung des Spiels nach
`config/gratisSpiele`; von dort liest sie `entitlement.js` auf jedem Gerät, auch ohne Konto.

Gedacht ist er für eine Werbeaktion – ein Spiel als Challenge auf Social Media, ohne dass nach der
ersten Runde das Tor kommt. Drei Eigenschaften, und jede war eine Entscheidung:

- **Nur dieses Spiel.** Die übrigen vierundzwanzig behalten ihre eine Schnupperrunde.
- **Nur solange der Haken steht.** Ein Klick nimmt ihn zurück, ohne Rückfrage – er nimmt niemandem
  etwas weg.
- **Er verbraucht nichts.** Während der Aktion zählt `rundeBeendet()` für dieses Spiel nicht, genau
  wie bei einem Kind, das gekauft hat. Andersherum wäre der Haken eine Falle: Wer ihn wegnimmt,
  sperrte damit alle aus, die in der Aktion gespielt haben. So hat danach jedes Gerät wieder seine
  eine freie Runde.

Wer sein Spiel schon verbraucht hatte, kommt beim Setzen des Hakens ebenfalls herein – sonst liefe
die Werbung genau bei denen ins Leere, die die App schon einmal gesehen haben. Steht das Tor
gerade offen, geht es von selbst auf.

**„Verbraucht nichts" heisst nicht „zählt nicht".** Das sind zwei getrennte Dinge, und die
Verwechslung wäre teuer:

| | wo | was |
| --- | --- | --- |
| Schnupperrunde | `localStorage`, `lernapp.gratis.runden` | entscheidet nur, ob das Tor kommt |
| Statistik | Firestore: `levelProgress`, `sessions`, `gameState` | was im Adminbereich steht |

`rundeBeendet()` fasst ausschliesslich das Erste an. Die drei Schreibwege in die Cloud
(`recordLevelStart`, `flushCurrentSession`, `gastSpielstandSichern`) fragen die Schranke nirgends.
Ein freigegebenes Spiel wird also vollständig gezählt – mit Runden, Punkten und Spielern, gerade
dort, wo man es für eine Aktion wissen will. `scripts/check-besuch.mjs` prüft genau das.

Geschrieben wird der Haken mit `arrayUnion`/`arrayRemove`, nicht als ganze Liste: Zwei offene
Adminfenster – oder ein Klick, bevor der erste `onSnapshot` da war – hätten sonst die Freigabe der
jeweils anderen Seite still gelöscht, mitten in einer laufenden Aktion.

Die Schranke wartet auf die Liste: `isLoaded()` gilt erst als beantwortet, wenn sie da ist. Sonst
sähe ein Kind für einen Moment ein Tor, das gleich wieder verschwindet.

### Der Reiter „Gäste": wer die App besucht

Ein Gast ist ein Gerät ohne Konto. Bis vor Kurzem entstand sein Dokument erst, wenn jemand ein
**Level startete** – wer die App öffnete, sich umsah und wieder ging, hinterliess nichts. Genau
diese Leute fehlten aber in der Antwort auf die Frage, wie viele Menschen überhaupt vorbeischauen.

Seither meldet die App jeden Aufruf an `POST /api/besuch`
(`netlify/functions/besuch.mjs`). Der Reiter zeigt deshalb **jedes Gerät, das die App je geöffnet
hat**, mit:

- **Besuche** – wie oft. Ein Neuladen zählt nicht: Innerhalb von 30 Minuten wird nur der
  Zeitstempel nachgeführt. Gemessen wird dabei ab dem letzten *gezählten* Besuch, nicht ab dem
  letzten Aufruf – sonst verlängerte jedes Neuladen die Sperrfrist, und wer alle 29 Minuten neu
  lädt, bliebe für immer bei Besuch eins.
- **Gerät** – „Handy · iOS · Safari". Der Server liest das aus dem User-Agent und legt nur diese
  drei groben Angaben ab. Die vollständige Kennung wäre ein Fingerabdruck und beantwortete
  dieselbe Frage nicht besser.
- **Standort** – Land, Region, Ort. Die Angabe kommt aus `context.geo`, das Netlify der Funktion
  mitgibt; niemand schlägt eine IP nach. Breite und Länge stehen dort auch und bleiben
  absichtlich liegen.
- **Sprache, Zeitzone, Bildschirmgrösse, als App installiert** – vom Browser des Gastes, also
  eine Behauptung und keine Tatsache. Für einen Zähler reicht das.

**Eine IP-Adresse wird nirgends gespeichert**, auch nicht gekürzt. Für die Bremse (siehe unten)
liegt zur Adresse eine mit einem Serverschlüssel gesalzene Prüfsumme in `besuchBremse/{hash}` –
ein blosser SHA-256 wäre hier wertlos, weil sich vier Milliarden IPv4-Adressen in Minuten
durchrechnen lassen. Als Salz dient `FIREBASE_SERVICE_ACCOUNT`; es liegt ohnehin bereit, und ohne
es läuft die Funktion gar nicht.

Der Filter trennt die beiden Fragen, die hier zusammenliegen: „Wie viele waren da?" und „Wie viele
haben gespielt?".

**Was als „gespielt" zählt.** Die Spiele mit Levelkatalog hinterlassen `levelProgress` und
`sessions`. Die Spiele mit eigenem Kasten – Turmbau, Memory, Tier-Sprung, der Karten-Merker und die
übrigen aus `game-cloud.js` – tun das nicht: Sie rufen `recordLevelStart` nie auf, und ihr Stand
ging für einen Gast nirgendwohin, weil `saveGameState` ohne Konto abbrach. Ein Kind, das eine
Stunde Turmbau spielte, hinterliess in der Cloud genau nichts; im Adminbereich stand bei jedem
dieser Spiele „nie gespielt", egal wie viel gespielt wurde.

Seit `gastSpielstandSichern()` (firebase.js) geht der Kasten deshalb auch für einen Gast in die
Cloud – in derselben Form wie bei einem Konto (`gameState.<schlüssel> = { data, updatedAt }`),
dazu die Marke `hatGespielt`. Der Adminbereich rechnet damit unverändert weiter und zeigt unter
„Spiele ohne Level" die Runden **und das beste Ergebnis**; ohne diese Zahl liesse sich nur
ablesen, DASS gespielt wurde, nicht wie weit jemand gekommen ist.

Massgeblich bleibt trotzdem das Gerät: Gelesen wird der Kasten für einen Gast nie zurück –
`game-cloud.js` führt ihn aus dem localStorage, und ein zweites Gerät hat ohnehin eine eigene
Gastkennung. Was in der Cloud liegt, ist eine Kopie für den Adminbereich, kein Speicherort. Die
Frage „hat gespielt?" beantwortet `guestHasPlayed()` an einer Stelle, nicht zweimal.

`/api/besuch` ist neben `passwort-mail` der einzige offene Endpunkt – ein Gast hat kein
Firebase-Token, es gibt niemanden zu prüfen. Deshalb zwei Schranken: Die Gastkennung muss dem
Muster `guest_[A-Za-z0-9_-]{8,48}` entsprechen (dasselbe wie in `firestore.rules`), und je
Anschluss zählt die Bremse höchstens 240 Besuche am Tag. Ohne sie könnte jemand in einer Schleife
erfundene Kennungen schicken und die Datenbank vollschreiben.

### Gäste wieder loswerden

Zwei Wege, beide mit Rückfrage:

- **Einzeln** im aufgeklappten Gast. Hat er gespielt, sagt die Rückfrage das – dann geht
  Statistik verloren, die es nur dort gibt.
- **Sammelknopf** „Besuche ohne Spiel entfernen". Er fasst nur Geräte an, die nie gespielt haben –
  und liest jeden davon **unmittelbar vor dem Löschen noch einmal**. Das ist nicht
  übervorsichtig: Der Adminbereich kann stundenlang offen stehen, und zwischen dem Laden der
  Liste und dem Klick auf „Ja" kann ein Kind angefangen haben zu spielen. Wer dabei übersprungen
  wird, steht danach als Hinweis über der Liste.

Es nimmt dem Gast nichts weg: Sein Stand liegt auf **seinem Gerät** (localStorage), das Dokument
in der Cloud ist nur die Kopie, die der Adminbereich lesen kann. Genau deshalb hat ein Gast auch
keinen Zurücksetzen-Knopf – er täte auf dem Gerät nichts. Kommt ein gelöschter Gast wieder, legt
`besuch.mjs` ihn neu an: gleiche Kennung, aber bei Besuch eins.

In `firestore.rules` stand für Gäste lange `allow delete: if false` – für alle, auch für den
Admin. Das war richtig, solange ein Gastdokument nur beim Spielen entstand. Seit jeder Aufruf
zählt, entsteht hier eine Zeile je Gerät, und eine Liste, die nur wächst, liest nach einem halben
Jahr niemand mehr. Löschen darf jetzt der Admin, sonst weiterhin niemand.

### Ein Konto ganz entfernen

Ein Konto liegt an **fünf** Orten, und keiner räumt die anderen mit auf:

| Wo | Was |
| --- | --- |
| **Firebase Auth** | die Anmeldung: Adresse und Passwort. Nur hier – Firestore weiss davon nichts. |
| `users/{uid}` | das Profil: Name, Rolle, Lok, Gruppe, Zahlen |
| `users/{uid}/levelProgress`, `/sessions` | gelöste Level und Sitzungen |
| `entitlements/{uid}` | ob gekauft wurde |
| `mails` | was an dieses Konto geschickt wurde |

Daraus folgt die Falle, in die man genau einmal tappt: **Wer in der
Firebase-Console `users/{uid}` löscht, löscht das Profil, nicht die
Anmeldung.** Die Adresse bleibt belegt, und beim nächsten Registrieren steht
da „diese Adresse hat schon ein Konto" – ohne dass in Firestore noch etwas zu
sehen wäre. Von Hand aufräumen liesse sich das nur in **Authentication →
Users**, und dann fehlten die übrigen vier Orte.

Deshalb gibt es im Adminbereich unter jedem Konto **Ganz entfernen**. Der Knopf
nimmt alle fünf mit, in dieser Reihenfolge: zuerst die Anmeldung (ab da kommt
niemand mehr hinein, und ein Abbruch danach lässt sich mit demselben Knopf zu
Ende räumen), dann die Daten. Er fragt vorher, und bei einem Elternkonto nennt
die Frage die Kinder beim Namen.

Drei Dinge gehen **nicht**:

- **Das eigene Konto.** Wer es löschte, käme nicht mehr in den Adminbereich –
  der Zugang hängt an der Adresse (`firestore.rules`, `isAdmin`), und niemand
  könnte ihn wieder hereinlassen.
- **Ein anderes Admin-Konto**, aus demselben Grund.
- **Ein Elternkonto ohne seine Kinder.** Ein Kind ohne Elternkonto gilt in
  `entitlement.js` als „Gründer" und wäre damit dauerhaft frei – aus dem
  Aufräumen würde ein Geschenk. Der Knopf nimmt die Familie deshalb zusammen.

Zwei Dinge, die ein Löschen **nicht** sofort kann, und was dagegen getan ist:

- **Ein Token, das schon in einem offenen Browser liegt**, entwertet es nicht.
  Ein Firebase-ID-Token ist ein signiertes JWT und gilt eine Stunde; geprüft
  wird beim Ausstellen, nicht beim Benutzen. Am Server ist das geschlossen:
  `verifyIdToken` prüft auf Widerruf (`_lib/anfrage.mjs`, `checkRevoked`), also
  gibt es ab dem Löschen kein Kinderanlegen, keinen Gang zur Kasse und keine
  Mail mehr. In **Firestore** bleibt das alte Token gültig, bis es abläuft –
  die Regeln kennen nur seinen Inhalt, und eine Regel, die auf das
  Kontodokument prüfte, machte das Anlegen eines Kontos unmöglich. Ein offener
  Browser kann also bis zu eine Stunde lang seinen Fortschritt zurückschreiben
  und taucht dann wieder in der Kontenliste auf, ohne Anmeldung und ohne Kauf.
  Derselbe Knopf räumt ihn weg.
- **Ein verspäteter Kauf.** Stripe wiederholt ein Ereignis tagelang, und eine
  verzögerte Zahlung meldet sich ohnehin später. Deshalb hinterlässt das
  Löschen eine Marke in `geloeschteKonten/{uid}`; der Webhook verwirft daran
  einen Kauf für ein gelöschtes Konto, statt Kaufeintrag und
  Bestellbestätigung neu anzulegen. Die Marke bleibt für immer stehen – sie
  ist drei Felder gross, und Firebase vergibt eine uid nie zweimal. Lesen oder
  löschen kann sie kein Client (`firestore.rules`).

Serverseitig ist das `POST /api/konto-loeschen` (Admin-Token); was wo liegt und
warum die Reihenfolge so ist, steht in
[`netlify/functions/_lib/konto.mjs`](./netlify/functions/_lib/konto.mjs).
`npm run test:functions` löscht eine ganze Testfamilie und sieht an allen fünf
Orten nach, dass nichts übrig bleibt – und dass die Adresse danach wieder frei
ist.

Bei jedem User steht dort auch **Fortschritt zurücksetzen**. Gäste haben den Knopf bewusst nicht: ihr Stand liegt auf ihrem Gerät, das Gastdokument ist nur eine Kopie davon, und ein Aufräumen in Firestore liesse den Zug des Kindes unverändert stehen.

### E-Mail

Der Reiter **E-Mail** zeigt, was Gripszug verschickt hat und was an kids@alae.app ankam – und
stellt ein, wohin eingehende Post weitergeleitet wird. Einrichtung und Fehlersuche stehen in
Abschnitt 10.

### Gruppen

Unter jedem User steht die Karte **Gruppe** mit zwei Feldern:

- **Gruppe** – der Name der Gruppe, zum Beispiel `Familie`. Aus ihm wird der Schlüssel gebildet, unter dem sich die Mitglieder finden; `Familie` und `FAMILIE` landen deshalb in derselben Gruppe. Ein leeres Feld (oder **Aus der Gruppe nehmen**) löst die Zuordnung wieder.
- **Name des Zugs** – unter welchem Namen der Zug dieses Kontos in der Gruppe steht. Bleibt das Feld leer, gilt der Name des Kontos.

Sobald ein Konto in einer Gruppe ist, sieht es auf dem **Startbild** über dem eigenen Zug die Züge der anderen Mitglieder, jeden auf einem eigenen Gleis und mit seinem Namen davor. Ein Tipp darauf zeigt, welche Level diese Person geschafft hat. Gäste können nicht in eine Gruppe: ihr Stand liegt auf ihrem Gerät.

### Wagen-Set

Der vierte Reiter **Wagen** zeigt die beiden Wagen-Sets des Zugs als Vorschau: **Set 1 – Güterzug** (Kasten-, Kessel-, Flach-, Kran- und Postwagen) und **Set 2 – Abenteuerzug** (Einhorn, Wal, Roboter, Drache, Piratenschiff). Jeder Wagen hat zwölf Ausbauschritte, drei je Spiel seines Bereichs. Die Sets wachsen verschieden schnell: im ersten gibt ein Spiel seine Schritte nach 1, 3 und 5 Runden frei, im zweiten nach 3, 6 und 9 – ein Wagen des zweiten Sets braucht also 36 statt 20 Runden.

**Auf dieses Set wechseln** fragt nach und tut dann zweierlei: Es setzt jedes Konto zurück (genau wie **Fortschritt zurücksetzen**, Konto für Konto) und schreibt danach das Dokument `config/train`:

```json
{ "wagonSet": "2", "switchedAtMs": 1788337808939, "switchedAt": "<serverTimestamp>", "switchedBy": "<uid>" }
```

Dieses Dokument liest jedes Gerät beim Start – auch ohne Konto – und hört darauf, solange die App offen ist. Ist `switchedAtMs` neuer als der Wechsel, den das Gerät unter `lernapp.train.set` kennt, räumt es seinen lokalen Fortschritt weg (wie bei der Marke `progressReset`, nur für alle) und zeigt die neuen Wagen bei 0. Gäste ohne Konto haben ihren Stand nur auf dem Gerät; bei ihnen greift allein dieser Weg, beim nächsten Öffnen der App.

Die Regel dafür steht in `firestore.rules`: `config/{docId}` darf jeder lesen, schreiben nur der Admin. Ohne diese Regel bleibt jedes Gerät beim ersten Set – der Wechsel im Adminbereich schlüge dann mit „Keine Berechtigung“ fehl.

Geprüft wird das von `node scripts/validate-wagen-set.mjs` – ohne Browser und ohne Netz.

## 5. Fortschritt zurücksetzen

Im Profil steht unter den Karten **Gripszug Familie** und **Kinder** die Karte **Fortschritt zurücksetzen**; im Admin-Bereich gibt es dieselbe Möglichkeit für jedes fremde Konto. Beides fragt vorher nach.

Weggeräumt wird:

- alle Dokumente unter `users/{uid}/levelProgress` und `users/{uid}/sessions`
- die Gesamtzahlen in `users/{uid}.stats` (auf 0)
- die Spielstände in `users/{uid}.gameState` (Tier-Sprung, Karten-Merker und die anderen Spiele mit eigenem Konto)
- auf dem Gerät alles unter `lernapp.` ausser den Einstellungen: gelöste Level, Sterne, Übungsstände und die gesehenen Wagenschritte

Stehen bleiben Name, Lok, Landschaft, der Kauf (er hängt am Konto, nicht am Fortschritt), Ton-Einstellungen, das Wagen-Set und die Gastkennung. Ein Kind, das von vorn anfängt, behält also seinen Zug – nur die Wagen starten wieder bei 0.

### Die Marke `progressReset`

Der Fortschritt liegt nicht nur in der Cloud, sondern auch im `localStorage` des Geräts, und beim Anmelden schiebt die App den lokalen Stand nach Firestore. Wird ein Konto von einem anderen Gerät aus geleert – der Admin am Laptop, das Kind am Tablet –, wäre der gelöschte Fortschritt beim nächsten Anmelden des Tablets sofort wieder da.

Deshalb schreibt jedes Zurücksetzen eine Marke an das Konto:

```json
{ "progressReset": { "atMs": 1788337808939, "at": "<serverTimestamp>", "by": "admin", "byUid": "<uid>" } }
```

Beim Anmelden vergleicht das Gerät `atMs` mit dem, was es unter `lernapp.reset.<uid>` gespeichert hat. Ist die Marke neuer, räumt es zuerst lokal auf und merkt sich die Marke – erst danach geht etwas hoch. Weil die Marke nur einmal greift, überlebt Fortschritt, den das Kind nach dem Zurücksetzen erspielt, jede weitere Anmeldung. Verglichen wird die Marke immer nur mit sich selbst; die Uhren zweier Geräte müssen also nicht übereinstimmen.

Geprüft wird das alles von `node scripts/validate-fortschritt-reset.mjs` – ohne Browser und ohne Netz.

## 6. Datenstruktur

Die App schreibt folgende Dokumente:

| Pfad | Inhalt |
| --- | --- |
| `users/{uid}` | Profil, Name, technische Auth-Adresse, Provider, Rolle/Admin-Metadaten, Gesamtstatistik, Lok/Landschaft, Spielstände, Reset-Marke, Gruppe |
| `users/{uid}/levelProgress/{levelKey}` | Fortschritt pro Level: gelöst, Versuche, Spielzeit, Züge, Resets, Hinweise |
| `users/{uid}/sessions/{sessionId}` | Einzelne Spielstände/Sitzungen mit Start, Ende, Dauer, Zügen, Resets und gelöst-Status |
| `config/train` | Das gültige Wagen-Set und der Zeitpunkt des letzten Wechsels; nur der Admin schreibt es, jedes Gerät liest es |
| `config/gratisSpiele` | `spiele: [...]` – welche Spiele ohne Kauf **unbegrenzt** offen stehen. Gesetzt wird das im Adminbereich unter „Spiele" (ein Haken je Spiel), gedacht für eine Werbeaktion. Nur der Admin schreibt es, jedes Gerät liest es – auch ein Gast, denn genau er ist gemeint |
| `entitlements/{uid}` | Der Kauf eines Kontos (`plan`, `active`, `via`, Zeitstempel). **Schreibt nur der Server** nach einer Zahlung bei Stripe, für das Elternkonto und jedes seiner Kinder – kein Client, auch der Admin nicht von Hand. Lesen darf jedes Konto seinen eigenen Eintrag, der Admin alle |
| `guests/{guestId}` | Ein Gerät ohne Konto: Besuchszähler, erster und letzter Besuch, grobe Geräteangabe, ungefährer Standort, Gesamtstatistik, Marke `hatGespielt`. Die Kennung (`guest_…`) entsteht auf dem Gerät und liegt im localStorage. Lesen darf nur der Admin. `besuche`, `ort`, `client` und die Besuchs-Zeitstempel schreibt **nur der Server** – die Regeln sperren sie für jeden Client, sonst könnte ein Unangemeldeter erfundene Länder und Besuchszahlen unterschieben |
| `guests/{guestId}/levelProgress/{levelKey}` | Wie beim Konto, nur ohne Konto |
| `guests/{guestId}/sessions/{sessionId}` | Wie beim Konto, nur ohne Konto |
| `besuchBremse/{hash}` | Wie oft ein Anschluss heute einen Besuch gemeldet hat. Der Name ist eine gesalzene Prüfsumme der IP, nie die Adresse. **Schreibt nur der Server**, liest niemand sonst |

### Familie: Elternkonto und Kinderprofile

Ein Konto mit **echter E-Mail-Adresse** (E-Mail/Passwort oder Google) ist ein Elternkonto: Es
kann den Kauf auslösen und Kinderprofile anlegen. Ein Konto mit technischer Adresse
(`name@lernapp.local`) ist ein Kinderprofil. Die Zuordnung steht an beiden Enden:

| Feld | Wo | Wer schreibt |
| --- | --- | --- |
| `parentUid` | am Kind | der Server beim Anlegen des Kindes, oder der Admin |
| `children` | am Elternkonto (Liste von uids) | der Server beim Anlegen des Kindes, oder der Admin |
| `group` | am Kind | der Server: alle Kinder eines Elternkontos teilen `familie-<uid der Eltern>` |

**Die Familie ist eine Gruppe.** Auf dem Startbild stehen die Züge aller mit derselben
`group.id` – das gab es für Schulklassen, die der Admin zusammenstellt, und eine Familie
bekommt es ohne Zutun: Wer zu einem Elternkonto gehört, gehört zu dessen Gruppe. Die Kennung
ist die uid der Eltern, nicht ihr Name; zwei Familien Müller sähen sonst gegenseitig ihre
Kinder. Das **Elternkonto selbst ist nicht in der Gruppe** – sonst stünde auf jedem
Kinderbild ein leerer Elternzug.

Das Konto selbst darf beide Felder nie anfassen – sie stehen mit `group` in
`ownerMayNotTouch()`. Wer sich einem fremden Elternkonto zuordnen könnte, erbte dessen Kauf.

Konten, die keinen `parentUid` haben und keine Elternkonten sind, stammen aus der Zeit vor dem
Kauf. Sie bleiben frei (Gründer-Zugang); das entscheidet der Client, nicht eine Regel – die
Level liegen ohnehin in der App, die Schranke ist eine für Eltern, nicht für Hacker.

Beispiel für `levelProgress`:

```json
{
  "game": "sudoku",
  "levelId": "sudoku-easy-1",
  "levelName": "S 1-1",
  "difficulty": "easy",
  "solved": true,
  "attempts": 2,
  "timeSeconds": 184,
  "moves": 31,
  "resets": 1,
  "hints": 0
}
```

## 7. Lokalen Fortschritt übernehmen

Die App hatte bereits lokale gelöste Levels in `localStorage`. Nach dem Login werden diese automatisch in `users/{uid}/levelProgress` migriert und bleiben zusätzlich lokal als Offline-Fallback erhalten.

## 8. Login auf dem Gerät speichern

Die App setzt Firebase Auth auf lokale Persistenz (`LOCAL`). Das bedeutet: Ein Kind bleibt auf demselben Browser/Gerät auch nach Schließen der App oder einem Neustart angemeldet, bis es sich aktiv ausloggt oder Browserdaten gelöscht werden.

## 9. Testen

Starte die App über einen lokalen Server, nicht direkt per `file://`. Beispiel:

```bash
node scripts/local-pwa-server.cjs
```

Öffne dann die angezeigte `localhost`-Adresse, registriere einen Testnutzer nur mit Name + Passwort und löse ein Level. Danach sollten in Firestore Dokumente unter `users/{uid}` erscheinen.

## 10. E-Mails: kids@alae.app

Gripszug schreibt seine Mails selbst und verschickt sie über **Resend**, mit **kids@alae.app**
als Absender und Antwortadresse. Vorher kamen sie von Firebase – Absender
`noreply@lernapp-8d944.firebaseapp.com`, Betreff „Verify your email for
project-123146993935", darunter ein nackter Link. Das ist weg.

**Bestätigen muss niemand.** Die Adresse zu bestätigen ist ein Angebot in der
Begrüssungsmail, keine Schranke: Kein Teil der App fragt danach. Die einzige Ausnahme ist
der Adminbereich – er verlangt eine bestätigte Adresse (`firestore.rules`, `isAdmin`), und
das bleibt so. Beim Anmelden über Google ist die Adresse ohnehin bewiesen, und der
Admin-Zugang läuft über Google.

Es gibt genau vier Mails. Mehr verschickt Gripszug nicht:

| Wann | Was | Ausgelöst von |
| --- | --- | --- |
| Elternkonto angelegt | Begrüssung, mit optionalem Bestätigungslink | `POST /api/willkommen` (der Client, direkt nach dem Anlegen) |
| Zahlung angekommen | Bestellbestätigung mit Betrag und Datum | `stripe-webhook.mjs`, nach dem Verbuchen |
| Admin schaltet gratis frei | „Gripszug ist freigeschaltet" | `freischalten.mjs` |
| „Passwort vergessen" | Link zum Neusetzen | `POST /api/passwort-mail` |

Dazu die Post **an** kids@alae.app: Sie kommt über Cloudflare bei
`POST /api/mail-eingang` an, landet im Archiv und wird an die Adresse weitergeleitet, die im
Adminbereich steht. Jede verschickte und jede empfangene Mail steht in der Firestore-Sammlung
`mails` – das ist der Reiter **E-Mail** im Adminbereich. Lesen darf sie nur der Admin,
schreiben nur der Server.

### 10a. Was du einmalig einrichten musst

Reihenfolge einhalten: Ohne Schritt 1 verschickt Schritt 4 nichts.

**1. Resend: Domain prüfen (meist schon erledigt)**

Im [Resend-Dashboard](https://resend.com/domains) muss **alae.app** auf `verified` stehen.
Für die anderen Apps ist das bereits eingerichtet – im DNS von alae.app stehen
`resend._domainkey` (DKIM) und `send.alae.app` (MX + SPF für Bounces). Steht die Domain dort,
ist **kein einziger neuer DNS-Eintrag nötig**: Resend erlaubt jede Absenderadresse einer
bestätigten Domain, also auch `kids@alae.app`.

**2. Resend: eigenen Schlüssel für Gripszug**

[API Keys](https://resend.com/api-keys) → *Create API key* → Name `gripszug-kids`,
Permission **Sending access**. Der vorhandene Schlüssel `SMTP alae.app` (Full access) täte es
auch, aber ein eigener lässt sich zurückziehen, ohne die anderen Apps mitzunehmen – und
„Sending access" kann nicht mehr, als verschicken. Den Wert (`re_…`) kopieren; er wird nur
einmal angezeigt.

**3. Netlify: Umgebungsvariablen**

*Site configuration → Environment variables*, für die Site von kids.alae.app:

| Variable | Wert |
| --- | --- |
| `RESEND_API_KEY` | der Schlüssel aus Schritt 2 (`re_…`) |
| `MAIL_WEBHOOK_SECRET` | eine selbst erfundene lange Zufallszeichenkette, z. B. aus `openssl rand -hex 32`. Sie ist das Passwort des Posteingangs – dasselbe kommt in Schritt 5 zu Cloudflare. |
| `MAIL_ABSENDER` | optional. Vorgabe `kids@alae.app`; nur setzen, wenn die Adresse einmal eine andere wird. |
| `MAIL_ABSENDER_NAME` | optional. Vorgabe `Gripszug`. |

Danach einmal neu deployen – Netlify reicht Variablen nur an neue Deploys weiter.
Ob sie ankommen, sagt [`/api/status`](https://kids.alae.app/api/status) (nur ob, nie der
Inhalt), und ob Resend den Schlüssel mag,
[`/api/status-tief`](https://kids.alae.app/api/status-tief) – dort steht `Resend` mit dem
Stand der Domain. Eine fehlende Mail-Einrichtung macht diese Seite **nicht** rot: Verkaufen
lässt sich auch ohne.

**4. Probelauf**

Adminbereich → Reiter **E-Mail** → *Testmail schicken*. Kommt sie an, steht der Ausgang.
Kommt sie nicht an, steht der Grund im Resend-Dashboard unter *Emails*.

**5. Cloudflare: Post an kids@alae.app**

Für alae.app läuft Email Routing bereits (die MX-Einträge `route1–3.mx.cloudflare.net` stehen
im DNS). Es fehlt nur die Adresse.

> **Wo Email Routing liegt.** Nicht bei der Domain, sondern auf **Kontoebene**:
> **Compute → Email Service → Email Routing**. Wer es in der Seitenleiste der Domain unter
> *Email* sucht, findet dort nur *DMARC Management* und *Email Security* – das ist etwas
> anderes. Cloudflare hat Email Routing im Lauf von 2025/26 unter *Compute* zusammengelegt;
> falls es beim Lesen wieder woanders liegt, ist der Weg über die Suche im Dashboard
> („Email Routing") der kürzeste. Unter *Compute* liegen auch die Workers.

Zwei Wege:

*Der kleine Weg – nur weiterleiten, zwei Minuten:*

1. **Compute → Email Service → Email Routing → Destination Addresses**:
   `vonallmenalain@gmail.com` hinzufügen und die Bestätigungsmail von Cloudflare anklicken.
   Die Liste gilt kontoweit – eine Adresse, die für eine andere Domain schon bestätigt ist,
   steht hier bereits.
2. **Email Routing** → Domain `alae.app` wählen → Reiter *Routing Rules* →
   *Create routing rule*: Pattern `kids`, Action *Send to an email*,
   Destination `vonallmenalain@gmail.com`.

Damit kommt die Post an. Im Adminbereich steht sie dann aber **nicht** – Gripszug erfährt
nichts davon.

*Der ganze Weg – weiterleiten und im Adminbereich sehen:*

1. Schritt 1 von oben (Zieladresse bestätigen) ist auch hier nötig: Der Worker braucht sie
   als Reissleine.
2. **Compute → Workers & Pages** → *Create* → Reiter *Workers* → *Start with Hello World!* →
   Name `kids-mail` → *Deploy*. Danach *Edit code*, im Editor alles löschen, den Inhalt von
   [`cloudflare/kids-mail-worker.js`](./cloudflare/kids-mail-worker.js) einfügen, *Deploy*.

   Der Umweg über Hello World ist nötig, weil Cloudflare erst einen Worker angelegt haben
   will, bevor sich Code einfügen lässt.

   > **Die Datei muss GANZ hineinkopiert werden.** Sie ist gut 260 Zeilen lang und endet mit
   > `};`. Eine abgeschnittene Zwischenablage nimmt der Editor stillschweigend an, und es
   > sieht aus, als hätte es geklappt – nur fehlt dann der `email`-Handler ganz unten. Der
   > Worker ist deployt, taucht aber bei der Routing-Regel nicht auf („**No deployed Email
   > Workers found**"), und man sucht den Fehler bei Email Routing statt im eigenen Editor.
   >
   > Am sichersten ist der Knopf **Copy raw file** in der GitHub-Ansicht der Datei. Nach dem
   > Einfügen kurz nach unten scrollen: Ganz unten muss `async email(message, env)` stehen.
3. Im Worker → *Settings* → *Variables and Secrets*:
   - `GRIPSZUG_EINGANG` = `https://kids.alae.app/api/mail-eingang` (Type **Text**)
   - `MAIL_GEHEIMNIS` = derselbe Wert wie `MAIL_WEBHOOK_SECRET` bei Netlify (Type **Secret**,
     nicht Text)
4. **Nachsehen, ob alles oben ist:** Die Adresse des Workers aufrufen –
   `https://kids-mail.<dein-konto>.workers.dev`. Dort steht in einem Satz, ob der
   `email`-Handler da ist und ob die beiden Variablen gesetzt sind (nur *ob*, nie ihr
   Inhalt). Steht dort „FEHLT", ist es genau das.

   Diese Adresse ist nicht der Zweck des Workers, sondern seine Quittung. Mails nimmt er
   über Email Routing entgegen, nicht über HTTP.
5. **Compute → Email Service → Email Routing** → Domain `alae.app` wählen → Reiter
   *Routing Rules* → *Create routing rule*: Pattern `kids`, Action *Send to a Worker*,
   Worker `kids-mail`.

   Steht `kids-mail` nicht in der Liste, sondern „No deployed Email Workers found"? Dann ist
   der `email`-Handler nicht im deployten Code – zurück zu Schritt 2.
6. Eine Mail an kids@alae.app schicken. Sie muss im Postfach ankommen **und** im Adminbereich
   unter *Eingang* stehen.

   Nur im Postfach, nicht im Adminbereich? Dann greift noch eine alte Routing-Regel, oder
   `MAIL_GEHEIMNIS` und `MAIL_WEBHOOK_SECRET` sind verschieden. Was der Worker dazu sagt,
   steht in Cloudflare unter *Workers & Pages* → `kids-mail` → *Logs* → *Begin log stream*.

Wohin weitergeleitet wird, steht danach im Adminbereich, nicht bei Cloudflare: Der Worker gibt
die Mail an Gripszug, und Gripszug leitet sie über Resend weiter. Die Adresse lässt sich
deshalb jederzeit ändern, ohne sie bei Cloudflare zu bestätigen. Nur die Adresse im Worker
(`WEITERLEITUNG`) steht fest – sie zu ändern heisst, den Worker zu ändern. Sie ist zweierlei:

- **Die Reissleine.** Der Worker hält eine Mail erst für erledigt, wenn Gripszug das
  ausdrücklich sagt (`erledigt: true` in der Antwort). Antwortet Netlify nicht – oder nimmt es
  die Mail an, kann sie aber nicht zustellen, etwa weil Resend den Schlüssel ablehnt –, leitet
  der Worker selbst weiter. Post geht nicht verloren, nur weil eine Funktion hustet.
- **Der Weg für Anhänge.** Weitergeleitet wird über Resend als neue Mail mit dem Text der
  alten; ein Bild oder ein PDF kann darin nicht mitkommen. Hat eine Mail Anhänge, schickt der
  Worker sie deshalb **zusätzlich** im Original. Du bekommst dann zwei Mails – die lesbare aus
  Gripszug und das Original mit dem Anhang –, und in der ersten steht, dass die zweite kommt.

Ist die Weiterleitung im Adminbereich **ausgeschaltet**, leitet auch der Worker nicht weiter;
sonst hiesse der Schalter nichts. Die Post steht dann nur im Archiv.

### 10b. Was wo liegt

| Datei | Wofür |
| --- | --- |
| [`netlify/functions/_lib/mail.mjs`](./netlify/functions/_lib/mail.mjs) | verschickt über Resend, schreibt ins Archiv, liest die Weiterleitungsadresse |
| [`netlify/functions/_lib/mail-vorlagen.mjs`](./netlify/functions/_lib/mail-vorlagen.mjs) | wie eine Mail aussieht – ein Rahmen, sechs Anlässe, immer auch als reiner Text |
| [`netlify/functions/willkommen.mjs`](./netlify/functions/willkommen.mjs) | `POST /api/willkommen`, Begrüssung samt Bestätigungslink |
| [`netlify/functions/passwort-mail.mjs`](./netlify/functions/passwort-mail.mjs) | `POST /api/passwort-mail`, ohne Anmeldung – mit Bremse |
| [`netlify/functions/mail-eingang.mjs`](./netlify/functions/mail-eingang.mjs) | `POST /api/mail-eingang`, der Posteingang von Cloudflare |
| [`netlify/functions/mail-einstellungen.mjs`](./netlify/functions/mail-einstellungen.mjs) | `POST /api/mail-einstellungen`, der Reiter E-Mail |
| [`cloudflare/kids-mail-worker.js`](./cloudflare/kids-mail-worker.js) | läuft bei Cloudflare, nicht bei Netlify – liegt hier zum Nachlesen |

### 10c. Wenn keine Mail ankommt

1. **`/api/status`** – steht `RESEND_API_KEY: true`? Wenn nein: Variable gesetzt, aber nicht
   neu deployt.
2. **Adminbereich → E-Mail → Filter *Fehler*** – jede Mail, die nicht rausging, steht dort mit
   dem Grund von Resend. `Domain is not verified` heisst: Schritt 1.
3. **Resend → Emails** – dort steht, ob die Mail angenommen, zugestellt oder abgelehnt wurde.
   Zugestellt und trotzdem nicht da: Spam-Ordner.
4. **Post kommt an, steht aber nicht im Adminbereich** – dann läuft der kleine Weg (nur
   Routing-Regel) statt des Workers, oder `MAIL_GEHEIMNIS` und `MAIL_WEBHOOK_SECRET` sind
   verschieden. Der Worker zeigt es in Cloudflare unter *Logs*.
4b. **„No deployed Email Workers found" bei der Routing-Regel** – der deployte Worker hat
   keinen `email`-Handler. Fast immer eine abgeschnittene Zwischenablage: Die Datei aus
   `cloudflare/` ist gut 260 Zeilen lang, und der Handler steht ganz unten. Die Adresse
   `https://kids-mail.<dein-konto>.workers.dev` sagt es geradeheraus.
5. **Post steht im Adminbereich, kommt aber nicht im Postfach an** – dann hat Gripszug sie
   archiviert und Resend die Weiterleitung abgelehnt; der Grund steht am Eintrag *Weiterleitung*
   unter dem Filter *Fehler*. Der Worker leitet in diesem Fall selbst weiter, die Mail sollte
   also trotzdem da sein – wenn nicht, ist `vonallmenalain@gmail.com` bei Cloudflare nicht als
   *Destination address* bestätigt.

### 10d. Was die Prüfungen abdecken

`npm run test:functions` fängt Resend ab und prüft den ganzen Weg ohne Netz: dass die
Begrüssung genau einmal rausgeht, dass „Passwort vergessen" nur an Adressen mit Konto geht und
nicht im Sekundentakt, dass der Posteingang ohne Geheimnis nichts annimmt und dieselbe Mail
nicht zweimal weiterleitet, und dass ein Kauf verbucht bleibt, wenn die Bestätigung scheitert.
`npm run test:rules` prüft, dass die Post nur der Admin liest und niemand schreibt.
