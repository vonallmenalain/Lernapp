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

function validateSpatial() {
  assert(api.spatialLevels.length === 40, "spatial puzzle should expose 40 levels");
  const result = api.validateSpatialLevels(api.spatialLevels);
  assert(result.valid, `spatial puzzle validation failed:\n${result.errors.join("\n")}`);

  for (const difficulty of difficulties) {
    const levels = api.spatialLevels.filter((level) => level.difficulty === difficulty);
    assert(levels.length === 10, `spatial puzzle ${difficulty} should have 10 levels`);
    assert(levels.every((level) => level.badge === `${level.options.length} Antworten`), `spatial puzzle ${difficulty} levels should expose answer badge`);
    assert(levels.every((level) => !("hint" in level)), `spatial puzzle ${difficulty} still exposes hints`);
  }
}

function validateCatalog() {
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
  assert(catalog.spatialPuzzle.length === 40, "spatialPuzzle should have 40 levels");
  for (const difficulty of difficulties) {
    const levels = catalog.spatialPuzzle.filter((level) => level.difficulty === difficulty);
    assert(levels.length === 10, `spatialPuzzle ${difficulty} should have 10 levels`);
    assert(levels.every((level) => level.badge?.endsWith("Antworten")), `spatialPuzzle ${difficulty} should expose answer badge`);
  }
}

validateReading();
validateSpatial();
validateCatalog();

console.log("Learning puzzle validation passed.");
