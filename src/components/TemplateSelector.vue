<script setup lang="ts">
import { useEditorStore } from '@/stores/editor'
import { type NewspaperTemplate } from '@/templates/newspaper-templates'

const store = useEditorStore()

const themes = [
  { id: 'all', label: 'Semua Tema' },
  { id: 'city', label: '🏛️ Kota Bersejarah' },
  { id: 'wedding', label: '💍 Pernikahan' },
  { id: 'graduation', label: '🎓 Wisuda' },
  { id: 'birthday', label: '🎂 Ulang Tahun' },
  { id: 'travel', label: '🧭 Petualangan' },
]

function selectTemplate(template: NewspaperTemplate) {
  store.selectTemplate(template)
  store.setStep('editor')
}
</script>

<template>
  <div class="py-8">
    <!-- Paper Size & Theme Selector -->
    <div class="text-center mb-8">
      <h2 class="font-[Playfair_Display] text-3xl font-bold text-[var(--color-ink)] mb-2">
        Pilih Template Koran Klasik
      </h2>
      <p class="font-[Lora] text-base text-[var(--color-ink-light)] italic mb-6">
        Tersedia pilihan edisi kota-kota bersejarah dan momen spesial (pernikahan, wisuda, milad, ekspedisi)
      </p>

      <!-- Paper Size Buttons -->
      <div class="inline-flex border-2 border-[var(--color-ink)] mb-6">
        <button
          @click="store.setPaperSize('A4')"
          :class="[
            'px-8 py-3 font-[Playfair_Display] text-sm tracking-widest uppercase transition-colors duration-200 cursor-pointer',
            store.selectedPaperSize === 'A4'
              ? 'bg-[var(--color-ink)] text-[var(--color-cream)]'
              : 'bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-ink)]/10',
          ]"
        >
          A4 — 210×297mm
        </button>
        <button
          @click="store.setPaperSize('A3')"
          :class="[
            'px-8 py-3 font-[Playfair_Display] text-sm tracking-widest uppercase border-l-2 border-[var(--color-ink)] transition-colors duration-200 cursor-pointer',
            store.selectedPaperSize === 'A3'
              ? 'bg-[var(--color-ink)] text-[var(--color-cream)]'
              : 'bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-ink)]/10',
          ]"
        >
          A3 — 297×420mm
        </button>
      </div>

      <!-- Theme Filter Pills -->
      <div class="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto px-4">
        <button
          v-for="t in themes"
          :key="t.id"
          @click="store.setThemeFilter(t.id)"
          :class="[
            'px-4 py-1.5 text-xs font-[Inter] tracking-wider uppercase border transition-all cursor-pointer rounded-full',
            store.selectedTheme === t.id
              ? 'bg-[var(--color-ink)] text-[var(--color-cream)] border-[var(--color-ink)] font-semibold shadow-xs'
              : 'bg-transparent text-[var(--color-ink)] border-[var(--color-ink)]/20 hover:border-[var(--color-ink)]/60',
          ]"
        >
          {{ t.label }}
        </button>
      </div>
    </div>

    <!-- Templates Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
      <div
        v-for="template in store.filteredTemplates"
        :key="template.id"
        @click="selectTemplate(template)"
        class="group cursor-pointer"
      >
        <div
          class="relative bg-[var(--color-paper)] border-2 border-[var(--color-ink)]/20 p-5 hover:border-[var(--color-ink)] transition-all duration-300 hover:vintage-shadow"
        >
          <!-- Template Preview -->
          <div
            class="relative overflow-hidden mb-4"
            :class="template.paperSize === 'A3' ? 'aspect-[297/420]' : 'aspect-[210/297]'"
            :style="{ background: template.background }"
          >
            <!-- Mini preview of template layout -->
            <div class="absolute inset-0 p-3">
              <template v-for="slot in template.slots" :key="slot.id">
                <div
                  v-if="slot.type === 'image'"
                  class="absolute bg-[var(--color-ink)]/5 border border-dashed border-[var(--color-ink)]/20 flex items-center justify-center"
                  :style="{
                    left: (slot.x / template.width) * 100 + '%',
                    top: (slot.y / template.height) * 100 + '%',
                    width: (slot.w / template.width) * 100 + '%',
                    height: (slot.h / template.height) * 100 + '%',
                  }"
                >
                  <svg
                    class="w-4 h-4 text-[var(--color-ink)]/20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                </div>
                <div
                  v-else-if="slot.type === 'text' && slot.content"
                  class="absolute overflow-hidden"
                  :style="{
                    left: (slot.x / template.width) * 100 + '%',
                    top: (slot.y / template.height) * 100 + '%',
                    width: (slot.w / template.width) * 100 + '%',
                    height: (slot.h / template.height) * 100 + '%',
                    fontFamily: slot.fontFamily || 'inherit',
                    fontSize: Math.max(4, (slot.fontSize || 10) * 0.28) + 'px',
                    fontWeight: slot.fontWeight || 'normal',
                    textAlign: (slot.textAlign as any) || 'left',
                    lineHeight: '1.2',
                    color: 'var(--color-ink)',
                    opacity: 0.6,
                    borderBottom: slot.borderBottom ? '1px solid var(--color-ink)' : undefined,
                    borderTop: slot.borderTop ? '1px solid var(--color-ink)' : undefined,
                  }"
                >
                  {{ slot.content.slice(0, 40) }}
                </div>
              </template>
            </div>

            <!-- Hover overlay -->
            <div
              class="absolute inset-0 bg-[var(--color-ink)]/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <span
                class="font-[Playfair_Display] text-sm text-[var(--color-cream)] tracking-widest uppercase border border-[var(--color-cream)] px-6 py-2"
              >
                Gunakan Template
              </span>
            </div>
          </div>

          <!-- Template Info -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <h3
                class="font-[Playfair_Display] text-lg font-bold text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors"
              >
                {{ template.name }}
              </h3>
              <span
                class="font-[Inter] text-[10px] tracking-widest uppercase text-[var(--color-ink-light)] border border-[var(--color-ink)]/20 px-1.5 py-0.5"
              >
                {{ template.paperSize }}
              </span>
            </div>
            <p class="font-[Lora] text-xs text-[var(--color-ink-light)] leading-relaxed mb-3">
              {{ template.description }}
            </p>
            <div
              class="flex items-center gap-3 text-[11px] font-[Inter] text-[var(--color-ink-light)] border-t border-[var(--color-ink)]/10 pt-2"
            >
              <span
                >{{ template.slots.filter((s) => s.type === 'image').length }} Foto Slot</span
              >
              <span>·</span>
              <span
                >{{ template.slots.filter((s) => s.type === 'text').length }} Kolom Teks</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
