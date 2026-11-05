# Französischecke – Konzept

> **Kurz:** Ein vierter Lernwagen, der **Französischwagen** (Schild «Bonjour»), sehr ähnlich wie
> der Englischwagen: Wimmelbilder entdecken, «Écoute et trouve», Bildgeschichten, ein Wörterbuch
> mit Stickern und Aufnähern, eine Spielzeugkiste, Verse, Telefon und Post. Alles Französische
> spricht eine echte Stimme (Google Chirp 3 HD, fr-FR), und **überall** übersetzt der Knopf
> **DE** ins Deutsche, mit derselben Stimme wie die ganze App. Fast alles lässt sich vom
> Englischwagen übernehmen: der Ablauf, die Spiele, die Technik und **alle gemalten Bilder der
> Welten** (sie haben keinen Text). Neu sind die Sprache selbst (Wörter mit Artikel, Sätze,
> Verse, Geschichten), ein eigenes Maskottchen und ein eigener Wagen, eine neue Welt «Les
> fêtes» statt der amerikanischen Feiertage und die Boulangerie statt des Diners.

Stand: 5. November 2026. Zum Englischwagen: `docs/ENGLISCHECKE-KONZEPT.md`.

**Entschieden** (5. November 2026): die Stimme **Aoede** (fr-FR, Tempo 0,9), das Maskottchen
**Margot, la marmotte**, ein **gemeinsamer Kern** für beide Sprachwagen; die übrigen Vorschläge
gelten.

## Was gebaut ist

| | |
| --- | --- |
| **Kern** | `sprachwagen.js` baut beide Wagen aus einer Einstellung (`train-englischecke.js`, `train-franzoesischecke.js`); die Spiele (`englisch-spiele*.js`) und Zeichnungen (`englisch-art*.js`) fragen nach dem offenen Wagen (`LernappSprachwagen.aktiv`). Der Stand ist eine Fabrik (`LernappSprachStand.erzeuge`), jeder Wagen hat seinen Kasten (`lernapp.englisch`, `lernapp.franzoesisch`). |
| **Inhalt** | `franzoesisch-inhalt.js`: 12 Welten mit je 13 Wörtern (mit Artikel), 14 Geschichten, alle Sätze, 15 Spiele, Telefon und Echo, 5 Verse, 5 Bücher aus dem Lesewagen; das Feld `en` heisst im Kern «die Fremdsprache». In der Schrift kein Umbruch vor «?», die Artikel eingefärbt (`schrift`). |
| **Margot** | `franzoesisch-art.js`: Margot in denselben Massen wie Rocco (Kleider und Posen passen), der Panorama-Bistrowagen mit 15 Stücken Einrichtung; gemalt sind ihr Charakterbogen, ihr Sticker und alle 56 Geschichtenbilder (44 sind die Gemälde des Englischwagens mit Margot statt Rocco, `bilder/franzoesisch/`, `franzoesisch-gemalt.js`). Wimmelbilder, Sticker und Aufnäher teilen beide Wagen. |
| **Stimme** | 1204 französische Aufnahmen (`stimme/franzoesisch/`, `franzoesisch-stimme.js`, Bereich `franzoesisch` in `stimme-google.mjs`), die deutsche Seite mit der Stimme der App (`stimme-app/franzoesischecke.mjs`). |
| **Lernzug** | Der vierte Wagen ganz hinten, grün, Schild «Bonjour», mit Panoramadach. Würde die Lernlok über die höhere Lok des Gripszugs reichen, wird der Lernzug gerade so viel kleiner, dass er davor hält. Die Tür im Bistro führt in den Englischwagen. |
| **Eltern** | Eine Karte «Französischecke» wie die des Englischwagens: Schrift, Tempo, Bericht mit den Wörtern der Romandie, Aufträge für die Familie. |
| **Prüfungen** | `validate-franzoesisch.mjs`, `check-franzoesischecke.mjs`. |
| **Les fêtes** | Die zwölfte Welt (`franzoesisch-art-2.js`): Noël im Schnee, Galette und Carnaval auf dem Dorfplatz, Pâques auf der Wiese, der 1er Août am Abend – mit neun neuen Zeichnungen (Père Noël, bûche, étoile, galette, couronne, lapin, cloche, masque, lampion), gemalt samt Stickern und Aufnäher. Dazu die Geschichte *La galette des rois*: Margot findet die Fève und wird Königin. «Holidays» und die Halloween-Geschichte bleiben im Englischwagen. |
| **La boulangerie** | Statt «Rocco's diner» (`franzoesisch-art-3.js`): Hund, Katze, Bär, Pinguin und Affe bestellen «Je voudrais un croissant, s'il te plaît !»; vier neue Zeichnungen (croissant, baguette, pain au chocolat, chocolat chaud) samt Stickern. |
| **La poste** | Der gelbe Briefkasten im Bistro und fünf Postkarten von Lou, Margots Cousine mit der blauen Mütze: Genève, Paris, Mont-Blanc, Provence, Bretagne – mit Schweizer Briefmarke und «Bisous, Lou.». Die Post hat ihren eigenen Kasten (`lernapp.franzoesisch.post`). |
| **Neue Geschichten** | *Au marché* (Äpfel beim Bären, Käse bei der Kuh, Brot beim Hund) und *Le petit train* (durch den Tunnel, über die Brücke, zu Mamie Marmotte mit einer heissen Schokolade) – gezeichnet und gemalt. |

Damit ist alles aus Abschnitt 11 gebaut.

---

## 0. Zu entscheiden

| # | Frage | Vorschlag |
| --- | --- | --- |
| 1 | Die französische Stimme | nach den Hörproben (Abschnitt 9); **Tempo 0,9** wie beim Englischwagen |
| 2 | Das Maskottchen | **Margot, la marmotte** (Murmeltier); sonst Coco, le coq (Hahn) oder Hugo, le hérisson (Igel) – Abschnitt 4 |
| 3 | Der Wagen | ein **Panorama-Bistrowagen**: grosse Fenster, eine kleine Theke mit Croissants – Abschnitt 5 |
| 4 | Ein gemeinsamer Kern für beide Sprachwagen oder eine Kopie | **gemeinsamer Kern** (Abschnitt 7) |
| 5 | Artikel farbig (le blau, la rot, les grün) im Wörterbuch und in der Schrift | ja, dezent |
| 6 | Welten | die 12 Welten übernehmen; «Holidays» wird **«Les fêtes»** (Noël, Pâques, galette des rois, 1er Août, Carnaval) |
| 7 | Restaurant | **La boulangerie** statt «Rocco's diner» |
| 8 | Geschichten | 9 der 12 Geschichten mit dem neuen Maskottchen neu malen, 3 neue aus der Romandie und aus Frankreich |
| 9 | Schweizer Französisch | Hochfranzösisch wie in der Schule; im Elternbericht die Schweizer Wörter (septante, nonante, le natel, le souper) |
| 10 | Reihenfolge | drei Etappen (Abschnitt 11); zuerst der gemeinsame Kern und die Stimme |

---

## 1. Die Idee

Der Lernzug bekommt einen vierten Wagen. Wer hineingeht, trifft ein Maskottchen, das nur
Französisch spricht, ruhig und freundlich. Das Kind entdeckt Dinge in gemalten Bildern, hört
sie auf Französisch und kann jederzeit **DE** drücken: Dann sagt die App dasselbe auf Deutsch
und danach noch einmal auf Französisch. Lesen ist nicht nötig; wer lesen kann, schaltet die
Schrift dazu.

Wie im Englischwagen: hören, tippen, entdecken. Keine Grammatik, keine Noten, keine
Spracherkennung. Was das Kind gehört und erkannt hat, wird zu Stickern im Wörterbuch, und der
Wagen wächst am Lernzug.

**Warum Französisch?** In der Deutschschweiz lernen Kinder Französisch in der Primarschule: in
den Passepartout-Kantonen (BE, BL, BS, FR, SO, VS) meist ab der 3. Klasse, sonst meist ab der
5. Klasse. Die Französischecke ist ein spielerischer Vorlauf dafür: Wortfelder wie Tiere,
Farben, Zahlen, Familie, Körper, Kleider, Essen und Schule kommen dort auch vor.

---

## 2. Was übernommen wird

| Bereich | Aus dem Englischwagen | Für Französisch |
| --- | --- | --- |
| **Ablauf** | Zimmer, Ausguck (Welten), Entdecken, Hear and find, Bildgeschichten, Wörterbuch, Spielzeugkiste, Jukebox, Telefon, Briefkasten | gleich, mit eigenen Namen («Écoute et trouve», «Les histoires», «Mon dictionnaire») |
| **Knopf DE** | überall: Deutsch, dann noch einmal die Fremdsprache | gleich |
| **Fortschritt** | gehört → erkannt → sicher (zwei Tage), Aufnäher je Welt, Gold, der Wagen wächst am Lernzug | gleich, eigener Stand je Sprache |
| **Schrift** | Elterneinstellung «Wörter immer zeigen» | gleich, mit französischer Typografie («Où est le chat ?») |
| **Schranke** | je Spiel eine Runde frei, erste Welt und erste Geschichte frei | gleich, eigene Ids `fr-…` |
| **Eltern** | Karte im Elternbereich, Bericht, Aufträge für die Familie | gleich, mit Schweizer Wörtern und Tipps |
| **Gemalte Bilder** | 12 Wimmelbilder, Tippflächen, 159 Sticker, Farben, Zahlen, Aufnäher, Wörterbuch | **direkt übernommen**: Die Bilder haben keinen Text. Nur «Les fêtes» ist neu (Abschnitt 6) |
| **Spiele** | 15 Spiele, Telefon und Echo (Abschnitt 8) | fast alle gleich, ein paar mit französischem Vorbild («Jacques a dit») |
| **Deutsche Aufnahmen** | rund 1'000 deutsche Sätze (Sulafat) | **meist dieselben**: «Eine Kuh.», «Wo ist die Kuh?» – neu nur, wo der Satz anders ist |
| **Technik** | `stimme-google.mjs` (Bereich englisch), Vorlagen- und Abgleich-Werkzeuge für die Bilder, `validate-englisch`, `check-englischecke` | neuer Bereich `franzoesisch`, dieselben Werkzeuge, eigene Prüfungen nach demselben Muster |

---

## 3. Was neu gemacht wird

1. **Die Sprache.** Jedes Wort mit seinem Artikel (*la vache, le cochon, l'arbre*), dazu ein
   Satz und eine Frage, wie im Englischwagen (*C'est une vache. La vache dit meuh. Où est la
   vache ?*). Nicht wörtlich übersetzt, sondern so, wie man es einem Kind auf Französisch sagt
   (Abschnitt 6).
2. **Das Maskottchen** (Abschnitt 4): Rocco gehört zum amerikanischen Wagen. Das neue
   Maskottchen bekommt eine Zeichnung (wie `rocco()`), einen gemalten Charakterbogen und eine
   eigene Stimme.
3. **Der Wagen** (Abschnitt 5): ein eigenes Innenleben statt des Caboose.
4. **Die Geschichten** (Abschnitt 6): Auf den gemalten Geschichtenbildern ist Rocco. Sie werden
   mit dem neuen Maskottchen neu gemalt; die Abläufe dürfen gleich bleiben.
5. **«Les fêtes»** statt «Holidays»: Thanksgiving, Truthahn und Weihnachtsstrumpf passen nicht.
   Neu sind Noël, Pâques, die galette des rois, der 1er Août und der Carnaval.
6. **La boulangerie** statt des Diners: «Je voudrais un croissant, s'il te plaît.»
7. **Verse**: französische Kinderverse statt der englischen (Abschnitt 8).
8. **Die Stimme** (Abschnitt 9).
9. **Der vierte Wagen am Startbild**: Der Lernzug muss Platz für vier Wagen haben, auch quer auf
   dem Handy.

---

## 4. Das Maskottchen

| Vorschlag | Für | Gegen |
| --- | --- | --- |
| **Margot, la marmotte** (Murmeltier) | Schweizer Tier, aus den Alpen und dem Wallis; rund, freundlich, ganz anders als Rocco; pfeift wie ein Murmeltier | Kinder kennen es weniger gut als Hahn oder Igel |
| **Coco, le coq** (Hahn) | das Tier Frankreichs; «cocorico» ist lustig | ein Hahn hat keine Hände; Tippen, Werfen und Halten sind schwer zu zeichnen |
| **Hugo, le hérisson** (Igel) | jedes Kind kennt ihn; kuschelig | weniger eigen, Igel gibt es in vielen Kinderbüchern |

**Vorschlag: Margot, la marmotte.** Sie trägt eine kleine rote Mütze mit weissem Kreuz oder ein
Halstuch (wie Roccos Kondukteursmütze ein Erkennungszeichen) und hat einen Koffer voller
Croissants. Sie spricht nur Französisch und lobt viel: *Bravo ! Super ! C'est ça !*

Für Margot braucht es:

- eine Zeichnung (SVG) in mehreren Haltungen und Launen, wie `rocco(pose, laune)`: Sie
  erscheint im Wagen, in den Spielen, in der Lok und als Vorlage für die gemalten Bilder;
- einen gemalten Charakterbogen (Higgsfield, wie bei den Büchern), damit sie auf allen
  Geschichtenbildern gleich aussieht;
- eine Stimme (Abschnitt 9). Eine andere als Rocco, damit beide Wagen eigen klingen.

---

## 5. Der Wagen

Der Englischwagen ist ein amerikanischer Caboose. Der Französischwagen wird ein
**Panorama-Bistrowagen**: grosse Fenster, durch die man in die Welten schaut, und ein kleines
Bistro. Was es darin gibt, entspricht den Wegen im Englischwagen:

| Im Caboose | Im Panorama-Bistrowagen | führt zu |
| --- | --- | --- |
| Ausguck (Leiter, «LOOKOUT») | das grosse Panoramafenster | die Welten (Entdecken) |
| Bücherregal | das Bücherregal neben der Theke | die Geschichten und Bücher |
| Roccos Buch | «Mon dictionnaire» auf dem Tisch | das Wörterbuch |
| Spielzeugkiste | ein Weidenkorb | die Spiele |
| Jukebox | ein kleines Grammophon oder ein Akkordeon | die Verse |
| Telefon | ein rotes Telefon an der Wand | Telefon und Echo |
| Briefkasten | ein gelber Briefkasten | die Postkarten |
| Aufnäher-Wand | eine Tafel «Mes écussons» | die Aufnäher |
| Tür | die Tür | die anderen Wagen |
| Diner | **die Theke** mit Croissants | die Boulangerie |

Gezeichnet wird der Wagen wie der Caboose (SVG, `zimmer()`). Er wächst mit den Runden wie der
Englischwagen: 15 Stücke Einrichtung (Tischlampen, Blumen, eine Kaffeemaschine, Wimpel, eine
Laterne, ein Fahrplan …).

---

## 6. Inhalt

### 6.1 Wörter mit Artikel

Jedes Wort kommt immer mit seinem Artikel. So lernt das Kind das Geschlecht nebenbei, ohne
Regel. In der Schrift sind die Artikel dezent eingefärbt (Entscheid 5): *le* blau, *la* rot,
*les* grün, *l'* grau. Der Satz bleibt so kurz wie im Englischwagen:

| Feld | Englisch | Französisch | Deutsch (bleibt) |
| --- | --- | --- | --- |
| Wort | A cow. | Une vache. | Eine Kuh. |
| Satz | The cow says moo. | La vache dit meuh. | Die Kuh macht muh. |
| Frage | Where is the cow? | Où est la vache ? | Wo ist die Kuh? |

Vorschlag für die Wörter der 12 Welten. Die Bilder und Tippflächen sind schon da; was im
Französischen anders aufgeteilt ist, steht in der Bemerkung:

| Welt | Wörter |
| --- | --- |
| **La ferme** | le soleil, la grange, le tracteur, l'arbre, la pomme, la vache, le cochon, le mouton, la poule, le canard, le chien, le chat, la fleur |
| **La maison** | la porte, la fenêtre, le lit, la table, la chaise, le canapé, la lampe, l'horloge, la télé, maman, papa, le bébé, le nounours |
| **La cuisine** | le frigo, la banane, le pain, le lait, le fromage, l'œuf, le gâteau, les crêpes, le biscuit, le jus d'orange, la tasse, l'assiette, la cuillère |
| **Le parc** | le toboggan, la balançoire, le bac à sable, **la balle**, le cerf-volant, le vélo, le banc, l'oiseau, le papillon, l'écureuil, le garçon, la fille, la trottinette |
| **Le zoo** | le lion, l'éléphant, la girafe, le singe, le tigre, le zèbre, l'ours, le serpent, le pingouin, le crocodile, l'hippopotame, le perroquet, le kangourou |
| **La plage** | le coquillage, le crabe, le poisson, le bateau, la vague, le chapeau, la glace, le seau, le parasol, l'étoile de mer, le château de sable, la mouette, les lunettes de soleil |
| **La ville** | la voiture, le bus, le car scolaire, le train, le camion, l'avion, le camion de pompiers, le taxi, le feu, l'hélicoptère, la voiture de police, l'ambulance, la moto |
| **L'école** | le crayon, le crayon de couleur, le livre, le sac d'école, les ciseaux, la colle, la feuille, la maîtresse, le tableau, le pupitre, la règle, la gomme, le pinceau |
| **La fête** | la bougie, le cadeau, **le ballon**, le chapeau de fête, le petit gâteau, la pizza, la limonade, le pop-corn, la piñata, les confettis, la carte, le clown, la sucette |
| **Mon corps** | la tête, les yeux, les oreilles, le nez, la bouche, les cheveux, les dents, les bras, les mains, les doigts, le ventre, les jambes, les pieds |
| **Les habits et la météo** | l'imperméable, l'écharpe, les bottes, le t-shirt, le pantalon, les baskets, la robe, les chaussettes, les moufles, le pull, la pluie, le nuage, l'arc-en-ciel |
| **Les fêtes** (neu) | le sapin de Noël, le Père Noël, la bûche, le bonhomme de neige, l'étoile, la galette des rois, la couronne, le lapin de Pâques, l'œuf de Pâques, la cloche, le masque, le lampion, les feux d'artifice |

Bemerkungen:

- **Ball und Ballon**: Im Französischen heisst beides gern *le ballon*. Damit sich die Wörter
  nicht beissen, ist der Ball im Park *la balle* und der Ballon an der Party *le ballon*.
- **Sac d'école** statt *sac à dos*: so sagt man es in der Romandie für den Schulsack.
- **Le car scolaire**: das gelbe Bild bleibt; in der Schweiz wäre es eher *le car postal*.
- **Les fêtes** braucht ein neues Wimmelbild und neue Sticker, und für die neuen Dinge (Père
  Noël, bûche, galette, couronne, lapin, cloche, masque, lampion) neue Zeichnungen. Sapin,
  bonhomme de neige, œuf de Pâques und feux d'artifice gibt es schon.
- **Farben und Zahlen** bleiben: *rouge, bleu, jaune …*; *un, deux, trois …* bis *dix*. Die
  Farben kommen nach dem Nomen und passen sich an (*la pomme rouge, le ballon vert, la balle
  verte*). Das Kind hört es nur; geprüft wird es nicht.

### 6.2 Geschichten

Zwölf Bildgeschichten mit je vier Bildern, wie im Englischwagen. Neun Abläufe lassen sich
übernehmen (Margot statt Rocco), drei sind neu und französisch:

| Geschichte | |
| --- | --- |
| Margot et la balle rouge | übernommen (die Balle landet im Baum, der Hund hilft) |
| Où est le chat ? | übernommen |
| Margot a faim | übernommen, mit Croissant statt Banane |
| Le cerf-volant | übernommen |
| Bonjour, l'éléphant ! | übernommen |
| La grande vague | übernommen |
| Margot va à l'école | übernommen |
| Joyeux anniversaire ! | übernommen |
| Bonne nuit, Margot ! | übernommen |
| **La galette des rois** | neu: Wer die Fève findet, bekommt die Krone |
| **Au marché** | neu: Pommes, fromage, pain – «Combien ?» |
| **Le petit train** | neu: Margot fährt mit dem Zug zu Grossmutter, durch Tunnel und über Brücken |

Gemalt wird wie im Englischwagen: die Zeichnung als Vorlage, das erste Bild als Vorlage für die
nächsten drei, GPT Image 2.5 «tief» (0,25 Credits je Bild).

### 6.3 Sätze der Spiele und der Hilfe

Alles, was der Englischwagen sagt (Lob, Hilfe, Aufträge, Telefon, Postkarten), gibt es auf
Französisch: *Bravo ! Encore une fois ? Tape sur la vache. Écoute bien !* Das Kind wird
**geduzt**. Begrüssung und Abschied: *Bonjour ! Salut ! Au revoir ! À bientôt !*

---

## 7. Technik: ein Kern für beide Sprachwagen

**Option A – kopieren.** `train-englischecke.js`, `englisch-*.js` und die Prüfungen werden
kopiert und umbenannt. Das geht schnell, aber jede Verbesserung (wie das Vorladen der Gemälde)
muss man danach zweimal machen, und die Wagen laufen mit der Zeit auseinander.

**Option B – ein gemeinsamer Kern (Vorschlag).** Was nicht an der Sprache hängt, wird einmal
gebaut und für beide Wagen gebraucht:

| Teil | heute | danach |
| --- | --- | --- |
| Ablauf, Ansichten, Spiele | `train-englischecke.js`, `englisch-spiele*.js` | ein Kern `sprachwagen.js` und `sprachwagen-spiele*.js`, eingestellt je Sprache (Kürzel, Maskottchen, Wagen, Inhalt, Stand, Stimme, Bezeichnungen wie «Whole story») |
| Welten, Sticker, Gemälde | `englisch-art*.js`, `englisch-gemalt.js`, `bilder/englisch/` | bleiben, für beide; neu nur «Les fêtes» |
| Maskottchen und Wagen | `rocco()`, `zimmer()` | je Sprache: `rocco()` und der Caboose, `margot()` und der Bistrowagen |
| Inhalt | `englisch-inhalt.js` | dazu `franzoesisch-inhalt.js` mit derselben Form (`w(id, …)`, Geschichten, Verse, Sätze) |
| Stand | `englisch-stand.js` | ein Stand je Sprache (eigener Speicher und eigene Felder in der Cloud) |
| Stimme | `englisch-stimme.js`, `stimme/englisch/` | dazu `franzoesisch-stimme.js`, `stimme/franzoesisch/`; `kids.js` spricht `fr` (fehlt eine Aufnahme: Gerätestimme fr-FR) |
| Prüfungen | `validate-englisch`, `check-englischecke` | gemeinsame Helfer, je Sprache eine Prüfung |

Der Englischwagen bleibt dabei, wie er ist. Seine Prüfungen müssen nach dem Umbau grün sein,
bevor der erste französische Satz dazukommt. Was der Kern noch fest auf Englisch sagt
(«Whole story», «LOOKOUT», «My Patches»), kommt in den Inhalt der Sprache.

**Gemalte Bilder:** Die Wimmelbilder samt Tippflächen, die Sticker, die Aufnäher und das
Wörterbuch werden unverändert gebraucht. Kosten nur für Neues (Abschnitt 10).

---

## 8. Spiele und Verse

| Englischwagen | Französischwagen | |
| --- | --- | --- |
| Hear and find | **Écoute et trouve** | gleich |
| Memory | Memory | gleich |
| Yes or no? | **Oui ou non ?** | gleich |
| Rocco says | **Jacques a dit** | das französische Original von «Simon says» |
| Color train | **Le train des couleurs** | gleich |
| Count with Rocco | **Compte avec Margot** | gleich (1–10) |
| Feed Rocco | **Margot a faim** | gleich |
| What's missing? | **Qu'est-ce qui manque ?** | gleich |
| Dress up | **Habille Margot** | gleich |
| Story train | **Le train des histoires** | gleich |
| Rocco's diner | **La boulangerie** | neu: croissant, baguette, pain au chocolat, tarte, chocolat chaud – «Je voudrais …, s'il te plaît.» |
| Make a monster | **Le monstre** | gleich; die Farben passen sich an (*trois yeux verts*) |
| Where is the cat? | **Où est le chat ?** | gleich: *dans, sur, sous, derrière, à côté de* |
| Opposites | **Les contraires** | gleich: *grand/petit, chaud/froid, content/triste …* |
| Word memory | **Memory mots-images** | gleich, für Lesende |
| Call Rocco, Echo | **Allô, Margot ?**, **Écho** | gleich; Echo nimmt nur im Gerät auf |

**Verse** (Jukebox), gesprochen im Takt, nicht gesungen:

- «Bonjour, bonjour !» (selbst geschrieben, zur Begrüssung)
- «Un, deux, trois, nous irons au bois»
- «Une souris verte»
- «Tête, épaules, genoux, pieds» (wie «Head, shoulders, knees and toes»)
- «Dans la ferme de Mathurin» (die französische Fassung von «Old MacDonald»)

Die überlieferten Verse sind frei. **Bekannte Bücher**: Die fünf Bücher der Leseecke, die es
schon auf Englisch gibt, kommen auch auf Französisch (dieselben Bilder).

---

## 9. Die Stimme

Google Chirp 3 HD hat für **Französisch (Frankreich, fr-FR) dieselben 30 Stimmen** wie für
Deutsch und Englisch, auch *Sulafat* (die Stimme der App) und *Puck* (Rocco). Dazu gäbe es
Französisch aus Kanada (fr-CA); für Kinder in der Deutschschweiz passt das Französisch aus
Frankreich besser, es ist am nächsten an dem der Schule und der Romandie.

**Hörproben:** alle 30 Stimmen mit demselben Text, Tempo 0,9 (wie Rocco):

> Bonjour ! Bienvenue dans le wagon français. Regarde : une vache, un cochon, l'arbre et une
> pomme rouge. Où est le chat ? Le chat est sous la table. Un éléphant, les enfants, les
> oiseaux. Un, deux, trois, quatre, cinq. Jacques a dit : touche ton nez ! Bravo, c'est super !

Erzeugt mit `node scripts/stimme-google.mjs probe --sprache fr-FR --tempo 0.9` (8'130
Zeichen). Länger heisst langsamer:

| Frauenstimmen | Dauer | Männerstimmen | Dauer |
| --- | --- | --- | --- |
| Achernar | 30,7 s | Algenib | 28,7 s |
| **Sulafat** (wie die App auf Deutsch) | 29,7 s | **Puck** (wie Rocco) | 27,9 s |
| Aoede | 28,9 s | Sadachbia | 27,0 s |
| Despina | 28,6 s | Sadaltager | 27,0 s |
| Kore | 27,6 s | Umbriel | 27,0 s |
| Callirrhoe | 27,5 s | Alnilam | 26,7 s |
| Gacrux | 27,0 s | Achird | 25,6 s |
| Vindemiatrix | 26,6 s | Iapetus | 25,3 s |
| Laomedeia | 25,8 s | Charon | 25,2 s |
| Erinome | 24,8 s | Rasalgethi | 25,2 s |
| Pulcherrima | 24,3 s | Orus | 24,6 s |
| Zephyr | 23,4 s | Fenrir | 24,0 s |
| Autonoe | 21,6 s | Schedar | 24,0 s |
| Leda | 21,6 s | Algieba | 23,9 s |
| | | Enceladus | 23,4 s |
| | | Zubenelgenubi | 22,2 s |

**Vorschlag:** Eine Frauenstimme für Margot, damit der Französischwagen anders klingt als
Rocco. Gut für Anfänger sind die langsameren: *Achernar, Aoede, Despina* oder *Kore*. *Sulafat*
wäre vertraut, klingt aber womöglich zu sehr wie die deutsche Hilfe, sodass das Kind die beiden
Sprachen schlechter auseinanderhält. Entscheid 1, nach dem Anhören.

**Auf die Aussprache achten:** die Bindungen (*les‿enfants, un‿éléphant*), *l'* vor Vokal, *un
œuf* gegenüber *des œufs*, Wörter aus dem Englischen (*le t-shirt, les baskets, le pop-corn,
le clown*), Tiergeräusche (*meuh, ouaf, miaou, cocorico, coin-coin*). Was falsch klingt,
bekommt eine andere Schreibweise nur für die Anfrage (`AUSSPRACHE` im Skript).

**Umfang:** etwa so viele Aufnahmen wie im Englischwagen (rund 1'200, zusammen etwa 60'000
Zeichen), dazu wenige hundert neue deutsche Sätze. Das liegt weit im Gratis-Kontingent von
1 Million Zeichen im Monat; das Skript hört bei 900'000 auf.

---

## 10. Eltern, Schweiz, Kosten

- **Elternkarte «Französischecke»** wie beim Englischwagen: Wörter je Welt, Geschichten,
  Aufträge für die Familie (*Beim Znacht: «Je voudrais du pain, s'il te plaît.»*).
- **Schweizer Französisch im Bericht**: *septante, huitante, nonante* statt *soixante-dix,
  quatre-vingts, quatre-vingt-dix* (in der Romandie), *le natel* (Handy), *le souper*
  (Abendessen), *le déjeuner* (Frühstück), *le dîner* (Mittagessen). Im Wagen selbst bleibt
  Hochfranzösisch, die Zahlen gehen ohnehin nur bis zehn.
- **Kosten für Bilder** (Higgsfield, Guthaben heute 302 Credits):
  - Margots Charakterbogen: rund 0,5 Credits
  - 48 Geschichtenbilder: 12 Credits
  - das Wimmelbild «Les fêtes»: 0,25 Credits
  - Sticker für «Les fêtes» und die Boulangerie: rund 0,5 Credits
  - zusammen **etwa 13 bis 14 Credits**
- **Kosten für die Stimme:** im Gratis-Kontingent.

---

## 11. Die Etappen

Weil Ablauf, Spiele und Bilder schon da sind, genügen drei Etappen statt fünf:

1. **Etappe 0 – Kern und Entscheide:** der gemeinsame Kern (der Englischwagen unverändert und
   grün), die Stimme, Margot als Zeichnung und als gemalter Charakterbogen, der vierte Wagen am
   Startbild (auch quer auf dem Handy).
2. **Etappe 1 – «Bonjour !»:** der Panorama-Bistrowagen, die 11 übernommenen Welten mit allen
   Wörtern, «Écoute et trouve», das Wörterbuch mit Stickern und Aufnähern, die ersten vier
   Geschichten, der Knopf DE überall, die Schranke.
3. **Etappe 2 – Spielen:** die Spielzeugkiste mit allen Spielen, die Verse, Telefon und Echo,
   die Post, die restlichen acht Geschichten, «Les fêtes», die Boulangerie, die Bücher und der
   Elternbericht.

Jede Etappe endet wie bisher mit Prüfungen, PR und Merge; veröffentlicht wird von Hand.
