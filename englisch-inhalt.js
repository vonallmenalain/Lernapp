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
    // Etappe 2
    {
      id: "park",
      titel: ["The Park", "Der Park"],
      intro: ["Let's go to the park! Tap a picture.", "Wir gehen in den Park! Tippe auf ein Bild."],
      woerter: [
        w("slide", "A slide.", "Whee! Down the slide!", "Where is the slide?", "Eine Rutschbahn.", "Hui! Die Rutschbahn hinunter!", "Wo ist die Rutschbahn?"),
        w("swing", "A swing.", "Up and down on the swing.", "Where is the swing?", "Eine Schaukel.", "Hoch und runter auf der Schaukel.", "Wo ist die Schaukel?"),
        w("sandbox", "A sandbox.", "I play in the sandbox.", "Where is the sandbox?", "Ein Sandkasten.", "Ich spiele im Sandkasten.", "Wo ist der Sandkasten?"),
        w("ball", "A ball.", "The ball is red.", "Where is the ball?", "Ein Ball.", "Der Ball ist rot.", "Wo ist der Ball?"),
        w("kite", "A kite.", "The kite is in the sky.", "Where is the kite?", "Ein Drachen.", "Der Drachen ist am Himmel.", "Wo ist der Drachen?"),
        w("bike", "A bike.", "I can ride a bike.", "Where is the bike?", "Ein Velo.", "Ich kann Velo fahren.", "Wo ist das Velo?"),
        w("bench", "A bench.", "Sit down on the bench.", "Where is the bench?", "Eine Bank.", "Setz dich auf die Bank.", "Wo ist die Bank?"),
        w("bird", "A bird.", "The bird can fly.", "Where is the bird?", "Ein Vogel.", "Der Vogel kann fliegen.", "Wo ist der Vogel?"),
        w("butterfly", "A butterfly.", "Look at the butterfly!", "Where is the butterfly?", "Ein Schmetterling.", "Schau den Schmetterling an!", "Wo ist der Schmetterling?"),
        w("squirrel", "A squirrel.", "The squirrel can climb.", "Where is the squirrel?", "Ein Eichhörnchen.", "Das Eichhörnchen kann klettern.", "Wo ist das Eichhörnchen?"),
        w("boy", "A boy.", "The boy has a kite.", "Where is the boy?", "Ein Bub.", "Der Bub hat einen Drachen.", "Wo ist der Bub?"),
        w("girl", "A girl.", "The girl likes the park.", "Where is the girl?", "Ein Mädchen.", "Das Mädchen mag den Park.", "Wo ist das Mädchen?"),
        w("scooter", "A scooter.", "My turn on the scooter!", "Where is the scooter?", "Ein Trottinett.", "Jetzt bin ich dran mit dem Trottinett!", "Wo ist das Trottinett?"),
      ],
    },
    {
      id: "zoo",
      titel: ["The Zoo", "Der Zoo"],
      intro: ["Let's go to the zoo! Tap an animal.", "Wir gehen in den Zoo! Tippe auf ein Tier."],
      woerter: [
        w("lion", "A lion.", "The lion says roar!", "Where is the lion?", "Ein Löwe.", "Der Löwe brüllt: Roar!", "Wo ist der Löwe?"),
        w("elephant", "An elephant.", "The elephant is big.", "Where is the elephant?", "Ein Elefant.", "Der Elefant ist gross.", "Wo ist der Elefant?"),
        w("giraffe", "A giraffe.", "The giraffe is tall.", "Where is the giraffe?", "Eine Giraffe.", "Die Giraffe ist gross.", "Wo ist die Giraffe?"),
        w("monkey", "A monkey.", "The monkey is funny.", "Where is the monkey?", "Ein Affe.", "Der Affe ist lustig.", "Wo ist der Affe?"),
        w("tiger", "A tiger.", "The tiger has stripes.", "Where is the tiger?", "Ein Tiger.", "Der Tiger hat Streifen.", "Wo ist der Tiger?"),
        w("zebra", "A zebra.", "The zebra is black and white.", "Where is the zebra?", "Ein Zebra.", "Das Zebra ist schwarz und weiss.", "Wo ist das Zebra?"),
        w("bear", "A bear.", "The bear is brown.", "Where is the bear?", "Ein Bär.", "Der Bär ist braun.", "Wo ist der Bär?"),
        w("snake", "A snake.", "The snake is long.", "Where is the snake?", "Eine Schlange.", "Die Schlange ist lang.", "Wo ist die Schlange?"),
        w("penguin", "A penguin.", "The penguin can swim.", "Where is the penguin?", "Ein Pinguin.", "Der Pinguin kann schwimmen.", "Wo ist der Pinguin?"),
        w("crocodile", "A crocodile.", "The crocodile has big teeth.", "Where is the crocodile?", "Ein Krokodil.", "Das Krokodil hat grosse Zähne.", "Wo ist das Krokodil?"),
        w("hippo", "A hippo.", "The hippo is in the water.", "Where is the hippo?", "Ein Flusspferd.", "Das Flusspferd ist im Wasser.", "Wo ist das Flusspferd?"),
        w("parrot", "A parrot.", "The parrot says hello!", "Where is the parrot?", "Ein Papagei.", "Der Papagei sagt hallo!", "Wo ist der Papagei?"),
        w("kangaroo", "A kangaroo.", "The kangaroo can jump.", "Where is the kangaroo?", "Ein Känguru.", "Das Känguru kann springen.", "Wo ist das Känguru?"),
      ],
    },
    {
      id: "beach",
      titel: ["The Beach", "Der Strand"],
      intro: ["Let's go to the beach! It's hot! Tap a picture.", "Wir gehen an den Strand! Es ist heiss! Tippe auf ein Bild."],
      woerter: [
        w("shell", "A shell.", "I found a shell!", "Where is the shell?", "Eine Muschel.", "Ich habe eine Muschel gefunden!", "Wo ist die Muschel?"),
        w("crab", "A crab.", "The crab is red.", "Where is the crab?", "Eine Krabbe.", "Die Krabbe ist rot.", "Wo ist die Krabbe?"),
        w("fish", "A fish.", "The fish can jump.", "Where is the fish?", "Ein Fisch.", "Der Fisch kann springen.", "Wo ist der Fisch?"),
        w("boat", "A boat.", "The boat is on the sea.", "Where is the boat?", "Ein Boot.", "Das Boot ist auf dem Meer.", "Wo ist das Boot?"),
        w("wave", "A wave.", "Splash! A big wave!", "Where is the wave?", "Eine Welle.", "Platsch! Eine grosse Welle!", "Wo ist die Welle?"),
        w("hat", "A hat.", "Put on your hat! It's hot!", "Where is the hat?", "Ein Hut.", "Setz deinen Hut auf! Es ist heiss!", "Wo ist der Hut?"),
        w("icecream", "An ice cream.", "I like ice cream!", "Where is the ice cream?", "Eine Glace.", "Ich mag Glace!", "Wo ist die Glace?"),
        w("bucket", "A bucket.", "Sand in the bucket.", "Where is the bucket?", "Ein Kesseli.", "Sand ins Kesseli.", "Wo ist das Kesseli?"),
        w("umbrella", "An umbrella.", "Sit under the umbrella.", "Where is the umbrella?", "Ein Sonnenschirm.", "Setz dich unter den Sonnenschirm.", "Wo ist der Sonnenschirm?"),
        w("starfish", "A starfish.", "The starfish looks like a star.", "Where is the starfish?", "Ein Seestern.", "Der Seestern sieht aus wie ein Stern.", "Wo ist der Seestern?"),
        w("sandcastle", "A sandcastle.", "Let's build a sandcastle!", "Where is the sandcastle?", "Eine Sandburg.", "Wir bauen eine Sandburg!", "Wo ist die Sandburg?"),
        w("seagull", "A seagull.", "The seagull can fly.", "Where is the seagull?", "Eine Möwe.", "Die Möwe kann fliegen.", "Wo ist die Möwe?"),
        w("sunglasses", "Sunglasses.", "Cool sunglasses!", "Where are the sunglasses?", "Eine Sonnenbrille.", "Coole Sonnenbrille!", "Wo ist die Sonnenbrille?"),
      ],
    },
  ];

  // Wörter, die nur in den Geschichten vorkommen (das Kind kann sie im Bild
  // antippen, sie kommen ins Wörterbuch).
  const EXTRA_WOERTER = [
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
    // Etappe 2
    {
      id: "kite",
      welt: "park",
      titel: ["Rocco and the kite.", "Rocco und der Drachen."],
      bilder: [
        { en: "Rocco has a kite. It is windy!", de: "Rocco hat einen Drachen. Es ist windig!", woerter: ["raccoon", "kite"] },
        { en: "Up, up, up! The kite is in the sky.", de: "Hoch, hoch, hoch! Der Drachen ist am Himmel.", woerter: ["kite"] },
        { en: "Oh no! The kite is in the tree.", de: "Oh nein! Der Drachen hängt im Baum.", woerter: ["kite", "tree"] },
        { en: "The squirrel helps. Thank you, squirrel!", de: "Das Eichhörnchen hilft. Danke, Eichhörnchen!", woerter: ["squirrel", "kite"] },
      ],
    },
    {
      id: "elephant",
      welt: "zoo",
      titel: ["Hello, elephant!", "Hallo, Elefant!"],
      bilder: [
        { en: "Rocco is at the zoo. Hello, monkey!", de: "Rocco ist im Zoo. Hallo, Affe!", woerter: ["raccoon", "monkey"] },
        { en: "Hello, giraffe! The giraffe is tall.", de: "Hallo, Giraffe! Die Giraffe ist gross.", woerter: ["giraffe"] },
        { en: "Where is the elephant?", de: "Wo ist der Elefant?", woerter: ["raccoon"] },
        { en: "Splash! Here is the elephant. Hello, elephant!", de: "Platsch! Da ist der Elefant. Hallo, Elefant!", woerter: ["elephant"] },
      ],
    },
    {
      id: "wave",
      welt: "beach",
      titel: ["The big wave.", "Die grosse Welle."],
      bilder: [
        { en: "Rocco builds a sandcastle.", de: "Rocco baut eine Sandburg.", woerter: ["raccoon", "sandcastle"] },
        { en: "Look, a crab! Hello, crab!", de: "Schau, eine Krabbe! Hallo, Krabbe!", woerter: ["crab"] },
        { en: "Oh no! A big wave!", de: "Oh nein! Eine grosse Welle!", woerter: ["wave"] },
        { en: "The sandcastle is gone. Rocco and the crab build a new one.", de: "Die Sandburg ist weg. Rocco und die Krabbe bauen eine neue.", woerter: ["sandcastle", "crab"] },
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
    // Etappe 2
    spiele: ["What do you want to play?", "Was möchtest du spielen?"],
    jukebox: ["Let's say a rhyme! Which one?", "Wir sagen einen Vers! Welchen?"],
    buecherTitel: ["Books", "Bücher"],
    buch: ["You know this book! Now in English.", "Dieses Buch kennst du! Jetzt auf Englisch."],
    ganzesBuch: ["Listen to the whole book!", "Hör das ganze Buch!"],
    memory: ["Find the pairs! A picture and its word.", "Finde die Paare! Ein Bild und sein Wort."],
    paar: ["A pair!", "Ein Paar!"],
    keinPaar: ["Oops! Try again.", "Hoppla! Versuch es noch einmal."],
    allePaare: ["You found all the pairs! Great job!", "Du hast alle Paare gefunden! Super gemacht!"],
    janein: ["Yes or no? Listen and tap.", "Ja oder nein? Hör zu und tippe."],
    ja: ["Yes!", "Ja!"],
    nein: ["No!", "Nein!"],
    roccosays: ["Rocco says! Listen and tap.", "Rocco sagt! Hör zu und tippe."],
    farbenzug: ["Let's build a color train!", "Wir bauen einen Farben-Zug!"],
    zugFertig: ["What a colorful train! Choo choo!", "Was für ein bunter Zug! Tschu-tschu!"],
    zaehlen: ["Let's count with Rocco!", "Wir zählen mit Rocco!"],
    zaehlenMit: ["Let's count!", "Wir zählen!"],
    fuettern: ["Rocco is hungry! Give him what he wants.", "Rocco hat Hunger! Gib ihm, was er möchte."],
    lecker: ["Yummy! Thank you!", "Mmh, fein! Danke!"],
    neinDanke: ["No, thank you!", "Nein, danke!"],
    satt: ["Now Rocco is full. Thank you!", "Jetzt ist Rocco satt. Danke!"],
    geschafft: ["Great job! You did it!", "Super! Du hast es geschafft!"],
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

  // ===========================================================================
  // Etappe 2: Farben, Zahlen, Spiele, Verse, Bücher
  // ===========================================================================
  // Farben: ein Wort wie die Wörter der Welten (Wörterbuch, Wortstand).
  //   akk  die deutsche Form vor «Ballon» und «Wagen» («den roten Ballon»)
  const FARBEN = [
    ["red", "Red.", "Rot.", "#e63946", "roten"],
    ["blue", "Blue.", "Blau.", "#3a7bd5", "blauen"],
    ["yellow", "Yellow.", "Gelb.", "#ffd23f", "gelben"],
    ["green", "Green.", "Grün.", "#3fbf74", "grünen"],
    ["orange", "Orange.", "Orange.", "#f5a623", "orangen"],
    ["purple", "Purple.", "Violett.", "#8e5cd9", "violetten"],
    ["pink", "Pink.", "Rosa.", "#ef6fa8", "rosa"],
    ["brown", "Brown.", "Braun.", "#8a5a35", "braunen"],
    ["black", "Black.", "Schwarz.", "#2b2f38", "schwarzen"],
    ["white", "White.", "Weiss.", "#ffffff", "weissen"],
  ].map(([id, en, de, hex, akk]) => ({ id, en, de, hex, akk, farbe: true }));
  const ZAHLEN = [
    ["One.", "Eins."], ["Two.", "Zwei."], ["Three.", "Drei."], ["Four.", "Vier."], ["Five.", "Fünf."],
    ["Six.", "Sechs."], ["Seven.", "Sieben."], ["Eight.", "Acht."], ["Nine.", "Neun."], ["Ten.", "Zehn."],
  ].map(([en, de], i) => ({ id: `n${i + 1}`, n: i + 1, en, de, zahl: true }));
  const gross = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  const ohnePunkt = (t) => t.replace(/[.!?]$/, "");
  // Rocco says: «Tap the red balloon!», mit Grösse «Tap the big red balloon!»
  function tippeBallon(f, groesse = null) {
    const en = `Tap the ${groesse ? `${groesse} ` : ""}${f.id} balloon!`;
    const de = `Tippe auf den ${groesse ? `${groesse === "big" ? "grossen" : "kleinen"} ` : ""}${f.akk} Ballon!`;
    return [en, de];
  }
  // Farben-Zug: «A blue wagon, please!»
  const wagenBitte = (f) => [`${/^[aeiou]/.test(f.id) ? "An" : "A"} ${f.id} wagon, please!`, `Einen ${f.akk} Wagen, bitte!`];
  // Count with Rocco: was gezählt wird.
  const ZAEHLDINGE = [
    ["duck", "ducks", "One duck!", "Enten", "Eine Ente!"],
    ["apple", "apples", "One apple!", "Äpfel", "Ein Apfel!"],
    ["fish", "fish", "One fish!", "Fische", "Ein Fisch!"],
    ["bird", "birds", "One bird!", "Vögel", "Ein Vogel!"],
    ["star", "stars", "One star!", "Sterne", "Ein Stern!"],
    ["balloon", "balloons", "One balloon!", "Ballone", "Ein Ballon!"],
    ["cookie", "cookies", "One cookie!", "Guetzli", "Ein Guetzli!"],
    ["shell", "shells", "One shell!", "Muscheln", "Eine Muschel!"],
  ].map(([id, viele, eins, deViele, deEins]) => ({ id, viele, eins, deViele, deEins }));
  const wieViele = (d) => [`How many ${d.viele}?`, `Wie viele ${d.deViele}?`];
  const soViele = (d, n) => (n === 1 ? [d.eins, d.deEins] : [`${ohnePunkt(ZAHLEN[n - 1].en)} ${d.viele}!`, `${ohnePunkt(ZAHLEN[n - 1].de)} ${d.deViele}!`]);
  // Feed Rocco: was er möchte.
  const ESSEN = [
    ["banana", "Rocco wants a banana.", "Rocco möchte eine Banane."],
    ["bread", "Rocco wants bread.", "Rocco möchte Brot."],
    ["milk", "Rocco wants milk.", "Rocco möchte Milch."],
    ["cheese", "Rocco wants cheese.", "Rocco möchte Käse."],
    ["egg", "Rocco wants an egg.", "Rocco möchte ein Ei."],
    ["cake", "Rocco wants a cake.", "Rocco möchte einen Kuchen."],
    ["pancakes", "Rocco wants pancakes.", "Rocco möchte Pfannkuchen."],
    ["cookie", "Rocco wants a cookie.", "Rocco möchte ein Guetzli."],
    ["juice", "Rocco wants juice.", "Rocco möchte Saft."],
    ["apple", "Rocco wants an apple.", "Rocco möchte einen Apfel."],
    ["icecream", "Rocco wants an ice cream.", "Rocco möchte eine Glace."],
  ].map(([id, en, de]) => ({ id, will: [en, de] }));
  // Yes or no?: «Is this a cow?»
  function istDas(w) {
    const mehrere = /^Where are/.test(w.frage);
    const name = ["mom", "dad"].includes(w.id);
    const en = `${mehrere ? "Are these" : "Is this"} ${name ? ohnePunkt(w.en) : ohnePunkt(w.en).charAt(0).toLowerCase() + ohnePunkt(w.en).slice(1)}?`;
    const deWort = ohnePunkt(w.de);
    // Nur der Artikel wird klein («eine Kuh»), das Nomen bleibt gross («Brot»).
    const deKlein = /^(Der|Die|Das|Ein|Eine) /.test(deWort) ? deWort.charAt(0).toLowerCase() + deWort.slice(1) : deWort;
    const de = `${mehrere && /^Wo sind/.test(w.deFrage) ? "Sind" : "Ist"} das ${deKlein}?`;
    return [en, de];
  }
  // Die Spiele in der Spielzeugkiste.
  const SPIELE = [
    { id: "hearfind", titel: ["Hear and find", "Hear and find"] },
    { id: "memory", titel: ["Memory", "Memory"] },
    { id: "janein", titel: ["Yes or no?", "Ja oder nein?"] },
    { id: "roccosays", titel: ["Rocco says", "Rocco sagt"] },
    { id: "farbenzug", titel: ["Color train", "Farben-Zug"] },
    { id: "zaehlen", titel: ["Count with Rocco", "Zählen mit Rocco"] },
    { id: "fuettern", titel: ["Feed Rocco", "Rocco füttern"] },
  ];
  // Die Jukebox: Sprechverse. bild: was zur Zeile gezeichnet wird.
  const z = (en, de, bild = []) => ({ en, de, bild });
  const VERSE = [
    { id: "hello", titel: ["Hello, hello!", "Hallo, hallo!"], zeilen: [
      z("Hello, hello, how are you?", "Hallo, hallo, wie geht es dir?", ["rocco"]),
      z("I'm fine, I'm fine, and how are you?", "Mir geht es gut, und wie geht es dir?", ["rocco"]),
      z("Hello, hello, hello to you!", "Hallo, hallo, hallo du!", ["rocco"]),
      z("Goodbye, goodbye, see you soon!", "Tschüss, tschüss, bis bald!", ["rocco"]),
    ] },
    { id: "colors", titel: ["Colors, colors!", "Farben, Farben!"], zeilen: [
      z("Red, red, the apple is red.", "Rot, rot, der Apfel ist rot.", ["apple"]),
      z("Yellow, yellow, the sun is yellow.", "Gelb, gelb, die Sonne ist gelb.", ["sun"]),
      z("Green, green, the tree is green.", "Grün, grün, der Baum ist grün.", ["tree"]),
      z("Blue, blue, the sea is blue.", "Blau, blau, das Meer ist blau.", ["wave"]),
    ] },
    { id: "count", titel: ["One, two, three!", "Eins, zwei, drei!"], zeilen: [
      z("One, two, three, four, five.", "Eins, zwei, drei, vier, fünf.", ["duck", "duck", "duck", "duck", "duck"]),
      z("Five little ducks can swim and dive.", "Fünf kleine Enten schwimmen und tauchen.", ["duck"]),
      z("Six, seven, eight, nine, ten.", "Sechs, sieben, acht, neun, zehn.", ["star", "star", "star", "star", "star"]),
      z("Let's count them all again!", "Wir zählen alle noch einmal!", ["rocco"]),
    ] },
    { id: "head", titel: ["Head, shoulders, knees and toes", "Kopf, Schultern, Knie und Zehen"], zeilen: [
      z("Head, shoulders, knees and toes, knees and toes.", "Kopf, Schultern, Knie und Zehen, Knie und Zehen.", ["rocco"]),
      z("Head, shoulders, knees and toes, knees and toes.", "Kopf, Schultern, Knie und Zehen, Knie und Zehen.", ["rocco"]),
      z("And eyes and ears and mouth and nose.", "Und Augen und Ohren und Mund und Nase.", ["rocco"]),
      z("Head, shoulders, knees and toes, knees and toes!", "Kopf, Schultern, Knie und Zehen, Knie und Zehen!", ["rocco"]),
    ] },
    { id: "macdonald", titel: ["Old MacDonald had a farm", "Old MacDonald hat einen Bauernhof"], zeilen: [
      z("Old MacDonald had a farm, E-I-E-I-O.", "Old MacDonald hat einen Bauernhof, i-a-i-a-o.", ["barn"]),
      z("And on that farm he had a cow, E-I-E-I-O.", "Und auf dem Hof hat er eine Kuh, i-a-i-a-o.", ["cow"]),
      z("With a moo moo here and a moo moo there.", "Mit einem Muh-muh hier und einem Muh-muh da.", ["cow"]),
      z("Here a moo, there a moo, everywhere a moo moo.", "Hier ein Muh, da ein Muh, überall ein Muh-muh.", ["cow", "cow"]),
      z("Old MacDonald had a farm, E-I-E-I-O!", "Old MacDonald hat einen Bauernhof, i-a-i-a-o!", ["barn"]),
    ] },
  ];
  // Bekannte Bücher aus dem Lesewagen, ganz einfach auf Englisch: ein Satz
  // (oder zwei) je Seite, mit den gemalten Bildern der Leseecke.
  const BUECHER = [
    { id: "hase-rueebli", titel: ["Where is the carrot?", "Wo ist das Rüebli?"], seiten: [
      ["This is Hoppel. Hoppel is a little rabbit. He is hungry.", "Das ist Hoppel. Hoppel ist ein kleiner Hase. Er hat Hunger."],
      ["Hoppel wants a carrot. Where is a carrot?", "Hoppel möchte ein Rüebli. Wo ist ein Rüebli?"],
      ["Is it under the flower? No! A ladybug.", "Ist es unter der Blume? Nein! Ein Marienkäfer."],
      ["Is it behind the bush? No! A snail.", "Ist es hinter dem Busch? Nein! Eine Schnecke."],
      ["Hoppel, come here! Mia has a big carrot!", "Hoppel, komm her! Mia hat ein grosses Rüebli!"],
      ["Mia says: Let's share!", "Mia sagt: Wir teilen!"],
      ["Crunch, crunch! Yummy!", "Knack, knack! Fein!"],
    ] },
    { id: "leo-melone", titel: ["Leo and the melon.", "Leo und die Melone."], seiten: [
      ["This is Leo.", "Das ist Leo."],
      ["Leo likes melons.", "Leo mag Melonen."],
      ["Look! A melon!", "Schau! Eine Melone!"],
      ["Leo rolls the melon.", "Leo rollt die Melone."],
      ["Oh no! The melon rolls and rolls.", "Oh nein! Die Melone rollt und rollt."],
      ["Grandma Rosa says: Stop!", "Oma Rosa ruft: Halt!"],
      ["Leo and Grandma Rosa eat the melon. Yummy!", "Leo und Oma Rosa essen die Melone. Fein!"],
    ] },
    { id: "pino-insel", titel: ["Pino and the island.", "Pino und die Insel."], seiten: [
      ["This is Pino.", "Das ist Pino."],
      ["Pino wants to go to the island.", "Pino will auf die Insel."],
      ["Look! A boat!", "Schau! Ein Boot!"],
      ["Pino is in the boat.", "Pino ist im Boot."],
      ["Toot toot! Let's go!", "Tuut tuut! Los geht es!"],
      ["Whee! The boat rocks.", "Hui! Das Boot schaukelt."],
      ["Pino is on the island.", "Pino ist auf der Insel."],
      ["The island is great!", "Die Insel ist toll!"],
    ] },
    { id: "mia-ball", titel: ["Mia and the ball.", "Mia und der Ball."], seiten: [
      ["This is Mia.", "Das ist Mia."],
      ["Mia has a ball.", "Mia hat einen Ball."],
      ["The ball is red.", "Der Ball ist rot."],
      ["Mia throws the ball up.", "Mia wirft den Ball hoch."],
      ["Oh no! The ball is in the tree.", "Oh nein! Der Ball ist im Baum."],
      ["Ella the owl gets the ball.", "Eule Ella holt den Ball."],
      ["Thank you, Ella! Mia and Ella laugh.", "Danke, Ella! Mia und Ella lachen."],
    ] },
    { id: "bruno-sterne", titel: ["Bruno counts the stars.", "Bruno zählt die Sterne."], seiten: [
      ["This is Bruno, the little bear. It is night.", "Das ist Bruno, der kleine Bär. Es ist Nacht."],
      ["But Bruno is not tired. He looks at the sky.", "Aber Bruno ist nicht müde. Er schaut zum Himmel."],
      ["Look! Stars! One, two, three, four.", "Schau! Sterne! Eins, zwei, drei, vier."],
      ["Ella the owl says: What are you doing, Bruno?", "Eule Ella fragt: Was machst du, Bruno?"],
      ["I am counting the stars!", "Ich zähle die Sterne!"],
      ["Five, six, seven. Now Bruno is tired.", "Fünf, sechs, sieben. Jetzt ist Bruno müde."],
      ["Eight. Bruno is asleep. Good night, Bruno!", "Acht. Bruno schläft. Gute Nacht, Bruno!"],
    ] },
  ];
  Object.assign(HILFE, {
    spiele: "Das ist Roccos Spielzeugkiste. Tippe auf ein Spiel.",
    memory: "Finde die Paare: ein Bild und sein Wort. Eine Karte mit Lautsprecher sagt ein Wort auf Englisch.",
    janein: "Rocco zeigt ein Bild und fragt auf Englisch. Stimmt es, tippe auf den Daumen nach oben, sonst auf den Daumen nach unten.",
    roccosays: "Rocco sagt dir auf Englisch, welchen Ballon du antippen sollst.",
    farbenzug: "Rocco sagt dir auf Englisch, welchen Wagen er möchte. Tippe auf den Wagen in dieser Farbe.",
    zaehlen: "Zähle die Dinge und tippe auf die richtige Zahl. Rocco zählt mit dir auf Englisch.",
    fuettern: "Rocco sagt auf Englisch, was er essen möchte. Tippe darauf.",
    jukebox: "Das ist die Jukebox. Tippe auf einen Vers, und Rocco sagt ihn auf Englisch.",
    vers: "Tippe auf eine Zeile, und Rocco sagt sie. Der grüne Knopf sagt den ganzen Vers.",
    buch: "Dieses Buch kennst du aus dem Lesewagen. Rocco erzählt es auf Englisch. Tippe auf das Bild oder blättere mit den Pfeilen.",
  });
  // Alles, was gesprochen wird, als Paar [Englisch, Deutsch] mit seinem Ort –
  // für die Aufnahmen (scripts/stimme-englisch-texte.mjs) und die Prüfung.
  function paare() {
    const liste = [];
    const dazu = (en, de, wo) => liste.push({ en, de, wo });
    const wort = (x, wo) => { dazu(x.en, x.de, wo); if (x.satz) dazu(x.satz, x.deSatz, wo); if (x.frage) dazu(x.frage, x.deFrage, wo); };
    for (const welt of WELTEN) {
      dazu(welt.titel[0], welt.titel[1], `welt ${welt.id}`);
      dazu(welt.intro[0], welt.intro[1], `welt ${welt.id}`);
      welt.woerter.forEach((x) => { wort(x, `welt ${welt.id}`); const [en, de] = istDas(x); dazu(en, de, `janein ${x.id}`); });
    }
    EXTRA_WOERTER.forEach((x) => wort(x, "geschichten"));
    for (const g of GESCHICHTEN) {
      dazu(g.titel[0], g.titel[1], `geschichte ${g.id}`);
      g.bilder.forEach((b) => dazu(b.en, b.de, `geschichte ${g.id}`));
    }
    Object.entries(SAETZE).forEach(([name, [en, de]]) => dazu(en, de, `SAETZE.${name}`));
    LOB.forEach(([en, de]) => dazu(en, de, "LOB"));
    EINRICHTUNG.forEach((d) => dazu(d.en, d.de, `EINRICHTUNG ${d.id}`));
    FARBEN.forEach((f) => {
      dazu(f.en, f.de, `farbe ${f.id}`);
      [null, "big", "small"].forEach((g) => { const [en, de] = tippeBallon(f, g); dazu(en, de, `roccosays ${f.id}`); });
      const [en, de] = wagenBitte(f);
      dazu(en, de, `farbenzug ${f.id}`);
    });
    ZAHLEN.forEach((n) => dazu(n.en, n.de, `zahl ${n.n}`));
    ZAEHLDINGE.forEach((d) => { dazu(...wieViele(d), `zaehlen ${d.id}`); ZAHLEN.forEach((n) => dazu(...soViele(d, n.n), `zaehlen ${d.id}`)); });
    ESSEN.forEach((e) => dazu(e.will[0], e.will[1], `fuettern ${e.id}`));
    SPIELE.forEach((sp) => dazu(sp.titel[0], sp.titel[1], `spiel ${sp.id}`));
    VERSE.forEach((v) => { dazu(v.titel[0], v.titel[1], `vers ${v.id}`); v.zeilen.forEach((zl) => dazu(zl.en, zl.de, `vers ${v.id}`)); });
    BUECHER.forEach((b) => { dazu(b.titel[0], b.titel[1], `buch ${b.id}`); b.seiten.forEach(([en, de]) => dazu(en, de, `buch ${b.id}`)); });
    return liste;
  }

  window.LernappEnglischInhalt = {
    WELTEN, EXTRA_WOERTER, GESCHICHTEN, SAETZE, LOB, EINRICHTUNG, HILFE,
    FARBEN, ZAHLEN, ZAEHLDINGE, ESSEN, SPIELE, VERSE, BUECHER,
    tippeBallon, wagenBitte, wieViele, soViele, istDas, paare, gross,
  };
})();
