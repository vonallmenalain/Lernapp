# Die Abenteuerreise – Konzept

Stand: September 2026 · Grundlage: `train-home.js`, `train-progress.js`, `train-scenes.js`,
`train-art.js`, `game-shell.js`, `game-cloud.js`, `app.js`, alle 25 Spielseiten,
`docs/SPIELVORSCHLAEGE-BEREICHE.md`, `docs/UX-REVIEW-KINDER-4-8.md`

> **Umsetzungsstand (September 2026):** Die zwölf offenen Entscheidungen in Abschnitt 11
> sind alle gemäss Empfehlung gefallen. Gebaut sind alle drei Etappen. **Etappe 1:** das
> Streckenschild vor den Toren (`train-home.js`), der Fahrplan mit sechs Karten und sechzig
> Stationen samt Aufträgen und Ausweichgleisen (`journey-plan.js`), die Streckenkarte mit
> Nebel, Stempeln, Fahrt, Kehren, Wahlstationen, Ausweichgleis, Ziel-Bahnhof, Schaufenster und
> Feier (`train-journey.js`), die Übergabe an alle 25 Spiele über `?station=`
> (`game-shell.js`, `app.js`, die Spieldateien), der Kasten `lernapp.reise` in der Cloud, die
> Belohnungen in der Werkstatt mit Schloss, die Landschaft Savanne, das Reise-Schild am Zug
> und die Zeile im Adminbereich. **Etappe 2:** die Fahrplan-Übersicht, fertige Karten zu
> Besuch, der Bonus für zehn goldene Stempel. **Etappe 3:** der **Fahrgast** je Karte (wartet
> an Station 1, springt in den ersten Wagen, steigt am Ziel aus – dort geht ein Licht an;
> Hase, Eichhörnchen, Pinguin, Panda, Steinbock, Eule, Maus, Löwe), die
> **Streckenbesonderheiten** (Kühe am Bahnübergang, Bach mit Holzbrücke, die Fähre über die
> Bucht in der rechten Kehre der See-Karte, Lianenbrücke, Zahnradstrecke mit Ratterton, Nacht
> mit Glühwürmchen, Scheinwerferkegel, leuchtendem Tunnelmund und Feuerwerk am Ziel, der Mond
> mit der Erde am Himmel, Elefanten in der Savanne), die **Schiebelok** (nach fünf
> Fehlversuchen schiebt sie den Zug zur nächsten Station – grauer Stempel, die Station lässt
> sich später nachspielen), das **Reisetempo** (Schalter je Konto im Adminbereich, «langsam»
> nimmt jeder Karte ein Stück Schwierigkeit; liegt mit Zeitmarke im Kasten der Reise) und
> **Reise 2**: nach der Sternwarte die Weltraum-Karte mit eigenem Fahrplan aus Weltall-Leveln
> (Belohnung: Landschaft Weltraum), dann die Savanne mit den Stationen der Wiese und Wald bis
> Nacht noch einmal – dieselben Stationen, drei Level höher, grössere Memorys, Weltall-Level,
> oberste Stufe, Zielpunktzahl gleich der Drei-Sterne-Schwelle (nicht darüber, damit kein
> Auftrag unerreichbar wird). Je fertiger Karte wird ein Stern auf dem Reise-Schild zum
> Goldstern; im Fahrplan steht Reise 2 als zweite Reihe mit goldenem Rahmen. Stationen 61–130.
> Prüfskript: `scripts/validate-reise.mjs`.
> **Nachgeschärft (September 2026, nach dem ersten Spielen):** Die **Gruppe auf der Karte**
> ist wieder weg – wie weit die anderen sind, steht auf dem Startbild an ihren Zügen, zweimal
> dasselbe war auf der Karte nur Gedränge. Die **Stationsnummern** sind gross und tragen die
> Farbe ihres Bereichs; an der Station, die dran ist, pulst ein grüner Ring darum. Sie sind
> jetzt das Ziel für den Finger, das Spielbild nur noch die Auskunft, was dort wartet. Die
> Karte wird **einmal je Sitzung vermessen** statt bei jedem Öffnen (der Weg dorthin dauerte
> auf einem Tablet Sekunden) und im Leerlauf nach dem Start schon vorbereitet; sie kommt erst
> ins Bild, wenn der Zug an seinem Platz steht. **Neu freigeschaltete Teile** funkeln am Zug,
> stehen in der Werkstatt mit goldenem Stern und werden vom Lautsprecher genannt, bis sie
> einmal angesehen wurden.
> **Nicht gebaut (bewusst):** Kabuse und Postkarten aus Abschnitt 9.
> Der Rest des Dokuments bleibt als Begründung stehen; zum Konzept gehört eine Seite mit
> einer klickbaren Streckenkarte (Artefakt „Abenteuerreise").

---

## 1. Auf einen Blick

Der Zug bekommt eine Strecke. Bis jetzt fährt er vom zweiten Bildschirm aus in eine von
fünf Hallen – die Bereiche, in denen ein Kind übt, was es will, so oft es will. Die
Abenteuerreise ist der sechste Weg: unten rechts, wo die Hauptstrecke heute ungenutzt aus
dem Bild läuft, geht es geradeaus weiter auf eine Streckenkarte.

Die Schleife hat vier Schritte:

1. **Station.** Auf der Karte steht der Zug an einer Station. Die Station ist ein Spiel mit
   genau einem Auftrag: ein bestimmtes Level – oder eine Runde mit einer Zielpunktzahl.
2. **Spielen.** Ein Tipp auf die Station startet das Spiel direkt im richtigen Level. Keine
   Levelwahl, keine Schwierigkeitswahl.
3. **Stempel.** Ist der Auftrag geschafft, kommt das Kind auf die Karte zurück: ein Stempel
   fällt auf die Station, das Gleis zur nächsten legt sich, der Zug fährt hin. Die nächste
   Station tritt aus dem Nebel.
4. **Ziel.** Nach zehn Stationen ist die Karte fertig: der Ziel-Bahnhof feiert, die
   Belohnung, die von Anfang an im Schaufenster stand, gehört jetzt dem Kind – und der Zug
   fährt weiter auf die nächste Karte.

Was diese Reise von einem Levelmenü unterscheidet:

- **Alles zählt doppelt.** Jede Station ist ein normales Spiel; es speichert wie immer, und
  der Wagen seines Bereichs wächst. Weil jede Karte jeden Bereich zweimal anfährt, wachsen
  alle fünf Wagen gleichmässig. Die Reise ist damit auch der kürzeste Weg zum fertigen Zug.
- **Es wird schwerer, ohne dass jemand „schwer" wählen muss.** Sechs Karten sind sechs
  Stufen: auf der Wiese die leichtesten Level und kleine Aufträge, in der Nacht die
  Meer-Level und Drei-Sterne-Runden.
- **Abwechslung ist eingebaut.** Der Fahrplan wechselt Bereich und Spielart von Station zu
  Station: nie zweimal derselbe Bereich hintereinander, nie dasselbe Spiel zweimal auf
  einer Karte.
- **Niemand bleibt stecken.** Ein missglückter Auftrag kostet nichts – die Runde zählt
  trotzdem für den Wagen –, und nach zwei Fehlversuchen öffnet sich ein Ausweichgleis mit
  einem anderen Spiel.

So fühlt sich ein Nachmittag an: Das Kind lässt den Zug abfahren, tippt unten rechts auf
das Streckenschild, der Zug rollt an den fünf Toren vorbei aus dem Bild, und die Karte
schiebt sich herein. Der Zug steht an Station 7, dahinter sechs Stempel, davor Nebel. Das
Signal ist grün: Weichen-Wirrwarr. Zwei Minuten später fällt der Stempel, der Zug fährt
durch den Tunnel eine Bahn höher, und aus dem Nebel kommt ein Turm aus Blöcken – Turmbau.
Ganz oben rechts wartet die Windmühle, und im Schaufenster daneben hängt, noch hinter
Schloss, ein Regenbogen-Wimpel für die Lok.

Dazu kommen meine Vorschläge, die im Rest des Dokuments ausgeführt sind: Wahlstationen,
der Nebel, das Schaufenster am Ziel-Bahnhof, goldene Stempel, Belohnungen für Lok und
Landschaft, ein Fahrgast je Karte als kleine Geschichte und je Landschaft eine
Streckenbesonderheit (Fähre, Zahnrad, Tunnel).

---

## 2. Der Einstieg: unten rechts vor den Toren

Heute (`train-home.js`, `AREA_STOPS`) steigen die fünf Tore von links unten nach rechts
oben den Hang hinauf; der Zug wartet links unten auf der Hauptstrecke, und die
Hauptstrecke läuft rechts leer aus dem Bild. Genau dort, unten rechts, ist Platz.

**Vorschlag: kein sechstes Tor, sondern ein Streckenschild.** Die fünf Tore sind Hallen, in
die man abbiegt – üben, so oft man will. Die Reise ist etwas anderes: die Strecke selbst.
Deshalb soll der Einstieg auch anders aussehen:

- Am rechten Rand, auf der Hauptstrecke, ein **Wegweiser mit Streckenschild**: ein Pfosten,
  darauf eine Tafel mit dem Zeichen der Reise – eine geschwungene Linie mit drei Stationen.
  Dasselbe Zeichen steht später auf dem Fahrplan-Knopf der Karte. Daneben ein kurzer
  Bahnsteig mit Laterne und Bank, damit es nach Abfahrt aussieht und nicht nach Schild.
- Auf der Tafel die **Nummer der nächsten Station** in der Marke, die auch die Spielbilder
  tragen (`progressBadge`). Ein Kind sieht so schon von hier, wie weit es ist.
- Steht ein Ziel-Bahnhof kurz bevor oder ist eine Belohnung neu, funkelt die Tafel.
- **Antippen:** Horn, der Zug fährt geradeaus auf der Hauptstrecke an allen fünf Weichen
  vorbei und rechts aus dem Bild (die bestehende Fahrt `data-moving="out"`, ohne Rampe).
  Die Karte schiebt sich von rechts herein – die Fahrt geht sichtbar weiter, statt in eine
  Halle zu enden.
- Das Schild ist antippbar wie ein Tor (`activate`), Trefferfläche mindestens so gross wie
  ein Tor, und es liegt nicht unter dem Zug, der links wartet.

Auf dem Startbild ändert sich nichts – das Startbild bleibt der Zug. Der Zurück-Knopf der
Karte führt vor die Tore.

---

## 3. Die Streckenkarte

Die Karte ist eine eigene Ansicht auf dem Startbild (`stage`, wie Werkstatt und
Wagen-Ansicht), keine eigene Seite: sie braucht die Bühne, die Landschaft, die Feiern, den
Lautsprecher und den Zurück-Knopf, die dort schon stehen.

### Was zu sehen ist

- **Die Landschaft der Karte** – dieselben Ebenen wie auf dem Startbild
  (`train-scenes.js`), aber stehend: die Karte fährt nicht, der Zug fährt.
- **Das Gleis als Schlange** in drei Bahnen: unten von links nach rechts, in der Mitte
  zurück, oben wieder nach rechts bis zum Ziel-Bahnhof oben rechts. Gezeichnet wie die
  Rampen zu den Toren (`branchRail`: Schwellen, Schiene, Lichtkante).
- **An jeder Kehre etwas Grosses** – ein Tunnel im Berg, ein dichter Wald, ein Felsen, eine
  Scheune: der Zug fährt hinein und kommt eine Bahn höher wieder heraus. Das ist nicht nur
  hübsch, sondern nötig: der Zug ist von der Seite gezeichnet, und eine Lok, die eine Kehre
  sichtbar durchfährt, käme auf dem Kopf stehend heraus. Im Tunnel dreht sie sich
  unbemerkt um. Für Vierjährige ist es ausserdem ein Versteckspiel: weg – und da!
- **Zehn Stationen** am Gleis, jede mit dem Bild ihres Spiels (`buildBuilding`, klein) in
  der Farbe seines Bereichs. Vier Zustände:
  - *gestempelt*: das Bild trägt einen Stempel – in der Bereichsfarbe, bei drei Sternen
    oder einer „guten" Runde in Gold;
  - *aktuell*: ein grünes Signal mit pulsierendem Ring, wie das Startsignal. Hier geht es
    weiter;
  - *nächste*: sichtbar, ohne Signal – das Kind sieht, was danach kommt;
  - *im Nebel*: alle weiteren Stationen liegen unter einer Wolke, nur als Umriss zu
    erkennen. Der Nebel hebt sich Station für Station. Im Nebel ist nichts antippbar.
- **Der Zug**: Lok und alle fünf Wagen im echten Ausbaustand, klein, an der aktuellen
  Station. Es ist derselbe Zug wie auf dem Startbild – wer einen Wagen fertig hat, fährt
  mit ihm die Reise.
- **Der Ziel-Bahnhof** oben rechts mit dem Wahrzeichen der Karte (Windmühle, Leuchtturm,
  Sternwarte …) und einem **Schaufenster**: darin die Belohnung dieser Karte, mit Schloss,
  wie die gesperrten Landschaften in der Landschaftswahl. Das Kind sieht von der ersten
  Station an, wofür es fährt.
- **Kopfzeile**: Zurück links wie überall, daneben der Fahrplan-Knopf (Abschnitt 6),
  rechts die zehn Punkte der Karte (wie die Schrittpunkte des Wagens). Der Lautsprecher
  oben links sagt: „Station drei von zehn. Als Nächstes: Fischteich. Fang fünf Fische."

### Was ein Tipp tut

- **Aktuelle Station** → das Spiel startet sofort mit dem Auftrag (Abschnitt 4).
- **Gestempelte Station** → dasselbe Spiel noch einmal, um den goldenen Stempel zu holen.
  Der Zug bleibt, wo er ist.
- **Zug** → wie auf dem Startbild: Wagen gross ansehen, Lok in die Werkstatt. Zurück führt
  wieder auf die Karte.
- **Schaufenster** → der Lautsprecher sagt, was drin ist und wie viele Stationen noch
  fehlen.
- **Im Nebel** → nichts. Ein Tipp dorthin lässt die Wolke kurz wackeln, mehr nicht.

---

## 4. Was eine Station verlangt

„Genau ein Level" heisst bei fünfundzwanzig Spielen dreierlei, und die Regel muss je
Spielart klar sein. Die Einteilung folgt `highscore.js` (`art: katalog | sterne | punkte`).

| Spielart | Spiele | Der Auftrag | Geschafft, wenn … | Goldener Stempel |
|---|---|---|---|---|
| **Katalog-Spiele** (Level aus `app.js`) | Arukone, Battleships, Tiergehege, Kakuro, Hidoku, Buchstabenjagd, Wortdetektiv | ein bestimmtes Level, z. B. „Tiergehege, Wiese 3" | das Level ist gelöst | drei Sterne (`kids.getStars`) |
| **Level-Spiele mit Sternen** | Weichen-Wirrwarr, Freie Fahrt, Fässer stapeln, Tier-Sprung, Memory (Kartenzahl) | ein bestimmtes Level bzw. eine Kartenzahl | das Level ist mit mindestens einem Stern beendet | drei Sterne |
| **Runden-Spiele** (Punkte) | die übrigen dreizehn: Rucksack, Strand-Schätze, Kacheln, Was fehlt?, Schwarm-Fokus, Fischteich, Halt am Signal, Karten-Merker, Blätter im Strom, Turmbau, Doppelt gleich, Raumdetektiv, Wo hält der Zug? | eine Runde mit Zielpunktzahl, z. B. „fang fünf Fische" | die Runde ist zu Ende und die Punkte erreichen das Ziel | Punkte ≥ „gut", die Drei-Sterne-Schwelle aus `train-progress.js` |

Drei Regeln dazu:

- **Die Station ist der Schlüssel.** Die Katalog-Spiele schalten ihre Level heute in einer
  Kette frei (`isLevelUnlocked`: erst das vorige lösen). Für die Reise gilt die Kette
  nicht: das Level der Station ist frei, weil die Station es verlangt. Sonst müsste ein
  Kind für Station 14 erst Wiese 1 bis 6 nachspielen. (Empfehlung; offen in Abschnitt 11.)
- **Der Auftrag ist im Spiel sichtbar.** Bei den Runden-Spielen steht das Ziel oben rechts
  im Zähler der Bühne („3 / 5", mit einem kleinen Fähnchen), und der Lautsprecher sagt es.
  Bei Level-Spielen steht das Level schon fest, es gibt nichts zu wählen. Der Zurück-Pfeil
  führt auf die Karte, nicht in die Spielauswahl des Bereichs.
- **Nicht geschafft kostet nichts.** Die Runde zählt wie jede Runde für den Wagen („wer
  übt, kommt voran" – so rechnet `runsProgress` heute schon). Die Tafel am Schluss zeigt
  „nochmal" und „zurück zur Karte". Nach zwei Fehlversuchen an derselben Station stellt
  sich auf der Karte eine Weiche: ein **Ausweichgleis** zu einem zweiten Spiel desselben
  Bereichs mit einem etwas leichteren Auftrag. Beide Gleise führen zur selben nächsten
  Station.

**Zielpunktzahlen** sind keine Handarbeit je Station, sondern eine Rechnung:
`gut × Faktor der Karte`, aufgerundet, mindestens 3. `gut` steht je Spiel schon in
`OWN_PROGRESS` (Fischteich 14, Schwarm-Fokus 30, Turmbau 14 …). Die Faktoren stehen in der
Karten-Tabelle unten. Beispiel Fischteich: Karte 1 verlangt 5 Fische, Karte 3 acht,
Karte 6 vierzehn.

---

## 5. Sechs Karten, sechs Stufen

Jede Landschaft ist eine Karte, in der Reihenfolge, in der die Geschichte weitergeht: von
der Wiese vor der Haustür bis in die Nacht.

| # | Karte | Wahrzeichen am Ziel | Katalog-Level | Level-Spiele | Runden: Faktor | Streckenbesonderheit | Belohnung |
|---|---|---|---|---|---|---|---|
| 1 | Wiese | Windmühle | Wiese 1–3 | Level 1–2, Memory 8 | 0.35 | Bahnübergang mit Kühen | Wimpel **Regenbogen** |
| 2 | Wald | Baumhaus-Bahnhof | Wiese 4–7 | Level 2–3, Memory 8 und 12 | 0.45 | Holzbrücke über den Bach | Chauffeur **Eichhörnchen** |
| 3 | See | Leuchtturm | Wiese 8–10, Wald 1–2 | Level 3–5, Memory 12 | 0.55 | **Fähre** über den See | Pfeife **Schiffshorn** |
| 4 | Dschungel | Tempel hinter der Hängebrücke | Wald 3–6 | Level 5–6, Memory 16 | 0.65 | Hängebrücke, Lianen | Landschaft **Savanne** (neu) |
| 5 | Berge | Gipfelhütte | Wald 7–10, Meer 1–3 | Level 7–8, Memory 20 | 0.8 | **Zahnradstrecke** und Tunnel | Chauffeur **Steinbock** |
| 6 | Nacht | Sternwarte | Meer 4–8 | Level 9–10 (Freie Fahrt 10–12), Memory 24 | 1.0 | Scheinwerferkegel, Glühwürmchen, Feuerwerk am Ziel | **Sternenlok**: Kessel Gold, Lampe Stern – und Reise 2 |

Danach **Reise 2** auf einer neuen Karte „Weltraum" mit den Weltall-Leveln der
Katalog-Spiele und Aufträgen über „gut" (Ausbau, Abschnitt 9).

### Der Fahrplan

Welche Station welches Spiel ist, steht fest und ist für alle Kinder gleich – so lässt es
sich prüfen, und in der Gruppe ist „Station 23" für alle dasselbe. Der Fahrplan steht in
einer Datei (`journey-plan.js`) und folgt Regeln, die ein Prüfskript nachrechnet:

1. Zehn Stationen je Karte, jeder Bereich genau zweimal.
2. Nie zweimal hintereinander derselbe Bereich; nie dasselbe Spiel zweimal auf einer Karte.
3. Über die sechs Karten kommt jedes der 25 Spiele mindestens zweimal dran, und Merken,
   Tempo und Rätseln wechseln sich ab.
4. Station 4 und Station 8 sind **Wahlstationen**: zwei Spiele desselben Bereichs stehen
   nebeneinander, das Kind tippt eines an, das andere klappt weg. So hat es zweimal je Karte
   die Wahl, ohne dass die Reise zum Menü wird.
5. Station 10 ist der Ziel-Bahnhof: ein Rätsel, das etwas Zeit braucht (Katalog- oder
   Level-Spiel), nie ein Tempospiel – die Ankunft soll nicht an 45 Sekunden hängen.
6. Die Stationen 1 und 2 jeder Karte verlangen nichts, was ein Kind lesen müsste: kein
   Wortdetektiv, keine Buchstabenjagd, kein Kakuro auf der Wiese.

### Beispiel: Karte 1, Wiese

| Station | Bereich | Spiel | Auftrag |
|---|---|---|---|
| 1 | Gedächtnis | Was fehlt? | 3 Wagen richtig kontrolliert |
| 2 | Geschwindigkeit | Tier-Sprung | Level 1 (Maus auf der Wiese) |
| 3 | Zahl und Buchstabe | Wo hält der Zug? | 15 Punkte |
| 4 | Konzentration – *Wahl* | Halt am Signal **oder** Fischteich | 8 Punkte / 5 Fische |
| 5 | Problemlösen | Fässer stapeln | Level 1 |
| 6 | Gedächtnis | Memory | 8 Karten |
| 7 | Konzentration | Weichen-Wirrwarr | Level 1 |
| 8 | Geschwindigkeit – *Wahl* | Turmbau **oder** Doppelt gleich | 5 Blöcke / 7 Paare |
| 9 | Zahl und Buchstabe | Buchstabenjagd | Wiese 1 |
| 10 | Problemlösen – *Ziel* | Tiergehege | Wiese 1 |

Die Aufträge sind gerechnet: Was fehlt? 8 × 0.35 = 2.8 → 3; Wo hält der Zug?
42 × 0.35 = 14.7 → 15; Halt am Signal 22 × 0.35 = 7.7 → 8; Fischteich 14 × 0.35 = 4.9 → 5;
Turmbau 14 × 0.35 = 4.9 → 5; Doppelt gleich 20 × 0.35 = 7.

---

## 6. Fortschritt sichtbar machen

Für ein Kind, das nicht liest, muss Fortschritt ein Bild sein. Vier Bilder, vom Nächsten
zum Fernsten:

1. **Der Stempel** auf der Station – sofort, mit Ton und Konfetti. Gold, wenn die Runde gut
   war. Gold zu holen ist der Grund, eine Station noch einmal zu spielen.
2. **Der Zug rückt vor**, und der Nebel hebt sich. Die Karte selbst ist der
   Fortschrittsbalken: hinter dem Zug Stempel, vor ihm Wolken.
3. **Die zehn Punkte** in der Kopfzeile und das **Schaufenster** am Ziel, das mit jeder
   Station näher rückt.
4. **Der Fahrplan** (Knopf in der Kopfzeile): alle Karten als ein Streckenband, wie
   ein Liniennetzplan – jede Station ein Punkt, gestempelt oder nicht, die Belohnungen an
   den Zielen, die eigene Position markiert. Von hier aus lassen sich fertige Karten wieder
   öffnen, für goldene Stempel. Für Eltern ist das zugleich die Übersicht, was das Kind
   geschafft hat.

Dazu zwei Bilder ausserhalb der Karte:

- **Das Streckenschild** vor den Toren zeigt die Nummer der nächsten Station.
- **Ein Reise-Schild am Zug** (Vorschlag): eine kleine Tafel am Tender der Lok mit einem
  Stern je fertiger Karte. Sie ist auf dem Startbild zu sehen – und damit auch auf den Zügen
  der anderen in der Gruppe. Wer sechs Sterne hat, hat die Reise geschafft, und alle sehen
  es.

**Ein Fahrgast je Karte (Vorschlag).** Damit jede Karte ein Ziel hat, das ein Kind auch
ohne Worte versteht: An Station 1 wartet ein Tier auf dem Bahnsteig – der Pinguin auf der
See-Karte, das Eichhörnchen im Wald, die Eule in der Nacht. Es steigt ein (ein Kopf schaut
aus dem letzten Wagen, gezeichnet mit `driverHead`) und fährt mit. Am Ziel-Bahnhof steigt
es aus, winkt, und dort, wo es hingehört, geht ein Licht an. Auf zwei Karten ist der
Fahrgast zugleich die Belohnung: das Eichhörnchen und der Steinbock dürfen danach die Lok
fahren. Mit den vorhandenen Tierköpfen ist das billig, und es gibt der Reise eine
Geschichte in drei Bildern: einsteigen, mitfahren, ankommen.

---

## 7. Belohnungen und Freischaltungen

Drei Grundsätze:

- **Sichtbar, bevor man es hat.** Die Belohnung steht im Schaufenster am Ziel, mit Schloss.
  Ein Ziel, das man sieht, zieht; eine Überraschung, von der man nichts weiss, nicht.
- **Am Zug zu sehen.** Was die Reise gibt, trägt der Zug: Wimpel, Chauffeur, Pfeife, Lok.
  Das Kind sieht es bei jedem Start, und die Gruppe sieht es auch.
- **Kein Sammelalbum.** Der Sticker-Zoo wurde mit dem Zug-Umbau bewusst entfernt („der Zug
  bildet den Fortschritt ab"). Die Reise legt keine zweite Sammlung an: Stempel und
  Fahrplan sind Fortschritt, keine Sticker.

### Die Werkstatt bekommt gesperrte Teile

Heute ist in der Werkstatt alles frei. Neu gibt es je Bauteil ein bis zwei Varianten mit
Schloss – dieselbe Darstellung wie bei den gesperrten Landschaften –, die nur die Reise
freischaltet:

| Belohnung | Bauteil (`LOCO_PARTS`) | Was zu tun ist |
|---|---|---|
| Wimpel Regenbogen | `flag`, neues Muster `rainbow` | ein Muster in `buildLoco`, ein Schloss in der Werkstatt |
| Chauffeur Eichhörnchen, Chauffeur Steinbock | `driver` | zwei Köpfe in `DRIVERS` (Ohrform `tuft` bzw. neue Form `horns`) |
| Pfeife Schiffshorn | `whistle`, neuer Klang | ein Klang in `playWhistle` (`kids.js`) |
| Kessel Gold, Lampe Stern | `body`: eine Farbe ausserhalb der Palette; `lamp`: neue Form `star` | eine Farbe, eine Form |

### Landschaften

Zwei neue Landschaften in `train-scenes.js`: **Savanne** (Akazien, gelbes Gras, ferne
Giraffen) nach Karte 4 und **Weltraum** (Sterne, Mond, die Erde am Horizont) nach Karte 6.
Beide sind zugleich die Karten von Reise 2. Eine Landschaft ist Grafikarbeit (Aufwand
mittel je Landschaft), deshalb nur zwei – die übrigen vier Belohnungen sind kleine Teile.

### Goldene Stempel

Zehn goldene Stempel auf einer Karte geben einen Bonus, der nicht im Schaufenster steht:
goldene Räder nach der ersten ganz goldenen Karte, ein zweiter Wimpel nach der zweiten. Das
ist der Grund, eine fertige Karte noch einmal zu fahren – für Kinder, die schon alles haben.

### Die Feiern

Kleine Feier je Station: Stempel, Ton, Konfetti auf der Karte, kein Dialog. Grosse Feier je
Karte in der Karte selbst: das Wahrzeichen tut etwas (die Mühle dreht sich, der Leuchtturm
blinkt, über der Sternwarte gibt es Feuerwerk), dann die Belohnungs-Karte im Stil der
Wagen-Feier (`wagon-reward-card`) mit dem Teil gross in der Mitte. Ist gleichzeitig ein
Wagen gewachsen, kommt seine Feier danach – erst die Reise, dann der Wagen, damit nichts
zweimal feiert.

---

## 8. Neue Animationen

Alles läuft über `transform` und `opacity`, wie die bestehende Bühne; mit
`prefers-reduced-motion` steht jeweils das Ergebnis sofort da.

1. **Abfahrt auf die Strecke.** Vor den Toren: Horn, der Zug rollt geradeaus an den fünf
   Weichen vorbei und rechts aus dem Bild; die Karte kommt von rechts hereingeschoben,
   während der Zug links auf ihr einfährt (die bestehenden `moving`-Fahrten, neu kombiniert).
2. **Die Karte lebt.** Wolken ziehen, Vögel fliegen (aus der Landschaft übernommen),
   Wasser glitzert, an der Station dampft die Lok leise. Ein Tipp auf die Lok: Horn.
3. **Der Stempel.** Zurück aus dem Spiel: der Stempel fällt von oben auf die Station, mit
   kurzem Rückprall, Ton (`star`) und Konfetti (`burstConfetti`) an der Station.
4. **Gleis legen.** Das Stück Gleis zur nächsten Station war blass; jetzt legt es sich
   Schwelle für Schwelle (`stroke-dashoffset`), und das Signal springt auf Grün.
5. **Die Fahrt.** Lok und Wagen folgen dem Gleis durch die Kurve, jedes Fahrzeug an seiner
   Stelle des Pfads (`getPointAtLength`), Räder drehen, Dampf. Rund zwei Sekunden; vor der
   Ankunft ein kurzer Pfiff – die Pfeife der Lok aus der Werkstatt hat endlich einen
   Auftritt.
6. **Durch den Tunnel.** An den Kehren verschwindet der Zug im Tunnel, Wald oder Felsen und
   kommt eine Bahn höher wieder heraus. Ein Scheinwerferkegel im Tunnelmund, ein
   Rauchwölkchen an der Ausfahrt.
7. **Der Nebel hebt sich.** Die Wolke über der nächsten Station treibt davon, das Spielbild
   darunter wird scharf und hüpft einmal.
8. **Wahlstation.** Zwei Spiele stehen nebeneinander; das gewählte rückt auf das Gleis, das
   andere kippt weg. Beim Ausweichgleis dasselbe Bild, nur dass sich vorher eine Weiche
   stellt.
9. **Ankunft am Ziel.** Das Wahrzeichen tut etwas, das Schaufenster springt auf, das Schloss
   fällt ab; dann die Belohnungs-Karte. Danach fährt der Zug rechts aus der Karte, die
   nächste Karte schiebt sich herein (Parallaxe: ferne Ebenen langsamer), und der Zug fährt
   links ein.
10. **Streckenbesonderheiten** (je Karte eine, Ausbau): die Fähre, die den Zug über den See
    trägt; die Zahnradstrecke, auf der der Zug langsamer und mit Ratterton steigt; der
    Scheinwerferkegel in der Nacht.

---

## 9. Weitere Ideen, ausserhalb des Kerns

- **Die Gruppe auf der Karte.** *(Gebaut und wieder entfernt.)* Je Freund ein Fähnchen mit
  Namen an seiner Station sah nach Gedränge aus und sagte nichts, was der Zug des anderen auf
  dem Startbild nicht schon zeigt. Der Vergleich bleibt dort, die Karte gehört dem eigenen Zug.
- **Reise 2.** Nach der Sternwarte beginnt die Reise von vorn, zuerst auf einer
  Weltraum-Karte, danach auf den bekannten Karten mit Weltall-Leveln und Aufträgen über
  „gut". Im Fahrplan golden gerahmt.
- **Schiebelok.** Für die Jüngsten: nach fünf Fehlversuchen an einer Station (Ausweichgleis
  eingerechnet) kommt eine Hilfslok und schiebt den Zug zur nächsten Station – ohne Stempel.
  Niemand bleibt für immer vor Kakuro stehen. Ob das gewollt ist: Abschnitt 11.
- **Reisetempo (Admin).** Ein Schalter im Adminbereich, „langsam": alle Stufen um eine Karte
  nach hinten (Karte 2 verlangt die Aufträge von Karte 1). Für Vier- bis Fünfjährige, ohne
  dass ein Kind je „leicht" wählen muss.
- **Kabuse.** Ein Schlusswagen mit Laterne als Trophäe nach Reise 1, hinten am Zug. Schön,
  aber der Zug ist in der Breite ausgereizt (`buildTrain` rechnet mit fünf Wagen); deshalb
  erst, wenn sonst nichts mehr ansteht.
- **Postkarten.** Am Ziel jeder Karte eine Postkarte vom Wahrzeichen, die der Lautsprecher
  vorliest und die im Fahrplan liegt – eine Erinnerung an die Karte, ohne Sammelalbum.
  Vielleicht.

---

## 10. Technik und Umsetzung

### Wo der Stand liegt

Ein Kasten in `game-cloud.js`, damit er mit Konto, Zurücksetzen und Gruppe von selbst
mitläuft:

```js
// lernapp.reise – lokal und in users/<uid>.gameState
{
  station: 13,                 // die nächste offene Station, 1-basiert über alle Karten (1–60)
  done: {                      // je gestempelter Station das beste Ergebnis
    "12": { stars: 3, game: "fishPond", at: 1757500000000 },
  },
  tries: { "13": 2 },          // Fehlversuche an der offenen Station (Ausweichgleis)
  choice: { "4": "goSignal" }, // was an Wahlstationen gewählt wurde
  golden: 3,                   // goldene Stempel, für den Fahrplan
}
```

Zusammenführen: `station` das Maximum, `done` die Vereinigung mit den besseren Sternen,
`tries` das Maximum – dieselbe Form wie `mergeLevels`. Zurücksetzen räumt den Kasten mit
allen anderen weg (`resetAll`). Die Gruppe sieht den Stand ohne Zusatzaufwand.

### Der Fahrplan

`journey-plan.js`: die sechs Karten, ihre Stationen (Bereich, Spiel, Auftrag),
Belohnungen, Faktoren. Wird auf dem Startbild und auf allen Spielseiten geladen, weil das
Spiel den Auftrag kennen muss. Kleine Helfer: `stationAt(n)`, `taskFor(n)`,
`markDone(n, result)`, `isDone(n)`.

### Die Übergabe zwischen Karte und Spiel

Über die Adresse, wie heute `?bereich=`:

- **Karte → Spiel:** `fischteich.html?station=13`. Das Spiel liest die Station, startet
  direkt im Auftrag (bei Katalog-Spielen `startLevel` mit dem Level der Station, ohne
  Levelwahl und ohne `isLevelUnlocked`), zeigt das Ziel im Zähler und liest es vor.
- **Spiel → Karte:** bei Erfolg schreibt das Spiel `markDone` und geht zu
  `index.html?reise=1`; Zurück führt ebenfalls dorthin, das Haus aufs Startbild. Die Karte
  vergleicht wie bei den Wagen „gesehen" mit „jetzt" (das `SEEN`-Muster aus
  `train-home.js`) und feiert, was neu ist – so stimmt es auch, wenn der Stand aus der Cloud
  kommt oder die Seite dazwischen neu geladen wurde.

### Die Karte

Eine Ansicht `reise` der Bühne in `train-home.js` – aber in einer eigenen Datei
`train-journey.js`; `train-home.js` ist mit zweitausend Zeilen voll genug. Was sie von der
Bühne nimmt: Landschaft, Zurück-Knopf, Feiern (`showWagonReward`), Lautsprecher, Musik.
Der Zug auf der Karte ist nicht das `train-band` (das ist gross und fährt geradeaus),
sondern ein zweiter kleiner Zug im Karten-SVG aus `buildLoco` und `buildWagon` – so wie
die Züge der Gruppe.

### Was dazukommt

| Datei | Was |
|---|---|
| `journey-plan.js` *(neu)* | Fahrplan, Faktoren, Helfer, Kasten in `game-cloud` |
| `train-journey.js` *(neu)* | Karte zeichnen, Nebel, Stationen, Fahrt, Stempel, Ziel-Feier, Fahrplan-Übersicht |
| `train-home.js` | Streckenschild vor den Toren, Ansicht `reise`, Abfahrt, Rückweg |
| `train-art.js` | Streckenschild, Stempel, Wahrzeichen, Schaufenster, neue Chauffeure, Wimpel, Lampe, Reise-Schild |
| `train-scenes.js` | zwei neue Landschaften (Savanne, Weltraum), später |
| `game-shell.js` | Auftrag im Zähler, Rückweg zur Karte, Ergebnis-Tafel mit „zurück zur Karte" |
| `app.js` | `?station=` lesen, Level direkt starten, Rückweg |
| die 25 Spielseiten | `?station=` einlösen (meist über `game-shell`), `journey-plan.js` einbinden |
| `kids.js` | Pfeife Schiffshorn, Reise-Jingle |
| `styles.css` | Karte, Nebel, Stempel, Signal, Fahrplan (rund 400 Zeilen) |
| `firebase.js` | Adminbereich: „Station 23 von 60", Fahrplan-Strich je Kind, optional Reisetempo |
| `service-worker.js`, `train-test.html` | Vorratsliste; Prüfseite mit Stempeln und Wahrzeichen |
| `scripts/validate-reise.mjs` *(neu)* | Fahrplan-Regeln, Verweise auf echte Level, steigende Stufen, Aufträge ≥ 3 |
| `scripts/check-reise.mjs` *(neu)* | Playwright: Schild sichtbar, Fahrt kommt an, Tipp öffnet das richtige Level, Rückweg |

### Etappen

1. **Kern – Karte 1 fahrbar.** Fahrplan-Datei, Kasten, Streckenschild, Ansicht mit Gleis
   und zehn Stationen, Nebel, Fahrt, Stempel, Übergabe an alle drei Spielarten, Rückweg,
   Ziel-Feier mit der ersten Belohnung (Wimpel), Prüfskripte.
   *Aufwand: mittel bis gross – die Übergabe an 25 Spiele ist Fleissarbeit, die Fahrt ist
   das Herzstück.*
2. **Die ganze Reise.** Karten 2–6 mit Wahrzeichen, Wahlstationen, Ausweichgleis, alle
   Belohnungen in der Werkstatt, Fahrplan-Übersicht, goldene Stempel, Reise-Schild am Zug,
   Adminbereich. *Aufwand: mittel.*
3. **Ausbau.** Fahrgast, Streckenbesonderheiten (Fähre, Zahnrad, Tunnel-Licht), neue
   Landschaften Savanne und Weltraum, Gruppe auf der Karte, Reise 2, Schiebelok,
   Reisetempo. *Aufwand: je Stück klein bis mittel, einzeln entscheidbar.*

---

## 11. Offene Entscheidungen

Mit meiner Empfehlung, damit die Umsetzung nicht daran hängen bleibt:

1. **Name.** „Abenteuerreise" – wobei das zweite Wagen-Set schon „Abenteuerzug" heisst.
   Für die Kinder ist der Name egal, es steht nirgends ein Wort; im Code und im
   Adminbereich sollte er eindeutig sein. Empfehlung: im Code „Reise" (`lernapp.reise`,
   `train-journey.js`, Ansicht `reise`), gesprochen „die Reise" – und „Abenteuerreise" im
   Gespräch mit den Eltern.
2. **Zehn Stationen je Karte, sechs Karten** – 60 Stationen, jedes Spiel mindestens
   zweimal. Empfehlung: ja; mehr Strecke später über Reise 2, nicht über längere Karten.
3. **Ein Stern genügt.** Stationen verlangen keine Sternzahl; Gold ist Bonus. Empfehlung:
   ja – sonst hält Weichen-Wirrwarr Level 9 die ganze Reise an.
4. **Levelkette umgehen.** Das Level der Station ist frei, auch wenn im Spiel das vorige
   noch nicht gelöst ist. Empfehlung: ja. Die Alternative – die Reise verlangt immer das
   nächste offene Level des Kindes – macht die Stufe unplanbar.
5. **Wahlstationen** an Station 4 und 8. Empfehlung: ja, zwei je Karte.
6. **Belohnung sichtbar** im Schaufenster statt als Überraschung. Empfehlung: sichtbar;
   Überraschung nur beim Bonus für goldene Stempel.
7. **Rückweg aus einem Reise-Spiel** auf die Karte statt in den Bereich. Empfehlung: ja,
   immer – das Kind ist auf der Reise.
8. **Reihenfolge der Karten:** Wiese, Wald, See, Dschungel, Berge, Nacht. In der
   Landschaftsliste steht heute Dschungel vor Berge und See; für die Reise zählt die
   Geschichte, nicht die Liste.
9. **Reise-Schild am Zug**, für die Gruppe sichtbar: ja oder nein.
10. **Fahrgast** in Etappe 2 oder erst in Etappe 3.
11. **Schiebelok:** ja, nein, oder nur mit Reisetempo „langsam".
12. **Zwei neue Landschaften** (Savanne, Weltraum) als Belohnungen – oder Belohnungen nur
    an der Lok, und Landschaften später.
