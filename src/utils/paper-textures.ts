export type PaperTextureId =
  | 'plain'
  | 'newspaper'
  | 'ruled'
  | 'vintage'
  | 'retro'
  | 'kraft'
  | 'parchment'
  | 'linen'
  | 'dark'

export interface PaperTextureInfo {
  id: PaperTextureId
  name: string
  icon: string // emoji / short icon
  description: string
  background: string // paper background color
  inkColor: string // text / border color
  swatchStyle: string // CSS background shorthand for the UI swatch
}

// ────────────────────────────────────────────────────────────
// Texture catalogue
// ────────────────────────────────────────────────────────────
export const PAPER_TEXTURES: PaperTextureInfo[] = [
  {
    id: 'plain',
    name: 'Plain',
    icon: '📄',
    description: 'Clean cream paper',
    background: '#FAF8F3',
    inkColor: '#1A1A1A',
    swatchStyle: '#FAF8F3',
  },
  {
    id: 'newspaper',
    name: 'Newsprint',
    icon: '📰',
    description: 'Classic newsprint with horizontal rules',
    background: '#F0EBD0',
    inkColor: '#1A1A1A',
    swatchStyle:
      'repeating-linear-gradient(0deg,#F0EBD0 0px,#F0EBD0 17px,#d8d3bb 17px,#d8d3bb 18px)',
  },
  {
    id: 'ruled',
    name: 'Ruled',
    icon: '📓',
    description: 'Lined notebook paper with margin',
    background: '#FFFFFF',
    inkColor: '#1A1A1A',
    swatchStyle:
      'repeating-linear-gradient(0deg,#fff 0px,#fff 27px,rgba(70,120,200,0.25) 27px,rgba(70,120,200,0.25) 28px)',
  },
  {
    id: 'vintage',
    name: 'Vintage',
    icon: '📜',
    description: 'Aged antique parchment with vignette',
    background: '#E8D5A3',
    inkColor: '#2A1808',
    swatchStyle: 'radial-gradient(ellipse at 50% 50%, #E8D5A3 50%, #C4A057 100%)',
  },
  {
    id: 'retro',
    name: 'Retro',
    icon: '🟧',
    description: 'Warm 1970s toned paper with diagonal grain',
    background: '#F2D9B5',
    inkColor: '#1A1A1A',
    swatchStyle:
      'repeating-linear-gradient(-45deg,#F2D9B5 0px,#F2D9B5 7px,#e5c98a 7px,#e5c98a 8px)',
  },
  {
    id: 'kraft',
    name: 'Kraft',
    icon: '📦',
    description: 'Rough brown kraft/packing paper',
    background: '#C8955D',
    inkColor: '#12080A',
    swatchStyle: 'repeating-linear-gradient(0deg,#C8955D 0px,#C8955D 3px,#b8854d 3px,#b8854d 4px)',
  },
  {
    id: 'parchment',
    name: 'Parchment',
    icon: '🧾',
    description: 'Warm aged parchment with subtle stains',
    background: '#E6D5B0',
    inkColor: '#1E1202',
    swatchStyle: 'radial-gradient(circle at 30% 30%, #E6D5B0 0%, #D4C08E 60%, #C4A86E 100%)',
  },
  {
    id: 'linen',
    name: 'Linen',
    icon: '🧵',
    description: 'Fine cross-hatch linen weave texture',
    background: '#F5F0E6',
    inkColor: '#1A1A1A',
    swatchStyle:
      'repeating-linear-gradient(0deg,#F5F0E6 0px,#F5F0E6 2px,#eae5d9 2px,#eae5d9 3px),repeating-linear-gradient(90deg,#F5F0E6 0px,#F5F0E6 2px,#eee9dd 2px,#eee9dd 3px)',
  },
  {
    id: 'dark',
    name: 'Dark',
    icon: '🌑',
    description: 'Inverted dark newsprint',
    background: '#1A1A1A',
    inkColor: '#E8E0D0',
    swatchStyle: 'linear-gradient(135deg, #1A1A1A, #2A2A2A)',
  },
]

export function getTextureById(id: PaperTextureId): PaperTextureInfo {
  return PAPER_TEXTURES.find((t) => t.id === id) ?? PAPER_TEXTURES[0]!
}

// ────────────────────────────────────────────────────────────
// CSS overlay style (for DOM components: EditorCanvas, PreviewPaper)
// Returns an inline-style object for the overlay <div>
// ────────────────────────────────────────────────────────────
const _svgUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`

/** Standard paper grain – medium frequency fractal noise */
const GRAIN = _svgUrl(
  '<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>',
)

/** Fine high-detail grain – smooth quality paper */
const GRAIN_FINE = _svgUrl(
  '<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="5" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>',
)

/** Coarse grain – rough / cheap paper (kraft, newsprint) */
const GRAIN_COARSE = _svgUrl(
  '<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>',
)

/** Horizontal paper fiber streaks (anisotropic noise) */
const FIBER = _svgUrl(
  '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><filter id="f"><feTurbulence type="fractalNoise" baseFrequency="0.02 0.65" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#f)"/></svg>',
)

/** Speckled turbulence – age spots / foxing on old paper */
const SPECKLE = _svgUrl(
  '<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><filter id="s"><feTurbulence type="turbulence" baseFrequency="0.55" numOctaves="2" seed="5" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#s)"/></svg>',
)

export function getPaperOverlayStyle(id: PaperTextureId): Record<string, string> {
  switch (id) {
    case 'newspaper':
      return {
        backgroundImage: [
          // Faint horizontal print-press rules
          'repeating-linear-gradient(0deg,transparent 0px,transparent 17px,rgba(0,0,0,0.04) 17px,rgba(0,0,0,0.04) 18px)',
          // Horizontal paper fibers
          FIBER,
          // Newsprint grain
          GRAIN,
        ].join(','),
        backgroundSize: 'auto, 400px 400px, 256px 256px',
        mixBlendMode: 'multiply',
        opacity: '0.5',
      }
    case 'ruled':
      return {
        backgroundImage: [
          // Blue ruled lines
          'repeating-linear-gradient(0deg,transparent 0px,transparent 27px,rgba(70,120,200,0.22) 27px,rgba(70,120,200,0.22) 28px)',
          // Red margin line
          'linear-gradient(90deg,transparent 59px,rgba(220,50,50,0.28) 59px,rgba(220,50,50,0.28) 61px,transparent 61px)',
          // Very subtle grain
          GRAIN_FINE,
        ].join(','),
        backgroundSize: 'auto, auto, 512px 512px',
        opacity: '1',
      }
    case 'vintage':
      return {
        backgroundImage: [
          // Deep vignette – darkened aged edges
          'radial-gradient(ellipse at 50% 50%,transparent 25%,rgba(60,25,0,0.18) 65%,rgba(30,10,0,0.4) 100%)',
          // Age spots / foxing
          SPECKLE,
          // Paper fiber
          FIBER,
          // Heavy coarse grain
          GRAIN_COARSE,
        ].join(','),
        backgroundSize: 'auto, 256px 256px, 400px 400px, 300px 300px',
        mixBlendMode: 'multiply',
        opacity: '0.7',
      }
    case 'retro':
      return {
        backgroundImage: [
          // Diagonal grain pattern
          'repeating-linear-gradient(-45deg,transparent 0px,transparent 7px,rgba(150,75,15,0.05) 7px,rgba(150,75,15,0.05) 8px)',
          // Warm subtle vignette
          'radial-gradient(ellipse at 50% 50%,transparent 50%,rgba(80,35,5,0.1) 100%)',
          // Paper fiber
          FIBER,
          // Fine grain
          GRAIN_FINE,
        ].join(','),
        backgroundSize: 'auto, auto, 400px 400px, 350px 350px',
        mixBlendMode: 'multiply',
        opacity: '0.55',
      }
    case 'kraft':
      return {
        backgroundImage: [
          // Dense horizontal fibers
          'repeating-linear-gradient(0deg,transparent 0px,transparent 3px,rgba(0,0,0,0.06) 3px,rgba(0,0,0,0.06) 4px)',
          // Cross-fiber weave
          'repeating-linear-gradient(90deg,transparent 0px,transparent 5px,rgba(0,0,0,0.03) 5px,rgba(0,0,0,0.03) 6px)',
          // Visible paper fibers
          FIBER,
          // Coarse rough grain
          GRAIN_COARSE,
        ].join(','),
        backgroundSize: 'auto, auto, 350px 350px, 200px 200px',
        mixBlendMode: 'multiply',
        opacity: '0.65',
      }
    case 'parchment':
      return {
        backgroundImage: [
          // Warm edge vignette
          'radial-gradient(ellipse at 50% 50%,transparent 30%,rgba(100,60,10,0.12) 75%,rgba(50,25,0,0.25) 100%)',
          // Age spots
          SPECKLE,
          // Fiber streaks
          FIBER,
          // Medium grain
          GRAIN,
        ].join(','),
        backgroundSize: 'auto, 200px 200px, 350px 350px, 256px 256px',
        mixBlendMode: 'multiply',
        opacity: '0.55',
      }
    case 'linen':
      return {
        backgroundImage: [
          // Fine horizontal weave
          'repeating-linear-gradient(0deg,transparent 0px,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 3px)',
          // Fine vertical weave (cross-hatch)
          'repeating-linear-gradient(90deg,transparent 0px,transparent 2px,rgba(0,0,0,0.025) 2px,rgba(0,0,0,0.025) 3px)',
          // Subtle fine grain
          GRAIN_FINE,
        ].join(','),
        backgroundSize: 'auto, auto, 400px 400px',
        mixBlendMode: 'multiply',
        opacity: '0.45',
      }
    case 'dark':
      return {
        backgroundImage: GRAIN_FINE,
        backgroundSize: '400px 400px',
        mixBlendMode: 'screen',
        opacity: '0.07',
      }
    default: // plain
      return {
        backgroundImage: GRAIN_FINE,
        backgroundSize: '400px 400px',
        mixBlendMode: 'multiply',
        opacity: '0.04',
      }
  }
}

// ────────────────────────────────────────────────────────────
// Canvas texture renderer (for ExportHandler)
// ────────────────────────────────────────────────────────────
export function applyCanvasTexture(
  ctx: CanvasRenderingContext2D,
  id: PaperTextureId,
  width: number,
  height: number,
): void {
  switch (id) {
    case 'newspaper': {
      ctx.save()
      ctx.strokeStyle = 'rgba(0,0,0,0.06)'
      ctx.lineWidth = 1
      for (let y = 18; y < height; y += 18) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
      ctx.restore()
      _addGrain(ctx, width, height, 14)
      break
    }
    case 'ruled': {
      ctx.save()
      ctx.strokeStyle = 'rgba(70,120,200,0.22)'
      ctx.lineWidth = 1
      for (let y = 28; y < height; y += 28) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
      ctx.strokeStyle = 'rgba(220,50,50,0.28)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(60, 0)
      ctx.lineTo(60, height)
      ctx.stroke()
      ctx.restore()
      break
    }
    case 'vintage': {
      ctx.save()
      const vignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        height * 0.28,
        width / 2,
        height / 2,
        height * 0.78,
      )
      vignette.addColorStop(0, 'rgba(0,0,0,0)')
      vignette.addColorStop(1, 'rgba(90,42,5,0.22)')
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, width, height)
      ctx.restore()
      _addGrain(ctx, width, height, 16)
      break
    }
    case 'retro': {
      ctx.save()
      ctx.strokeStyle = 'rgba(140,65,12,0.06)'
      ctx.lineWidth = 1
      for (let i = -height * 2; i < width + height * 2; i += 10) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i + height, height)
        ctx.stroke()
      }
      ctx.restore()
      _addGrain(ctx, width, height, 10)
      break
    }
    case 'kraft': {
      ctx.save()
      ctx.strokeStyle = 'rgba(0,0,0,0.08)'
      ctx.lineWidth = 1
      for (let y = 0; y < height; y += 4) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
      ctx.strokeStyle = 'rgba(0,0,0,0.04)'
      for (let x = 0; x < width; x += 6) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      ctx.restore()
      _addGrain(ctx, width, height, 20)
      break
    }
    case 'parchment': {
      ctx.save()
      const parchVignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        height * 0.2,
        width / 2,
        height / 2,
        height * 0.72,
      )
      parchVignette.addColorStop(0, 'rgba(0,0,0,0)')
      parchVignette.addColorStop(0.7, 'rgba(80,50,10,0.1)')
      parchVignette.addColorStop(1, 'rgba(50,25,0,0.22)')
      ctx.fillStyle = parchVignette
      ctx.fillRect(0, 0, width, height)
      ctx.restore()
      _addGrain(ctx, width, height, 14)
      break
    }
    case 'linen': {
      ctx.save()
      ctx.strokeStyle = 'rgba(0,0,0,0.04)'
      ctx.lineWidth = 0.5
      for (let y = 0; y < height; y += 3) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
      ctx.strokeStyle = 'rgba(0,0,0,0.03)'
      for (let x = 0; x < width; x += 3) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      ctx.restore()
      _addGrain(ctx, width, height, 6)
      break
    }
    case 'dark':
      _addGrain(ctx, width, height, 8)
      break
    default: // plain
      _addGrain(ctx, width, height, 8)
  }
}

function _addGrain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number,
) {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const g = (Math.random() - 0.5) * intensity
    data[i] = Math.min(255, Math.max(0, data[i]! + g))
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1]! + g))
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2]! + g))
  }
  ctx.putImageData(imageData, 0, 0)
}
