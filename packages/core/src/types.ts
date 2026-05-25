export enum StoneColor {
  Black = 'black',
  White = 'white',
  Empty = 'empty',
}

export enum BoardSize {
  Small = 9,
  Medium = 13,
  Large = 19,
}

export enum GameStatus {
  Playing = 'playing',
  GameOver = 'game_over',
  Simulation = 'simulation',
}

export interface Position {
  x: number;
  y: number;
}

export interface Move {
  color: StoneColor;
  position: Position | null;
  step: number;
  capturedStones: Position[];
}

export interface TerritoryResult {
  blackTerritory: number;
  whiteTerritory: number;
  blackCaptured: number;
  whiteCaptured: number;
  blackTotal: number;
  whiteTotal: number;
  deadStones: Position[];
}

export interface GameState {
  boardSize: BoardSize;
  board: StoneColor[][];
  currentPlayer: StoneColor;
  moveHistory: Move[];
  capturedBlack: number;
  capturedWhite: number;
  lastKoPosition: Position | null;
  isGameOver: boolean;
  winner: StoneColor | null;
  territory: TerritoryResult;
  isSimulationMode: boolean;
  simulationMoves: Move[];
  preSimulationState: GameState | null;
  consecutivePasses: number;
}

export interface SavedGame {
  id: string;
  name: string;
  note: string;
  boardSize: BoardSize;
  createdAt: string;
  updatedAt: string;
  gameData: string;
  totalMoves: number;
}

export interface PlaceResult {
  success: boolean;
  error?: string;
}

export const BOARD_SIZE_LABELS: Record<BoardSize, string> = {
  [BoardSize.Small]: '9×9',
  [BoardSize.Medium]: '13×13',
  [BoardSize.Large]: '19×19',
};

export const DEFAULT_KOMI = 6.5;