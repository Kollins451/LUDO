/* =========================================
   LUDO ROYALE
   GAME JAVASCRIPT
========================================= */

const players = [
  {
    name: "RED PLAYER",
    color: "red",
    pieces: [0, 0, 0, 0],
    finished: 0
  },
  {
    name: "BLUE PLAYER",
    color: "blue",
    pieces: [0, 0, 0, 0],
    finished: 0
  },
  {
    name: "GREEN PLAYER",
    color: "green",
    pieces: [0, 0, 0, 0],
    finished: 0
  },
  {
    name: "YELLOW PLAYER",
    color: "yellow",
    pieces: [0, 0, 0, 0],
    finished: 0
  }
];

let currentPlayer = 0;
let diceValue = 1;
let waitingForPiece = false;
let gameOver = false;
let soundEnabled = true;

/* =========================================
   DOM ELEMENTS
========================================= */

const dice = document.getElementById("dice");
const rollButton = document.getElementById("rollButton");
const message = document.getElementById("message");
const playerName = document.getElementById("playerName");
const turnDot = document.getElementById("turnDot");
const soundToggle = document.getElementById("soundToggle");
const newGameButton = document.getElementById("newGameButton");
const winnerModal = document.getElementById("winnerModal");
const winnerTitle = document.getElementById("winnerTitle");
const playAgainButton = document.getElementById("playAgainButton");

const diceFaces = [
  "⚀",
  "⚁",
  "⚂",
  "⚃",
  "⚄",
  "⚅"
];

/* =========================================
   AUDIO SYSTEM
   Browser-generated sounds
========================================= */

let audioContext = null;
let musicTimer = null;
let musicPlaying = false;

function createAudioContext() {

  if (!audioContext) {
    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if (AudioContext) {
      audioContext = new AudioContext();
    }
  }

  if (
    audioContext &&
    audioContext.state === "suspended"
  ) {
    audioContext.resume();
  }

  return audioContext;
}


/* Basic sound */

function playTone(
  frequency,
  duration = 0.15,
  type = "sine",
  volume = 0.08
) {

  if (!soundEnabled) return;

  const ctx = createAudioContext();

  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;

  gain.gain.setValueAtTime(
    volume,
    ctx.currentTime
  );

  gain.gain.exponentialRampToValueAtTime(
    0.001,
    ctx.currentTime + duration
  );

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start();

  oscillator.stop(
    ctx.currentTime + duration
  );
}


/* Dice sound */

function diceSound() {

  playTone(220, 0.08, "square", 0.05);

  setTimeout(() => {
    playTone(330, 0.08, "square", 0.05);
  }, 80);

  setTimeout(() => {
    playTone(440, 0.12, "square", 0.05);
  }, 160);
}


/* Piece movement */

function moveSound() {

  playTone(
    500,
    0.08,
    "triangle",
    0.06
  );
}


/* Capture sound */

function captureSound() {

  playTone(
    120,
    0.15,
    "sawtooth",
    0.08
  );

  setTimeout(() => {
    playTone(
      70,
      0.2,
      "sawtooth",
      0.05
    );
  }, 100);
}


/* Winner celebration */

function winnerSound() {

  if (!soundEnabled) return;

  const notes = [
    523,
    659,
    784,
    1047,
    1319
  ];

  notes.forEach((note, index) => {

    setTimeout(() => {

      playTone(
        note,
        0.25,
        "triangle",
        0.12
      );

    }, index * 180);

  });

  /* Clap-like sounds */

  for (let i = 0; i < 8; i++) {

    setTimeout(() => {

      playTone(
        90 + Math.random() * 40,
        0.06,
        "square",
        0.12
      );

    }, 1000 + i * 140);
  }
}


/* =========================================
   BACKGROUND BEAT
========================================= */

function startMusic() {

  if (!soundEnabled || musicPlaying) return;

  createAudioContext();

  musicPlaying = true;

  const beat = [
    261.63,
    329.63,
    392.00,
    329.63
  ];

  let index = 0;

  musicTimer = setInterval(() => {

    if (!soundEnabled) return;

    playTone(
      beat[index],
      0.18,
      "sine",
      0.025
    );

    index++;

    if (index >= beat.length) {
      index = 0;
    }

  }, 450);
}


function stopMusic() {

  if (musicTimer) {
    clearInterval(musicTimer);
    musicTimer = null;
  }

  musicPlaying = false;
}


/* =========================================
   SOUND BUTTON
========================================= */

soundToggle.addEventListener(
  "click",
  () => {

    soundEnabled = !soundEnabled;

    if (soundEnabled) {

      soundToggle.textContent =
        "🔊 Sound ON";

      createAudioContext();

      startMusic();

      playTone(
        600,
        0.1,
        "triangle",
        0.07
      );

    } else {

      soundToggle.textContent =
        "🔇 Sound OFF";

      stopMusic();
    }

  }
);


/* =========================================
   UPDATE TURN
========================================= */

function updateTurn() {

  const player =
    players[currentPlayer];

  playerName.textContent =
    player.name;

  turnDot.className =
    `turn-dot ${player.color}`;

}


/* =========================================
   ROLL DICE
========================================= */

rollButton.addEventListener(
  "click",
  rollDice
);

function rollDice() {

  if (gameOver || waitingForPiece) {
    return;
  }

  createAudioContext();

  startMusic();

  rollButton.disabled = true;

  dice.classList.add("rolling");

  diceSound();

  let animationCount = 0;

  const animation = setInterval(() => {

    const temporary =
      Math.floor(Math.random() * 6);

    dice.textContent =
      diceFaces[temporary];

    animationCount++;

    if (animationCount >= 8) {

      clearInterval(animation);

      diceValue =
        Math.floor(Math.random() * 6) + 1;

      dice.textContent =
        diceFaces[diceValue - 1];

      dice.classList.remove(
        "rolling"
      );

      handleDiceResult();

    }

  }, 80);

}


/* =========================================
   HANDLE DICE
========================================= */

function handleDiceResult() {

  const player =
    players[currentPlayer];

  message.textContent =
    `${player.name} rolled ${diceValue}.`;

  if (diceValue === 6) {

    message.textContent +=
      " Choose a piece to move.";

  } else {

    message.textContent +=
      " Choose a piece.";
  }

  highlightPieces();

  waitingForPiece = true;

}


/* =========================================
   HIGHLIGHT PIECES
========================================= */

function highlightPieces() {

  clearHighlights();

  const player =
    players[currentPlayer];

  const pieces =
    document.querySelectorAll(
      `.piece[data-player="${player.color}"]`
    );

  pieces.forEach((piece, index) => {

    if (
      player.pieces[index] < 57 &&
      canMovePiece(index)
    ) {

      piece.classList.add(
        "movable"
      );

      piece.addEventListener(
        "click",
        pieceClickHandler
      );

    }

  });

}


/* =========================================
   CAN MOVE
========================================= */

function canMovePiece(index) {

  const position =
    players[currentPlayer].pieces[index];

  if (position === 57) {
    return false;
  }

  if (position === 0) {
    return diceValue === 6;
  }

  return position + diceValue <= 57;
}


/* =========================================
   PIECE CLICK
========================================= */

function pieceClickHandler(event) {

  const piece =
    event.currentTarget;

  const playerColor =
    piece.dataset.player;

  const pieceIndex =
    Number(piece.dataset.piece);

  const playerIndex =
    players.findIndex(
      player =>
        player.color === playerColor
    );

  if (
    playerIndex !== currentPlayer
  ) {
    return;
  }

  movePiece(pieceIndex);
}


/* =========================================
   MOVE PIECE
========================================= */

function movePiece(index) {

  const player =
    players[currentPlayer];

  const oldPosition =
    player.pieces[index];

  let newPosition;

  if (oldPosition === 0) {

    newPosition = 1;

  } else {

    newPosition =
      oldPosition + diceValue;
  }

  player.pieces[index] =
    newPosition;

  moveSound();

  clearHighlights();

  waitingForPiece = false;

  message.textContent =
    `${player.name} moved piece ${index + 1}.`;

  /* Check capture */

  checkCapture(
    currentPlayer,
    index
  );

  /* Check finish */

  if (newPosition >= 57) {

    player.pieces[index] = 57;

    player.finished++;

    message.textContent =
      `${player.name} got a piece home! 🏠`;

    playTone(
      700,
      0.2,
      "triangle",
      0.08
    );
  }

  /* Check winner */

  if (player.finished >= 4) {

    finishGame();

    return;
  }

  updateBoard();

  /* Six = another turn */

  if (diceValue === 6) {

    message.textContent =
      `${player.name} rolled a 6! Roll again.`;

    rollButton.disabled = false;

  } else {

    nextPlayer();

  }

}


/* =========================================
   CAPTURE
========================================= */

function checkCapture(
  playerIndex,
  pieceIndex
) {

  const player =
    players[playerIndex];

  const position =
    player.pieces[pieceIndex];

  if (
    position <= 0 ||
    position >= 57
  ) {
    return;
  }

  for (
    let i = 0;
    i < players.length;
    i++
  ) {

    if (i === playerIndex) {
      continue;
    }

    const opponent =
      players[i];

    for (
      let j = 0;
      j < opponent.pieces.length;
      j++
    ) {

      const opponentPosition =
        opponent.pieces[j];

      if (
        opponentPosition === position &&
        opponentPosition > 0 &&
        opponentPosition < 57
      ) {

        opponent.pieces[j] = 0;

        captureSound();

        message.textContent =
          `${player.name} captured ${opponent.name}! 💥`;

      }

    }

  }

}


/* =========================================
   NEXT PLAYER
========================================= */

function nextPlayer() {

  currentPlayer++;

  if (
    currentPlayer >= players.length
  ) {
    currentPlayer = 0;
  }

  diceValue = 1;

  dice.textContent =
    diceFaces[0];

  updateTurn();

  message.textContent =
    `${players[currentPlayer].name}'s turn. Roll the dice.`;

  rollButton.disabled = false;

  waitingForPiece = false;

}


/* =========================================
   CLEAR HIGHLIGHTS
========================================= */

function clearHighlights() {

  document
    .querySelectorAll(".piece")
    .forEach(piece => {

      piece.classList.remove(
        "movable"
      );

      piece.removeEventListener(
        "click",
        pieceClickHandler
      );

    });

}


/* =========================================
   UPDATE BOARD
========================================= */

function updateBoard() {

  /*
    This first version keeps pieces
    visually inside their player areas.
    The game state and movement system
    are already working.
  */

  const allPieces =
    document.querySelectorAll(".piece");

  allPieces.forEach(piece => {

    piece.classList.remove(
      "finished-piece"
    );

  });

  players.forEach(player => {

    player.pieces.forEach(
      (position, index) => {

        if (position >= 57) {

          const piece =
            document.querySelector(
              `.piece[data-player="${player.color}"][data-piece="${index}"]`
            );

          if (piece) {

            piece.classList.add(
              "finished-piece"
            );

          }

        }

      }
    );

  });

}


/* =========================================
   WINNER
========================================= */

function finishGame() {

  const winner =
    players[currentPlayer];

  gameOver = true;

  rollButton.disabled = true;

  winnerTitle.textContent =
    `${winner.name} WINS! 🏆`;

  winnerModal.classList.remove(
    "hidden"
  );

  winnerSound();

  stopMusic();

}


/* =========================================
   NEW GAME
========================================= */

function resetGame() {

  players.forEach(player => {

    player.pieces =
      [0, 0, 0, 0];

    player.finished = 0;

  });

  currentPlayer = 0;

  diceValue = 1;

  waitingForPiece = false;

  gameOver = false;

  dice.textContent =
    diceFaces[0];

  message.textContent =
    "Roll the dice to begin!";

  rollButton.disabled = false;

  winnerModal.classList.add(
    "hidden"
  );

  clearHighlights();

  updateTurn();

  updateBoard();

  if (soundEnabled) {
    startMusic();
  }

}


newGameButton.addEventListener(
  "click",
  resetGame
);

playAgainButton.addEventListener(
  "click",
  resetGame
);


/* =========================================
   START GAME
========================================= */

updateTurn();
updateBoard();
