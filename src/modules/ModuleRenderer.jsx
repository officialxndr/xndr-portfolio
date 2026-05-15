import TextRenderer       from './text/TextRenderer.jsx'
import VideoRenderer      from './video/VideoRenderer.jsx'
import StoryboardRenderer from './storyboard/StoryboardRenderer.jsx'
import ImageRenderer      from './image/ImageRenderer.jsx'
import CarouselRenderer   from './carousel/CarouselRenderer.jsx'
import ModelRenderer      from './model/ModelRenderer.jsx'

export default function ModuleRenderer({ module: mod }) {
  switch (mod.type) {
    case 'text':       return <TextRenderer       data={mod.data} />
    case 'video':      return <VideoRenderer      data={mod.data} />
    case 'storyboard': return <StoryboardRenderer data={mod.data} />
    case 'image':      return <ImageRenderer      data={mod.data} />
    case 'carousel':   return <CarouselRenderer   data={mod.data} />
    case 'model':      return <ModelRenderer      data={mod.data} />
    default:           return null
  }
}
