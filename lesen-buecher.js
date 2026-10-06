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
 *   kapitel     Kapitelbücher, ab 8. Acht bis zwölf Seiten in drei bis fünf
 *               Kapiteln, jedes mit einer Überschrift und mindestens zwei
 *               Seiten. Eine Seite ist eine halbe Buchseite (30 bis 65
 *               Wörter), das Bild daneben kleiner. Vier Fragen. Ein
 *               Lesezeichen merkt sich, wo das Kind aufgehört hat.
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
 *   seiten      [{ text, bild, kapitel? }]
 *               kapitel: die Überschrift eines Kapitels, auf seiner ersten
 *               Seite (nur in Kapitelbüchern)
 *   fragen     [{ frage, antworten: [{ text, bild?, figur? }], richtig, seite }]
 *               richtig: welche Antwort stimmt (ab 0); seite: wo es im Buch
 *               steht (ab 1) – dorthin führt «Im Buch nachsehen».
 *   bilder      der Ordner mit gemalten Bildern, wenn das Buch welche hat:
 *               seite-01.webp, seite-02.webp … (eines je Seite, 1200 × 760),
 *               umschlag.webp (1200 × 760) und umschlag-klein.webp (480 × 304)
 *               fürs Regal. Sie stehen über der Zeichnung aus «bild», die
 *               bleibt, falls ein Bild nicht lädt (lesen-bilder.js). Wird ein
 *               Bild ersetzt, braucht der Cache der Buchbilder im Service
 *               Worker eine neue Nummer (BUCHBILDER_CACHE).
 *
 * Ein Bild ist 240 × 152 gross, der Boden liegt bei y = 136:
 *
 *   figuren   [{ id, x, y?, s?, winkt?, blase?, dreh? }]   Tiere aus
 *             train-art.js; blase: ein Emoji in einer Denkblase über dem
 *             Kopf; dreh: schief, in Grad
 *   dinge     [{ e, x, y, s, vorne?, dreh? }]   ein Emoji, Mitte bei (x, y),
 *             s die Grösse; vorne: vor den Tieren statt dahinter
 *   zeichnungen [{ z, x, y, s?, vorne?, … }]   was es nicht als Emoji
 *             gibt (lesen-bilder.js, ZEICHNUNGEN): fenster (ein Fenster,
 *             licht?), hoehle (eine Felshöhle), pfuetze, staffelei (eine
 *             Leinwand, das Bild darauf sind Dinge davor), seerose (ein
 *             Blatt auf dem Wasser), schneemann (augen?, nase?), fliege,
 *             blatt (ein grosses Blatt als Schirm), velo (rot), bambus
 *             (ein Stapel, stangen?), stein, wahrzeichen (id: ein
 *             Wahrzeichen der Reise wie lighthouse oder treehouse; licht?,
 *             aus?); dreh: schief, in Grad; vorne: vor den Tieren
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
    { id: "kapitel", titel: "Kapitelbücher", ab: 8 },
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
    // -------------------------------------------------------------------------
    {
      id: "pippa-regen",
      titel: "Pippa und der Regen",
      stufe: "hoerbuch",
      figur: "panda",
      landschaft: "dschungel",
      farbe: "#3fa34d",
      seiten: [
        {
          text: "Das ist Pippa. Sie ist ein kleiner Panda und will draussen spielen.",
          bild: { figuren: [{ id: "panda", x: 120 }], dinge: [{ e: "🌺", x: 50, y: 128, s: 18 }, { e: "🌺", x: 196, y: 132, s: 14 }] },
        },
        {
          text: "Aber da fallen Tropfen vom Himmel. Plitsch, platsch! Es regnet.",
          bild: { himmel: ["#8a96a8", "#c3ccd8"], figuren: [{ id: "panda", x: 120 }], dinge: [{ e: "🌧️", x: 70, y: 30, s: 30 }, { e: "🌧️", x: 176, y: 24, s: 26 }, { e: "💧", x: 150, y: 70, s: 10 }] },
        },
        {
          text: "Pippa hat keinen Schirm. Da sieht sie ein grosses Blatt. Sie hält es über den Kopf – wie einen Schirm!",
          bild: { himmel: ["#8a96a8", "#c3ccd8"], zeichnungen: [{ z: "blatt", x: 122, y: 50 }], figuren: [{ id: "panda", x: 120 }], dinge: [{ e: "🌧️", x: 196, y: 24, s: 26 }] },
        },
        {
          text: "Unter dem Blatt bleibt Pippa trocken. Da hüpft jemand vorbei: der Frosch Fridolin.",
          bild: { himmel: ["#8a96a8", "#c3ccd8"], zeichnungen: [{ z: "blatt", x: 80, y: 50 }], figuren: [{ id: "panda", x: 78 }, { id: "frog", x: 176, y: 122, s: 1.3 }], dinge: [{ e: "💦", x: 200, y: 132, s: 14 }] },
        },
        {
          text: "«Komm mit!», quakt Fridolin. «Regen ist das Schönste. Lass uns in die Pfützen springen!»",
          bild: { himmel: ["#8a96a8", "#c3ccd8"], zeichnungen: [{ z: "pfuetze", x: 150, y: 138, s: 1 }, { z: "blatt", x: 72, y: 50 }], figuren: [{ id: "panda", x: 70 }, { id: "frog", x: 160, y: 130, s: 1.3, winkt: true }] },
        },
        {
          text: "Pippa legt das Blatt weg. Hopp! Mitten in die Pfütze. Das spritzt!",
          bild: { himmel: ["#8a96a8", "#c3ccd8"], zeichnungen: [{ z: "pfuetze", x: 120, y: 138, s: 1.3 }, { z: "blatt", x: 30, y: 128, s: 0.5, dreh: -70 }], figuren: [{ id: "panda", x: 110, y: 130 }, { id: "frog", x: 180, y: 132, s: 1.2 }], dinge: [{ e: "💦", x: 80, y: 116, s: 22, vorne: true }, { e: "💦", x: 146, y: 112, s: 22, vorne: true }] },
        },
        {
          text: "Bald scheint wieder die Sonne. Pippa ist nass bis zu den Ohren – und sehr, sehr fröhlich.",
          bild: { figuren: [{ id: "panda", x: 96, winkt: true }, { id: "frog", x: 166, y: 132, s: 1.2 }], dinge: [{ e: "🌈", x: 130, y: 48, s: 56 }] },
        },
      ],
      fragen: [
        {
          frage: "Was hält Pippa über den Kopf?",
          antworten: [{ bild: "☂️", text: "einen Schirm" }, { bild: "🍃", text: "ein Blatt" }, { bild: "🧢", text: "eine Mütze" }],
          richtig: 1,
          seite: 3,
        },
        {
          frage: "Wer hüpft vorbei?",
          antworten: [{ figur: "frog", text: "der Frosch" }, { figur: "rabbit", text: "der Hase" }, { figur: "cat", text: "die Katze" }],
          richtig: 0,
          seite: 4,
        },
        {
          frage: "Wohin springen die beiden?",
          antworten: [{ bild: "🛏️", text: "ins Bett" }, { bild: "🌳", text: "auf den Baum" }, { bild: "💦", text: "in die Pfütze" }],
          richtig: 2,
          seite: 6,
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: "bruno-sterne",
      titel: "Bruno zählt Sterne",
      stufe: "hoerbuch",
      figur: "bear",
      landschaft: "nacht",
      farbe: "#7c5ce6",
      seiten: [
        {
          text: "Das ist Bruno, der kleine Bär. Es ist Nacht, und Bruno soll schlafen.",
          bild: { zeichnungen: [{ z: "hoehle", x: 120, y: 136, s: 0.9 }], figuren: [{ id: "bear", x: 120, y: 132 }] },
        },
        {
          text: "Aber Bruno ist noch gar nicht müde. Er schaut aus der Höhle zum Himmel hinauf.",
          bild: { zeichnungen: [{ z: "hoehle", x: 120, y: 136, s: 0.9 }], figuren: [{ id: "bear", x: 120, y: 132 }], dinge: [{ e: "⭐", x: 54, y: 30, s: 14 }, { e: "⭐", x: 176, y: 40, s: 12 }] },
        },
        {
          text: "Am Himmel funkeln Sterne. «Ich zähle sie!», sagt Bruno. «Eins, zwei, drei, vier …»",
          bild: { figuren: [{ id: "bear", x: 110, winkt: true }], dinge: [{ e: "⭐", x: 40, y: 26, s: 14 }, { e: "⭐", x: 80, y: 46, s: 12 }, { e: "⭐", x: 140, y: 22, s: 16 }, { e: "⭐", x: 172, y: 52, s: 12 }] },
        },
        {
          text: "Da kommt Ella, die Eule, vorbei. «Was machst du, Bruno?» – «Ich zähle die Sterne.»",
          bild: { figuren: [{ id: "bear", x: 80 }, { id: "owl", x: 176, y: 98, s: 1.2 }], dinge: [{ e: "⭐", x: 40, y: 26, s: 14 }, { e: "⭐", x: 120, y: 30, s: 12 }] },
        },
        {
          text: "«Alle Sterne?», fragt Ella und lacht. «Das schafft niemand. Es sind viel zu viele!»",
          bild: { figuren: [{ id: "bear", x: 80 }, { id: "owl", x: 166, y: 120, s: 1.3 }], dinge: [{ e: "✨", x: 120, y: 34, s: 22 }, { e: "⭐", x: 52, y: 30, s: 12 }, { e: "⭐", x: 200, y: 44, s: 12 }] },
        },
        {
          text: "Bruno zählt weiter: «Fünf, sechs, sieben …» Seine Augen werden schwer.",
          bild: { figuren: [{ id: "bear", x: 120, blase: "⭐" }] },
        },
        {
          text: "Bei acht schläft Bruno ein. Ella deckt ihn mit einem Blatt zu. «Gute Nacht, Bruno.»",
          bild: { zeichnungen: [{ z: "hoehle", x: 120, y: 136, s: 0.9 }], figuren: [{ id: "bear", x: 110, y: 132 }, { id: "owl", x: 180, y: 126, s: 1.1 }], dinge: [{ e: "🍂", x: 110, y: 116, s: 26, vorne: true }, { e: "💤", x: 128, y: 70, s: 16 }] },
        },
      ],
      fragen: [
        {
          frage: "Was zählt Bruno?",
          antworten: [{ bild: "🐑", text: "Schafe" }, { bild: "⭐", text: "Sterne" }, { bild: "🍎", text: "Äpfel" }],
          richtig: 1,
          seite: 3,
        },
        {
          frage: "Wer kommt vorbei?",
          antworten: [{ figur: "owl", text: "die Eule" }, { figur: "fox", text: "der Fuchs" }, { figur: "frog", text: "der Frosch" }],
          richtig: 0,
          seite: 4,
        },
        {
          frage: "Was macht Bruno am Schluss?",
          antworten: [{ bild: "🍯", text: "Er isst Honig." }, { bild: "🎵", text: "Er singt." }, { bild: "😴", text: "Er schläft ein." }],
          richtig: 2,
          seite: 7,
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: "fino-schal",
      titel: "Fino und der rote Schal",
      stufe: "hoerbuch",
      figur: "fox",
      landschaft: "wald",
      farbe: "#e8763a",
      seiten: [
        {
          text: "Das ist Fino, der Fuchs. Fino hat einen roten Schal. Den hat ihm seine Oma gestrickt.",
          bild: { figuren: [{ id: "fox", x: 120 }], dinge: [{ e: "🧣", x: 122, y: 100, s: 18, vorne: true }] },
        },
        {
          text: "Heute ist es windig. Huiii! Der Wind packt den Schal und trägt ihn fort.",
          bild: { figuren: [{ id: "fox", x: 80 }], dinge: [{ e: "💨", x: 124, y: 70, s: 22 }, { e: "🧣", x: 178, y: 48, s: 24 }, { e: "🍂", x: 150, y: 96, s: 14 }] },
        },
        {
          text: "«Mein Schal!», ruft Fino und rennt hinterher. Über die Wiese, durch den Bach, bis in den Wald.",
          bild: { figuren: [{ id: "fox", x: 70 }], dinge: [{ e: "🧣", x: 196, y: 40, s: 22 }, { e: "💧", x: 90, y: 132, s: 10, vorne: true }] },
        },
        {
          text: "Im Wald trifft er Flitz, das Eichhörnchen. «Hast du meinen Schal gesehen?» – «Ja! Er hängt oben im Baum.»",
          bild: { figuren: [{ id: "fox", x: 70 }, { id: "squirrel", x: 168, winkt: true }] },
        },
        {
          text: "Fino schaut hinauf. Im Baum liegt sein Schal. Und mittendrin sitzt ein kleiner Vogel. Dort hat er es warm und weich.",
          bild: { figuren: [{ id: "fox", x: 70 }], dinge: [{ e: "🌳", x: 170, y: 86, s: 92 }, { e: "🧣", x: 170, y: 64, s: 24, vorne: true }, { e: "🐦", x: 172, y: 52, s: 16, vorne: true }] },
        },
        {
          text: "Fino lächelt. «Behalte ihn», sagt er leise. «Du brauchst ihn mehr als ich.»",
          bild: { figuren: [{ id: "fox", x: 82, winkt: true }], dinge: [{ e: "🌳", x: 176, y: 86, s: 92 }, { e: "🧣", x: 176, y: 64, s: 24, vorne: true }, { e: "🐦", x: 178, y: 52, s: 16, vorne: true }, { e: "❤️", x: 128, y: 60, s: 14 }] },
        },
        {
          text: "Zu Hause erzählt Fino alles seiner Oma. Und die Oma? Die strickt ihm gleich einen neuen Schal.",
          bild: { zeichnungen: [{ z: "fenster", x: 120, y: 82, s: 1.3, licht: true }], dinge: [{ e: "🦊", x: 100, y: 84, s: 28 }, { e: "🧶", x: 138, y: 92, s: 20 }] },
        },
      ],
      fragen: [
        {
          frage: "Was trägt der Wind fort?",
          antworten: [{ bild: "🧤", text: "einen Handschuh" }, { bild: "🎩", text: "einen Hut" }, { bild: "🧣", text: "den Schal" }],
          richtig: 2,
          seite: 2,
        },
        {
          frage: "Wo ist der Schal?",
          antworten: [{ bild: "🌳", text: "oben im Baum" }, { bild: "🌊", text: "im Bach" }, { bild: "🏠", text: "bei Oma" }],
          richtig: 0,
          seite: 4,
        },
        {
          frage: "Wer sitzt jetzt im Schal?",
          antworten: [{ bild: "🐌", text: "eine Schnecke" }, { bild: "🐦", text: "ein Vogel" }, { bild: "🐭", text: "eine Maus" }],
          richtig: 1,
          seite: 5,
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: "mia-ball",
      titel: "Mia und der Ball",
      stufe: "erste",
      figur: "mouse",
      landschaft: "wiese",
      farbe: "#ef6fa8",
      seiten: [
        { text: "Das ist Mia.", bild: { figuren: [{ id: "mouse", x: 120 }] } },
        { text: "Mia hat einen Ball.", bild: { figuren: [{ id: "mouse", x: 100 }], dinge: [{ e: "🔴", x: 146, y: 126, s: 22 }] } },
        { text: "Der Ball ist rot.", bild: { dinge: [{ e: "🔴", x: 120, y: 110, s: 60 }] } },
        { text: "Mia wirft den Ball hoch.", bild: { figuren: [{ id: "mouse", x: 100, winkt: true }], dinge: [{ e: "🔴", x: 140, y: 30, s: 20 }] } },
        { text: "Oh nein! Der Ball ist im Baum.", bild: { figuren: [{ id: "mouse", x: 70 }], dinge: [{ e: "🌳", x: 168, y: 84, s: 96 }, { e: "🔴", x: 172, y: 62, s: 16, vorne: true }] } },
        { text: "Eule Ella holt den Ball.", bild: { figuren: [{ id: "mouse", x: 66 }, { id: "owl", x: 168, y: 76, s: 1.2 }], dinge: [{ e: "🌳", x: 168, y: 84, s: 96 }, { e: "🔴", x: 190, y: 72, s: 16, vorne: true }] } },
        { text: "Danke, Ella! Mia und Ella lachen.", bild: { figuren: [{ id: "mouse", x: 90, winkt: true }, { id: "owl", x: 160 }], dinge: [{ e: "🔴", x: 124, y: 128, s: 18 }] } },
      ],
      fragen: [
        {
          frage: "Was hat Mia?",
          antworten: [{ bild: "🧸", text: "einen Teddy" }, { bild: "🔴", text: "einen Ball" }, { bild: "🎈", text: "einen Ballon" }],
          richtig: 1,
          seite: 2,
        },
        {
          frage: "Wo ist der Ball?",
          antworten: [{ text: "im Haus" }, { text: "im Bett" }, { text: "im Baum" }],
          richtig: 2,
          seite: 5,
        },
        {
          frage: "Wer holt den Ball?",
          antworten: [{ figur: "owl", text: "Ella" }, { figur: "fox", text: "der Fuchs" }, { figur: "frog", text: "der Frosch" }],
          richtig: 0,
          seite: 6,
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: "tim-malt",
      titel: "Kater Tim malt",
      stufe: "erste",
      figur: "cat",
      landschaft: "wiese",
      farbe: "#f5a623",
      seiten: [
        { text: "Das ist Tim.", bild: { figuren: [{ id: "cat", x: 120 }] } },
        { text: "Tim ist ein Kater.", bild: { figuren: [{ id: "cat", x: 120 }], dinge: [{ e: "🐾", x: 60, y: 134, s: 14 }, { e: "🐾", x: 82, y: 128, s: 14 }] } },
        { text: "Tim malt ein Haus.", bild: { figuren: [{ id: "cat", x: 70 }], zeichnungen: [{ z: "staffelei", x: 160, y: 136, s: 1 }], dinge: [{ e: "🏠", x: 160, y: 80, s: 30, vorne: true }] } },
        { text: "Tim malt eine Sonne.", bild: { figuren: [{ id: "cat", x: 70 }], zeichnungen: [{ z: "staffelei", x: 160, y: 136, s: 1 }], dinge: [{ e: "🏠", x: 154, y: 84, s: 26, vorne: true }, { e: "☀️", x: 178, y: 62, s: 18, vorne: true }] } },
        { text: "Oh nein! Farbe am Bauch!", bild: { figuren: [{ id: "cat", x: 104 }], dinge: [{ e: "🎨", x: 160, y: 120, s: 26 }, { e: "🔴", x: 104, y: 112, s: 9, vorne: true }, { e: "🔵", x: 96, y: 104, s: 8, vorne: true }] } },
        { text: "Tim lacht und lacht.", bild: { figuren: [{ id: "cat", x: 120, winkt: true }], dinge: [{ e: "😹", x: 160, y: 60, s: 20 }] } },
        { text: "Das Bild ist toll!", bild: { zeichnungen: [{ z: "staffelei", x: 120, y: 136, s: 1.2 }], dinge: [{ e: "🏠", x: 112, y: 72, s: 34, vorne: true }, { e: "☀️", x: 140, y: 46, s: 20, vorne: true }, { e: "⭐", x: 196, y: 40, s: 16 }] } },
      ],
      fragen: [
        {
          frage: "Was malt Tim?",
          antworten: [{ bild: "🚗", text: "ein Auto" }, { bild: "🌳", text: "einen Baum" }, { bild: "🏠", text: "ein Haus" }],
          richtig: 2,
          seite: 3,
        },
        {
          frage: "Wo ist die Farbe?",
          antworten: [{ text: "am Bauch" }, { text: "am Ohr" }, { text: "am Bein" }],
          richtig: 0,
          seite: 5,
        },
        {
          frage: "Wie ist das Bild?",
          antworten: [{ text: "nass" }, { text: "toll" }, { text: "alt" }],
          richtig: 1,
          seite: 7,
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: "fred-frosch",
      titel: "Fred, der Frosch",
      stufe: "erste",
      figur: "frog",
      landschaft: "see",
      farbe: "#5cb85c",
      seiten: [
        { text: "Das ist Fred.", bild: { figuren: [{ id: "frog", x: 120 }] } },
        { text: "Fred ist ein Frosch.", bild: { figuren: [{ id: "frog", x: 120 }], dinge: [{ e: "💧", x: 150, y: 70, s: 10 }] } },
        { text: "Fred ist auf dem Blatt.", bild: { zeichnungen: [{ z: "seerose", x: 120, y: 112, s: 1.2 }], figuren: [{ id: "frog", x: 120, y: 108, s: 1.3 }] } },
        { text: "Da ist eine Fliege!", bild: { figuren: [{ id: "frog", x: 100, y: 108, s: 1.3 }], zeichnungen: [{ z: "seerose", x: 100, y: 112, s: 1.2 }, { z: "fliege", x: 178, y: 46, s: 1.4 }] } },
        { text: "Schnapp! Fred hat die Fliege.", bild: { zeichnungen: [{ z: "seerose", x: 110, y: 112, s: 1.2 }], figuren: [{ id: "frog", x: 110, y: 108, s: 1.3, winkt: true }], dinge: [{ e: "💥", x: 142, y: 58, s: 18 }] } },
        { text: "Fred ist satt.", bild: { zeichnungen: [{ z: "seerose", x: 120, y: 112, s: 1.2 }], figuren: [{ id: "frog", x: 120, y: 108, s: 1.3, blase: "😋" }] } },
        { text: "Gute Nacht, Fred!", bild: { landschaft: "nacht", zeichnungen: [{ z: "seerose", x: 120, y: 112, s: 1.2 }], figuren: [{ id: "frog", x: 120, y: 108, s: 1.3 }], dinge: [{ e: "💤", x: 146, y: 54, s: 16 }] } },
      ],
      fragen: [
        {
          frage: "Wo ist Fred?",
          antworten: [{ text: "im Haus" }, { text: "auf dem Blatt" }, { text: "auf dem Baum" }],
          richtig: 1,
          seite: 3,
        },
        {
          frage: "Was hat Fred?",
          antworten: [{ text: "die Fliege" }, { text: "den Fisch" }, { text: "den Ball" }],
          richtig: 0,
          seite: 5,
        },
        {
          frage: "Wie ist Fred am Ende?",
          antworten: [{ text: "traurig" }, { text: "alt" }, { text: "satt" }],
          richtig: 2,
          seite: 6,
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: "pino-schneemann",
      titel: "Pino baut einen Schneemann",
      stufe: "klein",
      figur: "penguin",
      landschaft: "berge",
      farbe: "#00a5b5",
      seiten: [
        {
          text: "Es hat geschneit. Alles ist weiss. Pino will einen Schneemann bauen.",
          bild: { schnee: true, figuren: [{ id: "penguin", x: 120, blase: "⛄" }] },
        },
        {
          text: "Er rollt eine grosse Kugel für den Bauch und eine kleine für den Kopf.",
          bild: { schnee: true, figuren: [{ id: "penguin", x: 70 }], zeichnungen: [{ z: "schneemann", x: 166, y: 136, s: 0.8 }] },
        },
        {
          text: "Hoppel, der Hase, bringt ein Rüebli für die Nase. Flitz bringt zwei Steine für die Augen.",
          bild: { schnee: true, figuren: [{ id: "rabbit", x: 50, s: 1.2 }, { id: "squirrel", x: 96, s: 1.1 }], zeichnungen: [{ z: "schneemann", x: 170, y: 136, s: 0.9 }], dinge: [{ e: "🥕", x: 66, y: 102, s: 14, vorne: true }, { e: "⚫", x: 112, y: 99, s: 7, vorne: true }, { e: "⚫", x: 121, y: 102, s: 7, vorne: true }] },
        },
        {
          text: "Fertig! Der Schneemann ist so gross wie Pino. Alle klatschen.",
          bild: { schnee: true, figuren: [{ id: "penguin", x: 64, winkt: true }], zeichnungen: [{ z: "schneemann", x: 160, y: 136, s: 1, augen: true, nase: true }], dinge: [{ e: "👏", x: 112, y: 54, s: 16 }] },
        },
        {
          text: "In der Nacht hoppelt jemand zum Schneemann und knabbert an seiner Nase. Es ist Hoppel! Er hat Hunger.",
          bild: { landschaft: "nacht", schnee: true, figuren: [{ id: "rabbit", x: 104, s: 1.2 }], zeichnungen: [{ z: "schneemann", x: 166, y: 136, s: 1, augen: true, nase: true }] },
        },
        {
          text: "Am Morgen fehlt dem Schneemann die Nase. Pino schaut die Spuren im Schnee an und lacht: «Hoppel, du Schlingel!»",
          bild: { schnee: true, figuren: [{ id: "penguin", x: 70, blase: "🐰" }], zeichnungen: [{ z: "schneemann", x: 166, y: 136, s: 1, augen: true }], dinge: [{ e: "🐾", x: 118, y: 132, s: 12 }, { e: "🐾", x: 136, y: 128, s: 12 }] },
        },
        {
          text: "Hoppel kommt mit einem neuen Rüebli. «Das ist für die Nase», sagt er. «Versprochen!»",
          bild: { schnee: true, figuren: [{ id: "rabbit", x: 60, s: 1.2, winkt: true }, { id: "penguin", x: 110 }], zeichnungen: [{ z: "schneemann", x: 176, y: 136, s: 1, augen: true }], dinge: [{ e: "🥕", x: 78, y: 100, s: 16, vorne: true }] },
        },
      ],
      fragen: [
        {
          frage: "Was baut Pino?",
          antworten: [{ bild: "🏰", text: "ein Schloss" }, { bild: "⛄", text: "einen Schneemann" }, { bild: "🛷", text: "einen Schlitten" }],
          richtig: 1,
          seite: 1,
        },
        {
          frage: "Wer knabbert an der Nase?",
          antworten: [{ figur: "squirrel", text: "Flitz" }, { figur: "fox", text: "der Fuchs" }, { figur: "rabbit", text: "Hoppel" }],
          richtig: 2,
          seite: 5,
        },
        {
          frage: "Woher weiss Pino, wer die Nase gegessen hat?",
          antworten: [{ text: "Er sieht die Spuren im Schnee." }, { text: "Der Schneemann sagt es ihm." }, { text: "Er hat es geträumt." }],
          richtig: 0,
          seite: 6,
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: "flitz-geheimnis",
      titel: "Ein Geheimnis im Wald",
      stufe: "klein",
      figur: "squirrel",
      landschaft: "wald",
      farbe: "#c9743a",
      seiten: [
        {
          text: "Flitz wacht auf. Heute hat er Geburtstag! Aber niemand ist da.",
          bild: { figuren: [{ id: "squirrel", x: 120, blase: "🎂" }] },
        },
        {
          text: "Er sucht seine Freunde. Ella ist nicht in ihrem Baum. Hoppel ist nicht in seinem Bau.",
          bild: { figuren: [{ id: "squirrel", x: 90, blase: "❓" }], dinge: [{ e: "🌳", x: 186, y: 90, s: 70 }] },
        },
        {
          text: "Da sieht Flitz Spuren auf dem Weg, kleine und grosse. Sie führen in den Wald hinein.",
          bild: { figuren: [{ id: "squirrel", x: 60 }], dinge: [{ e: "🐾", x: 110, y: 134, s: 12 }, { e: "🐾", x: 140, y: 128, s: 14 }, { e: "🐾", x: 172, y: 134, s: 12 }, { e: "🐾", x: 204, y: 128, s: 14 }] },
        },
        {
          text: "Flitz folgt den Spuren bis zu einem grossen Busch. Dahinter hört er leise Stimmen.",
          bild: { figuren: [{ id: "squirrel", x: 60 }], dinge: [{ e: "🌳", x: 168, y: 104, s: 70 }, { e: "💬", x: 200, y: 56, s: 18 }] },
        },
        {
          text: "«Überraschung!», rufen alle. Da sind Ella, Hoppel und Bruno – mit einem Kuchen voller Nüsse.",
          bild: { figuren: [{ id: "owl", x: 44, s: 1.2 }, { id: "rabbit", x: 92, s: 1.2, winkt: true }, { id: "bear", x: 196, s: 1.4 }, { id: "squirrel", x: 146, s: 1.2 }], dinge: [{ e: "🎂", x: 146, y: 70, s: 24 }, { e: "🎉", x: 120, y: 34, s: 18 }] },
        },
        {
          text: "Flitz staunt. «Ihr habt mich gar nicht vergessen!»",
          bild: { figuren: [{ id: "squirrel", x: 120, blase: "😊" }], dinge: [{ e: "🎂", x: 170, y: 124, s: 26 }] },
        },
        {
          text: "«Natürlich nicht», lacht Ella. «Wir mussten uns nur gut verstecken.»",
          bild: { figuren: [{ id: "owl", x: 70, s: 1.3, winkt: true }, { id: "squirrel", x: 160, s: 1.3 }], dinge: [{ e: "🎈", x: 210, y: 50, s: 20 }, { e: "🎈", x: 26, y: 60, s: 18 }] },
        },
      ],
      fragen: [
        {
          frage: "Was hat Flitz heute?",
          antworten: [{ bild: "🎂", text: "Geburtstag" }, { bild: "🤧", text: "Schnupfen" }, { bild: "🎒", text: "Schule" }],
          richtig: 0,
          seite: 1,
        },
        {
          frage: "Wohin führen die Spuren?",
          antworten: [{ text: "zu einem grossen Busch" }, { text: "zum See" }, { text: "auf einen Berg" }],
          richtig: 0,
          seite: 4,
        },
        {
          frage: "Warum war am Morgen niemand da?",
          antworten: [{ text: "Sie waren in den Ferien." }, { text: "Sie haben eine Überraschung vorbereitet." }, { text: "Sie haben noch geschlafen." }],
          richtig: 1,
          seite: 7,
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: "leo-bruellt",
      titel: "Leo lernt brüllen",
      stufe: "geschichte",
      figur: "lion",
      landschaft: "savanne",
      farbe: "#e0a53c",
      seiten: [
        {
          text: "Leo ist ein junger Löwe. Alle Löwen können brüllen – nur Leo nicht. Wenn er es versucht, kommt bloss ein leises «Miau» heraus.",
          bild: { figuren: [{ id: "lion", x: 120, blase: "🐱" }] },
        },
        {
          text: "Die anderen Tiere kichern. «Ein Löwe, der miaut!», krächzt der Papagei. Leo schämt sich und versteckt sich im hohen Gras.",
          bild: { figuren: [{ id: "lion", x: 150, y: 140, s: 1.2 }], dinge: [{ e: "🦜", x: 60, y: 60, s: 24 }, { e: "🌾", x: 136, y: 126, s: 30, vorne: true }, { e: "🌾", x: 168, y: 128, s: 28, vorne: true }] },
        },
        {
          text: "Da kommt Oma Rosa, die Maus. «Weisst du», sagt sie, «Brüllen kommt aus dem Bauch. Hol tief Luft, so wie ein Ballon.»",
          bild: { figuren: [{ id: "lion", x: 76 }, { id: "mouse", x: 170, s: 1.1, winkt: true }], dinge: [{ e: "🎈", x: 196, y: 50, s: 18 }] },
        },
        {
          text: "Leo übt jeden Tag. Er holt Luft, bis sein Bauch ganz rund ist. Aber es klappt noch nicht.",
          bild: { figuren: [{ id: "lion", x: 120, blase: "💨" }] },
        },
        {
          text: "Eines Tages hört Leo einen Schrei. Ein kleiner Affe hängt an einem dünnen Ast über dem Fluss. Unten wartet ein Krokodil!",
          bild: { figuren: [{ id: "lion", x: 50 }], dinge: [{ e: "🌳", x: 168, y: 72, s: 80 }, { e: "🐒", x: 160, y: 84, s: 20, vorne: true }, { e: "🐊", x: 176, y: 134, s: 30, vorne: true }] },
        },
        {
          text: "Leo denkt nicht lange nach. Er holt Luft, ganz tief aus dem Bauch – und brüllt: «ROOOAAAR!» Das Krokodil erschrickt und taucht weg.",
          bild: { figuren: [{ id: "lion", x: 74 }], dinge: [{ e: "💥", x: 118, y: 64, s: 26 }, { e: "🌳", x: 178, y: 72, s: 80 }, { e: "🐒", x: 170, y: 84, s: 20, vorne: true }, { e: "💦", x: 186, y: 136, s: 20, vorne: true }] },
        },
        {
          text: "Der kleine Affe klettert sicher ans Ufer. «Danke, Leo!» Seit diesem Tag lacht niemand mehr über ihn. Und Leo brüllt nur, wenn es wirklich nötig ist.",
          bild: { figuren: [{ id: "lion", x: 90, winkt: true }], dinge: [{ e: "🐒", x: 150, y: 126, s: 26 }, { e: "❤️", x: 120, y: 56, s: 16 }] },
        },
      ],
      fragen: [
        {
          frage: "Was kann Leo am Anfang nicht?",
          antworten: [{ text: "rennen" }, { text: "brüllen" }, { text: "schlafen" }],
          richtig: 1,
          seite: 1,
        },
        {
          frage: "Wer zeigt Leo, wie man brüllt?",
          antworten: [{ figur: "mouse", text: "Oma Rosa, die Maus" }, { figur: "owl", text: "die Eule" }, { figur: "frog", text: "der Frosch" }],
          richtig: 0,
          seite: 3,
        },
        {
          frage: "Warum kann Leo am Ende brüllen?",
          antworten: [{ text: "Er hat grossen Hunger." }, { text: "Er will dem kleinen Affen helfen." }, { text: "Er hat Angst vor dem Papagei." }],
          richtig: 1,
          seite: 6,
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: "reise-mond",
      titel: "Die Reise zum Mond",
      stufe: "geschichte",
      figur: "owl",
      landschaft: "weltraum",
      farbe: "#2f6f8f",
      seiten: [
        {
          text: "Ella, die Eule, schaut jede Nacht zum Mond hinauf. «Wie es dort oben wohl aussieht?», fragt sie sich.",
          bild: { landschaft: "nacht", figuren: [{ id: "owl", x: 110, blase: "🌙" }] },
        },
        {
          text: "Ihre Freundin Mia, die Maus, hat eine Idee: «Wir bauen eine Rakete!» Aus einer alten Kiste, zwei Dosen und ganz viel Klebeband.",
          bild: { landschaft: "nacht", figuren: [{ id: "owl", x: 60 }, { id: "mouse", x: 116, s: 1.1, winkt: true }], dinge: [{ e: "📦", x: 182, y: 118, s: 40 }, { e: "🥫", x: 160, y: 134, s: 14 }, { e: "🥫", x: 206, y: 134, s: 14 }] },
        },
        {
          text: "Am Abend steigen die beiden ein. «Drei, zwei, eins – los!», ruft Mia. Ella schliesst die Augen und hält sich gut fest.",
          bild: { landschaft: "nacht", dinge: [{ e: "🚀", x: 120, y: 82, s: 70 }, { e: "💨", x: 98, y: 132, s: 22 }, { e: "✨", x: 168, y: 40, s: 18 }] },
        },
        {
          text: "Als sie die Augen öffnet, schweben sie zwischen den Sternen. Unter ihnen leuchtet die Erde, blau und rund.",
          bild: { figuren: [{ id: "owl", x: 86, y: 92, dreh: -10 }, { id: "mouse", x: 150, y: 84, s: 1.1, dreh: 12 }], dinge: [{ e: "⭐", x: 40, y: 30, s: 12 }, { e: "✨", x: 118, y: 40, s: 14 }] },
        },
        {
          text: "Auf dem Mond ist alles grau und still. Bei jedem Schritt hüpfen sie hoch in die Luft. «Hier bin ich ganz leicht!», jubelt Mia.",
          bild: { figuren: [{ id: "owl", x: 76 }, { id: "mouse", x: 150, y: 96, s: 1.1, winkt: true }], dinge: [{ e: "✨", x: 150, y: 120, s: 12 }] },
        },
        {
          text: "Plötzlich gähnt Ella. Und dann noch einmal. Der Mond wird blasser, und die Sterne verschwimmen …",
          bild: { figuren: [{ id: "owl", x: 120, blase: "💤" }], dinge: [{ e: "✨", x: 60, y: 40, s: 14 }, { e: "✨", x: 184, y: 50, s: 14 }] },
        },
        {
          text: "Ella wacht in ihrem Baum auf. Unten im Gras liegt die alte Kiste. War alles nur ein Traum? Mia zwinkert ihr zu.",
          bild: { landschaft: "wald", figuren: [{ id: "owl", x: 90, y: 96, s: 1.2 }, { id: "mouse", x: 170, s: 1.1, blase: "😉" }], dinge: [{ e: "📦", x: 128, y: 126, s: 30 }] },
        },
      ],
      fragen: [
        {
          frage: "Woraus bauen die beiden ihre Rakete?",
          antworten: [{ text: "aus Holz und Nägeln" }, { text: "aus einer alten Kiste" }, { text: "aus Papier" }],
          richtig: 1,
          seite: 2,
        },
        {
          frage: "Wie fühlt sich Mia auf dem Mond?",
          antworten: [{ text: "ganz leicht" }, { text: "ganz schwer" }, { text: "sehr hungrig" }],
          richtig: 0,
          seite: 5,
        },
        {
          frage: "Was könnte die Reise gewesen sein?",
          antworten: [{ text: "Ein Ausflug mit dem Zug." }, { text: "Ein Traum – vielleicht auch nicht." }, { text: "Ein Film im Kino." }],
          richtig: 1,
          seite: 7,
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: "hoppel-velo",
      titel: "Hoppel lernt Velo fahren",
      stufe: "klein",
      figur: "rabbit",
      landschaft: "wiese",
      farbe: "#e8543f",
      seiten: [
        {
          text: "Hoppel hat ein neues Velo. Es ist rot und glänzt in der Sonne.",
          bild: { zeichnungen: [{ z: "velo", x: 166, y: 136, s: 1.25 }], figuren: [{ id: "rabbit", x: 70, winkt: true }], dinge: [{ e: "✨", x: 204, y: 74, s: 14 }] },
        },
        {
          text: "Hoppel setzt sich auf den Sattel. Er tritt in die Pedale – und kippt um. Plumps!",
          bild: { zeichnungen: [{ z: "velo", x: 174, y: 118, s: 1.15, dreh: -30 }], figuren: [{ id: "rabbit", x: 100, y: 134, dreh: -72 }], dinge: [{ e: "💫", x: 66, y: 94, s: 18 }] },
        },
        {
          text: "Er versucht es noch einmal. Plumps! Und noch einmal. Plumps! Jetzt ist Hoppel traurig.",
          bild: { zeichnungen: [{ z: "velo", x: 176, y: 132, s: 1.1, dreh: -14 }], figuren: [{ id: "rabbit", x: 84, blase: "😢" }] },
        },
        {
          text: "Da kommt Fino, der Fuchs. «Ich halte dich hinten fest», sagt er. «Fahr einfach los!»",
          bild: { zeichnungen: [{ z: "velo", x: 122, y: 136, s: 1.1 }], figuren: [{ id: "rabbit", x: 56, s: 1.4 }, { id: "fox", x: 190, winkt: true }] },
        },
        {
          text: "Hoppel tritt in die Pedale. Fino rennt hinterher und hält den Sattel. Es geht schon viel besser!",
          bild: { figuren: [{ id: "fox", x: 56, s: 1.4 }, { id: "rabbit", x: 134, y: 100, s: 1.15 }], zeichnungen: [{ z: "velo", x: 140, y: 136, s: 1.3, vorne: true }], dinge: [{ e: "💨", x: 92, y: 112, s: 16 }] },
        },
        {
          text: "Hoppel fährt und fährt. «Halt mich gut fest, Fino!», ruft er. Aber niemand antwortet.",
          bild: { figuren: [{ id: "rabbit", x: 154, y: 100, s: 1.15, blase: "😃" }], zeichnungen: [{ z: "velo", x: 160, y: 136, s: 1.3, vorne: true }], dinge: [{ e: "💨", x: 106, y: 112, s: 16 }] },
        },
        {
          text: "Hoppel schaut zurück. Fino steht weit hinten und winkt. Hoppel fährt ganz allein!",
          bild: { figuren: [{ id: "fox", x: 36, y: 120, s: 0.8, winkt: true }, { id: "rabbit", x: 166, y: 100, s: 1.15, blase: "😮" }], zeichnungen: [{ z: "velo", x: 172, y: 136, s: 1.3, vorne: true }] },
        },
        {
          text: "Jetzt fahren die beiden jeden Tag zusammen: Hoppel auf seinem roten Velo, Fino auf seinem Trottinett.",
          bild: { figuren: [{ id: "rabbit", x: 68, y: 100, s: 1.15 }, { id: "fox", x: 176, y: 108, s: 1.2, winkt: true }], zeichnungen: [{ z: "velo", x: 74, y: 136, s: 1.3, vorne: true }], dinge: [{ e: "🛴", x: 176, y: 118, s: 46, vorne: true }] },
        },
      ],
      fragen: [
        {
          frage: "Welche Farbe hat Hoppels Velo?",
          antworten: [{ text: "blau" }, { text: "rot" }, { text: "gelb" }],
          richtig: 1,
          seite: 1,
        },
        {
          frage: "Wer hilft Hoppel?",
          antworten: [{ figur: "owl", text: "Ella, die Eule" }, { figur: "fox", text: "Fino, der Fuchs" }, { figur: "frog", text: "Fred, der Frosch" }],
          richtig: 1,
          seite: 4,
        },
        {
          frage: "Warum antwortet Fino nicht?",
          antworten: [{ text: "Er schläft." }, { text: "Er hat den Sattel schon lange losgelassen." }, { text: "Er ist böse auf Hoppel." }],
          richtig: 1,
          seite: 7,
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: "ella-ei",
      titel: "Ella findet ein Ei",
      stufe: "klein",
      figur: "owl",
      landschaft: "wald",
      farbe: "#8e6bbf",
      seiten: [
        {
          text: "Ella, die Eule, findet im Gras ein Ei. Es ist weiss und ganz allein.",
          bild: { figuren: [{ id: "owl", x: 76 }], dinge: [{ e: "🥚", x: 162, y: 126, s: 28 }, { e: "🌿", x: 196, y: 130, s: 18 }] },
        },
        {
          text: "«Wem gehört dieses Ei?», ruft Ella. Aber niemand antwortet.",
          bild: { figuren: [{ id: "owl", x: 86, blase: "❓" }], dinge: [{ e: "🥚", x: 162, y: 126, s: 26 }] },
        },
        {
          text: "Ella nimmt das Ei mit in ihren Baum. Dort hält sie es warm, Tag und Nacht.",
          bild: { landschaft: "nacht", figuren: [{ id: "owl", x: 120, y: 118 }], dinge: [{ e: "🍂", x: 96, y: 128, s: 18, vorne: true }, { e: "🍂", x: 144, y: 128, s: 18, vorne: true }, { e: "🥚", x: 120, y: 126, s: 18, vorne: true }, { e: "🌙", x: 46, y: 32, s: 20 }] },
        },
        {
          text: "Eines Morgens knackt es. Das Ei bekommt einen Riss. Dann schaut ein kleiner Schnabel heraus!",
          bild: { figuren: [{ id: "owl", x: 70, blase: "😮" }], dinge: [{ e: "🐣", x: 160, y: 120, s: 36 }] },
        },
        {
          text: "Es ist ein Entchen. «Mama!», piepst es und kuschelt sich an Ella.",
          bild: { figuren: [{ id: "owl", x: 100 }], dinge: [{ e: "🐥", x: 144, y: 126, s: 24 }, { e: "❤️", x: 122, y: 44, s: 16 }] },
        },
        {
          text: "Ella lacht. «Ich bin doch keine Ente! Komm, wir suchen deine Mama.»",
          bild: { figuren: [{ id: "owl", x: 80, winkt: true }], dinge: [{ e: "🐥", x: 152, y: 126, s: 24 }, { e: "❓", x: 176, y: 96, s: 16 }] },
        },
        {
          text: "Am See schwimmt eine Ente. Sie sucht überall und ruft. Als sie das Entchen sieht, quakt sie vor Freude.",
          bild: { landschaft: "see", figuren: [{ id: "owl", x: 46, s: 1.3 }], dinge: [{ e: "🐥", x: 104, y: 126, s: 22 }, { e: "🦆", x: 170, y: 112, s: 40 }, { e: "❤️", x: 140, y: 70, s: 16 }] },
        },
        {
          text: "Das Entchen schwimmt mit seiner Mama davon. Aber jeden Abend besucht es Ella in ihrem Baum.",
          bild: { landschaft: "see", figuren: [{ id: "owl", x: 56, winkt: true }], dinge: [{ e: "🦆", x: 160, y: 112, s: 36 }, { e: "🐥", x: 200, y: 118, s: 20 }] },
        },
      ],
      fragen: [
        {
          frage: "Was findet Ella im Gras?",
          antworten: [{ text: "eine Nuss", bild: "🌰" }, { text: "ein Ei", bild: "🥚" }, { text: "einen Pilz", bild: "🍄" }],
          richtig: 1,
          seite: 1,
        },
        {
          frage: "Wer schlüpft aus dem Ei?",
          antworten: [{ text: "ein Entchen", bild: "🐥" }, { text: "eine kleine Eule", figur: "owl" }, { text: "ein Frosch", figur: "frog" }],
          richtig: 0,
          seite: 5,
        },
        {
          frage: "Warum sagt das Entchen «Mama» zu Ella?",
          antworten: [{ text: "Ella ist auch eine Ente." }, { text: "Ella ist die Erste, die es sieht." }, { text: "Es kann nicht gut sehen." }],
          richtig: 1,
          seite: 5,
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: "geschenk-oma-rosa",
      titel: "Ein Geschenk für Oma Rosa",
      stufe: "geschichte",
      figur: "mouse",
      landschaft: "wiese",
      farbe: "#e86a92",
      seiten: [
        {
          text: "Morgen hat Oma Rosa Geburtstag. Mia, die Maus, möchte ihr etwas ganz Besonderes schenken. Aber ihr Kässeli ist leer.",
          bild: { figuren: [{ id: "mouse", x: 86, s: 1.5, blase: "🎁" }], dinge: [{ e: "🐷", x: 172, y: 124, s: 28 }] },
        },
        {
          text: "«Dann bastle ich eben etwas», beschliesst Mia. Sie pflückt Blumen auf der Wiese: Margriten, Tulpen und eine grosse Sonnenblume.",
          bild: { figuren: [{ id: "mouse", x: 70, s: 1.4, winkt: true }], dinge: [{ e: "🌼", x: 126, y: 128, s: 18 }, { e: "🌷", x: 158, y: 124, s: 22 }, { e: "🌻", x: 200, y: 106, s: 40 }] },
        },
        {
          text: "Doch auf dem Heimweg kommt ein Windstoss. Die Blumen fliegen davon, eine nach der anderen. Nur die Sonnenblume bleibt übrig, und auch sie lässt den Kopf hängen.",
          bild: { figuren: [{ id: "mouse", x: 66, s: 1.4 }], dinge: [{ e: "💨", x: 118, y: 74, s: 24 }, { e: "🌼", x: 150, y: 46, s: 16, dreh: 30 }, { e: "🌷", x: 178, y: 68, s: 18, dreh: -40 }, { e: "🌻", x: 104, y: 112, s: 24, dreh: 50, vorne: true }] },
        },
        {
          text: "Mia setzt sich traurig auf einen Stein. Da summt eine Biene heran. «Warum bist du so traurig?», fragt sie. Mia erzählt ihr alles.",
          bild: { zeichnungen: [{ z: "stein", x: 84, y: 136 }], figuren: [{ id: "mouse", x: 84, y: 112, s: 1.3, blase: "😢" }], dinge: [{ e: "🐝", x: 168, y: 72, s: 22 }] },
        },
        {
          text: "«Ich weiss etwas», summt die Biene. «Oma Rosa liebt doch Geschichten. Schenk ihr eine!» Mia überlegt kurz. Dann rennt sie nach Hause und holt Papier und Farbstifte.",
          bild: { figuren: [{ id: "mouse", x: 86, s: 1.4, blase: "💡" }], dinge: [{ e: "🐝", x: 172, y: 64, s: 22 }, { e: "✏️", x: 168, y: 124, s: 22 }, { e: "📄", x: 196, y: 124, s: 22 }] },
        },
        {
          text: "Die ganze Nacht malt und schreibt Mia: wie Oma Rosa dem Löwen Leo das Brüllen beibringt und wie die beiden eine Melone essen. Am Morgen ist das Buch fertig.",
          bild: { landschaft: "nacht", zeichnungen: [{ z: "staffelei", x: 162, y: 136 }], figuren: [{ id: "mouse", x: 66, s: 1.4 }], dinge: [{ e: "🦁", x: 150, y: 76, s: 20, vorne: true }, { e: "🍉", x: 176, y: 84, s: 14, vorne: true }, { e: "🕯️", x: 24, y: 120, s: 18 }] },
        },
        {
          text: "Oma Rosa blättert das Buch langsam durch. Bei jeder Seite lacht sie ein bisschen mehr. «Das schönste Geschenk, das ich je bekommen habe!», sagt sie und drückt Mia fest an sich.",
          bild: { figuren: [{ id: "mouse", x: 78, s: 1.7 }, { id: "mouse", x: 154, s: 1.25 }], dinge: [{ e: "📖", x: 116, y: 112, s: 26, vorne: true }, { e: "❤️", x: 116, y: 44, s: 18 }, { e: "🌻", x: 214, y: 108, s: 32 }] },
        },
      ],
      fragen: [
        {
          frage: "Warum kann Mia kein Geschenk kaufen?",
          antworten: [{ text: "Der Laden ist zu." }, { text: "Ihr Kässeli ist leer." }, { text: "Sie hat den Geburtstag vergessen." }],
          richtig: 1,
          seite: 1,
        },
        {
          frage: "Welche Blume bleibt übrig?",
          antworten: [{ text: "die Sonnenblume", bild: "🌻" }, { text: "die Tulpe", bild: "🌷" }, { text: "die Margrite", bild: "🌼" }],
          richtig: 0,
          seite: 3,
        },
        {
          frage: "Warum freut sich Oma Rosa so sehr über das Buch?",
          antworten: [{ text: "Es hat viel Geld gekostet." }, { text: "Mia hat es selbst gemacht – mit Geschichten über Oma." }, { text: "Es ist ein Kochbuch." }],
          richtig: 1,
          seite: 7,
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: "bruno-schnee",
      titel: "Bruno und der erste Schnee",
      stufe: "geschichte",
      figur: "bear",
      landschaft: "wald",
      farbe: "#5c8db8",
      seiten: [
        {
          text: "Es ist Herbst. Die Blätter fallen, und die Tage werden kurz. «Bald ist es Zeit für den Winterschlaf», sagt Mama Bär zu Bruno.",
          bild: { figuren: [{ id: "bear", x: 70, s: 1.8 }, { id: "bear", x: 166, s: 1.25 }], dinge: [{ e: "🍂", x: 40, y: 36, s: 16 }, { e: "🍁", x: 206, y: 56, s: 16 }, { e: "🍂", x: 120, y: 132, s: 14 }] },
        },
        {
          text: "Aber Bruno will nicht schlafen. «Alle reden vom Schnee», brummt er. «Ich will ihn auch einmal sehen. Nur ein einziges Mal!»",
          bild: { figuren: [{ id: "bear", x: 110, blase: "❄️" }], dinge: [{ e: "🍂", x: 186, y: 130, s: 14 }, { e: "🍁", x: 40, y: 128, s: 14 }] },
        },
        {
          text: "Also bleibt Bruno wach. Er spielt mit Flitz, und er zählt Sterne mit Ella. Aber seine Augen werden jeden Tag schwerer.",
          bild: { landschaft: "nacht", figuren: [{ id: "bear", x: 66, s: 1.4 }, { id: "squirrel", x: 136, s: 1.1 }, { id: "owl", x: 198, s: 1.1 }], dinge: [{ e: "⭐", x: 44, y: 28, s: 10 }, { e: "⭐", x: 118, y: 22, s: 8 }, { e: "⭐", x: 170, y: 36, s: 9 }] },
        },
        {
          text: "Eines Abends fällt eine weisse Flocke auf seine Nase. Dann noch eine und noch eine. «Schnee!», ruft Bruno und dreht sich im Kreis.",
          bild: { schnee: true, figuren: [{ id: "bear", x: 120, winkt: true }], dinge: [{ e: "❄️", x: 120, y: 44, s: 14 }] },
        },
        {
          text: "Bruno formt einen kleinen Schneeball. Er schaut zu, wie der Wald ganz weiss wird. Dann gähnt er so laut, dass ein Ast zittert.",
          bild: { schnee: true, figuren: [{ id: "bear", x: 92, blase: "😴" }], dinge: [{ e: "⚪", x: 150, y: 124, s: 20 }] },
        },
        {
          text: "«Jetzt habe ich den Schnee gesehen», murmelt Bruno. Er tappt in seine Höhle, rollt sich zusammen und schläft sofort ein. Er schläft bis zum Frühling.",
          bild: { schnee: true, zeichnungen: [{ z: "hoehle", x: 120, y: 136, s: 0.9 }], figuren: [{ id: "bear", x: 120, s: 1.1 }], dinge: [{ e: "💤", x: 150, y: 70, s: 18 }] },
        },
        {
          text: "Als Bruno im Frühling aufwacht, scheint die Sonne. Flitz wartet schon vor der Höhle. «Endlich bist du wach!», ruft er. «Ich muss dir so viel vom Winter erzählen!»",
          bild: { zeichnungen: [{ z: "hoehle", x: 76, y: 136, s: 0.8 }], figuren: [{ id: "bear", x: 76, s: 1.1 }, { id: "squirrel", x: 180, winkt: true }], dinge: [{ e: "🌷", x: 214, y: 128, s: 16 }, { e: "🌼", x: 140, y: 130, s: 14 }] },
        },
      ],
      fragen: [
        {
          frage: "Warum will Bruno nicht schlafen?",
          antworten: [{ text: "Er hat Hunger." }, { text: "Er will den Schnee sehen." }, { text: "Er hat Angst im Dunkeln." }],
          richtig: 1,
          seite: 2,
        },
        {
          frage: "Was fällt Bruno auf die Nase?",
          antworten: [{ text: "ein Blatt", bild: "🍂" }, { text: "eine Schneeflocke", bild: "❄️" }, { text: "ein Regentropfen", bild: "💧" }],
          richtig: 1,
          seite: 4,
        },
        {
          frage: "Warum schläft Bruno am Ende so schnell ein?",
          antworten: [{ text: "Er hat den Schnee gesehen und ist sehr müde." }, { text: "Mama Bär schimpft mit ihm." }, { text: "In der Höhle ist es zu heiss." }],
          richtig: 0,
          seite: 6,
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: "baumhaus-nacht",
      titel: "Die Nacht im Baumhaus",
      stufe: "kapitel",
      figur: "squirrel",
      landschaft: "wald",
      farbe: "#3d7a4a",
      bilder: "bilder/buecher/baumhaus-nacht",
      seiten: [
        {
          kapitel: "Die Einladung",
          text: "Flitz hat ein Baumhaus. Es sitzt hoch oben in der alten Buche, mit einem roten Dach und einem kleinen Fenster. Eine Leiter führt hinauf. Heute ist ein besonderer Tag: Flitz hat seine Freunde eingeladen. Sie dürfen zum ersten Mal im Baumhaus übernachten.",
          bild: { zeichnungen: [{ z: "wahrzeichen", id: "treehouse", x: 160, y: 136 }], figuren: [{ id: "squirrel", x: 66, winkt: true }] },
        },
        {
          text: "Am Abend kommen die Gäste. Hoppel, der Hase, bringt eine Taschenlampe und einen ganzen Sack Rüebli mit. Mia, die Maus, hat ihren Teddybären unter dem Arm. «Hast du keine Angst, so hoch oben?», fragt sie. «Ich doch nicht!», sagt Hoppel. Aber seine Ohren zittern ein bisschen.",
          bild: { himmel: ["#f6a96b", "#fde1b8"], figuren: [{ id: "rabbit", x: 66 }, { id: "mouse", x: 168, s: 1.25 }], dinge: [{ e: "🔦", x: 100, y: 118, s: 18, vorne: true }, { e: "🥕", x: 30, y: 126, s: 18, vorne: true }, { e: "🧸", x: 196, y: 120, s: 20, vorne: true }] },
        },
        {
          text: "Oben im Baumhaus ist es gemütlich. Flitz zündet eine Laterne an, und alle kuscheln sich in ihre Decken. Mia liest eine Geschichte vor, Hoppel knabbert ein Rüebli nach dem anderen. Draussen wird es dunkel, und die ersten Sterne gehen auf. «Das ist die beste Nacht der Welt», flüstert Flitz.",
          bild: { landschaft: "nacht", zeichnungen: [{ z: "fenster", x: 120, y: 58, s: 0.85, licht: false }], figuren: [{ id: "squirrel", x: 40, s: 1.25 }, { id: "mouse", x: 120, s: 1.1 }, { id: "rabbit", x: 200, s: 1.25 }], dinge: [{ e: "🏮", x: 76, y: 120, s: 18, vorne: true }, { e: "📖", x: 146, y: 118, s: 16, vorne: true }, { e: "⭐", x: 104, y: 44, s: 9 }, { e: "⭐", x: 138, y: 52, s: 7 }] },
        },
        {
          kapitel: "Geräusche in der Nacht",
          text: "Mitten in der Nacht wacht Mia auf. Da war ein Geräusch! Unter dem Baumhaus knackt und raschelt es. Mia stupst Flitz an. «Hörst du das?», flüstert sie. Flitz hält den Atem an. Da ist es wieder: Knack! Raschel! Und dann ein tiefes, unheimliches «Huuu».",
          bild: { landschaft: "nacht", zeichnungen: [{ z: "fenster", x: 120, y: 64, licht: false }], figuren: [{ id: "squirrel", x: 98, y: 102, s: 1.05 }, { id: "mouse", x: 142, y: 102, s: 0.95, blase: "❓" }], dinge: [{ e: "🍂", x: 34, y: 130, s: 16 }, { e: "🍂", x: 206, y: 132, s: 14 }] },
        },
        {
          text: "Hoppel zieht die Decke über die Ohren. «Ein Gespenst!», piepst er. «Gespenster gibt es nicht», sagt Mia. Aber ihre Stimme klingt gar nicht so sicher. Flitz nimmt die Taschenlampe. Er ist der Gastgeber, also muss er mutig sein. Langsam kriecht er zum Fenster.",
          bild: { landschaft: "nacht", figuren: [{ id: "rabbit", x: 66, blase: "👻" }, { id: "squirrel", x: 166 }], dinge: [{ e: "🔦", x: 192, y: 112, s: 20, vorne: true }] },
        },
        {
          text: "Flitz leuchtet in die Dunkelheit hinaus. Zuerst sieht er nur Blätter und Äste. Dann blitzen zwei grosse, gelbe Augen auf. Flitz erschrickt so sehr, dass ihm die Lampe fast aus der Hand fällt. «Wer ist da?», ruft er. Seine Stimme ist ganz dünn.",
          bild: { landschaft: "nacht", figuren: [{ id: "squirrel", x: 58 }], dinge: [{ e: "🔦", x: 88, y: 106, s: 20, vorne: true }, { e: "🍃", x: 158, y: 70, s: 20 }, { e: "🍃", x: 214, y: 62, s: 18 }, { e: "👀", x: 186, y: 54, s: 26 }] },
        },
        {
          kapitel: "Wer ist da?",
          text: "Mit einem leisen Flattern landet jemand auf dem Fensterbrett. Es ist Ella, die Eule! «Entschuldigung», sagt sie. «Ich wollte euch nicht erschrecken. Ich habe nur gesehen, dass hier noch Licht brennt.» Flitz atmet auf. Hoppel schaut unter der Decke hervor, und Mia lacht erleichtert.",
          bild: { landschaft: "nacht", zeichnungen: [{ z: "fenster", x: 120, y: 64, licht: true }], figuren: [{ id: "owl", x: 120, y: 98, s: 1.1, winkt: true }, { id: "squirrel", x: 30, s: 1.2 }, { id: "rabbit", x: 210, s: 1.2 }] },
        },
        {
          text: "«Was macht ihr denn hier oben?», fragt Ella. «Wir übernachten im Baumhaus», erklärt Flitz stolz. «Und was machst du mitten in der Nacht?» Ella blinzelt. «Für mich ist das der Tag! Eulen schlafen, wenn es hell ist. In der Nacht fliege ich herum und schaue, ob im Wald alles in Ordnung ist.»",
          bild: { landschaft: "nacht", figuren: [{ id: "owl", x: 76, blase: "🌙" }, { id: "squirrel", x: 166 }], dinge: [{ e: "⭐", x: 30, y: 30, s: 10 }, { e: "⭐", x: 210, y: 40, s: 8 }] },
        },
        {
          text: "Hoppel kriecht unter der Decke hervor. «Und das Knacken und Rascheln?» Ella zeigt nach unten. Dort tappt ein kleiner Igel durchs Laub und sucht nach Käfern. «Und das Huuu?», fragt Mia. Ella macht ein verlegenes Gesicht. «Das war ich. Ich wollte nur Hallo sagen.»",
          bild: { landschaft: "nacht", figuren: [{ id: "owl", x: 56, s: 1.25 }, { id: "rabbit", x: 196, s: 1.25, blase: "😮" }], dinge: [{ e: "🦔", x: 126, y: 124, s: 30 }, { e: "🍂", x: 156, y: 134, s: 12, vorne: true }, { e: "🐞", x: 100, y: 134, s: 10 }] },
        },
        {
          text: "Ella bleibt noch ein bisschen. Sie erzählt von ihren Flügen über den dunklen Wald, vom Mond und von den Sternen. Bald gähnt Hoppel. Dann gähnt Mia. Auch Flitz fallen langsam die Augen zu. «Jetzt habe ich gar keine Angst mehr», murmelt Hoppel. Und schon schläft er.",
          bild: { landschaft: "nacht", figuren: [{ id: "rabbit", x: 44, s: 1.25, blase: "💤" }, { id: "mouse", x: 104, s: 1.0 }, { id: "squirrel", x: 156, s: 1.2 }, { id: "owl", x: 212, s: 1.1 }], dinge: [{ e: "🌙", x: 120, y: 30, s: 20 }] },
        },
        {
          kapitel: "Der Morgen",
          text: "Am Morgen kitzelt die Sonne Flitz an der Nase. Ella ist weg – sie schläft jetzt in ihrem Baum. Auf dem Fensterbrett liegt ein Zettel. Darauf hat Ella geschrieben: «Danke für den schönen Abend! Bis bald.» Flitz lächelt.",
          bild: { zeichnungen: [{ z: "wahrzeichen", id: "treehouse", x: 160, y: 136 }], figuren: [{ id: "squirrel", x: 62 }], dinge: [{ e: "📝", x: 104, y: 92, s: 22 }] },
        },
        {
          text: "Beim Frühstück sind sich alle einig: Das war die beste Nacht der Welt. «Nächstes Mal laden wir Ella auch ein», sagt Mia. «Und den Igel!», ruft Hoppel. Flitz lacht. «Dann brauchen wir aber ein grösseres Baumhaus.»",
          bild: { figuren: [{ id: "rabbit", x: 46, s: 1.3 }, { id: "mouse", x: 120, s: 1.1, winkt: true }, { id: "squirrel", x: 194, s: 1.3 }], dinge: [{ e: "🥐", x: 84, y: 130, s: 16, vorne: true }, { e: "🍓", x: 152, y: 132, s: 14, vorne: true }, { e: "🥕", x: 20, y: 130, s: 14, vorne: true }] },
        },
      ],
      fragen: [
        {
          frage: "Wo übernachten Flitz und seine Freunde?",
          antworten: [{ text: "im Baumhaus" }, { text: "in einer Höhle" }, { text: "in einem Zelt am See" }],
          richtig: 0,
          seite: 1,
        },
        {
          frage: "Was bringt Hoppel mit?",
          antworten: [{ text: "einen Teddybären" }, { text: "eine Taschenlampe und Rüebli" }, { text: "ein dickes Buch" }],
          richtig: 1,
          seite: 2,
        },
        {
          frage: "Wer hat in der Nacht «Huuu» gemacht?",
          antworten: [{ figur: "owl", text: "Ella, die Eule" }, { bild: "🦔", text: "der Igel" }, { bild: "👻", text: "ein Gespenst" }],
          richtig: 0,
          seite: 9,
        },
        {
          frage: "Warum ist Ella mitten in der Nacht wach?",
          antworten: [{ text: "Sie hat Bauchweh." }, { text: "Eulen schlafen am Tag und sind in der Nacht wach." }, { text: "Sie sucht ihren Zettel." }],
          richtig: 1,
          seite: 8,
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: "leuchtturm-licht",
      titel: "Das Licht im Leuchtturm",
      stufe: "kapitel",
      figur: "penguin",
      landschaft: "see",
      farbe: "#c9483a",
      bilder: "bilder/buecher/leuchtturm-licht",
      seiten: [
        {
          kapitel: "Ferien am See",
          text: "Pino verbringt die Ferien bei seinem Opa Paul. Opa Paul ist Leuchtturmwärter. Sein Leuchtturm steht auf einem Felsen am See, rot und weiss gestreift. Ganz oben brennt jede Nacht ein helles Licht. «Wozu ist das Licht da?», fragt Pino.",
          bild: { zeichnungen: [{ z: "wahrzeichen", id: "lighthouse", x: 168, y: 136, s: 0.95 }], figuren: [{ id: "penguin", x: 64, winkt: true }] },
        },
        {
          text: "«Das Licht zeigt den Booten den Weg», erklärt Opa Paul. «Wenn es dunkel ist oder stürmt, sehen die Fischer das Ufer nicht. Ohne Licht würden sie an die Felsen fahren.» Pino staunt. Jeden Abend steigt Opa die neunundneunzig Stufen hinauf und schaut, ob die Lampe brennt.",
          bild: { himmel: ["#f6a96b", "#fde1b8"], zeichnungen: [{ z: "wahrzeichen", id: "lighthouse", x: 190, y: 136, s: 0.95, licht: true }], figuren: [{ id: "penguin", x: 44, s: 1.25 }, { id: "penguin", x: 106, s: 1.7, blase: "⛵" }] },
        },
        {
          text: "Am nächsten Morgen fährt Fred, der Frosch, mit seinem Fischerboot hinaus. Er winkt Pino zu. «Heute fange ich den grössten Fisch des Sommers!», ruft er. Opa Paul schaut zum Himmel. Dort ziehen dunkle Wolken auf. «Hoffentlich kommt Fred rechtzeitig zurück», brummt er.",
          bild: { figuren: [{ id: "penguin", x: 46, s: 1.3, winkt: true }, { id: "frog", x: 166, y: 104, s: 1.0, winkt: true }], dinge: [{ e: "🛶", x: 166, y: 110, s: 52, vorne: true }, { e: "☁️", x: 196, y: 30, s: 28 }, { e: "☁️", x: 150, y: 24, s: 20 }] },
        },
        {
          kapitel: "Der Sturm",
          text: "Am Abend heult der Wind um den Leuchtturm. Regen peitscht gegen die Fenster, und die Wellen schlagen an die Felsen. Opa Paul will gerade die Treppe hinaufsteigen, da rutscht er auf einer nassen Stufe aus. «Aua, mein Fuss!» Er kann nicht mehr auftreten.",
          bild: { himmel: ["#3a4a66", "#6b7a95"], zeichnungen: [{ z: "wahrzeichen", id: "lighthouse", x: 180, y: 136, s: 0.95, licht: true }], figuren: [{ id: "penguin", x: 72, s: 1.6, dreh: -16 }], dinge: [{ e: "🌧️", x: 40, y: 34, s: 26 }, { e: "💫", x: 104, y: 52, s: 16 }] },
        },
        {
          text: "Und dann passiert es: Ein Blitz zuckt, es kracht – und oben im Turm geht das Licht aus. Alles ist dunkel. «Die Lampe!», ruft Opa Paul erschrocken. «Und Fred ist noch draussen auf dem See!» Pino schaut aus dem Fenster. Irgendwo da draussen schaukelt ein kleines Boot in der Dunkelheit.",
          bild: { himmel: ["#1d2840", "#3a4a66"], zeichnungen: [{ z: "wahrzeichen", id: "lighthouse", x: 150, y: 136, s: 0.95, aus: true }], dinge: [{ e: "⚡", x: 92, y: 40, s: 28 }, { e: "⛈️", x: 206, y: 30, s: 30 }, { e: "🛶", x: 40, y: 104, s: 26 }, { e: "🌊", x: 214, y: 126, s: 22, vorne: true }] },
        },
        {
          text: "«In der Kiste ist eine alte Laterne», sagt Opa Paul. «Aber ich komme die Treppe nicht hinauf.» Pino schluckt. Neunundneunzig Stufen, ganz allein, im Dunkeln! Dann nimmt er die Laterne. «Ich mache das», sagt er. «Fred braucht das Licht.»",
          bild: { landschaft: "nacht", figuren: [{ id: "penguin", x: 66, s: 1.6 }, { id: "penguin", x: 158, s: 1.25, blase: "😟" }], dinge: [{ e: "📦", x: 112, y: 124, s: 26 }, { e: "🏮", x: 196, y: 116, s: 24, vorne: true }] },
        },
        {
          kapitel: "Neunundneunzig Stufen",
          text: "Pino steigt die Wendeltreppe hinauf. Draussen tobt der Sturm, und der ganze Turm brummt und pfeift. Bei Stufe dreissig zittern seine Beine. Bei Stufe sechzig möchte er am liebsten umkehren. Aber er denkt an Fred da draussen. Also zählt er weiter: einundsechzig, zweiundsechzig …",
          bild: { himmel: ["#1d2840", "#3a4a66"], zeichnungen: [{ z: "wahrzeichen", id: "lighthouse", x: 160, y: 136, s: 0.95, aus: true }], figuren: [{ id: "penguin", x: 70, s: 1.4 }], dinge: [{ e: "🏮", x: 98, y: 98, s: 20, vorne: true }, { e: "💨", x: 214, y: 70, s: 20 }, { e: "🌧️", x: 40, y: 30, s: 22 }] },
        },
        {
          text: "Endlich ist Pino oben. Durch die grossen Fenster sieht er nur Regen und schwarze Wellen. Mit klammen Flügeln zündet er die Laterne an. Ein kleines Flämmchen flackert auf. Pino stellt die Laterne vor den grossen Spiegel der Lampe. Und plötzlich strahlt das Licht weit hinaus über den See!",
          bild: { himmel: ["#1d2840", "#3a4a66"], zeichnungen: [{ z: "wahrzeichen", id: "lighthouse", x: 100, y: 136, licht: true }], dinge: [{ e: "✨", x: 184, y: 26, s: 16 }, { e: "🌊", x: 200, y: 128, s: 22, vorne: true }] },
        },
        {
          text: "Pino drückt den Schnabel an die Scheibe und wartet. Hat Fred das Licht gesehen? Lange passiert nichts. Doch dann taucht weit draussen ein kleines Licht auf. Es schaukelt auf und ab und kommt immer näher. Das ist Freds Boot! Es fährt sicher an den Felsen vorbei in den Hafen.",
          bild: { himmel: ["#1d2840", "#3a4a66"], zeichnungen: [{ z: "wahrzeichen", id: "lighthouse", x: 62, y: 136, s: 0.95, licht: true }], figuren: [{ id: "frog", x: 182, y: 104, s: 1.0, winkt: true }], dinge: [{ e: "🛶", x: 182, y: 110, s: 52, vorne: true }, { e: "🌊", x: 136, y: 128, s: 18, vorne: true }] },
        },
        {
          kapitel: "Ein neuer Leuchtturmwärter",
          text: "Am nächsten Morgen ist der Sturm vorbei. Der See glitzert, als wäre nichts gewesen. Fred kommt mit einem grossen Korb zum Leuchtturm. «Pino, du hast mich gerettet!», ruft er. «Ohne dein Licht hätte ich den Weg nie gefunden.» Im Korb liegt der grösste Fisch des Sommers – ein Geschenk für Pino.",
          bild: { figuren: [{ id: "frog", x: 62, s: 1.4, winkt: true }, { id: "penguin", x: 176, s: 1.35 }], dinge: [{ e: "🧺", x: 118, y: 126, s: 30, vorne: true }, { e: "🐟", x: 118, y: 108, s: 24 }] },
        },
        {
          text: "Opa Paul sitzt mit dem verbundenen Fuss im Lehnstuhl und strahlt. «Ich bin so stolz auf dich», sagt er. «Ab heute bist du auch ein Leuchtturmwärter.» Er schenkt Pino eine Mütze mit einem kleinen Leuchtturm darauf. Pino setzt sie auf und strahlt fast so hell wie die Lampe.",
          bild: { figuren: [{ id: "penguin", x: 70, s: 1.7 }, { id: "penguin", x: 166, s: 1.3 }], dinge: [{ e: "🧢", x: 166, y: 74, s: 22, vorne: true }, { e: "✨", x: 198, y: 50, s: 14 }] },
        },
      ],
      fragen: [
        {
          frage: "Was ist Opa Paul von Beruf?",
          antworten: [{ text: "Fischer" }, { text: "Leuchtturmwärter" }, { text: "Bäcker" }],
          richtig: 1,
          seite: 1,
        },
        {
          frage: "Wie viele Stufen führen im Leuchtturm hinauf?",
          antworten: [{ text: "dreissig" }, { text: "sechzig" }, { text: "neunundneunzig" }],
          richtig: 2,
          seite: 2,
        },
        {
          frage: "Warum geht das Licht im Turm aus?",
          antworten: [{ text: "Ein Blitz schlägt ein." }, { text: "Opa Paul schaltet es aus." }, { text: "Pino bläst es aus." }],
          richtig: 0,
          seite: 5,
        },
        {
          frage: "Warum steigt Pino die Treppe hinauf, obwohl er Angst hat?",
          antworten: [{ text: "Er will den Sturm von oben sehen." }, { text: "Fred braucht das Licht, um heimzufinden." }, { text: "Opa Paul hat es ihm befohlen." }],
          richtig: 1,
          seite: 6,
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: "bergrennen",
      titel: "Das grosse Bergrennen",
      stufe: "kapitel",
      figur: "ibex",
      landschaft: "berge",
      farbe: "#8a6d3b",
      bilder: "bilder/buecher/bergrennen",
      seiten: [
        {
          kapitel: "Das Plakat",
          text: "An der Tür der Berghütte hängt ein grosses Plakat: «Das grosse Bergrennen! Am Samstag, vom Tal bis zur Hütte. Der Sieger bekommt einen goldenen Pokal.» Sepp, der Steinbock, liest es dreimal. Sein Herz klopft vor Freude. Klettern kann er wie kein anderer!",
          bild: { zeichnungen: [{ z: "wahrzeichen", id: "hut", x: 164, y: 136 }], figuren: [{ id: "ibex", x: 64, blase: "🏆" }], dinge: [{ e: "📜", x: 140, y: 112, s: 18, vorne: true }] },
        },
        {
          text: "Jeden Tag übt Sepp. Er springt über Felsen und klettert steile Wände hinauf, bis ihm die Beine wehtun. Am Abend kommt Fino, der Fuchs, vorbei. «Gib dir keine Mühe», sagt er. «Diesmal gewinne ich. Ich kenne eine Abkürzung.» Sepp schnaubt. «Das werden wir ja sehen.»",
          bild: { figuren: [{ id: "ibex", x: 84, y: 112, s: 1.35, dreh: -12 }, { id: "fox", x: 188, s: 1.35 }], dinge: [{ e: "💨", x: 40, y: 112, s: 18 }, { e: "💦", x: 110, y: 54, s: 14 }] },
        },
        {
          kapitel: "Das Rennen beginnt",
          text: "Am Samstag stehen alle am Start: Sepp, Fino, Hoppel, der Hase, und ganz am Rand Mia, die kleine Maus. «Du willst mitlaufen?», fragt Fino spöttisch. «Mit so kurzen Beinen?» Mia hebt das Kinn. «Ich will es wenigstens versuchen.» Dann pfeift Bruno, der Bär: Los!",
          bild: { figuren: [{ id: "ibex", x: 30, s: 1.2 }, { id: "fox", x: 82, s: 1.2 }, { id: "rabbit", x: 132, s: 1.2 }, { id: "mouse", x: 174, s: 0.9 }], dinge: [{ e: "🏁", x: 216, y: 100, s: 32 }] },
        },
        {
          text: "Sepp springt sofort los, Felsen hinauf, Felsen hinunter. Bald liegt das Tal tief unter ihm. Fino ist verschwunden – wohl auf seiner Abkürzung. Hoppel keucht weit hinten. Sepp lacht im Wind. Der goldene Pokal ist schon fast in seinen Hufen.",
          bild: { figuren: [{ id: "rabbit", x: 40, y: 132, s: 0.8 }, { id: "ibex", x: 150, y: 96, s: 1.3, dreh: -12 }], dinge: [{ e: "💨", x: 106, y: 100, s: 20 }] },
        },
        {
          text: "Da hört Sepp hinter sich ein leises Piepsen. Er bleibt stehen und schaut zurück. Weit unten, zwischen zwei Felsen, steckt Mia fest! Sie ist in eine Spalte gerutscht und kommt allein nicht mehr heraus. «Hilfe!», ruft sie. «Bitte, hilf mir!» Sepp schaut hinauf zur Hütte. Dann schaut er hinunter zu Mia.",
          bild: { zeichnungen: [{ z: "hoehle", x: 168, y: 136, s: 0.55 }], figuren: [{ id: "ibex", x: 58, y: 110, s: 1.3, blase: "❗" }, { id: "mouse", x: 168, y: 136, s: 0.75 }], dinge: [{ e: "💬", x: 196, y: 78, s: 18 }] },
        },
        {
          kapitel: "Die Entscheidung",
          text: "Sepp denkt an den goldenen Pokal. Wenn er jetzt umkehrt, ist das Rennen verloren. Aber Mia weint, und niemand sonst ist in der Nähe. «Ich komme!», ruft Sepp. Mit grossen Sprüngen eilt er den Berg hinunter, den ganzen Weg zurück.",
          bild: { figuren: [{ id: "ibex", x: 116, y: 108, s: 1.35, dreh: 14, blase: "🐭" }], dinge: [{ e: "💨", x: 64, y: 84, s: 20 }] },
        },
        {
          text: "Vorsichtig hält Sepp ein Horn in die Spalte. «Halt dich gut fest!» Mia klammert sich daran, und Sepp zieht sie langsam heraus. Ihr Bein tut weh, laufen kann sie nicht. «Dann steig auf», sagt Sepp. Mia klettert auf seinen Rücken, und zusammen machen sie sich auf den Weg nach oben.",
          bild: { zeichnungen: [{ z: "hoehle", x: 172, y: 136, s: 0.55 }], figuren: [{ id: "ibex", x: 92, s: 1.45 }, { id: "mouse", x: 150, y: 128, s: 0.8 }] },
        },
        {
          text: "Mit Mia auf dem Rücken klettert Sepp viel langsamer. Hoppel überholt die beiden und winkt. Weit oben sehen sie Fino, der gerade bei der Hütte ankommt. «Tut mir leid», flüstert Mia. «Wegen mir verlierst du.» Sepp schüttelt den Kopf. «Freunde lässt man nicht im Stich.»",
          bild: { zeichnungen: [{ z: "wahrzeichen", id: "hut", x: 206, y: 66, s: 0.4 }], figuren: [{ id: "ibex", x: 86, s: 1.5 }, { id: "mouse", x: 90, y: 76, s: 0.75 }, { id: "rabbit", x: 168, y: 100, s: 0.8, winkt: true }] },
        },
        {
          kapitel: "Ein ganz besonderer Preis",
          text: "Als Sepp und Mia endlich bei der Hütte ankommen, warten alle schon. Fino hält den goldenen Pokal in den Pfoten. Sepp ist als Letzter angekommen. Doch dann geschieht etwas Seltsames: Alle klatschen – und zwar für Sepp! Bruno hat nämlich alles durch sein Fernrohr gesehen.",
          bild: { zeichnungen: [{ z: "wahrzeichen", id: "hut", x: 196, y: 136, s: 0.85 }], figuren: [{ id: "fox", x: 34, s: 1.2 }, { id: "ibex", x: 104, s: 1.3 }, { id: "mouse", x: 106, y: 70, s: 0.65 }], dinge: [{ e: "🏆", x: 58, y: 100, s: 22, vorne: true }, { e: "👏", x: 150, y: 48, s: 18 }, { e: "🔭", x: 150, y: 124, s: 22 }] },
        },
        {
          text: "Bruno tritt vor und hängt Sepp eine Medaille um den Hals. Darauf steht: Für den besten Freund am Berg. «Ein Pokal ist schön», sagt Bruno. «Aber ein Freund, der hilft, ist mehr wert.» Fino schaut verlegen auf seine Pfoten. «Du hast recht», murmelt er.",
          bild: { figuren: [{ id: "bear", x: 60, s: 1.5 }, { id: "ibex", x: 140, s: 1.35 }, { id: "fox", x: 212, s: 1.1 }], dinge: [{ e: "🏅", x: 140, y: 104, s: 22, vorne: true }] },
        },
        {
          text: "Am Abend sitzen alle in der warmen Hütte und essen Kuchen. Mias Bein ist verbunden, und sie lacht schon wieder. «Nächstes Jahr», sagt sie zu Sepp, «trainiere ich mit dir. Dann laufen wir zusammen ins Ziel.» Sepp grinst. Das ist der schönste Preis von allen.",
          bild: { landschaft: "nacht", zeichnungen: [{ z: "fenster", x: 120, y: 60, s: 0.9, licht: true }], figuren: [{ id: "mouse", x: 56, s: 1.1 }, { id: "ibex", x: 178, s: 1.35 }], dinge: [{ e: "🎂", x: 116, y: 122, s: 28, vorne: true }, { e: "🏅", x: 178, y: 108, s: 16, vorne: true }] },
        },
      ],
      fragen: [
        {
          frage: "Was bekommt der Sieger des Bergrennens?",
          antworten: [{ text: "eine Medaille" }, { text: "einen goldenen Pokal" }, { text: "einen Kuchen" }],
          richtig: 1,
          seite: 1,
        },
        {
          frage: "Warum kehrt Sepp mitten im Rennen um?",
          antworten: [{ text: "Er ist zu müde." }, { text: "Mia steckt in einer Felsspalte fest." }, { text: "Er hat den Weg vergessen." }],
          richtig: 1,
          seite: 5,
        },
        {
          frage: "Wer kommt als Erster bei der Hütte an?",
          antworten: [{ figur: "fox", text: "Fino" }, { figur: "ibex", text: "Sepp" }, { figur: "rabbit", text: "Hoppel" }],
          richtig: 0,
          seite: 8,
        },
        {
          frage: "Was meint Bruno mit «Ein Freund, der hilft, ist mehr wert»?",
          antworten: [{ text: "Pokale sind hässlich." }, { text: "Helfen ist wichtiger als gewinnen." }, { text: "Sepp soll schneller laufen." }],
          richtig: 1,
          seite: 10,
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: "pippa-bambus",
      titel: "Wer klaut Pippas Bambus?",
      stufe: "kapitel",
      figur: "panda",
      landschaft: "dschungel",
      farbe: "#2f8f5b",
      bilder: "bilder/buecher/pippa-bambus",
      seiten: [
        {
          kapitel: "Der Bambus ist weg",
          text: "Pippa, der kleine Panda, liebt Bambus über alles. Hinter ihrem Haus beim alten Tempel hat sie einen Vorrat aufgestapelt: hundert frische Stangen, grün und knackig. Jeden Abend zählt sie nach. Heute sind es genau hundert. Zufrieden legt sie sich schlafen.",
          bild: { zeichnungen: [{ z: "wahrzeichen", id: "temple", x: 178, y: 136, s: 0.9 }, { z: "bambus", x: 110, y: 136, s: 0.62 }], figuren: [{ id: "panda", x: 44 }] },
        },
        {
          text: "Am Morgen traut Pippa ihren Augen nicht. Der Stapel ist kleiner geworden! Sie zählt einmal, sie zählt zweimal: nur noch neunzig Stangen. «Zehn Stangen sind weg!», ruft sie. «Jemand hat meinen Bambus geklaut!» Komisch ist nur: Zum Frühstück hat Pippa heute gar keinen Hunger.",
          bild: { zeichnungen: [{ z: "bambus", stangen: 5, x: 166, y: 136, s: 0.62 }], figuren: [{ id: "panda", x: 72, blase: "😮" }], dinge: [{ e: "❓", x: 204, y: 70, s: 22 }] },
        },
        {
          text: "Pippa beschliesst, eine Detektivin zu werden. Sie holt ihre Lupe und untersucht den Boden. Da! Im weichen Sand sind Spuren: grosse, runde Tatzen mit fünf Zehen. «Ein grosses Tier war das», murmelt Pippa. Sie zeichnet die Spur in ihr Notizbuch.",
          bild: { figuren: [{ id: "panda", x: 66 }], dinge: [{ e: "🔍", x: 108, y: 110, s: 24, vorne: true }, { e: "🐾", x: 166, y: 130, s: 18 }, { e: "🐾", x: 204, y: 124, s: 16 }, { e: "📓", x: 24, y: 120, s: 16, vorne: true }] },
        },
        {
          kapitel: "Die Verdächtigen",
          text: "Zuerst geht Pippa zu Leo, dem Löwen. Leo hat grosse Tatzen! «Hast du meinen Bambus genommen?», fragt sie streng. Leo rümpft die Nase. «Bambus? Igitt! Ich mag doch keine Pflanzen.» Pippa schaut Leos Spuren genau an. Sie haben nur vier Zehen. Leo war es also nicht.",
          bild: { figuren: [{ id: "panda", x: 62, s: 1.4 }, { id: "lion", x: 170, s: 1.5, blase: "🤢" }], dinge: [{ e: "🐾", x: 118, y: 132, s: 14 }] },
        },
        {
          text: "Dann fragt Pippa die Affen in den Bäumen. «Wir waren es nicht!», kreischen sie. «Wir essen Bananen, keinen Bambus.» Ihre Spuren sehen auch ganz anders aus, wie kleine Hände. Und Mia, die Maus? Ihre Pfötchen sind winzig, und zehn Bambusstangen könnte sie niemals tragen.",
          bild: { figuren: [{ id: "panda", x: 56, s: 1.4 }, { id: "mouse", x: 200, s: 1.0 }], dinge: [{ e: "🐒", x: 130, y: 48, s: 26 }, { e: "🐒", x: 172, y: 36, s: 22 }, { e: "🍌", x: 150, y: 74, s: 16 }] },
        },
        {
          text: "In der zweiten Nacht verschwinden wieder zehn Stangen. In der dritten Nacht auch. Pippa ist ratlos. Da kommt Ella, die Eule, zu Besuch. «Ich bin die ganze Nacht wach», sagt Ella. «Heute halte ich Wache und finde heraus, wer deinen Bambus nimmt.» Pippa umarmt sie dankbar.",
          bild: { zeichnungen: [{ z: "bambus", stangen: 3, x: 30, y: 136, s: 0.45 }], figuren: [{ id: "panda", x: 82, s: 1.4 }, { id: "owl", x: 172, s: 1.3, winkt: true }], dinge: [{ e: "❤️", x: 126, y: 50, s: 16 }] },
        },
        {
          kapitel: "Wache in der Nacht",
          text: "Ella setzt sich auf das Dach des Tempels und wartet. Der Mond geht auf, und die Grillen zirpen. Lange passiert gar nichts. Doch kurz nach Mitternacht öffnet sich leise die Tür von Pippas Haus. Eine grosse, runde Gestalt tappt heraus, mitten auf den Bambusstapel zu.",
          bild: { landschaft: "nacht", zeichnungen: [{ z: "wahrzeichen", id: "temple", x: 130, y: 136, s: 0.95, licht: true }], figuren: [{ id: "owl", x: 130, y: 44, s: 0.75 }], dinge: [{ e: "🌙", x: 36, y: 30, s: 22 }, { e: "🦗", x: 210, y: 130, s: 12 }] },
        },
        {
          text: "Ella reisst die Augen auf. Die Gestalt hat ein schwarz-weisses Fell und runde Ohren. Sie setzt sich hin, nimmt eine Bambusstange und knabbert genüsslich daran. Ihre Augen sind dabei fest geschlossen. Ella muss sich den Flügel vor den Schnabel halten, um nicht laut zu lachen.",
          bild: { landschaft: "nacht", zeichnungen: [{ z: "bambus", stangen: 4, x: 46, y: 136, s: 0.55 }, { z: "bambus", stangen: 1, x: 150, y: 112, s: 0.55, dreh: -60, vorne: true }], figuren: [{ id: "panda", x: 116, blase: "💤" }, { id: "owl", x: 210, y: 96, s: 0.9 }] },
        },
        {
          text: "Nach zehn Stangen steht die Gestalt wieder auf, tappt zurück ins Haus und legt sich ins Bett. Ella fliegt zum Fenster und schaut hinein. Da liegt Pippa und schnarcht, mit einem Bambusblatt im Mundwinkel. Jetzt weiss Ella, wer der Dieb ist.",
          bild: { landschaft: "nacht", zeichnungen: [{ z: "fenster", x: 112, y: 66, licht: true }], figuren: [{ id: "panda", x: 140, y: 90, s: 0.95, dreh: -90 }, { id: "owl", x: 206, s: 1.1 }], dinge: [{ e: "💤", x: 72, y: 46, s: 16 }] },
        },
        {
          kapitel: "Die Lösung",
          text: "Am Morgen wartet Ella schon vor der Tür. «Ich weiss, wer deinen Bambus isst», sagt sie. «Wer denn?», ruft Pippa. Ella zeigt mit dem Flügel auf sie. «Du selbst! Du schlafwandelst. Jede Nacht gehst du im Schlaf hinaus und isst zehn Stangen.» Pippa macht grosse Augen.",
          bild: { figuren: [{ id: "panda", x: 68, s: 1.4, blase: "😮" }, { id: "owl", x: 164, s: 1.3, winkt: true }] },
        },
        {
          text: "Dann muss Pippa lachen, bis ihr der Bauch wehtut. Darum hatte sie also nie Hunger zum Frühstück! Und darum waren die Spuren genau so gross wie ihre eigenen Tatzen. «Ich bin eine schlechte Detektivin», kichert sie. «Nein», sagt Ella, «nur eine sehr hungrige Schlafwandlerin.»",
          bild: { zeichnungen: [{ z: "bambus", stangen: 4, x: 212, y: 136, s: 0.45 }], figuren: [{ id: "panda", x: 76, s: 1.5, blase: "😂" }, { id: "owl", x: 156, s: 1.3 }] },
        },
      ],
      fragen: [
        {
          frage: "Wie viele Bambusstangen fehlen am ersten Morgen?",
          antworten: [{ text: "zehn" }, { text: "hundert" }, { text: "neunzig" }],
          richtig: 0,
          seite: 2,
        },
        {
          frage: "Woran sieht Pippa, dass Leo es nicht war?",
          antworten: [{ text: "Leo war verreist." }, { text: "Leos Spuren haben nur vier Zehen." }, { text: "Leo hat keine Tatzen." }],
          richtig: 1,
          seite: 4,
        },
        {
          frage: "Wer isst in der Nacht den Bambus?",
          antworten: [{ bild: "🐒", text: "die Affen" }, { figur: "lion", text: "Leo" }, { figur: "panda", text: "Pippa selbst, im Schlaf" }],
          richtig: 2,
          seite: 10,
        },
        {
          frage: "Welcher Hinweis hätte Pippa schon am ersten Morgen helfen können?",
          antworten: [{ text: "Sie hatte keinen Hunger zum Frühstück." }, { text: "Die Affen haben gekreischt." }, { text: "Der Mond schien hell." }],
          richtig: 0,
          seite: 2,
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
