const COLORS = {
  A: "#ef476f",
  B: "#118ab2",
  C: "#06d6a0",
  D: "#ffd166",
  E: "#8e44ad",
  F: "#f77f00",
};

const PUZZLES = {
  easy: {
    title: "Einfach",
    size: 5,
    pairs: {
      A: [[0, 0], [2, 0]],
      B: [[0, 4], [4, 4]],
      C: [[3, 0], [4, 3]],
    },
  },
  medium: {
    title: "Mittel",
    size: 6,
    pairs: {
      A: [[0, 0], [1, 0]],
      B: [[2, 5], [3, 5]],
      C: [[4, 0], [5, 2]],
      D: [[4, 3], [5, 5]],
    },
  },
  hard: {
    title: "Knifflig",
    size: 7,
    pairs: {
      A: [[0, 0], [0, 6]],
      B: [[1, 0], [2, 6]],
      C: [[3, 0], [4, 3]],
      D: [[4, 4], [6, 6]],
      E: [[5, 0], [6, 3]],
    },
  },
};

const board = document.querySelector("#board");
const difficulty = document.querySelector("#difficulty");
const puzzleTitle = document.querySelector("#puzzle-title");
const statusText = document.querySelector("#status");
const undoButton = document.querySelector("#undo-button");
const resetButton = document.querySelector("#reset-button");

let currentKey = "easy";
let paths = {};
let activePair = null;
let history = [];

function cellKey(row, col) {
  return `${row},${col}`;
}

function sameCell(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}

function isNeighbor(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
}

function getPuzzle() {
  return PUZZLES[currentKey];
}

function getEndpointAt(row, col) {
  const puzzle = getPuzzle();
  return Object.entries(puzzle.pairs).find(([, ends]) =>
    ends.some((point) => sameCell(point, [row, col])),
  )?.[0] ?? null;
}

function getOwnerAt(row, col) {
  const key = cellKey(row, col);
  return Object.entries(paths).find(([, path]) =>
    path.some((point) => cellKey(...point) === key),
  )?.[0] ?? null;
}

function isCompleted(pair) {
  const ends = getPuzzle().pairs[pair];
  const path = paths[pair];
  const startsAtFirstEnd = sameCell(path[0], ends[0]) && sameCell(path.at(-1), ends[1]);
  const startsAtSecondEnd = sameCell(path[0], ends[1]) && sameCell(path.at(-1), ends[0]);
  return path.length > 1 && (startsAtFirstEnd || startsAtSecondEnd);
}

function snapshot() {
  return {
    paths: structuredClone(paths),
    activePair,
  };
}

function restore(state) {
  paths = structuredClone(state.paths);
  activePair = state.activePair;
  render();
}

function pushHistory() {
  history.push(snapshot());
  undoButton.disabled = false;
}

function resetPuzzle() {
  const puzzle = getPuzzle();
  paths = Object.fromEntries(
    Object.entries(puzzle.pairs).map(([pair, ends]) => [pair, [ends[0]]]),
  );
  activePair = null;
  history = [];
  render("Wähle einen Startpunkt aus.");
}

function setDifficulty(key) {
  currentKey = key;
  board.style.setProperty("--size", PUZZLES[key].size);
  puzzleTitle.textContent = PUZZLES[key].title;
  resetPuzzle();
}

function canUseCell(pair, row, col) {
  const endpointPair = getEndpointAt(row, col);
  const owner = getOwnerAt(row, col);

  if (endpointPair && endpointPair !== pair) {
    return false;
  }

  if (owner && owner !== pair) {
    return false;
  }

  const pairEnds = getPuzzle().pairs[pair];
  const isOwnStart = sameCell(pairEnds[0], [row, col]);
  const isOwnEnd = sameCell(pairEnds[1], [row, col]);
  return !endpointPair || isOwnStart || isOwnEnd;
}

function handleCellClick(row, col) {
  const endpointPair = getEndpointAt(row, col);

  if (endpointPair) {
    if (!activePair || endpointPair !== activePair || isCompleted(activePair)) {
      pushHistory();
      activePair = endpointPair;
      paths[endpointPair] = [[row, col]];
      render(`Weg ${endpointPair} gestartet. Suche das gleiche Symbol.`);
      return;
    }
  }

  if (!activePair) {
    render("Bitte zuerst ein Symbol anklicken.");
    return;
  }

  if (isCompleted(activePair)) {
    render("Dieser Weg ist fertig. Wähle ein anderes Symbol.");
    return;
  }

  const path = paths[activePair];
  const last = path.at(-1);

  if (!isNeighbor(last, [row, col])) {
    render("Du kannst nur auf ein Nachbarfeld gehen.");
    return;
  }

  const existingIndex = path.findIndex((point) => sameCell(point, [row, col]));
  if (existingIndex >= 0) {
    pushHistory();
    paths[activePair] = path.slice(0, existingIndex + 1);
    render("Ein Stück zurückgegangen.");
    return;
  }

  if (!canUseCell(activePair, row, col)) {
    render("Dieses Feld gehört schon zu einem anderen Weg.");
    return;
  }

  pushHistory();
  paths[activePair] = [...path, [row, col]];

  if (isCompleted(activePair)) {
    activePair = null;
    render(
      checkWin()
        ? "Geschafft! Alle Wege sind verbunden und das Feld ist voll."
        : "Super! Wähle das nächste Symbol.",
    );
    return;
  }

  render(`Weg ${activePair}: weiter zum gleichen Symbol.`);
}

function checkWin() {
  const puzzle = getPuzzle();
  const filledCells = new Set();
  const allPairsDone = Object.keys(puzzle.pairs).every((pair) => isCompleted(pair));

  Object.values(paths).forEach((path) => {
    path.forEach((point) => filledCells.add(cellKey(...point)));
  });

  return allPairsDone && filledCells.size === puzzle.size * puzzle.size;
}

function render(message = statusText.textContent) {
  const puzzle = getPuzzle();
  board.innerHTML = "";
  statusText.textContent = message;
  undoButton.disabled = history.length === 0;

  for (let row = 0; row < puzzle.size; row += 1) {
    for (let col = 0; col < puzzle.size; col += 1) {
      const cell = document.createElement("button");
      const endpointPair = getEndpointAt(row, col);
      const owner = getOwnerAt(row, col);
      const pair = endpointPair ?? owner;

      cell.type = "button";
      cell.className = "cell";
      cell.setAttribute("aria-label", `Zeile ${row + 1}, Spalte ${col + 1}`);
      cell.style.setProperty("--pair-color", COLORS[pair] ?? "#6c5ce7");

      if (endpointPair) {
        cell.textContent = endpointPair;
        cell.classList.add("endpoint");
      }

      if (owner) {
        cell.classList.add("filled");
      }

      if (pair && pair === activePair) {
        cell.classList.add("active");
      }

      if (pair && isCompleted(pair)) {
        cell.classList.add("completed");
      }

      cell.addEventListener("click", () => handleCellClick(row, col));
      board.append(cell);
    }
  }
}

Object.entries(PUZZLES).forEach(([key, puzzle]) => {
  const option = document.createElement("option");
  option.value = key;
  option.textContent = puzzle.title;
  difficulty.append(option);
});

difficulty.addEventListener("change", (event) => setDifficulty(event.target.value));
undoButton.addEventListener("click", () => {
  const previous = history.pop();
  if (previous) {
    restore(previous);
    statusText.textContent = "Der letzte Schritt wurde rückgängig gemacht.";
  }
});
resetButton.addEventListener("click", resetPuzzle);

setDifficulty(currentKey);
