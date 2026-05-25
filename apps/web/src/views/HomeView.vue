<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { GameStorage } from '@go-game/storage';
import { BoardSizeSelector } from '@go-game/ui';
import type { BoardSize } from '@go-game/core';
import { useGameStore } from '../stores/gameStore';
import { useUIStore } from '../stores/uiStore';
import { useStorage } from '../composables/useStorage';
import LoadGameModal from '../components/modals/LoadGameModal.vue';
import SavedGamesModal from '../components/modals/SavedGamesModal.vue';

const router = useRouter();
const gameStore = useGameStore();
const uiStore = useUIStore();
const storage = useStorage();
const showSavedGames = ref(false);

function handleStartGame() {
  gameStore.reset(uiStore.selectedBoardSize);
  router.push('/game');
}

function handleBoardSizeSelect(size: BoardSize) {
  uiStore.selectedBoardSize = size;
}

function handleImportGame() {
  uiStore.showLoadModal = true;
}

function handleGameLoaded() {
  router.push('/game');
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-stone-50 to-amber-100 p-6"
  >
    <!-- Background decoration -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-200/20 blur-3xl" />
      <div class="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-stone-300/15 blur-3xl" />
    </div>

    <div class="relative w-full max-w-md">
      <!-- Logo / header area -->
      <div class="text-center mb-10">
        <div
          class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-amber-100/80 shadow-inner mb-6"
        >
          <svg
            class="w-12 h-12 text-amber-700"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="6"
              y="14"
              width="36"
              height="20"
              rx="4"
              stroke="currentColor"
              stroke-width="2.5"
              fill="none"
            />
            <line x1="6" y1="20" x2="42" y2="20" stroke="currentColor" stroke-width="2.5" />
            <line x1="6" y1="28" x2="42" y2="28" stroke="currentColor" stroke-width="2.5" />
            <circle cx="18" cy="22" r="3" fill="currentColor" />
            <circle cx="32" cy="32" r="3" fill="currentColor" />
          </svg>
        </div>
        <h1 class="text-4xl font-bold text-stone-800 tracking-wide">围棋</h1>
        <p class="mt-3 text-stone-500 text-lg">古老智慧的现代演绎</p>
      </div>

      <!-- Action buttons -->
      <div class="space-y-4">
        <!-- Board Size Selection -->
        <div class="flex justify-center mb-2">
          <BoardSizeSelector
            :model-value="uiStore.selectedBoardSize"
            @change="handleBoardSizeSelect"
          />
        </div>

        <button
          class="w-full py-4 px-6 rounded-xl text-lg font-semibold shadow-lg transition-all duration-200 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
          @click="handleStartGame"
        >
          <span class="flex items-center justify-center gap-2">
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <polygon points="5,3 19,12 5,21" fill="currentColor" stroke="none" />
            </svg>
            开始对局
          </span>
        </button>

        <button
          class="w-full py-4 px-6 rounded-xl text-lg font-semibold shadow-lg transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
          @click="handleImportGame"
        >
          <span class="flex items-center justify-center gap-2">
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 10l5-5 5 5M12 15V5"
              />
            </svg>
            导入棋局
          </span>
        </button>

        <button
          class="w-full py-4 px-6 rounded-xl text-lg font-semibold shadow-lg transition-all duration-200 bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
          @click="showSavedGames = true"
        >
          <span class="flex items-center justify-center gap-2">
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19 11H5m14 0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2m14 0V9a2 2 0 0 0-2-2M5 11V9a2 2 0 0 1 2-2m0 0V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M7 7h10"
              />
            </svg>
            查看现有棋局
          </span>
        </button>
      </div>

      <!-- Footer -->
      <p class="mt-10 text-center text-stone-400 text-sm">执黑先行 · 落子无悔</p>
    </div>

    <!-- Modals -->
    <LoadGameModal
      v-if="uiStore.showLoadModal"
      :storage="storage"
      @close="uiStore.showLoadModal = false"
      @loaded="handleGameLoaded"
    />

    <SavedGamesModal v-if="showSavedGames" @close="showSavedGames = false" />
  </div>
</template>
