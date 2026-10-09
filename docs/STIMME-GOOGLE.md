# Die App mit einer Stimme von Google (Chirp 3 HD)

Zuerst für die Bauecke gebaut (Abschnitte 1 bis 3), seit Oktober 2026 für die
ganze App (Abschnitt 4).

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
- **Alles mit derselben Stimme:** Jeder Satz der Bauecke soll als Aufnahme
  kommen, nie zwischendurch mit der Stimme des Geräts. `scripts/check-bau-stimme.mjs`
  prüft das im Browser, `scripts/check-bau.mjs` ebenfalls.

**Stand (Oktober 2026):** Die Bauecke spricht mit **Sulafat**
(`de-DE-Chirp3-HD-Sulafat`, normales Tempo) – gewählt aus Hörproben aller 30
deutschen Stimmen. Schweizerdeutsch gibt es bei Google nicht; die deutschen
Stimmen, die Mundart lesen, klangen schlecht. Wie viele Sätze aufgenommen
sind: `node scripts/stimme-google.mjs texte`.

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
   (`passtZumText`), keine Datei ohne Satz (in bau-stimme.js oder app-stimme.js).
   Bei neuen Aufnahmen APP_VERSION und alle `?v=` neu.
5. Alle `scripts/validate-*.mjs` laufen lassen, dazu `scripts/check-bau.mjs`
   und `scripts/check-bau-stimme.mjs` (Playwright: `npm i --no-save playwright`),
   Pull Request.
6. Ändert sich bau-stimme.js, braucht es eine neue App-Version (APP_VERSION
   und alle `?v=`): Sonst behält ein Gerät das alte Verzeichnis im Cache des
   Service Workers und spricht neue Sätze mit der Gerätestimme.

Gut zu wissen:

- kids.js teilt jeden Text in Sätze und spielt je Satz die längste passende
  Aufnahme; was fehlt, spricht die Gerätestimme. Deshalb sind die Aufnahmen
  satzweise.
- Die Laute (lesen-laute.js) bleiben Alains Aufnahmen. Seine vertonten Texte
  (`lesen-stimme.js`, `stimme/alain/`) liegen noch da, aber app-stimme.js kommt
  danach und spricht dieselben Sätze mit Sulafat (Abschnitt 4).
- **Je Satz höchstens ein Wechselndes.** Zwei Namen oder zwei Zahlen in einem
  Satz («Hier wohnen Flora und Benno.», «8 von 22 Sternen») gäbe es
  hunderttausendfach. Die Bauecke sagt so etwas deshalb in Sätzen mit je einem
  Namen oder einer Zahl («Hier wohnt Flora. Benno wohnt auch hier.»,
  «Zusammen haben sie 8 Sterne. 14 fehlen noch.»). kids.js teilt ausserdem
  hinter einem Doppelpunkt («Flora:» und «Juhu, ein Bett!») und nicht hinter
  einer Zahl («Der 3. Stock» bleibt beisammen). Wer in train-bau.js einen neuen
  Satz baut, hält sich daran und trägt ihn in `stimme-bau-texte.mjs` ein;
  `check-bau-stimme.mjs` findet, was fehlt.
- **Kein Knacken:** Neue Aufnahmen werden 12 ms ein- und 25 ms ausgeblendet
  (`stimme-google.mjs`, `zuMp3`). Beim Abspielen blendet kids.js jede Aufnahme
  15 ms ein, und eine, die ein neuer Tipp abbricht, klingt in 40 ms aus, statt
  mitten in der Welle abzureissen – die nächste wartet so lange. (Auf iPhone und
  iPad lässt sich die Lautstärke nicht ändern; dort bleibt der harte Wechsel.)
  Die ersten 8810 Aufnahmen bleiben ohne Blende: Neu kodiert verlören sie an
  Klang.
- Ein Text aus mehreren Sätzen spielt Stück für Stück. Darum darf ein Wechsel
  der Hilfe eine Ansage nicht abbrechen: train-bau.js setzt die Hilfe mit
  `setHelp(text, { ansageBleibt: true })` (kids.js). `check-bau.mjs` zählt
  einen Satz erst, wenn er zu Ende gesprochen oder gespielt ist.
- Wird mit einer anderen Stimme alles neu gesprochen (`--alle-neu`), heissen
  die Dateien gleich wie vorher (nach ihrem Text). Dann braucht STIMME_CACHE
  in `service-worker.js` eine neue Nummer, sonst spielen Geräte, die einen Satz
  schon gehört haben, weiter die alte Stimme.

## 4. Die ganze App

Seit Oktober 2026 spricht nicht nur die Bauecke mit Sulafat, sondern die ganze
App: die Hilfe jedes Spiels, Aufgaben, Wörter, Bücher, Ergebnisse, die Reise,
der Lesewagen. Zwei Bereiche, ein Ordner:

| Bereich | Sätze aus | Verzeichnis | geladen auf |
| --- | --- | --- | --- |
| `bau` | `scripts/stimme-bau-texte.mjs` | `bau-stimme.js` | index.html |
| `app` | `scripts/stimme-app-texte.mjs` | `app-stimme.js` | jeder Seite mit kids.js |

Die Aufnahmen liegen beide in `stimme/google/` (eine Datei je Text – ein Satz,
den beide Bereiche sagen, hat eine Datei). `app-stimme.js` steht auf jeder
Seite **nach** `lesen-stimme.js` (das sein Verzeichnis neu anlegt).

Woher die Sätze kommen (`stimme-app-texte.mjs`):

- **fest:** jede Zeichenkette im Code der Spiele, die wie ein gesprochener
  Satz aussieht – herausgelesen von `scripts/stimme-quelltext.mjs` (kennt
  Kommentare, Vorlagen, reguläre Ausdrücke und `[…].join(" ")`). Etwas mehr
  als nötig, aber kein Satz fehlt, weil ihn niemand eingetragen hat.
- **Regeln** in `scripts/stimme-app/`: je Gruppe von Spielen eine Datei
  (`leseecke-a.mjs`, `leseecke-b.mjs`, `spiele.mjs`, `zug.mjs`). Sie rechnen
  die Sätze mit Wechselndem aus den Daten aus («Hör gut: Apfel.», «Du hast 5
  von 8 Wörtern …», jede Station der Reise). Sie lesen Konstanten und kleine
  Funktionen direkt aus dem Code der Spiele; ändert sich dort eine Vorlage,
  bricht die Regel mit einer Meldung ab, statt still Falsches aufzunehmen.
  `NICHT` in einer Regel-Datei sagt, was sich nicht vorher aufnehmen lässt.

Damit alles aufnehmbar ist, sprechen ein paar Spiele seit Oktober 2026 etwas
anders:

- **Je Satz höchstens ein Wechselndes** gilt auch hier. Ein falsches Paar im
  Anlaut-Lauscher und in der Reimkupplung kommt als zwei Wörter nacheinander,
  der Fahrplan sagt «12 von 60 Stationen gestempelt. 3 Stempel sind golden.»,
  Neues an der Lok und im Lesewagen kommt Satz für Satz.
- **Kein Satz endet mit «Zahl.», wenn danach etwas Neues kommt:** kids.js teilt
  dort nicht («der 3. Stock»). Darum heisst es «Schaff Level 3!» und «Tippe auf
  die 5 im grünen Kreis.».
- **Quatschwörter:** je Stufe 60 feste Monsternamen statt jedes Mal neu
  ausgewürfelter, die ähnlichen Schilder je Name immer dieselben.
- **Stolperwörter:** je Satz drei feste Fassungen mit Stolperstein.
- **Laute kuppeln:** Ein Stück ohne Selbstlaut («br») liest keine Stimme
  richtig vor – dort klingt der neue Laut aus seiner Aufnahme.
- **Der Lesewurm** heisst beim Sprechen immer «Dein Lesewurm»; den Namen, den
  das Kind ihm gibt, zeigen Tafel und Lesewagen.

Was die Gerätestimme behält (lässt sich nicht vorher aufnehmen): der Name des
Kindes und der Name, den es seinem Lesewurm gibt, während es ihn in «Mein
Name» legt; die Stimmprobe im Elternbereich (dort geht es gerade um die
Stimmen des Geräts). Die vollständige Liste: `NICHT` in den Regel-Dateien.

Ablauf:

1. `node scripts/stimme-google.mjs texte --bereich app` – wie viele Sätze und
   Zeichen, wie viele schon aufgenommen sind.
2. `node scripts/stimme-google.mjs vertonen --bereich app` – nimmt auf, was
   fehlt (Sätze, die die Bauecke schon hat, ohne Anfrage), schreibt
   `app-stimme.js`. Danach APP_VERSION und alle `?v=` neu.
3. `node scripts/validate-app-stimme.mjs` – jeder Satz hat eine Aufnahme,
   jede Aufnahme gehört zu einem Satz, jede Seite lädt das Verzeichnis.
4. `node scripts/check-app-stimme.mjs` – ein Rundgang durch alle Seiten mit
   zufälligen Tipps; er meldet jeden Satz, der noch mit der Gerätestimme kommt.
5. Ändert sich ein Satz im Code, gehört er wieder vertont (Schritt 2) und die
   alte Aufnahme weg: `node scripts/stimme-google.mjs aufraeumen --bereich app`.
