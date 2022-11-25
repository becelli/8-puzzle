import { Board } from './types';

export const generateInitialBoard = (N: number): Board => {
  const board: Board = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => i * N + j + 1)).map(
    (row, i) => (i === N - 1 ? row.slice(0, -1).concat(0) : row),
  );
  return board;
};
