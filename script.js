/* =========================================
   NAIJA LUDO
========================================= */


/* =========================================
   ELEMENTS
========================================= */

const menuScreen = document.getElementById("menuScreen");
const gameScreen = document.getElementById("gameScreen");

const computerModeBtn =
  document.getElementById("computerModeBtn");

const multiplayerModeBtn =
  document.getElementById("multiplayerModeBtn");

const settingsBtn =
  document.getElementById("settingsBtn");

const settingsModal =
  document.getElementById("settingsModal");

const closeSettings =
  document.getElementById("closeSettings");

const soundToggle =
  document.getElementById("soundToggle");

const soundBtn =
  document.getElementById("soundBtn");

const menuBtn =
  document.getElementById("menuBtn");

const rollBtn =
  document.getElementById("rollBtn");

const winnerModal =
  document.getElementById("winnerModal");

const winnerText =
  document.getElementById("winnerText");

const playAgainBtn =
  document.getElementById("playAgainBtn");

const backMenuBtn =
  document.getElementById("backMenuBtn");

const handText =
  document.getElementById("handText");

const modeLabel =
  document.getElementById("modeLabel");

const myScore =
  document.getElementById("myScore");

const opponentScore =
  document.getElementById("opponentScore");

const rankElement =
  document.getElementById("rank");

const winsElement =
  document.getElementById("wins");

const redCount =
  document.getElementById("redCount");

const blueCount =
  document.getElementById("blueCount");

const greenCount =
  document.getElementById("greenCount");


/* =========================================
   GAME SETTINGS
========================================= */

let gameMode = "computer";

let soundEnabled = true;

let currentTeam = "human";

let diceValue = 0;

let gameOver = false;

let rolling = false;

let wins = 0;

let rank = 0;


/*
  COMPUTER MODE

  HUMAN:
  RED + YELLOW

  COMPUTER:
  GREEN + BLUE
*/

const teams = {

  human: {
    name: "You",
    colors: ["red", "yellow"]
  },

  computer: {
    name: "Computer",
    colors: ["green", "blue"]
  }

};


/* =========================================
   PLAYER DATA
========================================= */

const colors = {

  red: {
    name: "Red",
    start: 0,
    css: "red-piece"
  },

  yellow: {
    name: "Yellow",
    start: 13,
    css: "yellow-piece"
  },

  green: {
    name: "Green",
    start: 26,
    css: "green-piece"
  },

  blue: {
    name: "Blue",
    start: 39,
    css: "blue-piece"
  }

};


/*
  Each piece:

  position:

  -1 = home
   0-51 = board
   52 = finished
*/

const pieces = {

  red: [-1, -1, -1, -1],

  yellow: [-1, -1, -1, -1],

  green: [-1, -1, -1, -1],

  blue: [-1, -1, -1, -1]

};


/* =========================================
   SAFE POSITIONS
========================================= */

const safePositions = [
  0,
  8,
  13,
  21,
  26,
  34,
  39,
  47
];


/* =========================================
   BOARD PATH
========================================= */

const boardPath = [

  [48, 48],
  [48, 41],
  [48, 34],
  [48, 27],
  [48, 20],
  [41, 20],
  [34, 20],
  [27, 20],
  [20, 20],
  [20, 27],
  [20, 34],
  [20, 41],
  [20, 48],

  [27, 48],
  [34, 48],
  [41, 48],

  [48, 55],
  [55, 55],
  [62, 55],
  [69, 55],
  [76, 55],
  [76, 48],
  [76, 41],
  [76, 34],
  [76, 27],
  [76, 20],
  [69, 20],
  [62, 20],
  [55, 20],

  [55, 13],
  [55, 6],
  [48, 6],
  [41, 6],
  [34, 6],
  [27, 6],
  [20, 6],
  [20, 13],
  [20, 20],

  [13, 20],
  [6, 20],
  [6, 27],
  [6, 34],
  [6, 41],
  [13, 41],
  [20, 41],
  [27, 41],
  [34, 41],
  [41, 41],
  [48, 41]

];


/*
  Because the visual board is made with CSS,
  the game also maintains an internal
  circular path.
*/

const pathCoordinates = [];

for (let i = 0; i < 52; i++) {

  const angle =
    (Math.PI * 2 / 52) * i;

  pathCoordinates.push({
    x: 50 + Math.cos(angle) * 36,
    y: 50 + Math.sin(angle) * 36
  });

}


/* =========================================
   START GAME
========================================= */

computerModeBtn.addEventListener(
  "click",
  () => {

    gameMode = "computer";

    startGame();

  }
);


multiplayerModeBtn.addEventListener(
  "click",
  () => {

    gameMode = "multiplayer";

    startGame();

  }
);


function startGame() {

  menuScreen.classList.add("hidden");

  gameScreen.classList.remove("hidden");

  resetGame();

  if (gameMode === "computer") {

    modeLabel.textContent =
      "You: Red + Yellow  |  Computer: Green + Blue";

  } else {

    modeLabel.textContent =
      "Multiplayer • Friends & Family";

  }

}


/* =========================================
   RESET
========================================= */

function resetGame() {

  pieces.red =
    [-1, -1, -1, -1];

  pieces.yellow =
    [-1, -1, -1, -1];

  pieces.green =
    [-1, -1, -1, -1];

  pieces.blue =
    [-1, -1, -1, -1];

  currentTeam = "human";

  diceValue = 0;

  gameOver = false;

  rolling = false;

  winnerModal.classList.add("hidden");

  rollBtn.disabled = false;

  updateUI();

}


/* =========================================
   ROLL DICE
========================================= */

rollBtn.addEventListener(
  "click",
  rollDice
);


async function rollDice() {

  if (rolling || gameOver) {
    return;
  }

  rolling = true;

  rollBtn.disabled = true;

  playDiceSound();

  const animationTime = 650;

  const startTime = Date.now();

  while (
    Date.now() - startTime <
    animationTime
  ) {

    const fake =
      Math.floor(Math.random() * 6) + 1;

    showDice(fake);

    await wait(80);

  }

  diceValue =
    Math.floor(Math.random() * 6) + 1;

  showDice(diceValue);

  updateCounter();

  const available =
    getAvailableMoves(currentTeam, diceValue);

  if (available.length === 0) {

    await wait(700);

    finishTurn();

    return;

  }

  highlightAvailablePieces(available);

  if (
    gameMode === "computer" &&
    currentTeam === "computer"
  ) {

    await wait(800);

    computerMove(available);

  } else {

    rolling = false;

    rollBtn.disabled = true;

  }

}


/* =========================================
   SHOW DICE
========================================= */

function showDice(value) {

  const dice1 =
    document.getElementById("dice1");

  const dice2 =
    document.getElementById("dice2");

  dice1.innerHTML =
    `<span>${diceSymbol(value)}</span>`;

  dice2.innerHTML =
    `<span>${diceSymbol(value)}</span>`;

}


function diceSymbol(value) {

  const symbols = {

    1: "●",

    2: "••",

    3: "•••",

    4: "••••",

    5: "•••••",

    6: "••••••"

  };

  return symbols[value];

}


/* =========================================
   AVAILABLE MOVES
========================================= */

function getAvailableMoves(
  team,
  dice
) {

  const available = [];

  const teamColors =
    gameMode === "computer"
      ? teams[team].colors
      : getMultiplayerColors(team);

  teamColors.forEach(color => {

    pieces[color].forEach(
      (position, index) => {

        if (
          canMove(
            color,
            index,
            dice
          )
        ) {

          available.push({
            color,
            index
          });

        }

      }
    );

  });

  return available;

}


/* =========================================
   MULTIPLAYER COLORS
========================================= */

function getMultiplayerColors(team) {

  if (team === "human") {

    return ["red"];

  }

  if (team === "yellow") {

    return ["yellow"];

  }

  if (team === "green") {

    return ["green"];

  }

  return ["blue"];

}


/* =========================================
   CAN MOVE
========================================= */

function canMove(
  color,
  index,
  dice
) {

  const position =
    pieces[color][index];

  if (position === 52) {
    return false;
  }

  if (position === -1) {

    return dice === 6;

  }

  return position + dice <= 52;

}


/* =========================================
   HIGHLIGHT
========================================= */

function highlightAvailablePieces(
  available
) {

  clearHighlights();

  available.forEach(move => {

    const selector =
      `[data-color="${move.color}"][data-piece="${move.index}"]`;

    const element =
      document.querySelector(selector);

    if (element) {

      element.classList.add(
        "active-piece"
      );

      element.onclick =
        () => {

          if (rolling) return;

          makeMove(
            move.color,
            move.index
          );

        };

    }

  });

}


function clearHighlights() {

  document
    .querySelectorAll(".active-piece")
    .forEach(element => {

      element.classList.remove(
        "active-piece"
      );

      element.onclick = null;

    });

}


/* =========================================
   MAKE MOVE
========================================= */

async function makeMove(
  color,
  index
) {

  if (
    gameOver ||
    diceValue === 0
  ) {

    return;

  }

  const oldPosition =
    pieces[color][index];

  clearHighlights();

  rolling = true;

  /*
    Leaving home
  */

  if (oldPosition === -1) {

    if (diceValue === 6) {

      pieces[color][index] = 0;

    }

  } else {

    pieces[color][index] =
      oldPosition + diceValue;

  }


  playMoveSound();

  updateUI();

  await wait(450);

  /*
    Capture
  */

  captureOpponents(
    color,
    index
  );

  updateUI();

  /*
    Winner?
  */

  if (checkWinner(currentTeam)) {

    finishGame(
      currentTeam
    );

    return;

  }


  /*
    Six gives another turn
  */

  if (diceValue === 6) {

    diceValue = 0;

    rolling = false;

    rollBtn.disabled = false;

    handText.textContent =
      getTeamName(currentTeam) +
      " — Roll again";

    return;

  }


  finishTurn();

}


/* =========================================
   CAPTURE
========================================= */

function captureOpponents(
  color,
  index
) {

  const position =
    pieces[color][index];

  if (
    position < 0 ||
    position > 51
  ) {

    return;

  }

  if (
    safePositions.includes(position)
  ) {

    return;

  }


  Object.keys(pieces).forEach(
    opponentColor => {

      if (
        opponentColor === color
      ) {
        return;
      }

      pieces[opponentColor]
        .forEach(
          (enemyPosition, enemyIndex) => {

            if (
              enemyPosition === position
            ) {

              pieces[
                opponentColor
              ][enemyIndex] = -1;

              playCaptureSound();

            }

          }
        );

    }
  );

}


/* =========================================
   TURN
========================================= */

function finishTurn() {

  clearHighlights();

  diceValue = 0;

  rolling = false;

  if (gameMode === "computer") {

    currentTeam =
      currentTeam === "human"
        ? "computer"
        : "human";

  } else {

    const order =
      [
        "human",
        "yellow",
        "green",
        "blue"
      ];

    const currentIndex =
      order.indexOf(currentTeam);

    currentTeam =
      order[
        (currentIndex + 1) %
        order.length
      ];

  }


  updateUI();

  rollBtn.disabled =
    gameMode === "computer" &&
    currentTeam === "computer";

  if (
    gameMode === "computer" &&
    currentTeam === "computer"
  ) {

    computerTurn();

  }

}


/* =========================================
   COMPUTER
========================================= */

async function computerTurn() {

  await wait(900);

  if (gameOver) return;

  rollDice();

}


async function computerMove(
  available
) {

  if (
    !available ||
    available.length === 0
  ) {

    finishTurn();

    return;

  }


  /*
    Prefer a capture.
  */

  let selected =
    available[
      Math.floor(
        Math.random() *
        available.length
      )
    ];


  /*
    Prefer piece already on board.
  */

  const boardPieces =
    available.filter(
      move =>
        pieces[
          move.color
        ][move.index] >= 0
    );

  if (boardPieces.length) {

    selected =
      boardPieces[
        Math.floor(
          Math.random() *
          boardPieces.length
        )
      ];

  }


  await wait(600);

  makeMove(
    selected.color,
    selected.index
  );

}


/* =========================================
   WINNER
========================================= */

function checkWinner(team) {

  const teamColors =
    gameMode === "computer"
      ? teams[team].colors
      : getMultiplayerColors(team);

  let completed = 0;

  teamColors.forEach(color => {

    pieces[color].forEach(position => {

      if (position === 52) {

        completed++;

      }

    });

  });

  /*
    In computer mode a team has 8 pieces.
    Multiplayer has 4 pieces.
  */

  const target =
    gameMode === "computer"
      ? 8
      : 4;

  return completed === target;

}


function finishGame(team) {

  gameOver = true;

  clearHighlights();

  playWinSound();

  if (team === "human") {

    wins++;

    rank++;

    winnerText.textContent =
      "You Win! 🏆";

  } else {

    winnerText.textContent =
      getTeamName(team) +
      " Wins!";

  }

  updateStats();

  setTimeout(() => {

    winnerModal.classList.remove(
      "hidden"
    );

  }, 400);

}


/* =========================================
   UI
========================================= */

function updateUI() {

  updatePieces();

  updateStats();

  if (gameMode === "computer") {

    if (currentTeam === "human") {

      handText.textContent =
        "☝ Your Turn";

    } else {

      handText.textContent =
        "🤖 Computer's Turn";

    }

  } else {

    handText.textContent =
      getTeamName(currentTeam) +
      "'s Turn";

  }

}


function updateStats() {

  rankElement.textContent =
    rank;

  winsElement.textContent =
    wins;

  const myFinished =
    countFinished(
      teams.human.colors
    );

  const opponentFinished =
    countFinished(
      teams.computer.colors
    );

  myScore.textContent =
    `Me: ${myFinished}`;

  opponentScore.textContent =
    `Opponent: ${opponentFinished}`;

}


function countFinished(
  colorList
) {

  let count = 0;

  colorList.forEach(color => {

    pieces[color].forEach(position => {

      if (position === 52) {

        count++;

      }

    });

  });

  return count;

}


function getTeamName(team) {

  if (team === "human") {

    return "You";

  }

  if (team === "computer") {

    return "Computer";

  }

  if (team === "yellow") {

    return "Player 2";

  }

  if (team === "green") {

    return "Player 3";

  }

  if (team === "blue") {

    return "Player 4";

  }

}


/* =========================================
   PIECE DISPLAY
========================================= */

function updatePieces() {

  Object.keys(pieces).forEach(color => {

    pieces[color].forEach(
      (position, index) => {

        const element =
          document.querySelector(
            `[data-color="${color}"][data-piece="${index}"]`
          );

        if (!element) return;

        /*
          Home
        */

        if (position === -1) {

          element.style.display =
            "block";

          return;

        }

        /*
          Finished
        */

        if (position === 52) {

          element.style.display =
            "none";

          return;

        }

        /*
          Board position.
          For the prototype we place the
          piece around a circular board path.
        */

        const point =
          pathCoordinates[
            position % 52
          ];

        element.style.position =
          "absolute";

        element.style.left =
          point.x + "%";

        element.style.top =
          point.y + "%";

        element.style.transform =
          "translate(-50%, -50%)";

        element.style.width =
          "6%";

        element.style.height =
          "6%";

        element.style.zIndex =
          "50";

        element.style.display =
          "block";

      }
    );

  });

}


/* =========================================
   COUNTERS
========================================= */

function updateCounter() {

  if (diceValue === 0) return;

  if (
    currentTeam === "human"
  ) {

    redCount.textContent =
      diceValue;

  }

  if (
    currentTeam === "computer"
  ) {

    greenCount.textContent =
      diceValue;

  }

}


/* =========================================
   MENU
========================================= */

menuBtn.addEventListener(
  "click",
  () => {

    gameScreen.classList.add(
      "hidden"
    );

    menuScreen.classList.remove(
      "hidden"
    );

    winnerModal.classList.add(
      "hidden"
    );

  }
);


/* =========================================
   PLAY AGAIN
========================================= */

playAgainBtn.addEventListener(
  "click",
  () => {

    winnerModal.classList.add(
      "hidden"
    );

    resetGame();

  }
);


backMenuBtn.addEventListener(
  "click",
  () => {

    winnerModal.classList.add(
      "hidden"
    );

    gameScreen.classList.add(
      "hidden"
    );

    menuScreen.classList.remove(
      "hidden"
    );

  }
);


/* =========================================
   SETTINGS
========================================= */

settingsBtn.addEventListener(
  "click",
  () => {

    settingsModal.classList.remove(
      "hidden"
    );

  }
);


closeSettings.addEventListener(
  "click",
  () => {

    settingsModal.classList.add(
      "hidden"
    );

  }
);


/* =========================================
   SOUND
========================================= */

soundToggle.addEventListener(
  "change",
  () => {

    soundEnabled =
      soundToggle.checked;

    soundBtn.textContent =
      soundEnabled
        ? "🔊"
        : "🔇";

  }
);


soundBtn.addEventListener(
  "click",
  () => {

    soundEnabled =
      !soundEnabled;

    soundToggle.checked =
      soundEnabled;

    soundBtn.textContent =
      soundEnabled
        ? "🔊"
        : "🔇";

  }
);


/* =========================================
   AUDIO ENGINE
========================================= */

let audioContext = null;

function getAudio() {

  if (!audioContext) {

    audioContext =
      new (
        window.AudioContext ||
        window.webkitAudioContext
      )();

  }

  return audioContext;

}


function tone(
  frequency,
  duration,
  type = "sine",
  volume = .08
) {

  if (!soundEnabled) return;

  const audio =
    getAudio();

  const oscillator =
    audio.createOscillator();

  const gain =
    audio.createGain();

  oscillator.type =
    type;

  oscillator.frequency.value =
    frequency;

  gain.gain.value =
    volume;

  oscillator.connect(gain);

  gain.connect(
    audio.destination
  );

  oscillator.start();

  gain.gain.exponentialRampToValueAtTime(
    .001,
    audio.currentTime + duration
  );

  oscillator.stop(
    audio.currentTime + duration
  );

}


function playDiceSound() {

  tone(
    300,
    .08,
    "square",
    .05
  );

  setTimeout(
    () => tone(
      430,
      .08,
      "square",
      .05
    ),
    90
  );

  setTimeout(
    () => tone(
      580,
      .1,
      "square",
      .05
    ),
    180
  );

}


function playMoveSound() {

  tone(
    650,
    .08,
    "triangle",
    .06
  );

}


function playCaptureSound() {

  tone(
    180,
    .18,
    "sawtooth",
    .08
  );

}


function playWinSound() {

  if (!soundEnabled) return;

  const notes = [
    523,
    659,
    784,
    1046
  ];

  notes.forEach(
    (note, index) => {

      setTimeout(
        () => tone(
          note,
          .25,
          "triangle",
          .1
        ),
        index * 180
      );

    }
  );

  /*
    Clap-like sounds
  */

  setTimeout(
    () => tone(
      150,
      .08,
      "square",
      .12
    ),
    800
  );

  setTimeout(
    () => tone(
      150,
      .08,
      "square",
      .12
    ),
    950
  );

}


/* =========================================
   BACKGROUND BEAT
========================================= */

let beatTimer = null;

function startBeat() {

  if (!soundEnabled) return;

  if (beatTimer) return;

  beatTimer =
    setInterval(() => {

      tone(
        90,
        .06,
        "sine",
        .025
      );

    }, 850);

}


/* =========================================
   HELPERS
========================================= */

function wait(ms) {

  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        ms
      )
  );

}


/* =========================================
   START
========================================= */

updateUI();
