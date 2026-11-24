<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEditorStore } from '@/stores/editor'
import type { TemplateSlot } from '@/templates/newspaper-templates'
import { getTextureById, getPaperOverlayStyle } from '@/utils/paper-textures'
import { VINTAGE_STAMPS } from '@/utils/stamps'

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

// Stamp drag state
const draggingStampId = ref<string | null>(null)
const stampDragStartX = ref(0)
const stampDragStartY = ref(0)
const stampOrigX = ref(0)
const stampOrigY = ref(0)

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
    case 'noir':
      return 'grayscale(100%) contrast(1.45) brightness(0.92)'
    case 'halftone':
      return 'grayscale(100%) contrast(1.7) brightness(1.05)'
    case 'warm':
      return 'sepia(55%) contrast(1.15) brightness(0.9) saturate(0.85)'
    default:
      return ''
  }
}

function getPhotoBorderStyle(slotId: string) {
  const content = store.getSlotContent(slotId)
  const border = content?.photoBorder || store.activePhotoBorder || 'hairline'
  switch (border) {
    case 'hairline':
      return {
        border: '1px solid var(--color-ink)',
      }
    case 'double':
      return {
        border: '3px double var(--color-ink)',
      }
    case 'album':
      return {
        border: '5px solid #FAF8F3',
        outline: '1px solid var(--color-ink)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
      }
    case 'none':
    default:
      return {}
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

// Image zoom/pan/rotate controls
function getImageTransformStyle(slotId: string) {
  const content = store.getSlotContent(slotId)
  const zoom = content?.imageZoom ?? 1
  const ox = content?.imageOffsetX ?? 50
  const oy = content?.imageOffsetY ?? 50
  const rot = content?.imageRotation ?? 0
  const flip = content?.imageFlipH ? -1 : 1

  const transforms: string[] = []
  if (zoom !== 1) transforms.push(`scale(${zoom})`)
  if (rot !== 0) transforms.push(`rotate(${rot}deg)`)
  if (flip !== 1) transforms.push(`scaleX(${flip})`)

  return {
    transform: transforms.length > 0 ? transforms.join(' ') : undefined,
    transformOrigin: 'center center',
    objectPosition: `${ox}% ${oy}%`,
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
  const ox = content?.imageOffsetX ?? 50
  const oy = content?.imageOffsetY ?? 50
  store.updateSlotImageTransform(slotId, value, ox, oy)
}

function onResetTransform(slotId: string) {
  const content = store.getSlotContent(slotId)
  if (content && content.type === 'image') {
    content.imageZoom = 1
    content.imageOffsetX = 50
    content.imageOffsetY = 50
    content.imageRotation = 0
    content.imageFlipH = false
  }
}

function onImageMouseDown(e: MouseEvent, slotId: string) {
  const content = store.getSlotContent(slotId)
  if (!content) return
  e.preventDefault()
  draggingSlotId.value = slotId
  dragStartX.value = e.clientX
  dragStartY.value = e.clientY
  dragStartOffsetX.value = content.imageOffsetX ?? 50
  dragStartOffsetY.value = content.imageOffsetY ?? 50
  window.addEventListener('mousemove', onImageMouseMove)
  window.addEventListener('mouseup', onImageMouseUp)
}

function onImageMouseMove(e: MouseEvent) {
  if (!draggingSlotId.value) return
  const content = store.getSlotContent(draggingSlotId.value)
  const zoom = content?.imageZoom ?? 1
  const slot = template.value?.slots.find((s) => s.id === draggingSlotId.value)
  const slotW = slot?.w ?? 100
  const slotH = slot?.h ?? 100
  const canvasZoom = store.zoomLevel
  const dx = ((-(e.clientX - dragStartX.value) / (slotW * canvasZoom)) * 100) / zoom
  const dy = ((-(e.clientY - dragStartY.value) / (slotH * canvasZoom)) * 100) / zoom
  const newOx = Math.max(0, Math.min(100, dragStartOffsetX.value + dx))
  const newOy = Math.max(0, Math.min(100, dragStartOffsetY.value + dy))
  store.updateSlotImageTransform(draggingSlotId.value, zoom, newOx, newOy)
}

function onImageMouseUp() {
  draggingSlotId.value = null
  window.removeEventListener('mousemove', onImageMouseMove)
  window.removeEventListener('mouseup', onImageMouseUp)
}

function onImageTouchStart(e: TouchEvent, slotId: string) {
  if (e.touches.length !== 1) return
  const touch = e.touches[0]!
  const content = store.getSlotContent(slotId)
  if (!content) return
  e.preventDefault()
  draggingSlotId.value = slotId
  dragStartX.value = touch.clientX
  dragStartY.value = touch.clientY
  dragStartOffsetX.value = content.imageOffsetX ?? 50
  dragStartOffsetY.value = content.imageOffsetY ?? 50
  window.addEventListener('touchmove', onImageTouchMove, { passive: false })
  window.addEventListener('touchend', onImageTouchEnd)
}

function onImageTouchMove(e: TouchEvent) {
  if (!draggingSlotId.value || e.touches.length !== 1) return
  e.preventDefault()
  const touch = e.touches[0]!
  const content = store.getSlotContent(draggingSlotId.value)
  const zoom = content?.imageZoom ?? 1
  const slot = template.value?.slots.find((s) => s.id === draggingSlotId.value)
  const slotW = slot?.w ?? 100
  const slotH = slot?.h ?? 100
  const canvasZoom = store.zoomLevel
  const dx = ((-(touch.clientX - dragStartX.value) / (slotW * canvasZoom)) * 100) / zoom
  const dy = ((-(touch.clientY - dragStartY.value) / (slotH * canvasZoom)) * 100) / zoom
  const newOx = Math.max(0, Math.min(100, dragStartOffsetX.value + dx))
  const newOy = Math.max(0, Math.min(100, dragStartOffsetY.value + dy))
  store.updateSlotImageTransform(draggingSlotId.value, zoom, newOx, newOy)
}

function onImageTouchEnd() {
  draggingSlotId.value = null
  window.removeEventListener('touchmove', onImageTouchMove)
  window.removeEventListener('touchend', onImageTouchEnd)
}

// Stamp Dragging
function onStampMouseDown(e: MouseEvent, stampId: string) {
  e.preventDefault()
  e.stopPropagation()
  draggingStampId.value = stampId
  stampDragStartX.value = e.clientX
  stampDragStartY.value = e.clientY
  const s = store.activeStamps.find((st) => st.id === stampId)
  stampOrigX.value = s?.x ?? 0
  stampOrigY.value = s?.y ?? 0
  window.addEventListener('mousemove', onStampMouseMove)
  window.addEventListener('mouseup', onStampMouseUp)
}

function onStampMouseMove(e: MouseEvent) {
  if (!draggingStampId.value) return
  const zoom = store.zoomLevel
  const dx = (e.clientX - stampDragStartX.value) / zoom
  const dy = (e.clientY - stampDragStartY.value) / zoom
  store.updateStampPosition(
    draggingStampId.value,
    Math.round(stampOrigX.value + dx),
    Math.round(stampOrigY.value + dy),
  )
}

function onStampMouseUp() {
  draggingStampId.value = null
  window.removeEventListener('mousemove', onStampMouseMove)
  window.removeEventListener('mouseup', onStampMouseUp)
}

function onStampTouchStart(e: TouchEvent, stampId: string) {
  if (e.touches.length !== 1) return
  const touch = e.touches[0]!
  e.preventDefault()
  e.stopPropagation()
  draggingStampId.value = stampId
  stampDragStartX.value = touch.clientX
  stampDragStartY.value = touch.clientY
  const s = store.activeStamps.find((st) => st.id === stampId)
  stampOrigX.value = s?.x ?? 0
  stampOrigY.value = s?.y ?? 0
  window.addEventListener('touchmove', onStampTouchMove, { passive: false })
  window.addEventListener('touchend', onStampTouchEnd)
}

function onStampTouchMove(e: TouchEvent) {
  if (!draggingStampId.value || e.touches.length !== 1) return
  e.preventDefault()
  const touch = e.touches[0]!
  const zoom = store.zoomLevel
  const dx = (touch.clientX - stampDragStartX.value) / zoom
  const dy = (touch.clientY - stampDragStartY.value) / zoom
  store.updateStampPosition(
    draggingStampId.value,
    Math.round(stampOrigX.value + dx),
    Math.round(stampOrigY.value + dy),
  )
}

function onStampTouchEnd() {
  draggingStampId.value = null
  window.removeEventListener('touchmove', onStampTouchMove)
  window.removeEventListener('touchend', onStampTouchEnd)
}

function getStampDef(stampType: string) {
  return VINTAGE_STAMPS.find((s) => s.id === stampType)
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
          ...(store.getSlotContent(slot.id)?.imageUrl ? getPhotoBorderStyle(slot.id) : {}),
        }"
        @drop="onSlotDrop($event, slot)"
        @dragover="onSlotDragOver"
      >
        <!-- If image assigned -->
        <template v-if="store.getSlotContent(slot.id)?.imageUrl">
          <img
            :src="store.getSlotContent(slot.id)!.imageUrl"
            :alt="slot.placeholder"
            class="w-full h-full object-cover select-none"
            :class="{
              'cursor-grab': draggingSlotId !== slot.id,
              'cursor-grabbing': draggingSlotId === slot.id,
            }"
            :style="{ filter: getFilterStyle(slot.id), ...getImageTransformStyle(slot.id) }"
            @mousedown="onImageMouseDown($event, slot.id)"
            @touchstart="onImageTouchStart($event, slot.id)"
            draggable="false"
          />
          <!-- Image controls toggle button -->
          <button
            @click.stop="toggleImageControls(slot.id)"
            class="absolute top-2 left-2 w-7 h-7 bg-black/70 hover:bg-black text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-30 rounded shadow-sm cursor-pointer"
            title="Atur Zoom, Posisi & Rotasi Foto"
          >
            <svg
              class="w-4 h-4"
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

          <!-- Zoom/Pan/Rotate controls panel -->
          <div
            v-if="activeImageSlot === slot.id"
            class="absolute bottom-0 left-0 right-0 bg-black/85 backdrop-blur-md p-2.5 z-30 flex flex-wrap items-center gap-2 text-white border-t border-white/20"
            @click.stop
          >
            <!-- Zoom slider -->
            <div class="flex items-center gap-1.5 flex-1 min-w-[130px]">
              <span class="text-[9px] font-[Inter] tracking-wider uppercase opacity-75">Zoom:</span>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                :value="getSlotZoom(slot.id)"
                @input="onZoomChange(slot.id, parseFloat(($event.target as HTMLInputElement).value))"
                class="flex-1 h-1 accent-white cursor-pointer"
              />
              <span class="text-[10px] font-[Inter] w-7 text-right"
                >{{ Math.round(getSlotZoom(slot.id) * 100) }}%</span
              >
            </div>

            <!-- Rotate 90° button -->
            <button
              @click.stop="store.rotateSlotImage(slot.id, 90)"
              class="px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-[10px] font-[Inter] tracking-wider uppercase flex items-center gap-1 transition-colors cursor-pointer"
              title="Putar foto 90 derajat searah jarum jam"
            >
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              90°
            </button>

            <!-- Flip Horizontal button -->
            <button
              @click.stop="store.flipSlotImage(slot.id)"
              class="px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-[10px] font-[Inter] tracking-wider uppercase flex items-center gap-1 transition-colors cursor-pointer"
              title="Cermin horizontal (flip)"
            >
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
              </svg>
              Cermin
            </button>

            <!-- Reset button -->
            <button
              @click.stop="onResetTransform(slot.id)"
              class="text-white/70 hover:text-white text-[10px] font-[Inter] tracking-wider uppercase px-1 transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>

          <!-- Remove button -->
          <button
            @click="removeImage(slot.id)"
            class="absolute top-2 right-2 w-7 h-7 bg-red-800/80 hover:bg-red-800 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-30 rounded cursor-pointer"
            title="Hapus foto dari slot"
          >
            ✕
          </button>
        </template>

        <!-- Empty placeholder -->
        <template v-else>
          <div
            class="w-full h-full border-2 border-dashed border-[var(--color-ink)]/20 bg-[var(--color-ink)]/[0.03] flex flex-col items-center justify-center p-2 text-center text-[var(--color-ink)]/40 hover:border-[var(--color-ink)]/40 hover:bg-[var(--color-ink)]/[0.06] transition-all"
            @click="onSlotClick(slot.id)"
          >
            <svg
              class="w-6 h-6 mb-1 text-[var(--color-ink)]/30 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            <span class="text-[11px] font-[Inter] font-medium tracking-wider uppercase text-[var(--color-ink)]/70 mb-2 truncate max-w-[90%]">
              {{ slot.placeholder }}
            </span>

            <!-- Quick Action Buttons -->
            <div class="flex flex-wrap items-center justify-center gap-1.5 z-10">
              <button
                type="button"
                @click.stop="store.openCamera(slot.id)"
                class="px-2 py-1 bg-[var(--color-ink)] text-[var(--color-cream)] hover:bg-[var(--color-ink-light)] text-[9px] font-[Inter] tracking-wider uppercase transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                title="Ambil foto langsung dengan kamera"
              >
                <svg class="w-3 h-3 text-[var(--color-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                Kamera
              </button>

              <button
                type="button"
                @click.stop="onSlotClick(slot.id)"
                class="px-2 py-1 border border-[var(--color-ink)]/30 bg-[var(--color-paper)] text-[var(--color-ink)] hover:border-[var(--color-ink)] text-[9px] font-[Inter] tracking-wider uppercase transition-colors flex items-center gap-1 cursor-pointer"
                title="Upload foto dari folder atau galeri"
              >
                <svg class="w-3 h-3 text-[var(--color-ink-light)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 16V4m0 0L8 8m4-4l4 4" />
                  <path d="M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17" />
                </svg>
                Upload
              </button>
            </div>
            <span class="text-[8px] font-[Inter] text-[var(--color-ink)]/40 mt-1">atau geser foto ke sini</span>
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
          backgroundColor: slot.backgroundColor || undefined,
          color: slot.color || undefined,
          border: slot.border || undefined,
          borderTop: slot.border ? undefined : (slot.borderTop ? '1px solid var(--color-ink)' : undefined),
          borderBottom: slot.border ? undefined : (slot.borderBottom ? '1px solid var(--color-ink)' : undefined),
          borderLeft: slot.border ? undefined : (typeof slot.borderLeft === 'string' ? slot.borderLeft : (slot.borderLeft ? '3px solid var(--color-ink)' : undefined)),
          borderRight: slot.border ? undefined : (typeof slot.borderRight === 'string' ? slot.borderRight : (slot.borderRight ? '3px solid var(--color-ink)' : undefined)),
          padding: slot.padding || (slot.borderTop || slot.borderBottom ? '4px 0' : '0'),
          display: 'flex',
          alignItems: slot.borderTop && slot.borderBottom && !slot.padding ? 'center' : 'flex-start',
          justifyContent:
            slot.textAlign === 'center'
              ? 'center'
              : slot.textAlign === 'right'
                ? 'flex-end'
                : 'flex-start',
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

    <!-- DRAGGABLE VINTAGE STAMPS LAYER (Poin 3) -->
    <div
      v-for="st in store.activeStamps"
      :key="st.id"
      class="absolute select-none cursor-move group z-[20]"
      :style="{
        left: st.x + 'px',
        top: st.y + 'px',
        width: (getStampDef(st.stampType)?.width ?? 120) + 'px',
        height: (getStampDef(st.stampType)?.height ?? 80) + 'px',
        transform: `rotate(${st.rotation}deg) scale(${st.scale || 1})`,
        transformOrigin: 'center center',
      }"
      @mousedown="onStampMouseDown($event, st.id)"
      @touchstart="onStampTouchStart($event, st.id)"
    >
      <!-- Stamp Visuals: Special Edition -->
      <div
        v-if="st.stampType === 'special-edition'"
        class="w-full h-full border-[3px] border-[#8B1E1E] p-1 flex flex-col items-center justify-center text-center opacity-90 shadow-xs"
        style="outline: 1px dashed #8B1E1E; outline-offset: -5px;"
      >
        <span class="font-[Inter] text-[9px] font-bold tracking-wider text-[#8B1E1E] uppercase leading-none">★ SPECIAL EDITION ★</span>
        <span class="font-[Playfair_Display] text-[16px] font-black tracking-widest text-[#8B1E1E] uppercase leading-tight my-0.5">EDISI KHUSUS</span>
        <span class="font-[Cinzel] text-[8px] font-bold tracking-wider text-[#8B1E1E] uppercase leading-none">TERBIT RESMI NUSANTARA</span>
      </div>

      <!-- Stamp Visuals: Postmark Round -->
      <div
        v-else-if="st.stampType === 'postmark-round'"
        class="w-full h-full rounded-full border-[3px] border-[#1E293B] p-1 flex flex-col items-center justify-center text-center opacity-85"
        style="outline: 1px solid #1E293B; outline-offset: -5px;"
      >
        <span class="font-[Cinzel] text-[8px] font-bold tracking-widest text-[#1E293B] uppercase">POSTKANTOOR</span>
        <span class="font-[Playfair_Display] text-[15px] font-black tracking-wider text-[#1E293B] my-0.5">1945</span>
        <span class="font-[Inter] text-[7.5px] font-semibold tracking-wider text-[#1E293B] uppercase">DJAKARTA · LUNAS</span>
      </div>

      <!-- Stamp Visuals: Official Archive -->
      <div
        v-else-if="st.stampType === 'official-archive'"
        class="w-full h-full border-[2.5px] border-[#8B1E1E] p-1.5 flex flex-col items-center justify-center text-center opacity-90"
        style="outline: 1px solid #8B1E1E; outline-offset: -3px;"
      >
        <span class="font-[Cinzel] text-[11px] font-bold tracking-widest text-[#8B1E1E] uppercase leading-tight">ARSIP PUSAKA RESMI</span>
        <span class="font-[Libre_Baskerville] text-[8px] italic text-[#8B1E1E] leading-none mt-1">DOCUMENT ARCHIVES · NO. 1928</span>
      </div>

      <!-- Stamp Visuals: Verified Heritage -->
      <div
        v-else-if="st.stampType === 'verified-heritage'"
        class="w-full h-full border-[2.5px] border-[#065F46] p-1 flex flex-col items-center justify-center text-center opacity-90"
        style="clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%); background: rgba(6, 95, 70, 0.05);"
      >
        <span class="font-[Cinzel] text-[8px] font-bold tracking-wider text-[#065F46] uppercase leading-none">AUTHENTIC</span>
        <span class="font-[Cinzel] text-[10px] font-black tracking-widest text-[#065F46] uppercase leading-tight my-0.5">HERITAGE</span>
        <span class="font-[Inter] text-[7px] font-bold text-[#065F46] uppercase leading-none">★ 100% ORIGINAL ★</span>
      </div>

      <!-- Stamp Visuals: Congratulations -->
      <div
        v-else-if="st.stampType === 'congratulations'"
        class="w-full h-full rounded-full border-[2.5px] border-[#92400E] p-1 flex flex-col items-center justify-center text-center opacity-90"
        style="outline: 1px dashed #92400E; outline-offset: -4px;"
      >
        <span class="font-[Cinzel] text-[7.5px] font-bold tracking-wider text-[#92400E] uppercase">CONGRATULATIONS</span>
        <span class="font-[Playfair_Display] text-[12px] font-black tracking-wider text-[#92400E] my-0.5 leading-none">SELAMAT</span>
        <span class="font-[Cinzel] text-[9.5px] font-bold tracking-wider text-[#92400E] leading-none">& SUKSES</span>
        <span class="font-[Libre_Baskerville] text-[7.5px] italic text-[#92400E] mt-0.5">★ CUM LAUDE ★</span>
      </div>

      <!-- Stamp Visuals: Love Eternal -->
      <div
        v-else-if="st.stampType === 'love-eternal'"
        class="w-full h-full border-[2.5px] border-[#9F1239] p-1 flex flex-col items-center justify-center text-center opacity-90"
        style="outline: 1px solid #9F1239; outline-offset: -3px;"
      >
        <span class="font-[Cinzel] text-[8px] font-bold tracking-wider text-[#9F1239] uppercase leading-none">♥ IKATAN JANJI SUCI ♥</span>
        <span class="font-[Playfair_Display] text-[14px] font-black italic tracking-wide text-[#9F1239] my-0.5 leading-tight">Eternal Love</span>
        <span class="font-[Inter] text-[7.5px] font-bold tracking-wider text-[#9F1239] uppercase leading-none">SELAMANYA BERSAMA</span>
      </div>

      <!-- Stamp Controls on Hover -->
      <div
        class="absolute -top-3.5 -right-3.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-30"
        @click.stop
      >
        <button
          @click.stop="store.updateStampRotation(st.id, st.rotation - 15)"
          class="w-5 h-5 bg-black/80 hover:bg-black text-white text-[10px] rounded-full flex items-center justify-center cursor-pointer shadow-xs"
          title="Putar berlawanan jarum jam"
        >
          ↺
        </button>
        <button
          @click.stop="store.updateStampRotation(st.id, st.rotation + 15)"
          class="w-5 h-5 bg-black/80 hover:bg-black text-white text-[10px] rounded-full flex items-center justify-center cursor-pointer shadow-xs"
          title="Putar searah jarum jam"
        >
          ↻
        </button>
        <button
          @click.stop="store.removeStamp(st.id)"
          class="w-5 h-5 bg-red-700 hover:bg-red-800 text-white text-[10px] rounded-full flex items-center justify-center font-bold cursor-pointer shadow-xs"
          title="Hapus stempel"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>
