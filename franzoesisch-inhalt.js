/*
 * franzoesisch-inhalt.js – Was im Französischwagen gesagt wird, Französisch
 * und Deutsch.
 *
 * Dieselbe Form wie englisch-inhalt.js, damit der gemeinsame Kern
 * (sprachwagen.js) und die Spiele (englisch-spiele*.js) beide Wagen kennen.
 * Das Feld «en» heisst dort, was in der Fremdsprache gesagt wird – hier also
 * Französisch (gesprochen von Aoede, fr-FR, Tempo 0,9 – franzoesisch-stimme.js);
 * «de» ist das Deutsche (Sulafat wie die ganze App).
 *
 * Hochfranzösisch wie in der Schule; das Kind wird geduzt. Jedes Wort kommt
 * mit seinem Artikel (une vache, un arbre, des crêpes), die Körperteile mit
 * dem bestimmten (la tête, les yeux). Die Ids der Wörter und Welten sind
 * dieselben wie im Englischwagen: Die Zeichnungen und Gemälde (englisch-art*.js,
 * bilder/englisch/) gehören zu ihnen. «raccoon» ist das Maskottchen des
 * Wagens, hier Margot, la marmotte.
 *
 *   WELTEN       die Orte, die man durchs grosse Fenster sieht; je ein
 *                Wimmelbild mit 13 Dingen (wie im Englischwagen; statt der
 *                amerikanischen Feiertage «Les fêtes», franzoesisch-art-2.js).
 *   GESCHICHTEN  Bildgeschichten in vier Bildern, mit Margot.
 *   SAETZE       was Margot sonst sagt.
 *   EINRICHTUNG  die 15 Dinge, mit denen der Bistrowagen gemütlich wird.
 */
(() => {
  "use strict";

  // [id, Wort, Satz, Frage, deutsches Wort, deutscher Satz, deutsche Frage]
  const w = (id, en, satz, frage, de, deSatz, deFrage) => ({ id, en, satz, frage, de, deSatz, deFrage });

  const WELTEN = [
    {
      id: "farm",
      titel: ["La ferme", "Der Bauernhof"],
      intro: ["On découvre la ferme ! Touche une image.", "Wir entdecken den Bauernhof! Tippe auf ein Bild."],
      woerter: [
        w("sun", "Le soleil.", "Le soleil est jaune.", "Où est le soleil ?", "Die Sonne.", "Die Sonne ist gelb.", "Wo ist die Sonne?"),
        w("barn", "Une grange.", "La grange est rouge.", "Où est la grange ?", "Eine Scheune.", "Die Scheune ist rot.", "Wo ist die Scheune?"),
        w("tractor", "Un tracteur.", "Le tracteur est vert.", "Où est le tracteur ?", "Ein Traktor.", "Der Traktor ist grün.", "Wo ist der Traktor?"),
        w("tree", "Un arbre.", "L'arbre est grand.", "Où est l'arbre ?", "Ein Baum.", "Der Baum ist gross.", "Wo ist der Baum?"),
        w("apple", "Une pomme.", "La pomme est rouge. Miam !", "Où est la pomme ?", "Ein Apfel.", "Der Apfel ist rot. Mmh!", "Wo ist der Apfel?"),
        w("cow", "Une vache.", "La vache dit meuh.", "Où est la vache ?", "Eine Kuh.", "Die Kuh macht muh.", "Wo ist die Kuh?"),
        w("pig", "Un cochon.", "Le cochon est rose.", "Où est le cochon ?", "Ein Schwein.", "Das Schwein ist rosa.", "Wo ist das Schwein?"),
        w("sheep", "Un mouton.", "Le mouton dit bêê.", "Où est le mouton ?", "Ein Schaf.", "Das Schaf macht mäh.", "Wo ist das Schaf?"),
        w("chicken", "Une poule.", "La poule a un œuf.", "Où est la poule ?", "Ein Huhn.", "Das Huhn hat ein Ei.", "Wo ist das Huhn?"),
        w("duck", "Un canard.", "Le canard nage.", "Où est le canard ?", "Eine Ente.", "Die Ente schwimmt.", "Wo ist die Ente?"),
        w("dog", "Un chien.", "Le chien saute.", "Où est le chien ?", "Ein Hund.", "Der Hund springt.", "Wo ist der Hund?"),
        w("cat", "Un chat.", "Le chat dort.", "Où est le chat ?", "Eine Katze.", "Die Katze schläft.", "Wo ist die Katze?"),
        w("flower", "Une fleur.", "La fleur est bleue.", "Où est la fleur ?", "Eine Blume.", "Die Blume ist blau.", "Wo ist die Blume?"),
      ],
    },
    {
      id: "house",
      titel: ["Ma maison", "Mein Zuhause"],
      intro: ["On découvre ma maison ! Touche une image.", "Wir entdecken mein Zuhause! Tippe auf ein Bild."],
      woerter: [
        w("door", "Une porte.", "La porte est ouverte.", "Où est la porte ?", "Eine Tür.", "Die Tür ist offen.", "Wo ist die Tür?"),
        w("window", "Une fenêtre.", "Regarde par la fenêtre !", "Où est la fenêtre ?", "Ein Fenster.", "Schau aus dem Fenster!", "Wo ist das Fenster?"),
        w("bed", "Un lit.", "Le lit est tout doux.", "Où est le lit ?", "Ein Bett.", "Das Bett ist weich.", "Wo ist das Bett?"),
        w("table", "Une table.", "La table est marron.", "Où est la table ?", "Ein Tisch.", "Der Tisch ist braun.", "Wo ist der Tisch?"),
        w("chair", "Une chaise.", "Assieds-toi sur la chaise, s'il te plaît.", "Où est la chaise ?", "Ein Stuhl.", "Setz dich bitte auf den Stuhl.", "Wo ist der Stuhl?"),
        w("sofa", "Un canapé.", "Le canapé est grand et rouge.", "Où est le canapé ?", "Ein Sofa.", "Das Sofa ist gross und rot.", "Wo ist das Sofa?"),
        w("lamp", "Une lampe.", "La lampe est allumée.", "Où est la lampe ?", "Eine Lampe.", "Die Lampe ist an.", "Wo ist die Lampe?"),
        w("clock", "Une horloge.", "Tic-tac ! L'horloge fait tic-tac.", "Où est l'horloge ?", "Eine Uhr.", "Tick, tack! Die Uhr macht tick, tack.", "Wo ist die Uhr?"),
        w("tv", "Une télé.", "La télé est éteinte.", "Où est la télé ?", "Ein Fernseher.", "Der Fernseher ist aus.", "Wo ist der Fernseher?"),
        w("mom", "Maman.", "C'est ma maman.", "Où est maman ?", "Mama.", "Das ist meine Mama.", "Wo ist Mama?"),
        w("dad", "Papa.", "C'est mon papa.", "Où est papa ?", "Papa.", "Das ist mein Papa.", "Wo ist Papa?"),
        w("baby", "Un bébé.", "Le bébé dort.", "Où est le bébé ?", "Ein Baby.", "Das Baby schläft.", "Wo ist das Baby?"),
        w("teddy", "Un nounours.", "J'aime mon nounours.", "Où est le nounours ?", "Ein Teddybär.", "Ich habe meinen Teddybär lieb.", "Wo ist der Teddybär?"),
      ],
    },
    {
      id: "kitchen",
      titel: ["La cuisine", "Die Küche"],
      intro: ["On découvre la cuisine ! Touche une image.", "Wir entdecken die Küche! Tippe auf ein Bild."],
      woerter: [
        w("fridge", "Un frigo.", "Le frigo est froid.", "Où est le frigo ?", "Ein Kühlschrank.", "Der Kühlschrank ist kalt.", "Wo ist der Kühlschrank?"),
        w("banana", "Une banane.", "La banane est jaune.", "Où est la banane ?", "Eine Banane.", "Die Banane ist gelb.", "Wo ist die Banane?"),
        w("bread", "Du pain.", "Le pain est frais.", "Où est le pain ?", "Brot.", "Das Brot ist frisch.", "Wo ist das Brot?"),
        w("milk", "Du lait.", "Le lait est blanc.", "Où est le lait ?", "Milch.", "Die Milch ist weiss.", "Wo ist die Milch?"),
        w("cheese", "Du fromage.", "J'aime le fromage.", "Où est le fromage ?", "Käse.", "Ich mag Käse.", "Wo ist der Käse?"),
        w("egg", "Un œuf.", "L'œuf est rond.", "Où est l'œuf ?", "Ein Ei.", "Das Ei ist rund.", "Wo ist das Ei?"),
        w("cake", "Un gâteau.", "Un gâteau d'anniversaire ! Miam !", "Où est le gâteau ?", "Ein Kuchen.", "Ein Geburtstagskuchen! Mmh!", "Wo ist der Kuchen?"),
        w("pancakes", "Des crêpes.", "J'adore les crêpes !", "Où sont les crêpes ?", "Crêpes.", "Ich liebe Crêpes!", "Wo sind die Crêpes?"),
        w("cookie", "Un biscuit.", "Je peux avoir un biscuit, s'il te plaît ?", "Où est le biscuit ?", "Ein Guetzli.", "Darf ich bitte ein Guetzli haben?", "Wo ist das Guetzli?"),
        w("juice", "Du jus d'orange.", "J'ai soif ! Du jus d'orange, s'il te plaît.", "Où est le jus d'orange ?", "Orangensaft.", "Ich habe Durst! Orangensaft, bitte.", "Wo ist der Orangensaft?"),
        w("cup", "Une tasse.", "Une tasse de lait.", "Où est la tasse ?", "Eine Tasse.", "Eine Tasse Milch.", "Wo ist die Tasse?"),
        w("plate", "Une assiette.", "L'assiette est vide.", "Où est l'assiette ?", "Ein Teller.", "Der Teller ist leer.", "Wo ist der Teller?"),
        w("spoon", "Une cuillère.", "Une grande cuillère.", "Où est la cuillère ?", "Ein Löffel.", "Ein grosser Löffel.", "Wo ist der Löffel?"),
      ],
    },
    {
      id: "park",
      titel: ["Le parc", "Der Park"],
      intro: ["On va au parc ! Touche une image.", "Wir gehen in den Park! Tippe auf ein Bild."],
      woerter: [
        w("slide", "Un toboggan.", "Youpi ! On descend le toboggan !", "Où est le toboggan ?", "Eine Rutschbahn.", "Hui! Die Rutschbahn hinunter!", "Wo ist die Rutschbahn?"),
        w("swing", "Une balançoire.", "En haut, en bas, sur la balançoire.", "Où est la balançoire ?", "Eine Schaukel.", "Hoch und runter auf der Schaukel.", "Wo ist die Schaukel?"),
        w("sandbox", "Un bac à sable.", "Je joue dans le bac à sable.", "Où est le bac à sable ?", "Ein Sandkasten.", "Ich spiele im Sandkasten.", "Wo ist der Sandkasten?"),
        w("ball", "Une balle.", "La balle est rouge.", "Où est la balle ?", "Ein Ball.", "Der Ball ist rot.", "Wo ist der Ball?"),
        w("kite", "Un cerf-volant.", "Le cerf-volant est dans le ciel.", "Où est le cerf-volant ?", "Ein Drachen.", "Der Drachen ist am Himmel.", "Wo ist der Drachen?"),
        w("bike", "Un vélo.", "Je sais faire du vélo.", "Où est le vélo ?", "Ein Velo.", "Ich kann Velo fahren.", "Wo ist das Velo?"),
        w("bench", "Un banc.", "Assieds-toi sur le banc.", "Où est le banc ?", "Eine Bank.", "Setz dich auf die Bank.", "Wo ist die Bank?"),
        w("bird", "Un oiseau.", "L'oiseau vole.", "Où est l'oiseau ?", "Ein Vogel.", "Der Vogel fliegt.", "Wo ist der Vogel?"),
        w("butterfly", "Un papillon.", "Regarde le papillon !", "Où est le papillon ?", "Ein Schmetterling.", "Schau den Schmetterling an!", "Wo ist der Schmetterling?"),
        w("squirrel", "Un écureuil.", "L'écureuil grimpe.", "Où est l'écureuil ?", "Ein Eichhörnchen.", "Das Eichhörnchen klettert.", "Wo ist das Eichhörnchen?"),
        w("boy", "Un garçon.", "Le garçon a un cerf-volant.", "Où est le garçon ?", "Ein Bub.", "Der Bub hat einen Drachen.", "Wo ist der Bub?"),
        w("girl", "Une fille.", "La fille aime le parc.", "Où est la fille ?", "Ein Mädchen.", "Das Mädchen mag den Park.", "Wo ist das Mädchen?"),
        w("scooter", "Une trottinette.", "À moi la trottinette !", "Où est la trottinette ?", "Ein Trottinett.", "Jetzt bin ich dran mit dem Trottinett!", "Wo ist das Trottinett?"),
      ],
    },
    {
      id: "zoo",
      titel: ["Le zoo", "Der Zoo"],
      intro: ["On va au zoo ! Touche un animal.", "Wir gehen in den Zoo! Tippe auf ein Tier."],
      woerter: [
        w("lion", "Un lion.", "Le lion rugit : grrr !", "Où est le lion ?", "Ein Löwe.", "Der Löwe brüllt: Grrr!", "Wo ist der Löwe?"),
        w("elephant", "Un éléphant.", "L'éléphant est très grand.", "Où est l'éléphant ?", "Ein Elefant.", "Der Elefant ist sehr gross.", "Wo ist der Elefant?"),
        w("giraffe", "Une girafe.", "La girafe a un long cou.", "Où est la girafe ?", "Eine Giraffe.", "Die Giraffe hat einen langen Hals.", "Wo ist die Giraffe?"),
        w("monkey", "Un singe.", "Le singe est rigolo.", "Où est le singe ?", "Ein Affe.", "Der Affe ist lustig.", "Wo ist der Affe?"),
        w("tiger", "Un tigre.", "Le tigre a des rayures.", "Où est le tigre ?", "Ein Tiger.", "Der Tiger hat Streifen.", "Wo ist der Tiger?"),
        w("zebra", "Un zèbre.", "Le zèbre est noir et blanc.", "Où est le zèbre ?", "Ein Zebra.", "Das Zebra ist schwarz und weiss.", "Wo ist das Zebra?"),
        w("bear", "Un ours.", "L'ours est brun.", "Où est l'ours ?", "Ein Bär.", "Der Bär ist braun.", "Wo ist der Bär?"),
        w("snake", "Un serpent.", "Le serpent est long.", "Où est le serpent ?", "Eine Schlange.", "Die Schlange ist lang.", "Wo ist die Schlange?"),
        w("penguin", "Un pingouin.", "Le pingouin sait nager.", "Où est le pingouin ?", "Ein Pinguin.", "Der Pinguin kann schwimmen.", "Wo ist der Pinguin?"),
        w("crocodile", "Un crocodile.", "Le crocodile a de grandes dents.", "Où est le crocodile ?", "Ein Krokodil.", "Das Krokodil hat grosse Zähne.", "Wo ist das Krokodil?"),
        w("hippo", "Un hippopotame.", "L'hippopotame est dans l'eau.", "Où est l'hippopotame ?", "Ein Flusspferd.", "Das Flusspferd ist im Wasser.", "Wo ist das Flusspferd?"),
        w("parrot", "Un perroquet.", "Le perroquet dit bonjour !", "Où est le perroquet ?", "Ein Papagei.", "Der Papagei sagt hallo!", "Wo ist der Papagei?"),
        w("kangaroo", "Un kangourou.", "Le kangourou sait sauter.", "Où est le kangourou ?", "Ein Känguru.", "Das Känguru kann springen.", "Wo ist das Känguru?"),
      ],
    },
    {
      id: "beach",
      titel: ["La plage", "Der Strand"],
      intro: ["On va à la plage ! Il fait chaud ! Touche une image.", "Wir gehen an den Strand! Es ist heiss! Tippe auf ein Bild."],
      woerter: [
        w("shell", "Un coquillage.", "J'ai trouvé un coquillage !", "Où est le coquillage ?", "Eine Muschel.", "Ich habe eine Muschel gefunden!", "Wo ist die Muschel?"),
        w("crab", "Un crabe.", "Le crabe est rouge.", "Où est le crabe ?", "Eine Krabbe.", "Die Krabbe ist rot.", "Wo ist die Krabbe?"),
        w("fish", "Un poisson.", "Le poisson saute.", "Où est le poisson ?", "Ein Fisch.", "Der Fisch springt.", "Wo ist der Fisch?"),
        w("boat", "Un bateau.", "Le bateau est sur la mer.", "Où est le bateau ?", "Ein Boot.", "Das Boot ist auf dem Meer.", "Wo ist das Boot?"),
        w("wave", "Une vague.", "Plouf ! Une grosse vague !", "Où est la vague ?", "Eine Welle.", "Platsch! Eine grosse Welle!", "Wo ist die Welle?"),
        w("hat", "Un chapeau.", "Mets ton chapeau ! Il fait chaud !", "Où est le chapeau ?", "Ein Hut.", "Setz deinen Hut auf! Es ist heiss!", "Wo ist der Hut?"),
        w("icecream", "Une glace.", "J'aime la glace !", "Où est la glace ?", "Eine Glace.", "Ich mag Glace!", "Wo ist die Glace?"),
        w("bucket", "Un seau.", "Du sable dans le seau.", "Où est le seau ?", "Ein Kesseli.", "Sand ins Kesseli.", "Wo ist das Kesseli?"),
        w("umbrella", "Un parasol.", "Assieds-toi sous le parasol.", "Où est le parasol ?", "Ein Sonnenschirm.", "Setz dich unter den Sonnenschirm.", "Wo ist der Sonnenschirm?"),
        w("starfish", "Une étoile de mer.", "L'étoile de mer ressemble à une étoile.", "Où est l'étoile de mer ?", "Ein Seestern.", "Der Seestern sieht aus wie ein Stern.", "Wo ist der Seestern?"),
        w("sandcastle", "Un château de sable.", "On construit un château de sable !", "Où est le château de sable ?", "Eine Sandburg.", "Wir bauen eine Sandburg!", "Wo ist die Sandburg?"),
        w("seagull", "Une mouette.", "La mouette vole.", "Où est la mouette ?", "Eine Möwe.", "Die Möwe fliegt.", "Wo ist die Möwe?"),
        w("sunglasses", "Des lunettes de soleil.", "Trop cool, les lunettes de soleil !", "Où sont les lunettes de soleil ?", "Eine Sonnenbrille.", "Coole Sonnenbrille!", "Wo ist die Sonnenbrille?"),
      ],
    },
    {
      id: "city",
      titel: ["La ville", "Die Stadt"],
      intro: ["On va en ville ! Touche une image.", "Wir gehen in die Stadt! Tippe auf ein Bild."],
      woerter: [
        w("car", "Une voiture.", "La voiture roule vite.", "Où est la voiture ?", "Ein Auto.", "Das Auto fährt schnell.", "Wo ist das Auto?"),
        w("bus", "Un bus.", "On prend le bus.", "Où est le bus ?", "Ein Bus.", "Wir fahren mit dem Bus.", "Wo ist der Bus?"),
        w("schoolbus", "Un car scolaire.", "Le car scolaire est jaune.", "Où est le car scolaire ?", "Ein Schulbus.", "Der Schulbus ist gelb.", "Wo ist der Schulbus?"),
        w("train", "Un train.", "Tchou tchou ! Voilà le train.", "Où est le train ?", "Ein Zug.", "Tschu-tschu! Da kommt der Zug.", "Wo ist der Zug?"),
        w("truck", "Un camion.", "Le camion est grand.", "Où est le camion ?", "Ein Lastwagen.", "Der Lastwagen ist gross.", "Wo ist der Lastwagen?"),
        w("plane", "Un avion.", "L'avion est dans le ciel.", "Où est l'avion ?", "Ein Flugzeug.", "Das Flugzeug ist am Himmel.", "Wo ist das Flugzeug?"),
        w("firetruck", "Un camion de pompiers.", "Le camion de pompiers est rouge.", "Où est le camion de pompiers ?", "Ein Feuerwehrauto.", "Das Feuerwehrauto ist rot.", "Wo ist das Feuerwehrauto?"),
        w("taxi", "Un taxi.", "Taxi ! Stop, s'il vous plaît !", "Où est le taxi ?", "Ein Taxi.", "Taxi! Halt, bitte!", "Wo ist das Taxi?"),
        w("trafficlight", "Un feu.", "Au feu vert, on passe !", "Où est le feu ?", "Eine Ampel.", "Bei Grün darf man gehen!", "Wo ist die Ampel?"),
        w("helicopter", "Un hélicoptère.", "L'hélicoptère vole.", "Où est l'hélicoptère ?", "Ein Helikopter.", "Der Helikopter fliegt.", "Wo ist der Helikopter?"),
        w("policecar", "Une voiture de police.", "Pin-pon ! Voilà la voiture de police.", "Où est la voiture de police ?", "Ein Polizeiauto.", "Tatü-tata! Da kommt das Polizeiauto.", "Wo ist das Polizeiauto?"),
        w("ambulance", "Une ambulance.", "L'ambulance arrive vite.", "Où est l'ambulance ?", "Ein Krankenwagen.", "Der Krankenwagen kommt schnell.", "Wo ist der Krankenwagen?"),
        w("motorbike", "Une moto.", "Vroum ! La moto fait du bruit.", "Où est la moto ?", "Ein Motorrad.", "Brumm! Das Motorrad ist laut.", "Wo ist das Motorrad?"),
      ],
    },
    {
      id: "school",
      titel: ["À l'école", "In der Schule"],
      intro: ["On va à l'école ! Touche une image.", "Wir gehen in die Schule! Tippe auf ein Bild."],
      woerter: [
        w("pencil", "Un crayon.", "J'écris avec un crayon.", "Où est le crayon ?", "Ein Bleistift.", "Ich schreibe mit einem Bleistift.", "Wo ist der Bleistift?"),
        w("crayon", "Un crayon de couleur.", "Je dessine avec un crayon de couleur.", "Où est le crayon de couleur ?", "Ein Farbstift.", "Ich male mit einem Farbstift.", "Wo ist der Farbstift?"),
        w("book", "Un livre.", "Ouvre ton livre, s'il te plaît.", "Où est le livre ?", "Ein Buch.", "Mach bitte dein Buch auf.", "Wo ist das Buch?"),
        w("backpack", "Un sac d'école.", "Mon sac d'école est lourd.", "Où est le sac d'école ?", "Ein Schulsack.", "Mein Schulsack ist schwer.", "Wo ist der Schulsack?"),
        w("scissors", "Des ciseaux.", "Coupe le papier avec les ciseaux.", "Où sont les ciseaux ?", "Eine Schere.", "Schneide das Papier mit der Schere.", "Wo ist die Schere?"),
        w("glue", "De la colle.", "La colle, ça colle !", "Où est la colle ?", "Leim.", "Leim klebt!", "Wo ist der Leim?"),
        w("paper", "Une feuille.", "Une feuille de papier.", "Où est la feuille ?", "Ein Blatt.", "Ein Blatt Papier.", "Wo ist das Blatt?"),
        w("teacher", "Une maîtresse.", "Bonjour, maîtresse !", "Où est la maîtresse ?", "Eine Lehrerin.", "Guten Morgen, Frau Lehrerin!", "Wo ist die Lehrerin?"),
        w("board", "Un tableau.", "Regarde le tableau, s'il te plaît.", "Où est le tableau ?", "Eine Wandtafel.", "Schau bitte an die Wandtafel.", "Wo ist die Wandtafel?"),
        w("desk", "Un pupitre.", "Assieds-toi à ton pupitre, s'il te plaît.", "Où est le pupitre ?", "Ein Pult.", "Setz dich bitte an dein Pult.", "Wo ist das Pult?"),
        w("ruler", "Une règle.", "La règle est longue.", "Où est la règle ?", "Ein Lineal.", "Das Lineal ist lang.", "Wo ist das Lineal?"),
        w("eraser", "Une gomme.", "Oups ! J'ai besoin d'une gomme.", "Où est la gomme ?", "Ein Radiergummi.", "Hoppla! Ich brauche einen Radiergummi.", "Wo ist der Radiergummi?"),
        w("paintbrush", "Un pinceau.", "Je peins avec un pinceau.", "Où est le pinceau ?", "Ein Pinsel.", "Ich male mit einem Pinsel.", "Wo ist der Pinsel?"),
      ],
    },
    {
      id: "party",
      titel: ["La fête", "Fest"],
      intro: ["C'est la fête ! Touche une image.", "Jetzt wird gefeiert! Tippe auf ein Bild."],
      woerter: [
        w("candle", "Une bougie.", "Souffle la bougie !", "Où est la bougie ?", "Eine Kerze.", "Blas die Kerze aus!", "Wo ist die Kerze?"),
        w("present", "Un cadeau.", "Un cadeau pour toi !", "Où est le cadeau ?", "Ein Geschenk.", "Ein Geschenk für dich!", "Wo ist das Geschenk?"),
        w("balloon", "Un ballon.", "Pan ! Oh non, le ballon !", "Où est le ballon ?", "Ein Ballon.", "Peng! Oh nein, der Ballon!", "Wo ist der Ballon?"),
        w("partyhat", "Un chapeau de fête.", "Mets ton chapeau de fête !", "Où est le chapeau de fête ?", "Ein Partyhut.", "Setz deinen Partyhut auf!", "Wo ist der Partyhut?"),
        w("cupcake", "Un petit gâteau.", "Le petit gâteau est sucré.", "Où est le petit gâteau ?", "Ein Muffin.", "Der Muffin ist süss.", "Wo ist der Muffin?"),
        w("pizza", "Une pizza.", "J'aime la pizza !", "Où est la pizza ?", "Eine Pizza.", "Ich mag Pizza!", "Wo ist die Pizza?"),
        w("lemonade", "De la limonade.", "La limonade est fraîche.", "Où est la limonade ?", "Limonade.", "Die Limonade ist kalt.", "Wo ist die Limonade?"),
        w("popcorn", "Du pop-corn.", "Du pop-corn ! Pop, pop, pop !", "Où est le pop-corn ?", "Popcorn.", "Popcorn! Plopp, plopp, plopp!", "Wo ist das Popcorn?"),
        w("pinata", "Une piñata.", "Regarde la piñata !", "Où est la piñata ?", "Eine Piñata.", "Schau die Piñata an!", "Wo ist die Piñata?"),
        w("confetti", "Des confettis.", "Des confettis partout !", "Où sont les confettis ?", "Konfetti.", "Überall Konfetti!", "Wo ist das Konfetti?"),
        w("card", "Une carte.", "Une carte d'anniversaire pour toi.", "Où est la carte ?", "Eine Karte.", "Eine Geburtstagskarte für dich.", "Wo ist die Karte?"),
        w("clown", "Un clown.", "Le clown est rigolo.", "Où est le clown ?", "Ein Clown.", "Der Clown ist lustig.", "Wo ist der Clown?"),
        w("lollipop", "Une sucette.", "La sucette est sucrée.", "Où est la sucette ?", "Ein Lolli.", "Der Lolli ist süss.", "Wo ist der Lolli?"),
      ],
    },
    {
      id: "body",
      titel: ["Mon corps", "Mein Körper"],
      intro: ["C'est moi ! Touche une image.", "Das bin ich! Tippe auf ein Bild."],
      woerter: [
        w("head", "La tête.", "Fais oui avec la tête !", "Où est la tête ?", "Der Kopf.", "Nick mit dem Kopf!", "Wo ist der Kopf?"),
        w("eyes", "Les yeux.", "J'ai deux yeux.", "Où sont les yeux ?", "Die Augen.", "Ich habe zwei Augen.", "Wo sind die Augen?"),
        w("ears", "Les oreilles.", "J'entends avec mes oreilles.", "Où sont les oreilles ?", "Die Ohren.", "Ich höre mit meinen Ohren.", "Wo sind die Ohren?"),
        w("nose", "Le nez.", "Touche ton nez !", "Où est le nez ?", "Die Nase.", "Fass deine Nase an!", "Wo ist die Nase?"),
        w("mouth", "La bouche.", "Ouvre la bouche !", "Où est la bouche ?", "Der Mund.", "Mach den Mund auf!", "Wo ist der Mund?"),
        w("hair", "Les cheveux.", "Mes cheveux sont longs.", "Où sont les cheveux ?", "Die Haare.", "Meine Haare sind lang.", "Wo sind die Haare?"),
        w("teeth", "Les dents.", "Brosse-toi les dents !", "Où sont les dents ?", "Die Zähne.", "Putz dir die Zähne!", "Wo sind die Zähne?"),
        w("arms", "Les bras.", "Agite les bras !", "Où sont les bras ?", "Die Arme.", "Wink mit den Armen!", "Wo sind die Arme?"),
        w("hands", "Les mains.", "Tape dans tes mains !", "Où sont les mains ?", "Die Hände.", "Klatsch in die Hände!", "Wo sind die Hände?"),
        w("fingers", "Les doigts.", "J'ai dix doigts.", "Où sont les doigts ?", "Die Finger.", "Ich habe zehn Finger.", "Wo sind die Finger?"),
        w("tummy", "Le ventre.", "J'ai le ventre plein.", "Où est le ventre ?", "Der Bauch.", "Mein Bauch ist voll.", "Wo ist der Bauch?"),
        w("legs", "Les jambes.", "Secoue tes jambes !", "Où sont les jambes ?", "Die Beine.", "Schüttle deine Beine!", "Wo sind die Beine?"),
        w("feet", "Les pieds.", "Tape des pieds !", "Où sont les pieds ?", "Die Füsse.", "Stampf mit den Füssen!", "Wo sind die Füsse?"),
      ],
    },
    {
      id: "clothes",
      titel: ["Les habits et la météo", "Kleider und Wetter"],
      reiter: "Les habits",
      intro: ["Quel temps fait-il ? Touche une image.", "Wie ist das Wetter? Tippe auf ein Bild."],
      woerter: [
        w("coat", "Un imperméable.", "Mets ton imperméable ! Il pleut.", "Où est l'imperméable ?", "Eine Regenjacke.", "Zieh deine Regenjacke an! Es regnet.", "Wo ist die Regenjacke?"),
        w("scarf", "Une écharpe.", "L'écharpe est chaude.", "Où est l'écharpe ?", "Ein Schal.", "Der Schal ist warm.", "Wo ist der Schal?"),
        w("boots", "Des bottes.", "De grandes bottes !", "Où sont les bottes ?", "Stiefel.", "Grosse Stiefel!", "Wo sind die Stiefel?"),
        w("tshirt", "Un t-shirt.", "Il fait chaud. Je porte un t-shirt.", "Où est le t-shirt ?", "Ein T-Shirt.", "Es ist heiss. Ich trage ein T-Shirt.", "Wo ist das T-Shirt?"),
        w("pants", "Un pantalon.", "Mets ton pantalon !", "Où est le pantalon ?", "Eine Hose.", "Zieh deine Hose an!", "Wo ist die Hose?"),
        w("sneakers", "Des baskets.", "Je cours avec mes baskets.", "Où sont les baskets ?", "Turnschuhe.", "Ich renne in meinen Turnschuhen.", "Wo sind die Turnschuhe?"),
        w("dress", "Une robe.", "Une jolie robe !", "Où est la robe ?", "Ein Kleid.", "Ein schönes Kleid!", "Wo ist das Kleid?"),
        w("socks", "Des chaussettes.", "Des chaussettes chaudes pour mes pieds.", "Où sont les chaussettes ?", "Socken.", "Warme Socken für meine Füsse.", "Wo sind die Socken?"),
        w("gloves", "Des moufles.", "Des moufles pour les mains froides.", "Où sont les moufles ?", "Handschuhe.", "Handschuhe für kalte Hände.", "Wo sind die Handschuhe?"),
        w("sweater", "Un pull.", "Le pull est chaud.", "Où est le pull ?", "Ein Pullover.", "Der Pullover ist warm.", "Wo ist der Pullover?"),
        w("rain", "La pluie.", "Il pleut. Plic, ploc !", "Où est la pluie ?", "Der Regen.", "Es regnet. Tropf, tropf!", "Wo ist der Regen?"),
        w("cloud", "Un nuage.", "Le nuage est gris.", "Où est le nuage ?", "Eine Wolke.", "Die Wolke ist grau.", "Wo ist die Wolke?"),
        w("rainbow", "Un arc-en-ciel.", "Regarde ! Un arc-en-ciel !", "Où est l'arc-en-ciel ?", "Ein Regenbogen.", "Schau! Ein Regenbogen!", "Wo ist der Regenbogen?"),
      ],
    },
    // Statt der amerikanischen Feiertage: die Feste durchs Jahr, wie man sie
    // in der Romandie und in Frankreich feiert (franzoesisch-art-2.js).
    {
      id: "fetes",
      titel: ["Les fêtes", "Die Feste"],
      intro: ["On fait la fête toute l'année ! Touche une image.", "Wir feiern das ganze Jahr! Tippe auf ein Bild."],
      woerter: [
        w("christmastree", "Un sapin de Noël.", "Le sapin de Noël brille.", "Où est le sapin de Noël ?", "Ein Weihnachtsbaum.", "Der Weihnachtsbaum leuchtet.", "Wo ist der Weihnachtsbaum?"),
        w("santa", "Le Père Noël.", "Le Père Noël apporte des cadeaux.", "Où est le Père Noël ?", "Der Weihnachtsmann.", "Der Weihnachtsmann bringt Geschenke.", "Wo ist der Weihnachtsmann?"),
        w("buche", "Une bûche de Noël.", "La bûche de Noël est au chocolat.", "Où est la bûche de Noël ?", "Ein Baumstammkuchen.", "Der Baumstammkuchen ist aus Schokolade.", "Wo ist der Baumstammkuchen?"),
        w("snowman", "Un bonhomme de neige.", "Le bonhomme de neige a froid.", "Où est le bonhomme de neige ?", "Ein Schneemann.", "Der Schneemann friert.", "Wo ist der Schneemann?"),
        w("etoile", "Une étoile.", "L'étoile brille dans le ciel.", "Où est l'étoile ?", "Ein Stern.", "Der Stern leuchtet am Himmel.", "Wo ist der Stern?"),
        w("galette", "Une galette des rois.", "Qui va trouver la fève ?", "Où est la galette des rois ?", "Ein Dreikönigskuchen.", "Wer findet die kleine Figur?", "Wo ist der Dreikönigskuchen?"),
        w("crown", "Une couronne.", "La couronne est pour le roi.", "Où est la couronne ?", "Eine Krone.", "Die Krone ist für den König.", "Wo ist die Krone?"),
        w("mask", "Un masque.", "C'est le carnaval !", "Où est le masque ?", "Eine Maske.", "Es ist Fasnacht!", "Wo ist die Maske?"),
        w("bunny", "Le lapin de Pâques.", "Le lapin de Pâques cache les œufs.", "Où est le lapin de Pâques ?", "Der Osterhase.", "Der Osterhase versteckt die Eier.", "Wo ist der Osterhase?"),
        w("easteregg", "Un œuf de Pâques.", "Cherche l'œuf de Pâques !", "Où est l'œuf de Pâques ?", "Ein Osterei.", "Such das Osterei!", "Wo ist das Osterei?"),
        w("bell", "Une cloche de Pâques.", "La cloche apporte du chocolat !", "Où est la cloche ?", "Eine Osterglocke.", "Die Glocke bringt Schokolade!", "Wo ist die Glocke?"),
        w("lampion", "Un lampion.", "Un lampion pour le premier août !", "Où est le lampion ?", "Ein Lampion.", "Ein Lampion für den ersten August!", "Wo ist der Lampion?"),
        w("fireworks", "Un feu d'artifice.", "Boum ! Un feu d'artifice !", "Où est le feu d'artifice ?", "Ein Feuerwerk.", "Bumm! Ein Feuerwerk!", "Wo ist das Feuerwerk?"),
      ],
    },
  ];

  // Wörter, die nur in den Geschichten vorkommen (das Kind kann sie im Bild
  // antippen, sie kommen ins Wörterbuch). «raccoon» ist Margot.
  const EXTRA_WOERTER = [
    w("raccoon", "Une marmotte.", "Margot est une marmotte.", "Où est la marmotte ?", "Ein Murmeltier.", "Margot ist ein Murmeltier.", "Wo ist das Murmeltier?"),
    w("box", "Une boîte.", "La boîte est ouverte.", "Où est la boîte ?", "Eine Kiste.", "Die Kiste ist offen.", "Wo ist die Kiste?"),
    w("bowtie", "Un nœud papillon.", "Un nœud papillon pour la fête !", "Où est le nœud papillon ?", "Eine Fliege.", "Eine Fliege fürs Fest!", "Wo ist die Fliege?"),
    // Die Boulangerie (franzoesisch-art-3.js) – im Wörterbuch bei «Au marché» und «Le petit train»
    w("croissant", "Un croissant.", "Le croissant est tout chaud.", "Où est le croissant ?", "Ein Gipfeli.", "Das Gipfeli ist ganz warm.", "Wo ist das Gipfeli?"),
    w("baguette", "Une baguette.", "La baguette est longue.", "Où est la baguette ?", "Ein Baguette.", "Das Baguette ist lang.", "Wo ist das Baguette?"),
    w("painchoc", "Un pain au chocolat.", "J'adore le pain au chocolat !", "Où est le pain au chocolat ?", "Ein Schoggibrötli.", "Ich liebe Schoggibrötli!", "Wo ist das Schoggibrötli?"),
    w("chocolat", "Un chocolat chaud.", "Le chocolat chaud est délicieux.", "Où est le chocolat chaud ?", "Eine heisse Schokolade.", "Die heisse Schokolade ist fein.", "Wo ist die heisse Schokolade?"),
  ];

  // Dieselben Abläufe wie im Englischwagen (dieselben Ids: die Zeichnungen
  // gehören zu ihnen), mit Margot. bilder: { en: Französisch, de: Deutsch,
  // woerter: was man darin antippen kann }.
  const GESCHICHTEN = [
    {
      id: "ball",
      welt: "farm",
      titel: ["Margot et la balle rouge.", "Margot und der rote Ball."],
      bilder: [
        { en: "Voici Margot. Margot a une balle rouge.", de: "Das ist Margot. Margot hat einen roten Ball.", woerter: ["raccoon", "ball"] },
        { en: "Margot lance la balle. Haut, haut, haut !", de: "Margot wirft den Ball. Hoch, hoch, hoch!", woerter: ["raccoon", "ball"] },
        { en: "Oh non ! La balle est dans l'arbre.", de: "Oh nein! Der Ball ist im Baum.", woerter: ["ball", "tree"] },
        { en: "Le chien saute. Merci, petit chien ! Margot est contente.", de: "Der Hund springt. Danke, kleiner Hund! Margot ist glücklich.", woerter: ["dog", "raccoon"] },
      ],
    },
    {
      id: "cat",
      welt: "house",
      titel: ["Où est le chat ?", "Wo ist die Katze?"],
      bilder: [
        { en: "Margot cherche le chat. Où est le chat ?", de: "Margot sucht die Katze. Wo ist die Katze?", woerter: ["raccoon"] },
        { en: "Le chat est sous le lit ? Non !", de: "Ist die Katze unter dem Bett? Nein!", woerter: ["bed"] },
        { en: "Le chat est sur le canapé ? Non !", de: "Ist die Katze auf dem Sofa? Nein!", woerter: ["sofa"] },
        { en: "Le chat est dans la boîte ? Oui ! Coucou, le chat !", de: "Ist die Katze in der Kiste? Ja! Hallo, Katze!", woerter: ["box", "cat"] },
      ],
    },
    {
      id: "hungry",
      welt: "kitchen",
      titel: ["Margot a faim.", "Margot hat Hunger."],
      bilder: [
        { en: "Margot a faim. Son ventre fait grrr.", de: "Margot hat Hunger. Ihr Bauch macht grrr.", woerter: ["raccoon"] },
        { en: "Une banane ? Miam !", de: "Eine Banane? Mmh!", woerter: ["banana"] },
        { en: "Du pain et du fromage ? Miam, miam !", de: "Brot und Käse? Mmh, fein!", woerter: ["bread", "cheese"] },
        { en: "Un grand gâteau ? Miam, miam, miam ! Maintenant, Margot n'a plus faim.", de: "Ein grosser Kuchen? Mmh, ist der fein! Jetzt ist Margot satt.", woerter: ["cake"] },
      ],
    },
    {
      id: "kite",
      welt: "park",
      titel: ["Margot et le cerf-volant.", "Margot und der Drachen."],
      bilder: [
        { en: "Margot a un cerf-volant. Il y a du vent !", de: "Margot hat einen Drachen. Es ist windig!", woerter: ["raccoon", "kite"] },
        { en: "Haut, haut, haut ! Le cerf-volant est dans le ciel.", de: "Hoch, hoch, hoch! Der Drachen ist am Himmel.", woerter: ["kite"] },
        { en: "Oh non ! Le cerf-volant est dans l'arbre.", de: "Oh nein! Der Drachen hängt im Baum.", woerter: ["kite", "tree"] },
        { en: "L'écureuil aide Margot. Merci, l'écureuil !", de: "Das Eichhörnchen hilft Margot. Danke, Eichhörnchen!", woerter: ["squirrel", "kite"] },
      ],
    },
    {
      id: "elephant",
      welt: "zoo",
      titel: ["Bonjour, l'éléphant !", "Hallo, Elefant!"],
      bilder: [
        { en: "Margot est au zoo. Bonjour, le singe !", de: "Margot ist im Zoo. Hallo, Affe!", woerter: ["raccoon", "monkey"] },
        { en: "Bonjour, la girafe ! La girafe est grande.", de: "Hallo, Giraffe! Die Giraffe ist gross.", woerter: ["giraffe"] },
        { en: "Où est l'éléphant ?", de: "Wo ist der Elefant?", woerter: ["raccoon"] },
        { en: "Plouf ! Voilà l'éléphant. Bonjour, l'éléphant !", de: "Platsch! Da ist der Elefant. Hallo, Elefant!", woerter: ["elephant"] },
      ],
    },
    {
      id: "wave",
      welt: "beach",
      titel: ["La grande vague.", "Die grosse Welle."],
      bilder: [
        { en: "Margot construit un château de sable.", de: "Margot baut eine Sandburg.", woerter: ["raccoon", "sandcastle"] },
        { en: "Regarde, un crabe ! Bonjour, le crabe !", de: "Schau, eine Krabbe! Hallo, Krabbe!", woerter: ["crab"] },
        { en: "Oh non ! Une grande vague !", de: "Oh nein! Eine grosse Welle!", woerter: ["wave"] },
        { en: "Le château de sable a disparu. Margot et le crabe en construisent un nouveau.", de: "Die Sandburg ist weg. Margot und die Krabbe bauen eine neue.", woerter: ["sandcastle", "crab"] },
      ],
    },
    {
      id: "schoolbus",
      welt: "city",
      titel: ["Le car scolaire jaune.", "Der gelbe Schulbus."],
      bilder: [
        { en: "Margot attend le car scolaire.", de: "Margot wartet auf den Schulbus.", woerter: ["raccoon"] },
        { en: "Voilà le car ! Il est jaune.", de: "Da kommt der Bus! Er ist gelb.", woerter: ["schoolbus"] },
        { en: "Stop ! Le feu est rouge.", de: "Halt! Die Ampel ist rot.", woerter: ["trafficlight", "schoolbus"] },
        { en: "On y va ! Le feu est vert. Au revoir !", de: "Los! Die Ampel ist grün. Tschüss!", woerter: ["trafficlight", "schoolbus"] },
      ],
    },
    {
      id: "school",
      welt: "school",
      titel: ["Margot va à l'école.", "Margot geht in die Schule."],
      bilder: [
        { en: "Margot a un nouveau sac d'école.", de: "Margot hat einen neuen Schulsack.", woerter: ["raccoon", "backpack"] },
        { en: "Bonjour, maîtresse ! Bonjour, Margot !", de: "Hallo, Frau Lehrerin! Hallo, Margot!", woerter: ["teacher", "raccoon"] },
        { en: "Margot dessine avec un crayon de couleur.", de: "Margot malt mit einem Farbstift.", woerter: ["crayon", "paper"] },
        { en: "Regarde ! Un dessin de Margot ! Bravo !", de: "Schau! Ein Bild von Margot! Super gemacht!", woerter: ["paper", "teacher"] },
      ],
    },
    {
      id: "birthday",
      welt: "party",
      titel: ["Joyeux anniversaire, Margot !", "Alles Gute zum Geburtstag, Margot!"],
      bilder: [
        { en: "C'est l'anniversaire de Margot. Elle a un chapeau de fête.", de: "Margot hat Geburtstag. Sie hat einen Partyhut.", woerter: ["raccoon", "partyhat"] },
        { en: "Voici un cadeau ! Merci !", de: "Hier ist ein Geschenk! Danke!", woerter: ["present"] },
        { en: "Un gâteau avec cinq bougies.", de: "Ein Kuchen mit fünf Kerzen.", woerter: ["cake", "candle"] },
        { en: "Fais un vœu ! Joyeux anniversaire, Margot !", de: "Wünsch dir etwas! Alles Gute zum Geburtstag, Margot!", woerter: ["raccoon", "balloon", "confetti"] },
      ],
    },
    {
      id: "washup",
      welt: "body",
      titel: ["Bonne nuit, Margot !", "Gute Nacht, Margot!"],
      bilder: [
        { en: "Margot se lave les mains.", de: "Margot wäscht sich die Hände.", woerter: ["raccoon", "hands"] },
        { en: "Elle se brosse les dents. Frotte, frotte !", de: "Sie putzt sich die Zähne. Schrubb, schrubb!", woerter: ["teeth"] },
        { en: "Elle se peigne les cheveux.", de: "Sie kämmt sich die Haare.", woerter: ["hair"] },
        { en: "Maintenant, Margot est au lit. Bonne nuit !", de: "Jetzt ist Margot im Bett. Gute Nacht!", woerter: ["raccoon"] },
      ],
    },
    {
      id: "rain",
      welt: "clothes",
      titel: ["Il pleut !", "Es regnet!"],
      bilder: [
        { en: "Il fait beau. Margot porte un t-shirt.", de: "Es ist sonnig. Margot hat ein T-Shirt an.", woerter: ["raccoon", "tshirt"] },
        { en: "Oh non ! Un gros nuage. Il pleut !", de: "Oh nein! Eine grosse Wolke. Es regnet!", woerter: ["cloud", "rain"] },
        { en: "Margot met son imperméable et ses bottes.", de: "Margot zieht ihre Regenjacke und die Stiefel an.", woerter: ["coat", "boots"] },
        { en: "Regarde ! Un arc-en-ciel !", de: "Schau! Ein Regenbogen!", woerter: ["rainbow"] },
      ],
    },
    // Neu im Französischwagen: Einkaufen auf dem Markt und in der Boulangerie.
    {
      id: "marche",
      welt: "kitchen",
      titel: ["Au marché.", "Auf dem Markt."],
      bilder: [
        { en: "Margot va au marché avec son panier.", de: "Margot geht mit ihrem Korb auf den Markt.", woerter: ["raccoon"] },
        { en: "Des pommes, s'il vous plaît ! Combien ? Trois !", de: "Äpfel, bitte! Wie viele? Drei!", woerter: ["apple"] },
        { en: "Et du fromage. Merci, madame !", de: "Und Käse. Danke, Madame!", woerter: ["cheese"] },
        { en: "À la boulangerie : une baguette, un croissant et un pain au chocolat. Miam !", de: "In der Bäckerei: ein Baguette, ein Gipfeli und ein Schoggibrötli. Mmh!", woerter: ["baguette", "croissant", "painchoc"] },
      ],
    },
    // Mit dem Zug durch Tunnel und über Brücken zu Mamie Marmotte.
    {
      id: "train",
      welt: "city",
      titel: ["Le petit train.", "Der kleine Zug."],
      bilder: [
        { en: "Margot prend le petit train. Tchou tchou !", de: "Margot fährt mit dem kleinen Zug. Tschu-tschu!", woerter: ["raccoon", "train"] },
        { en: "Le train passe dans un tunnel. Il fait tout noir !", de: "Der Zug fährt durch einen Tunnel. Es ist ganz dunkel!", woerter: ["train"] },
        { en: "Le train passe sur un pont. Regarde, le lac !", de: "Der Zug fährt über eine Brücke. Schau, der See!", woerter: ["train"] },
        { en: "Voilà Mamie Marmotte ! Elle a un chocolat chaud pour Margot.", de: "Da ist Oma Murmeltier! Sie hat eine heisse Schokolade für Margot.", woerter: ["raccoon", "chocolat"] },
      ],
    },
    // Neu im Französischwagen: Wer die Fève findet, bekommt die Krone.
    {
      id: "galette",
      welt: "fetes",
      titel: ["La galette des rois.", "Der Dreikönigskuchen."],
      bilder: [
        { en: "C'est la fête des rois. Voici la galette !", de: "Heute ist Dreikönigstag. Hier ist der Dreikönigskuchen!", woerter: ["raccoon", "galette"] },
        { en: "Margot partage la galette. Une part pour chacun !", de: "Margot teilt den Kuchen. Ein Stück für jeden!", woerter: ["galette"] },
        { en: "Oh ! Qu'est-ce que c'est ? C'est la fève !", de: "Oh! Was ist das? Die kleine Figur!", woerter: ["raccoon"] },
        { en: "Margot est la reine ! Elle porte la couronne.", de: "Margot ist die Königin! Sie trägt die Krone.", woerter: ["raccoon", "crown"] },
      ],
    },
  ];

  // Was Margot sonst sagt: [Französisch, Deutsch].
  const SAETZE = {
    hallo: ["Bonjour ! Je suis Margot. Bienvenue dans mon wagon !", "Hallo! Ich bin Margot. Willkommen in meinem Wagen!"],
    ausguck: ["Regardons par la grande fenêtre ! Où veux-tu aller ?", "Wir schauen durch das grosse Fenster! Wohin möchtest du?"],
    regal: ["Quelle histoire veux-tu ?", "Welche Geschichte möchtest du?"],
    kiste: ["On joue à Écoute et trouve ! Où veux-tu jouer ?", "Wir spielen «Hör zu und finde»! Wo möchtest du spielen?"],
    tuer: ["Cette porte va dans le wagon des calculs.", "Diese Tür führt in den Rechenwagen."],
    woerterbuch: ["Voici mon dictionnaire. Chaque mot que tu trouves est un autocollant.", "Das ist mein Wörterbuch. Jedes Wort, das du findest, ist ein Sticker."],
    stickerZu: ["Celui-là, tu ne l'as pas encore trouvé.", "Diesen hast du noch nicht gefunden."],
    aufnaeher: ["Voici mes écussons. Il y a un écusson pour chaque monde.", "Das sind meine Aufnäher. Für jede Welt gibt es einen."],
    neuerAufnaeher: ["Regarde ! Un nouvel écusson pour mon wagon !", "Schau! Ein neuer Aufnäher für meinen Wagen!"],
    allesGefunden: ["Tu as tout trouvé ! Bravo !", "Du hast alles gefunden! Super gemacht!"],
    hearfind: ["On joue à Écoute et trouve ! Écoute bien et touche l'image.", "Wir spielen «Hör zu und finde»! Hör gut zu und tippe auf das Bild."],
    rundeFertig: ["Tu les as tous trouvés ! Bravo !", "Du hast alle gefunden! Super gemacht!"],
    nochmal: ["On rejoue !", "Wir spielen nochmal!"],
    hearfindZuerst: ["D'abord, on découvre ! Après, on joue à Écoute et trouve.", "Zuerst entdecken! Dann spielen wir «Hör zu und finde»."],
    ende: ["Fin.", "Ende."],
    ganzeGeschichte: ["Écoute toute l'histoire !", "Hör die ganze Geschichte!"],
    vorschlag: ["J'ai une idée !", "Ich habe eine Idee!"],
    wortbuchTitel: ["Mon dictionnaire", "Mein Wörterbuch"],
    hearfindTitel: ["Écoute et trouve", "Hör zu und finde"],
    geschichtenTitel: ["Les histoires", "Geschichten"],
    aufnaeherTitel: ["Mes écussons", "Meine Aufnäher"],
    zurueckZimmer: ["Retour au wagon !", "Zurück in den Wagen!"],
    farbenTitel: ["Les couleurs", "Farben"],
    zahlenTitel: ["Les nombres", "Zahlen"],
    spiele: ["À quoi veux-tu jouer ?", "Was möchtest du spielen?"],
    jukebox: ["On dit une comptine ! Laquelle ?", "Wir sagen einen Vers! Welchen?"],
    buecherTitel: ["Les livres", "Bücher"],
    buch: ["Tu connais ce livre ! Maintenant en français.", "Dieses Buch kennst du! Jetzt auf Französisch."],
    ganzesBuch: ["Écoute tout le livre !", "Hör das ganze Buch!"],
    memory: ["Trouve les paires ! Une image et son mot.", "Finde die Paare! Ein Bild und sein Wort."],
    paar: ["Une paire !", "Ein Paar!"],
    keinPaar: ["Oups ! Essaie encore.", "Hoppla! Versuch es noch einmal."],
    allePaare: ["Tu as trouvé toutes les paires ! Bravo !", "Du hast alle Paare gefunden! Super gemacht!"],
    janein: ["Oui ou non ? Écoute et touche.", "Ja oder nein? Hör zu und tippe."],
    ja: ["Oui !", "Ja!"],
    nein: ["Non !", "Nein!"],
    roccosays: ["Jacques a dit ! Écoute et touche.", "Jacques hat gesagt! Hör zu und tippe."],
    farbenzug: ["On construit un train des couleurs !", "Wir bauen einen Farben-Zug!"],
    zugFertig: ["Quel joli train de toutes les couleurs ! Tchou tchou !", "Was für ein bunter Zug! Tschu-tschu!"],
    zaehlen: ["On compte avec Margot !", "Wir zählen mit Margot!"],
    zaehlenMit: ["On compte !", "Wir zählen!"],
    fuettern: ["Margot a faim ! Donne-lui ce qu'elle veut.", "Margot hat Hunger! Gib ihr, was sie möchte."],
    lecker: ["Miam ! Merci !", "Mmh, fein! Danke!"],
    neinDanke: ["Non, merci !", "Nein, danke!"],
    satt: ["Maintenant, Margot n'a plus faim. Merci !", "Jetzt ist Margot satt. Danke!"],
    geschafft: ["Bravo ! Tu as réussi !", "Super! Du hast es geschafft!"],
    schauGut: ["Regarde bien l'image ! Retiens tout.", "Schau dir das Bild gut an! Merk dir alles."],
    augenZu: ["Ferme les yeux !", "Augen zu!"],
    wasFehlt: ["Qu'est-ce qui manque ?", "Was fehlt?"],
    anziehen: ["On habille Margot !", "Wir ziehen Margot an!"],
    schick: ["Margot est très jolie ! Merci !", "Margot sieht toll aus! Danke!"],
    ordnen: ["Remets l'histoire dans l'ordre ! Qu'est-ce qui vient d'abord ?", "Bring die Geschichte in die richtige Reihenfolge! Was kommt zuerst?"],
    wasDann: ["Et ensuite ?", "Was kommt als Nächstes?"],
    danke: ["Merci !", "Danke!"],
    gernGeschehen: ["De rien !", "Gern geschehen!"],
    diner: ["Bienvenue à la boulangerie de Margot ! Qui a faim ?", "Willkommen in Margots Bäckerei! Wer hat Hunger?"],
    dinerZu: ["La boulangerie est fermée. À demain !", "Die Bäckerei ist zu. Bis morgen!"],
    post: ["Regarde ! Une carte postale de cousine Lou !", "Schau! Eine Postkarte von Cousine Lou!"],
    keinePost: ["Pas de courrier aujourd'hui. Joue un peu, et Lou écrit encore !", "Heute keine Post. Spiel ein bisschen, dann schreibt Lou wieder!"],
    echo: ["Écoute et répète ! Puis touche le micro.", "Hör zu und sag es nach! Dann tippe auf das Mikrofon."],
    echoHoer: ["Écoute-toi !", "Hör dich an!"],
    mikrofonAus: ["Le micro est éteint. Dis-le tout haut !", "Das Mikrofon ist aus. Sag es einfach laut!"],
    telefonWahl: ["Dring, dring ! Tu veux parler avec Margot ?", "Ring, ring! Möchtest du mit Margot reden?"],
    jetztDu: ["À toi de le dire !", "Jetzt sag du es!"],
    monster: ["On fabrique un monstre ! Écoute bien Margot.", "Wir bauen ein Monster! Hör Margot gut zu."],
    monsterFertig: ["Bonjour, le monstre ! Quel beau monstre !", "Hallo, Monster! Was für ein tolles Monster!"],
    wokatze: ["Où est le chat ? Écoute et touche l'image.", "Wo ist die Katze? Hör zu und tippe auf das Bild."],
    gegenteile: ["Les contraires ! Écoute et touche.", "Gegenteile! Hör zu und tippe."],
    wortbild: ["Trouve les paires ! Une image et son mot.", "Finde die Paare! Ein Bild und sein Wort."],
  };

  const LOB = [
    ["C'est ça !", "Ja, genau!"],
    ["Bravo !", "Super gemacht!"],
    ["Super !", "Toll!"],
    ["Très bien !", "Gut gemacht!"],
  ];

  // [id, Französisch, Deutsch] – nach 1, 2, 4, 6 … 60 Runden (englisch-stand.js);
  // gezeichnet im Bistrowagen (franzoesisch-art.js).
  const EINRICHTUNG = [
    ["lampe", "Regarde ! Une petite lampe !", "Schau! Eine kleine Lampe!"],
    ["nappe", "Regarde ! Une nappe à carreaux !", "Schau! Ein kariertes Tischtuch!"],
    ["fleurs", "Regarde ! Des fleurs !", "Schau! Blumen!"],
    ["rideaux", "Regarde ! Des rideaux !", "Schau! Vorhänge!"],
    ["croissants", "Regarde ! Des croissants !", "Schau! Gipfeli!"],
    ["cafetiere", "Regarde ! Une cafetière !", "Schau! Eine Kaffeekanne!"],
    ["baguette", "Regarde ! Une baguette !", "Schau! Ein Baguette!"],
    ["beret", "Regarde ! Un béret !", "Schau! Eine Baskenmütze!"],
    ["fanions", "Regarde ! Des fanions !", "Schau! Eine Wimpelkette!"],
    ["horaire", "Regarde ! Un horaire de train !", "Schau! Ein Fahrplan!"],
    ["lavande", "Regarde ! De la lavande !", "Schau! Lavendel!"],
    ["tour", "Regarde ! La tour Eiffel !", "Schau! Der Eiffelturm!"],
    ["chocolat", "Regarde ! Un chocolat chaud !", "Schau! Eine heisse Schokolade!"],
    ["guirlande", "Regarde ! Une guirlande lumineuse !", "Schau! Eine Lichterkette!"],
    ["etoiles", "Regarde ! Des étoiles !", "Schau! Sterne!"],
  ].map(([id, en, de]) => ({ id, en, de }));

  // Was der Lautsprecher oben links sagt (die Hilfe der App, auf Deutsch).
  const HILFE = {
    zimmer: "Das ist der Französischwagen. Hier wohnt Margot, das Murmeltier. Sie spricht Französisch. Tippe auf das grosse Fenster, auf das Regal mit den Geschichten, auf den Korb mit den Spielen oder auf das Wörterbuch. Der Knopf DE sagt alles auf Deutsch.",
    wahl: "Tippe auf ein Bild.",
    entdecken: "Tippe auf ein Ding im Bild. Margot sagt dir, wie es auf Französisch heisst. Tippst du noch einmal, sagt sie einen Satz dazu. Der Knopf DE sagt es auf Deutsch.",
    hearfind: "Margot sagt ein Wort auf Französisch. Tippe auf das Ding im Bild. Der Knopf DE sagt die Frage auf Deutsch.",
    geschichte: "Tippe auf ein Bild, und Margot erzählt es auf Französisch. Der Knopf DE erzählt es auf Deutsch.",
    woerterbuch: "Das ist Margots Wörterbuch. Jedes Wort, das du gefunden hast, ist ein Sticker. Tippe darauf, und du hörst es noch einmal.",
    spiele: "Das ist Margots Spielkorb. Tippe auf ein Spiel.",
    memory: "Finde die Paare: ein Bild und sein Wort. Eine Karte mit Lautsprecher sagt ein Wort auf Französisch.",
    janein: "Margot zeigt ein Bild und fragt auf Französisch. Stimmt es, tippe auf den Daumen nach oben, sonst auf den Daumen nach unten.",
    roccosays: "Jacques a dit heisst: Jacques hat gesagt. Margot sagt dir auf Französisch, welchen Ballon du antippen sollst.",
    farbenzug: "Margot sagt dir auf Französisch, welchen Wagen sie möchte. Tippe auf den Wagen in dieser Farbe.",
    zaehlen: "Zähle die Dinge und tippe auf die richtige Zahl. Margot zählt mit dir auf Französisch.",
    fuettern: "Margot sagt auf Französisch, was sie essen möchte. Tippe darauf.",
    jukebox: "Das ist das Grammophon. Tippe auf einen Vers, und Margot sagt ihn auf Französisch.",
    vers: "Tippe auf eine Zeile, und Margot sagt sie. Der grüne Knopf sagt den ganzen Vers.",
    buch: "Dieses Buch kennst du aus dem Lesewagen. Margot erzählt es auf Französisch. Tippe auf das Bild oder blättere mit den Pfeilen.",
    whatsmissing: "Schau dir das Bild gut an. Dann verschwindet ein Ding. Tippe unten auf das, was fehlt.",
    dressup: "Margot sagt auf Französisch, was sie anziehen möchte. Tippe darauf.",
    geschichtenzug: "Die Bilder der Geschichte sind durcheinander. Tippe sie der Reihe nach an: Was kommt zuerst, was dann?",
    diner: "Das ist Margots Bäckerei. Die Gäste bestellen auf Französisch. Tippe auf das, was sie möchten.",
    post: "Margots Cousine Lou reist durch Frankreich und die Romandie und schickt Postkarten. Tippe auf die Karte, und Margot liest sie vor.",
    telefon: "Margot ruft an und fragt dich etwas auf Französisch. Tippe auf eine Antwort. Wer mag, sagt sie laut nach.",
    echo: "Hör das Wort, tippe auf das Mikrofon und sag es nach. Danach hörst du dich selbst. Die Aufnahme bleibt auf diesem Gerät.",
    monster: "Margot sagt auf Französisch, wie das Monster aussehen soll: welche Farbe, wie viele Augen, Arme und Beine. Tippe auf die richtige Farbe oder Zahl.",
    wokatze: "Margot sagt auf Französisch, wo die Katze ist: in, auf, unter, hinter oder neben etwas. Tippe auf das richtige Bild.",
    gegenteile: "Margot fragt auf Französisch nach einem von zwei Bildern, zum Beispiel: Welches ist gross? Tippe darauf.",
    wortbild: "Für Kinder, die schon lesen: Finde zu jedem Bild das französische Wort.",
  };

  // ===========================================================================
  // Farben, Zahlen, Spiele
  // ===========================================================================
  // Farben: ein Wort wie die Wörter der Welten. Die Ids bleiben die des
  // Englischwagens (Zeichnungen, Sticker). akk: die deutsche Form vor
  // «Ballon» und «Wagen» («den roten Ballon»). Ballon, Wagen und Monster sind
  // männlich: Die Farbe bleibt, wie sie ist.
  const FARBEN = [
    ["red", "Rouge.", "Rot.", "#e63946", "roten"],
    ["blue", "Bleu.", "Blau.", "#3a7bd5", "blauen"],
    ["yellow", "Jaune.", "Gelb.", "#ffd23f", "gelben"],
    ["green", "Vert.", "Grün.", "#3fbf74", "grünen"],
    ["orange", "Orange.", "Orange.", "#f5a623", "orangen"],
    ["purple", "Violet.", "Violett.", "#8e5cd9", "violetten"],
    ["pink", "Rose.", "Rosa.", "#ef6fa8", "rosa"],
    ["brown", "Marron.", "Braun.", "#8a5a35", "braunen"],
    ["black", "Noir.", "Schwarz.", "#2b2f38", "schwarzen"],
    ["white", "Blanc.", "Weiss.", "#ffffff", "weissen"],
  ].map(([id, en, de, hex, akk]) => ({ id, en, de, hex, akk, farbe: true }));
  const ZAHLEN = [
    ["Un.", "Eins."], ["Deux.", "Zwei."], ["Trois.", "Drei."], ["Quatre.", "Vier."], ["Cinq.", "Fünf."],
    ["Six.", "Sechs."], ["Sept.", "Sieben."], ["Huit.", "Acht."], ["Neuf.", "Neun."], ["Dix.", "Zehn."],
  ].map(([en, de], i) => ({ id: `n${i + 1}`, n: i + 1, en, de, zahl: true }));
  const gross = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  const ohnePunkt = (t) => t.replace(/\s*[.!?]$/, "");
  const klein = (t) => t.charAt(0).toLowerCase() + t.slice(1);
  const farbWort = (f) => klein(ohnePunkt(f.en));
  // Jacques a dit : «Touche le ballon rouge !», mit Grösse «Touche le grand ballon rouge !»
  function tippeBallon(f, groesse = null) {
    const vorn = groesse ? `${groesse === "big" ? "grand" : "petit"} ` : "";
    const en = `Touche le ${vorn}ballon ${farbWort(f)} !`;
    const de = `Tippe auf den ${groesse ? `${groesse === "big" ? "grossen" : "kleinen"} ` : ""}${f.akk} Ballon!`;
    return [en, de];
  }
  // Le train des couleurs : «Un wagon bleu, s'il te plaît !»
  const wagenBitte = (f) => [`Un wagon ${farbWort(f)}, s'il te plaît !`, `Einen ${f.akk} Wagen, bitte!`];
  // Compte avec Margot : was gezählt wird.
  const ZAEHLDINGE = [
    ["duck", "canards", "Un canard !", "Enten", "Eine Ente!"],
    ["apple", "pommes", "Une pomme !", "Äpfel", "Ein Apfel!"],
    ["fish", "poissons", "Un poisson !", "Fische", "Ein Fisch!"],
    ["bird", "oiseaux", "Un oiseau !", "Vögel", "Ein Vogel!"],
    ["star", "étoiles", "Une étoile !", "Sterne", "Ein Stern!"],
    ["balloon", "ballons", "Un ballon !", "Ballone", "Ein Ballon!"],
    ["cookie", "biscuits", "Un biscuit !", "Guetzli", "Ein Guetzli!"],
    ["shell", "coquillages", "Un coquillage !", "Muscheln", "Eine Muschel!"],
  ].map(([id, viele, eins, deViele, deEins]) => ({ id, viele, eins, deViele, deEins }));
  // «Combien de canards ?», vor einem Vokal «Combien d'oiseaux ?»
  const wieViele = (d) => [`Combien ${/^[aeiouyéèêh]/i.test(d.viele) ? "d'" : "de "}${d.viele} ?`, `Wie viele ${d.deViele}?`];
  const soViele = (d, n) => (n === 1 ? [d.eins, d.deEins] : [`${ohnePunkt(ZAHLEN[n - 1].en)} ${d.viele} !`, `${ohnePunkt(ZAHLEN[n - 1].de)} ${d.deViele}!`]);
  // Le goûter de Margot : was sie möchte.
  const ESSEN = [
    ["banana", "Margot veut une banane.", "Margot möchte eine Banane."],
    ["bread", "Margot veut du pain.", "Margot möchte Brot."],
    ["milk", "Margot veut du lait.", "Margot möchte Milch."],
    ["cheese", "Margot veut du fromage.", "Margot möchte Käse."],
    ["egg", "Margot veut un œuf.", "Margot möchte ein Ei."],
    ["cake", "Margot veut un gâteau.", "Margot möchte einen Kuchen."],
    ["pancakes", "Margot veut des crêpes.", "Margot möchte Crêpes."],
    ["cookie", "Margot veut un biscuit.", "Margot möchte ein Guetzli."],
    ["juice", "Margot veut du jus d'orange.", "Margot möchte Orangensaft."],
    ["apple", "Margot veut une pomme.", "Margot möchte einen Apfel."],
    ["icecream", "Margot veut une glace.", "Margot möchte eine Glace."],
  ].map(([id, en, de]) => ({ id, will: [en, de] }));
  // Oui ou non ? : «C'est une vache ?», «Ce sont des bottes ?», «C'est maman ?»
  function istDas(x) {
    const wort = ohnePunkt(x.en);
    const mehrere = /^(Des|Les) /.test(wort);
    const name = ["mom", "dad"].includes(x.id);
    const en = `${mehrere ? "Ce sont" : "C'est"} ${name ? wort.toLowerCase() : klein(wort)} ?`;
    const deWort = ohnePunkt(x.de);
    // Nur der Artikel wird klein («eine Kuh»), das Nomen bleibt gross («Brot»).
    const deKlein = /^(Der|Die|Das|Ein|Eine) /.test(deWort) ? klein(deWort) : deWort;
    const de = `${/^Wo sind/.test(x.deFrage) ? "Sind" : "Ist"} das ${deKlein}?`;
    return [en, de];
  }
  // Die Spiele im Spielkorb. gruppe: in welcher Reihe (SPIEL_GRUPPEN).
  const SPIELE = [
    { id: "hearfind", gruppe: "woerter", titel: ["Écoute et trouve", "Hör zu und finde"] },
    { id: "memory", gruppe: "woerter", titel: ["Memory", "Memory"] },
    { id: "janein", gruppe: "woerter", titel: ["Oui ou non ?", "Ja oder nein?"] },
    { id: "roccosays", gruppe: "farben", titel: ["Jacques a dit", "Jacques hat gesagt"] },
    { id: "farbenzug", gruppe: "farben", titel: ["Le train des couleurs", "Farben-Zug"] },
    { id: "zaehlen", gruppe: "farben", titel: ["Compte avec Margot", "Zählen mit Margot"] },
    { id: "fuettern", gruppe: "rocco", titel: ["Le goûter de Margot", "Margots Zvieri"] },
    { id: "whatsmissing", gruppe: "woerter", titel: ["Qu'est-ce qui manque ?", "Was fehlt?"] },
    { id: "dressup", gruppe: "rocco", titel: ["Habille Margot", "Margot anziehen"] },
    { id: "geschichtenzug", gruppe: "rocco", titel: ["Le train des histoires", "Geschichtenzug"] },
    { id: "diner", gruppe: "rocco", titel: ["La boulangerie", "Die Bäckerei"] },
    { id: "monster", gruppe: "farben", titel: ["Le monstre", "Ein Monster bauen"] },
    { id: "wokatze", gruppe: "rocco", titel: ["Où est le chat ?", "Wo ist die Katze?"] },
    { id: "gegenteile", gruppe: "woerter", titel: ["Les contraires", "Gegenteile"] },
    { id: "wortbild", gruppe: "woerter", titel: ["Memory des mots", "Wortbild-Memory"] },
  ];
  const SPIEL_GRUPPEN = [
    { id: "woerter", titel: ["Les mots", "Wörter"] },
    { id: "farben", titel: ["Couleurs et nombres", "Farben und Zahlen"] },
    { id: "rocco", titel: ["Jouer avec Margot", "Spielen mit Margot"] },
  ];
  // Le monstre : was Margot möchte. [Teil, Anzahl, Französisch, Deutsch]
  const ZAHLWORT = ["", "un", "deux", "trois", "quatre", "cinq"];
  const DE_ZAHL = ["", "ein", "zwei", "drei", "vier", "fünf"];
  const MONSTER_TEILE = [
    ...[1, 2, 3, 4, 5].map((n) => ({ teil: "augen", n, satz: [`Donne ${n === 1 ? "un œil" : `${ZAHLWORT[n]} yeux`} au monstre !`, `Gib dem Monster ${DE_ZAHL[n]} ${n === 1 ? "Auge" : "Augen"}!`] })),
    ...[1, 2, 3, 4].map((n) => ({ teil: "arme", n, satz: [`Donne ${ZAHLWORT[n]} bras au monstre !`, `Gib dem Monster ${n === 1 ? "einen" : DE_ZAHL[n]} ${n === 1 ? "Arm" : "Arme"}!`] })),
    ...[1, 2, 3, 4].map((n) => ({ teil: "beine", n, satz: [`Donne ${n === 1 ? "une jambe" : `${ZAHLWORT[n]} jambes`} au monstre !`, `Gib dem Monster ${DE_ZAHL[n]} ${n === 1 ? "Bein" : "Beine"}!`] })),
  ];
  const monsterFarbe = (f) => [`Un monstre ${farbWort(f)}, s'il te plaît !`, `Mach das Monster ${f.de.replace(/\.$/, "").toLowerCase()}!`];
  // Où est le chat ? : [wo, Ding, Französisch, Deutsch]
  const WO_KATZE = [
    ["in", "box", "Le chat est dans la boîte.", "Die Katze ist in der Kiste."],
    ["on", "box", "Le chat est sur la boîte.", "Die Katze ist auf der Kiste."],
    ["behind", "box", "Le chat est derrière la boîte.", "Die Katze ist hinter der Kiste."],
    ["next", "box", "Le chat est à côté de la boîte.", "Die Katze ist neben der Kiste."],
    ["in", "bed", "Le chat est dans le lit.", "Die Katze ist im Bett."],
    ["on", "bed", "Le chat est sur le lit.", "Die Katze ist auf dem Bett."],
    ["under", "bed", "Le chat est sous le lit.", "Die Katze ist unter dem Bett."],
    ["next", "bed", "Le chat est à côté du lit.", "Die Katze ist neben dem Bett."],
    ["on", "table", "Le chat est sur la table.", "Die Katze ist auf dem Tisch."],
    ["under", "table", "Le chat est sous la table.", "Die Katze ist unter dem Tisch."],
    ["behind", "table", "Le chat est derrière la table.", "Die Katze ist hinter dem Tisch."],
    ["next", "table", "Le chat est à côté de la table.", "Die Katze ist neben dem Tisch."],
    ["on", "chair", "Le chat est sur la chaise.", "Die Katze ist auf dem Stuhl."],
    ["under", "chair", "Le chat est sous la chaise.", "Die Katze ist unter dem Stuhl."],
    ["next", "chair", "Le chat est à côté de la chaise.", "Die Katze ist neben dem Stuhl."],
    ["in", "basket", "Le chat est dans le panier.", "Die Katze ist im Korb."],
    ["behind", "basket", "Le chat est derrière le panier.", "Die Katze ist hinter dem Korb."],
    ["next", "basket", "Le chat est à côté du panier.", "Die Katze ist neben dem Korb."],
  ].map(([wo, ding, en, de]) => ({ wo, ding, satz: [en, de] }));
  // Les contraires : Paare, je mit Frage und Antwort.
  const GEGENTEILE = [
    ["big", "small", "Grand", "Petit", "Gross", "Klein"],
    ["hot", "cold", "Chaud", "Froid", "Heiss", "Kalt"],
    ["happy", "sad", "Content", "Triste", "Fröhlich", "Traurig"],
    ["full", "empty", "Plein", "Vide", "Voll", "Leer"],
    ["open", "closed", "Ouvert", "Fermé", "Offen", "Zu"],
    ["fast", "slow", "Rapide", "Lent", "Schnell", "Langsam"],
    ["day", "night", "Le jour", "La nuit", "Tag", "Nacht"],
    ["tall", "short", "Haut", "Bas", "Hoch", "Niedrig"],
  ].map(([a, b, aFr, bFr, aDe, bDe]) => ({ paar: [a, b], en: [aFr, bFr], de: [aDe, bDe] }));
  // «Lequel est grand ?» – und die Antwort «Oui ! Grand ! Et celui-ci est petit.»
  function gegenteilFrage(g, i) {
    const zeit = g.paar[0] === "day";
    const en = zeit ? `Où est ${klein(g.en[i])} ?` : `Lequel est ${klein(g.en[i])} ?`;
    const de = zeit ? `Wo ist ${g.de[i] === "Tag" ? "der Tag" : "die Nacht"}?` : `Welches ist ${g.de[i].toLowerCase()}?`;
    return [en, de];
  }
  function gegenteilAntwort(g, i) {
    const j = 1 - i;
    const zeit = g.paar[0] === "day";
    const en = zeit ? `Oui ! ${g.en[i]} ! Et ça, c'est ${klein(g.en[j])}.` : `Oui ! ${g.en[i]} ! Et celui-ci est ${klein(g.en[j])}.`;
    const de = zeit ? `Ja! ${g.de[i]}! Und das ist ${g.de[j] === "Tag" ? "der Tag" : "die Nacht"}.` : `Ja! ${g.de[i]}! Und das ist ${g.de[j].toLowerCase()}.`;
    return [en, de];
  }
  // Für die Eltern (Elternkarte): kleine Aufträge für zuhause, je Welt.
  const AUFTRAEGE = {
    farm: "Beim Spazieren: Wer zuerst ein Tier sieht, sagt es auf Französisch («Une vache !», «Un chien !»).",
    house: "Beim Aufräumen: «Où est le nounours ?» – und das Kind zeigt darauf.",
    kitchen: "Beim Znacht: «Du pain, s'il te plaît.» – «Voilà !» – «Merci !»",
    park: "Auf dem Spielplatz: «À moi !» und «À toi !» beim Rutschen.",
    zoo: "Ein Tier nachmachen und raten: «Tu es un singe ?» – «Oui !»",
    beach: "In der Badi oder Badewanne: «Plouf !» und «Il fait chaud !»",
    city: "Unterwegs Autos zählen: «Une voiture, deux voitures, trois voitures …»",
    school: "Beim Zeichnen: «Le crayon rouge, s'il te plaît.»",
    party: "Am nächsten Geburtstag zusammen «Joyeux anniversaire !» singen.",
    body: "Vor dem Zähneputzen: «Brosse-toi les dents !» – «Touche ton nez !»",
    clothes: "Beim Anziehen: «Mets ton pull !» – und aus dem Fenster: «Il pleut !» oder «Il fait beau !»",
    fetes: "Beim nächsten Fest auf Französisch wünschen: «Joyeux Noël !», «Joyeuses Pâques !» oder am 1. August «Bonne fête !»",
  };

  // Am Telefon im Wagen: anrufen oder Echo.
  const TELEFON_SPIELE = [
    { id: "telefon", titel: ["Allô, Margot ?", "Margot anrufen"] },
    { id: "echo", titel: ["Écho", "Echo"] },
  ];
  // Habille Margot : was sie anzieht. [Wort, Auftrag Französisch, Auftrag Deutsch]
  const KLEIDER = [
    ["hat", "Mets le chapeau !", "Setz den Hut auf!"],
    ["sunglasses", "Mets les lunettes de soleil !", "Setz die Sonnenbrille auf!"],
    ["partyhat", "Mets le chapeau de fête !", "Setz den Partyhut auf!"],
    ["scarf", "Mets l'écharpe !", "Leg den Schal um!"],
    ["boots", "Mets les bottes !", "Zieh die Stiefel an!"],
    ["bowtie", "Mets le nœud papillon !", "Binde die Fliege um!"],
  ].map(([id, en, de]) => ({ id, anziehen: [en, de] }));
  // Allô, Margot ? : Margot ruft an, das Kind antwortet mit Bildknöpfen. Die
  // Antworten passen für Mädchen und Buben («J'ai sommeil» statt «Je suis
  // fatigué»).
  const a = (id, en, de, antwort = null) => ({ id, satz: [en, de], antwort });
  const TELEFON = [
    { frage: ["Dring, dring ! Allô ! C'est Margot. Comment ça va ?", "Ring, ring! Hallo! Hier ist Margot. Wie geht es dir?"], art: "gefuehl", antworten: [
      a("froh", "Ça va bien, merci !", "Mir geht es gut, danke!", ["Super ! Moi aussi, ça va bien.", "Super! Mir geht es auch gut."]),
      a("muede", "J'ai sommeil.", "Ich bin müde.", ["Oh ! C'est l'heure de la sieste !", "Oh! Zeit für ein Schläfchen!"]),
      a("traurig", "Je suis triste.", "Ich bin traurig.", ["Oh non ! Je te fais un gros câlin !", "Oh nein! Hier ist eine grosse Umarmung!"]),
    ] },
    { frage: ["Tu as quel âge ?", "Wie alt bist du?"], art: "zahl", antworten: [3, 4, 5, 6, 7, 8].map((n) => a(`n${n}`, `J'ai ${["trois", "quatre", "cinq", "six", "sept", "huit"][n - 3]} ans.`, `Ich bin ${["drei", "vier", "fünf", "sechs", "sieben", "acht"][n - 3]}.`, ["Waouh ! C'est super !", "Wow! Das ist toll!"])) },
    { frage: ["Quelle est ta couleur préférée ?", "Was ist deine Lieblingsfarbe?"], art: "farbe", antworten: ["red", "blue", "yellow", "green", "pink", "purple"].map((f) => {
      const fr = { red: "le rouge", blue: "le bleu", yellow: "le jaune", green: "le vert", pink: "le rose", purple: "le violet" }[f];
      const de = { red: "Rot", blue: "Blau", yellow: "Gelb", green: "Grün", pink: "Rosa", purple: "Violett" }[f];
      return a(f, `Ma couleur préférée, c'est ${fr}.`, `Meine Lieblingsfarbe ist ${de}.`, ["Moi aussi ! Je l'aime bien.", "Ich auch! Die mag ich auch."]);
    }) },
    { frage: ["Quel est ton animal préféré ?", "Was ist dein Lieblingstier?"], art: "tier", antworten: [
      a("dog", "Mon animal préféré, c'est le chien.", "Mein Lieblingstier ist der Hund.", ["Ouaf ! Moi aussi, j'aime les chiens.", "Wau! Hunde mag ich auch."]),
      a("cat", "Mon animal préféré, c'est le chat.", "Mein Lieblingstier ist die Katze.", ["Miaou ! Moi aussi, j'aime les chats.", "Miau! Katzen mag ich auch."]),
      a("lion", "Mon animal préféré, c'est le lion.", "Mein Lieblingstier ist der Löwe.", ["Grrr ! Moi aussi, j'aime les lions.", "Grrr! Löwen mag ich auch."]),
      a("elephant", "Mon animal préféré, c'est l'éléphant.", "Mein Lieblingstier ist der Elefant.", ["Waouh ! Moi aussi, j'aime les éléphants.", "Wow! Elefanten mag ich auch."]),
      a("penguin", "Mon animal préféré, c'est le pingouin.", "Mein Lieblingstier ist der Pinguin.", ["Super ! Moi aussi, j'aime les pingouins.", "Cool! Pinguine mag ich auch."]),
      a("raccoon", "Mon animal préféré, c'est la marmotte.", "Mein Lieblingstier ist das Murmeltier.", ["Moi ? Merci ! Moi aussi, je t'aime bien !", "Ich? Danke! Ich mag dich auch!"]),
    ] },
    { frage: ["Merci d'avoir appelé ! Au revoir !", "Danke für deinen Anruf! Tschüss!"], art: "tschuess", antworten: [
      a("winken", "Au revoir, Margot !", "Tschüss, Margot!", ["Salut ! À bientôt !", "Tschüss! Bis bald!"]),
    ] },
  ];
  // La boulangerie: Gäste bestellen («Je voudrais un croissant, s'il te plaît !»).
  // Deutsch im Akkusativ: «Ich möchte einen Kuchen, bitte!»
  const bitte = (fr) => `Je voudrais ${klein(ohnePunkt(fr))}, s'il te plaît !`;
  const deKlein = (t) => (/^(Der|Die|Das|Ein|Eine) /.test(t) ? klein(t) : t);
  const akk = (de) => de.replace(/\bein Kuchen\b/g, "einen Kuchen");
  const deBitte = (de) => `Ich möchte ${akk(deKlein(ohnePunkt(de)))}, bitte!`;
  const DINER_GAESTE = ["dog", "cat", "bear", "penguin", "monkey"];
  const DINER_ESSEN = ["croissant", "baguette", "painchoc", "chocolat", "bread", "cake", "cookie", "milk", "juice", "icecream"];
  const DINER_PAARE = [["croissant", "chocolat"], ["painchoc", "milk"], ["baguette", "juice"], ["cake", "chocolat"], ["cookie", "milk"], ["croissant", "juice"], ["painchoc", "chocolat"], ["icecream", "cookie"]];
  // Die Post von Cousine Lou, eine neue alle paar Runden (franzoesisch-art-3.js).
  const POSTKARTEN = [
    { id: "geneve", ab: 0, text: ["Coucou de Genève ! Le jet d'eau est très haut. Bisous, Lou.", "Hallo aus Genf! Der Springbrunnen ist sehr hoch. Liebe Grüsse, Lou."] },
    { id: "paris", ab: 4, text: ["Coucou de Paris ! Regarde la tour Eiffel. Bisous, Lou.", "Hallo aus Paris! Schau den Eiffelturm an. Liebe Grüsse, Lou."] },
    { id: "montblanc", ab: 10, text: ["Coucou du Mont-Blanc ! Il y a beaucoup de neige. Brrr ! Bisous, Lou.", "Hallo vom Mont Blanc! Brrr, hier hat es viel Schnee. Liebe Grüsse, Lou."] },
    { id: "provence", ab: 18, text: ["Coucou de Provence ! La lavande sent bon. Bisous, Lou.", "Hallo aus der Provence! Der Lavendel duftet fein. Liebe Grüsse, Lou."] },
    { id: "bretagne", ab: 28, text: ["Coucou de Bretagne ! Je vois un phare et la mer. Bisous, Lou.", "Hallo aus der Bretagne! Ich sehe einen Leuchtturm und das Meer. Liebe Grüsse, Lou."] },
  ];

  // Das Grammophon: Kinderverse, gesprochen. bild: was zur Zeile gezeichnet
  // wird («rocco» ist Margot).
  const z = (en, de, bild = []) => ({ en, de, bild });
  const VERSE = [
    { id: "bonjour", titel: ["Bonjour, bonjour !", "Hallo, hallo!"], zeilen: [
      z("Bonjour, bonjour, comment ça va ?", "Hallo, hallo, wie geht es dir?", ["rocco"]),
      z("Ça va bien, ça va bien, et toi, ça va ?", "Mir geht es gut, und dir, wie geht es dir?", ["rocco"]),
      z("Bonjour, bonjour, bonjour à toi !", "Hallo, hallo, hallo du!", ["rocco"]),
      z("Au revoir, au revoir, à bientôt !", "Tschüss, tschüss, bis bald!", ["rocco"]),
    ] },
    { id: "bois", titel: ["Un, deux, trois, nous irons au bois", "Eins, zwei, drei, wir gehen in den Wald"], zeilen: [
      z("Un, deux, trois, nous irons au bois.", "Eins, zwei, drei, wir gehen in den Wald.", ["tree", "tree", "tree"]),
      z("Quatre, cinq, six, cueillir des cerises.", "Vier, fünf, sechs, wir pflücken Kirschen.", ["apple", "apple", "apple"]),
      z("Sept, huit, neuf, dans mon panier neuf.", "Sieben, acht, neun, in meinen neuen Korb.", ["rocco"]),
      z("Dix, onze, douze, elles seront toutes rouges !", "Zehn, elf, zwölf, sie werden alle rot sein!", ["apple"]),
    ] },
    { id: "souris", titel: ["Une souris verte", "Eine grüne Maus"], zeilen: [
      z("Une souris verte qui courait dans l'herbe.", "Eine grüne Maus rannte durchs Gras.", ["flower"]),
      z("Je l'attrape par la queue, je la montre à ces messieurs.", "Ich packe sie am Schwanz und zeige sie den Herren.", ["rocco"]),
      z("Ces messieurs me disent : trempez-la dans l'huile, trempez-la dans l'eau.", "Die Herren sagen: Tunkt sie ins Öl, tunkt sie ins Wasser.", ["wave"]),
      z("Ça fera un escargot tout chaud !", "Dann wird daraus eine warme Schnecke!", ["sun"]),
    ] },
    { id: "tete", titel: ["Tête, épaules, genoux et pieds", "Kopf, Schultern, Knie und Füsse"], zeilen: [
      z("Tête, épaules, genoux et pieds, genoux et pieds.", "Kopf, Schultern, Knie und Füsse, Knie und Füsse.", ["rocco"]),
      z("Tête, épaules, genoux et pieds, genoux et pieds.", "Kopf, Schultern, Knie und Füsse, Knie und Füsse.", ["rocco"]),
      z("Et deux yeux, et deux oreilles, et une bouche et un nez.", "Und zwei Augen und zwei Ohren und ein Mund und eine Nase.", ["rocco"]),
      z("Tête, épaules, genoux et pieds, genoux et pieds !", "Kopf, Schultern, Knie und Füsse, Knie und Füsse!", ["rocco"]),
    ] },
    { id: "mathurin", titel: ["Dans la ferme de Mathurin", "Auf dem Bauernhof von Mathurin"], zeilen: [
      z("Dans la ferme de Mathurin, i-a-i-a-o.", "Auf dem Bauernhof von Mathurin, i-a-i-a-o.", ["barn"]),
      z("Il y a des vaches, i-a-i-a-o.", "Da gibt es Kühe, i-a-i-a-o.", ["cow"]),
      z("Et j'entends meuh par ici, et j'entends meuh par là.", "Und ich höre muh hier, und ich höre muh da.", ["cow"]),
      z("Ici meuh, là meuh, partout meuh meuh !", "Hier muh, da muh, überall muh-muh!", ["cow", "cow"]),
      z("Dans la ferme de Mathurin, i-a-i-a-o !", "Auf dem Bauernhof von Mathurin, i-a-i-a-o!", ["barn"]),
    ] },
  ];
  // Bekannte Bücher aus dem Lesewagen, ganz einfach auf Französisch: ein Satz
  // (oder zwei) je Seite, mit den gemalten Bildern der Leseecke.
  const BUECHER = [
    { id: "hase-rueebli", titel: ["Où est la carotte ?", "Wo ist das Rüebli?"], seiten: [
      ["Voici Hoppel. Hoppel est un petit lapin. Il a faim.", "Das ist Hoppel. Hoppel ist ein kleiner Hase. Er hat Hunger."],
      ["Hoppel veut une carotte. Où est la carotte ?", "Hoppel möchte ein Rüebli. Wo ist das Rüebli?"],
      ["Sous la fleur ? Non ! Une coccinelle.", "Unter der Blume? Nein! Ein Marienkäfer."],
      ["Derrière le buisson ? Non ! Un escargot.", "Hinter dem Busch? Nein! Eine Schnecke."],
      ["Hoppel, viens ici ! Mia a une grosse carotte !", "Hoppel, komm her! Mia hat ein grosses Rüebli!"],
      ["Mia dit : on partage !", "Mia sagt: Wir teilen!"],
      ["Crac, crac ! Miam !", "Knack, knack! Fein!"],
    ] },
    { id: "leo-melone", titel: ["Léo et la pastèque.", "Leo und die Melone."], seiten: [
      ["Voici Léo.", "Das ist Leo."],
      ["Léo aime les pastèques.", "Leo mag Melonen."],
      ["Regarde ! Une pastèque !", "Schau! Eine Melone!"],
      ["Léo fait rouler la pastèque.", "Leo rollt die Melone."],
      ["Oh non ! La pastèque roule, roule, roule.", "Oh nein! Die Melone rollt und rollt."],
      ["Mamie Rosa crie : stop !", "Oma Rosa ruft: Halt!"],
      ["Léo et Mamie Rosa mangent la pastèque. Miam !", "Leo und Oma Rosa essen die Melone. Fein!"],
    ] },
    { id: "pino-insel", titel: ["Pino et l'île.", "Pino und die Insel."], seiten: [
      ["Voici Pino.", "Das ist Pino."],
      ["Pino veut aller sur l'île.", "Pino will auf die Insel."],
      ["Regarde ! Un bateau !", "Schau! Ein Boot!"],
      ["Pino est dans le bateau.", "Pino ist im Boot."],
      ["Tut tut ! C'est parti !", "Tuut tuut! Los geht es!"],
      ["Youpi ! Le bateau se balance.", "Hui! Das Boot schaukelt."],
      ["Pino est sur l'île.", "Pino ist auf der Insel."],
      ["L'île est super !", "Die Insel ist toll!"],
    ] },
    { id: "mia-ball", titel: ["Mia et la balle.", "Mia und der Ball."], seiten: [
      ["Voici Mia.", "Das ist Mia."],
      ["Mia a une balle.", "Mia hat einen Ball."],
      ["La balle est rouge.", "Der Ball ist rot."],
      ["Mia lance la balle en l'air.", "Mia wirft den Ball hoch."],
      ["Oh non ! La balle est dans l'arbre.", "Oh nein! Der Ball ist im Baum."],
      ["Ella la chouette va chercher la balle.", "Eule Ella holt den Ball."],
      ["Merci, Ella ! Mia et Ella rient.", "Danke, Ella! Mia und Ella lachen."],
    ] },
    { id: "bruno-sterne", titel: ["Bruno compte les étoiles.", "Bruno zählt die Sterne."], seiten: [
      ["Voici Bruno, le petit ours. C'est la nuit.", "Das ist Bruno, der kleine Bär. Es ist Nacht."],
      ["Mais Bruno n'a pas sommeil. Il regarde le ciel.", "Aber Bruno ist nicht müde. Er schaut zum Himmel."],
      ["Regarde ! Des étoiles ! Un, deux, trois, quatre.", "Schau! Sterne! Eins, zwei, drei, vier."],
      ["Ella la chouette demande : qu'est-ce que tu fais, Bruno ?", "Eule Ella fragt: Was machst du, Bruno?"],
      ["Je compte les étoiles !", "Ich zähle die Sterne!"],
      ["Cinq, six, sept. Maintenant, Bruno a sommeil.", "Fünf, sechs, sieben. Jetzt ist Bruno müde."],
      ["Huit. Bruno dort. Bonne nuit, Bruno !", "Acht. Bruno schläft. Gute Nacht, Bruno!"],
    ] },
  ];

  // Die Wortbild-Memory zeigt das Wort zum Lesen. Im Englischwagen ohne
  // Artikel («cow»); im Französischen gehört er dazu, der bestimmte wie in der
  // Frage: «la vache», «l'arbre», «les yeux».
  function lesewort(x) {
    const m = /^Où (?:est|sont) (.+?) \?$/.exec(x.frage || "");
    return m ? m[1] : klein(ohnePunkt(x.en));
  }

  // Alles, was gesprochen wird, als Paar [Französisch, Deutsch] mit seinem Ort –
  // für die Aufnahmen (scripts/stimme-franzoesisch-texte.mjs) und die Prüfung.
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
    SPIEL_GRUPPEN.forEach((g) => dazu(g.titel[0], g.titel[1], `spielgruppe ${g.id}`));
    const wortVon = (id) => [...WELTEN.flatMap((x) => x.woerter), ...EXTRA_WOERTER].find((x) => x.id === id);
    DINER_ESSEN.forEach((id) => { const x = wortVon(id); dazu(bitte(x.en), deBitte(x.de), `diner ${id}`); });
    DINER_PAARE.forEach(([p, q]) => { const [en, de] = dinerPaar(p, q); dazu(en, de, `diner ${p}+${q}`); });
    POSTKARTEN.forEach((k) => dazu(k.text[0], k.text[1], `post ${k.id}`));
    MONSTER_TEILE.forEach((t) => dazu(t.satz[0], t.satz[1], `monster ${t.teil} ${t.n}`));
    FARBEN.forEach((f) => { const [en, de] = monsterFarbe(f); dazu(en, de, `monster ${f.id}`); });
    WO_KATZE.forEach((x) => dazu(x.satz[0], x.satz[1], `wokatze ${x.wo} ${x.ding}`));
    GEGENTEILE.forEach((g) => [0, 1].forEach((i) => {
      dazu(...gegenteilFrage(g, i), `gegenteile ${g.paar[i]}`);
      dazu(...gegenteilAntwort(g, i), `gegenteile ${g.paar[i]}`);
    }));
    return liste;
  }

  // «Je voudrais un croissant et un chocolat chaud, s'il te plaît !»
  function dinerPaar(p, q) {
    const alle = [...WELTEN.flatMap((x) => x.woerter), ...EXTRA_WOERTER];
    const [x, y] = [p, q].map((id) => alle.find((v) => v.id === id));
    return [`Je voudrais ${klein(ohnePunkt(x.en))} et ${klein(ohnePunkt(y.en))}, s'il te plaît !`, `Ich möchte ${akk(deKlein(ohnePunkt(x.de)))} und ${akk(deKlein(ohnePunkt(y.de)))}, bitte!`];
  }

  // In der Schrift: kein Zeilenumbruch vor ? ! : ; (französisch steht davor
  // ein Leerzeichen), und die Artikel dezent eingefärbt – le und un blau, la
  // und une rot, les und des grün, l' grau. Gesprochen wird der Text, wie er
  // ist (kids.js macht aus jedem Leerraum ein Leerzeichen).
  const ARTIKEL_KLASSE = { le: "fr-le", un: "fr-le", la: "fr-la", une: "fr-la", les: "fr-les", des: "fr-les", "l'": "fr-l" };
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  function schrift(text) {
    const fein = String(text).replace(/ ([?!:;»])/g, " $1").replace(/« /g, "« ");
    return esc(fein).replace(/(^|[\s «(])(l'|le|la|les|un|une|des)(?=[\s ]|$)|(^|[\s «(])(l')(?=[^\s])/gi, (ganz, v1, w1, v2, w2) => {
      const vor = v1 ?? v2 ?? "";
      const art = w1 ?? w2;
      return `${vor}<span class="${ARTIKEL_KLASSE[art.toLowerCase()]}">${art}</span>`;
    });
  }

  window.LernappFranzoesischInhalt = {
    WELTEN, EXTRA_WOERTER, GESCHICHTEN, SAETZE, LOB, EINRICHTUNG, HILFE,
    FARBEN, ZAHLEN, ZAEHLDINGE, ESSEN, SPIELE, VERSE, BUECHER,
    tippeBallon, wagenBitte, wieViele, soViele, istDas, paare, gross, lesewort, schrift,
    SPIEL_GRUPPEN, MONSTER_TEILE, monsterFarbe, WO_KATZE, GEGENTEILE, gegenteilFrage, gegenteilAntwort, AUFTRAEGE,
    KLEIDER, TELEFON, TELEFON_SPIELE, DINER_GAESTE, DINER_ESSEN, DINER_PAARE, POSTKARTEN, bitte, deBitte, dinerPaar,
  };
})();
