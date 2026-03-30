<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEditorStore } from '@/stores/editor'
import TemplateSelector from '@/components/TemplateSelector.vue'
import PhotoUploader from '@/components/PhotoUploader.vue'
import EditorCanvas from '@/components/EditorCanvas.vue'
import ToolbarEditor from '@/components/ToolbarEditor.vue'
import PreviewPaper from '@/components/PreviewPaper.vue'
import { exportAsPNG, exportAsJPG, exportAsPDF, printPreview } from '@/utils/ExportHandler'

const store = useEditorStore()
const router = useRouter()
const isExporting = ref(false)
const showExportMenu = ref(false)

function goBack() {
  if (store.currentStep === 'preview') {
    store.setStep('editor')
  } else if (store.currentStep === 'editor') {
    store.setStep('template')
  } else {
    router.push('/')
  }
}

function goToPreview() {
  store.setStep('preview')
}

function goToEditor() {
  store.setStep('editor')
}

async function handleExport(format: 'png' | 'jpg' | 'pdf' | 'print') {
  isExporting.value = true
  showExportMenu.value = false
  try {
    switch (format) {
      case 'png':
        await exportAsPNG()
        break
      case 'jpg':
        await exportAsJPG()
        break
      case 'pdf':
        await exportAsPDF()
        break
      case 'print':
        await printPreview()
        break
    }
  } finally {
    isExporting.value = false
  }
}

function resetAll() {
  store.resetEditor()
}
</script>

<template>
  <div class="min-h-screen bg-[var(--color-cream)] flex flex-col">
    <!-- Top Bar -->
    <header class="bg-[var(--color-paper)] border-b border-[var(--color-ink)]/10 sticky top-0 z-40">
      <div class="max-w-full mx-auto px-4 py-3 flex items-center justify-between">
        <!-- Left -->
        <div class="flex items-center gap-4">
          <button
            @click="goBack"
            class="flex items-center gap-2 font-[Inter] text-sm text-[var(--color-ink-light)] hover:text-[var(--color-ink)] transition-colors"
          >
            <svg
              class="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M19 12H5m0 0l7 7m-7-7l7-7" />
            </svg>
            Back
          </button>
          <div class="h-6 w-px bg-[var(--color-ink)]/10"></div>
          <span class="font-[UnifrakturMaguntia] text-xl text-[var(--color-ink)]"
            >The Anda's Photo</span
          >
        </div>

        <!-- Center: Steps -->
        <div class="hidden md:flex items-center gap-2">
          <button
            @click="store.setStep('template')"
            :class="[
              'px-4 py-1.5 text-xs font-[Inter] tracking-wider uppercase transition-colors',
              store.currentStep === 'template'
                ? 'bg-[var(--color-ink)] text-[var(--color-cream)]'
                : 'text-[var(--color-ink-light)] hover:text-[var(--color-ink)]',
            ]"
          >
            1. Template
          </button>
          <svg
            class="w-4 h-4 text-[var(--color-ink)]/20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
          <button
            @click="store.selectedTemplate ? store.setStep('editor') : null"
            :class="[
              'px-4 py-1.5 text-xs font-[Inter] tracking-wider uppercase transition-colors',
              store.currentStep === 'editor'
                ? 'bg-[var(--color-ink)] text-[var(--color-cream)]'
                : !store.selectedTemplate
                  ? 'text-[var(--color-ink)]/20 cursor-not-allowed'
                  : 'text-[var(--color-ink-light)] hover:text-[var(--color-ink)]',
            ]"
          >
            2. Editor
          </button>
          <svg
            class="w-4 h-4 text-[var(--color-ink)]/20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
          <button
            @click="store.selectedTemplate ? store.setStep('preview') : null"
            :class="[
              'px-4 py-1.5 text-xs font-[Inter] tracking-wider uppercase transition-colors',
              store.currentStep === 'preview'
                ? 'bg-[var(--color-ink)] text-[var(--color-cream)]'
                : !store.selectedTemplate
                  ? 'text-[var(--color-ink)]/20 cursor-not-allowed'
                  : 'text-[var(--color-ink-light)] hover:text-[var(--color-ink)]',
            ]"
          >
            3. Preview & Export
          </button>
        </div>

        <!-- Right -->
        <div class="flex items-center gap-3">
          <button
            v-if="store.currentStep === 'editor'"
            @click="goToPreview"
            class="px-6 py-2 bg-[var(--color-ink)] text-[var(--color-cream)] font-[Playfair_Display] text-sm tracking-widest uppercase hover:bg-[var(--color-ink-light)] transition-colors"
          >
            Preview
          </button>

          <!-- Export dropdown -->
          <div v-if="store.currentStep === 'preview'" class="relative">
            <button
              @click="showExportMenu = !showExportMenu"
              :disabled="isExporting"
              class="px-6 py-2 bg-[var(--color-ink)] text-[var(--color-cream)] font-[Playfair_Display] text-sm tracking-widest uppercase hover:bg-[var(--color-ink-light)] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <span v-if="isExporting">Exporting...</span>
              <span v-else>Export</span>
              <svg
                class="w-3 h-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            <!-- Dropdown -->
            <div
              v-if="showExportMenu && !isExporting"
              class="absolute right-0 top-full mt-1 bg-[var(--color-paper)] border border-[var(--color-ink)]/20 shadow-lg z-50 min-w-[180px]"
            >
              <button
                @click="handleExport('png')"
                class="w-full px-4 py-3 text-left text-sm font-[Inter] hover:bg-[var(--color-ink)]/5 transition-colors flex items-center gap-3"
              >
                <span class="text-xs tracking-wider uppercase text-[var(--color-accent)]">PNG</span>
                <span class="text-[var(--color-ink-light)]">High quality image</span>
              </button>
              <button
                @click="handleExport('jpg')"
                class="w-full px-4 py-3 text-left text-sm font-[Inter] hover:bg-[var(--color-ink)]/5 transition-colors flex items-center gap-3 border-t border-[var(--color-ink)]/5"
              >
                <span class="text-xs tracking-wider uppercase text-[var(--color-accent)]">JPG</span>
                <span class="text-[var(--color-ink-light)]">Compressed image</span>
              </button>
              <button
                @click="handleExport('pdf')"
                class="w-full px-4 py-3 text-left text-sm font-[Inter] hover:bg-[var(--color-ink)]/5 transition-colors flex items-center gap-3 border-t border-[var(--color-ink)]/5"
              >
                <span class="text-xs tracking-wider uppercase text-[var(--color-accent)]">PDF</span>
                <span class="text-[var(--color-ink-light)]">Print-ready document</span>
              </button>
              <button
                @click="handleExport('print')"
                class="w-full px-4 py-3 text-left text-sm font-[Inter] hover:bg-[var(--color-ink)]/5 transition-colors flex items-center gap-3 border-t border-[var(--color-ink)]/5"
              >
                <span class="text-xs tracking-wider uppercase text-[var(--color-accent)]"
                  >PRINT</span
                >
                <span class="text-[var(--color-ink-light)]">Send to printer</span>
              </button>
            </div>
          </div>

          <button
            @click="resetAll"
            class="font-[Inter] text-xs text-[var(--color-ink-light)] hover:text-[var(--color-red)] transition-colors tracking-wider uppercase"
          >
            Reset
          </button>
        </div>
      </div>
    </header>

    <!-- Content Area -->
    <main class="flex-1 overflow-hidden">
      <!-- Step 1: Template Selection -->
      <div v-if="store.currentStep === 'template'" class="h-full overflow-y-auto">
        <TemplateSelector />
      </div>

      <!-- Step 2: Editor -->
      <div v-else-if="store.currentStep === 'editor'" class="h-[calc(100vh-57px)] flex">
        <!-- Left Sidebar: Photo Upload -->
        <aside
          class="w-72 bg-[var(--color-paper)] border-r border-[var(--color-ink)]/10 p-4 overflow-y-auto flex-shrink-0"
        >
          <PhotoUploader />
        </aside>

        <!-- Center: Canvas -->
        <div class="flex-1 overflow-auto bg-[var(--color-cream-dark)]/50 flex justify-center p-8">
          <EditorCanvas />
        </div>

        <!-- Right Sidebar: Tools -->
        <aside
          class="w-64 bg-[var(--color-paper)] border-l border-[var(--color-ink)]/10 p-4 overflow-y-auto flex-shrink-0"
        >
          <ToolbarEditor />
        </aside>
      </div>

      <!-- Step 3: Preview -->
      <div v-else-if="store.currentStep === 'preview'" class="h-[calc(100vh-57px)] flex flex-col">
        <PreviewPaper />
        <!-- Bottom bar in preview -->
        <div
          class="bg-[var(--color-paper)] border-t border-[var(--color-ink)]/10 px-6 py-3 flex items-center justify-between"
        >
          <button
            @click="goToEditor"
            class="px-6 py-2 border border-[var(--color-ink)]/20 text-[var(--color-ink)] font-[Inter] text-sm tracking-wider uppercase hover:border-[var(--color-ink)] transition-colors"
          >
            ← Back to Editor
          </button>
          <div class="flex items-center gap-3">
            <button
              @click="handleExport('png')"
              :disabled="isExporting"
              class="px-5 py-2 border border-[var(--color-ink)]/20 text-[var(--color-ink)] font-[Inter] text-xs tracking-wider uppercase hover:border-[var(--color-ink)] transition-colors disabled:opacity-50"
            >
              Download PNG
            </button>
            <button
              @click="handleExport('pdf')"
              :disabled="isExporting"
              class="px-5 py-2 bg-[var(--color-ink)] text-[var(--color-cream)] font-[Inter] text-xs tracking-wider uppercase hover:bg-[var(--color-ink-light)] transition-colors disabled:opacity-50"
            >
              Download PDF
            </button>
            <button
              @click="handleExport('print')"
              :disabled="isExporting"
              class="px-5 py-2 border border-[var(--color-ink)] text-[var(--color-ink)] font-[Inter] text-xs tracking-wider uppercase hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)] transition-colors disabled:opacity-50"
            >
              Print
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
