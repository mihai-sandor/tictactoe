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
const vsComputerImpossibleButton = document.getElementById("btn-vs-computer-impossible");
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
    if (gameMode === "vsComputer" || gameMode === "vsComputerImpossible") {
        return currentPlayer === "X" ? "Rândul tău" : "Rândul calculatorului";
    }

    return `Rândul lui ${currentPlayer}`;
}

function updateModeButtons() {
    twoPlayersButton.classList.toggle("active", gameMode === "twoPlayers");
    vsComputerButton.classList.toggle("active", gameMode === "vsComputer");
    vsComputerImpossibleButton.classList.toggle("active", gameMode === "vsComputerImpossible");
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

function getWinnerForMinimax(newBoard) {
    for (const combo of winningCombos) {
        const [a, b, c] = combo;
        if (newBoard[a] !== null && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
            return newBoard[a];
        }
    }

    return null;
}

function minimax(newBoard, depth, isMaximizing) {
    const winner = getWinnerForMinimax(newBoard);

    if (winner === "O") {
        return 10 - depth;
    }

    if (winner === "X") {
        return depth - 10;
    }

    if (!newBoard.includes(null)) {
        return 0;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;

        for (let i = 0; i < 9; i++) {
            if (newBoard[i] === null) {
                newBoard[i] = "O";
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
            newBoard[i] = "X";
            const score = minimax(newBoard, depth + 1, true);
            newBoard[i] = null;
            bestScore = Math.min(bestScore, score);
        }
    }

    return bestScore;
}

function computerBestMove() {
    let bestScore = -Infinity;
    let bestMove = null;

    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = "O";
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

function computerMoveRandom() {
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

function computerMoveImpossible() {
    computerMoveTimeout = null;

    if (!gameActive || gameMode !== "vsComputerImpossible" || currentPlayer !== "O") {
        return;
    }

    const index = computerBestMove();

    if (index === null) {
        return;
    }

    const cell = cells[index];
    playMove(cell, index);
}

function scheduleComputerMove(moveFunction) {
    if (computerMoveTimeout !== null) {
        clearTimeout(computerMoveTimeout);
    }

    computerMoveTimeout = setTimeout(moveFunction, 500);
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
    if (!gameActive || board[index] !== null || (gameMode !== "twoPlayers" && currentPlayer !== "X")) {
        return;
    }

    playMove(cell, index);

    if (gameActive && currentPlayer === "O") {
        if (gameMode === "vsComputer") {
            scheduleComputerMove(computerMoveRandom);
        }

        if (gameMode === "vsComputerImpossible") {
            scheduleComputerMove(computerMoveImpossible);
        }
    }
}

twoPlayersButton.addEventListener("click", () => setGameMode("twoPlayers"));
vsComputerButton.addEventListener("click", () => setGameMode("vsComputer"));
vsComputerImpossibleButton.addEventListener("click", () => setGameMode("vsComputerImpossible"));
// Attach the click handler to each box
cells.forEach(cell => cell.addEventListener("click", handleCellClick));
restartButton.addEventListener("click", resetGame);

resetGame();