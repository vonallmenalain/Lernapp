const DEFAULT_COLORS = {
  A: "#ef476f",
  B: "#118ab2",
  C: "#06d6a0",
  D: "#ffd166",
  E: "#8e44ad",
  F: "#f77f00",
  G: "#2ec4b6",
  H: "#ff9f1c",
  I: "#3a86ff",
  J: "#8338ec",
  1: "#ffd166",
  2: "#ef476f",
  3: "#7b9eb8",
  4: "#8fd694",
  5: "#f4a261",
};

const PUZZLES = {
  easy01: {
    title: "Rätsel 01 · Leicht · 5×5",
    description: "Kurzes Einsteiger-Rätsel mit drei gut sichtbaren Wegen.",
    size: 5,
    difficulty: "easy",
    pairs: {
      A: [[0, 0], [1, 0]],
      B: [[2, 0], [3, 3]],
      C: [[3, 2], [4, 4]],
    },
  },
  easy02: {
    title: "Rätsel 02 · Leicht · 5×5",
    description: "Übe eine lange Verbindung und zwei kürzere Wege.",
    size: 5,
    difficulty: "easy",
    pairs: {
      A: [[0, 0], [1, 3]],
      B: [[1, 2], [2, 2]],
      C: [[2, 3], [4, 4]],
    },
  },
  easy03: {
    title: "Rätsel 03 · Leicht · 5×5",
    description: "Drei übersichtliche Wege führen gemeinsam durch das ganze Feld.",
    size: 5,
    difficulty: "easy",
    pairs: {
      A: [[0, 0], [0, 4]],
      B: [[1, 4], [2, 1]],
      C: [[2, 2], [4, 4]],
    },
  },
  easy04: {
    title: "Rätsel 04 · Leicht · 5×5",
    description: "Starte mit den oberen Symbolen und arbeite dich nach unten.",
    size: 5,
    difficulty: "easy",
    pairs: {
      A: [[0, 0], [1, 1]],
      B: [[1, 0], [3, 3]],
      C: [[3, 2], [4, 4]],
    },
  },
  easy05: {
    title: "Rätsel 05 · Leicht · 5×5",
    description: "Ein sanfter Einstieg mit vier Symbolpaaren.",
    size: 5,
    difficulty: "easy",
    pairs: {
      A: [[0, 0], [0, 3]],
      B: [[0, 4], [1, 0]],
      C: [[2, 0], [3, 1]],
      D: [[3, 0], [4, 4]],
    },
  },
  easy06: {
    title: "Rätsel 06 · Leicht · 5×5",
    description: "Kurze und lange Wege wechseln sich ab.",
    size: 5,
    difficulty: "easy",
    pairs: {
      A: [[0, 0], [0, 2]],
      B: [[0, 3], [1, 3]],
      C: [[1, 2], [2, 4]],
      D: [[3, 4], [4, 4]],
    },
  },
  easy07: {
    title: "Rätsel 07 · Leicht · 5×5",
    description: "Achte darauf, die mittleren Felder nicht zu früh zu blockieren.",
    size: 5,
    difficulty: "easy",
    pairs: {
      A: [[0, 0], [0, 1]],
      B: [[0, 2], [1, 4]],
      C: [[1, 3], [3, 4]],
      D: [[3, 3], [4, 4]],
    },
  },
  easy08: {
    title: "Rätsel 08 · Leicht · 5×5",
    description: "Vier klare Verbindungen mit viel Platz zum Ziehen.",
    size: 5,
    difficulty: "easy",
    pairs: {
      A: [[0, 0], [0, 4]],
      B: [[1, 4], [1, 0]],
      C: [[2, 0], [3, 3]],
      D: [[3, 2], [4, 4]],
    },
  },
  easy09: {
    title: "Rätsel 09 · Leicht · 5×5",
    description: "Beginne am besten mit den Paaren am oberen Rand.",
    size: 5,
    difficulty: "easy",
    pairs: {
      A: [[0, 0], [0, 2]],
      B: [[0, 3], [1, 0]],
      C: [[2, 0], [2, 4]],
      D: [[3, 4], [4, 4]],
    },
  },
  easy10: {
    title: "Rätsel 10 · Leicht · 5×5",
    description: "Dieses Rätsel trainiert das Zurückziehen entlang des eigenen Wegs.",
    size: 5,
    difficulty: "easy",
    pairs: {
      A: [[0, 0], [0, 1]],
      B: [[0, 2], [1, 2]],
      C: [[1, 1], [3, 2]],
      D: [[3, 1], [4, 4]],
    },
  },
  easy11: {
    title: "Rätsel 11 · Leicht · 5×5",
    description: "Fünf kurze Wege machen das Spielfeld schnell voll.",
    size: 5,
    difficulty: "easy",
    pairs: {
      A: [[0, 0], [0, 1]],
      B: [[0, 2], [1, 4]],
      C: [[1, 3], [2, 0]],
      D: [[2, 1], [3, 3]],
      E: [[3, 2], [4, 4]],
    },
  },
};



const MEDIUM_PUZZLES = [
  { A: [[0, 0], [1, 1]], B: [[1, 0], [2, 5]], C: [[3, 5], [4, 4]], D: [[4, 5], [5, 3]], E: [[5, 2], [5, 0]] },
  { A: [[0, 0], [4, 0]], B: [[5, 0], [2, 2]], C: [[3, 2], [0, 3]], D: [[0, 4], [5, 5]], E: [[4, 5], [0, 5]] },
  { A: [[5, 0], [5, 5]], B: [[4, 5], [3, 4]], C: [[3, 5], [2, 4]], D: [[2, 3], [1, 4]], E: [[1, 5], [0, 0]] },
  { A: [[5, 0], [0, 0]], B: [[0, 1], [2, 1]], C: [[3, 1], [3, 2]], D: [[2, 2], [4, 4]], E: [[3, 4], [5, 5]] },
  { A: [[0, 5], [0, 1]], B: [[0, 0], [2, 4]], C: [[2, 3], [2, 0]], D: [[3, 0], [4, 5]], E: [[4, 4], [5, 5]] },
  { A: [[0, 5], [4, 4]], B: [[3, 4], [0, 4]], C: [[0, 3], [0, 2]], D: [[0, 1], [2, 1]], E: [[3, 1], [0, 0]] },
  { A: [[5, 5], [4, 1]], B: [[4, 2], [3, 4]], C: [[3, 3], [2, 2]], D: [[2, 3], [1, 1]], E: [[1, 0], [0, 5]] },
  { A: [[5, 5], [3, 4]], B: [[4, 4], [2, 2]], C: [[3, 2], [1, 1]], D: [[0, 1], [1, 0]], E: [[2, 0], [5, 0]] },
  { A: [[0, 0], [1, 5]], B: [[1, 4], [2, 1]], C: [[2, 2], [3, 5]], D: [[3, 4], [4, 1]], E: [[4, 2], [5, 0]] },
  { A: [[0, 0], [5, 1]], B: [[4, 1], [4, 2]], C: [[5, 2], [3, 3]], D: [[2, 3], [5, 4]], E: [[5, 5], [0, 5]] },
];

const HARD_PUZZLES = [
  { A: [[0, 0], [0, 5]], B: [[0, 6], [2, 3]], C: [[2, 4], [3, 6]], D: [[3, 5], [3, 3]], E: [[3, 2], [5, 5]], F: [[5, 4], [6, 2]], G: [[6, 3], [6, 6]] },
  { A: [[0, 0], [3, 0]], B: [[4, 0], [1, 1]], C: [[0, 1], [6, 2]], D: [[6, 3], [0, 4]], E: [[1, 4], [4, 4]], F: [[5, 4], [3, 5]], G: [[2, 5], [6, 6]] },
  { A: [[6, 0], [5, 2]], B: [[5, 1], [4, 2]], C: [[4, 3], [3, 4]], D: [[3, 3], [3, 0]], E: [[2, 0], [1, 5]], F: [[1, 4], [0, 3]], G: [[0, 4], [0, 6]] },
  { A: [[6, 0], [0, 1]], B: [[1, 1], [3, 1]], C: [[4, 1], [2, 2]], D: [[1, 2], [6, 3]], E: [[6, 4], [4, 5]], F: [[5, 5], [6, 6]], G: [[5, 6], [0, 6]] },
  { A: [[0, 6], [1, 2]], B: [[1, 3], [2, 2]], C: [[2, 1], [3, 0]], D: [[3, 1], [3, 5]], E: [[3, 6], [4, 0]], F: [[5, 0], [5, 4]], G: [[5, 5], [6, 0]] },
  { A: [[0, 6], [5, 5]], B: [[4, 5], [2, 4]], C: [[3, 4], [2, 3]], D: [[1, 3], [5, 2]], E: [[6, 2], [2, 1]], F: [[1, 1], [1, 0]], G: [[2, 0], [6, 0]] },
  { A: [[6, 6], [6, 1]], B: [[6, 0], [5, 6]], C: [[4, 6], [3, 1]], D: [[3, 2], [2, 4]], E: [[2, 3], [2, 0]], F: [[1, 0], [0, 3]], G: [[0, 2], [0, 0]] },
  { A: [[6, 6], [1, 6]], B: [[0, 6], [2, 5]], C: [[3, 5], [5, 5]], D: [[6, 5], [0, 3]], E: [[1, 3], [4, 2]], F: [[3, 2], [2, 1]], G: [[3, 1], [0, 0]] },
  { A: [[0, 0], [1, 4]], B: [[1, 3], [3, 6]], C: [[3, 5], [3, 1]], D: [[3, 0], [4, 3]], E: [[4, 4], [5, 5]], F: [[5, 4], [6, 2]], G: [[6, 3], [6, 6]] },
  { A: [[0, 0], [4, 0]], B: [[5, 0], [1, 2]], C: [[2, 2], [4, 2]], D: [[5, 2], [0, 3]], E: [[0, 4], [5, 5]], F: [[4, 5], [0, 6]], G: [[1, 6], [6, 6]] },
];

MEDIUM_PUZZLES.forEach((pairs, index) => {
  const number = String(index + 1).padStart(2, "0");
  PUZZLES[`medium${number}`] = {
    title: `Rätsel ${number} · Mittel · 6×6`,
    description: "Mittleres Rätsel mit mehr Feldern und fünf Symbolpaaren.",
    size: 6,
    difficulty: "medium",
    pairs,
  };
});

HARD_PUZZLES.forEach((pairs, index) => {
  const number = String(index + 1).padStart(2, "0");
  PUZZLES[`hard${number}`] = {
    title: `Rätsel ${number} · Schwer · 7×7`,
    description: "Schweres Rätsel mit langen Wegen und sieben Symbolpaaren.",
    size: 7,
    difficulty: "hard",
    pairs,
  };
});

const board = document.querySelector("#board");
const puzzleSelect = document.querySelector("#puzzle-select");
const difficultySelect = document.querySelector("#difficulty-select");
const puzzleTitle = document.querySelector("#puzzle-title");
const puzzleDescription = document.querySelector("#puzzle-description");
const statusText = document.querySelector("#status");
const undoButton = document.querySelector("#undo-button");
const resetButton = document.querySelector("#reset-button");
const backButton = document.querySelector("#back-button");
const successOverlay = document.querySelector("#success-overlay");
const successClose = document.querySelector("#success-close");
const nextPuzzleButton = document.querySelector("#next-puzzle-button");
const startPanel = document.querySelector("#start-panel");
const gamePanel = document.querySelector("#game-panel");
const gameControls = document.querySelector("#game-controls");

let currentKey = null;
let paths = {};
let activePair = null;
let history = [];
let winShown = false;
let isDrawing = false;
let lastDrawnCell = null;
let suppressNextClick = false;
let activeMoveSnapshot = null;
let activeMoveHistoryPushed = false;

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

function getPairColor(pair) {
  return DEFAULT_COLORS[pair] ?? "#6c5ce7";
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
    winShown,
  };
}

function restore(state) {
  paths = structuredClone(state.paths);
  activePair = state.activePair;
  winShown = state.winShown;
  hideSuccess();
  render();
}

function beginMove() {
  activeMoveSnapshot = snapshot();
  activeMoveHistoryPushed = false;
}

function finishMove() {
  activeMoveSnapshot = null;
  activeMoveHistoryPushed = false;
}

function pushHistory() {
  if (activeMoveSnapshot) {
    if (!activeMoveHistoryPushed) {
      history.push(activeMoveSnapshot);
      activeMoveHistoryPushed = true;
    }
  } else {
    history.push(snapshot());
  }
  undoButton.disabled = false;
}

function showSuccess() {
  winShown = true;
  successOverlay.hidden = false;
  successOverlay.classList.remove("hidden");
  statusText.textContent = "Geschafft!";
}

function hideSuccess() {
  winShown = false;
  successOverlay.hidden = true;
  successOverlay.classList.add("hidden");
}

function resetPuzzle() {
  finishMove();
  const puzzle = getPuzzle();
  paths = Object.fromEntries(
    Object.entries(puzzle.pairs).map(([pair, ends]) => [pair, [ends[0]]]),
  );
  activePair = null;
  history = [];
  hideSuccess();
  render("Ziehe von einem Symbol zum passenden zweiten Symbol.");
}

function getPuzzleKeys(difficulty = difficultySelect.value) {
  return Object.entries(PUZZLES)
    .filter(([, puzzle]) => puzzle.difficulty === difficulty)
    .map(([key]) => key);
}

function showGame() {
  startPanel.hidden = true;
  gamePanel.hidden = false;
  gameControls.hidden = false;
  document.body.classList.add("puzzle-active");
}

function showLevelSelect() {
  finishMove();
  hideSuccess();
  isDrawing = false;
  startPanel.hidden = false;
  gamePanel.hidden = true;
  gameControls.hidden = true;
  document.body.classList.remove("puzzle-active");
}

function setPuzzle(key) {
  currentKey = key;
  difficultySelect.value = PUZZLES[key].difficulty;
  populatePuzzleOptions();
  puzzleSelect.value = key;
  board.style.setProperty("--size", PUZZLES[key].size);
  puzzleTitle.textContent = PUZZLES[key].title;
  puzzleDescription.textContent = PUZZLES[key].description;
  showGame();
  resetPuzzle();
}

function goToNextPuzzle() {
  const puzzleKeys = getPuzzleKeys(PUZZLES[currentKey].difficulty);
  const currentIndex = puzzleKeys.indexOf(currentKey);
  const nextIndex = (currentIndex + 1) % puzzleKeys.length;
  setPuzzle(puzzleKeys[nextIndex]);
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

function checkWin() {
  const puzzle = getPuzzle();
  const filledCells = new Set();
  const allPairsDone = Object.keys(puzzle.pairs).every((pair) => isCompleted(pair));

  Object.values(paths).forEach((path) => {
    path.forEach((point) => filledCells.add(cellKey(...point)));
  });

  return allPairsDone && filledCells.size === puzzle.size * puzzle.size;
}

function handleWin() {
  activePair = null;
  showSuccess();
}

function handleCellAction(row, col) {
  if (checkWin()) {
    return;
  }

  const endpointPair = getEndpointAt(row, col);

  if (endpointPair) {
    if (!activePair || endpointPair !== activePair || isCompleted(activePair)) {
      pushHistory();
      activePair = endpointPair;
      paths[endpointPair] = [[row, col]];
      render(`Weg ${endpointPair} gestartet. Ziehe zum gleichen Symbol.`);
      return;
    }
  }

  if (!activePair) {
    render("Bitte zuerst ein Symbol auswählen.");
    return;
  }

  if (isCompleted(activePair)) {
    render("Dieser Weg ist fertig. Wähle ein anderes Symbol.");
    return;
  }

  const path = paths[activePair];
  const last = path.at(-1);

  if (!isNeighbor(last, [row, col])) {
    render("Ziehe nur waagerecht oder senkrecht auf ein Nachbarfeld.");
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
    if (checkWin()) {
      handleWin();
      render();
      return;
    }
    render("Super! Ziehe nun das nächste Symbolpaar zusammen.");
    return;
  }

  render(`Weg ${activePair}: weiter zum gleichen Symbol ziehen.`);
}

function getCellFromPoint(clientX, clientY) {
  const element = document.elementFromPoint(clientX, clientY);
  return element?.closest(".cell");
}

function drawToCell(cell) {
  if (!cell || !board.contains(cell)) {
    return;
  }

  const row = Number(cell.dataset.row);
  const col = Number(cell.dataset.col);
  const key = cellKey(row, col);

  if (key === lastDrawnCell) {
    return;
  }

  lastDrawnCell = key;
  handleCellAction(row, col);
}

function render(message = statusText.textContent) {
  const puzzle = getPuzzle();
  board.innerHTML = "";
  if (!winShown) {
    statusText.textContent = message;
  }
  undoButton.disabled = history.length === 0;

  for (let row = 0; row < puzzle.size; row += 1) {
    for (let col = 0; col < puzzle.size; col += 1) {
      const cell = document.createElement("button");
      const endpointPair = getEndpointAt(row, col);
      const owner = getOwnerAt(row, col);
      const pair = endpointPair ?? owner;

      cell.type = "button";
      cell.className = "cell";
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.setAttribute("aria-label", `Zeile ${row + 1}, Spalte ${col + 1}`);
      cell.style.setProperty("--pair-color", getPairColor(pair));

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

      if (checkWin()) {
        cell.classList.add("board-won");
      }

      cell.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        isDrawing = true;
        suppressNextClick = true;
        lastDrawnCell = null;
        beginMove();
        board.setPointerCapture?.(event.pointerId);
        drawToCell(cell);
      });

      cell.addEventListener("click", (event) => {
        if (suppressNextClick) {
          suppressNextClick = false;
          return;
        }
        if (event.detail === 0) {
          handleCellAction(row, col);
        }
      });

      board.append(cell);
    }
  }
}

function populatePuzzleOptions() {
  const puzzleKeys = getPuzzleKeys();
  puzzleSelect.innerHTML = "";

  puzzleKeys.forEach((key) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = PUZZLES[key].title;
    puzzleSelect.append(option);
  });
}

populatePuzzleOptions();
puzzleSelect.selectedIndex = -1;
difficultySelect.addEventListener("change", () => {
  populatePuzzleOptions();
  puzzleSelect.selectedIndex = -1;
});
puzzleSelect.addEventListener("change", (event) => setPuzzle(event.target.value));
undoButton.addEventListener("click", () => {
  finishMove();
  const previous = history.pop();
  if (previous) {
    restore(previous);
    statusText.textContent = "Die letzte Linie wurde rückgängig gemacht.";
  }
});
resetButton.addEventListener("click", resetPuzzle);
backButton.addEventListener("click", showLevelSelect);
successClose.addEventListener("click", hideSuccess);
nextPuzzleButton.addEventListener("click", goToNextPuzzle);
successOverlay.addEventListener("click", (event) => {
  if (event.target === successOverlay) {
    hideSuccess();
  }
});

document.addEventListener("pointermove", (event) => {
  if (!isDrawing) {
    return;
  }
  event.preventDefault();
  drawToCell(getCellFromPoint(event.clientX, event.clientY));
});

document.addEventListener("pointerup", () => {
  isDrawing = false;
  lastDrawnCell = null;
  finishMove();
});
