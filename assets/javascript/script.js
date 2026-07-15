// Represent the table as an array with 9 positions (index 0-8)
// null = empty case, "X" or "O" = case ocupied
let board = [null, null, null, null, null, null, null, null, null];
// Who play now - begins always with X
let curentPlayer = "X";
// The game is active as long as it is not over (win/draw)
let gameActive  = true;
// We take all the HTML boxes to add functionality to them
const cells = document.querrySelectorAll(".cell");

function handleCellClick(event) {
    const cell = event.target;
    const index = cell.dataset.index // we read data-index fron HTML

    // We don't do anything if the game is over or the house is busy
    if (!gameActive || board[index] !== null) {
        
        // We save the move to the status array
        board[index] = curentPlayer;

        // We display the symbol in the box and add the class for color
        cell.textContent = curentPlayer;
        cell.classList.add(curentPlayer.toLowerCase());
    }
}
// We attach the above function to each box
cell.forEach(cell => cell.addEventListener("click", handleCellClick));
