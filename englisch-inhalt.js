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
    // Etappe 3
    {
      id: "city",
      titel: ["The City", "Die Stadt"],
      intro: ["Let's go to the city! Tap a picture.", "Wir gehen in die Stadt! Tippe auf ein Bild."],
      woerter: [
        w("car", "A car.", "The car is fast.", "Where is the car?", "Ein Auto.", "Das Auto ist schnell.", "Wo ist das Auto?"),
        w("bus", "A bus.", "We go by bus.", "Where is the bus?", "Ein Bus.", "Wir fahren mit dem Bus.", "Wo ist der Bus?"),
        w("schoolbus", "A school bus.", "The school bus is yellow.", "Where is the school bus?", "Ein Schulbus.", "Der Schulbus ist gelb.", "Wo ist der Schulbus?"),
        w("train", "A train.", "Choo choo! Here comes the train.", "Where is the train?", "Ein Zug.", "Tschu-tschu! Da kommt der Zug.", "Wo ist der Zug?"),
        w("truck", "A truck.", "The truck is big.", "Where is the truck?", "Ein Lastwagen.", "Der Lastwagen ist gross.", "Wo ist der Lastwagen?"),
        w("plane", "A plane.", "The plane is in the sky.", "Where is the plane?", "Ein Flugzeug.", "Das Flugzeug ist am Himmel.", "Wo ist das Flugzeug?"),
        w("firetruck", "A fire truck.", "The fire truck is red.", "Where is the fire truck?", "Ein Feuerwehrauto.", "Das Feuerwehrauto ist rot.", "Wo ist das Feuerwehrauto?"),
        w("taxi", "A taxi.", "Taxi! Stop, please!", "Where is the taxi?", "Ein Taxi.", "Taxi! Halt, bitte!", "Wo ist das Taxi?"),
        w("trafficlight", "A traffic light.", "Green means go!", "Where is the traffic light?", "Eine Ampel.", "Grün heisst: los!", "Wo ist die Ampel?"),
        w("helicopter", "A helicopter.", "The helicopter can fly.", "Where is the helicopter?", "Ein Helikopter.", "Der Helikopter kann fliegen.", "Wo ist der Helikopter?"),
        w("policecar", "A police car.", "Wee-woo! Here comes the police car.", "Where is the police car?", "Ein Polizeiauto.", "Tatü-tata! Da kommt das Polizeiauto.", "Wo ist das Polizeiauto?"),
        w("ambulance", "An ambulance.", "The ambulance helps.", "Where is the ambulance?", "Ein Krankenwagen.", "Der Krankenwagen hilft.", "Wo ist der Krankenwagen?"),
        w("motorbike", "A motorbike.", "Vroom! The motorbike is loud.", "Where is the motorbike?", "Ein Motorrad.", "Brumm! Das Motorrad ist laut.", "Wo ist das Motorrad?"),
      ],
    },
    {
      id: "school",
      titel: ["School", "Die Schule"],
      intro: ["Let's go to school! Tap a picture.", "Wir gehen in die Schule! Tippe auf ein Bild."],
      woerter: [
        w("pencil", "A pencil.", "I write with a pencil.", "Where is the pencil?", "Ein Bleistift.", "Ich schreibe mit einem Bleistift.", "Wo ist der Bleistift?"),
        w("crayon", "A crayon.", "I draw with a crayon.", "Where is the crayon?", "Ein Farbstift.", "Ich male mit einem Farbstift.", "Wo ist der Farbstift?"),
        w("book", "A book.", "Open your book, please.", "Where is the book?", "Ein Buch.", "Mach bitte dein Buch auf.", "Wo ist das Buch?"),
        w("backpack", "A backpack.", "My backpack is heavy.", "Where is the backpack?", "Ein Rucksack.", "Mein Rucksack ist schwer.", "Wo ist der Rucksack?"),
        w("scissors", "Scissors.", "Cut the paper with the scissors.", "Where are the scissors?", "Eine Schere.", "Schneide das Papier mit der Schere.", "Wo ist die Schere?"),
        w("glue", "Glue.", "Glue is sticky.", "Where is the glue?", "Leim.", "Leim ist klebrig.", "Wo ist der Leim?"),
        w("paper", "Paper.", "A piece of paper.", "Where is the paper?", "Papier.", "Ein Blatt Papier.", "Wo ist das Papier?"),
        w("teacher", "A teacher.", "Good morning, teacher!", "Where is the teacher?", "Eine Lehrerin.", "Guten Morgen, Frau Lehrerin!", "Wo ist die Lehrerin?"),
        w("board", "A board.", "Look at the board, please.", "Where is the board?", "Eine Wandtafel.", "Schau bitte an die Wandtafel.", "Wo ist die Wandtafel?"),
        w("desk", "A desk.", "Sit down at your desk, please.", "Where is the desk?", "Ein Pult.", "Setz dich bitte an dein Pult.", "Wo ist das Pult?"),
        w("ruler", "A ruler.", "The ruler is long.", "Where is the ruler?", "Ein Lineal.", "Das Lineal ist lang.", "Wo ist das Lineal?"),
        w("eraser", "An eraser.", "Oops! I need an eraser.", "Where is the eraser?", "Ein Radiergummi.", "Hoppla! Ich brauche einen Radiergummi.", "Wo ist der Radiergummi?"),
        w("paintbrush", "A paintbrush.", "I paint with a paintbrush.", "Where is the paintbrush?", "Ein Pinsel.", "Ich male mit einem Pinsel.", "Wo ist der Pinsel?"),
      ],
    },
    {
      id: "party",
      titel: ["Party Time", "Fest"],
      intro: ["It's party time! Tap a picture.", "Jetzt wird gefeiert! Tippe auf ein Bild."],
      woerter: [
        w("candle", "A candle.", "Blow out the candle!", "Where is the candle?", "Eine Kerze.", "Blas die Kerze aus!", "Wo ist die Kerze?"),
        w("present", "A present.", "A present for you!", "Where is the present?", "Ein Geschenk.", "Ein Geschenk für dich!", "Wo ist das Geschenk?"),
        w("balloon", "A balloon.", "Pop! Oh no, the balloon!", "Where is the balloon?", "Ein Ballon.", "Peng! Oh nein, der Ballon!", "Wo ist der Ballon?"),
        w("partyhat", "A party hat.", "Put on your party hat!", "Where is the party hat?", "Ein Partyhut.", "Setz deinen Partyhut auf!", "Wo ist der Partyhut?"),
        w("cupcake", "A cupcake.", "The cupcake is sweet.", "Where is the cupcake?", "Ein Muffin.", "Der Muffin ist süss.", "Wo ist der Muffin?"),
        w("pizza", "Pizza.", "I like pizza!", "Where is the pizza?", "Pizza.", "Ich mag Pizza!", "Wo ist die Pizza?"),
        w("lemonade", "Lemonade.", "The lemonade is cold.", "Where is the lemonade?", "Limonade.", "Die Limonade ist kalt.", "Wo ist die Limonade?"),
        w("popcorn", "Popcorn.", "Popcorn! Pop, pop, pop!", "Where is the popcorn?", "Popcorn.", "Popcorn! Plopp, plopp, plopp!", "Wo ist das Popcorn?"),
        w("pinata", "A piñata.", "Look at the piñata!", "Where is the piñata?", "Eine Piñata.", "Schau die Piñata an!", "Wo ist die Piñata?"),
        w("confetti", "Confetti.", "Confetti everywhere!", "Where is the confetti?", "Konfetti.", "Überall Konfetti!", "Wo ist das Konfetti?"),
        w("card", "A card.", "A birthday card for you.", "Where is the card?", "Eine Karte.", "Eine Geburtstagskarte für dich.", "Wo ist die Karte?"),
        w("clown", "A clown.", "The clown is funny.", "Where is the clown?", "Ein Clown.", "Der Clown ist lustig.", "Wo ist der Clown?"),
        w("lollipop", "A lollipop.", "The lollipop is sweet.", "Where is the lollipop?", "Ein Lolli.", "Der Lolli ist süss.", "Wo ist der Lolli?"),
      ],
    },
    // Etappe 4
    {
      id: "body",
      titel: ["My Body", "Mein Körper"],
      intro: ["This is me! Tap a picture.", "Das bin ich! Tippe auf ein Bild."],
      woerter: [
        w("head", "A head.", "Nod your head!", "Where is the head?", "Ein Kopf.", "Nick mit dem Kopf!", "Wo ist der Kopf?"),
        w("eyes", "Eyes.", "I have two eyes.", "Where are the eyes?", "Augen.", "Ich habe zwei Augen.", "Wo sind die Augen?"),
        w("ears", "Ears.", "I hear with my ears.", "Where are the ears?", "Ohren.", "Ich höre mit meinen Ohren.", "Wo sind die Ohren?"),
        w("nose", "A nose.", "Touch your nose!", "Where is the nose?", "Eine Nase.", "Fass deine Nase an!", "Wo ist die Nase?"),
        w("mouth", "A mouth.", "Open your mouth!", "Where is the mouth?", "Ein Mund.", "Mach den Mund auf!", "Wo ist der Mund?"),
        w("hair", "Hair.", "My hair is long.", "Where is the hair?", "Haare.", "Meine Haare sind lang.", "Wo sind die Haare?"),
        w("teeth", "Teeth.", "Brush your teeth!", "Where are the teeth?", "Zähne.", "Putz dir die Zähne!", "Wo sind die Zähne?"),
        w("arms", "Arms.", "Wave your arms!", "Where are the arms?", "Arme.", "Wink mit den Armen!", "Wo sind die Arme?"),
        w("hands", "Hands.", "Clap your hands!", "Where are the hands?", "Hände.", "Klatsch in die Hände!", "Wo sind die Hände?"),
        w("fingers", "Fingers.", "I have ten fingers.", "Where are the fingers?", "Finger.", "Ich habe zehn Finger.", "Wo sind die Finger?"),
        w("tummy", "A tummy.", "My tummy is full.", "Where is the tummy?", "Ein Bauch.", "Mein Bauch ist voll.", "Wo ist der Bauch?"),
        w("legs", "Legs.", "Shake your legs!", "Where are the legs?", "Beine.", "Schüttle deine Beine!", "Wo sind die Beine?"),
        w("feet", "Feet.", "Stamp your feet!", "Where are the feet?", "Füsse.", "Stampf mit den Füssen!", "Wo sind die Füsse?"),
      ],
    },
    {
      id: "clothes",
      titel: ["Clothes and Weather", "Kleider und Wetter"],
      reiter: "Clothes",
      intro: ["What's the weather like? Tap a picture.", "Wie ist das Wetter? Tippe auf ein Bild."],
      woerter: [
        w("coat", "A coat.", "Put on your coat! It's raining.", "Where is the coat?", "Eine Jacke.", "Zieh deine Jacke an! Es regnet.", "Wo ist die Jacke?"),
        w("scarf", "A scarf.", "The scarf is warm.", "Where is the scarf?", "Ein Schal.", "Der Schal ist warm.", "Wo ist der Schal?"),
        w("boots", "Boots.", "Big boots!", "Where are the boots?", "Stiefel.", "Grosse Stiefel!", "Wo sind die Stiefel?"),
        w("tshirt", "A T-shirt.", "It's hot. I wear a T-shirt.", "Where is the T-shirt?", "Ein T-Shirt.", "Es ist heiss. Ich trage ein T-Shirt.", "Wo ist das T-Shirt?"),
        w("pants", "Pants.", "Put on your pants!", "Where are the pants?", "Eine Hose.", "Zieh deine Hose an!", "Wo ist die Hose?"),
        w("sneakers", "Sneakers.", "I run in my sneakers.", "Where are the sneakers?", "Turnschuhe.", "Ich renne in meinen Turnschuhen.", "Wo sind die Turnschuhe?"),
        w("dress", "A dress.", "A pretty dress!", "Where is the dress?", "Ein Kleid.", "Ein schönes Kleid!", "Wo ist das Kleid?"),
        w("socks", "Socks.", "Warm socks for my feet.", "Where are the socks?", "Socken.", "Warme Socken für meine Füsse.", "Wo sind die Socken?"),
        w("gloves", "Gloves.", "Gloves for cold hands.", "Where are the gloves?", "Handschuhe.", "Handschuhe für kalte Hände.", "Wo sind die Handschuhe?"),
        w("sweater", "A sweater.", "The sweater is warm.", "Where is the sweater?", "Ein Pullover.", "Der Pullover ist warm.", "Wo ist der Pullover?"),
        w("rain", "Rain.", "It's raining. Drip, drop!", "Where is the rain?", "Regen.", "Es regnet. Tropf, tropf!", "Wo ist der Regen?"),
        w("cloud", "A cloud.", "The cloud is gray.", "Where is the cloud?", "Eine Wolke.", "Die Wolke ist grau.", "Wo ist die Wolke?"),
        w("rainbow", "A rainbow.", "Look! A rainbow!", "Where is the rainbow?", "Ein Regenbogen.", "Schau! Ein Regenbogen!", "Wo ist der Regenbogen?"),
      ],
    },
    {
      id: "holidays",
      titel: ["Holidays", "Feiertage"],
      intro: ["Let's celebrate! Tap a picture.", "Wir feiern! Tippe auf ein Bild."],
      woerter: [
        w("pumpkin", "A pumpkin.", "A pumpkin for Halloween!", "Where is the pumpkin?", "Ein Kürbis.", "Ein Kürbis für Halloween!", "Wo ist der Kürbis?"),
        w("ghost", "A ghost.", "Boo! A friendly ghost.", "Where is the ghost?", "Ein Gespenst.", "Buh! Ein freundliches Gespenst.", "Wo ist das Gespenst?"),
        w("bat", "A bat.", "The bat can fly at night.", "Where is the bat?", "Eine Fledermaus.", "Die Fledermaus kann in der Nacht fliegen.", "Wo ist die Fledermaus?"),
        w("candy", "Candy.", "Trick or treat! Candy, please!", "Where is the candy?", "Süssigkeiten.", "Süsses oder Saures! Süssigkeiten, bitte!", "Wo sind die Süssigkeiten?"),
        w("turkey", "A turkey.", "Gobble, gobble! A turkey for Thanksgiving.", "Where is the turkey?", "Ein Truthahn.", "Glu, glu! Ein Truthahn für Thanksgiving.", "Wo ist der Truthahn?"),
        w("pie", "A pie.", "Pumpkin pie! Yummy!", "Where is the pie?", "Eine Wähe.", "Kürbiswähe! Fein!", "Wo ist die Wähe?"),
        w("christmastree", "A Christmas tree.", "Merry Christmas!", "Where is the Christmas tree?", "Ein Weihnachtsbaum.", "Frohe Weihnachten!", "Wo ist der Weihnachtsbaum?"),
        w("snowman", "A snowman.", "The snowman is cold.", "Where is the snowman?", "Ein Schneemann.", "Der Schneemann ist kalt.", "Wo ist der Schneemann?"),
        w("stocking", "A stocking.", "A stocking for Christmas.", "Where is the stocking?", "Ein Weihnachtsstrumpf.", "Ein Strumpf für Weihnachten.", "Wo ist der Weihnachtsstrumpf?"),
        w("candycane", "A candy cane.", "The candy cane is red and white.", "Where is the candy cane?", "Eine Zuckerstange.", "Die Zuckerstange ist rot und weiss.", "Wo ist die Zuckerstange?"),
        w("reindeer", "A reindeer.", "The reindeer can fly!", "Where is the reindeer?", "Ein Rentier.", "Das Rentier kann fliegen!", "Wo ist das Rentier?"),
        w("fireworks", "Fireworks.", "Boom! Fireworks for the Fourth of July.", "Where are the fireworks?", "Ein Feuerwerk.", "Bumm! Feuerwerk zum vierten Juli.", "Wo ist das Feuerwerk?"),
        w("easteregg", "An Easter egg.", "Find the Easter egg!", "Where is the Easter egg?", "Ein Osterei.", "Such das Osterei!", "Wo ist das Osterei?"),
      ],
    },
  ];

  // Wörter, die nur in den Geschichten vorkommen (das Kind kann sie im Bild
  // antippen, sie kommen ins Wörterbuch).
  const EXTRA_WOERTER = [
    w("raccoon", "A raccoon.", "Rocco is a raccoon.", "Where is the raccoon?", "Ein Waschbär.", "Rocco ist ein Waschbär.", "Wo ist der Waschbär?"),
    w("box", "A box.", "The box is open.", "Where is the box?", "Eine Kiste.", "Die Kiste ist offen.", "Wo ist die Kiste?"),
    // Etappe 3: Roccos Kleider («Dress up»)
    // (scarf und boots wohnen seit Etappe 4 in «Clothes and Weather».)
    w("bowtie", "A bow tie.", "A bow tie for the party!", "Where is the bow tie?", "Eine Fliege.", "Eine Fliege fürs Fest!", "Wo ist die Fliege?"),
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
    // Etappe 3
    {
      id: "schoolbus",
      welt: "city",
      titel: ["The yellow school bus.", "Der gelbe Schulbus."],
      bilder: [
        { en: "Rocco waits for the school bus.", de: "Rocco wartet auf den Schulbus.", woerter: ["raccoon"] },
        { en: "Here comes the bus! It is yellow.", de: "Da kommt der Bus! Er ist gelb.", woerter: ["schoolbus"] },
        { en: "Stop! The traffic light is red.", de: "Halt! Die Ampel ist rot.", woerter: ["trafficlight", "schoolbus"] },
        { en: "Go! The light is green. Bye-bye!", de: "Los! Die Ampel ist grün. Tschüss!", woerter: ["trafficlight", "schoolbus"] },
      ],
    },
    {
      id: "school",
      welt: "school",
      titel: ["Rocco goes to school.", "Rocco geht in die Schule."],
      bilder: [
        { en: "Rocco has a new backpack.", de: "Rocco hat einen neuen Rucksack.", woerter: ["raccoon", "backpack"] },
        { en: "Hello, teacher! Hello, Rocco!", de: "Hallo, Frau Lehrerin! Hallo, Rocco!", woerter: ["teacher", "raccoon"] },
        { en: "Rocco draws with a crayon.", de: "Rocco malt mit einem Farbstift.", woerter: ["crayon", "paper"] },
        { en: "Look! A picture of Rocco! Great job!", de: "Schau! Ein Bild von Rocco! Super gemacht!", woerter: ["paper", "teacher"] },
      ],
    },
    {
      id: "birthday",
      welt: "party",
      titel: ["Happy birthday, Rocco!", "Alles Gute zum Geburtstag, Rocco!"],
      bilder: [
        { en: "It is Rocco's birthday. He has a party hat.", de: "Rocco hat Geburtstag. Er hat einen Partyhut.", woerter: ["raccoon", "partyhat"] },
        { en: "Here is a present! Thank you!", de: "Hier ist ein Geschenk! Danke!", woerter: ["present"] },
        { en: "A cake with five candles.", de: "Ein Kuchen mit fünf Kerzen.", woerter: ["cake", "candle"] },
        { en: "Make a wish! Happy birthday, Rocco!", de: "Wünsch dir etwas! Alles Gute zum Geburtstag, Rocco!", woerter: ["raccoon", "balloon", "confetti"] },
      ],
    },
    // Etappe 4
    {
      id: "washup",
      welt: "body",
      titel: ["Good night, Rocco!", "Gute Nacht, Rocco!"],
      bilder: [
        { en: "Rocco washes his hands.", de: "Rocco wäscht seine Hände.", woerter: ["raccoon", "hands"] },
        { en: "He brushes his teeth. Brush, brush!", de: "Er putzt seine Zähne. Schrubb, schrubb!", woerter: ["teeth"] },
        { en: "He combs his hair.", de: "Er kämmt seine Haare.", woerter: ["hair"] },
        { en: "Now Rocco is in bed. Good night!", de: "Jetzt ist Rocco im Bett. Gute Nacht!", woerter: ["raccoon"] },
      ],
    },
    {
      id: "rain",
      welt: "clothes",
      titel: ["Rain, rain!", "Regen, Regen!"],
      bilder: [
        { en: "It is sunny. Rocco has a T-shirt.", de: "Es ist sonnig. Rocco hat ein T-Shirt.", woerter: ["raccoon", "tshirt"] },
        { en: "Oh no! A big cloud. Rain!", de: "Oh nein! Eine grosse Wolke. Regen!", woerter: ["cloud", "rain"] },
        { en: "Rocco puts on his coat and boots.", de: "Rocco zieht seine Jacke und die Stiefel an.", woerter: ["coat", "boots"] },
        { en: "Look! A rainbow!", de: "Schau! Ein Regenbogen!", woerter: ["rainbow"] },
      ],
    },
    {
      id: "halloween",
      welt: "holidays",
      titel: ["Trick or treat!", "Süsses oder Saures!"],
      bilder: [
        { en: "It is Halloween. Rocco has a big pumpkin.", de: "Es ist Halloween. Rocco hat einen grossen Kürbis.", woerter: ["raccoon", "pumpkin"] },
        { en: "Boo! A ghost!", de: "Buh! Ein Gespenst!", woerter: ["ghost"] },
        { en: "It is cousin Ruby! Hello, Ruby!", de: "Es ist Cousine Ruby! Hallo, Ruby!", woerter: ["raccoon"] },
        { en: "Trick or treat! Candy for everyone!", de: "Süsses oder Saures! Süssigkeiten für alle!", woerter: ["candy", "bat"] },
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
    // Etappe 3
    schauGut: ["Look at the picture! Remember everything.", "Schau dir das Bild gut an! Merk dir alles."],
    augenZu: ["Close your eyes!", "Augen zu!"],
    wasFehlt: ["What's missing?", "Was fehlt?"],
    anziehen: ["Let's dress up Rocco!", "Wir ziehen Rocco an!"],
    schick: ["Rocco looks great! Thank you!", "Rocco sieht toll aus! Danke!"],
    ordnen: ["Put the story in order! What comes first?", "Bring die Geschichte in die richtige Reihenfolge! Was kommt zuerst?"],
    wasDann: ["What comes next?", "Was kommt als Nächstes?"],
    diner: ["Welcome to Rocco's diner! Who is hungry?", "Willkommen in Roccos Diner! Wer hat Hunger?"],
    danke: ["Thank you!", "Danke!"],
    gernGeschehen: ["You're welcome!", "Gern geschehen!"],
    dinerZu: ["The diner is closed. See you tomorrow!", "Das Diner ist zu. Bis morgen!"],
    echo: ["Listen and say it! Then tap the microphone.", "Hör zu und sag es nach! Dann tippe auf das Mikrofon."],
    echoHoer: ["Listen to you!", "Hör dich an!"],
    mikrofonAus: ["The microphone is off. Just say it out loud!", "Das Mikrofon ist aus. Sag es einfach laut!"],
    post: ["Look! A postcard from cousin Ruby!", "Schau! Eine Postkarte von Cousine Ruby!"],
    keinePost: ["No new mail today. Play a little, and Ruby writes again!", "Heute keine neue Post. Spiel ein bisschen, dann schreibt Ruby wieder!"],
    telefonWahl: ["Ring, ring! Do you want to talk to Rocco?", "Ring, ring! Möchtest du mit Rocco reden?"],
    jetztDu: ["Now you say it!", "Jetzt sag du es!"],
    // Etappe 4
    monster: ["Let's make a monster! Listen to Rocco.", "Wir bauen ein Monster! Hör Rocco gut zu."],
    monsterFertig: ["Hello, monster! What a great monster!", "Hallo, Monster! Was für ein tolles Monster!"],
    wokatze: ["Where is the cat? Listen and tap the picture.", "Wo ist die Katze? Hör zu und tippe auf das Bild."],
    gegenteile: ["Opposites! Listen and tap.", "Gegenteile! Hör zu und tippe."],
    wortbild: ["Find the pairs! A picture and its word.", "Finde die Paare! Ein Bild und sein Wort."],
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
    const de = `${/^Wo sind/.test(w.deFrage) ? "Sind" : "Ist"} das ${deKlein}?`;
    return [en, de];
  }
  // Die Spiele in der Spielzeugkiste.
  // gruppe: in welcher Reihe der Spielzeugkiste (SPIEL_GRUPPEN)
  const SPIELE = [
    { id: "hearfind", gruppe: "woerter", titel: ["Hear and find", "Hear and find"] },
    { id: "memory", gruppe: "woerter", titel: ["Memory", "Memory"] },
    { id: "janein", gruppe: "woerter", titel: ["Yes or no?", "Ja oder nein?"] },
    { id: "roccosays", gruppe: "farben", titel: ["Rocco says", "Rocco sagt"] },
    { id: "farbenzug", gruppe: "farben", titel: ["Color train", "Farben-Zug"] },
    { id: "zaehlen", gruppe: "farben", titel: ["Count with Rocco", "Zählen mit Rocco"] },
    { id: "fuettern", gruppe: "rocco", titel: ["Feed Rocco", "Rocco füttern"] },
    // Etappe 3
    { id: "whatsmissing", gruppe: "woerter", titel: ["What's missing?", "Was fehlt?"] },
    { id: "dressup", gruppe: "rocco", titel: ["Dress up", "Anziehen"] },
    { id: "geschichtenzug", gruppe: "rocco", titel: ["Story train", "Geschichtenzug"] },
    { id: "diner", gruppe: "rocco", titel: ["Rocco's diner", "Roccos Diner"] },
    // Etappe 4
    { id: "monster", gruppe: "farben", titel: ["Make a monster", "Ein Monster bauen"] },
    { id: "wokatze", gruppe: "rocco", titel: ["Where is the cat?", "Wo ist die Katze?"] },
    { id: "gegenteile", gruppe: "woerter", titel: ["Opposites", "Gegenteile"] },
    { id: "wortbild", gruppe: "woerter", titel: ["Word memory", "Wortbild-Memory"] },
  ];
  const SPIEL_GRUPPEN = [
    { id: "woerter", titel: ["Words", "Wörter"] },
    { id: "farben", titel: ["Colors and numbers", "Farben und Zahlen"] },
    { id: "rocco", titel: ["Play with Rocco", "Spielen mit Rocco"] },
  ];
  // Make a monster: was Rocco möchte. [Teil, Anzahl, Englisch, Deutsch]
  const ZAHLWORT = ["", "one", "two", "three", "four", "five"];
  const DE_ZAHL = ["", "ein", "zwei", "drei", "vier", "fünf"];
  const MONSTER_TEILE = [
    ...[1, 2, 3, 4, 5].map((n) => ({ teil: "augen", n, satz: [`Give the monster ${ZAHLWORT[n]} ${n === 1 ? "eye" : "eyes"}!`, `Gib dem Monster ${DE_ZAHL[n]} ${n === 1 ? "Auge" : "Augen"}!`] })),
    ...[1, 2, 3, 4].map((n) => ({ teil: "arme", n, satz: [`Give the monster ${ZAHLWORT[n]} ${n === 1 ? "arm" : "arms"}!`, `Gib dem Monster ${n === 1 ? "einen" : DE_ZAHL[n]} ${n === 1 ? "Arm" : "Arme"}!`] })),
    ...[1, 2, 3, 4].map((n) => ({ teil: "beine", n, satz: [`Give the monster ${ZAHLWORT[n]} ${n === 1 ? "leg" : "legs"}!`, `Gib dem Monster ${DE_ZAHL[n]} ${n === 1 ? "Bein" : "Beine"}!`] })),
  ];
  const monsterFarbe = (f) => [`Make the monster ${f.id}!`, `Mach das Monster ${f.de.replace(/\.$/, "").toLowerCase()}!`];
  // Where is the cat?: [wo, Ding, Englisch, Deutsch]
  const WO_KATZE = [
    ["in", "box", "The cat is in the box.", "Die Katze ist in der Kiste."],
    ["on", "box", "The cat is on the box.", "Die Katze ist auf der Kiste."],
    ["behind", "box", "The cat is behind the box.", "Die Katze ist hinter der Kiste."],
    ["next", "box", "The cat is next to the box.", "Die Katze ist neben der Kiste."],
    ["in", "bed", "The cat is in the bed.", "Die Katze ist im Bett."],
    ["on", "bed", "The cat is on the bed.", "Die Katze ist auf dem Bett."],
    ["under", "bed", "The cat is under the bed.", "Die Katze ist unter dem Bett."],
    ["next", "bed", "The cat is next to the bed.", "Die Katze ist neben dem Bett."],
    ["on", "table", "The cat is on the table.", "Die Katze ist auf dem Tisch."],
    ["under", "table", "The cat is under the table.", "Die Katze ist unter dem Tisch."],
    ["behind", "table", "The cat is behind the table.", "Die Katze ist hinter dem Tisch."],
    ["next", "table", "The cat is next to the table.", "Die Katze ist neben dem Tisch."],
    ["on", "chair", "The cat is on the chair.", "Die Katze ist auf dem Stuhl."],
    ["under", "chair", "The cat is under the chair.", "Die Katze ist unter dem Stuhl."],
    ["next", "chair", "The cat is next to the chair.", "Die Katze ist neben dem Stuhl."],
    ["in", "basket", "The cat is in the basket.", "Die Katze ist im Korb."],
    ["behind", "basket", "The cat is behind the basket.", "Die Katze ist hinter dem Korb."],
    ["next", "basket", "The cat is next to the basket.", "Die Katze ist neben dem Korb."],
  ].map(([wo, ding, en, de]) => ({ wo, ding, satz: [en, de] }));
  // Opposites: Paare, je mit Frage und Antwort.
  const GEGENTEILE = [
    ["big", "small", "Big", "Small", "Gross", "Klein"],
    ["hot", "cold", "Hot", "Cold", "Heiss", "Kalt"],
    ["happy", "sad", "Happy", "Sad", "Fröhlich", "Traurig"],
    ["full", "empty", "Full", "Empty", "Voll", "Leer"],
    ["open", "closed", "Open", "Closed", "Offen", "Zu"],
    ["fast", "slow", "Fast", "Slow", "Schnell", "Langsam"],
    ["day", "night", "Day", "Night", "Tag", "Nacht"],
    ["tall", "short", "Tall", "Short", "Hoch", "Niedrig"],
  ].map(([a, b, aEn, bEn, aDe, bDe]) => ({ paar: [a, b], en: [aEn, bEn], de: [aDe, bDe] }));
  // «Which one is big?» – und die Antwort «Yes! Big! And this one is small.»
  function gegenteilFrage(g, i) {
    const k = (t) => t.toLowerCase();
    const zeit = g.paar[0] === "day";
    const en = zeit ? `Where is the ${k(g.en[i])}?` : `Which one is ${k(g.en[i])}?`;
    const de = zeit ? `Wo ist ${g.de[i] === "Tag" ? "der Tag" : "die Nacht"}?` : `Welches ist ${k(g.de[i])}?`;
    return [en, de];
  }
  function gegenteilAntwort(g, i) {
    const j = 1 - i;
    const k = (t) => t.toLowerCase();
    const zeit = g.paar[0] === "day";
    const en = zeit ? `Yes! ${g.en[i]}! And this is ${k(g.en[j])}.` : `Yes! ${g.en[i]}! And this one is ${k(g.en[j])}.`;
    const de = zeit ? `Ja! ${g.de[i]}! Und das ist ${g.de[j] === "Tag" ? "der Tag" : "die Nacht"}.` : `Ja! ${g.de[i]}! Und das ist ${k(g.de[j])}.`;
    return [en, de];
  }
  // Für die Eltern (Elternkarte): kleine Aufträge für zuhause, je Welt.
  const AUFTRAEGE = {
    farm: "Beim Spazieren: Wer zuerst ein Tier sieht, sagt es auf Englisch («A cow!», «A dog!»).",
    house: "Beim Aufräumen: «Where is the teddy bear?» – und das Kind zeigt darauf.",
    kitchen: "Beim Znacht: «Can I have the milk, please?» – «Here you are!» – «Thank you!»",
    park: "Auf dem Spielplatz: «My turn!» und «Your turn!» beim Rutschen.",
    zoo: "Ein Tier nachmachen und raten: «Are you a monkey?» – «Yes!»",
    beach: "In der Badi oder Badewanne: «Splash!» und «It's hot!»",
    city: "Unterwegs Autos zählen: «One red car, two red cars …»",
    school: "Beim Zeichnen: «Can I have the red crayon, please?»",
    party: "Am nächsten Geburtstag zusammen «Happy birthday!» singen.",
    body: "Vor dem Zähneputzen: «Brush your teeth!» – «Touch your nose!»",
    clothes: "Beim Anziehen: «Put on your coat!» – und aus dem Fenster: «It's raining!» oder «It's sunny!»",
    holidays: "Beim nächsten Fest auf Englisch wünschen: «Merry Christmas!» oder «Happy Easter!»",
  };

  // Am Telefon im Wagen: anrufen oder Echo.
  const TELEFON_SPIELE = [
    { id: "telefon", titel: ["Call Rocco", "Rocco anrufen"] },
    { id: "echo", titel: ["Echo", "Echo"] },
  ];
  // Dress up: was Rocco anzieht. [Wort, Auftrag Englisch, Auftrag Deutsch]
  const KLEIDER = [
    ["hat", "Put on the hat!", "Setz den Hut auf!"],
    ["sunglasses", "Put on the sunglasses!", "Setz die Sonnenbrille auf!"],
    ["partyhat", "Put on the party hat!", "Setz den Partyhut auf!"],
    ["scarf", "Put on the scarf!", "Leg den Schal um!"],
    ["boots", "Put on the boots!", "Zieh die Stiefel an!"],
    ["bowtie", "Put on the bow tie!", "Binde die Fliege um!"],
  ].map(([id, en, de]) => ({ id, anziehen: [en, de] }));
  // Das Hello-Telefon: Rocco ruft an, das Kind antwortet mit Bildknöpfen.
  // Jede Antwort sagt die Stimme vor (so klingt es auf Englisch), dann
  // antwortet Rocco.
  const a = (id, en, de, antwort = null) => ({ id, satz: [en, de], antwort });
  const TELEFON = [
    { frage: ["Ring, ring! Hello! This is Rocco. How are you?", "Ring, ring! Hallo! Hier ist Rocco. Wie geht es dir?"], art: "gefuehl", antworten: [
      a("froh", "I'm fine, thank you!", "Mir geht es gut, danke!", ["Great! I'm fine too.", "Super! Mir geht es auch gut."]),
      a("muede", "I'm tired.", "Ich bin müde.", ["Oh! Time for a nap!", "Oh! Zeit für ein Schläfchen!"]),
      a("traurig", "I'm sad.", "Ich bin traurig.", ["Oh no! Here is a big hug!", "Oh nein! Hier ist eine grosse Umarmung!"]),
    ] },
    { frage: ["How old are you?", "Wie alt bist du?"], art: "zahl", antworten: [3, 4, 5, 6, 7, 8].map((n) => a(`n${n}`, `I'm ${["three", "four", "five", "six", "seven", "eight"][n - 3]}.`, `Ich bin ${["drei", "vier", "fünf", "sechs", "sieben", "acht"][n - 3]}.`, ["Wow! That's great!", "Wow! Das ist toll!"])) },
    { frage: ["What's your favorite color?", "Was ist deine Lieblingsfarbe?"], art: "farbe", antworten: ["red", "blue", "yellow", "green", "pink", "purple"].map((f) => {
      const de = { red: "Rot", blue: "Blau", yellow: "Gelb", green: "Grün", pink: "Rosa", purple: "Violett" }[f];
      return a(f, `My favorite color is ${f}.`, `Meine Lieblingsfarbe ist ${de}.`, ["Me too! I like it too.", "Ich auch! Die mag ich auch."]);
    }) },
    { frage: ["What's your favorite animal?", "Was ist dein Lieblingstier?"], art: "tier", antworten: [
      a("dog", "My favorite animal is the dog.", "Mein Lieblingstier ist der Hund.", ["Woof! I like dogs too.", "Wau! Hunde mag ich auch."]),
      a("cat", "My favorite animal is the cat.", "Mein Lieblingstier ist die Katze.", ["Meow! I like cats too.", "Miau! Katzen mag ich auch."]),
      a("lion", "My favorite animal is the lion.", "Mein Lieblingstier ist der Löwe.", ["Roar! I like lions too.", "Roar! Löwen mag ich auch."]),
      a("elephant", "My favorite animal is the elephant.", "Mein Lieblingstier ist der Elefant.", ["Wow! I like elephants too.", "Wow! Elefanten mag ich auch."]),
      a("penguin", "My favorite animal is the penguin.", "Mein Lieblingstier ist der Pinguin.", ["Cool! I like penguins too.", "Cool! Pinguine mag ich auch."]),
      a("raccoon", "My favorite animal is the raccoon.", "Mein Lieblingstier ist der Waschbär.", ["Me? Thank you! I like you too!", "Ich? Danke! Ich mag dich auch!"]),
    ] },
    { frage: ["Thank you for calling! Goodbye!", "Danke für deinen Anruf! Tschüss!"], art: "tschuess", antworten: [
      a("winken", "Goodbye, Rocco!", "Tschüss, Rocco!", ["Bye-bye! See you soon!", "Tschüss! Bis bald!"]),
    ] },
  ];
  // Roccos Diner: Gäste bestellen. [Gast, was, Englisch, Deutsch]
  const bitte = (en) => `${en.replace(/\.$/, "")}, please!`;
  // Deutsch bestellt man im Akkusativ: «Einen Muffin, bitte!»
  const akk = (de) => de.replace(/^Ein Muffin/, "Einen Muffin").replace(/ ein Muffin/, " einen Muffin");
  const deBitte = (de) => `${akk(de.replace(/\.$/, ""))}, bitte!`;
  const DINER_GAESTE = ["dog", "cat", "bear", "penguin", "monkey"];
  const DINER_ESSEN = ["pancakes", "banana", "milk", "cookie", "juice", "icecream", "cupcake", "pizza", "lemonade", "popcorn"];
  const DINER_PAARE = [["pancakes", "juice"], ["pizza", "lemonade"], ["cookie", "milk"], ["icecream", "cupcake"], ["banana", "milk"], ["popcorn", "lemonade"], ["pancakes", "milk"], ["pizza", "juice"]];
  // Post aus Amerika: Postkarten von Cousine Ruby, eine neue alle paar Runden.
  const POSTKARTEN = [
    { id: "newyork", ab: 0, text: ["Hello from New York! The buildings are very tall. Love, Ruby.", "Hallo aus New York! Die Häuser sind sehr hoch. Liebe Grüsse, Ruby."] },
    { id: "bridge", ab: 4, text: ["Hello from San Francisco! Look at the big red bridge. Love, Ruby.", "Hallo aus San Francisco! Schau die grosse rote Brücke an. Liebe Grüsse, Ruby."] },
    { id: "canyon", ab: 10, text: ["Hello from the Grand Canyon! It is very big. Love, Ruby.", "Hallo aus dem Grand Canyon! Er ist sehr gross. Liebe Grüsse, Ruby."] },
    { id: "florida", ab: 18, text: ["Hello from Florida! I see an alligator! Love, Ruby.", "Hallo aus Florida! Ich sehe einen Alligator! Liebe Grüsse, Ruby."] },
    { id: "alaska", ab: 28, text: ["Hello from Alaska! It is very cold. Brrr! Love, Ruby.", "Hallo aus Alaska! Es ist sehr kalt, brrr! Liebe Grüsse, Ruby."] },
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
    whatsmissing: "Schau dir das Bild gut an. Dann verschwindet ein Ding. Tippe unten auf das, was fehlt.",
    dressup: "Rocco sagt auf Englisch, was er anziehen möchte. Tippe darauf.",
    geschichtenzug: "Die Bilder der Geschichte sind durcheinander. Tippe sie der Reihe nach an: Was kommt zuerst, was dann?",
    diner: "Die Gäste bestellen auf Englisch. Tippe auf das, was sie möchten.",
    telefon: "Rocco ruft an und fragt dich etwas auf Englisch. Tippe auf eine Antwort. Wer mag, sagt sie laut nach.",
    echo: "Hör das Wort, tippe auf das Mikrofon und sag es nach. Danach hörst du dich selbst. Die Aufnahme bleibt auf diesem Gerät.",
    post: "Roccos Cousine Ruby reist durch Amerika und schickt Postkarten. Tippe auf die Karte, und Rocco liest sie vor.",
    monster: "Rocco sagt auf Englisch, wie das Monster aussehen soll: welche Farbe, wie viele Augen, Arme und Beine. Tippe auf die richtige Farbe oder Zahl.",
    wokatze: "Rocco sagt auf Englisch, wo die Katze ist: in, auf, unter, hinter oder neben etwas. Tippe auf das richtige Bild.",
    gegenteile: "Rocco fragt auf Englisch nach einem von zwei Bildern, zum Beispiel: Welches ist gross? Tippe darauf.",
    wortbild: "Für Kinder, die schon lesen: Finde zu jedem Bild das englische Wort.",
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
    [...SPIELE, ...TELEFON_SPIELE].forEach((sp) => dazu(sp.titel[0], sp.titel[1], `spiel ${sp.id}`));
    VERSE.forEach((v) => { dazu(v.titel[0], v.titel[1], `vers ${v.id}`); v.zeilen.forEach((zl) => dazu(zl.en, zl.de, `vers ${v.id}`)); });
    BUECHER.forEach((b) => { dazu(b.titel[0], b.titel[1], `buch ${b.id}`); b.seiten.forEach(([en, de]) => dazu(en, de, `buch ${b.id}`)); });
    KLEIDER.forEach((k) => dazu(k.anziehen[0], k.anziehen[1], `dressup ${k.id}`));
    TELEFON.forEach((t, i) => {
      dazu(t.frage[0], t.frage[1], `telefon ${i + 1}`);
      t.antworten.forEach((x) => { dazu(x.satz[0], x.satz[1], `telefon ${x.id}`); if (x.antwort) dazu(x.antwort[0], x.antwort[1], `telefon ${x.id}`); });
    });
    const wortVon = (id) => WELTEN.flatMap((x) => x.woerter).find((x) => x.id === id);
    DINER_ESSEN.forEach((id) => { const x = wortVon(id); dazu(bitte(x.en), deBitte(x.de), `diner ${id}`); });
    DINER_PAARE.forEach(([p, q]) => { const [en, de] = dinerPaar(p, q); dazu(en, de, `diner ${p}+${q}`); });
    POSTKARTEN.forEach((k) => dazu(k.text[0], k.text[1], `post ${k.id}`));
    SPIEL_GRUPPEN.forEach((g) => dazu(g.titel[0], g.titel[1], `spielgruppe ${g.id}`));
    MONSTER_TEILE.forEach((t) => dazu(t.satz[0], t.satz[1], `monster ${t.teil} ${t.n}`));
    FARBEN.forEach((f) => { const [en, de] = monsterFarbe(f); dazu(en, de, `monster ${f.id}`); });
    WO_KATZE.forEach((x) => dazu(x.satz[0], x.satz[1], `wokatze ${x.wo} ${x.ding}`));
    GEGENTEILE.forEach((g) => [0, 1].forEach((i) => {
      dazu(...gegenteilFrage(g, i), `gegenteile ${g.paar[i]}`);
      dazu(...gegenteilAntwort(g, i), `gegenteile ${g.paar[i]}`);
    }));
    return liste;
  }

  // «Pancakes and juice, please!» – zwei Dinge einer Bestellung.
  function dinerPaar(p, q) {
    const alle = WELTEN.flatMap((x) => x.woerter);
    const [x, y] = [p, q].map((id) => alle.find((z) => z.id === id));
    const klein = (t) => (/^(A|An|The) /.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t.charAt(0).toLowerCase() + t.slice(1));
    const deKlein = (t) => (/^(Der|Die|Das|Ein|Eine) /.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t);
    return [`${x.en.replace(/\.$/, "")} and ${klein(y.en.replace(/\.$/, ""))}, please!`, akk(`${x.de.replace(/\.$/, "")} und ${deKlein(y.de.replace(/\.$/, ""))}, bitte!`)];
  }

  window.LernappEnglischInhalt = {
    WELTEN, EXTRA_WOERTER, GESCHICHTEN, SAETZE, LOB, EINRICHTUNG, HILFE,
    FARBEN, ZAHLEN, ZAEHLDINGE, ESSEN, SPIELE, VERSE, BUECHER,
    tippeBallon, wagenBitte, wieViele, soViele, istDas, paare, gross,
    SPIEL_GRUPPEN, MONSTER_TEILE, monsterFarbe, WO_KATZE, GEGENTEILE, gegenteilFrage, gegenteilAntwort, AUFTRAEGE,
    KLEIDER, TELEFON, TELEFON_SPIELE, DINER_GAESTE, DINER_ESSEN, DINER_PAARE, POSTKARTEN, bitte, deBitte, dinerPaar,
  };
})();
