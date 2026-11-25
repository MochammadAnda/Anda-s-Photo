<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEditorStore } from '@/stores/editor'
import TemplateSelector from '@/components/TemplateSelector.vue'
import PhotoUploader from '@/components/PhotoUploader.vue'
import EditorCanvas from '@/components/EditorCanvas.vue'
import ToolbarEditor from '@/components/ToolbarEditor.vue'
import PreviewPaper from '@/components/PreviewPaper.vue'
import CameraCaptureModal from '@/components/CameraCaptureModal.vue'
import { exportAsPNG, exportAsJPG, exportAsPDF, printPreview } from '@/utils/ExportHandler'

const store = useEditorStore()
const router = useRouter()
const isExporting = ref(false)
const showExportMenu = ref(false)
const activeMobileDrawer = ref<'photos' | 'tools' | null>(null)

function toggleMobileDrawer(type: 'photos' | 'tools') {
  if (activeMobileDrawer.value === type) {
    activeMobileDrawer.value = null
  } else {
    activeMobileDrawer.value = type
  }
}

function closeMobileDrawer() {
  activeMobileDrawer.value = null
}

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

        <!-- Mobile Step Badge -->
        <div class="md:hidden text-[11px] font-[Inter] tracking-wider uppercase text-[var(--color-ink-light)] font-semibold">
          Langkah {{ store.currentStep === 'template' ? '1/3: Template' : store.currentStep === 'editor' ? '2/3: Editor' : '3/3: Preview' }}
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
      <div v-else-if="store.currentStep === 'editor'" class="h-[calc(100vh-57px)] flex relative">
        <!-- Left Sidebar: Photo Upload (Desktop) -->
        <aside
          class="hidden lg:block w-72 bg-[var(--color-paper)] border-r border-[var(--color-ink)]/10 p-4 overflow-y-auto flex-shrink-0"
        >
          <PhotoUploader />
        </aside>

        <!-- Center: Canvas Viewport -->
        <div class="canvas-scroll-container flex-1 overflow-auto bg-[var(--color-cream-dark)]/50 flex justify-center p-3 sm:p-6 md:p-8 pb-24 lg:pb-8 relative">
          <EditorCanvas />
        </div>

        <!-- Right Sidebar: Tools (Desktop) -->
        <aside
          class="hidden lg:block w-64 bg-[var(--color-paper)] border-l border-[var(--color-ink)]/10 p-4 overflow-y-auto flex-shrink-0"
        >
          <ToolbarEditor />
        </aside>

        <!-- Mobile Bottom Bar (Visible only on < lg screens) -->
        <nav
          class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-paper)]/95 backdrop-blur-md border-t border-[var(--color-ink)]/20 px-3 py-2 flex items-center justify-around shadow-2xl"
        >
          <!-- Tab 1: Foto -->
          <button
            @click="toggleMobileDrawer('photos')"
            :class="[
              'flex flex-col items-center gap-0.5 py-1 px-3 rounded-xs transition-colors cursor-pointer',
              activeMobileDrawer === 'photos'
                ? 'text-[var(--color-accent)] font-bold'
                : 'text-[var(--color-ink-light)] hover:text-[var(--color-ink)]',
            ]"
          >
            <div class="relative">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span
                v-if="store.photos.length > 0"
                class="absolute -top-1 -right-2 bg-[var(--color-accent)] text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold"
              >
                {{ store.photos.length }}
              </span>
            </div>
            <span class="text-[10px] font-[Inter] tracking-wider uppercase">Foto</span>
          </button>

          <!-- Tab 2: Alat & Efek -->
          <button
            @click="toggleMobileDrawer('tools')"
            :class="[
              'flex flex-col items-center gap-0.5 py-1 px-3 rounded-xs transition-colors cursor-pointer',
              activeMobileDrawer === 'tools'
                ? 'text-[var(--color-accent)] font-bold'
                : 'text-[var(--color-ink-light)] hover:text-[var(--color-ink)]',
            ]"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <span class="text-[10px] font-[Inter] tracking-wider uppercase">Alat & Efek</span>
          </button>

          <!-- Tab 3: Preview -->
          <button
            @click="goToPreview"
            class="flex items-center gap-1.5 py-1.5 px-4 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-xs hover:bg-[var(--color-ink-light)] transition-colors cursor-pointer shadow-xs"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span class="text-[11px] font-[Inter] tracking-wider uppercase font-semibold">Preview</span>
          </button>
        </nav>

        <!-- Mobile Slide-Up Bottom Sheet Drawer -->
        <div
          v-if="activeMobileDrawer"
          class="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200"
          @click.self="closeMobileDrawer"
        >
          <div
            class="bg-[var(--color-paper)] border-t-2 border-[var(--color-ink)] max-h-[82vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200 rounded-t-lg"
          >
            <!-- Drawer Header -->
            <div
              class="px-4 py-3 border-b border-[var(--color-ink)]/15 flex items-center justify-between bg-[var(--color-cream)]/50"
            >
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]"></span>
                <h3 class="font-[Playfair_Display] text-base font-bold text-[var(--color-ink)]">
                  {{ activeMobileDrawer === 'photos' ? 'Kelola & Upload Foto' : 'Filter, Bingkai & Stempel' }}
                </h3>
              </div>
              <button
                @click="closeMobileDrawer"
                class="px-2 py-1 text-[var(--color-ink-light)] hover:text-[var(--color-ink)] text-xs font-bold uppercase tracking-wider cursor-pointer border border-[var(--color-ink)]/15"
              >
                ✕ Tutup
              </button>
            </div>

            <!-- Drawer Scrollable Body -->
            <div class="p-4 overflow-y-auto max-h-[calc(82vh-54px)]">
              <PhotoUploader v-if="activeMobileDrawer === 'photos'" />
              <ToolbarEditor v-else-if="activeMobileDrawer === 'tools'" />
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Preview -->
      <div v-else-if="store.currentStep === 'preview'" class="h-[calc(100vh-57px)] flex flex-col">
        <PreviewPaper />
        <!-- Bottom bar in preview -->
        <div
          class="bg-[var(--color-paper)]/95 backdrop-blur-md border-t border-[var(--color-ink)]/15 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 shadow-lg flex-shrink-0"
        >
          <button
            @click="goToEditor"
            class="px-3 sm:px-5 py-2 border border-[var(--color-ink)]/25 text-[var(--color-ink)] font-[Inter] text-xs sm:text-sm tracking-wider uppercase hover:border-[var(--color-ink)] hover:bg-[var(--color-ink)]/5 transition-colors cursor-pointer flex items-center gap-1.5 rounded-xs"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5m0 0l7 7m-7-7l7-7" />
            </svg>
            <span class="hidden sm:inline">Kembali ke </span>Editor
          </button>
          <div class="flex items-center gap-1.5 sm:gap-2.5">
            <button
              @click="handleExport('png')"
              :disabled="isExporting"
              class="px-3.5 sm:px-5 py-2 bg-[var(--color-ink)] text-[var(--color-cream)] font-[Inter] text-xs font-semibold tracking-wider uppercase hover:bg-[var(--color-ink-light)] transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5 rounded-xs shadow-xs"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              <span>PNG</span>
            </button>
            <button
              @click="handleExport('pdf')"
              :disabled="isExporting"
              class="px-3 sm:px-4 py-2 border border-[var(--color-ink)]/25 text-[var(--color-ink)] font-[Inter] text-xs tracking-wider uppercase hover:border-[var(--color-ink)] hover:bg-[var(--color-ink)]/5 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5 rounded-xs"
            >
              <span>PDF</span>
            </button>
            <button
              @click="handleExport('print')"
              :disabled="isExporting"
              class="px-3 sm:px-4 py-2 border border-[var(--color-ink)]/25 text-[var(--color-ink)] font-[Inter] text-xs tracking-wider uppercase hover:border-[var(--color-ink)] hover:bg-[var(--color-ink)]/5 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5 rounded-xs"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span class="hidden sm:inline">Cetak</span>
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Camera Capture Modal -->
    <CameraCaptureModal v-if="store.isCameraOpen" />
  </div>
</template>
