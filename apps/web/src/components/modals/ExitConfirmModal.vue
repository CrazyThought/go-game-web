<script setup lang="ts">
import BaseModal from '../BaseModal.vue';

const emit = defineEmits<{
  close: [];
  confirm: [];
}>();
</script>

<template>
  <BaseModal max-width="sm" body-class="p-6 text-center" @close="emit('close')">
      <h2 class="text-lg font-bold text-red-600 mb-2">退出对局</h2>
      <p class="text-sm text-gray-500 mb-6">当局游戏进度若无保存则清空，是否退出？</p>

      <div class="flex justify-center gap-3">
        <button
          class="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
          @click="emit('close')"
        >
          取消
        </button>
        <button
          class="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
          @click="emit('confirm')"
        >
          确认退出
        </button>
      </div>
  </BaseModal>
</template>
