import { useState, useEffect } from 'react';
import { generateInitialBoard, generateCustomBoard } from '../utils/board';
import { Board, Position } from '../utils/types';
import { solveGreedyTwoLayer, solveCustom, solveGreedyOneLayer, areBoardsEqual } from '../utils/movements';
import { moveHelper, shuffle, isBoardSolved } from '../utils/movements';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { encode } from 'js-base64';

const Button = ({ onClick, theme, children }: { onClick: () => void; children: any; theme: ColorPalette }) => {
  return (
    <button
      onClick={onClick}
      className={`mx-1 text-lg font-medium px-2 py-2 m-1 rounded-md focus:outline-none focus:ring-2 ${theme.focusBg600} ${theme.bg500} ${theme.hoverBg600}`}
    >
      {children}
    </button>
  );
};

export default function EightPuzzle({ theme }: { theme: ColorPalette }) {
  const router = useRouter();
  const initial = generateCustomBoard(router.query.game as string);

  // Estados necessários para controlar o jogo
  const [personalActivated, setPersonalActivated] = useState(false);
  const [boardSize, setBoardSize] = useState<number>(initial.length);
  const [board, setBoard] = useState<Board>(initial);
  const [savedBoard, setSavedBoard] = useState<Board>(generateInitialBoard(boardSize));
  const [savedBoardMoves, setSavedBoardMoves] = useState<number>(0);
  const [totalMoves, setTotalMoves] = useState<number>(0);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [animationQueue, setAnimationQueue] = useState<Array<Position>>([]);
  const [animationSpeed, setAnimationSpeed] = useState<number>(100);
  const [shuffleMoves, setShuffleMoves] = useState<number>(100);

  const incrementTotalMoves = () => setTotalMoves(totalMoves + 1);

  // Movimentação do bloco vazio
  const move = (position: Position, board: Board): Board => {
    const newBoard = moveHelper(position, board);
    setBoard(newBoard);
    if (!areBoardsEqual(newBoard, board)) incrementTotalMoves();
    return newBoard;
  };

  // "Lidadores" de eventos
  const handleShuffle = () => {
    const newBoard = shuffle(board, shuffleMoves);
    setBoard(newBoard);
    setTotalMoves(0);
  };

  const handleSolveGreedySon = () => {
    const solution: Array<Position> = solveGreedyOneLayer(board);
    setAnimationQueue(solution);
  };

  const handleSolveGreedyGranchildren = () => {
    const solution: Array<Position> = solveGreedyTwoLayer(board);
    setAnimationQueue(solution);
  };

  const handleSolveCustom = () => {
    const solution: Array<Position> = solveCustom(board);
    setPersonalActivated(true);
    setAnimationQueue(solution);
  };

  const handleMove = (position: Position) => {
    const newBoard = move(position, board);
    setBoard(newBoard);
    if (isBoardSolved(newBoard)) alert('Parabéns, você venceu!');
  };

  const handleReset = () => {
    const initialBoard = generateInitialBoard(boardSize);
    setBoard(initialBoard);
    setPersonalActivated(false);
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

  // Fila de animação: executa a animação de acordo com a fila
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

    if (animationQueue.length === 0) {
      const game = encode(board.toString());
      router.replace({ query: { game } }, undefined, { shallow: true });
    }
  }, [board]);

  // Funções para colorir o tabuleiro de acordo com o tema
  const tileColor = (value: number) =>
    value === 0 ? `${theme.bg600}` : `${theme.bg500}  ${theme.hoverBg600} ${theme.focusBg600}`;

  const tileSize = () => {
    if (boardSize === 3) return 'px-12 py-9';
    if (boardSize === 4) return 'px-7 py-5 sm:px-12 sm:py-9';
    if (boardSize === 5) return 'px-4 py-3 sm:px-12 sm:py-9';
  };

  return (
    <div
      className={`flex flex-col items-center justify-center h-full md:h-screen w-full text-black ${
        personalActivated ? 'md:text-white' : 'md:text-black'
      }`}
    >
      <div className="flex flex-col items-center justify-center w-full p-4">
        <div className={`grid gap-1 grid-cols-${boardSize}`}>
          {board.map((row, i) => {
            return row.map((value, j) => {
              return (
                <button
                  key={`${i}-${j}`}
                  onClick={() => handleMove({ x: i, y: j })}
                  className={`${tileColor(
                    value,
                  )} font-medium text-4xl rounded-md focus:outline-none focus:ring-2  ${tileSize()}`}
                >
                  {value === 0 ? '' : value}
                </button>
              );
            });
          })}
        </div>
        <div className="flex flex-col mt-2">
          <div className="flex flex-row items-center justify-center mt-2">
            <div className="flex flex-col items-center justify-center">
              <label htmlFor="totalMoves">Movimentos</label>
              <h1>{totalMoves}</h1>
            </div>
            <div className="flex flex-col items-center mb-1.5  ml-5">
              <label htmlFor="isSolved">Resolvido?</label>
              <input id="isSolved" type="checkbox" checked={isSolved} className="w-32" readOnly />
            </div>
          </div>
          <div className="flex flex-row items-center justify-center">
            <Button theme={theme} onClick={handleShuffle}>
              Embaralhar
            </Button>
            <Button theme={theme} onClick={handleReset}>
              Reiniciar
            </Button>
          </div>
          <div className="flex flex-row items-center justify-center">
            <Button theme={theme} onClick={handleSave}>
              Salvar atual
            </Button>
            <Button theme={theme} onClick={handleLoad}>
              Restaurar
            </Button>
          </div>
          <h1 className="text-xl font-bold text-center">técnicas de resolução (gulosas)</h1>
          <div className="flex flex-wrap items-center justify-center">
            <Button theme={theme} onClick={handleSolveGreedySon}>
              Melhor filho
            </Button>
            <Button theme={theme} onClick={handleSolveGreedyGranchildren}>
              Melhor neto
            </Button>
            <Button theme={theme} onClick={handleSolveCustom}>
              Vovô feliz
            </Button>
          </div>
        </div>
        <div className="flex flex-row flex-wrap items-center justify-center mt-2">
          <div className="flex flex-col items-center justify-center text-center">
            <label htmlFor="animationSpeed">
              Velocidade da animação (ms)
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
            <label htmlFor="shuffleMoves">Movimentos de embaralhamento</label>
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
            <label htmlFor="boardSize">Tamanho do tabuleiro</label>
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
      </div>
      {personalActivated && (
        <div className="absolute hidden w-full h-full bg-black md:block -z-10 ">
          <Image
            src="/rick-roll.gif"
            {...{
              fill: true,
              style: {
                objectPosition: '30% 30%',
                objectFit: 'cover',
                opacity: '60%',
              },
            }}
            alt="Rick Roll"
            className="blur-md"
          />
        </div>
      )}
    </div>
  );
}

/**
 *
 * @returns Cor do tema a ser utilizado
 */
export async function getServerSideProps() {
  const themes: ColorPalette[] = [
    {
      bg500: 'bg-red-500',
      bg600: 'bg-red-600',
      hoverBg600: 'hover:bg-red-700',
      focusBg600: 'focus:ring-red-600',
    },
    {
      bg500: 'bg-orange-500',
      bg600: 'bg-orange-600',
      hoverBg600: 'hover:bg-orange-700',
      focusBg600: 'focus:ring-orange-600',
    },
    {
      bg500: 'bg-amber-500',
      bg600: 'bg-amber-600',
      hoverBg600: 'hover:bg-amber-700',
      focusBg600: 'focus:ring-amber-600',
    },
    {
      bg500: 'bg-yellow-500',
      bg600: 'bg-yellow-600',
      hoverBg600: 'hover:bg-yellow-700',
      focusBg600: 'focus:ring-yellow-600',
    },
    {
      bg500: 'bg-lime-500',
      bg600: 'bg-lime-600',
      hoverBg600: 'hover:bg-lime-700',
      focusBg600: 'focus:ring-lime-600',
    },
    {
      bg500: 'bg-green-500',
      bg600: 'bg-green-600',
      hoverBg600: 'hover:bg-green-700',
      focusBg600: 'focus:ring-green-600',
    },
    {
      bg500: 'bg-emerald-500',
      bg600: 'bg-emerald-600',
      hoverBg600: 'hover:bg-emerald-700',
      focusBg600: 'focus:ring-emerald-600',
    },
    {
      bg500: 'bg-teal-500',
      bg600: 'bg-teal-600',
      hoverBg600: 'hover:bg-teal-700',
      focusBg600: 'focus:ring-teal-600',
    },
    {
      bg500: 'bg-cyan-500',
      bg600: 'bg-cyan-600',
      hoverBg600: 'hover:bg-cyan-700',
      focusBg600: 'focus:ring-cyan-600',
    },
    {
      bg500: 'bg-sky-500',
      bg600: 'bg-sky-600',
      hoverBg600: 'hover:bg-sky-700',
      focusBg600: 'focus:ring-sky-600',
    },
    {
      bg500: 'bg-blue-500',
      bg600: 'bg-blue-600',
      hoverBg600: 'hover:bg-blue-700',
      focusBg600: 'focus:ring-blue-600',
    },
    {
      bg500: 'bg-indigo-500',
      bg600: 'bg-indigo-600',
      hoverBg600: 'hover:bg-indigo-700',
      focusBg600: 'focus:ring-indigo-600',
    },
    {
      bg500: 'bg-violet-500',
      bg600: 'bg-violet-600',
      hoverBg600: 'hover:bg-violet-700',
      focusBg600: 'focus:ring-violet-600',
    },
    {
      bg500: 'bg-purple-500',
      bg600: 'bg-purple-600',
      hoverBg600: 'hover:bg-purple-700',
      focusBg600: 'focus:ring-purple-600',
    },
    {
      bg500: 'bg-fuchsia-500',
      bg600: 'bg-fuchsia-600',
      hoverBg600: 'hover:bg-fuchsia-700',
      focusBg600: 'focus:ring-fuchsia-600',
    },
    {
      bg500: 'bg-pink-500',
      bg600: 'bg-pink-600',
      hoverBg600: 'hover:bg-pink-700',
      focusBg600: 'focus:ring-pink-600',
    },
    {
      bg500: 'bg-rose-500',
      bg600: 'bg-rose-600',
      hoverBg600: 'hover:bg-rose-700',
      focusBg600: 'focus:ring-rose-600',
    },
  ];

  const index = Math.floor(Math.random() * themes.length);
  return {
    props: {
      theme: themes[index],
    },
  };
}

type ColorPalette = {
  bg500: string;
  bg600: string;
  hoverBg600: string;
  focusBg600: string;
};
