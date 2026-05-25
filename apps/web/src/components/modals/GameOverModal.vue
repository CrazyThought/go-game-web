<script setup lang="ts">
import type { TerritoryResult, StoneColor } from '@go-game/core';
import { DEFAULT_KOMI } from '@go-game/core';

defineProps<{
  territory: TerritoryResult;
  winner: StoneColor | null;
}>();

const emit = defineEmits<{
  'new-game': [];
  replay: [];
  close: [];
}>();
</script>

<template>
  <div class="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center">
      <div class="text-3xl mb-2">
        {{ winner === 'black' ? '⚫' : winner === 'white' ? '⚪' : '🤝' }}
      </div>
      <h2 class="text-xl font-bold text-gray-800 mb-2">
        {{ winner === 'black' ? '黑方胜！' : winner === 'white' ? '白方胜！' : '游戏结束' }}
      </h2>

      <div class="bg-gray-50 rounded-lg p-4 my-4 space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-500">黑方领地</span>
          <span class="font-mono">{{ territory.blackTerritory }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">黑方提子</span>
          <span class="font-mono">{{ territory.whiteCaptured }}</span>
        </div>
        <div class="flex justify-between font-bold border-t pt-2">
          <span>⚫ 黑方总计</span>
          <span class="font-mono">{{ territory.blackTotal.toFixed(1) }} 目</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">白方领地</span>
          <span class="font-mono">{{ territory.whiteTerritory }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">白方提子</span>
          <span class="font-mono">{{ territory.blackCaptured }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">贴目</span>
          <span class="font-mono">{{ DEFAULT_KOMI }}</span>
        </div>
        <div class="flex justify-between font-bold border-t pt-2">
          <span>⚪ 白方总计</span>
          <span class="font-mono">{{ territory.whiteTotal.toFixed(1) }} 目</span>
        </div>
      </div>

      <div class="flex justify-center gap-3">
        <button
          class="px-6 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors text-sm font-medium"
          @click="emit('new-game')"
        >
          重新开始
        </button>
        <button
          class="px-6 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-sm font-medium"
          @click="emit('replay')"
        >
          复盘
        </button>
      </div>

      <button
        class="mt-3 text-sm text-gray-400 hover:text-gray-600"
        @click="emit('close')"
      >
        关闭
      </button>
    </div>
  </div>
</template>