<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { getTextureById, getPaperOverlayStyle } from '@/utils/paper-textures'
import { VINTAGE_STAMPS } from '@/utils/stamps'

const store = useEditorStore()
const previewMode = ref<'flat' | '3d'>('flat')
const previewScale = ref(0.55)
const paperRotateX = ref(10)
const paperRotateY = ref(-5)
const isDragging3D = ref(false)
const lastMouse = ref({ x: 0, y: 0 })

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

function zoomPreview(delta: number) {
  previewScale.value = Math.max(0.2, Math.min(1, previewScale.value + delta))
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Preview Controls -->
    <div
      class="flex items-center justify-between py-3 px-4 border-b border-[var(--color-ink)]/10 bg-[var(--color-paper)]"
    >
      <h2 class="font-[Playfair_Display] text-xl font-bold text-[var(--color-ink)]">Preview</h2>

      <div class="flex items-center gap-4">
        <!-- Preview zoom -->
        <div class="flex items-center gap-2">
          <button
            @click="zoomPreview(-0.05)"
            class="w-7 h-7 border border-[var(--color-ink)]/20 flex items-center justify-center hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)] transition-colors text-xs"
          >
            −
          </button>
          <span
            class="font-[Inter] text-[11px] text-[var(--color-ink-light)] w-10 text-center tabular-nums"
            >{{ Math.round(previewScale * 100) }}%</span
          >
          <button
            @click="zoomPreview(0.05)"
            class="w-7 h-7 border border-[var(--color-ink)]/20 flex items-center justify-center hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)] transition-colors text-xs"
          >
            +
          </button>
        </div>

        <div class="h-5 w-px bg-[var(--color-ink)]/15"></div>

        <!-- View mode toggle -->
        <div class="flex items-center gap-1">
          <button
            @click="previewMode = 'flat'"
            :class="[
              'px-3 py-1.5 text-[11px] font-[Inter] tracking-wider uppercase border transition-colors',
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
              'px-3 py-1.5 text-[11px] font-[Inter] tracking-wider uppercase border transition-colors',
              previewMode === '3d'
                ? 'bg-[var(--color-ink)] text-[var(--color-cream)] border-[var(--color-ink)]'
                : 'border-[var(--color-ink)]/20 hover:border-[var(--color-ink)]',
            ]"
          >
            3D Paper
          </button>
        </div>
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
            >
              <span class="whitespace-pre-wrap w-full">
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

          <!-- Decorative fold line (flat mode) -->
          <div
            v-if="previewMode === 'flat'"
            class="absolute left-0 right-0 pointer-events-none z-[3]"
            :style="{
              top: '50%',
              height: '1px',
              background:
                'linear-gradient(90deg, transparent, rgba(0,0,0,0.04) 15%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0.04) 85%, transparent)',
            }"
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
