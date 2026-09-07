/* =========================================
   LUDO GAME
   YOU = RED + YELLOW
   COMPUTER = GREEN + BLUE
========================================= */


/* =========================================
   DOM
========================================= */

const menuScreen = document.getElementById("menuScreen");
const gameScreen = document.getElementById("gameScreen");

const computerBtn = document.getElementById("computerBtn");
const multiplayerBtn = document.getElementById("multiplayerBtn");

const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const closeSettings = document.getElementById("closeSettings");

const backBtn = document.getElementById("backBtn");
const restartBtn = document.getElementById("restartBtn");

const board = document.getElementById("board");
const pathLayer = document.getElementById("pathLayer");

const dice = document.getElementById("dice");
const diceNumber = document.getElementById("diceNumber");

const diceMessage = document.getElementById("diceMessage");
const turnText = document.getElementById("turnText");
const modeText = document.getElementById("modeText");

const rollValue = document.getElementById("rollValue");

const redFinished = document.getElementById("redFinished");
const yellowFinished = document.getElementById("yellowFinished");
const computerFinished = document.getElementById("computerFinished");

const winModal = document.getElementById("winModal");
const winnerTitle = document.getElementById("winnerTitle");
const winnerMessage = document.getElementById("winnerMessage");
const winnerIcon = document.getElementById("winnerIcon");

const playAgainBtn = document.getElementById("playAgainBtn");
const menuBtn = document.getElementById("menuBtn");

const soundToggle = document.getElementById("soundToggle");


/* =========================================
   GAME SETTINGS
========================================= */

let gameMode = "computer";

const HUMAN_COLORS = ["red", "yellow"];
const COMPUTER_COLORS = ["green", "blue"];

const ALL_COLORS = ["red", "green", "blue", "yellow"];

const piecesPerColor = 4;

let currentTurn = "human";

let rolledNumber = null;

let waitingForPiece = false;

let gameOver = false;

let soundEnabled = true;


/* =========================================
   PIECE DATA
=========================================

   position:
   -1 = inside home
    0-51 = common board
   52+ = colored finishing lane
   57 = finished
========================================= */

let pieces = {};


/* =========================================
   BOARD PATH

   52 cells around the outside
========================================= */

const pathCoordinates = [

  /* TOP ROW */
  [6,0],
  [7,0],
  [8,0],
  [9,0],
  [10,0],
  [11,0],
  [12,0],

  [12,1],
  [12,2],
  [13,2],
  [14,2],

  [14,3],
  [14,4],
  [14,5],

  /* RIGHT */
  [13,6],
  [14,6],

  [14,7],

  [14,8],
  [13,8],

  [14,9],
  [14,10],
  [14,11],

  [13,12],
  [12,12],

  [12,13],
  [12,14],

  [11,14],
  [10,14],
  [9,14],
  [8,14],
  [7,14],
  [6,14],

  /* BOTTOM LEFT */
  [6,13],
  [6,12],
  [5,12],
  [4,12],

  [4,13],
  [4,14],

  [3,14],
  [2,14],
  [2,13],

  [2,12],
  [1,12],
  [0,12],

  [0,11],
  [0,10],
  [0,9],

  [1,8],
  [0,8],

  [0,7],

  [0,6],
  [1,6],

  [0,5],
  [0,4],
  [0,3],

  [1,2],
  [2,2],

  [2,1],
  [2,0],

  [3,0],
  [4,0],
  [5,0]

];


/* Keep exactly 52 positions */
const COMMON_PATH = pathCoordinates.slice(0, 52);


/* =========================================
   START POSITIONS
========================================= */

const startIndex = {
  red: 0,
  green: 13,
  blue: 26,
  yellow: 39
};


/* =========================================
   SAFE CELLS
========================================= */

const safeCells = new Set([
  0,
  8,
  13,
  21,
  26,
  34,
  39,
  47
]);


/* =========================================
   FINISH LANES
========================================= */

const finishLanes = {

  red: [
    [6,1],
    [6,2],
    [6,3],
    [6,4],
    [6,5],
    [7,6]
  ],

  green: [
    [13,6],
    [12,6],
    [11,6],
    [10,6],
    [9,6],
    [8,7]
  ],

  blue: [
    [8,13],
    [8,12],
    [8,11],
    [8,10],
    [8,9],
    [7,8]
  ],

  yellow: [
    [1,8],
    [2,8],
    [3,8],
    [4,8],
    [5,8],
    [6,7]
  ]

};


/* =========================================
   HOME PIECE INITIAL POSITIONS
========================================= */

const homePositions = {

  red: [
    [2.0, 2.0],
    [2.0, 5.0],
    [5.0, 2.0],
    [5.0, 5.0]
  ],

  green: [
    [10.0, 2.0],
    [10.0, 5.0],
    [13.0, 2.0],
    [13.0, 5.0]
  ],

  blue: [
    [10.0, 10.0],
    [10.0, 13.0],
    [13.0, 10.0],
    [13.0, 13.0]
  ],

  yellow: [
    [2.0, 10.0],
    [2.0, 13.0],
    [5.0, 10.0],
    [5.0, 13.0]
  ]

};


/* =========================================
   INITIALIZE PIECES
========================================= */

function createPieces() {

  pieces = {};

  ALL_COLORS.forEach(color => {

    pieces[color] = [];

    for (let i = 0; i < piecesPerColor; i++) {

      pieces[color].push({
        id: i,
        position: -1
      });

    }

  });

}


/* =========================================
   CREATE BOARD PATH
========================================= */

function createBoard() {

  pathLayer.innerHTML = "";

  COMMON_PATH.forEach((coord, index) => {

    const cell = document.createElement("div");

    cell.className = "path-cell";

    cell.dataset.index = index;

    const x = coord[0];
    const y = coord[1];

    cell.style.left = `${x * (100 / 15)}%`;
    cell.style.top = `${y * (100 / 15)}%`;

    if (safeCells.has(index)) {
      cell.classList.add("safe");
    }

    /* Start colors */
    if (index === startIndex.red) {
      cell.classList.add("start-red");
    }

    if (index === startIndex.green) {
      cell.classList.add("start-green");
    }

    if (index === startIndex.blue) {
      cell.classList.add("start-blue");
    }

    if (index === startIndex.yellow) {
      cell.classList.add("start-yellow");
    }

    pathLayer.appendChild(cell);

  });


  /* Colored finishing lanes */

  Object.keys(finishLanes).forEach(color => {

    finishLanes[color].forEach((coord, index) => {

      const cell = document.createElement("div");

      cell.className = `path-cell ${color}-lane`;

      cell.style.left = `${coord[0] * (100 / 15)}%`;
      cell.style.top = `${coord[1] * (100 / 15)}%`;

      pathLayer.appendChild(cell);

    });

  });


  /* Center zone */

  const center = document.createElement("div");

  center.className = "center-zone";

  board.appendChild(center);

}


/* =========================================
   COLOR HELPER
========================================= */

function getColorClass(color) {

  return `${color}-piece`;

}


/* =========================================
   BOARD POSITION
========================================= */

function getCommonPosition(color, position) {

  const start = startIndex[color];

  return (start + position) % 52;

}


/* =========================================
   GET PIECE COORDINATES
========================================= */

function getPieceCoordinates(color, piece) {

  const position = piece.position;


  /* HOME */

  if (position === -1) {

    return homePositions[color][piece.id];

  }


  /* FINISHED */

  if (position >= 57) {

    const lane = finishLanes[color][5];

    return [lane[0], lane[1]];

  }


  /* FINISHING LANE */

  if (position >= 52) {

    const laneIndex = position - 52;

    const lane = finishLanes[color][laneIndex];

    return [lane[0], lane[1]];

  }


  /* COMMON BOARD */

  const commonIndex = getCommonPosition(color, position);

  const coord = COMMON_PATH[commonIndex];

  return [coord[0], coord[1]];

}


/* =========================================
   RENDER PIECES
========================================= */

function renderPieces() {

  document.querySelectorAll(".board-piece").forEach(el => el.remove());

  document.querySelectorAll(".home-piece").forEach(el => {
    el.style.display = "";
  });


  ALL_COLORS.forEach(color => {

    pieces[color].forEach(piece => {

      const [x, y] = getPieceCoordinates(color, piece);


      /* Piece still inside home */

      if (piece.position === -1) {

        const homePiece = document.querySelector(
          `.home-piece[data-color="${color}"][data-piece="${piece.id}"]`
        );

        if (homePiece) {
          homePiece.style.display = "block";

          if (
            waitingForPiece &&
            isHumanColor(color) &&
            canMovePiece(color, piece, rolledNumber)
          ) {
            homePiece.classList.add("selectable");
          } else {
            homePiece.classList.remove("selectable");
          }

        }

        return;
      }


      /* Board piece */

      const element = document.createElement("button");

      element.className = `board-piece ${getColorClass(color)}`;

      element.dataset.color = color;
      element.dataset.piece = piece.id;

      element.style.left = `${((x + .5) / 15) * 100}%`;
      element.style.top = `${((y + .5) / 15) * 100}%`;


      if (
        waitingForPiece &&
        isHumanColor(color) &&
        canMovePiece(color, piece, rolledNumber)
      ) {
        element.classList.add("selectable");
      }


      element.addEventListener("click", () => {

        if (gameOver) return;

        if (currentTurn !== "human") return;

        if (!waitingForPiece) return;

        moveSelectedPiece(color, piece.id);

      });


      board.appendChild(element);

    });

  });


  updateStats();

}


/* =========================================
   HUMAN COLOR?
========================================= */

function isHumanColor(color) {

  if (gameMode === "computer") {
    return HUMAN_COLORS.includes(color);
  }

  return true;

}


/* =========================================
   VALID MOVE
========================================= */

function canMovePiece(color, piece, diceValue) {

  if (diceValue === null) {
    return false;
  }


  /* Finished pieces cannot move */

  if (piece.position >= 57) {
    return false;
  }


  /* Home */

  if (piece.position === -1) {

    return diceValue === 6;

  }


  /* Normal movement */

  const newPosition = piece.position + diceValue;

  return newPosition <= 57;

}


/* =========================================
   VALID MOVES
========================================= */

function getValidMoves(colors, diceValue) {

  const moves = [];

  colors.forEach(color => {

    pieces[color].forEach(piece => {

      if (canMovePiece(color, piece, diceValue)) {

        moves.push({
          color,
          id: piece.id
        });

      }

    });

  });

  return moves;

}


/* =========================================
   ROLL DICE
========================================= */

dice.addEventListener("click", rollDice);

async function rollDice() {

  if (gameOver) return;

  if (currentTurn !== "human") return;

  if (waitingForPiece) return;


  playSound("roll");


  dice.classList.remove("rolling");

  void dice.offsetWidth;

  dice.classList.add("rolling");


  /* Dice animation */

  for (let i = 0; i < 7; i++) {

    diceNumber.textContent =
      Math.floor(Math.random() * 6) + 1;

    await wait(70);

  }


  rolledNumber =
    Math.floor(Math.random() * 6) + 1;


  diceNumber.textContent = rolledNumber;

  rollValue.textContent = rolledNumber;

  diceMessage.textContent =
    `You rolled ${rolledNumber}`;


  const validMoves =
    getValidMoves(HUMAN_COLORS, rolledNumber);


  /* No move */

  if (validMoves.length === 0) {

    waitingForPiece = false;

    diceMessage.textContent =
      `You rolled ${rolledNumber}. No move available.`;

    await wait(1000);

    if (rolledNumber === 6) {

      diceMessage.textContent =
        "You rolled a 6, but no piece can move. Roll again.";

      rolledNumber = null;

      rollValue.textContent = "-";

      return;

    }

    endHumanTurn();

    return;

  }


  /* There is a move */

  waitingForPiece = true;

  diceMessage.textContent =
    `You rolled ${rolledNumber}. Choose a piece.`;

  renderPieces();

}


/* =========================================
   MOVE SELECTED PIECE
========================================= */

async function moveSelectedPiece(color, pieceId) {

  if (!waitingForPiece) return;

  const piece = pieces[color][pieceId];

  if (!canMovePiece(color, piece, rolledNumber)) {
    return;
  }


  waitingForPiece = false;

  clearSelectablePieces();


  /* Move piece */

  if (piece.position === -1) {

    piece.position = 0;

  } else {

    piece.position += rolledNumber;

  }


  playSound("move");

  renderPieces();

  await wait(350);


  /* Capture */

  if (piece.position >= 0 && piece.position < 52) {

    captureOpponents(color, piece);

  }


  renderPieces();


  /* Finished */

  if (piece.position >= 57) {

    piece.position = 57;

    playSound("finish");

    renderPieces();

  }


  /* Check winner */

  if (checkHumanWinner()) {

    showWinner("YOU WIN!");

    return;

  }


  /* Six gives another turn */

  if (rolledNumber === 6) {

    diceMessage.textContent =
      "You rolled a 6. Roll again!";

    rolledNumber = null;

    rollValue.textContent = "-";

    return;

  }


  endHumanTurn();

}


/* =========================================
   CAPTURE
========================================= */

function captureOpponents(color, movedPiece) {

  const globalPosition =
    getCommonPosition(color, movedPiece.position);


  if (safeCells.has(globalPosition)) {
    return;
  }


  ALL_COLORS.forEach(enemyColor => {

    if (enemyColor === color) {
      return;
    }


    pieces[enemyColor].forEach(enemyPiece => {

      if (enemyPiece.position < 0) {
        return;
      }

      if (enemyPiece.position >= 52) {
        return;
      }


      const enemyGlobal =
        getCommonPosition(
          enemyColor,
          enemyPiece.position
        );


      if (enemyGlobal === globalPosition) {

        enemyPiece.position = -1;

        playSound("capture");

      }

    });

  });

}


/* =========================================
   CLEAR SELECTION
========================================= */

function clearSelectablePieces() {

  document
    .querySelectorAll(".selectable")
    .forEach(el => {

      el.classList.remove("selectable");

    });

}


/* =========================================
   END HUMAN TURN
========================================= */

async function endHumanTurn() {

  rolledNumber = null;

  rollValue.textContent = "-";

  waitingForPiece = false;

  clearSelectablePieces();

  currentTurn = "computer";

  updateTurnDisplay();

  diceMessage.textContent =
    "Computer is thinking...";

  await wait(900);

  computerTurn();

}


/* =========================================
   COMPUTER TURN
========================================= */

async function computerTurn() {

  if (gameOver) return;


  const value =
    Math.floor(Math.random() * 6) + 1;


  rolledNumber = value;

  diceNumber.textContent = value;

  rollValue.textContent = value;

  diceMessage.textContent =
    `Computer rolled ${value}`;


  playSound("roll");


  const validMoves =
    getValidMoves(COMPUTER_COLORS, value);


  if (validMoves.length === 0) {

    await wait(900);

    if (value === 6) {

      diceMessage.textContent =
        "Computer rolled a 6 and gets another roll.";

      await wait(600);

      computerTurn();

      return;

    }


    currentTurn = "human";

    rolledNumber = null;

    rollValue.textContent = "-";

    updateTurnDisplay();

    diceMessage.textContent =
      "Your turn. Tap the dice.";

    return;

  }


  /* Computer selects a move */

  const selected =
    chooseComputerMove(validMoves, value);


  await wait(900);

  moveComputerPiece(
    selected.color,
    selected.id,
    value
  );

}


/* =========================================
   COMPUTER AI
========================================= */

function chooseComputerMove(validMoves, diceValue) {

  /*
    Priority:
    1. Finish a piece
    2. Capture
    3. Bring piece out on 6
    4. Random
  */


  /* Finish */

  for (const move of validMoves) {

    const piece =
      pieces[move.color][move.id];

    if (
      piece.position >= 0 &&
      piece.position + diceValue >= 57
    ) {

      return move;

    }

  }


  /* Capture */

  for (const move of validMoves) {

    const piece =
      pieces[move.color][move.id];

    let newPosition;


    if (piece.position === -1) {
      newPosition = 0;
    } else {
      newPosition =
        piece.position + diceValue;
    }


    if (newPosition < 52) {

      const globalPosition =
        getCommonPosition(
          move.color,
          newPosition
        );


      if (!safeCells.has(globalPosition)) {

        for (const enemyColor of HUMAN_COLORS) {

          for (
            const enemyPiece
            of pieces[enemyColor]
          ) {

            if (
              enemyPiece.position >= 0 &&
              enemyPiece.position < 52
            ) {

              const enemyPosition =
                getCommonPosition(
                  enemyColor,
                  enemyPiece.position
                );


              if (
                enemyPosition === globalPosition
              ) {

                return move;

              }

            }

          }

        }

      }

    }

  }


  /* Bring piece out */

  if (diceValue === 6) {

    for (const move of validMoves) {

      const piece =
        pieces[move.color][move.id];

      if (piece.position === -1) {
        return move;
      }

    }

  }


  return validMoves[
    Math.floor(
      Math.random() * validMoves.length
    )
  ];

}


/* =========================================
   COMPUTER MOVE
========================================= */

async function moveComputerPiece(
  color,
  pieceId,
  diceValue
) {

  const piece =
    pieces[color][pieceId];


  if (piece.position === -1) {

    piece.position = 0;

  } else {

    piece.position += diceValue;

  }


  playSound("move");

  renderPieces();

  await wait(400);


  if (
    piece.position >= 0 &&
    piece.position < 52
  ) {

    captureOpponents(color, piece);

  }


  if (piece.position >= 57) {

    piece.position = 57;

    playSound("finish");

  }


  renderPieces();


  /* Computer winner */

  if (checkComputerWinner()) {

    showWinner("COMPUTER WINS!");

    return;

  }


  /* Six = another turn */

  if (diceValue === 6) {

    diceMessage.textContent =
      "Computer rolled a 6. Computer rolls again.";

    await wait(700);

    computerTurn();

    return;

  }


  /* Human */

  currentTurn = "human";

  rolledNumber = null;

  rollValue.textContent = "-";

  updateTurnDisplay();

  diceMessage.textContent =
    "Your turn. Tap the center dice.";

}


/* =========================================
   WINNER CHECK
========================================= */

function checkHumanWinner() {

  const finishedRed =
    pieces.red.filter(
      p => p.position >= 57
    ).length;

  const finishedYellow =
    pieces.yellow.filter(
      p => p.position >= 57
    ).length;


  /*
    You own 8 pieces total:
    4 red + 4 yellow.
  */

  return (
    finishedRed === 4 &&
    finishedYellow === 4
  );

}


function checkComputerWinner() {

  const finishedGreen =
    pieces.green.filter(
      p => p.position >= 57
    ).length;

  const finishedBlue =
    pieces.blue.filter(
      p => p.position >= 57
    ).length;


  /*
    Computer owns:
    4 green + 4 blue.
  */

  return (
    finishedGreen === 4 &&
    finishedBlue === 4
  );

}


/* =========================================
   UPDATE STATS
========================================= */

function updateStats() {

  const red =
    pieces.red.filter(
      p => p.position >= 57
    ).length;

  const yellow =
    pieces.yellow.filter(
      p => p.position >= 57
    ).length;

  const green =
    pieces.green.filter(
      p => p.position >= 57
    ).length;

  const blue =
    pieces.blue.filter(
      p => p.position >= 57
    ).length;


  redFinished.textContent =
    `${red}/4`;

  yellowFinished.textContent =
    `${yellow}/4`;

  computerFinished.textContent =
    `${green + blue}/8`;

}


/* =========================================
   TURN DISPLAY
========================================= */

function updateTurnDisplay() {

  if (currentTurn === "human") {

    turnText.textContent =
      "YOUR TURN";

    modeText.textContent =
      "You: Red + Yellow";

  } else {

    turnText.textContent =
      "COMPUTER TURN";

    modeText.textContent =
      "Computer: Green + Blue";

  }

}


/* =========================================
   WIN SCREEN
========================================= */

function showWinner(winner) {

  gameOver = true;

  playSound("win");


  if (winner === "YOU WIN!") {

    winnerIcon.textContent = "🏆";

    winnerTitle.textContent =
      "YOU WIN!";

    winnerMessage.textContent =
      "Red + Yellow defeated Green + Blue.";

  } else {

    winnerIcon.textContent = "🤖";

    winnerTitle.textContent =
      "COMPUTER WINS!";

    winnerMessage.textContent =
      "Green + Blue finished all their pieces.";

  }


  winModal.classList.add("active");

}


/* =========================================
   START COMPUTER GAME
========================================= */

computerBtn.addEventListener("click", () => {

  gameMode = "computer";

  startGame();

});


/* =========================================
   MULTIPLAYER
========================================= */

multiplayerBtn.addEventListener("click", () => {

  gameMode = "multiplayer";

  startGame();

});


/* =========================================
   START GAME
========================================= */

function startGame() {

  menuScreen.classList.remove("active");

  gameScreen.classList.add("active");

  winModal.classList.remove("active");

  gameOver = false;

  currentTurn = "human";

  rolledNumber = null;

  waitingForPiece = false;

  createPieces();

  createBoard();

  updateTurnDisplay();

  renderPieces();

  rollValue.textContent = "-";

  diceNumber.textContent = "1";

  diceMessage.textContent =
    "Your turn. Tap the center dice.";

  if (gameMode === "multiplayer") {

    modeText.textContent =
      "4 Human Players";

  }

}


/* =========================================
   RESTART
========================================= */

restartBtn.addEventListener("click", () => {

  startGame();

});


playAgainBtn.addEventListener("click", () => {

  startGame();

});


/* =========================================
   MAIN MENU
========================================= */

backBtn.addEventListener("click", () => {

  gameScreen.classList.remove("active");

  menuScreen.classList.add("active");

});


menuBtn.addEventListener("click", () => {

  winModal.classList.remove("active");

  gameScreen.classList.remove("active");

  menuScreen.classList.add("active");

});


/* =========================================
   SETTINGS
========================================= */

settingsBtn.addEventListener("click", () => {

  settingsModal.classList.add("active");

});


closeSettings.addEventListener("click", () => {

  settingsModal.classList.remove("active");

});


soundToggle.addEventListener("change", () => {

  soundEnabled = soundToggle.checked;

});


/* =========================================
   SOUND ENGINE
========================================= */

let audioContext = null;


function getAudioContext() {

  if (!audioContext) {

    audioContext =
      new (
        window.AudioContext ||
        window.webkitAudioContext
      )();

  }

  return audioContext;

}


function playSound(type) {

  if (!soundEnabled) return;


  try {

    const ctx = getAudioContext();

    const oscillator =
      ctx.createOscillator();

    const gain =
      ctx.createGain();


    oscillator.connect(gain);

    gain.connect(ctx.destination);


    let frequency = 300;
    let duration = .12;


    if (type === "roll") {

      frequency = 250;
      duration = .08;

    }

    if (type === "move") {

      frequency = 420;
      duration = .1;

    }

    if (type === "capture") {

      frequency = 180;
      duration = .2;

    }

    if (type === "finish") {

      frequency = 650;
      duration = .25;

    }

    if (type === "win") {

      frequency = 850;
      duration = .8;

    }


    oscillator.frequency.value =
      frequency;

    oscillator.type = "sine";


    gain.gain.setValueAtTime(
      .001,
      ctx.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      .2,
      ctx.currentTime + .02
    );

    gain.gain.exponentialRampToValueAtTime(
      .001,
      ctx.currentTime + duration
    );


    oscillator.start();

    oscillator.stop(
      ctx.currentTime + duration
    );

  } catch (error) {

    console.log("Audio unavailable");

  }

}


/* =========================================
   UTILITY
========================================= */

function wait(ms) {

  return new Promise(resolve => {

    setTimeout(resolve, ms);

  });

}


/* =========================================
   HOME PIECE CLICK HANDLERS
========================================= */

document
  .querySelectorAll(".home-piece")
  .forEach(pieceElement => {

    pieceElement.addEventListener(
      "click",
      () => {

        if (!waitingForPiece) return;

        if (currentTurn !== "human") return;


        const color =
          pieceElement.dataset.color;

        const id =
          Number(
            pieceElement.dataset.piece
          );


        moveSelectedPiece(color, id);

      }
    );

  });


/* =========================================
   INITIAL STATE
========================================= */

createPieces();
