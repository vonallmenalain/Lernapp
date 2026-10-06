/*
 * lesen-detektive.js – Was die Lesedetektive lesen: Steckbriefe und Fälle.
 *
 * Nur Inhalt, wie lesen-buecher.js. Geladen von den Seiten an der Pinnwand
 * (steckbriefe.js, detektivfaelle.js, postkarten.js). Geprüft von scripts/validate-lesen.mjs.
 *
 * Steckbriefe: kurze Sachtexte über die Tiere der Reise – wo sie wohnen, was
 * sie fressen, wie gross sie sind, was besonders ist, und eine Zahl zum
 * Staunen. Die Fragen haben drei Antworten; die richtige steht im Steckbrief,
 * in der Zeile, auf die «zeile» zeigt («staunen» für die Zahl zum Staunen).
 * Die Angaben sind abgerundet und für Kinder gesagt – bitte gegenlesen.
 *
 * Postkarten: Ist eine Karte der Reise gefahren, schreibt der Fahrgast (unten).
 *
 * Fälle: ein kurzer Krimi in Sätzen. Drei Verdächtige, und genau ein Satz
 * beweist, wer es war (beweis, ab 0). Die anderen sind entlastet – durch
 * einen Satz im Fall oder weil es nicht zu ihnen passt (kein Fell, keine
 * Federn …). Die Figuren sind die aus den Büchern.
 *
 * Geschrieben in Schweizer Rechtschreibung: ss, nie das scharfe S.
 */
(() => {
  "use strict";

  const FELDER = { wohnt: "Wohnt", frisst: "Frisst", gross: "Grösse", besonders: "Besonders" };

  const STECKBRIEFE = [
    {
      id: "panda", tier: "panda", name: "Der Grosse Panda",
      wohnt: "in Bambuswäldern in den Bergen von China",
      frisst: "fast nur Bambus – bis zu 14 Stunden am Tag",
      gross: "so lang wie ein Mensch und über 100 Kilogramm schwer",
      besonders: "An den Vorderpfoten hat er einen Extra-Knochen. Damit hält er den Bambus wie mit einem Daumen.",
      staunen: "Ein Panda-Baby wiegt bei der Geburt nur etwa 100 Gramm – so viel wie eine Tafel Schokolade.",
      fragen: [
        { frage: "Was frisst der Panda fast nur?", antworten: ["Bambus", "Fisch", "Honig"], richtig: 0, zeile: "frisst" },
        { frage: "Wo wohnt der Panda?", antworten: ["in China", "in Afrika", "am Südpol"], richtig: 0, zeile: "wohnt" },
        { frage: "Wie schwer ist ein Panda-Baby bei der Geburt?", antworten: ["etwa 100 Gramm", "etwa 10 Kilogramm", "etwa 1 Kilogramm"], richtig: 0, zeile: "staunen" },
      ],
    },
    {
      id: "pinguin", tier: "penguin", name: "Der Kaiserpinguin",
      wohnt: "in der Antarktis, rund um den Südpol",
      frisst: "Fische, Krill und Tintenfische",
      gross: "bis zu 1,2 Meter gross und bis zu 40 Kilogramm schwer",
      besonders: "Der Vater wärmt das Ei zwei Monate lang auf seinen Füssen.",
      staunen: "Ein Kaiserpinguin kann über 500 Meter tief tauchen.",
      fragen: [
        { frage: "Wer wärmt das Ei?", antworten: ["der Vater", "die Mutter", "die Sonne"], richtig: 0, zeile: "besonders" },
        { frage: "Wo wohnt der Kaiserpinguin?", antworten: ["in der Antarktis", "im Regenwald", "in der Wüste"], richtig: 0, zeile: "wohnt" },
        { frage: "Wie tief kann er tauchen?", antworten: ["über 500 Meter", "5 Meter", "50 Zentimeter"], richtig: 0, zeile: "staunen" },
      ],
    },
    {
      id: "steinbock", tier: "ibex", name: "Der Alpensteinbock",
      wohnt: "hoch oben in den Alpen, an steilen Felsen",
      frisst: "Gras, Kräuter, Blätter und Moos",
      gross: "ein Bock wiegt bis zu 100 Kilogramm",
      besonders: "Seine Hufe sind innen weich und halten an den Felsen fast wie Saugnäpfe. Er ist das Wappentier von Graubünden.",
      staunen: "Die Hörner eines Steinbocks können fast einen Meter lang werden.",
      fragen: [
        { frage: "Wo wohnt der Steinbock?", antworten: ["in den Alpen", "am Meer", "in der Stadt"], richtig: 0, zeile: "wohnt" },
        { frage: "Wie lang können seine Hörner werden?", antworten: ["fast einen Meter", "zwei Zentimeter", "zehn Meter"], richtig: 0, zeile: "staunen" },
        { frage: "Von welchem Kanton ist er das Wappentier?", antworten: ["Graubünden", "Bern", "Zürich"], richtig: 0, zeile: "besonders" },
      ],
    },
    {
      id: "hase", tier: "rabbit", name: "Der Feldhase",
      wohnt: "auf Feldern und Wiesen",
      frisst: "Gras, Kräuter und im Winter auch Rinde",
      gross: "etwa 4 Kilogramm schwer",
      besonders: "Er gräbt keinen Bau. Er ruht in einer kleinen Mulde im Boden, der Sasse.",
      staunen: "Ein Feldhase rennt bis zu 70 Kilometer pro Stunde schnell – schneller, als ein Auto in der Stadt fahren darf.",
      fragen: [
        { frage: "Wo ruht der Feldhase?", antworten: ["in einer Mulde", "in einem Bau", "auf einem Baum"], richtig: 0, zeile: "besonders" },
        { frage: "Was frisst er im Winter auch?", antworten: ["Rinde", "Fisch", "Käse"], richtig: 0, zeile: "frisst" },
        { frage: "Wie schnell kann er rennen?", antworten: ["bis zu 70 Kilometer pro Stunde", "1 Kilometer pro Stunde", "500 Kilometer pro Stunde"], richtig: 0, zeile: "staunen" },
      ],
    },
    {
      id: "eichhoernchen", tier: "squirrel", name: "Das Eichhörnchen",
      wohnt: "in Wäldern, Parks und Gärten",
      frisst: "Nüsse, Samen aus Tannenzapfen und Beeren",
      gross: "etwa 300 Gramm schwer",
      besonders: "Im Herbst versteckt es Vorräte für den Winter. Es findet nicht alle wieder – daraus wachsen neue Bäume.",
      staunen: "Sein buschiger Schwanz ist fast so lang wie sein ganzer Körper.",
      fragen: [
        { frage: "Was macht das Eichhörnchen im Herbst?", antworten: ["Es versteckt Vorräte.", "Es baut ein Nest im Wasser.", "Es fliegt in den Süden."], richtig: 0, zeile: "besonders" },
        { frage: "Was wächst aus vergessenen Vorräten?", antworten: ["neue Bäume", "Pilze", "Blumen im Schnee"], richtig: 0, zeile: "besonders" },
        { frage: "Wie lang ist sein Schwanz?", antworten: ["fast so lang wie der Körper", "ganz kurz", "doppelt so lang wie ein Velo"], richtig: 0, zeile: "staunen" },
      ],
    },
    {
      id: "eule", tier: "owl", name: "Der Waldkauz, eine Eule",
      wohnt: "im Wald, in hohlen Bäumen",
      frisst: "Mäuse, kleine Vögel und Käfer",
      gross: "etwa 40 Zentimeter",
      besonders: "Er jagt in der Nacht und fliegt fast ohne ein Geräusch.",
      staunen: "Eine Eule kann ihren Kopf weit nach hinten drehen – drei Viertel einer ganzen Drehung.",
      fragen: [
        { frage: "Wann jagt der Waldkauz?", antworten: ["in der Nacht", "am Mittag", "nur im Sommer"], richtig: 0, zeile: "besonders" },
        { frage: "Was frisst er?", antworten: ["Mäuse und Käfer", "Bambus", "Gras"], richtig: 0, zeile: "frisst" },
        { frage: "Wie weit kann eine Eule den Kopf drehen?", antworten: ["drei Viertel einer Drehung", "gar nicht", "zehnmal im Kreis"], richtig: 0, zeile: "staunen" },
      ],
    },
    {
      id: "maus", tier: "mouse", name: "Die Hausmaus",
      wohnt: "auf Feldern, in Scheunen und manchmal in Häusern",
      frisst: "Körner, Samen und fast alles, was sie findet",
      gross: "etwa 20 Gramm – so schwer wie ein Brief",
      besonders: "Ihre Vorderzähne wachsen ein Leben lang nach. Darum muss sie viel nagen.",
      staunen: "Eine Maus passt durch ein Loch, das nur so dick ist wie ein Bleistift.",
      fragen: [
        { frage: "Wie schwer ist eine Hausmaus?", antworten: ["etwa 20 Gramm", "etwa 20 Kilogramm", "etwa 2 Kilogramm"], richtig: 0, zeile: "gross" },
        { frage: "Warum muss die Maus viel nagen?", antworten: ["Ihre Zähne wachsen nach.", "Sie hat keine Zähne.", "Sie mag kein Futter."], richtig: 0, zeile: "besonders" },
        { frage: "Durch was für ein Loch passt sie?", antworten: ["so dick wie ein Bleistift", "so gross wie eine Tür", "so gross wie ein Teller"], richtig: 0, zeile: "staunen" },
      ],
    },
    {
      id: "loewe", tier: "lion", name: "Der Löwe",
      wohnt: "vor allem in der Savanne in Afrika",
      frisst: "Zebras, Antilopen und Büffel",
      gross: "ein Männchen wiegt bis zu 200 Kilogramm",
      besonders: "Löwen leben in einer Familie, dem Rudel. Meistens jagen die Weibchen.",
      staunen: "Ein Löwe schläft und döst bis zu 20 Stunden am Tag.",
      fragen: [
        { frage: "Wie heisst die Familie der Löwen?", antworten: ["das Rudel", "die Herde", "der Schwarm"], richtig: 0, zeile: "besonders" },
        { frage: "Wer jagt meistens?", antworten: ["die Weibchen", "die Babys", "die Zebras"], richtig: 0, zeile: "besonders" },
        { frage: "Wie lange schläft ein Löwe am Tag?", antworten: ["bis zu 20 Stunden", "nie", "eine Minute"], richtig: 0, zeile: "staunen" },
      ],
    },
    {
      id: "fuchs", tier: "fox", name: "Der Rotfuchs",
      wohnt: "im Wald, auf Feldern und sogar in Städten",
      frisst: "Mäuse, Käfer, Würmer und Beeren",
      gross: "etwa 6 Kilogramm schwer",
      besonders: "Er hört eine Maus sogar unter dem Schnee. Dann springt er hoch und taucht mit der Nase voran hinein.",
      staunen: "Ein Fuchs kann bis zu 50 Kilometer pro Stunde schnell laufen.",
      fragen: [
        { frage: "Was hört der Fuchs unter dem Schnee?", antworten: ["eine Maus", "einen Fisch", "ein Auto"], richtig: 0, zeile: "besonders" },
        { frage: "Wo wohnt der Rotfuchs auch?", antworten: ["in Städten", "im Meer", "auf dem Mond"], richtig: 0, zeile: "wohnt" },
        { frage: "Wie schwer ist ein Fuchs?", antworten: ["etwa 6 Kilogramm", "etwa 60 Kilogramm", "etwa 6 Gramm"], richtig: 0, zeile: "gross" },
      ],
    },
    {
      id: "baer", tier: "bear", name: "Der Braunbär",
      wohnt: "in grossen Wäldern und in den Bergen",
      frisst: "Beeren, Wurzeln, Honig, Fische und kleine Tiere",
      gross: "ein Männchen wiegt bis zu 300 Kilogramm",
      besonders: "Im Winter hält er in seiner Höhle eine lange Winterruhe.",
      staunen: "Ein Bär kann Futter riechen, das mehrere Kilometer weit weg ist.",
      fragen: [
        { frage: "Was macht der Bär im Winter?", antworten: ["eine Winterruhe", "eine Reise ans Meer", "einen Schneemann"], richtig: 0, zeile: "besonders" },
        { frage: "Was frisst der Braunbär?", antworten: ["Beeren und Honig", "nur Bambus", "nur Gras"], richtig: 0, zeile: "frisst" },
        { frage: "Wie weit kann ein Bär Futter riechen?", antworten: ["mehrere Kilometer", "einen Zentimeter", "gar nicht"], richtig: 0, zeile: "staunen" },
      ],
    },
    {
      id: "katze", tier: "cat", name: "Die Hauskatze",
      wohnt: "bei Menschen, im Haus und im Garten",
      frisst: "Fleisch und Fisch – und Mäuse, wenn sie eine fängt",
      gross: "etwa 4 Kilogramm schwer",
      besonders: "Im Dunkeln sieht sie viel besser als wir.",
      staunen: "Eine Katze schläft etwa 15 Stunden am Tag.",
      fragen: [
        { frage: "Wann sieht die Katze besser als wir?", antworten: ["im Dunkeln", "unter Wasser", "nie"], richtig: 0, zeile: "besonders" },
        { frage: "Wie lange schläft eine Katze am Tag?", antworten: ["etwa 15 Stunden", "etwa 1 Stunde", "gar nicht"], richtig: 0, zeile: "staunen" },
        { frage: "Wie schwer ist eine Hauskatze?", antworten: ["etwa 4 Kilogramm", "etwa 40 Kilogramm", "etwa 4 Gramm"], richtig: 0, zeile: "gross" },
      ],
    },
    {
      id: "frosch", tier: "frog", name: "Der Grasfrosch",
      wohnt: "an Teichen, Bächen und auf feuchten Wiesen",
      frisst: "Insekten, Würmer und Schnecken",
      gross: "etwa 10 Zentimeter",
      besonders: "Er beginnt sein Leben als Kaulquappe im Wasser.",
      staunen: "Ein Frosch trinkt nicht mit dem Mund – er nimmt Wasser durch die Haut auf.",
      fragen: [
        { frage: "Wie beginnt der Frosch sein Leben?", antworten: ["als Kaulquappe", "als Raupe", "als Vogel"], richtig: 0, zeile: "besonders" },
        { frage: "Wie trinkt ein Frosch?", antworten: ["durch die Haut", "mit einem Strohhalm", "mit dem Mund"], richtig: 0, zeile: "staunen" },
        { frage: "Was frisst der Grasfrosch?", antworten: ["Insekten und Würmer", "Bambus", "Nüsse"], richtig: 0, zeile: "frisst" },
      ],
    },
  ];

  // ---------------------------------------------------------------------------
  // Detektivfälle
  // ---------------------------------------------------------------------------
  //   verdaechtige  [Tier aus train-art.js, Name]
  //   taeter        das Tier, das es war
  //   beweis        der Satz, der es beweist (ab 0)
  //   aufloesung    was die Stimme am Schluss sagt
  const FAELLE = [
    {
      id: "kuchen", titel: "Wer hat den Kuchen gegessen?",
      saetze: [
        "Oma Rosa hat einen Rüeblikuchen gebacken.",
        "Sie stellt ihn zum Abkühlen auf das Fenstersims.",
        "Als sie zurückkommt, ist der Kuchen weg!",
        "Hoppel war den ganzen Morgen mit Mia beim Velofahren.",
        "Bruno hat bis zum Mittag geschlafen – Pippa hat ihn schnarchen gehört.",
        "Auf dem Fenstersims liegt ein rotes Haar.",
      ],
      verdaechtige: [["rabbit", "Hoppel"], ["bear", "Bruno"], ["fox", "Fino"]],
      taeter: "fox", beweis: 5,
      aufloesung: "Fino war es! Nur er hat ein rotes Fell.",
    },
    {
      id: "blumen", titel: "Wer hat die Blumen zertrampelt?",
      saetze: [
        "Im Garten von Oma Rosa blühen die schönsten Tulpen.",
        "Heute Morgen sind viele davon zertrampelt.",
        "Ella hat den ganzen Tag geschlafen, wie alle Eulen.",
        "Pino war im Teich schwimmen.",
        "Im Beet sind Abdrücke von Hufen.",
      ],
      verdaechtige: [["owl", "Ella"], ["penguin", "Pino"], ["ibex", "Sepp"]],
      taeter: "ibex", beweis: 4,
      aufloesung: "Sepp war es! Nur der Steinbock hat Hufe. Er hat sich entschuldigt und neue Tulpen gepflanzt.",
    },
    {
      id: "honig", titel: "Wer hat den Honig genascht?",
      saetze: [
        "Im Vorratsschrank stand ein grosser Topf Honig.",
        "Jetzt ist er fast leer.",
        "Mia ist viel zu klein, um den schweren Deckel zu heben.",
        "Flitz war den ganzen Tag im Wald und hat Nüsse gesammelt.",
        "Neben dem Schrank sind riesige Pfotenabdrücke.",
      ],
      verdaechtige: [["mouse", "Mia"], ["squirrel", "Flitz"], ["bear", "Bruno"]],
      taeter: "bear", beweis: 4,
      aufloesung: "Bruno war es! Nur er hat so riesige Pfoten – und er liebt Honig.",
    },
    {
      id: "rueebli", titel: "Wer hat die Rüebli geholt?",
      saetze: [
        "Im Gemüsegarten wachsen lange, knackige Rüebli.",
        "Am Morgen fehlen drei Stück.",
        "Leo war die ganze Nacht bei Oma Rosa zu Besuch.",
        "Fred frisst keine Rüebli, nur Käfer und Würmer.",
        "Am Gartenzaun hängt ein Büschel graues Fell.",
      ],
      verdaechtige: [["lion", "Leo"], ["frog", "Fred"], ["rabbit", "Hoppel"]],
      taeter: "rabbit", beweis: 4,
      aufloesung: "Hoppel war es! Er hat ein graues Fell – und er liebt Rüebli.",
    },
    {
      id: "laerm", titel: "Wer hat in der Nacht Lärm gemacht?",
      saetze: [
        "Mitten in der Nacht poltert es auf dem Dach.",
        "Alle wachen auf und erschrecken.",
        "Pippa hat die ganze Nacht tief geschlafen.",
        "Kater Tim war im Haus, und die Tür war zu.",
        "Am Morgen liegt eine Feder vor der Tür.",
      ],
      verdaechtige: [["panda", "Pippa"], ["cat", "Tim"], ["owl", "Ella"]],
      taeter: "owl", beweis: 4,
      aufloesung: "Ella war es! Nur sie hat Federn. Sie ist in der Nacht auf dem Dach gelandet.",
    },
    {
      id: "fisch", titel: "Wer hat den Fisch geholt?",
      saetze: [
        "Fino hat am Teich einen Fisch gefangen und ins Gras gelegt.",
        "Dann ist er kurz weggegangen.",
        "Als er zurückkommt, ist der Fisch weg!",
        "Kater Tim war bei Mia und hat Karten gespielt.",
        "Bruno sucht im Wald nach Beeren.",
        "Auf dem nassen Weg sind Spuren von Füssen mit Schwimmhäuten.",
      ],
      verdaechtige: [["cat", "Tim"], ["bear", "Bruno"], ["penguin", "Pino"]],
      taeter: "penguin", beweis: 5,
      aufloesung: "Pino war es! Nur er hat Schwimmhäute an den Füssen. Er hatte grossen Hunger.",
    },
    {
      id: "buch", titel: "Wer hat das Bilderbuch nass gemacht?",
      saetze: [
        "Mia leiht Pippa ihr schönstes Bilderbuch.",
        "Am nächsten Tag sind die Seiten nass und gewellt.",
        "Pippa war den ganzen Tag im Bambuswald.",
        "Hoppel hat mit Oma Rosa Kuchen gebacken.",
        "Auf den Seiten sind kleine, grüne, nasse Fussabdrücke.",
      ],
      verdaechtige: [["panda", "Pippa"], ["rabbit", "Hoppel"], ["frog", "Fred"]],
      taeter: "frog", beweis: 4,
      aufloesung: "Fred war es! Er ist grün und kommt immer nass aus dem Teich. Er wollte nur die Bilder anschauen.",
    },
    {
      id: "glace", titel: "Wer hat die Glace gegessen?",
      saetze: [
        "In der Kühltruhe lag ein grosser Becher Vanilleglace.",
        "Jetzt ist der Becher leer.",
        "Kater Tim hat am Fenster in der Sonne gedöst.",
        "Leo hat mit seiner Familie im Schatten gelegen.",
        "Am Becher kleben schwarze und weisse Haare.",
      ],
      verdaechtige: [["cat", "Tim"], ["lion", "Leo"], ["panda", "Pippa"]],
      taeter: "panda", beweis: 4,
      aufloesung: "Pippa war es! Nur sie hat ein schwarzes und weisses Fell.",
    },
  ];

  // ---------------------------------------------------------------------------
  // Postkarten von der Reise
  // ---------------------------------------------------------------------------
  // Ist eine Karte der Reise ganz gefahren, ist der Fahrgast zu Hause – und
  // schreibt eine Postkarte (journey-plan.js, MAPS: karte ist die id der
  // Karte). Vorne das Bild: die Landschaft, das Wahrzeichen und das Tier.
  // Hinten ein paar Sätze und ein Gruss; dazu eine Frage, deren Antwort auf
  // der Karte steht. Auf der zweiten Runde schreiben dieselben Tiere noch
  // einmal. Die Namen sind die aus den Büchern.
  const POSTKARTEN = [
    { karte: "wiese", tier: "rabbit", von: "Hoppel", gruss: "Liebe Grüsse, dein Hoppel",
      text: ["Danke, dass du mich mitgenommen hast!", "Jetzt bin ich wieder zu Hause bei der Windmühle.", "Heute weht ein starker Wind, und die Flügel drehen sich ganz schnell."],
      frage: { frage: "Wo wohnt Hoppel?", antworten: ["bei der Windmühle", "im Leuchtturm", "in der Rakete"], richtig: 0 } },
    { karte: "wald", tier: "squirrel", von: "Flitz", gruss: "Liebe Grüsse, dein Flitz",
      text: ["Ich bin gut im Baumhaus angekommen.", "Unten am Bach habe ich drei Haselnüsse gefunden.", "Eine davon verstecke ich für dich!"],
      frage: { frage: "Was hat Flitz am Bach gefunden?", antworten: ["drei Haselnüsse", "einen Fisch", "einen Stein"], richtig: 0 } },
    { karte: "see", tier: "penguin", von: "Pino", gruss: "Liebe Grüsse, dein Pino",
      text: ["Vom Leuchtturm aus sehe ich die Fähre über den See fahren.", "Am Abend schalte ich das grosse Licht ein.", "Dann finden alle Schiffe sicher nach Hause."],
      frage: { frage: "Warum schaltet Pino das Licht ein?", antworten: ["damit die Schiffe nach Hause finden", "damit er lesen kann", "damit es warm wird"], richtig: 0 } },
    { karte: "dschungel", tier: "panda", von: "Pippa", gruss: "Liebe Grüsse, deine Pippa",
      text: ["Im Tempel ist es schön kühl.", "Draussen schaukeln die Affen an den Lianen und lachen laut.", "Zum Zmittag gibt es bei mir natürlich Bambus."],
      frage: { frage: "Was isst Pippa zum Zmittag?", antworten: ["Bambus", "Spaghetti", "Fisch"], richtig: 0 } },
    { karte: "berge", tier: "ibex", von: "Sepp", gruss: "Liebe Grüsse, dein Sepp",
      text: ["Die Zahnradbahn hat uns ganz nach oben gebracht.", "Jetzt sitze ich vor der Gipfelhütte und schaue ins Tal.", "Morgen klettere ich auf den höchsten Felsen."],
      frage: { frage: "Was macht Sepp morgen?", antworten: ["Er klettert auf den höchsten Felsen.", "Er fährt ans Meer.", "Er schläft den ganzen Tag."], richtig: 0 } },
    { karte: "nacht", tier: "owl", von: "Ella", gruss: "Liebe Grüsse, deine Ella",
      text: ["In der Sternwarte schaue ich durch das grosse Fernrohr.", "Heute Nacht habe ich eine Sternschnuppe gesehen.", "Ich habe mir etwas gewünscht – was, verrate ich nicht!"],
      frage: { frage: "Was hat Ella gesehen?", antworten: ["eine Sternschnuppe", "einen Regenbogen", "ein Flugzeug"], richtig: 0 } },
    { karte: "weltraum", tier: "mouse", von: "Mia", gruss: "Liebe Grüsse, deine Mia",
      text: ["Die Rakete steht wieder sicher auf dem Mond.", "Hier hüpfe ich ganz leicht und hoch.", "Die Erde sieht von hier aus wie eine blaue Murmel."],
      frage: { frage: "Wie sieht die Erde vom Mond aus?", antworten: ["wie eine blaue Murmel", "wie ein grüner Apfel", "wie ein kleiner Stern"], richtig: 0 } },
    { karte: "savanne", tier: "lion", von: "Leo", gruss: "Liebe Grüsse, dein Leo",
      text: ["Unter dem grossen Baobab ist es schön schattig.", "Die Elefanten sind heute zum Wasserloch gezogen.", "Ich habe so laut gebrüllt, dass mich alle gehört haben."],
      frage: { frage: "Wohin sind die Elefanten gezogen?", antworten: ["zum Wasserloch", "in die Stadt", "auf den Berg"], richtig: 0 } },
    { karte: "wald-2", tier: "squirrel", von: "Flitz", gruss: "Liebe Grüsse, dein Flitz",
      text: ["Du warst schon zum zweiten Mal bei mir im Wald!", "Weisst du noch, die Haselnuss, die ich für dich versteckt habe?", "Daraus ist ein kleiner Baum gewachsen."],
      frage: { frage: "Was ist aus der Haselnuss geworden?", antworten: ["ein kleiner Baum", "ein Kuchen", "ein Stein"], richtig: 0 } },
    { karte: "see-2", tier: "penguin", von: "Pino", gruss: "Liebe Grüsse, dein Pino",
      text: ["Heute ist der See ganz ruhig.", "Ich bin mit der Fähre ans andere Ufer gefahren.", "Dort habe ich eine Muschel gefunden – sie ist für dich!"],
      frage: { frage: "Was hat Pino gefunden?", antworten: ["eine Muschel", "eine Feder", "einen Schlüssel"], richtig: 0 } },
    { karte: "dschungel-2", tier: "panda", von: "Pippa", gruss: "Liebe Grüsse, deine Pippa",
      text: ["Ein kleiner Affe hat mir heute eine Banane geschenkt.", "Dafür habe ich ihm gezeigt, wie man an der Liane schaukelt.", "Jetzt schaukeln wir jeden Tag zusammen."],
      frage: { frage: "Was hat der Affe Pippa geschenkt?", antworten: ["eine Banane", "einen Bambus", "einen Ball"], richtig: 0 } },
    { karte: "berge-2", tier: "ibex", von: "Sepp", gruss: "Liebe Grüsse, dein Sepp",
      text: ["In den Bergen ist der erste Schnee gefallen.", "Vor der Gipfelhütte habe ich einen Schneemann gebaut.", "Er hat Hörner – genau wie ich!"],
      frage: { frage: "Was hat Sepp gebaut?", antworten: ["einen Schneemann", "ein Baumhaus", "eine Brücke"], richtig: 0 } },
    { karte: "nacht-2", tier: "owl", von: "Ella", gruss: "Liebe Grüsse, deine Ella",
      text: ["Heute ist Vollmond.", "Er ist so hell, dass ich ohne Laterne lesen kann.", "Ich lese gerade ein Buch über die Sterne."],
      frage: { frage: "Was liest Ella gerade?", antworten: ["ein Buch über die Sterne", "eine Zeitung", "ein Kochbuch"], richtig: 0 } },
  ];

  window.LernappLeseDetektive = { FELDER, STECKBRIEFE, FAELLE, POSTKARTEN };
})();
