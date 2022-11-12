import { Board, Position } from "./types";
import { DateTime } from "luxon";

import { createHash } from "crypto";

const sha1 = (data: string) => {
  return createHash("sha1")
    .update(
      data
        .split("")
        .map((c) => c.charCodeAt(0))
        .map((c) => c.toString(16))
        .join("")
    )

    .digest("hex")
    .slice(0, 8);
};

// counter to keep track of if a board was already visited
let alreadyVisitedBoards: Array<string> = [];

export const generateInitialBoard = (N: number): Board => {
  const board: Board = Array.from({ length: N }, (_, i) =>
    Array.from({ length: N }, (_, j) => i * N + j + 1)
  ).map((row, i) => (i === N - 1 ? row.slice(0, -1).concat(0) : row));
  return board;
};

export const canMove = (position: Position, board: Board): boolean => {
  const { x, y } = position;
  if (x < 0 || x >= board.length || y < 0 || y >= board[x].length) return false;

  const emptyPosition: Position = findEmptyPosition(board);
  if (emptyPosition === null) return false;
  const { x: emptyX, y: emptyY } = emptyPosition;
  if (x === emptyX && y === emptyY) return false;

  const hashedBoard = sha1(board.toString());
  if (alreadyVisitedBoards.includes(hashedBoard)) return false;
  if (x === emptyX && Math.abs(y - emptyY) === 1) return true;
  if (y === emptyY && Math.abs(x - emptyX) === 1) return true;
  return false;
};

export const findEmptyPosition = (board: Board): Position => {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j] === 0) {
        return { x: i, y: j };
      }
    }
  }
  return { x: -1, y: -1 };
};

const filterMoves = (possibleMoves: Array<Position>, board: Board) => {
  return possibleMoves.filter((position) => canMove(position, board));
};

export const shuffle = (board: Board, moves: number): Board => {
  let newBoard: Board = JSON.parse(JSON.stringify(board));
  for (let i = 0; i < moves; i++) {
    const emptyPosition: Position = findEmptyPosition(newBoard);
    const { x, y } = emptyPosition;
    const possibleMoves: Array<Position> = [
      { x: x - 1, y },
      { x: x + 1, y },
      { x, y: y - 1 },
      { x, y: y + 1 },
    ];
    const possibleMovesFiltered: Array<Position> = filterMoves(
      possibleMoves,
      newBoard
    );
    const randomIndex: number = Math.floor(
      Math.random() * possibleMovesFiltered.length
    );
    newBoard = moveHelper(possibleMovesFiltered[randomIndex], newBoard);
  }
  return newBoard;
};

export const moveHelper = (position: Position, board: Board): Board => {
  const { x, y } = position;
  if (!canMove(position, board)) return board;
  const newBoard: Board = JSON.parse(JSON.stringify(board));
  const emptyPosition: Position = findEmptyPosition(newBoard);
  const { x: emptyX, y: emptyY } = emptyPosition;
  newBoard[emptyX][emptyY] = newBoard[x][y];
  newBoard[x][y] = 0;

  return newBoard;
};

export const isBoardSolved = (board: Board): boolean => {
  const length = board.length;
  const initialBoard = generateInitialBoard(length);
  return board.toString() === initialBoard.toString();
};

export const solve = (board: Board): Position[] => {
  const startTime = DateTime.now();
  // TODO: implement the algorithm to solve the board
  const solution: Position[] = [];
  const endTime = DateTime.now();
  const duration = endTime.diff(startTime, "milliseconds").toObject();
  console.log(`Solved in ${duration.milliseconds}ms`);
  alreadyVisitedBoards = [];
  return solution;
};
