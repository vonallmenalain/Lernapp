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

Ein Elternkonto kann **Passwort vergessen** nutzen. Die Mail dazu verschickt Firebase; damit
der Link darin auf die App zeigt, muss `kids.alae.app` unter **Authentication → Settings →
Authorized domains** stehen. Absender und Vorlage lassen sich unter **Authentication →
Templates** anpassen – dort steht sonst der Projektname als Absender.

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
| `POST /api/checkout` | Elternkonto | erstellt die Kasse bei Stripe und gibt ihre URL zurück |
| `POST /api/stripe-webhook` | Stripe (mit Unterschrift) | verbucht `checkout.session.completed` und `checkout.session.async_payment_succeeded` als Kauf für Eltern und Kinder, `charge.refunded` als Rücknahme |
| `GET /api/status` | jeder | sagt, welche Node-Fassung läuft und welche Umgebungsvariablen gesetzt sind (nur ob, nie der Inhalt). Mit `?tief=1` fragt sie Firebase und Stripe wirklich an und misst, wie lange sie brauchen. |

Die Funktionen brauchen **Umgebungsvariablen** (Netlify: *Site configuration → Environment
variables*). Ohne sie antworten sie mit einem klaren Fehler statt zu raten:

| Variable | Woher |
| --- | --- |
| `FIREBASE_SERVICE_ACCOUNT` | Ein **eigenes** Dienstkonto `gripszug-server` (nicht das Deploy-Konto!) mit den Rollen **Cloud Datastore User** und **Firebase Authentication Admin**. JSON-Schlüssel im Klartext. Es darf Daten schreiben und Nutzer anlegen, aber keine Regeln ändern. |
| `STRIPE_SECRET_KEY` | Stripe-Dashboard → Developers → API keys. Zum Testen der Testschlüssel, fürs Echte der Live-Schlüssel (beide beginnen mit `sk_`). |
| `STRIPE_PRICE_ID` | Der Preis des Produkts „Gripszug Familie" (Einmalkauf, CHF 30); die Kennung beginnt mit `price` und einem Unterstrich. |
| `STRIPE_WEBHOOK_SECRET` | Stripe-Dashboard → Developers → Webhooks → Endpunkt `https://kids.alae.app/api/stripe-webhook` mit den Ereignissen `checkout.session.completed`, `checkout.session.async_payment_succeeded` (Zahlarten, die erst später bestätigt werden) und `charge.refunded` → *Signing secret* (beginnt mit `whsec` und einem Unterstrich). |
| `SITE_URL` | optional; Netlify setzt `URL` ohnehin. Fallback `https://kids.alae.app`. |

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

Bei jedem User steht dort auch **Fortschritt zurücksetzen**. Gäste haben den Knopf bewusst nicht: ihr Stand liegt auf ihrem Gerät, das Gastdokument ist nur eine Kopie davon, und ein Aufräumen in Firestore liesse den Zug des Kindes unverändert stehen.

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
| `entitlements/{uid}` | Der Kauf eines Kontos (`plan`, `active`, `via`, Zeitstempel). **Schreibt nur der Server** nach einer Zahlung bei Stripe, für das Elternkonto und jedes seiner Kinder – kein Client, auch der Admin nicht von Hand. Lesen darf jedes Konto seinen eigenen Eintrag, der Admin alle |

### Familie: Elternkonto und Kinderprofile

Ein Konto mit **echter E-Mail-Adresse** (E-Mail/Passwort oder Google) ist ein Elternkonto: Es
kann den Kauf auslösen und Kinderprofile anlegen. Ein Konto mit technischer Adresse
(`name@lernapp.local`) ist ein Kinderprofil. Die Zuordnung steht an beiden Enden:

| Feld | Wo | Wer schreibt |
| --- | --- | --- |
| `parentUid` | am Kind | der Server beim Anlegen des Kindes, oder der Admin |
| `children` | am Elternkonto (Liste von uids) | der Server beim Anlegen des Kindes, oder der Admin |

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
