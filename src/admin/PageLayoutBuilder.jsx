import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { MODULE_DEFS } from '../modules/moduleTypes.jsx'
import ModuleRenderer from '../modules/ModuleRenderer.jsx'
import TextEditor        from '../modules/text/TextEditor.jsx'
import VideoEditor       from '../modules/video/VideoEditor.jsx'
import StoryboardEditor  from '../modules/storyboard/StoryboardEditor.jsx'
import ImageEditor       from '../modules/image/ImageEditor.jsx'
import CarouselEditor    from '../modules/carousel/CarouselEditor.jsx'
import ModelEditor       from '../modules/model/ModelEditor.jsx'
import BeforeAfterEditor from '../modules/before-after/BeforeAfterEditor.jsx'
import StatsEditor       from '../modules/stats/StatsEditor.jsx'
import EmbedEditor       from '../modules/embed/EmbedEditor.jsx'

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

const GripIcon = () => (
  <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
    <circle cx="3" cy="2.5"  r="1.2"/><circle cx="7" cy="2.5"  r="1.2"/>
    <circle cx="3" cy="7"    r="1.2"/><circle cx="7" cy="7"    r="1.2"/>
    <circle cx="3" cy="11.5" r="1.2"/><circle cx="7" cy="11.5" r="1.2"/>
  </svg>
)

const EyeIcon = ({ on }) => on ? (
  <svg width="14" height="14" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
    <path d="M1 5s2.5-4 6-4 6 4 6 4-2.5 4-6 4S1 5 1 5z"/>
    <circle cx="7" cy="5" r="1.5" fill="currentColor" stroke="none"/>
  </svg>
) : (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
    <path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4S1 7 1 7z"/>
    <circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none" opacity="0.35"/>
    <path d="M2.5 2.5l9 9"/>
  </svg>
)

// ── Native / structural section card ─────────────────────────────────────────

function NativeSectionCard({ section, nativeDef, onToggleVisible, onRemove, onDragStart, onDragEnd }) {
  const isVisible = section.visible !== false
  const cardRef   = useRef(null)
  const enableDrag  = () => cardRef.current?.setAttribute('draggable', 'true')
  const disableDrag = () => cardRef.current?.removeAttribute('draggable')

  return (
    <div
      ref={cardRef}
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart() }}
      onDragEnd={() => { disableDrag(); onDragEnd() }}
      style={{
        backgroundColor: '#09070f',
        border: `1px dashed ${isVisible ? '#3a2850' : '#221630'}`,
        borderRadius: '7px',
        marginBottom: '0.6rem',
        opacity: isVisible ? 1 : 0.45,
        transition: 'opacity 0.15s, border-color 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.85rem' }}>
        <div
          onMouseDown={enableDrag} onMouseUp={disableDrag}
          title="Drag to reorder"
          style={{ cursor: 'grab', color: '#4a3860', display: 'flex', alignItems: 'center', flexShrink: 0, padding: '0 2px', marginLeft: '-4px' }}
          onMouseEnter={e => e.currentTarget.style.color = '#9a88b8'}
          onMouseLeave={e => e.currentTarget.style.color = '#4a3860'}
        >
          <GripIcon />
        </div>

        <span style={{ color: isVisible ? '#7060a0' : '#4a3860', display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'color 0.15s' }}>
          {nativeDef?.icon}
        </span>

        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.73rem', color: isVisible ? '#9a78c8' : '#5a4878', flex: 1, fontWeight: 500, transition: 'color 0.15s' }}>
          {nativeDef?.label ?? section.type}
        </span>

        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: '0.58rem',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: '#7a6898', padding: '0.15rem 0.5rem',
          border: '1px solid #3a2850', borderRadius: '999px',
        }}>
          structure
        </span>

        {/* Visibility toggle */}
        <button
          type="button"
          onClick={onToggleVisible}
          title={isVisible ? 'Hide from page' : 'Show on page'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: isVisible ? '#9a88b8' : '#4a3860', display: 'flex', padding: '2px 4px', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#c0a8f0'}
          onMouseLeave={e => e.currentTarget.style.color = isVisible ? '#9a88b8' : '#4a3860'}
        >
          <EyeIcon on={isVisible} />
        </button>

        <button
          type="button" onClick={onRemove}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3a2040', padding: '2px 5px', fontSize: '11px' }}
          onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
          onMouseLeave={e => e.currentTarget.style.color = '#3a2040'}
        >✕</button>
      </div>
    </div>
  )
}

// ── Module content card ───────────────────────────────────────────────────────

function ModuleCard({ module: mod, onUpdate, onRemove, onToggleVisible, token, onDragStart, onDragEnd }) {
  const [view, setView]   = useState('edit')
  const isVisible         = mod.visible !== false
  const def               = MODULE_DEFS.find(d => d.type === mod.type)
  const cardRef           = useRef(null)
  const enableDrag  = () => cardRef.current?.setAttribute('draggable', 'true')
  const disableDrag = () => cardRef.current?.removeAttribute('draggable')

  const tabBtn = (active) => ({
    background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', letterSpacing: '0.06em',
    color: active ? '#b08fff' : '#7a6898',
    borderBottom: active ? '1px solid #b08fff' : '1px solid transparent',
    paddingBottom: '1px', marginBottom: '-1px',
  })

  return (
    <div
      ref={cardRef}
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart() }}
      onDragEnd={() => { disableDrag(); onDragEnd() }}
      style={{
        backgroundColor: '#08101a',
        border: `1px solid ${isVisible ? '#2a1f45' : '#1a1530'}`,
        borderRadius: '7px',
        overflow: 'hidden',
        marginBottom: '0.6rem',
        opacity: isVisible ? 1 : 0.45,
        transition: 'opacity 0.15s, border-color 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.85rem', borderBottom: '1px solid #160f24', backgroundColor: '#0a1420' }}>
        <div
          onMouseDown={enableDrag} onMouseUp={disableDrag}
          title="Drag to reorder"
          style={{ cursor: 'grab', color: '#5a4878', display: 'flex', alignItems: 'center', flexShrink: 0, padding: '0 2px', marginLeft: '-4px' }}
          onMouseEnter={e => e.currentTarget.style.color = '#a090bc'}
          onMouseLeave={e => e.currentTarget.style.color = '#5a4878'}
        >
          <GripIcon />
        </div>

        <span style={{ color: '#a090bc', display: 'flex', alignItems: 'center', flexShrink: 0 }}>{def?.icon}</span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a090bc', flex: 1 }}>{def?.label}</span>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', borderRight: '1px solid #2a1f45', paddingRight: '0.75rem', marginRight: '0.25rem' }}>
          <button type="button" onClick={() => setView('edit')}    style={tabBtn(view === 'edit')}>Edit</button>
          <button type="button" onClick={() => setView('preview')} style={tabBtn(view === 'preview')}>Preview</button>
        </div>

        {/* Visibility toggle */}
        <button
          type="button"
          onClick={onToggleVisible}
          title={isVisible ? 'Hide from page' : 'Show on page'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: isVisible ? '#9a88b8' : '#4a3860', display: 'flex', padding: '2px 4px', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#c0a8f0'}
          onMouseLeave={e => e.currentTarget.style.color = isVisible ? '#9a88b8' : '#4a3860'}
        >
          <EyeIcon on={isVisible} />
        </button>

        <button type="button" onClick={onRemove}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3a2040', padding: '2px 5px', fontSize: '11px' }}
          onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
          onMouseLeave={e => e.currentTarget.style.color = '#3a2040'}>✕</button>
      </div>

      <div style={{ padding: '0.85rem' }}>
        {view === 'edit' ? (
          <>
            {mod.type === 'text'         && <TextEditor        data={mod.data} onChange={onUpdate} />}
            {mod.type === 'video'        && <VideoEditor       data={mod.data} onChange={onUpdate} token={token} />}
            {mod.type === 'storyboard'   && <StoryboardEditor  data={mod.data} onChange={onUpdate} token={token} />}
            {mod.type === 'image'        && <ImageEditor       data={mod.data} onChange={onUpdate} token={token} />}
            {mod.type === 'carousel'     && <CarouselEditor    data={mod.data} onChange={onUpdate} token={token} />}
            {mod.type === 'model'        && <ModelEditor       data={mod.data} onChange={onUpdate} token={token} />}
            {mod.type === 'before-after' && <BeforeAfterEditor data={mod.data} onChange={onUpdate} token={token} />}
            {mod.type === 'stats'        && <StatsEditor       data={mod.data} onChange={onUpdate} />}
            {mod.type === 'embed'        && <EmbedEditor       data={mod.data} onChange={onUpdate} />}
          </>
        ) : (
          <div style={{ backgroundColor: '#050308', borderRadius: '5px', border: '1px solid #160f24', padding: '1.25rem', minHeight: '60px' }}>
            {(() => {
              const hasContent =
                mod.type === 'text'         ? mod.data?.text :
                mod.type === 'video'        ? mod.data?.url :
                mod.type === 'storyboard'   ? mod.data?.frames?.length :
                mod.type === 'image'        ? mod.data?.url :
                mod.type === 'carousel'     ? mod.data?.slides?.length :
                mod.type === 'model'        ? mod.data?.url :
                mod.type === 'before-after' ? (mod.data?.before?.url || mod.data?.after?.url) :
                mod.type === 'stats'        ? mod.data?.stats?.some(s => s.label || s.value) :
                mod.type === 'embed'        ? mod.data?.url : false
              return hasContent
                ? <ModuleRenderer module={mod} />
                : <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#7a6898', textAlign: 'center', padding: '1rem 0' }}>Add content in Edit mode to see a preview</div>
            })()}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PageLayoutBuilder({ sections, onChange, nativeTypes = [], token }) {
  const [dragFrom, setDragFrom] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const [picking,  setPicking]  = useState(false)
  const [pickerRect, setPickerRect] = useState(null)
  const buttonRef = useRef(null)

  const handleDrop = useCallback((toIdx) => {
    if (dragFrom === null || dragFrom === toIdx) { setDragFrom(null); setDragOver(null); return }
    const arr = [...sections]
    const [item] = arr.splice(dragFrom, 1)
    arr.splice(toIdx, 0, item)
    onChange(arr)
    setDragFrom(null)
    setDragOver(null)
  }, [dragFrom, sections, onChange])

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

  const addNative = (type) => {
    onChange([...sections, { id: newId(), type }])
    setPicking(false)
  }
  const addModule = (type) => {
    const def = MODULE_DEFS.find(d => d.type === type)
    onChange([...sections, { id: newId(), type, data: { ...def.defaultData } }])
    setPicking(false)
  }
  const remove        = (id)       => onChange(sections.filter(s => s.id !== id))
  const updateModule  = (id, data) => onChange(sections.map(s => s.id === id ? { ...s, data } : s))
  const toggleVisible = (id)       => onChange(sections.map(s => s.id === id ? { ...s, visible: s.visible === false ? undefined : false } : s))

  const presentNatives = new Set(sections.filter(s => s.type.startsWith('native:')).map(s => s.type))
  const removedNatives  = nativeTypes.filter(n => !presentNatives.has(n.type))

  return (
    <div>
      {sections.map((section, i) => {
        const isNative = section.type.startsWith('native:')
        return (
          <div
            key={section.id}
            onDragOver={(e) => { e.preventDefault(); setDragOver(i) }}
            onDragLeave={() => setDragOver(null)}
            onDrop={() => handleDrop(i)}
            style={{
              opacity: dragFrom === i ? 0.35 : 1,
              outline: dragOver === i && dragFrom !== i ? '2px solid rgba(176,143,255,0.45)' : '2px solid transparent',
              borderRadius: '8px',
              transition: 'opacity 0.15s, outline 0.1s',
            }}
          >
            {isNative ? (
              <NativeSectionCard
                section={section}
                nativeDef={nativeTypes.find(n => n.type === section.type)}
                onToggleVisible={() => toggleVisible(section.id)}
                onRemove={() => remove(section.id)}
                onDragStart={() => setDragFrom(i)}
                onDragEnd={() => { setDragFrom(null); setDragOver(null) }}
              />
            ) : (
              <ModuleCard
                module={section}
                onUpdate={data => updateModule(section.id, data)}
                onRemove={() => remove(section.id)}
                onToggleVisible={() => toggleVisible(section.id)}
                token={token}
                onDragStart={() => setDragFrom(i)}
                onDragEnd={() => { setDragFrom(null); setDragOver(null) }}
              />
            )}
          </div>
        )
      })}

      {/* Add block */}
      <div>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => picking ? setPicking(false) : openPicker()}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center',
            width: '100%', padding: '0.55rem 1rem',
            background: 'transparent', border: '1px dashed #3a2850', borderRadius: '6px',
            color: '#a090bc', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#b08fff'; e.currentTarget.style.color = '#b08fff' }}
          onMouseLeave={e => { if (!picking) { e.currentTarget.style.borderColor = '#3a2850'; e.currentTarget.style.color = '#a090bc' } }}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
            <rect x="4.5" y="0" width="2" height="11"/>
            <rect x="0" y="4.5" width="11" height="2"/>
          </svg>
          Add block
        </button>

        {picking && pickerRect && createPortal(
          <>
            <div onClick={() => setPicking(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000 }} />
            <div style={{
              position: 'fixed',
              ...(pickerRect.top != null ? { top: pickerRect.top } : { bottom: pickerRect.bottom }),
              left: pickerRect.left, width: pickerRect.width,
              maxHeight: pickerRect.maxH, overflowY: 'auto',
              zIndex: 1001,
              backgroundColor: '#0a1420', border: '1px solid #2a1f45', borderRadius: '8px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            }}>
              {removedNatives.length > 0 && (
                <>
                  <div style={{ padding: '0.55rem 1rem 0.2rem', fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7a6898' }}>
                    Page Structure
                  </div>
                  {removedNatives.map(n => (
                    <button key={n.type} type="button" onClick={() => addNative(n.type)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', width: '100%', padding: '0.65rem 1rem', background: 'none', border: 'none', borderTop: '1px solid #160f24', cursor: 'pointer', textAlign: 'left' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(176,143,255,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <span style={{ color: '#7060a0', display: 'flex', flexShrink: 0 }}>{n.icon}</span>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', fontWeight: 500, color: '#9a78c8' }}>{n.label}</div>
                    </button>
                  ))}
                  <div style={{ borderTop: '1px solid #2a1f45', margin: '0.25rem 0' }} />
                </>
              )}

              <div style={{ padding: '0.55rem 1rem 0.2rem', fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7a6898' }}>
                Content Blocks
              </div>
              {MODULE_DEFS.map(def => (
                <button key={def.type} type="button" onClick={() => addModule(def.type)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', width: '100%', padding: '0.75rem 1rem', background: 'none', border: 'none', borderTop: '1px solid #160f24', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(176,143,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{ color: '#a090bc', display: 'flex', flexShrink: 0 }}>{def.icon}</span>
                  <div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', fontWeight: 500, color: '#e2e8f0' }}>{def.label}</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', color: '#9a88b8', marginTop: '0.1rem' }}>{def.description}</div>
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
