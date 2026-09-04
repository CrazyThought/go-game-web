import { useGameStore } from '../stores/gameStore';
import { useUIStore } from '../stores/uiStore';
import type { BoardSize } from '@go-game/core';

export function useGame() {
  const gameStore = useGameStore();
  const uiStore = useUIStore();

  function handlePlaceStone(pos: { x: number; y: number }) {
    if (gameStore.gameState.isGameOver) return;

    const result = gameStore.placeStone(pos.x, pos.y);
    if (!result.success) {
      uiStore.toast(result.error || '落子失败', 'error');
      return;
    }

    if (gameStore.gameState.consecutivePasses >= 2) {
      uiStore.showDeadStoneMarker = true;
      uiStore.toast('双方连续停手，请标记死棋以计算最终目数', 'info');
    }
  }

  function handleUndo() {
    const success = gameStore.undo();
    if (!success) {
      uiStore.toast('无法悔棋', 'warning');
    }
  }

  function handlePass() {
    gameStore.pass();
    if (gameStore.gameState.consecutivePasses >= 2) {
      uiStore.showDeadStoneMarker = true;
      uiStore.toast('双方连续停手，请标记死棋以计算最终目数', 'info');
    }
  }

  function handleResign() {
    gameStore.resign();
    uiStore.showGameOverModal = true;
  }

  function handleNewGame() {
    uiStore.showNewGameConfirm = true;
  }

  function handleBoardSizeChange(size: BoardSize) {
    uiStore.pendingBoardSize = size;
    uiStore.showNewGameConfirm = true;
  }

  function confirmNewGame() {
    if (uiStore.pendingBoardSize !== null) {
      gameStore.reset(uiStore.pendingBoardSize);
      uiStore.selectedBoardSize = uiStore.pendingBoardSize;
      uiStore.pendingBoardSize = null;
    } else {
      gameStore.reset();
    }
    uiStore.showNewGameConfirm = false;
  }

  function cancelNewGame() {
    uiStore.pendingBoardSize = null;
    uiStore.showNewGameConfirm = false;
  }

  function handleStartSimulation() {
    const success = gameStore.startSimulation();
    if (!success) {
      uiStore.toast('无法开启模拟模式', 'warning');
    }
  }

  function handleEndSimulation() {
    gameStore.endSimulation();
    uiStore.toast('已关闭模拟模式', 'info');
  }

  function handleApplySimulation() {
    const success = gameStore.applySimulation();
    if (success) {
      uiStore.toast('模拟步骤已应用', 'success');
    }
  }

  return {
    handlePlaceStone,
    handleUndo,
    handlePass,
    handleResign,
    handleNewGame,
    handleBoardSizeChange,
    confirmNewGame,
    cancelNewGame,
    handleStartSimulation,
    handleEndSimulation,
    handleApplySimulation,
  };
}
