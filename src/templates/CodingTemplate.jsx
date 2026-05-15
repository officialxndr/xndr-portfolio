import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import ModuleRenderer from '../modules/ModuleRenderer.jsx'
import {
  parseRepoUrl,
  fetchRepoMeta,
  fetchLanguages,
  fetchTree,
  fetchReadmeHtml,
  langColor,
} from '../utils/github.js'

// ─── Languages bar ───────────────────────────────────────────────────────────

function LanguagesBar({ langs }) {
  if (!langs?.length) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{
        display: 'flex',
        height: '8px',
        borderRadius: '999px',
        overflow: 'hidden',
        border: '1px solid #160f24',
        backgroundColor: '#050308',
      }}>
        {langs.map(l => (
          <div
            key={l.name}
            title={`${l.name} — ${l.pct.toFixed(1)}%`}
            style={{ width: `${l.pct}%`, backgroundColor: langColor(l.name), transition: 'width 0.4s ease' }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem 1.25rem' }}>
        {langs.map(l => (
          <div key={l.name} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: langColor(l.name), flexShrink: 0 }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#e2e8f0' }}>{l.name}</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: '#7a6898' }}>{l.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── File tree ───────────────────────────────────────────────────────────────

function buildTree(items) {
  const root = { name: '', children: {}, type: 'dir' }
  for (const it of items) {
    const parts = it.path.split('/')
    let node = root
    for (let i = 0; i < parts.length; i++) {
      const name = parts[i]
      const isLast = i === parts.length - 1
      if (!node.children[name]) {
        node.children[name] = {
          name,
          children: {},
          type: isLast ? (it.type === 'tree' ? 'dir' : 'file') : 'dir',
        }
      }
      node = node.children[name]
    }
  }
  return root
}

function sortTreeChildren(node) {
  return Object.values(node.children).sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

const HIDDEN_TOP_LEVEL = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.vercel'])

function TreeNode({ node, depth }) {
  const [open, setOpen] = useState(depth < 1)
  const children = node.type === 'dir' ? sortTreeChildren(node) : []
  const isDir = node.type === 'dir'

  return (
    <div>
      <button
        type="button"
        onClick={() => isDir && setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          width: '100%',
          background: 'none',
          border: 'none',
          padding: '0.18rem 0.4rem',
          paddingLeft: `${depth * 0.9 + 0.4}rem`,
          cursor: isDir ? 'pointer' : 'default',
          color: isDir ? '#e2e8f0' : '#8a9ab0',
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Inter', monospace",
          fontSize: '0.78rem',
          textAlign: 'left',
          borderRadius: '3px',
          transition: 'background 0.1s',
        }}
        onMouseEnter={e => isDir && (e.currentTarget.style.backgroundColor = 'rgba(176,143,255,0.05)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        {isDir ? (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s', color: '#7a6898', flexShrink: 0 }}>
            <path d="M3 2l4 3-4 3V2z" fill="currentColor"/>
          </svg>
        ) : <span style={{ width: '10px', flexShrink: 0 }} />}
        {isDir ? (
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ color: '#b08fff', flexShrink: 0 }}>
            <path d="M1.5 3.5a1 1 0 011-1H6l1.5 1.5h4a1 1 0 011 1v6a1 1 0 01-1 1h-9a1 1 0 01-1-1v-7.5z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="0.8"/>
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ color: '#7a6898', flexShrink: 0 }}>
            <path d="M3 1.5h5L11 4.5v8a.5.5 0 01-.5.5h-7a.5.5 0 01-.5-.5v-11a.5.5 0 01.5-.5z" stroke="currentColor" strokeWidth="0.8" fill="none"/>
            <path d="M8 1.5V4.5h3" stroke="currentColor" strokeWidth="0.8" fill="none"/>
          </svg>
        )}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.name}</span>
      </button>
      {isDir && open && children.length > 0 && (
        <div>
          {children.map(child => <TreeNode key={child.name} node={child} depth={depth + 1} />)}
        </div>
      )}
    </div>
  )
}

function FileTree({ items }) {
  const tree = useMemo(() => {
    const filtered = items.filter(it => {
      const top = it.path.split('/')[0]
      return !HIDDEN_TOP_LEVEL.has(top)
    })
    return buildTree(filtered)
  }, [items])
  const roots = sortTreeChildren(tree)
  if (!roots.length) return null
  return (
    <div style={{
      backgroundColor: '#050308',
      border: '1px solid #160f24',
      borderRadius: '8px',
      padding: '0.85rem 0.6rem',
      maxHeight: '480px',
      overflowY: 'auto',
    }}>
      {roots.map(child => <TreeNode key={child.name} node={child} depth={0} />)}
    </div>
  )
}

// ─── Section header ──────────────────────────────────────────────────────────

function SectionHeader({ children }) {
  return (
    <h2 style={{
      fontFamily: "'Syne', sans-serif",
      fontSize: '0.72rem',
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      color: '#b08fff',
      opacity: 0.7,
      marginBottom: '1.25rem',
      fontWeight: 500,
    }}>
      {children}
    </h2>
  )
}

// ─── README rendered HTML ────────────────────────────────────────────────────

function ReadmePanel({ html, owner, repo, branch }) {
  // Rewrite relative image/link references to absolute GitHub URLs so they
  // resolve correctly when rendered outside the repo context.
  const rewritten = useMemo(() => {
    if (!html) return ''
    const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch || 'HEAD'}/`
    const blobBase = `https://github.com/${owner}/${repo}/blob/${branch || 'HEAD'}/`
    return html
      .replace(/(<img\b[^>]*\bsrc=")(?!https?:|\/\/|data:|#)([^"]+)"/gi, (_, p1, p2) => `${p1}${rawBase}${p2.replace(/^\.?\//, '')}"`)
      .replace(/(<a\b[^>]*\bhref=")(?!https?:|\/\/|#|mailto:)([^"]+)"/gi, (_, p1, p2) => `${p1}${blobBase}${p2.replace(/^\.?\//, '')}"`)
  }, [html, owner, repo, branch])

  if (!html) return null
  return (
    <div
      className="gh-readme"
      dangerouslySetInnerHTML={{ __html: rewritten }}
      style={{
        backgroundColor: '#050308',
        border: '1px solid #160f24',
        borderRadius: '8px',
        padding: '2rem 2.25rem',
        color: '#c5d2e0',
        fontFamily: "'Inter', sans-serif",
        fontSize: '0.9rem',
        lineHeight: 1.75,
      }}
    />
  )
}

// ─── Main template ───────────────────────────────────────────────────────────

export default function CodingTemplate({ project }) {
  const content = project.content ?? {}
  const githubUrl = content.github_url || ''
  const modules = content.modules ?? []
  const modulesAfterRepo = content.modules_after_repo ?? []
  const repo = useMemo(() => parseRepoUrl(githubUrl), [githubUrl])

  const sections = content.page_sections?.length
    ? content.page_sections
    : [
        { id: 'dd', type: 'native:description' },
        ...modules,
        { id: 'dg', type: 'native:github' },
        ...modulesAfterRepo,
      ]

  const [meta, setMeta] = useState(null)
  const [langs, setLangs] = useState([])
  const [tree, setTree] = useState([])
  const [readme, setReadme] = useState('')
  const [ghError, setGhError] = useState('')
  const [loadingGh, setLoadingGh] = useState(false)

  useEffect(() => {
    if (!repo) { setMeta(null); setLangs([]); setTree([]); setReadme(''); return }
    let cancelled = false
    setLoadingGh(true)
    setGhError('')

    ;(async () => {
      try {
        const m = await fetchRepoMeta(repo)
        if (cancelled) return
        setMeta(m)

        const branch = m.default_branch || 'main'
        const [l, t, r] = await Promise.allSettled([
          fetchLanguages(repo),
          fetchTree({ ...repo, branch }),
          fetchReadmeHtml(repo),
        ])
        if (cancelled) return
        if (l.status === 'fulfilled') setLangs(l.value)
        if (t.status === 'fulfilled') setTree(t.value)
        if (r.status === 'fulfilled') setReadme(r.value)
      } catch (err) {
        if (!cancelled) setGhError(err.message || 'GitHub fetch failed')
      } finally {
        if (!cancelled) setLoadingGh(false)
      }
    })()

    return () => { cancelled = true }
  }, [repo])

  const branch = meta?.default_branch || 'main'

  return (
    <div style={{ minHeight: '100vh', paddingTop: '6rem', paddingBottom: '4rem' }}>
      <style>{readmeStyles}</style>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 2rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '0.5rem' }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', letterSpacing: '0.2em', color: '#b08fff', textTransform: 'uppercase', opacity: 0.7 }}>
            {project.category}
          </span>
        </div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#e2e8f0', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '1.5rem' }}>
          {project.title}
        </h1>

        {/* GitHub link + repo stats */}
        {githubUrl && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <motion.a
              href={githubUrl}
              target="_blank"
              rel="noreferrer noopener"
              whileHover={{ y: -1 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1rem',
                backgroundColor: 'rgba(176,143,255,0.08)',
                border: '1px solid rgba(176,143,255,0.3)',
                borderRadius: '6px',
                color: '#e2e8f0',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.82rem',
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38v-1.49c-2.22.48-2.7-.94-2.7-.94-.36-.93-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.81.06 1.23.83 1.23.83.72 1.22 1.88.87 2.34.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.13 0 0 .67-.21 2.2.82a7.6 7.6 0 014 0c1.53-1.03 2.2-.82 2.2-.82.44 1.11.16 1.93.08 2.13.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.19c0 .21.15.46.55.38A8 8 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              View on GitHub
            </motion.a>

            {meta && (
              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {typeof meta.stargazers_count === 'number' && (
                  <Stat icon={
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25l2.45 4.97 5.49.8-3.97 3.87.94 5.46L8 12.78l-4.91 2.58.94-5.46L.06 6.02l5.49-.8L8 .25z"/></svg>
                  } label={meta.stargazers_count.toLocaleString()} />
                )}
                {typeof meta.forks_count === 'number' && (
                  <Stat icon={
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="4" cy="3" r="1.5"/><circle cx="12" cy="3" r="1.5"/><circle cx="8" cy="13" r="1.5"/><path d="M4 4.5v3a1 1 0 001 1h6a1 1 0 001-1v-3M8 8.5v3" strokeLinecap="round"/></svg>
                  } label={meta.forks_count.toLocaleString()} />
                )}
                {meta.license?.spdx_id && meta.license.spdx_id !== 'NOASSERTION' && (
                  <Stat icon={
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M8 1.5L2 4v5c0 3 2.5 5 6 6 3.5-1 6-3 6-6V4l-6-2.5z"/></svg>
                  } label={meta.license.spdx_id} />
                )}
              </div>
            )}
          </div>
        )}

        {sections.filter(s => s.visible !== false).map(section => {
          if (section.type === 'native:description') {
            return project.description ? (
              <p key={section.id} style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.92rem', color: '#8a9ab0', lineHeight: 1.75, marginBottom: '3.5rem', maxWidth: '65ch' }}>
                {project.description}
              </p>
            ) : null
          }
          if (section.type === 'native:github') {
            return repo ? (
              <div key={section.id}>
                {loadingGh && !meta && (
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: '#7a6898', textAlign: 'center', padding: '2rem' }}>
                    Loading repo data…
                  </div>
                )}
                {ghError && (
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: '#ff9e9e', padding: '0.8rem 1rem', backgroundColor: 'rgba(255,107,107,0.06)', border: '1px solid rgba(255,107,107,0.18)', borderRadius: '6px', marginBottom: '2rem' }}>
                    Couldn't load GitHub data: {ghError}
                  </div>
                )}
                {langs.length > 0 && (
                  <section style={{ marginBottom: '3.5rem' }}>
                    <SectionHeader>Languages</SectionHeader>
                    <LanguagesBar langs={langs} />
                  </section>
                )}
                {tree.length > 0 && (
                  <section style={{ marginBottom: '3.5rem' }}>
                    <SectionHeader>Repository</SectionHeader>
                    <FileTree items={tree} />
                  </section>
                )}
                {readme && (
                  <section style={{ marginBottom: '2rem' }}>
                    <SectionHeader>README</SectionHeader>
                    <ReadmePanel html={readme} owner={repo.owner} repo={repo.repo} branch={branch} />
                  </section>
                )}
              </div>
            ) : null
          }
          return (
            <div key={section.id} style={{ marginBottom: '2rem' }}>
              <ModuleRenderer module={section} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ icon, label }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#7a6898', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem' }}>
      {icon}
      <span>{label}</span>
    </div>
  )
}

// Styles for the GitHub-rendered README HTML. Scoped to .gh-readme so it
// doesn't leak into the rest of the site.
const readmeStyles = `
.gh-readme h1, .gh-readme h2, .gh-readme h3, .gh-readme h4, .gh-readme h5, .gh-readme h6 {
  font-family: 'Syne', sans-serif;
  color: #e2e8f0;
  margin-top: 1.8em;
  margin-bottom: 0.65em;
  line-height: 1.25;
  letter-spacing: -0.01em;
}
.gh-readme h1:first-child, .gh-readme h2:first-child { margin-top: 0; }
.gh-readme h1 { font-size: 1.7rem; border-bottom: 1px solid #160f24; padding-bottom: 0.3em; }
.gh-readme h2 { font-size: 1.35rem; border-bottom: 1px solid #160f24; padding-bottom: 0.25em; }
.gh-readme h3 { font-size: 1.1rem; }
.gh-readme p { margin: 0 0 1em 0; }
.gh-readme a { color: #b08fff; text-decoration: none; border-bottom: 1px solid rgba(176,143,255,0.25); transition: border-color 0.15s; }
.gh-readme a:hover { border-bottom-color: #b08fff; }
.gh-readme img { max-width: 100%; border-radius: 4px; margin: 0.5em 0; }
.gh-readme code {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.85em;
  background-color: rgba(176,143,255,0.08);
  color: #d8c5ff;
  padding: 0.15em 0.4em;
  border-radius: 3px;
}
.gh-readme pre {
  background-color: #0a0612;
  border: 1px solid #160f24;
  border-radius: 6px;
  padding: 1rem 1.15rem;
  overflow-x: auto;
  margin: 1.1em 0;
  font-size: 0.83rem;
  line-height: 1.6;
}
.gh-readme pre code { background: none; padding: 0; color: #c5d2e0; }
.gh-readme ul, .gh-readme ol { margin: 0 0 1em 0; padding-left: 1.4em; }
.gh-readme li { margin-bottom: 0.35em; }
.gh-readme blockquote { margin: 1em 0; padding: 0.4em 1em; border-left: 3px solid #2a1f45; color: #8a9ab0; }
.gh-readme hr { border: none; border-top: 1px solid #160f24; margin: 2em 0; }
.gh-readme table { border-collapse: collapse; margin: 1em 0; font-size: 0.85rem; }
.gh-readme th, .gh-readme td { border: 1px solid #160f24; padding: 0.4em 0.85em; text-align: left; }
.gh-readme th { background-color: #0a0612; color: #e2e8f0; font-weight: 600; }
.gh-readme td { color: #8a9ab0; }
.gh-readme details { margin: 0.5em 0; }
.gh-readme summary { cursor: pointer; color: #b08fff; }
.gh-readme svg { display: inline-block; vertical-align: middle; }
.gh-readme .octicon { fill: currentColor; }
`
