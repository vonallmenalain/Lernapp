# Die Rechenecke – Konzept und Ideensammlung

Stand: 2. November 2026 · Entwurf · Grundlage: `docs/LESEECKE-KONZEPT.md`,
`docs/BAUECKE-KONZEPT.md`, `docs/SPIELVORSCHLAEGE-BEREICHE.md` (Abschnitt 3.5, «Wo hält der
Zug?»), `docs/UX-REVIEW-KINDER-4-8.md` (P9), `train-home.js` (`positionLesewagen`,
`positionBauplatz`), `entitlement.js` (`AREAS`, `LESEECKE`), `zahlengleis.js`, `lesen-stand.js`,
`app-stimme.js`, `firestore.rules`

> **Umsetzungsstand (November 2026):** **Etappe 1 ist gebaut** – siehe Abschnitt 0 gleich
> unten. Die Entscheidungen sind gemäss Empfehlung gefallen (Abschnitt 16).
>
> **Ursprünglicher Stand:** Entwurf, noch nichts gebaut. Der Wunsch kommt von der jüngeren Tochter (5): Sie
> möchte rechnen, vor allem Plus. Dieses Dokument sammelt, wie ein eigener Ort für Zahlen und
> Rechnen aussehen kann – so wie die Leseecke für das Lesen –, mit möglichst vielen Spielideen,
> einem Vorschlag für die Etappen und den offenen Entscheidungen (Abschnitt 16).
>
> Zum Konzept gehört eine klickbare **Stilprobe** (Artefakt «Gripszug Rechenecke»; dieselbe
> Seite liegt als `docs/rechenecke-stilprobe.html` im Repo und geht nicht auf die Site). Sie
> zeigt das Zimmer mit dem Rechendrachen und seinem Schatz, und drei Spiele lassen sich
> wirklich spielen: **Kuppel-Plus**, **Tunnel-Rechnen** und **Blitzblick**, je in drei
> Stufen. Alle anderen Dinge im Zimmer zeigen beim Antippen eine Karte mit der Idee dahinter.

---

## 0. Die Umsetzung (Etappe 1)

Alle zwölf Entscheidungen sind gemäss Empfehlung gefallen. Was davon abweicht oder genauer
geworden ist, steht hier.

### 0.1 Der Rechenwagen auf dem Startbild

Der Rechenwagen steht auf einem **zweiten Abstellgleis direkt über dem Lesewagen**, gleich
breit und gleich links (`train-home.js`, `positionRechenwagen`). Über dem Lesewagen ist auf
jedem Bildschirm Platz, und so bleibt die Mitte frei für die Züge der Gruppe. Reicht der Platz
bis zum Knopf der Landschaft nicht, wird er kleiner, unter 70 Pixeln bleibt er weg. Von aussen:
sonnengelb mit blauem Dach, über den Fenstern die Zahlen 1 bis 10 in den Fünfer-Farben, im
mittleren Fenster der Drache (oder sein Ei), ist er ganz eingerichtet, eine Lichterkette.

Im Lesewagen führt eine **Tür** ganz links (Schild «1+2») in den Rechenwagen, im Rechenwagen
eine Tür zurück. `index.html?rechnen=1` führt direkt hinein; von dort kommen die Spiele zurück.

### 0.2 Das Zimmer

`train-rechenecke.js` hängt das Zimmer in die Bühne wie das Lesezimmer, gezeichnet in
`rechnen-art.js` (1000 × 560). Ein Ding steht nur da, wenn es ein Spiel hat – der Wagen füllt
sich mit jeder Etappe. In Etappe 1: Rangiergleis, Tunnel, linkes Fenster (Blitzblick), rechtes
Fenster mit Perron (Einsteigen bitte!), Würfel, Zahlenhaus, dazu der Drache auf dem Kissen mit
der Missionskarte, der Schatz und die Tür. Oben hängen die Zahlenwimpel 1 bis 10. Beim
Hereinkommen hüpft reihum, was sich antippen lässt. Die **Einrichtung in 15 Schritten**
(`AUSBAU`, jedes Ding selbst eine Zahl) ist schon eingebaut und wächst mit den Runden.

### 0.3 Der Drache und sein Schatz

Wie im Konzept: Taler aus Runden (so viele wie Sterne, die vorgeschlagene Runde doppelt), fünf
Taler je Zacke, drei Leben zu je fünfzehn Stufen (Drachenbaby, Lokdrache, Sternendrache), nach
Stufe 15 zehn Taler bis zum nächsten Leben (`rechnen-stand.js`, `dracheAus`). Neu: Vor dem
ersten Taler liegt ein **Ei** auf dem Kissen, das wackelt – nach der ersten Runde schlüpft der
Drache. Neue Taler fallen einzeln auf den Haufen, eine volle Leiste lässt ihn verschwinden und
mit einem Knall mit einer Zacke mehr wiederkommen. Überraschungen: Flügel (2), Hörner (4), Schal
(6), grösser (8), je Leben etwas Eigenes (10: Blumenkranz, Lokführermütze, Sternenstab),
Funkeln (12), Krone (14). Ein Tipp auf den Schatz sagt, wie viele Taler es sind – in Truhen zu
hundert, Türmen zu zehn und einzelnen. Die Taufe kommt in Etappe 2.

### 0.4 Die sechs Spiele

Ein gemeinsamer Rahmen (`rechnen-spiel.js`): «Los», ein Bild 1000 × 560, darunter eine
Sprechblase mit dem Drachenkopf und die Antwort-Leiste mit grossen Zahlen. Fünf Aufgaben auf
«leicht», sechs darüber. Jede Antwort wird vorgeführt (Zahlen erscheinen über den Wagen, die
Stimme sagt die Rechnung, über fünf auch «fünf rote und drei blaue»). Die Spiele liegen in
`rechnen-spiele-1.js`, jedes mit eigener Seite (`kuppelplus.html` …).

| Spiel | leicht | mittel | schwer |
| --- | --- | --- | --- |
| Kuppel-Plus | bis 5, das Kind zieht die Wagen selbst (oder tippt) | bis 10, Schilder mit den Zahlen, kuppelt von selbst | die Rechnung zuerst, die Züge zur Kontrolle |
| Tunnel-Rechnen | bis 5 | bis 10, Schilder | bis 10, die Hälfte Minus (Wagen rollen wieder heraus) |
| Blitzblick | 1–5 im Fünferwagen | 2–10 im Zehnerwagen | 11–20 in zwei Wagen |
| Einsteigen bitte! | bis 5, alles sichtbar | bis 10, die Fenster beschlagen | nur die Geschichte, das Bild zur Kontrolle |
| Hüpf-Gleis | 1–10, Würfel 1–3, das Kind tippt jeden Hüpfer | 1–20, sagt zuerst, wo es landet | 1–30, zwei Würfel, Weichen ±2 |
| Zahlenhaus | Dachzahl 3–5, alle Stockwerke | 5–7, alle Stockwerke | 6–10, fünf Stockwerke |

Der **Tunnel** hebt sich nach der Antwort (er ist ein Spielzeugtunnel); so sieht das Kind den
Zug, statt dass er am anderen Ende herausfährt. Fino verliert im Hüpf-Gleis gern: Er kommt nie
vor dem Kind ins Ziel.

### 0.5 Stand, Eltern, Schranke, Stimme

- **Rechenstand** `lernapp.rechnen` (Zähler, kein Protokoll): Spiele mit Runden, Sternen und
  Mitwachsen, Aufgaben bis zwanzig (richtig, falsch, schnell, Tage), Fehlerbilder (eins
  daneben, Plus statt Minus, Zahlendreher), Bonus-Taler, die Taufe.
- **Elternbereich**: Karte «Rechenecke» je Kind mit Rechenbericht (Runden, Taler, Drache,
  Einrichtung, Aufgaben, die sitzen oder wackeln, Fehlerbilder mit einem Satz, was hilft, die
  liebsten Spiele, die **Plus-Tafel** 0 + 0 bis 10 + 10) und den Einstellungen Beginn,
  Zahlenraum (bis 5, 10, 20, 100) und Minus. Sie liegen in `lernapp.rechnen.eltern` und
  überleben das Zurücksetzen.
- **Schranke**: `RECHENECKE` in `entitlement.js`, je Spiel eine Runde frei.
- **Stimme**: Jeder Satz – auch die mit wechselnden Zahlen, aufgezählt in
  `scripts/stimme-app/rechenecke.mjs` – ist mit der Google-Stimme Sulafat aufgenommen
  (`app-stimme.js`).
- **Prüfungen**: `scripts/validate-rechnen.mjs` (Katalog, Seiten, Schranke, Vorrat, Stand,
  Drache, Mitwachsen, Fehlerbilder, Bericht, Einstellungen) und `scripts/check-rechenecke.mjs`
  (im Browser: Startbild, Zimmer, Tür, jedes Spiel, eine ganze Runde auf «leicht» mit Ziehen,
  der Drache schlüpft).

---

## 1. Die Idee in drei Sätzen

Neben dem Lesewagen steht auf dem Abstellgleis ein zweiter alter Wagen: der **Rechenwagen**.
Drinnen sind Zahlen etwas zum Anfassen – Wagen ankuppeln heisst Plus, abkuppeln heisst Minus,
Fahrgäste steigen ein und aus, ein Zug verschwindet im Tunnel und kommt mit mehr Wagen
wieder heraus, dazu ein Zählrahmen, ein Kiosk, eine Waage, ein Würfelbecher und ein
Zahlenhaus. Auf dem Kissen in der Mitte sitzt ein kleiner **Rechendrache**, der einen Schatz
sammelt, immer zehn Taler zu einem Turm – und die Rechenecke führt 4- bis 8-Jährige vom
Mengen-Sehen über das Zählen zum Rechnen: erst mit Bild, dann mit verdecktem Bild, dann im
Kopf.

## 2. Der rote Faden: Zahlen sind Züge

Die App hat einen Vorteil, den keine andere Rechen-App hat: Hier fährt ein Zug, und ein Zug
ist eine Zahl. Alles in der Rechenecke folgt deshalb einem einzigen Bild, damit das Kind nicht
in jedem Spiel neu lernen muss, was die Dinge bedeuten.

| Im Zug | In der Mathematik |
| --- | --- |
| ein Zug mit sieben Wagen | die Zahl 7 als Menge |
| die ersten fünf Wagen rot, die nächsten fünf blau | die **Kraft der Fünf**: 7 ist «ein voller Fünfer und zwei» – auf einen Blick, ohne zu zählen |
| ein **Zehnerwagen** mit zwei Fensterreihen zu fünf Fenstern | das **Zehnerfeld**; zwei solche Wagen sind das Zwanzigerfeld |
| Wagen **ankuppeln** | **Plus** (dazukommen, zusammenlegen) |
| Wagen **abkuppeln**, sie rollen aufs Abstellgleis | **Minus** (wegnehmen) |
| Fahrgäste **steigen ein** und **aus** | Rechengeschichten, Plus und Minus im Alltag |
| das **Gleis** mit nummerierten Bahnhöfen | der **Zahlenstrahl** (wie im Zahlengleis); Plus fährt vorwärts, Minus rückwärts |
| ein Zug fährt in den **Tunnel** | die **verdeckte Menge**: vom Sehen zum Vorstellen, vom Zählen zum Rechnen |
| zehn Wagen sind ein voller Zug | **Bündeln**: zehn Einer sind ein Zehner (für später: 34 = drei volle Züge und vier Wagen) |
| der Schatz des Drachen in Türmen zu zehn Talern | **Stellenwert** zum Anschauen, jeden Tag aufs Neue |

Die Fünfer-Farben gelten überall gleich – an den Wagen, an den Kugeln des Zählrahmens, an den
Zacken des Drachen, an den Lichtern der Lichterkette. Wer sie einmal kennt, sieht die 8 als
«fünf und drei», statt acht Mal zu zählen. Genau dieser Schritt vom Abzählen zum Sehen ist
der wichtigste im ganzen ersten Rechnen (Abschnitt 4).

## 3. Leitplanken – was eine Fünfjährige braucht

- **Kurz.** Eine Runde hat fünf Aufgaben (auf «leicht») bis acht (auf «schwer») und dauert
  ein bis drei Minuten. Lieber dreimal am Tag zwei Minuten als einmal zwanzig.
- **Kein Lesen nötig.** Die Stimme sagt jede Aufgabe, Bilder zeigen sie, Ziffern stehen
  zusätzlich da. Wer lesen kann, liest mit.
- **Erst tun, dann sehen, dann denken.** Jedes Rechenspiel hat drei Stufen nach dem
  EIS-Prinzip (enaktiv, ikonisch, symbolisch): Auf «leicht» schiebt das Kind die Wagen selbst
  zusammen, auf «mittel» sieht es sie nur noch, auf «schwer» steht die Rechnung zuerst da, und
  der Zug kommt erst zur Kontrolle.
- **Fehler zeigen, nicht bestrafen.** Jede Antwort wird vorgeführt: Der Zug kuppelt trotzdem
  an, und die Wagen leuchten der Reihe nach auf – «eins, zwei, drei, vier, fünf». Wer
  danebenlag, sieht warum. Kein rotes Kreuz, kein Leben, das verloren geht.
- **Keine Uhr.** Bis «mittel» läuft keine Zeit. Runden auf Zeit gibt es erst ganz oben und
  nur freiwillig, mit eigenem Bestwert (wie in der Leseecke, Etappe 5). Zeitdruck macht
  jungen Kindern Angst vor Mathematik, und die bleibt.
- **Strategien statt Abzählen.** Die App drängt sanft weg vom Zählen in Einerschritten: mit
  den Fünfer-Farben, mit Verdoppeln («3 und 3 sind 6, also sind 3 und 4 eins mehr»), mit dem
  Tunnel, der das Abzählen unmöglich macht. Zählen ist erlaubt und erwünscht – es soll nur
  nicht die einzige Methode bleiben.
- **Plus zuerst.** Weil das der Wunsch ist: Etappe 1 ist fast ganz Plus (Abschnitt 15). Minus
  kommt in Etappe 2, als «das Gegenteil vom Ankuppeln».
- **Wächst mit.** Jedes Spiel wird nach zwei Runden mit drei Sternen eine Stufe schwerer,
  nach zwei schwachen eine leichter – wie in der Leseecke (`lesen-stand.js`, `mitwachsen`).
- **Nichts geht verloren, nichts läuft ab.** Kein Drache hungert, kein Schatz schrumpft,
  kein Tagesziel verfällt.
- **Schweizer Welt.** Franken und Rappen, Glace und Rüebli, ein Billett, ein Perron; kein
  scharfes S. Die Ziffern so, wie das Kind sie in der Schule schreibt (Entscheid 9).

## 4. Der Weg durch die Mathematik

### Was die Forschung über das erste Rechnen sagt

Die Rechenecke baut auf fünf gut belegten Einsichten auf (Quellen am Schluss):

1. **Zahl und Menge verknüpfen ist die Basis.** Kinder lernen zuerst die Zahlwortreihe
   («eins, zwei, drei …» wie ein Lied), dann, dass die letzte Zahl beim Zählen sagt, *wie
   viele* es sind, und zuletzt, dass sich Zahlen zerlegen lassen (7 ist 5 und 2, aber auch 4
   und 3). Wer im Kindergarten diese Verknüpfung sicher hat, rechnet in der Schule besser –
   das ist einer der stärksten Vorhersager überhaupt (Modell der Zahl-Grössen-Verknüpfung,
   Krajewski).
2. **Strukturierte Mengen sieht man, statt sie zu zählen.** Bis vier erfasst ein Kind eine
   Menge auf einen Blick; mit Würfelbildern, Fingerbildern und dem Zehnerfeld auch grössere
   (Kraft der Fünf, Blitzrechnen). Das ist der Weg aus dem zählenden Rechnen.
3. **Ein gerades Brettspiel mit Zahlen wirkt.** Rund eine Stunde mit einem *linearen*
   Würfel-Brettspiel von 1 bis 10 verbesserte bei Vorschulkindern Zählen, Zahlenvergleich und
   Zahlenstrahl-Schätzung, noch Wochen später messbar – mit einem runden Brett nicht (Siegler
   und Ramani). Darum gibt es das **Hüpf-Gleis** (Abschnitt 8, B3).
4. **Zählendes Rechnen soll nicht hängen bleiben.** Kinder, die bis in die zweite Klasse jede
   Aufgabe abzählen, geraten später ins Stocken. Was hilft, sind ableitende Strategien:
   Verdoppeln, Nachbaraufgaben, über die Fünf und die Zehn (Gaidoschik).
5. **Das Gleichheitszeichen heisst «gleich viel».** Viele Kinder lesen «=» als «jetzt kommt
   das Ergebnis» und scheitern dann an `3 + _ = 7`. Die **Waage** zeigt von Anfang an, was
   «gleich» bedeutet.

### Die Rechenleiter

Wie die Leseecke bei Hören, Buchstaben, Wörtern, Sätzen beginnt, beginnt die Rechenecke auf
einer von sechs Sprossen. Die Stufe des Kindes (leicht, mittel, schwer) setzt den Anfang,
Eltern können ihn verschieben (Abschnitt 11).

| Sprosse | Etwa ab | Das Kind kann danach | Typische Spiele |
| --- | --- | --- | --- |
| 1 · Mengen sehen | 4 | bis 5 auf einen Blick erkennen, mehr und weniger unterscheiden, bis 10 zählen | Blitzblick (bis 5), Alle einsteigen!, Wer hat mehr?, Muster-Zug |
| 2 · Zahlen bis 10 | 4½ | Menge und Ziffer verbinden, Nachbarzahlen kennen, ab einer Zahl weiterzählen | Fahrplan-Lücke, Hüpf-Gleis, Zahlen-Paare, Ziffern-Gleis, Countdown |
| 3 · Plus bis 10 | 5 | dazukommen und zusammenlegen, Zahlen zerlegen, Verdoppeln bis 5 + 5 | Kuppel-Plus, Tunnel-Rechnen, Einsteigen bitte!, Zahlenhaus |
| 4 · Plus und Minus bis 10 | 5½ | wegnehmen, ergänzen, verliebte Zahlen (was gibt mit 7 zusammen 10?) | Abkuppeln, Aussteigen bitte!, Zehnerwagen füllen, Waage |
| 5 · Bis 20 | 6 | Zwanzigerfeld, Verdoppeln bis 10 + 10, Zehnerübergang (8 + 5) | Zehner-Sprung, Doppel-Express, Rechenkette |
| 6 · Bis 100 | 7 | Zehner und Einer, Hundertertafel, Einmaleins-Vorbereitung | Zahlenmauer, Hunderter-Fahrplan, Blitzrechnen-Express |

**Lehrplan 21.** Das passt zum Zyklus 1 (Kindergarten bis 2. Klasse) in allen drei
Kompetenzbereichen: *Zahl und Variable* (Sprossen 1–6), *Form und Raum* (Formen-Güterzug,
Tangram-Lok, Spiegel-Signal) und *Grössen, Funktionen, Daten und Zufall* (Kiosk, Bahnhofsuhr,
Waage, Strichliste). Die genauen Kompetenzstufen gehören vor der Umsetzung gegen den
Lehrplan geprüft (Entscheid 12).

## 5. Platz in der App

### Ein eigener Ort, kein sechster Bereich

Aus denselben Gründen wie Leseecke und Bauecke: Ein sechster Wagen machte den Zug kleiner,
der Fahrplan der Reise ginge nicht mehr auf, und mehrere Prüfskripte rechnen fest mit fünf
Bereichen und 25 Spielen (`entitlement.js`, `AREAS`; `scripts/validate-schranke.mjs`).
Rechnen zählt deshalb – wie Lesen – **nicht für den Zug**; der Lohn ist der Rechenwagen
selbst, der Drache und sein Schatz (Entscheid 2).

Der Bereich «Zahl und Buchstabe» im Zug bleibt, wie er ist: Kakuro, Hidoku und das
Zahlengleis sind dort Knobelspiele für Ältere. Die Rechenecke ist der Ort, an dem Rechnen
*gelernt* wird.

### Auf dem Startbild

Heute steht links oben der Lesewagen (`positionLesewagen`, höchstens 16 % der Breite), rechts
oben der Bauplatz (`positionBauplatz`, höchstens 20 %), in der Mitte der Zug und darüber die
Züge der Gruppe (höchstens zwei Drittel der Breite). Neuer Platz ist knapp. Drei Wege:

- **A · Zwei Wagen auf dem Abstellgleis** *(Empfehlung)*. Der Rechenwagen steht gekuppelt
  rechts neben dem Lesewagen auf demselben Gleis, beide etwas kleiner. Reicht die Breite
  nicht (Handy quer, 844 × 390), rückt er auf ein **zweites Abstellgleis** darüber – kleiner,
  wie weiter hinten. Dazu bekommt **jedes Zimmer eine Tür in den Nachbarwagen**: vom
  Lesewagen in den Rechenwagen und zurück. So ist die Rechenecke auch dann erreichbar, wenn
  auf einem sehr kleinen Bildschirm nur ein Wagen Platz hat. Die Mindestgrösse von 70 Pixeln
  gilt für jeden Wagen; ein Browser-Test prüft, dass keiner einen Knopf zudeckt.
- **B · Ein Doppelstockwagen.** Der Lesewagen bekommt ein oberes Deck: unten wird gelesen,
  oben gerechnet – wie die Doppelstöcker der SBB. Braucht keine neue Breite, aber jede Hälfte
  ist auf dem Handy nur noch knapp 45 Pixel hoch, und der Lesewagen, den die Kinder kennen,
  sähe anders aus.
- **C · Nur über die Tür im Lesewagen.** Am einfachsten, aber ein Kind, das nur rechnen will,
  findet den Weg nicht.

Von aussen erkennt man den Rechenwagen an seiner Farbe (sonnengelb mit blauen Fenstern), an
einer **Zahlenreihe 1 bis 10 über den Fenstern** und an der Lichterkette mit fünf roten und
fünf blauen Lichtern, sobald sie eingerichtet ist. Ist der Drache gewachsen, schaut er aus
dem Fenster.

### Die Ansicht `rechnen`

Eine Ansicht der Bühne in eigener Datei (`train-rechenecke.js`), so wie `train-leseecke.js`
das Lesezimmer einhängt (`mount({ host })`): Landschaft, Zurück-Knopf, Lautsprecher, Feiern.
`index.html?rechnen=1` führt direkt hinein. Beim Hereinkommen hüpft reihum alles, was sich
antippen lässt, zweimal – wie im Lesewagen (`REIHUM`).

### Die Spiele

Eigene Seiten auf `game-shell.js`, mit einem gemeinsamen Teil `rechnen-spiel.js` (Bühne,
«Los», Antwort-Leiste, Ergebnis mit Sternen) wie `lesen-spiel.js`. Der Pfeil zurück führt in
den Rechenwagen, das Haus auf das Startbild. Stehen hinter einem Ding mehrere Spiele, öffnet
es eine Auswahl mit Bildern.

### Verbindungen

- **Leseecke:** die Tür zwischen den Wagen; die **Rechen-Postkarten** (J6) sind Lesen und
  Rechnen zugleich; im Bücherregal könnten später Zählbücher stehen («Bruno zählt Sterne»
  gibt es schon).
- **Bauecke:** Das **Zahlenhaus** und die **Zahlenmauer** sehen aus wie Häuser und Ziegel der
  Bauecke. Der Rätsel-Knopf der Bauecke könnte für die Jüngsten auch Rechenspiele ziehen –
  dann bringt Rechnen Ziegel (Entscheid 3).
- **Reise:** Ist eine Karte fertig, kann ihr Fahrgast eine Rechen-Postkarte schicken
  («Ich habe am See 4 Enten gesehen und dann noch 3. Wie viele waren es?»).
- **Zug:** Ist der Drache in seinem ersten Leben ausgewachsen, **fliegt er neben der Lok
  mit** – wie der Lesewurm, der auf der Lok mitfährt.

### Eltern, Gruppe, Schranke

- **Elternbereich:** eine Karte «Rechenecke» je Kind mit Einstellungen und Rechenbericht
  (Abschnitt 11).
- **Gruppe:** Den Rechenwagen der Geschwister kann man ansehen (Drache, Schatz), nicht
  ändern – wie ihre Züge.
- **Schranke:** eine eigene Tabelle `RECHENECKE` in `entitlement.js` wie `LESEECKE`, je
  Spiel eine Runde frei (`GRATIS_RUNDEN`). Den Drachen taufen ist immer frei. «Ganze App
  gratis» öffnet alles.
- **Firestore:** Der Rechenstand ist ein neuer Kasten `lernapp.rechnen` im `gameState`, wie
  `lernapp.lesen`. `firestore.rules` lässt im Konto nur `stats`, `gameState`,
  `progressReset` und `updatedAt` zu und schaut nicht in den `gameState` hinein – **eine
  neue Regel braucht es nicht**.

## 6. Das Zimmer – der Rechenwagen von innen

Jedes Ding ist ein Weg zu Spielen; alles andere ist Einrichtung und kommt erst mit dem
Rechnen. Die Wand ist hellgelb, der Boden aus Holz, durch die Fenster sieht man die gewählte
Landschaft.

| Ding | Wo | Dahinter | Etappe |
| --- | --- | --- | --- |
| **Rechendrache** auf dem Kissen, mit Schatz und Missionskarte | Mitte | die Hauptmission: er schlägt vor, was dran ist | 1 |
| **Rangiergleis** mit zwei Spielzeugzügen | quer über den Boden | Kuppel-Plus, Alle einsteigen!, Abkuppeln, Wagen ordnen, Wie lang ist die Schlange? | 1 |
| **Tunnel** am Ende des Rangiergleises | rechts am Boden | Tunnel-Rechnen, Wer versteckt sich im Tunnel? | 1 |
| **Fenster** | links oben | Blitzblick, Zähl-Fenster, Einsteigen bitte! (der Zug hält an einem Perron) | 1 |
| **Zahlenhaus** (ein Puppenhaus mit Zahl auf dem Dach) | rechte Wand | Zahlenhaus, Zahlenmauer | 1 |
| **Würfelbecher** und grosse Schaumstoffwürfel | Boden links | Hüpf-Gleis, Würfel-Plus, Schüttelbecher | 1 |
| **Fahrplan-Tafel** | Wand | Fahrplan-Lücke, Countdown, Hüpf-Lok, Hunderter-Fahrplan | 2 |
| **Zählrahmen** mit 2 × 10 Kugeln in Fünfer-Farben | links | Zahlen-Paare, Finger-Zahlen, Zehnerwagen füllen, Zehner-Sprung | 2 |
| **Kiosk** mit Kasse und Münzen | links hinten | Kiosk (einkaufen, später Rückgeld) | 2 |
| **Perlenkette** unter dem Fenster | Wand | Muster-Zug, Stolperwagen | 2 |
| **Waage** | Tischchen rechts | Waage, Wer hat mehr? | 3 |
| **Spiegel** | Wand | Doppel-Express, Spiegel-Signal | 3 |
| **Formenkiste** | Boden rechts | Formen-Güterzug, Tangram-Lok | 3 |
| **Bahnhofsuhr** | über der Tür | Bahnhofsuhr | 4 |
| **Tür in den Lesewagen** | Seitenwand | führt in die Leseecke | 1 |

### Die Einrichtung in 15 Schritten – und alles lässt sich zählen

Wie der Lesewagen wird der Rechenwagen mit jeder fertigen Runde gemütlicher (nach 1, 2, 4, 6,
9, 12, 15, 19, 23, 28, 33, 39, 45, 52 und 60 Runden). Der Unterschied: **Jedes neue Ding ist
selbst eine Zahl.** Das fünfte Ding ist ein Blumentopf mit fünf Blüten, das achte ein Poster
mit acht Marienkäfer-Punkten, das zehnte die Lichterkette mit fünf roten und fünf blauen
Lichtern. So wird das Zimmer zu einem Zählbild, das mitwächst – und das «Zähl-Fenster» (A4)
kann später fragen: «Wie viele Blüten hat die Blume im Zimmer?»

Vorschlag: Zahlenwimpel 1–10, Teppich mit Hüpfkästchen (Himmel und Hölle), ein Kissen mit
Punkten, Kuckucksuhr, Blumentopf (5 Blüten), Bilderrahmen mit 6 Fischen, Regal mit 7 Büchern,
Marienkäfer-Poster (8 Punkte), Hängepflanze (9 Blätter), Lichterkette (5 + 5), Mobile mit
Sternen, eine Schatzkarte an der Wand, Kegel (zum Umwerfen und Zählen), eine schlafende Katze
mit gestreiftem Schwanz (Streifen zählen) und zuletzt ein Sternenhimmel an der Decke
(Abschnitt 9).

## 7. Die Hauptfigur: der Rechendrache und sein Schatz

Der Lesewurm sammelt Buchstaben; der Rechendrache sammelt **Taler**. Drachen horten Schätze –
das versteht jedes Kind sofort –, und ein Schatz ist das natürlichste Zählding der Welt.

- **Der Schatz ist geordnet.** Immer zehn Taler werden zu einem Turm; bei hundert kommt eine
  Truhe. Neben dem Drachen liegen also zum Beispiel zwei Türme und drei einzelne Taler, und
  die Stimme sagt auf Tipp: «Dreiundzwanzig Taler – zwei Türme zu zehn und drei.» Stellenwert,
  jeden Tag angeschaut, ohne dass es je eine Lektion war.
- **Taler kommen aus Runden.** Jede fertige Runde bringt so viele Taler wie Sterne (1 bis 3),
  die Runde, die der Drache vorgeschlagen hat, doppelt (Entscheid 5). Neue Taler fliegen beim
  nächsten Besuch einzeln auf den Haufen, und der Haufen zählt laut mit.
- **Die Zacken sind ein Zähler.** Der Drache wächst in Stufen, und mit jeder Stufe bekommt er
  einen Zacken auf dem Rücken – die ersten fünf rot, die nächsten fünf blau, dann fünf gelb.
  Ein Drache mit 13 Zacken trägt «zehn und drei» auf dem Rücken.
- **Drei Leben zu je 15 Stufen** wie beim Lesewurm: zuerst das **Drachenbaby** (vom Ei, das
  wackelt und schlüpft, bis zu den ersten Flügen), dann der **Lokdrache** (er schnaubt Dampf
  wie eine Lok und zieht seinen Schatz in kleinen Wagen) und zuletzt der **Sternendrache**
  (seine Schuppen leuchten in Sternbildern – Punktmuster wie auf einem Würfel). Ein fertiges
  Leben zieht auf das Regal; nach dem dritten ist alles geschafft.
- **Die Missionskarte** über dem Drachen zeigt wie beim Lesewurm, was er vorschlägt (Bild,
  Name, grüner Knopf), und eine Leiste bis zur nächsten Überraschung.
- **Den Namen** gibt ihm das Kind (wie dem Lesewurm über `meinname.html?wurm=1`). Bis dahin
  heisst er in den Entwürfen «Zacki».

**Andere Möglichkeiten** (Entscheid 4): **Flitz, das Eichhörnchen** aus den Büchern, das Nüsse
in Säckchen zu zehn sammelt (eine bekannte Figur, aber kein eigener Charakter für den Ort);
ein **Marienkäfer**, dessen Punkte Würfelbilder sind (schön für Mengen, aber wenig Wachstum);
eine **Krake** mit acht Armen (Zählen, aber acht ist eine schlechte Grundzahl).

## 8. Die Spiele – Ideensammlung

Über 40 Ideen, nach Themen geordnet. ★ heisst: vorgeschlagen für Etappe 1, den Plus-Start
für die Fünfjährige. «ab» ist ein Richtwert; jedes Spiel hat drei Stufen und wächst mit.

### A · Mengen sehen und zählen

| Spiel | Ort | Was das Kind tut | Übt | ab |
| --- | --- | --- | --- | --- |
| **Blitzblick** ★ | Fenster | Ein Zehnerwagen fährt am Fenster vorbei, Tiere schauen aus den Fenstern – nur kurz. Wie viele waren es? Danach hält der Wagen und zeigt sie: «Sieben – fünf und zwei.» | Mengen auf einen Blick, Kraft der Fünf | 4 |
| **Alle einsteigen!** | Rangiergleis | Tiere warten am Perron; jedes Antippen lässt eines einsteigen, die Stimme zählt mit. Dann: «Wie viele sind eingestiegen?» Die letzte Zahl sagt es. | Eins-zu-eins zählen, Anzahl | 4 |
| **Wer hat mehr?** | Waage | Zwei Güterwagen mit Äpfeln, Kisten, Fischen: Welcher hat mehr? Auch «gleich viel». Später mit Ziffern statt Dingen. | Mengen vergleichen, mehr / weniger / gleich | 4 |
| **Zähl-Fenster** | Fenster | Die Landschaft zieht vorbei – «Wie viele Kühe hast du gesehen?», «Tippe alle Häuser an». Später: Dinge aus dem eigenen Zimmer zählen. | Zählen im Wimmelbild | 4 |
| **Zahlen-Paare** | Zählrahmen | Karten mit derselben Zahl in verschiedenen Kleidern finden: Würfelbild, Finger, Zehnerwagen, Ziffer, gehörtes Zahlwort. | Darstellungen verbinden – der Kern des Zahlbegriffs | 4½ |
| **Finger-Zahlen** | Zählrahmen | Zwei gemalte Hände: Das Kind tippt Finger hoch, bis die Zahl stimmt. 5 ist eine ganze Hand. Wird auch zur Antwort-Eingabe in anderen Spielen. | Fingerbilder, Fünferstruktur | 4½ |
| **Ziffern-Gleis** | Fahrplan-Tafel | Die Ziffer liegt als Gleis da, die Lok fährt sie in Schreibrichtung nach – dieselbe Technik wie das Buchstabengleis (`GLEISE`). Danach kommen so viele Wagen. | Ziffern schreiben, Ziffer und Menge | 4½ |

### B · Die Zahlenreihe

| Spiel | Ort | Was das Kind tut | Übt | ab |
| --- | --- | --- | --- | --- |
| **Fahrplan-Lücke** | Fahrplan-Tafel | Die Bahnhöfe heissen 1, 2, _, 4, 5 – ein Schild fehlt. Später rückwärts, ab 7 weiter, und «Welcher Bahnhof kommt vor der 6?» | Zahlenreihe, Vorgänger und Nachfolger | 4½ |
| **Countdown!** | Fahrplan-Tafel | Der Zug fährt erst ab, wenn das Kind rückwärts zählt: die Wagen 10 … 1 der Reihe nach antippen – «drei, zwei, eins, los!». Später in Zweierschritten. | Rückwärtszählen | 4½ |
| **Hüpf-Gleis** ★ | Würfelbecher | Ein Brettspiel als gerades Gleis von 1 bis 20 (später 30): würfeln, so viele Bahnhöfe weiterhüpfen, die Zahl laut sagen. Gegen Fino oder ein Geschwister am selben Gerät. Weichen schicken ein Stück vor oder zurück. | Weiterzählen, Zahlenstrahl, Würfelbilder | 4½ |
| **Wagen ordnen** | Rangiergleis | Nummerierte Wagen stehen durcheinander; das Kind kuppelt sie der Reihe nach an die Lok. Später mit Lücken (3, 7, 12). | Zahlen ordnen | 5 |
| **Wo hält der Zug?** | Fahrplan-Tafel | Das Zahlengleis aus dem Zug, hier mit einer leichteren Stufe 0–10 (Entscheid 10). | Zahlenstrahl schätzen | 5 |

### C · Zerlegen – die Brücke zum Rechnen

| Spiel | Ort | Was das Kind tut | Übt | ab |
| --- | --- | --- | --- | --- |
| **Zahlenhaus** ★ | Zahlenhaus | Auf dem Dach steht 5. Jedes Stockwerk hat zwei Zimmer; links wohnen 2 Tiere – wie viele ziehen rechts ein? Stockwerk für Stockwerk, bis das Haus voll ist; am Schluss sieht man die Treppe 0 + 5, 1 + 4, 2 + 3 … | Zahlen zerlegen, Teil und Ganzes | 5 |
| **Wer versteckt sich im Tunnel?** | Tunnel | Ein Zug mit 7 Wagen steht halb im Tunnel, 3 sieht man noch. Wie viele sind drin? Dann fährt er heraus. | Ergänzen, verdeckte Mengen | 5 |
| **Schüttelbecher** | Würfelbecher | 6 Kugeln im Becher, schütteln, sie fallen in zwei Schalen: links 2, wie viele rechts? Wer alle Möglichkeiten findet, bekommt den Goldbecher. | alle Zerlegungen einer Zahl | 5 |
| **Zehnerwagen füllen** | Zählrahmen | Im Zehnerwagen sitzen 6 Fahrgäste. Wie viele passen noch hinein? | verliebte Zahlen (Partner der 10) | 5½ |

### D · Plus

| Spiel | Ort | Was das Kind tut | Übt | ab |
| --- | --- | --- | --- | --- |
| **Kuppel-Plus** ★ | Rangiergleis | Zwei Züge stehen auf dem Gleis, 3 Wagen und 2 Wagen. Das Kind schiebt sie zusammen – klack! – und sagt, wie viele es jetzt sind. | Plus als Zusammenlegen | 5 |
| **Tunnel-Rechnen** ★ | Tunnel | Ein Zug mit 3 Wagen fährt in den Tunnel, 2 Wagen rollen hinterher und kuppeln drinnen an. Wie viele sind jetzt drin? Erst raten, dann hebt sich der Tunnel. | Plus im Kopf, mit Spannung | 5 |
| **Einsteigen bitte!** ★ | Fenster (Perron) | Rechengeschichten: «Im Zug sitzen 4 Tiere. Am Bahnhof steigen 2 ein.» Wie viele fahren weiter? Mit Tieren der App, mit Stimme. | Plus als Dazukommen, Sachsituationen | 5 |
| **Hüpf-Lok** | Fahrplan-Tafel | Die Lok steht bei 4, auf dem Billett steht «+ 3». Das Kind tippt drei Hüpfer, Bogen für Bogen, und landet bei 7. | Weiterzählen statt von vorn zählen, Rechenstrich | 5 |
| **Würfel-Plus** | Würfelbecher | Zwei Würfel, die Augen zusammen. Wer Würfelbilder kennt, zählt nicht mehr. | Plus mit strukturierten Mengen | 5 |
| **Drachenfutter** | Drache | Der Drache will genau 7 Beeren, 4 hat er schon. Wie viele gibst du ihm noch? | Ergänzen, Plus mit Lücke | 5½ |
| **Doppel-Express** | Spiegel | Ein Zug fährt vor den Spiegel – 3 Wagen und 3 Wagen im Spiegel sind 6. Später «Fast-Verdoppeln»: 3 + 4 ist 3 + 3 und eins mehr. | Verdoppeln als Ankeraufgaben | 5½ |

### E · Minus

| Spiel | Ort | Was das Kind tut | Übt | ab |
| --- | --- | --- | --- | --- |
| **Abkuppeln** | Rangiergleis | 6 Wagen; das Kind tippt 2 ab, sie rollen aufs Abstellgleis. Wie viele bleiben an der Lok? | Minus als Wegnehmen | 5½ |
| **Aussteigen bitte!** | Fenster (Perron) | Wie «Einsteigen bitte!», nur steigen Tiere aus – und später beides gemischt. | Minus in Geschichten | 5½ |
| **Ballon-Wagen** | Rangiergleis | An einem Wagen hängen 8 Ballone. «Lass 3 platzen!» – peng, peng, peng. Wie viele fliegen noch? | Wegnehmen, mit Freude am Knall | 5 |
| **Rückwärts-Hüpfer** | Fahrplan-Tafel | Wie die Hüpf-Lok, nur rückwärts. | Minus auf dem Zahlenstrahl | 5½ |
| **Plus oder Minus?** | Fenster (Perron) | Eine Geschichte wird erzählt, das Kind wählt nur: kommen welche dazu oder gehen welche weg? | Rechenart verstehen, bevor gerechnet wird | 5½ |

### F · Muster und Reihen

| Spiel | Ort | Was das Kind tut | Übt | ab |
| --- | --- | --- | --- | --- |
| **Muster-Zug** | Perlenkette | Rot, blau, rot, blau, … – welcher Wagen kommt? Später AAB, ABC, wachsende Muster (1, 2, 3 Wagen) und Zahlenfolgen (2, 4, 6, _). | Muster erkennen und fortsetzen | 4 |
| **Stolperwagen** | Perlenkette | Ein Wagen passt nicht ins Muster – abkuppeln! (Wie die Stolperwörter.) | Regel prüfen | 4½ |
| **Wachsende Türme** | Zahlenhaus | Türme aus 1, 3, 5 Ziegeln – wie hoch wird der nächste? | Folgen, ungerade Zahlen | 6½ |

### G · Form und Raum

| Spiel | Ort | Was das Kind tut | Übt | ab |
| --- | --- | --- | --- | --- |
| **Formen-Güterzug** | Formenkiste | Ladung in die passenden Wagen: Kreise, Dreiecke, Quadrate, Rechtecke. Später Körper – was rollt, was steht? | Formen benennen und sortieren | 4 |
| **Tangram-Lok** | Formenkiste | Aus sieben Teilen eine Lok, ein Tier, ein Haus legen; zuerst mit Umriss jedes Teils, später nur mit dem Umriss des Ganzen. | Formen zusammensetzen, drehen | 5 |
| **Spiegel-Signal** | Spiegel | Die andere Hälfte des Schmetterlings, des Signals, des Hauses ergänzen. | Symmetrie | 5½ |

(Der Raumdetektiv im Bereich Problemlösen bleibt, wo er ist.)

### H · Grössen

| Spiel | Ort | Was das Kind tut | Übt | ab |
| --- | --- | --- | --- | --- |
| **Kiosk** | Kiosk | Ein Tier möchte eine Glace für 3 Franken und ein Rüebli für 2 – das Kind zahlt mit Münzen. Zuerst nur Einfränkler, dann 2 Fr. und 5 Fr. (der Fünfliber), auf «schwer» mit Rückgeld. | Plus und Minus mit Geld, Schweizer Münzen | 5½ |
| **Waage** | Waage | Links liegen 5 Kugeln, rechts 2. Wie viele müssen noch dazu, damit sie gerade steht? Später schwerer / leichter mit Tieren (Maus gegen Bär). | Gleichheitszeichen als «gleich viel», Ergänzen | 5½ |
| **Wie lang ist die Schlange?** | Rangiergleis | Eine Schlange, ein Velo, ein Krokodil – wie viele Wagen lang? Dann nach Länge ordnen. | Messen mit einer Einheit | 5 |
| **Bahnhofsuhr** | Bahnhofsuhr | «Der Zug fährt um 3 Uhr – stell die Uhr!» Volle, dann halbe Stunden; der Tagesablauf von Pippa in die richtige Reihenfolge. | Uhrzeit, Zeitabläufe | 6 |

### I · Daten und Zufall

| Spiel | Ort | Was das Kind tut | Übt | ab |
| --- | --- | --- | --- | --- |
| **Strichliste am Bahnübergang** | Fenster | Autos fahren vorbei; für jedes rote, blaue, gelbe macht das Kind einen Strich – der fünfte quer. Dann wachsen Säulen: Welche Farbe kam am meisten? | Strichliste, Fünferbündel, erstes Diagramm | 5½ |
| **Was kommt öfter?** | Würfelbecher | Ein Glücksrad mit drei roten und einem blauen Feld – was kommt öfter? Ausprobieren und Striche machen. | Zufall erleben | 6½ |

### J · Für die Grösseren (6 bis 8)

| Spiel | Ort | Was das Kind tut | Übt | ab |
| --- | --- | --- | --- | --- |
| **Zehner-Sprung** | Zählrahmen | 8 + 5: Zuerst den Zehnerwagen voll machen (8 + 2), dann kommen 3 in den nächsten. Der Zug zeigt jeden Schritt. | Zehnerübergang | 6 |
| **Zahlenmauer** | Zahlenhaus | Zwei Ziegel unten ergeben zusammen den Ziegel darüber – eine Mauer wie in der Bauecke. Lücken füllen, auch von oben nach unten. | Plus und Minus verknüpft, Knobeln | 6 |
| **Rechenkette** | Fahrplan-Tafel | Ein Zug fährt eine Strecke: Start 3, + 2, − 1, + 4 – wo kommt er an? | mehrere Schritte im Kopf | 6½ |
| **Gerade oder ungerade?** | Rangiergleis | Fahrgäste setzen sich zu zweit – sitzt einer allein? | Paare, gerade und ungerade | 6 |
| **Hunderter-Fahrplan** | Fahrplan-Tafel | Die Hundertertafel als Fahrplan: fehlende Zahlen, Muster (alle mit 5 hinten), ein Zug fährt Zehnersprünge. | Zahlenraum bis 100 | 7 |
| **Blitzrechnen-Express** | Fahrplan-Tafel | Nur auf «schwer» und freiwillig: 45 Sekunden, so viele Aufgaben wie möglich, eigener Bestwert. | Automatisieren | 7 |
| **Rechen-Postkarten** | Briefkasten | Die Fahrgäste der Reise schreiben kurze Rechengeschichten zum Lesen. | Sachaufgaben lesen und lösen | 7 |

### Die sechs Spiele für Etappe 1 genauer

**Kuppel-Plus.** Auf dem Gleis stehen eine Lok mit drei Wagen und zwei lose Wagen. Die Stimme:
«Drei Wagen und zwei Wagen. Schieb sie zusammen!» Das Kind zieht die zwei Wagen an die drei –
klack –, und die Stimme fragt: «Wie viele Wagen sind es jetzt?» Unten steht die Antwort-Leiste
mit den Zahlen. Nach der Antwort leuchten die Wagen der Reihe nach auf, und die Stimme zählt
mit. *Leicht:* bis 5, das Kind kuppelt selbst. *Mittel:* bis 10, auf jedem Zug steht seine
Zahl, gekuppelt wird von selbst. *Schwer:* Die Rechnung «4 + 3» steht da, die Züge kommen
erst nach der Antwort, zur Kontrolle. Fünf bis acht Aufgaben, Sterne nach Treffern.

**Tunnel-Rechnen.** Ein Zug mit drei Wagen fährt in den Tunnel und verschwindet. Dann rollen
zwei Wagen hinterher, und man hört drinnen «klack». «Wie viele Wagen sind jetzt im
Tunnel?» Das Kind wählt, dann hebt sich der Tunnel – er ist ein Spielzeugtunnel auf dem
Rangiergleis –, und da steht der Zug mit fünf Wagen, die der Reihe nach aufleuchten. Der
Moment, in dem der Tunnel hochgeht, ist das Spannendste im ganzen Wagen; darauf ist das Spiel
gebaut (in der App kann der Zug stattdessen am anderen Ende herausfahren). *Leicht:* bis 5. *Mittel:* bis 10. *Schwer:* auch Minus – im Tunnel bleiben Wagen
stehen und rollen hinten wieder heraus aufs Abstellgleis.

**Blitzblick.** Ein Zehnerwagen fährt am Fenster vorbei; in seinen zehn Fenstern schauen
Tiere heraus, aber nur für einen Augenblick (zuerst zwei Sekunden, je sicherer, desto
kürzer). «Wie viele hast du gesehen?» Danach kommt der Wagen zurück und zeigt sie: «Sieben –
fünf oben und zwei unten.» *Leicht:* 1 bis 5 in einem Fünferwagen mit einer Fensterreihe,
später auch als Würfelbild. *Mittel:* 1 bis 10, immer von
links oben aufgefüllt, so dass die Fünf hilft. *Schwer:* 11 bis 20 in zwei Wagen.

**Einsteigen bitte!** Der Zug hält am Perron, im Fenster sieht man, wer drin sitzt. Am Perron
warten Tiere. Die Stimme erzählt: «Im Zug sitzen vier Tiere. Hoppel und Mia steigen ein.»
Die zwei steigen ein. «Wie viele fahren jetzt mit?» *Leicht:* Man sieht alle. *Mittel:* Die
Fenster sind beschlagen, man sieht nur die Einsteigenden. *Schwer:* nur die Geschichte, kein
Bild – das Bild kommt zur Kontrolle.

**Hüpf-Gleis.** Das Brettspiel als Gleis von 1 bis 20. Das Kind und Fino (oder das
Geschwister) würfeln abwechselnd, die Lok hüpft Bahnhof für Bahnhof, das Kind tippt jeden
Hüpfer selbst und sagt die Zahl, auf der es landet. Auf «mittel» zwei Würfel, auf «schwer»
bis 30 und Weichen («fahr 2 zurück»). Wer zuerst am Ziel ist, gewinnt – und Fino verliert
gern. Eine Partie dauert drei Minuten.

**Zahlenhaus.** Ein Haus wie in der Bauecke, auf dem Dach eine Zahl (zuerst 3, 4, 5, später
bis 10). In jedem Stockwerk zwei Zimmer. Im linken wohnen schon Tiere, ins rechte zieht das
Kind so viele ein, dass es zusammen die Dachzahl ist. Ist das Haus voll, leuchten alle Fenster,
und man sieht die Treppe: 0 und 5, 1 und 4, 2 und 3 … Auf «schwer» darf das Kind die Stockwerke
selbst erfinden, und das Haus zählt nur verschiedene.

## 9. Was es packend macht – ohne Druck

- **Der Tunnel-Moment.** Ein Bild verschwindet und kommt wieder – Kinder lieben das, und es ist
  zugleich der wichtigste Schritt vom Zählen zum Vorstellen. Viele Spiele haben einen solchen
  Moment: der Tunnel, der vorbeifahrende Zehnerwagen, der Becher, der sich hebt.
- **Antworten werden vorgeführt.** Nach jeder Antwort passiert etwas: Wagen leuchten auf,
  Ballone platzen, Tiere winken. Richtig gibt eine kurze Melodie, falsch eine freundliche
  Vorführung – nie ein Buzzer.
- **Der Schatz wächst sichtbar.** Taler fliegen einzeln auf den Haufen, und ein neuer Turm ist
  ein kleines Fest.
- **Überraschungen in der Leiste.** Wie beim Lesewurm: etwa jede zweite Stufe etwas Neues am
  Drachen (Flügel, Krönchen, ein Schal, eine Dampfwolke).
- **Sternenhimmel der Plus-Aufgaben.** Im Fenster über dem Drachen wird es nachts: Jede
  Plus-Aufgabe, die das Kind sicher und schnell weiss, wird ein Stern. Zusammen ergeben sie
  Sternbilder – alle Aufgaben mit + 1, alle Verdoppelungen, alle verliebten Zahlen. Für
  Eltern ist das dieselbe Tafel als Raster (Abschnitt 11).
- **Sammelalbum «Zahlen in der Welt».** Für jede Zahl von 1 bis 20 ein gemaltes Bild mit so
  vielen Dingen aus der Welt der App: 1 Sonne, 2 Augen, 3 Räder am Dreirad, 4 Beine am Tisch,
  5 Finger, 6 Beine am Käfer, 8 Arme der Krake, 10 Zehen … Ein Bild kommt dazu, wenn das Kind
  die Zahl sicher kann.
- **Zu zweit.** Hüpf-Gleis und Kuppel-Plus lassen sich am selben Gerät zu zweit spielen, jedes
  Kind auf seiner Stufe: Die Fünfjährige rechnet bis 5, der grössere Bruder bis 20, und beide
  spielen dasselbe Spiel.
- **Aufträge für draussen.** Nach einer Weile im Wagen gähnt der Drache und gibt einen Auftrag
  für die echte Welt: «Zähl beim Znacht, wie viele Gabeln auf dem Tisch liegen!» Beim
  nächsten Besuch fragt er nach und gibt dafür einen Taler. Kurz am Bildschirm, lang im Kopf.
  Ab wann er gähnt, stellen Eltern ein (Abschnitt 11).
- **Das Rätsel des Tages.** Der Drache hat jeden Tag eine besondere Aufgabe mit
  Goldtaler – immer machbar, nie verpasst: Wer einen Tag auslässt, bekommt am nächsten
  dasselbe Rätsel.

Und bewusst **nicht**: keine Energie, keine Wartezeiten, keine zweite Währung zum Kaufen, keine
Ranglisten mit Fremden, kein Streak, der reisst, keine Werbung. Die App ist ein Einmalkauf, und
so bleibt es.

## 10. Mitwachsen und Rückmeldung

- **Mitwachsen** wie in der Leseecke: je Spiel `schritt` und `serie` im Kasten; zwei Runden
  mit drei Sternen machen es eine Stufe schwerer, zwei schwache eine leichter, nie über
  «schwer» oder unter «leicht».
- **Sicher heisst schnell und richtig.** Je Aufgabe (zum Beispiel `3+2`) zählt der Kasten
  Treffer und Fehler und merkt sich, ob die Antwort schnell kam. Eine Aufgabe **sitzt** nach
  drei schnellen Treffern an zwei verschiedenen Tagen (wie ein Laut in der Leseecke). Zählt
  ein Kind noch, braucht es länger – das ist erlaubt und kein Fehler, aber noch kein Stern am
  Himmel.
- **Fehlerbilder erkennen, ohne Protokoll.** Nur Zähler, kein Verlauf einzelner Antworten:
  - *Genau eins daneben* beim Weiterzählen (3 + 2 = 4): Das Kind zählt die Startzahl mit.
    Ein häufiger und gut behebbarer Fehler – der Bericht sagt den Eltern, wie man ihn zeigt.
  - *Plus statt Minus* (6 − 2 = 8): Rechenart verwechselt – dann schlägt der Drache «Plus
    oder Minus?» vor.
  - *Zahlendreher* (12 und 21) und *Spiegelziffern* (6 und 9, 2 und 5): als Paare gezählt wie
    die Verwechslungen in der Leseecke (`verwechselt`).
- **Was als Nächstes dran ist,** wählt der Drache: je Sprosse ein paar Spiele, dran ist das,
  was am längsten nicht gespielt wurde – und hin und wieder eines, in dem Aufgaben wackeln.

## 11. Eltern: die Karte «Rechenecke»

Je Kind im Elternbereich (`firebase.js`, neben der Karte «Leseecke»):

- **Wo beginnt die Rechenecke?** Nach Alter, oder eine der sechs Sprossen (Abschnitt 4).
- **Zahlenraum:** bis 5, bis 10, bis 20, bis 100 – ein Deckel, über den nichts hinausgeht.
- **Was dazugehört:** Minus, Geld, Uhr, Formen – je an oder aus. So lässt sich bei einer
  Fünfjährigen alles auf Plus und Zählen beschränken.
- **Was die Schule gerade macht:** wie die Buchstaben der Schule in der Leseecke, hier etwa
  «Zehnerübergang» oder «Verdoppeln» – der Drache schlägt dann diese Spiele öfter vor.
- **Ziffern:** in der Form der Schweizer Basisschrift oder in Druckschrift (Entscheid 9).
- **Der Drache gähnt nach:** 10, 15, 20 Minuten oder nie (Abschnitt 9).
- **Rechenbericht** (nur aus den Zählern): Runden, Taler, wo der Drache steht; welche
  Sprosse; die **Plus-Tafel** als Raster 0 + 0 bis 10 + 10 – grün, was sitzt, gelb, was noch
  gezählt wird, grau, was noch nicht vorkam; häufige Fehlerbilder mit einem Satz, was hilft;
  die liebsten Spiele; was von selbst schwerer oder leichter wurde.

Die Einstellung liegt wie bei der Leseecke als eigener Kasten (`lernapp.rechnen.eltern`) mit
Zeitmarke im `gameState`; das Gerät des Kindes nimmt die neuere Fassung und schreibt sie nie
selbst, und sie überlebt das Zurücksetzen.

## 12. Stimme, Bild und Ton

- **Zahlen als Aufnahme.** Die App spricht mit der Google-Stimme Sulafat (`app-stimme.js`).
  Rechnen braucht viele Sätze mit wechselnden Zahlen («Drei Wagen und zwei Wagen»). Statt
  jeden Satz aufzunehmen, kommen die Zahlwörter 0 bis 100 und feste Satzteile («Wagen und»,
  «Wie viele sind es jetzt?», «steigen ein») als einzelne Aufnahmen und werden Stück für
  Stück abgespielt – so wie der Lautsprecher im Lesewagen Vorschlag und Hilfe zusammensetzt
  (`aufnahmeFolge`). Rund 150 kurze Aufnahmen; fehlt eine, spricht die Gerätestimme.
- **Zahlwörter richtig.** «Einundzwanzig», nicht «zwanzig eins»; «eins» beim Zählen, «ein
  Wagen» im Satz. Die Satzbausteine brauchen dafür eine kleine Grammatik (Entscheid 11).
- **Bild.** Gezeichnet wie der Lesewagen (SVG, eine Datei `rechnen-art.js`), die Tiere aus
  `train-art.js` (`buildPassenger`). Für das Sammelalbum und die Rechen-Postkarten gemalte
  Bilder wie bei den Büchern (WebP, mit Rückfall auf die Zeichnung).
- **Schrift.** Andika aus `leseschrift.css` auch hier – ihre Ziffern sind klar (1 und 7
  verschieden) und passen zur Leseecke.
- **Ton.** Ein Klacken beim Kuppeln, ein Pfiff bei der Abfahrt, ein heller Klang je Taler,
  der auf den Haufen fällt. Musik nur, wenn sie in der App an ist.
- **Bewegung.** Wie überall: Ohne Bewegung (Einstellung des Geräts) springen die Bilder
  gleich an ihren Platz, und nichts blinkt.

## 13. Dateien und Technik (Vorschlag)

| Datei | Was |
| --- | --- |
| `rechnen-inhalte.js` | Zahlenräume je Sprosse, Aufgaben-Generatoren je Spiel, Rechengeschichten, Kiosk-Preise, Muster |
| `rechnen-stand.js` | Rechenstand: Aufgaben (Treffer, Fehler, schnell), Fehlerbilder, Taler, Drache (Leben und Stufe), Einrichtung, Mitwachsen, Bericht, Einstellungen der Eltern, was als Nächstes dran ist |
| `rechnen-art.js` | Rechenwagen von aussen, Zimmer, Wagen in Fünfer-Farben, Zehnerwagen, Tunnel, Zählrahmen, Zahlenhaus, Waage |
| `rechnen-drache.js` | der Drache in drei Leben zu je 15 Stufen, sein Schatz, die Missionskarte |
| `rechnen-spiel.js` | was alle Spiele teilen: Bühne, «Los», Antwort-Leiste, Finger-Eingabe, Ergebnis mit Sternen und Talern |
| `rechnen-ton.js` | Zahlwörter und Satzbausteine als Folge von Aufnahmen |
| `train-rechenecke.js` | das Zimmer als Ansicht der Bühne |
| `kuppelplus.*`, `tunnelrechnen.*`, `blitzblick.*`, `einsteigen.*`, `huepfgleis.*`, `zahlenhaus.*` | die Spiele der Etappe 1 |
| `train-home.js`, `index.html` | Rechenwagen auf dem Startbild, `?rechnen=1` |
| `entitlement.js` | `RECHENECKE` wie `LESEECKE` |
| `firebase.js` | Karte «Rechenecke», `setRechnenElternFor`, Zurücksetzen behält die Einstellung |
| `service-worker.js` | die neuen Dateien im Vorrat, Aufnahmen im eigenen Cache |
| `scripts/validate-rechnen.mjs` | prüft Aufgaben (jede Lösung im Zahlenraum, keine negativen Ergebnisse vor Sprosse 6, Rechengeschichten passen zur Rechnung), Aufnahmen, Schranke |
| `scripts/check-rechenecke.mjs` | Browser-Test: Zimmer, Wege, jedes Spiel einmal durch, Drache in allen 45 Stufen, Startbild ohne verdeckte Knöpfe |

Keine neue Firestore-Regel, keine Änderung an `netlify.toml` oder `firebase.json`.

## 14. Vorbilder – was andere Apps gut machen

Aus der Kenntnis der Apps, nicht frisch recherchiert; Inhalte und Preise ändern sich oft.

- **DragonBox Numbers:** Zahlen als Wesen, die man zusammensteckt und zerlegt – Teil und
  Ganzes zum Anfassen. *Übernehmen:* das Zerlegen mit den Händen (Zahlenhaus, Schüttelbecher).
- **Todo Math:** viele sehr kurze Aufgaben, eine tägliche Mission, ein breiter Lehrplan.
  *Übernehmen:* Kürze, der Vorschlag des Tages.
- **Khan Academy Kids:** gratis, breit, mit Figuren und Büchern. *Übernehmen:* die
  Verbindung von Lesen und Rechnen.
- **Moose Math:** Rechnen in kleinen Läden und Geschichten. *Übernehmen:* der Kiosk.
- **Numberblocks (Fernsehserie und Apps):** Zahlen mit sichtbarer Struktur, die
  Kinder sofort verstehen. *Übernehmen:* nur die Idee der sichtbaren Struktur – bei uns sind
  die Zahlen Züge, keine Figuren.
- **ANTON** und **Blitzrechnen (Klett):** nah am Lehrplan, Blitzrechnen mit der Kraft der Fünf.
  *Übernehmen:* Zehnerfeld und Fünferstruktur als festes Bild.

*Bewusst nicht:* Drill mit Uhr für die Kleinsten, Edelsteine und Energie, Werbung,
Ranglisten.

## 15. Die Etappen (Vorschlag)

- **Etappe 1 – Plus-Start (für die Fünfjährige):** Rechenwagen auf dem Startbild und die Tür
  aus dem Lesewagen, das Zimmer, der Drache mit Schatz und Missionskarte (erstes Leben),
  sechs Spiele: **Kuppel-Plus**, **Tunnel-Rechnen**, **Blitzblick**, **Einsteigen bitte!**,
  **Hüpf-Gleis**, **Zahlenhaus**. Mitwachsen von Anfang an, Schranke, eine einfache Karte im
  Elternbereich (Beginn und Zahlenraum), die Zahlwörter 0 bis 20 als Aufnahme.
- **Etappe 2 – Zahlen festigen und Minus** (wie in der Leseecke in zwei, drei Teilen):
  *Zählen und Zahlen* – Fahrplan-Lücke, Countdown!, Ziffern-Gleis, Zahlen-Paare, Finger-Zahlen,
  Alle einsteigen!, Wer hat mehr?, Zähl-Fenster, Wagen ordnen, Muster-Zug, Stolperwagen;
  *Plus festigen* – Hüpf-Lok, Würfel-Plus, Wer versteckt sich im Tunnel?; *Minus* – Abkuppeln,
  Aussteigen bitte!, Ballon-Wagen, Plus oder Minus?; dazu der Kiosk bis 10 Franken, die
  Einrichtung in 15 Schritten, der Rechenbericht mit Plus-Tafel und die Taufe des Drachen.
- **Etappe 3 – bis 20:** Doppel-Express, Zehnerwagen füllen, Waage, Zehner-Sprung, Rechenkette,
  Schüttelbecher, Drachenfutter, Rückwärts-Hüpfer, Wo hält der Zug? (0–10), Wie lang ist die
  Schlange?, Strichliste, Formen-Güterzug, Tangram-Lok, Spiegel-Signal; der Drache in allen
  drei Leben; der Sternenhimmel.
- **Etappe 4 – für Grössere und die Eltern:** Zahlenmauer, Wachsende Türme, Hunderter-Fahrplan,
  Bahnhofsuhr, Kiosk mit Rückgeld, Blitzrechnen-Express, Rechen-Postkarten, Gerade oder
  ungerade?, Was kommt öfter?, das Sammelalbum «Zahlen in der Welt», Aufträge für draussen,
  die Verbindung zur Bauecke.

## 16. Offene Entscheidungen

| # | Frage | Empfehlung |
| --- | --- | --- |
| 1 | Wo steht der Rechenwagen auf dem Startbild? | Weg A: gekuppelt neben dem Lesewagen, bei wenig Platz auf einem zweiten Abstellgleis darüber; dazu eine Tür zwischen den Wagen |
| 2 | Zählt Rechnen für den Zug? | nein, wie Lesen; der Lohn ist der Wagen, der Drache und sein Schatz |
| 3 | Bringt Rechnen Ziegel für die Bauecke? | ja, über den Rätsel-Knopf der Bauecke für die Jüngsten (Etappe 4) |
| 4 | Welche Hauptfigur? | der Rechendrache mit Schatz und Zacken in Fünfer-Farben; das Kind gibt ihm den Namen |
| 5 | Wie viele Taler je Runde? | so viele wie Sterne (1–3), die vorgeschlagene Runde doppelt |
| 6 | Wie viel ist gratis? | je Spiel eine Runde, wie in der Leseecke |
| 7 | Mit welcher Sprosse beginnt eine Fünfjährige? | nach Alter Sprosse 3 «Plus bis 10», die Spiele starten aber auf «leicht» (bis 5) |
| 8 | Minus schon in Etappe 1? | nein, nur im Tunnel auf «schwer»; Etappe 1 bleibt beim Wunsch: Plus |
| 9 | Welche Ziffernform? | wie in der Schule (Schweizer Basisschrift); vor der Umsetzung mit dem Kindergarten oder Lehrmittel abgleichen |
| 10 | Das Zahlengleis auch im Rechenwagen? | ja, an der Fahrplan-Tafel mit einer Stufe 0–10; es zählt weiter für den Bereich «Zahl und Buchstabe» |
| 11 | Zahlen sprechen: einzelne Aufnahmen oder ganze Sätze? | Zahlwörter und Satzbausteine einzeln (rund 150), zusammengesetzt; ganze Sätze nur für Anleitungen |
| 12 | Lehrplan 21 im Bericht nennen? | nein, aber die Sprossen so wählen, dass sie zum Zyklus 1 passen; vorher gegenlesen |

## Quellen

- Siegler, R. S. & Ramani, G. B. (2008). Playing linear numerical board games promotes
  low-income children's numerical development. *Developmental Science*, 11(5).
- Ramani, G. B. & Siegler, R. S. (2008). Promoting broad and stable improvements in
  low-income children's numerical knowledge through playing number board games.
  *Child Development*, 79(2).
- Krajewski, K. & Schneider, W. (2009). Early development of quantity to number-word linkage
  as a precursor of mathematical school achievement and mathematical difficulties.
  *Journal of Experimental Child Psychology*, 103(4).
- Gaidoschik, M.: *Rechenschwäche vorbeugen* (Wien: öbv & hpt) – zum zählenden Rechnen und zu
  ableitenden Strategien.
- Wittmann, E. Ch. & Müller, G. N.: *Das Zahlenbuch* und *Blitzrechnen* (Klett) – Kraft der
  Fünf, Zwanzigerfeld, Zahlenhäuser und Zahlenmauern.
- Clements, D. H. & Sarama, J.: *Learning and Teaching Early Math: The Learning Trajectories
  Approach* (Routledge) – Lernwege, Subitizing.
- Boaler, J. (2014). Research suggests that timed tests cause math anxiety. *Teaching Children
  Mathematics*, 20(8).
- Lehrplan 21, Fachbereich Mathematik, Zyklus 1 (D-EDK).
