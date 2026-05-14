export default function FilterChips({ tags, active, onChange }) {
  const all = ['All', ...tags]

  return (
    <div
      className="flex items-center gap-2 overflow-x-auto pb-1"
      style={{ scrollbarWidth: 'none' }}
    >
      {all.map(tag => (
        <button
          key={tag}
          className={`chip ${active === tag ? 'active' : ''}`}
          onClick={() => onChange(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
