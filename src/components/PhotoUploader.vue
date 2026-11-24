<script setup lang="ts">
import { ref } from 'vue'
import { useEditorStore } from '@/stores/editor'

const store = useEditorStore()
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function onDrop(e: DragEvent) {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files) {
    handleFiles(files)
  }
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function triggerFileInput() {
  fileInput.value?.click()
}

function onFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) {
    handleFiles(input.files)
    input.value = ''
  }
}

function handleFiles(fileList: FileList) {
  const validFiles: File[] = []
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i]!
    if (file.type.startsWith('image/')) {
      validFiles.push(file)
    }
  }
  if (validFiles.length > 0) {
    store.addPhotos(validFiles)
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="font-[Playfair_Display] text-lg font-semibold text-[var(--color-ink)]">Photos</h3>
      <span class="text-[10px] font-[Inter] text-[var(--color-accent)] tracking-wider uppercase">
        Ambil / Upload
      </span>
    </div>

    <!-- Actions: Camera & Upload -->
    <div class="space-y-2">
      <!-- Direct Camera Button -->
      <button
        type="button"
        @click="store.openCamera()"
        class="w-full py-2.5 px-4 bg-[var(--color-ink)] text-[var(--color-cream)] hover:bg-[var(--color-ink-light)] border border-[var(--color-ink)] transition-all font-[Playfair_Display] text-xs tracking-wider uppercase flex items-center justify-center gap-2 group shadow-sm active:translate-y-0.5 cursor-pointer"
      >
        <svg
          class="w-4 h-4 text-[var(--color-gold)] group-hover:scale-110 transition-transform"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        Ambil Foto Langsung
      </button>

      <!-- Drop Zone / Upload from Files -->
      <div
        @drop.prevent="onDrop"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
        @click="triggerFileInput"
        :class="[
          'border-2 border-dashed rounded-sm p-5 text-center cursor-pointer transition-all duration-200',
          isDragging
            ? 'border-[var(--color-ink)] bg-[var(--color-ink)]/5'
            : 'border-[var(--color-ink)]/30 hover:border-[var(--color-ink)]/60 hover:bg-[var(--color-ink)]/5',
        ]"
      >
        <input
          ref="fileInput"
          type="file"
          multiple
          accept="image/*"
          class="hidden"
          @change="onFileSelected"
        />
        <svg
          class="w-6 h-6 mx-auto mb-1.5 text-[var(--color-ink)]/40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M12 16V4m0 0L8 8m4-4l4 4" />
          <path d="M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17" />
        </svg>
        <p class="font-[Inter] text-xs text-[var(--color-ink-light)]">
          <span class="font-medium text-[var(--color-ink)]">Pilih dari folder/galeri</span> atau drag & drop
        </p>
        <p class="font-[Inter] text-[10px] text-[var(--color-ink)]/40 mt-0.5">PNG, JPG, WEBP</p>
      </div>
    </div>

    <!-- Photo Thumbnails -->
    <div v-if="store.photos.length > 0" class="space-y-2">
      <div class="flex items-center justify-between">
        <span class="font-[Inter] text-xs text-[var(--color-ink-light)] tracking-wider uppercase">
          {{ store.photos.length }} photo{{ store.photos.length !== 1 ? 's' : '' }} uploaded
        </span>
        <button
          @click="store.autoAssignPhotos()"
          class="font-[Inter] text-xs text-[var(--color-accent)] hover:text-[var(--color-ink)] tracking-wider uppercase transition-colors"
          title="Auto-assign photos to empty slots"
        >
          Auto-fill
        </button>
      </div>

      <div class="grid grid-cols-3 gap-2">
        <div
          v-for="photo in store.photos"
          :key="photo.id"
          class="relative group aspect-square"
          draggable="true"
          @dragstart="
            (e: DragEvent) => {
              e.dataTransfer?.setData('photoId', photo.id)
            }
          "
        >
          <img
            :src="photo.url"
            :alt="photo.name"
            class="w-full h-full object-cover border border-[var(--color-ink)]/10"
          />
          <!-- Remove button -->
          <button
            @click="store.removePhoto(photo.id)"
            class="absolute top-1 right-1 w-5 h-5 bg-[var(--color-ink)]/80 text-[var(--color-cream)] flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
          <!-- Drag hint -->
          <div
            class="absolute inset-0 bg-[var(--color-ink)]/0 group-hover:bg-[var(--color-ink)]/10 transition-all flex items-center justify-center"
          >
            <span
              class="text-[var(--color-cream)] text-[9px] font-[Inter] tracking-wider uppercase opacity-0 group-hover:opacity-100 drop-shadow-md"
            >
              Drag to slot
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
