import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  templates,
  type NewspaperTemplate,
} from '@/templates/newspaper-templates'
import { type PaperTextureId } from '@/utils/paper-textures'
import { resizeImage } from '@/utils/image-resize'
import type { CanvasStamp, StampType } from '@/utils/stamps'
import { VINTAGE_STAMPS } from '@/utils/stamps'

export type PhotoFilter = 'none' | 'grayscale' | 'sepia' | 'vintage' | 'noir' | 'halftone' | 'warm'
export type PhotoBorderStyle = 'hairline' | 'double' | 'album' | 'none'

export interface UploadedPhoto {
  id: string
  file: File
  url: string
  name: string
}

export interface SlotContent {
  slotId: string
  type: 'image' | 'text'
  imageUrl?: string
  photoId?: string
  text?: string
  filter?: PhotoFilter
  photoBorder?: PhotoBorderStyle
  imageZoom?: number
  imageOffsetX?: number
  imageOffsetY?: number
  imageRotation?: number // 0, 90, 180, 270
  imageFlipH?: boolean // horizontal flip
}

export const useEditorStore = defineStore('editor', () => {
  // State
  const selectedTemplate = ref<NewspaperTemplate | null>(null)
  const selectedPaperSize = ref<'A4' | 'A3'>('A4')
  const selectedTheme = ref<string>('all')
  const photos = ref<UploadedPhoto[]>([])
  const slotContents = ref<Map<string, SlotContent>>(new Map())
  const activeStamps = ref<CanvasStamp[]>([])
  const currentStep = ref<'template' | 'editor' | 'preview'>('template')
  const activeFilter = ref<PhotoFilter>('none')
  const activePhotoBorder = ref<PhotoBorderStyle>('hairline')
  const paperTexture = ref<PaperTextureId>('aged')
  const paperCrease = ref<boolean>(true)
  const paperVignette = ref<boolean>(true)
  const showGrid = ref(false)
  const zoomLevel = ref(1)
  const isCameraOpen = ref(false)
  const cameraTargetSlotId = ref<string | null>(null)

  // Getters
  const imageSlots = computed(() => {
    if (!selectedTemplate.value) return []
    return selectedTemplate.value.slots.filter((s) => s.type === 'image')
  })

  const textSlots = computed(() => {
    if (!selectedTemplate.value) return []
    return selectedTemplate.value.slots.filter((s) => s.type === 'text')
  })

  const filteredTemplates = computed(() => {
    return templates.filter((t) => {
      const matchSize = t.paperSize === selectedPaperSize.value
      if (!matchSize) return false
      if (selectedTheme.value === 'all') return true
      return (t.theme ?? 'city') === selectedTheme.value
    })
  })

  const allImageSlotsFilled = computed(() => {
    if (!selectedTemplate.value) return false
    return imageSlots.value.every((slot) => slotContents.value.has(slot.id))
  })

  // Actions
  function selectTemplate(template: NewspaperTemplate) {
    selectedTemplate.value = template
    slotContents.value = new Map()
    activeStamps.value = []
    // Initialize text slots with default content
    template.slots.forEach((slot) => {
      if (slot.type === 'text' && slot.content) {
        slotContents.value.set(slot.id, {
          slotId: slot.id,
          type: 'text',
          text: slot.content,
        })
      }
    })
  }

  function setPaperSize(size: 'A4' | 'A3') {
    selectedPaperSize.value = size
  }

  function setThemeFilter(theme: string) {
    selectedTheme.value = theme
  }

  async function addPhotos(files: File[]) {
    for (const file of files) {
      const id = `photo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      try {
        const url = await resizeImage(file)
        photos.value.push({ id, file, url, name: file.name })
      } catch {
        console.warn(`Skipping file ${file.name}: failed to process`)
      }
    }
  }

  async function addPhotoToSlot(file: File, slotId: string) {
    const id = `photo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    try {
      const url = await resizeImage(file)
      photos.value.push({ id, file, url, name: file.name })
      slotContents.value.set(slotId, {
        slotId,
        type: 'image',
        imageUrl: url,
        photoId: id,
        filter: activeFilter.value,
        photoBorder: activePhotoBorder.value,
        imageZoom: 1,
        imageOffsetX: 50,
        imageOffsetY: 50,
        imageRotation: 0,
        imageFlipH: false,
      })
    } catch {
      console.warn(`Failed to process file ${file.name}`)
    }
  }

  function removePhoto(photoId: string) {
    const idx = photos.value.findIndex((p) => p.id === photoId)
    if (idx !== -1) {
      const photo = photos.value[idx]!
      URL.revokeObjectURL(photo.url)
      photos.value.splice(idx, 1)
      // Remove from assigned slots
      for (const [key, content] of slotContents.value) {
        if (content.photoId === photoId) {
          slotContents.value.delete(key)
        }
      }
    }
  }

  function assignPhotoToSlot(photoId: string, slotId: string) {
    const photo = photos.value.find((p) => p.id === photoId)
    if (!photo) return
    slotContents.value.set(slotId, {
      slotId,
      type: 'image',
      imageUrl: photo.url,
      photoId: photo.id,
      filter: activeFilter.value,
      photoBorder: activePhotoBorder.value,
      imageZoom: 1,
      imageOffsetX: 50,
      imageOffsetY: 50,
      imageRotation: 0,
      imageFlipH: false,
    })
  }

  function updateSlotText(slotId: string, text: string) {
    const existing = slotContents.value.get(slotId)
    if (existing) {
      existing.text = text
    } else {
      slotContents.value.set(slotId, {
        slotId,
        type: 'text',
        text,
      })
    }
  }

  function updateSlotFilter(slotId: string, filter: PhotoFilter) {
    const existing = slotContents.value.get(slotId)
    if (existing && existing.type === 'image') {
      existing.filter = filter
    }
  }

  function setPhotoBorder(border: PhotoBorderStyle) {
    activePhotoBorder.value = border
  }

  function applyPhotoBorderToAll() {
    for (const [, content] of slotContents.value) {
      if (content.type === 'image') {
        content.photoBorder = activePhotoBorder.value
      }
    }
  }

  function updateSlotPhotoBorder(slotId: string, border: PhotoBorderStyle) {
    const existing = slotContents.value.get(slotId)
    if (existing && existing.type === 'image') {
      existing.photoBorder = border
    }
  }

  function updateSlotImageTransform(
    slotId: string,
    zoom: number,
    offsetX: number,
    offsetY: number,
  ) {
    const existing = slotContents.value.get(slotId)
    if (existing && existing.type === 'image') {
      existing.imageZoom = zoom
      existing.imageOffsetX = offsetX
      existing.imageOffsetY = offsetY
    }
  }

  function rotateSlotImage(slotId: string, deltaAngle: number = 90) {
    const existing = slotContents.value.get(slotId)
    if (existing && existing.type === 'image') {
      const current = existing.imageRotation ?? 0
      existing.imageRotation = (current + deltaAngle + 360) % 360
    }
  }

  function flipSlotImage(slotId: string) {
    const existing = slotContents.value.get(slotId)
    if (existing && existing.type === 'image') {
      existing.imageFlipH = !existing.imageFlipH
    }
  }

  // Stamp actions
  function addStamp(stampType: StampType, customX?: number, customY?: number) {
    const stampDef = VINTAGE_STAMPS.find((s) => s.id === stampType)
    const t = selectedTemplate.value
    const defX = customX ?? (t ? t.width - 180 : 600)
    const defY = customY ?? (t ? 50 : 50)
    const id = `stamp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

    activeStamps.value.push({
      id,
      stampType,
      x: defX,
      y: defY,
      rotation: stampDef?.defaultRotation ?? 0,
      scale: 1,
    })
  }

  function removeStamp(stampId: string) {
    activeStamps.value = activeStamps.value.filter((s) => s.id !== stampId)
  }

  function updateStampPosition(stampId: string, x: number, y: number) {
    const stamp = activeStamps.value.find((s) => s.id === stampId)
    if (stamp) {
      stamp.x = x
      stamp.y = y
    }
  }

  function updateStampRotation(stampId: string, rotation: number) {
    const stamp = activeStamps.value.find((s) => s.id === stampId)
    if (stamp) {
      stamp.rotation = rotation
    }
  }

  function clearStamps() {
    activeStamps.value = []
  }

  function removeSlotContent(slotId: string) {
    slotContents.value.delete(slotId)
  }

  function setStep(step: 'template' | 'editor' | 'preview') {
    currentStep.value = step
  }

  function setZoom(level: number) {
    zoomLevel.value = Math.max(0.2, Math.min(2.5, Number(level.toFixed(2))))
  }

  function autoFitZoom(availableWidth: number, availableHeight?: number) {
    if (!selectedTemplate.value) return 1
    const padding = availableWidth < 640 ? 20 : 48
    const targetW = Math.max(100, availableWidth - padding)
    const scaleW = targetW / selectedTemplate.value.width
    let scale = scaleW
    if (availableHeight && availableHeight > 200) {
      const targetH = Math.max(100, availableHeight - padding)
      const scaleH = targetH / selectedTemplate.value.height
      scale = Math.min(scaleW, scaleH)
    }
    const clamped = Math.max(0.2, Math.min(1.25, Number(scale.toFixed(2))))
    setZoom(clamped)
    return clamped
  }

  function toggleGrid() {
    showGrid.value = !showGrid.value
  }

  function setFilter(filter: PhotoFilter) {
    activeFilter.value = filter
  }

  function setPaperTexture(id: PaperTextureId) {
    paperTexture.value = id
  }

  function togglePaperCrease() {
    paperCrease.value = !paperCrease.value
  }

  function togglePaperVignette() {
    paperVignette.value = !paperVignette.value
  }

  function openCamera(targetSlotId?: string) {
    cameraTargetSlotId.value = targetSlotId ?? null
    isCameraOpen.value = true
  }

  function closeCamera() {
    isCameraOpen.value = false
    cameraTargetSlotId.value = null
  }

  function resetEditor() {
    selectedTemplate.value = null
    photos.value.forEach((p) => URL.revokeObjectURL(p.url))
    photos.value = []
    slotContents.value = new Map()
    activeStamps.value = []
    currentStep.value = 'template'
    activeFilter.value = 'none'
    activePhotoBorder.value = 'hairline'
    paperTexture.value = 'plain'
    showGrid.value = false
    zoomLevel.value = 1
  }

  function getSlotContent(slotId: string): SlotContent | undefined {
    return slotContents.value.get(slotId)
  }

  function autoAssignPhotos() {
    const slots = imageSlots.value
    const unassignedPhotos = photos.value.filter(
      (p) => ![...slotContents.value.values()].some((c) => c.photoId === p.id),
    )
    const emptySlots = slots.filter((s) => !slotContents.value.has(s.id))

    const count = Math.min(unassignedPhotos.length, emptySlots.length)
    for (let i = 0; i < count; i++) {
      assignPhotoToSlot(unassignedPhotos[i]!.id, emptySlots[i]!.id)
    }
  }

  return {
    // State
    selectedTemplate,
    selectedPaperSize,
    selectedTheme,
    photos,
    slotContents,
    activeStamps,
    currentStep,
    activeFilter,
    activePhotoBorder,
    paperTexture,
    paperCrease,
    paperVignette,
    showGrid,
    zoomLevel,
    isCameraOpen,
    cameraTargetSlotId,
    // Getters
    imageSlots,
    textSlots,
    filteredTemplates,
    allImageSlotsFilled,
    // Actions
    selectTemplate,
    setPaperSize,
    setThemeFilter,
    addPhotos,
    removePhoto,
    assignPhotoToSlot,
    updateSlotText,
    updateSlotFilter,
    setPhotoBorder,
    applyPhotoBorderToAll,
    updateSlotPhotoBorder,
    removeSlotContent,
    setStep,
    setZoom,
    autoFitZoom,
    toggleGrid,
    setFilter,
    setPaperTexture,
    togglePaperCrease,
    togglePaperVignette,
    resetEditor,
    getSlotContent,
    autoAssignPhotos,
    addPhotoToSlot,
    updateSlotImageTransform,
    rotateSlotImage,
    flipSlotImage,
    addStamp,
    removeStamp,
    updateStampPosition,
    updateStampRotation,
    clearStamps,
    openCamera,
    closeCamera,
  }
})
