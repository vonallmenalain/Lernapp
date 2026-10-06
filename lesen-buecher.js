/*
 * lesen-buecher.js – Die Bücher im Regal des Lesewagens.
 *
 * Nur Inhalt: Text, Bild und Fragen. Wie ein Buch aufgeht, vorgelesen und
 * umgeblättert wird, steht in buecher.js.
 *
 * Jedes Buch hat eine Stufe, und jede Stufe ihre Regeln
 * (scripts/validate-lesen.mjs prüft sie):
 *
 *   hoerbuch    Zum Zuhören, ab 3. Die Stimme liest alles vor; die Fragen am
 *               Schluss haben Bilder als Antworten – lesen muss niemand.
 *   erste       Erste Sätze, ab 5. Ein Satz je Seite, höchstens sieben
 *               Wörter, und nur Buchstaben der ersten vier Gruppen im
 *               Buchstabenhaus (lesen-inhalte.js): kein Z, J, V, keine
 *               Umlaute, kein ck, ng, pf, kein St oder Sp am Wortanfang.
 *   klein       Kleine Geschichten, ab 6. Kurze Seiten, alle Buchstaben.
 *   geschichte  Geschichten, ab 7. Längere Sätze, wörtliche Rede, und eine
 *               Frage, deren Antwort nicht wörtlich dasteht.
 *
 * Ein Buch:
 *
 *   id          Kennung, bleibt für immer (der Lesestand merkt sie sich)
 *   titel       steht auf dem Umschlag
 *   stufe       siehe oben
 *   figur       das Tier auf dem Umschlag (train-art.js, DRIVERS)
 *   landschaft  der Hintergrund der Bilder (train-scenes.js)
 *   farbe       der Umschlag
 *   gratis      ohne Kauf zu lesen. Die Schranke (entitlement.js,
 *               GRATIS_BUECHER) entscheidet; hier steht es für das Regal,
 *               und die Prüfung hält beides gleich.
 *   seiten      [{ text, bild }]
 *   fragen      [{ frage, antworten: [{ text, bild?, figur? }], richtig, seite }]
 *               richtig: welche Antwort stimmt (ab 0); seite: wo es im Buch
 *               steht (ab 1) – dorthin führt «Im Buch nachsehen».
 *
 * Ein Bild ist 240 × 152 gross, der Boden liegt bei y = 136:
 *
 *   figuren   [{ id, x, y?, s?, winkt?, blase?, dreh? }]   Tiere aus
 *             train-art.js; blase: ein Emoji in einer Denkblase über dem
 *             Kopf; dreh: schief, in Grad
 *   dinge     [{ e, x, y, s, vorne?, dreh? }]   ein Emoji, Mitte bei (x, y),
 *             s die Grösse; vorne: vor den Tieren statt dahinter
 *   zeichnungen [{ z, x, y, s?, licht? }]   was es nicht als Emoji gibt:
 *             fenster (ein erleuchtetes Fenster), hoehle (eine Felshöhle)
 *   landschaft, himmel, schnee   für diese Seite anders als im Buch
 *
 * Geschrieben in Schweizer Rechtschreibung: ss, nie das scharfe S. Die Texte sind
 * Entwürfe zum Gegenlesen.
 */
(() => {
  "use strict";

  const STUFEN = [
    { id: "hoerbuch", titel: "Zum Zuhören", ab: 3 },
    { id: "erste", titel: "Erste Sätze", ab: 5 },
    { id: "klein", titel: "Kleine Geschichten", ab: 6 },
    { id: "geschichte", titel: "Geschichten", ab: 7 },
  ];

  const BUECHER = [
    // -------------------------------------------------------------------------
    {
      id: "hase-rueebli",
      titel: "Wo ist das Rüebli?",
      stufe: "hoerbuch",
      figur: "rabbit",
      landschaft: "wiese",
      farbe: "#f5a623",
      gratis: true,
      seiten: [
        {
          text: "Das ist Hoppel. Hoppel ist ein kleiner Hase, und er hat grossen Hunger.",
          bild: { figuren: [{ id: "rabbit", x: 120 }], dinge: [{ e: "🌼", x: 42, y: 132, s: 16 }, { e: "🌷", x: 200, y: 130, s: 18 }] },
        },
        {
          text: "Hoppel hat Lust auf ein Rüebli. Ein knackiges, oranges Rüebli! Aber wo ist eins?",
          bild: { figuren: [{ id: "rabbit", x: 110, blase: "🥕" }], dinge: [{ e: "🌼", x: 206, y: 132, s: 14 }] },
        },
        {
          text: "Ist es unter der grossen Blume? Hoppel schaut nach. Nein, da sitzt nur ein Marienkäfer.",
          bild: { figuren: [{ id: "rabbit", x: 72 }], dinge: [{ e: "🌻", x: 164, y: 100, s: 62 }, { e: "🐞", x: 168, y: 136, s: 16, vorne: true }] },
        },
        {
          text: "Ist es hinter dem Busch? Hoppel schaut nach. Nein, da kriecht nur eine Schnecke – ganz, ganz langsam.",
          bild: { figuren: [{ id: "rabbit", x: 64 }], dinge: [{ e: "🌳", x: 166, y: 104, s: 66 }, { e: "🐌", x: 196, y: 138, s: 18, vorne: true }] },
        },
        {
          text: "Da ruft jemand: «Hoppel, komm schnell!» Es ist die Maus Mia. Sie hat etwas gefunden: ein riesiges Rüebli!",
          bild: { figuren: [{ id: "rabbit", x: 56 }, { id: "mouse", x: 146, s: 1.1, winkt: true }], dinge: [{ e: "🥕", x: 198, y: 118, s: 58 }] },
        },
        {
          text: "Das Rüebli ist viel zu gross für eine kleine Maus. «Wollen wir teilen?», fragt Mia. Und Hoppel nickt.",
          bild: { figuren: [{ id: "rabbit", x: 70 }, { id: "mouse", x: 172, s: 1.1 }], dinge: [{ e: "🥕", x: 121, y: 126, s: 40 }] },
        },
        {
          text: "Knack, knack, knack! Zusammen schmeckt es am allerbesten.",
          bild: { figuren: [{ id: "rabbit", x: 84 }, { id: "mouse", x: 154, s: 1.1 }], dinge: [{ e: "🥕", x: 120, y: 130, s: 24 }, { e: "❤️", x: 120, y: 62, s: 18 }] },
        },
      ],
      fragen: [
        {
          frage: "Was sucht Hoppel?",
          antworten: [{ bild: "🥕", text: "ein Rüebli" }, { bild: "🍎", text: "einen Apfel" }, { bild: "🌰", text: "eine Nuss" }],
          richtig: 0,
          seite: 2,
        },
        {
          frage: "Wer kriecht hinter dem Busch?",
          antworten: [{ bild: "🐞", text: "ein Marienkäfer" }, { bild: "🐌", text: "eine Schnecke" }, { bild: "🐝", text: "eine Biene" }],
          richtig: 1,
          seite: 4,
        },
        {
          frage: "Wer hat das Rüebli gefunden?",
          antworten: [{ figur: "fox", text: "der Fuchs" }, { figur: "owl", text: "die Eule" }, { figur: "mouse", text: "die Maus" }],
          richtig: 2,
          seite: 5,
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: "eule-ella",
      titel: "Eule Ella hört zu",
      stufe: "hoerbuch",
      figur: "owl",
      landschaft: "nacht",
      farbe: "#2f6f8f",
      seiten: [
        {
          text: "Das ist Ella. Ella ist eine Eule. Am Tag schläft sie, und in der Nacht ist sie wach.",
          bild: { figuren: [{ id: "owl", x: 120 }] },
        },
        {
          text: "Heute ist es im Wald ganz still. Alle anderen Tiere schlafen. Ella langweilt sich.",
          bild: { figuren: [{ id: "rabbit", x: 58, s: 1.1 }, { id: "owl", x: 160 }], dinge: [{ e: "💤", x: 82, y: 70, s: 16 }] },
        },
        {
          text: "Da sieht Ella ein Licht. Es kommt aus einem Haus am Waldrand. Leise fliegt sie hin.",
          bild: { figuren: [{ id: "owl", x: 62, y: 96 }], zeichnungen: [{ z: "fenster", x: 172, y: 92, s: 0.8, licht: true }] },
        },
        {
          text: "Im Zimmer sitzt ein Kind im Bett und liest ein Buch. Es liest laut vor – für seinen Teddy.",
          bild: {
            zeichnungen: [{ z: "fenster", x: 120, y: 82, s: 1.35, licht: true }],
            dinge: [{ e: "🧒", x: 104, y: 84, s: 30 }, { e: "📖", x: 104, y: 104, s: 16 }, { e: "🧸", x: 140, y: 96, s: 22 }],
          },
        },
        {
          text: "Ella setzt sich aufs Fensterbrett und hört zu. Die Geschichte ist so spannend! Ella hört zu und hört zu.",
          bild: {
            zeichnungen: [{ z: "fenster", x: 98, y: 82, s: 1.1, licht: true }],
            dinge: [{ e: "🧒", x: 86, y: 82, s: 24 }, { e: "🧸", x: 114, y: 90, s: 18 }],
            figuren: [{ id: "owl", x: 180, y: 128 }],
          },
        },
        {
          text: "Am Ende gähnt das Kind. «Gute Nacht, Teddy», sagt es und macht das Licht aus.",
          bild: { zeichnungen: [{ z: "fenster", x: 110, y: 86, s: 1.1, licht: false }], figuren: [{ id: "owl", x: 192, y: 130 }], dinge: [{ e: "💤", x: 112, y: 70, s: 18 }] },
        },
        {
          text: "Da wird der Himmel hell. Die Sonne geht auf. Ella fliegt nach Hause in ihren Baum. Sie ist müde – und glücklich. Morgen kommt sie wieder.",
          bild: { landschaft: "wiese", figuren: [{ id: "owl", x: 120, blase: "💤" }] },
        },
      ],
      fragen: [
        {
          frage: "Wohin fliegt Ella?",
          antworten: [{ bild: "⛰️", text: "auf einen Berg" }, { bild: "🏠", text: "zu einem Haus" }, { bild: "🌊", text: "ans Meer" }],
          richtig: 1,
          seite: 3,
        },
        {
          frage: "Was macht das Kind im Bett?",
          antworten: [{ bild: "📖", text: "Es liest." }, { bild: "⚽", text: "Es spielt Ball." }, { bild: "🎨", text: "Es malt." }],
          richtig: 0,
          seite: 4,
        },
        {
          frage: "Wem liest das Kind vor?",
          antworten: [{ bild: "🐶", text: "dem Hund" }, { bild: "🐱", text: "der Katze" }, { bild: "🧸", text: "dem Teddy" }],
          richtig: 2,
          seite: 4,
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: "leo-melone",
      titel: "Leo und die Melone",
      stufe: "erste",
      figur: "lion",
      landschaft: "savanne",
      farbe: "#e8543f",
      gratis: true,
      seiten: [
        { text: "Das ist Leo.", bild: { figuren: [{ id: "lion", x: 120 }] } },
        { text: "Leo mag Melonen.", bild: { figuren: [{ id: "lion", x: 100, blase: "🍉" }] } },
        { text: "Da ist eine Melone!", bild: { figuren: [{ id: "lion", x: 68 }], dinge: [{ e: "🍉", x: 172, y: 122, s: 42 }] } },
        { text: "Leo rollt die Melone.", bild: { figuren: [{ id: "lion", x: 92 }], dinge: [{ e: "🍉", x: 150, y: 124, s: 36 }] } },
        { text: "Oh nein! Die Melone rollt und rollt.", bild: { figuren: [{ id: "lion", x: 48 }], dinge: [{ e: "💨", x: 158, y: 128, s: 16 }, { e: "🍉", x: 194, y: 126, s: 32 }] } },
        { text: "Oma Rosa ruft: Halt!", bild: { figuren: [{ id: "lion", x: 40, s: 1.2 }, { id: "mouse", x: 204, winkt: true }], dinge: [{ e: "🍉", x: 166, y: 126, s: 32 }] } },
        { text: "Leo und Oma Rosa essen die Melone.", bild: { figuren: [{ id: "lion", x: 78 }, { id: "mouse", x: 166 }], dinge: [{ e: "🍉", x: 122, y: 130, s: 26 }, { e: "😋", x: 122, y: 70, s: 18 }] } },
      ],
      fragen: [
        {
          frage: "Was mag Leo?",
          antworten: [{ bild: "🍌", text: "Bananen" }, { bild: "🍉", text: "Melonen" }, { bild: "🥕", text: "Rüebli" }],
          richtig: 1,
          seite: 2,
        },
        {
          frage: "Wer ruft: Halt?",
          antworten: [{ figur: "mouse", text: "Oma Rosa" }, { figur: "owl", text: "die Eule" }, { figur: "frog", text: "der Frosch" }],
          richtig: 0,
          seite: 6,
        },
        {
          frage: "Was macht die Melone?",
          antworten: [{ text: "Sie rollt." }, { text: "Sie fliegt." }, { text: "Sie rennt." }],
          richtig: 0,
          seite: 5,
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: "pino-insel",
      titel: "Pino will auf die Insel",
      stufe: "erste",
      figur: "penguin",
      landschaft: "see",
      farbe: "#00a5b5",
      seiten: [
        { text: "Das ist Pino.", bild: { figuren: [{ id: "penguin", x: 120 }] } },
        { text: "Pino will auf die Insel.", bild: { figuren: [{ id: "penguin", x: 64, blase: "🏝️" }], dinge: [{ e: "🏝️", x: 186, y: 104, s: 46 }] } },
        { text: "Da ist ein Boot.", bild: { figuren: [{ id: "penguin", x: 58 }], dinge: [{ e: "🚤", x: 170, y: 98, s: 52 }] } },
        { text: "Pino ist im Boot.", bild: { figuren: [{ id: "penguin", x: 116, y: 108, s: 1.25 }], dinge: [{ e: "🚤", x: 120, y: 94, s: 64, vorne: true }] } },
        { text: "Tuut! Los geht es!", bild: { figuren: [{ id: "penguin", x: 96, y: 108, s: 1.25, winkt: true }], dinge: [{ e: "🚤", x: 100, y: 94, s: 64, vorne: true }, { e: "💨", x: 154, y: 104, s: 18 }, { e: "🎵", x: 56, y: 50, s: 16 }] } },
        { text: "Hui! Das Boot schaukelt.", bild: { figuren: [{ id: "penguin", x: 116, y: 108, s: 1.25, dreh: -12 }], dinge: [{ e: "🚤", x: 120, y: 94, s: 64, vorne: true, dreh: -12 }, { e: "🌊", x: 46, y: 104, s: 28, vorne: true }, { e: "🌊", x: 196, y: 102, s: 28, vorne: true }] } },
        { text: "Pino ist auf der Insel.", bild: { figuren: [{ id: "penguin", x: 108, y: 118, s: 1.3 }], dinge: [{ e: "🏝️", x: 132, y: 92, s: 104 }] } },
        { text: "Die Insel ist toll!", bild: { figuren: [{ id: "penguin", x: 108, y: 118, s: 1.3, winkt: true }], dinge: [{ e: "🏝️", x: 132, y: 92, s: 104 }, { e: "🐚", x: 150, y: 118, s: 12, vorne: true }] } },
      ],
      fragen: [
        {
          frage: "Wohin will Pino?",
          antworten: [{ bild: "⛰️", text: "auf den Berg" }, { bild: "🌳", text: "in den Wald" }, { bild: "🏝️", text: "auf die Insel" }],
          richtig: 2,
          seite: 2,
        },
        {
          frage: "Wie kommt Pino auf die Insel?",
          antworten: [{ bild: "🚤", text: "mit dem Boot" }, { bild: "🚂", text: "mit dem Zug" }, { bild: "🚲", text: "mit dem Velo" }],
          richtig: 0,
          seite: 3,
        },
        {
          frage: "Was ruft das Boot?",
          antworten: [{ text: "Muh!" }, { text: "Tuut!" }, { text: "Miau!" }],
          richtig: 1,
          seite: 5,
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: "flitz-nuss",
      titel: "Flitz und die vergessene Nuss",
      stufe: "klein",
      figur: "squirrel",
      landschaft: "wald",
      farbe: "#c9743a",
      seiten: [
        {
          text: "Es ist Herbst. Die Blätter sind gelb und rot. Flitz, das Eichhörnchen, hat viel zu tun.",
          bild: { figuren: [{ id: "squirrel", x: 120 }], dinge: [{ e: "🍂", x: 48, y: 58, s: 18 }, { e: "🍁", x: 192, y: 46, s: 18 }, { e: "🍂", x: 174, y: 92, s: 14 }] },
        },
        {
          text: "Flitz sammelt Nüsse. Eine Nuss versteckt er unter einem Stein. Eine im Moos. Und eine tief in der Erde.",
          bild: { figuren: [{ id: "squirrel", x: 120 }], dinge: [{ e: "🪨", x: 52, y: 130, s: 30 }, { e: "🌰", x: 74, y: 138, s: 14, vorne: true }, { e: "🌰", x: 184, y: 138, s: 14 }] },
        },
        {
          text: "Dann kommt der Winter. Es ist kalt, und überall liegt Schnee. Flitz hat Hunger.",
          bild: { schnee: true, figuren: [{ id: "squirrel", x: 120, blase: "🌰" }] },
        },
        {
          text: "Wo sind die Nüsse? Flitz sucht unter dem Stein. Da ist eine! Er sucht im Moos. Da ist noch eine!",
          bild: { schnee: true, figuren: [{ id: "squirrel", x: 120 }], dinge: [{ e: "🪨", x: 52, y: 130, s: 30 }, { e: "🌰", x: 78, y: 136, s: 16, vorne: true }, { e: "🌰", x: 186, y: 136, s: 16 }] },
        },
        {
          text: "Aber die dritte Nuss findet er nicht. Wo war sie nur? Flitz hat es vergessen.",
          bild: { schnee: true, figuren: [{ id: "squirrel", x: 120, blase: "❓" }] },
        },
        {
          text: "Im Frühling scheint die Sonne. Der Schnee ist weg. Und aus der Erde wächst etwas Kleines, Grünes.",
          bild: { figuren: [{ id: "squirrel", x: 78 }], dinge: [{ e: "🌱", x: 168, y: 128, s: 26 }, { e: "🌼", x: 212, y: 134, s: 12 }] },
        },
        {
          text: "Es ist ein kleiner Baum! Er ist aus der vergessenen Nuss gewachsen. «So etwas», lacht Flitz. «Vergessen ist manchmal gar nicht so schlecht.»",
          bild: { figuren: [{ id: "squirrel", x: 70, winkt: true }], dinge: [{ e: "🌳", x: 168, y: 112, s: 48 }] },
        },
      ],
      fragen: [
        {
          frage: "Was sammelt Flitz?",
          antworten: [{ bild: "🍓", text: "Erdbeeren" }, { bild: "🌰", text: "Nüsse" }, { bild: "🍄", text: "Pilze" }],
          richtig: 1,
          seite: 2,
        },
        {
          frage: "Wie viele Nüsse findet Flitz im Winter wieder?",
          antworten: [{ text: "keine" }, { text: "drei" }, { text: "zwei" }],
          richtig: 2,
          seite: 4,
        },
        {
          frage: "Woraus ist der kleine Baum gewachsen?",
          antworten: [{ bild: "🌰", text: "aus der vergessenen Nuss" }, { bild: "🪨", text: "aus dem Stein" }, { bild: "❄️", text: "aus dem Schnee" }],
          richtig: 0,
          seite: 7,
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: "sepp-gewitter",
      titel: "Sepp und das Gewitter",
      stufe: "geschichte",
      figur: "ibex",
      landschaft: "berge",
      farbe: "#7c5ce6",
      seiten: [
        {
          text: "Hoch oben in den Bergen wohnt Sepp, der Steinbock. Er springt über die Felsen, als wäre es eine Treppe.",
          bild: { figuren: [{ id: "ibex", x: 122, y: 116 }], dinge: [{ e: "🪨", x: 122, y: 124, s: 40, vorne: true }, { e: "🌸", x: 210, y: 136, s: 12 }] },
        },
        {
          text: "Eines Morgens sitzt eine kleine Maus auf einem Stein und weint. «Ich will zu meiner Familie in die Hütte», schluchzt sie. «Aber der Weg ist so weit.»",
          bild: { figuren: [{ id: "ibex", x: 66 }, { id: "mouse", x: 172, y: 118, s: 0.95 }], dinge: [{ e: "🪨", x: 172, y: 126, s: 38, vorne: true }, { e: "💧", x: 182, y: 82, s: 9 }] },
        },
        {
          text: "«Steig auf!», sagt Sepp. Die Maus klettert auf seinen Kopf und hält sich an den Hörnern fest. Und los geht es: Felsen hinauf, Felsen hinunter.",
          bild: { figuren: [{ id: "ibex", x: 120 }, { id: "mouse", x: 120, y: 68, s: 0.7, winkt: true }] },
        },
        {
          text: "Plötzlich wird der Himmel dunkel. Es donnert, und dicke Tropfen fallen. Ein Gewitter!",
          bild: {
            himmel: ["#4a5568", "#8a96a8"],
            figuren: [{ id: "ibex", x: 120 }, { id: "mouse", x: 120, y: 68, s: 0.7 }],
            dinge: [{ e: "⛈️", x: 52, y: 30, s: 30 }, { e: "⛈️", x: 190, y: 26, s: 26 }, { e: "⚡", x: 160, y: 56, s: 20 }],
          },
        },
        {
          text: "Zum Glück kennt Sepp eine Höhle. Dort warten die beiden, bis das Gewitter vorbei ist. Die Maus erzählt Geschichten, und Sepp vergisst, dass er sich vor dem Donner fürchtet.",
          bild: {
            himmel: ["#4a5568", "#8a96a8"],
            zeichnungen: [{ z: "hoehle", x: 120, y: 136, s: 1 }],
            figuren: [{ id: "ibex", x: 100, y: 132, s: 1.3 }, { id: "mouse", x: 146, y: 132, s: 0.9 }],
            dinge: [{ e: "⛈️", x: 200, y: 26, s: 24 }],
          },
        },
        {
          text: "Als sie wieder hinausschauen, steht ein Regenbogen über dem Tal. Und darunter? Darunter steht die Hütte!",
          bild: { figuren: [{ id: "ibex", x: 56 }, { id: "mouse", x: 56, y: 68, s: 0.7, winkt: true }], dinge: [{ e: "🌈", x: 156, y: 56, s: 74 }, { e: "🏡", x: 184, y: 112, s: 36 }] },
        },
        {
          text: "Vor der Tür wartet die ganze Mausfamilie. «Danke, Sepp!», rufen alle. Und Sepp? Der kommt jetzt jeden Sonntag vorbei – zum Geschichtenhören.",
          bild: {
            figuren: [{ id: "ibex", x: 50 }, { id: "mouse", x: 116, s: 1, winkt: true }, { id: "mouse", x: 150, s: 0.8 }, { id: "mouse", x: 178, s: 0.8, winkt: true }],
            dinge: [{ e: "🏡", x: 196, y: 98, s: 50 }],
          },
        },
      ],
      fragen: [
        {
          frage: "Wohin will die kleine Maus?",
          antworten: [{ bild: "🏰", text: "in ein Schloss" }, { bild: "🏡", text: "zu ihrer Familie in die Hütte" }, { bild: "🏝️", text: "auf eine Insel" }],
          richtig: 1,
          seite: 2,
        },
        {
          frage: "Wo warten Sepp und die Maus, bis das Gewitter vorbei ist?",
          antworten: [{ text: "unter einem Baum" }, { text: "in der Hütte" }, { text: "in einer Höhle" }],
          richtig: 2,
          seite: 5,
        },
        {
          frage: "Warum vergisst Sepp seine Angst vor dem Donner?",
          antworten: [{ text: "Die Maus erzählt Geschichten." }, { text: "Die Sonne scheint." }, { text: "Er schläft ein." }],
          richtig: 0,
          seite: 5,
        },
      ],
    },
  ];

  const BY_ID = Object.fromEntries(BUECHER.map((buch) => [buch.id, buch]));

  // ---------------------------------------------------------------------------
  // Sätze und Wörter
  // ---------------------------------------------------------------------------
  // Ein Satz endet mit . ! oder ?, wenn danach – nach einem schliessenden
  // Anführungszeichen – ein neuer beginnt: ein Grossbuchstabe oder «. So
  // bleibt «Steig auf!», sagt Sepp. ein Satz, denn nach dem » kommt ein Komma.
  function saetze(text) {
    const s = String(text || "").trim();
    const teile = [];
    let anfang = 0;
    const muster = /[.!?…]+[»"]?(?=\s+[«"A-ZÄÖÜ])/g;
    let treffer;
    while ((treffer = muster.exec(s))) {
      const ende = treffer.index + treffer[0].length;
      teile.push(s.slice(anfang, ende).trim());
      anfang = ende;
    }
    const rest = s.slice(anfang).trim();
    if (rest) teile.push(rest);
    return teile.filter(Boolean);
  }

  // Die Wörter eines Satzes, wie sie dastehen (mit Satzzeichen). Ein
  // Gedankenstrich ist kein Wort.
  function woerter(satz) {
    return String(satz || "").split(/\s+/).filter(Boolean);
  }

  // Das Wort ohne Satzzeichen – so wird es vorgesprochen.
  function nurWort(token) {
    return String(token || "").replace(/^[^A-Za-zÄÖÜäöüÉéÈèÀà0-9]+|[^A-Za-zÄÖÜäöüÉéÈèÀà0-9]+$/g, "");
  }

  function wortZahl(buch) {
    return (buch?.seiten || []).reduce((summe, seite) => summe + woerter(seite.text).filter((t) => nurWort(t)).length, 0);
  }

  window.LernappLeseBuecher = { STUFEN, BUECHER, BY_ID, saetze, woerter, nurWort, wortZahl };
})();
