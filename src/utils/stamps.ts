export type StampType =
  | 'special-edition'
  | 'postmark-round'
  | 'official-archive'
  | 'verified-heritage'
  | 'congratulations'
  | 'love-eternal'

export interface StampDefinition {
  id: StampType
  name: string
  subtitle: string
  color: string
  width: number
  height: number
  defaultRotation: number
}

export const VINTAGE_STAMPS: StampDefinition[] = [
  {
    id: 'special-edition',
    name: 'Edisi Khusus',
    subtitle: 'Cap Tinta Merah',
    color: '#8B1E1E',
    width: 140,
    height: 64,
    defaultRotation: -12,
  },
  {
    id: 'postmark-round',
    name: 'Cap Pos 1945',
    subtitle: 'Postkantoor Djakarta',
    color: '#1E293B',
    width: 110,
    height: 110,
    defaultRotation: 8,
  },
  {
    id: 'official-archive',
    name: 'Arsip Pusaka',
    subtitle: 'Dokumen Resmi',
    color: '#8B1E1E',
    width: 150,
    height: 55,
    defaultRotation: -6,
  },
  {
    id: 'verified-heritage',
    name: 'Authentic Heritage',
    subtitle: 'Segi Delapan Vintage',
    color: '#065F46',
    width: 110,
    height: 110,
    defaultRotation: 5,
  },
  {
    id: 'congratulations',
    name: 'Selamat & Sukses',
    subtitle: 'Medali Prestasi',
    color: '#92400E',
    width: 115,
    height: 115,
    defaultRotation: -8,
  },
  {
    id: 'love-eternal',
    name: 'Eternal Love',
    subtitle: 'Cap Janji Suci',
    color: '#9F1239',
    width: 130,
    height: 75,
    defaultRotation: -10,
  },
]

export interface CanvasStamp {
  id: string
  stampType: StampType
  x: number
  y: number
  rotation: number
  scale: number
}

/**
 * Draws a stamp directly onto a 2D canvas context at the given position and scale.
 */
export function drawStampOnCanvas(
  ctx: CanvasRenderingContext2D,
  stamp: CanvasStamp,
  scale: number = 1,
) {
  const def = VINTAGE_STAMPS.find((s) => s.id === stamp.stampType)
  if (!def) return

  const w = def.width * (stamp.scale || 1)
  const h = def.height * (stamp.scale || 1)
  const cx = (stamp.x + def.width / 2) * scale
  const cy = (stamp.y + def.height / 2) * scale

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate((stamp.rotation * Math.PI) / 180)
  ctx.globalAlpha = 0.88

  const sw = w * scale
  const sh = h * scale
  const color = def.color

  ctx.strokeStyle = color
  ctx.fillStyle = color

  if (stamp.stampType === 'special-edition') {
    // Red rectangular double box with dashed inner
    ctx.lineWidth = 3 * scale
    ctx.strokeRect(-sw / 2, -sh / 2, sw, sh)
    ctx.lineWidth = 1 * scale
    ctx.strokeRect(-sw / 2 + 4 * scale, -sh / 2 + 4 * scale, sw - 8 * scale, sh - 8 * scale)

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `bold ${10 * scale}px "Inter", sans-serif`
    ctx.fillText('★ SPECIAL EDITION ★', 0, -sh / 4)

    ctx.font = `900 ${18 * scale}px "Playfair Display", serif`
    ctx.fillText('EDISI KHUSUS', 0, 0)

    ctx.font = `bold ${8.5 * scale}px "Cinzel", serif`
    ctx.fillText('TERBIT RESMI NUSANTARA', 0, sh / 4)
  } else if (stamp.stampType === 'postmark-round') {
    // Round postmark with waves
    const r = (sw / 2) * 0.9
    ctx.lineWidth = 2.5 * scale
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.stroke()

    ctx.lineWidth = 1 * scale
    ctx.beginPath()
    ctx.arc(0, 0, r - 5 * scale, 0, Math.PI * 2)
    ctx.stroke()

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `bold ${8.5 * scale}px "Cinzel", serif`
    ctx.fillText('POSTKANTOOR', 0, -r * 0.5)

    ctx.font = `900 ${14 * scale}px "Playfair Display", serif`
    ctx.fillText('1945', 0, 0)

    ctx.font = `bold ${8 * scale}px "Inter", sans-serif`
    ctx.fillText('DJAKARTA · LUNAS', 0, r * 0.5)

    // Side wave lines
    ctx.lineWidth = 1.5 * scale
    ctx.beginPath()
    ctx.moveTo(r, -10 * scale)
    ctx.lineTo(r + 20 * scale, -10 * scale)
    ctx.moveTo(r, 0)
    ctx.lineTo(r + 25 * scale, 0)
    ctx.moveTo(r, 10 * scale)
    ctx.lineTo(r + 20 * scale, 10 * scale)
    ctx.stroke()
  } else if (stamp.stampType === 'official-archive') {
    // Rectangular official archive
    ctx.lineWidth = 2.5 * scale
    ctx.strokeRect(-sw / 2, -sh / 2, sw, sh)
    ctx.lineWidth = 1 * scale
    ctx.strokeRect(-sw / 2 + 3 * scale, -sh / 2 + 3 * scale, sw - 6 * scale, sh - 6 * scale)

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `900 ${13 * scale}px "Cinzel", serif`
    ctx.fillText('ARSIP PUSAKA RESMI', 0, -sh / 4 + 2 * scale)

    ctx.font = `italic ${9 * scale}px "Libre Baskerville", serif`
    ctx.fillText('DOCUMENT ARCHIVES · NO. 1928', 0, sh / 4 - 2 * scale)
  } else if (stamp.stampType === 'verified-heritage') {
    // Octagonal verified stamp
    const r = (sw / 2) * 0.95
    ctx.lineWidth = 2.5 * scale
    ctx.beginPath()
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4 + Math.PI / 8
      const x = r * Math.cos(angle)
      const y = r * Math.sin(angle)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.stroke()

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `bold ${8 * scale}px "Cinzel", serif`
    ctx.fillText('AUTHENTIC', 0, -r * 0.45)

    ctx.font = `900 ${11 * scale}px "Cinzel", serif`
    ctx.fillText('HERITAGE', 0, -r * 0.1)

    ctx.font = `bold ${7.5 * scale}px "Inter", sans-serif`
    ctx.fillText('★ 100% ORIGINAL ★', 0, r * 0.3)

    ctx.font = `6 * scale px "Inter", sans-serif`
    ctx.fillText('WARTA PUSAKA', 0, r * 0.58)
  } else if (stamp.stampType === 'congratulations') {
    // Medal / Star achievement stamp
    const r = (sw / 2) * 0.9
    ctx.lineWidth = 2 * scale
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.stroke()

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `bold ${8 * scale}px "Cinzel", serif`
    ctx.fillText('CONGRATULATIONS', 0, -r * 0.45)

    ctx.font = `900 ${12 * scale}px "Playfair Display", serif`
    ctx.fillText('SELAMAT', 0, -r * 0.08)

    ctx.font = `bold ${10 * scale}px "Cinzel", serif`
    ctx.fillText('& SUKSES', 0, r * 0.25)

    ctx.font = `italic ${7.5 * scale}px "Libre Baskerville", serif`
    ctx.fillText('★ CUM LAUDE ★', 0, r * 0.55)
  } else if (stamp.stampType === 'love-eternal') {
    // Heart vintage love crest
    ctx.lineWidth = 2.5 * scale
    ctx.strokeRect(-sw / 2, -sh / 2, sw, sh)
    ctx.lineWidth = 1 * scale
    ctx.strokeRect(-sw / 2 + 3 * scale, -sh / 2 + 3 * scale, sw - 6 * scale, sh - 6 * scale)

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `bold ${8 * scale}px "Cinzel", serif`
    ctx.fillText('♥ IKATAN JANJI SUCI ♥', 0, -sh / 4)

    ctx.font = `900 italic ${15 * scale}px "Playfair Display", serif`
    ctx.fillText('Eternal Love', 0, 2 * scale)

    ctx.font = `bold ${7.5 * scale}px "Inter", sans-serif`
    ctx.fillText('SELAMANYA BERSAMA', 0, sh / 4 + 2 * scale)
  }

  ctx.restore()
}
