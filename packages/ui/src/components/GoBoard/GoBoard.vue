<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import type { Position } from '@go-game/core';
import { BoardSize, getStarPoints, StoneColor } from '@go-game/core';

const props = withDefaults(
  defineProps<{
    boardSize: BoardSize;
    boardState: StoneColor[][];
    lastMove?: Position | null;
    simulationMoves?: { position: Position | null; step: number }[];
    deadStones?: Position[];
    disabled?: boolean;
    markMode?: boolean;
    currentPlayer?: StoneColor;
  }>(),
  {
    lastMove: null,
    simulationMoves: () => [],
    deadStones: () => [],
    disabled: false,
    markMode: false,
  },
);

const emit = defineEmits<{
  'place-stone': [position: Position];
  'mark-dead-stone': [position: Position];
  hover: [position: Position | null];
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
const hoverPos = ref<Position | null>(null);
const containerWidth = ref(600);

const PADDING = 30;
const MIN_PADDING = 20;
const MAX_CELL_SIZE = 36;
const MIN_CELL_SIZE = 20;

let lastCanvasSize = 0;
let lastDpr = 0;

const cellSize = computed(() => {
  const size = props.boardSize as number;
  const available = containerWidth.value - PADDING * 2;
  const raw = Math.floor(available / (size - 1));
  return Math.max(MIN_CELL_SIZE, Math.min(MAX_CELL_SIZE, raw));
});

const boardPixelSize = computed(() => {
  const size = props.boardSize as number;
  return Math.max(
    cellSize.value * (size - 1) + PADDING * 2,
    cellSize.value * (size - 1) + MIN_PADDING * 2,
  );
});

const starPoints = computed(() => getStarPoints(props.boardSize));

function worldToBoard(clientX: number, clientY: number): Position | null {
  const canvas = canvasRef.value;
  if (!canvas) return null;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const size = boardPixelSize.value;

  const scaleX = canvas.width / dpr / rect.width;
  const scaleY = canvas.height / dpr / rect.height;

  const mx = (clientX - rect.left) * scaleX;
  const my = (clientY - rect.top) * scaleY;

  const cs = cellSize.value;
  const x = Math.round((mx - PADDING) / cs);
  const y = Math.round((my - PADDING) / cs);
  const bSize = props.boardSize as number;

  if (x < 0 || x >= bSize || y < 0 || y >= bSize) return null;

  const screenX = PADDING + x * cs;
  const screenY = PADDING + y * cs;
  const dist = Math.sqrt((mx - screenX) ** 2 + (my - screenY) ** 2);

  return dist < cs * 0.45 ? { x, y } : null;
}

function draw() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const size = boardPixelSize.value;
  if (size !== lastCanvasSize || dpr !== lastDpr) {
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    lastCanvasSize = size;
    lastDpr = dpr;
  }
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  drawBackground(ctx);
  drawGrid(ctx);
  drawStarPoints(ctx);
  drawStones(ctx);
  drawLastMove(ctx);
  drawDeadStoneMarkers(ctx);
  drawSimulationStepNumbers(ctx);
  drawHoverPreview(ctx);
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  const size = boardPixelSize.value;
  ctx.fillStyle = '#DEB887';
  ctx.fillRect(0, 0, size, size);
}

function drawGrid(ctx: CanvasRenderingContext2D) {
  const n = props.boardSize as number;
  const cs = cellSize.value;
  ctx.strokeStyle = '#5D4037';
  ctx.lineWidth = 1;

  for (let i = 0; i < n; i++) {
    ctx.beginPath();
    ctx.moveTo(PADDING, PADDING + i * cs);
    ctx.lineTo(PADDING + (n - 1) * cs, PADDING + i * cs);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(PADDING + i * cs, PADDING);
    ctx.lineTo(PADDING + i * cs, PADDING + (n - 1) * cs);
    ctx.stroke();
  }
}

function drawStarPoints(ctx: CanvasRenderingContext2D) {
  const cs = cellSize.value;
  ctx.fillStyle = '#5D4037';
  for (const sp of starPoints.value) {
    ctx.beginPath();
    ctx.arc(PADDING + sp.x * cs, PADDING + sp.y * cs, cs * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawStones(ctx: CanvasRenderingContext2D) {
  const n = props.boardSize as number;
  const cs = cellSize.value;
  const radius = cs * 0.43;

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const color = props.boardState[y][x];
      if (color === 'empty') continue;

      const cx = PADDING + x * cs;
      const cy = PADDING + y * cs;

      const grad = ctx.createRadialGradient(
        cx - radius * 0.3,
        cy - radius * 0.3,
        radius * 0.1,
        cx,
        cy,
        radius,
      );
      if (color === 'black') {
        grad.addColorStop(0, '#555');
        grad.addColorStop(1, '#000');
      } else {
        grad.addColorStop(0, '#fff');
        grad.addColorStop(1, '#ccc');
      }

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = color === 'black' ? '#333' : '#bbb';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }
}

function drawLastMove(ctx: CanvasRenderingContext2D) {
  if (!props.lastMove) return;
  const cs = cellSize.value;
  const cx = PADDING + props.lastMove.x * cs;
  const cy = PADDING + props.lastMove.y * cs;

  ctx.beginPath();
  ctx.arc(cx, cy, cs * 0.12, 0, Math.PI * 2);
  ctx.fillStyle = '#E53935';
  ctx.fill();
}

function drawDeadStoneMarkers(ctx: CanvasRenderingContext2D) {
  const cs = cellSize.value;
  for (const ds of props.deadStones) {
    const cx = PADDING + ds.x * cs;
    const cy = PADDING + ds.y * cs;
    ctx.beginPath();
    ctx.arc(cx, cy, cs * 0.45, 0, Math.PI * 2);
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = '#E53935';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawSimulationStepNumbers(ctx: CanvasRenderingContext2D) {
  for (const sm of props.simulationMoves) {
    if (!sm.position) continue;
    const cs = cellSize.value;
    const cx = PADDING + sm.position.x * cs;
    const cy = PADDING + sm.position.y * cs;
    const fontSize = Math.max(10, cs * 0.4);

    ctx.fillStyle = props.boardState[sm.position.y]?.[sm.position.x] === 'black' ? '#fff' : '#333';
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(sm.step), cx, cy);
  }
}

function drawHoverPreview(ctx: CanvasRenderingContext2D) {
  if (!hoverPos.value || props.disabled) return;
  if (props.markMode) return;
  const color = props.boardState[hoverPos.value.y]?.[hoverPos.value.x];
  if (color !== 'empty') return;

  const cs = cellSize.value;
  const cx = PADDING + hoverPos.value.x * cs;
  const cy = PADDING + hoverPos.value.y * cs;
  const radius = cs * 0.43;

  const playerColor = props.currentPlayer ?? StoneColor.Black;
  const isBlack = playerColor === StoneColor.Black;

  const grad = ctx.createRadialGradient(
    cx - radius * 0.3,
    cy - radius * 0.3,
    radius * 0.1,
    cx,
    cy,
    radius,
  );
  if (isBlack) {
    grad.addColorStop(0, '#555');
    grad.addColorStop(1, '#000');
  } else {
    grad.addColorStop(0, '#fff');
    grad.addColorStop(1, '#ccc');
  }

  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = isBlack ? '#333' : '#bbb';
  ctx.lineWidth = 0.5;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function handleMouseMove(e: MouseEvent) {
  const pos = worldToBoard(e.clientX, e.clientY);
  hoverPos.value = pos;
  draw();
  emit('hover', pos);
}

function handleClick(e: MouseEvent) {
  const pos = worldToBoard(e.clientX, e.clientY);
  if (!pos) return;

  if (props.markMode) {
    emit('mark-dead-stone', pos);
  } else {
    emit('place-stone', pos);
  }
}

function handleMouseLeave() {
  hoverPos.value = null;
  draw();
  emit('hover', null);
}

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  if (containerRef.value) {
    containerWidth.value = containerRef.value.clientWidth;
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        containerWidth.value = entry.contentRect.width;
        draw();
      }
    });
    resizeObserver.observe(containerRef.value);
  }
  draw();
});

onUnmounted(() => {
  resizeObserver?.disconnect();
});

watch(
  () => [
    props.boardState,
    props.lastMove,
    props.deadStones,
    props.simulationMoves,
    props.boardSize,
  ],
  () => draw(),
  { deep: true },
);
</script>

<template>
  <div ref="containerRef" class="flex justify-center items-center w-full">
    <canvas
      ref="canvasRef"
      class="cursor-pointer rounded-lg shadow-lg"
      :style="{ maxWidth: '100%' }"
      @mousemove="handleMouseMove"
      @click="handleClick"
      @mouseleave="handleMouseLeave"
    />
  </div>
</template>
