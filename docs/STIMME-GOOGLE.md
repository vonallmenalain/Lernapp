# Die Bauecke mit einer Stimme von Google (Chirp 3 HD)

Die Bauecke spricht bei jedem Tipp. Bisher macht das die Sprachausgabe des
Geräts – auf manchen Tablets mechanisch oder mit Verzögerung. Neu sollen die
Sätze als fertige Aufnahmen kommen, gesprochen von einer natürlichen Stimme von
Google Cloud Text-to-Speech (**Chirp 3 HD**). Eine Aufnahme spielt sofort, auch
offline, sobald sie einmal geladen ist.

- **Was:** rund 6'700 Sätze der Bauecke, zusammen gut 180'000 Zeichen
  (`node scripts/stimme-google.mjs texte`).
- **Kosten:** Chirp 3 HD ist bis **1 Million Zeichen im Monat gratis**, darüber
  30 US$ je Million. Die ganze Bauecke braucht also weniger als ein Fünftel
  des Gratis-Kontingents. Das Skript zählt mit und hört bei 900'000 Zeichen im
  Monat von selbst auf.
- **Was fehlt, bleibt wie bisher:** Sätze ohne Aufnahme spricht weiter die
  Gerätestimme (z. B. «Hier wohnen Flora und Benno.»).

## 1. Google Cloud einrichten (einmal, etwa 15 Minuten)

Am Computer im Browser, mit deinem Google-Konto. Die Menüs heissen je nach
Spracheinstellung deutsch oder englisch – beides steht hier.

1. **Eigenes Projekt anlegen** – getrennt vom Firebase-Projekt der App, damit
   dort nichts ändert:
   <https://console.cloud.google.com/projectcreate>
   Name zum Beispiel `lernapp-stimme`, dann «Erstellen» (Create). Oben links
   in der Projektauswahl muss danach dieses Projekt stehen.

2. **Abrechnung verknüpfen** (Billing). Google verlangt das auch für das
   Gratis-Kontingent; ohne Abrechnung antwortet die Schnittstelle nicht.
   <https://console.cloud.google.com/billing> → «Projekt verknüpfen» bzw.
   «Rechnungskonto verwalten». Gibt es schon ein Rechnungskonto (Billing account), dieses wählen; sonst
   eines anlegen (Kreditkarte). Neue Konten bekommen oft ein Startguthaben.

3. **Budget-Warnung setzen** (Budgets & alerts / Budgets & Benachrichtigungen),
   damit du sofort eine E-Mail bekommst, falls je etwas kostet: wieder unter
   <https://console.cloud.google.com/billing>, im Rechnungskonto links
   «Budgets & Benachrichtigungen» → «Budget erstellen» → Betrag z. B. **1 CHF** → Benachrichtigungen bei 50 %,
   90 %, 100 %. (Ein Budget warnt nur, es stoppt nichts – das Stoppen
   übernimmt das Skript mit seiner Grenze.)

4. **Die Text-to-Speech-Schnittstelle einschalten:**
   <https://console.cloud.google.com/apis/library/texttospeech.googleapis.com>
   «Aktivieren» (Enable).

5. **Einen API-Schlüssel erstellen:**
   <https://console.cloud.google.com/apis/credentials>
   «Anmeldedaten erstellen» (Create credentials) → «API-Schlüssel» (API key).
   Dann den Schlüssel **einschränken**: beim Schlüssel auf «Bearbeiten» →
   unter «API-Einschränkungen» (API restrictions) «Schlüssel einschränken»
   (Restrict key) → nur **Cloud Text-to-Speech API** ankreuzen → «Speichern».
   Bei «Anwendungseinschränkungen» bleibt «Keine». So kann der Schlüssel
   nichts anderes als Sprache erzeugen.

6. **Den Schlüssel bei Claude hinterlegen** – nie in den Chat kopieren:
   In der Claude-App oben in der Titelleiste der Sitzung das Menü der
   Cloud-Umgebung öffnen → «Edit» → als Umgebungsvariable eintragen:

   ```
   GOOGLE_TTS_API_KEY=der-schlüssel-von-google
   ```

   Speichern. Eine **neue Sitzung** in dieser Umgebung sieht die Variable
   (eine laufende nicht).

Optional, schon vorher: Auf <https://cloud.google.com/text-to-speech> kann
man die Stimmen im Browser mit eigenem Text anhören.

## 2. Weiter mit Claude

In einer neuen Sitzung schreiben:

> Weiter mit der Google-Stimme für die Bauecke (docs/STIMME-GOOGLE.md).

Dann passiert, in dieser Reihenfolge:

1. **Stimmen auflisten** – welche deutschen Chirp-3-HD-Stimmen es gibt.
2. **Hörproben** – je Stimme eine kurze MP3 mit typischen Sätzen der Bauecke
   (Willkommen, ein Zimmer, ein paar Dinge, Juhui, ein Wunsch). Du hörst sie
   an und wählst **eine** Stimme, auf Wunsch auch etwas langsamer
   (Tempo 0,9). Wird ein Schweizer Wort falsch gesagt (Rüebli, Plättli,
   Velo …), bekommt es im Skript eine andere Schreibweise nur für die Stimme.
3. **Probelauf** – die ersten paar hundert Sätze, in der App anhören.
4. **Alles vertonen** – die übrigen Sätze (dauert etwa eine halbe Stunde).
5. **Einbauen und Pull Request** – siehe Checkliste unten.

## 3. Checkliste für Claude

Die Werkzeuge:

- `scripts/stimme-bau-texte.mjs` – welche Sätze die Bauecke sagt (aus
  train-bau.js, dem Katalog und den Satzmustern), aufgeteilt in `kern`,
  `zahlen`, `namen`. Ändert sich ein Satzmuster in train-bau.js, hier
  nachziehen und `aufraeumen` laufen lassen.
- `scripts/stimme-google.mjs` – `texte`, `stimmen`, `probe`, `vertonen`,
  `aufraeumen`, `verbrauch` (Genaueres im Kopf der Datei). Legt die MP3s in
  `stimme/google/` und schreibt `bau-stimme.js`; Stimme, Tempo und die
  verbrauchten Zeichen je Monat stehen in `scripts/stimme-google.json`
  (mit ins Repo – so weiss auch die nächste Sitzung, was schon verbraucht ist).

Ablauf:

1. `node scripts/stimme-google.mjs stimmen`
2. `node scripts/stimme-google.mjs probe --stimmen <A>,<B>,… --aus <Scratchpad>/probe`
   – die MP3s mit SendUserFile zeigen, Wahl abwarten.
3. `node scripts/stimme-google.mjs vertonen --stimme <Wahl> [--tempo 0.9] --teil kern --limit 300`,
   dann ohne `--limit`, dann ohne `--teil`. Die Liste «Nicht übernommen»
   ansehen; ein zweiter Lauf versucht diese Sätze neu.
4. Eingebaut ist schon alles: `index.html` lädt `bau-stimme.js` direkt
   **nach** `lesen-stimme.js` (bau-stimme.js ergänzt dessen Verzeichnis,
   lesen-stimme.js setzt es neu), `service-worker.js` hat es in den
   CORE_ASSETS, die Aufnahmen gehen in den Cache STIMME_CACHE (alles unter
   `/stimme/`), und `netlify/build.mjs` nimmt `stimme/` mit.
   `scripts/validate-bau.mjs` prüft jede Aufnahme: ein Satz aus `bauTexte()`,
   Datei `dateiFuer(text)`, MP3 mono/24 kHz/32 kbit/s, Länge passend
   (`passtZumText`), keine Datei ohne Satz, kein Satz mit Alains Stimme.
   Bei neuen Aufnahmen APP_VERSION und alle `?v=` neu.
5. Alle `scripts/validate-*.mjs` laufen lassen, Pull Request.

Gut zu wissen:

- kids.js teilt jeden Text in Sätze und spielt je Satz die längste passende
  Aufnahme; was fehlt, spricht die Gerätestimme. Deshalb sind die Aufnahmen
  satzweise.
- Die Leseecke behält Alains Stimme (`lesen-stimme.js`, `stimme/alain/`).
- Wird mit einer anderen Stimme alles neu gesprochen (`--alle-neu`), heissen
  die Dateien gleich wie vorher (nach ihrem Text). Dann braucht STIMME_CACHE
  in `service-worker.js` eine neue Nummer, sonst spielen Geräte, die einen Satz
  schon gehört haben, weiter die alte Stimme.
