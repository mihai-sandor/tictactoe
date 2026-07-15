// Represent the table as an array with 9 positions (index 0-8)
// null = empty case, "X" or "O" = case ocupied
let board = [null, null, null, null, null, null, null, null, null];
// Who play now - begins always with X
let curentPlayer = "X";
// The game is active as long as it is not over (win/draw)
let gameActive  = true;
// We take all the HTML boxes to add functionality to them
const cells = document.querrySelectorAll(".cell");
