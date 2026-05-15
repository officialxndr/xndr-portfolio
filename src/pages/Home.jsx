import { useMemo } from 'react'
import { useSiteConfig } from '../hooks/useProjects.js'
import SnapScroller from '../components/SnapScroller.jsx'
import HeroSection from '../components/HeroSection.jsx'
import ProjectsSection from '../components/ProjectsSection.jsx'

export default function Home() {
  const config = useSiteConfig()

  const morphTexts = useMemo(() => {
    try { return JSON.parse(config.hero_morph_texts || '[]') }
    catch { return [] }
  }, [config.hero_morph_texts])

  const morphSpeed = parseFloat(config.hero_morph_speed) || 1

  return (
    <SnapScroller id="snap-root">
      <HeroSection
        heroVideo={config.hero_video || null}
        logo={config.logo || null}
        morphTexts={morphTexts}
        morphSpeed={morphSpeed}
      />
      <ProjectsSection />
    </SnapScroller>
  )
}
