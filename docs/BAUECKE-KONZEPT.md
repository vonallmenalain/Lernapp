# Die Bauecke – Konzept

Stand: Oktober 2026 · Grundlage: `train-home.js`, `game-cloud.js`, `entitlement.js`, `game-shell.js`,
`app.js`, `train-art.js`, `lesen-art.js`, `train-leseecke.js`, `kids.js`, `firestore.rules`,
`docs/ABENTEUERREISE-KONZEPT.md`, `docs/LESEECKE-KONZEPT.md`, `docs/UX-REVIEW-KINDER-4-8.md` und
eine Recherche zu Toca Boca World (früher Toca Life World), Sago Mini World, Avatar World,
Pepi, Miga Town, den einzelnen Toca-Apps und weiteren Bauspielen (Abschnitt 3)

> **Stand:** Etappe 2 ist gebaut – nach der zweiten Rückmeldung vom 8. Oktober 2026:
> Wohnungen mit bis zu drei Tieren, zwei Zimmer auf jedem anderen Stockwerk, eigene Dinge
> für jedes Zimmer, Traumjobs, ein Einzug mit Lift und Feuerwerk, Stockwerke umstellen, die
> Bauecke je Konto. **Was gilt, steht im Abschnitt 0** (Etappe 2) und, wo der nichts
> anderes sagt, im Abschnitt 0E1 (Etappe 1); die Abschnitte 1, 2, 5 und 6 beschreiben das
> ursprüngliche Konzept und sind dort, wo Abschnitt 0 etwas anderes sagt, überholt. Die
> Recherche (Abschnitt 3) und Grafik und Bewegung (Abschnitt 7) gelten weiter.
>
> Zum Konzept gehört eine klickbare **Stilprobe** (Artefakt «Gripszug Bauecke»; dieselbe
> Seite liegt als `docs/bauecke-stilprobe.html` im Repo und geht nicht auf die Site). Ihr
> Code (Zeichnungen, Kamera, Ziehen, Bildschleife) war die Vorlage für die Umsetzung.
> Gemessen wie die Reisekarte (Chromium, 1600 × 1068, doppelte Auflösung):
> 10 Ebenen, davon 8 zeichnend, 18 Megapixel Ebenenfläche, 770 SVG-Knoten, 60 Bilder je
> Sekunde, während die Tiere laufen. Die Reisekarte kam nach ihrer Kur auf 9 Ebenen und 16
> Megapixel.

---

## 0. Die Umsetzung (Etappe 2)

### 0.1 Was sich gegenüber Etappe 1 geändert hat

| Thema | Etappe 1 | Etappe 2 (zweite Rückmeldung vom 8. Oktober 2026) |
| --- | --- | --- |
| Namen | Dorfzentrum, Bürohaus | **Dorf** und **Büro** |
| Speichern | ein Kasten auf dem Gerät, bei der Anmeldung ins Konto | **je Konto ein eigener Stand** – auf dem Gerät und in der Cloud. Abmelden und mit einem anderen Konto anmelden lädt dessen Stand, nichts vom vorigen. Die Ziegel ebenso. |
| Wohnen | ein Tier je Stockwerk, in jedem Zimmer | gewohnt wird nur in **Wohnungen** (Schlafzimmer oder Kinderzimmer), mit **bis zu drei Tieren**. Das Wohnhaus beginnt mit **drei leeren Wohnungen**; ein Tipp fragt nur noch: Schlafzimmer oder Kinderzimmer? |
| Stockwerke | ein Zimmer je Stockwerk | alle anderen Stockwerke haben **zwei Zimmer** nebeneinander. Ein neues Stockwerk im Wohnhaus fragt zuerst: Wohnung oder zwei Zimmer? Die anderen Häuser haben immer zwei. |
| Reihenfolge | fest | **Stockwerke umstellen**: der Pfeil-Knopf zeigt an jedem Stockwerk Pfeile nach oben und unten – so kommt der Eingang nach unten. |
| Dinge | 207 Dinge in zehn Schubladen, für alle Zimmer gleich | **832 Dinge**; **jedes Zimmer hat seine eigenen** (mindestens zehn, die es nur dort gibt, im Schnitt 13). Im Eingang steht kein Bett, im Schlafzimmer kein WC. Überall gibt es nur Deckenlampe, Stehlampe, Bild, Fenster, Pflanze, Uhr und Teppich – und das **Bild zeigt in jedem Zimmer sein eigenes Motiv** (Bäckerei eine Brezel, Radiologie ein Röntgenbild, Kinderzimmer einen Teddy …). |
| Wünsche | 5 gelbe, 2 grüne, 1 blauer je Tier | **2 gelbe, 1 grüner, 2 blaue** je Tier – je Wohnung also höchstens 6 gelbe, 3 grüne und 6 blaue Sterne. |
| Arbeit | Tiere in den anderen Häusern «arbeiten» dort | jedes Tier hat einen **Traumjob** (z. B. «Bücher ausleihen in der Bibliothek», «das WC putzen im Büro»). Gibt es das Zimmer, arbeitet es dort; sonst nimmt es irgendeinen Job. **Höchstens drei** Tiere im selben Zimmer. |
| Unterwegs | etwa ein Drittel der Zeit bei der Arbeit oder auf Ausflug | meist daheim, manchmal bei der Arbeit, ab und zu zu **Besuch in einem anderen Haus**; nachts alle daheim. Die Tafel sagt, wo ein Tier ist; «Hingehen →» führt hin. |
| Einzug | sofort mit der Zimmerart | das erste Tier kommt mit der Wahl der Wohnung; die weiteren **mit der Zeit** (alle zehn Minuten, solange die Bauecke offen ist): Es kommt die Strasse entlang, nimmt den **Lift**, und ein **Feuerwerk** begrüsst es. |
| Tier-Tafel | mit Gespräch (elf Fragen) | **ohne Gespräch**. Dafür die Mitbewohner zum Wechseln, wo das Tier gerade ist, der Traumjob und die Arbeit. |
| Zimmerart ändern | Knopf mit Haus-Symbol | ein **Stift** |
| Vorlesen | was man auswählt | dazu: **ist das Vorlesen an, liest ein Tipp auf einen Text ihn vor** (Tafel, Wahl-Fenster). |

### 0.2 Wohnungen und Tiere

- **Die Wohnung:** ein Stockwerk, ein Zimmer – Schlafzimmer oder Kinderzimmer –, so breit
  wie das Stockwerk. Mit der Wahl zieht das erste Tier ein; nach zehn Minuten (solange die
  Bauecke offen ist und das Kind das Wohnhaus sieht) das zweite, dann das dritte. Ist das
  Kind gerade anderswo, zeigt ein Punkt am Umschalter des Wohnhauses, dass jemand wartet.
  Die Zimmerart lässt sich später mit dem Stift ändern; die Tiere bleiben und bekommen
  Wünsche, die zur neuen Art passen.
- **Wünsche:** zwei gelbe für die Wohnung (einer ist das Lieblingsding oder die
  Lieblingsfarbe der Tierart, der andere passt zur Zimmerart; Mitbewohner wünschen sich
  nicht dasselbe), ein grüner für ein Zimmer im Wohnhaus («Im Wohnhaus wünsche ich mir eine
  Küche»), zwei blaue für Zimmer in den anderen Häusern. Die Lieblingsdinge aller Tierarten
  liegen in jeder Wohnung in der Schublade «Was Tiere mögen».
- **Traumjob:** ein Zimmer in Spital, Dorf oder Büro, je Tier verschieden, solange es
  geht. Wer zuerst eingezogen ist, bekommt zuerst seinen Traumjob; wer ihn nicht bekommt
  (das Zimmer fehlt oder ist mit drei Tieren voll), nimmt irgendeinen Job, wo Platz ist.
  Gibt es noch gar keinen Arbeitsplatz, «sucht es noch Arbeit». Auf der Tafel führt «Zeig
  mir, wo» zum Haus, in dem das Zimmer gebaut werden kann.
- **Wo ein Tier ist:** gerechnet in Viertelstunden, auf jedem Gerät gleich – etwa die
  Hälfte der Zeit daheim, ein Viertel bei der Arbeit (wenn es eine hat), sonst zu Besuch in
  einem Zimmer der anderen Häuser, am liebsten in einem, das es sich gewünscht hat. Von
  20 bis 7 Uhr sind alle daheim. Wer eben eingezogen ist, packt zuerst eine Viertelstunde
  aus. In der Hausansicht steht, wer zu Besuch ist oder arbeitet, im Zimmer (mit 💼), und an
  der Tür der Wohnung, wer gerade weg ist.

### 0.3 Häuser, Stockwerke, Zimmer

| Haus | Wohnungen | Zimmer für zwei |
| --- | --- | --- |
| **Wohnhaus** | Schlafzimmer, Kinderzimmer | Eingang, Wohnzimmer, Küche, Esszimmer, Badezimmer, Waschzimmer, Bastelzimmer, Terrasse, Keller |
| **Spital** | – | die 14 Abteilungen aus Etappe 1 |
| **Dorf** | – | die 20 Zimmer aus Etappe 1 |
| **Büro** | – | die 11 Zimmer aus Etappe 1 |

- **Anfang:** das Wohnhaus mit drei leeren Wohnungen, die anderen Häuser mit einem
  Stockwerk für zwei Zimmer. Die Stockwerke vom Anfang kosten keine Ziegel; die Schranke
  (ohne Kauf) steht weiter beim vierten Stockwerk – im Wohnhaus also nach einem gebauten.
- **Zimmer für zwei** sind halb so breit (280 statt 560 Zimmer-Einheiten), passen 20 Dinge
  (die Wohnung 40) und zoomen genauso bildschirmfüllend.
- **Die Dinge** stehen je Zimmerart in neun Dateien `bau-moebel-<gruppe>.js` (wohnen, haus,
  spital, station, laeden, dienste, freizeit, buero, arbeit); jede meldet ihre Dinge, die
  Zimmerlisten und die Bildmotive bei `bau-moebel.js` an (`dazu()`). Die Schublade hat die
  Reiter: Dinge des Zimmers, «Was Tiere mögen» (nur in Wohnungen), Licht/Bilder/Pflanzen,
  Wand, Boden.

### 0.4 Speichern je Konto

- `game-cloud.js` hat dafür `registerProKonto`: auf dem Gerät ein Fach je Konto
  (`lernapp.bau.konten`) und eines für den Gast (`lernapp.bau`), in der Cloud wie bisher
  der Kasten im Spielstand des Kontos. Beim Wechsel des Kontos geht, was noch aufs
  Speichern wartete, an das bisherige Kind; dann gilt der Stand des neuen – ganz, ohne
  etwas vom vorigen.
- **Ein Gast-Stand** geht bei der Anmeldung nur in ein Konto über, das noch keine Bauecke
  hat (in der Cloud und auf dem Gerät); danach ist das Gast-Fach leer. Die Ziegel des Gasts
  bleiben beim Gast.
- **Ein Stand aus Etappe 1** (damals gehörte der Kasten allen am Gerät und wuchs mit dem
  angemeldeten Konto) geht einmal an das erste Konto, das sich nach dem Update anmeldet –
  zusammen mit dem, was dieses Konto schon in der Cloud hat. Danach ist das Gerät getrennt
  (`lernapp.bau.getrennt`), und kein weiteres Konto bekommt etwas davon.
- **Fassung 2** (`FORMAT` in bau-stand.js): Ein Stand der Etappe 1 wird beim Laden
  übertragen – Schlaf- und Kinderzimmer werden Wohnungen mit ihrem Tier (es bekommt die
  neuen Wünsche und einen Traumjob), alle anderen Zimmer stehen links auf einem Stockwerk
  für zwei (die Dinge rücken zusammen, mehr als 20 passen nicht); Tiere in anderen Zimmern
  ziehen aus. Eine App der Etappe 1 räumt einen Stand der Fassung 2 nicht auf, sondern
  wartet auf die neue Fassung.
- Selbst wenn alle vier Häuser bis oben voll stehen, bleibt der Kasten unter 400 Kilobyte
  (validate-bau.mjs rechnet das nach).

### 0.5 Dateien und Prüfungen (Etappe 2)

| Datei | Was |
| --- | --- |
| `bau-moebel-*.js` *(neu, 9)* | 624 neue Dinge, die Zimmerlisten und die Bildmotive |
| `bau-moebel.js` | `dazu()`, `UEBERALL`, `RAUM_DINGE`, `MOTIVE`; das Bild zeigt das Motiv des Zimmers |
| `bau-katalog.js` | Dorf und Büro, Wohnungen (`WOHNEN`), Jobs (`JOBS`), Lieblingsdinge, `dingeFuer`; ohne Gespräch |
| `bau-stand.js` | Fassung 2: Wohnungen und Stockwerke für zwei, bis drei Tiere, Wünsche 2/1/2, Traumjob und Jobs, Aufenthalt, Einzug mit der Zeit, Umstellen, je Konto, Übertragung von Fassung 1 |
| `bau-art.js`, `train-bau.js`, `bau.css` | Zimmer halb und ganz, Sterntafel je Tier, Lift-Kabine, Einzug mit Feuerwerk, Umstellen, Stift, Tafel mit Mitbewohnern und Hingehen, Vorlesen per Tipp |
| `game-cloud.js`, `journey-plan.js`, `firebase.js` | `registerProKonto`; Ziegel je Konto; die neuen Fächer überstehen das Zurücksetzen |
| `scripts/validate-bau.mjs` | eigene Dinge je Zimmer, Motive, Erfüllbarkeit, Wohnungen und Einzug, Sterne 6/3/6, Jobs, Aufenthalt, Umstellen, Konten, Übertragung, Grösse, Fingerabdruck |
| `scripts/check-bau.mjs` | im Browser: Einzug mit Feuerwerk, Schubladen je Zimmer, Stift, Tafel mit Hingehen und Vorlesen per Tipp, Umstellen, Bauen mit «Wohnung oder zwei Zimmer?», zweiter Einzug, Tier bei der Arbeit besuchen |

### 0.6 Annahmen – bitte bestätigen

- Neue Tiere kommen nur, **solange die Bauecke offen ist** (alle zehn Minuten eines je
  Wohnung mit Platz) – so sieht das Kind jeden Einzug. Wer die Bauecke eine Woche nicht
  öffnet, findet keine fertig bevölkerten Wohnungen vor.
- **Nachts** (20 bis 7 Uhr, Uhr des Geräts) sind alle daheim.
- Ein Gast-Stand geht nur in ein Konto ohne Bauecke über; die Ziegel des Gasts nicht.

---

## 0E1. Die Umsetzung (Etappe 1)

### 0E1.1 Was sich gegenüber dem Konzept geändert hat

| Thema | Konzept | Umgesetzt (Rückmeldung vom 8. Oktober 2026) |
| --- | --- | --- |
| Häuser | ein Haus | **vier Häuser** an einer Strasse: Wohnhaus, Spital, Dorfzentrum (das öffentliche Gebäude) und Bürohaus. Beim ersten Besuch wählt das Kind, wo es anfängt; oben wechselt ein Umschalter jederzeit, ein Wischen zur Seite auch. |
| Zimmer | zwei je Stockwerk | **eines je Stockwerk**. Ein Tipp zoomt es bildschirmfüllend heran, so gross wie möglich – zum genauen Einrichten. |
| Anfang | Erdgeschoss und erster Stock fertig, Hase wohnt | jedes Haus hat sein Fundament und **ein leeres Stockwerk** (Rohbau); die Zimmerart wählt das Kind. |
| Ziegel | einer je fertiger Runde, zehn je Stockwerk | ein **Rätsel-Knopf** öffnet ein zufälliges Rätsel; gelöst bringt es **eine Palette – genug für ein Stockwerk**. Nicht geschafft: ein anderes Rätsel. Zurück in der Bauecke bringt der Zug die Palette. |
| Bewohner | ziehen nach Angebot ein, ein Wunsch je Tier, Herzen | **ein festes Tier je Stockwerk**, zieht mit der Zimmerart ein; wechselt nur, wenn das Kind es hinausschickt – dann kommt bald ein neues. **Sterne statt Herzen:** fünf gelbe (Zimmer), zwei grüne (eigenes Haus), ein blauer (anderes Haus). |
| Wünsche | fest | ändern sich frühestens **am nächsten Kalendertag**, und nur, wenn alle gelben erfüllt sind: einer fällt weg, ein neuer kommt. |
| Vorlesen | Lautsprecher-Knopf | alles, was man auswählt, wird vorgelesen (Haus, Zimmerart mit Erklärung, Ding, Farbe, Muster, Antworten der Tiere). Ein **Vorlesen-Schalter** neben dem Ton-Knopf schaltet die Stimme ganz ab. |
| Zurücksetzen | Haus bleibt, Ziegelzählung neu | **Häuser und Ziegel bleiben** – auf dem Gerät und in der Cloud. |

### 0E1.2 Die vier Häuser und ihre Zimmer

Jede Zimmerart hat einen Satz, der erklärt, was dort geschieht; ein Tipp auf die Karte liest
ihn vor. Im Spital lernt ein Kind so ganz nebenbei, was eine Radiologie oder eine
Physiotherapie ist.

| Haus | Zimmerarten |
| --- | --- |
| **Wohnhaus** (11) | Eingang, Wohnzimmer, Küche, Esszimmer, Schlafzimmer, Kinderzimmer, Badezimmer, Waschzimmer, Bastelzimmer, Terrasse, Keller |
| **Spital** (14) | Empfang, Notfall, Kinderabteilung (Pädiatrie), Radiologie, Innere Medizin, Operationssaal, Geburtsabteilung, Labor, Physiotherapie, Bettenstation, Apotheke, Augenabteilung, Intensivstation, Cafeteria |
| **Dorfzentrum** (20) | Eingangshalle, Lebensmittelladen, Bäckerei, Spielwarenladen, Kleiderladen, Blumenladen, Coiffeur, Bibliothek, Restaurant, Café, Spielplatz, Hallenbad, Turnhalle, Kino, Schulzimmer, Kita, Post, Musikzimmer, Toiletten, Velowerkstatt |
| **Bürohaus** (11) | Empfang, Grossraumbüro, Einzelbüro, Sitzungszimmer, Druckerraum, WC, Cafeteria, Archiv, Computerraum, Atelier, Fitnessraum |

Das Spital trägt ein weisses H auf Blau, nicht das rote Kreuz – das ist in der Schweiz
geschützt. Auf seinem Dach landet ein Rettungshelikopter; das Dorfzentrum hat einen
Uhrturm, das Bürohaus Sonnenkollektoren und eine Antenne, das Wohnhaus ein Satteldach mit
Kamin.

### 0E1.3 Gestalten

- **207 Dinge in zehn Schubladen:** Sitzen und Liegen, Tische und Schränke, Küche, Bad und
  Wäsche, Spital, Laden und Restaurant, Spielen und Sport, Büro und Lernen, Deko und Licht,
  Leckereien. Davor die Schublade «Passt hierher» mit dem, was zur Zimmerart gehört, und
  dem, was sich das Tier wünscht (mit Stern markiert).
- **Hinein:** antippen stellt ein Ding an die freieste Stelle, es fällt von oben herein;
  nach oben aus der Schublade ziehen stellt es dorthin, wo man loslässt. Waagrecht wischen
  blättert durch die Schublade.
- **Stapeln:** Kleine Dinge (Vase, Laptop, Tischlampe, Kuchen, Mikroskop …) landen auf der
  Fläche darunter – Tisch, Kommode, Theke, Klavier. Wird der Tisch verschoben, wandert, was
  darauf steht, mit. Was weiter unten im Bild steht, steht weiter vorn.
- **Bearbeiten:** Ein Tipp auf ein Ding öffnet ein kleines Menü: zwölf Farben (wo es
  sich umfärben lässt), umdrehen, kleiner, grösser, nach vorne, nach hinten, wegräumen.
  Wegräumen geht auch per Ziehen in den roten Kübel. **Rückgängig** nimmt jeden Schritt
  zurück.
- **Wand und Boden:** 24 Farben, elf Wandmuster (Streifen, Punkte, Karos, Sterne, Herzen,
  Blumen, Wellen, Backstein, Holz, Kacheln), sieben Böden (Parkett, Holzdielen, Plättli,
  Teppichboden, Steinboden, Linoleum, Rasen) in jeder Farbe; Licht an und aus.
- **Haus:** Fassade und Dach in jeder Farbe; Tag und Nacht (nachts schlafen die Tiere, die
  Eule nicht, und die Lampen leuchten).

### 0E1.4 Tiere und Sterne

- **16 Tierarten:** die zwölf der App (Fuchs, Bär, Hase, Katze, Panda, Frosch, Eule,
  Pinguin, Löwe, Maus, Eichhörnchen, Steinbock) und vier neue (Hund, Igel, Kuh, Elefant).
  Jedes Tier hat einen Namen; Leo, Pino, Mia, Tim und Fred kennen die Kinder aus den Büchern
  der Leseecke.
- **Wer wo wohnt:** Mit der Zimmerart zieht ein Tier ein – möglichst eine Art, die im Haus
  noch fehlt. Im Wohnhaus «wohnt» es, in den anderen Häusern «arbeitet» es. Es bleibt, bis
  das Kind es hinausschickt («Ausziehen lassen» auf der Tafel, mit Rückfrage); nach gut
  einer halben Minute kommt eine andere Art.
- **Die Wünsche – acht Sterne je Stockwerk:**
  - **gelb (5)** fürs eigene Zimmer, aus einer Liste je Zimmerart (im Schlafzimmer Bett,
    Nachttisch, Schrank, Lampe, Vorhang …). Einer davon ist immer das, was die Tierart
    besonders mag – ihr Lieblingsding (Panda: Bambus, Hase: Rüebli, Bär: Honig, Löwe:
    Melone, Katze: Kratzbaum, Igel: Laubhaufen …) oder ihre Lieblingsfarbe («Ich mag Orange.
    Malst du die Wand orange an?»).
  - **grün (2)** fürs eigene Haus: ein Zimmer, das das Haus haben sollte («Im Wohnhaus
    wünsche ich mir ein Badezimmer», «Im Spital wünsche ich mir eine Radiologie»); die
    wichtigeren kommen öfter.
  - **blau (1)** für ein anderes Haus, mit Begründung: «Im Dorfzentrum wünsche ich mir
    einen Spielplatz. Dort spiele ich am Nachmittag.» So brauchen die vier Häuser einander.
  - Ob ein Wunsch erfüllt ist, wird jedes Mal aus dem Haus ausgerechnet: Was weggeräumt
    wird, ist auch nicht mehr erfüllt. Wünsche dürfen offen bleiben – es gibt keine Strafe,
    nur weniger Sterne. Ein Tier ist nie traurig, höchstens «findet es noch ein bisschen
    leer».
- **Wo man die Sterne sieht:** an jedem Stockwerk eine Sterntafel am Lift, im Zimmer oben
  neben dem Tier, im Umschalter die Summe je Haus, auf dem Startbild die Summe aller Häuser.
- **Die Tier-Tafel** (Tipp auf Tier oder Sterne): wer es ist, wo es wohnt oder arbeitet,
  wie zufrieden es ist, die acht Wünsche mit Bild und «Zeig mir» (öffnet die Schublade beim
  passenden Ding, die Wandfarben oder das Haus, in dem das Zimmer fehlt), und ein kleines
  Gespräch: elf Fragen mit Bild («Wie geht es dir?», «Was isst du gern?», «Erzähl mir von
  dir!», «Erzähl einen Witz!» …). Die Antworten hängen von Laune, Wünschen, Tageszeit und dem
  Steckbrief der Art ab.
- **Unterwegs:** Tiere aus dem Wohnhaus sind etwa ein Drittel der Zeit bei der Arbeit oder
  auf einem Ausflug – in einem Zimmer der anderen Häuser, am liebsten in dem, das sie sich
  selbst gewünscht haben. Ihre Wohnung zeigt dann «Bin weg!», die Tafel sagt wo, und
  «Hingehen» führt hin; dort steht das Tier als Besuch. Gerechnet wird in Viertelstunden,
  für alle Geräte gleich.
- **Zeit:** Ein neuer gelber Wunsch frühestens am nächsten Kalendertag und nur, wenn alle
  gelben erfüllt sind; das Lieblingsding bleibt.

### 0E1.5 Rätsel und Ziegel

- **Der Rätsel-Knopf** zieht ein zufälliges Rätsel aus der Karte, auf der das Kind auf der
  Reise gerade fährt, und aus der davor – mit denselben Aufträgen und derselben
  Schwierigkeitsstufe wie dort (Entscheid 11). Nur die Strenge der Stufe «schwer» (drei
  Sterne) gilt nicht: gelöst ist gelöst. Auf «leicht» kommen keine Spiele, die lesen
  verlangen. Nicht zweimal dasselbe hintereinander, und wenn es geht ein anderes Spiel.
- **Auf der Spielseite** heisst die Adresse `…?station=N&bau=1&spiel=…`. Alle 25 Spiele
  verstehen sie über die Bühne (`game-shell.js`), die Rätselseiten (`app.js`) und
  Tier-Sprung: Der Weg zurück führt in die Bauecke, statt «Noch einmal» gibt es den Würfel
  «Anderes Rätsel», und es wird weder gestempelt noch ein Fehlversuch der Reise gezählt.
  Eine Schnupperrunde verbraucht ein solches Rätsel nicht.
- **Ziegel zählen:** Verdiente Paletten zählt jedes Gerät für sich
  (`lernapp.bau.lieferung`, beim Zusammenführen je Gerät das Maximum); verbaut ist jedes
  Stockwerk über dem ersten. Was übrig ist, ist die Differenz. Je Seitenaufruf gibt ein
  Rätsel höchstens eine Palette.
- **Die Lieferung:** Zurück in der Bauecke fährt der Zug mit einem Flachwagen vor, die
  Paletten fliegen zum Ziegelzähler, dann fährt die Kamera zum grünen Plus über dem Dach.
  Ein Tipp darauf: das Dach hebt sich, die Mauern wachsen, und die Zimmerwahl kommt.
- **Die Schranke:** Ohne Kauf wächst jedes Haus bis zum **vierten Stockwerk**; dann steht
  am Plus dieselbe Schranke wie vor den Spielen (`showGate`). Gestalten, Tiere und Wünsche
  bleiben frei, «ganze App gratis» öffnet auch hier alles. Ohne Kauf kommen nur Rätsel von
  Stationen, die ohnehin frei sind. **Bitte bestätigen** – das war die Empfehlung des
  Konzepts, die Rückmeldung hat die Frage offen gelassen.

### 0E1.6 Speichern

- Der Kasten `lernapp.bau` (game-cloud.js): zuerst auf dem Gerät, angemeldet in der Cloud.
  Gespeichert wird gebündelt (nach gut einer Sekunde Ruhe und beim Verlassen), damit ein
  Sofa, das zehnmal hin- und hergeschoben wird, nicht zehnmal in die Cloud geht. Höchstens
  20 Stockwerke je Haus und 40 Dinge je Zimmer: Selbst wenn alle vier Häuser bis oben voll
  stehen, bleibt der Kasten bei gut 300 Kilobyte (validate-bau.mjs rechnet das nach) – im
  Alltag sind es wenige Kilobyte.
- **Zusammenführen** (zwei Geräte, oder ein Gast, der sich danach anmeldet): Jedes
  Stockwerk hat eine eigene Kennung, und jedes, das eine Seite kennt, bleibt – so geht nie
  ein eingerichtetes Zimmer verloren, auch wenn auf beiden Seiten im selben Stockwerk gebaut
  wurde; dann steht eben eines mehr da. Dasselbe Stockwerk nimmt, was zuletzt geändert
  wurde. Der unberührte Rohbau vom Anfang verdoppelt sich nicht, und Ziegel kommen dabei
  keine dazu (übrig bleiben höchstens null). Wie überall in der App fliesst, was auf dem
  Gerät steht, bei der nächsten Anmeldung ins Konto – auch das eines Geschwisters am selben
  Tablet.
- **Neuere Fassungen der App:** Der Kasten trägt eine Fassungsnummer (`FORMAT` in
  bau-stand.js). Bringt ein Update neue Dinge, Zimmer, Tiere oder Farben, zählt es sie hoch
  (validate-bau.mjs merkt, wenn der Katalog sich ändert, und erinnert daran). Ein Gerät, das
  noch die ältere Fassung laufen hat, räumt einen neueren Kasten nicht auf – es würde
  löschen, was es nicht kennt, und das in die Cloud schreiben. Es lässt ihn stehen, zeigt
  «Die Bauecke wird gerade erneuert» und lädt gleich die neue Fassung.
- **Zurücksetzen** lässt beide Kästen stehen (`keepOnReset` in game-cloud.js,
  `BAU_KEEP_KEYS` in firebase.js) – auch in der Cloud.
- Keine Regel in `firestore.rules` ist neu: Die Bauecke liegt im Spielstand des Kindes wie
  alles andere.

### 0E1.7 Dateien und Prüfungen

| Datei | Was |
| --- | --- |
| `bau-moebel.js` *(neu)* | die 207 Dinge als SVG-Zeichnungen, mit Art, Fläche, Farbe und Wunsch-Tags |
| `bau-katalog.js` *(neu)* | Häuser, 56 Zimmerarten mit Erklärung, Farben, Muster, Böden, Tiere mit Steckbrief, Wunschlisten, Fragen und Witze |
| `bau-stand.js` *(neu)* | der Kasten, Zusammenführen, Ziegel, Bauen, Tiere, Wünsche und Sterne, Tageswechsel, unterwegs, Antworten |
| `bau-art.js` *(neu)* | Haus, Zimmerhülle, Muster, Böden, Dächer, Lift mit Sterntafel, Tiere, Strasse, Lieferzug, Mini-Häuser |
| `train-bau.js` *(neu)* | die Ansicht: Umschalter, Hausansicht mit Kamera, Zoom, Schublade, Ziehen, Menü, Tier-Tafel, Wahl-Fenster, Lieferung, Bauen |
| `bau.css` *(neu)* | das Aussehen, für Tablet und Handy im Querformat |
| `train-home.js` | Bauplatz rechts oben mit den vier Häusern, Ansicht `bau`, `?bau=1` |
| `journey-plan.js` | Rätsel für die Bauecke (`bauRaetsel`, `bauUrlFor`, `bauGeschafft`), Kasten `lernapp.bau.lieferung` |
| `game-shell.js`, `app.js`, `tiersprung.js` | Rätsel mit `bau=1`: Ziegel statt Stempel, Würfel, Rückweg |
| `game-cloud.js`, `firebase.js` | `keepOnReset`; Bauecke beim Zurücksetzen behalten |
| `kids.js`, `styles.css` | Vorlesen-Schalter neben dem Ton (nur auf dem Startbild: Die Spielseiten halten oben rechts genau Platz für zwei feste Knöpfe) |
| `scripts/validate-bau.mjs` *(neu)* | ohne Browser: Katalog, Erfüllbarkeit aller Wünsche für jede Tierart in jedem Zimmer, Sterne, Schranke, Tageswechsel, Auszug und Einzug, unterwegs, Zusammenführen (auch zwei Geräte im selben Stockwerk), Speichern ohne neuen Stand, neuere Fassung, Fingerabdruck des Katalogs, Rätselauswahl je Stufe, Adressen, Einbau |
| `scripts/check-bau.mjs` *(neu)* | im Browser auf Tablet und Handy: Bauplatz, Hauswahl, Zimmerwahl mit Vorlesen, Ziehen, Stapeln (auch mit Speichern mitten im Ziehen), Rückgängig, Malen, Menü, Tafel, Rätsel-Knopf, Lieferung, Bauen, Neuladen, Vorlesen aus, zweiter Besuch, neuere Fassung |

### 0E1.8 Was als Nächstes kommen kann

- **Häuser der Geschwister ansehen** (Entscheid 12: nur ansehen) – über die Gruppe, wie die
  Züge der anderen.
- **Mehr Leben:** der Lift fährt Besuch hinauf, Tiere setzen sich aufs Sofa und legen sich
  ins Bett, Kinder spielen auf dem Spielplatz, der Briefkasten bringt Post.
- **Mehr Dinge und Zimmer**, wo Kinder sie vermissen; eine Uhr, die die echte Zeit zeigt.
- **Auf echten Geräten messen** (Xiaomi Pad 7, ein älteres Handy): Bildrate beim Ziehen und
  beim Zoom, Ebenen wie bei der Reisekarte.

---

## 1. Die Idee in drei Sätzen

Neben dem Gleis liegt ein Bauplatz. Dort baut das Kind ein Haus, Stockwerk für Stockwerk, und
richtet jedes Zimmer selbst ein – Wohnung, Laden, Bad, Spielplatz, Hallenbad, Schule, Kita –,
malt Wände und Dach an und stellt Möbel hin, wohin es will. Die Tiere der App ziehen ein,
spielen, wünschen sich Dinge und freuen sich, wenn das Haus zu ihnen passt; die Ziegel für
neue Stockwerke bringt der Zug, wenn das Kind übt.

## 2. Auf einen Blick

> Ursprüngliches Konzept – wo Abschnitt 0 etwas anderes sagt, gilt Abschnitt 0.

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

> Ursprüngliches Konzept (zwei Zimmer je Stockwerk, Herzen, ein Wunsch je Tier) – umgesetzt
> ist, was Abschnitt 0 beschreibt.

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

> Ursprüngliches Konzept (Ziegel aus jeder Runde) – umgesetzt sind Paletten aus dem
> Rätsel-Knopf, siehe Abschnitt 0.5 und 0.6.

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

> Der Plan vor der Umsetzung. Was tatsächlich dazugekommen ist, steht in Abschnitt 0.7.

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

## 9. Entscheidungen

Die Fragen des Konzepts, mit der Antwort aus der Rückmeldung vom 8. Oktober 2026:

| # | Frage | Entschieden |
| --- | --- | --- |
| 1 | Name | «Bauecke». Im Code `bau` (`lernapp.bau`, `train-bau.js`, Ansicht `bau`). |
| 2 | Ort | rechts oben auf dem Startbild, gegenüber dem Lesewagen; die vier Häuser sind dort zu sehen, mit ihrem Fortschritt. |
| 3 | Woher die Ziegel kommen | aus dem Rätsel-Knopf: ein gelöstes Rätsel, eine Palette. |
| 4 | Was ein Stockwerk kostet | eine Palette, also ein Rätsel – die Hürde soll niedrig sein. |
| 5 | Startgeschenk | alle vier Häuser mit Fundament und je einem leeren Stockwerk, dessen Zimmerart das Kind wählt. Weitere Stockwerke brauchen Ziegel. |
| 6 | Gestalten frei? | ja, ganz frei. Wünsche dürfen offen bleiben – keine Folgen, nur weniger Sterne. |
| 7 | Ziehen Tiere aus? | nie von selbst. Nur, wenn das Kind ein Tier hinausschickt; dann kommt bald ein neues. |
| 8 | Wer wohnt im Haus? | die Tiere der App, dazu neue (Hund, Igel, Kuh, Elefant). |
| 9 | Schranke | in der Rückmeldung offen geblieben. Umgesetzt ist die Empfehlung: ohne Kauf bis zum vierten Stockwerk je Haus, dann die Schranke; Gestalten, Tiere und Wünsche frei. **Noch zu bestätigen.** |
| 10 | Zurücksetzen | Häuser und Ziegel bleiben, nichts geht verloren. |
| 11 | Elterneinstellung? | erst einmal keine. Die Rätsel richten sich nach der Schwierigkeit des Kindes in der übrigen App. |
| 12 | Häuser der Geschwister | nur ansehen (nächste Etappe). |
