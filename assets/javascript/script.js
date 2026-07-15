// Represent the board as an array with 9 positions (index 0-8)
// null = empty cell, "X" or "O" = occupied cell
let board = [null, null, null, null, null, null, null, null, null];
// Who plays now - always begins with X
let currentPlayer = "X";
// The game is active as long as it is not over (win/draw)
let gameActive  = true;
// Game mode: human-vs-human or human-vs-computer
let gameMode = "twoPlayers";
let computerMoveTimeout = null;
// Get all the HTML boxes to add functionality to them
const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const twoPlayersButton = document.getElementById("btn-2players");
const vsComputerButton = document.getElementById("btn-vs-computer");
const restartButton = document.getElementById("btn-restart");

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

// Check if the board is full (no null left) - used for draw
function checkDraw() {
    return board.every(cell => cell !== null);
}

function getStatusMessage() {
    if (gameMode === "vsComputer") {
        return currentPlayer === "X" ? "Rândul tău" : "Rândul calculatorului";
    }

    return `Rândul lui ${currentPlayer}`;
}

function updateModeButtons() {
    twoPlayersButton.classList.toggle("active", gameMode === "twoPlayers");
    vsComputerButton.classList.toggle("active", gameMode === "vsComputer");
}

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

function playMove(cell, index) {
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

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.textContent = getStatusMessage();
}

function computerMove() {
    computerMoveTimeout = null;

    if (!gameActive || gameMode !== "vsComputer" || currentPlayer !== "O") {
        return;
    }

    const index = getRandomEmptyCellIndex();

    if (index === null) {
        return;
    }

    const cell = cells[index];
    playMove(cell, index);
}

function scheduleComputerMove() {
    if (computerMoveTimeout !== null) {
        clearTimeout(computerMoveTimeout);
    }

    computerMoveTimeout = setTimeout(computerMove, 500);
}

function resetGame() {
    if (computerMoveTimeout !== null) {
        clearTimeout(computerMoveTimeout);
        computerMoveTimeout = null;
    }

    board = [null, null, null, null, null, null, null, null, null];
    currentPlayer = "X";
    gameActive = true;

    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("x", "o", "win");
    });

    updateModeButtons();
    statusText.textContent = getStatusMessage();
}

function setGameMode(mode) {
    if (computerMoveTimeout !== null) {
        clearTimeout(computerMoveTimeout);
        computerMoveTimeout = null;
    }

    gameMode = mode;
    resetGame();
}

function handleCellClick(event) {
    const cell = event.target;
    const index = cell.dataset.index; // we read data-index fron HTML

    // Don't do anything if the game is over, the cell is occupied, or it is the computer's turn
    if (!gameActive || board[index] !== null || (gameMode === "vsComputer" && currentPlayer !== "X")) {
        return;
    }

    playMove(cell, index);

    if (gameActive && gameMode === "vsComputer" && currentPlayer === "O") {
        scheduleComputerMove();
    }
}

twoPlayersButton.addEventListener("click", () => setGameMode("twoPlayers"));
vsComputerButton.addEventListener("click", () => setGameMode("vsComputer"));
// Attach the click handler to each box
cells.forEach(cell => cell.addEventListener("click", handleCellClick));
restartButton.addEventListener("click", resetGame);

resetGame();