import { useState, useEffect, useRef } from "react";
import { generateInitialBoard } from "../utils/board";
import { Board, Position } from "../utils/types";
import {
  canMove,
  findEmptyPosition,
  moveHelper,
  shuffle,
  solve,
  isBoardSolved,
} from "../utils/movements";

const Button = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children: any;
}) => {
  return (
    <button
      onClick={onClick}
      className={`mx-1 text-xl font-bold p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-600 bg-violet-200 hover:bg-violet-300`}
    >
      {children}
    </button>
  );
};

export default function EightPuzzle() {
  const [boardSize, setBoardSize] = useState<number>(3);
  const [board, setBoard] = useState<Board>(generateInitialBoard(boardSize));

  const [totalMoves, setTotalMoves] = useState<number>(0);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [animationQueue, setAnimationQueue] = useState<Array<Position>>([]);
  const [animationSpeed, setAnimationSpeed] = useState<number>(100);
  const [shuffleMoves, setShuffleMoves] = useState<number>(100);

  const incrementTotalMoves = () => setTotalMoves(totalMoves + 1);

  const move = (position: Position, board: Board): Board => {
    const result: Board = moveHelper(position, board);
    if (result != board) incrementTotalMoves();
    return result;
  };

  const handleShuffle = () => {
    setBoard(shuffle(board, shuffleMoves));
    setTotalMoves(0);
  };

  const handleSolve = () => {
    const solution: Array<Position> = solve(board);
    setAnimationQueue(solution);
  };

  const handleMove = (position: Position) => {
    setBoard(move(position, board));
  };

  const handleReset = () => {
    const initialBoard = generateInitialBoard(boardSize);
    setBoard(initialBoard);
    setTotalMoves(0);
  };

  const handleAnimationSpeedChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAnimationSpeed(parseInt(e.target.value));
  };

  const handleShuffleMovesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShuffleMoves(parseInt(e.target.value));
  };

  useEffect(() => {
    if (animationQueue.length === 0) return;

    const timeout = setTimeout(() => {
      setBoard(move(animationQueue[0], board));
      incrementTotalMoves();
      setAnimationQueue(animationQueue.slice(1));
    }, animationSpeed);
    return () => clearTimeout(timeout);
  }, [animationQueue]);

  useEffect(() => {
    if (isBoardSolved(board)) setIsSolved(true);
    else setIsSolved(false);
  }, [board]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center">
        <div className={`grid gap-1 grid-cols-${boardSize}`}>
          {board.map((row, i) => {
            return row.map((value, j) => {
              return (
                <button
                  key={`${i}-${j}`}
                  onClick={() => handleMove({ x: i, y: j })}
                  className={`${
                    value === 0
                      ? "bg-violet-300"
                      : "bg-violet-200 hover:bg-violet-300"
                  }  font-bold px-12 py-8 text-4xl rounded-md focus:outline-none focus:ring-2 focus:ring-violet-600`}
                >
                  {value === 0 ? "" : value}
                </button>
              );
            });
          })}
        </div>
        <div className="flex flex-row items-center justify-center mt-2">
          <Button onClick={handleShuffle}>Embaralhar</Button>
          <Button onClick={handleSolve}>Resolver</Button>
          <Button onClick={handleReset}>Resetar</Button>
        </div>
        <div className="flex flex-row items-center justify-center mt-2">
          <div className="flex flex-col items-center justify-center text-center">
            <label htmlFor="animationSpeed">
              Velocidade da
              <br />
              animação
            </label>
            <input
              id="animationSpeed"
              type="range"
              min="0"
              max="1000"
              value={animationSpeed}
              onChange={handleAnimationSpeedChange}
              className="w-32"
            />
            <span>{animationSpeed}ms</span>
          </div>
          <div className="flex flex-col items-center justify-center ml-2 text-center">
            <label htmlFor="shuffleMoves">
              Movimentos de
              <br />
              embaralhamento
            </label>
            <input
              id="shuffleMoves"
              type="range"
              min="0"
              max="100"
              value={shuffleMoves}
              onChange={handleShuffleMovesChange}
              className="w-32"
            />
            <span>{shuffleMoves}</span>
          </div>
        </div>
        <div className="flex flex-row items-center justify-center mt-2">
          <div className="flex flex-col items-center justify-center">
            <label htmlFor="totalMoves">Total de movimentos</label>
            <input
              id="totalMoves"
              type="number"
              value={totalMoves}
              className="w-32 text-center"
              readOnly
              disabled
            />
          </div>
          <div className="flex flex-col items-center justify-center ml-2">
            <label htmlFor="isSolved">Resolvido</label>
            <input
              id="isSolved"
              type="checkbox"
              checked={isSolved}
              className="w-32"
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
}
