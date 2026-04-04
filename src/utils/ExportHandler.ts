import { useEditorStore } from '@/stores/editor'
import { jsPDF } from 'jspdf'
import { getTextureById, applyCanvasTexture } from '@/utils/paper-textures'
import type { TemplateSlot } from '@/templates/newspaper-templates'

function getFilterStyle(filter?: string): string {
  switch (filter) {
    case 'grayscale':
      return 'grayscale(100%)'
    case 'sepia':
      return 'sepia(80%) contrast(1.1)'
    case 'vintage':
      return 'sepia(40%) contrast(1.1) brightness(0.95) saturate(0.8)'
    default:
      return 'none'
  }
}

function createRenderCanvas(): Promise<HTMLCanvasElement> {
  return new Promise((resolve) => {
    const store = useEditorStore()
    const template = store.selectedTemplate
    if (!template) throw new Error('No template selected')

    const canvas = document.createElement('canvas')
    canvas.width = template.width * 2 // 2x for quality
    canvas.height = template.height * 2
    const ctx = canvas.getContext('2d')!
    const scale = 2

    // Paper texture
    const texture = getTextureById(store.paperTexture)
    const bgColor = store.paperTexture !== 'plain' ? texture.background : template.background
    const inkColor = texture.inkColor

    // Background
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Texture / grain overlay
    applyCanvasTexture(ctx, store.paperTexture, canvas.width, canvas.height)

    // Pre-load ALL images first so we can draw slots in correct template order
    // (matches DOM z-index — slots that appear later in the template are on top)
    const imageCache = new Map<string, HTMLImageElement>()
    const loadPromises: Promise<void>[] = []

    for (const slot of template.slots) {
      const content = store.getSlotContent(slot.id)
      if (slot.type === 'image' && content?.imageUrl) {
        const promise = new Promise<void>((resolveImg) => {
          const img = new Image()
          img.onload = () => {
            imageCache.set(slot.id, img)
            resolveImg()
          }
          img.onerror = () => resolveImg()
          img.src = content.imageUrl!
        })
        loadPromises.push(promise)
      }
    }

    Promise.all(loadPromises).then(() => {
      // Draw ALL slots in template order (preserves intended layering)
      for (const slot of template.slots) {
        const content = store.getSlotContent(slot.id)

        if (slot.type === 'text') {
          const text = content?.text ?? slot.content ?? ''
          drawSlotBorders(ctx, slot, scale, inkColor)
          if (!text) continue

          ctx.save()

          const fontStyle = slot.fontStyle === 'italic' ? 'italic ' : ''
          const fontWeight = slot.fontWeight || 'normal'
          const fontSize = (slot.fontSize || 12) * scale
          const fontFamily = slot.fontFamily || 'serif'
          ctx.font = `${fontStyle}${fontWeight} ${fontSize}px ${fontFamily}`
          ctx.fillStyle = inkColor
          ctx.textBaseline = 'top'

          const x = slot.x * scale
          const y = slot.y * scale + (slot.borderTop ? 8 : 0)
          const maxWidth = slot.w * scale
          const lineHeightVal = (slot.lineHeight || 1.4) * fontSize

          if (slot.textAlign === 'center') {
            ctx.textAlign = 'center'
            wrapText(
              ctx,
              text,
              x + maxWidth / 2,
              y,
              maxWidth,
              lineHeightVal,
              slot.letterSpacing ? slot.letterSpacing * scale : 0,
            )
          } else if (slot.textAlign === 'right') {
            ctx.textAlign = 'right'
            wrapText(
              ctx,
              text,
              x + maxWidth,
              y,
              maxWidth,
              lineHeightVal,
              slot.letterSpacing ? slot.letterSpacing * scale : 0,
            )
          } else {
            ctx.textAlign = 'left'
            wrapText(
              ctx,
              text,
              x,
              y,
              maxWidth,
              lineHeightVal,
              slot.letterSpacing ? slot.letterSpacing * scale : 0,
            )
          }

          ctx.restore()
        } else if (slot.type === 'image') {
          const img = imageCache.get(slot.id)
          if (!img || !content?.imageUrl) continue

          ctx.save()

          const filterStyle = getFilterStyle(content.filter)
          if (filterStyle !== 'none') {
            ctx.filter = filterStyle
          }

          drawImageCover(
            ctx,
            img,
            slot.x * scale,
            slot.y * scale,
            slot.w * scale,
            slot.h * scale,
            content.imageZoom ?? 1,
            content.imageOffsetX ?? 50,
            content.imageOffsetY ?? 50,
          )

          ctx.restore()
        }
      }

      resolve(canvas)
    })
  })
}

function drawSlotBorders(
  ctx: CanvasRenderingContext2D,
  slot: TemplateSlot,
  scale: number,
  inkColor: string = '#1A1A1A',
) {
  ctx.strokeStyle = inkColor
  ctx.lineWidth = 1 * scale
  if (slot.borderTop) {
    ctx.beginPath()
    ctx.moveTo(slot.x * scale, slot.y * scale)
    ctx.lineTo((slot.x + slot.w) * scale, slot.y * scale)
    ctx.stroke()
  }
  if (slot.borderBottom) {
    ctx.beginPath()
    ctx.moveTo(slot.x * scale, (slot.y + slot.h) * scale)
    ctx.lineTo((slot.x + slot.w) * scale, (slot.y + slot.h) * scale)
    ctx.stroke()
  }
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  zoom: number = 1,
  offsetX: number = 50,
  offsetY: number = 50,
) {
  const imgRatio = img.naturalWidth / img.naturalHeight
  const slotRatio = dw / dh
  let sx: number, sy: number, sw: number, sh: number

  if (imgRatio > slotRatio) {
    sh = img.naturalHeight
    sw = sh * slotRatio
    sx = (img.naturalWidth - sw) * (offsetX / 100)
    sy = (img.naturalHeight - sh) * (offsetY / 100)
  } else {
    sw = img.naturalWidth
    sh = sw / slotRatio
    sx = (img.naturalWidth - sw) * (offsetX / 100)
    sy = (img.naturalHeight - sh) * (offsetY / 100)
  }

  // Apply zoom: shrink the source rect centered on current view
  if (zoom > 1) {
    const newSw = sw / zoom
    const newSh = sh / zoom
    sx += (sw - newSw) / 2
    sy += (sh - newSh) / 2
    sw = newSw
    sh = newSh

    // Clamp to image bounds
    sx = Math.max(0, Math.min(img.naturalWidth - sw, sx))
    sy = Math.max(0, Math.min(img.naturalHeight - sh, sy))
  }

  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  _letterSpacing: number,
) {
  const paragraphs = text.split('\n')
  let currentY = y

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === '') {
      currentY += lineHeight * 0.5
      continue
    }
    const words = paragraph.split(' ')
    let line = ''

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' '
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line.trim(), x, currentY)
        line = words[i] + ' '
        currentY += lineHeight
      } else {
        line = testLine
      }
    }
    ctx.fillText(line.trim(), x, currentY)
    currentY += lineHeight
  }
}

export async function exportAsPNG(): Promise<void> {
  const canvas = await createRenderCanvas()
  const link = document.createElement('a')
  link.download = `newspaper-photo-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

export async function exportAsJPG(): Promise<void> {
  const canvas = await createRenderCanvas()
  const link = document.createElement('a')
  link.download = `newspaper-photo-${Date.now()}.jpg`
  link.href = canvas.toDataURL('image/jpeg', 0.95)
  link.click()
}

export async function exportAsPDF(): Promise<void> {
  const store = useEditorStore()
  const template = store.selectedTemplate
  if (!template) return

  const canvas = await createRenderCanvas()
  const imgData = canvas.toDataURL('image/jpeg', 0.95)

  const isA3 = template.paperSize === 'A3'
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: isA3 ? 'a3' : 'a4',
  })

  const pageWidth = isA3 ? 297 : 210
  const pageHeight = isA3 ? 420 : 297

  pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight)
  pdf.save(`newspaper-photo-${Date.now()}.pdf`)
}

export async function printPreview(): Promise<void> {
  const canvas = await createRenderCanvas()
  const imgData = canvas.toDataURL('image/png')
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Preview — The Daily Photo</title>
        <style>
          body { margin: 0; display: flex; justify-content: center; }
          img { max-width: 100%; height: auto; }
          @media print { body { margin: 0; } img { width: 100%; } }
        </style>
      </head>
      <body>
        <img src="${imgData}" />
        <script>window.onload = function() { window.print(); }<\/script>
      </body>
    </html>
  `)
  printWindow.document.close()
}
