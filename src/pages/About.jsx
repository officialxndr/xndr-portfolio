import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSiteConfig } from '../hooks/useProjects.js'

const DEFAULT_TOOLS = ['Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Photoshop', 'Lightroom', 'Blender', 'VS Code', 'Fusion 360', 'OrcaSlicer']

const TOOL_ICONS = {
  'Premiere Pro': '/tool-icons/premiere-pro-cc.svg',
  'After Effects': '/tool-icons/after-effects-1.svg',
  'DaVinci Resolve': '/tool-icons/DaVinci_Resolve_17_logo.svg.png',
  'Photoshop': '/tool-icons/adobe-photoshop-2.svg',
  'Lightroom': '/tool-icons/adobe-photoshop-lightroom-cc-icon.svg',
  'Blender': '/tool-icons/blender-2.svg',
  'VS Code': '/tool-icons/vscode_.svg',
  'Fusion 360': '/tool-icons/Fusion360.svg.png',
  'OrcaSlicer': '/tool-icons/orcaslicer.png',
}

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.25, 0, 0.1, 1] },
})

export default function About() {
  const config = useSiteConfig()

  const name = config.about_name || 'Your Name'
  const role = config.about_role || ''
  const bio = config.about_bio || ''
  const photo = config.about_photo || null
  const tools = (() => {
    try { return config.about_tools ? JSON.parse(config.about_tools) : DEFAULT_TOOLS }
    catch { return DEFAULT_TOOLS }
  })()
  const location = config.about_location || ''
  const email = config.about_email || ''
  const available = config.about_available === 'true'
  const socials = (() => {
    try { return config.about_socials ? JSON.parse(config.about_socials) : [] }
    catch { return [] }
  })()
  const contacts = (() => {
    try { return config.about_contacts ? JSON.parse(config.about_contacts) : [] }
    catch { return [] }
  })()

  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const [copiedKey, setCopiedKey] = useState(null)
  const copyToClipboard = (value, key) => {
    navigator.clipboard.writeText(value)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div className="ab-outer" style={{ minHeight: '100vh', backgroundColor: 'transparent' }}>
      <style>{`
        .ab-outer { padding: 8rem 2.5rem 6rem; overflow-x: hidden; }
        .ab-grid  { display: grid; grid-template-columns: minmax(200px, 260px) 1fr; gap: 5rem; align-items: start; }
        @media (max-width: 700px) {
          .ab-outer { padding: 5.5rem 1.25rem 4rem; }
          .ab-grid  { grid-template-columns: 1fr; gap: 2rem; }
        }
      `}</style>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        <motion.div {...fade(0)} style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: '0.65rem',
          letterSpacing: '0.25em',
          color: '#2a1f45',
          textTransform: 'uppercase',
          marginBottom: '4rem',
        }}>
          About
        </motion.div>

        <div className="ab-grid">

          {/* Left: Profile photo */}
          <motion.div {...fade(0.1)} style={{ minWidth: 0 }}>
            <svg
              viewBox="-170 -255 430 430"
              width="220"
              height="220"
              style={{ overflow: 'hidden', display: 'block', margin: '0 auto' }}
            >
              <defs>
                <clipPath id="blob-photo-clip">
                  <path d="M154.2 -150.7C204.2 -104.2 252.1 -52.1 246.8 -5.3C241.5 41.5 183 83 133 113.8C83 144.6 41.5 164.8 7.5 157.3C-26.5 149.9 -53 114.7 -71.7 83.9C-90.4 53 -101.2 26.5 -119.7 -18.6C-138.3 -63.6 -164.6 -127.3 -145.9 -173.8C-127.3 -220.3 -63.6 -249.6 -5.8 -243.9C52.1 -238.1 104.2 -197.2 154.2 -150.7" />
                </clipPath>
                <filter id="blob-glow-filter" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="16" />
                </filter>
              </defs>

              {/* Glow */}
              <path
                d="M154.2 -150.7C204.2 -104.2 252.1 -52.1 246.8 -5.3C241.5 41.5 183 83 133 113.8C83 144.6 41.5 164.8 7.5 157.3C-26.5 149.9 -53 114.7 -71.7 83.9C-90.4 53 -101.2 26.5 -119.7 -18.6C-138.3 -63.6 -164.6 -127.3 -145.9 -173.8C-127.3 -220.3 -63.6 -249.6 -5.8 -243.9C52.1 -238.1 104.2 -197.2 154.2 -150.7"
                fill="rgba(176,143,255,0.22)"
                filter="url(#blob-glow-filter)"
              />

              {/* Photo or initials, clipped to blob */}
              <g clipPath="url(#blob-photo-clip)">
                <rect x="-170" y="-255" width="430" height="430" fill="#100d1a" />
                {photo ? (
                  <image
                    href={photo}
                    x="-170"
                    y="-255"
                    width="430"
                    height="430"
                    preserveAspectRatio="xMidYMid slice"
                  />
                ) : (
                  <text
                    x="45"
                    y="-40"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#2a1f45"
                    fontFamily="'Syne', sans-serif"
                    fontSize="80"
                    fontWeight="700"
                  >
                    {initials}
                  </text>
                )}
              </g>

              {/* Border stroke */}
              <path
                d="M154.2 -150.7C204.2 -104.2 252.1 -52.1 246.8 -5.3C241.5 41.5 183 83 133 113.8C83 144.6 41.5 164.8 7.5 157.3C-26.5 149.9 -53 114.7 -71.7 83.9C-90.4 53 -101.2 26.5 -119.7 -18.6C-138.3 -63.6 -164.6 -127.3 -145.9 -173.8C-127.3 -220.3 -63.6 -249.6 -5.8 -243.9C52.1 -238.1 104.2 -197.2 154.2 -150.7"
                fill="none"
                stroke="rgba(176,143,255,0.32)"
                strokeWidth="3"
              />
            </svg>

            {/* Availability badge */}
            {available && (
              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.3rem 0.85rem',
                  borderRadius: '999px',
                  border: '1px solid rgba(176, 143, 255, 0.25)',
                  background: 'rgba(176, 143, 255, 0.06)',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.7rem',
                  color: '#b08fff',
                  letterSpacing: '0.04em',
                }}>
                  <span style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: '#b08fff',
                    display: 'inline-block',
                    boxShadow: '0 0 6px rgba(176,143,255,0.6)',
                  }} />
                  Available for work
                </span>
              </div>
            )}

            {/* Location */}
            {location && (
              <div style={{
                marginTop: '1.25rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.35rem',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.75rem',
                color: '#4a3a6a',
              }}>
                <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                  <path d="M5 0C2.79 0 1 1.79 1 4c0 3 4 8 4 8s4-5 4-8c0-2.21-1.79-4-4-4zm0 5.5A1.5 1.5 0 1 1 5 2.5a1.5 1.5 0 0 1 0 3z" fill="currentColor" />
                </svg>
                {location}
              </div>
            )}

            {/* Contact */}
            {(email || contacts.length > 0) && (
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: '0.62rem',
                  letterSpacing: '0.22em',
                  color: '#2a1f45',
                  textTransform: 'uppercase',
                  marginBottom: '0.6rem',
                  textAlign: 'center',
                }}>
                  Contact
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {email && (
                    <div
                      onClick={() => copyToClipboard(email, 'email')}
                      style={{
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(176, 143, 255, 0.12)',
                        background: 'rgba(176, 143, 255, 0.04)',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s, background 0.2s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'rgba(176,143,255,0.35)'
                        e.currentTarget.style.background = 'rgba(176,143,255,0.1)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(176,143,255,0.12)'
                        e.currentTarget.style.background = 'rgba(176,143,255,0.04)'
                      }}
                    >
                      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4a3a6a', marginBottom: '0.2rem' }}>Email</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: copiedKey === 'email' ? '#b08fff' : '#7a6898', transition: 'color 0.2s', overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                        {copiedKey === 'email' ? 'Copied!' : email}
                      </div>
                    </div>
                  )}
                  {contacts.map((c, i) => (
                    <div
                      key={i}
                      onClick={() => copyToClipboard(c.url, `contact-${i}`)}
                      style={{
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(176, 143, 255, 0.12)',
                        background: 'rgba(176, 143, 255, 0.04)',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s, background 0.2s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'rgba(176,143,255,0.35)'
                        e.currentTarget.style.background = 'rgba(176,143,255,0.1)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(176,143,255,0.12)'
                        e.currentTarget.style.background = 'rgba(176,143,255,0.04)'
                      }}
                    >
                      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4a3a6a', marginBottom: '0.2rem' }}>{c.label}</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: copiedKey === `contact-${i}` ? '#b08fff' : '#7a6898', transition: 'color 0.2s', overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                        {copiedKey === `contact-${i}` ? 'Copied!' : c.url}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social links */}
            {socials.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: '0.62rem',
                  letterSpacing: '0.22em',
                  color: '#2a1f45',
                  textTransform: 'uppercase',
                  marginBottom: '0.6rem',
                  textAlign: 'center',
                }}>
                  Socials
                </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {socials.map(s => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(176, 143, 255, 0.12)',
                      background: 'rgba(176, 143, 255, 0.04)',
                      textDecoration: 'none',
                      transition: 'border-color 0.2s, background 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(176,143,255,0.35)'
                      e.currentTarget.style.background = 'rgba(176,143,255,0.1)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(176,143,255,0.12)'
                      e.currentTarget.style.background = 'rgba(176,143,255,0.04)'
                    }}
                  >
                    {s.icon
                      ? <img src={s.icon} alt={s.name} style={{ width: '20px', height: '20px', objectFit: 'contain', flexShrink: 0 }} />
                      : <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.8rem', color: '#b08fff', fontWeight: 700, flexShrink: 0 }}>{s.name[0]}</span>
                    }
                    <span style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.75rem',
                      color: '#7a6898',
                      letterSpacing: '0.04em',
                    }}>
                      {s.name}
                    </span>
                  </a>
                ))}
              </div>
              </div>
            )}
          </motion.div>

          {/* Right: Content */}
          <div style={{ minWidth: 0 }}>
            <motion.h1 {...fade(0.15)} style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 'clamp(1.75rem, 8vw, 3.5rem)',
              fontWeight: 800,
              color: '#ede8f8',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              marginBottom: '0.6rem',
            }}>
              {name}
            </motion.h1>

            {role && (
              <motion.p {...fade(0.2)} style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.8rem',
                color: '#b08fff',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '2rem',
              }}>
                {role}
              </motion.p>
            )}

            {bio && (
              <motion.p {...fade(0.25)} style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.95rem',
                lineHeight: 1.8,
                color: '#7a6898',
                maxWidth: '540px',
                marginBottom: '2.5rem',
              }}>
                {bio}
              </motion.p>
            )}

            {tools.length > 0 && (
              <motion.div {...fade(0.3)} style={{ marginBottom: '2.5rem' }}>
                <div style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: '0.62rem',
                  letterSpacing: '0.22em',
                  color: '#2a1f45',
                  textTransform: 'uppercase',
                  marginBottom: '0.9rem',
                }}>
                  Tools & Programs
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: '0.75rem' }}>
                  {tools.map(tool => {
                    const icon = TOOL_ICONS[tool]
                    return (
                      <div key={tool} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.75rem 0.5rem',
                        borderRadius: '10px',
                        border: '1px solid rgba(176, 143, 255, 0.15)',
                        background: 'rgba(176, 143, 255, 0.05)',
                        transition: 'border-color 0.2s, background 0.2s',
                      }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = 'rgba(176,143,255,0.35)'
                          e.currentTarget.style.background = 'rgba(176,143,255,0.1)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'rgba(176,143,255,0.15)'
                          e.currentTarget.style.background = 'rgba(176,143,255,0.05)'
                        }}
                      >
                        {icon ? (
                          <img src={icon} alt={tool} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                        ) : (
                          <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.1rem', color: '#b08fff', fontWeight: 700 }}>
                              {tool[0]}
                            </span>
                          </div>
                        )}
                        <span style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '0.65rem',
                          color: '#7a6898',
                          letterSpacing: '0.04em',
                          textAlign: 'center',
                          lineHeight: 1.3,
                        }}>
                          {tool}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
