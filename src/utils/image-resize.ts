const MAX_DIMENSION = 2048
const JPEG_QUALITY = 0.85

/**
 * Resize an image file if it exceeds MAX_DIMENSION, returning a Blob URL.
 * Converts all formats to JPEG (except PNG with transparency stays PNG).
 */
export function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      let { width, height } = img

      // If image is within limits, just create a fresh object URL from the file
      if (width <= MAX_DIMENSION && height <= MAX_DIMENSION && file.size <= 10 * 1024 * 1024) {
        resolve(URL.createObjectURL(file))
        return
      }

      // Scale down
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Could not create blob from canvas'))
            return
          }
          resolve(URL.createObjectURL(blob))
        },
        'image/jpeg',
        JPEG_QUALITY,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error(`Failed to load image: ${file.name}`))
    }

    img.src = objectUrl
  })
}
