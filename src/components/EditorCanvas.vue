<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEditorStore } from '@/stores/editor'
import type { TemplateSlot } from '@/templates/newspaper-templates'

const store = useEditorStore()

const editingSlot = ref<string | null>(null)
const editText = ref('')

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
}
</script>

<template>
  <div
    v-if="template"
    class="relative bg-white shadow-2xl"
    :style="{
      width: template.width + 'px',
      height: template.height + 'px',
      background: template.background,
      transform: `scale(${store.zoomLevel})`,
      transformOrigin: 'top center',
    }"
  >
    <!-- Grain Overlay -->
    <div
      class="absolute inset-0 pointer-events-none z-50 opacity-[0.04]"
      :style="{
        backgroundImage: `url('data:image/svg+xml,${encodeURIComponent(`<svg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`)}')`,
      }"
    ></div>

    <!-- Grid overlay -->
    <div
      v-if="store.showGrid"
      class="absolute inset-0 pointer-events-none z-40"
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
        class="absolute overflow-hidden group"
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
            :style="{ filter: getFilterStyle(slot.id) }"
          />
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
            class="w-full h-full border-2 border-dashed border-[var(--color-ink)]/20 bg-[var(--color-ink)]/[0.03] flex flex-col items-center justify-center gap-2 text-[var(--color-ink)]/30 hover:border-[var(--color-ink)]/40 hover:bg-[var(--color-ink)]/[0.06] transition-all"
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
            <span class="text-[10px] font-[Inter]">Drop photo here</span>
          </div>
        </template>
      </div>

      <!-- TEXT SLOT -->
      <div
        v-else-if="slot.type === 'text'"
        class="absolute group cursor-text overflow-hidden"
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
