<script setup lang="ts">
defineProps<{
  canUndo: boolean;
  isPlaying: boolean;
  isSimulation: boolean;
  isGameOver: boolean;
}>();

const emit = defineEmits<{
  'new-game': [];
  undo: [];
  pass: [];
  resign: [];
  save: [];
  export: [format: 'json' | 'sgf'];
  'start-simulation': [];
  'end-simulation': [];
  'apply-simulation': [];
}>();
</script>

<template>
  <div class="bg-white rounded-lg shadow p-4 space-y-2">
    <h3 class="font-bold text-lg text-gray-800 mb-3">操作</h3>

    <button
      class="w-full px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors text-sm font-medium"
      @click="emit('new-game')"
    >
      新局
    </button>

    <button
      class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
      :disabled="!canUndo"
      @click="emit('undo')"
    >
      悔棋 (Ctrl+Z)
    </button>

    <button
      class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
      :disabled="!isPlaying || isGameOver"
      @click="emit('pass')"
    >
      停一手
    </button>

    <button
      class="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
      :disabled="!isPlaying || isSimulation || isGameOver"
      @click="emit('resign')"
    >
      认输
    </button>

    <div class="border-t pt-2 space-y-2">
      <button
        v-if="isPlaying || isGameOver"
        class="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        :disabled="isSimulation"
        @click="emit('save')"
      >
        保存棋局 (Ctrl+S)
      </button>
    </div>

    <div class="border-t pt-2 space-y-2">
      <div v-if="!isSimulation">
        <button
          class="w-full px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="!isPlaying || isGameOver"
          @click="emit('start-simulation')"
        >
          开启模拟
        </button>
      </div>
      <div v-else class="space-y-2">
        <button
          class="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
          @click="emit('apply-simulation')"
        >
          应用模拟
        </button>
        <button
          class="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors text-sm font-medium"
          @click="emit('end-simulation')"
        >
          关闭模拟
        </button>
      </div>
    </div>
  </div>
</template>