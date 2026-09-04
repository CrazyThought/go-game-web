import type { Move, Position } from './types';
import { StoneColor } from './types';
import { createEmptyBoard } from './board';

const SGF_COLUMNS = 'abcdefghijklmnopqrs';

function posToSgf(pos: Position): string {
  return SGF_COLUMNS[pos.x] + SGF_COLUMNS[pos.y];
}

function sgfToPos(sgf: string): Position | null {
  if (!sgf || sgf.length < 2) return null;
  if (sgf === 'tt') return null;
  const x = SGF_COLUMNS.indexOf(sgf[0]);
  const y = SGF_COLUMNS.indexOf(sgf[1]);
  if (x === -1 || y === -1) return null;
  return { x, y };
}

export function generateSGF(boardSize: number, moves: Move[], komi: number = 6.5): string {
  const lines: string[] = [];
  lines.push('(;');
  lines.push(`GM[1]`);
  lines.push(`SZ[${boardSize}]`);
  lines.push(`KM[${komi}]`);
  lines.push(`AP[go-game-monorepo:0.1.0]`);

  for (const move of moves) {
    if (move.position === null) {
      lines.push(';' + (move.color === StoneColor.Black ? 'B[]' : 'W[]'));
    } else {
      const sgf = posToSgf(move.position);
      lines.push(';' + (move.color === StoneColor.Black ? `B[${sgf}]` : `W[${sgf}]`));
    }
  }

  lines.push(')');
  return lines.join('\n');
}

export function parseSGF(sgf: string): { boardSize: number; moves: Move[]; komi: number } {
  const moves: Move[] = [];
  let boardSize = 19;
  let komi = 6.5;
  let step = 0;

  const szMatch = sgf.match(/SZ\[(\d+)\]/);
  if (szMatch) boardSize = parseInt(szMatch[1], 10);

  const kmMatch = sgf.match(/KM\[([\d.]+)\]/);
  if (kmMatch) komi = parseFloat(kmMatch[1]);

  const moveRegex = /;(B|W)\[([a-s]{2}|)\]/g;
  let match: RegExpExecArray | null;

  while ((match = moveRegex.exec(sgf)) !== null) {
    const color = match[1] === 'B' ? StoneColor.Black : StoneColor.White;
    const coord = match[2];
    step++;

    if (coord === '') {
      moves.push({ color, position: null, step, capturedStones: [] });
    } else {
      const pos = sgfToPos(coord);
      if (pos) {
        moves.push({ color, position: pos, step, capturedStones: [] });
      }
    }
  }

  return { boardSize, moves, komi };
}

export function replayMoves(
  boardSize: number,
  moves: Move[],
): { board: StoneColor[][]; capturedBlack: number; capturedWhite: number } {
  const board = createEmptyBoard(boardSize);
  const capturedBlack = 0;
  const capturedWhite = 0;

  for (const move of moves) {
    if (move.position) {
      board[move.position.y][move.position.x] = move.color;
    }
  }

  return { board, capturedBlack, capturedWhite };
}
