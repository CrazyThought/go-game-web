import { StoneColor, BoardSize } from './types';
import type { Position } from './types';

export function createEmptyBoard(size: number): StoneColor[][] {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => StoneColor.Empty));
}

export function cloneBoard(board: StoneColor[][]): StoneColor[][] {
  return board.map((row) => [...row]);
}

export function getAdjacentPositions(pos: Position, boardSize: number): Position[] {
  const positions: Position[] = [];
  if (pos.x > 0) positions.push({ x: pos.x - 1, y: pos.y });
  if (pos.x < boardSize - 1) positions.push({ x: pos.x + 1, y: pos.y });
  if (pos.y > 0) positions.push({ x: pos.x, y: pos.y - 1 });
  if (pos.y < boardSize - 1) positions.push({ x: pos.x, y: pos.y + 1 });
  return positions;
}

export function getGroup(board: StoneColor[][], pos: Position): Position[] {
  const size = board.length;
  const color = board[pos.y][pos.x];
  if (color === StoneColor.Empty) return [];

  const group: Position[] = [];
  const visited = new Set<string>();
  const queue: Position[] = [pos];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const key = `${current.x},${current.y}`;
    if (visited.has(key)) continue;
    visited.add(key);
    group.push(current);

    for (const adj of getAdjacentPositions(current, size)) {
      const adjKey = `${adj.x},${adj.y}`;
      if (!visited.has(adjKey) && board[adj.y][adj.x] === color) {
        queue.push(adj);
      }
    }
  }
  return group;
}

export function countLiberties(board: StoneColor[][], group: Position[]): number {
  const size = board.length;
  const liberties = new Set<string>();
  for (const stone of group) {
    for (const adj of getAdjacentPositions(stone, size)) {
      if (board[adj.y][adj.x] === StoneColor.Empty) {
        liberties.add(`${adj.x},${adj.y}`);
      }
    }
  }
  return liberties.size;
}

export function removeGroup(board: StoneColor[][], group: Position[]): void {
  for (const pos of group) {
    board[pos.y][pos.x] = StoneColor.Empty;
  }
}

export function getStarPoints(boardSize: BoardSize): Position[] {
  const size = boardSize as number;
  if (size === 9) {
    const pts = [2, 6];
    const points: Position[] = [];
    for (const x of pts) for (const y of pts) points.push({ x, y });
    points.push({ x: 4, y: 4 });
    return points;
  }
  if (size === 13) {
    const pts = [3, 9];
    const points: Position[] = [];
    for (const x of pts) for (const y of pts) points.push({ x, y });
    points.push({ x: 6, y: 6 });
    return points;
  }
  const pts = [3, 9, 15];
  const points: Position[] = [];
  for (const x of pts) for (const y of pts) points.push({ x, y });
  return points;
}

export function opponentColor(color: StoneColor): StoneColor {
  if (color === StoneColor.Black) return StoneColor.White;
  if (color === StoneColor.White) return StoneColor.Black;
  return StoneColor.Empty;
}