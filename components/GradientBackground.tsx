'use client'

import { useEffect, useRef } from 'react'

type RGB = [number, number, number]

// 18초 호흡 사이클
const BREATH = { INHALE: 7000, HOLD: 2000, EXHALE: 9000, TOTAL: 18000 }

// 하단 중앙에서 위로 퍼지는 타원 레이어 (outermost → innermost)
const LAYERS: { rx: number; ry: number; maxAlpha: number }[] = [
  { rx: 1.10, ry: 1.05, maxAlpha: 0.85 },
  { rx: 0.85, ry: 0.80, maxAlpha: 0.85 },
  { rx: 0.60, ry: 0.58, maxAlpha: 0.85 },
  { rx: 0.38, ry: 0.36, maxAlpha: 1.0 },
]

// 팔레트: [BG, layer0, layer1, layer2, layer3]
// 리니어 그라디언트 100%→0% 역순 매핑 (innermost=밝음/하단, outermost=어둠/상단)
const PALETTE: RGB[] = [
  [18,  16,  25],    // BG — #121019
  [9,   31,  52],    // 최외각 — #091F34
  [43,  57,  80],    // #2B3950
  [232, 139, 101],   // 웜 피치-오렌지
  [243, 213, 179],   // #F3D5B3 크림-샌드 (지평선)
]

const FADE = 0.62

function toRgb([r, g, b]: RGB) { return `rgb(${r},${g},${b})` }
function toRgba([r, g, b]: RGB, a: number) { return `rgba(${r},${g},${b},${a})` }

function getBreath(ts: number): number {
  const t = ts % BREATH.TOTAL
  if (t < BREATH.INHALE) {
    return Math.sin((t / BREATH.INHALE) * (Math.PI / 2))
  } else if (t < BREATH.INHALE + BREATH.HOLD) {
    return 1.0
  } else {
    const et = (t - BREATH.INHALE - BREATH.HOLD) / BREATH.EXHALE
    return Math.sin((0.5 + et * 0.5) * Math.PI)
  }
}

export default function GradientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = 0, H = 0, rafId: number

    const resize = () => {
      W = canvas.width = canvas.offsetWidth * 0.5
      H = canvas.height = canvas.offsetHeight * 0.5
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    const draw = (ts: number) => {
      const breath = getBreath(ts)
      const scale = breath * 1.15
      const alpha = Math.min(1.0, breath * 1.4)

      // BG 채우기
      ctx.fillStyle = toRgb(PALETTE[0])
      ctx.fillRect(0, 0, W, H)

      if (scale > 0.001) {
        const cx = W * 0.5
        const cy = H + H * 0.05

        LAYERS.forEach((layer, i) => {
          const color = PALETTE[i + 1]
          const rx = W * layer.rx * scale
          const ry = H * layer.ry * scale
          const a = alpha * layer.maxAlpha

          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, ry)
          grad.addColorStop(0, toRgba(color, a))
          grad.addColorStop(FADE, toRgba(color, a * 0.5))
          grad.addColorStop(1, toRgba(color, 0))

          ctx.save()
          ctx.translate(cx, cy)
          ctx.scale(rx / ry, 1)
          ctx.translate(-cx, -cy)
          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.arc(cx, cy, ry, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        })
      }

      rafId = requestAnimationFrame(draw)
    }

    rafId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])

  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        backdropFilter: 'blur(60px)',
        WebkitBackdropFilter: 'blur(60px)',
        pointerEvents: 'none',
      }} />
    </div>
  )
}
