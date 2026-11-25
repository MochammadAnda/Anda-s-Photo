export type PaperTextureId =
  | 'aged'
  | 'newspaper'
  | 'vintage'
  | 'parchment'
  | 'plain'
  | 'ruled'
  | 'retro'
  | 'kraft'
  | 'linen'
  | 'ivory'
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
    id: 'aged',
    name: 'Aged (Otentik)',
    icon: '🗞️',
    description: 'Koran tua otentik dengan lipatan fisik, serat kayu, noda tepi & vignette realistis',
    background: '#F2EBD9',
    inkColor: '#1A140E',
    swatchStyle:
      'radial-gradient(ellipse at 50% 50%, #FAF3E3 35%, #EAD8B2 75%, #A87C40 100%)',
  },
  {
    id: 'newspaper',
    name: 'Newsprint',
    icon: '📰',
    description: 'Koran cetak klasik dengan serat pulp dan cetakan timah',
    background: '#EFE7D3',
    inkColor: '#1A1A1A',
    swatchStyle:
      'repeating-linear-gradient(0deg,#EFE7D3 0px,#EFE7D3 17px,#ded5bf 17px,#ded5bf 18px)',
  },
  {
    id: 'vintage',
    name: 'Vintage',
    icon: '📜',
    description: 'Aged antique parchment dengan vignette cokelat dan bintik usia',
    background: '#E8D5A3',
    inkColor: '#2A1808',
    swatchStyle: 'radial-gradient(ellipse at 50% 50%, #E8D5A3 50%, #C4A057 100%)',
  },
  {
    id: 'plain',
    name: 'Plain',
    icon: '📄',
    description: 'Kertas krem bersih tanpa noda',
    background: '#FAF8F3',
    inkColor: '#1A1A1A',
    swatchStyle: '#FAF8F3',
  },
  {
    id: 'ruled',
    name: 'Ruled',
    icon: '📓',
    description: 'Lined notebook paper dengan margin garis merah',
    background: '#FFFFFF',
    inkColor: '#1A1A1A',
    swatchStyle:
      'repeating-linear-gradient(0deg,#fff 0px,#fff 27px,rgba(70,120,200,0.25) 27px,rgba(70,120,200,0.25) 28px)',
  },
  {
    id: 'retro',
    name: 'Retro',
    icon: '🟧',
    description: 'Kertas bernuansa tahun 70-an dengan serat diagonal hangat',
    background: '#F2D9B5',
    inkColor: '#1A1A1A',
    swatchStyle:
      'repeating-linear-gradient(-45deg,#F2D9B5 0px,#F2D9B5 7px,#e5c98a 7px,#e5c98a 8px)',
  },
  {
    id: 'kraft',
    name: 'Kraft',
    icon: '📦',
    description: 'Kertas bungkus cokelat berserat kasar',
    background: '#C8955D',
    inkColor: '#12080A',
    swatchStyle: 'repeating-linear-gradient(0deg,#C8955D 0px,#C8955D 3px,#b8854d 3px,#b8854d 4px)',
  },
  {
    id: 'parchment',
    name: 'Parchment',
    icon: '🧾',
    description: 'Parchment kulit dengan nuansa noda teh halus',
    background: '#E6D5B0',
    inkColor: '#1E1202',
    swatchStyle: 'radial-gradient(circle at 30% 30%, #E6D5B0 0%, #D4C08E 60%, #C4A86E 100%)',
  },
  {
    id: 'linen',
    name: 'Linen',
    icon: '🧵',
    description: 'Anyaman kain linen halus bermotif silang',
    background: '#F5F0E6',
    inkColor: '#1A1A1A',
    swatchStyle:
      'repeating-linear-gradient(0deg,#F5F0E6 0px,#F5F0E6 2px,#eae5d9 2px,#eae5d9 3px),repeating-linear-gradient(90deg,#F5F0E6 0px,#F5F0E6 2px,#eee9dd 2px,#eee9dd 3px)',
  },
  {
    id: 'ivory',
    name: 'Ivory',
    icon: '🤍',
    description: 'Nuansa gading studio potret klasik tempo doeloe',
    background: '#F5F0E8',
    inkColor: '#2C1E10',
    swatchStyle: 'linear-gradient(160deg, #F5F0E8 0%, #EDE5D4 50%, #E4DACA 100%)',
  },
  {
    id: 'dark',
    name: 'Dark',
    icon: '🌑',
    description: 'Koran cetak gelap / mode malam',
    background: '#1A1A1A',
    inkColor: '#E8E0D0',
    swatchStyle: 'linear-gradient(135deg, #1A1A1A, #2A2A2A)',
  },
]

export function getTextureById(id: PaperTextureId): PaperTextureInfo {
  return PAPER_TEXTURES.find((t) => t.id === id) ?? PAPER_TEXTURES[0]!
}

// ────────────────────────────────────────────────────────────
// SVG Noise and Filter Utilities
// ────────────────────────────────────────────────────────────
const _svgUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`

/** Standard paper grain – medium frequency fractal noise */
const GRAIN = _svgUrl(
  '<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>',
)

/** Fine high-detail grain – smooth quality paper */
const GRAIN_FINE = _svgUrl(
  '<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="1.15" numOctaves="5" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>',
)

/** Coarse grain – rough newsprint / wood pulp */
const GRAIN_COARSE = _svgUrl(
  '<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>',
)

/** Horizontal paper fiber streaks (anisotropic wood pulp noise) */
const FIBER = _svgUrl(
  '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><filter id="f"><feTurbulence type="fractalNoise" baseFrequency="0.015 0.72" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#f)"/></svg>',
)

/** Speckled turbulence – age spots / foxing on old paper */
const SPECKLE = _svgUrl(
  '<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><filter id="s"><feTurbulence type="turbulence" baseFrequency="0.55" numOctaves="2" seed="5" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#s)"/></svg>',
)

// ────────────────────────────────────────────────────────────
// Base CSS Overlay Style (z-[1], behind text and images)
// ────────────────────────────────────────────────────────────
export function getPaperOverlayStyle(id: PaperTextureId): Record<string, string> {
  switch (id) {
    case 'aged':
      return {
        backgroundImage: [
          // Deep perimeter aging vignette
          'radial-gradient(ellipse 94% 90% at 50% 50%, transparent 58%, rgba(140, 92, 38, 0.16) 80%, rgba(95, 52, 16, 0.36) 96%, rgba(65, 30, 8, 0.52) 100%)',
          // Corner aging burns
          'radial-gradient(circle 320px at 0% 0%, rgba(85, 45, 10, 0.28) 0%, transparent 80%)',
          'radial-gradient(circle 320px at 100% 0%, rgba(85, 45, 10, 0.25) 0%, transparent 80%)',
          'radial-gradient(circle 380px at 100% 100%, rgba(90, 48, 12, 0.32) 0%, transparent 80%)',
          'radial-gradient(circle 340px at 0% 100%, rgba(85, 45, 10, 0.28) 0%, transparent 80%)',
          // Age spots / foxing
          SPECKLE,
          // Horizontal pulp fibers
          FIBER,
          // Authentic newsprint grain
          GRAIN,
        ].join(','),
        backgroundSize: 'auto, auto, auto, auto, auto, 256px 256px, 400px 400px, 256px 256px',
        mixBlendMode: 'multiply',
        opacity: '0.8',
      }
    case 'newspaper':
      return {
        backgroundImage: [
          // Subtle warm edge vignette
          'radial-gradient(ellipse 92% 88% at 50% 50%, transparent 68%, rgba(100, 65, 25, 0.14) 94%, rgba(60, 32, 10, 0.28) 100%)',
          // Faint horizontal print-press lines
          'repeating-linear-gradient(0deg,transparent 0px,transparent 17px,rgba(0,0,0,0.035) 17px,rgba(0,0,0,0.035) 18px)',
          // Horizontal paper fibers
          FIBER,
          // Newsprint grain
          GRAIN,
        ].join(','),
        backgroundSize: 'auto, auto, 400px 400px, 256px 256px',
        mixBlendMode: 'multiply',
        opacity: '0.65',
      }
    case 'vintage':
      return {
        backgroundImage: [
          // Deep vignette – darkened aged edges
          'radial-gradient(ellipse at 50% 50%,transparent 25%,rgba(60,25,0,0.2) 65%,rgba(30,10,0,0.45) 100%)',
          // Age spots / foxing
          SPECKLE,
          // Paper fiber
          FIBER,
          // Heavy coarse grain
          GRAIN_COARSE,
        ].join(','),
        backgroundSize: 'auto, 256px 256px, 400px 400px, 300px 300px',
        mixBlendMode: 'multiply',
        opacity: '0.75',
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
    case 'retro':
      return {
        backgroundImage: [
          // Diagonal grain pattern
          'repeating-linear-gradient(-45deg,transparent 0px,transparent 7px,rgba(150,75,15,0.05) 7px,rgba(150,75,15,0.05) 8px)',
          // Warm subtle vignette
          'radial-gradient(ellipse at 50% 50%,transparent 50%,rgba(80,35,5,0.12) 100%)',
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
          'radial-gradient(ellipse at 50% 50%,transparent 30%,rgba(100,60,10,0.14) 75%,rgba(50,25,0,0.3) 100%)',
          // Age spots
          SPECKLE,
          // Fiber streaks
          FIBER,
          // Medium grain
          GRAIN,
        ].join(','),
        backgroundSize: 'auto, 200px 200px, 350px 350px, 256px 256px',
        mixBlendMode: 'multiply',
        opacity: '0.6',
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
    case 'ivory':
      return {
        backgroundImage: [
          // Very soft warm vignette
          'radial-gradient(ellipse at 50% 50%,transparent 40%,rgba(80,50,20,0.06) 80%,rgba(50,30,10,0.12) 100%)',
          // Subtle warm tint gradient
          'linear-gradient(180deg,rgba(200,170,120,0.03) 0%,transparent 30%,transparent 70%,rgba(180,150,100,0.04) 100%)',
          // Fine grain
          GRAIN_FINE,
        ].join(','),
        backgroundSize: 'auto, auto, 512px 512px',
        mixBlendMode: 'multiply',
        opacity: '0.4',
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
// Realistic Paper Crease & Fold Overlay Style (z-[15], across text & photos)
// ────────────────────────────────────────────────────────────
export function getPaperCreaseOverlayStyle(options?: {
  crease?: boolean
  vignette?: boolean
}): Record<string, string> {
  const showCrease = options?.crease ?? true
  const showVignette = options?.vignette ?? true

  const layers: string[] = []

  if (showCrease) {
    // 1. Primary horizontal fold line across center (49.8%) with 3D highlight + groove + drop shadow
    layers.push(
      'linear-gradient(180deg, transparent 0%, transparent calc(50% - 16px), rgba(35, 18, 5, 0.03) calc(50% - 9px), rgba(255, 255, 255, 0.48) calc(50% - 1.5px), rgba(45, 22, 8, 0.36) 50%, rgba(28, 14, 5, 0.2) calc(50% + 4px), rgba(15, 8, 3, 0.08) calc(50% + 11px), rgba(0, 0, 0, 0.03) calc(50% + 20px), transparent calc(50% + 26px), transparent 100%)',
    )
    // 2. Primary vertical center fold line (50%)
    layers.push(
      'linear-gradient(90deg, transparent 0%, transparent calc(50% - 14px), rgba(255, 255, 255, 0.32) calc(50% - 1.5px), rgba(42, 20, 6, 0.26) 50%, rgba(25, 12, 4, 0.12) calc(50% + 4px), rgba(0, 0, 0, 0.03) calc(50% + 12px), transparent calc(50% + 18px), transparent 100%)',
    )
    // 3. Faint broadsheet quarter fold lines at 25% and 75% height
    layers.push(
      'linear-gradient(180deg, transparent 0%, transparent calc(25% - 6px), rgba(255, 255, 255, 0.18) calc(25% - 1px), rgba(40, 20, 5, 0.12) 25%, transparent calc(25% + 7px), transparent calc(75% - 6px), rgba(255, 255, 255, 0.18) calc(75% - 1px), rgba(40, 20, 5, 0.12) 75%, transparent calc(75% + 7px), transparent 100%)',
    )
  }

  if (showVignette) {
    // Perimeter aging & oxidation ring overlay (subtle on top of ink)
    layers.push(
      'radial-gradient(ellipse 95% 92% at 50% 50%, transparent 70%, rgba(110, 65, 20, 0.1) 88%, rgba(70, 35, 10, 0.25) 98%, rgba(45, 18, 5, 0.42) 100%)',
    )
  }

  if (layers.length === 0) {
    return { display: 'none' }
  }

  return {
    backgroundImage: layers.join(','),
    backgroundSize: '100% 100%',
    mixBlendMode: 'multiply',
    opacity: '0.82',
    pointerEvents: 'none',
  }
}

// ────────────────────────────────────────────────────────────
// Canvas Texture Renderer (Base background for ExportHandler)
// ────────────────────────────────────────────────────────────
export function applyCanvasTexture(
  ctx: CanvasRenderingContext2D,
  id: PaperTextureId,
  width: number,
  height: number,
): void {
  switch (id) {
    case 'aged': {
      ctx.save()
      // 1. Deep outer vignette
      const radVignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.28,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.72,
      )
      radVignette.addColorStop(0, 'rgba(0,0,0,0)')
      radVignette.addColorStop(0.65, 'rgba(140,90,35,0.12)')
      radVignette.addColorStop(0.88, 'rgba(95,50,15,0.32)')
      radVignette.addColorStop(1, 'rgba(60,25,8,0.5)')
      ctx.fillStyle = radVignette
      ctx.fillRect(0, 0, width, height)

      // 2. Corner oxidation burns
      _drawCornerBurn(ctx, 0, 0, width * 0.35, 'rgba(85,45,10,0.26)')
      _drawCornerBurn(ctx, width, 0, width * 0.35, 'rgba(85,45,10,0.22)')
      _drawCornerBurn(ctx, width, height, width * 0.4, 'rgba(90,48,12,0.3)')
      _drawCornerBurn(ctx, 0, height, width * 0.35, 'rgba(85,45,10,0.26)')

      // 3. Subtle horizontal wood fibers
      ctx.strokeStyle = 'rgba(100,60,20,0.035)'
      ctx.lineWidth = 1
      for (let y = 0; y < height; y += 4) {
        if (Math.random() > 0.4) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
          ctx.stroke()
        }
      }

      ctx.restore()
      _addGrain(ctx, width, height, 16)
      break
    }
    case 'newspaper': {
      ctx.save()
      // Outer subtle vignette
      const npVignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.32,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.74,
      )
      npVignette.addColorStop(0, 'rgba(0,0,0,0)')
      npVignette.addColorStop(0.85, 'rgba(100,65,25,0.14)')
      npVignette.addColorStop(1, 'rgba(60,32,10,0.28)')
      ctx.fillStyle = npVignette
      ctx.fillRect(0, 0, width, height)

      // Print lines
      ctx.strokeStyle = 'rgba(0,0,0,0.04)'
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
      vignette.addColorStop(0.7, 'rgba(90,42,5,0.18)')
      vignette.addColorStop(1, 'rgba(50,20,5,0.38)')
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, width, height)
      ctx.restore()
      _addGrain(ctx, width, height, 18)
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
      parchVignette.addColorStop(0.7, 'rgba(80,50,10,0.12)')
      parchVignette.addColorStop(1, 'rgba(50,25,0,0.28)')
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
    case 'ivory': {
      ctx.save()
      const ivoryVignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        height * 0.35,
        width / 2,
        height / 2,
        height * 0.8,
      )
      ivoryVignette.addColorStop(0, 'rgba(0,0,0,0)')
      ivoryVignette.addColorStop(1, 'rgba(60,40,15,0.08)')
      ctx.fillStyle = ivoryVignette
      ctx.fillRect(0, 0, width, height)
      ctx.restore()
      _addGrain(ctx, width, height, 5)
      break
    }
    case 'dark':
      _addGrain(ctx, width, height, 8)
      break
    default: // plain
      _addGrain(ctx, width, height, 8)
  }
}

// ────────────────────────────────────────────────────────────
// Canvas Top Finishing Overlay (Rendered ON TOP of slots in ExportHandler)
// ────────────────────────────────────────────────────────────
export function applyCanvasTopOverlay(
  ctx: CanvasRenderingContext2D,
  _id: PaperTextureId,
  width: number,
  height: number,
  options?: { crease?: boolean; vignette?: boolean },
): void {
  const showCrease = options?.crease ?? true
  const showVignette = options?.vignette ?? true

  ctx.save()

  // 1. Horizontal Fold Crease (Center Y)
  if (showCrease) {
    const cy = height * 0.5

    // Top drop shadow into fold
    const topShadow = ctx.createLinearGradient(0, cy - 16, 0, cy)
    topShadow.addColorStop(0, 'rgba(0, 0, 0, 0)')
    topShadow.addColorStop(1, 'rgba(40, 20, 5, 0.12)')
    ctx.fillStyle = topShadow
    ctx.fillRect(0, cy - 16, width, 16)

    // Highlight ridge (light reflection on the fold edge)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(0, cy - 1)
    ctx.lineTo(width, cy - 1)
    ctx.stroke()

    // Shadow groove
    ctx.strokeStyle = 'rgba(45, 22, 8, 0.35)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(0, cy + 0.5)
    ctx.lineTo(width, cy + 0.5)
    ctx.stroke()

    // Bottom cast shadow
    const bottomShadow = ctx.createLinearGradient(0, cy + 1, 0, cy + 24)
    bottomShadow.addColorStop(0, 'rgba(40, 20, 5, 0.22)')
    bottomShadow.addColorStop(0.3, 'rgba(25, 12, 4, 0.12)')
    bottomShadow.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = bottomShadow
    ctx.fillRect(0, cy + 1, width, 24)

    // 2. Vertical Fold Crease (Center X)
    const cx = width * 0.5

    // Highlight line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)'
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(cx - 1, 0)
    ctx.lineTo(cx - 1, height)
    ctx.stroke()

    // Shadow line
    ctx.strokeStyle = 'rgba(42, 20, 6, 0.24)'
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(cx + 0.5, 0)
    ctx.lineTo(cx + 0.5, height)
    ctx.stroke()

    // Soft vertical cast shadow
    const vShadow = ctx.createLinearGradient(cx + 1, 0, cx + 18, 0)
    vShadow.addColorStop(0, 'rgba(35, 16, 5, 0.12)')
    vShadow.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = vShadow
    ctx.fillRect(cx + 1, 0, 18, height)

    // 3. Quarter folds (25% and 75%)
    for (const qy of [height * 0.25, height * 0.75]) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, qy - 1)
      ctx.lineTo(width, qy - 1)
      ctx.stroke()

      ctx.strokeStyle = 'rgba(40, 20, 5, 0.12)'
      ctx.beginPath()
      ctx.moveTo(0, qy)
      ctx.lineTo(width, qy)
      ctx.stroke()
    }
  }

  // 4. Subtle Perimeter Aging Vignette (over ink & photos)
  if (showVignette) {
    const vig = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.35,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.72,
    )
    vig.addColorStop(0, 'rgba(0, 0, 0, 0)')
    vig.addColorStop(0.65, 'rgba(120, 75, 25, 0.05)')
    vig.addColorStop(0.88, 'rgba(80, 40, 10, 0.18)')
    vig.addColorStop(1, 'rgba(50, 20, 5, 0.32)')
    ctx.fillStyle = vig
    ctx.fillRect(0, 0, width, height)
  }

  ctx.restore()
}

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────
function _drawCornerBurn(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
) {
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius)
  grad.addColorStop(0, color)
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(
    Math.max(0, x - radius),
    Math.max(0, y - radius),
    Math.min(radius * 2, ctx.canvas.width),
    Math.min(radius * 2, ctx.canvas.height),
  )
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
