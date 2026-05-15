import { useState, useMemo, useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useProjects } from '../hooks/useProjects.js'
import FilterChips from './FilterChips.jsx'
import ProjectCard from './ProjectCard.jsx'

// Resets to true on every real page load (module reload), stays false through SPA navigation
let _isFirstMount = true

export default function ProjectsSection() {
  const { projects, loading } = useProjects(true)
  const wasFirstMount = useRef(true)

  const [selectedTags, setSelectedTags] = useState(() => {
    const isFirst = _isFirstMount
    wasFirstMount.current = isFirst
    _isFirstMount = false
    if (isFirst) return []
    try {
      return JSON.parse(sessionStorage.getItem('projectFilters') || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    sessionStorage.setItem('projectFilters', JSON.stringify(selectedTags))
  }, [selectedTags])

  // On back-navigation, snap scroller back to the projects section
  useEffect(() => {
    if (!wasFirstMount.current) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('snap-to-section', { detail: 1 }))
      }, 0)
    }
  }, [])

  const allTags = useMemo(() => {
    const set = new Set()
    projects.forEach(p => (p.tags ?? []).forEach(t => t && set.add(t)))
    return [...set].sort()
  }, [projects])

  const filtered = useMemo(() => {
    if (selectedTags.length === 0) return projects
    return projects.filter(p => selectedTags.every(t => (p.tags ?? []).includes(t)))
  }, [projects, selectedTags])

  const availableTags = useMemo(() => {
    const set = new Set()
    filtered.forEach(p => (p.tags ?? []).forEach(t => t && set.add(t)))
    return set
  }, [filtered])

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  return (
    <section
      className="w-full h-screen overflow-y-auto"
      id="work"
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '5rem 2.5rem 4rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: '0.65rem',
              letterSpacing: '0.25em',
              color: '#2a1f45',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}
          >
            Work
          </div>
          <FilterChips
            tags={allTags}
            selected={selectedTags}
            availableTags={availableTags}
            onToggle={toggleTag}
            onClear={() => setSelectedTags([])}
          />
        </div>

        {loading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '2rem',
            }}
          >
            {[...Array(6)].map((_, i) => (
              <div key={i}>
                <div
                  style={{
                    width: '100%',
                    paddingTop: '56.25%',
                    borderRadius: '6px',
                    backgroundColor: '#100d1a',
                    animation: 'pulse 2s infinite',
                  }}
                />
                <div style={{ marginTop: '0.65rem', height: '1rem', backgroundColor: '#100d1a', borderRadius: '4px', width: '60%' }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              paddingTop: '4rem',
              color: '#2a1f45',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.85rem',
            }}
          >
            No projects found.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '2rem',
            }}
          >
            <AnimatePresence mode="popLayout">
              {filtered.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  )
}
