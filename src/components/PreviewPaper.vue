<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { getTextureById, getPaperOverlayStyle, getPaperCreaseOverlayStyle } from '@/utils/paper-textures'
import { VINTAGE_STAMPS } from '@/utils/stamps'

const store = useEditorStore()
const previewMode = ref<'flat' | '3d'>('flat')
const previewScale = ref(0.5)
const paperRotateX = ref(10)
const paperRotateY = ref(-5)
const isDragging3D = ref(false)
const lastMouse = ref({ x: 0, y: 0 })
const previewAreaRef = ref<HTMLDivElement | null>(null)

// Pinch-to-zoom on preview
const initialPinchDist = ref<number | null>(null)
const initialPinchScale = ref(0.5)

const template = computed(() => store.selectedTemplate)
const currentTexture = computed(() => getTextureById(store.paperTexture))

// Identical to EditorCanvas – keeps rendering consistent
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

function getStampDef(stampType: string) {
  return VINTAGE_STAMPS.find((s) => s.id === stampType)
}

const paperTransform = computed(() => {
  const s = previewScale.value
  if (previewMode.value === '3d') {
    return `scale(${s}) rotateX(${paperRotateX.value}deg) rotateY(${paperRotateY.value}deg)`
  }
  return `scale(${s})`
})

// Mouse 3D rotation
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

// Touch 3D rotation & pinch-zoom
function onPreviewTouchStart(e: TouchEvent) {
  if (e.touches.length === 2) {
    const t1 = e.touches[0]!
    const t2 = e.touches[1]!
    initialPinchDist.value = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
    initialPinchScale.value = previewScale.value
  } else if (e.touches.length === 1 && previewMode.value === '3d') {
    isDragging3D.value = true
    const touch = e.touches[0]!
    lastMouse.value = { x: touch.clientX, y: touch.clientY }
  }
}

function onPreviewTouchMove(e: TouchEvent) {
  if (e.touches.length === 2 && initialPinchDist.value !== null) {
    e.preventDefault()
    const t1 = e.touches[0]!
    const t2 = e.touches[1]!
    const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
    const factor = dist / initialPinchDist.value
    previewScale.value = Math.max(0.18, Math.min(1.2, Number((initialPinchScale.value * factor).toFixed(2))))
  } else if (e.touches.length === 1 && isDragging3D.value) {
    const touch = e.touches[0]!
    const dx = touch.clientX - lastMouse.value.x
    const dy = touch.clientY - lastMouse.value.y
    paperRotateY.value += dx * 0.4
    paperRotateX.value -= dy * 0.4
    paperRotateX.value = Math.max(-30, Math.min(30, paperRotateX.value))
    paperRotateY.value = Math.max(-30, Math.min(30, paperRotateY.value))
    lastMouse.value = { x: touch.clientX, y: touch.clientY }
  }
}

function onPreviewTouchEnd(e: TouchEvent) {
  if (e.touches.length < 2) {
    initialPinchDist.value = null
  }
  if (e.touches.length === 0) {
    isDragging3D.value = false
  }
}

function zoomPreview(delta: number) {
  previewScale.value = Math.max(0.18, Math.min(1.2, Number((previewScale.value + delta).toFixed(2))))
}

function autoFitPreview() {
  if (!template.value) return
  const container = previewAreaRef.value
  const availW = container ? container.clientWidth : window.innerWidth
  const availH = container ? container.clientHeight : window.innerHeight - 170
  const padW = availW < 640 ? 16 : 48
  const padH = availW < 640 ? 16 : 48
  const scaleW = (availW - padW) / template.value.width
  const scaleH = (availH - padH) / template.value.height
  const optimal = Math.min(scaleW, scaleH)
  previewScale.value = Math.max(0.18, Math.min(0.85, Number(optimal.toFixed(2))))
}

onMounted(() => {
  autoFitPreview()
  window.addEventListener('resize', autoFitPreview)
})

onUnmounted(() => {
  window.removeEventListener('resize', autoFitPreview)
})
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <!-- Preview Controls -->
    <div
      class="flex items-center justify-between py-2 px-3 sm:px-5 border-b border-[var(--color-ink)]/10 bg-[var(--color-paper)] flex-shrink-0"
    >
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-[var(--color-accent)] hidden sm:inline-block"></span>
        <h2 class="font-[Playfair_Display] text-base sm:text-lg font-bold text-[var(--color-ink)]">
          Pratinjau
        </h2>
        <span class="text-[10px] font-[Inter] tracking-wider text-[var(--color-ink-light)] uppercase hidden md:inline">
          · Siap Cetak
        </span>
      </div>

      <div class="flex items-center gap-1.5 sm:gap-3">
        <!-- View mode toggle: Flat vs 3D -->
        <div class="flex items-center border border-[var(--color-ink)]/20 p-0.5 rounded-xs bg-[var(--color-cream)]/40">
          <button
            @click="previewMode = 'flat'"
            :class="[
              'px-2.5 py-1 text-[11px] font-[Inter] tracking-wider uppercase transition-colors cursor-pointer rounded-2xs',
              previewMode === 'flat'
                ? 'bg-[var(--color-ink)] text-[var(--color-cream)] font-semibold shadow-xs'
                : 'text-[var(--color-ink-light)] hover:text-[var(--color-ink)]',
            ]"
          >
            Flat
          </button>
          <button
            @click="previewMode = '3d'"
            :class="[
              'px-2.5 py-1 text-[11px] font-[Inter] tracking-wider uppercase transition-colors cursor-pointer rounded-2xs',
              previewMode === '3d'
                ? 'bg-[var(--color-ink)] text-[var(--color-cream)] font-semibold shadow-xs'
                : 'text-[var(--color-ink-light)] hover:text-[var(--color-ink)]',
            ]"
          >
            3D Paper
          </button>
        </div>

        <!-- Preview Zoom & Fit -->
        <div class="flex items-center gap-1">
          <button
            @click="zoomPreview(-0.05)"
            class="w-6 h-6 sm:w-7 sm:h-7 border border-[var(--color-ink)]/20 flex items-center justify-center hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)] transition-colors text-xs cursor-pointer rounded-xs"
            title="Perkecil"
          >
            −
          </button>
          <span
            class="font-[Inter] text-[11px] text-[var(--color-ink)] w-8 sm:w-9 text-center tabular-nums font-semibold"
          >
            {{ Math.round(previewScale * 100) }}%
          </span>
          <button
            @click="zoomPreview(0.05)"
            class="w-6 h-6 sm:w-7 sm:h-7 border border-[var(--color-ink)]/20 flex items-center justify-center hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)] transition-colors text-xs cursor-pointer rounded-xs"
            title="Perbesar"
          >
            +
          </button>
          <button
            @click="autoFitPreview"
            class="ml-0.5 sm:ml-1 px-2 py-1 text-[11px] font-[Inter] font-semibold tracking-wider uppercase border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 text-[var(--color-ink)] hover:bg-[var(--color-accent)] hover:text-white transition-colors cursor-pointer rounded-xs"
            title="Sesuaikan Pas Layar"
          >
            Fit
          </button>
        </div>
      </div>
    </div>

    <!-- Preview Area -->
    <div
      ref="previewAreaRef"
      class="flex-1 flex items-center justify-center overflow-auto bg-[var(--color-ink)]/[0.03] p-2 sm:p-6 relative select-none"
      :style="previewMode === '3d' ? { perspective: '1400px' } : undefined"
      @mousedown="startDrag3D"
      @mousemove="onDrag3D"
      @mouseup="endDrag3D"
      @mouseleave="endDrag3D"
      @touchstart="onPreviewTouchStart"
      @touchmove="onPreviewTouchMove"
      @touchend="onPreviewTouchEnd"
    >
      <!-- 3D Drag Tooltip Hint -->
      <div
        v-if="previewMode === '3d'"
        class="absolute top-3 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-[Inter] tracking-wider uppercase px-3 py-1 rounded-full pointer-events-none shadow-md z-30"
      >
        ✦ Drag / Geser untuk Memutar 3D
      </div>
      <!--
        Outer wrapper: reserves the scaled dimensions in the flow.
        Inner paper: renders at 1:1 (same as EditorCanvas), then CSS-scaled.
        This guarantees the preview is pixel-identical to the editor.
      -->
      <div
        v-if="template"
        :style="{
          width: template.width * previewScale + 'px',
          height: template.height * previewScale + 'px',
        }"
      >
        <div
          class="relative shadow-2xl transition-transform duration-100"
          :style="{
            width: template.width + 'px',
            height: template.height + 'px',
            background:
              store.paperTexture !== 'plain' ? currentTexture.background : template.background,
            color: currentTexture.inkColor,
            '--color-ink': currentTexture.inkColor,
            transform: paperTransform,
            transformOrigin: 'top left',
            transformStyle: previewMode === '3d' ? 'preserve-3d' : undefined,
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

          <!-- Texture / Grain overlay (behind content, only affects paper) -->
          <div
            class="absolute inset-0 pointer-events-none z-[1]"
            :style="getPaperOverlayStyle(store.paperTexture)"
          ></div>

          <!-- Slots: exact same coordinates as EditorCanvas (1:1) -->
          <template v-for="slot in template.slots" :key="slot.id">
            <!-- Image slot -->
            <div
              v-if="slot.type === 'image'"
              class="absolute overflow-hidden z-[2]"
              :style="{
                left: slot.x + 'px',
                top: slot.y + 'px',
                width: slot.w + 'px',
                height: slot.h + 'px',
                boxSizing: 'border-box',
                ...(store.getSlotContent(slot.id)?.imageUrl ? getPhotoBorderStyle(slot.id) : {}),
              }"
            >
              <img
                v-if="store.getSlotContent(slot.id)?.imageUrl"
                :src="store.getSlotContent(slot.id)!.imageUrl!"
                class="w-full h-full object-cover"
                :style="{ filter: getFilterStyle(slot.id), ...getImageTransformStyle(slot.id) }"
              />
              <div
                v-else
                class="w-full h-full bg-[var(--color-ink)]/[0.05] flex items-center justify-center"
              >
                <span
                  class="text-xs font-[Inter] text-[var(--color-ink)]/20 uppercase tracking-wider"
                  >{{ slot.placeholder }}</span
                >
              </div>
            </div>

            <!-- Text slot -->
            <div
              v-else-if="slot.type === 'text'"
              class="absolute overflow-hidden z-[2]"
              :style="{
                left: slot.x + 'px',
                top: slot.y + 'px',
                width: slot.w + 'px',
                height: slot.h + 'px',
                fontFamily: slot.fontFamily || 'inherit',
                fontSize: (slot.fontSize || 12) + 'px',
                fontWeight: slot.fontWeight || 'normal',
                fontStyle: slot.fontStyle || 'normal',
                textAlign: (slot.textAlign as any) || 'left',
                letterSpacing: slot.letterSpacing ? slot.letterSpacing + 'px' : undefined,
                lineHeight: slot.id === 'masthead' ? (slot.lineHeight || 1.05) : (slot.lineHeight || 1.4),
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
                alignItems: slot.id === 'masthead' || (slot.borderTop && slot.borderBottom && !slot.padding) ? 'center' : 'flex-start',
                justifyContent:
                  slot.textAlign === 'center'
                    ? 'center'
                    : slot.textAlign === 'right'
                      ? 'flex-end'
                      : 'flex-start',
              }"
            >
              <span
                class="whitespace-pre-wrap w-full"
                :class="{ 'has-drop-cap': slot.hasDropCap }"
              >
                {{ store.getSlotContent(slot.id)?.text ?? slot.content }}
              </span>
            </div>
          </template>

          <!-- Active Vintage Stamps on Preview -->
          <div
            v-for="st in store.activeStamps"
            :key="st.id"
            class="absolute select-none pointer-events-none z-[10]"
            :style="{
              left: st.x + 'px',
              top: st.y + 'px',
              width: (getStampDef(st.stampType)?.width ?? 120) + 'px',
              height: (getStampDef(st.stampType)?.height ?? 80) + 'px',
              transform: `rotate(${st.rotation}deg) scale(${st.scale || 1})`,
              transformOrigin: 'center center',
            }"
          >
            <div
              v-if="st.stampType === 'special-edition'"
              class="w-full h-full border-[3px] border-[#8B1E1E] p-1 flex flex-col items-center justify-center text-center opacity-90"
              style="outline: 1px dashed #8B1E1E; outline-offset: -5px;"
            >
              <span class="font-[Inter] text-[9px] font-bold tracking-wider text-[#8B1E1E] uppercase leading-none">★ SPECIAL EDITION ★</span>
              <span class="font-[Playfair_Display] text-[16px] font-black tracking-widest text-[#8B1E1E] uppercase leading-tight my-0.5">EDISI KHUSUS</span>
              <span class="font-[Cinzel] text-[8px] font-bold tracking-wider text-[#8B1E1E] uppercase leading-none">TERBIT RESMI NUSANTARA</span>
            </div>
            <div
              v-else-if="st.stampType === 'postmark-round'"
              class="w-full h-full rounded-full border-[3px] border-[#1E293B] p-1 flex flex-col items-center justify-center text-center opacity-85"
              style="outline: 1px solid #1E293B; outline-offset: -5px;"
            >
              <span class="font-[Cinzel] text-[8px] font-bold tracking-widest text-[#1E293B] uppercase">POSTKANTOOR</span>
              <span class="font-[Playfair_Display] text-[15px] font-black tracking-wider text-[#1E293B] my-0.5">1945</span>
              <span class="font-[Inter] text-[7.5px] font-semibold tracking-wider text-[#1E293B] uppercase">DJAKARTA · LUNAS</span>
            </div>
            <div
              v-else-if="st.stampType === 'official-archive'"
              class="w-full h-full border-[2.5px] border-[#8B1E1E] p-1.5 flex flex-col items-center justify-center text-center opacity-90"
              style="outline: 1px solid #8B1E1E; outline-offset: -3px;"
            >
              <span class="font-[Cinzel] text-[11px] font-bold tracking-widest text-[#8B1E1E] uppercase leading-tight">ARSIP PUSAKA RESMI</span>
              <span class="font-[Libre_Baskerville] text-[8px] italic text-[#8B1E1E] leading-none mt-1">DOCUMENT ARCHIVES · NO. 1928</span>
            </div>
            <div
              v-else-if="st.stampType === 'verified-heritage'"
              class="w-full h-full border-[2.5px] border-[#065F46] p-1 flex flex-col items-center justify-center text-center opacity-90"
              style="clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%); background: rgba(6, 95, 70, 0.05);"
            >
              <span class="font-[Cinzel] text-[8px] font-bold tracking-wider text-[#065F46] uppercase leading-none">AUTHENTIC</span>
              <span class="font-[Cinzel] text-[10px] font-black tracking-widest text-[#065F46] uppercase leading-tight my-0.5">HERITAGE</span>
              <span class="font-[Inter] text-[7px] font-bold text-[#065F46] uppercase leading-none">★ 100% ORIGINAL ★</span>
            </div>
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
            <div
              v-else-if="st.stampType === 'love-eternal'"
              class="w-full h-full border-[2.5px] border-[#9F1239] p-1 flex flex-col items-center justify-center text-center opacity-90"
              style="outline: 1px solid #9F1239; outline-offset: -3px;"
            >
              <span class="font-[Cinzel] text-[8px] font-bold tracking-wider text-[#9F1239] uppercase leading-none">♥ IKATAN JANJI SUCI ♥</span>
              <span class="font-[Playfair_Display] text-[14px] font-black italic tracking-wide text-[#9F1239] my-0.5 leading-tight">Eternal Love</span>
              <span class="font-[Inter] text-[7.5px] font-bold tracking-wider text-[#9F1239] uppercase leading-none">SELAMANYA BERSAMA</span>
            </div>
          </div>

          <!-- Realistic Paper Crease & Vignette Overlay (over content, physical paper fold simulation) -->
          <div
            v-if="store.paperCrease || store.paperVignette"
            class="absolute inset-0 pointer-events-none z-[25]"
            :style="getPaperCreaseOverlayStyle({ crease: store.paperCrease, vignette: store.paperVignette })"
          ></div>
        </div>
      </div>
    </div>

    <!-- 3D hint -->
    <div
      v-if="previewMode === '3d'"
      class="text-center py-2 bg-[var(--color-paper)] border-t border-[var(--color-ink)]/10"
    >
      <span class="text-xs font-[Inter] text-[var(--color-ink-light)]"
        >Click and drag to rotate the paper</span
      >
    </div>
  </div>
</template>

<style scoped>
.has-drop-cap::first-letter {
  float: left;
  font-family: 'Playfair Display', serif;
  font-size: 3.4em;
  line-height: 0.78;
  padding-right: 6px;
  padding-top: 2px;
  padding-bottom: 0;
  font-weight: 900;
  color: var(--color-ink);
}
</style>
