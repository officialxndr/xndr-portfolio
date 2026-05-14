export const MODULE_DEFS = [
  {
    type: 'text',
    label: 'Text Block',
    description: 'Paragraph, notes, or description',
    defaultData: { text: '' },
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <rect x="0" y="2" width="16" height="1.5" rx="0.75"/>
        <rect x="0" y="5.5" width="13" height="1.5" rx="0.75"/>
        <rect x="0" y="9" width="16" height="1.5" rx="0.75"/>
        <rect x="0" y="12.5" width="10" height="1.5" rx="0.75"/>
      </svg>
    ),
  },
  {
    type: 'video',
    label: 'Video Player',
    description: 'Embed a video clip with controls',
    defaultData: { url: '', poster: '' },
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
        <rect x="1" y="3" width="14" height="10" rx="1.5"/>
        <path d="M6.5 6l4 2-4 2V6z" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    type: 'storyboard',
    label: 'Storyboard',
    description: 'Grid of frames with captions',
    defaultData: { frames: [] },
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <rect x="0" y="0" width="7" height="5" rx="1"/>
        <rect x="9" y="0" width="7" height="5" rx="1"/>
        <rect x="0" y="6.5" width="7" height="5" rx="1"/>
        <rect x="9" y="6.5" width="7" height="5" rx="1"/>
        <rect x="0" y="13" width="7" height="3" rx="0.5"/>
        <rect x="9" y="13" width="7" height="3" rx="0.5"/>
      </svg>
    ),
  },
  {
    type: 'image',
    label: 'Image',
    description: 'Full-width image with optional caption',
    defaultData: { url: '', caption: '' },
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
        <rect x="1" y="2" width="14" height="12" rx="1.5"/>
        <path d="M1 10l4-4 3 3 2-2 5 5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="5" cy="5.5" r="1.2" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
]
