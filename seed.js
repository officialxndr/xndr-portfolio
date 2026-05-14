import 'dotenv/config'
import db from './server/db.js'

const demo = {
  id: 'demo-short-film',
  title: 'Demo Short Film',
  category: 'Film',
  tags: JSON.stringify(['film', 'narrative', 'motion']),
  thumbnail: '',
  template: 'video',
  custom_component: '',
  sort_order: 0,
  published: 1,
  description: 'Replace this with your project description via the admin portal at /admin.',
  content: JSON.stringify({
    video: { url: '', poster: '' },
    process: {
      preProduction: {
        text: 'Concept development, storyboarding, location scouting. Add your pre-production notes here via the admin portal.',
        assets: [],
      },
      projection: {
        text: 'On-set notes, equipment used, lighting setups, challenges faced and how you overcame them.',
        assets: [],
      },
      postProduction: {
        text: 'Editing approach, color grading choices, sound design, VFX work — walk through your process.',
        assets: [],
      },
      final: {
        text: 'The finished piece. Where it screened, client feedback, what you\'d do differently next time.',
        assets: [],
      },
    },
  }),
}

db.prepare(`
  INSERT OR REPLACE INTO projects
    (id, title, category, tags, thumbnail, template, custom_component, sort_order, published, description, content)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  demo.id, demo.title, demo.category, demo.tags,
  demo.thumbnail, demo.template, demo.custom_component,
  demo.sort_order, demo.published, demo.description, demo.content
)

console.log('Demo project added → http://localhost:5173/projects/demo-short-film')
