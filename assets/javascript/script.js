// Represent the board as an array with 9 positions (index 0-8)
// null = empty cell, "X" or "O" = occupied cell
let board = [null, null, null, null, null, null, null, null, null];
// Who plays now (the TURN). In Tic Tac Toe, X always moves first, always.
let currentPlayer = "X";
// The game is active as long as it is not over (win/draw)
let gameActive = true;
// Game mode: human-vs-human or human-vs-computer
let gameMode = "twoPlayers";
let computerMoveTimeout = null;

// Symbol ownership
// Before, the code always assumed "human = X" and "computer = O".
// Now we separate the SYMBOL (X or O) from the ROLE (human or computer).
// humanSymbol / computerSymbol say who owns wich symbol this game.
let humanSymbol = "X";
let computerSymbol = "O";
// If true, we re-roll humanSymbol/computerSymbol randomly every new game.
let randomSymbolMode = false;

// Get all the HTML boxes to add functionality to them
const cells = document.querySelectorAll(".cell");

// Get the status text and the mode/restart buttons from the page.
const statusText = document.getElementById("status");
const twoPlayersButton = document.getElementById("btn-2players");
const vsComputerButton = document.getElementById("btn-vs-computer");
const vsComputerImpossibleButton = document.getElementById("btn-vs-computer-impossible");
const restartButton = document.getElementById("btn-restart");

// Buttons for choosing wich symbol the human plays as.
const playXButton = document.getElementById("btn-play-x");
const playOButton = document.getElementById("btn-play-o");
const playRandomButton = document.getElementById("btn-play-random");

// All possible winning combinations (rows, columns, diagonals)
const winningCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Check the board for a winner
// Returns the winning combo (array of 3 indexes) or null if no winner yet
function checkWinner() {
    for (const combo of winningCombos) {
        const [a, b, c] = combo;
        if (board[a] !== null && board[a] === board[b] && board[a] === board[c]) {
            return combo;
        }
    }
    return null;
}

//Check if the board is full (no null left) - used for draw
// This is used to detect a draw when no winner exists and the board is full.
function checkDraw() {
    return board.every(cell => cell !== null);
}

// Build the text shown in the status area based on the current mode and turn.
function getStatusMessage() {
    if (gameMode === "vsComputer" || gameMode === "vsComputerImpossible") {
        // Compare against humanSymbol instead of assuming the human is always "X".
        return currentPlayer === humanSymbol ? "Rândul tău" : "Rândul calculatorului";
    }

    return `Rândul lui ${currentPlayer}`;
}

// Highlight the active game mode button so the user can see which mode is selected.
function updateModeButtons() {
    twoPlayersButton.classList.toggle("active", gameMode === "twoPlayers");
    vsComputerButton.classList.toggle("active", gameMode === "vsComputer");
    vsComputerImpossibleButton.classList.toggle("active", gameMode === "vsComputerImpossible");
}

// Highlight the active symbol button (X / O / Random).
function updateSymbolButtons() {
    playXButton.classList.toggle("active", !randomSymbolMode && humanSymbol === "X");
    playOButton.classList.toggle("active", !randomSymbolMode && humanSymbol === "O");
    playRandomButton.classList.toggle("active", randomSymbolMode);
}

//  Given one symbol, return the other one. "X" -> "O", "O" -> "X".
function otherSymbol(symbol) {
    return symbol === "X" ? "O" : "X";
}

// The player clicks "X", "O", or "Aleator" (random).
// This is the "method to choose how I'm going to play" the user asked for.
function chooseHumanSymbol(choice) {
    if (choice === "random") {
        // Turn on random mode. The actual roll happens in resetGame(),
        // so every future restart/new game gets a fresh random assignment.
        randomSymbolMode = true;
    } else {
        // A fixed, explicit choice turns random mode off.
        randomSymbolMode = false;
        humanSymbol = choice;
        computerSymbol = otherSymbol(choice);
    }  

    updateSymbolButtons();
    resetGame();
}

// Return a random empty cell index for the easy computer mode.
function getRandomEmptyCellIndex() {
    const emptyIndexes = board
        .map((cell, index) => (cell === null ? index : null))
        .filter(index => index !== null);

    if (emptyIndexes.length === 0) {
        return null;
    }

    const randomPosition = Math.floor(Math.random() * emptyIndexes.length);
    return emptyIndexes[randomPosition];
}

// Check a given board for a winner.
// This helper is used by the minimax algorithm for the impossible computer mode.
function getWinnerForMinimax(newBoard) {
    for (const combo of winningCombos) {
        const [a, b, c] = combo;
        if (newBoard[a] !== null && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
            return newBoard[a];
        }
    }

    return null;
}

// Minimax is a recursive AI algorithm.
// It evaluates all possible future moves to choose the best one for the computer.
// NOTE: this used to be hardcoded to "the computer is always O".
// Now it uses computerSymbol / humanSymbol, whichever they currently are,
// so the exact same algorithm works no matter which symbol the computer owns.
function minimax(newBoard, depth, isMaximizing) {
    const winner = getWinnerForMinimax(newBoard);

    if (winner === computerSymbol) {
        return 10 - depth;
    }

    if (winner === humanSymbol) {
        return depth - 10;
    }

    if (!newBoard.includes(null)) {
        return 0;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;

        for (let i = 0; i < 9; i++) {
            if (newBoard[i] === null) {
                newBoard[i] = computerSymbol;
                const score = minimax(newBoard, depth + 1, false);
                newBoard[i] = null;
                bestScore = Math.max(bestScore, score);
            }
        }

        return bestScore;
    }

    let bestScore = Infinity;

    for (let i = 0; i < 9; i++) {
        if (newBoard[i] === null) {
            newBoard[i] = humanSymbol;
            const score = minimax(newBoard, depth + 1, true);
            newBoard[i] = null;
            bestScore = Math.min(bestScore, score);
        }
    }

    return bestScore;
}

// Choose the best move for the unbeatable computer mode.
// It tests every possible move and uses the minimax scoring system.
function computerBestMove() {
    let bestScore = -Infinity;
    let bestMove = null;

    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = computerSymbol;
            const score = minimax(board, 0, false);
            board[i] = null;

            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }

    return bestMove;
}

// Apply a move to the board and update the visual board.
// This function handles the common logic for both human and computer moves.
function playMove(cell, index) {
    // Place the current symbol on the board.
    board[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());

    const winCombo = checkWinner();

    if (winCombo) {
        gameActive = false;
        statusText.textContent = `${currentPlayer} a câștigat!`;
        winCombo.forEach(i => cells[i].classList.add("win"));
        return;
    }

    if (checkDraw()) {
        gameActive = false;
        statusText.textContent = "Remiză!";
        return;
    }

    // Switch turns after a valid move that did not end the game.
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.textContent = getStatusMessage();
}

// Make a random move for the easy computer mode.
function computerMoveRandom() {
    computerMoveTimeout = null;

    // Guard now checks computerSymbol instead of the hardcoded "O".
    if (!gameActive || gameMode !== "vsComputer" || currentPlayer !== computerSymbol) {
        return;
    }

    const index = getRandomEmptyCellIndex();

    if (index === null) {
        return;
    }

    const cell = cells[index];
    playMove(cell, index);
}

// Make the optimal move for the impossible computer mode.
function computerMoveImpossible() {
    computerMoveTimeout = null;

    // Guard now checks computerSymbol instead of the hardcoded "O".
    if (!gameActive || gameMode !== "vsComputerImpossible" || currentPlayer !== computerSymbol) {
        return;
    }

    const index = computerBestMove();

    if (index === null) {
        return;
    }

    const cell = cells[index];
    playMove(cell, index);
}

// Schedule a computer move after a short delay so the game feels more natural.
function scheduleComputerMove(moveFunction) {
    if (computerMoveTimeout !== null) {
        clearTimeout(computerMoveTimeout);
    }

    computerMoveTimeout = setTimeout(moveFunction, 500);
}

// Decide if the computer needs to move right now, and if so , schedule it.
// This is called both after a human click AND right after a reset/mode change
// (because if the computer owns "X", it must make the very first move).
function triggerComputerMoveIfNeeded() {
    if (!gameActive || currentPlayer !== computerSymbol) {
        return;
    }

    if (gameMode === "vsComputer") {
        scheduleComputerMove(computerMoveRandom);
    } else if (gameMode === "vsComputerImpossible") {
        scheduleComputerMove(computerMoveImpossible);
    } 
}

// Reset the entire game state and clear the visual board.
function resetGame() {
    if (computerMoveTimeout !== null) {
        clearTimeout(computerMoveTimeout);
        computerMoveTimeout = null;
    }

// If random mode is on, re-roll who gets X and who gets O right before every new game starts.
if (randomSymbolMode) {
    humanSymbol = Math.random() < 0.5 ? "X" : "O";
    computerSymbol = otherSymbol(humanSymbol);
}

    board = [null, null, null, null, null, null, null, null, null];
    currentPlayer = "X"; // X always starts, no matter who owns X this round
    gameActive = true;

    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("x", "o", "win");
    });

    updateModeButtons();
    updateSymbolButtons();
    statusText.textContent = getStatusMessage();

    // If the computer owns X, it must play the opening move itself.
    triggerComputerMoveIfNeeded();
}

// Change the game mode and reset the board so the new mode starts fresh.
function setGameMode(mode) {
    if (computerMoveTimeout !== null) {
        clearTimeout(computerMoveTimeout);
        computerMoveTimeout = null;
    }

    gameMode = mode;
    resetGame();
}

// Handle clicks on the game cells.
// It blocks invalid moves and triggers the computer turn when needed.
function handleCellClick(event) {
    const cell = event.target;
    const index = cell.dataset.index; // we read data-index fron HTML

      // Don't do anything if the game is over, the cell is occupied, or it is the computer's turn
      // (checked against humanSymbol now, not the hardcoded "X").
    if (!gameActive || board[index] !== null || (gameMode !== "twoPlayers" && currentPlayer !== humanSymbol)) {
        return;
    }

    playMove(cell, index);
    triggerComputerMoveIfNeeded();
}

// Connect each mode button to the corresponding game mode.
twoPlayersButton.addEventListener("click", () => setGameMode("twoPlayers"));
vsComputerButton.addEventListener("click", () => setGameMode("vsComputer"));
vsComputerImpossibleButton.addEventListener("click", () => setGameMode("vsComputerImpossible"));

// Connect the symbol-choice buttons.
playXButton.addEventListener("click", () => chooseHumanSymbol("X"));
playOButton.addEventListener("click", () => chooseHumanSymbol("O"));
playRandomButton.addEventListener("click", () => chooseHumanSymbol("random"));

// Attach the click handler to each board cell.
cells.forEach(cell => cell.addEventListener("click", handleCellClick));

// Connect the restart button to the reset function.
restartButton.addEventListener("click", resetGame);

// Start the game with the initial state.
resetGame();
