# Ein fünftes Spiel je Bereich – Recherche und Vorschläge

Stand: September 2026 · Grundlage: `train-progress.js`, `train-art.js`, `game-shell.js`,
`highscore.js`, alle zwanzig Spielseiten, `docs/UX-REVIEW-KINDER-4-8.md`

Der Zug hat fünf Bereiche mit je vier Spielen. Dieses Dokument beantwortet zwei Fragen:
**welches fünfte Spiel gehört in welchen Bereich** – und **was das mit den zwölf
Ausbauschritten eines Wagens macht**. Die zweite Frage muss vor der ersten Zeile Code
entschieden sein, deshalb steht sie zuerst.

---

## 1. Die Vorfrage: zwölf Schritte, fünf Spiele

Heute gilt: vier Spiele je Wagen, drei Schritte je Spiel, zwölf Schritte je Wagen
(`STEPS_PER_GAME = 3`, `STAGE_COUNT = 12`). Die Rechnung geht auf, weil 4 × 3 = 12 ist.
Mit fünf Spielen wären es 15 mögliche Schritte für zwölf Plätze. `areaProgress()` deckelt
schon heute mit `Math.min(STAGE_COUNT, …)` – die App bricht also nicht, aber die Aussage
"jeder Schritt gehört zu einem Spiel" stimmt nicht mehr von allein.

Drei Wege:

### Weg A – Deckel bei zwölf lassen *(Empfehlung)*

Jedes Spiel gibt weiter drei Schritte, gezählt wird bis zwölf. Wer alle fünf Spiele
anfasst, verteilt seine Schritte breiter; wer ein Spiel nicht mag, lässt es weg und baut
den Wagen mit den anderen vier trotzdem fertig.

- **Aufwand:** eine Zeile in `scripts/validate-train-progress.mjs` (die Zusicherung
  `area.games.length === 4`, zweimal), eine in `scripts/validate-train-art.mjs`
  (`spiele.length === 20` → 25), dazu die Kommentare in `train-progress.js`. Sonst nichts.
- **Keine neue Wagen-Grafik.** Die zwölf Ausbaustufen in `train-art.js` bleiben, wie sie
  sind – für alle zehn Wagen (fünf Bereiche × zwei Sets).
- **Die Spielzeit je Wagen bleibt praktisch gleich.** Im Set 1 (`stepAt: [1,3,5]`) sinkt
  das Minimum von 20 auf 19 Runden: fünf erste Schritte kosten je eine Runde, die
  restlichen sieben je zwei. Im Set 2 (`stepAt: [3,6,9]`) bleibt es exakt bei 36 Runden,
  weil dort jeder Schritt gleich viel kostet. Ein fünftes Spiel macht den Wagen also
  nicht teurer, sondern wählbarer.
- **Preis:** die zwölf Punkte unter dem Wagen sind dann ein Deckel und keine Landkarte
  mehr. Ein Kind, das alle fünf Spiele voll spielt, sieht die letzten drei Schritte nicht
  mehr ankommen. Das fällt kaum auf – die Punkte zeigen ohnehin nur "wie weit noch", nicht
  "welches Spiel wohin gehört".

### Weg B – auf fünfzehn Schritte erhöhen

Die ehrlichste Zuordnung: fünf Spiele × drei Schritte = fünfzehn.

- **Aufwand:** jeder der zehn Wagen braucht drei zusätzliche Ausbaustufen in
  `train-art.js` – das ist der teure Teil, und es ist Grafikarbeit, keine Logik. Dazu
  `STAGE_COUNT`, `BUILT_STAGE`, die Punktreihe (`stepDots`), `check-belohnung.mjs`
  ("sechs von zwölf"), `validate-train-art.mjs`, `validate-train-progress.mjs`.
- **Preis:** ein Wagen kostet 25 statt 20 Runden (Set 1) und 45 statt 36 (Set 2). Der
  Zug wächst also ein Viertel langsamer als heute.

### Weg C – das fünfte Spiel zählt nicht für den Wagen

Kein Eingriff in die Rechnung. Aber ein Kind, das auf seinen Wagen schaut, hat keinen
Grund, das Spiel je anzufassen. Nicht empfohlen.

> **Empfehlung: Weg A.** Er kostet fünf geänderte Zeilen statt dreissig neuer
> Wagen-Bauteile, lässt die Zuglänge, wie sie ist, und gibt dem Kind zum ersten Mal die
> Wahl, *welche* vier Spiele seinen Wagen bauen.

### Noch eine Kleinigkeit: die Häuser am Gleis

`buildGamesLayer()` reiht die Spielhäuser in 1200 Einheiten Breite auf, von denen der Zug
545 belegt. Mit vier Häusern bleibt ein Massstab von 0.80, mit fünf sind es 0.63 – die
Häuser werden also rund ein Fünftel kleiner. Drei Möglichkeiten: so lassen (sie bleiben
gut über Fingerbreite), den Abstand `gap` von 46 auf ~30 nehmen, oder auf zwei Reihen
umstellen. Die Kisten am Wagen (`.wagon-shelf`) brauchen nichts: das CSS hat schon
`flex-wrap: wrap`.

---

## 2. Was jeder Bereich heute abdeckt

Bevor etwas dazukommt, die Frage: welche Aufgabe stellt jedes vorhandene Spiel wirklich?

| Bereich | Spiel | Fachlich |
|---|---|---|
| **Gedächtnis** | Rucksack packen | Wachsende Reihenfolge nachspielen (serielles Kurzzeitgedächtnis) |
| | Memory | Paare an Orten binden |
| | Strand-Schätze | Welchen hatte ich schon? (Selbstüberwachung, Positionen wechseln) |
| | Kacheln-Knobeln | Muster nachtippen (visuell-räumliche Spanne, Corsi-Prinzip) |
| **Konzentration** | Schwarm-Fokus | Flanker: die Nachbarn ignorieren |
| | Weichen-Wirrwarr | Früh genug umstellen (vorausschauendes Handeln unter Zeit) |
| | Fischteich | Wie Strand-Schätze, aber die Ziele bewegen sich |
| | Freie Fahrt | Schiebe-Rätsel (eigentlich Planen) |
| **Geschwindigkeit** | Tier-Sprung | Timing im Lauf |
| | Karten-Merker | Dieselbe wie die davor? (1-back auf Zeit) |
| | Blätter im Strom | Regel umschalten (Aufgabenwechsel) |
| | Turmbau | Präzises Timing |
| **Problemlösen** | Raumdetektiv | Raumvorstellung, Ansichten, Netze |
| | Arukone | Wege ohne Kreuzung |
| | Battleships | Deduktion aus Randzahlen |
| | Tiergehege | Fläche zerlegen |
| **Zahl und Buchstabe** | Buchstabenjagd | Anlaut → Buchstabe |
| | Wortdetektiv | Wörter und Sätze lesen |
| | Kakuro | Summen zerlegen |
| | Hidoku | Zahlenkette 1…n |

Daraus fallen fünf Lücken auf – und für jede gibt es eine passende, gut belegte Aufgabe:

1. **Gedächtnis** fragt viermal nach *Ort* und *Reihenfolge*, nie nach *Inhalt*.
2. **Konzentration** hat kein Spiel zum *Nicht*-Tippen – Handlungshemmung fehlt ganz.
3. **Geschwindigkeit** hat kein reines Such- und Vergleichstempo.
4. **Problemlösen** ist viermal statische Deduktion; eine *Zugfolge* plant kein Spiel.
5. **Zahl und Buchstabe** hat seit dem Wegfall von "Zählzauber" (`countPuzzle` steht noch
   in `ALTE_TITEL`, highscore.js) nichts mehr zu Menge und Zahlgrösse – genau die Lücke,
   die schon die UX-Review unter **P9** benannt hat. Für ein vierjähriges Kind ist der
   ganze Bereich damit leer.

---

## 3. Die Vorschläge

Je Bereich ein empfohlenes Spiel und eine ernstgemeinte Alternative. Alle sind so
geschnitten, dass sie auf `game-shell.js` laufen: Landschaft, drei Knöpfe, Lautsprecher,
Zähler, Bestenliste – und im Spiel selbst kein Wort, das ein Kind lesen müsste.

---

### 3.1 Gedächtnis → **„Was fehlt?"**

**Regel.** Ein offener Güterwagen fährt vor, darauf drei Stücke Fracht. Die Plane geht
für zwei Sekunden drüber. Wenn sie hochgeht, ist ein Stück weg – welches? Unten stehen
die möglichen Antworten, ein Tipp genügt. Stimmt es, kommt der nächste Wagen mit einem
Stück mehr. Ein Fehlgriff beendet die Runde. Gezählt wird, wie viele Wagen richtig
kontrolliert wurden.

**Warum hier.** Es ist das einzige Gedächtnisspiel, das nicht nach einem *Platz* fragt,
sondern nach dem *Ding*. Rucksack, Memory, Strand-Schätze und Kacheln arbeiten alle über
Position und Reihenfolge; "Was fehlt?" prüft, ob ein Kind eine Menge von Gegenständen als
Menge behalten hat. Das Kim-Spiel ist genau dafür der Klassiker, und es braucht null
Erklärung: die Frage im Titel *ist* die Regel.

**Passt zum Zug.** Fracht kontrollieren ist das, was man an einem Güterwagen tut.

**Fortschritt.** `runsProgress("lernapp.wasfehlt", 8)` – ein Punkt je richtig
kontrolliertem Wagen, acht sind eine gute Runde. Keine Uhr (`clock: false`), genau wie
Kacheln-Knobeln: die Aufgabe ist das Merken, eine laufende Uhr triebe zum Raten.

**Aufwand.** Klein. `strand-art.js` liefert 38 gezeichnete Gegenstände mit Namen, jeder
in 64 × 64 und bewusst nach Silhouette *und* Farbe unterscheidbar –
`LernappStrandArt.treasureSvg(id)` gibt das fertige SVG zurück. Es muss also kein einziges
neues Motiv gezeichnet werden. Vorbild für den Aufbau: `kacheln.js` (~250 Zeilen).

**Alternative: „Wer wohnt wo?"** – Häuser am Gleis öffnen sich nacheinander und zeigen je
ein Tier, dann sind alle wieder zu; danach erscheint ein Tier oben, und das Kind tippt sein
Haus an. Runde für Runde ein Paar mehr. Das ist das Prinzip des Paired-Associates-Tests
(CANTAB PAL), also Bindung von Objekt an Ort – fachlich der grössere Schritt weg von
Memory, aber für Vierjährige deutlich schwerer zu fassen als „Was fehlt?".

---

### 3.2 Konzentration → **„Halt am Signal"**

**Regel.** Ein Zug rollt auf den Bahnübergang zu. Steht das Signal auf Grün, wird
angetippt – die Schranke geht hoch und der Zug fährt durch. Steht es auf Rot, wird
**nicht** angetippt, sondern gewartet, bis der Zug von selbst hält. 45 Sekunden lang. Ein
Punkt für jeden richtig durchgelassenen und jeden richtig angehaltenen Zug; ein Tipp bei
Rot kostet den Punkt.

Damit das Hemmen wirklich gefordert ist, kommen etwa drei von vier Zügen bei Grün: das
Antippen wird zur Gewohnheit, und genau diese Gewohnheit muss bei Rot unterdrückt werden.
Ohne dieses Ungleichgewicht wäre es nur ein Farbspiel.

**Warum hier.** Handlungshemmung – nicht zu tun, was der Finger schon will – ist die
Kernfunktion, die im ganzen Zug fehlt. Schwarm-Fokus prüft, ob ein Kind Ablenkendes
ausblenden kann; ob es eine begonnene Bewegung stoppen kann, prüft bisher nichts. Für
Vorschulkinder ist das die am besten untersuchte Übung überhaupt, mit Hinweisen darauf,
dass reines Hemmungstraining sogar auf Schlussfolgern durchschlägt.

**Passt zum Zug.** Signal und Schranke gehören zur Welt der App, ohne dass etwas erfunden
werden müsste.

**Fortschritt.** `runsProgress("lernapp.signal", 30)` – dieselbe Form und dieselbe
Grössenordnung wie Schwarm-Fokus, das ebenfalls 45 Sekunden läuft und bei 30 Punkten drei
Sterne gibt.

**Aufwand.** Klein. `schwarmfokus.js` (~11 KB) ist die direkte Vorlage: Uhr aus der Hülle,
ein Reiz, eine Antwort, Punkte, Bestenliste. Neu ist nur der Signalmast und ein
heranrollender Zug – Lok und Wagen zeichnet `train-art.js` bereits.

**Achtung Motiv.** Das Haus am Gleis darf nicht mit dem von Weichen-Wirrwarr
(`motif: "switch"`) verwechselbar sein. Ein hoher Mast mit rotem Licht sieht anders aus
als eine liegende Weiche, aber das gehört beim Zeichnen geprüft.

**Alternative: „Alle Käfer finden"** – ein Feld voller ähnlicher Tiere, angetippt werden
nur die mit genau fünf Punkten, die Uhr läuft. Das Prinzip des Durchstreichtests, also
selektive Aufmerksamkeit und Sorgfalt. Gut, aber näher am Fischteich (auch dort wird im
Feld gesucht und getippt) und ohne die fehlende Hemmungs-Komponente.

---

### 3.3 Geschwindigkeit → **„Doppelt gleich"**

**Regel.** Zwei runde Karten mit je vier bis sechs Bildern liegen übereinander. Genau ein
Bild kommt auf beiden vor – antippen, und sofort liegen die nächsten beiden da. 45
Sekunden, so viele Paare wie möglich. Mit jedem Treffer kommt ein Bild mehr auf die Karte,
bis es sechs sind.

**Warum hier.** Der Bereich hat Timing (Tier-Sprung, Turmbau), Gedächtnis auf Zeit
(Karten-Merker) und Regelwechsel auf Zeit (Blätter im Strom) – aber nichts, wo reines
Suchen und Vergleichen das Tempo macht. Genau das ist das Dobble-Prinzip, und es ist bei
Vier- bis Achtjährigen aus gutem Grund beliebt: es erklärt sich in einem Satz, jeder
Treffer ist ein kleiner Sieg, und es lässt sich stufenlos schwerer machen, ohne die Regel
zu ändern.

**Fortschritt.** `runsProgress("lernapp.doppelt", 20)` – Punkte, Uhr, Bestenliste, wie
Karten-Merker.

**Aufwand.** Klein bis mittel. Wieder `strand-art.js` als Bildvorrat. Die eigentliche
Dobble-Mathematik (jede Karte mit jeder genau ein gemeinsames Symbol, eine projektive
Ebene) braucht es *nicht*: es genügt, für jede Aufgabe zwei Karten so zu würfeln, dass sie
genau ein Bild teilen – ein gemeinsames ziehen, den Rest aus disjunkten Mengen füllen.
Das sind zwanzig Zeilen. Sorgfalt braucht die Darstellung: die Bilder sollten gedreht und
in wechselnder Grösse liegen, sonst findet das Kind das Paar über die Position statt über
die Form.

**Alternative: „Fracht sortieren"** – Gegenstände kommen auf einem Band und müssen nach
links oder rechts in die richtige Rutsche gewischt werden, so schnell wie möglich. Solide,
aber im Griff zu nah an Blätter im Strom, wo ebenfalls links/rechts gewischt wird.

---

### 3.4 Problemlösen → **„Fässer stapeln"**

**Regel.** Drei Abstellgleise, auf dem linken ein Stapel Fässer, von gross nach klein. Der
Kran hebt immer nur das oberste Fass, und ein grösseres darf nie auf einem kleineren
landen. Alle Fässer sollen auf das rechte Gleis. Drei Fässer brauchen sieben Züge, vier
fünfzehn, fünf einunddreissig.

**Warum hier.** Alle vier vorhandenen Rätsel dieses Bereichs sind statisch: das Bild steht
da, es wird geschlossen und eingetragen. Keines verlangt, eine *Folge von Zügen* im Kopf
vorauszudenken, in der man zwischendurch scheinbar rückwärts gehen muss. Genau das ist die
Turm-Aufgabe (Turm von Hanoi bzw. Turm von London), der klassische Planungstest – und sie
ist mit drei Fässern schon für ein fünfjähriges Kind lösbar.

**Passt zum Zug.** Der Wagen dieses Bereichs *ist* im ersten Set der Kranwagen
(`problemloesen: "crane"`). Näher kann ein Spiel an seinem Wagen nicht liegen.

**Fortschritt.** `bestenLevelProgress("lernapp.faesser")` – Level mit Sternen, wie
Weichen-Wirrwarr und Freie Fahrt. Und wie dort ist die Bestmarke *gerechnet*, nicht
geschätzt: das Minimum ist bei diesem Rätsel exakt 2ⁿ − 1 Züge. Drei Sterne für das
Optimum, zwei bis zum Anderthalbfachen, sonst einer. Zehn bis zwölf Level von drei bis
fünf Fässern, mit wechselnden Startaufstellungen (nicht immer der volle Stapel links –
das gibt aus derselben Regel ganz verschiedene Aufgaben).

**Aufwand.** Klein. Der Zustand sind drei Listen, die Regel sind zwei Zeilen, und der
optimale Weg lässt sich mit einer Breitensuche prüfen, genau wie es
`scripts/validate-freiefahrt.mjs` für Freie Fahrt tut. Das meiste ist Grafik: Kran, Fass,
drei Gleise.

**Alternative: „Was passt in die Lücke?"** – Musterergänzung nach Art der Matrizentests
(2 × 2, später 3 × 3, eine Zelle fehlt, vier Antworten). Trainiert schlussfolgerndes
Denken und ist beliebig skalierbar, fühlt sich aber mehr nach Test als nach Spiel an und
liegt näher an den vorhandenen Rätseln.

---

### 3.5 Zahl und Buchstabe → **„Wo hält der Zug?"**

**Regel.** Ein Gleis läuft quer über das Bild, links der Bahnhof 0, rechts der Bahnhof 10.
Oben steht eine Zahl, und der Lautsprecher sagt sie. Das Kind schiebt den Zug an die
Stelle, wo diese Zahl liegt, und lässt los. Danach fährt ein Schild an die richtige Stelle
und zeigt, wie nah es war. Zehn Zahlen je Runde. Je näher, desto mehr Punkte.

Drei Stufen, die sich von selbst öffnen: 0–5 mit einer Markierung bei jeder Zahl, 0–10 nur
mit Markierungen an den Enden, später 0–20.

**Warum hier.** Der Bereich hat seit dem Wegfall von "Zählzauber" nichts mehr, was Menge
und Zahl verbindet – Kakuro und Hidoku setzen sicheres Zählen bereits voraus, und die
beiden anderen Spiele sind Buchstabenspiele. Für ein vier- bis fünfjähriges Kind ist der
Bereich damit leer, was die UX-Review unter P9 schon festgehalten hat.

Und die Zahlenstrahl-Aufgabe ist nicht irgendeine Lücke, sondern die am besten belegte
Vorschul-Mathe-Übung überhaupt: rund eine Stunde mit einem *linearen* Zahlen-Brettspiel
verbesserte bei Vorschulkindern Zahlenvergleich, Zahlenstrahl-Schätzung, Zählen und
Ziffernkenntnis – und die Wirkung war neun Wochen später noch messbar. Entscheidend war
dabei die *lineare* Anordnung; mit einem runden Brett blieb der Effekt aus.

**Passt zum Zug.** Ein Zahlenstrahl *ist* ein Gleis mit Bahnhöfen. Keine andere App kann
diese Aufgabe so selbstverständlich erzählen – und kein anderes Spiel dieser App macht so
direkt Gebrauch davon, dass hier ein Zug fährt.

**Fortschritt.** `runsProgress("lernapp.zahlengleis", 25)` – Punkte aus der Genauigkeit
über zehn Zahlen (drei Punkte für einen Treffer, zwei für knapp daneben, einer für die
richtige Hälfte), keine Uhr.

**Aufwand.** Klein – das kleinste der fünf. Ein Schieber auf einer Linie, der Rest ist
Rechnen und Zeichnen. Das Vorlesen der Zahl gibt es schon (`LernappKids.speak`).

**Alternative: „Wer hat mehr?"** – zwei Wagen mit Kisten, welcher hat mehr, auf Zeit.
Trainiert das schnelle Erfassen von Mengen und ist für Vierjährige noch einen Tick
zugänglicher, hat aber weniger Substanz – und „Wo hält der Zug?" übt den Grössenvergleich
ohnehin mit.

---

## 4. Zusammenfassung

| Bereich | Vorschlag | Was neu trainiert wird | Form | Aufwand |
|---|---|---|---|---|
| Gedächtnis | **Was fehlt?** | Inhalt statt Ort behalten | Runde ohne Uhr, Punkte | klein |
| Konzentration | **Halt am Signal** | Handlung hemmen (Go/No-Go) | 45 s, Punkte | klein |
| Geschwindigkeit | **Doppelt gleich** | Suchen und Vergleichen auf Tempo | 45 s, Punkte | klein–mittel |
| Problemlösen | **Fässer stapeln** | Zugfolgen vorausplanen | Level mit Sternen | klein |
| Zahl und Buchstabe | **Wo hält der Zug?** | Zahlgrösse, Menge, Zählen | Runde ohne Uhr, Punkte | klein |

Vorgeschlagene Reihenfolge der Umsetzung – nach Nutzen je Aufwand:

1. **Wo hält der Zug?** – schliesst die grösste inhaltliche Lücke (nichts für 4–5-Jährige
   im ganzen Bereich), ist am billigsten zu bauen und thematisch der schönste Treffer.
2. **Halt am Signal** – die einzige fehlende Kernfunktion, Vorlage `schwarmfokus.js` steht.
3. **Was fehlt?** – braucht keine neue Grafik, Vorlage `kacheln.js` steht.
4. **Fässer stapeln** – etwas mehr Grafik, dafür fachlich sauber prüfbar.
5. **Doppelt gleich** – am meisten Feinarbeit an der Darstellung.

---

## 5. Was ein neues Spiel im Code berührt

Aus dem Vergleich mit "Freie Fahrt" (#55), "Turmbau" (#54) und "Blätter im Strom" (#49) –
diese Liste ist vollständig:

| Datei | Was dazukommt |
|---|---|
| `<spiel>.html` | Seite nach dem Muster von `kacheln.html`, `data-page` gesetzt |
| `<spiel>.js` | Die Regel; Bühne kommt aus `game-shell.js` |
| `styles.css` | Der Block für das Spiel (rund 150–320 Zeilen) |
| `train-progress.js` | Eintrag in `AREAS`, Speicherschlüssel, `OWN_PROGRESS`, `cloudGames.register` |
| `train-art.js` | Eintrag in `BUILDINGS` + das Motiv zeichnen |
| `highscore.js` | Eintrag in `SPIELE` (Titel, Bereich, Art, Schlüssel, Einheit) |
| `service-worker.js` | HTML und JS in die Vorratsliste |
| `train-test.html` | Spiel-ID in die Liste des Bereichs |
| `scripts/check-rueckwege.mjs` | Seitenname in die geprüfte Liste |
| `scripts/validate-train-progress.mjs` | `games.length === 4` → `=== 5` (zwei Stellen) |
| `scripts/validate-train-art.mjs` | `spiele.length === 20` → `=== 25` |
| `scripts/validate-bestenliste.mjs` | Schlüssel → Datei in der Zuordnungstabelle |

Dazu je nach Spiel ein eigenes Prüfskript, wie es Freie Fahrt und Tier-Sprung haben.

---

## Quellen

- Siegler, R. S. & Ramani, G. B.: *Playing linear numerical board games promotes low-income
  children's numerical development*, Developmental Science 2008 –
  <https://onlinelibrary.wiley.com/doi/10.1111/j.1467-7687.2008.00714.x>
- Siegler & Ramani: *Playing Linear Number Board Games – But Not Circular Ones – Improves
  Low-Income Preschoolers' Numerical Understanding*, 2009 –
  <https://siegler.tc.columbia.edu/wp-content/uploads/2019/02/sieg-ram09.pdf>
- Liu, Q. et al.: *The effects of inhibitory control training for preschoolers on reasoning
  ability and neural activity*, Scientific Reports 2015 –
  <https://www.nature.com/articles/srep14200>
- *"Wesley says": a children's response inhibition playground training game yields
  preliminary evidence of transfer effects*, 2015 –
  <https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4340145/>
- *The Development of Associate Learning in School Age Children* (Paired-Associates-Prinzip
  bei Kindern) – <https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4094421/>
- Tower of London – Deutsche Version (TL-D), Hogrefe/Dorsch –
  <https://dorsch.hogrefe.com/stichwort/tower-of-london-deutsche-version-tl-d>
- *Playing to Focus: A Systematic Review of Reveal-and-React Board and Card Games for
  Executive Function Development in Children*, 2024 –
  <https://journal.kurasinstitute.com/index.php/bocp/article/view/1524>
- `docs/UX-REVIEW-KINDER-4-8.md`, Abschnitt P9 (fehlendes Zähl- und Mengenangebot)
