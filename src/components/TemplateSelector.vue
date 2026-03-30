<script setup lang="ts">
import { useEditorStore } from '@/stores/editor'
import { type NewspaperTemplate } from '@/templates/newspaper-templates'

const store = useEditorStore()

function selectTemplate(template: NewspaperTemplate) {
  store.selectTemplate(template)
  store.setStep('editor')
}
</script>

<template>
  <div class="py-8">
    <!-- Paper Size Selector -->
    <div class="text-center mb-10">
      <h2 class="font-[Playfair_Display] text-3xl font-bold text-[var(--color-ink)] mb-2">
        Choose Your Template
      </h2>
      <p class="font-[Lora] text-base text-[var(--color-ink-light)] italic mb-6">
        Select a paper size, then pick your layout
      </p>

      <div class="inline-flex border-2 border-[var(--color-ink)]">
        <button
          @click="store.setPaperSize('A4')"
          :class="[
            'px-8 py-3 font-[Playfair_Display] text-sm tracking-widest uppercase transition-colors duration-200',
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
            'px-8 py-3 font-[Playfair_Display] text-sm tracking-widest uppercase border-l-2 border-[var(--color-ink)] transition-colors duration-200',
            store.selectedPaperSize === 'A3'
              ? 'bg-[var(--color-ink)] text-[var(--color-cream)]'
              : 'bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-ink)]/10',
          ]"
        >
          A3 — 297×420mm
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
                    fontSize: Math.max(4, (slot.fontSize || 12) * 0.35) + 'px',
                    fontWeight: slot.fontWeight || 'normal',
                    fontStyle: slot.fontStyle || 'normal',
                    textAlign: (slot.textAlign as any) || 'left',
                    letterSpacing: slot.letterSpacing ? slot.letterSpacing * 0.3 + 'px' : undefined,
                    lineHeight: slot.lineHeight || 1.4,
                    textTransform: (slot.textTransform as any) || 'none',
                    borderTop: slot.borderTop ? '1px solid rgba(0,0,0,0.15)' : undefined,
                    borderBottom: slot.borderBottom ? '1px solid rgba(0,0,0,0.15)' : undefined,
                  }"
                >
                  <span class="text-[var(--color-ink)]/60">{{ slot.content.slice(0, 40) }}</span>
                </div>
              </template>
            </div>

            <!-- Hover overlay -->
            <div
              class="absolute inset-0 bg-[var(--color-ink)]/0 group-hover:bg-[var(--color-ink)]/80 transition-all duration-300 flex items-center justify-center"
            >
              <span
                class="text-[var(--color-cream)] font-[Playfair_Display] text-lg tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                Use Template
              </span>
            </div>
          </div>

          <!-- Template Info -->
          <div class="text-center">
            <h3 class="font-[Playfair_Display] text-lg font-semibold text-[var(--color-ink)]">
              {{ template.name }}
            </h3>
            <p
              class="font-[Inter] text-xs text-[var(--color-accent)] tracking-wider uppercase mt-1"
            >
              {{ template.category }} · {{ template.paperSize }}
            </p>
            <p class="font-[Lora] text-sm text-[var(--color-ink-light)] italic mt-2">
              {{ template.description }}
            </p>
            <p class="font-[Inter] text-xs text-[var(--color-ink-light)] mt-2">
              {{ template.slots.filter((s) => s.type === 'image').length }} photo slots
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
