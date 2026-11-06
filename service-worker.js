const APP_VERSION = "2026-11-06-1";
const CACHE_PREFIX = "lernapp-pwa-";
const CACHE_NAME = `${CACHE_PREFIX}${APP_VERSION}`;
const ASSET_VERSION_QUERY = `?v=${APP_VERSION}`;
const FALLBACK_DOCUMENT = "./index.html";

// Nach so vielen Millisekunden gilt das Netz als zu zäh und der Cache
// antwortet. Ohne diese Schranke wartet ein Abruf am schlechten Mobilnetz
// beliebig lange – die installierte App bliebe dabei auf einem leeren Bild
// stehen, und von aussen sieht das aus, als starte sie gar nicht.
const NETWORK_TIMEOUT_MS = 3500;

// Die gemalten Bilder der Bücher (bilder/buecher/…) sind gross und ändern sich
// selten. Sie liegen in einem eigenen Cache, den ein Versionswechsel der App
// nicht leert: Ein Buch, das einmal offen war, hat seine Bilder auch nach
// einem Update ohne Netz. Wird ein einzelnes Bild ersetzt, kommt es in
// ERNEUERT_BILDER (unten); eine neue Nummer hier holt alle Bilder neu. Ein
// Bild darf länger laden als eine Seite: Fehlt es, zeigt das Buch seine
// Zeichnung. Die gemalten Postkarten (bilder/postkarten/…), Steckbriefe
// (bilder/steckbriefe/…), die Monster der Quatschwörter (bilder/monster/…)
// und die gemalten Wimmelbilder und Geschichten der Englischecke
// (bilder/englisch/…) und der Französischecke (bilder/franzoesisch/…) liegen
// im selben Cache.
const BUCHBILDER_CACHE = "lernapp-buchbilder-1";
const BUCHBILDER_TIMEOUT_MS = 20000;

// Die Aufnahmen fester Texte mit Alains Stimme (stimme/alain/,
// lesen-stimme.js) und die Sätze mit einer Stimme von Google (stimme/google/,
// app-stimme.js und bau-stimme.js), Roccos Englisch (stimme/englisch/,
// englisch-stimme.js) und Margots Französisch (stimme/franzoesisch/,
// franzoesisch-stimme.js) halten es wie die Buchbilder: ein eigener
// Cache, den ein Versionswechsel nicht leert – ein Satz, der einmal zu hören
// war, ist es auch ohne Netz. Eine Datei heisst nach ihrem Text; wird derselbe
// Text neu gesprochen, kommt sie in ERNEUERT_STIMME (unten) – eine neue Nummer
// hier, wenn alles neu gesprochen ist (eine andere Stimme). Lädt eine
// Aufnahme nicht, spricht die Gerätestimme (kids.js).
const STIMME_CACHE = "lernapp-stimme-1";
const STIMME_TIMEOUT_MS = 8000;

// Einzelne Dateien, die unter ihrem alten Namen neu sind – ein neu gemaltes
// Bild, ein neu gesprochener Satz. Statt einen ganzen Cache mit neuer Nummer zu
// leeren (dann wäre auf dem Gerät ohne Netz alles weg), nimmt der Service
// Worker beim Aktivieren nur sie heraus, einmal je ERNEUERT_NR: Das Gerät holt
// sie beim nächsten Mal neu, alles andere bleibt. Kommt etwas dazu: anhängen
// und ERNEUERT_NR um eins erhöhen. Aufnahmen stehen ohne Ordner und Endung da
// (stimme/google/<name>.mp3).
const ERNEUERT_NR = 2;
const ERNEUERT_BILDER = [
  // November 2026: Das grosse Bergrennen, Seite 7 – Sepp hatte drei Hörner.
  "bilder/buecher/bergrennen/seite-07.webp",
];
const ERNEUERT_STIMME = [
  // November 2026: «Kapitel 3.» und 582 andere Sätze mit einer Zahl und einem
  // Punkt klangen als Ordnungszahl («Kapitel dritte», «Station 1 von zehnte»).
  "2518250c3173", "ae49b00b15cb", "892f6e09c02c", "c977dbe78522", "6bc54f13bea5", "267c23695b6e", "540dd397b2d3", "d80edd7fb074",
  "a50aa8b9a980", "6ce012fd1056", "99a1b84b9865", "e3b7e7a038be", "5bc524c305cc", "25602777cecc", "352e15aaca7d", "45d873d4bfdc",
  "205812a9ce3f", "3ec1d1e80d46", "264c32868d21", "7b2d3fe05317", "186b7f12022b", "84a510185c89", "92c62d38adae", "aea93f22f11b",
  "bc4334f31265", "f6ce63f1c04b", "330994a26842", "b44c04fee7a8", "6c2cd1e3d68f", "1c55c49108a2", "f8779cc80621", "69d66d4a869b",
  "f035351f89dc", "60d9817b10d3", "16b04b25fe63", "85571f28abc6", "2c57ec68baf7", "703b47812ee1", "ebd0bd08f858", "fbac46422bf2",
  "746f01d9982d", "353618049921", "344e253376e9", "64c4e5d229e2", "35ac635af9eb", "b2331f39c0b0", "4471cf804e6d", "ee1eb2cf3b1f",
  "58afd653e885", "c9abe51465b8", "cb21becc1cda", "9c2d6ae2ab12", "d30ee5ca7436", "7de424c39630", "ea9e760f81c7", "bbcf60ce0638",
  "f4ff7fe7f5c2", "0b1be6c8e796", "464105081698", "64c5e13b1b2f", "d0f07c8d63dc", "ebbc493ca509", "cb5e142c312a", "1e1a041d4466",
  "77a5a1850150", "80f9959a85f0", "bd09bb9a0a7f", "e3662a5b7008", "dd013ad3b62c", "0fdb030294e3", "3ce9162662f8", "2e740852070d",
  "d9595a0c301c", "9b6d62ac1323", "c4789b75308f", "75cb66ecb692", "ee74d8e890eb", "adecd7290726", "8503a7a8177a", "f9e401564c13",
  "79a9cd7e31eb", "003125c49cdf", "20d3c8512eb4", "5a418c276556", "dc9799a109dc", "d3438405be97", "d60b99d1146c", "fd85aa3d5d25",
  "a66e8e696240", "b7263d29c108", "0090a720b591", "98f25af4a455", "fb906c5414c9", "48a67d7aa6f0", "bd6495758361", "7f6d0f162325",
  "4ef6af6b1417", "9b408c5894b1", "da9c28c59dd4", "01abfc66e2cf", "d56cd0e8210d", "a69653d55c37", "d422fbe99d98", "24a8abcf96f5",
  "e94e0dca77c0", "d993ec374e58", "1b3c56360c77", "14087759ebf1", "e79e784c47f1", "345f65cd3869", "d6657d84b4f3", "40315e5feee5",
  "da5cc2d8e5d0", "dbd3fe0f1b16", "f0708de3e9d6", "0a7205f5e630", "1f7c8c0260ec", "028af0a48377", "f84cf66a9671", "a768d4bee569",
  "6c3490542d97", "fa2f7ff15e72", "3c6203d0c16c", "f1e3ae0cff1c", "8b7012ed631b", "1f308dade47f", "c24ca1e19799", "7fe9a7a3f1a3",
  "985cf5fa1d2e", "50165a719269", "7d60b9e9456c", "477ea8316f76", "1c423ca51754", "8e45e8218e0c", "0c40472831d8", "b82680a09519",
  "1abe7fd558d8", "3ad8a10bf342", "22c71f2148d3", "5b0ba9227483", "93d74944c9ae", "e99681baabf0", "e04eba8753e4", "9d0b83933c81",
  "f2118a08d9bc", "3b4e4819673a", "c42d161dafe8", "66328f0c7247", "9e1fbd398f55", "a40f8ed9e023", "b4fb8eb7e096", "454c7dd6bd4b",
  "5de9f5372d47", "07a81bec72d3", "9aadda7c878f", "ef9ffa7f17f1", "99ac47eff985", "1ec85d13e3a5", "069d097dbb57", "e0ec5d0f305a",
  "5db697122d7d", "107257042310", "8fb267dbd73f", "0f537969d142", "128e128b4fd2", "52c5bd44de7e", "9eb70e9e54f2", "7e72beab4546",
  "3463e8b73b77", "5d5d6f2f3927", "e45045845728", "f58821e4607d", "7997793e4636", "8d2ac59f1678", "13a52e3de210", "27bb4c8cb725",
  "73679d42e2d1", "d496225cd4f1", "da027cfacae9", "5421fa20ffc2", "b86c3f328312", "db1a55a08f86", "d8c9b8562725", "3276a09bdf39",
  "a61c35dcfe5d", "4e49142f5b72", "1e43f527beed", "d36ee0051b92", "128ac9945127", "5a41bd64d8cd", "d58b506156d1", "814846306efe",
  "0011a86ee51f", "e4db4e41fb39", "d635b47e7dc7", "b67f1d0dfcb5", "3c1c208621eb", "df849cddc60d", "205f2631e409", "3acb0a502392",
  "8257136de6a0", "acbf86e61c20", "6de99e269f29", "f3c913718a08", "ce45e45d159a", "07141072d3c8", "fd6aa2da0bda", "a17b70846e4b",
  "bcaaf793f752", "ea0817a46f20", "49820d8eb2b2", "f6204d82546a", "7106f8cf3a3b", "540d0b02868b", "eedb2218ad17", "9e62044c7e29",
  "5fdb0ae38fba", "b50d4d324601", "35490a4bcc01", "199a898ad98d", "bd0b53051f3b", "e96898513dfe", "c4e7770d3adb", "24495aeb9d0a",
  "b93f57569b64", "b9ea23025121", "555c98deee94", "875a1f0abcab", "461c7dbf5623", "4acbec0545a0", "6414942fd6eb", "d748be9af05a",
  "28ec8332aaa4", "3f16781a192e", "8deec23e69fa", "48e7a78b043b", "b83867cb7a34", "6759a0bd1dc3", "dbe525671ff9", "c3de1219c7f4",
  "26d472213155", "232cea5a4402", "50ffbeb6a3b3", "129d038782a6", "69b7135a51d8", "cc1f6b5faca0", "0a03d8e39367", "4abc8305268c",
  "1b69a326ead1", "e0fc26c728eb", "35c8a17c8f55", "9ee7680898a2", "d4fa3385878a", "7b0baa7d7860", "30d16364bddc", "dba4150fdd17",
  "844452345e9e", "8d546095d41b", "28cb4c3f3862", "37d20aede65e", "67601b885dfd", "e29b663da89c", "79d0e27b335e", "28bcfe5b068d",
  "6d86564d78fe", "7f875c3cb377", "e336730267fb", "5df46908c181", "273bed787892", "28675c7a1ac3", "e68e3cb93393", "8903e7f82deb",
  "82d0c759664f", "3e75ec08a552", "15b87c686212", "db1eb90f6ff5", "dfe00cefd33d", "d3296e5c8ede", "faf56272b563", "c319159cb363",
  "d16ded7e7b08", "2d4cfc00cf1e", "b05b7d7a374c", "28e7082f9aec", "ad88fd728eed", "aa10da768a4e", "aa6380608056", "c907bf8b0ef0",
  "77ec07aa5f31", "62eb8c0666f7", "04e84d1c175e", "21b17a0c70c5", "f6cdbfa18fc1", "f8cb5feb6d55", "0d2ecb0aae55", "0d31f9513375",
  "5b5681a80221", "ec3c9d667d5e", "197452635692", "6289a30a6870", "1ad625ce0629", "973edf59deb8", "e7771b1a1183", "4f1228342312",
  "d4e61ee7a363", "b1e1aed1e37c", "418f9eb1d263", "c0bb50888f92", "ab172b512a19", "3bcf824d1584", "aab2d3eef25c", "705b6a769eeb",
  "8b9c80fbf5c0", "9032daf4dbf6", "3cbb44795edc", "3636077814c1", "f1cc6be10752", "ba3b1a8529b8", "a87ca21d91d0", "248d5cb4e57a",
  "311f16d88cd7", "1e5d3cb9d911", "319099cef5cc", "14ae1744f895", "5b805ffdf988", "419294b0d1f6", "6c57111da67a", "a3c731c171cf",
  "87bab2a7ca20", "dbdd22005f35", "4a7b1c579679", "56df4441f0b1", "41dbb90fc396", "16a0b49c1da0", "2527a6805013", "ec613f526368",
  "bb28bbcb8aaa", "19abccbda60e", "05fb132325f1", "73f3d64995ae", "c32db4ff3ee7", "0bf6089c9745", "b465cb939266", "a683d4c30065",
  "36386f749e8b", "8b251cd80258", "1991540010ab", "a870a6b1079a", "345fadefa51b", "bf91bf8f2b6a", "224bac46a050", "4ed69caa6067",
  "9c0982d56935", "4fa2d915be92", "9f7cbd462f1a", "5614166a4c56", "68c3f0b68cb1", "79fa82078a22", "4aaf65f9ebfb", "25fbc48c5a8a",
  "6eb60a884fad", "d0b29c92e88a", "3473a342a7ea", "d8263fb160fa", "2865550a02c0", "5eeee854be9a", "9f7f78ab5451", "cd7212e39601",
  "077b15cefd53", "bf35544e279b", "b4c4ea3fdf6f", "a47465b3d08b", "a703a8f700c9", "48516cfcee84", "9dd42efe2ebd", "627c0b778c6c",
  "4c79942e7771", "57f4601ef45c", "149590490f91", "c01ab4051c86", "8f56e1f03968", "0ca2e8b6f2d3", "dfc88d5e9fb4", "692d72faa3b0",
  "834bc087c804", "58a0bd527867", "4a0c9ea69b3c", "3b32b910c3be", "5f41aa52eccd", "61ef598c619f", "3935bf4c44d8", "b7e699f5a150",
  "bb17f110dadf", "77063245e247", "1201d600faea", "f28683c0a31c", "24a31fc08187", "d57fa5efed8e", "2ede8def1cbc", "e82701ebfcf8",
  "659f5f06ec01", "9024618c60d7", "c92fa0c02bab", "9c339aa4d223", "9b99abbddb05", "2420ef507765", "035a8e2c3c2e", "8c2b1c694313",
  "1074b9664e79", "7fe110762f17", "5f8d470e64ca", "6a03e0ef68ce", "88bd09550e68", "e4078c60c53b", "fce46a6ecf6e", "8c79fc3c1f84",
  "e3b9bff17a2b", "01e0d3faa534", "c958b23593e3", "b2c0cb84217e", "3da1231db17c", "f28e51b5239e", "910a3b74aa11", "5188b43082da",
  "c2f9bfc7a3d4", "ca56670950c7", "62205c066e43", "c7a8abdd879d", "f58336a4e7fe", "4c0e669903ae", "7846be93aabb", "c5b810d728de",
  "e7e2476f49ab", "ca372c793d42", "cd68bc602d99", "122ae150f391", "32a4c548baa0", "b99a56c613c7", "12902aae1ea5", "1a6565ed868b",
  "eca77744b6ae", "0af94d917977", "75e8d407fbb6", "e20494dc4cab", "f75126858b31", "b295886fbc72", "46f57bdb4200", "3c58ab4c1709",
  "72da1ab6508f", "d42bb58ad749", "36cb7fce85a6", "c5e682359cf0", "1cdb40205f0f", "1055d551c687", "ece1a3a2f9cd", "a4bb3bef470a",
  "510d67b18ed8", "eda77235a8b6", "94c4e986f336", "fac0d2c3f9b8", "03d995548ba8", "995e675a821d", "796836ab6a7e", "315db8e37083",
  "d8fcf89e2cf6", "38567322dcbc", "e98a4860f193", "a370ca98c08b", "2d503b9785ef", "62747fc9e08c", "f027e271b310", "d3afcecec810",
  "6f48059082c4", "3127bd87e01b", "1e13142ad2d3", "6c071b37d690", "39c6cc3d60d0", "5b4aa289f275", "4bff5636b014", "95f2ef82f2f3",
  "8b8a15dbf623", "49a7606ad3ed", "27d6a00b5ce7", "79c898445123", "54427ec97b1a", "79f0014fe89f", "9b1147bef01f", "57bfbf017f09",
  "e1f09f4b70c4", "a0873035709f", "ada647e5b4e9", "c8693232dcf4", "483d0262af5b", "95cdc5d10bc7", "5943a2ea7899", "e81bd6852a60",
  "ae633377e7f1", "8eff344f7b3e", "a78db3bbd05b", "d31e349bb47f", "afbf4b500abf", "62f3e3d3bc94", "7228ac47408d", "d4d0ecbe9e89",
  "916bbc4c449f", "dd5f78030b06", "9106e50f850a", "581fcbe3929f", "b3ac96264058", "9b4815bb2026", "52ccd87f72d0", "a347730c6008",
  "16474e086595", "e6a752dcfc9b", "41594dd7d36c", "2595db1a8d4e", "4d2fd21d1cbe", "bad3bc1022fd", "42f88143ae1b", "b7372af5853b",
  "6fad40b10788", "9f64fa6df40f", "17c3789aa294", "f1df5b3ee1bc", "752cb32bc441", "ef5c8df610d5", "c64f6ca20089", "8f3f03820f5a",
  "4d19f037ed21", "e53997234a4c", "5bd4c08e4941", "fb801793b29a", "1c06912f0edf", "920391ee7703", "571a08e7a69a", "855c97bb5265",
  "88e754f131a9", "637126554c2d", "52f3de62c07c", "97c6b7c04ff5", "1ef575ed02dd", "77a15ba9c82e", "f3fc1505cc0a", "8d0e876d66bc",
  "870bcf1e9c18", "f12fc0572a50", "25261e58ad81", "f130d6363dce", "eb81249020fa", "eaec0770a939", "828637d7602c", "9f7366db0cb5",
  "e0b6c88b8e8f", "0f054278c4f6", "b5624afe98fd", "707d36cec028", "0d46a6995cdb", "38e06a3d359a", "288fde28ca55", "1c8c1da4d3af",
  "ad7e543fc8ee", "23f663630e2f", "72f3511cfdac", "b54fc7c2c81c", "b1e9aac924d7", "ed82f1666929", "e802a70ef989", "6e7f80a75e7b",
  "2ec0c9b94f61", "ba8b9a1d1512", "38149c1699a6", "f7a9bbd49bae", "4184df3fd713", "6476998e727c", "e4523e9a47bf", "a3d1303246c7",
  "ac59d7da0b1d", "c61c274e81a3", "a9b502aac835", "ba7950b14bf0", "0c9a8f4cee08", "6657241dc177", "34ea17641226", "30b3fbabd51f",
  "9e72970c3d11", "539fc4fcd26b", "dc135e23d253", "c33d04147d57", "3d5fda54bbc5", "313c6eb7b7be", "b92f419b68fa", "bca3772034ca",
  "a6e963f2091f", "c1f987b78e9a", "edbedd123de4", "b77dc380f360", "d6d80e25b15c", "0565e6c3b6f5",
  // November 2026: die 107 Bildwörter von «Wer fährt mit?» – als einzelnes Wort
  // klangen viele wie eine Frage («Tiger?», «Brot?»), manchen fehlte der Anfang.
  "0286249762f7", "0ad448de77b6", "0bf83ff3617d", "157abca2ca9c", "15f09dbff105", "16891dda0d98", "1b013952d30a", "1f9c87b18e6f",
  "25502a8d74df", "257a1a2e4d6f", "2ae1cad4de29", "38bf5d085dbe", "38f92fa97917", "3dadc1beeb8c", "410f76d01d8a", "4221b9b80815",
  "430db59c91b3", "459bed2926d0", "459c52b19f5f", "49530e11d87d", "4a141e3ef159", "4b2e4debd620", "4c01b97dffc9", "50976ad58f5d",
  "51c62d69a62c", "53510e039444", "56151fd50660", "5616070bca99", "568cfef57232", "569642411fb7", "5ba98270917f", "5e940ecd0c6a",
  "5f36321c4299", "5ffdfd6dc15c", "63669810c995", "643aa97e949c", "67f17cffae0b", "68677bf399cb", "69cc3b855e47", "6b942766c4e4",
  "6bc75e1bf7ef", "6e33b0c84b28", "6fb86a981cf3", "7017a96daad8", "795b5603753a", "7e54f79addc1", "7e7c621a3034", "82855c11ae69",
  "82f1643a857d", "85139e8cc79d", "8d55bb870b65", "906c6a0ed3ef", "92a95fa02cbc", "954f0a2d53ee", "96eaefafc3db", "9800bb85de62",
  "9956d0c04e1f", "9c0d5d91b620", "a14eac9161e5", "a252f7aeeb24", "a2df25966b32", "a410d513bba1", "a7076b302be7", "a9d9c80a35c5",
  "a9fd2c0ce8bf", "aac8c576456f", "acb514d5dc40", "ae5859eceacb", "b58bd16905d2", "bb3d83ff198b", "c16f2f3b6f2d", "c2f33b81bcc4",
  "c55dcf4319da", "c57a870e5cba", "c6e21db2a17a", "caf054761428", "ce8c8bab8261", "cf95e1c70fb2", "cff68362f7d2", "d09c3c3ea576",
  "d17d47268213", "d4e20327678b", "d53395f8d8d8", "d5abcd38a56b", "d658cc20598b", "d7e3dabc2c95", "d871bd57754c", "dd12db9683fb",
  "ded0dba7ab18", "e006d852a61a", "e10d850954a8", "e3ab9b19e26a", "e4a41c66866b", "e5c286bb5e83", "e7121e9ff0bc", "ea858afbf837",
  "ec7a92296c27", "ee03863b0151", "ef53751671e5", "f1142f0fdbdd", "f7d9ea7f3980", "fa18c06733fb", "fccd93ed0e7a",
];

// Das Firebase-SDK liegt auf einem fremden Server. Ohne eigene Kopie hängen
// die drei Zeilen im <head>-losen Seitenfuss am Netz: sie stehen vor allen
// eigenen Skripten, und solange sie nicht antworten, baut keine Seite ihre
// Bühne auf. Deshalb kommen sie mit in den Cache.
const FIREBASE_SDK = [
  "https://www.gstatic.com/firebasejs/12.7.0/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth-compat.js",
  "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore-compat.js"
];

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./admin.html",
  "./arukone.html",
  "./backpack.html",
  "./blaetter.html",
  "./bimaru.html",
  "./hidoku.html",
  "./kakuro.html",
  "./memory.html",
  "./raumdetektiv.html",
  "./shikaku.html",
  "./wortdetektiv.html",
  "./buchstaben.html",
  "./kartenmerker.html",
  "./schwarmfokus.html",
  "./strandschatz.html",
  "./weichen.html",
  "./tiersprung.html",
  "./kacheln.html",
  "./fischteich.html",
  "./freiefahrt.html",
  "./turmbau.html",
  "./zahlengleis.html",
  "./signal.html",
  "./wasfehlt.html",
  "./faesser.html",
  "./doppelt.html",
  "./silbenzug.html",
  "./kuppelplus.html",
  "./tunnelrechnen.html",
  "./blitzblick.html",
  "./einsteigen.html",
  "./huepfgleis.html",
  "./zahlenhaus.html",
  "./waskommtoefter.html",
  "./geradeungerade.html",
  "./rechenpost.html",
  "./blitzrechnen.html",
  "./rueckgeld.html",
  "./bahnhofsuhr.html",
  "./hunderter.html",
  "./wachsendetuerme.html",
  "./zahlenmauer.html",
  "./spiegelsignal.html",
  "./formpuzzle.html",
  "./formen.html",
  "./strichliste.html",
  "./schlange.html",
  "./zahlenstrahl.html",
  "./rueckwaerts.html",
  "./drachenfutter.html",
  "./schuettelbecher.html",
  "./rechenkette.html",
  "./zehnersprung.html",
  "./waage.html",
  "./zehnerfuellen.html",
  "./doppelexpress.html",
  "./kiosk.html",
  "./tunnelversteck.html",
  "./wuerfelplus.html",
  "./stolperwagen.html",
  "./musterzug.html",
  "./ballonwagen.html",
  "./abkuppeln.html",
  "./wagenordnen.html",
  "./zaehlfenster.html",
  "./werhatmehr.html",
  "./plusoderminus.html",
  "./aussteigen.html",
  "./alleeinsteigen.html",
  "./ziffernpunkte.html",
  "./fingerzahlen.html",
  "./zahlenpaare.html",
  "./huepflok.html",
  "./countdown.html",
  "./fahrplanluecke.html",
  "./buchstabenhaus.html",
  "./lautekuppeln.html",
  "./stimmtdas.html",
  "./buecher.html",
  "./reimkupplung.html",
  "./anlautlauscher.html",
  "./werfaehrtmit.html",
  "./woerterbauen.html",
  "./silbenbahn.html",
  "./blitzwoerter.html",
  "./meinname.html",
  "./lueckensaetze.html",
  "./buchstabengleis.html",
  "./satzkuppeln.html",
  "./quatschsaetze.html",
  "./stolperwoerter.html",
  "./quatschwoerter.html",
  "./lautposition.html",
  "./buchstabensignal.html",
  "./liesundtu.html",
  "./geschichtenzug.html",
  "./werbinich.html",
  "./wortbaustelle.html",
  "./steckbriefe.html",
  "./detektivfaelle.html",
  "./postkarten.html",
  `./styles.css${ASSET_VERSION_QUERY}`,
  `./spatial-puzzles.js${ASSET_VERSION_QUERY}`,
  `./kids.js${ASSET_VERSION_QUERY}`,
  `./highscore.js${ASSET_VERSION_QUERY}`,
  `./app.js${ASSET_VERSION_QUERY}`,
  `./train-progress.js${ASSET_VERSION_QUERY}`,
  `./entitlement.js${ASSET_VERSION_QUERY}`,
  `./train-art.js${ASSET_VERSION_QUERY}`,
  `./train-scenes.js${ASSET_VERSION_QUERY}`,
  `./train-home.js${ASSET_VERSION_QUERY}`,
  `./journey-plan.js${ASSET_VERSION_QUERY}`,
  `./train-journey.js${ASSET_VERSION_QUERY}`,
  `./tiersprung.js${ASSET_VERSION_QUERY}`,
  `./game-cloud.js${ASSET_VERSION_QUERY}`,
  `./game-shell.js${ASSET_VERSION_QUERY}`,
  `./kartenmerker.js${ASSET_VERSION_QUERY}`,
  `./strand-art.js${ASSET_VERSION_QUERY}`,
  `./strandschatz.js${ASSET_VERSION_QUERY}`,
  `./schwarmfokus.js${ASSET_VERSION_QUERY}`,
  `./weichen.js${ASSET_VERSION_QUERY}`,
  `./rucksack.js${ASSET_VERSION_QUERY}`,
  `./memory.js${ASSET_VERSION_QUERY}`,
  `./kacheln.js${ASSET_VERSION_QUERY}`,
  `./fischteich.js${ASSET_VERSION_QUERY}`,
  `./freiefahrt.js${ASSET_VERSION_QUERY}`,
  `./blaetter.js${ASSET_VERSION_QUERY}`,
  `./turmbau.js${ASSET_VERSION_QUERY}`,
  `./zahlengleis.js${ASSET_VERSION_QUERY}`,
  `./signal.js${ASSET_VERSION_QUERY}`,
  `./wasfehlt.js${ASSET_VERSION_QUERY}`,
  `./faesser.js${ASSET_VERSION_QUERY}`,
  `./doppelt.js${ASSET_VERSION_QUERY}`,
  `./leseschrift.css${ASSET_VERSION_QUERY}`,
  `./lesen-inhalte.js${ASSET_VERSION_QUERY}`,
  `./lesen-stand.js${ASSET_VERSION_QUERY}`,
  `./lesen-laute.js${ASSET_VERSION_QUERY}`,
  `./lesen-stimme.js${ASSET_VERSION_QUERY}`,
  `./app-stimme.js${ASSET_VERSION_QUERY}`,
  `./bau-stimme.js${ASSET_VERSION_QUERY}`,
  `./lesen-ton.js${ASSET_VERSION_QUERY}`,
  `./lesen-art.js${ASSET_VERSION_QUERY}`,
  `./lesen-wurm.js${ASSET_VERSION_QUERY}`,
  `./lesen-spiel.js${ASSET_VERSION_QUERY}`,
  `./rechnen.css${ASSET_VERSION_QUERY}`,
  `./rechnen-stand.js${ASSET_VERSION_QUERY}`,
  `./rechnen-art.js${ASSET_VERSION_QUERY}`,
  `./rechnen-spiel.js${ASSET_VERSION_QUERY}`,
  `./rechnen-spiele-1.js${ASSET_VERSION_QUERY}`,
  `./rechnen-spiele-4.js${ASSET_VERSION_QUERY}`,
  `./rechnen-spiele-3.js${ASSET_VERSION_QUERY}`,
  `./rechnen-spiele-2.js${ASSET_VERSION_QUERY}`,
  `./train-rechenecke.js${ASSET_VERSION_QUERY}`,
  `./lernzug-art.js${ASSET_VERSION_QUERY}`,
  `./englisch.css${ASSET_VERSION_QUERY}`,
  `./englisch-inhalt.js${ASSET_VERSION_QUERY}`,
  `./englisch-stand.js${ASSET_VERSION_QUERY}`,
  `./englisch-art.js${ASSET_VERSION_QUERY}`,
  `./englisch-art-2.js${ASSET_VERSION_QUERY}`,
  `./englisch-spiele.js${ASSET_VERSION_QUERY}`,
  `./englisch-art-3.js${ASSET_VERSION_QUERY}`,
  `./englisch-spiele-3.js${ASSET_VERSION_QUERY}`,
  `./englisch-art-4.js${ASSET_VERSION_QUERY}`,
  `./englisch-gemalt.js${ASSET_VERSION_QUERY}`,
  `./englisch-spiele-4.js${ASSET_VERSION_QUERY}`,
  `./englisch-stimme.js${ASSET_VERSION_QUERY}`,
  `./franzoesisch-inhalt.js${ASSET_VERSION_QUERY}`,
  `./franzoesisch-stand.js${ASSET_VERSION_QUERY}`,
  `./franzoesisch-art.js${ASSET_VERSION_QUERY}`,
  `./franzoesisch-art-2.js${ASSET_VERSION_QUERY}`,
  `./franzoesisch-art-3.js${ASSET_VERSION_QUERY}`,
  `./franzoesisch-gemalt.js${ASSET_VERSION_QUERY}`,
  `./franzoesisch-stimme.js${ASSET_VERSION_QUERY}`,
  `./sprachwagen.js${ASSET_VERSION_QUERY}`,
  `./train-englischecke.js${ASSET_VERSION_QUERY}`,
  `./train-franzoesischecke.js${ASSET_VERSION_QUERY}`,
  `./lesen-buecher.js${ASSET_VERSION_QUERY}`,
  `./lesen-bilder.js${ASSET_VERSION_QUERY}`,
  `./lesen-detektive.js${ASSET_VERSION_QUERY}`,
  `./train-leseecke.js${ASSET_VERSION_QUERY}`,
  `./bau.css${ASSET_VERSION_QUERY}`,
  `./bau-wetter.css${ASSET_VERSION_QUERY}`,
  `./bau-spiele.css${ASSET_VERSION_QUERY}`,
  `./bau-moebel.js${ASSET_VERSION_QUERY}`,
  `./bau-moebel-wohnen.js${ASSET_VERSION_QUERY}`,
  `./bau-moebel-haus.js${ASSET_VERSION_QUERY}`,
  `./bau-moebel-spital.js${ASSET_VERSION_QUERY}`,
  `./bau-moebel-station.js${ASSET_VERSION_QUERY}`,
  `./bau-moebel-laeden.js${ASSET_VERSION_QUERY}`,
  `./bau-moebel-dienste.js${ASSET_VERSION_QUERY}`,
  `./bau-moebel-freizeit.js${ASSET_VERSION_QUERY}`,
  `./bau-moebel-buero.js${ASSET_VERSION_QUERY}`,
  `./bau-moebel-arbeit.js${ASSET_VERSION_QUERY}`,
  `./bau-moebel-dome.js${ASSET_VERSION_QUERY}`,
  `./bau-moebel-hotel.js${ASSET_VERSION_QUERY}`,
  `./bau-moebel-extra.js${ASSET_VERSION_QUERY}`,
  `./bau-katalog.js${ASSET_VERSION_QUERY}`,
  `./bau-stand.js${ASSET_VERSION_QUERY}`,
  `./bau-tiere.js${ASSET_VERSION_QUERY}`,
  `./bau-menschen.js${ASSET_VERSION_QUERY}`,
  `./bau-art.js${ASSET_VERSION_QUERY}`,
  `./bau-schmuck.js${ASSET_VERSION_QUERY}`,
  `./bau-leiter.js${ASSET_VERSION_QUERY}`,
  `./bau-wetter.js${ASSET_VERSION_QUERY}`,
  `./bau-spiele.js${ASSET_VERSION_QUERY}`,
  `./train-bau.js${ASSET_VERSION_QUERY}`,
  `./silbenzug.js${ASSET_VERSION_QUERY}`,
  `./buchstabenhaus.js${ASSET_VERSION_QUERY}`,
  `./lautekuppeln.js${ASSET_VERSION_QUERY}`,
  `./stimmtdas.js${ASSET_VERSION_QUERY}`,
  `./buecher.js${ASSET_VERSION_QUERY}`,
  `./reimkupplung.js${ASSET_VERSION_QUERY}`,
  `./anlautlauscher.js${ASSET_VERSION_QUERY}`,
  `./werfaehrtmit.js${ASSET_VERSION_QUERY}`,
  `./woerterbauen.js${ASSET_VERSION_QUERY}`,
  `./silbenbahn.js${ASSET_VERSION_QUERY}`,
  `./blitzwoerter.js${ASSET_VERSION_QUERY}`,
  `./meinname.js${ASSET_VERSION_QUERY}`,
  `./lueckensaetze.js${ASSET_VERSION_QUERY}`,
  `./buchstabengleis.js${ASSET_VERSION_QUERY}`,
  `./satzkuppeln.js${ASSET_VERSION_QUERY}`,
  `./quatschsaetze.js${ASSET_VERSION_QUERY}`,
  `./stolperwoerter.js${ASSET_VERSION_QUERY}`,
  `./quatschwoerter.js${ASSET_VERSION_QUERY}`,
  `./lautposition.js${ASSET_VERSION_QUERY}`,
  `./buchstabensignal.js${ASSET_VERSION_QUERY}`,
  `./liesundtu.js${ASSET_VERSION_QUERY}`,
  `./geschichtenzug.js${ASSET_VERSION_QUERY}`,
  `./werbinich.js${ASSET_VERSION_QUERY}`,
  `./wortbaustelle.js${ASSET_VERSION_QUERY}`,
  `./steckbriefe.js${ASSET_VERSION_QUERY}`,
  `./detektivfaelle.js${ASSET_VERSION_QUERY}`,
  `./postkarten.js${ASSET_VERSION_QUERY}`,
  `./firebase.js${ASSET_VERSION_QUERY}`,
  `./admin.js${ASSET_VERSION_QUERY}`,
  `./pwa.js${ASSET_VERSION_QUERY}`,
  `./app.webmanifest${ASSET_VERSION_QUERY}`,
  "./icons/icon-32.png",
  "./icons/apple-touch-icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png"
];

// Fremde Antworten sind undurchsichtig und tragen den Status 0. cache.add()
// lehnt sie ab, cache.put() nimmt sie an – deshalb dieser Umweg.
async function addOpaque(cache, url) {
  const response = await fetch(url, { mode: "no-cors" });
  await cache.put(url, response);
}

// Jede Datei wird einzeln abgelegt. Vorher lag hier ein cache.addAll() über
// alle knapp fünfzig Adressen: ein einziger Aussetzer am Mobilnetz liess die
// ganze Installation scheitern, es entstand gar kein Cache, und die auf den
// Startbildschirm gelegte App startete ohne Netz überhaupt nicht mehr.
async function precache() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.allSettled([
    ...CORE_ASSETS.map((asset) => cache.add(asset)),
    ...FIREBASE_SDK.map((url) => addOpaque(cache, url))
  ]);
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        const staleKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME);
        const alteBilder = keys.filter((key) => key.startsWith("lernapp-buchbilder-") && key !== BUCHBILDER_CACHE);
        const alteStimmen = keys.filter((key) => key.startsWith("lernapp-stimme-") && key !== STIMME_CACHE);
        return Promise.all([...staleKeys, ...alteBilder, ...alteStimmen].map((key) => caches.delete(key)))
          .then(() => erneuern(keys))
          .then(() => staleKeys.length > 0);
      })
      .then((wasUpdated) => self.clients.claim().then(() => wasUpdated))
      .then((wasUpdated) => {
        if (!wasUpdated) return undefined;
        return self.clients.matchAll({ includeUncontrolled: true, type: "window" }).then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: "APP_UPDATED", version: APP_VERSION });
          });
        });
      })
  );
});

// ERNEUERT: die Dateien einmal aus ihren Caches nehmen. Ein leerer Cache
// «lernapp-erneuert-<Nr>» merkt sich, dass es geschehen ist. Geht etwas schief,
// versucht es das nächste Aktivieren noch einmal – das Update hängt nie daran.
async function erneuern(keys) {
  const merker = `lernapp-erneuert-${ERNEUERT_NR}`;
  try {
    if (!keys.includes(merker)) {
      const adresse = (pfad) => new URL(pfad, self.registration.scope).href;
      const weg = { ignoreSearch: true, ignoreVary: true };
      const [bilder, stimmen] = await Promise.all([caches.open(BUCHBILDER_CACHE), caches.open(STIMME_CACHE)]);
      await Promise.all([
        ...ERNEUERT_BILDER.map((pfad) => bilder.delete(adresse(pfad), weg)),
        ...ERNEUERT_STIMME.map((name) => stimmen.delete(adresse(`stimme/google/${name}.mp3`), weg))
      ]);
      await caches.open(merker);
    }
    await Promise.all(keys.filter((key) => key.startsWith("lernapp-erneuert-") && key !== merker).map((key) => caches.delete(key)));
  } catch (error) {
    // nächstes Mal
  }
}

function fetchWithTimeout(request, timeoutMs = NETWORK_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Netz zu langsam")), timeoutMs);
    fetch(request).then(resolve, reject).finally(() => clearTimeout(timer));
  });
}

async function fetchAndStore(cache, request, timeoutMs = NETWORK_TIMEOUT_MS) {
  const response = await fetchWithTimeout(request, timeoutMs);
  // Undurchsichtige Antworten (Status 0) sind brauchbar und gehören mit in
  // den Cache; Weiterleitungen und Fehlerseiten nicht. cache.put() lehnt
  // manche Antwort ab – das darf den Abruf nicht umwerfen.
  if (response && (response.ok || response.type === "opaque")) {
    cache.put(request, response.clone()).catch(() => {});
  }
  return response;
}

async function cacheFirst(event, cacheName = CACHE_NAME, timeoutMs = NETWORK_TIMEOUT_MS) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(event.request);
  if (cached) return cached;
  return fetchAndStore(cache, event.request, timeoutMs);
}

async function staleWhileRevalidate(event) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(event.request);
  if (!cached) return fetchAndStore(cache, event.request);

  event.waitUntil(fetchAndStore(cache, event.request).catch(() => {}));
  return cached;
}

// Eine Aufnahme. Ein Audio-Element fragt in Stücken (Range: bytes=…), und
// Safari spielt nur, was so beantwortet wird – mit 206 und dem Stück. Im Cache
// liegt die ganze Datei, geholt ohne Range; das verlangte Stück wird daraus
// geschnitten.
async function aufnahme(event) {
  const cache = await caches.open(STIMME_CACHE);
  const adresse = event.request.url;
  let ganz = await cache.match(adresse);
  if (!ganz) {
    const response = await fetchWithTimeout(adresse, STIMME_TIMEOUT_MS);
    if (response.status !== 200) return response;
    cache.put(adresse, response.clone()).catch(() => {});
    ganz = response;
  }
  const bereich = event.request.headers.get("range");
  return bereich ? stueckAus(ganz, bereich) : ganz;
}

async function stueckAus(response, bereich) {
  const daten = await response.arrayBuffer();
  const groesse = daten.byteLength;
  const treffer = /^bytes=(\d*)-(\d*)$/.exec(bereich.trim());
  let von = NaN;
  let bis = groesse - 1;
  if (treffer && treffer[1] !== "") {
    von = Number(treffer[1]);
    if (treffer[2] !== "") bis = Math.min(Number(treffer[2]), groesse - 1);
  } else if (treffer && treffer[2] !== "") {
    // bytes=-500: die letzten 500
    von = Math.max(0, groesse - Number(treffer[2]));
  }
  if (!(von >= 0) || von >= groesse || bis < von) {
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${groesse}` } });
  }
  return new Response(daten.slice(von, bis + 1), {
    status: 206,
    statusText: "Partial Content",
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "audio/mpeg",
      "Content-Length": String(bis - von + 1),
      "Content-Range": `bytes ${von}-${bis}/${groesse}`,
      "Accept-Ranges": "bytes"
    }
  });
}

// Der Start der installierten App. Erst der Cache, dann im Hintergrund
// auffrischen: das Bild ist sofort da, auch ohne Netz. Eine neue Fassung
// kommt über den Versionswechsel des Service Workers, der die Seite von
// sich aus neu lädt – vorher fragte hier jeder Start zuerst das Netz und
// blieb an einer lahmen Verbindung hängen.
async function documentFirstFromCache(event) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(event.request, { ignoreSearch: true });

  if (cached) {
    event.waitUntil(fetchAndStore(cache, event.request).catch(() => {}));
    return cached;
  }

  try {
    return await fetchAndStore(cache, event.request);
  } catch (error) {
    const fallback = await cache.match(FALLBACK_DOCUMENT);
    if (fallback) return fallback;
    throw error;
  }
}

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) {
    if (FIREBASE_SDK.includes(requestUrl.href)) event.respondWith(cacheFirst(event));
    return;
  }

  if (event.request.mode === "navigate" || event.request.destination === "document") {
    event.respondWith(documentFirstFromCache(event));
    return;
  }

  // styles.css?v=… und app.js?v=… tragen die Fassung im Namen: ändert sich
  // die Version, ändert sich der Schlüssel. Der Cache darf also direkt
  // antworten, ohne vorher das Netz zu fragen.
  if (requestUrl.searchParams.has("v")) {
    event.respondWith(cacheFirst(event));
    return;
  }

  if (requestUrl.pathname.includes("/bilder/buecher/") || requestUrl.pathname.includes("/bilder/postkarten/") || requestUrl.pathname.includes("/bilder/steckbriefe/") || requestUrl.pathname.includes("/bilder/monster/") || requestUrl.pathname.includes("/bilder/englisch/") || requestUrl.pathname.includes("/bilder/franzoesisch/")) {
    event.respondWith(cacheFirst(event, BUCHBILDER_CACHE, BUCHBILDER_TIMEOUT_MS));
    return;
  }

  if (requestUrl.pathname.includes("/stimme/")) {
    event.respondWith(aufnahme(event));
    return;
  }

  const cacheFirstDestinations = new Set(["image", "font"]);
  if (cacheFirstDestinations.has(event.request.destination)) {
    event.respondWith(cacheFirst(event));
    return;
  }

  const revalidateDestinations = new Set(["script", "style", "manifest"]);
  if (revalidateDestinations.has(event.request.destination)) {
    event.respondWith(staleWhileRevalidate(event));
  }
});
