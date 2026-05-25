import { defineStore } from 'pinia';
import { ref } from 'vue';
import { BoardSize } from '@go-game/core';

export const useUIStore = defineStore('ui', () => {
  const showSaveModal = ref(false);
  const showLoadModal = ref(false);
  const showGameOverModal = ref(false);
  const showDeadStoneMarker = ref(false);
  const showSimHistory = ref(false);
  const showNewGameConfirm = ref(false);
  const showExitConfirm = ref(false);
  const selectedBoardSize = ref(BoardSize.Large);
  const pendingBoardSize = ref<BoardSize | null>(null);
  const toasts = ref<Array<{ id: number; message: string; type: 'success' | 'error' | 'warning' | 'info' }>>([]);

  let nextToastId = 0;

  function toast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
    const id = nextToastId++;
    toasts.value.push({ id, message, type });
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, 3000);
  }

  function dismissToast(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  return {
    showSaveModal,
    showLoadModal,
    showGameOverModal,
    showDeadStoneMarker,
    showSimHistory,
    showNewGameConfirm,
    showExitConfirm,
    selectedBoardSize,
    pendingBoardSize,
    toasts,
    toast,
    dismissToast,
  };
});