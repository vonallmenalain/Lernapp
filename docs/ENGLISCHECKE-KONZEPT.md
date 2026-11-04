# Die Englischecke – Konzept, Ideensammlung und Umbau des Startbilds

Stand: 4. November 2026 · Entwurf · Grundlage: `docs/RECHENECKE-KONZEPT.md`,
`docs/LESEECKE-KONZEPT.md`, `docs/STIMME-GOOGLE.md`, `train-home.js` (`positionLesewagen`,
`positionRechenwagen`, `positionBauplatz`, `layoutFriends`), `lesen-art.js` (`buildLesewagen`),
`rechnen-art.js` (`wagenAussen`), `train-progress.js`, `entitlement.js`, `firestore.rules`

> **Stand:** Entwurf, noch nichts gebaut. Der Wunsch: ein dritter Lernort neben Leseecke und
> Rechenecke, diesmal für **erste Englisch-Basics** – Wörter und ganz einfache Sätze, mit einem
> Bereich zum **Entdecken** (Bild antippen, das Wort klingt auf Englisch), mit **Bildgeschichten**,
> die auf Englisch erzählt werden, und jederzeit **auf Deutsch** nachzuhören. Eine
> **amerikanische Stimme**, keine britische. Dazu ein **Umbau des Startbilds**, weil der Platz
> knapp wird: zwei Gleise, unten der Gripszug, oben ein gleich grosser Lernzug mit Lese-,
> Rechen- und Englischwagen, die Züge der Gruppe hinter einem Knopf ganz rechts, und an jedem
> Lernwagen sichtbar, wie weit man ist.
>
> Zum Konzept gehört eine klickbare **Stilprobe** (Artefakt «Gripszug Englischecke»; dieselbe
> Seite liegt als `docs/englischecke-stilprobe.html` im Repo und geht nicht auf die Site). Sie
> zeigt das neue Startbild (Tablet und Handy quer, drei Fortschrittsstände, zwei Darstellungen,
> die Gruppe hinter dem Knopf), den Englischwagen von innen, ein spielbares **Wimmelbild vom
> Bauernhof**, das Spiel **Hear & find**, eine **Bildgeschichte** in vier Bildern und Roccos
> **Wörterbuch**. Alles spricht mit **echten Aufnahmen** von Google Chirp 3 HD: Englisch wahlweise
> mit en-US *Sulafat* oder en-US *Puck*, Deutsch mit de-DE *Sulafat* wie die App, dazu **zehn
> amerikanische Stimmen** zum Vergleichen. Verbraucht: 4'774 Zeichen des Gratis-Kontingents,
> gebucht in `scripts/stimme-google.json`.
>
> **Umsetzungsstand:** Die Entscheide sind gefallen (Abschnitt 0). **Etappe 0 ist gebaut:** das
> Startbild mit zwei Gleisen (Abschnitt 0.2).

---

## 0. Entscheide und Umsetzung

### 0.1 Die Entscheide (4. November 2026)

| # | Frage | Entscheid |
| --- | --- | --- |
| 4 | Die englische Stimme | **Puck (en-US), Tempo 0,9.** Deutsch bleibt **Sulafat (de-DE)** wie in der ganzen App. |
| 9 | Fortschritt am Lernwagen | **Variante B: bauen**, wie beim Gripszug – aber vom ersten Tag an muss klar sein, welcher Wagen es ist: Schon das nackte Fahrgestell trägt sein **Schild** («ABC», «123», «Hello») und sein **Maskottchen**. |
| 8 | Gruppe | Knopf ganz rechts, **mit Punkt**, wenn jemand aus der Gruppe weitergekommen ist. |
| – | Name des Suchspiels | **«Hear & find»** statt «Hör & find» – das war weder Deutsch noch Englisch. |
| – | Vorlesen und Deutsch | **Jeder Text ist antippbar** und wird vorgelesen, zuerst nur auf Englisch. Der Knopf **DE** ist **überall** in der Englischecke da und **jederzeit** antippbar: Er sagt genau das, was soeben gesagt wurde, auf Deutsch und danach noch einmal auf Englisch. |
| alle anderen | | gemäss Empfehlung in Abschnitt 20 |

### 0.2 Etappe 0: das Startbild mit zwei Gleisen

- **Der Lernzug** (`train-home.js`, `positionLernzug`; gezeichnet in `lernzug-art.js`) fährt auf
  einem zweiten Gleis über dem Gripszug: von rechts die Lernlok, der Lesewagen, der
  Rechenwagen. Er hat denselben Massstab wie der Gripszug (gemessen an dessen Bild), sein Gleis
  liegt 174 Einheiten über dem unteren – Platz für den höchsten fertigen Wagen (158) und das
  Wippen der Wagen beim ersten Start. Nur wenn die Höhe nicht reicht, wird der Lernzug kleiner,
  nie unter 55 % des Gripszugs. Beim Laden fährt er kurz nach dem Gripszug herein.
- **Bauen in 15 Schritten** (`buildLernwagen`): 0 Fahrgestell mit Schild auf zwei Pfosten,
  Maskottchen und gestricheltem Umriss · 1 Boden · 2 halbe Wände · 3 Wände mit Fenstern
  (das Maskottchen schaut aus dem mittleren) · 4 Dach · 5 das Besondere oben (Kamin, Zählrahmen,
  beim Caboose der Aussichtsturm) · 6 Laternen (Caboose: Plattformen) · 7 Zierleiste (am
  Rechenwagen in den Fünfer-Farben) · 8 Vorhänge · 9 Blumenkästen · 10 Licht · 11 Ladung auf dem
  Dach · 12 Lichterkette · 13 mehr Ladung · 14 zwei Sterne · 15 Wimpel und goldene Räder. Die
  Schritte kommen wie bisher aus den Runden (`wagenStufe` in `lesen-stand.js` und
  `rechnen-stand.js`).
- **Die Feier**: Ist ein Lernwagen gewachsen, zeigt das Startbild ihn gross wie beim Gripszug,
  der neue Schritt springt hervor, fünfzehn Punkte darunter (`showLernwagenReward`). Gefeiert
  wird nur, wenn das Startbild wirklich steht – nicht im Augenblick, in dem die Bühne mit
  `?lesen=1` am Startbild vorbei in den Wagen geht. Gemerkt in `lernapp.lernzug.gesehen`, nur
  aufwärts.
- **Die Lernlok** fährt in den Wagen, in dem das Kind zuletzt war; dessen Maskottchen sitzt im
  Führerhaus (`lernapp.lernzug.zuletzt`).
- **Die Gruppe** steckt im Knopf ganz rechts auf der Höhe des Lernzugs: Bahnhofsgebäude, bis zu
  drei Köpfe mit Anfangsbuchstaben, die Zahl der anderen und ein roter Punkt, wenn jemand seit
  dem letzten Blick weitergekommen ist (Wagen, Lernwagen, Sterne der Reise;
  `lernapp.gruppe.gesehen`). Die Liste zeigt je Kind beide Züge; ein Tipp öffnet seinen Zug wie
  bisher. Wer zum ersten Mal auftaucht, bekommt keinen Punkt.
- **Auf dem Handy quer** steht der Rechenwagen jetzt wieder auf dem Startbild (vorher fehlte er
  dort).
- **Prüfungen**: neu `scripts/check-startbild.mjs` (vier Bildschirme, gleicher Massstab,
  nichts verdeckt, Schild ab dem Fahrgestell, goldene Räder, Feier einmal, Gruppe mit Punkt,
  Lernlok); angepasst `check-rechenecke.mjs`, `check-bestenliste.mjs`,
  `validate-train-gruppe.mjs`.

---

## 1. Die Idee in drei Sätzen

Hinten am neuen Lernzug hängt ein blauer amerikanischer **Caboose** – der Wagen, der in
Amerika früher am Ende jedes Güterzugs fuhr, mit einem kleinen **Aussichtsturm** auf dem Dach.
Darin wohnt **Rocco, ein Waschbär**, der nur Englisch spricht: Vom Aussichtsturm aus entdeckt
das Kind Wimmelbilder, in denen jedes Ding beim Antippen seinen englischen Namen sagt, im Regal
stehen Bildgeschichten, und jedes gefundene Wort klebt Rocco als Sticker in sein Wörterbuch.
Die Englischecke will nicht Grammatik lehren, sondern **das Ohr öffnen** – für 4- bis
8-Jährige, ohne Lesen, ohne Sprechzwang, mit Deutsch auf Knopfdruck.

## 2. Was erreicht werden soll – und was nicht

**Realistische Ziele.** In der Deutschschweiz beginnt Englisch in der Schule erst in der
**3. Klasse** (Zürich, Aargau, Luzern, St. Gallen), in den Passepartout-Kantonen (BE, BL, BS,
FR, SO, VS) sogar erst in der **5. Klasse** [2, 4, 6, 7, 10]. Im Kindergarten und im 1. Zyklus
ist es nicht vorgesehen [11]. Die Englischecke ist also ein **freiwilliges Vorangebot**.

Die Forschung zum Altersfaktor rät zur Bescheidenheit: Im Unterricht holen spätere Starter
frühe schnell ein (Muñoz in Barcelona [16, 17]; Pfenninger in Zürich: wer mit 13 begann, hatte
die Kinder mit Start mit 8 nach sechs Monaten eingeholt [18, 19]). Was zählt, sind Menge und
Qualität des Inputs – und die **Lesefähigkeit in Deutsch** war der stärkere Faktor [18].

Daraus folgt, was die Englischecke leisten soll:

- **Freude und Neugier** auf eine andere Sprache – eine positive Haltung, die bleibt.
- **Ein vertrautes Ohr**: amerikanische Laute, Satzmelodie, die ersten 200 bis 300 Wörter und
  50 bis 80 feste Wendungen («It's a …», «I like …», «Where is …?»), **verstanden**, nicht
  auswendig gelernt.
- **Verstehen vor Sprechen**: Wer mag, spricht mit; niemand muss.
- **Kein Wettrennen** und keine Konkurrenz zum Deutsch-Lesenlernen in der Leseecke – das ist
  für die Schule wichtiger [18].

Nicht das Ziel: Vokabellisten, Grammatik, englisches Lesen und Schreiben, Punktejagd.

## 3. Leitplanken

- **Hören zuerst.** Jedes Wort und jeder Satz kommt als Aufnahme. Das Kind tippt, zeigt,
  ordnet – sprechen ist nie Bedingung (stille Phase, Krashen und Tabors [20, 21]).
- **Ein Bild erklärt alles.** Jede englische Äusserung hat ein Bild, das sie eindeutig macht
  (Wimmelbild, Comic, Geste). So wird Englisch verständlich, ohne übersetzt zu werden.
- **Deutsch auf Knopfdruck – als Sandwich.** Der Knopf **DE** sagt die ganze Äusserung auf
  Deutsch und danach noch einmal auf Englisch (Sandwich-Technik nach Butzkamm [25]). Nie
  gemischte Sätze («Das ist ein *apple*»): Ein Sprachwechsel an der Satzgrenze kostet Kinder
  kaum etwas, mitten im Satz schon [26].
- **Englisch kommt immer zuerst.** Deutsch nur auf Wunsch. «So viel Fremdsprache wie möglich,
  so wenig Deutsch wie nötig» – Anleitungen dürfen am Anfang deutsch sein [11]. In der
  Englischecke heisst das: Die vertraute deutsche Stimme erklärt kurz, *was* zu tun ist; alles,
  worum es *geht*, ist Englisch.
- **Keine Schrift für die Kleinen.** Englische und deutsche Laut-Buchstaben-Regeln
  widersprechen sich (*a* in «apple», *ee* in «sheep»). Für Kinder, die gerade Deutsch lesen
  lernen, bleibt Englisch rein hörbar. Ab etwa 7 oder einer Lesestufe der Leseecke gibt es auf
  Wunsch ein kleines **Wortbild** unter dem Bild (wie in Peekaboo Barn), keine Lese- oder
  Buchstabieraufgaben, kein englisches Phonics [11, 44].
- **Wiederholen über Tage, nicht am Stück.** Ein Wort einmal zuordnen heisst nicht, es zu
  behalten [27, 28]. Die Englischecke bringt Wörter an verschiedenen Tagen wieder, in
  verschiedenen Bildern und Spielen (Spacing [29, 30]), und dieselbe Geschichte gern mehrmals
  [31].
- **Bewegung hilft.** Wer tut, was er hört («Tap the red apple!», «Touch your nose!»), behält
  es besser (TPR, Asher; Gesten bei Fünfjährigen, Tellier [22, 23, 24]).
- **Nichts lenkt ab.** Animationen, die zeigen, was erzählt wird, helfen; Gimmicks und
  Wackelbilder, die mit der Geschichte nichts zu tun haben, schaden – gerade schwächeren Kindern
  (Meta-Analyse Takacs, Swart & Bus [33]; die vier Säulen von Hirsh-Pasek: aktiv, engagiert,
  bedeutungsvoll, sozial [34]).
- **Kurz.** Eine Runde dauert ein bis drei Minuten. Kein Zeitdruck, keine Leben, kein Tagesziel,
  das verfällt.
- **Fehler werden vorgeführt.** Tippt das Kind daneben, sagt Rocco, was es angetippt hat
  («A pig.»), und fragt noch einmal. Kein rotes Kreuz.
- **Amerikanisch durchgehend.** US-Stimme *und* US-Wörter und -Schreibweise: *mom, fall,
  cookie, fries, candy, pants, sneakers, soccer, truck, color, favorite*, Z als «zee». Hinweis
  für die Eltern: Das Schullehrmittel «Young World» ist britisch geprägt (eine Unit heisst
  «Apples and crisps» [12]). Beides ist richtig; die Elternkarte nennt die Wörter, die sich
  unterscheiden.

## 4. Was die Forschung sagt – und was die Englischecke daraus macht

| Einsicht | Quelle | In der Englischecke |
| --- | --- | --- |
| Verstehen kommt vor Sprechen; anfangs sagen Kinder wenig, oft nur feste Ganzsätze | Krashen [20], Tabors [21] | Antippen und Zeigen als Standard; feste Wendungen («It's a …») statt Grammatik; Sprechen freiwillig |
| Wer die Handlung ausführt, behält besser | Asher [22], Tellier [23], Andrä et al. [24] | «Rocco says»: Dinge antippen, ziehen, Rocco anziehen; Mitmach-Verse |
| Übersetzen als ganzer Satz, nicht gemischt | Butzkamm [25], Byers-Heinlein et al. [26] | Knopf DE: Deutsch, dann noch einmal Englisch |
| Ein Wort zuordnen heisst nicht, es zu behalten | Horst & Samuelson [27], Vlach & Sandhofer [28] | Drei Wortstände: gehört, erkannt, sitzt (an zwei Tagen) |
| Verteiltes Wiederholen schlägt massiertes, schon bei 3-Jährigen | Childers & Tomasello [29], Vlach et al. [30] | Rocco schlägt Wörter vor, die ein paar Tage nicht dran waren |
| Dieselbe Geschichte mehrmals bringt mehr als viele verschiedene | Horst, Parsons & Bryan [31]; Meta-Analyse [32] | Lieblingsgeschichten immer wieder; Geschichten mit wiederkehrenden Mustern |
| Digitale Bilderbücher: Animationen helfen, Ablenkungen schaden | Takacs, Swart & Bus [33] | Entdecken und Geschichte sind getrennte Modi; in Geschichten nur Dinge antippbar, die im Satz vorkommen, und nicht während des Vorlesens |
| Gute Lern-Apps sind aktiv, engagiert, bedeutungsvoll, sozial | Hirsh-Pasek et al. [34] | Klare Aufgabe statt Wischen; Bezug zur Welt des Kindes; Elternkarte und Aufträge für die Familie |
| Lieder stärken das Verstehen, kaum das Sprechen; Singen macht Freude | Coyle & Gómez Gracia [35], Busse et al. [36] | Jukebox mit Versen – als Ergänzung, nicht als Kern |
| Eine Figur, der man etwas beibringt, motiviert (Protégé-Effekt) | Chase et al. [38], Tanaka & Matsuzoe [39], Chen et al. [40] | Rocco ist mal Lehrer, mal der, der etwas sucht und Hilfe braucht |
| «Eine Person, eine Sprache» ist weder nötig noch hinreichend | De Houwer [41] | Rocco spricht Englisch, die vertraute Stimme Deutsch – als Gestaltung, nicht als Lernregel verkauft |

## 5. Die Englisch-Leiter

Wie die Rechenleiter: sechs Sprossen, die Stufe des Kindes (leicht, mittel, schwer) setzt den
Anfang, Eltern können ihn verschieben.

| Sprosse | Etwa ab | Das Kind kann danach | Typische Spiele |
| --- | --- | --- | --- |
| 1 · Lauschen | 4 | englische Wörter zum Bild hören, Tiergeräusche auf Englisch («woof», «moo») | Entdecken, Geschichten anhören, Jukebox |
| 2 · Wörter verstehen | 4½ | das gehörte Wort im Bild finden | Hear & find, Memory Bild–Ton, Yes or no? |
| 3 · Wendungen verstehen | 5 | «Where is …?», «I like …», «Tap the red …!» verstehen und ausführen | Rocco says, Farben-Zug, Feed Rocco, Count with Rocco |
| 4 · Geschichten verstehen | 5½ | einer kurzen Bildgeschichte folgen, Bilder ordnen | Bildgeschichten, Geschichtenzug, bekannte Bücher auf Englisch |
| 5 · Erste Sätze sagen | 6 | grüssen, sich vorstellen, etwas bestellen – mit Bildknöpfen, freiwillig laut | Hello-Telefon, Diner, Echo |
| 6 · Wortbilder | 7 | häufige Wörter als Wortbild wiedererkennen | Wortbild-Memory, Postkarten zum Mitlesen |

**Lehrplan 21.** Die Englischecke liegt vor dem Schulstart, passt aber genau zu dessen
Einstieg: Hören auf A1.1 («vertraute Wörter …, wenn Illustrationen oder Gestik und Mimik dabei
helfen, z. B. Reim, Kinderlied, Anweisung»), Lesen auf A1.2 mit «Bildergeschichte, Comic»,
und *Kulturen im Fokus* [11]. Im 1. Zyklus gibt es nur in Deutsch (D.5) einen Anknüpfungspunkt:
Grussformen und den «Klangbild anderer Sprachen» erkunden [11]. Die Welten in Abschnitt 6
übernehmen die Wortfelder von «Young World 1» (You and me, My body, Apples and crisps, Through
the year, The house, Happy birthday, Christmas [12]) – wer später in der Schule damit beginnt,
kennt vieles schon vom Hören.

## 6. Die Welten: Wortschatz und Wendungen

Der Wortschatz ist in **Welten** geordnet – Orte, an die Roccos Caboose fährt. Jede Welt hat
ein Wimmelbild, zwei bis drei Bildgeschichten, Spiele und einen **Aufnäher** für den Wagen
(Abschnitt 13). Farben und Zahlen bis zehn laufen quer durch alle Welten.

| Welt | Wörter (Auswahl) | Wendungen | Geschichte, Vers, Kultur |
| --- | --- | --- | --- |
| **The Farm** – Bauernhof | cow, pig, sheep, horse, chicken, egg, duck, dog, cat, barn, tractor, tree, apple, sun, flower | It's a … · The cow says moo. · Where is the …? | «Rocco and the red ball»; Tiergeräusche anders als bei uns (woof, cock-a-doodle-doo); Vers «Old MacDonald» (traditionell) |
| **My House** – Zuhause | house, door, window, bed, table, chair, sofa, lamp, bath, mom, dad, baby, sister, brother, grandma, grandpa | This is my … · The cat is under the bed. | in, on, under; Familie |
| **The Kitchen** – Küche | apple, banana, bread, milk, water, cheese, egg, cake, pancake, cookie, juice, cup, plate, spoon | I like … · Yummy! · Can I have …, please? · Thank you! | Pancakes zum Frühstück; Höflichkeit |
| **The Park** – Spielplatz | slide, swing, sandbox, ball, kite, bike, bench, bird, run, jump, climb | Let's play! · I can jump. · My turn! | Bewegung (TPR) |
| **The Zoo** | lion, elephant, giraffe, monkey, tiger, zebra, bear, snake, penguin, crocodile | The elephant is big. · The monkey is funny. | big – small, Farben |
| **The Beach** – Strand | sea, sand, shell, crab, fish, boat, wave, hat, ice cream, bucket | It's hot! · Look, a crab! | Wetter |
| **The City** – Stadt | car, bus, school bus, train, truck, plane, fire truck, taxi, street, traffic light | Stop! · Go! · The bus is yellow. | gelber Schulbus, gelbes Taxi |
| **School** – Schule | pencil, crayon, book, bag, scissors, glue, paper, teacher, numbers 1–10 | Sit down, please. · Stand up! · Listen! | Klassenzimmer-Englisch, wie später in der Schule |
| **My Body** – Körper | head, eyes, ears, nose, mouth, hands, feet, arms, legs, hair, teeth | Touch your nose! · I have two eyes. | Vers «Head, shoulders, knees and toes» (traditionell); Monster malen |
| **Clothes & Weather** – Kleider und Wetter | hat, coat, scarf, boots, T-shirt, pants, sneakers, rain, snow, sunny, windy | It's raining. · Put on your hat! | spring, summer, fall, winter |
| **Party Time** – Fest | cake, candle, present, balloon, party hat, friends | Happy birthday! · How old are you? – I'm five. | Geburtstag, Zahlen |
| **Holidays** – Feiertage | pumpkin, ghost, Christmas tree, snowman, star, turkey, pie | Trick or treat! · Merry Christmas! | Halloween, Thanksgiving, Christmas in Amerika |

Dazu das, was zu jeder Welt gehört und im Wagen selbst wohnt: **Hello, goodbye, please,
thank you, yes, no, my name is …, how are you? – I'm fine** (Telefon, Abschnitt 7).

Zusammen sind das gut **220 Wörter und 60 Wendungen** – genug für zwei Jahre, und genau der
Wortschatz, mit dem der Schulunterricht später beginnt.

## 7. Der Englischwagen – ein Caboose

**Von aussen.** Blau, mit rotem Dach, einem Aussichtsturm (*cupola*) mit zwei Fenstern und
offenen Plattformen mit weissem Geländer an beiden Enden. Im mittleren Fenster schaut Rocco
mit seiner blauen Kondukteursmütze heraus, am Wagen ein Schild «Hello!». Die drei Lernwagen
sind damit **rot, gelb und blau** – jeder auf einen Blick zu unterscheiden. Mit jeder Welt, die
das Kind schafft, kommt ein **Aufnäher** an die Wand (Abschnitt 13), wie Reiseaufkleber an
einem alten Koffer.

**Von innen** (1000 × 560 wie die anderen Zimmer; Stilprobe, Ansicht «Englischwagen»):

| Ding | Wo | Dahinter | Etappe |
| --- | --- | --- | --- |
| **Rocco** im Schaukelstuhl, darüber die **Karte** | Mitte | Hauptmission: Rocco schlägt vor, was dran ist | 1 |
| **Aussichtsturm** mit Leiter («LOOKOUT») | Mitte oben | **Entdecken**: die Wimmelbilder der Welten | 1 |
| **Regal** mit Bilderbüchern | links | **Bildgeschichten**, später bekannte Bücher auf Englisch | 1 |
| **Roccos Wörterbuch** auf dem Tischchen | links unten | alle Sticker, die Welten, die Aufnäher | 1 |
| **Spielzeugkiste** | rechts unten | Spiele (Hear & find, Rocco says, Farben-Zug …) | 1 |
| **Jukebox** | rechts | Verse und Lieder zum Mitmachen | 2 |
| **Telefon** an der Wand | Mitte rechts | Hello-Telefon: die ersten kleinen Gespräche | 3 |
| **Briefkasten** mit roter Fahne | Mitte unten | Post aus Amerika (Postkarten) | 3 |
| **Tür** | links | in den Rechenwagen | 1 |

**Die Einrichtung in 15 Schritten – und jedes Ding ist ein Wort.** Wie Lese- und Rechenwagen
wird der Caboose mit jeder fertigen Runde gemütlicher (nach 1, 2, 4, 6, 9, 12, 15, 19, 23, 28,
33, 39, 45, 52 und 60 Runden). Im Rechenwagen ist jedes neue Ding eine Zahl; im Englischwagen
ist es ein **englisches Wort aus Amerika**, und Rocco stellt es vor («Look! A lantern!»):

1 *lantern* (Laterne) · 2 *quilt* (Patchwork-Decke) · 3 *baseball and glove* · 4 *curtains*
mit Sternen · 5 *sunflowers* · 6 *pumpkin* · 7 *school bus* (Spielzeug, gelb) · 8 *cowboy hat*
· 9 *pennants* (Wimpelkette) · 10 *globe* · 11 *cactus* · 12 ein Bild der *Golden Gate Bridge*
· 13 *popcorn machine* · 14 *fairy lights* (Lichterkette) · 15 *stars* im Aussichtsturm.

## 8. Rocco, der Waschbär

**Warum ein Waschbär.** Er stammt aus Nordamerika, jedes Kind erkennt ihn an der Maske und dem
geringelten Schwanz, er ist neugierig und ein bisschen frech – und es gibt ihn in der App noch
nicht (die Lokführer sind Fuchs, Bär, Hase, Katze, Panda, Frosch, Eule, Pinguin, Löwe, Maus,
Eichhörnchen und Steinbock). Er trägt eine blaue Kondukteursmütze, weil der Caboose früher der
Wagen des Zugbegleiters war.

**Seine Rolle.**

- **Er spricht nur Englisch.** Die deutsche Hilfe kommt von der vertrauten Stimme der App, nicht
  von ihm. Das ist eine Gestaltungsregel, die es Kindern leicht macht; als Lernregel ist «eine
  Person, eine Sprache» nicht belegt [41].
- **Mal Lehrer, mal Suchender.** Meist zeigt und erzählt Rocco. In manchen Spielen sucht er
  selbst etwas und braucht Hilfe («Rocco is looking for the duck. Can you help him?»). Kinder
  strengen sich für eine Figur, der sie helfen, mehr an als für sich selbst; am besten wirkt
  eine Figur, die zwischen beiden Rollen wechselt [38, 39, 40].
- **Er sammelt Wörter.** Jedes Wort, das das Kind entdeckt, klebt er als Sticker in sein
  Wörterbuch (Abschnitt 13).
- **Er hat einen festen Namen.** Anders als Lesewurm und Drache wird Rocco nicht getauft: Er
  spielt in den Bildgeschichten mit, und dort steht sein Name in jedem Satz. Ein eigener Name
  hätte keine Aufnahme.
- **Er wächst nicht.** Lesewurm und Drache haben je drei Leben zu 15 Stufen; noch eine
  Wachstumsfigur wäre eine Kopie. Roccos Fortschritt ist sein Wörterbuch und der Wagen.

**Andere Möglichkeiten** (Entscheid 3): ein **Papagei**, der nachplappert (passt zum Nachsprechen,
ist aber nicht amerikanisch und ein Klischee); ein **Bärenjunges «Teddy»** (der Teddybär ist nach
Theodore Roosevelt benannt, aber ein Bär fährt schon als Lokführer); ein **Weisskopfadler**
(zu sehr Wappentier).

## 9. Entdecken: die Wimmelbilder

Der Kern der Englischecke und das, was ausdrücklich gewünscht ist. In der Stilprobe spielbar
(Ansicht «Entdecken»).

- **Ein Bild je Welt**, voll mit Dingen, die ein Kind sofort erkennt (Bauernhof: 13 Dinge).
  Kein Text im Bild.
- **Erster Tipp:** Das Ding wackelt, Rocco sagt das Wort mit Artikel: «A cow.»
- **Zweiter Tipp:** ein kurzer Satz, der zeigt, was es tut oder wie es ist: «The cow says moo.»
  «The duck is swimming.» «The apple is red. Yum!» So kommen Farben, Tunwörter und Wendungen
  ganz nebenbei.
- **Knopf DE:** «Eine Kuh.» – und gleich wieder «A cow.» (Sandwich).
- **Gefunden:** Ein Stern erscheint am Ding, ein Punkt in der Leiste unten füllt sich (4 / 13),
  und im Wörterbuch klebt ein neuer Sticker.
- **Hinweis:** Tippt das Kind eine Weile nichts an, funkelt ein Ding, das es noch nicht
  gefunden hat. Mehr nicht – kein Timer, kein Drängen.
- **Was nicht passiert:** keine Punkte, keine Animation, die mit dem Wort nichts zu tun hat
  (Abschnitt 4, [33]).
- **Später im selben Bild:** «What's missing?» (ein Ding verschwindet) und Hear & find (Rocco
  fragt, das Kind tippt) – dasselbe Bild, neue Aufgabe, so kommen die Wörter an anderen Tagen
  wieder.

**Die Bilder** werden gemalt wie die Bilder der Bücher (`bilder/buecher/…`, WebP), je Welt
eines in 1600 × 900, die antippbaren Dinge als Flächen (Polygone) in einer kleinen Datei
daneben. Die Stilprobe zeichnet sie einfacher, als SVG. Jedes Ding braucht eine Fläche, die
ein Kinderfinger trifft (mindestens 48 Pixel), auch wenn das Ding klein ist (die Äpfel im Baum
haben in der Stilprobe eine unsichtbare grössere Fläche).

## 10. Bildgeschichten

Kurze Comics, in denen ganz klar zu sehen ist, was passiert. In der Stilprobe spielbar
(Ansicht «Geschichte»: «Rocco and the red ball»).

- **Vier bis acht Bilder**, je ein bis zwei kurze Sätze, im Präsens, mit Wörtern der Welt.
  Ein Muster, das wiederkehrt («Up, up, up!», «Oh no!», «Thank you!»).
- **Tipp auf ein Bild:** Rocco erzählt es; das Bild leuchtet. **Ganze Geschichte:** alle
  Bilder nacheinander, mit Titel und «The end.».
- **Knopf DE:** das aktuelle Bild auf Deutsch, dann noch einmal Englisch.
- **Dinge im Bild** (Ball, Baum, Hund, Rocco) sagen ihr Wort – aber nur Dinge, die im Satz
  vorkommen, und nicht, während erzählt wird. Sonst wird die Geschichte zum Suchspiel und das
  Verstehen leidet [33].
- **Lieber wiederholen als viele.** Dieselbe Geschichte mehrmals bringt mehr Wörter als
  verschiedene [31]. Rocco schlägt Lieblingsgeschichten wieder vor; später gibt es zu jeder
  Geschichte den **Geschichtenzug** (Bilder in die richtige Reihenfolge kuppeln, wie in der
  Leseecke).
- **Bekannte Bücher auf Englisch** (Etappe 2): Die 24 Bücher der Leseecke haben schon gemalte
  Bilder. Eine stark vereinfachte englische Fassung – ein Satz je Seite – ist die billigste
  und wirksamste Quelle für Geschichten: Das Kind kennt die Handlung schon auf Deutsch und
  versteht deshalb das Englische. Bruno, Pippa, Fino und Eule Ella sprechen dann Englisch.

## 11. Verse, Lieder und Mitmachen

Die **Jukebox** spielt kurze Verse: «Hello, hello, how are you?», ein Farben-Vers, ein
Zähl-Vers bis zehn, «Head, shoulders, knees and toes», «Old MacDonald» (beide traditionell).
Das Schullehrmittel übt die Aussprache am Anfang «vor allem mit Liedern, chants und rhymes» [13].

- Die Google-Stimme **singt nicht**. Darum entweder **Sprechverse im Takt** (die Stimme spricht,
  darunter ein einfacher Rhythmus), oder **eigene Aufnahmen** der Familie – so wie die Laute der
  Leseecke selbst aufgenommen sind (`laute-aufnehmen.html`). Entscheid 10.
- Wer mitmacht, bewegt sich: Beim Vers tippt das Kind die Körperteile an Rocco an, hebt Arme
  (Mitmach-Bilder), klatscht. Lieder stärken das Verstehen, für das Sprechen reichen sie allein
  nicht [35] – sie sind Ergänzung, nicht Kern.

## 12. Die Spiele – Ideensammlung

«ab» ist ein Richtwert; jedes Spiel hat drei Stufen und wächst mit wie in Lese- und Rechenecke.

| Spiel | Ort | Was das Kind tut | Übt | ab | Etappe |
| --- | --- | --- | --- | --- | --- |
| **Entdecken** | Aussichtsturm | Wimmelbild: antippen, Wort hören, nochmal: Satz | Wörter hören | 4 | 1 |
| **Hear & find** | Kiste, Karte | «Where is the cow?» – das Bild antippen; fünf Wörter je Runde, zuerst die gehörten | Wörter verstehen | 4 | 1 |
| **Bildgeschichten** | Regal | zuhören, Bild für Bild, auf Wunsch Deutsch | Sätze im Zusammenhang | 4 | 1 |
| **Memory Bild–Ton** | Kiste | Karten: ein Bild und ein Lautsprecher; Paare finden | Wörter festigen | 4½ | 2 |
| **Yes or no?** | Kiste | «Is this a cat?» – Daumen hoch oder runter | Wörter, Fragen | 4½ | 2 |
| **Rocco says** | Kiste | «Tap the red apple!» – erst ein Merkmal, dann zwei («the big red apple») | Farben, Wörter, TPR | 5 | 2 |
| **Farben-Zug** | Kiste | «A blue wagon, please!» – den Wagen in der Farbe ankuppeln | Farben | 4 | 2 |
| **Count with Rocco** | Kiste | Dinge zählen, «How many ducks?» – die Zahl antippen; bis 10, später bis 20 | Zahlen (Verbindung zur Rechenecke) | 4½ | 2 |
| **Feed Rocco** | Kiste | «Rocco wants a banana.» – ihm das Richtige geben; «Yummy!» oder «Yuck!» | Essen, I like | 4½ | 2 |
| **Verse und Lieder** | Jukebox | mitmachen, mitsprechen | Aussprache, Wendungen | 4 | 2 |
| **Bekannte Bücher auf Englisch** | Regal | die Bücher der Leseecke, einfach erzählt | Verstehen | 5 | 2 |
| **What's missing?** | Aussichtsturm | im Wimmelbild verschwindet ein Ding; aus drei Bildern das richtige | Wörter | 5 | 3 |
| **Dress up** | Kiste | «Put on the hat!» – Rocco anziehen | Kleider, Befehle | 5 | 3 |
| **Geschichtenzug** | Regal | die Bilder einer gehörten Geschichte ordnen | Verstehen | 5½ | 3 |
| **Hello-Telefon** | Telefon | «Hello! What's your name?» – mit Bildknöpfen antworten; wer mag, laut | Grüssen, sich vorstellen | 5 | 3 |
| **Diner** | Jukebox / Diner-Ecke | Rocco bestellt «A pancake, please!», das Kind serviert; später bestellt das Kind | Höflichkeit, Essen | 6 | 3 |
| **Echo** | Telefon | Wort hören, selbst sagen, die eigene Aufnahme anhören (bleibt auf dem Gerät, keine Bewertung) | Aussprache | 6 | 3 |
| **Post aus Amerika** | Briefkasten | Postkarte von Roccos Cousine hören, für Lesende auch mitlesen | Kultur, Sätze | 6 | 3 |
| **Monster malen** | Kiste | «Two eyes. Three legs. Green!» – das Monster nach dem Gehörten bauen | Zahlen, Farben, Körper | 6 | 4 |
| **Where is the cat?** | Wimmelbild Zuhause | «The cat is under the bed.» – das richtige von drei Bildern | in, on, under | 6 | 4 |
| **Opposites** | Zoo | big – small, hot – cold, happy – sad: Paare zuordnen | Gegenteile | 6 | 4 |
| **Wortbild-Memory** | Wörterbuch | für Lesende: Bild zum Wortbild legen | Schriftbild | 7 | 4 |

**Hear & find genauer** (spielbar in der Stilprobe): Rocco fragt «Where is the cow?». Richtig:
«Yes!» oder «Great job!», dann das Wort noch einmal, und ein Stern am Bild. Daneben: Rocco sagt
das angetippte Wort («A pig.») und fragt noch einmal. Ein Wort gilt als **erkannt**, wenn es
beim ersten Versuch stimmt. Am Schluss: «You found them all! Great job!»

## 13. Fortschritt: Wörterbuch, Aufnäher, Wagen

Drei Ebenen, alle sichtbar, nichts verfällt.

**Je Wort – drei Stände** (wie «sitzt» im Rechenstand):

| Stand | Wann | Im Wörterbuch |
| --- | --- | --- |
| gehört | im Wimmelbild oder in einer Geschichte angetippt | Sticker in Farbe |
| erkannt | in einem Spiel beim ersten Versuch richtig | Sticker mit Stern |
| sitzt | an zwei verschiedenen Tagen erkannt | Sticker mit Goldrand |

Rocco schlägt auf seiner Karte vor, was dran ist – am liebsten Wörter, die **erkannt, aber noch
nicht sicher** sind und ein paar Tage nicht vorkamen (verteiltes Wiederholen [29, 30]).

**Je Welt – ein Aufnäher.** Sind alle Wörter einer Welt erkannt, näht Rocco ihren Aufnäher an
den Caboose (die Scheune für den Bauernhof, ein Elefant für den Zoo …). Sitzen alle, bekommt er
einen Goldrand. Das Wörterbuch zeigt rechts «Roccos Reise» mit allen zwölf Welten und wie weit
jede ist (Stilprobe, Ansicht «Wörterbuch»).

**Der Wagen – 15 Schritte aus Runden.** Wie bei Lese- und Rechenwagen. Als **Runde** zählt:
eine Runde in einem Spiel, eine Geschichte bis «The end.», ein Wimmelbild, in dem alles
gefunden ist, ein Vers bis zum Schluss.

**Was es nicht gibt:** keine Tagesserien (Streaks), keine Ranglisten, nichts, das schrumpft.

## 14. Der Umbau des Startbilds

### 14.1 Heute

Gemessen am Laptop (1280 × 800) und am Handy quer (844 × 390):

- **Unten** der Gripszug: fünf Wagen und die Lok, die Wagen je gut 165 Pixel breit (Handy etwa
  105), rechts der grüne Knopf. Jeder Wagen wird in zwölf Schritten gebaut und beladen, am
  Schluss mit Wimpel und goldenen Rädern (`train-progress.js`, `train-art.js`).
- **Links** der Lesewagen (höchstens 16 % der Breite, `positionLesewagen`), **darüber** der
  Rechenwagen auf einem zweiten Abstellgleis (`positionRechenwagen`). **Auf dem Handy quer fehlt
  der Rechenwagen**: Über dem Lesewagen ist weniger als 70 Pixel Platz; er ist dann nur über die
  Tür im Lesewagen erreichbar.
- **Rechts oben** der Bauplatz (`positionBauplatz`).
- **In der Mitte** die Züge der Gruppe, gestapelt über dem eigenen Zug, höchstens zwei Drittel
  der Breite (`layoutFriends`). Mit drei Geschwistern sind sie am Laptop noch gut, auf dem Handy
  nur noch Striche von 150 Pixeln Breite.
- Ein **dritter Lernwagen** hätte nirgends mehr Platz.

### 14.2 Das Ziel

**Zwei Gleise, zwei Züge, beide gleich gross** – genau wie gewünscht (Stilprobe, Ansicht
«Startbild»):

- **Unten der Gripszug**, wie heute.
- **Oben der Lernzug** auf einem zweiten Gleis, das auf einer Terrasse etwas weiter hinten in
  der Landschaft liegt. Von rechts: die **Lernlok**, dann **Lesewagen**, **Rechenwagen** und
  zuletzt der **Englischwagen** – der Caboose gehört ans Ende.
- **Ganz rechts, auf der Höhe der Züge,** der Knopf für die **Gruppe**.
- **Rechts oben** bleibt der Bauplatz, **links oben** der Knopf für die Landschaft.
- Die Mitte des Himmels bleibt frei. Das Bild wird ruhiger als heute, obwohl mehr drauf ist.

**Weitere Ideen, die verworfen sind:** ein *Lokdepot mit Drehscheibe* (die Züge stehen im
Schuppen, das Kind wischt von einem zum anderen – versteckt zu viel), ein *Bahnhof mit
Perrons als Menü* (übersichtlich, aber kein Bild mehr) und *Reiter oben* (wie eine Website). Die
zwei Gleise sind besser: Alles bleibt mit einem Tipp erreichbar, und das Bild erzählt, dass
es zwei Züge gibt – einen zum Knobeln, einen zum Lernen.

**Platz für später:** Das obere Gleis ist so lang wie das untere. Der Lernzug hat noch Platz für
zwei Wagen (zum Beispiel Musik oder Französisch), ohne dass sich am Bild etwas ändert.

### 14.3 Der Lernzug

- **Die Lernlok**: klein, lila (die Farbe der App), mit Glocke und dem Schild «ABC 123». Im
  Führerhaus sitzt, wer **zuletzt besucht** wurde: der Lesewurm, der Rechendrache oder Rocco.
  Die Lok des Gripszugs mit ihrer Werkstatt bleibt die eigene Lok des Kindes; eine zweite Lok
  zum Gestalten wäre ein späterer Lohn (Entscheid 7).
- **Kein Startknopf**: Ein Tipp auf einen Lernwagen führt hinein, wie heute.
- **Türen zwischen den Wagen**: Weil die drei Wagen jetzt wirklich aneinanderhängen, führen die
  Türen der Reihe nach durch den Zug: Lesewagen ↔ Rechenwagen ↔ Englischwagen.
  `index.html?englisch=1` führt direkt in den Englischwagen.
- **Der Lesewurm auf der Lok** des Gripszugs (wenn der Lesewagen ganz eingerichtet ist) bleibt,
  wie er ist.

### 14.4 Grösse und Lage

Beide Züge haben **denselben Massstab**. Er richtet sich nach dem engeren von zwei Massen:

- der **Breite**: Gripszug mit fünf Wagen, Lok und grünem Knopf (heute schon so gerechnet);
- der **Höhe**: Knopfleiste oben, Lernzug mit Wimpel, Gripszug mit Fahne und ein Streifen Wiese.

| Bildschirm | Massstab etwa | Wie es aussieht |
| --- | --- | --- |
| Laptop 1280 × 800 | 1 (wie heute) | viel Himmel über dem Lernzug; Gruppe-Knopf rechts zwischen Bauplatz und Lok |
| Tablet quer 1024 × 768 | 0,85 | wie Laptop, etwas kleiner |
| Tablet hoch 768 × 1024 | 0,64 (von der Breite) | der Lernzug steht höher, oben bleibt viel Himmel |
| Handy quer 844 × 390 | 0,62 (wie heute) | knapp: Die Räder des Lernzugs stehen direkt über den höchsten Wagen des Gripszugs (Stilprobe, «Handy quer») |

Reicht auf einem sehr flachen Bildschirm die Höhe nicht, werden **beide Züge zusammen**
kleiner – nie nur der obere. Ein Prüfskript misst auf allen vier Bildschirmen, dass kein Zug
einen Knopf zudeckt und keiner kleiner als heute wird (Abschnitt 14.8). Das **zweite
Wagen-Set** (Einhorn, Wal, Roboter, Piratenschiff) ist höher als das erste; auf dem Handy quer
muss das Skript genau diesen Fall prüfen.

### 14.5 Der Fortschritt am Lernwagen

Heute sieht man den Fortschritt von Lese- und Rechenwagen von aussen kaum: Vorhänge ab dem
vierten Schritt, Blumenkästen ab dem fünften, die Lichterkette erst am Schluss
(`buildLesewagen`, `wagenAussen`). Am Gripszug dagegen sieht jedes Kind auf einen Blick, wie weit
ein Wagen ist. Zwei Wege, das zu übernehmen – in der Stilprobe umschaltbar («Fortschritt»):

**Variante A · Zierband und Einrichtung von aussen** *(Empfehlung)*. Der Wagen ist vom ersten
Tag an ganz da (man soll ihn betreten wollen). Unter den Fenstern läuft ein **Zierband mit 15
Feldern**, die sich golden füllen; das neueste funkelt. Und jeder Schritt hinterlässt etwas,
das man von aussen sieht:

| ab Schritt | von aussen |
| --- | --- |
| 1 | das Maskottchen schaut aus dem Fenster (Wurm, Drache aus dem Ei, Rocco) |
| 4 | Vorhänge |
| 5 | Blumenkästen |
| 8 | warmes Licht in den Fenstern |
| 9, 11, 13 | **Ladung auf dem Dach**: Bücherstapel, Talertürme, Koffer – eins, zwei, drei |
| 10 | Lichterkette |
| 15 | **Wimpel und goldene Räder** – dasselbe Zeichen wie am fertigen Wagen des Gripszugs |

Beim Englischwagen kommen die **Aufnäher** der Welten dazu.

**Variante B · Bauen wie der Gripszug.** Der Wagen beginnt als Fahrgestell mit einem
gestrichelten Umriss und wird in 15 Schritten gebaut: Wände, Fenster, Dach, Aussichtsturm,
Schild, Maskottchen, Einrichtung, am Schluss Wimpel und goldene Räder. Das ist am nächsten am
Gripszug. Dagegen spricht: Lese- und Rechenwagen sind heute schon ganz da, und ihre 15 Schritte
sind Einrichtung (eine Lampe, ein Teppich …), keine Bauschritte – innen wäre der Wagen fertig,
aussen eine Baustelle. Und ein Kind, das schon weit ist, sähe seinen Wagen beim Umbau
schrumpfen.

**Für beide**: Kommt ein neuer Schritt dazu, zeigt das Startbild beim Zurückkommen eine kleine
Feier wie beim Gripszug (`showWagonReward`): der Wagen gross, 15 Punkte, «Der Englischwagen hat
etwas Neues: a pumpkin!». Ein Tipp auf einen Lernwagen in der Stilprobe zeigt diese Karte.

### 14.6 Die Gruppe hinter einem Knopf

- **Der Knopf** steht ganz rechts auf der Höhe des Lernzugs: ein kleines Bahnhofsgebäude, darunter
  bis zu drei Köpfe in den Farben der Kinder mit ihrem Anfangsbuchstaben, oben eine Zahl (wie
  viele andere in der Gruppe sind). Ohne Gruppe gibt es ihn nicht.
- **Ein Tipp** öffnet «Die Züge der Gruppe»: je Kind der Name und **beide Züge** klein
  übereinander. Ein Tipp auf ein Kind öffnet die Ansicht, die es heute schon gibt
  (`showFriend`): der Zug gross, die Spiele des angetippten Wagens, die Bestenlisten – neu
  zusätzlich die drei Lernwagen, ansehen, nicht ändern.
- **Optional** ein kleiner Punkt am Knopf, wenn jemand aus der Gruppe seit dem letzten Blick
  einen Wagen weitergebracht hat – eine Einladung zum Nachschauen, keine Rangliste (Entscheid 8).
- Die Züge der anderen sind damit nicht mehr bei jedem Start im Bild. Das ist gewollt: Der eigene
  Zug ist der, um den es geht; die anderen sind einen Tipp entfernt.

### 14.7 Was bleibt

Landschaftsknopf links oben, die drei runden Knöpfe rechts oben, der Bauplatz darunter, der
grüne Knopf an der Lok, das Hereinfahren des Zugs beim ersten Tipp, die Wagen-Sets, die
Werkstatt, die Reise.

### 14.8 Was sich im Code ändert

| Wo | Was |
| --- | --- |
| `train-home.js` | `positionLesewagen` und `positionRechenwagen` werden zu **`layoutLernzug`**: ein zweites Zugband auf eigenem Gleis, im Massstab des Gripszugs (gemessen wie heute in `layoutFriends` und `positionStart`). Drei Knöpfe für die Wagen (`.lesewagen-knopf`, `.rechenwagen-knopf`, neu `.englischwagen-knopf`) und einer für die Lok. |
| `train-home.js` | `renderFriends` und `layoutFriends` füllen nicht mehr die Bühne, sondern die Liste hinter dem neuen Knopf (`.gruppe-knopf`). `showFriend` zeigt zusätzlich die Lernwagen. |
| `train-home.js` | eine Feier für neue Schritte an Lernwagen, nach dem Muster von `showWagonReward` |
| `lesen-art.js`, `rechnen-art.js` | `buildLesewagen` und `wagenAussen` zeichnen Zierband, Ladung, Wimpel und goldene Räder (sie bekommen den Ausbau schon heute mit) |
| neu `englisch-art.js` | der Caboose von aussen und von innen, Rocco, die Wimmelbilder |
| `styles.css` | Zugband oben, Gruppe-Knopf und Liste; `.friend-train` wird zur Zeile der Liste |
| Prüfskripte | anpassen: `check-rechenecke.mjs` (erwartet den Rechenwagen *über* dem Lesewagen), `check-leseecke.mjs`, `check-handy.mjs`, `check-bau.mjs` (messen den Lesewagen), `check-bestenliste.mjs` (tippt den fremden Zug auf dem Startbild an). Neu: `check-startbild.mjs` – zwei Züge, gleicher Massstab, kein Knopf verdeckt, alle drei Lernwagen auf allen vier Bildschirmen, Gruppe-Knopf nur mit Gruppe. |

Keine neue Firestore-Regel und keine neue Server-Funktion: Das Startbild liest nur, was schon
im Spielstand steht.

### 14.9 Reihenfolge

Der Umbau ist **Etappe 0** und lässt sich vor der Englischecke bauen: zuerst der Lernzug mit
Lese- und Rechenwagen und der Gruppe-Knopf (dann steht auch auf dem Handy der Rechenwagen
wieder da), danach hängt die Englischecke ihren Caboose an.

## 15. Die Stimme: amerikanisch

**Google Chirp 3 HD hat für Englisch (USA) dieselben 30 Stimmen wie für Deutsch** – auch
*Sulafat*, mit der die ganze App spricht (`en-US-Chirp3-HD-Sulafat`) [58, 59]. Ob dieselbe
Stimme in beiden Sprachen gleich klingt, sagt Google nicht; das zeigt nur ein Hörtest – darum
die Hörproben.

**Hörproben** (Stilprobe, Ansicht «Stimmen»): zehn Stimmen, alle mit demselben Text. Die Dauer
zeigt das Tempo – länger heisst langsamer und für Anfänger leichter:

| Stimme | | Dauer | |
| --- | --- | --- | --- |
| Leda | weiblich | 25,0 s | am langsamsten |
| **Sulafat** | weiblich | 23,1 s | dieselbe wie die App auf Deutsch |
| Erinome | weiblich | 20,7 s | |
| Sadachbia | männlich | 19,6 s | |
| Zephyr | weiblich | 18,7 s | |
| Iapetus | männlich | 18,1 s | |
| Vindemiatrix | weiblich | 16,8 s | |
| Puck | männlich | 15,8 s | in der Stilprobe mit Tempo 0,9 |
| Laomedeia | weiblich | 15,8 s | |
| Achird | männlich | 14,6 s | am schnellsten |

**Empfehlung:** *Sulafat (en-US)* für alles Englische, wenn sie beim Anhören gefällt: ruhig,
deutlich, und klanglich verwandt mit der deutschen Stimme, die das Kind kennt. Die deutsche
Hilfe bleibt *Sulafat (de-DE)*. Wer eine eigene Stimme für Rocco will, nimmt eine zweite (in
der Stilprobe *Puck*, Tempo 0,9) – dann klingt Englisch auch hörbar anders als Deutsch.
Entscheid 4.

**Tempo.** Normal 1,0. Für die Elterneinstellung «langsamer» eine zweite Aufnahme mit 0,85
(Chirp 3 HD kann 0,25 bis 2,0 [58]).

**Technik** (wie `docs/STIMME-GOOGLE.md`):

- Ein dritter Bereich in `scripts/stimme-google.mjs`: `--bereich englisch` mit eigener
  Satzliste (`scripts/stimme-englisch-texte.mjs`) und eigenem Verzeichnis (`englisch-stimme.js`),
  Aufnahmen in `stimme/google/` wie bisher. `stimmeName` und `stimmenListe` kennen dann neben
  `de-DE` auch `en-US`.
- `kids.js` `speak(text, { lang: "en-US" })` sucht im englischen Verzeichnis. Fehlt eine
  Aufnahme, nimmt es die Gerätestimme in en-US (nicht de-DE). Ein Prüfskript meldet jeden
  englischen Satz ohne Aufnahme (wie `check-app-stimme.mjs`).
- **Umfang:** etwa 3'000 Sätze zu je rund 25 Zeichen, zusammen etwa 75'000 Zeichen, mit der
  langsamen Fassung 150'000 – weit im Gratis-Kontingent von 1 Million im Monat [60].
- **Auf die Aussprache hören:** der Artikel «a» allein am Satzanfang («A cow.»), Wörter mit zwei
  Aussprachen (*read, live*), Tiergeräusche (*moo, baa, oink, woof, cock-a-doodle-doo*). Was
  falsch klingt, bekommt eine eigene Aussprache (IPA geht bei Chirp 3 HD für en-US [58]) oder
  eine andere Schreibweise nur für die Anfrage (`AUSSPRACHE` im Skript).
- **Keine Spracherkennung.** Kinderstimmen gehen nicht in eine Cloud. «Echo» nimmt lokal auf und
  spielt sofort ab; nichts wird bewertet oder gespeichert (Etappe 3). Die App kann das schon
  (`laute-aufnehmen.html`).

## 16. Eltern, Schranke, Speichern

**Elternbereich – eine Karte «Englischecke» je Kind** wie bei Lese- und Rechenecke:

- **Bericht:** Wörter je Welt (gehört, erkannt, sitzt), liebste Geschichten, welche Wörter
  Rocco gerade wiederholt, die Wörter, die im britischen Schulenglisch anders heissen.
- **Einstellungen:** *Schrift* (aus · klein unter dem Bild · ab der Lesestufe der Leseecke –
  Standard), *Deutsch-Hilfe* (immer anbieten – Standard · erst nach zweimal Hören · aus),
  *Tempo* (normal · langsamer), *Beginn* (Sprosse der Englisch-Leiter).
- **Aufträge für die Familie** (wie die Aufträge für draussen der Rechenecke): «Sag beim
  Znacht ‹please› und ‹thank you› auf Englisch!» Dafür braucht es keine neue Technik.

**Schranke:** eine Tabelle `ENGLISCHECKE` in `entitlement.js` wie `LESEECKE` und `RECHENECKE`.
Je Spiel eine Runde frei, die erste Welt im Entdecken ganz frei, die erste Geschichte frei.
«Ganze App gratis» öffnet alles.

**Speichern:** ein neuer Kasten `lernapp.englisch` im `gameState`, wie `lernapp.lesen` und
`lernapp.rechnen`: Wortstände (je Wort: gehört, erkannt mit Tagen), Runden, Welten,
Einrichtung, Elterneinstellungen (`lernapp.englisch.eltern`, überleben das Zurücksetzen).
`firestore.rules` lässt im Konto `stats`, `gameState`, `progressReset` und `updatedAt` zu und
schaut nicht in den `gameState` hinein – **eine neue Regel braucht es nicht**.

**Englisch zählt nicht für den Gripszug** – aus denselben Gründen wie Lesen und Rechnen: Ein
sechster Wagen machte den Zug kleiner, der Fahrplan der Reise ginge nicht mehr auf, und die
Prüfskripte rechnen mit fünf Bereichen und 25 Spielen. Der Lohn ist der eigene Wagen im
Lernzug.

## 17. Dateien (Vorschlag)

| Datei | Inhalt |
| --- | --- |
| `train-englischecke.js` | das Zimmer als Ansicht der Bühne (`mount({ host })` wie `train-leseecke.js`) |
| `englisch-art.js` | Caboose aussen und innen, Rocco, Sticker |
| `englisch-stand.js` | Katalog der Welten, Wörter und Spiele, Wortstände, Runden, Einrichtung, Vorschläge, Bericht |
| `englisch-welten.js` | je Welt: Wörter, Sätze, deutsche Fassung, Flächen im Wimmelbild, Geschichten |
| `englisch-spiel.js` | gemeinsamer Rahmen der Spiele (wie `rechnen-spiel.js`), mit Knopf DE |
| `englisch-spiele-1.js` … | die Spiele je Etappe, jedes mit eigener Seite (`hoerfind.html` …) |
| `englisch-stimme.js` | Verzeichnis der englischen Aufnahmen |
| `bilder/englisch/<welt>/` | Wimmelbild und Bilder der Geschichten (WebP) |
| `scripts/stimme-englisch-texte.mjs` | alle englischen und deutschen Sätze |
| `scripts/validate-englisch.mjs`, `scripts/check-englischecke.mjs` | Prüfungen wie bei der Rechenecke |
| `scripts/check-startbild.mjs` | das neue Startbild auf vier Bildschirmen (Abschnitt 14.8) |

## 18. Vorbilder – was andere gut machen

| Vorbild | Was gut ist | Was die Englischecke nicht übernimmt |
| --- | --- | --- |
| **tiptoi «Mein erstes Bild-Wörterbuch Deutsch-Englisch»** (3–6) | Bild antippen, Wort hören, auf Deutsch und Englisch – das direkteste Vorbild fürs Entdecken [54] | – |
| **Peekaboo Barn** | ein Tipp, ein Tier, sein Geräusch, sein Name, klein geschrieben; ruhig, ohne Werbung und Käufe [56] | wenig Lerntiefe [57] |
| **Gus on the Go** | eine Begleitfigur, kurze Lektion, danach ein Wiederholungsspiel; Einmalkauf [49] | wenig Inhalt |
| **Lingokids** | viel Wortschatz, Lieder, Spiele, Bildschirmzeit-Timer [46] | teures Abo, kaum Führung durch die Riesenbibliothek |
| **Studycat Fun English** | Spiele, Lieder, Geschichten; Spracherkennung auf dem Gerät [50] | Abo-Druck |
| **Endless Alphabet** | keine Ziele, kein Zeitdruck, Bedeutung durch Animation [51] | – |
| **Khan Academy Kids** | gratis, ohne Werbung und Abo, Erzählerfigur, Lernpfad [52] | gedacht für Englisch als Erstsprache |
| **Wimmelbücher** (z. B. «Sachen suchen – Englisch lernen») | ein zweisprachiger Satz je Seite [55] | – |

Was die guten gemeinsam haben: eine einfache Mechanik, die sich wiederholt, Ton statt Text,
kein Punkte- und Zeitdruck. Was die schlechten gemeinsam haben: Abo-Fallen und Bibliotheken
ohne Weg. Ein Kinderangebot von Duolingo für Englisch als Fremdsprache hat die Recherche nicht
gefunden; Duolingo ABC lehrt englischsprachige Kinder lesen [47].

## 19. Die Etappen (Vorschlag)

| Etappe | Was | Ergebnis |
| --- | --- | --- |
| **0 · Startbild** | Lernzug mit Lese- und Rechenwagen auf dem oberen Gleis, Lernlok, Fortschritt am Wagen (Variante A), Feier für neue Schritte, Gruppe hinter dem Knopf, Prüfskripte | aufgeräumtes Startbild; Rechenwagen auch auf dem Handy |
| **1 · Hello, Rocco!** | Caboose im Lernzug, Zimmer mit Rocco, Karte, Aussichtsturm, Regal, Wörterbuch, Kiste; **drei Welten** (Farm, My House, The Kitchen) mit Wimmelbild; **Hear & find**; **drei Bildgeschichten**; Wortstände, Aufnäher, Einrichtung; US-Stimme; Elternkarte mit Schrift und Deutsch-Hilfe; Schranke | das Gewünschte: entdecken, Geschichten, Deutsch auf Knopfdruck, Fortschritt |
| **2 · Mehr Welten, mehr Spiel** | The Park, The Zoo, The Beach; Memory Bild–Ton, Yes or no?, Rocco says, Farben-Zug, Count with Rocco, Feed Rocco; Jukebox mit Versen; **bekannte Bücher auf Englisch** (vier bis sechs) | Wörter festigen, Bewegung, Geschichten, die das Kind schon kennt |
| **3 · Erste Sätze** | The City, School, Party Time; Hello-Telefon, Diner, Echo, Dress up, What's missing?, Geschichtenzug; Post aus Amerika; Tempo «langsamer» | grüssen, bitten, bestellen – für die Grösseren |
| **4 · Für Lesende und die Eltern** | My Body, Clothes & Weather, Holidays; Monster malen, Where is the cat?, Opposites, Wortbild-Memory; Bericht mit Wortständen und Unterschieden zum britischen Englisch; Aufträge für die Familie | rund 220 Wörter und 60 Wendungen; Brücke zum Schulenglisch |

## 20. Offene Entscheidungen

| # | Frage | Empfehlung |
| --- | --- | --- |
| 1 | Name des Bereichs | **Englischecke** (wie Lese-, Rechen- und Bauecke); der Wagen heisst Englischwagen, für die Kinder «der Caboose» |
| 2 | Der Wagen | **Caboose**, blau mit Aussichtsturm. Andere: ein amerikanischer Diner-Wagen; ein Postwagen |
| 3 | Die Figur | **Rocco, der Waschbär**, mit festem Namen (Abschnitt 8) |
| 4 | Die englische Stimme | nach den Hörproben; Vorschlag **Sulafat (en-US)**, Alternative eine eigene Stimme für Rocco (z. B. Puck mit Tempo 0,9) |
| 5 | Deutsch-Hilfe | Knopf **DE** immer da, als Sandwich (Deutsch, dann Englisch); Eltern können ihn verzögern oder ausschalten |
| 6 | Schrift | aus, bis das Kind in der Leseecke liest; dann auf Wunsch klein unter dem Bild; nie Lese- oder Buchstabieraufgaben |
| 7 | Die Lernlok | **eigene kleine lila Lok**, im Führerhaus das zuletzt besuchte Maskottchen; eine zweite Werkstatt-Lok vielleicht später als Lohn |
| 8 | Gruppe | Knopf ganz rechts mit Liste beider Züge je Kind; der Punkt für «etwas Neues bei den anderen» ja oder nein |
| 9 | Fortschritt am Lernwagen | **Variante A** (Zierband, Einrichtung von aussen, Wimpel und goldene Räder); Variante B (bauen) als Alternative |
| 10 | Lieder | in Etappe 2 **Sprechverse im Takt**; eigene Aufnahmen der Familie als Möglichkeit |
| 11 | Bilder | gemalt im Stil der Bücher; wer sie macht und womit, wie bei den Büchern |
| 12 | Englisch für den Gripszug | **nein** – der Lohn ist der Wagen im Lernzug |
| 13 | Schranke | je Spiel eine Runde frei, erste Welt und erste Geschichte frei |
| 14 | Spracherkennung | **keine**; «Echo» nur lokal zum Selber-Anhören |
| 15 | Reihenfolge | **Etappe 0 zuerst** (Startbild), dann Etappe 1 |

## Quellen

Die Recherche ist vom 4. November 2026. Wo nur ein Abstract, eine Sekundärquelle oder eine
Herstellerangabe vorlag, steht «sek.».

1. Uni Freiburg, Newsletter IFF 1/2015 (EDK-Strategie, HarmoS; sek.) – https://www.unifr.ch/federalism/fr/assets/public/files/Newsletter/IFF/2015_1_2.pdf
2. Kanton Zürich, Volksschule Unterricht (Lektionentafel) – https://www.zh.ch/de/bildung/schulen/volksschule/volksschule-unterricht.html
3. SRF, «Der Kanton Zürich passt sich an: Englisch ab der dritten Klasse» (13.5.2015) – https://www.srf.ch/news/zuerich-schaffhausen-der-kanton-zuerich-passt-sich-an-englisch-ab-der-dritten-klasse
4. Kanton Aargau, Fremdsprachen – https://www.ag.ch/de/themen/bildung-forschung/volksschule/regelschule/unterricht-schulbetrieb/lehrplan-lehrmittel-volksschule/sprachen/fremdsprachen
5. Kanton Aargau, Strategiepaket Sprachen – https://www.ag.ch/de/ueber-uns/kantonale-verwaltung/bks/dossiers-projekte/strategiepaket-sprachen
6. Kanton Luzern, Botschaft B 164 (Wochenstundentafel) – https://www.lu.ch/downloads/lu/kr/botschaften/2003-2007/pdf_2003/botschaften_2003/b_164.pdf
7. Kanton St. Gallen, Sprachen – https://www.sg.ch/bildung-sport/volksschule/unterricht/fachbereiche/sprachen.html
10. Basel-Stadt, Vorverlegung des Fremdsprachenunterrichts (Passepartout, 2009) – https://www.bs.ch/medienmitteilungen/ed/2009-vorverlegung-des-fremdsprachenunterrichts-beschluss-des-erziehungsrats
11. Lehrplan 21, Fachbereichslehrplan Sprachen – https://v-fe.lehrplan.ch/container/V_FE_DE_Fachbereich_SPR.pdf
12. Klett und Balmer, Kompetenzraster Young World 1 (Ausgabe ab 2018) – https://downloads.klett.ch/uploads/images/textbooks/Dateien/Kompetenzraster-Young-World-1-Ausgabe-ab-2018.pdf
13. Klett und Balmer, LP21-Umsetzungsvorschläge Young World 1–4 – https://downloads.klett.ch/uploads/images/textbooks/Dateien/Lehrplan-21-Umsetzungsvorschläge-Young-World-1-4.pdf
16. Muñoz (Hrsg.), Age and the Rate of Foreign Language Learning (sek.) – https://www.degruyterbrill.com/document/doi/10.21832/9781853598937/html
17. Muñoz 2008, Applied Linguistics (sek.) – https://doi.org/10.1093/applin/amm056
18. UZH / EurekAlert, «Anyone who is good at German learns English better» (2014) – https://www.eurekalert.org/news-releases/880753
19. Pfenninger & Singleton, The age-eclipsing effects of environment and input – https://www.education.ox.ac.uk/event/the-age-eclipsing-effects-of-environment-and-input-on-l2-attainment-in-instructional-contexts-2/
20. Krashen, Principles and Practice in Second Language Acquisition – https://www.sdkrashen.com/content/books/principles_and_practice.pdf
21. NALDIC, Stages of early bilingual learning (Tabors; sek.) – https://www.naldic.org.uk/Resources/NALDIC/Initial%20Teacher%20Education/Documents/Stagesofearlybilinguallearning.pdf
22. BYU, Total Physical Response (sek.) – https://methodsoflanguageteaching.byu.edu/total-physical-response
23. Tellier 2008, The effect of gestures on second language memorisation by young children – https://hal.archives-ouvertes.fr/hal-00375251
24. Andrä et al. 2020, Educational Psychology Review – https://link.springer.com/10.1007/s10648-020-09527-z
25. Sandwich-Technik nach Butzkamm (sek.) – https://en.wikipedia.org/wiki/Sandwich_technique
26. Byers-Heinlein et al. 2017 (PNAS), Princeton – https://princeton.edu/news/2017/08/07/bilingual-babies-listen-languages-and-dont-get-confused
27. Horst & Samuelson 2008, Fast mapping but poor retention – https://research-portal.uea.ac.uk/en/publications/fast-mapping-but-poor-retention-by-24-month-old-infants/
28. Vlach & Sandhofer 2012, Frontiers in Psychology – https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2012.00046/full
29. Childers & Tomasello 2002 (sek.) – https://digitalcommons.trinity.edu/psych_faculty/66
30. Vlach, Sandhofer & Kornell 2008 – https://babytalk.psych.ucla.edu/wp-content/uploads/sites/271/2021/03/Vlach_Sandhofer_Kornell_2008.pdf
31. Horst, Parsons & Bryan 2011, Frontiers in Psychology – https://www.frontiersin.org/articles/10.3389/fpsyg.2011.00017/text
32. Flack, Field & Horst 2018, Meta-Analyse zum Wortlernen beim Vorlesen (sek.) – https://research.brighton.ac.uk/en/publications/the-effects-of-shared-storybook-reading-on-word-learning-a-meta-a/
33. Takacs, Swart & Bus 2015, Benefits and pitfalls of multimedia and interactive features in technology-enhanced storybooks – https://docs.opendeved.net/lib/9LS8BP3N
34. Hirsh-Pasek et al. 2015, Putting Education in «Educational» Apps – https://www.psychologicalscience.org/publications/educational-apps.html
35. Coyle & Gómez Gracia 2014, ELT Journal (sek.) – https://doi.org/10.1093/elt/ccu015
36. Busse et al. 2021, Learning and Instruction (sek.) – https://doi.org/10.1016/j.learninstruc.2020.101372
38. Chase et al. 2009, Teachable agents and the protégé effect (sek.) – https://purl.stanford.edu/zm369yx3532
39. Tanaka & Matsuzoe 2012, Children teach a care-receiving robot (sek.) – https://doi.org/10.5898/JHRI.1.1.Tanaka
40. Chen, Park & Breazeal 2020, Teaching and learning with children (sek.) – https://dspace.mit.edu/handle/1721.1/136288
41. De Houwer 2007, Parental language input patterns and children's bilingual use – https://www.cambridge.org/core/journals/applied-psycholinguistics/article/abs/parental-language-input-patterns-and-childrens-bilingual-use/821A5852222197491F4E7ABC8AA4B099
44. Fischer, PH Heidelberg, zu Schrift im frühen Englischunterricht (sek.) – https://younglearners.uni-wuppertal.de/en/esther-fischer-university-of-education-heidelberg-germany/
46. Common Sense Media, Lingokids – https://www.commonsensemedia.org/app-reviews/lingokids-playlearning
47. App Store, Duolingo ABC (sek.) – https://apps.apple.com/app/id1440502568
49. App Store, Gus on the Go – https://apps.apple.com/us/app/gus-on-the-go-spanish/id541567964
50. Studycat, Fun English (Herstellerangaben) – https://studycat.com/apps/fun-english/
51. Common Sense Media, Endless Alphabet – https://www.commonsensemedia.org/app-reviews/endless-alphabet
52. Khan Academy Kids – https://www.khanacademy.org/kids
54. tiptoi «Mein erstes Bild-Wörterbuch Deutsch-Englisch» (sek.) – https://www.smythstoys.com/ch/de-ch/spielzeug/vorschule/tiptoi/tiptoi-mein-erstes-bild-woerterbuch-deutsch-englisch/p/246501
55. Lesejury, «Sachen suchen – Englisch lernen» (sek.) – https://www.lesejury.de/rezensionen/deeplink/862100/Product
56. App Store, Peekaboo Barn – https://apps.apple.com/us/app/id300590611
57. Common Sense Education, Peekaboo Barn – https://www.commonsense.org/education/reviews/peekaboo-barn
58. Google Cloud, Chirp 3: HD voices (Stand 26.10.2026) – https://docs.cloud.google.com/text-to-speech/docs/chirp3-hd
59. Google Cloud, Voices list – https://docs.cloud.google.com/text-to-speech/docs/list-voices-and-types
60. Google Cloud, Text-to-Speech Pricing – https://cloud.google.com/text-to-speech/pricing

Die Nummern folgen der Recherche; wo eine Nummer fehlt, wurde die Quelle im Text nicht gebraucht.
