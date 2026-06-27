'use client'

import { useEffect, useRef } from 'react'

// ── 호흡 상수 (GradientBackground / BreathVisual과 동일) ───────────
const BREATH = { INHALE: 7000, HOLD: 2000, EXHALE: 9000, TOTAL: 18000 }

function getBreath(ts: number): number {
  const t = ts % BREATH.TOTAL
  if (t < BREATH.INHALE) return Math.sin((t / BREATH.INHALE) * (Math.PI / 2))
  if (t < BREATH.INHALE + BREATH.HOLD) return 1.0
  const et = (t - BREATH.INHALE - BREATH.HOLD) / BREATH.EXHALE
  return Math.sin((0.5 + et * 0.5) * Math.PI)
}

function getStreakProgress(ts: number): { tipT: number; tailT: number } {
  const t = ts % BREATH.TOTAL
  if (t < BREATH.INHALE) {
    const p = 1 - Math.cos((t / BREATH.INHALE) * (Math.PI / 2))
    return { tipT: p, tailT: 0 }
  }
  if (t < BREATH.INHALE + BREATH.HOLD) return { tipT: 1, tailT: 0 }
  const et = (t - BREATH.INHALE - BREATH.HOLD) / BREATH.EXHALE
  return { tipT: Math.sin((0.5 + et * 0.5) * Math.PI), tailT: 0 }
}

const COLORS: [number, number, number][] = [
  [255, 255, 255],
  [255, 240, 180],
  [224, 239, 179],
  [255, 200, 175],
]

const DASH_SIZES = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29]
function randDashes(count: number): number[] {
  return Array.from({ length: count }, () =>
    DASH_SIZES[Math.floor(Math.random() * DASH_SIZES.length)]
  )
}

// ── 빛줄기 정의 (60개) ─────────────────────────────────────────────
// t = (i+0.75)/59 → BV2(0.5), BV1(1.0) 사이 3/4 지점 채움
// maxLen / alpha / phase: BV2, BV3과 다른 해시 상수
const STREAKS4 = Array.from({ length: 60 }, (_, i) => {
  const t      = (i + 0.75) / 59
  const angle  = -Math.PI * (0.95 - t * 0.90)
  const maxLen = 0.10 + ((i * 71 + 19) % 48) / 100       // 0.10 ~ 0.58
  const alpha  = 0.22 + ((i * 59 + 23) % 32) / 100       // 0.22 ~ 0.54
  const phase  = ((i * 79) % 40) / 100
  return { angle, phase, colorIdx: (i + 2) % 4, maxLen, alpha, dashes: randDashes(40) }
})

export default function BreathVisual4() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = 0, H = 0
    let rafId: number

    const resize = () => {
      W = canvas.width  = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    const originX = () => W * 0.5
    const originY = () => H + H * 0.05

    const draw = (ts: number) => {
      ctx.clearRect(0, 0, W, H)

      const ox  = originX()
      const oy  = originY()
      const ref = Math.min(W, H)
      const GAP = 5

      for (const s of STREAKS4) {
        const { tipT, tailT } = getStreakProgress(ts)
        const visible = tipT - tailT
        if (visible < 0.01) continue

        const maxLen   = s.maxLen * ref
        const tailDist = tailT * maxLen
        const tipDist  = tipT  * maxLen
        const segLen   = tipDist - tailDist
        if (segLen < 2) continue

        const [r, g, bl] = COLORS[s.colorIdx]
        const cos = Math.cos(s.angle)
        const sin = Math.sin(s.angle)

        const brightnessB = getBreath(ts + s.phase * BREATH.TOTAL)
        const dashEnd     = tailDist + segLen * 0.75
        const solidEnd    = tipDist
        const baseAlpha   = s.alpha * Math.min(1, visible * 4) * (0.3 + brightnessB * 0.7)

        ctx.save()
        ctx.lineWidth = 1
        ctx.lineCap   = 'round'
        ctx.setLineDash([])

        let d = tailDist, di = 0
        while (d < dashEnd) {
          const dashLen = s.dashes[di % s.dashes.length]
          const dEnd    = Math.min(d + dashLen, dashEnd)
          const tPos    = (d - tailDist) / segLen
          ctx.beginPath()
          ctx.moveTo(ox + cos * d,    oy + sin * d)
          ctx.lineTo(ox + cos * dEnd, oy + sin * dEnd)
          ctx.strokeStyle = `rgba(${r},${g},${bl},${baseAlpha * Math.min(1, tPos * 3 + 0.2)})`
          ctx.stroke()
          d += dashLen + GAP; di++
        }
        ctx.restore()

        const sx = ox + cos * dashEnd, sy = oy + sin * dashEnd
        const ex = ox + cos * solidEnd, ey = oy + sin * solidEnd
        const lineGrad = ctx.createLinearGradient(sx, sy, ex, ey)
        lineGrad.addColorStop(0, `rgba(${r},${g},${bl},${baseAlpha})`)
        lineGrad.addColorStop(1, `rgba(${r},${g},${bl},0)`)

        ctx.save()
        ctx.lineWidth = 1; ctx.lineCap = 'round'; ctx.strokeStyle = lineGrad
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke()
        ctx.restore()
      }

      rafId = requestAnimationFrame(draw)
    }

    rafId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      id="breath-visual-4"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        mixBlendMode: 'overlay',
        zIndex: 1,
      }}
    />
  )
}
