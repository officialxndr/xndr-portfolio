import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function FilterChips({ tags, selected, availableTags, onToggle, onClear }) {
  const sortedTags = useMemo(() => {
    const sel = tags.filter(t => selected.includes(t))
    const avail = tags.filter(t => !selected.includes(t) && availableTags.has(t))
    const unavail = tags.filter(t => !selected.includes(t) && !availableTags.has(t))
    return [...sel, ...avail, ...unavail]
  }, [tags, selected, availableTags])

  return (
    <div className="flex items-center gap-2" style={{ flexWrap: 'wrap', rowGap: '0.5rem' }}>
      {sortedTags.map(tag => {
        const isSelected = selected.includes(tag)
        const isUnavailable = !isSelected && !availableTags.has(tag)
        return (
          <button
            key={tag}
            className={`chip${isSelected ? ' active' : ''}`}
            onClick={() => !isUnavailable && onToggle(tag)}
            style={{
              opacity: isUnavailable ? 0.3 : 1,
              cursor: isUnavailable ? 'default' : 'pointer',
              order: isUnavailable ? 1 : 0,
            }}
          >
            {tag}
          </button>
        )
      })}

      <AnimatePresence>
        {selected.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            onClick={onClear}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.35rem 0.5rem',
              color: '#3a2f55',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.72rem',
              cursor: 'pointer',
              letterSpacing: '0.04em',
              order: 2,
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#7a6898'}
            onMouseLeave={e => e.currentTarget.style.color = '#3a2f55'}
          >
            clear ×
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
