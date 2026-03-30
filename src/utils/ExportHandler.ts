import { useEditorStore } from '@/stores/editor'
import { jsPDF } from 'jspdf'

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

    // Background
    ctx.fillStyle = template.background
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Grain noise overlay (subtle)
    addGrainEffect(ctx, canvas.width, canvas.height)

    const imagePromises: Promise<void>[] = []

    for (const slot of template.slots) {
      const content = store.getSlotContent(slot.id)

      if (slot.type === 'text') {
        const text = content?.text ?? slot.content ?? ''
        if (!text) {
          // Draw borders even if empty
          drawSlotBorders(ctx, slot, scale)
          continue
        }

        ctx.save()

        // Borders
        drawSlotBorders(ctx, slot, scale)

        // Text styling
        const fontStyle = slot.fontStyle === 'italic' ? 'italic ' : ''
        const fontWeight = slot.fontWeight || 'normal'
        const fontSize = (slot.fontSize || 12) * scale
        const fontFamily = slot.fontFamily || 'serif'
        ctx.font = `${fontStyle}${fontWeight} ${fontSize}px ${fontFamily}`
        ctx.fillStyle = '#1A1A1A'
        ctx.textBaseline = 'top'

        const x = slot.x * scale
        const y = slot.y * scale + (slot.borderTop ? 8 : 0)
        const maxWidth = slot.w * scale
        const lineHeightVal = (slot.lineHeight || 1.4) * fontSize

        // Text alignment
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
      } else if (slot.type === 'image' && content?.imageUrl) {
        const promise = new Promise<void>((resolveImg) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => {
            ctx.save()

            // Apply filter
            const filterStyle = getFilterStyle(content.filter)
            if (filterStyle !== 'none') {
              ctx.filter = filterStyle
            }

            // Draw image with cover behavior
            const dx = slot.x * scale
            const dy = slot.y * scale
            const dw = slot.w * scale
            const dh = slot.h * scale
            drawImageCover(ctx, img, dx, dy, dw, dh)

            ctx.restore()
            resolveImg()
          }
          img.onerror = () => resolveImg()
          img.src = content.imageUrl!
        })
        imagePromises.push(promise)
      }
    }

    Promise.all(imagePromises).then(() => {
      resolve(canvas)
    })
  })
}

function drawSlotBorders(ctx: CanvasRenderingContext2D, slot: any, scale: number) {
  ctx.strokeStyle = '#1A1A1A'
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
) {
  const imgRatio = img.naturalWidth / img.naturalHeight
  const slotRatio = dw / dh
  let sx: number, sy: number, sw: number, sh: number

  if (imgRatio > slotRatio) {
    sh = img.naturalHeight
    sw = sh * slotRatio
    sx = (img.naturalWidth - sw) / 2
    sy = 0
  } else {
    sw = img.naturalWidth
    sh = sw / slotRatio
    sx = 0
    sy = (img.naturalHeight - sh) / 2
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

function addGrainEffect(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 8
    data[i] = Math.min(255, Math.max(0, data[i]! + grain))
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1]! + grain))
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2]! + grain))
  }
  ctx.putImageData(imageData, 0, 0)
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
