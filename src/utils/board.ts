import { Board } from './types';
import { decode } from 'js-base64';

/**
 *
 * @param N número de linhas e colunas do tabuleiro
 * @returns tabuleiro NxN
 */
export const generateInitialBoard = (N: number): Board => {
  const board: Board = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => i * N + j + 1)).map(
    (row, i) => (i === N - 1 ? row.slice(0, -1).concat(0) : row),
  );
  return board;
};

/**
 *
 * @param sequence uma sequência de números separados por vírgula, que representa o tabuleiro NxN
 * @returns tabuleiro NxN
 */
export const generateCustomBoard = (sequence: string): Board => {
  if (!sequence) return generateInitialBoard(3);
  const decoded = decode(sequence)
    .split(',')
    .map((item) => parseInt(item, 10));

  const N = Math.floor(Math.sqrt(decoded.length));
  if (decoded.length === N * N) {
    const sortedSequence = decoded.slice().sort((a, b) => a - b);
    const containsAllNumbers = sortedSequence.every((n, i) => n === i);
    if (containsAllNumbers) {
      const board: Board = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => decoded[i * N + j]));

      return board;
    }
  }
  return generateInitialBoard(N || 3);
};
