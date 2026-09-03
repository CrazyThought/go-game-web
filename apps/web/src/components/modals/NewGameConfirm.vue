<script setup lang="ts">
import BaseModal from '../BaseModal.vue';

defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>

<template>
  <BaseModal max-width="sm" body-class="p-6 text-center" @close="$emit('cancel')">
      <h2 class="text-lg font-bold text-gray-800 mb-2">确认新局</h2>
      <p class="text-sm text-gray-500 mb-6">当前对局将丢失，是否继续？</p>

      <div class="flex justify-center gap-3">
        <button
          class="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
          @click="$emit('cancel')"
        >
          取消
        </button>
        <button
          class="px-6 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors text-sm font-medium"
          @click="$emit('confirm')"
        >
          确认
        </button>
      </div>
  </BaseModal>
</template>