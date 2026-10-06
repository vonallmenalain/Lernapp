# Die Leseecke – Konzept und Umsetzung

Stand: Oktober 2026 · Grundlage: das Konzept «Leseecke – Konzept & Ideensammlung» (Claude Doc vom
5. Oktober 2026), `train-home.js`, `game-shell.js`, `game-cloud.js`, `entitlement.js`,
`firebase.js`, `train-art.js`, `train-scenes.js`

> **Umsetzungsstand (Oktober 2026):** Die zehn Entscheidungen aus dem Konzept sind gemäss
> Empfehlung gefallen (Abschnitt 8). Vorab ist der kleine PR für Buchstabenjagd und
> Wortdetektiv gemergt (#122: gefragt wird nach Lauten, der Lautsprecher verrät die Lösung
> nicht mehr). **Etappe 1 ist gebaut:** der Lesewagen auf dem Startbild und das Zimmer darin,
> vier Spiele (Silbenzug, Buchstabenhaus, Laute kuppeln, Stimmt das?), das Bücherregal mit
> sechs Büchern und drei Arten zu lesen, der Lesestand mit dem Lesewurm, die Leseschrift
> Andika, die Karte «Leseecke» im Elternbereich und die Schranke (je Spiel eine Runde, zwei
> Bücher frei). Noch offen aus Etappe 1: die **Aufnahmen der Laute** – bis sie da sind,
> spricht die Sprachausgabe die Selbst- und Zwielaute, die Mitlaute bleiben stumm und werden
> nur gezeigt. Prüfskripte: `scripts/validate-lesen.mjs`, `scripts/check-leseecke.mjs`.

## 1. Die Idee in drei Sätzen

Die Leseecke ist ein alter Wagen auf einem Abstellgleis neben dem Zug. Drinnen warten ein
Buchstabenhaus, eine Silbentrommel, eine Wortkiste, ein Spielzeugzug für Sätze und ein
Bücherregal mit Geschichten über die Tiere der Reise. Sie führt 3- bis 10-Jährige auf zwei
Gleisen zum Lesen – Entziffern und Verstehen – und beginnt bei der Stufe, die jedes Kind
schon hat.

## 2. Platz in der App

Ein eigener Ort, kein sechster Bereich: Ein sechster Wagen machte den Zug kleiner, der
Fahrplan der Reise ginge nicht mehr auf, und sechs Prüfskripte rechnen fest mit fünf
Bereichen und 25 Spielen. Lesen zählt deshalb auch **nicht für den Zug** – der Lohn ist der
Lesewagen selbst und der Lesewurm darin.

- **Startbild** (`train-home.js`, `positionLesewagen`): Der Lesewagen steht links, unter dem
  Knopf für die Landschaft und knapp über dem letzten Wagen des Zugs – dort ist auf jedem
  Bildschirm Platz, auch wenn Geschwister mit ihren Zügen daneben stehen. Höchstens 16 % der
  Breite, nie kleiner als 70 Pixel.
- **Das Zimmer** (`train-leseecke.js`, gezeichnet in `lesen-art.js`): eine Ansicht der Bühne
  wie die Reise. Jedes Ding ist ein Weg: Sessel mit Lesewurm (er sucht aus, was dran ist),
  Buchstabenhaus, Trommel (Silben), Wortkiste (Wörter), Spielzeugzug (Sätze), Bücherregal.
- **Die Spiele** sind eigene Seiten auf `game-shell.js`. Der Pfeil zurück führt in den
  Lesewagen (`index.html?lesen=1`), das Haus auf das Startbild.

## 3. Was gebaut ist (Etappe 1)

| Spiel | Seite | Was das Kind tut | Übt |
| --- | --- | --- | --- |
| Silbenzug | `silbenzug.html` | hört ein Wort, schlägt je Silbe auf die Trommel, für jeden Schlag kommt ein Wagen; das grüne Signal prüft | Silben hören und zählen |
| Buchstabenhaus | `buchstabenhaus.html` | Entdecken: jedes Fenster zeigt Laut, Bild und Wort (M wie **M**aus). Suchen: «Wo wohnt dieser Laut?» | Laut und Buchstabe verbinden |
| Laute kuppeln | `lautekuppeln.html` | tippt Laut-Wagen von links nach rechts an, sie rollen zusammen («R», «Ro», «s», «se»); dann das passende Bild unter drei | Laute zusammenziehen |
| Stimmt das? | `stimmtdas.html` | liest einen Satz, prüft ihn am Bild: Daumen hoch oder runter. Auf «leicht» liest die Stimme vor | genau lesen: auf, unter, neben, wie viele |
| Bücherregal | `buecher.html` | liest ein Buch – vorlesen lassen, zusammen (abwechselnd ein Satz), selbst – und beantwortet drei Fragen | Freude am Buch, Hör- und Leseverstehen |

Drei Regeln gelten überall:

- **Laut statt Name.** M klingt «mmm», nicht «Em». Die Sprachausgabe kann das nicht, darum
  braucht es Aufnahmen (`lesen-laute.js`, Abschnitt 6).
- **Ein Laut, ein Stein.** Sch, Ch, Ck, Ei, Ai, Au, Äu, Eu, Ie, Pf, Qu, Ng – und am
  Silbenanfang St und Sp – sind je ein Baustein (`lesen-inhalte.js`, `steine`).
- **Dauerlaute zuerst.** Die Laute kommen in sechs Gruppen: M A L I O S · E R N U F W ·
  H D T B K P G · Ei Au Sch Eu Ie Ch · Z J V St Sp Pf · Ä Ö Ü Ck Ng.

Dazu: Die App liest nie von selbst vor – ausser dort, wo Zuhören die Aufgabe ist (Hörbuch,
Silbenzug, «Stimmt das?» auf leicht). Weil ein Browser eine frisch geöffnete Seite nicht
sprechen lässt, beginnt jedes Spiel mit einem Tipp auf «Los».

### Die Bücher

`lesen-buecher.js` hält die Bücher, `buecher.js` das Regal und den Leser. Jedes Bild ist aus
dem Fundus der App gebaut: die Landschaften aus `train-scenes.js`, die Tiere als ganze Figur
aus `train-art.js` (`buildPassenger`), dazu Emoji.

| Stufe | Alter | Regeln (geprüft von `validate-lesen.mjs`) | Bücher |
| --- | --- | --- | --- |
| Zum Zuhören | ab 3 | die Stimme liest alles; Fragen nur mit Bildern; die Antwort steht wörtlich auf der Seite | *Wo ist das Rüebli?* (frei), *Eule Ella hört zu* |
| Erste Sätze | ab 5 | höchstens zwei Sätze je Seite, je höchstens sieben Wörter, nur Laute der Gruppen 1–4 | *Leo und die Melone* (frei), *Pino will auf die Insel* |
| Kleine Geschichten | ab 6 | kurze Seiten, Fragen dürfen zum Nachdenken sein | *Flitz und die vergessene Nuss* |
| Geschichten | ab 7 | längere Sätze, wörtliche Rede | *Sepp und das Gewitter* |

Nach der letzten Seite kommen drei Fragen. Wer danebentippt, kann **im Buch nachsehen**: Die
Seite, auf der es steht, geht auf, und ein Pfeil führt zurück zur Frage. Drei Sterne gibt es,
wenn alle Fragen gleich stimmten, zwei mit einem Fehler, sonst einen – gelesen ist gelesen.

### Der Lesestand und der Lesewurm

`lesen-stand.js` führt einen Kasten `lernapp.lesen` über `game-cloud.js`: wie sicher jeder
Laut sitzt, wie viele Wörter gelesen oder gehört sind, welche Bücher mit wie vielen Sternen,
welches Spiel wann. **Zähler, kein Protokoll** – alle Kästen eines Kindes liegen in einem
Firestore-Dokument (Grenze 1 MiB), das Eltern und Gruppe lesen können.

- Ein Laut **sitzt** nach drei Treffern an zwei verschiedenen Tagen; dann trägt sein Fenster
  im Buchstabenhaus einen goldenen Rahmen.
- Der **Lesewurm** wächst je 20 gelesene oder gehörte Wörter um ein Glied (höchstens 60
  gezeichnet). Ist er gewachsen, seit das Kind zuletzt im Wagen war, sagt der Lautsprecher das
  zuerst.
- Der Wurm im Sessel wählt, was **als Nächstes dran ist**: je Lesestufe ein paar Spiele, und
  dran ist das, was am längsten nicht gespielt wurde.

### Alter und Einstellungen

Die Leseecke beginnt bei der Schwierigkeitsstufe des Kindes: «leicht» beim Hören, «mittel»
bei den Buchstaben, «schwer» bei den Sätzen. Im Elternbereich steht je Kind die Karte
**Leseecke** (`firebase.js`, `renderKindLesen`):

- **Wo beginnt die Leseecke?** Nach Alter, Hören, Buchstaben, Wörter, Sätze, Geschichten.
- **Schrift:** Automatisch (die Jüngsten sehen nur Grossbuchstaben), nur Grossbuchstaben,
  gross und klein.

Die Einstellung liegt als eigener Kasten `lernapp.lesen.eltern` mit Zeitmarke im gameState –
die Regeln erlauben Eltern das schon (`isProgressReset`). Das Gerät des Kindes nimmt die
neuere Fassung und schreibt sie nie selbst. Wie die Stufe überlebt sie das Zurücksetzen.

### Gratis

Die Schranke (`entitlement.js`) kennt die vier Spiele der Leseecke in einer eigenen Tabelle
`LESEECKE` – nicht in `AREAS`, die gleich bleiben muss wie im Zug – und gibt je Spiel eine
Runde frei. Das Bücherregal hat keine Runden: *Wo ist das Rüebli?* und *Leo und die Melone*
sind immer frei (`GRATIS_BUECHER`, `buchFree`), die anderen gehören zum Kauf. «Ganze App
gratis» öffnet alles.

### Schrift

Andika (SIL International, Open Font License, ohne vorbehaltenen Namen) ist für Leseanfänger
gezeichnet: a und g wie von Hand, I, l und 1 verschieden. Sie steckt als Base64 in
`leseschrift.css` (lateinisch, normal und fett: 38 KB Schrift, als Base64 rund 53 KB). So braucht es **keinen neuen
Ordner im Build** – `netlify/build.mjs` bleibt unverändert –, und offline fehlt sie nie.

## 4. Dateien

| Datei | Was |
| --- | --- |
| `lesen-inhalte.js` | Laute, Laut-Steine, Wörter für Silbenzug und Laute kuppeln, Bausteine für «Stimmt das?» |
| `lesen-buecher.js` | die Bücher: Text, Bild, Fragen |
| `lesen-stand.js` | Lesestand, Lesewurm, Einstellungen der Eltern, was als Nächstes dran ist |
| `lesen-ton.js` | Laute (Aufnahme oder Sprachausgabe), Wörter und Sätze, mit Mitleuchten |
| `lesen-laute.js` | die Aufnahmen der Laute als Daten – heute noch leer |
| `lesen-art.js` | Lesewagen, Zimmer, Lesewurm, Trommel, Laut-Wagen, Dinge für «Stimmt das?» |
| `lesen-spiel.js` | was alle Spiele der Leseecke teilen: Bühne, «Los», Ergebnis mit Sternen |
| `train-leseecke.js` | das Zimmer als Ansicht der Bühne |
| `silbenzug.*`, `buchstabenhaus.*`, `lautekuppeln.*`, `stimmtdas.*`, `buecher.*` | die Spiele |
| `leseschrift.css` | Andika |
| `train-home.js`, `index.html` | Lesewagen auf dem Startbild, `?lesen=1` |
| `entitlement.js` | `LESEECKE`, `GRATIS_BUECHER`, `buchFree`, `targetFree` mit `buch=` |
| `firebase.js` | Karte «Leseecke», `setLesenElternFor`, Zurücksetzen behält die Einstellung |
| `service-worker.js` | alle neuen Dateien im Vorrat |

## 5. Texte gegenlesen

Wörter, Sätze und Bücher sind Entwürfe nach den Regeln je Stufe – bitte gegenlesen:

- `lesen-inhalte.js`: `LAUTE` (Anlautwörter und Bilder), `SILBEN_WOERTER`,
  `KUPPEL_WOERTER`, `TIERE` und `DINGE`.
- `lesen-buecher.js`: die sechs Bücher, je mit Seiten und Fragen.

Schweizer Wörter, die Kinder hier sagen (Rüebli, Velo, fein), keine Bilder, die hier anders
heissen (ein Keks ist ein Guetzli), und nirgends das scharfe S. `validate-lesen.mjs` prüft
die Regeln, nicht den Ton – der ist Sache des Gegenlesens.

## 6. Die Laute aufnehmen (folgt)

Rund 40 kurze Aufnahmen einer ruhigen, vertrauten Stimme. Eine Aufnahmeseite, die mit dem
Handy aufnimmt, schneidet und `lesen-laute.js` erzeugt, dazu die Liste mit Anleitung
(`docs/LAUTE-AUFNEHMEN.md`), kommen im nächsten Schritt. Bis dahin gilt: Selbst- und
Zwielaute spricht die Sprachausgabe, Mitlaute bleiben stumm und werden gezeigt.

## 7. Die nächsten Etappen

- **Etappe 2 – Laute und Wörter:** Lernstand je Laut sichtbar, bekannte Buchstaben (Eltern
  haken ab, was die Schule eingeführt hat), Reimkupplung, Anlaut-Lauscher, Mein Name,
  Buchstabengleis, Wer fährt mit?, Wörter bauen, Silbenbahn, Blitzwörter, Lückensätze, zehn
  weitere Bücher.
- **Etappe 3 – Sätze:** Satz kuppeln, Quatschsätze, Lies und tu!, Stolperwörter,
  Laut-Position, Buchstaben-Signal, Quatschwörter, Geschichtenzug, der Lesewagen in 15
  Ausbaustufen, der Elternbericht.
- **Etappe 4 – Lesedetektive:** Detektivfälle, Wer bin ich?, Steckbriefe, Postkarten,
  Wortbaustelle, der Lesewurm fährt auf der Lok mit.

## 8. Die Entscheidungen

| # | Frage | Entscheid |
| --- | --- | --- |
| 1 | Eigener Ort oder sechster Bereich? | eigener Ort: der Lesewagen auf dem Abstellgleis |
| 2 | Zählt Lesen für den Zug? | nein; der Lohn ist der Lesewagen, später fährt der Lesewurm auf der Lok mit |
| 3 | Wer spricht die Laute ein? | eine ruhige, vertraute Stimme; Liste und Anleitung kommen von hier, das Handy reicht |
| 4 | Eigene Figur? | der Lesewurm; seinen Namen baut das Kind selbst (Etappe 2). Fino bleibt der Fuchs der App |
| 5 | Andika mitliefern? | ja, nur in der Leseecke – eingebettet in `leseschrift.css`, ohne Änderung am Build |
| 6 | Reihenfolge der Buchstaben? | feste Reihenfolge, Dauerlaute zuerst; Eltern haken die Buchstaben der Schule ab (Etappe 2) |
| 7 | Wie viel ist gratis? | je Spiel eine Runde und zwei Bücher |
| 8 | Wer schreibt die Texte? | Entwürfe nach den Regeln je Stufe, gegengelesen von Alain |
| 9 | Mikrofon? | vorerst nicht; später vielleicht ein Vorlese-Studio, das nur auf dem Gerät aufnimmt |
| 10 | Buchstabenjagd und Wortdetektiv vorab beheben? | ja, erledigt in #122 |
