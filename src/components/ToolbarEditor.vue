<script setup lang="ts">
import { useEditorStore } from '@/stores/editor'
import { PAPER_TEXTURES } from '@/utils/paper-textures'

const store = useEditorStore()

const filters: { id: 'none' | 'grayscale' | 'sepia' | 'vintage'; label: string }[] = [
  { id: 'none', label: 'Original' },
  { id: 'grayscale', label: 'B&W' },
  { id: 'sepia', label: 'Sepia' },
  { id: 'vintage', label: 'Vintage' },
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
          class="w-8 h-8 border border-[var(--color-ink)]/20 flex items-center justify-center hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)] transition-colors text-sm"
        >
          −
        </button>
        <span class="font-[Inter] text-xs text-[var(--color-ink-light)] w-12 text-center"
          >{{ Math.round(store.zoomLevel * 100) }}%</span
        >
        <button
          @click="zoomIn"
          class="w-8 h-8 border border-[var(--color-ink)]/20 flex items-center justify-center hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)] transition-colors text-sm"
        >
          +
        </button>
        <button
          @click="resetZoom"
          class="ml-2 font-[Inter] text-xs text-[var(--color-accent)] hover:text-[var(--color-ink)] transition-colors"
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
          'px-4 py-2 text-xs font-[Inter] tracking-wider uppercase border transition-colors',
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
            'flex flex-col items-center gap-1 p-1.5 border transition-all',
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

    <!-- Filter Selection -->
    <div>
      <h3
        class="font-[Playfair_Display] text-sm font-semibold text-[var(--color-ink)] mb-2 tracking-wider uppercase"
      >
        Photo Filter
      </h3>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="f in filters"
          :key="f.id"
          @click="store.setFilter(f.id)"
          :class="[
            'px-3 py-2 text-xs font-[Inter] tracking-wider uppercase border transition-colors',
            store.activeFilter === f.id
              ? 'bg-[var(--color-ink)] text-[var(--color-cream)] border-[var(--color-ink)]'
              : 'bg-transparent text-[var(--color-ink)] border-[var(--color-ink)]/20 hover:border-[var(--color-ink)]',
          ]"
        >
          {{ f.label }}
        </button>
      </div>
      <button
        @click="applyFilterToAll"
        class="mt-2 w-full px-3 py-2 text-xs font-[Inter] tracking-wider uppercase border border-[var(--color-accent)]/40 text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-colors"
      >
        Apply to all photos
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
        Tips
      </h3>
      <ul class="text-xs font-[Inter] text-[var(--color-ink-light)] space-y-1">
        <li>• Drag photos from the panel to image slots</li>
        <li>• Double-click text to edit it</li>
        <li>• Select a filter before dropping photos</li>
        <li>• Use Auto-fill to quickly assign photos</li>
      </ul>
    </div>
  </div>
</template>
