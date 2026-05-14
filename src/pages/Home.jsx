import { useSiteConfig } from '../hooks/useProjects.js'
import SnapScroller from '../components/SnapScroller.jsx'
import HeroSection from '../components/HeroSection.jsx'
import ProjectsSection from '../components/ProjectsSection.jsx'

export default function Home() {
  const config = useSiteConfig()

  return (
    <SnapScroller id="snap-root">
      <HeroSection
        heroVideo={config.hero_video || null}
        logo={config.logo || null}
      />
      <ProjectsSection />
    </SnapScroller>
  )
}
