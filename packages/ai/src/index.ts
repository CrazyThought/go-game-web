import type { GameState, Position } from '@go-game/core';

export enum AIDifficulty {
  Beginner = 1,
  Intermediate = 2,
  Advanced = 3,
  Expert = 4,
}

export interface AIMove {
  position: Position;
  confidence: number;
  thinkingTime: number;
}

export interface IAIService {
  setDifficulty(level: AIDifficulty): void;
  getBestMove(state: GameState): Promise<AIMove>;
  stop(): void;
}

export class MockAIService implements IAIService {
  private difficulty: AIDifficulty = AIDifficulty.Beginner;

  setDifficulty(level: AIDifficulty): void {
    this.difficulty = level;
  }

  async getBestMove(state: GameState): Promise<AIMove> {
    const delay = this.difficulty === AIDifficulty.Beginner ? 300 : 800;
    await new Promise((r) => setTimeout(r, delay));

    const emptyPositions: Position[] = [];
    const size = state.boardSize as number;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (state.board[y][x] === 'empty') {
          emptyPositions.push({ x, y });
        }
      }
    }

    const randomPos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)] || { x: 0, y: 0 };
    return {
      position: randomPos,
      confidence: 0.5,
      thinkingTime: delay,
    };
  }

  stop(): void {}
}