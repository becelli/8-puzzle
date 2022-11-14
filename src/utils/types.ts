export type Board = Array<Array<number>>;
export type Position = {
  x: number;
  y: number;
};
export type ScoredPosition = {
  position: Position;
  score: number;
};
export type ScoredBoard = {
  board: Board;
  score: number;
};
