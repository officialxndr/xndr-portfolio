// Lightweight GitHub helpers — client-side fetches against api.github.com.
// Unauthenticated: 60 req/hour per IP, which is plenty for a personal portfolio.

export function parseRepoUrl(url) {
  if (!url) return null
  try {
    const u = new URL(url)
    if (!/github\.com$/i.test(u.hostname)) return null
    const [owner, repo] = u.pathname.replace(/^\/|\/$/g, '').split('/')
    if (!owner || !repo) return null
    return { owner, repo: repo.replace(/\.git$/i, '') }
  } catch {
    return null
  }
}

async function gh(path, opts = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...opts,
    headers: { Accept: 'application/vnd.github+json', ...(opts.headers || {}) },
  })
  if (!res.ok) throw new Error(`GitHub ${res.status}`)
  return res
}

export async function fetchRepoMeta({ owner, repo }) {
  const res = await gh(`/repos/${owner}/${repo}`)
  return res.json()
}

export async function fetchLanguages({ owner, repo }) {
  const res = await gh(`/repos/${owner}/${repo}/languages`)
  const data = await res.json()
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1
  return Object.entries(data)
    .map(([name, bytes]) => ({ name, bytes, pct: (bytes / total) * 100 }))
    .sort((a, b) => b.bytes - a.bytes)
}

export async function fetchTree({ owner, repo, branch }) {
  const res = await gh(`/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`)
  const data = await res.json()
  return data.tree ?? []
}

export async function fetchReadmeHtml({ owner, repo }) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
    headers: { Accept: 'application/vnd.github.html' },
  })
  if (!res.ok) throw new Error(`GitHub ${res.status}`)
  return res.text()
}

// Minimal palette for the languages bar — covers the common ones.
// Anything not here falls back to the accent color at reduced opacity.
export const LANG_COLORS = {
  JavaScript:  '#f1e05a',
  TypeScript:  '#3178c6',
  Python:      '#3572A5',
  HTML:        '#e34c26',
  CSS:         '#563d7c',
  SCSS:        '#c6538c',
  Sass:        '#a53b70',
  Less:        '#1d365d',
  Vue:         '#41b883',
  Svelte:      '#ff3e00',
  Go:          '#00ADD8',
  Rust:        '#dea584',
  C:           '#555555',
  'C++':       '#f34b7d',
  'C#':        '#178600',
  Java:        '#b07219',
  Kotlin:      '#A97BFF',
  Swift:       '#F05138',
  Ruby:        '#701516',
  PHP:         '#4F5D95',
  Shell:       '#89e051',
  PowerShell:  '#012456',
  Dockerfile:  '#384d54',
  Lua:         '#000080',
  GLSL:        '#5686a5',
  HLSL:        '#aace60',
  Markdown:    '#083fa1',
  YAML:        '#cb171e',
  JSON:        '#292929',
  R:           '#198CE7',
  Dart:        '#00B4AB',
  Elixir:      '#6e4a7e',
  Haskell:     '#5e5086',
  Scala:       '#c22d40',
  Solidity:    '#AA6746',
  Zig:         '#ec915c',
  Nim:         '#ffc200',
  Julia:       '#a270ba',
  Elm:         '#60B5CC',
  ObjectiveC:  '#438eff',
  'Objective-C': '#438eff',
  Vim:         '#199f4b',
  Makefile:    '#427819',
  CMake:       '#DA3434',
  Jupyter:     '#DA5B0B',
  'Jupyter Notebook': '#DA5B0B',
}

export function langColor(name) {
  return LANG_COLORS[name] || '#b08fff'
}
