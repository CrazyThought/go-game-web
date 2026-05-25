<script setup lang="ts">
import { ref } from 'vue';
import type { useStorage } from '../../composables/useStorage';

const props = defineProps<{
  storage: ReturnType<typeof useStorage>;
}>();

const emit = defineEmits<{
  close: [];
  loaded: [];
}>();

const activeTab = ref<'json' | 'sgf'>('json');

const jsonInput = ref('');
const sgfInput = ref('');

function handleJSONImport(asSim: boolean = false) {
  if (!jsonInput.value.trim()) return;
  props.storage.loadFromJSON(jsonInput.value, asSim).then((ok: boolean) => {
    if (ok) {
      emit('loaded');
      emit('close');
    }
  });
}

function handleSGFImport(asSim: boolean = false) {
  if (!sgfInput.value.trim()) return;
  props.storage.importFromSGF(sgfInput.value, asSim);
  emit('loaded');
  emit('close');
}

function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    sgfInput.value = e.target?.result as string;
  };
  reader.readAsText(file);
}

function handleJsonFileUpload(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    jsonInput.value = ev.target?.result as string;
  };
  reader.readAsText(file);
}
</script>

<template>
  <div class="fixed inset-0 z-40 flex items-center justify-center bg-black/40" @click.self="emit('close')">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[80vh] flex flex-col">
      <h2 class="text-lg font-bold text-gray-800 mb-4">导入棋局</h2>

      <!-- Tabs -->
      <div class="flex border-b border-gray-200 mb-4">
        <button
          v-for="tab in (['json', 'sgf'] as const)"
          :key="tab"
          class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === tab ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="activeTab = tab"
        >
          {{ tab === 'json' ? 'JSON 粘贴' : 'SGF 导入' }}
        </button>
      </div>

      <!-- JSON Tab -->
      <div v-if="activeTab === 'json'" class="space-y-3">
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-1">上传 JSON 文件</label>
          <input
            type="file"
            accept=".json"
            class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            @change="handleJsonFileUpload"
          />
        </div>
        <textarea
          v-model="jsonInput"
          class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          rows="8"
          placeholder="粘贴 JSON 棋局数据..."
        />
        <div class="flex justify-end gap-3">
          <button
            class="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-40"
            :disabled="!jsonInput.trim()"
            @click="handleJSONImport(false)"
          >
            导入对局
          </button>
          <button
            class="px-4 py-2 text-sm bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-40"
            :disabled="!jsonInput.trim()"
            @click="handleJSONImport(true)"
          >
            导入模拟
          </button>
        </div>
      </div>

      <!-- SGF Tab -->
      <div v-if="activeTab === 'sgf'" class="space-y-3">
        <div>
          <input
            type="file"
            accept=".sgf"
            class="text-sm"
            @change="handleFileUpload"
          />
        </div>
        <textarea
          v-model="sgfInput"
          class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          rows="8"
          placeholder="粘贴 SGF 内容或上传 .sgf 文件..."
        />
        <div class="flex justify-end gap-3">
          <button
            class="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-40"
            :disabled="!sgfInput.trim()"
            @click="handleSGFImport(false)"
          >
            导入对局
          </button>
          <button
            class="px-4 py-2 text-sm bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-40"
            :disabled="!sgfInput.trim()"
            @click="handleSGFImport(true)"
          >
            导入模拟
          </button>
        </div>
      </div>
    </div>
  </div>
</template>