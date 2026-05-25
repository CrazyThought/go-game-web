<script setup lang="ts">
import { BoardSize, BOARD_SIZE_LABELS } from '@go-game/core';

const props = defineProps<{
  modelValue: BoardSize;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: BoardSize];
  change: [value: BoardSize];
}>();

const options = Object.values(BoardSize).filter(
  (v): v is BoardSize => typeof v === 'number',
);

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  const value = Number(target.value) as BoardSize;
  emit('update:modelValue', value);
  emit('change', value);
}
</script>

<template>
  <div class="flex items-center gap-2">
    <label class="text-sm text-gray-600 font-medium">棋盘大小:</label>
    <select
      :value="props.modelValue"
      class="px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
      @change="handleChange"
    >
      <option v-for="opt in options" :key="opt" :value="opt">
        {{ BOARD_SIZE_LABELS[opt] }}
      </option>
    </select>
  </div>
</template>