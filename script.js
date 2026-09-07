/* =====================================================
   CLASSIC LUDO GAME
   JAVASCRIPT
===================================================== */


/* =====================================================
   CONFIGURATION
===================================================== */

const COLORS = ["red", "green", "yellow", "blue"];

const PLAYER_NAMES = {
  red: "You",
  green: "Computer",
  yellow: "Yellow",
  blue: "Blue"
};


/*
   Standard 52-square outer Ludo path.

   Coordinates are based on a 15 x 15 board.
*/

const PATH = [

  [6,14],
  [7,14],
  [8,14],
  [9,14],
  [10,14],
  [11,14],

  [12,13],
  [12,12],
  [12,11],
  [12,10],
  [12,9],

  [13,8],
  [14,8],
  [13,7],
  [12,7],
  [11,7],
  [10,7],
  [9,7],

  [8,6],
  [8,5],
  [8,4],
  [8,3],
  [8,2],
  [8,1],
  [8,0],

  [7,0],
  [6,0],
  [6,1],
  [6,2],
  [6,3],
  [6,4],
  [6,5],

  [5,6],
  [4,6],
  [3,6],
  [2,6],
  [1,6],
  [0,6],

  [0,7],
  [1,7],
  [2,7],
  [3,7],
  [4,7],
  [5,7],

  [6,8],
  [6,9],
  [6,10],
  [6,11],
  [6,12],
  [6,13]

];


/*
   Each player starts at a different point.
*/

const START_INDEX = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39
};


/*
   Safe/star squares.
*/

const SAFE_SQUARES = [
  0,
  8,
  13,
  21,
  26,
  34,
  39,
  47
];


/*
   Home lane coordinates.

   Six positions:
   1-6
*/

const HOME_LANES = {

  red: [
    [7,13],
    [7,12],
    [7,11],
    [7,10],
    [7,9],
    [7,8]
  ],

  green: [
    [8,7],
    [9,7],
    [10,7],
    [11,7],
    [12,7],
    [13,7]
  ],

  yellow: [
    [7,1],
    [7,2],
    [7,3],
    [7,4],
    [7,5],
    [7,6]
  ],

  blue: [
    [1,7],
    [2,7],
    [3,7],
    [4,7],
    [5,7],
    [6,7]
  ]

};


/*
   Four home-piece positions.
*/

const HOME_POSITIONS = {

  red: [
    [2.3,2.3],
    [3.7,2.3],
    [2.3,3.7],
    [3.7,3.7]
  ],

  green: [
    [11.3,2.3],
    [12.7,2.3],
    [11.3,3.7],
    [12.7,3.7]
  ],

  yellow: [
    [2.3,11.3],
    [3.7,11.3],
    [2.3,12.7],
    [3.7,12.7]
  ],

  blue: [
    [11.3,11.3],
    [12.7,11.3],
    [11.3,12.7],
    [12.7,12.7]
  ]

};


/* =====================================================
   GAME STATE
===================================================== */

let mode = "computer";

let currentPlayer = "red";

let diceValue = 0;

let hasRolled = false;

let gameFinished = false;

let soundEnabled = true;

let computerTimeout = null;


/*
   Piece position:

   -1 = inside home
    0 = start
    1...51 = outer track
   52...57 = home lane
   57 = finished
*/

const players = {};


/* =====================================================
   CREATE PLAYERS
===================================================== */

function createPlayers() {

  players.red = {
    color: "red",
    name: "You",
    human: true,
    pieces: createPieces()
  };

  players.green = {
    color: "green",
    name: "Computer",
    human: false,
    pieces: createPieces()
  };

  players.yellow = {
    color: "yellow",
    name: "Yellow",
    human: false,
    pieces: createPieces()
  };

  players.blue = {
    color: "blue",
    name: "Blue",
    human: false,
    pieces: createPieces()
  };

}


function createPieces() {

  return [
    {
      position: -1,
      finished: false
    },
    {
      position: -1,
      finished: false
    },
    {
      position: -1,
      finished: false
    },
    {
      position: -1,
      finished: false
    }
  ];

}


/* =====================================================
   DOM
===================================================== */

const menuScreen =
  document.getElementById("menuScreen");

const gameScreen =
  document.getElementById("gameScreen");

const board =
  document.getElementById("board");

const computerBtn =
  document.getElementById("computerBtn");

const multiplayerBtn =
  document.getElementById("multiplayerBtn");

const backBtn =
  document.getElementById("backBtn");

const soundBtn =
  document.getElementById("soundBtn");

const rollButton =
  document.getElementById("rollButton");

const diceButton =
  document.getElementById("diceButton");

const diceNumber =
  document.getElementById("diceNumber");

const diceValueTop =
  document.getElementById("diceValueTop");

const turnName =
  document.getElementById("turnName");

const turnStatus =
  document.getElementById("turnStatus");

const turnDot =
  document.getElementById("turnDot");

const modeLabel =
  document.getElementById("modeLabel");

const handPieces =
  document.querySelectorAll(".hand-piece");

const homeCount =
  document.getElementById("homeCount");

const winModal =
  document.getElementById("winModal");

const winnerTitle =
  document.getElementById("winnerTitle");

const winnerText =
  document.getElementById("winnerText");

const rulesModal =
  document.getElementById("rulesModal");


/* =====================================================
   BOARD CREATION
===================================================== */

function buildBoard() {

  /*
     Remove existing cells.
  */

  board
    .querySelectorAll(".cell")
    .forEach(cell => cell.remove());


  /*
     Create 225 cells.
  */

  for (let row = 0; row < 15; row++) {

    for (let col = 0; col < 15; col++) {

      const cell =
        document.createElement("div");

      cell.className = "cell";

      cell.dataset.row = row;
      cell.dataset.col = col;

      applyCellDesign(
        cell,
        row,
        col
      );

      board.insertBefore(
        cell,
        board.querySelector(".center-dice-area")
      );

    }

  }

}


/* =====================================================
   CELL DESIGN
===================================================== */

function applyCellDesign(
  cell,
  row,
  col
) {

  /*
     Four 6x6 home areas.
  */

  if (
    row < 6 &&
    col < 6
  ) {

    cell.classList.add(
      "red-home"
    );

    /*
       Inner home.
    */

    if (
      row >= 1 &&
      row <= 4 &&
      col >= 1 &&
      col <= 4
    ) {

      cell.classList.add(
        "home-inner-red"
      );

    }

  }


  if (
    row < 6 &&
    col >= 9
  ) {

    cell.classList.add(
      "green-home"
    );

    if (
      row >= 1 &&
      row <= 4 &&
      col >= 10 &&
      col <= 13
    ) {

      cell.classList.add(
        "home-inner-green"
      );

    }

  }


  if (
    row >= 9 &&
    col < 6
  ) {

    cell.classList.add(
      "yellow-home"
    );

    if (
      row >= 10 &&
      row <= 13 &&
      col >= 1 &&
      col <= 4
    ) {

      cell.classList.add(
        "home-inner-yellow"
      );

    }

  }


  if (
    row >= 9 &&
    col >= 9
  ) {

    cell.classList.add(
      "blue-home"
    );

    if (
      row >= 10 &&
      row <= 13 &&
      col >= 10 &&
      col <= 13
    ) {

      cell.classList.add(
        "home-inner-blue"
      );

    }

  }


  /*
     Outer track.
  */

  const pathIndex =
    PATH.findIndex(
      position =>
        position[0] === col &&
        position[1] === row
    );


  if (pathIndex !== -1) {

    cell.className =
      "cell path";

    cell.dataset.path =
      pathIndex;


    /*
       Starting squares.
    */

    if (
      pathIndex === START_INDEX.red
    ) {

      cell.classList.add(
        "start-red"
      );

    }

    if (
      pathIndex === START_INDEX.green
    ) {

      cell.classList.add(
        "start-green"
      );

    }

    if (
      pathIndex === START_INDEX.yellow
    ) {

      cell.classList.add(
        "start-yellow"
      );

    }

    if (
      pathIndex === START_INDEX.blue
    ) {

      cell.classList.add(
        "start-blue"
      );

    }


    /*
       Safe stars.
    */

    if (
      SAFE_SQUARES.includes(
        pathIndex
      )
    ) {

      cell.classList.add(
        "star"
      );

      cell.textContent = "★";

    }

  }


  /*
     Home lanes.
  */

  COLORS.forEach(color => {

    HOME_LANES[color]
      .forEach(position => {

        if (
          position[0] === col &&
          position[1] === row
        ) {

          cell.className =
            `cell lane-${color}`;

        }

      });

  });


  /*
     Center 3x3.
  */

  if (
    row >= 6 &&
    row <= 8 &&
    col >= 6 &&
    col <= 8
  ) {

    cell.className =
      "cell";


    if (
      row === 6 &&
      col === 6
    ) {

      cell.classList.add(
        "center-red"
      );

    }

    if (
      row === 6 &&
      col === 7
    ) {

      cell.classList.add(
        "center-red"
      );

    }

    if (
      row === 7 &&
      col === 6
    ) {

      cell.classList.add(
        "center-blue"
      );

    }

    if (
      row === 8 &&
      col === 6
    ) {

      cell.classList.add(
        "center-blue"
      );

    }

    if (
      row === 8 &&
      col === 7
    ) {

      cell.classList.add(
        "center-yellow"
      );

    }

    if (
      row === 8 &&
      col === 8
    ) {

      cell.classList.add(
        "center-yellow"
      );

    }

    if (
      row === 7 &&
      col === 8
    ) {

      cell.classList.add(
        "center-green"
      );

    }

    if (
      row === 6 &&
      col === 8
    ) {

      cell.classList.add(
        "center-green"
      );

    }

  }


  /*
     Add home circles.
  */

  addHomeCircle(
    cell,
    row,
    col
  );

}


/* =====================================================
   HOME CIRCLES
===================================================== */

function addHomeCircle(
  cell,
  row,
  col
) {

  const positions = [

    [2,2,"red"],
    [2,3,"red"],
    [3,2,"red"],
    [3,3,"red"],

    [2,11,"green"],
    [2,12,"green"],
    [3,11,"green"],
    [3,12,"green"],

    [11,2,"yellow"],
    [11,3,"yellow"],
    [12,2,"yellow"],
    [12,3,"yellow"],

    [11,11,"blue"],
    [11,12,"blue"],
    [12,11,"blue"],
    [12,12,"blue"]

  ];


  positions.forEach(
    position => {

      if (
        position[0] === row &&
        position[1] === col
      ) {

        const circle =
          document.createElement(
            "div"
          );

        circle.className =
          "home-circle";

        cell.appendChild(
          circle
        );

      }

    }
  );

}


/* =====================================================
   CREATE BOARD PIECES
===================================================== */

function createBoardPieces() {

  board
    .querySelectorAll(".board-piece")
    .forEach(piece =>
      piece.remove()
    );


  COLORS.forEach(color => {

    players[color].pieces
      .forEach(
        (piece, index) => {

          const element =
            document.createElement(
              "button"
            );

          element.className =
            `board-piece piece-${color}`;

          element.dataset.color =
            color;

          element.dataset.index =
            index;

          element.title =
            `${players[color].name} piece ${index + 1}`;


          element.addEventListener(
            "click",
            () => {

              selectPiece(
                color,
                index
              );

            }
          );


          board.appendChild(
            element
          );

        }
      );

  });


  updateAllPieces();

}


/* =====================================================
   GET PATH COORDINATE
===================================================== */

function getPathCoordinate(
  color,
  position
) {

  /*
     Position 0-51:
     Outer track.
  */

  if (
    position >= 0 &&
    position <= 51
  ) {

    const index =
      (
        START_INDEX[color] +
        position
      ) % 52;

    return PATH[index];

  }


  /*
     Position 52-57:
     Home lane.
  */

  if (
    position >= 52 &&
    position <= 57
  ) {

    const laneIndex =
      position - 52;

    return HOME_LANES[color][
      laneIndex
    ];

  }


  return null;

}


/* =====================================================
   HOME PIECE POSITION
===================================================== */

function getHomePiecePosition(
  color,
  index
) {

  return HOME_POSITIONS[color][index];

}


/* =====================================================
   UPDATE PIECE
===================================================== */

function updatePiecePosition(
  color,
  index
) {

  const element =
    document.querySelector(
      `.board-piece[data-color="${color}"][data-index="${index}"]`
    );

  if (!element) return;


  const piece =
    players[color].pieces[index];


  /*
     Finished pieces disappear into
     the center.
  */

  if (piece.finished) {

    element.style.left = "50%";
    element.style.top = "50%";
    element.style.opacity = "0";

    return;

  }


  element.style.opacity = "1";


  /*
     Piece is in home.
  */

  if (
    piece.position === -1
  ) {

    const position =
      getHomePiecePosition(
        color,
        index
      );

    element.style.left =
      `${((position[0] + .5) / 15) * 100}%`;

    element.style.top =
      `${((position[1] + .5) / 15) * 100}%`;

    return;

  }


  /*
     Piece is on track/home lane.
  */

  const position =
    getPathCoordinate(
      color,
      piece.position
    );


  if (!position) return;


  element.style.left =
    `${((position[0] + .5) / 15) * 100}%`;

  element.style.top =
    `${((position[1] + .5) / 15) * 100}%`;

}


/* =====================================================
   UPDATE EVERYTHING
===================================================== */

function updateAllPieces() {

  COLORS.forEach(color => {

    players[color].pieces
      .forEach(
        (_, index) => {

          updatePiecePosition(
            color,
            index
          );

        }
      );

  });


  updateHand();

}


/* =====================================================
   CAN PIECE MOVE?
===================================================== */

function canPieceMove(
  color,
  index
) {

  const piece =
    players[color].pieces[index];


  if (piece.finished) {
    return false;
  }


  /*
     Home requires 6.
  */

  if (
    piece.position === -1
  ) {

    return diceValue === 6;

  }


  /*
     Don't go beyond final square.
  */

  return (
    piece.position +
    diceValue <=
    57
  );

}


/* =====================================================
   AVAILABLE MOVES
===================================================== */

function availableMoves(
  color
) {

  const result = [];

  players[color].pieces
    .forEach(
      (_, index) => {

        if (
          canPieceMove(
            color,
            index
          )
        ) {

          result.push(index);

        }

      }
    );

  return result;

}


/* =====================================================
   ROLL DICE
===================================================== */

async function rollDice() {

  if (gameFinished) return;

  if (hasRolled) return;

  if (
    !players[currentPlayer].human
  ) return;


  hasRolled = true;

  rollButton.disabled = true;

  diceButton.classList.add(
    "rolling"
  );

  playDiceSound();


  /*
     Animate dice.
  */

  let count = 0;


  const animation =
    setInterval(
      () => {

        const temporary =
          Math.floor(
            Math.random() * 6
          ) + 1;

        diceNumber.textContent =
          temporary;

        diceValueTop.textContent =
          temporary;

        count++;


        if (count >= 8) {

          clearInterval(
            animation
          );


          diceValue =
            Math.floor(
              Math.random() * 6
            ) + 1;


          diceNumber.textContent =
            diceValue;

          diceValueTop.textContent =
            diceValue;


          diceButton.classList.remove(
            "rolling"
          );


          afterRoll();

        }

      },
      70
    );

}


/* =====================================================
   AFTER ROLL
===================================================== */

function afterRoll() {

  const moves =
    availableMoves(
      currentPlayer
    );


  if (
    moves.length === 0
  ) {

    turnStatus.textContent =
      "No possible move.";

    setTimeout(
      () => {

        if (
          diceValue === 6
        ) {

          resetTurnForSix();

        }
        else {

          nextTurn();

        }

      },
      900
    );

    return;

  }


  turnStatus.textContent =
    "Choose a piece";


  highlightPieces(
    moves
  );

}


/* =====================================================
   HIGHLIGHT
===================================================== */

function highlightPieces(
  moves
) {

  clearHighlights();


  /*
     Hand.
  */

  if (
    currentPlayer === "red"
  ) {

    handPieces.forEach(
      (piece, index) => {

        if (
          moves.includes(index)
        ) {

          piece.classList.add(
            "available"
          );

        }

      }
    );

  }


  /*
     Board.
  */

  moves.forEach(
    index => {

      const element =
        document.querySelector(
          `.board-piece[data-color="${currentPlayer}"][data-index="${index}"]`
        );

      if (element) {

        element.classList.add(
          "selectable"
        );

      }

    }
  );

}


/* =====================================================
   CLEAR HIGHLIGHTS
===================================================== */

function clearHighlights() {

  handPieces.forEach(
    piece => {

      piece.classList.remove(
        "available"
      );

    }
  );


  board
    .querySelectorAll(".board-piece")
    .forEach(
      piece => {

        piece.classList.remove(
          "selectable"
        );

      }
    );

}


/* =====================================================
   SELECT PIECE
===================================================== */

function selectPiece(
  color,
  index
) {

  if (gameFinished) return;

  if (
    color !== currentPlayer
  ) return;

  if (!hasRolled) return;

  if (
    !players[color].human
  ) return;


  if (
    !canPieceMove(
      color,
      index
    )
  ) {

    turnStatus.textContent =
      "That piece cannot move.";

    return;

  }


  movePiece(
    color,
    index
  );

}


/* =====================================================
   HAND CLICK
===================================================== */

handPieces.forEach(
  (piece, index) => {

    piece.addEventListener(
      "click",
      () => {

        selectPiece(
          "red",
          index
        );

      }
    );

  }
);


/* =====================================================
   MOVE PIECE
===================================================== */

async function movePiece(
  color,
  index
) {

  if (
    !canPieceMove(
      color,
      index
    )
  ) {

    return;

  }


  clearHighlights();


  const piece =
    players[color].pieces[index];


  /*
     Leaving home.
  */

  if (
    piece.position === -1
  ) {

    piece.position = 0;

    playMoveSound();

    await animateSmallMove();

  }

  else {

    /*
       Move one square at a time.
    */

    for (
      let step = 0;
      step < diceValue;
      step++
    ) {

      piece.position++;

      updatePiecePosition(
        color,
        index
      );

      playMoveSound();

      await delay(110);

    }

  }


  /*
     Finished.
  */

  if (
    piece.position === 57
  ) {

    piece.finished = true;

    playFinishSound();

  }


  updateAllPieces();


  /*
     Capture.
  */

  if (
    !piece.finished
  ) {

    captureOpponents(
      color,
      index
    );

  }


  updateAllPieces();


  /*
     Winner.
  */

  if (
    playerHasWon(color)
  ) {

    finishGame(color);

    return;

  }


  /*
     Six gives another turn.
  */

  if (
    diceValue === 6
  ) {

    hasRolled = false;

    rollButton.disabled =
      !players[currentPlayer].human;

    turnStatus.textContent =
      "You rolled a 6 — roll again.";

    if (
      !players[currentPlayer].human
    ) {

      computerTurn();

    }

    return;

  }


  nextTurn();

}


/* =====================================================
   ANIMATION HELPERS
===================================================== */

function delay(ms) {

  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        ms
      )
  );

}


function animateSmallMove() {

  return delay(180);

}


/* =====================================================
   CAPTURE
===================================================== */

function captureOpponents(
  color,
  index
) {

  const movingPiece =
    players[color].pieces[index];


  if (
    movingPiece.position <
    0 ||
    movingPiece.position >
    51
  ) {

    return;

  }


  const absolute =
    getAbsoluteTrackPosition(
      color,
      movingPiece.position
    );


  /*
     Safe square cannot capture.
  */

  if (
    SAFE_SQUARES.includes(
      absolute
    )
  ) {

    return;

  }


  COLORS.forEach(
    opponentColor => {

      if (
        opponentColor === color
      ) return;


      players[opponentColor]
        .pieces
        .forEach(
          opponentPiece => {

            if (
              opponentPiece.position <
              0 ||
              opponentPiece.position >
              51
            ) {

              return;

            }


            const opponentAbsolute =
              getAbsoluteTrackPosition(
                opponentColor,
                opponentPiece.position
              );


            if (
              opponentAbsolute ===
              absolute
            ) {

              opponentPiece.position =
                -1;

              playCaptureSound();

            }

          }
        );

    }
  );

}


/* =====================================================
   ABSOLUTE TRACK POSITION
===================================================== */

function getAbsoluteTrackPosition(
  color,
  relativePosition
) {

  return (
    START_INDEX[color] +
    relativePosition
  ) % 52;

}


/* =====================================================
   WINNER
===================================================== */

function playerHasWon(
  color
) {

  return players[color]
    .pieces
    .every(
      piece =>
        piece.finished
    );

}


function finishGame(
  color
) {

  gameFinished = true;

  clearHighlights();


  if (
    color === "red"
  ) {

    winnerTitle.textContent =
      "🎉 YOU WIN!";

    winnerText.textContent =
      "Congratulations! All four of your pieces reached home.";

  }

  else {

    winnerTitle.textContent =
      `${players[color].name} Wins!`;

    winnerText.textContent =
      "The game is over.";

  }


  playWinSound();


  setTimeout(
    () => {

      winModal.classList.add(
        "show"
      );

    },
    700
  );

}


/* =====================================================
   NEXT TURN
===================================================== */

function nextTurn() {

  clearHighlights();

  hasRolled = false;

  diceValue = 0;

  diceNumber.textContent = "1";

  diceValueTop.textContent = "1";


  const currentIndex =
    COLORS.indexOf(
      currentPlayer
    );


  currentPlayer =
    COLORS[
      (currentIndex + 1) %
      COLORS.length
    ];


  updateTurnUI();


  if (
    players[currentPlayer].human
  ) {

    rollButton.disabled = false;

  }

  else {

    rollButton.disabled = true;

    computerTurn();

  }

}


/* =====================================================
   SIX AGAIN
===================================================== */

function resetTurnForSix() {

  hasRolled = false;

  diceValue = 0;

  rollButton.disabled =
    !players[currentPlayer].human;

  diceNumber.textContent = "1";

  diceValueTop.textContent = "1";


  if (
    players[currentPlayer].human
  ) {

    turnStatus.textContent =
      "Roll again.";

  }

  else {

    computerTurn();

  }

}


/* =====================================================
   TURN UI
===================================================== */

function updateTurnUI() {

  const player =
    players[currentPlayer];


  turnName.textContent =
    `${player.name}'s Turn`;


  turnDot.style.background =
    getColor(currentPlayer);


  turnDot.style.boxShadow =
    `0 0 10px ${getColor(currentPlayer)}`;


  if (
    player.human
  ) {

    turnStatus.textContent =
      "Roll the dice";

  }

  else {

    turnStatus.textContent =
      "Computer is thinking...";

  }

}


/* =====================================================
   COMPUTER
===================================================== */

function computerTurn() {

  clearTimeout(
    computerTimeout
  );


  computerTimeout =
    setTimeout(
      () => {

        if (
          gameFinished
        ) return;


        computerRoll();

      },
      1000
    );

}


/* =====================================================
   COMPUTER ROLL
===================================================== */

function computerRoll() {

  hasRolled = true;

  diceButton.classList.add(
    "rolling"
  );

  playDiceSound();


  let count = 0;


  const animation =
    setInterval(
      () => {

        const temporary =
          Math.floor(
            Math.random() * 6
          ) + 1;


        diceNumber.textContent =
          temporary;

        diceValueTop.textContent =
          temporary;


        count++;


        if (
          count >= 8
        ) {

          clearInterval(
            animation
          );


          diceValue =
            Math.floor(
              Math.random() * 6
            ) + 1;


          diceNumber.textContent =
            diceValue;

          diceValueTop.textContent =
            diceValue;


          diceButton.classList.remove(
            "rolling"
          );


          computerChoosePiece();

        }

      },
      70
    );

}


/* =====================================================
   COMPUTER CHOOSES PIECE
===================================================== */

function computerChoosePiece() {

  const moves =
    availableMoves(
      currentPlayer
    );


  if (
    moves.length === 0
  ) {

    turnStatus.textContent =
      "No possible move.";

    setTimeout(
      () => {

        if (
          diceValue === 6
        ) {

          resetTurnForSix();

        }
        else {

          nextTurn();

        }

      },
      800
    );

    return;

  }


  let selected =
    moves[0];


  /*
     Prefer a piece that can capture.
  */

  const captureMove =
    moves.find(
      index =>
        canCaptureWithMove(
          currentPlayer,
          index
        )
    );


  if (
    captureMove !== undefined
  ) {

    selected =
      captureMove;

  }

  else {

    /*
       Prefer a piece already moving.
    */

    const moving =
      moves.filter(
        index =>
          players[currentPlayer]
            .pieces[index]
            .position !== -1
      );


    if (
      moving.length
    ) {

      selected =
        moving[
          Math.floor(
            Math.random() *
            moving.length
          )
        ];

    }

  }


  turnStatus.textContent =
    "Computer is moving...";


  setTimeout(
    () => {

      movePiece(
        currentPlayer,
        selected
      );

    },
    600
  );

}


/* =====================================================
   COMPUTER CAPTURE CHECK
===================================================== */

function canCaptureWithMove(
  color,
  index
) {

  const piece =
    players[color].pieces[index];


  let newPosition;


  if (
    piece.position === -1
  ) {

    newPosition = 0;

  }

  else {

    newPosition =
      piece.position +
      diceValue;

  }


  if (
    newPosition < 0 ||
    newPosition > 51
  ) {

    return false;

  }


  const absolute =
    getAbsoluteTrackPosition(
      color,
      newPosition
    );


  if (
    SAFE_SQUARES.includes(
      absolute
    )
  ) {

    return false;

  }


  return COLORS.some(
    opponent => {

      if (
        opponent === color
      ) return false;


      return players[opponent]
        .pieces
        .some(
          opponentPiece => {

            if (
              opponentPiece.position < 0 ||
              opponentPiece.position > 51
            ) {

              return false;

            }


            return (
              getAbsoluteTrackPosition(
                opponent,
                opponentPiece.position
              ) === absolute
            );

          }
        );

    }
  );

}


/* =====================================================
   UPDATE HAND
===================================================== */

function updateHand() {

  const pieces =
    players.red.pieces;


  let finished = 0;


  pieces.forEach(
    (piece, index) => {

      const hand =
        handPieces[index];


      if (
        piece.finished
      ) {

        finished++;

        hand.classList.add(
          "finished"
        );

      }

      else {

        hand.classList.remove(
          "finished"
        );

      }

    }
  );


  homeCount.textContent =
    finished;

}


/* =====================================================
   COLOR
===================================================== */

function getColor(color) {

  const colors = {

    red: "#e52d39",

    green: "#25ad59",

    yellow: "#efc62a",

    blue: "#2874dc"

  };


  return colors[color];

}


/* =====================================================
   GAME START
===================================================== */

function startComputerGame() {

  mode = "computer";

  modeLabel.textContent =
    "Computer Game";


  createPlayers();


  players.red.human = true;

  players.green.human = false;

  players.yellow.human = false;

  players.blue.human = false;


  showGame();

  resetGame();

}


function startMultiplayerGame() {

  mode = "multiplayer";

  modeLabel.textContent =
    "Multiplayer";


  createPlayers();


  /*
     Local multiplayer.
     Players take turns on the
     same device.
  */

  players.red.human = true;

  players.green.human = true;

  players.yellow.human = true;

  players.blue.human = true;


  players.red.name = "Player 1";
  players.green.name = "Player 2";
  players.yellow.name = "Player 3";
  players.blue.name = "Player 4";


  showGame();

  resetGame();

}


/* =====================================================
   RESET
===================================================== */

function resetGame() {

  clearTimeout(
    computerTimeout
  );


  createPlayers();


  if (
    mode === "computer"
  ) {

    players.red.human = true;

    players.green.human = false;

    players.yellow.human = false;

    players.blue.human = false;

  }

  else {

    players.red.human = true;

    players.green.human = true;

    players.yellow.human = true;

    players.blue.human = true;


    players.red.name = "Player 1";
    players.green.name = "Player 2";
    players.yellow.name = "Player 3";
    players.blue.name = "Player 4";

  }


  currentPlayer = "red";

  diceValue = 0;

  hasRolled = false;

  gameFinished = false;


  diceNumber.textContent = "1";

  diceValueTop.textContent = "1";


  winModal.classList.remove(
    "show"
  );


  buildBoard();

  createBoardPieces();

  updateAllPieces();

  updateTurnUI();


  rollButton.disabled = false;

}


/* =====================================================
   SHOW GAME
===================================================== */

function showGame() {

  menuScreen.classList.remove(
    "active"
  );

  gameScreen.classList.add(
    "active"
  );

}


/* =====================================================
   SHOW MENU
===================================================== */

function showMenu() {

  clearTimeout(
    computerTimeout
  );


  gameScreen.classList.remove(
    "active"
  );

  menuScreen.classList.add(
    "active"
  );

}


/* =====================================================
   AUDIO
===================================================== */

let audioContext = null;

let masterGain = null;


function setupAudio() {

  if (
    audioContext
  ) return;


  audioContext =
    new (
      window.AudioContext ||
      window.webkitAudioContext
    )();


  masterGain =
    audioContext.createGain();


  masterGain.gain.value =
    soundEnabled
      ? .12
      : 0;


  masterGain.connect(
    audioContext.destination
  );

}


function tone(
  frequency,
  duration,
  type = "sine",
  volume = .2
) {

  if (
    !soundEnabled
  ) return;


  setupAudio();


  const oscillator =
    audioContext.createOscillator();


  const gain =
    audioContext.createGain();


  oscillator.type =
    type;

  oscillator.frequency.value =
    frequency;


  gain.gain.setValueAtTime(
    .0001,
    audioContext.currentTime
  );


  gain.gain.exponentialRampToValueAtTime(
    volume,
    audioContext.currentTime + .015
  );


  gain.gain.exponentialRampToValueAtTime(
    .0001,
    audioContext.currentTime + duration
  );


  oscillator.connect(gain);

  gain.connect(
    masterGain
  );


  oscillator.start();


  oscillator.stop(
    audioContext.currentTime +
    duration
  );

}


/* =====================================================
   SOUND EFFECTS
===================================================== */

function playDiceSound() {

  tone(
    320,
    .07,
    "square",
    .13
  );


  setTimeout(
    () =>
      tone(
        480,
        .07,
        "square",
        .13
      ),
    80
  );

}


function playMoveSound() {

  tone(
    600,
    .035,
    "triangle",
    .08
  );

}


function playCaptureSound() {

  tone(
    150,
    .16,
    "sawtooth",
    .17
  );

}


function playFinishSound() {

  tone(
    700,
    .12,
    "triangle",
    .15
  );


  setTimeout(
    () =>
      tone(
        900,
        .15,
        "triangle",
        .15
      ),
    120
  );

}


function playWinSound() {

  const notes = [
    523,
    659,
    784,
    1046
  ];


  notes.forEach(
    (note, index) => {

      setTimeout(
        () =>
          tone(
            note,
            .25,
            "triangle",
            .2
          ),
        index * 150
      );

    }
  );


  /*
     Celebration/clapping.
  */

  for (
    let i = 0;
    i < 10;
    i++
  ) {

    setTimeout(
      () => {

        tone(
          900 +
          Math.random() * 400,
          .05,
          "square",
          .1
        );

      },
      750 + i * 100
    );

  }

}


/* =====================================================
   SOUND BUTTON
===================================================== */

soundBtn.addEventListener(
  "click",
  () => {

    soundEnabled =
      !soundEnabled;


    soundBtn.textContent =
      soundEnabled
        ? "🔊"
        : "🔇";


    if (
      masterGain
    ) {

      masterGain.gain.value =
        soundEnabled
          ? .12
          : 0;

    }

  }
);


/* =====================================================
   BUTTONS
===================================================== */

computerBtn.addEventListener(
  "click",
  startComputerGame
);


multiplayerBtn.addEventListener(
  "click",
  startMultiplayerGame
);


backBtn.addEventListener(
  "click",
  showMenu
);


rollButton.addEventListener(
  "click",
  rollDice
);


diceButton.addEventListener(
  "click",
  rollDice
);


document
  .getElementById(
    "newGameButton"
  )
  .addEventListener(
    "click",
    resetGame
  );


document
  .getElementById(
    "rulesButton"
  )
  .addEventListener(
    "click",
    () => {

      rulesModal.classList.add(
        "show"
      );

    }
  );


document
  .getElementById(
    "closeRules"
  )
  .addEventListener(
    "click",
    () => {

      rulesModal.classList.remove(
        "show"
      );

    }
  );


document
  .getElementById(
    "againButton"
  )
  .addEventListener(
    "click",
    resetGame
  );


document
  .getElementById(
    "menuButton"
  )
  .addEventListener(
    "click",
    () => {

      winModal.classList.remove(
        "show"
      );

      showMenu();

    }
  );


/* =====================================================
   INITIALIZE
===================================================== */

createPlayers();

buildBoard();

createBoardPieces();

updateAllPieces();

updateTurnUI();
