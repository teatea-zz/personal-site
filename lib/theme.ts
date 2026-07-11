// ── 사이트 테마 전환 ─────────────────────────────────────────────
// 'dark'로 바꾸면 기존 다크 모드(배경 애니메이션 포함) 전체 복원
export type ThemeMode = 'light' | 'dark'
export const MODE = 'light' as ThemeMode

// 배경 앰비언트 비주얼 (GradientBackground + BreathVisual 1~4 + grain)
// 다크 모드 전용 — 라이트에서는 렌더하지 않음
export const AMBIENT_VISUALS = MODE === 'dark'

// 다크 팔레트 (기존 값 그대로 보존)
const dark = {
  pageBg: '#0c0c0c',
  heading: '#f6f6f3',
  text: '#f4f4f1',
  textStrong: '#eee',
  textBody: 'rgba(244,244,241,.82)',
  textDim: 'rgba(244,244,241,.66)',
  textMuted: 'rgba(244,244,241,.52)',
  textFaint: 'rgba(244,244,241,.45)',
  textGhost: 'rgba(244,244,241,.38)',
  hairline: 'rgba(255,255,255,.1)',
  hairlineStrong: 'rgba(255,255,255,.14)',
  btnBorder: 'rgba(255,255,255,.22)',
  cardBg: 'rgba(15,15,15,.6)',
  cardBorder: 'rgba(255,255,255,.12)',
  cardShadow: '0 34px 90px -34px rgba(0,0,0,.75)',
  sheetBg: 'rgba(12,12,12,.9)',
  sheetBorder: 'rgba(255,255,255,.14)',
  sheetShadow: '0 -34px 100px -20px rgba(0,0,0,.85)',
  socialBg: 'rgba(15,15,15,.72)',
  socialFg: 'rgba(244,244,241,.72)',
  imgWell: '#1a1a1a',
  statCellBg: '#101010',
  statGridBg: 'rgba(255,255,255,.12)',
  // 홈카드 (다크: 유리 질감 그대로)
  heroBg: 'rgba(15,15,15,.6)',
  heroBorder: 'rgba(255,255,255,.12)',
  heroShadow: '0 34px 90px -34px rgba(0,0,0,.75)',
  heroHeading: '#f6f6f3',
  heroText: '#f4f4f1',
  heroTextDim: 'rgba(244,244,241,.66)',
  heroMeta: 'rgba(244,244,241,.5)',
  heroGhost: 'rgba(244,244,241,.36)',
  heroHairline: 'rgba(255,255,255,.1)',
  heroBtnBorder: 'rgba(255,255,255,.22)',
  heroBtnText: '#f4f4f1',
}

// 라이트 팔레트 (어드민 Lite Mode 기반 — BG #FDFBF7 / INK #231F1A)
const light: typeof dark = {
  pageBg: '#FDFBF7',
  heading: '#231F1A',
  text: '#231F1A',
  textStrong: '#231F1A',
  textBody: 'rgba(35,31,26,.82)',
  textDim: 'rgba(35,31,26,.62)',
  textMuted: 'rgba(35,31,26,.52)',
  textFaint: 'rgba(35,31,26,.45)',
  textGhost: 'rgba(35,31,26,.38)',
  hairline: 'rgba(35,31,26,.1)',
  hairlineStrong: 'rgba(35,31,26,.14)',
  btnBorder: 'rgba(35,31,26,.22)',
  cardBg: 'rgba(255,255,255,.72)',
  cardBorder: 'rgba(35,31,26,.1)',
  cardShadow: '0 24px 70px -34px rgba(35,31,26,.22)',
  sheetBg: 'rgba(253,251,247,.94)',
  sheetBorder: 'rgba(35,31,26,.12)',
  sheetShadow: '0 -24px 80px -30px rgba(35,31,26,.28)',
  socialBg: '#FEFDFB',
  socialFg: 'rgba(35,31,26,.62)',
  imgWell: 'rgba(35,31,26,.06)',
  statCellBg: '#FFFFFF',
  statGridBg: 'rgba(35,31,26,.12)',
  // 홈카드 (라이트: 화이트 카드 + INK 텍스트, 그림자 없이 테두리만 — 소셜바와 동일한 룩)
  heroBg: '#FEFDFB',
  heroBorder: 'rgba(35,31,26,.14)',
  heroShadow: 'none',
  heroHeading: '#231F1A',
  heroText: '#231F1A',
  heroTextDim: 'rgba(35,31,26,.62)',
  heroMeta: 'rgba(35,31,26,.52)',
  heroGhost: 'rgba(35,31,26,.38)',
  heroHairline: 'rgba(35,31,26,.1)',
  heroBtnBorder: 'rgba(35,31,26,.22)',
  heroBtnText: '#231F1A',
}

export const T = MODE === 'dark' ? dark : light
