import { useState, useEffect } from 'react';
import { generateInitialBoard } from '../utils/board';
import { Board, Position } from '../utils/types';
import { solveGreedyTwoLayer, solveCustom, solveGreedyOneLayer } from '../utils/movements';
import { moveHelper, shuffle, isBoardSolved } from '../utils/movements';
import Image from 'next/image';

const Button = ({ onClick, children }: { onClick: () => void; children: any }) => {
  return (
    <button
      onClick={onClick}
      className={`mx-1 text-xl font-medium p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600 bg-amber-500 hover:bg-amber-600`}
    >
      {children}
    </button>
  );
};

export default function EightPuzzle() {
  const [personalActivated, setPersonalActivated] = useState(false);
  const [boardSize, setBoardSize] = useState<number>(3);
  const [board, setBoard] = useState<Board>(generateInitialBoard(boardSize));
  const [savedBoard, setSavedBoard] = useState<Board>(generateInitialBoard(boardSize));
  const [savedBoardMoves, setSavedBoardMoves] = useState<number>(0);
  const [totalMoves, setTotalMoves] = useState<number>(0);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [animationQueue, setAnimationQueue] = useState<Array<Position>>([]);
  const [animationSpeed, setAnimationSpeed] = useState<number>(100);
  const [shuffleMoves, setShuffleMoves] = useState<number>(100);

  const incrementTotalMoves = () => setTotalMoves(totalMoves + 1);

  const move = (position: Position, board: Board): Board => {
    const result: Board = moveHelper(position, board);
    if (result.toString() !== board.toString()) incrementTotalMoves();
    return result;
  };

  const handleShuffle = () => {
    setBoard(shuffle(board, shuffleMoves));
    setTotalMoves(0);
  };

  const handleSolveGreedy = () => {
    const solution: Array<Position> = solveGreedyOneLayer(board);
    setAnimationQueue(solution);
  };

  const handleSolveAStar = () => {
    const solution: Array<Position> = solveGreedyTwoLayer(board);
    setAnimationQueue(solution);
  };

  const handleSolveCustom = () => {
    const solution: Array<Position> = solveCustom(board);
    setPersonalActivated(true);
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

  const handleSave = () => {
    setSavedBoard(board);
    setSavedBoardMoves(totalMoves);
  };

  const handleLoad = () => {
    setBoard(savedBoard);
    setTotalMoves(savedBoardMoves);
  };

  const handleAnimationSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnimationSpeed(parseInt(e.target.value));
  };

  const handleShuffleMovesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShuffleMoves(parseInt(e.target.value));
  };

  const handleBoardSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const integer = parseInt(e.target.value);
    setBoardSize(integer);
    setBoard(generateInitialBoard(integer));
    setTotalMoves(0);
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
    <div
      className={`flex flex-col items-center justify-center h-screen ${
        personalActivated ? 'text-white' : 'text-black'
      }`}
    >
      <div className="flex flex-col items-center justify-center">
        <div className={`grid gap-1 grid-cols-${boardSize}`}>
          {board.map((row, i) => {
            return row.map((value, j) => {
              return (
                <button
                  key={`${i}-${j}`}
                  onClick={() => handleMove({ x: i, y: j })}
                  className={`${
                    value === 0 ? 'bg-amber-600' : 'bg-amber-500 hover:bg-amber-600'
                  }  font-medium px-12 py-8 text-4xl rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600`}
                >
                  {value === 0 ? '' : value}
                </button>
              );
            });
          })}
        </div>
        <div className="flex flex-col">
          <div className="flex flex-row items-center justify-center mt-2">
            <Button onClick={handleShuffle}>Shuffle</Button>
            <Button onClick={handleReset}>Restart</Button>
          </div>
          <div className="flex flex-row items-center justify-center mt-2">
            <Button onClick={handleSave}>Save board</Button>
            <Button onClick={handleLoad}>Load save</Button>
          </div>
          <h1 className="text-xl font-bold text-center">Solving techniques (greedy)</h1>
          <div className="flex items-center justify-center mt-2 flex-fow">
            <Button onClick={handleSolveGreedy}>Best son</Button>
            <Button onClick={handleSolveAStar}>Best grandson</Button>
            <Button onClick={handleSolveCustom}>Happy grandfather</Button>
          </div>
        </div>
        <div className="flex flex-row items-center justify-center mt-2">
          <div className="flex flex-col items-center justify-center text-center">
            <label htmlFor="animationSpeed">
              Animation speed
              <br />
            </label>
            <input
              id="animationSpeed"
              type="range"
              min="0"
              max="1000"
              value={animationSpeed}
              onChange={handleAnimationSpeedChange}
              className="w-32 fill-red-100"
            />
            <span>{animationSpeed}ms</span>
          </div>
          <div className="flex flex-col items-center justify-center ml-2 text-center">
            <label htmlFor="shuffleMoves">Shuffle Moves</label>
            <input
              id="shuffleMoves"
              type="range"
              min="0"
              max="1000"
              value={shuffleMoves}
              disabled={animationQueue.length > 0}
              onChange={handleShuffleMovesChange}
              className="w-32"
            />
            <span>{shuffleMoves}</span>
          </div>

          <div className="flex flex-col items-center justify-center ml-2 text-center">
            <label htmlFor="boardSize">Board size</label>
            <input
              id="boardSize"
              type="range"
              min="3"
              max="5"
              value={boardSize}
              onChange={handleBoardSizeChange}
              disabled={animationQueue.length > 0}
              className="w-32"
            />
            <span>{boardSize}</span>
          </div>
        </div>
        <div className="flex flex-row items-center justify-center mt-2">
          <div className="flex flex-col items-center justify-center">
            <label htmlFor="totalMoves">Total Moves</label>
            <h1>{totalMoves}</h1>
          </div>
          <div className="flex flex-col items-center justify-center ml-2">
            <label htmlFor="isSolved">Solved?</label>
            <input id="isSolved" type="checkbox" checked={isSolved} className="w-32" readOnly />
          </div>
        </div>
      </div>
      {personalActivated && (
        <div className="absolute w-full h-full bg-black -z-10 blur-xl">
          <Image
            src="/rick-roll.gif"
            {...{
              fill: true,
              style: {
                objectFit: 'cover',
                objectPosition: 'center',
                opacity: '60%',
              },
            }}
            alt="Rick Roll"
          />
        </div>
      )}
    </div>
  );
}
