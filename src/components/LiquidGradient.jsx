import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// ─── Purple/lilac color palette — muted, dim (linear RGB 0–1) ───────────────
const C1 = [0.310, 0.245, 0.460]   // desaturated lilac
const C2 = [0.160, 0.055, 0.320]   // dim deep violet
const C3 = [0.200, 0.090, 0.380]   // muted purple
const C4 = [0.280, 0.180, 0.400]   // soft lilac
const C5 = [0.110, 0.040, 0.220]   // near-black violet
const C6 = [0.220, 0.140, 0.390]   // medium muted purple
const BASE = [0.024, 0.020, 0.035] // #060509  site background

const VERT = `
  varying vec2 vUv;
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vUv = uv;
  }
`

const FRAG = `
  uniform float uTime;
  uniform vec2  uResolution;
  uniform vec3  uC1, uC2, uC3, uC4, uC5, uC6;
  uniform float uSpeed, uIntensity, uGrainAmt, uRadius;
  uniform vec3  uBase;
  uniform sampler2D uTouch;
  varying vec2 vUv;

  #define PI 3.14159265359

  float grain(vec2 uv, float t) {
    vec2 g = uv * uResolution * 0.5;
    return fract(sin(dot(g + t, vec2(12.9898, 78.233))) * 43758.5453) * 2.0 - 1.0;
  }

  float blob(vec2 uv, vec2 center) {
    return 1.0 - smoothstep(0.0, uRadius, length(uv - center));
  }

  vec3 gradient(vec2 uv, float t) {
    float s = uSpeed;

    // Nine animated blob centers
    vec2 c1 = vec2(0.5 + sin(t*s*0.40)*0.42, 0.5 + cos(t*s*0.50)*0.40);
    vec2 c2 = vec2(0.5 + cos(t*s*0.60)*0.45, 0.5 + sin(t*s*0.45)*0.48);
    vec2 c3 = vec2(0.5 + sin(t*s*0.35)*0.40, 0.5 + cos(t*s*0.55)*0.42);
    vec2 c4 = vec2(0.5 + cos(t*s*0.50)*0.38, 0.5 + sin(t*s*0.40)*0.36);
    vec2 c5 = vec2(0.5 + sin(t*s*0.70)*0.35, 0.5 + cos(t*s*0.60)*0.32);
    vec2 c6 = vec2(0.5 + cos(t*s*0.45)*0.44, 0.5 + sin(t*s*0.65)*0.46);
    vec2 c7 = vec2(0.5 + sin(t*s*0.55)*0.36, 0.5 + cos(t*s*0.48)*0.40);
    vec2 c8 = vec2(0.5 + cos(t*s*0.65)*0.34, 0.5 + sin(t*s*0.52)*0.38);
    vec2 c9 = vec2(0.5 + sin(t*s*0.42)*0.39, 0.5 + cos(t*s*0.58)*0.37);

    vec3 col = vec3(0.0);
    col += uC1 * blob(uv, c1) * (0.5 + 0.5*sin(t*s));
    col += uC2 * blob(uv, c2) * (0.5 + 0.5*cos(t*s*1.2));
    col += uC3 * blob(uv, c3) * (0.5 + 0.5*sin(t*s*0.8));
    col += uC4 * blob(uv, c4) * (0.5 + 0.5*cos(t*s*1.3));
    col += uC5 * blob(uv, c5) * (0.5 + 0.5*sin(t*s*1.1));
    col += uC6 * blob(uv, c6) * (0.5 + 0.5*cos(t*s*0.9));
    col += uC1 * blob(uv, c7) * (0.5 + 0.5*sin(t*s*1.4));
    col += uC3 * blob(uv, c8) * (0.5 + 0.5*cos(t*s*0.7));
    col += uC5 * blob(uv, c9) * (0.5 + 0.5*sin(t*s*1.6));

    // Slow rotating radial overlay
    vec2 rv = uv - 0.5;
    float ang = t * s * 0.10;
    rv = vec2(rv.x*cos(ang) - rv.y*sin(ang), rv.x*sin(ang) + rv.y*cos(ang)) + 0.5;
    col += mix(uC1, uC3, 0.5) * (1.0 - smoothstep(0.0, 0.7, length(rv - 0.5))) * 0.3;

    col = clamp(col, 0.0, 1.0) * uIntensity;

    // Slight desaturation for muted look
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(lum), col, 0.80);
    col = pow(col, vec3(1.10));

    // Blend toward dark base in low-intensity areas
    float br = length(col);
    col = mix(uBase, col, clamp(br * 1.6, 0.0, 1.0));

    return clamp(col, 0.0, 1.0);
  }

  void main() {
    vec2 uv = vUv;

    // Touch / mouse distortion
    vec4 touch = texture2D(uTouch, uv);
    float vx = -(touch.r * 2.0 - 1.0);
    float vy = -(touch.g * 2.0 - 1.0);
    float intensity = touch.b;
    uv.x += vx * 0.55 * intensity;
    uv.y += vy * 0.55 * intensity;

    // Ripple from touch
    float dist = length(uv - 0.5);
    float ripple = sin(dist * 18.0 - uTime * 2.5) * 0.03 * intensity;
    uv += vec2(ripple);

    vec3 col = gradient(uv, uTime);

    // Film grain
    col += grain(uv, uTime) * uGrainAmt;

    // Subtle hue drift
    col.r += sin(uTime * 0.28) * 0.010;
    col.b += cos(uTime * 0.36) * 0.012;

    // Final dark base blend
    float br2 = length(col);
    col = mix(uBase, col, clamp(br2 * 1.6, 0.0, 1.0));

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }
`

export default function LiquidGradient() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // ─── Touch texture (tracks mouse trail) ──────────────────────────────────
    const SIZE = 64
    const MAX_AGE = 80
    const RADIUS = 0.25 * SIZE
    const SPEED = 1 / MAX_AGE
    let trail = []
    let lastTouch = null

    const touchCanvas = document.createElement('canvas')
    touchCanvas.width = touchCanvas.height = SIZE
    const tctx = touchCanvas.getContext('2d')
    tctx.fillStyle = 'black'
    tctx.fillRect(0, 0, SIZE, SIZE)
    const touchTex = new THREE.Texture(touchCanvas)

    function updateTouch() {
      tctx.fillStyle = 'black'
      tctx.fillRect(0, 0, SIZE, SIZE)
      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i]
        const f = p.force * SPEED * (1 - p.age / MAX_AGE)
        p.x += p.vx * f; p.y += p.vy * f; p.age++
        if (p.age > MAX_AGE) { trail.splice(i, 1); continue }
        const px = p.x * SIZE, py = (1 - p.y) * SIZE
        let intens = p.age < MAX_AGE * 0.3
          ? Math.sin((p.age / (MAX_AGE * 0.3)) * (Math.PI / 2))
          : (() => { const t = 1 - (p.age - MAX_AGE * 0.3) / (MAX_AGE * 0.7); return -t * (t - 2) })()
        intens *= p.force
        const col = `${((p.vx + 1) / 2) * 255},${((p.vy + 1) / 2) * 255},${intens * 255}`
        const off = SIZE * 5
        tctx.shadowOffsetX = off; tctx.shadowOffsetY = off
        tctx.shadowBlur = RADIUS
        tctx.shadowColor = `rgba(${col},${0.2 * intens})`
        tctx.beginPath(); tctx.fillStyle = 'rgba(255,0,0,1)'
        tctx.arc(px - off, py - off, RADIUS, 0, Math.PI * 2); tctx.fill()
      }
      touchTex.needsUpdate = true
    }

    function addTouch(x, y) {
      let force = 0, vx = 0, vy = 0
      if (lastTouch) {
        const dx = x - lastTouch.x, dy = y - lastTouch.y
        if (dx === 0 && dy === 0) return
        const d = Math.sqrt(dx * dx + dy * dy)
        vx = dx / d; vy = dy / d
        force = Math.min((dx * dx + dy * dy) * 20000, 2.0)
      }
      lastTouch = { x, y }
      trail.push({ x, y, age: 0, force, vx, vy })
    }

    // ─── Three.js setup ───────────────────────────────────────────────────────
    const isMobile = navigator.maxTouchPoints > 0 && window.innerWidth < 1024

    const renderer = new THREE.WebGLRenderer({
      antialias: false, alpha: false, stencil: false, depth: false,
      powerPreference: 'high-performance',
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.0 : 1.5))
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x060509)
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000)
    camera.position.z = 50
    const clock = new THREE.Clock()

    const getViewSize = () => {
      const fovRad = (camera.fov * Math.PI) / 180
      const h = Math.abs(camera.position.z * Math.tan(fovRad / 2) * 2)
      return { width: h * camera.aspect, height: h }
    }

    const { width, height } = getViewSize()
    const geo = new THREE.PlaneGeometry(width, height, 1, 1)

    const uniforms = {
      uTime:       { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uC1:         { value: new THREE.Vector3(...C1) },
      uC2:         { value: new THREE.Vector3(...C2) },
      uC3:         { value: new THREE.Vector3(...C3) },
      uC4:         { value: new THREE.Vector3(...C4) },
      uC5:         { value: new THREE.Vector3(...C5) },
      uC6:         { value: new THREE.Vector3(...C6) },
      uBase:       { value: new THREE.Vector3(...BASE) },
      uSpeed:      { value: 0.28 },
      uIntensity:  { value: 0.85 },
      uGrainAmt:   { value: isMobile ? 0.055 : 0.110 },
      uRadius:     { value: 0.52 },
      uTouch:      { value: touchTex },
    }

    const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG })
    const mesh = new THREE.Mesh(geo, mat)
    scene.add(mesh)

    // ─── Loop ─────────────────────────────────────────────────────────────────
    const FRAME_BUDGET = isMobile ? 1000 / 30 : 0
    let rafId, lastRenderTime = 0
    let orientationActive = false
    let autoT = 0

    const tick = () => {
      rafId = requestAnimationFrame(tick)
      const delta = Math.min(clock.getDelta(), 0.05)
      uniforms.uTime.value += delta

      // Auto-animation fallback when gyroscope hasn't fired yet
      if (isMobile && !orientationActive) {
        autoT += delta * 0.35
        addTouch(
          0.5 + Math.sin(autoT * 1.3) * 0.38,
          0.5 + Math.sin(autoT * 0.8) * 0.32,
        )
      }

      if (FRAME_BUDGET) {
        const now = performance.now()
        if (now - lastRenderTime < FRAME_BUDGET) return
        lastRenderTime = now
      }
      updateTouch()
      renderer.render(scene, camera)
    }
    tick()

    // ─── Events ───────────────────────────────────────────────────────────────
    const onMouse = (e) => addTouch(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight)
    const onTouch = (e) => { const t = e.touches[0]; onMouse({ clientX: t.clientX, clientY: t.clientY }) }
    const onResize = () => {
      const w = window.innerWidth, h = window.innerHeight
      camera.aspect = w / h; camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      uniforms.uResolution.value.set(w, h)
      const vs = getViewSize()
      mesh.geometry.dispose()
      mesh.geometry = new THREE.PlaneGeometry(vs.width, vs.height, 1, 1)
    }

    // ─── Gyroscope (mobile) ───────────────────────────────────────────────────
    let onOrientationHandler = null
    if (isMobile) {
      const onOrientation = (e) => {
        if (e.gamma === null || e.beta === null) return
        orientationActive = true
        // gamma: left/right tilt (-90..90), beta: front/back tilt (0..90 when upright)
        const x = Math.max(0, Math.min(1, (e.gamma + 45) / 90))
        const y = Math.max(0, Math.min(1, 1 - (e.beta - 30) / 60))
        addTouch(x, y)
      }
      onOrientationHandler = onOrientation

      const tryOrientation = () => {
        if (typeof DeviceOrientationEvent !== 'undefined' &&
            typeof DeviceOrientationEvent.requestPermission === 'function') {
          // iOS 13+ requires a user-gesture permission request
          DeviceOrientationEvent.requestPermission()
            .then(state => { if (state === 'granted') window.addEventListener('deviceorientation', onOrientation) })
            .catch(() => {})
        } else {
          window.addEventListener('deviceorientation', onOrientation)
        }
      }

      tryOrientation()
      // Re-try on first touch in case iOS blocked the initial request
      window.addEventListener('touchstart', tryOrientation, { once: true })
    }

    window.addEventListener('mousemove', onMouse)
    window.addEventListener('touchmove', onTouch, { passive: true })
    window.addEventListener('resize', onResize)

    // ─── Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('resize', onResize)
      if (onOrientationHandler) window.removeEventListener('deviceorientation', onOrientationHandler)
      touchTex.dispose()
      mesh.geometry.dispose()
      mat.dispose()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', opacity: 0.2 }}
    />
  )
}
