import exifr from 'exifr'

const EXIF_PICK = ['Make', 'Model', 'LensModel', 'FNumber', 'ExposureTime', 'ISO', 'FocalLength', 'DateTimeOriginal']

async function readExif(file) {
  try {
    const raw = await exifr.parse(file, { pick: EXIF_PICK })
    if (!raw) return null
    return {
      camera: [raw.Make, raw.Model].filter(Boolean).join(' ') || null,
      lens: raw.LensModel || null,
      fStop: raw.FNumber ? `f/${raw.FNumber}` : null,
      shutterSpeed: raw.ExposureTime
        ? raw.ExposureTime < 1
          ? `1/${Math.round(1 / raw.ExposureTime)}s`
          : `${raw.ExposureTime}s`
        : null,
      iso: raw.ISO ? `ISO ${raw.ISO}` : null,
      focalLength: raw.FocalLength ? `${raw.FocalLength}mm` : null,
      dateTaken: raw.DateTimeOriginal
        ? new Date(raw.DateTimeOriginal).toLocaleDateString()
        : null,
    }
  } catch {
    return null
  }
}

// Canvas resizes + converts to WebP using the browser's GPU compositor.
// Browsers auto-apply EXIF orientation when loading into Image(), so the
// resulting WebP is correctly rotated without needing Sharp or exiftool.
function compressImage(file, maxWidth = 2400, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const src = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(src)
      const scale = Math.min(1, maxWidth / img.naturalWidth)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.naturalWidth * scale)
      canvas.height = Math.round(img.naturalHeight * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Compression failed')),
        'image/webp',
        quality,
      )
    }

    img.onerror = () => { URL.revokeObjectURL(src); reject(new Error('Image load failed')) }
    img.src = src
  })
}

/**
 * Upload a file to /api/upload.
 * Images are compressed client-side to WebP before sending.
 * EXIF is read from the original file before compression strips it.
 * Videos are sent as-is.
 * Returns { url, exif }
 */
export async function uploadFile(file, token) {
  let toUpload = file
  let exif = null

  if (file.type.startsWith('image/')) {
    // Read EXIF from original (canvas strips metadata)
    exif = await readExif(file)

    // Compress to WebP
    try {
      const blob = await compressImage(file)
      toUpload = new File(
        [blob],
        file.name.replace(/\.[^.]+$/, '.webp'),
        { type: 'image/webp' },
      )
    } catch {
      // Fallback: upload original if canvas fails (e.g. HEIC on older browsers)
      toUpload = file
    }
  }

  const fd = new FormData()
  fd.append('file', toUpload)

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  })

  if (!res.ok) throw new Error(`Upload failed (${res.status})`)
  const data = await res.json()

  // Prefer client-extracted EXIF (more reliable since server receives WebP)
  return { url: data.url, exif: exif ?? data.exif ?? null }
}
