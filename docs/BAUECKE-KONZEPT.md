# Die Bauecke – Konzept

Stand: Oktober 2026 · Grundlage: `train-home.js`, `game-cloud.js`, `entitlement.js`, `game-shell.js`,
`app.js`, `train-art.js`, `lesen-art.js`, `train-leseecke.js`, `kids.js`, `firestore.rules`,
`docs/ABENTEUERREISE-KONZEPT.md`, `docs/LESEECKE-KONZEPT.md`, `docs/UX-REVIEW-KINDER-4-8.md` und
eine Recherche zu Toca Boca World (früher Toca Life World), Sago Mini World, Avatar World,
Pepi, Miga Town, den einzelnen Toca-Apps und weiteren Bauspielen (Abschnitt 3)

> **Stand:** Konzept, nichts davon ist in der App gebaut. Zum Konzept gehört eine klickbare
> **Stilprobe** (Artefakt «Gripszug Bauecke»; dieselbe Seite liegt als
> `docs/bauecke-stilprobe.html` im Repo und geht nicht auf die Site): ein Haus im Querschnitt,
> der Zug bringt Ziegel, ein Stockwerk wächst, Zimmer lassen sich wählen, malen und
> einrichten, drei Tiere wohnen darin und haben Wünsche, dazu Lift, Tag und Nacht. Sie zeigt
> Grafikstil und Bewegung, nicht die fertige Spielmechanik – ihr Code (Zeichnungen, Kamera,
> Ziehen, Bildschleife) taugt aber als Vorlage für Etappe 1.
> Gemessen wie die Reisekarte (Chromium, 1600 × 1068, doppelte Auflösung):
> 10 Ebenen, davon 8 zeichnend, 18 Megapixel Ebenenfläche, 770 SVG-Knoten, 60 Bilder je
> Sekunde, während die Tiere laufen. Die Reisekarte kam nach ihrer Kur auf 9 Ebenen und 16
> Megapixel.

---

## 1. Die Idee in drei Sätzen

Neben dem Gleis liegt ein Bauplatz. Dort baut das Kind ein Haus, Stockwerk für Stockwerk, und
richtet jedes Zimmer selbst ein – Wohnung, Laden, Bad, Spielplatz, Hallenbad, Schule, Kita –,
malt Wände und Dach an und stellt Möbel hin, wohin es will. Die Tiere der App ziehen ein,
spielen, wünschen sich Dinge und freuen sich, wenn das Haus zu ihnen passt; die Ziegel für
neue Stockwerke bringt der Zug, wenn das Kind übt.

## 2. Auf einen Blick

Die Schleife hat fünf Schritte:

1. **Üben bringt Ziegel.** Jede fertige Runde – in jedem Spiel des Zugs, der Leseecke und auf
   der Reise – bringt einen Ziegel. Der Zug liefert sie auf den Bauplatz, wenn das Kind aufs
   Startbild zurückkommt.
2. **Zehn Ziegel sind ein Stockwerk.** Sie liegen auf einer Palette mit zwei Reihen zu fünf
   (ein Zehnerfeld). Ist sie voll, schwingt der Kranhaken, und ein Tipp lässt das Haus um ein
   Stockwerk wachsen – zuerst als Rohbau.
3. **Gestalten ist frei.** Was im Rohbau entsteht, entscheidet das Kind: Zimmerart, Farbe,
   Muster, Möbel. Das kostet nichts, lässt sich jederzeit ändern und rückgängig machen.
4. **Das Haus lebt.** Ist eine Wohnung mit Bett frei, zieht ein Tier ein. Wer kommt, hängt
   davon ab, was das Haus bietet. Jedes Tier hat einen Wunsch; ist er erfüllt, gibt es ein
   Herz. Herzen schalten Neues frei.
5. **Zurückkommen.** Alles bleibt, wie es war. Neu sind höchstens Ziegel, die der Zug
   gebracht hat, ein Tier, das vor der Tür wartet, oder ein Brief im Briefkasten.

Sechs Leitplanken gelten überall:

- **Gestalten ist frei, Wachsen kommt vom Üben.** Kein Pinsel und kein Stuhl kostet etwas.
  Was Ziegel braucht, ist nur das Wachsen des Hauses.
- **Nichts geht kaputt.** Keine Pflanze verwelkt, niemand zieht aus, kein Wunsch läuft ab,
  nichts wird schmutzig, während das Kind weg ist.
- **Kein Text nötig.** Bilder, Stimme, Gesten. Wer lesen kann, sieht zusätzlich Wörter.
- **Kein Warten, keine zweite Kasse.** Keine Bauzeit, keine Energie, keine Edelsteine. Die
  App ist ein Einmalkauf (`docs/GRIPSZUG-START.md`), und so bleibt es.
- **Rückgängig ist immer da.** Ein Kind darf ausprobieren, ohne Angst, etwas zu verlieren.
- **Ruhe im Stand.** Bewegung nur, wo etwas passiert – wie auf der Reisekarte.

---

## 3. Was die Vorbilder können – und was wir übernehmen

Grundlage: Store-Seiten (App Store, Google Play), die Seiten der Hersteller, Common Sense
Media, der australische Kinder-Medien-Rat ACCM, Fan-Wikis und Testberichte, gesucht im
Oktober 2026. Was nur eine Quelle sagt oder wo sich die Quellen widersprechen, ist markiert.
Preise, Abos und Inhalte dieser Apps ändern sich oft – vor einer Kaufempfehlung im Store
nachsehen.

### 3.1 Die Apps aus der Liste

**Toca Boca World** – so heisst Toca Life World inzwischen (Toca Boca, gehört zu Spin
Master; erschienen 2018). Ein offenes digitales Puppenhaus: laut Toca Boca über 90 Orte und
500 Figuren, keine Ziele, keine Punkte, kein Verlieren.

- *Bedienung:* Figuren und Dinge mit dem Finger ziehen, fast alles lässt sich antippen.
  Figuren halten Dinge, setzen sich, legen sich hin. Die Orte sind Querschnitte, mehrstöckige
  Gebäude haben einen Lift (belegt für das Spital der früheren Einzel-App «Toca Life:
  Hospital», fünf Stockwerke).
- *Gestalten:* **Home Designer** (seit Juni 2020, laut Fan-Wiki): Häuser einrichten, Wände,
  Böden, Möbel. Dazu Character Creator (Gesicht, Haare, Accessoires) und seit 2024 ein
  Outfit Designer.
- *Wiederkommen:* Jeden **Freitag** liegen im Postamt Geschenke – Möbel, Kleider, Deko,
  Haustiere. Eine Einladung, keine Strafe fürs Fernbleiben.
- *Tag und Nacht:* die Sonne antippen, und es wird Nacht; den Mond, und es wird Tag.
- *Geheimnisse:* versteckte Dinge und Kombinationen, die man durch Antippen und Ausprobieren
  findet (laut inoffiziellen Ratgebern «Hunderte»).
- *Geld:* Gratis zum Herunterladen, mit ein paar Orten zum Anfangen (ein Familienhaus, eine
  erste Wohnung in Bop City); die meisten Orte und viele Möbel kosten extra. Keine Werbung
  von Dritten – Toca Boca wirbt aber für die eigenen Apps.

**Sago Mini World** (Sago Sago, ebenfalls Spin Master): ein Abo für 2- bis 5-Jährige mit
vielen kleinen Spielen; nach sieben Tagen Probezeit monatlich oder jährlich, für Abonnenten
ohne Werbung und ohne Käufe. Seit 2023 steckt es auch im Sammel-Abo **Piknik** (mit Toca
Boca Jr, Hair Salon 4 u. a.; je nach Seite 11.99 oder 14.99 US-Dollar im Monat).

- *Haltung:* offenes Spiel ohne richtige Antworten, ohne Uhr, oft ohne ein einziges Wort;
  die Firma sagt selbst, ihre Spiele hätten keine künstlichen Anreize und keine festen Regeln.
- *Bauen:* **Neighborhood Blocks** – das Kind baut aus Blöcken eine Stadt, und **was es baut,
  lockt neue Bewohner an**; jeder hat einen Beruf, ein Malwerkzeug färbt die Teile um.
  **Village** – wer eine Tür oder ein Fenster setzt, bekommt einen neuen Wichtel als Bewohner;
  Wichtel lassen sich herumtragen und besuchen einander (ob Village noch zu Sago Mini World
  gehört, ist unklar). Dazu Trucks & Diggers (graben, bauen) und Toolbox (Werkzeuge).

**Avatar World** (Pazu Games): gratis mit In-App-Käufen, ab 4, über 100 Millionen Downloads,
bei Google Play «Teacher Approved». Ein Avatar-Editor (Kleider, Frisuren), der **House
Maker** zum Einrichten jedes Zimmers – mit Haustypen über mehrere Stockwerke und Zimmern für
einen Zweck (Büro, Fitness, Musik) –, ein «City Maker» für leere Grundstücke, eine Stadt mit
vielen Orten, Haustiere. Möbel- und Hauspakete kosten. Elternratgeber kritisieren
Kaufaufforderungen und Abo-Hinweise; ob die Gratisversion Werbung zeigt, sagen die Quellen
verschieden. Der ACCM rät (2023) für Kinder bis vier Jahre zu Begleitung, wegen Käufen und
Werbung.

**«Pepi World»**: Eine App mit genau diesem Namen gibt es nicht; gemeint ist wohl **Pepi
Wonder World: Magic Isles** (Pepi Play, 2019) – Inseln mit Drachen, Wichteln und anderen
Fantasiefiguren, ein digitales Puppenhaus, gratis mit Käufen (alle Inseln zusammen rund 16
US-Dollar), dazu das werbefreie Abo «Pepi Pass». Für die Bauecke spannender ist **Pepi
House**: ein Haus mit **vier Stockwerken** (Küche, Waschküche, Schlafzimmer, Garage, Garten)
und einem **Lift, der Dinge und Figuren zwischen den Stockwerken trägt**; Hunderte Dinge,
manche lassen sich kombinieren. Eine Bewertung beklagt, dass Inseln, die man früher mit
Werbung freischalten konnte, jetzt gesperrt sind (nur eine Quelle).

**Miga Town: My World** (XiHe Digital / XFUN): ein Rollenspiel-Sandkasten ohne Aufgaben,
Punkte oder Geschichte. Drei Orte sind gratis (Restaurant, Kleiderladen, Wohnung), die Dinge
reagieren (der Kühlschrank geht auf, der Ofen kocht). Weitere Orte einzeln oder im Paket,
dazu ein monatlicher «VIP»-Pass und Möbelpakete. Kritik: viel hinter Käufen, oft als
Toca-Kopie bezeichnet, keine Möglichkeit, Geschichten aufzunehmen (Common Sense Media).

**Toca Boca Jr und die einzelnen Toca-Apps.** Toca Boca Jr (2023, im Piknik-Abo) bündelt die
alten Einzel-Apps für Jüngere: Toca Kitchen 2, Toca Nature, Toca Lab, Toca Builders, Toca Pet
Doctor. Seit Ende 2025 gibt es «Toca Boca Jr Classics» mit neun dieser Spiele, ohne Werbung
und ohne Käufe (laut Store-Tracker).

- **Toca Kitchen 2:** Das Kind kocht für einen von drei Gästen, und **die Gäste reagieren
  deutlich** – begeistert, niesend, Dampf aus den Ohren bei zu heissem Essen, Zunge raus,
  wenn es nicht schmeckt. Der Lohn ist die Reaktion, nicht ein Punkt.
- **Toca Hair Salon 4:** schneiden, färben, waschen, dann in die **Fotokabine** mit
  Hintergrund – das fertige Werk wird ein Bild. Grundversion gratis, Schminkecke und
  Accessoires kosten.

### 3.2 Weitere Vorbilder fürs Bauen und Wohnen

- **Toca Nature** (Toca Boca): Das Kind formt eine Landschaft, und **die Tiere kommen je
  nachdem, was es geformt hat** – Berge holen Wölfe, ein See Biber und Fische, jede Baumart
  ihr eigenes Tier (sieben Tiere im Ganzen). Das ist die Regel hinter der Einzugstabelle in 5.4.
- **Toca Builders** (2013): sechs Baufiguren, jede mit einer Fähigkeit (Blöcke setzen,
  anmalen, entfernen …). Ein Werkzeug, eine Figur – so verstehen es auch Vierjährige.
- **Toca Blocks:** Blöcke mit Eigenschaften (klebrig, federnd); zwei Blöcke verschmelzen zu
  einem neuen Ding. Keine Levels.
- **Tiny Tower** (NimbleBit, 2011): ein Hochhaus Stockwerk für Stockwerk im Querschnitt,
  Wohnstockwerke und Läden. Jeder Bewohner hat einen **Traumjob**; im falschen Job zeigt er
  ein trauriges Gesicht – die einzige «Strafe». Wer im Erdgeschoss in den Lift steigt, **sagt
  in einer Sprechblase, in welches Stockwerk er will**, und man fährt ihn hin. Aber: Jedes
  Stockwerk braucht eine halbe Stunde länger zum Bauen als das vorige, und eine Premiumwährung
  kürzt das ab.
- **SimTower / Yoot Tower** und **Project Highrise:** Sterne nach Bewohnerzahl, Mieter mit
  Stress, wenn sie am Lift warten, Lärm stört Nachbarn, Unzufriedene ziehen aus. Für 4- bis
  8-Jährige zu viel – übrig bleibt die Idee, dass Nachbarschaft zählt.
- **Animal Crossing: Happy Home Designer** und **Happy Home Paradise** (Nintendo): Kundinnen
  kommen mit einem Thema («ein Ferienhaus voller Körbe») und drei, vier Wunschmöbeln; alles
  andere entscheidet man selbst. Beim Einrichten zeigen sie über dem Kopf ein **Herz** oder ein
  Ausrufezeichen. Das Budget ist unbegrenzt, man kann kaum etwas falsch machen, und neue
  Techniken (Trennwände, Säulen, Licht) kommen nach und nach.
- **Townscaper** (Oskar Stålberg): nur Klötze setzen und wegnehmen; das Spiel macht daraus
  von selbst Häuser, Treppen und Gärten. Kein Ziel – und man kann es kaum hässlich machen.
- **The Sims:** Was eine Figur will, steht als Bild in einer Gedankenblase – ohne Text.

### 3.3 Was die Bauecke davon nimmt

| Idee | Vorbild | In der Bauecke |
| --- | --- | --- |
| Querschnitt, jedes Zimmer eine Bühne | Toca Boca World, Pepi House, Tiny Tower | das Haus (5.1) |
| alles anfassen, Figuren tragen | Toca, Miga Town, Pepi | Möbel ziehen, Tiere tragen (5.3, 5.4) |
| was man baut, lockt Bewohner an | Sago Mini Neighborhood Blocks und Village, Toca Nature | Einzug nach Angebot (5.4) |
| Wünsche mit Herz | Happy Home Paradise, Toca Kitchen 2 | ein Wunsch je Tier, Herz in die Anzeige (5.4) |
| Lieblingsort, Traumjob | Tiny Tower | Pinguin im Hallenbad, Eule in der Bibliothek |
| Lift mit Zahl in der Sprechblase | Tiny Tower, Pepi House | Lift-Knöpfe 0, 1, 2 … (5.1, 5.5) |
| Tag und Nacht per Sonne und Mond | Toca Boca World | Sonne-Mond-Knopf (5.4) |
| malen und umfärben | Sago Mini Neighborhood Blocks, Toca Home Designer | Schublade «Farbe» (5.3) |
| eine kleine Überraschung beim Wiederkommen | Toca-Freitagsgeschenk | Lieferzug, Brief im Briefkasten (6) |
| nach und nach Neues | Happy Home Paradise | Herzen schalten frei (5.4) |
| das fertige Werk als Bild | Toca Hair Salon 4 | Postkarte vom Haus (Etappe 3) |
| Verstecktes entdecken | Toca Boca World | z. B. eine Maus hinter dem Bild (Etappe 2) |
| ohne Text, ohne Uhr, ohne Fehler | Sago Mini, Toca | die Leitplanken (2) |

### 3.4 Was die Bauecke bewusst nicht übernimmt

- **Läden, Pakete, Abos, VIP-Pässe im Spiel** (Toca Boca World, Avatar World, Miga Town,
  Pepi). Gripszug ist ein Einmalkauf; die Schranke am Kran ist für Eltern, nicht fürs Kind.
- **Werbung**, auch nicht als «Belohnung» zum Freischalten.
- **Wartezeiten und eine Währung zum Abkürzen** (Tiny Tower): Ein Stockwerk steht sofort.
- **Stress, Sterne, Auszug** (SimTower, Project Highrise): Kein Tier ist «unzufrieden».
- **Druck durch Figuren, künstliche Eile, Lockangebote, gesperrte Wege.** Radesky und andere
  (JAMA Network Open, 2022) fanden solche Muster in rund 80 % der Apps, die 160 Kinder von
  drei bis fünf Jahren nutzten – Lockangebote und gesperrte Wege am häufigsten, Druck durch
  Lieblingsfiguren («Komm zurück!») in etwa jeder fünften App.
- **Serien, die verloren gehen, und Push-Nachrichten.** Die Leitlinien der EU-Kommission zum
  Schutz Minderjähriger (Art. 28 DSA, Juli 2025) erwarten, dass beides für Kinder
  standardmässig aus ist. Die Bauecke hat keines von beiden.
- **Eine Belohnung, die das Üben ersetzt.** Lepper, Greene und Nisbett (1973): Kinder, die für
  das Malen eine Belohnung erwarteten, malten danach in der freien Zeit weniger. Deshalb gibt
  es **einen Ziegel je fertige Runde, egal wie gut** – keine Ziegel für Tempo oder Sterne,
  kein «Spiel noch drei Runden, dann darfst du bauen». Die Bauecke ist ein Spiegel des Übens,
  nicht sein Preis; das Kind sieht ihn erst, wenn es auf den Bauplatz geht.

---

## 4. Platz in der App

### Ein eigener Ort, kein sechster Bereich

Wie die Leseecke: Ein sechster Wagen machte den Zug kleiner, der Fahrplan der Reise ginge
nicht mehr auf, und mehrere Prüfskripte rechnen fest mit fünf Bereichen und 25 Spielen
(`entitlement.js`, `AREAS`; `scripts/validate-schranke.mjs`). Die Bauecke ist deshalb ein
**Ort auf dem Startbild** mit eigener Ansicht der Bühne – wie Lesewagen und Reise.

### Der Bauplatz auf dem Startbild

Heute steht links der Lesewagen (`positionLesewagen`, höchstens 16 % der Breite), in der
Mitte der Zug und darüber die Züge der Gruppe (`layoutFriends`, höchstens zwei Drittel der
Breite, mittig). **Rechts ist dasselbe Sechstel frei** – über dem grünen Startknopf, unter
Lautsprecher und Profil. Dort steht der Bauplatz, spiegelbildlich zum Lesewagen:

- Auf einem kleinen Hügel hinter der Lok: **das Haus, so wie es ist**, von aussen – Fassade,
  Fenster, Dach. Mit jedem Stockwerk wird es höher. Ein Kran daneben, solange gebaut wird.
- Bei Nacht (Landschaft «Nacht») leuchten die Fenster der Zimmer, in denen eine Lampe steht.
- Ist die Palette voll, schwingt der Kranhaken; ist ein Tier eingezogen, das noch nie
  besucht wurde, winkt es aus einem Fenster. Sonst steht alles still.
- Masse wie beim Lesewagen: höchstens 16 % der Breite, nie kleiner als 70 Pixel, sonst bleibt
  der Bauplatz weg (`LESE_MIN`-Regel). Er deckt keinen Knopf zu; das prüft der Browser-Test.
  Auf dem Handy quer (844 × 390) bleiben rechts über dem Startknopf rund 110 × 150 Pixel –
  genug für ein schmales Haus, ein Hochhaus ist dort sogar die passende Form.
- **Antippen:** ein kurzer Ton, die Kamera fährt auf das Haus zu (eine Ebene, `transform`,
  rund 450 ms), und die Ansicht `bau` liegt da. Der Zurück-Knopf führt aufs Startbild.

Wächst das Haus über die Höhe seines Platzes, wird die Zeichnung kleiner, nicht höher: ab
etwa acht Stockwerken steht auf dem Startbild ein **Hochhaus mit Antenne**, bei dem man die
Stockwerke nur noch als Fensterreihen sieht.

### Die Ansicht `bau`

Eine Ansicht der Bühne in eigener Datei (`train-bau.js`), so wie `train-leseecke.js` das
Lesezimmer einhängt (`mount({ host })`). Was sie von der Bühne nimmt: Landschaft (das Haus
steht in der gewählten Landschaft – Wiese, Wald, See, Berge, Nacht …), Zurück-Knopf,
Lautsprecher, Feiern, Musik. Der Zug selbst bleibt draussen; er kommt nur als Lieferzug ins
Bild.

### Die Verbindung zu den Spielen

- **Nach jeder Runde** sagt die Ergebnis-Tafel einen Satz mehr: «Ein Ziegel für dein Haus.»
  Wie beim Lesewurm («Ein Buchstabe für …») – was es ist, zeigt erst der Bauplatz.
- **Gezählt wird an den Stellen, an denen die Schranke ihre Runden zählt:** `game-shell.js`
  (`showResult`), `app.js` (`markSolved`) und `tiersprung.js`. Dort kommt ein Ereignis
  `lernapp:runde-fertig` dazu; die Bauecke hört zu. Anders als die Schranke zählt sie auch
  auf der Reise und nach dem Kauf.
- **Zurück auf dem Startbild** vergleicht der Bauplatz «gesehen» mit «jetzt» (das
  `SEEN`-Muster aus `train-home.js`): Sind neue Ziegel da, fährt ein kurzer Lieferzug vor
  dem Haus vorbei und lädt sie ab. Auch wenn der Stand aus der Cloud kommt.
- **Reise:** Ist eine Karte fertig, steigt ihr Fahrgast nicht nur aus, er sucht eine Wohnung –
  der Pinguin von der See-Karte, das Eichhörnchen vom Wald. Das gibt der Reise ein Ziel über
  die Postkarte hinaus (Abschnitt 5.4).
- **Leseecke:** Die gelesenen Bücher stehen als Buchrücken im Regal der Bibliothek, wenn das
  Haus eine hat. Die Eule zieht am liebsten dort ein, wo es Bücher gibt.

### Eltern, Gruppe, Schranke

- **Elternbereich** (`firebase.js`): eine Karte «Bauecke» je Kind mit einem kleinen Bild des
  Hauses, Stockwerken, Bewohnern und Herzen. Kein Bericht – das Haus ist Spiel, nicht
  Leistung.
- **Gruppe:** Die Häuser der Geschwister lassen sich **ansehen, nicht ändern** – so wie heute
  ihre Züge. Die Regeln erlauben das Lesen in der Gruppe schon (`firestore.rules`,
  `sharesGroupWith`); Schreiben in ein fremdes Konto bleibt verboten, das ist gut so.
- **Schranke:** eine kleine, am Kran. Ziegel kommen aus Runden, und ohne Kauf gibt es je
  Spiel eine Runde (`GRATIS_RUNDEN`) – aber die erste Reisekarte und die zwei freien Bücher
  lassen sich beliebig oft spielen, und jede Runde brächte einen Ziegel. Deshalb wächst das
  Haus ohne Kauf **bis zum vierten Stock**; danach steht am Kran dieselbe Schranke wie vor
  den Toren (`showGate`), und *Für Eltern* führt über das Rechenrätsel zum Kauf. Gestalten,
  Einziehen und Wünsche bleiben frei. «Ganze App gratis» öffnet auch den Kran.

---

## 5. Die Bauecke selbst

### 5.1 Das Haus im Querschnitt

Die Puppenhaus-Ansicht, die Toca Boca für jeden Ort benutzt und die der Lesewagen schon hat:
Die vordere Wand fehlt, jedes Zimmer ist eine kleine Bühne.

- **Zwei Zimmer je Stockwerk**, links und rechts, mit einem Durchgang dazwischen. Das ist für
  Vierjährige zu verstehen («Jedes Stockwerk hat zwei Zimmer») und lässt doch Mischungen zu:
  Wohnung und Bad, Laden und Café, Kita und Spielplatz. **Grosse Räume** – Hallenbad,
  Turnhalle, Schule – nehmen in Etappe 3 beide Hälften: «Wand weg» schiebt die Trennwand
  hinaus.
- **Erdgeschoss** mit Eingang und Briefkasten; daneben der **Lift** rechts am Haus, mit
  grossen Knöpfen je Stockwerk: 0 für das Erdgeschoss, dann 1, 2, 3 … Tiere fahren damit;
  ein Kind, das eine Zahl antippt, holt die Kabine dorthin.
- **Dach:** Form und Farbe wählbar (Satteldach, Flachdach mit Garten, Turm mit Fahne,
  Kuppel). Ein Dachgarten ist ein eigenes, oberstes «Stockwerk» mit Beeten, Bäumen und einem
  Bienenhaus.
- **Kamera:** senkrecht wischen, mit Schwung und weichem Rand; ein Knopf «ganzes Haus» zeigt
  alles auf einmal; ein Doppeltipp holt ein Stockwerk heran. Zoomen mit zwei Fingern bleibt
  wie in der ganzen App gesperrt (`blockZoom`).
- **Grösse:** bis 30 Stockwerke. Mehr wäre kein Spiel mehr, sondern Scrollen – und die
  Rechnung in Abschnitt 6 bleibt so überschaubar.

### 5.2 Die Zimmer

Jede Zimmerart bringt eine Wandfarbe, einen Boden, ein paar Startmöbel und eine Aufgabe im
Leben des Hauses mit. Fett: in Etappe 1.

| Zimmer | Startmöbel | Was dort passiert | Nebenbei gelernt |
| --- | --- | --- | --- |
| **Wohnung** | Bett, Lampe, Tisch, Teppich | Hier wohnt ein Tier; ohne Bett zieht niemand ein | Grundbedürfnisse: schlafen, Licht, essen |
| **Bad / WC** | Badewanne, Lavabo, WC | Am Morgen ist Betrieb; die Ente schwimmt | Hygiene, Wörter fürs Bad |
| **Laden** | Regal, Obstkiste, Kasse | Tiere kaufen ein; später mit Münzen (7–8) | Waren sortieren, zählen, Geld |
| **Spielplatz** | Rutsche, Ball, Trampolin | Die Tierkinder spielen tagsüber hier | – |
| Hallenbad | Becken, Sprungbrett | Der Pinguin schwimmt, die anderen planschen | Tierwissen: wer mag Wasser? |
| Schule | Wandtafel, Pulte, Globus | Am Morgen gehen die Kinder hin; die Tafel zeigt Zahlen und Buchstaben aus der App | Uhrzeit, Tagesablauf |
| Kita / Hort | Schaukelpferd, Bauklötze, Spielkiste | Die Kleinsten sind hier, während die Grossen in der Schule sind | – |
| Bibliothek | Bücherregal, Sessel, Leselampe | Die Eule liest; die gelesenen Bücher des Kindes stehen im Regal | Verbindung zur Leseecke |
| Küche / Café | Herd, Tisch, Kuchenvitrine | Tiere essen; der Bär holt Honig | Essen und Tiere (Steckbriefe) |
| Tierarztpraxis | Liege, Waage, Pflasterkiste | Wer hinfällt, bekommt ein Pflaster – nie krank, nur kleine Wehwehchen | Messen, Wägen |
| Turnhalle | Ringe, Matte, Ballkorb | Bewegung; braucht beide Hälften | – |
| Atelier | Staffelei, Farben | Ein Tier malt Bilder, die danach im Haus hängen | Farben mischen |
| Musikzimmer | Klavier, Trommel | Tippen spielt Töne (WebAudio aus `kids.js`) | Töne, Rhythmus |
| Dachgarten | Beete, Baum, Bienenhaus | Gemüse wächst über Tage – ohne zu verwelken | Pflanzen brauchen Wasser und Sonne |

Dazu der **Rohbau**: graue Ziegelwand, Absperrband, ein Pylon, ein Bauhelm und in der Mitte
ein grosses Plus. Ein Tipp öffnet die Auswahl der Zimmerarten.

### 5.3 Gestalten: Farbe, Muster, Möbel

**Die Schublade.** Wer ein Zimmer antippt, sieht es umrandet, und von unten kommt eine
Schublade mit drei Reitern: *Zimmer* (Zimmerart), *Farbe* (Wand und Boden), *Möbel*. Jeder
Reiter zeigt grosse Bildkarten, höchstens acht auf einmal sichtbar, quer zu wischen. Die
Schublade schiebt das gewählte Zimmer so weit nach oben, dass es nie unter ihr verschwindet.

**Farbe.** Zwölf Wandfarben, vier Muster (Streifen, Punkte, Karo, Sterne), vier Böden (Holz,
Fliesen, Teppich, Matte). Gemalt wird mit einer Rolle, die einmal über die Wand fährt. Fassade
und Dach haben je eine eigene Auswahl (Etappe 2). Muster liegen halb durchsichtig über der
Farbe, so passen alle Muster zu allen Farben, und es braucht nur fünf Muster statt sechzig.

**Möbel.**

- **Antippen** stellt das Ding auf den freiesten Platz im Zimmer – es fällt von der Decke und
  landet mit einem kleinen Federn. Das reicht für Vierjährige.
- **Herausziehen** – die Karte nach oben aus der Schublade ziehen – trägt es, wohin der Finger
  will. Das Ding schwebt etwas über dem Finger, damit es sichtbar bleibt; das Zimmer darunter
  leuchtet auf. Losgelassen fällt es auf den Boden (oder hängt an der Wand, wenn es ein Bild,
  eine Tafel oder eine Uhr ist).
- **Umstellen:** ein Ding im Zimmer greifen und ziehen – auch in ein anderes Zimmer und in ein
  anderes Stockwerk (die Kamera fährt mit, wenn der Finger an den Rand kommt).
- **Wegräumen:** beim Ziehen erscheint unten ein Eimer. Ein Ding hinein, und es ist weg.
  Rückgängig holt es zurück.
- **Variante:** Wer ein Ding im gewählten Zimmer antippt, sieht darüber kleine Farbpunkte –
  das Sofa wird blau (Etappe 2).
- **Alles tut etwas** (Toca-Prinzip, Etappe 2): Die Lampe schaltet, die Dusche läuft, die
  Rutsche lässt ein Tier hinuntersausen, das Klavier spielt, der Kühlschrank geht auf.
- **Grenzen:** rund 24 Dinge je Zimmer. Mehr wird Gedränge, und der Spielstand bleibt klein.

Zu jeder Zimmerart gehören ihre eigenen Möbel und eine Handvoll, die überall passen (Lampe,
Pflanze, Bild, Teppich, Uhr). Neue Möbel kommen mit Herzen (Abschnitt 5.4) – sichtbar mit
Schloss in der Schublade, wie die gesperrten Teile in der Werkstatt.

### 5.4 Die Bewohner

**Wer.** Die Tiere der App: die zwölf Chauffeure und Fahrgäste (`DRIVERS` in `train-art.js`:
Fuchs, Bär, Hase, Katze, Panda, Frosch, Eule, Pinguin, Löwe, Maus, Eichhörnchen, Steinbock)
als ganze Figuren wie der Fahrgast (`buildPassenger`), dazu ihre Kinder in kleiner. Keine
Menschen-Avatare: Die Tiere kennt das Kind schon aus Büchern, Steckbriefen und von der Reise,
und es gibt keine Frage nach Hautfarbe, Kleidern oder Datenschutz.

**Einzug.** Ist eine Wohnung mit Bett frei, kommt nach einem Augenblick jemand: zuerst vor
die Tür, dann mit dem Lift hinauf, mit einer Umzugskiste. **Wer kommt, hängt davon ab, was
das Haus bietet** – das ist der Kern von «die finden es toll oder nicht so toll, je nachdem
wie ich gebaut habe»:

| Das Haus hat … | dann kommt gern … | weil (Steckbriefe der Leseecke, `lesen-detektive.js`) |
| --- | --- | --- |
| ein Hallenbad | der Pinguin | er kann über 500 Meter tief tauchen |
| einen Dachgarten mit Bambus | der Panda | er frisst fast nur Bambus |
| eine Wohnung ganz oben | der Steinbock | er wohnt hoch oben an steilen Felsen |
| eine ruhige Bibliothek | die Eule | sie jagt nachts und fliegt fast lautlos – sie mag es still |
| einen Garten mit Wiese | die Hasenfamilie | der Feldhase lebt auf Feldern und Wiesen |
| Bäume und einen Laden mit Nüssen | das Eichhörnchen | es frisst Nüsse und versteckt Vorräte für den Winter |
| ein Bad mit Wanne oder einen Teich | der Frosch | er trinkt durch die Haut und lebt an Teichen |
| eine Dachterrasse in der Sonne | der Löwe | er döst bis zu 20 Stunden am Tag |
| ein gemütliches Zimmer mit Teppich und Decke | der Bär | er hält in seiner Höhle Winterruhe |
| einen Platz am Fenster | die Katze | sie schläft etwa 15 Stunden am Tag |
| eine kleine Kammer unter dem Dach | die Maus | sie passt durch ein Loch so dick wie ein Bleistift |
| irgendeine freie Wohnung | der Fuchs | er lebt sogar in Städten |

Ohne Hallenbad kommt der Pinguin trotzdem – irgendwann, als Letzter. So entdeckt ein Kind die
Regel selbst und muss nicht raten.

**Wünsche.** Jedes Tier hat **einen Wunsch auf einmal**, als Bild in einer Denkblase und
gesprochen, wenn man es antippt. Fünf Arten:

1. **Ein Ding** in der eigenen Wohnung: «Ich wünsche mir ein Sofa.»
2. **Ein Zimmer** im Haus: «Ich wünsche mir eine Kita für meine Kinder.»
3. **Eine Farbe:** «Ich mag Orange. Malst du meine Wand orange an?»
4. **Eine Lage:** «Ich will ganz oben wohnen.» – «Ich möchte neben meinem Freund wohnen.» –
   «Es ist mir zu laut» (der Spielplatz liegt direkt daneben).
5. **Ein Besuch:** «Ich möchte schwimmen gehen.» Das Kind trägt das Tier selbst hin.

Ist ein Wunsch erfüllt, hüpft das Tier, sagt danke, und ein **Herz** fliegt nach oben in die
Anzeige. Danach kommt irgendwann der nächste Wunsch – höchstens drei je Tier, dann ist es
einfach glücklich. Ein offener Wunsch ist nie ein Vorwurf: kein trauriges Gesicht, kein
Countdown, nur die Blase, wenn man fragt.

**Herzen.** Jeder erfüllte Wunsch gibt ein Herz, einmal. Herzen werden nie ausgegeben und
nie weggenommen – auch nicht, wenn das Sofa später wieder verschwindet. Bei 3, 6, 10, 15 …
Herzen kommt etwas dazu: ein Möbelset, eine Dachform, ein neues Tier in der Warteschlange,
eine Fassadenfarbe (wie die Einrichtung des Lesewagens, `AUSBAU`).

**Der Tag.** Ein Knopf mit Sonne und Mond schaltet Tag und Nacht; in der Landschaft «Nacht»
ist von selbst Nacht. Nachts schlafen die Tiere (in ihrem Bett, sonst wo sie sind, mit
«z z»), Lampen leuchten warm, nur die Eule ist wach. Tagsüber gehen die Kinder in Kita,
Schule oder auf den Spielplatz, der Pinguin ins Hallenbad, andere in den Laden. Kein Echtzeit-
Tagesablauf: Ein Kind, das immer um vier Uhr spielt, sähe sonst nie den Morgen.

**Tragen.** Jedes Tier lässt sich greifen und woandershin tragen – ins Wasser, auf die
Rutsche, zum Nachbarn. Dort bleibt es eine Weile und tut, was man dort tut. Das ist das
Rollenspiel der Toca-Apps: Geschichten, die sich das Kind selbst erzählt.

**Was nie passiert.** Niemand zieht aus, niemand wird krank oder hungrig, nichts verfällt,
während das Kind weg ist, und kein Tier ist «unzufrieden» mit einer roten Anzeige.

### 5.5 Lernen in der Bauecke – ohne dass sie Schule wird

Die Bauecke ist der Lohn fürs Üben, kein weiteres Übungsheft. Lernen steckt im Spiel, nie
davor: Keine Frage muss beantwortet werden, um etwas zu bauen.

- **Zahlen:** Die Palette ist ein Zehnerfeld – zehn Ziegel sind ein Stockwerk. Die
  Lift-Knöpfe tragen Zahlen; ein Tier sagt «Ich will in den dritten Stock», und wer die 3
  antippt, fährt es hin. Hausnummern, später Preise im Laden.
- **Raum und Lage:** oben, unten, neben, zwischen – in den Wünschen der Tiere («ganz oben»,
  «neben dem Spielplatz»). Dieselben Wörter wie in «Stimmt das?» und «Lies und tu!».
- **Lesen:** Wer lesen kann, sieht die Wünsche auch als Satz, Türschilder mit Namen, die das
  Kind den Tieren gibt (mit dem Baukasten von «Mein Name»), Ladenschilder, und Briefe der
  Bewohner im Briefkasten – kurze Texte nach den Regeln der Leseecke, vorgelesen für alle,
  die noch nicht lesen.
- **Sachwissen:** Wer kommt wohin, und warum? Die Tabelle in 5.4 ist Tierwissen aus den
  Steckbriefen, angewendet.
- **Uhr (7–8):** In der Schule hängt eine Uhr, und der Tagesablauf hat Zeiten: «Um 8 Uhr geht
  der Hase in die Schule.»
- **Problemlösen:** Wünsche, die sich reiben – die Eule will Ruhe, die Kinder wollen den
  Spielplatz –, sind kleine Rätsel ohne falsche Lösung.
- **Bauaufträge** (Etappe 3, für Leser): ein Zettel am Kran, «Stell zwei Stühle in die
  Küche», wie «Lies und tu!». Ein erledigter Auftrag zählt wie eine Runde – ein Ziegel, keine
  Pflicht.

---

## 6. Fortschritt und Speichern

### Woher die Ziegel kommen

Ein **Ziegel je fertige Runde**, egal wie gut sie war – gleich viel für eine Runde auf der
Wiese wie für ein Kakuro (warum, steht in 3.4). Bei vier bis sechs Runden am Tag wächst das
Haus etwa alle zwei Tage um ein Stockwerk – schnell genug, dass es sich lohnt, langsam genug,
dass ein Stockwerk etwas wert ist.

Gezählt wird **je Gerät**: Jedes Gerät führt seine eigene Zahl, die Cloud hält alle, und
zusammengeführt wird je Gerät mit dem grösseren Wert; die Ziegel sind die Summe. So geht auf
zwei Tablets keine Runde verloren und keine wird doppelt gezählt – das Problem, das die
Bestenliste mit `mergeScores` lösen musste, entsteht gar nicht erst.

Verbaut ist, was im Haus steckt: zehn Ziegel je Stockwerk über dem Start. Auf der Palette
liegt also immer `verdient + Startgeschenk + gutschrift − verbaut` – der Bestand der Palette
muss nicht eigens gespeichert werden und kann nicht auseinanderlaufen.

**Startgeschenk:** Das Haus beginnt mit Erdgeschoss und erstem Stock, der Hase wohnt schon
darin, und auf der Palette liegen zehn Ziegel. Das erste Stockwerk baut ein Kind in der
ersten Minute; danach weiss es, wie es geht.

### Der Kasten `lernapp.bau`

Wie alle Spielstände über `game-cloud.js`: zuerst auf dem Gerät, angemeldet zusätzlich im
Feld `gameState["lernapp.bau"]` des Kontodokuments. Die Firestore-Regeln lassen das ohne
Änderung zu – `gameState` ist für das eigene Konto offen (`ownerMayNotTouch` nennt es nicht).

```js
// lernapp.bau – lokal und in users/<uid>.gameState
{
  v: 1,
  geaendert: 1760000000000,          // das Haus: die neuere Fassung gewinnt
  verdient: { "g-7f3a": 42, "g-91bc": 17 },   // Ziegel je Gerät
  dach: { form: "sattel", farbe: "#d9584a" },
  fassade: "#f1dfc2",
  stockwerke: [                      // von unten nach oben, 0 = Erdgeschoss
    { z: [                           // zwei Zimmer: links, rechts
      { typ: "laden", wand: "#fff1b8", muster: 0, boden: 1,
        d: [["regal", 64], ["obst", 150], ["kasse", 234]] },
      { typ: "wohnung", wand: "#ffe3c4", muster: 0, boden: 0,
        d: [["bett", 78, "#7c5ce6"], ["lampe", 166]] },
    ] },
  ],
  bewohner: [ { tier: "pinguin", wohnung: [0, 1], name: "Pino", wunsch: 1 } ],
  warten: ["fuchs", "baer"],         // wer als Nächstes kommt
  herzen: 5,
  erfuellt: { pinguin: 1, hase: 2 }, // je Tier, wie viele Wünsche schon erfüllt sind
  gutschrift: 0,                     // nach «Zurücksetzen»: was schon verbaut war
}
```

Wie viele Ziegel der Bauplatz schon gezeigt hat, merkt sich nur das Gerät
(`lernapp.bau.gesehen`, wie `lernapp.lesen.wurm-gesehen`): Daran sieht es, ob der
Lieferzug fahren muss.

- **Grösse:** ein Ding sind rund 15 Zeichen. 30 Stockwerke × 2 Zimmer × 24 Dinge ergeben im
  schlimmsten Fall knapp 25 KB – alle Kästen eines Kindes teilen sich ein Dokument mit 1 MiB
  Grenze (`docs/LESEECKE-KONZEPT.md`). `scripts/validate-bau.mjs` rechnet den schlimmsten Fall
  nach.
- **Zusammenführen:** das Haus nach `geaendert` (gleichzeitig an zwei Geräten bauen ist selten,
  und ein Haus lässt sich nicht sinnvoll mischen); `verdient` je Gerät das Maximum; `herzen`
  das Maximum; `erfuellt` je Tier das Maximum. Dieselbe Form wie `mergeLevels`.
- **Schreiben:** auf dem Gerät sofort, in die Cloud gebündelt – drei Sekunden nach der letzten
  Änderung und beim Verlassen der Ansicht. Wer zwanzig Möbel umstellt, schreibt einmal.
- **Was nicht gespeichert wird:** wo die Tiere gerade stehen, was sie tun, wo der Lift ist.
  Das Leben im Haus entsteht beim Öffnen neu; gespeichert sind nur Tatsachen. Ob ein Wunsch
  erfüllt ist, wird aus dem Haus gerechnet, nicht gemerkt – deshalb lässt es sich prüfen.
- **Rückgängig:** die letzten 20 Schritte, nur auf dem Gerät. Rückgängig nimmt Bauen und
  Gestalten zurück, aber **nie Ziegel aus Runden und nie Herzen**. Wird ein Stockwerk
  zurückgenommen, liegen seine zehn Ziegel wieder auf der Palette (so verhält sich die
  Stilprobe).
- **Zurücksetzen** im Profil: Das Haus bleibt, wie Lok und Landschaft bleiben – es ist ein
  Werk des Kindes, kein Messwert. Die Ziegelzählung beginnt neu, und die Palette beginnt
  leer statt im Minus: Was beim Zurücksetzen schon verbaut war, steht als `gutschrift` im
  Kasten (Entscheid 10).
- **Offline:** Alles läuft ohne Netz; der Service Worker hat alle Dateien im Vorrat.

### Was beim Zurückkommen passiert

Kein «Während du weg warst»-Bildschirm, keine Liste. Das Haus erzählt es selbst: Der
Lieferzug bringt die Ziegel, die seit dem letzten Besuch dazugekommen sind; wer neu
einzieht, steht mit Kiste vor der Tür; im Briefkasten steckt ein Brief, wenn ein Tier sich
für etwas bedanken will. Alles lässt sich wegtippen.

---

## 7. Grafik und Bewegung

### 7.1 Der Stil

Dieselbe Bildsprache wie Zug, Reise und Lesewagen: flache Formen ohne Umrisslinien, Licht und
Schatten über `shade()`, runde Ecken, warme, helle Farben. Die Tiere sind die Köpfe aus
`driverHead` auf dem Körper des Fahrgasts, ergänzt um Posen: gehen, sitzen, schlafen,
schwimmen, winken, hüpfen, getragen werden. Die Stilprobe zeichnet genau so.

- **Seitenansicht statt Iso-Perspektive.** Jedes Stockwerk ist eine Bühne, Möbel stehen auf
  einer Linie (mit einem schmalen Bodenstreifen für Tiefe, wie im Lesezimmer). Das ist für
  kleine Finger genauer zu treffen als ein schräges Raster, und es passt zum Querformat der App.
- **Gezeichnet, nicht gemalt.** Wände, Möbel und Tiere müssen sich umfärben, kombinieren und
  verschieben lassen – gemalte Bilder (wie in den Büchern) können das nicht, und sie wären
  hundertmal grösser. Gemalte Bilder passen dort, wo nichts wechselt: auf den Briefen der
  Bewohner, als Postkarte vom fertigen Haus.
- **Nacht ohne Filter:** Fassade, Boden und Fenster wechseln die Farbe über CSS-Klassen, jedes
  Zimmer bekommt einen dunklen Schleier, und wo eine Lampe steht, liegt ein warmer Lichtkreis
  (Radialverlauf) darüber. Kein `filter`, kein `mix-blend-mode` – beides kostet auf Tablets
  jedes Bild neu.

### 7.2 Bewegung: kindgerecht, nicht übertrieben

Jede Bewegung sagt etwas: Das ist neu, das ist hier gelandet, das hat geklappt. Keine
Bewegung läuft nur zur Dekoration im Kreis.

| Moment | Was man sieht | Dauer, Verlauf | Ton |
| --- | --- | --- | --- |
| Ding hinstellen | fällt von der Decke oder vom Finger, federt beim Aufsetzen, ein Staubwölkchen | Fall 180–460 ms (je nach Höhe), beschleunigt; Federn 200 ms | Plopp, 8 ms Vibration |
| Ding greifen | hebt sich, wird 6 % grösser, neigt sich leicht in Zugrichtung | sofort, folgt dem Finger 1:1 | Pop |
| Zimmerart wechseln | eine Wolke, dann springen die Möbel nacheinander herein | Wolke 520 ms, Möbel je 340 ms, 70 ms versetzt, mit Überschwingen | Wusch, Pops |
| Wand malen | eine Rolle fährt über die Wand, dahinter die neue Farbe | 520 ms | Pinsel |
| Stockwerk bauen | zehn Ziegel fliegen im Bogen von der Palette aufs Dach; das Haus wächst um ein Stockwerk, das Dach fährt mit, die Kamera auch; zwei Staubwolken | Ziegel 520 ms, 45 ms versetzt; Wachsen 820 ms mit Überschwingen | aufsteigende Töne, Klack |
| Lieferzug | fährt ein, hält vor dem Haus, Ziegel hüpfen auf die Palette, fährt weiter | Einfahrt 1,5 s, je Ziegel 520 ms, Ausfahrt 1,3 s | Pfiff, Tschu, Klonk |
| Wunsch erfüllt | Tier hüpft, ein Herz steigt auf und fliegt in die Anzeige, die kurz wächst | 620 + 620 ms | drei helle Töne, Stimme |
| Lift | Türen zu, Kabine fährt, «Ding», Türen auf | 380 ms + 360 ms je Stockwerk, weich an- und abfahrend | Ding |
| Tiere | gehen (Beine ±20°, Wippen 2 Einheiten), stehen (atmen), blinzeln alle 2,4–6 s | dauernd, aber nur im Bild | – |
| Tag und Nacht | Himmel, Fassade, Fenster blenden über, Lampen gehen an | 700 ms | – |

Regeln dazu:

- **Nur `transform`, `opacity` und Attribute**, wie auf der Bühne. Bewegt wird in **einer**
  Bildschleife (`requestAnimationFrame`), nicht mit CSS-Animationen an SVG-Teilen – genau die
  hatten auf dem Xiaomi Pad 7 die Ebenen-Lawine der Reisekarte ausgelöst
  (`docs/ABENTEUERREISE-KONZEPT.md`, «Ruhe auf der Karte»).
- **Unterbrechbar:** Ein Tipp während einer Bewegung beendet sie sofort im Endzustand. Nichts
  wartet in einer Schlange.
- **Eine grosse Feier zur Zeit.** Wachsen, Herz und Einzug kommen nacheinander, nie
  übereinander – dieselbe Regel wie bei Reise und Wagen (`naechsteFeier`).
- **Ohne Bewegung** (Einstellung des Geräts, `prefers-reduced-motion`) steht jedes Ergebnis
  sofort da; die Tiere stehen still, die Schleife schläft.
- **Töne kurz und leise**, aus den Bausteinen in `kids.js` (`tone`, `bell`); die Stimme sagt
  Wünsche und Namen, mit Alains Aufnahmen für feste Sätze, wo es sie gibt (`lesen-stimme.js`).

### 7.3 Flüssig auf dem Tablet: die Technik

**SVG für das Haus, eine Schleife für das Leben.** Zimmer und Möbel sind SVG und werden nur
neu gezeichnet, wenn sich etwas ändert – und dann nur das eine Zimmer. Was sich dauernd
bewegt (Tiere, Lift, Wasser, Kranhaken), setzt die Bildschleife über Attribute. Das ist der
Weg, auf dem die Reisekarte von 96 Ebenen und 100 Megapixeln auf 9 Ebenen und 16 Megapixel
kam; die Stilprobe liegt mit 10 Ebenen und 18 Megapixeln gleichauf. Zwei Fallen hat sie
dabei gezeigt, beide behoben: Eine zugeklappte Schublade, die nur aus dem Bild geschoben
ist, und ein leeres Element über der ganzen Bühne zogen je eine Ebene auf Bildschirmgrösse
auf. Zu ist die Schublade deshalb unsichtbar (`visibility: hidden`), und die Ebene für
fliegende Ziegel und Herzen hat keine eigene Fläche.

- **Eine Kamera, eine Ebene:** Das ganze Haus liegt in einem Rahmen, der mit `translate3d`
  verschoben wird. Gewischt wird mit eigener Rechnung (Schwung, weicher Rand) statt mit dem
  Scrollen des Browsers – so kämpft das Ziehen eines Möbels nie mit dem Scrollen.
- **Nur, was im Bild ist:** Stockwerke ausserhalb des Bildes (mit einem Stockwerk Reserve)
  werden nicht gezeichnet, und Tiere dort laufen nicht. Ein Hochhaus mit 30 Stockwerken kostet
  so viel wie eines mit vier.
- **Budgets**, geprüft von `scripts/check-bau.mjs` mit der LayerTree-Abfrage von Chromium (wie
  bei der Reisekarte): höchstens 12 Ebenen, höchstens 3000 SVG-Knoten im Dokument, beim
  Öffnen keine Aufgabe über 50 ms, im Stand ohne Tiere null Neuzeichnen je Sekunde.
- **Plan B:** Werden es einmal sehr viele Tiere, zieht nur die Lebensschicht in ein `canvas`:
  Die Figuren werden einmal aus ihrer SVG-Zeichnung in Bilder gerechnet
  (`createImageBitmap`) und dann nur noch verschoben. Das Haus bleibt SVG.
- **Kein Spiele-Framework.** PixiJS oder Three.js wären schneller bei Hunderten von Figuren,
  brauchen aber eine eigene Bibliothek von einigen hundert Kilobyte, eine andere Zeichenweise
  und machen die Browser-Tests blind, weil kein DOM mehr da ist. Für ein paar Dutzend Figuren
  ist das der falsche Tausch – und die Bauecke soll mit Zug, Lesewagen und Büchern dieselben
  Zeichnungen teilen.
- **Klein und offline:** Alles ist Code, kein Bild; die neuen Dateien sind zusammen ein paar
  hundert Kilobyte und kommen in den Vorrat des Service Workers.

---

## 8. Technik und Umsetzung

### Was dazukommt

| Datei | Was |
| --- | --- |
| `bau-katalog.js` *(neu)* | reine Daten: Zimmerarten, Möbel, Farben, Muster, Tiere mit Wünschen und Lieblingszimmern, Freischaltungen nach Herzen |
| `bau-stand.js` *(neu)* | der Kasten `lernapp.bau`, Ziegel (verdient je Gerät, verbaut), Zusammenführen, Rückgängig, ob ein Wunsch erfüllt ist (reine Funktionen) |
| `bau-art.js` *(neu)* | Zeichnungen: Stockwerk, Zimmer, Möbel, Dach, Kran, Palette, Lieferzug, Bauplatz fürs Startbild |
| `bau-leben.js` *(neu)* | die Bildschleife: Tiere gehen, schlafen, schwimmen; Lift; Wünsche; Herzen; Einzug |
| `train-bau.js` *(neu)* | die Ansicht `bau`: Kamera, Auswahl, Schublade, Ziehen, Bauen, Malen |
| `train-home.js` | Bauplatz auf dem Startbild (`positionBauplatz`), Ansicht `bau`, `?bau=1`, Lieferzug nach der Rückkehr |
| `train-art.js` | `buildPassenger` mit Posen und als Kind |
| `game-shell.js`, `app.js`, `tiersprung.js` | Ereignis `lernapp:runde-fertig`, Satz «Ein Ziegel für dein Haus» |
| `kids.js` | Töne: Plopp, Klonk, Ding, Klack |
| `styles.css` | Bauplatz, Schublade, Knöpfe (rund 400 Zeilen) |
| `firebase.js` | Elternbereich: Karte «Bauecke»; Gruppe: fremdes Haus ansehen |
| `entitlement.js` | `BAU_STOCKWERKE_FREI` (4) und `stockwerkFrei(n)`; die Schranke am Kran |
| `service-worker.js`, `index.html` | neue Dateien im Vorrat und eingebunden |
| `scripts/validate-bau.mjs` *(neu)* | Katalog stimmig, jeder Wunsch erfüllbar, jede Zimmerart hat Möbel, schlimmster Spielstand unter 64 KB |
| `scripts/check-bau.mjs` *(neu)* | Playwright: Bauplatz sichtbar und frei, Stockwerk bauen, Möbel ziehen und wegräumen, neu laden und alles ist noch da, Rückgängig, zwei Geräte zusammenführen, Ebenen und Knoten im Budget |

Nicht dabei: `firestore.rules`, `netlify.toml`, Workflows – die Bauecke braucht keine neue
Regel und keinen neuen Ordner im Build.

### Etappen

1. **Etappe 1 – Bauplatz und Haus.** Bauplatz auf dem Startbild, Ansicht `bau`, Haus mit
   Erdgeschoss und erstem Stock, Rohbau und vier Zimmerarten (Wohnung, Bad, Laden,
   Spielplatz), Malen mit Farben und Mustern, rund 25 Möbel zum Antippen, Ziehen und
   Wegräumen, Ziegel aus Runden mit Lieferzug, Palette und Wachsen, die Schranke am Kran, der
   Kasten mit Cloud, Rückgängig. Drei Bewohner (Hase, Pinguin, Eule) mit je einem Wunsch und
   Herzen. Beide Prüfskripte. *Aufwand: gross – das Ziehen und die Kamera sind das Herzstück und brauchen
   Sorgfalt auf echten Geräten.*
2. **Etappe 2 – Leben im Haus.** Einzug nach Angebot (Tabelle in 5.4), Lift mit Zahlen, Tag und
   Nacht mit Tagesablauf, Hallenbad, Schule, Kita, Bibliothek, Café, Tierarzt, Möbel, die etwas
   tun, Farbvarianten, Fassade und Dach, Herzen schalten frei, Briefkasten, Karte im
   Elternbereich, Fahrgäste der Reise ziehen ein. *Aufwand: mittel bis gross.*
3. **Etappe 3 – Ausbau.** Grosse Räume über beide Hälften, Dachgarten mit Beeten, Häuser der
   Geschwister ansehen, Bauaufträge zum Lesen, Laden mit Münzen, Uhr und Tagesplan, Namen für
   die Tiere, Hochhaus-Bild auf dem Startbild. *Aufwand: je Stück klein bis mittel, einzeln
   entscheidbar.*

Vor Etappe 1 lohnt ein halber Tag mit der Stilprobe auf dem Xiaomi Pad 7 und einem älteren
Handy: Läuft sie dort mit 60 Bildern je Sekunde (Info-Knopf → «Bildrate anzeigen»), ist der
technische Weg bestätigt.

---

## 9. Offene Entscheidungen

Mit meiner Empfehlung, damit die Umsetzung nicht daran hängen bleibt:

| # | Frage | Empfehlung |
| --- | --- | --- |
| 1 | Name | «Bauecke» – wie die Bauecke im Kindergarten, neben der Leseecke. Im Code `bau` (`lernapp.bau`, `train-bau.js`, Ansicht `bau`); gesprochen «dein Haus». Andere Möglichkeiten: «Das Haus am Gleis», «Gripshaus». |
| 2 | Ort | Bauplatz rechts auf dem Startbild, gegenüber dem Lesewagen. |
| 3 | Woher die Ziegel kommen | aus allen fertigen Runden: Zug, Leseecke und Reise. Ein Ziegel je Runde, egal wie gut – keine Ziegel für Tempo oder Sterne (3.4). |
| 4 | Was ein Stockwerk kostet | immer zehn Ziegel – eine volle Palette. Steigende Preise sind für Vierjährige nicht zu durchschauen. |
| 5 | Startgeschenk | Erdgeschoss und erster Stock fertig, der Hase wohnt darin, zehn Ziegel liegen bereit. |
| 6 | Gestalten frei? | ja, alles im gebauten Haus, so oft das Kind will. |
| 7 | Ziehen Tiere aus? | nein, nie. |
| 8 | Wer wohnt im Haus? | die Tiere der App, keine Menschen-Avatare. |
| 9 | Schranke | ohne Kauf wächst das Haus bis zum vierten Stock, dann steht am Kran die Schranke. Gestalten, Einziehen und Wünsche bleiben frei. (Ohne Grenze gäbe die beliebig oft spielbare erste Reisekarte unbegrenzt Ziegel.) |
| 10 | Zurücksetzen | das Haus bleibt, die Ziegelzählung beginnt neu. |
| 11 | Elterneinstellung? | erst einmal keine. Beobachten, ob Kinder in der Bauecke hängen bleiben; dann wäre «Bauecke erst nach einer Runde Üben» eine kleine Ergänzung im Elternbereich. |
| 12 | Häuser der Geschwister | ansehen ja (Etappe 3), ändern oder beschenken nein. |
