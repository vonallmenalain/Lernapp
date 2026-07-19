# UX-Review: Lernapp für Kinder von 4–8 Jahren

Stand: Juli 2026 · Analysierte Version: `main` (app.js, styles.css, firebase.js, spatial-puzzles.js, alle Spielseiten)

> **Umsetzungsstand (Juli 2026):** Die Phasen 1–3 wurden umgesetzt. Neu in der App:
> Sterne-System (1–3 Sterne pro Level, auf Kacheln & im Erfolgsdialog), grosser Feier-Moment
> (Konfetti, Melodie, Vibration, Maskottchen „Fino“, beschriftete Buttons), Vorlesen per
> Sprachausgabe (🔊, Auto-Vorlesen für 4–5-Jährige), „Weiterspielen“-Knopf, kürzere Runden
> (5/7/10 Aufgaben), visueller Aufgaben-Fortschritt, Hinweis-System (Ausgrauen/Blinken),
> Sticker-Sammelalbum „Mein Zoo“ (`album.html`) mit Überraschungstruhe, Tagesziel,
> Kinderprofil (Avatar + Alter), Welten statt Schwierigkeitsnamen (Wiese/Wald/Meer/Weltall),
> interaktive Tutorials, Exit-Schutz, Abenteuer-Modus (`abenteuer.html`) und zwei neue Spiele:
> **Zählzauber** (`zaehlen.html`) und **Buchstaben-Jagd** (`buchstaben.html`).
> Gemeinsame Logik liegt in `kids.js`. Der folgende Bericht bleibt als Begründung/Analyse erhalten.

## 1. Zusammenfassung

Die App ist technisch solide gebaut (PWA, offline-fähig, Fortschritt lokal + Cloud, 15 Spiele, saubere Level-Struktur). Das Kernproblem ist aber nicht die Technik, sondern die **fehlende emotionale Belohnungsschleife**: Kinder lösen ein Rätsel und bekommen als Belohnung den Text «Level geschafft.» und zwei graue Icon-Buttons. Es gibt nichts zu sammeln, niemanden, der sich mit ihnen freut, kein Ziel ausserhalb des einzelnen Levels und keine Überraschungen. Genau deshalb wechseln die Kinder nach wenigen Minuten in Apps, die diese Schleife perfektioniert haben.

Zweites Grundproblem: Die App ist **stark textbasiert**, die Hälfte der Zielgruppe (4–6 Jahre) kann aber noch nicht lesen. Regeln, Feedback, Levelnamen («A 2-3»), Schwierigkeitsstufen («Extrem») – alles Text, nichts wird vorgelesen.

Die wichtigsten fünf Hebel, geordnet nach Wirkung:

1. **Belohnungssystem** (Sterne + Sticker-Sammelalbum + Tagesziel) – grösster Hebel gegen «nur wenige Minuten spielen»
2. **Vorlesen per Sprachausgabe** (Web Speech API) – macht die App für 4–6-Jährige überhaupt erst selbständig nutzbar
3. **Feier-Moment beim Levelabschluss** massiv aufwerten (Konfetti, Jubel, Sterne, Maskottchen)
4. **Ein-Tipp-Einstieg**: «Weiterspielen»-Knopf statt Startseite → Spiel → Schwierigkeit → Level (3 abstrakte Auswahlschritte)
5. **Levelpfad statt Levelraster**: Weltkarte mit Stationen statt Kacheln mit Codes wie «S 2-4»

---

## 2. Ist-Analyse

### 2.1 Was schon gut ist

- 15 Spiele mit echter Lern-Substanz (Rechnen, Lesen, Logik, Raumvorstellung, Gedächtnis) – die inhaltliche Basis ist stark.
- Saubere Schwierigkeitsprogression mit Freischalt-Logik (`isLevelUnlocked`, app.js:2597).
- Fortschritt wird pro Gerät und optional pro Kind-Konto (Firebase) gespeichert; Eltern-Dashboard existiert.
- PWA mit Offline-Betrieb, grosse Spielbretter, Touch- und Drag-Interaktionen funktionieren.
- Dezentes Audio-Feedback mit Mute-Schalter, `prefers-reduced-motion` wird respektiert.
- Freundliche, fehlertolerante Formulierungen («Fast! Versuch es noch einmal.») – der Ton stimmt.

### 2.2 Die Kernprobleme (warum die Kinder abspringen)

**P1 – Kein Belohnungssystem, keine Meta-Progression.**
Der Erfolgs-Dialog zeigt immer nur «Geschafft! / Level geschafft.» (`updateSuccessContent`, app.js:3001–3010). Es gibt:
- keine Sterne (die Memory-Leveldaten enthalten sogar `threeStarMoves`/`twoStarMoves`/`oneStarFrom` – app.js:541 ff. – **diese Daten werden nirgends ausgewertet oder angezeigt, sie sind toter Code**),
- nichts zu sammeln, keine Abzeichen, keine Truhen, kein Tagesziel, keine Serie («Streak»),
- keine Anzeige der eigenen Leistung (fehlerfrei gelöst? wenige Züge?) – obwohl `currentSolveResult()` (app.js:2830) diese Daten bereits erhebt und in die Cloud schreibt.
Für 4–8-Jährige ist «das nächste identische Level» kein Ziel. Ohne Sammel-/Zielmechanik gibt es keinen Grund weiterzuspielen.

**P2 – Text-Barriere für Nichtleser.**
- Kein einziges Wort wird vorgelesen (keine `speechSynthesis`-Nutzung im ganzen Code).
- Feedback («Knapp daneben. Rechne noch einmal nach.»), Levelbeschreibungen, Statuszeile, Schwierigkeitswahl – alles nur Text.
- Ironie beim Wortdetektiv: ein Lese-Lernspiel, das dem Kind das gesuchte Wort nicht vorsprechen kann.

**P3 – Abstrakte, erwachsene Navigation.**
- Einstieg braucht 3 Entscheidungen: Spiel wählen (15 gleich aussehende weisse Karten) → Schwierigkeit wählen («Leicht/Mittel/Schwer/Extrem») → Level wählen («A 2-3», «geschafft», «6×6»).
- Levelnamen sind Codes (`levelName: "A 2-1"`, app.js:229) – für Kinder bedeutungslos.
- Kein «Weiterspielen»-Knopf: Jede Sitzung beginnt wieder bei der kompletten Auswahl.
- Icon-Buttons `⌂ ⇤ ↻` (memory.html:36–38) sind abstrakt; das Haus-Icon direkt neben dem Spielfeld führt zu versehentlichem Verlassen des Spiels.

**P4 – Der Feier-Moment ist zu schwach.**
- 6 kleine statische CSS-«Feuerwerk»-Punkte (styles.css:314 ff.), ein kurzer Sinuston bei Lautstärke 0.035, Text «Level geschafft.» Das ist der emotionale Höhepunkt des Spiels – und er fühlt sich an wie eine Systemmeldung.
- Erfolgs-Buttons sind `↻` und `→` – wieder abstrakt.

**P5 – Monotonie innerhalb der Übungsspiele.**
- Die 6 Übungsspiele (Zahlenzauber, Zahlenfolge, Figurenfolge, Was passt (nicht), Wortdetektiv) haben pro Schwierigkeit 10 Levels, die **alle identisch** sind: gleicher Generator, gleiche Einstellungen, immer «10 Aufgaben» (`makePracticeLevels`, app.js:2161–2168). Level 3 fühlt sich exakt wie Level 9 an.
- 10 Aufgaben pro Level ist für 4–6-Jährige zu lang (Aufmerksamkeitsspanne ~5 Min. gesamt).
- Fortschrittsanzeige ist Text («Aufgabe 3 von 10») statt etwas Visuellem, das sich füllt.

**P6 – Design spricht Erwachsene an.**
- Inter-Font, weisse Karten mit Blur, gedämpfte Farbtöne, Uppercase-«Eyebrow»-Labels (styles.css:64) – das ist Dashboard-Ästhetik, nicht Kinderwelt.
- Emoji als Illustration ist okay als Basis, aber es gibt keine Figur/kein Maskottchen, keine Welt, keine Geschichte.

**P7 – Keine Hilfe bei Frust.**
- Kein Hinweis-System in keinem Spiel. Bei Kakuro/Bimaru/Sudoku kann ein Kind komplett feststecken; einzige Optionen: raten oder abbrechen.
- Nach mehreren Fehlversuchen in Übungsspielen passiert nichts Adaptives (keine Reduktion der Antwortoptionen, kein visueller Tipp).
- Schwierigkeitswahl liegt beim Kind; 4-Jährige können nicht einschätzen, was «Mittel» bedeutet.

**P8 – Einstiegshürde pro Spiel.**
- Die `rules`-Arrays in `GAME_CONFIGS` (app.js:301 ff.) werden **nirgends angezeigt** (toter Inhalt). Neue Spiele erklären sich nur über einen Beschreibungssatz – für Nichtleser gar nicht.
- Kein interaktives Tutorial, keine Demo-Hand, kein geführtes erstes Level.

**P9 – Lücken im Lernangebot für die Jüngsten (4–5).**
- Zahlenzauber startet bei Gleichungen (`2 + 3 = ?`); reines Zählen/Mengen-Vergleichen fehlt.
- Kein Buchstaben-/Laut-Spiel vor der Wortebene (Wortdetektiv startet direkt mit ganzen Wörtern).

---

## 3. Konkrete Massnahmen

### Phase 1 – Quick Wins (je ca. 0.5–2 Tage, sofort spürbar)

**M1: Feier-Moment aufwerten.**
- Vollflächiges Konfetti (CSS-Partikel, 30–50 Stück, 1.5 s), Erfolgston zu einer fröhlichen aufsteigenden Melodie ausbauen, `navigator.vibrate([50,50,100])` auf Mobilgeräten.
- Grosse animierte Sterne im Erfolgs-Dialog (siehe M2).
- Wechselnde Lobtexte + grosses Emoji (🎉🏆🌟🦊), Buttons beschriften: «Nochmal» / «Weiter ➜».
- Einbauort: `showSuccess`/`updateSuccessContent` (app.js:2979 ff.), `.success-modal` (styles.css:259).

**M2: Sterne-System aktivieren (Daten existieren schon!).**
- 1–3 Sterne pro Level: Memory nach den vorhandenen `threeStarMoves`-Schwellen; Übungsspiele nach `flawlessCount` (10/10 fehlerfrei = 3★, ≥7 = 2★, sonst 1★); Logikrätsel nach Anzahl Resets/Undos.
- Sterne speichern (localStorage + `recordSolve`), im Erfolgs-Dialog nacheinander «einfliegen» lassen (mit Ton pro Stern) und auf den Level-Kacheln anzeigen (★★☆ statt «geschafft»).
- Effekt: sofortiges Wiederspiel-Motiv («Ich will den dritten Stern!»).

**M3: Vorlesen (Text-to-Speech).**
- `speechSynthesis` mit `lang: "de-DE"`: Aufgabentext, Feedback und Erfolgsmeldung vorlesen; Lautsprecher-Knopf 🔊 an jeder Aufgabe (z. B. liest beim Wortdetektiv das Zielwort vor).
- Auto-Vorlesen als Einstellung (Standard: an für Profile «4–5 Jahre», siehe M8).
- Kostenlos, offline-fähig, kein Backend nötig. Einbauort: neben `playTone` (app.js:2670) ein `speak(text)`-Helper; Aufruf in `answerPracticeTask` und den Task-Views.

**M4: «Weiterspielen»-Knopf.**
- Auf der Startseite ganz oben eine grosse Karte: «▶ Weiterspielen» → springt direkt ins nächste ungelöste Level des zuletzt gespielten Spiels (zuletzt gespieltes Spiel + Level in localStorage merken).
- Auf jeder Spielseite: Schwierigkeits-/Levelwahl überspringen, wenn es ein eindeutiges «nächstes Level» gibt («Weiter bei Level 7» als Primärknopf, Auswahl bleibt als Sekundärweg).

**M5: Kürzere Runden für Kleine.**
- `targetCount` staffeln: easy = 5, medium = 7, hard/extreme = 10 Aufgaben (app.js:2164).
- Fortschritt visuell statt textlich: z. B. ein Bild, das sich Stück für Stück aufdeckt, oder 5 Sterne-Slots, die sich füllen (`renderPracticeProgress`, app.js:3145).

**M6: Versehentliches Verlassen verhindern.**
- Home-/Zurück-Knopf während eines laufenden Levels mit Mini-Bestätigung («Wirklich aufhören? ✅/❌») oder in eine Ecke ausserhalb der Daumenzone verschieben.

### Phase 2 – Die Engagement-Schleife (der eigentliche Fix für «nicht packend»)

**M7: Sticker-Sammelalbum («Mein Zoo»).**
- Jedes gelöste Level gibt Sterne; alle X Sterne öffnet sich eine Überraschungs-Truhe mit einem zufälligen Sticker (Tiere passen perfekt zum bestehenden Tiergehege-/Meerestiere-Theme).
- Eigene Seite «Mein Album»/«Mein Zoo»: gesammelte Tiere anschauen, antippen → Tier macht Geräusch/Animation. Seltene Sticker (goldene Tiere) für 3★-Leistungen.
- Rein clientseitig machbar (Emoji/SVG + localStorage/Firestore). Das ist der wichtigste einzelne Baustein für «noch ein Level!».

**M8: Kinderprofile mit Avatar und Altersstufe.**
- Beim ersten Start: Avatar wählen (Tier-Emoji) + Alter (4–5 / 6–8). Steuert: Standardschwierigkeit, TTS an/aus, angezeigte Spiele (Kakuro/Sudoku-Extrem erst ab 6–8 sichtbar), Rundenlänge.
- Das bestehende Kind-Login (firebase.js) kann darauf aufbauen; für den Gastmodus reicht localStorage.

**M9: Tagesziel + sanfte Serie.**
- «Heute: 3 Rätsel lösen» mit drei grossen Kreisen im Kopfbereich; bei Erfüllung Extra-Truhe.
- Wochenansicht mit Sonnen/Sternen pro Tag. Keine Bestrafung bei Lücken (kein Streak-Verlust-Drama – das frustriert in dem Alter).

**M10: Maskottchen.**
- Eine Leitfigur (z. B. Fuchs «Fino» 🦊 – als SVG mit 4–5 Posen: neutral, jubelnd, nachdenklich, aufmunternd, schlafend).
- Erscheint bei Levelstart («Fino zeigt aufs Feld»), jubelt beim Erfolg, tröstet bei Fehlern, führt durch Tutorials (M12). Gibt der App Persönlichkeit und ersetzt viel Text durch Mimik.

**M11: Abenteuer-Modus (Mixed-Level-Pfad).**
- Neuer Modus auf der Startseite: eine Weltkarte mit Pfad (Wiese → Wald → Meer → Berge → Weltall). Jede Station = 1 kurze Aufgabe aus einem *anderen* Spiel (1× Zahlenzauber, 1× Memory 4 Paare, 1× Figurenfolge, …), Schwierigkeit adaptiv.
- Bekämpft die Monotonie direkt: Abwechslung ist für diese Altersgruppe wichtiger als Tiefe. Die Aufgaben-Generatoren existieren alle schon – es ist primär Orchestrierung + eine Karten-Ansicht.
- Die Themenwelten lösen zugleich M13 (Schwierigkeits-Benennung).

**M12: Interaktive Mini-Tutorials.**
- Erstes Level jedes Spiels: geführte Demo mit animierter Zeigehand 👆 («Tipp hier!»), erst dann freies Spielen. Die ungenutzten `rules`-Texte (app.js:301 ff.) entweder löschen oder als vorgelesene Ein-Satz-Tipps wiederverwenden.

**M13: Schwierigkeit als Welten statt Wörter.**
- «Leicht/Mittel/Schwer/Extrem» → «🌱 Wiese / 🌲 Wald / 🌊 Meer / 🚀 Weltall» mit farbigen, grossen Karten. «Extrem» klingt für Eltern gut, für ein 5-jähriges Kind bedeutungslos bis abschreckend.
- Levelnamen «A 2-3» → einfach grosse Nummern 1–10 auf einem geschwungenen Pfad mit Sternen darunter.

**M14: Hinweis-System.**
- Übungsspiele: Nach 2 Fehlversuchen eine falsche Option ausgrauen/wegschütteln; nach 3 die richtige pulsieren lassen (Kind gewinnt immer, lernt trotzdem).
- Logikrätsel: Glühbirnen-Knopf 💡 (3× pro Level): füllt ein korrektes Feld aus bzw. markiert den Bereich, in dem ein Fehler liegt. Kostet einen Stern → natürliche Balance.
- Adaptive Schwierigkeit: Löst ein Kind 2 Levels in Folge fehlerfrei mit 3★, nächsthöhere Stufe vorschlagen; scheitert es mehrfach, unauffällig leichtere Aufgaben generieren (die Generatoren sind bereits nach `difficulty` parametrisiert – app.js:1028 ff.).

### Phase 3 – Inhaltliche Erweiterungen

Neue Spiele, priorisiert nach Lücke im Angebot:

1. **Zählzauber (4–5)**: «Wie viele 🐞 siehst du?» / «Wo sind mehr Äpfel?» – Mengenverständnis vor Arithmetik. Kleinster Aufwand: gleicher Practice-Shell wie Zahlenzauber.
2. **Buchstaben-Jagd (4–6)**: «Womit beginnt 🍌?» → B/M/S. Mit TTS (M3) wird daraus echtes Phonics-Training. Vorstufe zum Wortdetektiv.
3. **Labyrinth (4–8)**: Weg durch ein Gitter-Labyrinth ziehen (Drag-Logik von Arukone/Hidoku wiederverwendbar). Räumliches Denken, sehr niederschwellig.
4. **Puzzle-Bild (4–6)**: 4/6/9-Teile-Bildpuzzle; als Belohnungsspiel geeignet (Sticker-Bilder puzzeln).
5. **Uhrzeit & Münzen (7–8)**: Alltagskompetenz, füllt das obere Ende.
6. **Hör-Memory**: Memory-Variante, bei der Karten Tiergeräusche abspielen (WebAudio vorhanden) – trainiert auditive Merkfähigkeit, fühlt sich magisch an.

### Design-Politur (parallel zu Phase 1–2)

- **Schrift**: Inter → runde Kinder-Schrift für Überschriften/Buttons (z. B. «Baloo 2» oder «Nunito», lokal gebundled wegen Offline-PWA); Fliesstext kann Inter bleiben.
- **Farben**: kräftigere, wärmere Palette; jede Spielkarte auf der Startseite bekommt eine eigene Hintergrundfarbe + grosses Emoji-Icon statt einheitlichem Weiss.
- **Startseite gruppieren**: «Zahlen 🔢», «Wörter 📖», «Denken 🧩», «Merken 🧠» als farbige Abschnitte – 15 gleichartige Karten überfordern die Auswahl (Paradox of Choice gilt für Kinder doppelt).
- **Touch-Ziele**: Antwortkarten/Buttons überall min. 64×64 px; Abstand zwischen Optionen vergrössern (Fehltipps kleiner Finger).
- **Bimaru-Langdruck** (480 ms, app.js:2544): Für kleine Kinder schwierig – alternativ Zyklus-Tippen (leer → Wasser → Schiff → leer) als Easy-Mode-Interaktion.

### Aufräumen (Code-Hygiene, bei der Gelegenheit)

- `threeStarMoves`/`twoStarMoves`/`oneStarFrom` (app.js:541–586): aktuell ungenutzt → durch M2 aktivieren.
- `rules`-Arrays in `GAME_CONFIGS`: aktuell nie gerendert → in M12-Tutorials wiederverwenden oder entfernen.
- app.js (4 945 Zeilen) bei wachsendem Funktionsumfang in Module splitten (levels/, games/, ui/), sonst wird jede der obigen Massnahmen teurer.

---

## 4. Empfohlene Reihenfolge

| Schritt | Massnahmen | Aufwand grob | Erwarteter Effekt |
|---|---|---|---|
| 1 | M1 Feier-Moment, M2 Sterne, M5 kürzere Runden | 2–4 Tage | Sofort spürbar mehr «Juhu» und Wiederspielen |
| 2 | M3 Vorlesen, M4 Weiterspielen, M6 Exit-Schutz | 2–3 Tage | 4–6-Jährige spielen selbständig, weniger Abbrüche |
| 3 | M7 Sticker-Album, M9 Tagesziel | 4–6 Tage | Der «noch ein Level»-Sog; längere Sitzungen |
| 4 | M10 Maskottchen, M13 Welten, Design-Politur | 4–6 Tage | Emotionale Bindung, Wiedererkennung |
| 5 | M11 Abenteuer-Modus, M12 Tutorials, M14 Hinweise | 1–2 Wochen | Abwechslung + weniger Frust = Retention |
| 6 | Phase-3-Spiele (Zählzauber & Buchstaben-Jagd zuerst) | je 2–4 Tage | Zielgruppe 4–5 wird richtig bedient |

**Messbar machen:** Das Firebase-Tracking erfasst bereits Sitzungen, Züge und Resets. Vor Schritt 1 die durchschnittliche Sitzungsdauer und Levels/Sitzung als Basiswert notieren und nach jedem Schritt vergleichen – so siehst du, welche Massnahme bei *deinen* Kindern wirkt.
