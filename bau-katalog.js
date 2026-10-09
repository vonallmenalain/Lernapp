/*
 * bau-katalog.js – Was es in der Bauecke gibt: Häuser, Zimmer, Farben, Tiere
 * und ihre Wünsche.
 * ---------------------------------------------------------------------------
 * Vier Häuser stehen nebeneinander an der Strasse: das Wohnhaus, das Spital,
 * das Dorf und das Büro. Jedes wächst Stockwerk um Stockwerk. Zu jeder
 * Zimmerart gehört ein kurzer Satz, der erklärt, was dort geschieht – im
 * Spital lernt ein Kind so ganz nebenbei, was eine Radiologie ist.
 *
 * Gewohnt wird nur im Wohnhaus, in den Wohnungen (wohnen: Schlafzimmer oder
 * Kinderzimmer, ein Zimmer je Stockwerk, bis zu drei Tiere). Alle anderen
 * Zimmer stehen zu zweit auf einem Stockwerk; in denen der anderen Häuser
 * arbeiten die Tiere (job: was man dort tut – auch der Traumjob eines Tiers).
 *
 * Jedes Tier hat fünf Wünsche:
 *   gelb   zwei für seine Wohnung – ein Bett, eine Lampe, eine Farbe
 *   grün   einen für das Wohnhaus – "Im Wohnhaus wünsche ich mir ein Bad"
 *   blau   zwei für die anderen Häuser – "Im Dorf wünsche ich mir einen
 *          Spielplatz"; so brauchen die vier Häuser einander
 * Wer welche Wünsche hat, rechnet bau-stand.js aus diesen Listen aus.
 *
 * Welche Dinge in welches Zimmer gehören, steht bei den Dingen selbst
 * (bau-moebel.js und bau-moebel-<gruppe>.js, RAUM_DINGE); dingeFuer() fügt
 * für die Wohnungen die Lieblingsdinge der Tierarten an.
 *
 * Nur Daten, keine Logik: Die Prüfung scripts/validate-bau.mjs liest diese
 * Datei ohne Browser und hält sie mit den Dingen stimmig – jeder Wunsch muss
 * sich in seinem Zimmer erfüllen lassen.
 */
(() => {
  "use strict";

  // ---------------------------------------------------------------------------
  // Farben
  // ---------------------------------------------------------------------------
  // Eine Palette für Wände, Böden, Fassaden und Möbel. familie fasst Töne
  // zusammen, damit "Ich mag Blau" auch mit Hellblau erfüllt ist; wort ist,
  // wie die Farbe im Satz heisst ("Malst du die Wand blau an?").
  const FARBEN = [
    { id: "weiss", name: "Weiss", hex: "#fbf8f2", familie: "weiss" },
    { id: "creme", name: "Creme", hex: "#f6ead2", familie: "weiss" },
    { id: "hellgelb", name: "Hellgelb", hex: "#fff1b8", familie: "gelb" },
    { id: "gelb", name: "Gelb", hex: "#ffd166", familie: "gelb" },
    { id: "pfirsich", name: "Pfirsich", hex: "#ffd3b5", familie: "orange" },
    { id: "orange", name: "Orange", hex: "#ff9f43", familie: "orange" },
    { id: "rot", name: "Rot", hex: "#ef5350", familie: "rot" },
    { id: "rosa", name: "Rosa", hex: "#ffc4d6", familie: "rosa" },
    { id: "pink", name: "Pink", hex: "#ff6fa5", familie: "rosa" },
    { id: "flieder", name: "Flieder", hex: "#e3d8ff", familie: "violett" },
    { id: "violett", name: "Violett", hex: "#a78bfa", familie: "violett" },
    { id: "hellblau", name: "Hellblau", hex: "#cfeaff", familie: "blau" },
    { id: "blau", name: "Blau", hex: "#4f8ef7", familie: "blau" },
    { id: "dunkelblau", name: "Dunkelblau", hex: "#34508f", familie: "blau" },
    { id: "tuerkis", name: "Türkis", hex: "#3cc8c8", familie: "tuerkis" },
    { id: "mint", name: "Mint", hex: "#c9f2e2", familie: "gruen" },
    { id: "hellgruen", name: "Hellgrün", hex: "#c5ec9a", familie: "gruen" },
    { id: "gruen", name: "Grün", hex: "#5cbf62", familie: "gruen" },
    { id: "dunkelgruen", name: "Dunkelgrün", hex: "#2f7d4f", familie: "gruen" },
    { id: "beige", name: "Beige", hex: "#e2c9a6", familie: "braun" },
    { id: "braun", name: "Braun", hex: "#a0704a", familie: "braun" },
    { id: "hellgrau", name: "Hellgrau", hex: "#e2e7ee", familie: "grau" },
    { id: "grau", name: "Grau", hex: "#9aa5b1", familie: "grau" },
    { id: "schwarz", name: "Schwarz", hex: "#3a4250", familie: "schwarz" },
  ];
  const FARBE = Object.fromEntries(FARBEN.map((farbe) => [farbe.id, farbe]));

  // Die Familien, die sich ein Tier wünschen kann, und wie sie im Satz heissen.
  const FAMILIEN = {
    gelb: { name: "Gelb", wort: "gelb", zeige: "gelb" },
    orange: { name: "Orange", wort: "orange", zeige: "orange" },
    rot: { name: "Rot", wort: "rot", zeige: "rot" },
    rosa: { name: "Rosa", wort: "rosa", zeige: "rosa" },
    violett: { name: "Violett", wort: "violett", zeige: "violett" },
    blau: { name: "Blau", wort: "blau", zeige: "blau" },
    tuerkis: { name: "Türkis", wort: "türkis", zeige: "tuerkis" },
    gruen: { name: "Grün", wort: "grün", zeige: "gruen" },
    braun: { name: "Braun", wort: "braun", zeige: "braun" },
  };

  // Muster für die Wand. Gezeichnet werden sie in bau-art.js, aus der
  // Wandfarbe abgeleitet – eine Farbe, ein Muster, und es passt.
  const MUSTER = [
    { id: "keine", name: "Ohne Muster" },
    { id: "streifen", name: "Streifen" },
    { id: "punkte", name: "Punkte" },
    { id: "karos", name: "Karos" },
    { id: "sterne", name: "Sterne" },
    { id: "herzen", name: "Herzen" },
    { id: "blumen", name: "Blumen" },
    { id: "wellen", name: "Wellen" },
    { id: "ziegel", name: "Backstein" },
    { id: "holz", name: "Holz" },
    { id: "kacheln", name: "Kacheln" },
  ];

  // Böden. farbe ist der Grundton; das Kind kann ihn aus der Palette ändern.
  const BOEDEN = [
    { id: "parkett", name: "Parkett", farbe: "#c88c5c" },
    { id: "dielen", name: "Holzdielen", farbe: "#d9a066" },
    { id: "plaettli", name: "Plättli", farbe: "#e2e7ee" },
    { id: "teppichboden", name: "Teppichboden", farbe: "#a78bfa" },
    { id: "stein", name: "Steinboden", farbe: "#b9b2a7" },
    { id: "linoleum", name: "Linoleum", farbe: "#6cc3d5" },
    { id: "rasen", name: "Rasen", farbe: "#5cbf62" },
  ];
  const BODEN = Object.fromEntries(BOEDEN.map((boden) => [boden.id, boden]));

  // ---------------------------------------------------------------------------
  // Die vier Häuser
  // ---------------------------------------------------------------------------
  // im: "im Wohnhaus" – für die Wünsche. dach: wie das Dach aussieht.
  const HAEUSER = [
    { id: "wohnhaus", name: "Wohnhaus", der: "das Wohnhaus", im: "im Wohnhaus", fassade: "pfirsich", dach: "rot", dachForm: "giebel",
      text: "Im Wohnhaus wohnen die Tiere: in Schlaf- und Kinderzimmern, dazu Küche, Bad und alles, was man zum Wohnen braucht." },
    { id: "spital", name: "Spital", der: "das Spital", im: "im Spital", fassade: "weiss", dach: "blau", dachForm: "heli",
      text: "Im Spital wird geholfen, wenn jemand krank ist oder sich verletzt hat. Jede Abteilung hat ihre eigene Aufgabe." },
    { id: "zentrum", name: "Dorf", der: "das Dorf", im: "im Dorf", fassade: "hellgelb", dach: "gruen", dachForm: "turm",
      text: "Im Dorf trifft man sich: zum Einkaufen, Lesen, Essen, Spielen und Schwimmen." },
    { id: "buero", name: "Büro", der: "das Büro", im: "im Büro", fassade: "hellblau", dach: "grau", dachForm: "flach",
      text: "Im Büro wird gearbeitet: an Schreibtischen, in Sitzungen und am Computer." },
  ];
  const HAUS = Object.fromEntries(HAEUSER.map((haus) => [haus.id, haus]));

  // ---------------------------------------------------------------------------
  // Die Zimmer
  // ---------------------------------------------------------------------------
  // der/ein:  mit Artikel, für die Sätze ("das Badezimmer", "ein Badezimmer")
  // text:     was hier geschieht – das liest die Stimme vor, wenn das Kind die
  //           Zimmerart antippt
  // wand/muster/boden: wie das Zimmer am Anfang aussieht
  // icon:     ein Ding, das für das Zimmer steht (Karten, Wünsche)
  // wuensche: nur in den Wohnungen – woraus die gelben Wünsche der Tiere
  //           gezogen werden (tags)
  // ausflug:  hierhin gehen die Tiere in der Freizeit besonders gern
  // doppel:   so hoch wie zwei Stockwerke (der KiddyDome) – es braucht ein
  //           freies Stockwerk gleich darüber (oder darunter)
  // kinder:   hierhin gehen die Tiere aus den Kinderzimmern sehr oft, ganz
  //           gleich, was sie sich wünschen (bau-stand.js, aufenthalt)
  // Was in der Schublade eines Zimmers liegt, steht bei den Möbeln
  // (bau-moebel-<gruppe>.js, RAUM_DINGE); was man hier arbeitet, in JOBS.
  const R = (id, haus, name, der, ein, text, opts) => ({ id, haus, name, der, ein, text, muster: "keine", boden: "parkett", ...opts });

  const RAEUME_LISTE = [
    // --- Wohnhaus -------------------------------------------------------------
    R("eingang", "wohnhaus", "Eingang", "der Eingang", "einen Eingang",
      "Beim Eingang kommt man ins Haus. Hier hängen die Jacken, und die Schuhe stehen im Regal.",
      { wand: "creme", boden: "plaettli", icon: "garderobe" }),
    R("wohnzimmer", "wohnhaus", "Wohnzimmer", "das Wohnzimmer", "ein Wohnzimmer",
      "Im Wohnzimmer sitzt die Familie zusammen: zum Spielen, Lesen und Plaudern.",
      { wand: "hellgelb", icon: "sofa" }),
    R("kueche", "wohnhaus", "Küche", "die Küche", "eine Küche",
      "In der Küche wird gekocht. Hier gibt es einen Kochherd, einen Kühlschrank und ein Spülbecken.",
      { wand: "mint", muster: "kacheln", boden: "plaettli", icon: "kochherd" }),
    R("esszimmer", "wohnhaus", "Esszimmer", "das Esszimmer", "ein Esszimmer",
      "Im Esszimmer essen alle zusammen am grossen Tisch.",
      { wand: "pfirsich", icon: "esstisch" }),
    R("schlafzimmer", "wohnhaus", "Schlafzimmer", "das Schlafzimmer", "ein Schlafzimmer",
      "Im Schlafzimmer schläft man. Hier stehen das Bett, der Nachttisch und der Kleiderschrank.",
      { wand: "flieder", icon: "bett",
        wuensche: ["bett", "nachttisch", "schrank", "lampe", "teppich", "vorhang", "bild", "spiegel", "uhr", "pflanze", "kissen"] }),
    R("kinderzimmer", "wohnhaus", "Kinderzimmer", "das Kinderzimmer", "ein Kinderzimmer",
      "Das Kinderzimmer gehört den Kindern: zum Spielen, Malen und Schlafen.",
      { wand: "hellblau", muster: "sterne", boden: "teppichboden", icon: "kinderbett",
        wuensche: ["bett", "spielzeug", "kuscheltier", "ball", "tisch", "stuhl", "lampe", "teppich", "bild", "regal", "malen"] }),
    R("bad", "wohnhaus", "Badezimmer", "das Badezimmer", "ein Badezimmer",
      "Im Badezimmer wäscht man sich, putzt die Zähne und badet.",
      { wand: "hellblau", muster: "kacheln", boden: "plaettli", icon: "wanne" }),
    R("waschzimmer", "wohnhaus", "Waschzimmer", "das Waschzimmer", "ein Waschzimmer",
      "Im Waschzimmer werden die Kleider gewaschen und getrocknet.",
      { wand: "hellgrau", boden: "stein", icon: "waschmaschine" }),
    R("bastelzimmer", "wohnhaus", "Bastelzimmer", "das Bastelzimmer", "ein Bastelzimmer",
      "Im Bastelzimmer wird gemalt, geklebt und gebaut.",
      { wand: "hellgelb", muster: "punkte", boden: "dielen", icon: "staffelei" }),
    R("terrasse", "wohnhaus", "Terrasse", "die Terrasse", "eine Terrasse",
      "Auf der Terrasse ist man draussen: mit Pflanzen, Liegestuhl und viel frischer Luft.",
      { wand: "hellblau", boden: "dielen", icon: "liegestuhl" }),
    R("keller", "wohnhaus", "Keller", "der Keller", "einen Keller",
      "Im Keller hat es Platz für Vorräte, Velos und alles, was man gerade nicht braucht.",
      { wand: "beige", muster: "ziegel", boden: "stein", icon: "velo" }),

    // --- Spital ---------------------------------------------------------------
    R("empfang", "spital", "Empfang", "der Empfang", "einen Empfang",
      "Am Empfang meldet man sich an. Hier erfährt man, wohin man gehen muss.",
      { wand: "hellblau", boden: "linoleum", icon: "empfangstheke" }),
    R("notfall", "spital", "Notfall", "der Notfall", "einen Notfall",
      "In den Notfall kommt, wer plötzlich krank ist oder sich verletzt hat. Hier wird sofort geholfen – Tag und Nacht.",
      { wand: "weiss", boden: "linoleum", icon: "spitalbett" }),
    R("paediatrie", "spital", "Kinderabteilung", "die Kinderabteilung", "eine Kinderabteilung",
      "Die Kinderabteilung heisst auch Pädiatrie. Hier arbeiten Kinderärztinnen und Kinderärzte – sie kennen sich mit Kindern besonders gut aus.",
      { wand: "hellgelb", muster: "sterne", boden: "linoleum", icon: "kuscheltier" }),
    R("radiologie", "spital", "Radiologie", "die Radiologie", "eine Radiologie",
      "In der Radiologie macht man Bilder vom Inneren des Körpers – zum Beispiel vom Knochen. So sieht man, ob etwas gebrochen ist.",
      { wand: "hellgrau", boden: "linoleum", icon: "roentgen" }),
    R("innere", "spital", "Innere Medizin", "die Innere Medizin", "eine Innere Medizin",
      "In der Inneren Medizin kümmert man sich um Herz, Lunge und Bauch. Man hört ab, misst den Blutdruck und findet heraus, was fehlt.",
      { wand: "mint", boden: "linoleum", icon: "herzmonitor" }),
    R("chirurgie", "spital", "Operationssaal", "der Operationssaal", "einen Operationssaal",
      "Im Operationssaal wird operiert. Alle tragen Masken und Handschuhe, damit alles ganz sauber bleibt. Wer operiert wird, schläft tief und spürt nichts.",
      { wand: "mint", muster: "kacheln", boden: "plaettli", icon: "operationstisch" }),
    R("geburt", "spital", "Geburtsabteilung", "die Geburtsabteilung", "eine Geburtsabteilung",
      "In der Geburtsabteilung kommen Babys auf die Welt. Hebammen helfen den Müttern und den Neugeborenen.",
      { wand: "rosa", boden: "linoleum", icon: "wiege" }),
    R("labor", "spital", "Labor", "das Labor", "ein Labor",
      "Im Labor untersucht man Blut und andere Proben – mit Maschinen und dem Mikroskop.",
      { wand: "weiss", boden: "linoleum", icon: "mikroskop" }),
    R("physio", "spital", "Physiotherapie", "die Physiotherapie", "eine Physiotherapie",
      "In der Physiotherapie übt man, sich wieder gut zu bewegen – zum Beispiel nach einem Beinbruch.",
      { wand: "hellgruen", boden: "dielen", icon: "barren" }),
    R("bettenstation", "spital", "Bettenstation", "die Bettenstation", "eine Bettenstation",
      "Auf der Bettenstation schlafen die Kranken, bis sie wieder gesund sind. Pflegefachleute schauen oft nach ihnen.",
      { wand: "creme", boden: "linoleum", icon: "spitalbett" }),
    R("apotheke", "spital", "Apotheke", "die Apotheke", "eine Apotheke",
      "In der Spitalapotheke liegen die Medikamente. Hier bekommt man, was die Ärztin oder der Arzt aufgeschrieben hat.",
      { wand: "mint", boden: "plaettli", icon: "medikamentenschrank" }),
    R("augen", "spital", "Augenabteilung", "die Augenabteilung", "eine Augenabteilung",
      "In der Augenabteilung untersucht man die Augen: Wie gut siehst du? Braucht jemand eine Brille?",
      { wand: "hellblau", boden: "linoleum", icon: "sehtest" }),
    R("intensiv", "spital", "Intensivstation", "die Intensivstation", "eine Intensivstation",
      "Wer sehr krank ist, wird auf der Intensivstation Tag und Nacht genau beobachtet – von Maschinen und von Menschen.",
      { wand: "hellgrau", boden: "linoleum", icon: "herzmonitor" }),
    R("spitalcafeteria", "spital", "Cafeteria", "die Cafeteria", "eine Cafeteria",
      "In der Cafeteria essen und trinken alle: der Besuch, die Kranken und die Leute, die im Spital arbeiten.",
      { wand: "pfirsich", boden: "plaettli", icon: "kaffeemaschine", ausflug: true }),

    // --- Dorf ----------------------------------------------------------------------
    R("eingangshalle", "zentrum", "Eingangshalle", "die Eingangshalle", "eine Eingangshalle",
      "In der Eingangshalle kommt man an. Hier gibt es Bänke, einen Plan und Platz für alle.",
      { wand: "creme", boden: "stein", icon: "bank" }),
    R("lebensmittel", "zentrum", "Lebensmittelladen", "der Lebensmittelladen", "einen Lebensmittelladen",
      "Im Lebensmittelladen kauft man Brot, Milch, Früchte und Gemüse.",
      { wand: "hellgruen", boden: "plaettli", icon: "obstkiste", ausflug: true }),
    R("baeckerei", "zentrum", "Bäckerei", "die Bäckerei", "eine Bäckerei",
      "In der Bäckerei duftet es nach frischem Brot, Gipfeli und Zopf.",
      { wand: "pfirsich", boden: "dielen", icon: "brotregal", ausflug: true }),
    R("spielwaren", "zentrum", "Spielwarenladen", "der Spielwarenladen", "einen Spielwarenladen",
      "Im Spielwarenladen gibt es Puppen, Bälle, Bauklötze und Spiele.",
      { wand: "hellblau", muster: "punkte", icon: "schaukelpferd", ausflug: true }),
    R("kleider", "zentrum", "Kleiderladen", "der Kleiderladen", "einen Kleiderladen",
      "Im Kleiderladen probiert man Hosen, Jacken und Schuhe an.",
      { wand: "rosa", icon: "kleiderstaender", ausflug: true }),
    R("blumen", "zentrum", "Blumenladen", "der Blumenladen", "einen Blumenladen",
      "Im Blumenladen gibt es Blumen und Pflanzen – für den Garten oder als Geschenk.",
      { wand: "mint", boden: "stein", icon: "blumeneimer", ausflug: true }),
    R("coiffeur", "zentrum", "Coiffeur", "der Coiffeur", "einen Coiffeur",
      "Beim Coiffeur werden die Haare gewaschen, geschnitten und frisiert.",
      { wand: "flieder", boden: "plaettli", icon: "coiffeurstuhl", ausflug: true }),
    R("bibliothek", "zentrum", "Bibliothek", "die Bibliothek", "eine Bibliothek",
      "In der Bibliothek kann man Bücher ausleihen und in Ruhe lesen. Danach bringt man sie zurück.",
      { wand: "creme", muster: "holz", icon: "buecherregal", ausflug: true }),
    R("restaurant", "zentrum", "Restaurant", "das Restaurant", "ein Restaurant",
      "Im Restaurant bestellt man etwas zu essen. In der Küche wird gekocht, und das Essen kommt an den Tisch.",
      { wand: "pfirsich", muster: "streifen", icon: "restauranttisch", ausflug: true }),
    R("cafe", "zentrum", "Café", "das Café", "ein Café",
      "Im Café gibt es Kuchen, Glace und etwas Feines zu trinken.",
      { wand: "rosa", muster: "streifen", boden: "dielen", icon: "kuchenvitrine", ausflug: true }),
    R("spielplatz", "zentrum", "Spielplatz", "der Spielplatz", "einen Spielplatz",
      "Auf dem Spielplatz wird gerutscht, geschaukelt, geklettert und im Sand gebuddelt.",
      { wand: "hellblau", boden: "rasen", icon: "rutsche", ausflug: true }),
    R("kiddydome", "zentrum", "KiddyDome", "der KiddyDome", "einen KiddyDome",
      "Der KiddyDome ist eine Spielhalle, so hoch wie zwei Stockwerke: mit Rutschbahnen, Klettertürmen, einem Sprungschloss, Trampolinen und Seilen zum Hangeln. Ein Mini-Lift fährt hinauf und hinunter.",
      { wand: "hellblau", muster: "punkte", boden: "linoleum", icon: "k_sprungschloss", ausflug: true, doppel: true, kinder: true }),
    R("hallenbad", "zentrum", "Hallenbad", "das Hallenbad", "ein Hallenbad",
      "Im Hallenbad kann man schwimmen, auch wenn es draussen kalt ist.",
      { wand: "hellblau", muster: "kacheln", boden: "plaettli", icon: "schwimmbecken", ausflug: true }),
    R("turnhalle", "zentrum", "Turnhalle", "die Turnhalle", "eine Turnhalle",
      "In der Turnhalle rennt, springt und klettert man. Hier gibt es Matten, Bälle und Sprossenwände.",
      { wand: "pfirsich", boden: "dielen", icon: "sprossenwand", ausflug: true }),
    R("kino", "zentrum", "Kino", "das Kino", "ein Kino",
      "Im Kino schaut man Filme auf einer riesigen Leinwand – mit Popcorn!",
      { wand: "dunkelblau", boden: "teppichboden", icon: "leinwand", ausflug: true }),
    R("schule", "zentrum", "Schulzimmer", "das Schulzimmer", "ein Schulzimmer",
      "Im Schulzimmer lernen die Kinder lesen, schreiben und rechnen.",
      { wand: "hellgelb", boden: "linoleum", icon: "wandtafel" }),
    R("kita", "zentrum", "Kita", "die Kita", "eine Kita",
      "In der Kita spielen kleine Kinder zusammen, während ihre Eltern arbeiten.",
      { wand: "rosa", muster: "herzen", boden: "teppichboden", icon: "spielkiste" }),
    R("post", "zentrum", "Post", "die Post", "eine Post",
      "Auf der Post gibt man Briefe und Pakete auf. Die Pöstlerin oder der Pöstler bringt sie dann nach Hause.",
      { wand: "hellgelb", boden: "plaettli", icon: "briefkasten", ausflug: true }),
    R("musik", "zentrum", "Musikzimmer", "das Musikzimmer", "ein Musikzimmer",
      "Im Musikzimmer wird gesungen und musiziert – mit Klavier, Trommel und Gitarre.",
      { wand: "flieder", muster: "wellen", icon: "klavier", ausflug: true }),
    R("toiletten", "zentrum", "Toiletten", "die Toiletten", "Toiletten",
      "Toiletten braucht jedes Haus, in dem viele Leute sind – mit einem Lavabo zum Händewaschen.",
      { wand: "hellblau", muster: "kacheln", boden: "plaettli", icon: "wc" }),
    R("velowerkstatt", "zentrum", "Velowerkstatt", "die Velowerkstatt", "eine Velowerkstatt",
      "In der Velowerkstatt werden Velos geflickt: Pneus pumpen, Ketten ölen, Bremsen einstellen.",
      { wand: "hellgrau", muster: "ziegel", boden: "stein", icon: "velo" }),

    // --- Büro ----------------------------------------------------------------------
    R("bueroempfang", "buero", "Empfang", "der Empfang", "einen Empfang",
      "Am Empfang begrüsst man die Gäste und zeigt ihnen den Weg.",
      { wand: "creme", boden: "stein", icon: "empfangstheke" }),
    R("grossraum", "buero", "Grossraumbüro", "das Grossraumbüro", "ein Grossraumbüro",
      "Im Grossraumbüro arbeiten viele zusammen an Schreibtischen und Computern.",
      { wand: "hellgrau", boden: "teppichboden", icon: "computer" }),
    R("einzelbuero", "buero", "Einzelbüro", "das Einzelbüro", "ein Einzelbüro",
      "Ein Büro für eine Person: Hier ist es ruhig zum Nachdenken und Telefonieren.",
      { wand: "mint", icon: "buerostuhl" }),
    R("sitzung", "buero", "Sitzungszimmer", "das Sitzungszimmer", "ein Sitzungszimmer",
      "Im Sitzungszimmer trifft man sich und bespricht, was zu tun ist.",
      { wand: "hellblau", boden: "teppichboden", icon: "sitzungstisch" }),
    R("drucker", "buero", "Druckerraum", "der Druckerraum", "einen Druckerraum",
      "Im Druckerraum stehen Drucker und Kopierer. Hier kommt das Papier heraus.",
      { wand: "hellgrau", boden: "linoleum", icon: "kopierer" }),
    R("buerowc", "buero", "WC", "das WC", "ein WC",
      "Auch im Büro braucht man ein WC – und ein Lavabo zum Händewaschen.",
      { wand: "hellblau", muster: "kacheln", boden: "plaettli", icon: "wc" }),
    R("cafeteria", "buero", "Cafeteria", "die Cafeteria", "eine Cafeteria",
      "In der Cafeteria macht man Pause – mit Kaffee, Tee und einem Znüni.",
      { wand: "pfirsich", boden: "plaettli", icon: "kaffeeautomat" }),
    R("archiv", "buero", "Archiv", "das Archiv", "ein Archiv",
      "Im Archiv werden wichtige Papiere in Ordnern und Kisten aufbewahrt.",
      { wand: "beige", boden: "linoleum", icon: "ordnerregal" }),
    R("computerraum", "buero", "Computerraum", "der Computerraum", "einen Computerraum",
      "Im Computerraum stehen grosse Computer, die Tag und Nacht arbeiten. Man nennt sie Server.",
      { wand: "dunkelblau", boden: "linoleum", icon: "serverschrank" }),
    R("atelier", "buero", "Atelier", "das Atelier", "ein Atelier",
      "Im Atelier wird gezeichnet, entworfen und gebastelt – zum Beispiel neue Spielsachen.",
      { wand: "weiss", boden: "dielen", icon: "staffelei" }),
    R("fitness", "buero", "Fitnessraum", "der Fitnessraum", "einen Fitnessraum",
      "Im Fitnessraum bewegen sich alle in der Pause – auf dem Laufband, mit Hanteln und auf der Matte.",
      { wand: "hellgruen", boden: "linoleum", icon: "laufband" }),
  ];
  const RAEUME = Object.fromEntries(RAEUME_LISTE.map((raum) => [raum.id, raum]));
  HAEUSER.forEach((haus) => { haus.raeume = RAEUME_LISTE.filter((raum) => raum.haus === haus.id).map((raum) => raum.id); });

  // Die Wohnungen: nur hier zieht jemand ein. Ein Stockwerk, ein Zimmer, bis
  // zu drei Tiere.
  const WOHNEN = ["schlafzimmer", "kinderzimmer"];
  WOHNEN.forEach((id) => { RAEUME[id].wohnen = true; });

  // Was man in einem Zimmer der anderen Häuser arbeitet – so steht es beim
  // Traumjob: "Traumjob: Brot backen in der Bäckerei". Höchstens drei Tiere
  // haben dieselbe Arbeit im selben Zimmer.
  const JOBS = {
    // Spital
    empfang: "die Kranken begrüssen", notfall: "Verletzte verarzten", paediatrie: "kranke Kinder pflegen",
    radiologie: "Röntgenbilder machen", innere: "Kranke untersuchen", chirurgie: "operieren",
    geburt: "Babys auf die Welt helfen", labor: "Blut untersuchen", physio: "Turnübungen zeigen",
    bettenstation: "Kranke pflegen", apotheke: "Medikamente verkaufen", augen: "Augen testen",
    intensiv: "Schwerkranke betreuen", spitalcafeteria: "Kaffee kochen",
    // Dorf
    eingangshalle: "Auskunft geben", lebensmittel: "Gemüse verkaufen", baeckerei: "Brot backen",
    spielwaren: "Spielsachen verkaufen", kleider: "Kleider verkaufen", blumen: "Blumensträusse binden",
    coiffeur: "Haare schneiden", bibliothek: "Bücher ausleihen", restaurant: "Essen kochen",
    cafe: "Kuchen servieren", spielplatz: "auf die Kinder aufpassen", kiddydome: "die Rutschbahnen prüfen", hallenbad: "auf die Schwimmer aufpassen",
    turnhalle: "Turnstunden geben", kino: "Filme zeigen", schule: "Kinder unterrichten", kita: "Kinder hüten",
    post: "Pakete verteilen", musik: "Musik unterrichten", toiletten: "die Toiletten putzen", velowerkstatt: "Velos flicken",
    // Büro
    bueroempfang: "Besuch empfangen", grossraum: "am Computer arbeiten", einzelbuero: "die Firma leiten",
    sitzung: "Sitzungen leiten", drucker: "Briefe drucken", buerowc: "das WC putzen", cafeteria: "Kaffee ausschenken",
    archiv: "Akten ordnen", computerraum: "Computer reparieren", atelier: "Plakate gestalten", fitness: "Fitnessstunden geben",
  };
  Object.entries(JOBS).forEach(([id, job]) => { if (RAEUME[id]) RAEUME[id].job = job; });

  // Die Lieblingsdinge der Tierarten (TIERE.mag.ding) und der Figuren aus den
  // Büchern (FIGUREN.mag.ding) gibt es in jeder Wohnung – wer einen Panda hat,
  // braucht Bambus, und Mia ihren Ball.
  const LIEBLINGS = ["beeren", "honig", "rueebli", "kratzbaum", "bambus", "aquarium", "buecherregal", "fisch", "melone", "kaese", "nuesse", "kletterfelsen", "hundekorb", "laubhaufen", "heuballen", "aepfel",
    "ball", "farbtoepfe", "schal", "fernrohr"];

  // Was in der Schublade eines Zimmers liegt: seine eigenen Dinge (aus den
  // Dateien bau-moebel-<gruppe>.js), in Wohnungen dazu die Lieblingsdinge.
  // Was es überall gibt (UEBERALL in bau-moebel.js), zeigt train-bau.js extra.
  function dingeFuer(raumId) {
    const moebel = window.LernappBauMoebel;
    const raum = RAEUME[raumId];
    if (!raum) return [];
    const eigene = moebel?.RAUM_DINGE?.[raumId] || [];
    const liste = [...eigene, ...(raum.wohnen ? LIEBLINGS : [])];
    return liste.filter((id, i) => moebel?.DINGE?.[id] && liste.indexOf(id) === i && !moebel.UEBERALL?.includes(id));
  }

  // ---------------------------------------------------------------------------
  // Wünsche für das eigene Zimmer (gelb)
  // ---------------------------------------------------------------------------
  // tag → wie der Wunsch heisst und welches Ding "Zeig mir" vorschlägt.
  const DING_WUENSCHE = {
    bett: { ein: "ein Bett", zeige: "bett" },
    schrank: { ein: "einen Schrank", zeige: "kleiderschrank" },
    nachttisch: { ein: "einen Nachttisch", zeige: "nachttisch" },
    lampe: { ein: "eine Lampe", zeige: "stehlampe" },
    teppich: { ein: "einen Teppich", zeige: "teppich" },
    bild: { ein: "ein Bild an der Wand", zeige: "bild" },
    pflanze: { ein: "eine Pflanze", zeige: "pflanze" },
    blumen: { ein: "Blumen", zeige: "blumenvase" },
    tisch: { ein: "einen Tisch", zeige: "tisch" },
    stuhl: { ein: "einen Stuhl", zeige: "stuhl" },
    sitz: { ein: "etwas zum Sitzen", zeige: "sessel" },
    sofa: { ein: "ein Sofa", zeige: "sofa" },
    kissen: { ein: "ein Kissen", zeige: "kissen" },
    fenster: { ein: "ein Fenster", zeige: "fenster" },
    vorhang: { ein: "einen Vorhang", zeige: "vorhangfenster" },
    spielzeug: { ein: "Spielsachen", zeige: "spielkiste" },
    kuscheltier: { ein: "ein Kuscheltier", zeige: "kuscheltier" },
    ball: { ein: "einen Ball", zeige: "ball" },
    buecher: { ein: "Bücher", zeige: "buecherregal" },
    lesen: { ein: "ein Lesekissen", zeige: "lesekissen" },
    uhr: { ein: "eine Uhr", zeige: "uhr" },
    spiegel: { ein: "einen Spiegel", zeige: "spiegel" },
    regal: { ein: "ein Regal", zeige: "regal" },
    fernseher: { ein: "einen Fernseher", zeige: "fernseher" },
    kamin: { ein: "ein Cheminée", zeige: "kamin" },
    garderobe: { ein: "eine Garderobe", zeige: "garderobe" },
    schuhe: { ein: "ein Schuhregal", zeige: "schuhregal" },
    malen: { ein: "Farben zum Malen", zeige: "farbtoepfe" },
    werkzeug: { ein: "Werkzeug", zeige: "werkzeugwand" },
    pinnwand: { ein: "eine Pinnwand", zeige: "pinnwand" },
    velo: { ein: "ein Velo", zeige: "velo" },
    pakete: { ein: "Pakete", zeige: "pakete" },
    liegestuhl: { ein: "einen Liegestuhl", zeige: "liegestuhl" },
    // Küche und Bad
    herd: { ein: "einen Kochherd", zeige: "kochherd" },
    kuehlschrank: { ein: "einen Kühlschrank", zeige: "kuehlschrank" },
    spuele: { ein: "ein Spülbecken", zeige: "spuele" },
    geschirr: { ein: "Geschirr", zeige: "geschirr" },
    kuechenschrank: { ein: "einen Küchenschrank", zeige: "kuechenschrank" },
    fruechte: { ein: "Früchte", zeige: "obstschale" },
    brot: { ein: "Brot", zeige: "brotkorb" },
    essen: { ein: "etwas zu essen", zeige: "teller" },
    kaffee: { ein: "eine Kaffeemaschine", zeige: "kaffeemaschine" },
    trinken: { ein: "Wasser zum Trinken", zeige: "wasserspender" },
    wanne: { ein: "eine Badewanne oder eine Dusche", zeige: "wanne" },
    dusche: { ein: "eine Dusche", zeige: "dusche" },
    wc: { ein: "ein WC", zeige: "wc" },
    lavabo: { ein: "ein Lavabo", zeige: "lavabo" },
    handtuch: { ein: "Tücher zum Abtrocknen", zeige: "handtuch" },
    zahnbuerste: { ein: "Zahnbürsten", zeige: "zahnputzbecher" },
    waschmaschine: { ein: "eine Waschmaschine", zeige: "waschmaschine" },
    tumbler: { ein: "einen Tumbler", zeige: "tumbler" },
    waesche: { ein: "einen Wäschekorb", zeige: "waeschekorb" },
    buegeln: { ein: "ein Bügelbrett", zeige: "buegelbrett" },
    // Spital
    spitalbett: { ein: "ein Spitalbett", zeige: "spitalbett" },
    monitor: { ein: "einen Herzmonitor", zeige: "herzmonitor" },
    infusion: { ein: "einen Infusionsständer", zeige: "infusion" },
    rollstuhl: { ein: "einen Rollstuhl", zeige: "rollstuhl" },
    erstehilfe: { ein: "einen Erste-Hilfe-Kasten", zeige: "erstehilfe" },
    arztkoffer: { ein: "einen Arztkoffer", zeige: "arztkoffer" },
    paravent: { ein: "einen Paravent", zeige: "paravent" },
    waage: { ein: "eine Waage", zeige: "waage" },
    liege: { ein: "eine Liege", zeige: "liege" },
    roentgen: { ein: "ein Röntgengerät", zeige: "roentgen" },
    roentgenbild: { ein: "ein Röntgenbild an der Wand", zeige: "roentgenbild" },
    ultraschall: { ein: "ein Ultraschallgerät", zeige: "ultraschall" },
    medikamente: { ein: "Medikamente", zeige: "medikamentenschrank" },
    operation: { ein: "einen Operationstisch", zeige: "operationstisch" },
    oplampe: { ein: "eine Operationslampe", zeige: "oplampe" },
    babybett: { ein: "ein Babybettchen", zeige: "wiege" },
    mikroskop: { ein: "ein Mikroskop", zeige: "mikroskop" },
    labor: { ein: "Reagenzgläser", zeige: "reagenzglaeser" },
    physio: { ein: "einen Gehbarren", zeige: "barren" },
    sehtest: { ein: "eine Sehtest-Tafel", zeige: "sehtest" },
    empfang: { ein: "eine Empfangstheke", zeige: "empfangstheke" },
    computer: { ein: "einen Computer", zeige: "computer" },
    telefon: { ein: "ein Telefon", zeige: "telefon" },
    zeitung: { ein: "Zeitungen", zeige: "zeitungsstaender" },
    // Läden, Restaurant, Freizeit
    theke: { ein: "eine Theke", zeige: "ladentheke" },
    kasse: { ein: "eine Kasse", zeige: "kasse" },
    waren: { ein: "ein Warenregal", zeige: "warenregal" },
    gemuese: { ein: "Gemüse", zeige: "gemuesekiste" },
    einkaufswagen: { ein: "einen Einkaufswagen", zeige: "einkaufswagen" },
    kuchen: { ein: "Kuchen", zeige: "kuchenvitrine" },
    glace: { ein: "Glace", zeige: "glacetheke" },
    kleider: { ein: "Kleider", zeige: "kleiderstaender" },
    coiffeur: { ein: "einen Coiffeurstuhl", zeige: "coiffeurstuhl" },
    restaurant: { ein: "einen Restauranttisch", zeige: "restauranttisch" },
    ofen: { ein: "einen Pizzaofen", zeige: "pizzaofen" },
    menue: { ein: "eine Menütafel", zeige: "menuetafel" },
    post: { ein: "einen Briefkasten", zeige: "briefkasten" },
    globus: { ein: "einen Globus", zeige: "globus" },
    karte: { ein: "eine Weltkarte", zeige: "weltkarte" },
    tafel: { ein: "eine Wandtafel", zeige: "wandtafel" },
    pult: { ein: "ein Schulpult", zeige: "schulpult" },
    rutsche: { ein: "eine Rutschbahn", zeige: "rutsche" },
    schaukel: { ein: "eine Schaukel", zeige: "schaukel" },
    sand: { ein: "einen Sandkasten", zeige: "sandkasten" },
    klettern: { ein: "einen Kletterfelsen", zeige: "kletterfelsen" },
    trampolin: { ein: "ein Trampolin", zeige: "trampolin" },
    becken: { ein: "ein Schwimmbecken", zeige: "schwimmbecken" },
    sprungbrett: { ein: "ein Sprungbrett", zeige: "sprungbrett" },
    rettungsring: { ein: "einen Rettungsring", zeige: "rettungsring" },
    matte: { ein: "eine Turnmatte", zeige: "turnmatte" },
    basketball: { ein: "einen Basketballkorb", zeige: "basketballkorb" },
    fitness: { ein: "ein Fitnessgerät", zeige: "laufband" },
    kino: { ein: "eine Kinoleinwand", zeige: "leinwand" },
    kinosessel: { ein: "Kinosessel", zeige: "kinosessel" },
    popcorn: { ein: "Popcorn", zeige: "popcorn" },
    klavier: { ein: "ein Klavier", zeige: "klavier" },
    trommel: { ein: "eine Trommel", zeige: "trommel" },
    gitarre: { ein: "eine Gitarre", zeige: "gitarre" },
    musik: { ein: "Musik", zeige: "radio" },
    spiel: { ein: "einen Töggelikasten", zeige: "toeggelikasten" },
    // Büro
    schreibtisch: { ein: "einen Schreibtisch", zeige: "schreibtisch" },
    buerostuhl: { ein: "einen Bürostuhl", zeige: "buerostuhl" },
    akten: { ein: "Ordner für die Akten", zeige: "ordnerregal" },
    drucker: { ein: "einen Drucker", zeige: "drucker" },
    kopierer: { ein: "einen Kopierer", zeige: "kopierer" },
    server: { ein: "einen Server", zeige: "serverschrank" },
    // Lieblingssachen der Tiere
    bambus: { ein: "Bambus", zeige: "bambus" },
    rueebli: { ein: "Rüebli", zeige: "rueebli" },
    honig: { ein: "Honig", zeige: "honig" },
    nuesse: { ein: "Nüsse", zeige: "nuesse" },
    kaese: { ein: "Käse", zeige: "kaese" },
    fisch: { ein: "einen Fisch", zeige: "fisch" },
    melone: { ein: "eine Melone", zeige: "melone" },
    beeren: { ein: "Beeren", zeige: "beeren" },
    knochen: { ein: "einen Knochen", zeige: "knochen" },
    aquarium: { ein: "ein Aquarium", zeige: "aquarium" },
    kratzbaum: { ein: "einen Kratzbaum", zeige: "kratzbaum" },
    laub: { ein: "einen Laubhaufen", zeige: "laubhaufen" },
    heu: { ein: "Heu", zeige: "heuballen" },
    koerbchen: { ein: "ein Körbchen", zeige: "hundekorb" },
    schal: { ein: "einen Schal", zeige: "schal" },
    fernrohr: { ein: "ein Fernrohr", zeige: "fernrohr" },
    milch: { ein: "Milch", zeige: "milch" },
    aepfel: { ein: "Äpfel", zeige: "aepfel" },
  };

  // ---------------------------------------------------------------------------
  // Wünsche für das Haus (grün) und für die anderen Häuser (blau)
  // ---------------------------------------------------------------------------
  // Grün: welche Zimmer das Wohnhaus haben sollte – die vorderen sind
  // wichtiger und werden öfter gewünscht.
  const HAUS_WUENSCHE = {
    wohnhaus: ["bad", "kueche", "wohnzimmer", "esszimmer", "waschzimmer", "eingang", "terrasse", "bastelzimmer", "keller"],
  };

  // Blau: was ein Tier in einem anderen Haus braucht. warum ist der Satz
  // dahinter – er macht aus dem Wunsch eine kleine Geschichte.
  const FREMD_WUENSCHE = {
    wohnhaus: [
      { haus: "zentrum", raum: "spielplatz", warum: "Dort spiele ich am Nachmittag." },
      { haus: "zentrum", raum: "lebensmittel", warum: "Dort kaufe ich mein Essen ein." },
      { haus: "zentrum", raum: "bibliothek", warum: "Dort hole ich mir Bücher." },
      { haus: "zentrum", raum: "baeckerei", warum: "Dort hole ich frisches Brot." },
      { haus: "zentrum", raum: "hallenbad", warum: "Ich gehe so gern schwimmen." },
      { haus: "zentrum", raum: "schule", warum: "Dort lerne ich lesen und rechnen." },
      { haus: "zentrum", raum: "cafe", warum: "Dort esse ich gern ein Stück Kuchen." },
      { haus: "zentrum", raum: "kino", warum: "Ich schaue so gern Filme." },
      { haus: "zentrum", raum: "post", warum: "Dort schicke ich meiner Grossmutter einen Brief." },
      { haus: "zentrum", raum: "coiffeur", warum: "Meine Haare sind schon ganz lang." },
      { haus: "zentrum", raum: "turnhalle", warum: "Dort turne ich mit meinen Freunden." },
      { haus: "zentrum", raum: "kiddydome", warum: "Dort rutsche, klettere und hüpfe ich." },
      { haus: "spital", raum: "notfall", warum: "Falls ich mich einmal verletze." },
      { haus: "spital", raum: "paediatrie", warum: "Dort hilft man kranken Kindern." },
      { haus: "spital", raum: "apotheke", warum: "Dort gibt es Hustensirup." },
      { haus: "spital", raum: "augen", warum: "Ich möchte meine Augen testen lassen." },
      { haus: "buero", raum: "cafeteria", warum: "Dort trinke ich mit Freunden Kaffee." },
      { haus: "buero", raum: "fitness", warum: "Dort halte ich mich fit." },
      { haus: "buero", raum: "grossraum", warum: "Dort möchte ich arbeiten." },
    ],
  };


  // ---------------------------------------------------------------------------
  // Die Tiere
  // ---------------------------------------------------------------------------
  // Die zwölf der App (train-art.js, DRIVERS) und vier neue. Farben und Ohren
  // wie die Chauffeure der Lok; was sie erzählen, stammt aus den Steckbriefen
  // der Leseecke (lesen-detektive.js), in der Ich-Form.
  //   namen   aus denen ein Name gezogen wird (Leo, Pino, Mia, Tim und Fred
  //           kennen die Kinder aus den Büchern)
  //   mag     ein Lieblingsding (tag) und eine Lieblingsfarbe (Familie)
  const TIERE = {
    fox: { name: "Fuchs", der: "der Fuchs", coat: "#e8763a", inner: "#ffd9b8", ear: "point", namen: ["Flora", "Felix", "Fanny", "Fritzi"],
      mag: { ding: "beeren", farbe: "orange" },
      isst: "Beeren, Käfer und Würmer – ich bin nicht wählerisch.",
      fakt: "Ich höre eine Maus sogar unter dem Schnee. Dann springe ich hoch und tauche mit der Nase voran hinein." },
    bear: { name: "Bär", der: "der Bär", coat: "#9a6b46", inner: "#d8b48f", ear: "round", namen: ["Berta", "Benno", "Bella", "Bodo"],
      mag: { ding: "honig", farbe: "gelb" },
      isst: "Honig! Und Beeren und Fisch.",
      fakt: "Im Winter halte ich in meiner Höhle eine lange Winterruhe." },
    rabbit: { name: "Hase", der: "der Hase", coat: "#f0ece6", inner: "#f7b8c4", ear: "long", namen: ["Lilli", "Hannes", "Hanna", "Mümmel"],
      mag: { ding: "rueebli", farbe: "rosa" },
      isst: "Rüebli, Gras und Kräuter. Im Winter knabbere ich auch Rinde.",
      fakt: "Ich wohne auf Feldern und Wiesen. Ich grabe keinen Bau – ich ruhe in einer kleinen Mulde, der Sasse." },
    cat: { name: "Katze", der: "die Katze", coat: "#8d8f9c", inner: "#e6e2ee", ear: "point", namen: ["Mimi", "Minka", "Kasimir", "Mauzi"],
      mag: { ding: "kratzbaum", farbe: "violett" },
      isst: "Fisch! Mmh, Fisch.",
      fakt: "Im Dunkeln sehe ich viel besser als du. Und ich schlafe gern – bis zu 15 Stunden am Tag." },
    panda: { name: "Panda", der: "der Panda", coat: "#f4f1ec", inner: "#2f3138", ear: "round", namen: ["Pandi", "Ping", "Mei", "Bao"],
      mag: { ding: "bambus", farbe: "gruen" },
      isst: "Bambus! Ich kaue bis zu 14 Stunden am Tag Bambus.",
      fakt: "Ich wohne in den Bambuswäldern in China. An den Vorderpfoten habe ich einen Extra-Knochen – damit halte ich den Bambus wie mit einem Daumen." },
    frog: { name: "Frosch", der: "der Frosch", coat: "#5cb85c", inner: "#c9ea9a", ear: "eyes", namen: ["Frida", "Quaki", "Franz", "Hupf"],
      mag: { ding: "aquarium", farbe: "gruen" },
      isst: "Fliegen und Mücken – die fange ich mit meiner langen Zunge.",
      fakt: "Ich habe mein Leben als Kaulquappe im Wasser begonnen. Und ich trinke durch meine Haut!" },
    owl: { name: "Eule", der: "die Eule", coat: "#a9814f", inner: "#f3e2c0", ear: "tuft", namen: ["Olli", "Uli", "Eulalia", "Hedi"],
      mag: { ding: "buecher", farbe: "blau" },
      isst: "Käfer und anderes Krabbelzeug.",
      fakt: "Ich jage in der Nacht und fliege fast ohne ein Geräusch." },
    penguin: { name: "Pinguin", der: "der Pinguin", coat: "#3a4250", inner: "#ffffff", ear: "none", namen: ["Pia", "Pinga", "Pablo", "Peppi"],
      mag: { ding: "fisch", farbe: "blau" },
      isst: "Fische, Krill und Tintenfische – mmh!",
      fakt: "Ich komme aus der Antarktis, rund um den Südpol. Bei uns wärmt der Papa das Ei auf seinen Füssen." },
    lion: { name: "Löwe", der: "der Löwe", coat: "#e0a53c", inner: "#f6dda3", ear: "mane", namen: ["Lea", "Luna", "Lino", "Lola"],
      mag: { ding: "melone", farbe: "gelb" },
      isst: "Am liebsten Melone! Das weisst du doch aus dem Buch.",
      fakt: "Löwen leben in einer Familie, dem Rudel. Und ich döse sehr gern – bis zu 20 Stunden am Tag!" },
    mouse: { name: "Maus", der: "die Maus", coat: "#b0b3bd", inner: "#f7c9d4", ear: "big", namen: ["Max", "Mo", "Fipsi", "Lina"],
      mag: { ding: "kaese", farbe: "rosa" },
      isst: "Körner und Samen – und ein Stückchen Käse.",
      fakt: "Meine Vorderzähne wachsen ein Leben lang nach. Darum nage ich so viel." },
    squirrel: { name: "Eichhörnchen", der: "das Eichhörnchen", coat: "#c9743a", inner: "#f2c9a6", ear: "tuft", namen: ["Nuki", "Elli", "Kiki", "Nico"],
      mag: { ding: "nuesse", farbe: "rot" },
      isst: "Nüsse! Im Herbst verstecke ich ganz viele für den Winter.",
      fakt: "Ich verstecke im Herbst Nüsse. Ich finde nicht alle wieder – daraus wachsen neue Bäume!" },
    ibex: { name: "Steinbock", der: "der Steinbock", coat: "#a99a86", inner: "#e9e2d6", ear: "horns", namen: ["Gian", "Mattia", "Sina", "Steffi"],
      mag: { ding: "klettern", farbe: "tuerkis" },
      isst: "Gras, Kräuter und Moos. Dafür klettere ich hoch in die Felsen.",
      fakt: "Ich wohne hoch oben in den Alpen. Meine Hufe halten an den Felsen fast wie Saugnäpfe. Ich bin das Wappentier von Graubünden!" },
    dog: { name: "Hund", der: "der Hund", coat: "#c49a6c", inner: "#f3e2c8", ear: "flop", namen: ["Bello", "Lumpi", "Nala", "Sammy"],
      mag: { ding: "koerbchen", farbe: "blau" },
      isst: "Einen Knochen zum Nagen – das ist das Beste!",
      fakt: "Ich kann viel besser riechen als die Menschen. Mit meiner Nase finde ich fast alles." },
    hedgehog: { name: "Igel", der: "der Igel", coat: "#8a6a4f", inner: "#e9d2b4", ear: "spikes", namen: ["Pieks", "Ida", "Igo", "Stupsi"],
      mag: { ding: "laub", farbe: "braun" },
      isst: "Käfer, Würmer und Schnecken.",
      fakt: "Ich habe ungefähr 7000 Stacheln. Im Winter schlafe ich in einem Laubhaufen." },
    cow: { name: "Kuh", der: "die Kuh", coat: "#fbf8f2", inner: "#ffc4d6", ear: "cow", namen: ["Lotti", "Rosi", "Frieda", "Fleck"],
      mag: { ding: "heu", farbe: "gruen" },
      isst: "Gras und Heu – und ich kaue alles zweimal.",
      fakt: "Ich gebe Milch. Daraus macht man Käse – in der Schweiz ganz viele Sorten!" },
    elephant: { name: "Elefant", der: "der Elefant", coat: "#a5adba", inner: "#d9dee6", ear: "elefant", namen: ["Emil", "Erna", "Tembo", "Mala"],
      mag: { ding: "aepfel", farbe: "violett" },
      isst: "Gras, Blätter und Äpfel – ganz, ganz viel davon!",
      fakt: "Mit meinem Rüssel kann ich trinken, duschen und sogar Hallo winken." },
  };
  const TIER_IDS = Object.keys(TIERE);

  // ---------------------------------------------------------------------------
  // Die Figuren aus den Büchern der Leseecke
  // ---------------------------------------------------------------------------
  // Die Kinder kennen sie aus den Geschichten – darum ziehen sie zuerst ein
  // (bau-stand.js, neuesTier), sehen aus wie im Buch (bau-tiere.js, figur) und
  // mögen, was sie dort mögen. Ein Tier ist eine Figur, wenn Art und Name
  // stimmen (auch: ein früherer Name), so ist auch ein Leo, der schon vorher
  // eingezogen ist, Leo aus dem Buch. Ihre Namen fehlen darum bei TIERE.namen.
  //   buecher  in welchen Büchern sie vorkommt, ihr eigenes zuerst
  //            (bilder/buecher/<id>/ hat den Umschlag)
  //   mag      Lieblingsding (tag, liegt in jeder Wohnung) und -farbe
  //   wunsch   ein Zimmer in einem anderen Haus, das zu ihrer Geschichte passt
  //   traum    der Traumjob (Zimmer), auch aus der Geschichte
  //   ich      was sie von sich erzählt – erinnert an das Buch, verrät das Ende nicht
  const F = (id, a, n, buecher, mag, farbe, ich, extra = {}) => ({ id, a, n, buecher: buecher.map(([b, titel]) => ({ id: b, titel })), mag: { ding: mag, farbe }, ich, ...extra });
  const FIGUREN = [
    F("leo", "lion", "Leo", [["leo-melone", "Leo und die Melone"], ["leo-bruellt", "Leo lernt brüllen"]], "melone", "gelb",
      "Ich bin Leo. Ich mag Melonen – einmal ist mir eine davongerollt!",
      { wunsch: { haus: "zentrum", raum: "lebensmittel", warum: "Dort gibt es Melonen – die mag ich am liebsten." }, traum: "zentrum:musik" }),
    F("rosa", "mouse", "Oma Rosa", [["geschenk-oma-rosa", "Ein Geschenk für Oma Rosa"], ["leo-melone", "Leo und die Melone"], ["leo-bruellt", "Leo lernt brüllen"]], "buecher", "violett",
      "Ich bin Oma Rosa. Ich liebe Geschichten – und ich weiss: Ein richtiges Brüllen kommt aus dem Bauch!",
      { auch: ["Rosa"], wunsch: { haus: "zentrum", raum: "bibliothek", warum: "Ich liebe Geschichten." }, traum: "zentrum:schule" }),
    F("mia", "mouse", "Mia", [["mia-ball", "Mia und der Ball"], ["geschenk-oma-rosa", "Ein Geschenk für Oma Rosa"]], "ball", "rot",
      "Ich bin Mia. Ich spiele gern mit meinem roten Ball – und aus einer alten Kiste baue ich auch mal eine Rakete!",
      { wunsch: { haus: "zentrum", raum: "spielplatz", warum: "Dort werfe ich meinen roten Ball hoch." }, traum: "zentrum:bibliothek" }),
    F("hoppel", "rabbit", "Hoppel", [["hase-rueebli", "Wo ist das Rüebli?"], ["hoppel-velo", "Hoppel lernt Velo fahren"]], "rueebli", "blau",
      "Ich bin Hoppel. Ich habe immer Lust auf ein knackiges Rüebli – und mein rotes Velo glänzt in der Sonne!",
      { wunsch: { haus: "zentrum", raum: "velowerkstatt", warum: "Dort pumpe ich die Pneus von meinem roten Velo." }, traum: "zentrum:lebensmittel" }),
    F("ella", "owl", "Ella", [["eule-ella", "Eule Ella hört zu"], ["ella-ei", "Ella findet ein Ei"], ["reise-mond", "Die Reise zum Mond"]], "buecher", "blau",
      "Ich bin Ella. Am Tag schlafe ich, und in der Nacht höre ich am liebsten Geschichten zu.",
      { wunsch: { haus: "zentrum", raum: "bibliothek", warum: "Dort gibt es Geschichten – zuhören mag ich am liebsten." }, traum: "spital:geburt" }),
    F("pino", "penguin", "Pino", [["pino-insel", "Pino will auf die Insel"], ["pino-schneemann", "Pino baut einen Schneemann"], ["leuchtturm-licht", "Das Licht im Leuchtturm"]], "fisch", "blau",
      "Ich bin Pino. Ich fahre gern mit dem Boot – und in den Ferien bin ich bei Opa Paul im Leuchtturm.",
      { wunsch: { haus: "zentrum", raum: "post", warum: "Dort schicke ich Opa Paul eine Karte." }, traum: "zentrum:hallenbad" }),
    F("paul", "penguin", "Opa Paul", [["leuchtturm-licht", "Das Licht im Leuchtturm"]], "lampe", "blau",
      "Ich bin Opa Paul, der Leuchtturmwärter. Jeden Abend steige ich neunundneunzig Stufen hinauf, damit mein Licht den Booten den Weg zeigt.",
      { auch: ["Paul"], wunsch: { haus: "spital", raum: "physio", warum: "Dort übe ich, bis mein Fuss wieder ganz gesund ist." }, traum: "zentrum:eingangshalle" }),
    F("flitz", "squirrel", "Flitz", [["flitz-nuss", "Flitz und die vergessene Nuss"], ["flitz-geheimnis", "Ein Geheimnis im Wald"], ["baumhaus-nacht", "Die Nacht im Baumhaus"]], "nuesse", "gruen",
      "Ich bin Flitz. Ich sammle Nüsse – und in meinem Baumhaus übernachten manchmal alle meine Freunde!",
      { wunsch: { haus: "zentrum", raum: "cafe", warum: "Dort esse ich gern ein Stück Kuchen – am liebsten einen mit Nüssen." }, traum: "buero:bueroempfang" }),
    F("sepp", "ibex", "Sepp", [["sepp-gewitter", "Sepp und das Gewitter"], ["bergrennen", "Das grosse Bergrennen"]], "klettern", "rot",
      "Ich bin Sepp. Ich springe über die Felsen, als wäre es eine Treppe – nur der Donner macht mir ein bisschen Angst.",
      { wunsch: { haus: "zentrum", raum: "turnhalle", warum: "Dort trainiere ich jeden Tag für das Bergrennen." }, traum: "spital:notfall" }),
    F("pippa", "panda", "Pippa", [["pippa-bambus", "Wer klaut Pippas Bambus?"], ["pippa-regen", "Pippa und der Regen"]], "bambus", "rot",
      "Ich bin Pippa. Ich liebe Bambus über alles – und mit meiner Lupe bin ich eine echte Detektivin!",
      { wunsch: { haus: "zentrum", raum: "lebensmittel", warum: "Dort kaufe ich frischen Bambus – grün und knackig!" }, traum: "spital:labor" }),
    F("fridolin", "frog", "Fridolin", [["pippa-regen", "Pippa und der Regen"]], "aquarium", "gruen",
      "Ich bin Fridolin. Regen ist das Schönste! Komm, wir springen in die Pfützen!",
      { wunsch: { haus: "zentrum", raum: "hallenbad", warum: "Nass ist das Schönste – da springe ich hinein!" }, traum: "zentrum:kiddydome" }),
    F("bruno", "bear", "Bruno", [["bruno-sterne", "Bruno zählt Sterne"], ["bruno-schnee", "Bruno und der erste Schnee"]], "fernrohr", "gruen",
      "Ich bin Bruno. Ich zähle so gern Sterne: eins, zwei, drei … wie weit komme ich wohl?",
      { wunsch: { haus: "zentrum", raum: "schule", warum: "Dort lerne ich zählen – vielleicht schaffe ich dann alle Sterne!" }, traum: "zentrum:turnhalle" }),
    F("mamabaer", "bear", "Mama Bär", [["bruno-schnee", "Bruno und der erste Schnee"]], "honig", "rot",
      "Ich bin Mama Bär. Wenn die Blätter fallen, sage ich: Bald ist es Zeit für den Winterschlaf!",
      { traum: "zentrum:kita" }),
    F("fino", "fox", "Fino", [["fino-schal", "Fino und der rote Schal"]], "schal", "rot",
      "Ich bin Fino. Meine Oma hat mir einen roten Schal gestrickt – einmal hat ihn der Wind fortgetragen. Huiii!",
      { wunsch: { haus: "zentrum", raum: "kleider", warum: "Dort gibt es warme Schals – wie den, den mir der Wind fortgetragen hat." }, traum: "zentrum:post" }),
    F("tim", "cat", "Tim", [["tim-malt", "Kater Tim malt"]], "malen", "violett",
      "Ich bin Tim, der Kater. Ich male so gern – auch wenn danach manchmal Farbe an meinem Bauch klebt!",
      { wunsch: { haus: "buero", raum: "atelier", warum: "Dort wird gemalt und gezeichnet – genau wie bei mir!" }, traum: "buero:atelier" }),
    F("fred", "frog", "Fred", [["fred-frosch", "Fred, der Frosch"], ["leuchtturm-licht", "Das Licht im Leuchtturm"]], "fisch", "gelb",
      "Ich bin Fred. Ich sitze gern auf meinem Seerosenblatt – und mit meinem Fischerboot fahre ich auf den See hinaus.",
      { traum: "zentrum:restaurant" }),
  ];

  // ---------------------------------------------------------------------------
  // Die Sternenleiter des Dorfs: Alle Sterne aller Tiere zusammen bringen dem
  // Dorf Stufe um Stufe etwas Neues (gezeichnet in bau-art.js). Ohne Kauf hat
  // das Wohnhaus bis zu vier Wohnungen, also höchstens 60 Sterne – die letzte
  // Stufe ist ein langes, aber erreichbares Ziel.
  // ---------------------------------------------------------------------------
  const LEITER = [
    { sterne: 5, id: "blumen", name: "Blumenbeete", text: "Bunte Blumen blühen an der Strasse." },
    { sterne: 10, id: "fahnen", name: "Wimpelketten", text: "Bunte Wimpel flattern zwischen den Bäumen." },
    { sterne: 15, id: "brunnen", name: "Ein Brunnen", text: "Neben dem Haus plätschert ein Brunnen." },
    { sterne: 20, id: "ballon", name: "Ein Heissluftballon", text: "Ein Heissluftballon schwebt über dem Dorf." },
    { sterne: 30, id: "regenbogen", name: "Ein Regenbogen", text: "Ein Regenbogen leuchtet über den Häusern." },
    { sterne: 40, id: "karussell", name: "Ein Karussell", text: "Ein Karussell steht für die Tiere bereit." },
    { sterne: 50, id: "statue", name: "Die Sternenstatue", text: "Eine goldene Sternenstatue zeigt: Hier sind alle glücklich." },
    { sterne: 60, id: "dachstern", name: "Goldene Dachsterne", text: "Auf jedem Dach funkelt ein goldener Stern." },
    // Mit mehr als vier Wohnungen (nach dem Kauf) gibt es mehr Sterne – bis
    // 300 bei 60 Tieren. Die Leiter geht darum weiter.
    { sterne: 75, id: "riesenrad", name: "Ein Riesenrad", text: "Neben dem Haus dreht sich ein Riesenrad." },
    { sterne: 90, id: "teich", name: "Ein Ententeich", text: "Im Teich auf der Wiese schwimmen Enten." },
    { sterne: 105, id: "drachen", name: "Bunte Drachen", text: "Bunte Drachen tanzen am Himmel." },
    { sterne: 120, id: "windmuehle", name: "Eine Windmühle", text: "Eine Windmühle dreht sich neben dem Dorf." },
    { sterne: 140, id: "garten", name: "Ein Gemüsegarten", text: "Im Garten wachsen Rüebli, Salat und Kürbisse." },
    { sterne: 160, id: "zeppelin", name: "Ein Zeppelin", text: "Ein Zeppelin fliegt über das Dorf." },
    { sterne: 180, id: "schloss", name: "Ein Schloss", text: "Auf dem Hügel steht ein Schloss mit Fahnen." },
    { sterne: 200, id: "feuerwerk", name: "Ein Feuerwerk", text: "Ab und zu gibt es ein Feuerwerk über dem Dorf." },
  ];

  window.LernappBauKatalog = {
    FARBEN, FARBE, FAMILIEN, MUSTER, BOEDEN, BODEN,
    HAEUSER, HAUS, RAEUME, RAEUME_LISTE, WOHNEN, JOBS, LIEBLINGS, dingeFuer,
    DING_WUENSCHE, HAUS_WUENSCHE, FREMD_WUENSCHE,
    TIERE, TIER_IDS, FIGUREN, LEITER,
  };
})();
