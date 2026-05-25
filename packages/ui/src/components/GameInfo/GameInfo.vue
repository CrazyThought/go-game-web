<script setup lang="ts">
import type { TerritoryResult, StoneColor } from '@go-game/core';

defineProps<{
  territory: TerritoryResult;
  currentPlayer: StoneColor;
  stepCount: number;
  isGameOver: boolean;
  isSimulationMode: boolean;
  winner: StoneColor | null;
}>();

function formatTerritoryText(total: number, isBlack: boolean): string {
  return `${isBlack ? '黑方' : '白方'}: ${total.toFixed(1)} 目`;
}
</script>

<template>
  <div class="bg-white rounded-lg shadow p-4 space-y-3">
    <h3 class="font-bold text-lg text-gray-800">对局信息</h3>

    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-600">当前玩家:</span>
      <span
        class="inline-block w-4 h-4 rounded-full"
        :class="currentPlayer === 'black' ? 'bg-stone-black' : 'bg-stone-white border border-gray-300'"
      />
      <span class="font-medium">{{ currentPlayer === 'black' ? '黑方' : '白方' }}</span>
    </div>

    <div class="border-t pt-2 space-y-1">
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">⚫ 黑方目数</span>
        <span class="font-mono font-bold">{{ territory.blackTotal.toFixed(1) }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">⚪ 白方目数</span>
        <span class="font-mono font-bold">{{ territory.whiteTotal.toFixed(1) }}</span>
      </div>
    </div>

    <div class="border-t pt-2 space-y-1">
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">黑方提子</span>
        <span class="font-mono">{{ territory.whiteCaptured }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">白方提子</span>
        <span class="font-mono">{{ territory.blackCaptured }}</span>
      </div>
    </div>

    <div class="border-t pt-2 space-y-1">
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">领地 (黑)</span>
        <span class="font-mono">{{ territory.blackTerritory }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">领地 (白)</span>
        <span class="font-mono">{{ territory.whiteTerritory }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">总步数</span>
        <span class="font-mono">{{ stepCount }}</span>
      </div>
    </div>

    <div class="border-t pt-2">
      <span
        class="inline-block px-2 py-1 text-xs font-medium rounded"
        :class="{
          'bg-green-100 text-green-700': !isGameOver && !isSimulationMode,
          'bg-red-100 text-red-700': isGameOver,
          'bg-blue-100 text-blue-700': isSimulationMode,
        }"
      >
        {{ isGameOver ? '游戏结束' : isSimulationMode ? '模拟中' : '进行中' }}
      </span>

      <div v-if="isGameOver && winner" class="mt-2 text-center">
        <span class="text-lg font-bold" :class="winner === 'black' ? 'text-stone-black' : 'text-gray-500'">
          {{ winner === 'black' ? '黑方胜!' : '白方胜!' }}
        </span>
      </div>
    </div>
  </div>
</template>