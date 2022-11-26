import { Board } from './types';
// decode base64 string  to Uint8Array
import { decode } from 'js-base64';
import { Console } from 'console';

export const generateInitialBoard = (N: number): Board => {
  const board: Board = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => i * N + j + 1)).map(
    (row, i) => (i === N - 1 ? row.slice(0, -1).concat(0) : row),
  );
  return board;
};

export const generateCustomBoard = (sequence: string): Board => {
  if (!sequence) return generateInitialBoard(3);
  const decoded = decode(sequence)
    .split(',')
    .map((item) => parseInt(item, 10));

  const root = decoded ? Math.floor(Math.sqrt(decoded.length)) : 3;
  if (decoded.length === root * root && new Set(decoded).size === decoded.length) {
    // Verify if contains all numbers from 0 to N² - 1
    const sortedSequence = decoded.slice().sort((a, b) => a - b);
    const containsAllNumbers = sortedSequence.every((n, i) => n === i);
    if (containsAllNumbers) {
      const board: Board = Array.from({ length: root }, (_, i) =>
        Array.from({ length: root }, (_, j) => decoded[i * root + j]),
      );

      return board;
    }
  }
  return generateInitialBoard(root);
};
