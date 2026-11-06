const APP_VERSION = "2026-11-06-2";
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
const ERNEUERT_NR = 3;
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
  // November 2026: 1571 einzelne Wörter (Bildwörter, Wörter der Bücher, deutsche Wörter
  // der Sprachwagen, Bauecke) neu aus einem deutschen Trägersatz geschnitten – allein
  // klangen sie englisch («Taiger») oder fremd («Milsch»). Die Bildwörter oben auch.
  "0007489cd4b0", "004670a98825", "004d1dd8c4d6", "006a933c950f", "006c665693c5", "008cf9728743", "011453020c70", "011d40baec5b",
  "0132ce7d5ec8", "0137dde4ecca", "016ed3a5ddd7", "017665f32515", "018538920cda", "0225c949bc46", "0247bfc28f95", "025b5573cb68",
  "0268350754f9", "027bd14fb78f", "0298e1f5323b", "02b4db5796e4", "02d087933efc", "02e61624483c", "034fb610358f", "0386d2ce141f",
  "03c51baf6f2b", "03d642054b4f", "042e8e40f4d4", "0438228eab15", "044dcfaf9b32", "04589f4322bc", "04a559865092", "04f01b91db4b",
  "05214e02f52e", "052be6078163", "05ae3e35b40b", "05c3d638a3cc", "05d737d9fde6", "05f70bc2c50d", "0616dcaacbdf", "0631a9cb488f",
  "066399c52046", "067bcc63eb6f", "068b5506f86e", "069314010ccc", "06a0d3d3a616", "06a17d518715", "06a3ccaef078", "06cb6c291501",
  "07015b4f5662", "070ecbbc0998", "0731eae1c7e1", "0738ae99f3db", "077827df2371", "078a815372af", "079251db5b49", "07c8d80acf1c",
  "07eed85cded5", "081dc1b9758e", "0839cec65c2f", "086483c42b6b", "08c5418b0602", "08d6ce000b47", "0905294d9b75", "090b306ce424",
  "0919faa4bf92", "092e1885c957", "097ccf1b8a48", "09890dd421f0", "09db8f0d927c", "0a1978960a44", "0a30b421999c", "0a64efb715cc",
  "0a7cb27e5292", "0abd20997a05", "0ae515bdeb91", "0af3584be783", "0b55751ba366", "0b6722a8adfb", "0baf0397e52f", "0bd0a852b8df",
  "0c4d1c323344", "0c7aae56ebe5", "0c849f4d2a19", "0cbb2e5497d5", "0cc816c745f7", "0d1ef3908454", "0d7d94fb8e09", "0d7ef2170d43",
  "0d8d541d98f3", "0d98c4a4cfc1", "0dce1e5ebbd2", "0e69bcc45f7d", "0ea77701f68c", "0ebdc3317b75", "0ee09439c2f5", "0ef6ec226337",
  "0f0aa408c183", "0f338cd13f3a", "0f7c4be5bf76", "0fd998791d67", "0ffb02665035", "1053aff333a6", "1088c9297f27", "10a5a1f0c3ac",
  "10fa70cad6b4", "115dc3606fbf", "115e3191eadc", "117a18bb2b00", "118bcceae7e5", "119ee6901316", "122484a69b50", "1244c537d5f6",
  "126005cc46cd", "127506a52b43", "127b10ae1d4f", "12abc9ea1785", "12c2445b9744", "12cbc585be53", "12dc2e028fa1", "135e82555981",
  "139f6534214d", "13c947ac6730", "13dbae796043", "146df9a1bc0a", "14ba65c2f759", "14bea209cc1f", "14dd39ba3edb", "14fa152b865b",
  "1503916a2ab2", "150e9de319eb", "1576ba560a1c", "15b73886c509", "15d14277145e", "15fbc66546ee", "16000f9f3619", "16200499202c",
  "162dc2103089", "16a104d33063", "17fb2519393e", "184478e0d648", "18725a3104ab", "189fcc7869f7", "18bb438b8faf", "18e1dd392168",
  "19411365c236", "194e514bf21b", "19787bc92982", "19e667115fc3", "19ea4ac2e1a5", "1a028e829b25", "1a23612974eb", "1a3a0ff076fb",
  "1a3ae2b9d5bf", "1b17869e03ec", "1b1f91f72852", "1b22a46b261e", "1b3195b381d7", "1b58527b8c96", "1b78808f7220", "1c19e1b130dc",
  "1c54c26e4e7e", "1c9b4029ec34", "1cff8a95c840", "1d43ce3e8528", "1d554356ca77", "1d5ef8ac45fc", "1d762c7b8e7b", "1d8837a2b0ab",
  "1da8321dcc9a", "1de7df829fb2", "1e17730e0a46", "1e67673cd8fb", "1e71b8fc4111", "1e76b6344a2a", "1e9d34deb9f9", "1eb34155e7d0",
  "1ef002a6567c", "1efd4e8c74e8", "1f5c80c33075", "1fa2bd87b592", "201b0448bcc0", "202f686f3b83", "208ef828d89c", "209b363194d7",
  "2146a029ad5e", "218b1567a9d3", "21b45f233cbc", "2207deb65b86", "220e907708f8", "227835ebcc7b", "227a1b5a1f5c", "22c9783f5077",
  "22ec9aa49c1e", "22fd4db0e3cd", "2300286bb61b", "2300ececf6b5", "2321f8b0c490", "2337c37f0721", "235f48672142", "2372b70bf01a",
  "23ddd8378b57", "23e125affa42", "242081083fa4", "243b570e8557", "24496c04d986", "24582da6fae5", "246185958e84", "2483a056889c",
  "24ad331d9ace", "24e0f2fec18e", "24e714d3444c", "252c9b54b4f2", "252f74a2b360", "25352d33fff0", "2573c09e1e58", "258bcc3fdb09",
  "25d52d7e8665", "25e5d3fea1eb", "260a97d318a6", "26640db311f5", "266a2d74b84a", "269469dd4ddb", "26d20606d022", "276ba53ca180",
  "2775a73df235", "277e708d34a6", "279f5a4fb208", "27a35da0b892", "280721fcd04d", "2848db1605b4", "28871d7eab75", "2896d6561414",
  "289c90decf40", "28a119f6ed6f", "28b9aa2e6b0a", "28e7ed37699a", "293020adad2e", "29693fc05dfe", "2a144ece768c", "2a6aef767af7",
  "2abb03d18465", "2ae3016e3651", "2b024588f906", "2b36fe0843f2", "2b4527922eab", "2b4765ac4595", "2b64c6d9afd8", "2b707e9be40a",
  "2b7186b5bfe8", "2b99347c0f1c", "2d3af8db3690", "2d90b5260416", "2ddcd606c872", "2de802b0e746", "2dfff992926e", "2e26183ae9ef",
  "2e56fa54d025", "2e9b293ce4f6", "2edb12dc17b1", "2eed69ddd005", "2f2781e5ab48", "2f5e6a4e303f", "2f98ce854fd9", "2fc5114fd6f2",
  "2ff177aad918", "300ea37e3396", "306bc318a3ab", "30b3b2421bf1", "30ee9c81e220", "3123e0cd00eb", "312fc095dd01", "313cc51e3b81",
  "31c0d94200b8", "31d23b4ea412", "3207379c7db1", "32585d3d4243", "32823fffc37e", "32941261c864", "329f9cd7936f", "32aadd30ccf8",
  "32b2d7dad4f2", "32b332a3e90d", "32b8dfac90f6", "32da5de08dd7", "32ddeaa7d44e", "331eedfed4b5", "3345f13bc27a", "336ec36ccb88",
  "33ad110d30c2", "34093e9013c2", "341a2134fef6", "3436db9d27d7", "344ad8de3094", "349ef13f4b36", "34c89142fa35", "34cb62f132f5",
  "34d875437d8f", "34dd74936eb0", "34e15562a66c", "34ea652aa82e", "34f98c0f5c39", "350891d7cc82", "35487809a6ee", "354bc956b8a4",
  "35ae1c854699", "35c2daa15015", "35c44aa4397a", "36420270191c", "365aa4fa7256", "3673c73814fa", "3702fc186663", "37464907b09f",
  "375e84034b8f", "37a13ca05f84", "37cf5259e3c6", "37db13dc35d0", "3801a35c5182", "380b22025d43", "384b3739fba0", "385979fb444b",
  "388dbead0302", "388e3cc1559e", "38ed1bfd317f", "39088faee2f1", "39b728ca25f7", "39bad0c20c93", "39c21f5b3b35", "39c51de75111",
  "39f6a17476eb", "3a6dd56a120f", "3aa49f16d2a4", "3b1e7e2bb2ad", "3b498050c56b", "3b51d929cc85", "3b8207140fae", "3b83c23fc986",
  "3bab35af3494", "3c476395f3a2", "3c9fca9c07f7", "3cc4c959b6e6", "3cee866e173f", "3d50526aa8a2", "3d6a124622df", "3d969b85fb1f",
  "3da2ee2fceda", "3dccb4ca0a66", "3e13715a02fb", "3e1b2b64d1c8", "3e38d8d29418", "3e4af9cd6424", "3edc274f12ee", "3ee8162b08b6",
  "3f165ee067f4", "3f905c426c75", "401f1721a42a", "407bc828fb67", "40d415fa11ec", "40d6b25597ba", "40e567dc651c", "41509508705b",
  "417383124fd7", "41b8e19043ca", "41ba5e7fa735", "41d6cecd3e52", "41e64808d1f1", "424c8eda8e3a", "42f1686f1ba8", "42f9f3a4359a",
  "43188edff870", "431fca33d0a9", "433986a07170", "43c73f447cc5", "43ce6022b931", "442d9b84d813", "44734ae1e62c", "449fde1b1682",
  "44d76b10c505", "44e4383d464e", "451fa65b549b", "454c7905ff9f", "456b435de815", "457224958f01", "45acde9242c0", "45db9ecdfcda",
  "45dbacc1cec8", "45e291c7e2b1", "45fc051ec2a3", "4625f2e59274", "46682171441f", "467e99f10a6d", "4684471f6cca", "46a4acd4b93b",
  "46cddc407fcb", "46ea2fff7a5b", "47324fe12daa", "477a18d2c0f6", "47bce77e1e87", "47d15b885b8b", "4845e17a83e2", "485915c1516b",
  "48b676e2b107", "48f012b67804", "48fc2630966d", "4913e002a8f9", "493309837ab7", "4959de6ed9b8", "49a4c904a516", "49ba421d7555",
  "49cbf62f8453", "4a133b66ae56", "4a3f1139f614", "4a41f236e14d", "4a4640d508bf", "4a54be32d5c3", "4a877d3cd759", "4aacd052c6af",
  "4af692657901", "4b14b3b66c99", "4b1b135ee514", "4b62308e340d", "4b66bd0d6b73", "4b8ff5395331", "4bcdad1fc21f", "4bfacbaf9dbb",
  "4c0954141311", "4c3c3030130a", "4c3f36e7bdb7", "4c63978afb49", "4c6851954639", "4c782c5d1957", "4c99232f3242", "4cd0dd205dc3",
  "4d03db393cf1", "4d46feca1656", "4d9e4930d09c", "4da271bb37e5", "4dd6df71fb43", "4dea7e1fede7", "4e38adb6f60e", "4e5106428ab6",
  "4e5f8831cadc", "4f02b045bd5b", "4f56ff14c297", "4fdd7891819a", "4fe9d1b7f2f7", "501df053f26f", "50462633e2d5", "5050d80d22ec",
  "506a4c077eb5", "50758e10ce0f", "50e75ae58327", "50eaef4c7478", "512054b22a59", "51432c254f8f", "5153bbca08b4", "51a1f05af85e",
  "520a880fbd84", "521717f92c4d", "5217cbb8e93d", "5231a0fe3633", "52389bff9226", "5282bae8c730", "528699fd7f22", "529cbc8f2127",
  "529f00bc62df", "52ba7782da98", "532bfdeb7ae3", "538a77a7c421", "53bb9916f9db", "542760e258ca", "542a0430dd4d", "54d62ca6253b",
  "55034d156398", "5513b1dc2793", "551bb918d277", "558ef02784cf", "55cf45b19f30", "55d2f270fd48", "55d98e5e9c34", "561039868827",
  "561cff39a61c", "5670a94d7c26", "5687a650159d", "574ff692ac4e", "57c151f53b9b", "57c28590ef5d", "5805aaca60ef", "581d4093a90f",
  "5861c5b8b672", "588c01d5b84c", "58a005f14fe2", "58aaa90cae12", "58b53b86234f", "58b74636dc94", "58f9233eb099", "5935eee70184",
  "597cc28c234e", "599525a46bd0", "5a3db38fa309", "5a475b365e11", "5a66b071f9a0", "5af9abf3bc17", "5b4919c52cca", "5b49c438223f",
  "5b6ca96a766a", "5ba6b1dc7954", "5bbb9114b99d", "5bc426e8d81e", "5bd1094e2e5a", "5bd1269b11fc", "5bdc6de6f9af", "5beeb16852ee",
  "5c23b009a5d0", "5c2718a3e241", "5d1e437e74a3", "5d4950b68ed0", "5df7b8af5055", "5dff818fe417", "5e31a3a5371d", "5e35cfa5c8c5",
  "5e42b492f9b0", "5e65b8904fcb", "5e7ad10ad15c", "5ed3d2a3e949", "5f10cf309e5f", "5f83a059fb26", "5f9d45fa2f0b", "5fa3188cc950",
  "5fb93abaf138", "5fc26f429754", "5fc44be83f0b", "5fd849e1c2a4", "5fe72d4ce475", "6012cf785035", "601b2c247381", "602d64db269a",
  "604a8e5aa2b1", "604f25d2971d", "6080942295ff", "60af0511018c", "60c7a2e2a43a", "60ebcfc4c7e2", "612577ad95c9", "61342b396a46",
  "6134d2e57beb", "6140561e39cd", "61d60c715fe2", "6250e61f89fc", "6272978983bc", "62982d81d31f", "62a21a845183", "62a3686ed3a1",
  "62ad172e2ed9", "62cc13e73570", "63292ce94021", "6342e22bbb3c", "635f1679724a", "636f6a788717", "63a0f2077b9d", "63b314a28d1b",
  "63f4725421d4", "641d015cf831", "643162a53eb2", "645f29645b37", "6467590c5e8b", "648d58979e0b", "648e6464d032", "64919c4e0446",
  "64acc9f06812", "64b64423ba33", "64b775ea6dc9", "652b685ddd63", "655e68be9719", "6574ac40ddcf", "6629f0f7bd9f", "66302ed290a6",
  "663f63631382", "66640795291e", "66642dc91c2a", "668ac4525ba2", "66a009a2deed", "66c6b7e44e3f", "6770c319ff7b", "679e5df28b7d",
  "67c0d7ed00d4", "67cb61fee442", "67f40532c697", "680814f2e74e", "685095815bb7", "685fa333caaf", "6863067eb0a2", "68870f7077e5",
  "688f5752643e", "6914401398f6", "691ed8032055", "6962019176b9", "69bd9530f6bf", "69c33174130c", "6a08d1e29b15", "6a1f18086536",
  "6a2a36077ab3", "6a4c3a4483b0", "6a4ea0159468", "6a5620911f5a", "6a8cd96a4b77", "6a8f4aecb9d9", "6b0d117fc97c", "6b2e91df9e9f",
  "6b4d2d6b185d", "6b652e3651ef", "6b70e2d592dd", "6b8baccb2f21", "6bb4c90f9fb5", "6c3945c9c84e", "6c51649a6c64", "6c6f10f9a774",
  "6c731de28695", "6c75729b0e9a", "6cbc86b4a5ea", "6cd5e6b7ac9f", "6d111b98b316", "6d284457758b", "6d371d7b1e80", "6d447457333a",
  "6d5128cc0b27", "6d5ff955db95", "6dd86f1d7a22", "6dd948103b06", "6e2b9a49e87c", "6e5f3712838f", "6e85c58890bd", "6ea9e0245c0a",
  "6ecbd11a5955", "6f2b85effc77", "6f52240ee0d9", "6f94e53539e9", "6fab899e4340", "6fb712ed1f7e", "6fd568b5b9d0", "705105b00334",
  "7057ce3368e9", "708cb11801c4", "70a923d3d70c", "70c879f050e2", "70d3b821f7fd", "70d97a717bcc", "70f0b8e6e134", "716ed7f1132b",
  "71a13c84d8df", "71e8e9b74dfe", "723cbcc5b87f", "72745a9aaa8a", "72799c587eb5", "729369ca9e2e", "72d61e93a397", "72f7f3841ccd",
  "7325476fa93f", "73513993ecea", "7354e19c0921", "7360e50c1c29", "7370a410a437", "738c52cee6e7", "73d9534352dd", "747ee4f027bc",
  "74a5e7366ce2", "74c38463615f", "74f24931f4dc", "74f9a0d5e23c", "751411401f03", "752dd02be4df", "753692ec36ad", "75646a94dfdf",
  "756bf0365598", "7587166abc38", "75f9577a1637", "7604a77a2304", "763157cb722e", "7631938dfe01", "764dc7965f79", "7681bf4f9cbf",
  "773c1054a210", "77562953d4c8", "776e84d16e01", "777ba7c0093d", "77a1d107a383", "77b2883fafab", "77c14173f339", "77dff15cf637",
  "78041ec7f424", "7814d2a74f31", "78198e7ab262", "781cc6aaed5a", "78235676a176", "78cd1f211346", "78e3c1130862", "78e7771b8b46",
  "78f8f2661b30", "7905ac7b85ad", "7953d0568faa", "79896468d7c9", "79af57ff0980", "79fa04ba580e", "7a20682ce3ad", "7a7336850171",
  "7b24c1ad239d", "7b44d6dfd557", "7b4d28ee01e2", "7ba6c0384eef", "7c11082484ce", "7c12f957e1f5", "7c22aad82322", "7c2b1db141d3",
  "7cdfb3f816c6", "7cf0cab8aec8", "7d6e0aa0474b", "7d86bf73320f", "7d9b210c4436", "7e5b86b700f5", "7e9029c1d9bc", "7e91f45aaa0d",
  "7ea3fb6f020a", "7eac73af1a7c", "7ec879c8c860", "7ed607322da1", "7ed84db98979", "7f1a5fb7c1bd", "7f24e7f24761", "7f45a1ec065b",
  "7f8129857031", "7fbfa166e678", "7fc0d022aea9", "7fcd93626304", "7fd62ed6facf", "7fda86c263d7", "80150fd2e7be", "801c4bd329b7",
  "80327042b96b", "805736e58e20", "80ad6344380c", "81217fe5d264", "81777e3a3c47", "818b5cc5f21d", "8195acfcf569", "81c8cf32bd52",
  "81f3fa8e2c90", "821da41417d8", "8292a46a42d4", "82c75ea7ccad", "82cefa8283d3", "82d1a3c9c111", "82df26419dd6", "82e0c82933ca",
  "82f6a8c47d4b", "8335e4c92c40", "8365572ff141", "837b6c10338d", "837ceb63da79", "8387d9924c0f", "838c541196a5", "83ec5ba3176a",
  "83f10a44727f", "84246867f209", "842d8f5a6b6f", "846451ca20ee", "847e75a95bc4", "84c215cbec4c", "84c92d8abf32", "84c9f8b13ff7",
  "851e1489460c", "854bb690a022", "856cc99d8734", "856dd7210536", "85774c4c9f84", "858ae0f4e0b6", "85d90e8cd314", "85f994e61ecb",
  "863634f9c343", "8646db620a23", "867ecbb11273", "86c5fd302fa2", "8740c3f7ac25", "87c477ed31ca", "87d165020a22", "87d4a9832c12",
  "87f24f77d575", "8828e8d5e4b7", "882ec0ce952f", "886bf605bd60", "886e4864ab02", "88b8424b7614", "88e832540f6e", "88f7e84499fe",
  "8905c34886fe", "890fcf5cee5c", "89283c65295a", "893e7e1a1894", "895fdbc50185", "8996e8ead157", "89ed22fdad94", "8a0f4777953e",
  "8a2217b9a0b7", "8a446a936d39", "8a5c71540c4b", "8a8a1a9fe856", "8ab386c29a3d", "8abd073a7e85", "8acefe5733fc", "8b10ac15a0c7",
  "8b43a8335561", "8b6c7cebb1b1", "8b7ece27a60f", "8ba94a583afe", "8baebabc53fb", "8bbd387029fd", "8bc1d53cc57c", "8c35d5016df8",
  "8c49e6050f44", "8c5ab55b3cab", "8c8db18cdcb7", "8cc563f3e65e", "8cca306226fa", "8cea85785136", "8d168740cc4f", "8d3178468016",
  "8d41762cbbf3", "8d55f705cf2b", "8d70f09c8667", "8ddfd56dd746", "8e14ddfb7904", "8e219e08a6b8", "8e695edf2a32", "8e7d63679ed0",
  "8e84d80f9f49", "8e8bb9377668", "8e9ac7bc8f7c", "8e9f682a5c8b", "8eaabaec9101", "8eab5113844f", "8f16b551800f", "8f58daeba6f0",
  "8f78ced12c2a", "8f9e5ba40545", "8fa9503c4a5f", "8fb391fb1c42", "900ed32a0d46", "9013ae5f4633", "9025149f43db", "9059de4c26a7",
  "907114a73986", "90cce4510586", "90ebc1bde6f3", "916e3d393d7b", "91c81f16bed9", "91e7790c30ea", "91fd41108f1f", "9227a87d17bb",
  "927a63e17827", "92862c8a4064", "929f1ca4b2be", "92b9907fe970", "93931481a8b8", "93da47e612f3", "940a577bb504", "9471c6375e05",
  "947241d84dc6", "947f1b814858", "947f9e7b2620", "948c2674ef58", "94a691fd9261", "94d6f1583556", "94e8566ddfc1", "9508201864ad",
  "950d153d3e3c", "953f2df5d839", "95472f650a2b", "9573cc977127", "95796228d26d", "957dc7273dc2", "95b065ec0a7a", "95bc45f92163",
  "96147cdbfd69", "9615231ee629", "96849d5d4d21", "968d66044bac", "96c8cb7cd7b8", "9726e63749e1", "9739cee2117e", "975492684b58",
  "976b29ecf25c", "976c9a03a5c2", "97837a03e335", "9788088ef067", "97b03e9ce109", "97ff5ad9566b", "98360a5943ce", "98723004e3c6",
  "9883291e666c", "98970d1a1b80", "98a45bb536a2", "995223df54c6", "9953982f58c7", "995f0ed3d9a4", "999da4de4d65", "99fa50c991bc",
  "9aebcdbb9583", "9aee3b7acf70", "9b3ebe2b4009", "9b4525e2d90c", "9bbc28d7306f", "9bc3ee6d70da", "9c2cacf3e298", "9c39e2518016",
  "9c5fc5624cb2", "9cc1e4b7d867", "9d0e17268634", "9d77a24d0f4c", "9d7d70f5eefe", "9da38a89c028", "9dbe3cfc5af7", "9dd8187f58c3",
  "9de7843019e4", "9e0bf93e1aae", "9e507a6dfbf9", "9e6d51ee8e05", "9e93662965a5", "9ea685ad26cb", "9ebf503462b3", "9ef8106691f1",
  "9f0784a86315", "9f3e95f8f695", "9f578a498bea", "9f98b7c7f071", "9fb6e61c725b", "9fc1ed826ec0", "9fe4ed1dd227", "a02b10335a38",
  "a030bdb6057d", "a03872d4b889", "a0aecdeeb95b", "a0bc8aca39eb", "a0e0029f3cfe", "a118f3e8ee67", "a11dc057d77c", "a12b7850c2d4",
  "a1510e783717", "a157c2ebc68f", "a1a08f1670c9", "a1a5936d3b0f", "a1fc103ad24b", "a225c86c570f", "a25e998f2af2", "a29d85b887fb",
  "a2c3de3ac523", "a2d28723484c", "a2d2b87ba23e", "a2d8daa4281b", "a2e0a4cc1f22", "a2ef889c7d2f", "a303a7d1c0ff", "a340b215010c",
  "a343c8926d4f", "a3488918b620", "a37f27eaacdb", "a3df151cd9c2", "a3f6ae705e9f", "a40ccb890749", "a42517945927", "a43053caa7aa",
  "a459ec5c7292", "a45e61c1fde3", "a4c0f3637293", "a4deced01e44", "a4ed6c71bc50", "a510472311d2", "a536f5002c1c", "a574c7792796",
  "a5984592501e", "a5abd9370e1f", "a62d8e97ae3d", "a6320c021007", "a648eb66561c", "a665c12561df", "a6b89a9d0ca3", "a70793e1a0af",
  "a74462dfa466", "a7604550f24d", "a7a240ba8704", "a7e601839bc4", "a7e8564d5f62", "a86049e56b4b", "a898df22bfc7", "a8b1ce1080ca",
  "a8c30a5031be", "a8c724f9016d", "a8d79f40ddb7", "a91d17ab6a30", "a92145db3dd1", "a94875a767d9", "a952c8f76f58", "a9b143b9502f",
  "a9bca3265301", "a9d354a78348", "a9d5a11ce03d", "aa0f6233c939", "aa1c100951e3", "aa58b21b01d6", "aa5938302e66", "aa5d789135a8",
  "aa6a77d9ccef", "aac09a648fc3", "aac18ac6922e", "ab6a9151af96", "ab6db599234d", "ab98e5d7e5cd", "abeb27f42204", "ac04be1ced04",
  "ac2c6a98a5ad", "ac904498f2e9", "aca7bbb93cdd", "acadad95bd5c", "acbd4101d12d", "ad9aa691c99c", "adbfa1692226", "ae0043696e97",
  "ae10bfa00289", "ae5a7b6a60c2", "ae863bab4fa5", "ae967983dd2e", "aebe5829fdd7", "aeeb98e5f281", "aefd07eef7db", "af355e45241d",
  "afa5f599c01e", "afc107da16c4", "b00312aa1d91", "b01ea80f1c5f", "b0217ad3cbbc", "b0420a5cc77c", "b07d6029c657", "b0a9cc5408e0",
  "b0d3f94f12bf", "b0e20b4cbc3f", "b10ed6674245", "b14e8ab36668", "b177f16a315d", "b1792d5509c1", "b1c4bf176856", "b20068f2331c",
  "b21699bc307b", "b224706aed47", "b2253f5de165", "b279348477ab", "b2c2013e022c", "b2d14b3d4fea", "b2e07b1cd677", "b306bf8dfad0",
  "b499ce2a3fb9", "b4b0bf52aaa0", "b4d8672df1d6", "b51c85417044", "b540767acecd", "b55ba0d6a5ae", "b5edfa5343a4", "b60e590bbb7e",
  "b6140e5efede", "b62bf2673545", "b63b99f6383b", "b65ad7fe0a7d", "b748a919ad3e", "b805b99eb381", "b80b89efc345", "b81d9593a3f6",
  "b820970092b2", "b83e2edaf0d9", "b872eee5e361", "b8812920e25f", "b8baae94c5f4", "b9373420d162", "b94866cf7836", "b94bbc922005",
  "b9566eed2f0b", "b9579d748f5c", "b974ebb9a979", "b97ca4dca859", "b98ccbb62227", "b9dbcbacead9", "b9ddb0e1b4db", "ba266022f2a0",
  "ba3761eb5e07", "ba529c10080c", "ba8288394842", "ba8b2d324eb4", "ba959b7d8bfa", "ba9d261f6e9c", "baa6d556da03", "bae10942b116",
  "bae385fc493d", "bb8c8605c55d", "bb9b5c33cccc", "bbfc9c365c46", "bc16f5825a9d", "bc1fbecf3a4b", "bc6edc85b36d", "bc7df20ca51f",
  "bcade5095df6", "bcf46906d5d9", "bd2f9ca3345d", "bd38ed773240", "bd3b71d8d983", "bd73b962b400", "bd73e528e1ad", "bdafb8308c1c",
  "bdd79cef7e08", "bdf05a834e08", "bdfccb90bbe9", "be5021bd67c7", "be72fd4c64ff", "be8816dbd8b8", "bedd6f98909f", "beeaf874c510",
  "beeb26352f35", "bf3bc6aff43f", "bf5008e075a1", "bf55ea1fc5d7", "bf586d886bcf", "bf6387b8d717", "bf65c1637f93", "bf70f4a35d5b",
  "bf92b3b2768c", "bf957a5c3294", "bfb662ec5f74", "bfd6b995588e", "bffd4577058e", "c007c2974525", "c0a67292997c", "c0bc1e08f974",
  "c0e0ee532741", "c0f25e25e4ae", "c0f9fee974d5", "c10e6cca2cff", "c13c118384ca", "c21d19e95ff7", "c25c457f8739", "c269d7a8c7e9",
  "c2871d724340", "c339019bfab6", "c3963aedaac6", "c3c27bacd0e0", "c4336ca98d45", "c4395e2c3f2c", "c43b440010eb", "c467ac32b618",
  "c4785ba17e12", "c49cccbca81e", "c4e0ecf5b345", "c4e226b3805f", "c50cf0602a3c", "c534e12d5446", "c534f88a69df", "c557a059cd20",
  "c55da5036006", "c5833b30f352", "c591bab4e5d0", "c5db3b4f1b2c", "c5fab95bd114", "c655962ac207", "c681f5fcf737", "c6fcb8c1b253",
  "c6fe9d0b4dcf", "c75692d626b6", "c76433d87fb4", "c79798b764aa", "c8ad3f15af16", "c90adccab7dd", "c94c65b5ae52", "c983f00d24a6",
  "c99a2d67e83e", "c9d2901781f9", "c9ee93d2b361", "ca089bd7b137", "ca5bbecadb98", "ca6744f733d5", "cac219d63246", "cad1dafa8fe5",
  "cade2057b87b", "cae3f70ae379", "cb1afb47f6f3", "cb3eb7d022f9", "cb6e53541e37", "cb9e8664edea", "cba3bf6ff960", "cbb98af9965b",
  "cbc84b8de1eb", "cc0f8e2264ed", "cc6c525a934a", "cc7e4412564b", "ccaccf17bd5b", "ccfed53f5173", "cd03969a6045", "cd23c4c603b3",
  "cd4953df40ec", "cd5b158f21b7", "cdc06143ff2b", "cdcb1590dea3", "cde7d256764b", "cde9e58a9a4e", "ce24d5a0c23c", "ce42862c13e9",
  "ce7b4311b00b", "cec6e439afa9", "cec9074b2ba9", "ced97cc4a377", "cedcaa9ebd72", "cf33c062f0f7", "cf44623c9c55", "cf55ff993d34",
  "cf6db1fe2ea4", "cfbdb40cb7e4", "d0088bdd283e", "d032f5d27fd1", "d04b16ff98e7", "d0693c705daa", "d0dccc851781", "d106bda7d7d1",
  "d1244dd98430", "d134f032f4d7", "d151346fe7ee", "d15e9144a575", "d1847a6fb4eb", "d23e867e38e8", "d25301e95fc1", "d26898598758",
  "d284b11a328b", "d2d6c6350155", "d3196eb9676b", "d32030b56d20", "d3596ae53f47", "d3942783fcbe", "d39d6d12d2e2", "d39f811e2125",
  "d3c2d6d34104", "d3fc3547346f", "d43dd7e5eca6", "d4e82cd869a3", "d539e8aa3b71", "d5968db704cf", "d5c793cbf1a4", "d5cb968264a5",
  "d5dea2c1a65e", "d5f95dad999d", "d6779cd98e6c", "d6e689e165a0", "d717f800853a", "d73deefbb30c", "d76d6bf9b57d", "d9230916dae4",
  "d941a36dbe67", "d943bf3d919a", "d95a89beb618", "d9609c949e93", "d9b5820e9585", "d9d883b05161", "d9ea0daa465c", "da3a4b58c25f",
  "da667ed450eb", "da731d349f3b", "db028eeb570f", "db928fd5a8df", "dbd3c49fc4bb", "dbdbc97d5de3", "dc129cfdb5b4", "dc34efd49ed7",
  "dc58b910de5a", "dcb41d840468", "dd42d5e1f257", "dd592e138a8f", "dd5e148117aa", "dd5e51c15787", "dda79f003792", "ddbb6ceac7ea",
  "dded731bce79", "de2a833ae43f", "de51a79b32bf", "de834d289ce8", "dea31330ff63", "deae09060dcc", "df4f5a7315e6", "df53a0c58e2f",
  "df65e7b4f08b", "df853800ff17", "dfa17c2a6b3e", "dfb458bec1db", "dfe833375201", "e01ff276a679", "e0663397c5f5", "e0f1d12bf33a",
  "e0f50988df87", "e0f50f62ccc7", "e13ef94ba521", "e1de79ed06a6", "e1f7ce180233", "e20126b83e57", "e23a2bb061a8", "e27881329e97",
  "e27d61485293", "e2c9776ed01b", "e2caf61aae68", "e2d4e23b947b", "e339011b9533", "e352c9ac29fe", "e39836c85a79", "e3c1da693810",
  "e3d0c1c2e739", "e3dd30398f31", "e3fa61bf05e4", "e43c9e6aba39", "e45a825b2f9a", "e48be0bcd42d", "e4b6dd2322c5", "e4bb9f1ece9a",
  "e4cfcb80fb05", "e4d1b9a69515", "e5366208e059", "e57947224f83", "e58a91b91ad5", "e5bf1f03cacf", "e5fde34b0b2a", "e60c367da85f",
  "e65491290432", "e6684b51e119", "e670cee78172", "e6aaba1bd48e", "e6d0cd19736c", "e6e075463727", "e71b04791a00", "e7927047da67",
  "e797c0013811", "e7cacc70d1c6", "e7d7af0f1a0b", "e7dc08d2bbee", "e838fb751f4c", "e85f6b78597e", "e8c20772eb14", "e8f0bd401c53",
  "e8fd97b88489", "e92dee945e9a", "e99edc9cab6e", "e9b5b78ab020", "ea325d761f98", "ea45203a93b8", "ea474062d71d", "ea6b3349183a",
  "ea87b3d077de", "ea8e2fb2f63c", "eb2baaf73e4a", "ec118012949d", "ec3d5b62e67d", "ec3e5a9c9d4a", "ec47860233d3", "ec5acd5e21ac",
  "ecb4724bf6db", "ecdbaf6e2a0f", "ecf458f43c59", "ecf9d6667aec", "ed018ef583a1", "ed1ad93b8967", "ed1f912edf2e", "ed719858ee1b",
  "ed7ff1391d83", "ed8862db32fe", "edb219d99238", "ee461e73e256", "ee7637bd419d", "eea129ce6fe0", "eec0754ef2d8", "eeccef1ac21b",
  "eef02aa95e04", "eef694df20c0", "efcd950b8f1f", "f00b1e56865e", "f0222e7b74e6", "f09c8b936867", "f0a07b89af65", "f0abb1ad1d78",
  "f0abec8675eb", "f0ce94502ed9", "f10c6f91e039", "f113874e8b13", "f13f8e16a9f7", "f15e811721cd", "f164905a5c2e", "f19de46d2e10",
  "f1a41cde632c", "f1ab8d4fe842", "f1b7384743db", "f1c98ccb91d3", "f260a43ef10c", "f28105d6c7f5", "f2ace076bb4b", "f300e2772165",
  "f34e5fa8b24f", "f372a0ee787d", "f3918b80d188", "f3acb94d9084", "f3d70ed1182e", "f4335a17539e", "f487ce396018", "f4af8d8ef4ff",
  "f4cb23c928e0", "f4d1352f8a0f", "f5179771b075", "f51b9fbca21c", "f522c846bb26", "f5387f9bb6ed", "f581a0ce4c14", "f5b6e6eedd3d",
  "f5fdbf841296", "f629eb18bf7f", "f636554b556d", "f6483e55803f", "f6b6aad7a769", "f6dbf6cb84a3", "f7010c177a28", "f7069a5fc078",
  "f70ca1ed1652", "f72c9d09c954", "f72d71d3376f", "f737f7173f0f", "f73ba8bf6b81", "f7bb7a7e5248", "f814933892ab", "f82102d8b927",
  "f82c1f6ccfee", "f835feaea23d", "f8685538bda2", "f8f26225fd1d", "f8fa17ff0c04", "f9de06eb3a99", "f9eeb52c9bc4", "fa1ccea836b2",
  "fa7c22ec6184", "fb1df1a24e3f", "fb33ab7105db", "fb3eb1b5963d", "fb5f091a485a", "fb8e20fc2e4c", "fb9aa9a7b3d8", "fbdf768da07e",
  "fbec7c4d20ab", "fc240afbc771", "fc31f5f64efb", "fc642936a6c2", "fcb74742e504", "fd55616cb4d9", "fd71441cbdf3", "fd7a7174ba41",
  "fd9803f1c82b", "fdc07e271328", "fdc275ebe7bd", "fdfa5de1ca14", "fe263064ba02", "fe3a5d0b9c4e", "fea1dd5cfdb8", "feabefab8787",
  "fed61b94beac", "ff3acf93a782", "ff6d41505807", "ff9ee5fe1021", "ffd68fea62a1", "ffe72e29b6e1",
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
