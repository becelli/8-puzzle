import { Board, Position, ScoredPosition, ScoredBoard } from "./types";
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
    .slice(0, 7);
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

export const boardScoreCityBlock = (board: Board): number => {
  let score = 0;
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      const value = board[i][j];
      if (value === 0) continue;
      // sum the city block distance of each tile from its correct position
      const x = Math.floor((value - 1) / board.length);
      const y = (value - 1) % board.length;
      score += Math.abs(x - i) + Math.abs(y - j);
    }
  }
  return score;
};

export const boardScoreSlow = (board: Board): number => {
  let score = 0;
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      score += Math.abs(i + j + 1 - board[i][j]); //i+j+1 is the position that is being analized
    }
  }
  return score;
};

export const solveGreedy = (board: Board): Position[] => {
  alreadyVisitedBoards = [];
  const solution: Position[] = solvePuzzleOneLayer(board);
  return solution;
};

export const solveAStar = (board: Board): Position[] => {
  alreadyVisitedBoards = [];
  const solution: Position[] = solvePuzzleTwoLayers(board);
  return solution;
};

export const solveCustom = (board: Board): Position[] => {
  alreadyVisitedBoards = [];
  const solution: Position[] = solvePuzzleOneLayer(board);
  return solution;
};

export const getPossibleMoves = (board: Board): Position[] => {
  const emptyPosition: Position = findEmptyPosition(board);
  const { x, y } = emptyPosition;
  const possibleMoves: Array<Position> = [
    { x: x - 1, y },
    { x: x + 1, y },
    { x, y: y - 1 },
    { x, y: y + 1 },
  ];
  const possibleMovesFiltered: Array<Position> = filterMoves(
    possibleMoves,
    board
  );

  return possibleMovesFiltered;
};

export const getBestMovesInOrder = (board: Board): ScoredPosition[] => {
  const possibleMoves = getPossibleMoves(board);

  const scoredMoves = possibleMoves.map((position) => {
    const newBoard = moveHelper(position, board);
    return {
      position,
      score: boardScoreCityBlock(newBoard),
    };
  });

  const sortedMoves = scoredMoves.sort((a, b) => a.score - b.score);
  return sortedMoves;
};

export const getPossibleBoardsFromCurrent = (board: Board): Board[] => {
  const possibleMoves = getPossibleMoves(board);
  const possibleBoards = possibleMoves.map((position) =>
    moveHelper(position, board)
  );
  return possibleBoards;
};

export const solvePuzzleOneLayer = (board: Board): Position[] => {
  // return the tiles that need to be moved to solve the board
  const solution: Position[] = [];

  while (!isBoardSolved(board)) {
    const bestMovesInOrder: ScoredPosition[] = getBestMovesInOrder(board);

    let chosenMove = false;

    for (let i = 0; i < bestMovesInOrder.length; i++) {
      const move = bestMovesInOrder[i];
      const newBoard = moveHelper(move.position, board);
      const hashedBoard = sha1(newBoard.toString()).slice(0, 7);
      if (!alreadyVisitedBoards.includes(hashedBoard)) {
        solution.push(move.position);
        board = newBoard;
        alreadyVisitedBoards.push(hashedBoard);
        chosenMove = true;
        break;
      }
    }

    if (!chosenMove) {
      const index = Math.floor(Math.random() * bestMovesInOrder.length);
      const randomMove = bestMovesInOrder[index];
      board = moveHelper(randomMove.position, board);
      solution.push(randomMove.position);
    }
  }
  return solution;
};

export const getPossibleBoardsInOrder = (board: Board): ScoredBoard[] => {
  const possibleBoards = getPossibleBoardsFromCurrent(board);
  const scoredBoards = possibleBoards.map((board) => {
    return {
      board,
      score: boardScoreCityBlock(board),
    };
  });

  const sortedBoards = scoredBoards.sort((a, b) => a.score - b.score);
  return sortedBoards;
};

type ScoredGrandchildren = {
  board: Board;
  score: number;
  parent: Board;
};

export const getGrandchildrensInOrder = (
  childrenBoards: Board[]
): ScoredGrandchildren[] => {
  const grandchildrens: ScoredGrandchildren[] = [];
  childrenBoards.forEach((board) => {
    const possibleBoards = getPossibleBoardsFromCurrent(board);
    possibleBoards.forEach((possibleBoard) => {
      grandchildrens.push({
        board: possibleBoard,
        score: boardScoreCityBlock(possibleBoard),
        parent: board,
      });
    });
  });

  const sortedGrandchildrens = grandchildrens.sort((a, b) => a.score - b.score);
  return sortedGrandchildrens;
};

export const solvePuzzleTwoLayers = (board: Board): Position[] => {
  const solution: Position[] = [];

  while (!isBoardSolved(board)) {
    const possibleBoards: Board[] = getPossibleBoardsFromCurrent(board);

    //child boards that are possible and not repeted
    const filteredBoards: Board[] = possibleBoards.filter((board) => {
      const hashedBoard = sha1(board.toString()).slice(0, 7);
      return !alreadyVisitedBoards.includes(hashedBoard);
    });

    // Verify if children boards are solved
    for (let i = 0; i < filteredBoards.length; i++) {
      const childBoard = filteredBoards[i];
      if (isBoardSolved(childBoard)) {
        const hashedBoard = sha1(childBoard.toString()).slice(0, 7);
        alreadyVisitedBoards.push(hashedBoard);
        const move = getTileMoved(board, childBoard);
        solution.push(move);
        return solution;
      }
    }

    if (filteredBoards.length !== 0) {
      const grandchildrensInOrder: ScoredGrandchildren[] =
        getGrandchildrensInOrder(filteredBoards);

      let chosenMove = false;

      for (let i = 0; i < grandchildrensInOrder.length; i++) {
        const grandchildren = grandchildrensInOrder[i];
        const hashedBoard = sha1(grandchildren.board.toString()).slice(0, 7);
        if (!alreadyVisitedBoards.includes(hashedBoard)) {
          solution.push(getTileMoved(board, grandchildren.parent));
          board = grandchildren.parent;
          const hashedBoard = sha1(board.toString()).slice(0, 7);
          alreadyVisitedBoards.push(hashedBoard);
          chosenMove = true;
          break;
        }
      }

      if (!chosenMove) {
        const index = Math.floor(Math.random() * filteredBoards.length);
        const randomBoard = filteredBoards[index];
        solution.push(getTileMoved(board, randomBoard));
        board = randomBoard;
      }
    } else {
      const randomIndex = Math.floor(Math.random() * possibleBoards.length);
      const randomBoard = possibleBoards[randomIndex];
      solution.push(getTileMoved(board, randomBoard));
      board = randomBoard;
    }
  }
  return solution;
};

export const getTileMoved = (board: Board, newBoard: Board): Position => {
  const possibleMoves = getPossibleMoves(board);
  let tileMoved: Position = { x: 0, y: 0 };
  possibleMoves.forEach((move) => {
    if (moveHelper(move, board).toString() === newBoard.toString()) {
      tileMoved = move;
    }
  });
  return tileMoved;
};
