<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { GoBoard, GameInfo, BoardSizeSelector, GameControls } from '@go-game/ui';
import { useGameStore } from '../stores/gameStore';
import { useUIStore } from '../stores/uiStore';
import { useGame } from '../composables/useGame';
import { useStorage } from '../composables/useStorage';
import { useKeyboard } from '../composables/useKeyboard';
import type { Position } from '@go-game/core';
import SaveGameModal from '../components/modals/SaveGameModal.vue';
import LoadGameModal from '../components/modals/LoadGameModal.vue';
import GameOverModal from '../components/modals/GameOverModal.vue';
import NewGameConfirm from '../components/modals/NewGameConfirm.vue';
import ExitConfirmModal from '../components/modals/ExitConfirmModal.vue';

useKeyboard();

const gameStore = useGameStore();
const uiStore = useUIStore();
const {
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
} = useGame();
const storage = useStorage();

const deadStones = ref<Position[]>([]);

const simMoves = computed(() =>
  gameStore.gameState.simulationMoves
    .filter((m) => m.position)
    .map((m) => ({ position: m.position!, step: m.step })),
);

function handleExport(format: 'json' | 'sgf') {
  if (format === 'json') {
    storage.downloadJSON();
  } else {
    storage.downloadSGF();
  }
}

function handleMarkDeadStone(pos: Position) {
  const idx = deadStones.value.findIndex((d) => d.x === pos.x && d.y === pos.y);
  if (idx >= 0) {
    deadStones.value.splice(idx, 1);
  } else {
    deadStones.value.push(pos);
  }
}

function confirmDeadStones() {
  gameStore.markDeadStones(deadStones.value);
  uiStore.showDeadStoneMarker = false;
  deadStones.value = [];

  gameStore.goGame.resign();
  gameStore.goGame.getState();
  uiStore.showGameOverModal = true;
}

const router = useRouter();

function handleExitClick() {
  uiStore.showExitConfirm = true;
}

function handleNewGameAfterOver() {
  uiStore.showGameOverModal = false;
  gameStore.reset();
}

function handleReplayAfterOver() {
  uiStore.showGameOverModal = false;
  gameStore.startSimulation();
}

function handleExitConfirm() {
  uiStore.showExitConfirm = false;
  gameStore.reset();
  router.push('/');
}
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <!-- Top Bar -->
    <header class="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button
            class="text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium"
            @click="handleExitClick"
          >
            ← 返回首页
          </button>
        </div>
        <div class="flex items-center gap-4">
          <BoardSizeSelector
            :model-value="uiStore.selectedBoardSize"
            @change="handleBoardSizeChange"
          />
          <span
            class="px-2 py-1 text-xs font-medium rounded"
            :class="{
              'bg-green-100 text-green-700':
                !gameStore.gameState.isGameOver && !gameStore.gameState.isSimulationMode,
              'bg-red-100 text-red-700': gameStore.gameState.isGameOver,
              'bg-blue-100 text-blue-700': gameStore.gameState.isSimulationMode,
            }"
          >
            {{
              gameStore.gameState.isGameOver
                ? '已结束'
                : gameStore.gameState.isSimulationMode
                  ? '模拟中'
                  : '进行中'
            }}
          </span>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 w-full p-4">
      <div class="flex flex-col lg:flex-row gap-4">
        <!-- Board -->
        <div class="flex-1 min-w-0 flex justify-center">
          <GoBoard
            :board-size="gameStore.gameState.boardSize"
            :board-state="gameStore.gameState.board"
            :last-move="
              gameStore.gameState.moveHistory.length > 0
                ? (gameStore.gameState.moveHistory[gameStore.gameState.moveHistory.length - 1]
                    ?.position ?? null)
                : null
            "
            :simulation-moves="simMoves"
            :dead-stones="deadStones"
            :disabled="gameStore.gameState.isGameOver && !uiStore.showDeadStoneMarker"
            :mark-mode="uiStore.showDeadStoneMarker"
            :current-player="gameStore.gameState.currentPlayer"
            @place-stone="handlePlaceStone"
            @mark-dead-stone="handleMarkDeadStone"
          />
        </div>

        <!-- Sidebar -->
        <aside class="w-full lg:w-[260px] shrink-0 space-y-4">
          <div class="relative">
            <GameInfo
              :territory="gameStore.gameState.territory"
              :current-player="gameStore.gameState.currentPlayer"
              :step-count="gameStore.gameState.moveHistory.length"
              :is-game-over="gameStore.gameState.isGameOver"
              :is-simulation-mode="gameStore.gameState.isSimulationMode"
              :winner="gameStore.gameState.winner"
            />

            <button
              v-if="gameStore.gameState.isSimulationMode && simMoves.length > 0"
              class="absolute -top-1 -right-1 w-8 h-8 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-colors flex items-center justify-center text-sm font-bold z-40"
              title="模拟历史"
              @click="uiStore.showSimHistory = !uiStore.showSimHistory"
            >
              {{ uiStore.showSimHistory ? '✕' : '📜' }}
            </button>

            <div
              v-if="
                uiStore.showSimHistory &&
                gameStore.gameState.isSimulationMode &&
                simMoves.length > 0
              "
              class="absolute top-10 right-0 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 z-50"
            >
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-bold text-sm text-gray-800">模拟历史</h3>
                <button
                  class="text-gray-400 hover:text-gray-600 text-sm leading-none"
                  @click="uiStore.showSimHistory = false"
                >
                  ✕
                </button>
              </div>
              <div class="max-h-60 overflow-y-auto space-y-1">
                <div
                  v-for="move in simMoves"
                  :key="move.step"
                  class="text-xs text-gray-600 flex items-center gap-2 py-0.5"
                >
                  <span class="font-mono w-6 text-gray-400">#{{ move.step }}</span>
                  <span
                    class="w-2 h-2 rounded-full shrink-0"
                    :class="
                      move.step % 2 === 1
                        ? 'bg-stone-black'
                        : 'bg-stone-white border border-gray-300'
                    "
                  />
                  <span>({{ move.position.x }}, {{ move.position.y }})</span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="uiStore.showDeadStoneMarker" class="bg-white rounded-lg shadow p-4 space-y-2">
            <h3 class="font-bold text-gray-800">标记死棋</h3>
            <p class="text-xs text-gray-500">点击棋盘上的棋子标记为死棋</p>
            <button
              class="w-full px-4 py-2 bg-accent-red text-white rounded-md hover:opacity-90 transition-opacity text-sm font-medium"
              @click="confirmDeadStones"
            >
              确认标记，计算终局目数
            </button>
            <button
              class="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
              @click="
                uiStore.showDeadStoneMarker = false;
                deadStones = [];
              "
            >
              取消
            </button>
          </div>

          <GameControls
            :can-undo="gameStore.canUndo()"
            :is-playing="!gameStore.gameState.isGameOver"
            :is-simulation="gameStore.gameState.isSimulationMode"
            :is-game-over="gameStore.gameState.isGameOver"
            @new-game="handleNewGame"
            @undo="handleUndo"
            @pass="handlePass"
            @resign="handleResign"
            @save="uiStore.showSaveModal = true"
            @load="uiStore.showLoadModal = true"
            @export="handleExport"
            @start-simulation="handleStartSimulation"
            @end-simulation="handleEndSimulation"
            @apply-simulation="handleApplySimulation"
          />
        </aside>
      </div>
    </main>

    <!-- Toast Notifications -->
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div
        v-for="toast in uiStore.toasts"
        :key="toast.id"
        class="px-4 py-2 rounded-lg shadow-lg text-sm font-medium cursor-pointer transition-all"
        :class="{
          'bg-green-500 text-white': toast.type === 'success',
          'bg-red-500 text-white': toast.type === 'error',
          'bg-yellow-500 text-white': toast.type === 'warning',
          'bg-blue-500 text-white': toast.type === 'info',
        }"
        @click="uiStore.dismissToast(toast.id)"
      >
        {{ toast.message }}
      </div>
    </div>

    <!-- Modals -->
    <SaveGameModal
      v-if="uiStore.showSaveModal"
      @close="uiStore.showSaveModal = false"
      @save="
        (name, note) => {
          storage.saveCurrentGame(name, note);
          uiStore.showSaveModal = false;
        }
      "
    />

    <LoadGameModal
      v-if="uiStore.showLoadModal"
      :storage="storage"
      @close="uiStore.showLoadModal = false"
    />

    <GameOverModal
      v-if="uiStore.showGameOverModal"
      :territory="gameStore.gameState.territory"
      :winner="gameStore.gameState.winner"
      @new-game="handleNewGameAfterOver"
      @replay="handleReplayAfterOver"
      @close="uiStore.showGameOverModal = false"
    />

    <NewGameConfirm
      v-if="uiStore.showNewGameConfirm"
      @confirm="confirmNewGame"
      @cancel="cancelNewGame"
    />

    <ExitConfirmModal
      v-if="uiStore.showExitConfirm"
      @close="uiStore.showExitConfirm = false"
      @confirm="handleExitConfirm"
    />
  </div>
</template>
