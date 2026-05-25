import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { GoGame, BoardSize, StoneColor } from '@go-game/core';
import type { GameState, PlaceResult } from '@go-game/core';

export const useGameStore = defineStore('game', () => {
  const goGame = ref(new GoGame(BoardSize.Large));
  const gameState = computed<Readonly<GameState>>(() => goGame.value.getState());

  function placeStone(x: number, y: number): PlaceResult {
    return goGame.value.placeStone(x, y);
  }

  function undo(): boolean {
    return goGame.value.undoMove();
  }

  function pass(): void {
    goGame.value.pass();
  }

  function resign(): void {
    goGame.value.resign();
  }

  function reset(boardSize?: BoardSize): void {
    if (boardSize !== undefined) {
      goGame.value.setBoardSize(boardSize);
    } else {
      goGame.value.reset();
    }
  }

  function startSimulation(): boolean {
    return goGame.value.startSimulation();
  }

  function endSimulation(): void {
    goGame.value.endSimulation();
  }

  function applySimulation(): boolean {
    return goGame.value.applySimulation();
  }

  function loadGame(data: string): boolean {
    return goGame.value.deserialize(data);
  }

  function setBoardSize(size: BoardSize): void {
    goGame.value.setBoardSize(size);
  }

  function exportToSGF(): string {
    return goGame.value.exportToSGF();
  }

  function importFromSGF(sgf: string): boolean {
    return goGame.value.importFromSGF(sgf);
  }

  function markDeadStones(deadStones: { x: number; y: number }[]): void {
    goGame.value.markDeadStones(deadStones);
  }

  function canUndo(): boolean {
    return goGame.value.canUndo();
  }

  function calculateTerritory(deadStones: { x: number; y: number }[] = []) {
    return goGame.value.calculateTerritory(deadStones);
  }

  return {
    goGame,
    gameState,
    placeStone,
    undo,
    pass,
    resign,
    reset,
    startSimulation,
    endSimulation,
    applySimulation,
    loadGame,
    setBoardSize,
    exportToSGF,
    importFromSGF,
    markDeadStones,
    canUndo,
    calculateTerritory,
  };
});