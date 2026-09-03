# Firebase Setup für Lernapp

Diese App verwendet Firebase Authentication und Cloud Firestore. Kinder melden sich nur mit **Name + Passwort** an. Intern erzeugt die App daraus eine technische Firebase-Login-Adresse wie `anna@lernapp.local`; diese Adresse ist nur für Firebase Auth da und wird Kindern nicht angezeigt.

Der Web-API-Key in `firebase.js` ist bei Firebase-Webapps öffentlich; geschützt werden die Daten durch Authentication und Firestore Security Rules.

## 1. Authentication aktivieren

1. Öffne die Firebase Console für `lernapp-8d944`.
2. Gehe zu **Build > Authentication > Sign-in method**.
3. Aktiviere **Email/Password**. Das ist auch für Name + Passwort nötig, weil die App im Hintergrund eine technische Adresse erzeugt.
4. Aktiviere zusätzlich **Google** als Provider. Der Admin-Bereich ist nur über das verifizierte Google-Konto `Alain.sc2@gmail.com` freigegeben.
5. Unter **Authentication > Settings > Authorized domains** müssen deine Domains stehen. Für lokale Tests ist `localhost` normalerweise vorhanden. Für ein Deployment musst du die finale Domain ergänzen.

Hinweis: Firebase Auth verlangt intern mindestens 6 Passwortzeichen. Die App erlaubt den Kindern trotzdem Passwörter ab 4 Zeichen und hängt intern eine feste Endung an, damit Firebase die Anmeldung akzeptiert. Das ist bewusst einfach gehalten und für eine kleine Kindergruppe gedacht.

## 2. Firestore Database aktivieren

1. Gehe zu **Build > Firestore Database**.
2. Erstelle die Datenbank, falls sie noch nicht existiert.
3. Wähle den passenden Standort.
4. Verwende nicht die temporären Testregeln, weil diese nach kurzer Zeit auslaufen und bis dahin zu offen sind.

## 3. Firestore Rules hinterlegen

In der Firebase Console:

1. Gehe zu **Build > Firestore Database > Rules**.
2. Ersetze die vorhandenen Regeln vollständig mit dem Inhalt aus [`firestore.rules`](./firestore.rules).
3. Klicke auf **Publish**.

Die Regeln erlauben eingeloggten Nutzern Zugriff auf ihren eigenen Bereich:

```text
users/{uid}
users/{uid}/levelProgress/{levelKey}
users/{uid}/sessions/{sessionId}
```

Zusätzlich darf das verifizierte Admin-Google-Konto `Alain.sc2@gmail.com` alle `users`-Dokumente und deren Unterkollektionen **lesen** sowie einen fremden Account **zurücksetzen**. Für das Zurücksetzen ist genau zweierlei erlaubt: Dokumente unter `users/{uid}` löschen und am Profil die Felder `stats`, `gameState`, `progressReset` und `updatedAt` ändern. Name, Rolle, Lok und Levelmodus bleiben dem Admin verwehrt, und Fortschritt schreiben kann er nirgends – wegräumen ja, erfinden nein. Alle anderen Dokumente sind gesperrt.

Wer in derselben **Gruppe** ist (Feld `group.id` am Konto), darf ausserdem die Konten der anderen Mitglieder und deren `levelProgress` **lesen** – mehr nicht: Sitzungen bleiben privat, und geschrieben wird beim anderen nirgends. Das Feld `group` selbst ist dem Admin vorbehalten; ein Kind kann es weder anlegen noch ändern, sonst schriebe es sich in eine fremde Gruppe und läse deren Fortschritt mit.

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

## 5. Fortschritt zurücksetzen

Im Profil steht neben **Alle Levels freischalten** die Karte **Fortschritt zurücksetzen**; im Admin-Bereich gibt es dieselbe Möglichkeit für jedes fremde Konto. Beides fragt vorher nach.

Weggeräumt wird:

- alle Dokumente unter `users/{uid}/levelProgress` und `users/{uid}/sessions`
- die Gesamtzahlen in `users/{uid}.stats` (auf 0)
- die Spielstände in `users/{uid}.gameState` (Tier-Sprung, Karten-Merker und die anderen Spiele mit eigenem Konto)
- auf dem Gerät alles unter `lernapp.` ausser den Einstellungen: gelöste Level, Sterne, Übungsstände und die gesehenen Wagenstufen

Stehen bleiben Name, Lok, Landschaft, Levelmodus, Ton-Einstellungen und die Gastkennung. Ein Kind, das von vorn anfängt, behält also seinen Zug – nur die Wagen starten wieder bei 0.

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
