export * from './types'
import type { NewspaperTemplate } from './types'
import { a4Templates } from './a4'
import { a3Templates } from './a3'

export { a4Templates } from './a4'
export { a3Templates } from './a3'

const HEADLINES = [
  'GELORA METROPOLIS DARI JANTUNG NUSANTARA',
  'ROMANTIKA BRAGA DAN KEMEGAHAN PRIANGAN',
  'FILOSOFI GOLONG GILIG DARI TUGU KE KERATON',
  'SEMANGAT KEPALAWANAN DI TANAH AREK SUROBOYO',
  'KEMEGAHAN ISTANA MAIMUN DAN TANAH DELI',
  'WARISAN KOTA LAMA DAN MENARA LAWANG SEWU',
  'ADILUHUNG BUDAYA KASUNANAN DAN BENGAWAN SOLO',
  'KEJAYAAN MARITIM ANGING MAMMIRI MAKASSAR',
  'PESONA RANAH MINANG DAN JAM GADANG',
  'HARMONI TRI HITA KARANA DI PULAU DEWATA',
  'IKATAN JANJI SUCI: KALA DUA HATI BERSATU',
  'AIR MATA BANGGA DAN TOGA KELULUSAN SARJANA',
  'MERAYAKAN KELAHIRAN DAN BERKAH USIA ISTIMEWA',
  'MENJEJAKI ALAM BEBAS DAN CATATAN EKSPEDISI',
  'MOMEN BERSEJARAH DI BUMI PERSADA',
]

export function getRandomHeadline(): string {
  return HEADLINES[Math.floor(Math.random() * HEADLINES.length)]!
}

// All templates aggregated (10 A4 + 10 A3 = 20 total)
export const templates: NewspaperTemplate[] = [
  ...a4Templates,
  ...a3Templates,
]
