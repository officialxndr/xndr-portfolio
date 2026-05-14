import { useState, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useProjects } from '../hooks/useProjects.js'
import FilterChips from './FilterChips.jsx'
import ProjectCard from './ProjectCard.jsx'

export default function ProjectsSection() {
  const { projects, loading } = useProjects(true)
  const [activeTag, setActiveTag] = useState('All')

  const allTags = useMemo(() => {
    const set = new Set()
    projects.forEach(p => (p.tags ?? []).forEach(t => set.add(t)))
    return [...set].sort()
  }, [projects])

  const filtered = useMemo(() => {
    if (activeTag === 'All') return projects
    return projects.filter(p => (p.tags ?? []).includes(activeTag))
  }, [projects, activeTag])

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
          <FilterChips tags={allTags} active={activeTag} onChange={setActiveTag} />
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
