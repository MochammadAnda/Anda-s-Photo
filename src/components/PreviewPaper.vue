<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEditorStore } from '@/stores/editor'

const store = useEditorStore()
const previewMode = ref<'flat' | '3d'>('flat')
const paperRotateX = ref(10)
const paperRotateY = ref(-5)
const isDragging3D = ref(false)
const lastMouse = ref({ x: 0, y: 0 })

const template = computed(() => store.selectedTemplate)

function getFilterStyle(slotId: string): string {
  const content = store.getSlotContent(slotId)
  if (!content || content.type !== 'image') return ''
  switch (content.filter) {
    case 'grayscale':
      return 'grayscale(100%)'
    case 'sepia':
      return 'sepia(80%) contrast(1.1)'
    case 'vintage':
      return 'sepia(40%) contrast(1.1) brightness(0.95) saturate(0.8)'
    default:
      return ''
  }
}

function startDrag3D(e: MouseEvent) {
  if (previewMode.value !== '3d') return
  isDragging3D.value = true
  lastMouse.value = { x: e.clientX, y: e.clientY }
}

function onDrag3D(e: MouseEvent) {
  if (!isDragging3D.value) return
  const dx = e.clientX - lastMouse.value.x
  const dy = e.clientY - lastMouse.value.y
  paperRotateY.value += dx * 0.3
  paperRotateX.value -= dy * 0.3
  paperRotateX.value = Math.max(-30, Math.min(30, paperRotateX.value))
  paperRotateY.value = Math.max(-30, Math.min(30, paperRotateY.value))
  lastMouse.value = { x: e.clientX, y: e.clientY }
}

function endDrag3D() {
  isDragging3D.value = false
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Preview Controls -->
    <div class="flex items-center justify-between mb-4 px-4">
      <h2 class="font-[Playfair_Display] text-xl font-bold text-[var(--color-ink)]">Preview</h2>
      <div class="flex items-center gap-2">
        <button
          @click="previewMode = 'flat'"
          :class="[
            'px-4 py-2 text-xs font-[Inter] tracking-wider uppercase border transition-colors',
            previewMode === 'flat'
              ? 'bg-[var(--color-ink)] text-[var(--color-cream)] border-[var(--color-ink)]'
              : 'border-[var(--color-ink)]/20 hover:border-[var(--color-ink)]',
          ]"
        >
          Flat
        </button>
        <button
          @click="previewMode = '3d'"
          :class="[
            'px-4 py-2 text-xs font-[Inter] tracking-wider uppercase border transition-colors',
            previewMode === '3d'
              ? 'bg-[var(--color-ink)] text-[var(--color-cream)] border-[var(--color-ink)]'
              : 'border-[var(--color-ink)]/20 hover:border-[var(--color-ink)]',
          ]"
        >
          3D Paper
        </button>
      </div>
    </div>

    <!-- Preview Area -->
    <div
      class="flex-1 flex items-center justify-center overflow-auto bg-[var(--color-ink)]/[0.03] p-8"
      :style="previewMode === '3d' ? { perspective: '1400px' } : undefined"
      @mousedown="startDrag3D"
      @mousemove="onDrag3D"
      @mouseup="endDrag3D"
      @mouseleave="endDrag3D"
    >
      <div
        v-if="template"
        class="relative shadow-2xl transition-transform duration-100"
        :style="{
          width: template.width * 0.55 + 'px',
          height: template.height * 0.55 + 'px',
          background: template.background,
          transform:
            previewMode === '3d'
              ? `rotateX(${paperRotateX}deg) rotateY(${paperRotateY}deg)`
              : 'none',
          transformStyle: 'preserve-3d',
        }"
      >
        <!-- Paper shadow for 3D -->
        <div
          v-if="previewMode === '3d'"
          class="absolute inset-0 -z-10"
          :style="{
            boxShadow: `${-paperRotateY}px ${paperRotateX}px 40px rgba(0,0,0,0.3)`,
            transform: 'translateZ(-2px)',
          }"
        ></div>

        <!-- Grain overlay -->
        <div
          class="absolute inset-0 pointer-events-none z-50 opacity-[0.04]"
          :style="{
            backgroundImage: `url('data:image/svg+xml,${encodeURIComponent(`<svg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`)}')`,
          }"
        ></div>

        <!-- Slots at 55% scale -->
        <template v-for="slot in template.slots" :key="slot.id">
          <!-- Image slot -->
          <div
            v-if="slot.type === 'image'"
            class="absolute overflow-hidden"
            :style="{
              left: slot.x * 0.55 + 'px',
              top: slot.y * 0.55 + 'px',
              width: slot.w * 0.55 + 'px',
              height: slot.h * 0.55 + 'px',
            }"
          >
            <img
              v-if="store.getSlotContent(slot.id)?.imageUrl"
              :src="store.getSlotContent(slot.id)!.imageUrl!"
              class="w-full h-full object-cover"
              :style="{ filter: getFilterStyle(slot.id) }"
            />
            <div
              v-else
              class="w-full h-full bg-[var(--color-ink)]/[0.05] flex items-center justify-center"
            >
              <span
                class="text-[8px] font-[Inter] text-[var(--color-ink)]/20 uppercase tracking-wider"
                >{{ slot.placeholder }}</span
              >
            </div>
          </div>

          <!-- Text slot -->
          <div
            v-else-if="slot.type === 'text'"
            class="absolute overflow-hidden"
            :style="{
              left: slot.x * 0.55 + 'px',
              top: slot.y * 0.55 + 'px',
              width: slot.w * 0.55 + 'px',
              height: slot.h * 0.55 + 'px',
              fontFamily: slot.fontFamily || 'inherit',
              fontSize: (slot.fontSize || 12) * 0.55 + 'px',
              fontWeight: slot.fontWeight || 'normal',
              fontStyle: slot.fontStyle || 'normal',
              textAlign: (slot.textAlign as any) || 'left',
              letterSpacing: slot.letterSpacing ? slot.letterSpacing * 0.55 + 'px' : undefined,
              lineHeight: slot.lineHeight || 1.4,
              textTransform: (slot.textTransform as any) || 'none',
              borderTop: slot.borderTop ? '1px solid var(--color-ink)' : undefined,
              borderBottom: slot.borderBottom ? '1px solid var(--color-ink)' : undefined,
              display: 'flex',
              alignItems: slot.borderTop && slot.borderBottom ? 'center' : 'flex-start',
              justifyContent:
                slot.textAlign === 'center'
                  ? 'center'
                  : slot.textAlign === 'right'
                    ? 'flex-end'
                    : 'flex-start',
              padding: slot.borderTop || slot.borderBottom ? '2px 0' : '0',
            }"
          >
            <span class="whitespace-pre-wrap w-full">
              {{ store.getSlotContent(slot.id)?.text ?? slot.content }}
            </span>
          </div>
        </template>
      </div>
    </div>

    <!-- 3D hint -->
    <div v-if="previewMode === '3d'" class="text-center py-2">
      <span class="text-xs font-[Inter] text-[var(--color-ink-light)]"
        >Click and drag to rotate the paper</span
      >
    </div>
  </div>
</template>
