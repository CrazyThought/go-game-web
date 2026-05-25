import { StoneColor, BoardSize } from './types';
import type { GameState, Move, PlaceResult, Position, TerritoryResult } from './types';
import {
  cloneBoard,
  countLiberties,
  createEmptyBoard,
  getAdjacentPositions,
  getGroup,
  opponentColor,
  removeGroup,
} from './board';
import { calculateTerritory } from './territory';
import { generateSGF, parseSGF as parseSGFText } from './sgf';

function createInitialState(boardSize: BoardSize): GameState {
  return {
    boardSize,
    board: createEmptyBoard(boardSize as number),
    currentPlayer: StoneColor.Black,
    moveHistory: [],
    capturedBlack: 0,
    capturedWhite: 0,
    lastKoPosition: null,
    isGameOver: false,
    winner: null,
    territory: {
      blackTerritory: 0,
      whiteTerritory: 0,
      blackCaptured: 0,
      whiteCaptured: 0,
      blackTotal: 0,
      whiteTotal: 0,
      deadStones: [],
    },
    isSimulationMode: false,
    simulationMoves: [],
    preSimulationState: null,
    consecutivePasses: 0,
  };
}

export class GoGame {
  private state: GameState;
  private maxUndoSteps: number;

  constructor(boardSize: BoardSize = BoardSize.Large, maxUndoSteps: number = -1) {
    this.state = createInitialState(boardSize);
    this.maxUndoSteps = maxUndoSteps;
  }

  getState(): Readonly<GameState> {
    return this.state;
  }

  getCurrentPlayer(): StoneColor {
    return this.state.currentPlayer;
  }

  isGameOver(): boolean {
    return this.state.isGameOver;
  }

  setBoardSize(size: BoardSize): void {
    this.state = createInitialState(size);
  }

  placeStone(x: number, y: number): PlaceResult {
    if (this.state.isGameOver) {
      return { success: false, error: '游戏已结束' };
    }

    const size = this.state.boardSize as number;
    if (x < 0 || x >= size || y < 0 || y >= size) {
      return { success: false, error: '落子位置超出棋盘范围' };
    }

    if (this.state.board[y][x] !== StoneColor.Empty) {
      return { success: false, error: '该位置已有棋子' };
    }

    if (
      this.state.lastKoPosition &&
      this.state.lastKoPosition.x === x &&
      this.state.lastKoPosition.y === y
    ) {
      return { success: false, error: '打劫规则：禁止立即提回' };
    }

    const currentColor = this.state.currentPlayer;
    const board = cloneBoard(this.state.board);
    board[y][x] = currentColor;

    const capturedStones: Position[] = [];
    const opponent = opponentColor(currentColor);

    for (const adj of getAdjacentPositions({ x, y }, size)) {
      if (board[adj.y][adj.x] === opponent) {
        const group = getGroup(board, adj);
        if (countLiberties(board, group) === 0) {
          for (const pos of group) {
            capturedStones.push(pos);
          }
          removeGroup(board, group);
        }
      }
    }

    const selfGroup = getGroup(board, { x, y });
    const selfLiberties = countLiberties(board, selfGroup);

    if (selfLiberties === 0 && capturedStones.length === 0) {
      return { success: false, error: '禁止自杀' };
    }

    let nextKoPosition: Position | null = null;
    if (capturedStones.length === 1 && selfLiberties === 1) {
      nextKoPosition = capturedStones[0];
    }

    this.state.board = board;
    this.state.consecutivePasses = 0;

    if (currentColor === StoneColor.Black) {
      this.state.capturedWhite += capturedStones.length;
    } else {
      this.state.capturedBlack += capturedStones.length;
    }

    const step = this.state.isSimulationMode
      ? this.state.simulationMoves.length + 1
      : this.state.moveHistory.length + 1;

    const move: Move = {
      color: currentColor,
      position: { x, y },
      step,
      capturedStones,
    };

    if (this.state.isSimulationMode) {
      this.state.simulationMoves.push(move);
    } else {
      this.state.moveHistory.push(move);
    }

    this.state.lastKoPosition = nextKoPosition;
    this.state.currentPlayer = opponent;

    this.updateTerritory();

    return { success: true };
  }

  pass(): void {
    if (this.state.isGameOver) return;

    const currentColor = this.state.currentPlayer;

    if (this.state.isSimulationMode) {
      this.state.simulationMoves.push({
        color: currentColor,
        position: null,
        step: this.state.simulationMoves.length + 1,
        capturedStones: [],
      });
    } else {
      this.state.moveHistory.push({
        color: currentColor,
        position: null,
        step: this.state.moveHistory.length + 1,
        capturedStones: [],
      });
    }

    this.state.consecutivePasses++;
    this.state.currentPlayer = opponentColor(currentColor);
  }

  resign(): void {
    if (this.state.isSimulationMode) return;

    this.state.isGameOver = true;
    this.state.winner = opponentColor(this.state.currentPlayer);
  }

  canUndo(): boolean {
    if (this.state.isSimulationMode) {
      return this.state.simulationMoves.length > 0;
    }
    return this.state.moveHistory.length > 0;
  }

  undoMove(): boolean {
    if (this.state.isSimulationMode) {
      return this.undoSimulationMove();
    }

    if (this.state.moveHistory.length === 0) return false;

    if (this.maxUndoSteps > 0 && this.state.moveHistory.length > this.maxUndoSteps) {
      return false;
    }

    const lastMove = this.state.moveHistory.pop()!;

    if (lastMove.position) {
      this.state.board[lastMove.position.y][lastMove.position.x] = StoneColor.Empty;

      for (const pos of lastMove.capturedStones) {
        this.state.board[pos.y][pos.x] = opponentColor(lastMove.color);
      }

      if (lastMove.color === StoneColor.Black) {
        this.state.capturedWhite -= lastMove.capturedStones.length;
      } else {
        this.state.capturedBlack -= lastMove.capturedStones.length;
      }
    }

    this.state.currentPlayer = lastMove.color;

    if (this.state.moveHistory.length >= 2) {
      const prevPass = this.state.moveHistory[this.state.moveHistory.length - 1];
      this.state.consecutivePasses =
        prevPass.position === null
          ? Math.max(0, this.state.consecutivePasses - 1)
          : 0;
    } else {
      this.state.consecutivePasses = 0;
    }

    this.recomputeKoPosition();
    this.updateTerritory();

    return true;
  }

  calculateTerritory(deadStones: Position[] = []): TerritoryResult {
    return calculateTerritory(
      this.state.board,
      this.state.capturedBlack,
      this.state.capturedWhite,
      deadStones,
    );
  }

  markDeadStones(deadStones: Position[]): void {
    this.state.territory = this.calculateTerritory(deadStones);
  }

  startSimulation(): boolean {
    if (this.state.isSimulationMode || this.state.isGameOver) return false;

    this.state.preSimulationState = JSON.parse(JSON.stringify(this.state));
    this.state.isSimulationMode = true;
    this.state.simulationMoves = [];
    return true;
  }

  endSimulation(): void {
    if (!this.state.isSimulationMode || !this.state.preSimulationState) return;

    this.state = this.state.preSimulationState;
    this.state.preSimulationState = null;
    this.state.isSimulationMode = false;
    this.state.simulationMoves = [];
  }

  applySimulation(): boolean {
    if (!this.state.isSimulationMode || !this.state.preSimulationState) return false;

    this.state.moveHistory.push(...this.state.simulationMoves);
    this.state.simulationMoves = [];
    this.state.preSimulationState = null;
    this.state.isSimulationMode = false;
    return true;
  }

  serialize(): string {
    return JSON.stringify(this.state);
  }

  deserialize(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      this.state = parsed as GameState;
      return true;
    } catch {
      return false;
    }
  }

  exportToSGF(): string {
    return generateSGF(this.state.boardSize as number, this.state.moveHistory);
  }

  importFromSGF(sgf: string): boolean {
    try {
      const { boardSize, moves } = parseSGFText(sgf);
      this.state = createInitialState(boardSize as BoardSize);
      this.state.boardSize = boardSize as BoardSize;
      this.state.board = createEmptyBoard(boardSize);

      for (const move of moves) {
        if (move.position) {
          this.state.board[move.position.y][move.position.x] = move.color;
          this.state.moveHistory.push(move);
          this.state.currentPlayer = opponentColor(move.color);
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  reset(): void {
    this.state = createInitialState(this.state.boardSize);
  }

  private updateTerritory(): void {
    this.state.territory = this.calculateTerritory();
  }

  private recomputeKoPosition(): void {
    if (this.state.moveHistory.length === 0) {
      this.state.lastKoPosition = null;
      return;
    }

    const last = this.state.moveHistory[this.state.moveHistory.length - 1];
    if (
      last.capturedStones.length === 1 &&
      last.position &&
      countLiberties(this.state.board, getGroup(this.state.board, last.position)) === 1
    ) {
      this.state.lastKoPosition = last.capturedStones[0];
    } else {
      this.state.lastKoPosition = null;
    }
  }

  private undoSimulationMove(): boolean {
    if (this.state.simulationMoves.length === 0) return false;

    const lastMove = this.state.simulationMoves.pop()!;

    if (lastMove.position) {
      this.state.board[lastMove.position.y][lastMove.position.x] = StoneColor.Empty;

      for (const pos of lastMove.capturedStones) {
        this.state.board[pos.y][pos.x] = opponentColor(lastMove.color);
      }

      if (lastMove.color === StoneColor.Black) {
        this.state.capturedWhite -= lastMove.capturedStones.length;
      } else {
        this.state.capturedBlack -= lastMove.capturedStones.length;
      }
    }

    this.state.currentPlayer = lastMove.color;
    this.updateTerritory();
    return true;
  }
}