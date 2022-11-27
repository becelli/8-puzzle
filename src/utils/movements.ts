import { Board, Position, ScoredBoard, ScoredPosition } from './types';
import { DateTime } from 'luxon';
import { createHash } from 'crypto';
import { generateInitialBoard } from './board';

type Hash = string;
const alreadyVisitedBoards = new Set();
/**
 *
 * @param board Tabuleiro atual
 * @returns Hash do tabuleiro para ser usado como chave no Set
 */
const getBoardHash = (board: Board) => {
  return createHash('md5').update(board.toString()).digest('hex').slice(0, 6);
};

/**
 *
 * @param boardHash Hash do tabuleiro atual a ser adicionado ao Set
 */
const addBoardToVisited = (boardHash: Hash): void => {
  alreadyVisitedBoards.add(boardHash);
};
/**
 *
 * @param boardHash Hash do tabuleiro atual a ser verificado no Set
 * @returns verdadeiro se o tabuleiro já foi visitado. Falso caso contrário
 */
const wasBoardVisited = (boardHash: Hash): boolean => {
  return alreadyVisitedBoards.has(boardHash);
};

/**
 *
 * @param board1 Tabuleiro atual
 * @param board2 Tabuleiro filho
 * @returns Retorna verdadeiro se ambos os tabuleiros são iguais. Falso caso contrário
 */
export const areBoardsEqual = (board1: Board, board2: Board): boolean => {
  return board1.toString() === board2.toString();
};

/**
 *
 * @param position Quadradinho que deseja-se verificar se pode mover
 * @param board Tabuleiro atual
 * @returns Retorna verdadeiro se o quadradinho pode ser movido. Falso caso contrário
 */
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

/**
 *
 * @param board Tabuleiro atual
 * @returns Encontra a posição vazia no tabuleiro
 */
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

/**
 *
 * @param possibleMoves Lista de possíveis movimentos
 * @param board Tabuleiro atual
 * @returns Retorna os movimentos legais
 */
const filterMoves = (possibleMoves: Array<Position>, board: Board): Array<Position> => {
  return possibleMoves.filter((position) => canMove(position, board));
};

/**
 *
 * @param board Tabuleiro atual
 * @param moves Quantidade de movimentos que deseja-se fazer
 * @returns Retorna MOVES movimentos aleatórios
 */
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
    const possibleMovesFiltered: Position[] = filterMoves(possibleMoves, newBoard);
    const randomIndex: number = Math.floor(Math.random() * possibleMovesFiltered.length);
    newBoard = moveHelper(possibleMovesFiltered[randomIndex], newBoard);
  }
  return newBoard;
};

/**
 *
 * @param position Posição que deseja-se mover
 * @param board Tabuleiro atual
 * @returns Retorna o tabuleiro com a posição movida
 */
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

/**
 *
 * @param board Tabuleiro atual
 * @returns Retorna verdadeiro se o tabuleiro está resolvido. Falso caso contrário
 */
export const isBoardSolved = (board: Board): boolean => {
  const side = board.length;
  const initialBoard = generateInitialBoard(side);
  return areBoardsEqual(board, initialBoard);
};

/**
 *
 * @param board Tabuleiro atual
 * @returns Retorna a pontuação do tabuleiro (Quanto menor, melhor)
 */
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

/**
 *
 * @param board Tabuleiro atual
 * @returns Resolução com busca gulosa, olhando os filhos do tabuleiro atual
 */
export const solveGreedyOneLayer = (board: Board): Position[] => {
  alreadyVisitedBoards.clear();
  const startTime = DateTime.now();
  const solution: Position[] = solvePuzzleGreedy(board);
  const endTime = DateTime.now();
  const duration = endTime.diff(startTime, 'milliseconds').toObject().milliseconds;
  console.table({
    Heurística: 'Gulosa - filho',
    Movimentos: solution.length,
    'Tempo (ms)': duration,
  });
  return solution;
};

/**
 *
 * @param board Tabuleiro atual
 * @returns Resolução com busca gulosa, olhando os netos do tabuleiro atual
 */
export const solveGreedyTwoLayer = (board: Board): Position[] => {
  alreadyVisitedBoards.clear();

  const startTime = DateTime.now();
  const solution: Position[] = solvePuzzleGreedyGrandson(board);
  const endTime = DateTime.now();
  const duration = endTime.diff(startTime, 'milliseconds').toObject().milliseconds;
  console.table({
    Heurística: 'Gulosa - neto',
    Movimentos: solution.length,
    'Tempo (ms)': duration,
  });
  return solution;
};

/**
 *
 * @param board Tabuleiro atual
 * @returns Resolução com busca gulosa, classificando os filhos do tabuleiro atual conforme a média das pontuações dos netos
 */
export const solveCustom = (board: Board): Position[] => {
  alreadyVisitedBoards.clear();

  const startTime = DateTime.now();
  const solution: Position[] = solvePuzzleCustom(board);
  const endTime = DateTime.now();
  const duration = endTime.diff(startTime, 'milliseconds').toObject().milliseconds;
  console.table({
    Heurística: 'Gulosa - média dos netos',
    Movimentos: solution.length,
    'Tempo (ms)': duration,
  });
  return solution;
};

/**
 *
 * @param board Tabuleiro atual
 * @returns Obter os movimentos possíveis a partir do tabuleiro atual
 */
export const getPossibleMoves = (board: Board): Position[] => {
  const emptyPosition: Position = findEmptyPosition(board);
  const { x, y } = emptyPosition;
  const possibleMoves: Array<Position> = [
    { x: x - 1, y },
    { x: x + 1, y },
    { x, y: y - 1 },
    { x, y: y + 1 },
  ];
  const possibleMovesFiltered: Array<Position> = filterMoves(possibleMoves, board);

  return possibleMovesFiltered;
};

/**
 *
 * @param board Tabuleiro atual
 * @returns Retorna os melhores movimentos em ordem a partir do tabuleiro atual
 */
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

/**
 *
 * @param board Tabuleiro atual
 * @returns Retorna apenas os movimentos possíveis a partir do tabuleiro atual
 */
export const getPossibleBoardsFromCurrent = (board: Board): Board[] => {
  const possibleMoves = getPossibleMoves(board);
  const possibleBoards = possibleMoves.map((position) => moveHelper(position, board));
  return possibleBoards;
};

/**
 *
 * @param board Tabuleiro atual
 * @returns Soluciona o tabuleiro com busca gulosa, olhando os filhos do tabuleiro atual
 */
export const solvePuzzleGreedy = (board: Board): Position[] => {
  // return the tiles that need to be moved to solve the board
  const solution: Position[] = [];

  while (!isBoardSolved(board)) {
    const bestMovesInOrder: ScoredPosition[] = getBestMovesInOrder(board);

    let chosenMove = false;

    for (let i = 0; i < bestMovesInOrder.length; i++) {
      const move = bestMovesInOrder[i];
      const newBoard = moveHelper(move.position, board);
      const hashedBoard = getBoardHash(newBoard);
      if (!wasBoardVisited(hashedBoard)) {
        solution.push(move.position);
        board = newBoard;
        addBoardToVisited(hashedBoard);
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

/**
 *
 * @param board Tabuleiro atual
 * @param reverse Se a busca deve ser feita de trás pra frente
 * @returns Obtém os tabuleiros filhos do tabuleiro atual em ordem de pontuação
 */
export const getPossibleBoardsInOrder = (board: Board, reverse: boolean = false) => {
  const possibleBoards = getPossibleBoardsFromCurrent(board);
  const scoredBoards = possibleBoards.map((board) => {
    return {
      board,
      score: boardScoreCityBlock(board),
    };
  });

  const sortedBoards = scoredBoards.sort((a, b) => (reverse ? b.score - a.score : a.score - b.score));
  return sortedBoards;
};

type ScoredGrandchildren = {
  board: Board;
  score: number;
  parent: Board;
};

/**
 *
 * @param childrenBoards Filhos do tabuleiro atual
 * @returns Retorna os netos do tabuleiro atual
 */
export const getGrandchildrensInOrder = (childrenBoards: Board[]): ScoredGrandchildren[] => {
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

/**
 *
 * @param board Tabuleiro atual
 * @returns Soluciona o tabuleiro com busca gulosa, olhando os netos do tabuleiro atual
 */
export const solvePuzzleGreedyGrandson = (board: Board): Position[] => {
  const solution: Position[] = [];

  while (!isBoardSolved(board)) {
    const possibleBoards: Board[] = getPossibleBoardsFromCurrent(board);

    //child boards that are possible and not repeated
    const filteredBoards: Board[] = possibleBoards.filter((board) => {
      const hashedBoard = getBoardHash(board);
      return !wasBoardVisited(hashedBoard);
    });

    // Verify if children boards are solved
    for (let i = 0; i < filteredBoards.length; i++) {
      const childBoard = filteredBoards[i];
      if (isBoardSolved(childBoard)) {
        const hashedBoard = getBoardHash(childBoard);
        addBoardToVisited(hashedBoard);
        const move = getTileMoved(board, childBoard);
        solution.push(move);
        return solution;
      }
    }

    if (filteredBoards.length !== 0) {
      const grandchildrensInOrder: ScoredGrandchildren[] = getGrandchildrensInOrder(filteredBoards);

      let chosenMove = false;

      for (let i = 0; i < grandchildrensInOrder.length; i++) {
        const grandchildren = grandchildrensInOrder[i];
        const hashedBoard = getBoardHash(grandchildren.board);
        if (!wasBoardVisited(hashedBoard)) {
          solution.push(getTileMoved(board, grandchildren.parent));
          board = grandchildren.parent;
          const hashedBoard = getBoardHash(board);
          addBoardToVisited(hashedBoard);
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

/**
 *
 * @param board Tabuleiro atual
 * @param newBoard Novo tabuleiro
 * @returns Retorna a posição do tile (quadradinho) que foi movido
 */
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

/**
 *
 * @param board Tabuleiro atual
 * @returns Resolve o tabuleiro com busca gulosa, classificando os filhos do tabuleiro atual conforme a pontuação dos netos
 */
export const solvePuzzleCustom = (board: Board): Position[] => {
  const solution: Position[] = [];

  while (!isBoardSolved(board)) {
    const possibleBoards: Board[] = getPossibleBoardsFromCurrent(board);

    //child boards that are possible and not repeated
    const filteredBoards: Board[] = possibleBoards.filter((board) => {
      const hashedBoard = getBoardHash(board);
      return !wasBoardVisited(hashedBoard);
    });

    // Verify if children boards are solved
    for (let i = 0; i < filteredBoards.length; i++) {
      const childBoard = filteredBoards[i];
      if (isBoardSolved(childBoard)) {
        const hashedBoard = getBoardHash(childBoard);
        addBoardToVisited(hashedBoard);
        const move = getTileMoved(board, childBoard);
        solution.push(move);
        return solution;
      }
    }

    if (filteredBoards.length !== 0) {
      const childrenScores: ScoredBoard[] = filteredBoards.map((childBoard) => {
        const meanScore = getChildMeanScore(childBoard);
        return {
          board: childBoard,
          score: meanScore,
        };
      });

      let chosenMove = false;

      //get best least avarege score
      const childrenScoresInOrder = childrenScores.sort((a, b) => a.score - b.score);

      for (let i = 0; i < childrenScoresInOrder.length; i++) {
        const childScore = childrenScoresInOrder[i];
        const hashedBoard = getBoardHash(childScore.board);
        if (!wasBoardVisited(hashedBoard)) {
          solution.push(getTileMoved(board, childScore.board));
          board = childScore.board;
          const hashedBoard = getBoardHash(board);
          addBoardToVisited(hashedBoard);
          chosenMove = true;
          break;
        }
      }

      if (!chosenMove) {
        const index = Math.floor(Math.random() * filteredBoards.length);
        const randomBoard = filteredBoards[index];
        const tileMoved = getTileMoved(board, randomBoard);
        solution.push(tileMoved);
        board = randomBoard;
      }
    } else {
      const randomIndex = Math.floor(Math.random() * possibleBoards.length);
      const randomBoard = possibleBoards[randomIndex];
      const tileMoved = getTileMoved(board, randomBoard);
      solution.push(tileMoved);
      board = randomBoard;
    }
  }
  return solution;
};

/**
 *
 * @param childBoard Tabuleiro filho
 * @returns Retorna a média das pontuações dos netos do tabuleiro filho
 */
const getChildMeanScore = (childBoard: Board): number => {
  const childrens = getPossibleBoardsFromCurrent(childBoard);
  const meanScore = childrens.reduce((acc, curr) => acc + boardScoreCityBlock(curr), 0) / childrens.length;
  return meanScore;
};
