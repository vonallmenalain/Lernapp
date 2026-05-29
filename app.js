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
    pairs: {
      A: [[0, 0], [0, 1]],
      B: [[0, 2], [1, 4]],
      C: [[1, 3], [2, 0]],
      D: [[2, 1], [3, 3]],
      E: [[3, 2], [4, 4]],
    },
  },
  medium01: {
    title: "Rätsel 12 · Mittel · 6×6",
    description: "Ein größeres Feld mit vier gut sichtbaren Paaren.",
    size: 6,
    pairs: {
      A: [[0, 0], [1, 0]],
      B: [[2, 5], [3, 5]],
      C: [[4, 0], [5, 2]],
      D: [[4, 3], [5, 5]],
    },
  },
  hard01: {
    title: "Rätsel 13 · Knifflig · 7×7",
    description: "Mehr Platz, mehr Paare und längere Wege für geübte Kinder.",
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
const puzzleSelect = document.querySelector("#puzzle-select");
const puzzleTitle = document.querySelector("#puzzle-title");
const puzzleDescription = document.querySelector("#puzzle-description");
const statusText = document.querySelector("#status");
const undoButton = document.querySelector("#undo-button");
const resetButton = document.querySelector("#reset-button");
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

function pushHistory() {
  history.push(snapshot());
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
  const puzzle = getPuzzle();
  paths = Object.fromEntries(
    Object.entries(puzzle.pairs).map(([pair, ends]) => [pair, [ends[0]]]),
  );
  activePair = null;
  history = [];
  hideSuccess();
  render("Ziehe von einem Symbol zum passenden zweiten Symbol.");
}

function getPuzzleKeys() {
  return Object.keys(PUZZLES);
}

function showGame() {
  const controlsLabel = gameControls.querySelector('label[for="puzzle-select"]');
  if (puzzleSelect.parentElement !== gameControls) {
    controlsLabel.after(puzzleSelect);
  }
  startPanel.hidden = true;
  gamePanel.hidden = false;
  document.body.classList.add("puzzle-active");
}

function setPuzzle(key) {
  currentKey = key;
  puzzleSelect.value = key;
  board.style.setProperty("--size", PUZZLES[key].size);
  puzzleTitle.textContent = PUZZLES[key].title;
  puzzleDescription.textContent = PUZZLES[key].description;
  showGame();
  resetPuzzle();
}

function goToNextPuzzle() {
  const puzzleKeys = getPuzzleKeys();
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

Object.entries(PUZZLES).forEach(([key, puzzle]) => {
  const option = document.createElement("option");
  option.value = key;
  option.textContent = puzzle.title;
  puzzleSelect.append(option);
});

puzzleSelect.selectedIndex = -1;
puzzleSelect.addEventListener("change", (event) => setPuzzle(event.target.value));
undoButton.addEventListener("click", () => {
  const previous = history.pop();
  if (previous) {
    restore(previous);
    statusText.textContent = "Der letzte Schritt wurde rückgängig gemacht.";
  }
});
resetButton.addEventListener("click", resetPuzzle);
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
});
