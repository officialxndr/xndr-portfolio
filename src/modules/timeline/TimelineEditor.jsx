import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { MODULE_DEFS } from '../moduleTypes.jsx'

import TextEditor        from '../text/TextEditor.jsx'
import VideoEditor       from '../video/VideoEditor.jsx'
import StoryboardEditor  from '../storyboard/StoryboardEditor.jsx'
import ImageEditor       from '../image/ImageEditor.jsx'
import CarouselEditor    from '../carousel/CarouselEditor.jsx'
import ModelEditor       from '../model/ModelEditor.jsx'
import BeforeAfterEditor from '../before-after/BeforeAfterEditor.jsx'
import StatsEditor       from '../stats/StatsEditor.jsx'
import EmbedEditor       from '../embed/EmbedEditor.jsx'

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
const newStep = () => ({ id: newId(), label: '', date: '', title: '', modules: [] })

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '0.38rem 0.55rem',
  backgroundColor: '#060509',
  border: '1px solid #2a1f45',
  borderRadius: '5px',
  color: '#e2e8f0',
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.78rem',
  outline: 'none',
}

const labelStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.6rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#7a6898',
  marginBottom: '0.25rem',
}

// Editors that can be nested inside a timeline step (no recursive timelines)
const NESTED_DEFS = MODULE_DEFS.filter(d => d.type !== 'timeline')

// ─── Nested module editor (compact card inside a step) ───────────────────────

function NestedModuleCard({ mod, onUpdate, onRemove, token }) {
  const [open, setOpen] = useState(true)
  const def = MODULE_DEFS.find(d => d.type === mod.type)

  return (
    <div style={{ border: '1px solid #1a1230', borderRadius: '6px', overflow: 'hidden', marginBottom: '0.4rem' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.38rem 0.65rem',
        backgroundColor: '#0a0612',
        borderBottom: open ? '1px solid #160f24' : 'none',
      }}>
        <span style={{ color: '#7a6898', display: 'flex', flexShrink: 0 }}>{def?.icon}</span>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: '0.63rem',
          letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7a6898', flex: 1,
        }}>
          {def?.label}
        </span>
        <button type="button" onClick={() => setOpen(o => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a3f5c', fontSize: '9px', padding: '2px 4px' }}>
          {open ? '▲' : '▼'}
        </button>
        <button type="button" onClick={onRemove}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2a1520', fontSize: '11px', padding: '2px 4px' }}
          onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
          onMouseLeave={e => e.currentTarget.style.color = '#2a1520'}>
          ✕
        </button>
      </div>

      {open && (
        <div style={{ padding: '0.7rem' }}>
          {mod.type === 'text'         && <TextEditor        data={mod.data} onChange={onUpdate} />}
          {mod.type === 'video'        && <VideoEditor       data={mod.data} onChange={onUpdate} token={token} />}
          {mod.type === 'storyboard'   && <StoryboardEditor  data={mod.data} onChange={onUpdate} token={token} />}
          {mod.type === 'image'        && <ImageEditor       data={mod.data} onChange={onUpdate} token={token} />}
          {mod.type === 'carousel'     && <CarouselEditor    data={mod.data} onChange={onUpdate} token={token} />}
          {mod.type === 'model'        && <ModelEditor       data={mod.data} onChange={onUpdate} token={token} />}
          {mod.type === 'before-after' && <BeforeAfterEditor data={mod.data} onChange={onUpdate} token={token} />}
          {mod.type === 'stats'        && <StatsEditor       data={mod.data} onChange={onUpdate} />}
          {mod.type === 'embed'        && <EmbedEditor       data={mod.data} onChange={onUpdate} />}
        </div>
      )}
    </div>
  )
}

// ─── Module picker + list for a single step ──────────────────────────────────

function StepModuleList({ modules, onChange, token }) {
  const [picking, setPicking] = useState(false)
  const [pickerPos, setPickerPos] = useState(null)
  const btnRef = useRef(null)

  const openPicker = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPickerPos({ top: r.bottom + 4, left: r.left, width: Math.max(r.width, 220) })
    }
    setPicking(true)
  }

  const add = (type) => {
    const def = NESTED_DEFS.find(d => d.type === type)
    onChange([...modules, { id: newId(), type, data: { ...def.defaultData } }])
    setPicking(false)
  }

  const update = (id, data) => onChange(modules.map(m => m.id === id ? { ...m, data } : m))
  const remove = (id) => onChange(modules.filter(m => m.id !== id))

  return (
    <div>
      {modules.map(mod => (
        <NestedModuleCard
          key={mod.id}
          mod={mod}
          onUpdate={data => update(mod.id, data)}
          onRemove={() => remove(mod.id)}
          token={token}
        />
      ))}

      <button
        ref={btnRef}
        type="button"
        onClick={() => picking ? setPicking(false) : openPicker()}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          width: '100%', padding: '0.35rem 0.65rem',
          background: 'transparent',
          border: '1px dashed #1a1230',
          borderRadius: '5px',
          color: '#7a6898',
          fontFamily: "'Inter', sans-serif", fontSize: '0.68rem',
          cursor: 'pointer', transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#b08fff'; e.currentTarget.style.color = '#b08fff' }}
        onMouseLeave={e => { if (!picking) { e.currentTarget.style.borderColor = '#1a1230'; e.currentTarget.style.color = '#7a6898' } }}
      >
        <svg width="9" height="9" viewBox="0 0 11 11" fill="currentColor">
          <rect x="4.5" y="0" width="2" height="11"/><rect x="0" y="4.5" width="11" height="2"/>
        </svg>
        Add module
      </button>

      {picking && pickerPos && createPortal(
        <>
          <div onClick={() => setPicking(false)} style={{ position: 'fixed', inset: 0, zIndex: 2000 }} />
          <div style={{
            position: 'fixed',
            top: pickerPos.top, left: pickerPos.left,
            width: pickerPos.width, maxHeight: 300,
            overflowY: 'auto', zIndex: 2001,
            backgroundColor: '#0a1420', border: '1px solid #2a1f45', borderRadius: '7px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          }}>
            {NESTED_DEFS.map((def, i) => (
              <button key={def.type} type="button" onClick={() => add(def.type)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.7rem',
                  width: '100%', padding: '0.6rem 0.9rem',
                  background: 'none', border: 'none',
                  borderTop: i > 0 ? '1px solid #160f24' : 'none',
                  cursor: 'pointer', textAlign: 'left',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(176,143,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span style={{ color: '#a090bc', display: 'flex', flexShrink: 0 }}>{def.icon}</span>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.73rem', fontWeight: 500, color: '#e2e8f0' }}>
                  {def.label}
                </div>
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </div>
  )
}

// ─── Single step editor card ─────────────────────────────────────────────────

function StepCard({ step, index, total, onChange, onRemove, onMove, token }) {
  const [open, setOpen] = useState(true)

  const set = (key, val) => onChange({ ...step, [key]: val })

  return (
    <div style={{ border: '1px solid #2a1f45', borderRadius: '7px', overflow: 'hidden', marginBottom: '0.5rem' }}>
      {/* header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.45rem 0.8rem',
        backgroundColor: '#0a1420',
        borderBottom: open ? '1px solid #160f24' : 'none',
      }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.6rem', color: '#a090bc', letterSpacing: '0.08em', minWidth: '22px' }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: '#e2e8f0',
          flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {step.title || step.label || 'Untitled step'}
        </span>

        <button type="button" disabled={index === 0} onClick={() => onMove(-1)}
          style={{ background: 'none', border: 'none', cursor: index === 0 ? 'default' : 'pointer', color: index === 0 ? '#1a1230' : '#7a6898', fontSize: '9px', padding: '2px 3px' }}>▲</button>
        <button type="button" disabled={index === total - 1} onClick={() => onMove(1)}
          style={{ background: 'none', border: 'none', cursor: index === total - 1 ? 'default' : 'pointer', color: index === total - 1 ? '#1a1230' : '#7a6898', fontSize: '9px', padding: '2px 3px' }}>▼</button>

        <button type="button" onClick={() => setOpen(o => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a3f5c', fontSize: '9px', padding: '2px 6px' }}>
          {open ? '▲' : '▼'}
        </button>
        <button type="button" onClick={onRemove}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2a1520', fontSize: '11px', padding: '2px 4px' }}
          onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
          onMouseLeave={e => e.currentTarget.style.color = '#2a1520'}>
          ✕
        </button>
      </div>

      {open && (
        <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {/* label + date row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>
              <div style={labelStyle}>Label</div>
              <input style={inputStyle} value={step.label ?? ''} onChange={e => set('label', e.target.value)}
                placeholder="Phase 01"
                onFocus={e => e.target.style.borderColor = '#b08fff'}
                onBlur={e => e.target.style.borderColor = '#2a1f45'} />
            </div>
            <div>
              <div style={labelStyle}>Date</div>
              <input style={inputStyle} value={step.date ?? ''} onChange={e => set('date', e.target.value)}
                placeholder="Jan 2024"
                onFocus={e => e.target.style.borderColor = '#b08fff'}
                onBlur={e => e.target.style.borderColor = '#2a1f45'} />
            </div>
          </div>

          {/* title */}
          <div>
            <div style={labelStyle}>Title</div>
            <input style={inputStyle} value={step.title ?? ''} onChange={e => set('title', e.target.value)}
              placeholder="Concept & Research"
              onFocus={e => e.target.style.borderColor = '#b08fff'}
              onBlur={e => e.target.style.borderColor = '#2a1f45'} />
          </div>

          {/* nested modules */}
          <div>
            <div style={{ ...labelStyle, marginBottom: '0.4rem' }}>Modules</div>
            <StepModuleList
              modules={step.modules ?? []}
              onChange={modules => onChange({ ...step, modules })}
              token={token}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main editor ─────────────────────────────────────────────────────────────

export default function TimelineEditor({ data, onChange, token }) {
  const direction = data?.direction ?? 'vertical'
  const scrollDriven = data?.scrollDriven ?? false
  const snap = data?.snap ?? false
  const steps = data?.steps ?? []

  const set = (key, val) => onChange({ ...data, [key]: val })
  const setSteps = (s) => set('steps', s)

  const addStep = () => setSteps([...steps, newStep()])
  const updateStep = (i, step) => setSteps(steps.map((s, idx) => idx === i ? step : s))
  const removeStep = (i) => setSteps(steps.filter((_, idx) => idx !== i))
  const moveStep = (i, dir) => {
    const arr = [...steps]
    const tgt = i + dir
    if (tgt < 0 || tgt >= arr.length) return
    ;[arr[i], arr[tgt]] = [arr[tgt], arr[i]]
    setSteps(arr)
  }

  const toggleBtnStyle = (active) => ({
    padding: '0.3rem 0.75rem',
    background: active ? 'rgba(176,143,255,0.12)' : 'transparent',
    border: `1px solid ${active ? '#b08fff' : '#2a1f45'}`,
    borderRadius: '4px',
    color: active ? '#b08fff' : '#7a6898',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.72rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
    textTransform: 'capitalize',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Direction toggle */}
      <div>
        <div style={labelStyle}>Direction</div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['vertical', 'horizontal'].map(d => (
            <button key={d} type="button" onClick={() => set('direction', d)} style={toggleBtnStyle(direction === d)}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Scroll-Driven toggle */}
      <div>
        <div style={labelStyle}>Scroll-Driven</div>
        <button type="button" onClick={() => set('scrollDriven', !scrollDriven)} style={toggleBtnStyle(scrollDriven)}>
          {scrollDriven ? 'Enabled' : 'Disabled'}
        </button>
        {scrollDriven && (
          <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.67rem', color: '#7a6898', lineHeight: 1.5 }}>
              {direction === 'vertical'
                ? 'Page scroll locks to this timeline, advancing one step per 100vh. Preview on the live page.'
                : 'Page scroll drives the horizontal dot strip. Preview on the live page.'}
            </div>

            {/* Step snapping */}
            <div>
              <div style={{ ...labelStyle, marginBottom: '0.25rem' }}>Step Snapping</div>
              <button type="button" onClick={() => set('snap', !snap)} style={toggleBtnStyle(snap)}>
                {snap ? 'Enabled' : 'Disabled'}
              </button>
              {snap && (
                <div style={{ marginTop: '0.3rem', fontFamily: "'Inter', sans-serif", fontSize: '0.67rem', color: '#7a6898', lineHeight: 1.5 }}>
                  Scrolling past ~50% of a step snaps to the nearest one automatically.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Steps */}
      <div>
        <div style={{ ...labelStyle, marginBottom: '0.4rem' }}>Steps</div>
        {steps.map((step, i) => (
          <StepCard
            key={step.id || i}
            step={step}
            index={i}
            total={steps.length}
            onChange={step => updateStep(i, step)}
            onRemove={() => removeStep(i)}
            onMove={dir => moveStep(i, dir)}
            token={token}
          />
        ))}

        <button type="button" onClick={addStep}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            width: '100%', padding: '0.45rem 0.85rem',
            background: 'transparent',
            border: '1px dashed #2a1f45',
            borderRadius: '6px',
            color: '#a090bc',
            fontFamily: "'Inter', sans-serif", fontSize: '0.72rem',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#b08fff'; e.currentTarget.style.color = '#b08fff' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a1f45'; e.currentTarget.style.color = '#a090bc' }}
        >
          <svg width="9" height="9" viewBox="0 0 11 11" fill="currentColor">
            <rect x="4.5" y="0" width="2" height="11"/><rect x="0" y="4.5" width="11" height="2"/>
          </svg>
          Add step
        </button>
      </div>
    </div>
  )
}
