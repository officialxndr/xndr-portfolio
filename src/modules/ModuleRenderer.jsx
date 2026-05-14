import TextRenderer      from './text/TextRenderer.jsx'
import VideoRenderer     from './video/VideoRenderer.jsx'
import StoryboardRenderer from './storyboard/StoryboardRenderer.jsx'
import ImageRenderer     from './image/ImageRenderer.jsx'

export default function ModuleRenderer({ module: mod }) {
  switch (mod.type) {
    case 'text':       return <TextRenderer       data={mod.data} />
    case 'video':      return <VideoRenderer      data={mod.data} />
    case 'storyboard': return <StoryboardRenderer data={mod.data} />
    case 'image':      return <ImageRenderer      data={mod.data} />
    default:           return null
  }
}
