// Represent the table as an array with 9 positions (index 0-8)
// null = empty case, "X" or "O" = case ocupied
let board = [null, null, null, null, null, null, null, null, null];
// Who play now - begins always with X
let currentPlayer = "X";
// The game is active as long as it is not over (win/draw)
let gameActive  = true;
// We take all the HTML boxes to add functionality to them
const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");

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

// Checks the board for a winner
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

// Checks if the board is full (no null left) - used for draw
function checkDraw() {
    return board.every(cell => cell !== null);
}

function handleCellClick(event) {
    const cell = event.target;
    const index = cell.dataset.index // we read data-index fron HTML

    // We don't do anything if the game is over or the house is busy
    if (!gameActive || board[index] !== null) {
        return;
    }
        
        // We save the move to the status array
        board[index] = currentPlayer;

        // We display the symbol in the box and add the class for color
        cell.textContent = currentPlayer;
        cell.classList.add(currentPlayer.toLowerCase());

        // Check if this move created a winner
        const winCombo = checkWinner();

        if (winCombo) {
            gameActive = false;
            statusText.textContent = `${currentPlayer} a câștigat!`;
            // Highlight the winning cells
            winCombo.forEach(i => cells[i].classList.add("win"));
            return;
        }

        // Check for draw (board full, no winner)
        if (checkDraw()) {
            gameActive = false;
            statusText.textContent = "Remiză!";
            return;
        }

        // Switch the current player: if it was "X", make it "O", and vice versa
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        // Update the status message to show whose turn it is now
        statusText.textContent = `Rândul lui ${currentPlayer}`;
}
// We attach the above function to each box
cells.forEach(cell => cell.addEventListener("click", handleCellClick));