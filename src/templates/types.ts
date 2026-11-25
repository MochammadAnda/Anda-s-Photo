export interface TemplateSlot {
  id: string
  type: 'image' | 'text'
  x: number
  y: number
  w: number
  h: number
  content?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  fontStyle?: string
  textAlign?: string
  letterSpacing?: number
  lineHeight?: number
  textTransform?: string
  borderTop?: boolean | string
  borderBottom?: boolean | string
  borderLeft?: boolean | string
  borderRight?: boolean | string
  border?: string
  backgroundColor?: string
  color?: string
  padding?: string
  placeholder?: string
  editable?: boolean
  hasDropCap?: boolean
}

export type TemplateTheme = 'city' | 'wedding' | 'graduation' | 'birthday' | 'travel'

export interface NewspaperTemplate {
  id: string
  name: string
  description: string
  category: 'newspaper' | 'magazine' | 'minimal'
  theme?: TemplateTheme
  paperSize: 'A4' | 'A3'
  width: number
  height: number
  background: string
  slots: TemplateSlot[]
}
