import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { STLLoader }  from 'three/examples/jsm/loaders/STLLoader.js'
import { FBXLoader }  from 'three/examples/jsm/loaders/FBXLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

function getExt(url) {
  return url.split('?')[0].split('.').pop().toLowerCase()
}

// Center the object at the origin and position the camera to frame it.
function fitToView(object, camera, controls) {
  const box = new THREE.Box3().setFromObject(object)
  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)

  object.position.sub(center)

  const fitDist = maxDim / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)))
  const camDist = fitDist * 1.6
  camera.position.set(camDist * 0.6, camDist * 0.35, camDist)
  camera.near = maxDim * 0.005
  camera.far  = maxDim * 100
  camera.updateProjectionMatrix()
  camera.lookAt(0, 0, 0)

  controls.target.set(0, 0, 0)
  controls.minDistance = maxDim * 0.2
  controls.maxDistance = maxDim * 8
  controls.update()
}

export default function ModelRenderer({ data }) {
  const mountRef = useRef(null)
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const [hint, setHint] = useState(true)

  useEffect(() => {
    if (!data?.url || !mountRef.current) return
    const el = mountRef.current
    setStatus('loading')
    setHint(true)

    // ── Scene ────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x07030f)

    // ── Camera ───────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.001, 2000)

    // ── Renderer ─────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    renderer.outputColorSpace = THREE.SRGBColorSpace
    el.appendChild(renderer.domElement)

    // ── Environment (soft room lighting — makes materials look good) ─────────
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    pmrem.dispose()

    // ── Fill lights ──────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.4))
    const key = new THREE.DirectionalLight(0xffffff, 1.0)
    key.position.set(4, 8, 6)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0xb08fff, 0.25)
    rim.position.set(-6, -2, -4)
    scene.add(rim)

    // ── Controls ─────────────────────────────────────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.8
    controls.screenSpacePanning = false

    const stopAutoRotate = () => { controls.autoRotate = false; setHint(false) }
    controls.addEventListener('start', stopAutoRotate)

    // ── Load model (format-aware) ─────────────────────────────────────────────
    const onError = () => setStatus('error')
    const ext = getExt(data.url)

    if (ext === 'stl') {
      new STLLoader().load(data.url, (geometry) => {
        geometry.computeVertexNormals()
        const mesh = new THREE.Mesh(
          geometry,
          new THREE.MeshStandardMaterial({ color: 0xc5d2e0, metalness: 0.25, roughness: 0.5 }),
        )
        fitToView(mesh, camera, controls)
        scene.add(mesh)
        setStatus('ready')
      }, undefined, onError)

    } else if (ext === 'fbx') {
      new FBXLoader().load(data.url, (object) => {
        fitToView(object, camera, controls)
        scene.add(object)
        setStatus('ready')
      }, undefined, onError)

    } else {
      // GLB / GLTF (default)
      new GLTFLoader().load(data.url, (gltf) => {
        fitToView(gltf.scene, camera, controls)
        scene.add(gltf.scene)
        setStatus('ready')
      }, undefined, onError)
    }

    // ── Render loop ──────────────────────────────────────────────────────────
    let animId
    const tick = () => {
      animId = requestAnimationFrame(tick)
      controls.update()
      renderer.render(scene, camera)
    }
    tick()

    // ── Resize ───────────────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      if (!el) return
      camera.aspect = el.clientWidth / el.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(el.clientWidth, el.clientHeight)
    })
    ro.observe(el)

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
      controls.removeEventListener('start', stopAutoRotate)
      controls.dispose()
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [data?.url])

  if (!data?.url) return null

  return (
    <figure style={{ margin: 0 }}>
      <div style={{
        position: 'relative',
        width: '100%',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #2a1f45',
        backgroundColor: '#07030f',
        userSelect: 'none',
      }}>
        {/* Three.js canvas target */}
        <div ref={mountRef} style={{ width: '100%', height: '480px', display: 'block' }} />

        {/* Loading spinner */}
        {status === 'loading' && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '0.85rem', backgroundColor: '#07030f',
          }}>
            <div style={{
              width: '28px', height: '28px',
              borderRadius: '50%',
              border: '1px solid #2a1f45',
              borderTopColor: '#b08fff',
              animation: 'spin 0.8s linear infinite',
            }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: '#7a6898', letterSpacing: '0.08em' }}>
              Loading model…
            </span>
          </div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '0.5rem', backgroundColor: '#07030f',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7a6898" strokeWidth="1.3">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4M12 16h.01" strokeLinecap="round"/>
            </svg>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#7a6898' }}>
              Failed to load model
            </span>
          </div>
        )}

        {/* Interaction hint — fades out after first drag */}
        {status === 'ready' && hint && (
          <div style={{
            position: 'absolute', bottom: '0.75rem', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', alignItems: 'center', gap: '0.85rem',
            padding: '0.35rem 0.85rem',
            backgroundColor: 'rgba(7,3,15,0.65)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(176,143,255,0.15)',
            borderRadius: '999px',
            pointerEvents: 'none',
          }}>
            <HintItem icon={<DragIcon />} label="Drag to rotate" />
            <div style={{ width: '1px', height: '12px', backgroundColor: 'rgba(176,143,255,0.15)' }} />
            <HintItem icon={<ScrollIcon />} label="Scroll to zoom" />
          </div>
        )}
      </div>

      {data?.caption && (
        <figcaption style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.72rem',
          color: '#7a6898',
          marginTop: '0.5rem',
          lineHeight: 1.5,
        }}>
          {data.caption}
        </figcaption>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </figure>
  )
}

function HintItem({ icon, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
      <span style={{ color: '#7a6898', display: 'flex' }}>{icon}</span>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.62rem', color: '#7a6898', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </div>
  )
}

function DragIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
      <circle cx="6" cy="6" r="4.5"/>
      <path d="M6 3.5v5M3.5 6h5"/>
    </svg>
  )
}

function ScrollIcon() {
  return (
    <svg width="10" height="13" viewBox="0 0 10 13" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
      <rect x="1" y="1" width="8" height="11" rx="4"/>
      <path d="M5 3.5v3"/>
    </svg>
  )
}
