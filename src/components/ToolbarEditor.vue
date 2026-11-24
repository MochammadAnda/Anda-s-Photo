<script setup lang="ts">
import { useEditorStore, type PhotoFilter, type PhotoBorderStyle } from '@/stores/editor'
import { PAPER_TEXTURES } from '@/utils/paper-textures'
import { VINTAGE_STAMPS, type StampType } from '@/utils/stamps'

const store = useEditorStore()

const borderStyles: { id: PhotoBorderStyle; label: string; desc: string }[] = [
  { id: 'hairline', label: 'Klasik 1px', desc: 'Garis hitam tipis standar koran jadul' },
  { id: 'double', label: 'Garis Ganda', desc: 'Gaya rubrik foto eksklusif' },
  { id: 'album', label: 'Frame Album', desc: 'Bingkai foto album putih dengan outline' },
  { id: 'none', label: 'Tanpa Garis', desc: 'Foto polos tanpa bingkai' },
]

const filters: { id: PhotoFilter; label: string }[] = [
  { id: 'none', label: 'Asli' },
  { id: 'grayscale', label: 'B&W Klasik' },
  { id: 'sepia', label: 'Sepia Vintage' },
  { id: 'noir', label: 'Noir Kontras' },
  { id: 'halftone', label: 'Koran Halftone' },
  { id: 'vintage', label: 'Kertas Usang' },
  { id: 'warm', label: 'Daguerreotype' },
]

function zoomIn() {
  store.setZoom(store.zoomLevel + 0.1)
}

function zoomOut() {
  store.setZoom(store.zoomLevel - 0.1)
}

function resetZoom() {
  store.setZoom(1)
}

function applyFilterToAll() {
  for (const [, content] of store.slotContents) {
    if (content.type === 'image') {
      content.filter = store.activeFilter
    }
  }
}

function applyBorderToAll() {
  store.applyPhotoBorderToAll()
}

function onAddStamp(stampType: StampType) {
  store.addStamp(stampType)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Zoom Controls -->
    <div>
      <h3
        class="font-[Playfair_Display] text-sm font-semibold text-[var(--color-ink)] mb-2 tracking-wider uppercase"
      >
        Zoom
      </h3>
      <div class="flex items-center gap-2">
        <button
          @click="zoomOut"
          class="w-8 h-8 border border-[var(--color-ink)]/20 flex items-center justify-center hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)] transition-colors text-sm cursor-pointer"
        >
          −
        </button>
        <span class="font-[Inter] text-xs text-[var(--color-ink-light)] w-12 text-center"
          >{{ Math.round(store.zoomLevel * 100) }}%</span
        >
        <button
          @click="zoomIn"
          class="w-8 h-8 border border-[var(--color-ink)]/20 flex items-center justify-center hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)] transition-colors text-sm cursor-pointer"
        >
          +
        </button>
        <button
          @click="resetZoom"
          class="ml-2 font-[Inter] text-xs text-[var(--color-accent)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
        >
          Reset
        </button>
      </div>
    </div>

    <!-- Grid Toggle -->
    <div>
      <h3
        class="font-[Playfair_Display] text-sm font-semibold text-[var(--color-ink)] mb-2 tracking-wider uppercase"
      >
        Grid
      </h3>
      <button
        @click="store.toggleGrid()"
        :class="[
          'px-4 py-2 text-xs font-[Inter] tracking-wider uppercase border transition-colors cursor-pointer',
          store.showGrid
            ? 'bg-[var(--color-ink)] text-[var(--color-cream)] border-[var(--color-ink)]'
            : 'bg-transparent text-[var(--color-ink)] border-[var(--color-ink)]/20 hover:border-[var(--color-ink)]',
        ]"
      >
        {{ store.showGrid ? 'Grid On' : 'Grid Off' }}
      </button>
    </div>

    <!-- Paper Texture -->
    <div>
      <h3
        class="font-[Playfair_Display] text-sm font-semibold text-[var(--color-ink)] mb-2 tracking-wider uppercase"
      >
        Paper Texture
      </h3>
      <div class="grid grid-cols-3 gap-1.5">
        <button
          v-for="t in PAPER_TEXTURES"
          :key="t.id"
          @click="store.setPaperTexture(t.id)"
          :class="[
            'flex flex-col items-center gap-1 p-1.5 border transition-all cursor-pointer',
            store.paperTexture === t.id
              ? 'border-[var(--color-ink)] bg-[var(--color-ink)]/[0.06] shadow-sm'
              : 'border-[var(--color-ink)]/10 hover:border-[var(--color-ink)]/40 hover:bg-[var(--color-ink)]/[0.02]',
          ]"
          :title="t.description"
        >
          <div
            class="w-full h-7 border border-[var(--color-ink)]/10 rounded-sm"
            :style="{ background: t.swatchStyle }"
          ></div>
          <span
            class="font-[Inter] text-[8px] tracking-wider uppercase text-[var(--color-ink)] leading-none"
          >
            {{ t.name }}
          </span>
        </button>
      </div>
    </div>

    <!-- Stempel & Badge Vintage (Poin 3) -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <h3
          class="font-[Playfair_Display] text-sm font-semibold text-[var(--color-ink)] tracking-wider uppercase"
        >
          Stempel Vintage
        </h3>
        <span class="text-[9px] font-[Inter] text-[var(--color-accent)] tracking-wider uppercase">
          Ink Stamps
        </span>
      </div>
      <p class="text-[10px] font-[Inter] text-[var(--color-ink-light)] mb-2">
        Klik untuk menempelkan cap retro di koran (bisa digeser bebas):
      </p>
      <div class="grid grid-cols-2 gap-1.5">
        <button
          v-for="s in VINTAGE_STAMPS"
          :key="s.id"
          @click="onAddStamp(s.id)"
          class="p-2 border border-[var(--color-ink)]/20 hover:border-[var(--color-ink)] bg-[var(--color-paper)] text-left transition-all hover:vintage-shadow group cursor-pointer"
        >
          <div class="flex items-center justify-between mb-0.5">
            <span
              class="text-[10px] font-[Playfair_Display] font-bold truncate"
              :style="{ color: s.color }"
            >
              {{ s.name }}
            </span>
            <span class="text-[9px] opacity-40 group-hover:opacity-100">+</span>
          </div>
          <span class="text-[8px] font-[Inter] text-[var(--color-ink-light)] block truncate">
            {{ s.subtitle }}
          </span>
        </button>
      </div>

      <!-- Active Stamps List -->
      <div v-if="store.activeStamps.length > 0" class="mt-3 p-2 bg-[var(--color-ink)]/[0.03] border border-[var(--color-ink)]/10">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[10px] font-[Inter] font-semibold text-[var(--color-ink)]">
            Stempel Aktif ({{ store.activeStamps.length }})
          </span>
          <button
            @click="store.clearStamps()"
            class="text-[9px] font-[Inter] text-red-700 hover:underline cursor-pointer"
          >
            Hapus Semua
          </button>
        </div>
        <div class="space-y-1">
          <div
            v-for="(st, idx) in store.activeStamps"
            :key="st.id"
            class="flex items-center justify-between text-[10px] font-[Inter] text-[var(--color-ink-light)] bg-white/60 px-2 py-1 border border-[var(--color-ink)]/10"
          >
            <span>#{{ idx + 1 }} {{ st.stampType }}</span>
            <button
              @click="store.removeStamp(st.id)"
              class="text-red-700 hover:text-red-900 font-bold ml-2 cursor-pointer"
              title="Hapus stempel"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Photo Border Selection -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <h3
          class="font-[Playfair_Display] text-sm font-semibold text-[var(--color-ink)] tracking-wider uppercase"
        >
          Bingkai Foto
        </h3>
        <span class="text-[9px] font-[Inter] text-[var(--color-accent)] tracking-wider uppercase">
          Vintage Frame
        </span>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="b in borderStyles"
          :key="b.id"
          @click="store.setPhotoBorder(b.id)"
          :title="b.desc"
          :class="[
            'px-3 py-2 text-xs font-[Inter] tracking-wider uppercase border transition-colors text-left flex flex-col cursor-pointer',
            store.activePhotoBorder === b.id
              ? 'bg-[var(--color-ink)] text-[var(--color-cream)] border-[var(--color-ink)]'
              : 'bg-transparent text-[var(--color-ink)] border-[var(--color-ink)]/20 hover:border-[var(--color-ink)]',
          ]"
        >
          <span class="font-medium">{{ b.label }}</span>
        </button>
      </div>
      <button
        @click="applyBorderToAll"
        class="mt-2 w-full px-3 py-1.5 text-xs font-[Inter] tracking-wider uppercase border border-[var(--color-accent)]/40 text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-colors cursor-pointer"
      >
        Terapkan Bingkai ke Semua
      </button>
    </div>

    <!-- Filter Selection -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <h3
          class="font-[Playfair_Display] text-sm font-semibold text-[var(--color-ink)] tracking-wider uppercase"
        >
          Filter Foto
        </h3>
        <span class="text-[9px] font-[Inter] text-[var(--color-accent)] tracking-wider uppercase">
          Newsprint Tones
        </span>
      </div>
      <div class="grid grid-cols-2 gap-1.5">
        <button
          v-for="f in filters"
          :key="f.id"
          @click="store.setFilter(f.id)"
          :class="[
            'px-2.5 py-1.5 text-[11px] font-[Inter] tracking-wider uppercase border transition-colors text-left cursor-pointer',
            store.activeFilter === f.id
              ? 'bg-[var(--color-ink)] text-[var(--color-cream)] border-[var(--color-ink)] font-semibold'
              : 'bg-transparent text-[var(--color-ink)] border-[var(--color-ink)]/20 hover:border-[var(--color-ink)]',
          ]"
        >
          {{ f.label }}
        </button>
      </div>
      <button
        @click="applyFilterToAll"
        class="mt-2 w-full px-3 py-1.5 text-xs font-[Inter] tracking-wider uppercase border border-[var(--color-accent)]/40 text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-colors cursor-pointer"
      >
        Terapkan Filter ke Semua
      </button>
    </div>

    <!-- Quick info -->
    <div>
      <h3
        class="font-[Playfair_Display] text-sm font-semibold text-[var(--color-ink)] mb-2 tracking-wider uppercase"
      >
        Info
      </h3>
      <div class="space-y-1 text-xs font-[Inter] text-[var(--color-ink-light)]">
        <p>Template: {{ store.selectedTemplate?.name }}</p>
        <p>Size: {{ store.selectedTemplate?.paperSize }}</p>
        <p>Photos: {{ store.photos.length }} uploaded</p>
        <p>
          Slots filled:
          {{ [...store.slotContents.values()].filter((c) => c.type === 'image').length }} /
          {{ store.imageSlots.length }}
        </p>
      </div>
    </div>

    <!-- Tips -->
    <div class="p-3 bg-[var(--color-ink)]/[0.03] border border-[var(--color-ink)]/10">
      <h3 class="font-[Playfair_Display] text-sm font-semibold text-[var(--color-ink)] mb-2">
        Tips Mengatur Foto
      </h3>
      <ul class="text-xs font-[Inter] text-[var(--color-ink-light)] space-y-1">
        <li>• <b>Geser / Pan</b>: Tarik foto dengan mouse/touch untuk mengubah posisi.</li>
        <li>• <b>Zoom & Putar</b>: Hover pada foto terpasang lalu klik ikon kaca pembesar untuk zoom, putar 90°, atau cermin.</li>
        <li>• <b>Double-click teks</b> untuk mengubah isi berita secara bebas.</li>
      </ul>
    </div>
  </div>
</template>
