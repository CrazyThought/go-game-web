import { GameStorage } from '@go-game/storage';
import { useGameStore } from '../stores/gameStore';
import { useUIStore } from '../stores/uiStore';
import type { SavedGame } from '@go-game/core';

export function useStorage() {
  const storage = GameStorage.getInstance();
  const gameStore = useGameStore();
  const uiStore = useUIStore();

  async function saveCurrentGame(name: string, note: string) {
    const state = gameStore.gameState;
    const data: Omit<SavedGame, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      note,
      boardSize: state.boardSize,
      gameData: gameStore.goGame.serialize(),
      totalMoves: state.moveHistory.length,
    };
    const saved = await storage.saveGame(data);
    uiStore.toast(`棋局"${name}"已保存`, 'success');
    return saved;
  }

  async function loadSavedGames(page: number = 1, keyword?: string) {
    return storage.getSavedGames(page, 10, keyword);
  }

  async function loadGame(id: string, asSimulation: boolean = false) {
    const saved = await storage.getGameById(id);
    if (!saved) {
      uiStore.toast('棋局不存在', 'error');
      return;
    }
    const success = gameStore.loadGame(saved.gameData);
    if (!success) {
      uiStore.toast('棋局数据解析失败', 'error');
      return;
    }
    if (asSimulation) {
      gameStore.startSimulation();
    }
    uiStore.toast('棋局已加载', 'success');
  }

  async function loadFromJSON(json: string, asSimulation: boolean = false) {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(json);
    } catch {
      uiStore.toast('JSON 格式错误', 'error');
      return false;
    }
    const data = JSON.stringify(parsed);
    const success = gameStore.loadGame(data);
    if (!success) {
      uiStore.toast('棋局数据无效', 'error');
      return false;
    }
    if (asSimulation) {
      gameStore.startSimulation();
    }
    uiStore.toast('棋局已导入', 'success');
    return true;
  }

  async function deleteGame(id: string) {
    await storage.deleteGame(id);
    uiStore.toast('棋局已删除', 'info');
  }

  async function searchGames(keyword: string) {
    return storage.searchGames(keyword);
  }

  function exportJSON(): string {
    return gameStore.goGame.serialize();
  }

  function exportSGF(): string {
    return gameStore.exportToSGF();
  }

  function importFromSGF(sgf: string, asSimulation: boolean = false) {
    const success = gameStore.importFromSGF(sgf);
    if (!success) {
      uiStore.toast('SGF 格式解析失败', 'error');
      return false;
    }
    if (asSimulation) {
      gameStore.startSimulation();
    }
    uiStore.toast('SGF 棋谱已导入', 'success');
    return true;
  }

  function triggerDownload(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadJSON() {
    const json = exportJSON();
    const filename = `go-game-${new Date().toISOString().slice(0, 10)}.json`;
    triggerDownload(json, filename, 'application/json');
    uiStore.toast('JSON 已导出下载', 'success');
  }

  function downloadSGF() {
    const sgf = exportSGF();
    const filename = `go-game-${new Date().toISOString().slice(0, 10)}.sgf`;
    triggerDownload(sgf, filename, 'application/x-go-sgf');
    uiStore.toast('SGF 已导出下载', 'success');
  }

  return {
    saveCurrentGame,
    loadSavedGames,
    loadGame,
    loadFromJSON,
    deleteGame,
    searchGames,
    exportJSON,
    exportSGF,
    importFromSGF,
    downloadJSON,
    downloadSGF,
  };
}