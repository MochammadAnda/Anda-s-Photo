import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  templates,
  type NewspaperTemplate,
  type TemplateSlot,
} from '@/templates/newspaper-templates'
import { type PaperTextureId } from '@/utils/paper-textures'
import { resizeImage } from '@/utils/image-resize'

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
  filter?: 'none' | 'grayscale' | 'sepia' | 'vintage'
  imageZoom?: number
  imageOffsetX?: number
  imageOffsetY?: number
}

export const useEditorStore = defineStore('editor', () => {
  // State
  const selectedTemplate = ref<NewspaperTemplate | null>(null)
  const selectedPaperSize = ref<'A4' | 'A3'>('A4')
  const photos = ref<UploadedPhoto[]>([])
  const slotContents = ref<Map<string, SlotContent>>(new Map())
  const currentStep = ref<'template' | 'editor' | 'preview'>('template')
  const activeFilter = ref<'none' | 'grayscale' | 'sepia' | 'vintage'>('none')
  const paperTexture = ref<PaperTextureId>('plain')
  const showGrid = ref(false)
  const zoomLevel = ref(1)

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
    return templates.filter((t) => t.paperSize === selectedPaperSize.value)
  })

  const allImageSlotsFilled = computed(() => {
    if (!selectedTemplate.value) return false
    return imageSlots.value.every((slot) => slotContents.value.has(slot.id))
  })

  // Actions
  function selectTemplate(template: NewspaperTemplate) {
    selectedTemplate.value = template
    slotContents.value = new Map()
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
        imageOffsetX: 50,
        imageOffsetY: 50,
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
      imageOffsetX: 50,
      imageOffsetY: 50,
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

  function updateSlotFilter(slotId: string, filter: 'none' | 'grayscale' | 'sepia' | 'vintage') {
    const existing = slotContents.value.get(slotId)
    if (existing && existing.type === 'image') {
      existing.filter = filter
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

  function removeSlotContent(slotId: string) {
    slotContents.value.delete(slotId)
  }

  function setStep(step: 'template' | 'editor' | 'preview') {
    currentStep.value = step
  }

  function setZoom(level: number) {
    zoomLevel.value = Math.max(0.3, Math.min(2, level))
  }

  function toggleGrid() {
    showGrid.value = !showGrid.value
  }

  function setFilter(filter: 'none' | 'grayscale' | 'sepia' | 'vintage') {
    activeFilter.value = filter
  }

  function setPaperTexture(id: PaperTextureId) {
    paperTexture.value = id
  }

  function resetEditor() {
    selectedTemplate.value = null
    photos.value.forEach((p) => URL.revokeObjectURL(p.url))
    photos.value = []
    slotContents.value = new Map()
    currentStep.value = 'template'
    activeFilter.value = 'none'
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
    photos,
    slotContents,
    currentStep,
    activeFilter,
    paperTexture,
    showGrid,
    zoomLevel,
    // Getters
    imageSlots,
    textSlots,
    filteredTemplates,
    allImageSlotsFilled,
    // Actions
    selectTemplate,
    setPaperSize,
    addPhotos,
    removePhoto,
    assignPhotoToSlot,
    updateSlotText,
    updateSlotFilter,
    removeSlotContent,
    setStep,
    setZoom,
    toggleGrid,
    setFilter,
    setPaperTexture,
    resetEditor,
    getSlotContent,
    autoAssignPhotos,
    addPhotoToSlot,
    updateSlotImageTransform,
  }
})
