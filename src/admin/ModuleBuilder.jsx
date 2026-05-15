import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { MODULE_DEFS } from '../modules/moduleTypes.jsx'
import ModuleRenderer from '../modules/ModuleRenderer.jsx'

import TextEditor       from '../modules/text/TextEditor.jsx'
import VideoEditor      from '../modules/video/VideoEditor.jsx'
import StoryboardEditor from '../modules/storyboard/StoryboardEditor.jsx'
import ImageEditor      from '../modules/image/ImageEditor.jsx'
import CarouselEditor   from '../modules/carousel/CarouselEditor.jsx'
import ModelEditor      from '../modules/model/ModelEditor.jsx'

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

function ModuleCard({ module: mod, index, total, onUpdate, onRemove, onMove, token }) {
  const [view, setView] = useState('edit')
  const def = MODULE_DEFS.find(d => d.type === mod.type)

  const tabBtn = (label, active) => ({
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.65rem',
    letterSpacing: '0.06em',
    color: active ? '#b08fff' : '#352848',
    borderBottom: active ? '1px solid #b08fff' : '1px solid transparent',
    paddingBottom: '1px',
    marginBottom: '-1px',
  })

  return (
    <div style={{ backgroundColor: '#08101a', border: '1px solid #2a1f45', borderRadius: '7px', overflow: 'hidden', marginBottom: '0.6rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.85rem', borderBottom: '1px solid #160f24', backgroundColor: '#0a1420' }}>
        <span style={{ color: '#7a6898', display: 'flex', alignItems: 'center', flexShrink: 0 }}>{def?.icon}</span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7a6898', flex: 1 }}>
          {def?.label}
        </span>

        {/* Edit / Preview toggle */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', borderRight: '1px solid #2a1f45', paddingRight: '0.75rem', marginRight: '0.25rem' }}>
          <button type="button" onClick={() => setView('edit')} style={tabBtn('Edit', view === 'edit')}>Edit</button>
          <button type="button" onClick={() => setView('preview')} style={tabBtn('Preview', view === 'preview')}>Preview</button>
        </div>

        {/* Move / remove */}
        <button type="button" onClick={() => onMove(-1)} disabled={index === 0}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#352848', padding: '2px 4px', fontSize: '11px', opacity: index === 0 ? 0.3 : 1 }}>↑</button>
        <button type="button" onClick={() => onMove(1)} disabled={index === total - 1}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#352848', padding: '2px 4px', fontSize: '11px', opacity: index === total - 1 ? 0.3 : 1 }}>↓</button>
        <button type="button" onClick={onRemove}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2a1520', padding: '2px 5px', fontSize: '11px', marginLeft: '2px' }}
          onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
          onMouseLeave={e => e.currentTarget.style.color = '#2a1520'}>
          ✕
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '0.85rem' }}>
        {view === 'edit' ? (
          <>
            {mod.type === 'text'       && <TextEditor       data={mod.data} onChange={onUpdate} />}
            {mod.type === 'video'      && <VideoEditor      data={mod.data} onChange={onUpdate} token={token} />}
            {mod.type === 'storyboard' && <StoryboardEditor data={mod.data} onChange={onUpdate} token={token} />}
            {mod.type === 'image'      && <ImageEditor      data={mod.data} onChange={onUpdate} token={token} />}
            {mod.type === 'carousel'   && <CarouselEditor   data={mod.data} onChange={onUpdate} token={token} />}
            {mod.type === 'model'      && <ModelEditor      data={mod.data} onChange={onUpdate} token={token} />}
          </>
        ) : (
          /* Preview — renders exactly as it appears on the public page */
          <div style={{ backgroundColor: '#050308', borderRadius: '5px', border: '1px solid #160f24', padding: '1.25rem', minHeight: '60px' }}>
            {(() => {
              const hasContent = mod.type === 'text' ? mod.data?.text
                : mod.type === 'video' ? mod.data?.url
                : mod.type === 'storyboard' ? mod.data?.frames?.length
                : mod.type === 'image' ? mod.data?.url
                : mod.type === 'carousel' ? mod.data?.slides?.length
                : mod.type === 'model' ? mod.data?.url
                : false
              return hasContent
                ? <ModuleRenderer module={mod} />
                : <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#352848', textAlign: 'center', padding: '1rem 0' }}>Add content in Edit mode to see a preview</div>
            })()}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ModuleBuilder({ modules, onChange, token }) {
  const [picking, setPicking] = useState(false)
  const [pickerRect, setPickerRect] = useState(null)
  const buttonRef = useRef(null)

  const calcRect = (r) => {
    const gap = 6
    const spaceBelow = window.innerHeight - r.bottom - gap
    const spaceAbove = r.top - gap
    const preferBelow = spaceBelow >= spaceAbove
    return preferBelow
      ? { top: r.bottom + gap, left: r.left, width: r.width, maxH: Math.max(spaceBelow - 8, 120) }
      : { bottom: window.innerHeight - r.top + gap, left: r.left, width: r.width, maxH: Math.max(spaceAbove - 8, 120) }
  }

  const openPicker = () => {
    if (buttonRef.current) setPickerRect(calcRect(buttonRef.current.getBoundingClientRect()))
    setPicking(true)
  }

  useEffect(() => {
    if (!picking) return
    const reposition = () => {
      if (!buttonRef.current) return
      setPickerRect(calcRect(buttonRef.current.getBoundingClientRect()))
    }
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [picking])

  const add = (type) => {
    const def = MODULE_DEFS.find(d => d.type === type)
    onChange([...modules, { id: newId(), type, data: { ...def.defaultData } }])
    setPicking(false)
  }

  const update = (id, data) => onChange(modules.map(m => m.id === id ? { ...m, data } : m))
  const remove = (id) => onChange(modules.filter(m => m.id !== id))
  const move = (idx, dir) => {
    const arr = [...modules]
    const tgt = idx + dir
    if (tgt < 0 || tgt >= arr.length) return
    ;[arr[idx], arr[tgt]] = [arr[tgt], arr[idx]]
    onChange(arr)
  }

  return (
    <div>
      {modules.map((mod, i) => (
        <ModuleCard
          key={mod.id}
          module={mod}
          index={i}
          total={modules.length}
          onUpdate={data => update(mod.id, data)}
          onRemove={() => remove(mod.id)}
          onMove={dir => move(i, dir)}
          token={token}
        />
      ))}

      {/* Add block */}
      <div>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => picking ? setPicking(false) : openPicker()}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center',
            width: '100%', padding: '0.55rem 1rem',
            background: 'transparent',
            border: '1px dashed #2a1f45',
            borderRadius: '6px',
            color: '#7a6898',
            fontFamily: "'Inter', sans-serif", fontSize: '0.75rem',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#b08fff'; e.currentTarget.style.color = '#b08fff' }}
          onMouseLeave={e => { if (!picking) { e.currentTarget.style.borderColor = '#2a1f45'; e.currentTarget.style.color = '#7a6898' } }}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor"><rect x="4.5" y="0" width="2" height="11"/><rect x="0" y="4.5" width="11" height="2"/></svg>
          Add block
        </button>

        {picking && pickerRect && createPortal(
          <>
            <div onClick={() => setPicking(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000 }} />
            <div style={{
              position: 'fixed',
              ...(pickerRect.top != null ? { top: pickerRect.top } : { bottom: pickerRect.bottom }),
              left: pickerRect.left,
              width: pickerRect.width,
              maxHeight: pickerRect.maxH,
              overflowY: 'auto',
              zIndex: 1001,
              backgroundColor: '#0a1420', border: '1px solid #2a1f45', borderRadius: '8px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            }}>
              {MODULE_DEFS.map((def, i) => (
                <button key={def.type} type="button" onClick={() => add(def.type)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', width: '100%', padding: '0.75rem 1rem', background: 'none', border: 'none', borderTop: i > 0 ? '1px solid #160f24' : 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(176,143,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{ color: '#7a6898', display: 'flex', flexShrink: 0 }}>{def.icon}</span>
                  <div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', fontWeight: 500, color: '#e2e8f0' }}>{def.label}</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', color: '#7a6898', marginTop: '0.1rem' }}>{def.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </>,
          document.body
        )}
      </div>
    </div>
  )
}
