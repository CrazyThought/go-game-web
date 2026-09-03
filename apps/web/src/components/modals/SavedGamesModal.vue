<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { GameStorage } from '@go-game/storage';
import BaseModal from '../BaseModal.vue';
import type { SavedGame, GameState } from '@go-game/core';
import { BOARD_SIZE_LABELS, generateSGF } from '@go-game/core';
import { useGameStore } from '../../stores/gameStore';

const emit = defineEmits<{
  close: [];
}>();

const router = useRouter();
const gameStore = useGameStore();
const storage = GameStorage.getInstance();

const games = ref<SavedGame[]>([]);
const loading = ref(true);
const openMenuId = ref<string | null>(null);
const menuPos = ref<{ top: number; left: number } | null>(null);
const downloadGameId = ref<string | null>(null);

onMounted(async () => {
  try {
    games.value = await storage.getAllSavedGames();
  } finally {
    loading.value = false;
  }
});

function toggleMenu(id: string, event?: MouseEvent) {
  if (openMenuId.value === id) {
    openMenuId.value = null;
    menuPos.value = null;
    return;
  }
  openMenuId.value = id;
  if (event) {
    const btn = event.currentTarget as HTMLElement;
    const rect = btn.getBoundingClientRect();
    menuPos.value = { top: rect.bottom + 4, left: rect.right - 120 };
  }
}

async function handleEnterGame(saved: SavedGame) {
  const success = gameStore.loadGame(saved.gameData);
  if (success) {
    router.push('/game');
    emit('close');
  }
}

async function handleDelete(id: string) {
  await storage.deleteGame(id);
  games.value = games.value.filter((g) => g.id !== id);
  openMenuId.value = null;
  menuPos.value = null;
}

function handleDownload(id: string) {
  downloadGameId.value = id;
  openMenuId.value = null;
  menuPos.value = null;
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

function exportJSON() {
  const game = games.value.find((g) => g.id === downloadGameId.value);
  if (!game) return;
  const filename = `${game.name || 'go-game'}-${new Date().toISOString().slice(0, 10)}.json`;
  triggerDownload(game.gameData, filename, 'application/json');
  downloadGameId.value = null;
}

function exportSGF() {
  const game = games.value.find((g) => g.id === downloadGameId.value);
  if (!game) return;
  try {
    const state: GameState = JSON.parse(game.gameData);
    const sgf = generateSGF(state.boardSize as number, state.moveHistory);
    const filename = `${game.name || 'go-game'}-${new Date().toISOString().slice(0, 10)}.sgf`;
    triggerDownload(sgf, filename, 'application/x-go-sgf');
  } catch {
    // silently fail if game data can't be parsed
  }
  downloadGameId.value = null;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString();
}
</script>

<template>
  <BaseModal body-class="max-h-[80vh] flex flex-col" @close="emit('close')">
      <div class="flex items-center justify-between p-6 pb-3">
        <h2 class="text-lg font-bold text-gray-800">现有棋局</h2>
        <button
          class="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-6 pb-6 min-h-[300px] space-y-2">
        <div v-if="loading" class="text-center text-gray-400 py-8">加载中...</div>
        <div v-else-if="games.length === 0" class="text-center text-gray-400 py-8">暂无保存的棋局</div>
        <div
          v-for="game in games"
          :key="game.id"
          class="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors relative"
        >
          <div class="flex items-start justify-between">
            <div class="min-w-0 flex-1">
              <div class="font-medium text-sm text-gray-800 truncate">{{ game.name }}</div>
              <div class="text-xs text-gray-400 mt-0.5">
                {{ BOARD_SIZE_LABELS[game.boardSize] }} · {{ game.totalMoves }} 手 · {{ formatDate(game.updatedAt) }}
              </div>
              <div v-if="game.note" class="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{{ game.note }}</div>
            </div>
            <div class="flex items-center gap-1 shrink-0 ml-2">
              <button
                class="w-7 h-7 flex items-center justify-center text-sm bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors"
                title="进入棋局"
                @click="handleEnterGame(game)"
              >
                ▶
              </button>
              <div>
                <button
                  class="w-7 h-7 flex items-center justify-center text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                  title="更多选项"
                  @click.stop="toggleMenu(game.id, $event)"
                >
                  ⋯
                </button>
                <div
                  v-if="openMenuId === game.id"
                  class="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-[60] min-w-[120px]"
                  :style="menuPos ? { top: menuPos.top + 'px', left: menuPos.left + 'px' } : {}"
                  @click.stop
                >
                  <button
                    class="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    @click="handleDelete(game.id)"
                  >
                    删除
                  </button>
                  <button
                    class="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    @click="handleDownload(game.id)"
                  >
                    下载到本地
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    <!-- Download Format Modal -->
    <div
      v-if="downloadGameId"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      @click.self="downloadGameId = null"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-xs mx-4 p-6 text-center">
        <h3 class="text-base font-bold text-gray-800 mb-4">导出格式</h3>
        <div class="flex justify-center gap-3">
          <button
            class="px-5 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            @click="exportJSON"
          >
            导出 JSON
          </button>
          <button
            class="px-5 py-2 text-sm bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
            @click="exportSGF"
          >
            导出 SGF
          </button>
        </div>
        <button
          class="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          @click="downloadGameId = null"
        >
          取消
        </button>
      </div>
    </div>
  </BaseModal>
</template>
