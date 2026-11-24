<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useEditorStore } from '@/stores/editor'

const store = useEditorStore()

const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const fileFallbackInput = ref<HTMLInputElement | null>(null)

const mediaStream = ref<MediaStream | null>(null)
const errorMessage = ref<string | null>(null)
const isLoading = ref(true)

const facingMode = ref<'user' | 'environment'>('user')
const hasMultipleCameras = ref(false)

// Timer / Countdown
const countdownDuration = ref<0 | 3>(0)
const countdownValue = ref<number | null>(null)
let countdownTimer: number | null = null

// Flash effect
const isFlashing = ref(false)

// Preview state
const capturedImageUrl = ref<string | null>(null)
const capturedFile = ref<File | null>(null)
const sessionCapturedCount = ref(0)
const isProcessing = ref(false)

async function startCamera() {
  isLoading.value = true
  errorMessage.value = null

  // Stop previous stream if any
  stopCameraStream()

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    errorMessage.value =
      'Browser Anda tidak mendukung akses kamera langsung. Silakan gunakan tombol upload atau opsi kamera sistem di bawah.'
    isLoading.value = false
    return
  }

  try {
    const constraints: MediaStreamConstraints = {
      audio: false,
      video: {
        facingMode: facingMode.value,
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    mediaStream.value = stream

    await nextTick()
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      await videoRef.value.play().catch(() => {})
    }

    // Check if multiple video devices exist
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter((d) => d.kind === 'videoinput')
      hasMultipleCameras.value = videoDevices.length > 1
    } catch {
      hasMultipleCameras.value = true
    }

    isLoading.value = false
  } catch (err: unknown) {
    console.error('Camera access error:', err)
    isLoading.value = false

    const error = err as { name?: string; message?: string }
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      errorMessage.value =
        'Izin kamera tidak diizinkan. Silakan izinkan akses kamera di pengaturan browser Anda, atau gunakan file picker.'
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      errorMessage.value = 'Perangkat kamera tidak ditemukan pada perangkat Anda.'
    } else {
      errorMessage.value =
        'Gagal mengakses kamera (' + (error.message || 'Error tidak diketahui') + ').'
    }
  }
}

function stopCameraStream() {
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach((track) => track.stop())
    mediaStream.value = null
  }
  if (videoRef.value) {
    videoRef.value.srcObject = null
  }
}

async function switchCamera() {
  facingMode.value = facingMode.value === 'user' ? 'environment' : 'user'
  await startCamera()
}

function triggerCapture() {
  if (countdownDuration.value > 0) {
    startCountdown()
  } else {
    snapPhoto()
  }
}

function startCountdown() {
  countdownValue.value = countdownDuration.value
  countdownTimer = window.setInterval(() => {
    if (countdownValue.value !== null && countdownValue.value > 1) {
      countdownValue.value--
    } else {
      clearCountdown()
      snapPhoto()
    }
  }, 1000)
}

function clearCountdown() {
  if (countdownTimer !== null) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  countdownValue.value = null
}

function snapPhoto() {
  const video = videoRef.value
  const canvas = canvasRef.value
  if (!video || !canvas) return

  // Trigger flash animation
  isFlashing.value = true
  setTimeout(() => {
    isFlashing.value = false
  }, 300)

  const width = video.videoWidth || 1280
  const height = video.videoHeight || 720

  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // If using front camera, mirror image for natural selfie orientation
  if (facingMode.value === 'user') {
    ctx.translate(width, 0)
    ctx.scale(-1, 1)
  }

  ctx.drawImage(video, 0, 0, width, height)

  canvas.toBlob(
    (blob) => {
      if (!blob) return
      const filename = `camera-${Date.now()}.jpg`
      const file = new File([blob], filename, { type: 'image/jpeg' })
      capturedFile.value = file
      capturedImageUrl.value = URL.createObjectURL(blob)
    },
    'image/jpeg',
    0.95,
  )
}

function retake() {
  if (capturedImageUrl.value) {
    URL.revokeObjectURL(capturedImageUrl.value)
    capturedImageUrl.value = null
  }
  capturedFile.value = null
  clearCountdown()
}

async function usePhoto(andTakeAnother = false) {
  if (!capturedFile.value) return
  isProcessing.value = true

  const file = capturedFile.value
  const targetSlotId = store.cameraTargetSlotId

  try {
    if (targetSlotId) {
      await store.addPhotoToSlot(file, targetSlotId)
    } else {
      await store.addPhotos([file])
    }
    sessionCapturedCount.value++

    if (andTakeAnother && !targetSlotId) {
      // Retake/continue snapping
      retake()
    } else {
      close()
    }
  } finally {
    isProcessing.value = false
  }
}

function close() {
  clearCountdown()
  if (capturedImageUrl.value) {
    URL.revokeObjectURL(capturedImageUrl.value)
    capturedImageUrl.value = null
  }
  capturedFile.value = null
  stopCameraStream()
  store.closeCamera()
}

function onFallbackFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    if (store.cameraTargetSlotId) {
      store.addPhotoToSlot(file, store.cameraTargetSlotId)
    } else {
      store.addPhotos([file])
    }
    close()
  }
}

function triggerSystemCameraFallback() {
  fileFallbackInput.value?.click()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  startCamera()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  clearCountdown()
  stopCameraStream()
  if (capturedImageUrl.value) {
    URL.revokeObjectURL(capturedImageUrl.value)
  }
})
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in"
    @click.self="close"
  >
    <!-- Hidden Elements -->
    <canvas ref="canvasRef" class="hidden"></canvas>
    <input
      ref="fileFallbackInput"
      type="file"
      accept="image/*"
      capture="environment"
      class="hidden"
      @change="onFallbackFileSelected"
    />

    <!-- Main Modal Card -->
    <div
      class="relative w-full max-w-2xl bg-[var(--color-paper)] border-2 border-[var(--color-ink)] shadow-2xl flex flex-col overflow-hidden max-h-[92vh]"
    >
      <!-- Modal Header -->
      <div
        class="flex items-center justify-between px-5 py-3 border-b border-[var(--color-ink)]/15 bg-[var(--color-cream)]"
      >
        <div class="flex items-center gap-3">
          <div class="w-3 h-3 rounded-full bg-[var(--color-red)] animate-pulse"></div>
          <div>
            <h2 class="font-[Playfair_Display] text-base font-bold text-[var(--color-ink)] tracking-wide">
              Kamera Langsung · The Anda's Studio
            </h2>
            <p class="font-[Inter] text-[11px] text-[var(--color-ink-light)]">
              <span v-if="store.cameraTargetSlotId" class="font-medium text-[var(--color-accent)]">
                Mengisi slot terpilih
              </span>
              <span v-else>
                Foto akan otomatis tersimpan ke daftar foto
              </span>
            </p>
          </div>
        </div>

        <button
          @click="close"
          class="w-8 h-8 rounded border border-[var(--color-ink)]/20 hover:border-[var(--color-ink)] text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)] transition-colors flex items-center justify-center font-bold text-sm"
          title="Tutup (Esc)"
        >
          ✕
        </button>
      </div>

      <!-- Viewport / Screen Area -->
      <div class="relative bg-neutral-900 flex items-center justify-center overflow-hidden aspect-[4/3] sm:aspect-[16/10] w-full">
        <!-- Live Video Element -->
        <video
          v-show="!capturedImageUrl && !errorMessage && !isLoading"
          ref="videoRef"
          autoplay
          playsinline
          muted
          class="w-full h-full object-cover"
          :class="{ '-scale-x-100': facingMode === 'user' }"
        ></video>

        <!-- Loading Indicator -->
        <div
          v-if="isLoading"
          class="flex flex-col items-center justify-center text-[var(--color-cream)] gap-3 p-6 text-center"
        >
          <div class="w-8 h-8 border-2 border-[var(--color-cream)]/30 border-t-[var(--color-gold)] rounded-full animate-spin"></div>
          <p class="font-[Inter] text-xs tracking-wider uppercase">Menghubungkan ke kamera...</p>
        </div>

        <!-- Error State -->
        <div
          v-if="errorMessage && !isLoading"
          class="flex flex-col items-center justify-center text-white text-center p-6 max-w-md"
        >
          <div class="w-12 h-12 rounded-full bg-red-900/60 flex items-center justify-center mb-3 text-red-300">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p class="font-[Inter] text-xs text-red-200 mb-4 leading-relaxed">
            {{ errorMessage }}
          </p>
          <div class="flex flex-wrap gap-2 justify-center">
            <button
              @click="startCamera"
              class="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-[Inter] text-xs uppercase tracking-wider transition-colors"
            >
              Coba Lagi
            </button>
            <button
              @click="triggerSystemCameraFallback"
              class="px-4 py-2 bg-[var(--color-gold)] hover:bg-[#b08e50] text-black font-[Inter] text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              Gunakan Kamera Sistem
            </button>
          </div>
        </div>

        <!-- Captured Image Preview -->
        <div
          v-if="capturedImageUrl"
          class="relative w-full h-full flex items-center justify-center bg-black"
        >
          <img
            :src="capturedImageUrl"
            alt="Captured photo preview"
            class="w-full h-full object-contain"
          />
          <div class="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 text-[11px] font-[Inter] tracking-wider uppercase border border-white/20">
            Pratinjau Hasil Tangkapan
          </div>
        </div>

        <!-- Countdown Overlay -->
        <div
          v-if="countdownValue !== null"
          class="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-20 pointer-events-none"
        >
          <span class="font-[Playfair_Display] text-8xl md:text-9xl font-bold text-white drop-shadow-xl animate-ping">
            {{ countdownValue }}
          </span>
        </div>

        <!-- Flash Overlay Effect -->
        <div
          v-if="isFlashing"
          class="absolute inset-0 bg-white z-30 transition-opacity duration-300 pointer-events-none"
        ></div>

        <!-- Camera HUD Overlays (when live stream active) -->
        <div
          v-if="!capturedImageUrl && !errorMessage && !isLoading"
          class="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between"
        >
          <!-- Top HUD -->
          <div class="flex items-center justify-between">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-xs text-white text-[10px] font-[Inter] tracking-widest uppercase rounded">
              <span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              LIVE VIEW
            </span>

            <!-- Camera Switch button -->
            <button
              v-if="hasMultipleCameras"
              @click.stop="switchCamera"
              class="pointer-events-auto px-3 py-1 bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white text-[10px] font-[Inter] tracking-wider uppercase rounded flex items-center gap-1.5 border border-white/20 transition-colors"
              title="Ganti Kamera Depan/Belakang"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
              </svg>
              Ganti Kamera
            </button>
          </div>

          <!-- Vintage Viewfinder Grid Crosshairs -->
          <div class="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
            <div class="w-16 h-16 border border-white/80 rounded-full flex items-center justify-center">
              <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </div>

          <!-- Bottom HUD Status -->
          <div class="flex items-center justify-between text-white/70 text-[10px] font-[Inter]">
            <span>{{ facingMode === 'user' ? 'Kamera Depan' : 'Kamera Belakang' }}</span>
            <span v-if="sessionCapturedCount > 0" class="bg-black/60 px-2 py-0.5 rounded text-white font-medium">
              {{ sessionCapturedCount }} foto tersimpan di sesi ini
            </span>
          </div>
        </div>
      </div>

      <!-- Controls Bottom Bar -->
      <div class="p-4 bg-[var(--color-paper)] border-t border-[var(--color-ink)]/15">
        <!-- MODE 1: Camera Live Controls -->
        <div v-if="!capturedImageUrl" class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <!-- Countdown toggle -->
          <div class="flex items-center gap-2">
            <span class="font-[Inter] text-xs text-[var(--color-ink-light)]">Timer:</span>
            <button
              @click="countdownDuration = 0"
              :class="[
                'px-2.5 py-1 text-xs font-[Inter] tracking-wider uppercase border transition-colors',
                countdownDuration === 0
                  ? 'bg-[var(--color-ink)] text-[var(--color-cream)] border-[var(--color-ink)]'
                  : 'bg-transparent text-[var(--color-ink)] border-[var(--color-ink)]/20 hover:border-[var(--color-ink)]',
              ]"
            >
              Langsung
            </button>
            <button
              @click="countdownDuration = 3"
              :class="[
                'px-2.5 py-1 text-xs font-[Inter] tracking-wider uppercase border transition-colors',
                countdownDuration === 3
                  ? 'bg-[var(--color-ink)] text-[var(--color-cream)] border-[var(--color-ink)]'
                  : 'bg-transparent text-[var(--color-ink)] border-[var(--color-ink)]/20 hover:border-[var(--color-ink)]',
              ]"
            >
              3 Detik
            </button>
          </div>

          <!-- Big Shutter Button -->
          <div class="flex items-center gap-3">
            <button
              @click="triggerCapture"
              :disabled="isLoading || !!errorMessage"
              class="group relative flex items-center justify-center w-16 h-16 rounded-full border-4 border-[var(--color-ink)] bg-white hover:bg-neutral-100 active:scale-95 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
              title="Ambil Foto"
            >
              <div
                class="w-11 h-11 rounded-full bg-[var(--color-red)] group-hover:bg-[#a52c00] transition-colors flex items-center justify-center text-white"
              >
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
            </button>
          </div>

          <!-- Extra action / Close button -->
          <div class="flex items-center gap-2">
            <button
              @click="triggerSystemCameraFallback"
              class="px-3 py-1.5 border border-[var(--color-ink)]/20 text-[var(--color-ink-light)] hover:text-[var(--color-ink)] hover:border-[var(--color-ink)] text-xs font-[Inter] tracking-wider uppercase transition-colors"
              title="Buka pemilih file/kamera bawaan"
            >
              📁 Dari Galeri
            </button>
            <button
              @click="close"
              class="px-4 py-1.5 bg-[var(--color-ink)] text-[var(--color-cream)] hover:bg-[var(--color-ink-light)] text-xs font-[Inter] tracking-wider uppercase transition-colors"
            >
              Selesai
            </button>
          </div>
        </div>

        <!-- MODE 2: Photo Captured Preview Controls -->
        <div v-else class="flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            @click="retake"
            class="w-full sm:w-auto px-5 py-2.5 border border-[var(--color-ink)]/30 text-[var(--color-ink)] font-[Inter] text-xs tracking-wider uppercase hover:bg-[var(--color-ink)]/5 transition-colors flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
            Ambil Ulang (Retake)
          </button>

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <!-- If in batch mode without specific target slot, allow taking another -->
            <button
              v-if="!store.cameraTargetSlotId"
              @click="usePhoto(true)"
              :disabled="isProcessing"
              class="flex-1 sm:flex-none px-5 py-2.5 border border-[var(--color-ink)] text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)] font-[Inter] text-xs tracking-wider uppercase transition-colors disabled:opacity-50"
            >
              Simpan & Ambil Lagi
            </button>

            <!-- Primary: Use Photo -->
            <button
              @click="usePhoto(false)"
              :disabled="isProcessing"
              class="flex-1 sm:flex-none px-6 py-2.5 bg-[var(--color-ink)] text-[var(--color-cream)] hover:bg-[var(--color-ink-light)] font-[Playfair_Display] text-xs font-semibold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <svg class="w-4 h-4 text-[var(--color-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {{ isProcessing ? 'Memproses...' : (store.cameraTargetSlotId ? 'Pakai di Slot Ini' : 'Gunakan Foto') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
