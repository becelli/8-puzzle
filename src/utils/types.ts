export type Board = Array<Array<number>>;
export type Position = {
  x: number;
  y: number;
};

export type Tree = {
  board: Board;
  score: number;
  child: Tree[];
};
