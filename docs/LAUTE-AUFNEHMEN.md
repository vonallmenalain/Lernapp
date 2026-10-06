# Die Laute der Leseecke aufnehmen

Stand: Oktober 2026 · Seite: `laute-aufnehmen.html` · Ergebnis: `lesen-laute.js`

In der Leseecke klingt jeder Buchstabe nach seinem **Laut**: M ist «mmm», nicht «Em». Nur so
lassen sich Laute zu Wörtern zusammenziehen – «mmm» und «aaa» werden «Ma». Die Sprachausgabe
kann das nicht: Bei einem einzelnen Buchstaben sagt sie seinen Namen. Darum braucht es
Aufnahmen einer echten Stimme, am besten einer ruhigen, vertrauten.

Bis die Aufnahmen da sind, spricht die App die Selbst- und Zwielaute (a, e, i, o, u, ä, ö, ü,
ei, au, eu, ie) mit der Sprachausgabe; alle anderen Laute bleiben stumm und werden nur gezeigt.

## So geht es

1. **Seite öffnen:** `laute-aufnehmen.html` auf der veröffentlichten App
   (https://kids.alae.app/laute-aufnehmen.html) oder in der Netlify-Vorschau eines PR. Am
   besten auf dem Handy, hochkant. Die Seite ist für Erwachsene, kein Kind findet sie in der
   App; im Adminbereich steht oben ein Link.
2. **Mikrofon erlauben,** wenn der Browser fragt.
3. **Ruhiger Raum,** das Handy etwa eine Handbreit vor dem Mund. Alle Laute in einem Zug, mit
   derselben Stimme und in derselben Lautstärke.
4. Je Laut **Aufnehmen** tippen, warten, bis «Aufnahme läuft» dasteht, und den Laut **einmal**
   sprechen. Ein zweiter Tipp hält an; nach drei Sekunden hält die Aufnahme von selbst.
5. **Anhören.** Gefällt es nicht, einfach noch einmal aufnehmen. «✕» verwirft eine neue
   Aufnahme. Was aufgenommen ist, bleibt auf diesem Gerät liegen, auch über Nacht.
6. Zum Schluss **«Alle anhören»**: Klingen alle gleich laut, gleich nah, gleich ruhig?
7. **«lesen-laute.js erstellen»** – die Datei landet bei den Downloads. Auf dem Handy gibt es
   daneben «Teilen» (zum Beispiel per Mail an dich selbst).
8. **Die Datei in die App bringen** – einer der beiden Wege:
   - **An Claude schicken:** Die Datei im Chat anhängen; Claude legt sie ins Repo, prüft sie
     und macht den PR.
   - **Selbst auf GitHub:** Im Repo «Add file → Upload files», `lesen-laute.js` hineinziehen
     (sie ersetzt die leere Datei), «Create a new branch» wählen und den PR öffnen.
     `scripts/validate-lesen.mjs` prüft jede Aufnahme.

Die Seite lädt die Aufnahmen, die schon in der App sind («in der App»). Wer später nur
einzelne Laute neu aufnimmt, bekommt eine Datei mit allen – den alten und den neuen.

## Worauf es ankommt

- **Der Laut, nicht der Name:** «mmm», nicht «Em»; «sss», nicht «Es».
- **Kurze Laute ohne «e»:** b, d, g, k, p und t ganz kurz – «b», nicht «be». Das «e» würde
  später in jedem Wort mitklingen: «be-a» statt «ba».
- **Lange Laute dehnen:** m, n, l, s, f, w, sch eine gute halbe Sekunde, damit ein Kind sie
  beim Zusammenziehen hört.
- **Wie im Kindergarten:** So, wie Kinder hier Laute lernen. S als stimmloses Zischen, V wie
  F, Ch wie in «Buch».

## Die Liste

### Gruppe 1

| Laut | Wort | So klingt er |
| --- | --- | --- |
| M m | 🐭 Maus | «mmm» – Lippen zu und summen, gut eine halbe Sekunde |
| A a | 🐒 Affe | «a» wie in Affe – klar und kurz, ohne «h» davor |
| L l | 🦁 Löwe | «lll» – Zungenspitze oben an die Zähne, klingen lassen |
| I i | 🦔 Igel | «i» wie in Igel |
| O o | 👂 Ohr | «o» wie in Ohr |
| S s | ☀️ Sonne | «sss» – zischen wie eine Schlange |

### Gruppe 2

| Laut | Wort | So klingt er |
| --- | --- | --- |
| E e | 🦆 Ente | «e» wie in Ente |
| R r | 🌹 Rose | «rrr» – so, wie du das R sprichst, kurz rollen lassen |
| N n | 👃 Nase | «nnn» – Mund offen, durch die Nase summen |
| U u | ⏰ Uhr | «u» wie in Uhr |
| F f | 🐟 Fisch | «fff» – Luft zwischen Zähnen und Unterlippe |
| W w | 🐳 Wal | «www» – wie f, aber mit Stimme |

### Gruppe 3

| Laut | Wort | So klingt er |
| --- | --- | --- |
| H h | 🐰 Hase | «h» – nur ein Hauch, wie auf eine Brille hauchen |
| D d | 🦕 Dino | «d» – ganz kurz, kein «e» hinterher |
| T t | 🍅 Tomate | «t» – ganz kurz und hart, kein «e» hinterher |
| B b | ⚽ Ball | «b» – ganz kurz, kein «e» hinterher |
| K k | 🐱 Katze | «k» – ganz kurz, kein «e» hinterher |
| P p | 🐧 Pinguin | «p» – ganz kurz, ein kleiner Luftstoss |
| G g | 🦒 Giraffe | «g» – ganz kurz, kein «e» hinterher |

### Gruppe 4

| Laut | Wort | So klingt er |
| --- | --- | --- |
| Ei ei | 🍦 Eis | «ei» wie in Eis |
| Au au | 🚗 Auto | «au» wie in Auto |
| Sch sch | 🐑 Schaf | «schsch» – wie wenn du jemanden leise machst |
| Eu eu | 🦉 Eule | «eu» wie in Eule |
| Ie ie | 🐝 Biene | «ii» – ein langes i wie in Biene |
| Ch ch | 📖 Buch | «ch» wie in Buch – hinten im Hals |

### Gruppe 5

| Laut | Wort | So klingt er |
| --- | --- | --- |
| Z z | 🦓 Zebra | «ts» wie in Zebra – kurz |
| J j | 🧥 Jacke | «j» wie in Jacke – ein wenig dehnen |
| V v | 🐦 Vogel | «fff» wie in Vogel – V klingt hier wie F |
| St st | ⭐ Stern | «scht» wie in Stern |
| Sp sp | 🕷️ Spinne | «schp» wie in Spinne |
| Pf pf | 🐴 Pferd | «pf» wie in Pferd – kurz |

### Gruppe 6

| Laut | Wort | So klingt er |
| --- | --- | --- |
| Ä ä | 🧀 Käse | «ä» wie in Käse |
| Ö ö | 🥄 Löffel | «ö» wie in Löffel |
| Ü ü | 🚪 Tür | «ü» wie in Tür |
| Ck ck | 🧦 Socke | «k» wie in Socke – kurz |
| Ng ng | 🐍 Schlange | «ng» wie in Schlange – durch die Nase, kein g am Schluss |

Die Liste kommt aus `lesen-inhalte.js` (LAUTE), die Hinweise aus `laute-aufnehmen.js`
(HINWEISE); `validate-lesen.mjs` prüft, dass es zu jedem Laut einen Hinweis gibt.

## Was die Seite mit einer Aufnahme macht

1. Das Mikrofon nimmt bis zu drei Sekunden auf (ohne Echo-Unterdrückung und ohne automatische
   Lautstärke, mit Rauschunterdrückung).
2. Stille vorne und hinten wird weggeschnitten; 40 ms davor und 80 ms danach bleiben, damit
   ein «t» ausklingen kann. Länger als 1,2 Sekunden wird gekürzt.
3. Umgerechnet auf 16 kHz – mit einem Tiefpass davor, sonst klirrt ein «s».
4. Auf gleiche Lautstärke gebracht (Spitze bei 90 %), weich ein- und ausgeblendet, damit
   nichts knackt.
5. Als WAV, 16 Bit, mono, in eine Daten-Adresse verpackt. Die spielt jeder Browser ab, und sie
   steckt in einer gewöhnlichen JS-Datei – der Build braucht dafür keinen neuen Ordner.

Ein Laut hat so rund 10 bis 40 KB, alle zusammen rund ein halbes bis ein Megabyte. Die Seite
warnt, wenn eine Aufnahme sehr leise ist, übersteuert oder nichts zu hören war. Hochgeladen
wird nichts: Die Aufnahmen bleiben auf dem Gerät, bis die Datei erstellt ist.
