export interface DetectedColor {
  hex: string
  percentage: number
  role: 'primary' | 'secondary' | 'tertiary' | 'text'
  rgb: { r: number; g: number; b: number }
}

// Convert RGB to HEX
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.min(255, Math.max(0, Math.round(c))).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  return '#' + toHex(r) + toHex(g) + toHex(b)
}

// Convert HEX to RGB
export function hexToRgb(hex: string) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b)
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 }
}

// Compute Euclidean distance between two colors in RGB space
export function colorDistance(
  c1: { r: number; g: number; b: number },
  c2: { r: number; g: number; b: number }
): number {
  return Math.sqrt((c1.r - c2.r) ** 2 + (c1.g - c2.g) ** 2 + (c1.b - c2.b) ** 2)
}

// Compute relative luminance
export function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

// Compute contrast ratio between two relative luminances
export function contrastRatio(lum1: number, lum2: number): number {
  const l1 = Math.max(lum1, lum2)
  const l2 = Math.min(lum1, lum2)
  return (l1 + 0.05) / (l2 + 0.05)
}

// Main image analysis function
export async function detectColorsFromImage(
  imageSource: File | string,
  sampleStep = 12
): Promise<DetectedColor[]> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context could not be created'))
          return
        }

        // Limit canvas dimensions to speed up performance
        const maxDim = 400
        let w = img.width
        let h = img.height
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w)
            w = maxDim
          } else {
            w = Math.round((w * maxDim) / h)
            h = maxDim
          }
        }
        canvas.width = w
        canvas.height = h

        ctx.drawImage(img, 0, 0, w, h)
        const imgData = ctx.getImageData(0, 0, w, h).data
        const colorCounts: { r: number; g: number; b: number; count: number }[] = []

        // Extract and cluster colors
        for (let i = 0; i < imgData.length; i += 4 * sampleStep) {
          const r = imgData[i]
          const g = imgData[i + 1]
          const b = imgData[i + 2]
          const a = imgData[i + 3]

          // Ignore transparent/almost transparent pixels
          if (a < 150) continue

          const currentColor = { r, g, b }
          let foundGroup = false

          // Match color with existing clusters using a distance threshold of 45
          for (const group of colorCounts) {
            if (colorDistance(group, currentColor) < 45) {
              // Merge color to refine cluster center
              const weight = group.count / (group.count + 1)
              group.r = group.r * weight + r * (1 - weight)
              group.g = group.g * weight + g * (1 - weight)
              group.b = group.b * weight + b * (1 - weight)
              group.count++
              foundGroup = true
              break
            }
          }

          if (!foundGroup) {
            colorCounts.push({ r, g, b, count: 1 })
          }
        }

        // Sort by frequency
        colorCounts.sort((a, b) => b.count - a.count)

        // Get top 4 most frequent colors
        const topClusters = colorCounts.slice(0, 4)
        const totalSampledPixels = topClusters.reduce((sum, cluster) => sum + cluster.count, 0)

        if (topClusters.length === 0) {
          resolve([])
          return
        }

        const detected: DetectedColor[] = topClusters.map((cluster) => {
          const hex = rgbToHex(cluster.r, cluster.g, cluster.b)
          const percentage = totalSampledPixels > 0 
            ? Math.round((cluster.count / totalSampledPixels) * 100) 
            : 0

          return {
            hex,
            percentage,
            role: 'primary', // will classify shortly
            rgb: { r: Math.round(cluster.r), g: Math.round(cluster.g), b: Math.round(cluster.b) }
          }
        })

        // Classify roles deterministically based on contrast and frequency:
        // 1. Primary: #1 most frequent color
        // 2. Secondary: #2 most frequent color
        // 3. Tertiary: #3 most frequent color
        // 4. Text: The color from top 4 that has the highest contrast ratio against the Primary color background
        if (detected[0]) detected[0].role = 'primary'
        if (detected[1]) detected[1].role = 'secondary'
        if (detected[2]) detected[2].role = 'tertiary'

        const primaryRgb = detected[0].rgb
        const primaryLum = getLuminance(primaryRgb.r, primaryRgb.g, primaryRgb.b)

        let highestContrastIdx = 0
        let maxContrast = 0

        detected.forEach((col, idx) => {
          const colLum = getLuminance(col.rgb.r, col.rgb.g, col.rgb.b)
          const ratio = contrastRatio(primaryLum, colLum)
          if (ratio > maxContrast) {
            maxContrast = ratio
            highestContrastIdx = idx
          }
        })

        // If the color with highest contrast against Primary is at index highestContrastIdx, we promote it to 'text'
        // This is highly logical because text needs high contrast against the dominant background
        if (detected[highestContrastIdx]) {
          detected[highestContrastIdx].role = 'text'
        }

        // Ensure we always have one primary, secondary, tertiary, and text
        // (If one gets overridden, re-assign remaining to satisfy distinct roles)
        const rolesUsed = new Set<string>()
        detected.forEach(col => rolesUsed.add(col.role))

        const remainingRoles: ('primary' | 'secondary' | 'tertiary' | 'text')[] = []
        if (!rolesUsed.has('primary')) remainingRoles.push('primary')
        if (!rolesUsed.has('secondary')) remainingRoles.push('secondary')
        if (!rolesUsed.has('tertiary')) remainingRoles.push('tertiary')
        if (!rolesUsed.has('text')) remainingRoles.push('text')

        detected.forEach((col, idx) => {
          if (idx !== 0 && idx !== highestContrastIdx && remainingRoles.length > 0) {
            col.role = remainingRoles.shift()!
          }
        })

        resolve(detected)
      } catch (err) {
        reject(err)
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to load image source. If it is an external URL, it might be due to CORS restrictions.'))
    }

    // Set src
    if (imageSource instanceof File) {
      const reader = new FileReader()
      reader.onload = (e) => {
        img.src = e.target?.result as string
      }
      reader.onerror = (err) => reject(err)
      reader.readAsDataURL(imageSource)
    } else {
      img.src = imageSource
    }
  })
}
