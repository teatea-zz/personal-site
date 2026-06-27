'use client'

import { useEffect, useRef } from 'react'

// ── 호흡 상수 (GradientBackground / BreathVisual과 동일) ───────────
const BREATH = { INHALE: 7000, HOLD: 2000, EXHALE: 9000, TOTAL: 18000 }

// 배 전용 단순 호흡 (BreathVisual과 동일)
function getBreath(ts: number): number {
  const t = ts % BREATH.TOTAL
  if (t < BREATH.INHALE) return Math.sin((t / BREATH.INHALE) * (Math.PI / 2))
  if (t < BREATH.INHALE + BREATH.HOLD) return 1.0
  const et = (t - BREATH.INHALE - BREATH.HOLD) / BREATH.EXHALE
  return Math.sin((0.5 + et * 0.5) * Math.PI)
}

// streak tip / tail (BreathVisual과 동일)
function getStreakProgress(ts: number): { tipT: number; tailT: number } {
  const t = ts % BREATH.TOTAL
  const effectiveInhale = BREATH.INHALE  // delay 없음

  if (t < effectiveInhale) {
    const p = 1 - Math.cos((t / effectiveInhale) * (Math.PI / 2))
    return { tipT: p, tailT: 0 }
  }
  if (t < BREATH.INHALE + BREATH.HOLD) {
    return { tipT: 1, tailT: 0 }
  }
  const et = (t - BREATH.INHALE - BREATH.HOLD) / BREATH.EXHALE
  const p = Math.sin((0.5 + et * 0.5) * Math.PI)
  return { tipT: p, tailT: 0 }
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

// ── 빛줄기 정의 (60개) ───────────────────────────────────────────────
// 기존 BreathVisual 60개 사이 빈 공간에 인터리브
// 기존: t = i/59 → 새: t = (i+0.5)/59 → 각도가 기존 streak 중간값
// maxLen: 0.15 ~ 0.60 (화면 2/3 이하, 변화폭 4배로 팬 모양 방지)
const STREAKS2 = Array.from({ length: 60 }, (_, i) => {
  const t      = (i + 0.5) / 59                           // 기존 streak 사이 중간 각도
  const angle  = -Math.PI * (0.95 - t * 0.90)
  const maxLen = 0.15 + ((i * 53 + 23) % 46) / 100       // 0.15 ~ 0.60
  const alpha  = 0.30 + ((i * 37 + 13) % 35) / 100       // 0.30 ~ 0.64
  const phase  = ((i * 97) % 40) / 100                    // 0.00 ~ 0.39
  return {
    angle,
    phase,
    colorIdx: i % 4,
    maxLen,
    alpha,
    dashes: randDashes(40),
  }
})

export default function BreathVisual2() {
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

      for (const s of STREAKS2) {
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

        const baseAlpha = s.alpha * Math.min(1, visible * 4) * (0.3 + brightnessB * 0.7)

        // 전반 75%: 랜덤 대시
        ctx.save()
        ctx.lineWidth = 1
        ctx.lineCap   = 'round'
        ctx.setLineDash([])

        let d  = tailDist
        let di = 0
        while (d < dashEnd) {
          const dashLen = s.dashes[di % s.dashes.length]
          const dEnd    = Math.min(d + dashLen, dashEnd)

          const tPos  = (d - tailDist) / segLen
          const alpha = baseAlpha * Math.min(1, tPos * 3 + 0.2)

          ctx.beginPath()
          ctx.moveTo(ox + cos * d,    oy + sin * d)
          ctx.lineTo(ox + cos * dEnd, oy + sin * dEnd)
          ctx.strokeStyle = `rgba(${r},${g},${bl},${alpha})`
          ctx.stroke()

          d  += dashLen + GAP
          di ++
        }
        ctx.restore()

        // 후반 25%: 솔리드 페이드
        const sx = ox + cos * dashEnd
        const sy = oy + sin * dashEnd
        const ex = ox + cos * solidEnd
        const ey = oy + sin * solidEnd

        const lineGrad = ctx.createLinearGradient(sx, sy, ex, ey)
        lineGrad.addColorStop(0, `rgba(${r},${g},${bl},${baseAlpha})`)
        lineGrad.addColorStop(1, `rgba(${r},${g},${bl},0)`)

        ctx.save()
        ctx.lineWidth   = 1
        ctx.lineCap     = 'round'
        ctx.strokeStyle = lineGrad
        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.lineTo(ex, ey)
        ctx.stroke()
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
      id="breath-visual-2"
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
