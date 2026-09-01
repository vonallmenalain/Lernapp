import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const difficulties = ["easy", "medium", "hard", "extreme"];

function fail(message) {
  throw new Error(message);
}

function extractConstObject(name) {
  const marker = `const ${name} = `;
  const markerIndex = appSource.indexOf(marker);
  if (markerIndex < 0) fail(`${name} not found`);
  const start = appSource.indexOf("{", markerIndex);
  if (start < 0) fail(`${name} object start not found`);

  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let i = start; i < appSource.length; i += 1) {
    const char = appSource[i];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = "";
      }
      continue;
    }

    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return Function(`"use strict"; return (${appSource.slice(start, i + 1)});`)();
      }
    }
  }

  fail(`${name} object end not found`);
}

const data = extractConstObject("CURATED_LEVEL_DATA");

function ensureUnique(levels, label, signatureFn) {
  const signatures = new Set();
  levels.forEach((level, index) => {
    const signature = signatureFn(level);
    if (signatures.has(signature)) fail(`${label} level ${index + 1} duplicates an earlier level`);
    signatures.add(signature);
  });
}

function validateShikaku() {
  for (const difficulty of difficulties) {
    const levels = data.shikaku[difficulty];
    if (levels.length !== 10) fail(`shikaku ${difficulty} has ${levels.length} levels`);
    ensureUnique(levels, `shikaku ${difficulty}`, (level) => JSON.stringify([level.clues, level.solutionRegions]));

    levels.forEach((level, index) => {
      const label = `shikaku ${difficulty} ${index + 1}`;
      if (level.solutionRegions.length !== level.rows) fail(`${label} row count mismatch`);
      const regions = new Map();
      level.solutionRegions.forEach((row, rowIndex) => {
        if (row.length !== level.cols) fail(`${label} col count mismatch in row ${rowIndex}`);
        [...row].forEach((id, colIndex) => {
          if (!regions.has(id)) regions.set(id, []);
          regions.get(id).push([rowIndex, colIndex]);
        });
      });

      const clueByRegion = new Map();
      level.clues.forEach(([row, col, value]) => {
        if (row < 0 || row >= level.rows || col < 0 || col >= level.cols) fail(`${label} has out-of-bounds clue`);
        const regionId = level.solutionRegions[row][col];
        if (!regions.has(regionId)) fail(`${label} clue points to missing region`);
        if (clueByRegion.has(regionId)) fail(`${label} region ${regionId} has more than one clue`);
        clueByRegion.set(regionId, value);
      });

      if (clueByRegion.size !== regions.size) fail(`${label} clue count does not match region count`);
      for (const [id, cells] of regions) {
        const rows = cells.map(([row]) => row);
        const cols = cells.map(([, col]) => col);
        const minRow = Math.min(...rows);
        const maxRow = Math.max(...rows);
        const minCol = Math.min(...cols);
        const maxCol = Math.max(...cols);
        const area = (maxRow - minRow + 1) * (maxCol - minCol + 1);
        if (area !== cells.length) fail(`${label} region ${id} is not a rectangle`);
        for (let row = minRow; row <= maxRow; row += 1) {
          for (let col = minCol; col <= maxCol; col += 1) {
            if (level.solutionRegions[row][col] !== id) fail(`${label} region ${id} has a gap`);
          }
        }
        if (clueByRegion.get(id) !== cells.length) fail(`${label} region ${id} clue does not match area`);
      }
    });
  }
}

function validateHidoku() {
  for (const difficulty of difficulties) {
    const levels = data.hidoku[difficulty];
    if (levels.length !== 10) fail(`hidoku ${difficulty} has ${levels.length} levels`);
    ensureUnique(levels, `hidoku ${difficulty}`, (level) => JSON.stringify(level.solution));

    levels.forEach((level, index) => {
      const label = `hidoku ${difficulty} ${index + 1}`;
      const max = level.size * level.size;
      const positions = Array(max + 1);
      if (level.solution.length !== level.size) fail(`${label} row count mismatch`);
      level.solution.forEach((row, rowIndex) => {
        if (row.length !== level.size) fail(`${label} col count mismatch`);
        row.forEach((value, colIndex) => {
          if (!Number.isInteger(value) || value < 1 || value > max) fail(`${label} has invalid value ${value}`);
          if (positions[value]) fail(`${label} repeats value ${value}`);
          positions[value] = [rowIndex, colIndex];
        });
      });

      for (let value = 1; value <= max; value += 1) {
        if (!positions[value]) fail(`${label} misses value ${value}`);
        if (value < max) {
          const [row, col] = positions[value];
          const [nextRow, nextCol] = positions[value + 1];
          if (Math.max(Math.abs(row - nextRow), Math.abs(col - nextCol)) !== 1) {
            fail(`${label} values ${value} and ${value + 1} do not touch`);
          }
        }
      }

      level.givens.forEach(([row, col, value]) => {
        if (level.solution[row]?.[col] !== value) fail(`${label} given ${value} does not match solution`);
      });
    });
  }
}

validateShikaku();
validateHidoku();

console.log("Curated level validation passed.");
