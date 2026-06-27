'use client'

import { useEffect, useRef } from 'react'

// ── 호흡 상수 (GradientBackground와 동일한 18초 사이클) ──────────
const BREATH = { INHALE: 7000, HOLD: 2000, EXHALE: 9000, TOTAL: 18000 }

// 배경보다 빛줄기가 늦게 시작하는 딜레이 (ms)
const STREAK_DELAY = 0

// 배 전용 단순 호흡 0→1→0
function getBreath(ts: number): number {
  const t = ts % BREATH.TOTAL
  if (t < BREATH.INHALE) return Math.sin((t / BREATH.INHALE) * (Math.PI / 2))
  if (t < BREATH.INHALE + BREATH.HOLD) return 1.0
  const et = (t - BREATH.INHALE - BREATH.HOLD) / BREATH.EXHALE
  return Math.sin((0.5 + et * 0.5) * Math.PI)
}

// 호흡 단계별 streak tip / tail 위치 반환
// 사이클 시작 후 STREAK_DELAY ms 동안 정지, 이후 압축된 inhale 구간에서 성장
// exhale: tip 고정, tail이 바깥쪽으로 이동 → 원점부터 사라짐
function getStreakProgress(ts: number): { tipT: number; tailT: number } {
  const t = ts % BREATH.TOTAL

  // 딜레이 구간: 빛줄기 없음
  if (t < STREAK_DELAY) return { tipT: 0, tailT: 0 }

  const td = t - STREAK_DELAY
  const effectiveInhale = BREATH.INHALE - STREAK_DELAY  // 5500ms

  if (td < effectiveInhale) {
    const p = 1 - Math.cos((td / effectiveInhale) * (Math.PI / 2))  // ease-in: 천천히 시작
    return { tipT: p, tailT: 0 }
  }
  if (td < effectiveInhale + BREATH.HOLD) {
    return { tipT: 1, tailT: 0 }
  }
  // 날숨: tip이 원점 쪽으로 수축, 꼬리는 원점에 고정
  const et = (td - effectiveInhale - BREATH.HOLD) / BREATH.EXHALE
  const p = Math.sin((0.5 + et * 0.5) * Math.PI)  // 1→0
  return { tipT: p, tailT: 0 }
}

// ── 빛줄기 색상 (white / warm yellow / beige / peach) ────────────
const COLORS: [number, number, number][] = [
  [255, 255, 255],
  [255, 240, 180],
  [224, 239, 179],
  [255, 200, 175],
]

// ── 랜덤 대시 생성 ────────────────────────────────────────────────
const DASH_SIZES = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29]
function randDashes(count: number): number[] {
  return Array.from({ length: count }, () =>
    DASH_SIZES[Math.floor(Math.random() * DASH_SIZES.length)]
  )
}

// ── 빛줄기 정의 (60개, -0.95π ~ -0.05π 범위, 불규칙 길이/밝기) ──────
// 결정론적 의사난수 (index 기반, 매 로드마다 동일한 패턴)
const STREAKS = Array.from({ length: 60 }, (_, i) => {
  const t      = i / 59
  const angle  = -Math.PI * (0.95 - t * 0.90)         // -0.95π → -0.05π
  const maxLen = 0.20 + ((i * 41 + 17) % 57) / 100    // 0.20 ~ 0.76
  const alpha  = 0.35 + ((i * 29 + 11) % 31) / 100    // 0.35 ~ 0.65
  const phase  = ((i * 137) % 40) / 100                // 0.00 ~ 0.39
  return {
    angle,
    phase,
    colorIdx: i % 4,
    maxLen,
    alpha,
    dashes: randDashes(40),
  }
})

// ── 종이배 정의 (원형 플레이스홀더 — SVG 교체 예정, 총 5개) ───────
// 모두 동일한 breath(ts)로 동기화 — 빛줄기와 함께 원점에서 동시에 출발
// angle은 streak 각도 범위(-0.95π~-0.05π) 내 랜덤 배치
// 배 정의 — entryAt: 등장 시작(ms), emergeDur: 원점에서 퍼지는 시간(ms)
// 고정 목표 위치 없음 — 원점에서 퍼지면서 동시에 drift 시작 (단일 연속 공식)
const BOATS = [
  { angle: -Math.PI * 0.83, spread: 0.42, rockPhase: 0.0, entryAt: 1000, emergeDur: 5000, driftSx: 0.00029, driftSy: 0.00021, driftPx: 0.0, driftPy: 1.1 },
  { angle: -Math.PI * 0.63, spread: 0.48, rockPhase: 1.4, entryAt: 2000, emergeDur: 5000, driftSx: 0.00017, driftSy: 0.00033, driftPx: 2.3, driftPy: 0.7 },
  { angle: -Math.PI * 0.50, spread: 0.44, rockPhase: 2.8, entryAt:    0, emergeDur: 7000, driftSx: 0.00037, driftSy: 0.00019, driftPx: 4.1, driftPy: 3.2 },
  { angle: -Math.PI * 0.33, spread: 0.46, rockPhase: 4.2, entryAt: 3000, emergeDur: 4000, driftSx: 0.00023, driftSy: 0.00041, driftPx: 1.5, driftPy: 5.0 },
  { angle: -Math.PI * 0.16, spread: 0.40, rockPhase: 5.6, entryAt: 5000, emergeDur: 2000, driftSx: 0.00041, driftSy: 0.00027, driftPx: 3.7, driftPy: 2.4 },
]

const BOAT_R     = 16      // 플레이스홀더 원 반지름 (px)
const ROCK_SPEED = 0.0007  // 출렁임 각속도
const DRIFT_R    = 0.18    // drift 반경 (ref 배수), 1080px 기준 약 194px
const ALPHA_FADE = 1500    // 페이드인 기간 (ms)

export default function BreathVisual() {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const firstTsRef   = useRef(0)         // 첫 프레임 타임스탬프
  const boatAngles   = useRef<number[]>([]) // 페이지 로드마다 랜덤 각도

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 팬 범위 내 층화 샘플링: 5구역 → 각 구역에서 랜덤 픽 → 셔플
    // 매 마운트마다 배가 다른 방향으로 등장
    const FAN_MIN = -Math.PI * 0.92
    const FAN_MAX = -Math.PI * 0.08
    const secSize = (FAN_MAX - FAN_MIN) / BOATS.length
    const angles  = Array.from({ length: BOATS.length }, (_, i) =>
      FAN_MIN + i * secSize + Math.random() * secSize
    )
    for (let i = angles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [angles[i], angles[j]] = [angles[j], angles[i]]
    }
    boatAngles.current = angles

    let W = 0, H = 0
    let rafId: number

    const resize = () => {
      W = canvas.width  = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    // 배경과 동일한 기점: 하단 중앙
    const originX = () => W * 0.5
    const originY = () => H + H * 0.05

    const draw = (ts: number) => {
      ctx.clearRect(0, 0, W, H)

      const ox = originX()
      const oy = originY()
      const ref = Math.min(W, H)

      // ── 빛줄기 ─────────────────────────────────────────────────
      const GAP = 5   // 대시 간격 고정

      for (const s of STREAKS) {
        // 성장은 배경 그라디언트와 완전히 동기화 (phase 없음)
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

        // 밝기 stagger: phase는 alpha에만 적용
        const brightnessB = getBreath(ts + s.phase * BREATH.TOTAL)
        const dashEnd  = tailDist + segLen * 0.75   // 대시: tail ~ 75%
        const solidEnd = tipDist                     // 솔리드: 75% ~ tip

        // alpha: 길이 기반 + 밝기 stagger
        const baseAlpha = s.alpha * Math.min(1, visible * 4) * (0.3 + brightnessB * 0.7)

        // 전반 75%: 랜덤 길이 대시 세그먼트
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

        // 후반 25%: 솔리드 → tip 향해 페이드아웃
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

      // ── 종이배 플레이스홀더 ────────────────────────────────────
      // 고정 목표 위치 없음 — 단일 연속 공식으로 프레임 튀김 구조적 차단
      //   spreadT: 원점 → 퍼짐 반경 (sine ease-out, emergeDur 동안)
      //   driftT:  drift 진폭을 0에서 서서히 증가 (등장과 동시에 시작)
      //   alpha:   페이드인 (ALPHA_FADE 동안)
      if (firstTsRef.current === 0) firstTsRef.current = ts
      const elapsed   = ts - firstTsRef.current
      const driftR    = DRIFT_R * ref
      const breathNow = getBreath(ts)

      for (let i = 0; i < BOATS.length; i++) {
        const boat  = BOATS[i]
        const angle = boatAngles.current[i] ?? boat.angle  // 랜덤 각도 (없으면 기본값)

        if (elapsed < boat.entryAt) continue
        const ee = elapsed - boat.entryAt

        // 퍼짐: 원점에서 spread 중심까지 (sine ease-out)
        const spreadT = Math.min(1, Math.sin(Math.min(ee, boat.emergeDur) / boat.emergeDur * (Math.PI / 2)))
        const cx = ox + Math.cos(angle) * boat.spread * ref * spreadT
        const cy = oy + Math.sin(angle) * boat.spread * ref * spreadT

        // drift: emergeDur의 70% 시점에 최대 진폭 도달
        const driftT = Math.min(1, ee / (boat.emergeDur * 0.7))
        const driftX = Math.sin(ts * boat.driftSx + boat.driftPx) * driftR * driftT
        const driftY = Math.cos(ts * boat.driftSy + boat.driftPy) * driftR * 0.65 * driftT

        // 미세 출렁임 (additive, 일관성 있음)
        const rock = Math.sin(ts * ROCK_SPEED + boat.rockPhase) * 0.06
        const bx   = cx + driftX + Math.cos(rock) * BOAT_R * 0.3
        const by   = cy + driftY + Math.sin(rock) * BOAT_R * 0.3

        // 페이드인 + 호흡 밝기
        const fadeIn = Math.min(1, ee / ALPHA_FADE)
        const alpha  = fadeIn * (0.35 + breathNow * 0.15)

        // 원형 플레이스홀더 (SVG 교체 시 이 블록만 변경)
        ctx.save()
        ctx.beginPath()
        ctx.arc(bx, by, BOAT_R, 0, Math.PI * 2)
        ctx.fillStyle   = `rgba(255,245,230,${alpha})`
        ctx.fill()
        ctx.strokeStyle = `rgba(255,230,205,${alpha * 1.8})`
        ctx.lineWidth   = 1.2
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
      id="breath-visual-1"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        mixBlendMode: 'soft-light',
        zIndex: 1,
      }}
    />
  )
}
