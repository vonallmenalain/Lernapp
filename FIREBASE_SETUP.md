# Firebase Setup für Lernapp

Diese App verwendet Firebase Authentication und Cloud Firestore. Kinder melden sich nur mit **Name + Passwort** an. Intern erzeugt die App daraus eine technische Firebase-Login-Adresse wie `anna@lernapp.local`; diese Adresse ist nur für Firebase Auth da und wird Kindern nicht angezeigt.

Der Web-API-Key in `firebase.js` ist bei Firebase-Webapps öffentlich; geschützt werden die Daten durch Authentication und Firestore Security Rules.

## 1. Authentication aktivieren

1. Öffne die Firebase Console für `lernapp-8d944`.
2. Gehe zu **Build > Authentication > Sign-in method**.
3. Aktiviere **Email/Password**. Das ist auch für Name + Passwort nötig, weil die App im Hintergrund eine technische Adresse erzeugt.
4. Unter **Authentication > Settings > Authorized domains** müssen deine Domains stehen. Für lokale Tests ist `localhost` normalerweise vorhanden. Für ein Deployment musst du die finale Domain ergänzen.

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

Die Regeln erlauben nur eingeloggten Nutzern Zugriff auf ihren eigenen Bereich:

```text
users/{uid}
users/{uid}/levelProgress/{levelKey}
users/{uid}/sessions/{sessionId}
```

Alle anderen Dokumente sind gesperrt.

## 4. Datenstruktur

Die App schreibt folgende Dokumente:

| Pfad | Inhalt |
| --- | --- |
| `users/{uid}` | Profil, Name, technische Auth-Adresse, Provider, Gesamtstatistik |
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

## 5. Lokalen Fortschritt übernehmen

Die App hatte bereits lokale gelöste Levels in `localStorage`. Nach dem Login werden diese automatisch in `users/{uid}/levelProgress` migriert und bleiben zusätzlich lokal als Offline-Fallback erhalten.

## 6. Login auf dem Gerät speichern

Die App setzt Firebase Auth auf lokale Persistenz (`LOCAL`). Das bedeutet: Ein Kind bleibt auf demselben Browser/Gerät auch nach Schließen der App oder einem Neustart angemeldet, bis es sich aktiv ausloggt oder Browserdaten gelöscht werden.

## 7. Testen

Starte die App über einen lokalen Server, nicht direkt per `file://`. Beispiel:

```bash
node scripts/local-pwa-server.cjs
```

Öffne dann die angezeigte `localhost`-Adresse, registriere einen Testnutzer nur mit Name + Passwort und löse ein Level. Danach sollten in Firestore Dokumente unter `users/{uid}` erscheinen.
