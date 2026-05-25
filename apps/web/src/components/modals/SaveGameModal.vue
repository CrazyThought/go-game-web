<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  close: [];
  save: [name: string, note: string];
}>();

const name = ref('');
const note = ref('');

function handleSave() {
  if (!name.value.trim()) return;
  emit('save', name.value.trim(), note.value.trim());
}
</script>

<template>
  <div class="fixed inset-0 z-40 flex items-center justify-center bg-black/40" @click.self="emit('close')">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
      <h2 class="text-lg font-bold text-gray-800 mb-4">保存棋局</h2>

      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">棋局名称</label>
          <input
            v-model="name"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="请输入棋局名称"
            @keyup.enter="handleSave"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">备注（可选）</label>
          <textarea
            v-model="note"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            rows="3"
            placeholder="添加备注信息"
          />
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <button
          class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          @click="emit('close')"
        >
          取消
        </button>
        <button
          class="px-4 py-2 text-sm bg-amber-500 text-white rounded-md hover:bg-amber-600 disabled:opacity-40"
          :disabled="!name.trim()"
          @click="handleSave"
        >
          保存
        </button>
      </div>
    </div>
  </div>
</template>