import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const source = fs.readFileSync(path.join(root, "app.js"), "utf8");
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

function countMathSolutions(task) {
  const max = task.difficulty === "easy" || task.difficulty === "medium" ? 10 : 20;
  let count = 0;
  for (let value = 0; value <= max; value += 1) {
    const left = task.missingPosition === "left" ? value : task.left;
    const right = task.missingPosition === "right" ? value : task.right;
    const result = task.missingPosition === "result" ? value : task.result;
    if (task.operator === "+" && left + right === result) count += 1;
    if (task.operator === "-" && left - right === result) count += 1;
  }
  return count;
}

function validateMath() {
  const seenOperators = { medium: new Set(), hard: new Set() };
  const seenMissing = { hard: new Set(), extreme: new Set() };

  for (const difficulty of difficulties) {
    for (let i = 0; i < 240; i += 1) {
      const task = api.generateMathTask(difficulty);
      assert(api.validateMathTask(task), `math ${difficulty} task failed validator`);
      assert(optionIsUnique(task), `math ${difficulty} options are duplicated`);
      assert(task.options.filter((option) => option === task.correctAnswer).length === 1, `math ${difficulty} lacks one correct answer`);
      assert(countMathSolutions(task) === 1, `math ${difficulty} missing position has more than one solution`);
      assert(task.result >= 0, `math ${difficulty} has negative result`);

      if (difficulty === "easy") {
        assert(task.operator === "+", "easy math produced subtraction");
        assert(task.result <= 10, "easy math result exceeds 10");
        assert(task.missingPosition === "result", "easy math produced a missing operand");
        assert(task.options.length === 3, "easy math should have three options");
      }
      if (difficulty === "medium") {
        seenOperators.medium.add(task.operator);
        assert(task.result <= 10, "medium math result exceeds 10");
        assert(task.missingPosition === "result", "medium math produced a missing operand");
        assert(task.options.length === 3, "medium math should have three options");
      }
      if (difficulty === "hard") {
        seenOperators.hard.add(task.operator);
        seenMissing.hard.add(task.missingPosition);
        assert(task.result <= 20, "hard math result exceeds 20");
        assert(task.options.length === 4, "hard math should have four options");
      }
      if (difficulty === "extreme") {
        seenMissing.extreme.add(task.missingPosition);
        assert(task.operator === "-", "extreme math produced addition");
        assert(task.result <= 20, "extreme math result exceeds 20");
        assert(task.options.length === 4, "extreme math should have four options");
      }
    }
  }

  assert(seenOperators.medium.has("+") && seenOperators.medium.has("-"), "medium math did not sample both operators");
  assert(seenOperators.hard.has("+") && seenOperators.hard.has("-"), "hard math did not sample both operators");
  assert(seenMissing.hard.has("left") || seenMissing.hard.has("right"), "hard math did not sample a missing operand");
  assert(seenMissing.extreme.has("left") && seenMissing.extreme.has("right") && seenMissing.extreme.has("result"), "extreme math did not sample all missing positions");
}

function validateReadingTask(task, label) {
  assert(api.validateReadingTask(task), `${label} failed validator`);
  assert(task.imageKey, `${label} has no imageKey`);
  assert(optionIsUnique(task), `${label} options are duplicated`);
  assert(task.options.filter((option) => option === task.correctAnswer).length === 1, `${label} lacks one correct answer`);
}

function validateReading() {
  const samples = [
    ["easy", "missingLetter"],
    ["medium", "chooseWord"],
    ["hard", "missingLetter"],
    ["hard", "missingSyllable"],
    ["hard", "chooseWord"],
    ["extreme", "sentenceMatch"],
    ["extreme", "sentenceMissingWord"],
  ];

  for (const [difficulty, taskType] of samples) {
    for (let i = 0; i < 120; i += 1) {
      const task = api.generateReadingTask(difficulty, taskType);
      validateReadingTask(task, `reading ${difficulty} ${taskType}`);
      assert(task.taskType === taskType, `reading ${difficulty} expected ${taskType} but got ${task.taskType}`);
      if (taskType === "missingLetter") {
        assert(task.displayText.split(" ").filter((part) => part === "_").length === 1, "missingLetter should have exactly one gap");
      }
      if (taskType === "sentenceMatch") {
        assert(task.options.every((option) => option.endsWith(".")), "sentenceMatch options should be sentences");
      }
    }
  }
}

function validateShapeSequence() {
  assert(api.shapeSequenceItems.length === 48, "shape sequence should expose 48 curated items");
  assert(api.shapePool.length >= 17, "shape sequence pool is too small");

  for (const difficulty of difficulties) {
    const items = api.shapeSequenceItems.filter((item) => item.diff === difficulty);
    assert(items.length === 12, `shape sequence ${difficulty} should have 12 items`);

    for (let i = 0; i < 120; i += 1) {
      const task = api.generateShapeSequenceTask(difficulty);
      const expectedOptionCount = difficulty === "easy" || difficulty === "medium" ? 3 : 4;
      assert(task.puzzleType === "shapeSequencePuzzle", `shape sequence ${difficulty} has wrong puzzle type`);
      assert(task.difficulty === difficulty, `shape sequence ${difficulty} changed difficulty`);
      assert(items.some((item) => item.id === task.sourceId), `shape sequence ${difficulty} has unknown sourceId`);
      assert(Array.isArray(task.sequence), `shape sequence ${difficulty} has no sequence`);
      assert(task.sequence.filter((shape) => shape === null).length === 1, `shape sequence ${difficulty} should have exactly one gap`);
      assert(api.shapePool.includes(task.correctAnswer), `shape sequence ${difficulty} answer is outside pool`);
      assert(task.options.length === expectedOptionCount, `shape sequence ${difficulty} has wrong option count`);
      assert(optionIsUnique(task), `shape sequence ${difficulty} options are duplicated`);
      assert(task.options.every((option) => api.shapePool.includes(option)), `shape sequence ${difficulty} option is outside pool`);
      assert(task.options.filter((option) => option === task.correctAnswer).length === 1, `shape sequence ${difficulty} lacks one correct answer`);
    }
  }
}

function validateCatalog() {
  for (const game of ["mathPuzzle", "readingPuzzle", "shapeSequencePuzzle"]) {
    assert(catalog[game], `${game} missing from level catalog`);
    assert(catalog[game].length === 40, `${game} should have 40 levels`);
    for (const difficulty of difficulties) {
      const levels = catalog[game].filter((level) => level.difficulty === difficulty);
      assert(levels.length === 10, `${game} ${difficulty} should have 10 levels`);
      assert(levels.every((level) => level.badge === "10 Aufgaben"), `${game} ${difficulty} should expose task badge`);
    }
  }
}

validateMath();
validateReading();
validateShapeSequence();
validateCatalog();

console.log("Learning puzzle validation passed.");
