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
> Bücher frei). Dazu die **Aufnahmeseite für die Laute** (`laute-aufnehmen.html`,
> `docs/LAUTE-AUFNEHMEN.md`). Noch offen aus Etappe 1: die **Aufnahmen selbst** – bis sie da
> sind, spricht die Sprachausgabe die Selbst- und Zwielaute, die Mitlaute bleiben stumm und
> werden nur gezeigt. Prüfskripte: `scripts/validate-lesen.mjs`, `scripts/check-leseecke.mjs`.
>
> **Etappe 2, erster Teil (Oktober 2026):** sechs Spiele für Laute und Wörter –
> **Reimkupplung**, **Anlaut-Lauscher** (beide hinter der Trommel, «Hören»), **Wer fährt mit?**,
> **Wörter bauen**, **Silbenbahn** und **Blitzwörter** (hinter der Wortkiste). Stehen hinter
> einem Ding mehrere Spiele, öffnet es eine **Auswahl** mit Bildern. Bilder, die ein Kind hier
> anders nennt, sind ersetzt (🧊 statt 🍦 für «Eis», 🕐 statt ⏰ für «Uhr») oder beim
> Anlaut-Hören ausgeschlossen (⚽ «Fussball», 🐴 «Ross» …). Blitzwörter haben im Lesestand
> einen eigenen Stand je Wort.
>
> **Etappe 2, zweiter Teil (Oktober 2026):** Eltern haken im Elternbereich die
> **Buchstaben der Schule** ab – das Buchstabenhaus zeigt dann genau diese, und die Wortspiele
> nehmen Wörter, die sich damit lesen lassen. **Mein Name** (das Kind kuppelt seinen Namen
> aus Buchstaben-Wagen) und der **Name des Lesewurms** (das Kind legt ihn selbst; er steht
> auf einem Schild im Lesewagen und unter dem Wurm vor jeder Runde). **Lückensätze** mit
> Tunwörtern – im Bild schlafen, lesen, singen und hüpfen die Tiere. **Zehn weitere Bücher**
> (16 im Ganzen), das Regal hat jetzt ein Fach je Stufe.
>
> **Etappe 2 ist fertig (Oktober 2026)** mit dem **Buchstabengleis**: Der Buchstabe liegt als
> Gleis da, das Kind fährt die eigene Lok Strich für Strich in Schreibrichtung darüber.
>
> **Etappe 3, erster Teil:** **Satz kuppeln**, **Quatschsätze** und **Stolperwörter** (hinter
> dem Spielzeugzug) und **Quatschwörter** (hinter der Wortkiste).
>
> **Etappe 3, zweiter Teil:** **Laut-Position** (hinter der Trommel), **Buchstaben-Signal**
> (hinter dem Buchstabenhaus) und **Lies und tu!** (hinter dem Spielzeugzug). Wo «vorne» und
> «hinten» zählen – Satz kuppeln, Laut-Position –, schaut die Lok nach links: Dort fängt das
> Wort oder der Satz an.
>
> **Etappe 3, dritter Teil:** der **Geschichtenzug** (hinter dem Bücherregal: Seiten eines
> Buches in die Reihenfolge der Geschichte kuppeln), der **Lesewagen in 15 Schritten** (mit
> jedem gelesenen Stück wird er gemütlicher – von der Lampe bis zur Lichterkette; was neu ist,
> leuchtet) und der **Lesebericht** für die Eltern (Wörter, Bücher, sichere und wackelige
> Laute, Verwechslungen wie b und d).

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
  Buchstabenhaus, Trommel (Hören), Wortkiste (Wörter), Spielzeugzug (Sätze), Bücherregal
  (Bücher und Geschichtenzug), und links vom Sessel ein Schild mit dem Namen des Lesewurms.
  Alles andere im Zimmer ist **Einrichtung** und kommt erst mit dem Lesen (siehe unten).
  Stehen hinter einem Ding mehrere Spiele, kommt eine Auswahl mit Bildern; welches Spiel wo
  steht, sagt der Katalog in `lesen-stand.js` (`SPIELE`).
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
| Reimkupplung | `reimkupplung.html` | «Was reimt sich auf Maus?» – nur der Wagen, der sich reimt, kuppelt an; bei jedem Tipp sagt die Stimme beide Wörter | Reime hören |
| Anlaut-Lauscher | `anlautlauscher.html` | hört ein Wort, wählt das Bild, das gleich anfängt (nach dem Ohr: Stern und Schaf fangen gleich an) | Anlaute hören |
| Wer fährt mit? | `werfaehrtmit.html` | liest das Wort auf der Fahrkarte und lässt den richtigen Fahrgast einsteigen; die anderen sehen ähnlich aus | Wörter genau lesen |
| Wörter bauen | `woerterbauen.html` | legt aus Laut-Steinen das Wort zum Bild; die Stimme liest, was daliegt – auch «Sfoa» | Laute heraushören, Reihenfolge |
| Silbenbahn | `silbenbahn.html` | kuppelt Silben-Wagen zum Wort; nach jedem dritten ein Quatschtier («Bamate») | Silben lesen |
| Blitzwörter | `blitzwoerter.html` | ein kleines Wort blitzt im Zugfenster auf – welches war es? Je sicherer, desto kürzer | häufige Wörter auf einen Blick |
| Mein Name | `meinname.html` | kuppelt seinen Namen Buchstabe für Buchstabe an die Lok, in drei Fahrten immer selbständiger (Vorlage, Schild, zugedecktes Schild mit fremden Wagen); gibt dem Lesewurm einen Namen | die eigenen Buchstaben |
| Buchstabengleis | `buchstabengleis.html` | fährt die eigene Lok mit dem Finger über den Buchstaben – grüner Startpunkt mit Zahl, Pfeil, rotes Signal am Ende; die Lok folgt nur auf dem Gleis und nur vorwärts, Punkte werden angetippt, das Auge macht den Strich vor | Form und Schreibrichtung |
| Satz kuppeln | `satzkuppeln.html` | kuppelt die Wörter eines Satzes zum Bild an die Lok – vorne der grosse Anfang, hinten der Wagen mit Punkt und Schlusslicht | Satzbau, Gross am Anfang, Punkt |
| Quatschsätze | `quatschsaetze.html` | liest einen Satz auf einem Wagen: Kann das sein, fährt er weiter, Quatsch kommt aufs Abstellgleis | Sinn prüfen |
| Stolperwörter | `stolperwoerter.html` | ein Wort gehört nicht in den Satz («Der Hund bellt Tasse laut.») – tippt den Stolperstein vom Gleis | sinnentnehmend und flüssig lesen |
| Quatschwörter | `quatschwoerter.html` | ein Monster sagt seinen Namen («Lomu»), welches Schild stimmt: Lomu, Lumo, Loma? | genau lesen statt raten |
| Laut-Position | `lautposition.html` | hört ein Wort zum Bild («Lama») und den Laut dazu (M): Ist er vorne (Lok), in der Mitte (Wagen) oder hinten (Schlusswagen)? Auf «leicht» nur vorne oder hinten | Laute im Wort heraushören |
| Buchstaben-Signal | `buchstabensignal.html` | Wagen mit Buchstaben rollen vorbei; das Kind hält jeden an, der den Buchstaben vom Signal trägt (m), gross oder klein – nicht den Doppelgänger (n). Auf «leicht» rollen sie langsamer | Buchstaben unterscheiden, die sich ähnlich sehen |
| Lies und tu! | `liesundtu.html` | liest einen Auftrag und tut, was dasteht: «Setz den Fuchs auf den Tisch.» (Tier wählen, Stelle antippen) oder «Male zwei Ballone rot an.»; auf «schwer» mit gross und klein | Aufträge lesen und verstehen |
| Lückensätze | `lueckensaetze.html` | ein Wort fehlt im Satz – auf, unter, neben, ein Tunwort, das Tier, das Ding, die Zahl; die Stimme liest den Satz mit dem gewählten Wort | Sätze genau lesen |
| Geschichtenzug | `geschichtenzug.html` | vier Seiten aus einem Buch stehen als Wagen durcheinander – Bild und, wer liest, ein Satz; das Kind kuppelt sie so an die Lok, wie die Geschichte geht. Gelesene Bücher kommen zuerst; auf «leicht» drei Wagen nur mit Bildern, für Leser auf «schwer» nur Sätze | Handlungsfolge verstehen |

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
| Zum Zuhören | ab 3 | die Stimme liest alles; Fragen nur mit Bildern; die Antwort steht wörtlich auf der Seite | *Wo ist das Rüebli?* (frei), *Eule Ella hört zu*, *Pippa und der Regen*, *Bruno zählt Sterne*, *Fino und der rote Schal* |
| Erste Sätze | ab 5 | höchstens zwei Sätze je Seite, je höchstens sieben Wörter, nur Laute der Gruppen 1–4 | *Leo und die Melone* (frei), *Pino will auf die Insel*, *Mia und der Ball*, *Kater Tim malt*, *Fred, der Frosch* |
| Kleine Geschichten | ab 6 | kurze Seiten, Fragen dürfen zum Nachdenken sein | *Flitz und die vergessene Nuss*, *Pino baut einen Schneemann*, *Ein Geheimnis im Wald* |
| Geschichten | ab 7 | längere Sätze, wörtliche Rede | *Sepp und das Gewitter*, *Leo lernt brüllen*, *Die Reise zum Mond* |

Das Regal hat ein **Fach je Stufe** mit Reitern oben; offen ist zuerst das Fach zur
Lesestufe des Kindes. Ein Haken am Reiter heisst: alle Bücher darin gelesen. Die Bilder
zeichnet `lesen-bilder.js` – für das Regal und den Geschichtenzug gleich –, und was es nicht
als Emoji gibt, zeichnet es selbst (Fenster, Höhle, Pfütze, Staffelei, Seerose, Schneemann,
Fliege, ein grosses Blatt als Schirm).

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
- Der **Lesewagen** wird gemütlich: Am Anfang stehen nur die Dinge zum Spielen da. Nach 1, 2,
  4, 6, 9, 12, 15, 19, 23, 28, 33, 39, 45, 52 und 60 gelesenen Stücken (fertige Runden und
  Bücher, `wagenStufe`) kommt je ein Ding dazu: Lampe, Teppich, Kissen, Vorhänge, Blumen am
  Fenster, ein Bild, eine Stehlampe, ein Stapel Bücher, eine Uhr, eine Hängepflanze, eine
  Decke, eine Wimpelkette, ein Mobile mit Sternen, eine schlafende Katze und zuletzt eine
  Lichterkette (`lesen-art.js`, `AUSBAU`). Was seit dem letzten Besuch dazukam, leuchtet, und
  der Lautsprecher nennt es. Von aussen sieht man Vorhänge, Blumenkästen und die
  Lichterkette auch auf dem Startbild. Die Dinge sind keine Knöpfe – getippt wird durch sie
  hindurch.
- **Verwechslungen** merkt sich der Kasten paarweise (`verwechselt`, «b|d»: 3) – wenn im
  Buchstaben-Signal oder im Buchstabenhaus ein Buchstabe für einen anderen genommen wird.
  Höchstens 24 Paare, die häufigsten bleiben.
- Seinen **Namen** gibt ihm das Kind selbst (`meinname.html?wurm=1`, über das Schild links vom
  Sessel – immer frei, auch ohne Kauf): Es legt ihn aus Buchstaben, die Stimme liest jedes Mal
  vor, was dasteht, ein Würfel schlägt einen vor. Der Name liegt im Lesestand (`wurm`, die
  neuere Taufe gilt). Der **eigene Name** für «Mein Name» kommt aus dem Kinderkonto; tippt ihn
  ein Erwachsener ein, bleibt er nur auf dem Gerät – ein echter Name gehört nicht in den
  Spielstand.

### Alter und Einstellungen

Die Leseecke beginnt bei der Schwierigkeitsstufe des Kindes: «leicht» beim Hören, «mittel»
bei den Buchstaben, «schwer» bei den Sätzen. Im Elternbereich steht je Kind die Karte
**Leseecke** (`firebase.js`, `renderKindLesen`):

- **Wo beginnt die Leseecke?** Nach Alter, Hören, Buchstaben, Wörter, Sätze, Geschichten.
- **Schrift:** Automatisch (die Jüngsten sehen nur Grossbuchstaben), nur Grossbuchstaben,
  gross und klein.
- **Lesebericht** (`renderKindLesebericht`, gerechnet in `lesen-stand.js`, `bericht`):
  gelesene oder gehörte Wörter, Bücher (und wie viele mit allen Fragen richtig), Runden,
  wie weit der Lesewagen eingerichtet ist, Laute, die sitzen, Laute, die noch wackeln
  (geübt, mit Fehlern, sitzen noch nicht), oft Verwechseltes (ab zweimal) und die liebsten
  Spiele. Nur aus den Zählern im Kasten – kein Protokoll einzelner Antworten.
- **Buchstaben aus der Schule:** «Nach Reihenfolge» oder selbst abhaken (ein Knopf je Laut,
  gespeichert wird erst mit «Speichern»). Abgehakt wohnen genau diese Laute im
  Buchstabenhaus (mindestens vier), und Laute kuppeln, Wer fährt mit?, Wörter bauen und die
  Silbenbahn nehmen Wörter, die sich damit lesen lassen – sind es zu wenige für eine Runde,
  kommen die dazu, denen am wenigsten fehlt (`lesen-inhalte.js`, `lesbare`, `hausLaute`).

Die Einstellung liegt als eigener Kasten `lernapp.lesen.eltern` mit Zeitmarke im gameState –
die Regeln erlauben Eltern das schon (`isProgressReset`). Das Gerät des Kindes nimmt die
neuere Fassung und schreibt sie nie selbst. Wie die Stufe überlebt sie das Zurücksetzen.

### Gratis

Die Schranke (`entitlement.js`) kennt die einundzwanzig Spiele der Leseecke in einer eigenen Tabelle
`LESEECKE` – nicht in `AREAS`, die gleich bleiben muss wie im Zug – und gibt je Spiel eine
Runde frei. Den Lesewurm taufen ist kein Spiel und immer frei. Das Bücherregal hat keine Runden: *Wo ist das Rüebli?* und *Leo und die Melone*
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
| `lesen-inhalte.js` | Laute, Laut-Steine, Wörter für die Spiele, was sich mit den Buchstaben der Schule lesen lässt, Bausteine für die Sätze (Tiere, Dinge, Tunwörter), Sätze mit und ohne Sinn (`SINN_SAETZE`), Stolpersteine, wie jeder Buchstabe geschrieben wird (`GLEISE`) |
| `lesen-buecher.js` | die Bücher: Text, Bild, Fragen |
| `lesen-bilder.js` | die Bilder der Bücher und ihre Umschläge – für Regal und Geschichtenzug |
| `lesen-stand.js` | Lesestand, Lesewurm, Lesewagen (`wagenStufe`), Verwechslungen, der Bericht für die Eltern, Einstellungen der Eltern, was als Nächstes dran ist |
| `lesen-ton.js` | Laute (Aufnahme oder Sprachausgabe), Wörter und Sätze, mit Mitleuchten |
| `lesen-laute.js` | die Aufnahmen der Laute als Daten – heute noch leer |
| `laute-aufnehmen.html`, `laute-aufnehmen.js` | die Aufnahmeseite: aufnehmen, zuschneiden, `lesen-laute.js` erzeugen |
| `lesen-art.js` | Lesewagen, Zimmer mit Namensschild und Einrichtung (`AUSBAU`), Lesewurm, Trommel, Laut-Wagen, das Bild zu einem Satz (`buildSzene`) |
| `lesen-spiel.js` | was alle Spiele der Leseecke teilen: Bühne, «Los», Ergebnis mit Sternen |
| `train-leseecke.js` | das Zimmer als Ansicht der Bühne |
| `silbenzug.*`, `buchstabenhaus.*`, `lautekuppeln.*`, `stimmtdas.*`, `buecher.*` | die Spiele aus Etappe 1 |
| `reimkupplung.*`, `anlautlauscher.*`, `werfaehrtmit.*`, `woerterbauen.*`, `silbenbahn.*`, `blitzwoerter.*`, `meinname.*`, `lueckensaetze.*`, `buchstabengleis.*` | die Spiele aus Etappe 2 |
| `satzkuppeln.*`, `quatschsaetze.*`, `stolperwoerter.*`, `quatschwoerter.*`, `lautposition.*`, `buchstabensignal.*`, `liesundtu.*`, `geschichtenzug.*` | die Spiele aus Etappe 3 |
| `leseschrift.css` | Andika |
| `train-home.js`, `index.html` | Lesewagen auf dem Startbild, `?lesen=1` |
| `entitlement.js` | `LESEECKE`, `GRATIS_BUECHER`, `buchFree`, `targetFree` mit `buch=` |
| `firebase.js` | Karte «Leseecke» mit Lesebericht und den Buchstaben der Schule, `setLesenElternFor`, Zurücksetzen behält die Einstellung |
| `service-worker.js` | alle neuen Dateien im Vorrat |

## 5. Texte gegenlesen

Wörter, Sätze und Bücher sind Entwürfe nach den Regeln je Stufe – bitte gegenlesen:

- `lesen-inhalte.js`: `LAUTE` (Anlautwörter und Bilder), `SILBEN_WOERTER`,
  `KUPPEL_WOERTER`, `TIERE` und `DINGE`.
- `lesen-buecher.js`: die sechzehn Bücher, je mit Seiten und Fragen.
- `lueckensaetze.js` und `lesen-inhalte.js` (`TUN`): die Tunwörter der Lückensätze.
- `lesen-inhalte.js` (`SINN_SAETZE`, `STOLPERSTEINE`): Sätze mit Sinn und Quatsch, die Stolpersteine.

Schweizer Wörter, die Kinder hier sagen (Rüebli, Velo, fein), keine Bilder, die hier anders
heissen (ein Keks ist ein Guetzli), und nirgends das scharfe S. `validate-lesen.mjs` prüft
die Regeln, nicht den Ton – der ist Sache des Gegenlesens.

## 6. Die Laute aufnehmen

36 kurze Aufnahmen einer ruhigen, vertrauten Stimme. Die Seite `laute-aufnehmen.html` (für
Erwachsene, verlinkt im Adminbereich) nimmt mit dem Handy auf, schneidet die Stille weg,
gleicht die Lautstärke an und erzeugt daraus `lesen-laute.js`. Liste, Aussprache und der Weg
ins Repo stehen in `docs/LAUTE-AUFNEHMEN.md`. Bis die Datei da ist, gilt: Selbst- und
Zwielaute spricht die Sprachausgabe, Mitlaute bleiben stumm und werden gezeigt.

## 7. Die nächsten Etappen

- **Etappe 2 – Laute und Wörter:** fertig – Reimkupplung, Anlaut-Lauscher, Wer fährt mit?,
  Wörter bauen, Silbenbahn, Blitzwörter, die Buchstaben der Schule, Mein Name und der Name des
  Lesewurms, Lückensätze, Buchstabengleis und zehn weitere Bücher.
- **Etappe 3 – Sätze:** gebaut sind Satz kuppeln, Quatschsätze, Stolperwörter,
  Quatschwörter, Laut-Position, Buchstaben-Signal, Lies und tu!, der Geschichtenzug, der
  Lesewagen in 15 Schritten und der Lesebericht für die Eltern. Es folgen weitere Bücher.
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
