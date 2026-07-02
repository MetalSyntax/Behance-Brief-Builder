export type ThemeId =
  | 'dark-editorial'
  | 'clean-light'
  | 'minimal'
  | 'neon-noir'
  | 'warm-parchment'
  | 'ocean-tech'
  | 'rose-editorial'
  | 'forest-sage'
  | 'cyberpunk'
  | 'nordic-cold'
  | 'dracula'
  | 'charcoal-mono'
  | 'flat-design-light'
  | 'nordic-light'
  | 'lavender-mist'
  | 'cyber-light'
  | 'mint-fresh'
  | 'solarized-light'
  | 'sand-dune'
  | 'brutalist-light'
  | 'custom'

export interface ThemeTokens {
  '--bg': string
  '--bg-section': string
  '--bg-card': string
  '--text': string
  '--text-muted': string
  '--accent': string
  '--accent-warm'?: string
  '--accent-2'?: string
  '--border': string
  '--font-display': string
  '--font-body': string
  '--radius': string
  '--section-w': string
}

export interface Project {
  id: string
  title: string
  theme: ThemeId
  sections: Section[]
  createdAt: string
  updatedAt: string
  customTheme?: ThemeTokens
}

export type SectionType =
  | 'cover'
  | 'overview'
  | 'problem'
  | 'process'
  | 'color-palette'
  | 'typography'
  | 'mockups'
  | 'ux-flow'
  | 'results'
  | 'footer'

export interface Section {
  id: string
  type: SectionType
  order: number
  visible: boolean
  data: any // Varía por tipo
  style: SectionStyle
}

export interface SectionStyle {
  background: string // Color sólido, gradiente o 'image'
  backgroundImage?: string
  textColor: string
  accentColor: string
  padding?: string
  width?: '1600px' | '1200px' | '100%'
  displayFont?: string
  titleSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'display'
  subtitleSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  textAlign?: 'left' | 'center'
  radius?: '0px' | '4px' | '8px' | '12px' | '16px' | '24px'
  hideTitle?: boolean
  hideSubtitle?: boolean
  hideDescription?: boolean
  hideSectionNumber?: boolean
  hideEyebrow?: boolean
  hidePageCounter?: boolean
}


// Data structures for core sections
export interface CoverData {
  eyebrow: string
  title: string
  subtitle: string
  titleSize: 'xl' | 'xxl' | 'display'
  layout: 'left' | 'centered'
  decorElements: boolean
  decorType?: 'glow' | 'grid' | 'dots' | 'brutalist-star' | 'retro-shape' | 'abstract-wave' | 'isometric-cube' | 'crosses' | 'stripes' | 'noise-overlay'
  pageCounter?: string
}

export interface OverviewData {
  sectionNumber: string
  title: string
  contextText: string
  metrics: Array<{
    label: string
    value: string
  }>
}

export interface ProblemData {
  sectionNumber: string
  title: string
  description: string
  image: string
  layout: 'left-image' | 'right-image'
}

export interface ProcessData {
  sectionNumber: string
  title: string
  steps: Array<{
    title: string
    description: string
    icon: string // Lucide icon name
  }>
}

export interface ColorPaletteData {
  sectionNumber: string
  title: string
  colors: Array<{
    name: string
    hex: string
    role: string
  }>
  layout: 'grid' | 'horizontal-strip'
}

export interface TypographyData {
  sectionNumber: string
  title: string
  fonts: Array<{
    name: string
    sample: string
    role: string
  }>
}

export interface MockupsData {
  sectionNumber: string
  title: string
  description?: string
  mockups: Array<{
    image: string
    alt: string
    deviceFrame: 'phone' | 'tablet' | 'browser' | 'none'
    scrollOffset?: number
  }>
  layout: 'grid-2' | 'grid-3' | 'grid-4' | 'scattered' | 'centered-large'
}

export interface UXFlowData {
  sectionNumber: string
  title: string
  description?: string
  image: string
}

export interface ResultsData {
  sectionNumber: string
  title: string
  description: string
  metrics: Array<{
    label: string
    value: string
  }>
}

export interface FooterData {
  authorName: string
  authorRole: string
  year: string
  socialLinks: Array<{
    platform: string
    url: string
  }>
}
