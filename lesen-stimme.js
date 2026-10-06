/*
 * lesen-stimme.js – Feste Texte als Aufnahme mit Alains Stimme.
 *
 * Die App liest sonst mit der Sprachausgabe des Geräts vor, die Laute aber
 * kommen von Alain (lesen-laute.js). Damit beides gleich klingt, gibt es feste
 * Texte – die Sätze eines Buches, die Hilfe eines Spiels – als Aufnahme: aus
 * dem geschriebenen Text erzeugt mit Alains Stimmprofil auf Higgsfield
 * (text2speech_v2, elevenlabs), als MP3 in stimme/alain/ (mono, 32 kbit/s).
 * Eine Datei heisst nach dem Anfang des SHA-256 ihres Textes.
 *
 * Gespielt wird in kids.js (aufnahmeStuecke, aufnahmeFolge): Gibt es zu einem
 * Text eine Aufnahme, spielt sie, sonst spricht die Gerätestimme wie bisher.
 * Welche Texte dazugehören, steht in scripts/stimme-texte.mjs, und
 * scripts/validate-lesen.mjs prüft, dass jede Datei da ist und zu ihrem Text
 * passt.
 *
 * Nicht von Hand ändern: scripts/stimme-vertonen.mjs schreibt diese Datei.
 */
window.LernappStimmeDateien = {
  "Wo ist das Rüebli?": "stimme/alain/42eb6601b78d.mp3",
  "Das ist Hoppel.": "stimme/alain/f9d79e5a84c4.mp3",
  "Hoppel ist ein kleiner Hase, und er hat grossen Hunger.": "stimme/alain/d427da7fe504.mp3",
  "Hoppel hat Lust auf ein Rüebli.": "stimme/alain/596bedf039cb.mp3",
  "Ein knackiges, oranges Rüebli!": "stimme/alain/0bdba71addb5.mp3",
  "Aber wo ist eins?": "stimme/alain/4d6b54f3f154.mp3",
  "Ist es unter der grossen Blume?": "stimme/alain/76085bebd0e6.mp3",
  "Hoppel schaut nach.": "stimme/alain/ec76a25fde24.mp3",
  "Nein, da sitzt nur ein Marienkäfer.": "stimme/alain/08b54bd553ea.mp3",
  "Ist es hinter dem Busch?": "stimme/alain/1ff9fcbf6da2.mp3",
  "Nein, da kriecht nur eine Schnecke – ganz, ganz langsam.": "stimme/alain/e8e1e8d13dcb.mp3",
  "Da ruft jemand: «Hoppel, komm schnell!»": "stimme/alain/98504ecd8bc9.mp3",
  "Es ist die Maus Mia.": "stimme/alain/054a517803f5.mp3",
  "Sie hat etwas gefunden: ein riesiges Rüebli!": "stimme/alain/470f58fe423d.mp3",
  "Das Rüebli ist viel zu gross für eine kleine Maus.": "stimme/alain/5804d22cc19b.mp3",
  "«Wollen wir teilen?», fragt Mia.": "stimme/alain/4f522d3ada7f.mp3",
  "Und Hoppel nickt.": "stimme/alain/1d9d018bca31.mp3",
  "Knack, knack, knack!": "stimme/alain/3e4f05d90d4a.mp3",
  "Zusammen schmeckt es am allerbesten.": "stimme/alain/538f6f7b5fb5.mp3",
  "Was sucht Hoppel?": "stimme/alain/8b727874d20e.mp3",
  "ein Rüebli": "stimme/alain/8d3335f57e8c.mp3",
  "Wer kriecht hinter dem Busch?": "stimme/alain/57eeff9c061d.mp3",
  "eine Schnecke": "stimme/alain/841ee9d3389a.mp3",
  "Wer hat das Rüebli gefunden?": "stimme/alain/12953de188e5.mp3",
  "die Maus": "stimme/alain/08628824ece3.mp3",
  "Nicht ganz. Schau doch im Buch nach!": "stimme/alain/1dd63ac763fe.mp3",
  "Der Lesewagen. Auf dem Sofa zeigt dir der Lesewurm, was als Nächstes dran ist: Tippe auf ihn oder auf den grünen Knopf. Für jede Runde bekommt er einen Buchstaben, für seine Runde zwei, und ist seine Leiste voll, gibt es eine Überraschung. Die Trommel ist zum Hören, das Buchstabenhaus für Buchstaben, die Kiste für Wörter, der kleine Zug für Sätze und das Regal für Bücher. An der Pinnwand warten Rätsel für Lesedetektive. Auf dem Schild steht der Name deines Lesewurms.": "stimme/alain/3c324faa2721.mp3",
  "Silbenzug. Hör dir das Wort an und schlage für jede Silbe einmal auf die Trommel. Für jeden Schlag kommt ein Wagen. Dann tippe auf das grüne Signal, und der Zug fährt los. Ein Tipp auf das Bild sagt das Wort noch einmal, ein Tipp auf einen Wagen nimmt ihn wieder weg.": "stimme/alain/f057c9a2b0e3.mp3",
  "Das Buchstabenhaus. Hinter jedem Fenster wohnt ein Laut. Tippe ein Fenster an, und du hörst, wer dort wohnt. Mit der Lupe beginnt das Suchspiel.": "stimme/alain/4bf13c92b90f.mp3",
  "Das Suchspiel. Hör genau hin: Wo wohnt dieser Laut? Tippe auf sein Fenster. Ein Tipp auf den Lautsprecher in der Blase sagt es noch einmal.": "stimme/alain/41f8f7657d3c.mp3",
};
