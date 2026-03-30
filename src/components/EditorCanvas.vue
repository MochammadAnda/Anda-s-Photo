<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEditorStore } from '@/stores/editor'
import type { TemplateSlot } from '@/templates/newspaper-templates'
import { getTextureById, getPaperOverlayStyle } from '@/utils/paper-textures'

const store = useEditorStore()

const editingSlot = ref<string | null>(null)
const editText = ref('')
const slotFileInput = ref<HTMLInputElement | null>(null)
const targetSlotId = ref<string | null>(null)

// Image pan state
const draggingSlotId = ref<string | null>(null)
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragStartOffsetX = ref(0)
const dragStartOffsetY = ref(0)

// Active image controls
const activeImageSlot = ref<string | null>(null)

const template = computed(() => store.selectedTemplate)
const currentTexture = computed(() => getTextureById(store.paperTexture))

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

function onSlotDrop(e: DragEvent, slot: TemplateSlot) {
  e.preventDefault()
  const photoId = e.dataTransfer?.getData('photoId')
  if (photoId && slot.type === 'image') {
    store.assignPhotoToSlot(photoId, slot.id)
  }
}

function onSlotDragOver(e: DragEvent) {
  e.preventDefault()
}

function startEditText(slot: TemplateSlot) {
  if (!slot.editable) return
  const content = store.getSlotContent(slot.id)
  editText.value = content?.text ?? slot.content ?? ''
  editingSlot.value = slot.id
}

function saveText(slotId: string) {
  store.updateSlotText(slotId, editText.value)
  editingSlot.value = null
}

function cancelEdit() {
  editingSlot.value = null
  editText.value = ''
}

function removeImage(slotId: string) {
  store.removeSlotContent(slotId)
  if (activeImageSlot.value === slotId) activeImageSlot.value = null
}

function onSlotClick(slotId: string) {
  targetSlotId.value = slotId
  slotFileInput.value?.click()
}

function onSlotFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file && file.type.startsWith('image/') && targetSlotId.value) {
    store.addPhotoToSlot(file, targetSlotId.value)
  }
  input.value = ''
  targetSlotId.value = null
}

// Image zoom/pan controls
function getImageTransformStyle(slotId: string) {
  const content = store.getSlotContent(slotId)
  const zoom = content?.imageZoom ?? 1
  const ox = content?.imageOffsetX ?? 0
  const oy = content?.imageOffsetY ?? 0
  return {
    transform: `scale(${zoom}) translate(${ox}px, ${oy}px)`,
    transformOrigin: 'center center',
  }
}

function toggleImageControls(slotId: string) {
  activeImageSlot.value = activeImageSlot.value === slotId ? null : slotId
}

function getSlotZoom(slotId: string): number {
  return store.getSlotContent(slotId)?.imageZoom ?? 1
}

function onZoomChange(slotId: string, value: number) {
  const content = store.getSlotContent(slotId)
  const ox = content?.imageOffsetX ?? 0
  const oy = content?.imageOffsetY ?? 0
  store.updateSlotImageTransform(slotId, value, ox, oy)
}

function onResetTransform(slotId: string) {
  store.updateSlotImageTransform(slotId, 1, 0, 0)
}

function onImageMouseDown(e: MouseEvent, slotId: string) {
  const content = store.getSlotContent(slotId)
  if (!content || (content.imageZoom ?? 1) <= 1) return
  e.preventDefault()
  draggingSlotId.value = slotId
  dragStartX.value = e.clientX
  dragStartY.value = e.clientY
  dragStartOffsetX.value = content.imageOffsetX ?? 0
  dragStartOffsetY.value = content.imageOffsetY ?? 0
  window.addEventListener('mousemove', onImageMouseMove)
  window.addEventListener('mouseup', onImageMouseUp)
}

function onImageMouseMove(e: MouseEvent) {
  if (!draggingSlotId.value) return
  const content = store.getSlotContent(draggingSlotId.value)
  const zoom = content?.imageZoom ?? 1
  const dx = (e.clientX - dragStartX.value) / zoom
  const dy = (e.clientY - dragStartY.value) / zoom
  const maxOffset = ((zoom - 1) * 50) / zoom
  const newOx = Math.max(-maxOffset, Math.min(maxOffset, dragStartOffsetX.value + dx))
  const newOy = Math.max(-maxOffset, Math.min(maxOffset, dragStartOffsetY.value + dy))
  store.updateSlotImageTransform(draggingSlotId.value, zoom, newOx, newOy)
}

function onImageMouseUp() {
  draggingSlotId.value = null
  window.removeEventListener('mousemove', onImageMouseMove)
  window.removeEventListener('mouseup', onImageMouseUp)
}
</script>

<template>
  <div
    v-if="template"
    class="relative bg-white shadow-2xl"
    :style="{
      width: template.width + 'px',
      height: template.height + 'px',
      background: store.paperTexture !== 'plain' ? currentTexture.background : template.background,
      color: currentTexture.inkColor,
      '--color-ink': currentTexture.inkColor,
      transform: `scale(${store.zoomLevel})`,
      transformOrigin: 'top center',
    }"
  >
    <!-- Hidden file input for direct slot upload -->
    <input
      ref="slotFileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="onSlotFileSelected"
    />
    <!-- Texture / Grain Overlay (behind content, only affects paper) -->
    <div
      class="absolute inset-0 pointer-events-none z-[1]"
      :style="getPaperOverlayStyle(store.paperTexture)"
    ></div>

    <!-- Grid overlay (above content as a visual guide) -->
    <div
      v-if="store.showGrid"
      class="absolute inset-0 pointer-events-none z-[5]"
      :style="{
        backgroundImage: `
          linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }"
    ></div>

    <!-- Template Slots -->
    <template v-for="slot in template.slots" :key="slot.id">
      <!-- IMAGE SLOT -->
      <div
        v-if="slot.type === 'image'"
        class="absolute overflow-hidden group z-[2]"
        :style="{
          left: slot.x + 'px',
          top: slot.y + 'px',
          width: slot.w + 'px',
          height: slot.h + 'px',
          boxSizing: 'border-box',
        }"
        @drop="onSlotDrop($event, slot)"
        @dragover="onSlotDragOver"
      >
        <!-- If image assigned -->
        <template v-if="store.getSlotContent(slot.id)?.imageUrl">
          <img
            :src="store.getSlotContent(slot.id)!.imageUrl"
            :alt="slot.placeholder"
            class="w-full h-full object-cover"
            :class="{
              'cursor-grab': (store.getSlotContent(slot.id)?.imageZoom ?? 1) > 1,
              'cursor-grabbing': draggingSlotId === slot.id,
            }"
            :style="{ filter: getFilterStyle(slot.id), ...getImageTransformStyle(slot.id) }"
            @mousedown="onImageMouseDown($event, slot.id)"
            draggable="false"
          />
          <!-- Image controls toggle -->
          <button
            @click.stop="toggleImageControls(slot.id)"
            class="absolute top-2 left-2 w-6 h-6 bg-black/60 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-30 rounded"
            title="Adjust zoom & position"
          >
            <svg
              class="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.35-4.35" />
              <path d="M11 8v6M8 11h6" />
            </svg>
          </button>
          <!-- Zoom/Pan controls panel -->
          <div
            v-if="activeImageSlot === slot.id"
            class="absolute bottom-0 left-0 right-0 bg-black/75 backdrop-blur-sm p-2 z-30 flex items-center gap-2"
            @click.stop
          >
            <svg
              class="w-3 h-3 text-white/60 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M8 11h6" />
            </svg>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              :value="getSlotZoom(slot.id)"
              @input="onZoomChange(slot.id, parseFloat(($event.target as HTMLInputElement).value))"
              class="flex-1 h-1 accent-white cursor-pointer"
            />
            <svg
              class="w-3 h-3 text-white/60 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M11 8v6M8 11h6" />
            </svg>
            <span class="text-white text-[10px] font-[Inter] w-8 text-center shrink-0"
              >{{ Math.round(getSlotZoom(slot.id) * 100) }}%</span
            >
            <button
              @click.stop="onResetTransform(slot.id)"
              class="text-white/70 hover:text-white text-[10px] font-[Inter] tracking-wider uppercase shrink-0"
            >
              Reset
            </button>
          </div>
          <!-- Remove button -->
          <button
            @click="removeImage(slot.id)"
            class="absolute top-2 right-2 w-6 h-6 bg-red-800/80 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-30"
          >
            ✕
          </button>
        </template>
        <!-- Empty placeholder -->
        <template v-else>
          <div
            class="w-full h-full border-2 border-dashed border-[var(--color-ink)]/20 bg-[var(--color-ink)]/[0.03] flex flex-col items-center justify-center gap-2 text-[var(--color-ink)]/30 hover:border-[var(--color-ink)]/40 hover:bg-[var(--color-ink)]/[0.06] transition-all cursor-pointer"
            @click="onSlotClick(slot.id)"
          >
            <svg
              class="w-8 h-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            <span class="text-xs font-[Inter] tracking-wider uppercase">{{
              slot.placeholder
            }}</span>
            <span class="text-[10px] font-[Inter]">Click or drop photo here</span>
          </div>
        </template>
      </div>

      <!-- TEXT SLOT -->
      <div
        v-else-if="slot.type === 'text'"
        class="absolute group cursor-text overflow-hidden z-[2]"
        :style="{
          left: slot.x + 'px',
          top: slot.y + 'px',
          width: slot.w + 'px',
          height: slot.h + 'px',
          boxSizing: 'border-box',
          fontFamily: slot.fontFamily || 'inherit',
          fontSize: (slot.fontSize || 12) + 'px',
          fontWeight: slot.fontWeight || 'normal',
          fontStyle: slot.fontStyle || 'normal',
          textAlign: (slot.textAlign as any) || 'left',
          letterSpacing: slot.letterSpacing ? slot.letterSpacing + 'px' : undefined,
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
          padding: slot.borderTop || slot.borderBottom ? '4px 0' : '0',
        }"
        @dblclick="startEditText(slot)"
      >
        <!-- Editing mode -->
        <textarea
          v-if="editingSlot === slot.id"
          v-model="editText"
          class="w-full h-full bg-[var(--color-cream)]/80 border border-[var(--color-ink)]/40 p-1 resize-none focus:outline-none focus:border-[var(--color-ink)]"
          :style="{
            fontFamily: slot.fontFamily || 'inherit',
            fontSize: (slot.fontSize || 12) + 'px',
            fontWeight: slot.fontWeight || 'normal',
            fontStyle: slot.fontStyle || 'normal',
            textAlign: (slot.textAlign as any) || 'left',
            lineHeight: slot.lineHeight || 1.4,
          }"
          @blur="saveText(slot.id)"
          @keydown.escape="cancelEdit"
          @click.stop
        ></textarea>
        <!-- Display mode -->
        <span
          v-else
          class="whitespace-pre-wrap w-full"
          :class="{ 'hover:bg-[var(--color-ink)]/[0.03]': slot.editable }"
        >
          {{ store.getSlotContent(slot.id)?.text ?? slot.content }}
        </span>
        <!-- Edit indicator -->
        <div
          v-if="slot.editable && editingSlot !== slot.id"
          class="absolute -right-1 -top-1 w-4 h-4 bg-[var(--color-accent)] text-white flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-opacity z-30 rounded-full"
          title="Double-click to edit"
        >
          ✎
        </div>
      </div>
    </template>
  </div>
</template>
