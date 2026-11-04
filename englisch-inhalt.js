/*
 * englisch-inhalt.js – Was in der Englischecke gesagt wird, Englisch und
 * Deutsch.
 *
 * Jeder Text kommt als Paar: zuerst Englisch (gesprochen von Puck, en-US,
 * Tempo 0,9 – englisch-stimme.js), auf Wunsch Deutsch (Sulafat wie die ganze
 * App – app-stimme.js) und danach noch einmal Englisch. Die Paare stehen hier,
 * damit die Aufnahmen (scripts/stimme-englisch-texte.mjs und
 * scripts/stimme-app/englischecke.mjs) und die Englischecke dieselben Sätze
 * kennen. US-Englisch: mom, cookie, pancakes.
 *
 *   WELTEN       die Orte, an die Roccos Caboose fährt; je ein Wimmelbild mit
 *                13 Dingen. Ein Ding: das Wort mit Artikel (erster Tipp), ein
 *                Satz (zweiter Tipp), die Frage für «Hear & find» – je
 *                Englisch und Deutsch.
 *   GESCHICHTEN  Bildgeschichten in vier Bildern, ein bis drei kurze Sätze je
 *                Bild, mit einem Muster, das wiederkehrt.
 *   SAETZE       was Rocco sonst sagt.
 *   LOB          wenn ein Kind das Richtige gefunden hat.
 *   EINRICHTUNG  die 15 Dinge, mit denen der Caboose gemütlich wird – jedes
 *                ein englisches Wort.
 *
 * Gezeichnet wird in englisch-art.js; wer was gefunden hat, steht in
 * englisch-stand.js.
 */
(() => {
  "use strict";

  // [id, Wort, Satz, Frage, deutsches Wort, deutscher Satz, deutsche Frage]
  const w = (id, en, satz, frage, de, deSatz, deFrage) => ({ id, en, satz, frage, de, deSatz, deFrage });

  const WELTEN = [
    {
      id: "farm",
      titel: ["The Farm", "Der Bauernhof"],
      intro: ["Let's explore the farm! Tap a picture.", "Wir entdecken den Bauernhof! Tippe auf ein Bild."],
      woerter: [
        w("sun", "The sun.", "The sun is yellow.", "Where is the sun?", "Die Sonne.", "Die Sonne ist gelb.", "Wo ist die Sonne?"),
        w("barn", "A barn.", "The barn is red.", "Where is the barn?", "Eine Scheune.", "Die Scheune ist rot.", "Wo ist die Scheune?"),
        w("tractor", "A tractor.", "The tractor is green.", "Where is the tractor?", "Ein Traktor.", "Der Traktor ist grün.", "Wo ist der Traktor?"),
        w("tree", "A tree.", "The tree is big.", "Where is the tree?", "Ein Baum.", "Der Baum ist gross.", "Wo ist der Baum?"),
        w("apple", "An apple.", "The apple is red. Yum!", "Where is the apple?", "Ein Apfel.", "Der Apfel ist rot. Mmh!", "Wo ist der Apfel?"),
        w("cow", "A cow.", "The cow says moo.", "Where is the cow?", "Eine Kuh.", "Die Kuh macht muh.", "Wo ist die Kuh?"),
        w("pig", "A pig.", "The pig is pink.", "Where is the pig?", "Ein Schwein.", "Das Schwein ist rosa.", "Wo ist das Schwein?"),
        w("sheep", "A sheep.", "The sheep says baa.", "Where is the sheep?", "Ein Schaf.", "Das Schaf macht mäh.", "Wo ist das Schaf?"),
        w("chicken", "A chicken.", "The chicken has an egg.", "Where is the chicken?", "Ein Huhn.", "Das Huhn hat ein Ei.", "Wo ist das Huhn?"),
        w("duck", "A duck.", "The duck is swimming.", "Where is the duck?", "Eine Ente.", "Die Ente schwimmt.", "Wo ist die Ente?"),
        w("dog", "A dog.", "The dog is jumping.", "Where is the dog?", "Ein Hund.", "Der Hund springt.", "Wo ist der Hund?"),
        w("cat", "A cat.", "The cat is sleeping.", "Where is the cat?", "Eine Katze.", "Die Katze schläft.", "Wo ist die Katze?"),
        w("flower", "A flower.", "The flower is blue.", "Where is the flower?", "Eine Blume.", "Die Blume ist blau.", "Wo ist die Blume?"),
      ],
    },
    {
      id: "house",
      titel: ["My House", "Mein Zuhause"],
      intro: ["Let's explore my house! Tap a picture.", "Wir entdecken mein Zuhause! Tippe auf ein Bild."],
      woerter: [
        w("door", "A door.", "The door is open.", "Where is the door?", "Eine Tür.", "Die Tür ist offen.", "Wo ist die Tür?"),
        w("window", "A window.", "Look out of the window!", "Where is the window?", "Ein Fenster.", "Schau aus dem Fenster!", "Wo ist das Fenster?"),
        w("bed", "A bed.", "The bed is soft.", "Where is the bed?", "Ein Bett.", "Das Bett ist weich.", "Wo ist das Bett?"),
        w("table", "A table.", "The table is brown.", "Where is the table?", "Ein Tisch.", "Der Tisch ist braun.", "Wo ist der Tisch?"),
        w("chair", "A chair.", "Sit on the chair, please.", "Where is the chair?", "Ein Stuhl.", "Setz dich bitte auf den Stuhl.", "Wo ist der Stuhl?"),
        w("sofa", "A sofa.", "The sofa is big and red.", "Where is the sofa?", "Ein Sofa.", "Das Sofa ist gross und rot.", "Wo ist das Sofa?"),
        w("lamp", "A lamp.", "The lamp is on.", "Where is the lamp?", "Eine Lampe.", "Die Lampe ist an.", "Wo ist die Lampe?"),
        w("clock", "A clock.", "Tick, tock! The clock says tick, tock.", "Where is the clock?", "Eine Uhr.", "Tick, tack! Die Uhr macht tick, tack.", "Wo ist die Uhr?"),
        w("tv", "A TV.", "The TV is off.", "Where is the TV?", "Ein Fernseher.", "Der Fernseher ist aus.", "Wo ist der Fernseher?"),
        w("mom", "Mom.", "This is my mom.", "Where is mom?", "Mama.", "Das ist meine Mama.", "Wo ist Mama?"),
        w("dad", "Dad.", "This is my dad.", "Where is dad?", "Papa.", "Das ist mein Papa.", "Wo ist Papa?"),
        w("baby", "A baby.", "The baby is sleeping.", "Where is the baby?", "Ein Baby.", "Das Baby schläft.", "Wo ist das Baby?"),
        w("teddy", "A teddy bear.", "I love my teddy bear.", "Where is the teddy bear?", "Ein Teddybär.", "Ich habe meinen Teddybär lieb.", "Wo ist der Teddybär?"),
      ],
    },
    {
      id: "kitchen",
      titel: ["The Kitchen", "Die Küche"],
      intro: ["Let's explore the kitchen! Tap a picture.", "Wir entdecken die Küche! Tippe auf ein Bild."],
      woerter: [
        w("fridge", "A fridge.", "The fridge is cold.", "Where is the fridge?", "Ein Kühlschrank.", "Der Kühlschrank ist kalt.", "Wo ist der Kühlschrank?"),
        w("banana", "A banana.", "The banana is yellow.", "Where is the banana?", "Eine Banane.", "Die Banane ist gelb.", "Wo ist die Banane?"),
        w("bread", "Bread.", "The bread is fresh.", "Where is the bread?", "Brot.", "Das Brot ist frisch.", "Wo ist das Brot?"),
        w("milk", "Milk.", "The milk is white.", "Where is the milk?", "Milch.", "Die Milch ist weiss.", "Wo ist die Milch?"),
        w("cheese", "Cheese.", "I like cheese.", "Where is the cheese?", "Käse.", "Ich mag Käse.", "Wo ist der Käse?"),
        w("egg", "An egg.", "The egg is round.", "Where is the egg?", "Ein Ei.", "Das Ei ist rund.", "Wo ist das Ei?"),
        w("cake", "A cake.", "A birthday cake! Yum!", "Where is the cake?", "Ein Kuchen.", "Ein Geburtstagskuchen! Mmh!", "Wo ist der Kuchen?"),
        w("pancakes", "Pancakes.", "I love pancakes!", "Where are the pancakes?", "Pfannkuchen.", "Ich liebe Pfannkuchen!", "Wo sind die Pfannkuchen?"),
        w("cookie", "A cookie.", "Can I have a cookie, please?", "Where is the cookie?", "Ein Guetzli.", "Darf ich bitte ein Guetzli haben?", "Wo ist das Guetzli?"),
        w("juice", "Juice.", "The juice is orange.", "Where is the juice?", "Saft.", "Der Saft ist orange.", "Wo ist der Saft?"),
        w("cup", "A cup.", "A cup of milk.", "Where is the cup?", "Eine Tasse.", "Eine Tasse Milch.", "Wo ist die Tasse?"),
        w("plate", "A plate.", "The plate is empty.", "Where is the plate?", "Ein Teller.", "Der Teller ist leer.", "Wo ist der Teller?"),
        w("spoon", "A spoon.", "A big spoon.", "Where is the spoon?", "Ein Löffel.", "Ein grosser Löffel.", "Wo ist der Löffel?"),
      ],
    },
  ];

  // Wörter, die nur in den Geschichten vorkommen (das Kind kann sie im Bild
  // antippen, sie kommen ins Wörterbuch).
  const EXTRA_WOERTER = [
    w("ball", "A ball.", "The ball is red.", "Where is the ball?", "Ein Ball.", "Der Ball ist rot.", "Wo ist der Ball?"),
    w("raccoon", "A raccoon.", "Rocco is a raccoon.", "Where is the raccoon?", "Ein Waschbär.", "Rocco ist ein Waschbär.", "Wo ist der Waschbär?"),
    w("box", "A box.", "The box is open.", "Where is the box?", "Eine Kiste.", "Die Kiste ist offen.", "Wo ist die Kiste?"),
  ];

  // bilder: [Englisch, Deutsch, Zeichnung]; woerter: was man darin antippen
  // kann (nur, was im Satz vorkommt).
  const GESCHICHTEN = [
    {
      id: "ball",
      welt: "farm",
      titel: ["Rocco and the red ball.", "Rocco und der rote Ball."],
      bilder: [
        { en: "This is Rocco. Rocco has a red ball.", de: "Das ist Rocco. Rocco hat einen roten Ball.", woerter: ["raccoon", "ball"] },
        { en: "Rocco throws the ball. Up, up, up!", de: "Rocco wirft den Ball. Hoch, hoch, hoch!", woerter: ["raccoon", "ball"] },
        { en: "Oh no! The ball is in the tree.", de: "Oh nein! Der Ball ist im Baum.", woerter: ["ball", "tree"] },
        { en: "The dog jumps. Thank you, dog! Rocco is happy.", de: "Der Hund springt. Danke, Hund! Rocco ist glücklich.", woerter: ["dog", "raccoon"] },
      ],
    },
    {
      id: "cat",
      welt: "house",
      titel: ["Where is the cat?", "Wo ist die Katze?"],
      bilder: [
        { en: "Rocco is looking for the cat. Where is the cat?", de: "Rocco sucht die Katze. Wo ist die Katze?", woerter: ["raccoon"] },
        { en: "Is the cat under the bed? No!", de: "Ist die Katze unter dem Bett? Nein!", woerter: ["bed"] },
        { en: "Is the cat on the sofa? No!", de: "Ist die Katze auf dem Sofa? Nein!", woerter: ["sofa"] },
        { en: "Is the cat in the box? Yes! Hello, cat!", de: "Ist die Katze in der Kiste? Ja! Hallo, Katze!", woerter: ["box", "cat"] },
      ],
    },
    {
      id: "hungry",
      welt: "kitchen",
      titel: ["Rocco is hungry.", "Rocco hat Hunger."],
      bilder: [
        { en: "Rocco is hungry. His tummy says grrr.", de: "Rocco hat Hunger. Sein Bauch macht grrr.", woerter: ["raccoon"] },
        { en: "A banana? Yum!", de: "Eine Banane? Mmh!", woerter: ["banana"] },
        { en: "Bread and cheese? Yum, yum!", de: "Brot und Käse? Mmh, fein!", woerter: ["bread", "cheese"] },
        { en: "A big cake? Yum, yum, yum! Now Rocco is full.", de: "Ein grosser Kuchen? Mmh, ist der fein! Jetzt ist Rocco satt.", woerter: ["cake"] },
      ],
    },
  ];

  // Was Rocco sonst sagt: [Englisch, Deutsch].
  const SAETZE = {
    hallo: ["Hello! I am Rocco. Welcome to my caboose!", "Hallo! Ich bin Rocco. Willkommen in meinem Wagen!"],
    ausguck: ["Let's go up to the lookout! Where do you want to go?", "Wir steigen auf den Aussichtsturm! Wohin möchtest du?"],
    regal: ["Which story do you want?", "Welche Geschichte möchtest du?"],
    kiste: ["Let's play Hear and find! Where do you want to play?", "Wir spielen Hear and find! Wo möchtest du spielen?"],
    tuer: ["This door goes to the math wagon.", "Diese Tür führt in den Rechenwagen."],
    woerterbuch: ["This is my word book. Every word you find is a sticker.", "Das ist mein Wörterbuch. Jedes Wort, das du findest, ist ein Sticker."],
    stickerZu: ["You have not found this one yet.", "Diesen hast du noch nicht gefunden."],
    aufnaeher: ["These are my patches. You get a patch for every world.", "Das sind meine Aufnäher. Für jede Welt gibt es einen."],
    neuerAufnaeher: ["Look! A new patch for my caboose!", "Schau! Ein neuer Aufnäher für meinen Wagen!"],
    allesGefunden: ["You found everything! Great job!", "Du hast alles gefunden! Super gemacht!"],
    hearfind: ["Let's play Hear and find! Listen and tap the picture.", "Wir spielen Hear and find! Hör gut zu und tippe auf das Bild."],
    rundeFertig: ["You found them all! Great job!", "Du hast alle gefunden! Super gemacht!"],
    nochmal: ["Let's play again!", "Wir spielen nochmal!"],
    hearfindZuerst: ["Explore first! Then we play Hear and find.", "Zuerst entdecken! Dann spielen wir Hear and find."],
    ende: ["The end.", "Ende."],
    ganzeGeschichte: ["Listen to the whole story!", "Hör die ganze Geschichte!"],
    vorschlag: ["I have an idea!", "Ich habe eine Idee!"],
    wortbuchTitel: ["My Word Book", "Mein Wörterbuch"],
    hearfindTitel: ["Hear and find", "Hear and find heisst: Hör zu und finde!"],
    geschichtenTitel: ["Stories", "Geschichten"],
    aufnaeherTitel: ["My Patches", "Meine Aufnäher"],
    zurueckZimmer: ["Back to the caboose!", "Zurück in den Wagen!"],
  };

  const LOB = [
    ["Yes!", "Ja, genau!"],
    ["Great job!", "Super gemacht!"],
    ["Super!", "Toll!"],
    ["Well done!", "Gut gemacht!"],
  ];

  // [id, Englisch, Deutsch] – nach 1, 2, 4, 6 … 60 Runden (englisch-stand.js).
  const EINRICHTUNG = [
    ["lantern", "Look! A lantern!", "Schau! Eine Laterne!"],
    ["quilt", "Look! A quilt!", "Schau! Eine Patchwork-Decke!"],
    ["baseball", "Look! A baseball and a glove!", "Schau! Ein Baseball und ein Handschuh!"],
    ["curtains", "Look! New curtains!", "Schau! Neue Vorhänge!"],
    ["sunflowers", "Look! Sunflowers!", "Schau! Sonnenblumen!"],
    ["pumpkin", "Look! A pumpkin!", "Schau! Ein Kürbis!"],
    ["schoolbus", "Look! A yellow school bus!", "Schau! Ein gelber Schulbus!"],
    ["cowboyhat", "Look! A cowboy hat!", "Schau! Ein Cowboyhut!"],
    ["pennants", "Look! Pennants!", "Schau! Eine Wimpelkette!"],
    ["globe", "Look! A globe!", "Schau! Ein Globus!"],
    ["cactus", "Look! A cactus!", "Schau! Ein Kaktus!"],
    ["bridge", "Look! The Golden Gate Bridge!", "Schau! Die Golden Gate Bridge!"],
    ["popcorn", "Look! Popcorn!", "Schau! Popcorn!"],
    ["lights", "Look! Fairy lights!", "Schau! Eine Lichterkette!"],
    ["stars", "Look! Stars!", "Schau! Sterne!"],
  ].map(([id, en, de]) => ({ id, en, de }));

  // Was der Lautsprecher oben links sagt (die Hilfe der App, auf Deutsch).
  const HILFE = {
    zimmer: "Das ist der Englischwagen. Hier wohnt Rocco, der Waschbär. Er spricht Englisch. Tippe auf den Aussichtsturm, auf das Regal mit den Geschichten, auf die Spielzeugkiste oder auf das Wörterbuch. Der Knopf DE sagt alles auf Deutsch.",
    wahl: "Tippe auf ein Bild.",
    entdecken: "Tippe auf ein Ding im Bild. Rocco sagt dir, wie es auf Englisch heisst. Tippst du noch einmal, sagt er einen Satz dazu. Der Knopf DE sagt es auf Deutsch.",
    hearfind: "Rocco sagt ein Wort auf Englisch. Tippe auf das Ding im Bild. Der Knopf DE sagt die Frage auf Deutsch.",
    geschichte: "Tippe auf ein Bild, und Rocco erzählt es auf Englisch. Der Knopf DE erzählt es auf Deutsch.",
    woerterbuch: "Das ist Roccos Wörterbuch. Jedes Wort, das du gefunden hast, ist ein Sticker. Tippe darauf, und du hörst es noch einmal.",
  };

  window.LernappEnglischInhalt = { WELTEN, EXTRA_WOERTER, GESCHICHTEN, SAETZE, LOB, EINRICHTUNG, HILFE };
})();
