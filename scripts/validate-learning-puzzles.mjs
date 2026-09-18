import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const source = fs.readFileSync(path.join(root, "app.js"), "utf8");
const spatialSource = fs.readFileSync(path.join(root, "spatial-puzzles.js"), "utf8");
const storage = new Map();

const documentStub = {
  body: {
    dataset: {},
    classList: { add() {}, remove() {}, contains() { return false; } },
  },
  querySelector() { return null; },
  addEventListener() {},
};

const context = {
  console,
  document: documentStub,
  localStorage: {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, value); },
    removeItem(key) { storage.delete(key); },
  },
  structuredClone: globalThis.structuredClone,
  window: {},
};
context.globalThis = context;

vm.createContext(context);
vm.runInContext(spatialSource, context, { filename: "spatial-puzzles.js" });
vm.runInContext(source, context, { filename: "app.js" });

const api = context.window.LernappPuzzleGenerators;
const catalog = context.window.LernappLevelCatalog;
const difficulties = ["easy", "medium", "hard", "extreme"];

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function optionIsUnique(task) {
  return new Set(task.options).size === task.options.length;
}

function validateReadingTask(task, label) {
  assert(api.validateReadingTask(task), `${label} failed validator`);
  assert(task.imageKey, `${label} has no imageKey`);
  assert(optionIsUnique(task), `${label} options are duplicated`);
  assert(task.options.filter((option) => option === task.correctAnswer).length === 1, `${label} lacks one correct answer`);
}

const stufen = ["leicht", "mittel", "schwer"];
const readingTypes = ["missingLetter", "chooseWord", "missingSyllable", "sentenceMatch", "sentenceMissingWord", "sentenceComplete"];

// Jede Aufgabenart, die eine Welt auf einer Stufe stellt – und jede Art
// einzeln, wie das Spiel sie bei ausdrücklichem Wunsch liefert.
function validateReading() {
  const table = api.readingTaskTypes;
  assert(table && stufen.every((stufe) => difficulties.every((difficulty) => Array.isArray(table[stufe][difficulty]) && table[stufe][difficulty].length)), "every stufe/world needs reading task types");
  // "leicht" ist der Wortdetektiv von früher; "schwer" liest schon auf der
  // Wiese Wörter statt Buchstaben.
  assert(JSON.stringify(table.leicht.easy) === '["missingLetter"]' && JSON.stringify(table.leicht.extreme) === '["sentenceMatch","sentenceMissingWord"]', "leicht should be the former reading puzzle");
  assert(!table.schwer.easy.includes("missingLetter") && table.schwer.extreme.includes("sentenceComplete"), "schwer should skip single letters and complete sentences");
  stufen.forEach((stufe) => difficulties.forEach((difficulty) => table[stufe][difficulty].forEach((type) => assert(readingTypes.includes(type), `unknown reading task type ${type}`))));

  for (const stufe of stufen) {
    for (const difficulty of difficulties) {
      for (let i = 0; i < 40; i += 1) {
        const task = api.generateReadingTask(difficulty, null, stufe);
        validateReadingTask(task, `reading ${stufe} ${difficulty}`);
        assert(table[stufe][difficulty].includes(task.taskType), `reading ${stufe} ${difficulty} produced ${task.taskType}`);
      }
      for (const taskType of readingTypes) {
        for (let i = 0; i < 40; i += 1) {
          const task = api.generateReadingTask(difficulty, taskType, stufe);
          validateReadingTask(task, `reading ${stufe} ${difficulty} ${taskType}`);
          assert(task.taskType === taskType, `reading ${stufe} ${difficulty} expected ${taskType} but got ${task.taskType}`);
          if (taskType === "missingLetter" || taskType === "missingSyllable") {
            assert(task.displayText.split(" ").filter((part) => part === "_").length === 1, `${taskType} should have exactly one gap`);
          }
          if (taskType === "sentenceMatch") {
            assert(task.options.every((option) => option.endsWith(".")), "sentenceMatch options should be sentences");
          }
          if (taskType === "sentenceMissingWord" || taskType === "sentenceComplete") {
            assert(task.displayText.includes("___"), `${taskType} should show a gap`);
            assert(!task.displayText.includes(task.correctAnswer), `${taskType} must not show its answer`);
          }
          // Mehr Antworten für die Grossen, nie weniger als drei.
          const expected = taskType === "sentenceComplete" ? 4 : (stufe === "schwer" ? (difficulty === "extreme" ? 5 : 4) : (stufe === "mittel" ? (difficulty === "easy" ? 3 : 4) : (difficulty === "easy" || difficulty === "medium" ? 3 : 4)));
          const minimum = ["missingSyllable", "sentenceMatch", "sentenceMissingWord"].includes(taskType) ? Math.max(4, expected) : expected;
          assert(task.options.length === minimum, `reading ${stufe} ${difficulty} ${taskType} has ${task.options.length} options, expected ${minimum}`);
        }
      }
    }
  }
}

// Die Buchstaben-Jagd: jede Frageart je Welt und Stufe.
function validateLetters() {
  const modes = api.letterModes;
  const known = ["start", "end", "gap", "wordStart", "wordEnd"];
  assert(modes && stufen.every((stufe) => difficulties.every((difficulty) => modes[stufe][difficulty]?.length)), "every stufe/world needs letter modes");
  assert(JSON.stringify(modes.leicht.easy) === '["start"]' && JSON.stringify(modes.leicht.extreme) === '["start","end"]', "leicht should be the former letter hunt");
  assert(modes.schwer.extreme.includes("gap") && modes.schwer.extreme.includes("wordStart"), "schwer should ask for gaps and words");
  for (const stufe of stufen) {
    for (const difficulty of difficulties) {
      for (let i = 0; i < 30; i += 1) {
        const task = api.generateLetterTask(difficulty, stufe);
        assert(modes[stufe][difficulty].includes(task.mode), `letters ${stufe} ${difficulty} produced ${task.mode}`);
      }
      for (const mode of known) {
        for (let i = 0; i < 30; i += 1) {
          const task = api.generateLetterTask(difficulty, stufe, mode);
          const label = `letters ${stufe} ${difficulty} ${mode}`;
          assert(task.mode === mode, `${label} produced ${task.mode}`);
          assert(optionIsUnique(task), `${label} options are duplicated`);
          assert(task.options.filter((option) => option === task.correctAnswer).length === 1, `${label} lacks one correct answer`);
          assert(task.options.length >= 3 && task.options.length <= 4, `${label} has ${task.options.length} options`);
          assert(task.questionText && task.speakText, `${label} has no question`);
          const word = task.word;
          if (mode === "start") assert(task.correctAnswer === word[0] && task.gapIndex === 0, `${label}: wrong answer`);
          if (mode === "end") assert(task.correctAnswer === word.at(-1) && task.gapIndex === word.length - 1, `${label}: wrong answer`);
          if (mode === "gap") {
            assert(task.gapIndex > 0 && task.gapIndex < word.length - 1 && task.correctAnswer === word[task.gapIndex], `${label}: gap outside the word`);
            assert(!task.questionText.includes(task.item.word), `${label}: the question gives the word away`);
          }
          if (mode === "wordStart" || mode === "wordEnd") {
            const pick = (option) => (mode === "wordStart" ? option[0] : option.at(-1)).toUpperCase();
            assert(task.correctAnswer === task.item.word && pick(task.correctAnswer) === task.letter, `${label}: wrong answer`);
            assert(task.options.filter((option) => pick(option) === task.letter).length === 1, `${label}: two words fit the letter`);
          }
        }
      }
    }
  }
}

function validateSpatial() {
  // Vierzig Aufgaben, aber nur vier Level: jedes Level ist eine Runde über die
  // zehn Aufgaben seiner Welt.
  assert(api.spatialTasks.length === 40, "spatial puzzle should expose 40 tasks");
  const result = api.validateSpatialTasks(api.spatialTasks);
  assert(result.valid, `spatial puzzle validation failed:\n${result.errors.join("\n")}`);

  assert(api.spatialLevels.length === 4, "spatial puzzle should expose 4 levels");
  for (const difficulty of difficulties) {
    const levels = api.spatialLevels.filter((level) => level.difficulty === difficulty);
    assert(levels.length === 1, `spatial puzzle ${difficulty} should be a single level`);
    const [level] = levels;
    assert(level.tasks.length === 10, `spatial puzzle ${difficulty} should hold 10 tasks`);
    assert(level.targetCount === 10, `spatial puzzle ${difficulty} should ask for 10 tasks`);
    assert(level.badge === "10 Aufgaben", `spatial puzzle ${difficulty} should expose the task badge`);
    assert(level.tasks.every((task) => task.difficulty === difficulty), `spatial puzzle ${difficulty} mixes worlds`);
    assert(level.tasks.every((task) => !("hint" in task)), `spatial puzzle ${difficulty} still exposes hints`);
    const ids = new Set(level.tasks.map((task) => task.id));
    assert(ids.size === level.tasks.length, `spatial puzzle ${difficulty} repeats a task`);
  }
}

function validateCatalog() {
  // Der Garten: sechs Level vor der Wiese, nur bei Battleships und Tiergehege,
  // und im Katalog zuerst – Garten 1 ist das erste Level des Spiels.
  for (const game of ["bimaru", "shikaku"]) {
    assert(catalog[game], `${game} missing from level catalog`);
    const starter = catalog[game].filter((level) => level.difficulty === "starter");
    assert(starter.length === 6, `${game} should have 6 starter levels, found ${starter.length}`);
    assert(catalog[game].length === 46, `${game} should have 46 levels`);
    assert(catalog[game][0].difficulty === "starter" && catalog[game][6].difficulty === "easy", `${game} should list the starter levels first`);
    assert(starter.every((level) => level.levelName.includes(" 0-")), `${game} starter levels should carry the code 0`);
    for (const difficulty of difficulties) {
      assert(catalog[game].filter((level) => level.difficulty === difficulty).length === 10, `${game} ${difficulty} should have 10 levels`);
    }
  }
  for (const game of ["arukone", "kakuro", "hidoku"]) {
    assert(catalog[game].length === 40 && !catalog[game].some((level) => level.difficulty === "starter"), `${game} should have 40 levels and no starter world`);
  }

  for (const game of ["readingPuzzle", "letterPuzzle"]) {
    assert(catalog[game], `${game} missing from level catalog`);
    assert(catalog[game].length === 40, `${game} should have 40 levels`);
    for (const difficulty of difficulties) {
      const levels = catalog[game].filter((level) => level.difficulty === difficulty);
      assert(levels.length === 10, `${game} ${difficulty} should have 10 levels`);
      const expectedBadge = `${{ easy: 5, medium: 7, hard: 10, extreme: 10 }[difficulty]} Aufgaben`;
      assert(levels.every((level) => level.badge === expectedBadge), `${game} ${difficulty} should expose task badge "${expectedBadge}"`);
    }
  }

  assert(catalog.spatialPuzzle, "spatialPuzzle missing from level catalog");
  assert(catalog.spatialPuzzle.length === 4, "spatialPuzzle should have 4 levels");
  for (const difficulty of difficulties) {
    const levels = catalog.spatialPuzzle.filter((level) => level.difficulty === difficulty);
    assert(levels.length === 1, `spatialPuzzle ${difficulty} should be a single level`);
    assert(levels.every((level) => level.badge === "10 Aufgaben"), `spatialPuzzle ${difficulty} should expose the task badge`);
  }
}

validateReading();
validateLetters();
validateSpatial();
validateCatalog();

console.log("Learning puzzle validation passed.");
