import { collect } from "./collect";
import { Cell, GameState, PlayerId, WinStatus } from "./types";

function makeInitialGameState(): GameState {
  return {
    whoseTurn: "p1",
    cells: collect(9, (ix) => ({ index: ix, status: "empty" })),
  };
}

function getWinStatus(gameState: GameState): WinStatus {
  console.log("computing win status from ", { gameState });
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  const linesOfCells = lines.map((lineOfIndices) =>
    lineOfIndices.map((ix) => gameState.cells.find((c) => c.index === ix)!)
  );
  const winningLine = linesOfCells.find((cells) => {
    return (
      cells[0].status !== "empty" &&
      cells.every((c) => c.status === cells[0].status)
    );
  });
  if (winningLine) {
    return {
      winStatus: "won",
      winnerId: winningLine[0].status === "X" ? "p1" : "p2",
    };
  }
  if (gameState.cells.every((c) => c.status !== "empty")) {
    return { winStatus: "draw" };
  }
  return { winStatus: "incomplete" };
}
export { makeInitialGameState, getWinStatus };
