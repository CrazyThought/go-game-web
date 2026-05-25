import { StoneColor } from './types';
import type { Position, TerritoryResult } from './types';
import { getAdjacentPositions } from './board';

export function calculateTerritory(
  board: StoneColor[][],
  capturedBlack: number,
  capturedWhite: number,
  deadStones: Position[] = [],
): TerritoryResult {
  const size = board.length;
  const tempBoard = board.map((row) => [...row]);

  for (const pos of deadStones) {
    if (pos.x >= 0 && pos.x < size && pos.y >= 0 && pos.y < size) {
      tempBoard[pos.y][pos.x] = StoneColor.Empty;
    }
  }

  const visited = new Set<string>();
  let blackTerritory = 0;
  let whiteTerritory = 0;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const key = `${x},${y}`;
      if (visited.has(key)) continue;
      if (tempBoard[y][x] !== StoneColor.Empty) continue;

      const region: Position[] = [];
      const borders = new Set<StoneColor>();
      const queue: Position[] = [{ x, y }];

      while (queue.length > 0) {
        const current = queue.shift()!;
        const cKey = `${current.x},${current.y}`;
        if (visited.has(cKey)) continue;
        visited.add(cKey);

        if (tempBoard[current.y][current.x] === StoneColor.Empty) {
          region.push(current);
          for (const adj of getAdjacentPositions(current, size)) {
            const adjKey = `${adj.x},${adj.y}`;
            if (!visited.has(adjKey)) {
              if (tempBoard[adj.y][adj.x] === StoneColor.Empty) {
                queue.push(adj);
              } else {
                borders.add(tempBoard[adj.y][adj.x]);
              }
            }
          }
        }
      }

      const hasBlack = borders.has(StoneColor.Black);
      const hasWhite = borders.has(StoneColor.White);

      if (hasBlack && !hasWhite) {
        blackTerritory += region.length;
      } else if (hasWhite && !hasBlack) {
        whiteTerritory += region.length;
      }
    }
  }

  const blackTotal = blackTerritory + capturedWhite;
  const whiteTotal = whiteTerritory + capturedBlack;

  return {
    blackTerritory,
    whiteTerritory,
    blackCaptured: capturedBlack,
    whiteCaptured: capturedWhite,
    blackTotal,
    whiteTotal,
    deadStones,
  };
}