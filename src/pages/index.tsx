import { useState, useEffect, useRef } from "react";

type Board = Array<Array<number>>;
type Position = {
  x: number;
  y: number;
};

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
      className="mx-1 bg-yellow-200 hover:bg-yellow-300 text-xl font-bold p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600"
    >
      {children}
    </button>
  );
};

export default function EightPuzzle() {
  const [board, setBoard] = useState<Board>([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 0],
  ]);
  const [initialBoard, setInitialBoard] = useState<Board>([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 0],
  ]);
  const [totalMoves, setTotalMoves] = useState<number>(0);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [animation, setAnimation] = useState<boolean>(false);
  const [animationQueue, setAnimationQueue] = useState<Array<Position>>([]);
  const [animationSpeed, setAnimationSpeed] = useState<number>(100);

  const [shuffleMoves, setShuffleMoves] = useState<number>(100);

  const incrementTotalMoves = () => setTotalMoves(totalMoves + 1);

  const findEmptyPosition = (board: Board): Position => {
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] === 0) {
          return { x: i, y: j };
        }
      }
    }
    return { x: -1, y: -1 };
  };

  const canMove = (position: Position, board: Board): boolean => {
    const { x, y } = position;
    if (x < 0 || x >= board.length || y < 0 || y >= board[x].length)
      return false;

    const emptyPosition: Position = findEmptyPosition(board);
    if (emptyPosition === null) return false;
    const { x: emptyX, y: emptyY } = emptyPosition;
    if (x === emptyX && y === emptyY) return false;
    if (x === emptyX && Math.abs(y - emptyY) === 1) return true;
    if (y === emptyY && Math.abs(x - emptyX) === 1) return true;
    return false;
  };

  const move = (position: Position, board: Board): Board => {
    const { x, y } = position;
    if (!canMove(position, board)) return board;
    const newBoard: Board = JSON.parse(JSON.stringify(board));
    const emptyPosition: Position = findEmptyPosition(newBoard);
    const { x: emptyX, y: emptyY } = emptyPosition;
    newBoard[emptyX][emptyY] = newBoard[x][y];
    newBoard[x][y] = 0;
    incrementTotalMoves();
    return newBoard;
  };

  const filterMoves = (possibleMoves: Array<Position>, board: Board) => {
    return possibleMoves.filter((position) => canMove(position, board));
  };

  const shuffle = (board: Board, moves: number): Board => {
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
      newBoard = move(possibleMovesFiltered[randomIndex], newBoard);
    }
    return newBoard;
  };

  const isSolvedBoard = (board: Board): boolean => {
    return JSON.stringify(board) === JSON.stringify(initialBoard);
  };

  const solve = (board: Board): Array<Position> => {
    // TODO: Implement a solver
    return [];
  };

  const handleShuffle = () => {
    setBoard(shuffle(board, shuffleMoves));
    setTotalMoves(0);
    setIsSolved(false);
  };

  const handleSolve = () => {
    const solution: Array<Position> = solve(board);
    setAnimationQueue(solution);
    setAnimation(true);
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
    if (animationQueue.length === 0) {
      setAnimation(false);
      return;
    }
    const timeout = setTimeout(() => {
      setBoard(move(animationQueue[0], board));
      setTotalMoves(totalMoves + 1);
      setAnimationQueue(animationQueue.slice(1));
    }, animationSpeed);
    return () => clearTimeout(timeout);
  }, [animationQueue]);
  // }, [animationQueue, animationSpeed, board, totalMoves]);

  useEffect(() => {
    if (isSolvedBoard(board)) setIsSolved(true);
    else setIsSolved(false);
  }, [board]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center">
        <div className="grid grid-cols-3 gap-1">
          {board.map((row, i) => {
            return row.map((value, j) => {
              return (
                <button
                  key={`${i}-${j}`}
                  onClick={() => setBoard(move({ x: i, y: j }, board))}
                  className={`${
                    value === 0
                      ? "bg-yellow-300"
                      : "bg-yellow-200 hover:bg-yellow-300"
                  } text-2xl font-bold px-12 py-8 text-5xl rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600`}
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
          <Button onClick={() => setBoard(initialBoard)}>Resetar</Button>
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
