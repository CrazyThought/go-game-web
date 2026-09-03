<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    maxWidth?: 'sm' | 'md' | 'lg';
    closeOnOverlay?: boolean;
    bodyClass?: string;
  }>(),
  {
    maxWidth: 'md',
    closeOnOverlay: true,
    bodyClass: 'p-6',
  },
);

const emit = defineEmits<{
  close: [];
}>();

const maxWidthClass = computed(() => {
  switch (props.maxWidth) {
    case 'sm':
      return 'max-w-sm';
    case 'lg':
      return 'max-w-lg';
    default:
      return 'max-w-md';
  }
});

function handleOverlayClick() {
  if (props.closeOnOverlay) emit('close');
}
</script>

<template>
  <div
    class="fixed inset-0 z-40 flex items-center justify-center bg-black/40"
    @click.self="handleOverlayClick"
  >
    <div
      class="bg-white rounded-xl shadow-2xl w-full mx-4"
      :class="[maxWidthClass, bodyClass]"
    >
      <slot />
    </div>
  </div>
</template>
