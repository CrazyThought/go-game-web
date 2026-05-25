import { onMounted, onUnmounted } from 'vue';
import { useGame } from './useGame';
import { useUIStore } from '../stores/uiStore';
import { useGameStore } from '../stores/gameStore';

export function useKeyboard() {
  const { handleUndo } = useGame();
  const uiStore = useUIStore();
  const gameStore = useGameStore();

  function handleKeyDown(e: KeyboardEvent) {
    const isCtrl = e.ctrlKey || e.metaKey;

    if (isCtrl && e.key === 'z') {
      e.preventDefault();
      handleUndo();
      return;
    }

    if (isCtrl && e.key === 's') {
      e.preventDefault();
      if (!gameStore.gameState.isSimulationMode && !gameStore.gameState.isGameOver) {
        uiStore.showSaveModal = true;
      }
      return;
    }

    if (isCtrl && e.key === 'n') {
      e.preventDefault();
      uiStore.showNewGameConfirm = true;
      return;
    }

    if (e.key === 'Escape') {
      if (uiStore.showSaveModal) uiStore.showSaveModal = false;
      if (uiStore.showLoadModal) uiStore.showLoadModal = false;
      if (uiStore.showNewGameConfirm) uiStore.showNewGameConfirm = false;
      return;
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown);
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });
}