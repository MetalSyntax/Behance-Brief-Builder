import type { Project } from '../types/project.types'
import { themes } from '../themes'

export function exportProjectToHTML(project: Project, lang = 'en'): string {
  const activeTheme = project.theme === 'custom' 
    ? (project.customTheme || {
        '--bg': '#0f0f12',
        '--bg-section': '#16161f',
        '--bg-card': '#20202e',
        '--text': '#ffffff',
        '--text-muted': '#a1a1aa',
        '--accent': '#8b5cf6',
        '--border': 'rgba(255,255,255,0.08)',
        '--font-display': "'Inter', sans-serif",
        '--font-body': "'Inter', sans-serif",
        '--radius': '12px',
        '--section-w': '1600px',
      }) 
    : themes[project.theme as Exclude<typeof project.theme, 'custom'>]
  
  // Build variables string
  const cssVariables = Object.entries(activeTheme)
    .map(([key, val]) => `    ${key}: ${val};`)
    .join('\n')

  // Generate Font imports based on theme
  const fontLink = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Inter:wght@100..900&family=Manrope:wght@200..800&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Sora:wght@100..800&family=Space+Grotesk:wght@300..700&display=swap');`

  // Build HTML sections string
  const sortedSections = [...project.sections]
    .filter(s => s.visible)
    .sort((a, b) => a.order - b.order)

  const getDecorElementsHtml = (decorElements: boolean, decorType?: string, theme?: string) => {
    if (!decorElements) return ''
    const type = decorType || (
      theme === 'brutalist-light' || theme === 'flat-design-light' ? 'brutalist-star' :
      theme === 'cyberpunk' || theme === 'neon-noir' ? 'grid' :
      theme === 'minimal' || theme === 'charcoal-mono' ? 'crosses' : 'glow'
    )

    switch (type) {
      case 'grid':
        return `
        <div style="position: absolute; inset: 0; pointer-events: none; opacity: 0.15; overflow: hidden; z-index: 1;">
          <div style="position: absolute; inset: 0; background: linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px); background-size: 40px 40px; transform: perspective(500px) rotateX(60deg) scale(2) translateY(-20%); transform-origin: top center;"></div>
        </div>`
      case 'dots':
        return `<div style="position: absolute; right: 40px; top: 50%; transform: translateY(-50%); width: 320px; height: 320px; background: radial-gradient(var(--accent) 15%, transparent 16%); background-size: 24px 24px; opacity: 0.15; pointer-events: none; display: block; z-index: 1;"></div>`
      case 'brutalist-star':
        return `
        <div style="position: absolute; right: 96px; top: 50%; transform: translateY(-50%); width: 192px; height: 192px; pointer-events: none; filter: drop-shadow(6px 6px 0px rgba(0,0,0,0.8)); z-index: 1;">
          <svg viewBox="0 0 100 100" fill="var(--accent)" stroke="black" stroke-width="2.5" style="width: 100%; height: 100%;">
            <path d="M50 0 L55 35 L90 35 L60 55 L70 90 L50 70 L30 90 L40 55 L10 35 L45 35 Z" />
          </svg>
        </div>`
      case 'retro-shape':
        return `
        <div style="position: absolute; right: 64px; top: 50%; transform: translateY(-50%) scale(0.75); width: 256px; height: 256px; pointer-events: none; z-index: 1;">
          <div style="position: absolute; width: 160px; height: 160px; border-radius: 50%; border: 4px solid black; background: #f1c40f; transform: rotate(12deg); box-shadow: 6px 6px 0px #000000; top: -16px; left: -16px;"></div>
          <div style="position: absolute; width: 160px; height: 160px; border: 4px solid black; background: #3498db; transform: rotate(-12deg); box-shadow: 6px 6px 0px #000000; top: 48px; left: 64px;"></div>
          <div style="position: absolute; width: 0; height: 0; border-left: 60px solid transparent; border-right: 60px solid transparent; border-bottom: 100px solid #e74c3c; filter: drop-shadow(4px 4px 0px #000000); top: 16px; left: 40px;"></div>
        </div>`
      case 'abstract-wave':
        return `
        <div style="position: absolute; right: 0; top: 0; bottom: 0; width: 33%; opacity: 0.25; pointer-events: none; overflow: hidden; z-index: 1;">
          <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; stroke: var(--accent); fill: none; stroke-width: 1px;">
            <path d="M0,10 Q20,30 40,10 T80,10 T120,30" />
            <path d="M0,25 Q25,45 50,25 T100,25 T150,45" />
            <path d="M0,40 Q30,60 60,40 T120,40 T180,60" />
            <path d="M0,55 Q35,75 70,55 T140,55 T210,75" />
            <path d="M0,70 Q40,90 80,70 T160,70 T240,90" />
          </svg>
        </div>`
      case 'isometric-cube':
        return `
        <div style="position: absolute; right: 112px; top: 50%; transform: translateY(-50%); width: 192px; height: 192px; pointer-events: none; opacity: 0.4; z-index: 1;">
          <svg viewBox="0 0 120 120" fill="none" stroke="var(--accent)" stroke-width="1.5" style="width: 100%; height: 100%;">
            <polygon points="60,20 100,40 100,80 60,100 20,80 20,40" />
            <line x1="60" y1="20" x2="60" y2="100" />
            <line x1="20" y1="40" x2="60" y2="60" />
            <line x1="100" y1="40" x2="60" y2="60" />
          </svg>
        </div>`
      case 'crosses':
        return `
        <div style="position: absolute; right: 48px; top: 50%; transform: translateY(-50%); width: 256px; height: 256px; pointer-events: none; opacity: 0.2; z-index: 1;">
          <div style="width: 100%; height: 100%; display: grid; grid-template-columns: repeat(6, 1fr); grid-template-rows: repeat(6, 1fr); text-align: center; color: #7f7f7f; font-family: monospace; font-size: 10px;">
            ${Array.from({ length: 36 }).map(() => '<div>+</div>').join('')}
          </div>
        </div>`
      case 'stripes':
        return `<div style="position: absolute; right: 0; top: 0; bottom: 0; width: 192px; background: repeating-linear-gradient(45deg,transparent,transparent 15px,var(--accent) 15px,var(--accent) 18px); opacity: 0.1; pointer-events: none; z-index: 1;"></div>`
      case 'noise-overlay':
        return `<div style="position: absolute; inset: 0; background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E'); opacity: 0.02; pointer-events: none; z-index: 1;"></div>`
      case 'glow':
      default:
        return `<div class="decor-blob"></div>`
    }
  }

  const wrap = (tag: string, content: string | undefined, className = '', inlineStyle = '') => {
    if (!content || content.trim() === '' || content.trim() === '<br>') return ''
    const classAttr = className ? ` class="${className}"` : ''
    const styleAttr = inlineStyle ? ` style="${inlineStyle}"` : ''
    return `<${tag}${classAttr}${styleAttr}>${content.replace(/\n/g, '<br>')}</${tag}>`
  }

  const renderedSections = sortedSections.map((section) => {
    const { type, data, style } = section
    const fontOverride = style.displayFont && style.displayFont !== 'default'
      ? ` --font-display: '${style.displayFont}', sans-serif;`
      : ''
    const secStyleAttr = `style="background: ${style.background}; color: ${style.textColor}; padding: ${style.padding || '100px 80px'}; width: ${style.width || '1600px'};${fontOverride}"`

    switch (type) {
      case 'cover':
        return `
        <div class="section-container" ${secStyleAttr}>
          ${getDecorElementsHtml(data.decorElements, data.decorType, project.theme)}
          <div class="section-content ${data.layout === 'centered' ? 'text-center items-center' : 'text-left items-start'}" style="position: relative; z-index: 2;">
            ${data.pageCounter ? wrap('div', data.pageCounter, 'page-counter') : ''}
            ${wrap('span', data.eyebrow, 'eyebrow')}
            ${wrap('h1', data.title, `title font-display ${data.titleSize === 'display' ? 'text-xl' : data.titleSize === 'xxl' ? 'text-lg' : 'text-md'}`)}
            ${wrap('p', data.subtitle, 'subtitle font-body')}
          </div>
        </div>`
        
      case 'overview':
        return `
        <div class="section-container" ${secStyleAttr}>
          <div class="section-content-grid grid-12">
            <div class="col-8">
              <div class="section-header">
                ${wrap('span', data.sectionNumber, 'section-number')}
                ${wrap('h2', data.title, 'section-title font-display')}
              </div>
              ${wrap('p', data.contextText, 'overview-text font-body')}
            </div>
            <div class="col-4 metrics-grid">
              ${(data.metrics || []).map((m: any) => `
                <div class="metric-card">
                  ${wrap('div', m.label, 'metric-label')}
                  ${wrap('div', m.value, 'metric-value font-mono')}
                </div>
              `).join('')}
            </div>
          </div>
        </div>`
        
      case 'color-palette':
        return `
        <div class="section-container" ${secStyleAttr}>
          <div class="section-content">
            <div class="section-header">
              ${wrap('span', data.sectionNumber, 'section-number')}
              ${wrap('h2', data.title, 'section-title font-display')}
            </div>
            <div class="colors-${data.layout === 'horizontal-strip' ? 'strip' : 'grid'}">
              ${(data.colors || []).map((c: any) => `
                <div class="color-card">
                  <div class="color-swatch" style="background-color: ${c.hex};"></div>
                  ${wrap('div', c.name, 'color-name')}
                  ${wrap('div', c.hex, 'color-hex font-mono')}
                  ${wrap('div', c.role, 'color-role')}
                </div>
              `).join('')}
            </div>
          </div>
        </div>`
        
      case 'mockups':
        const gridClass = data.layout === 'grid-3' ? 'grid-3' : data.layout === 'grid-4' ? 'grid-4' : data.layout === 'centered-large' ? 'centered-large' : data.layout === 'scattered' ? 'scattered' : 'grid-2'
        return `
        <div class="section-container" ${secStyleAttr}>
          <div class="section-content">
            <div class="section-header">
              ${wrap('span', data.sectionNumber, 'section-number')}
              ${wrap('h2', data.title, 'section-title font-display')}
            </div>
            ${wrap('p', data.description, 'section-desc font-body')}
            <div class="mockups-container ${gridClass}">
              ${(data.mockups || []).map((mock: any, idx: number) => `
                <div class="mockup-item device-${mock.deviceFrame}" style="display: flex; flex-direction: column; align-items: center; justify-content: space-between; gap: 12px; height: 100%;">
                  <div style="flex: 1; width: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; min-height: 0; position: relative;">
                    ${mock.image 
                      ? `<img src="${mock.image}" alt="${mock.alt || ''}" style="max-height: 100%; max-width: 100%; object-fit: contain;">` 
                      : `
                      <div class="mockup-placeholder">
                        <div class="device-frame-outline"></div>
                        <span>${mock.alt || `Mockup ${idx + 1}`}</span>
                      </div>`
                    }
                  </div>
                  ${wrap('div', mock.caption, 'mockup-caption', 'font-size: 11px; opacity: 0.6; font-weight: 500; font-family: var(--font-body); text-align: center; width: 100%; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px; margin-top: auto;')}
                </div>
              `).join('')}
            </div>
          </div>
        </div>`
        
      case 'footer':
        return `
        <div class="section-container" ${secStyleAttr}>
          <div class="footer-content">
            <div>
              ${wrap('h3', data.authorName, 'footer-author font-display')}
              <p class="footer-meta font-body">
                ${data.authorRole ? data.authorRole : ''}
                ${data.authorRole && data.year ? ' &middot; ' : ''}
                ${data.year ? data.year : ''}
              </p>
            </div>
            <div class="footer-links">
              ${(data.socialLinks || []).map((l: any) => `
                <a href="${l.url}" class="footer-link font-mono">${l.platform}</a>
              `).join('')}
            </div>
          </div>
        </div>`

      case 'problem':
        return `
        <div class="section-container" ${secStyleAttr}>
          <div class="section-content-grid grid-2-col ${data.layout === 'left-image' ? 'reverse' : ''}">
            <div>
              <div class="section-header">
                ${wrap('span', data.sectionNumber, 'section-number')}
                ${wrap('h2', data.title, 'section-title font-display')}
              </div>
              ${wrap('p', data.description, 'body-text font-body')}
            </div>
            <div class="image-wrapper">
              ${data.image ? `<img src="${data.image}">` : '<div class="img-placeholder">Problem Image</div>'}
            </div>
          </div>
        </div>`

      case 'process':
        return `
        <div class="section-container" ${secStyleAttr}>
          <div class="section-content">
            <div class="section-header">
              ${wrap('span', data.sectionNumber, 'section-number')}
              ${wrap('h2', data.title, 'section-title font-display')}
            </div>
            <div class="steps-grid">
              ${(data.steps || []).map((step: any, idx: number) => `
                <div class="step-card">
                  <div class="step-badge">0${idx + 1}</div>
                  ${wrap('h3', step.title, 'step-title font-display')}
                  ${wrap('p', step.description, 'step-desc font-body')}
                </div>
              `).join('')}
            </div>
          </div>
        </div>`

      case 'typography':
        return `
        <div class="section-container" ${secStyleAttr}>
          <div class="section-content">
            <div class="section-header">
              ${wrap('span', data.sectionNumber, 'section-number')}
              ${wrap('h2', data.title, 'section-title font-display')}
            </div>
            <div class="fonts-list">
              ${(data.fonts || []).map((font: any) => `
                <div class="font-item">
                  <div class="font-info">
                    ${wrap('span', font.role, 'font-role font-mono')}
                    ${wrap('h3', font.name, 'font-name')}
                  </div>
                  <div class="font-sample" style="font-family: '${font.name}', sans-serif;">
                    ${font.sample}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>`

      case 'ux-flow':
        return `
        <div class="section-container" ${secStyleAttr}>
          <div class="section-content">
            <div class="section-header">
              ${wrap('span', data.sectionNumber, 'section-number')}
              ${wrap('h2', data.title, 'section-title font-display')}
            </div>
            ${wrap('p', data.description, 'section-desc font-body')}
            <div class="flow-image-wrapper">
              ${data.image ? `<img src="${data.image}">` : '<div class="img-placeholder">UX Flow Map</div>'}
            </div>
          </div>
        </div>`

      case 'results':
        return `
        <div class="section-container" ${secStyleAttr}>
          <div class="section-content-grid grid-2-col">
            <div>
              <div class="section-header">
                ${wrap('span', data.sectionNumber, 'section-number')}
                ${wrap('h2', data.title, 'section-title font-display')}
              </div>
              ${wrap('p', data.description, 'body-text font-body')}
            </div>
            <div class="results-metrics">
              ${(data.metrics || []).map((m: any) => `
                <div class="result-metric-card">
                  ${wrap('div', m.value, 'result-metric-value font-mono')}
                  ${wrap('div', m.label, 'result-metric-label font-mono')}
                </div>
              `).join('')}
            </div>
          </div>
        </div>`

      default:
        return ''
    }
  }).join('\n')

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.title}</title>
  <style>
    ${fontLink}

    :root {
${cssVariables}
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font-body);
      display: flex;
      flex-direction: column;
      align-items: center;
      overflow-x: hidden;
    }

    .font-display {
      font-family: var(--font-display);
    }

    .font-body {
      font-family: var(--font-body);
    }

    .font-mono {
      font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
    }

    /* Layout structure */
    .section-container {
      width: 1600px;
      max-width: 100%;
      margin: 0 auto;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .section-content {
      max-width: 1120px;
      margin: 0 auto;
      width: 100%;
      padding: 0 24px;
      position: relative;
      z-index: 10;
    }

    .section-content-grid {
      max-width: 1120px;
      margin: 0 auto;
      width: 100%;
      padding: 0 24px;
      display: grid;
      gap: 48px;
      align-items: start;
    }

    .grid-12 {
      grid-template-columns: repeat(12, minmax(0, 1fr));
    }

    .col-8 {
      grid-column: span 8 / span 8;
    }

    .col-4 {
      grid-column: span 4 / span 4;
    }

    .grid-2-col {
      grid-template-columns: 1fr 1fr;
    }

    .grid-2-col.reverse {
      direction: rtl;
    }
    .grid-2-col.reverse > * {
      direction: ltr;
    }

    /* Typography utils */
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .items-center { align-items: center; }
    .items-start { align-items: flex-start; }

    /* Elements */
    .decor-blob {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(170,59,255,0.15) 0%, rgba(255,255,255,0) 70%);
      border-radius: 50%;
      filter: blur(40px);
      pointer-events: none;
    }

    .page-counter {
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.1em;
      opacity: 0.6;
      margin-bottom: 24px;
    }

    .eyebrow {
      font-family: var(--font-body);
      font-size: 12px;
      letter-spacing: 0.2em;
      font-weight: 700;
      color: var(--accent);
      margin-bottom: 16px;
      text-transform: uppercase;
    }

    .title {
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -0.02em;
      margin-bottom: 24px;
    }

    .title.text-xl { font-size: 80px; }
    .title.text-lg { font-size: 64px; }
    .title.text-md { font-size: 48px; }

    .subtitle {
      font-size: 20px;
      font-weight: 300;
      line-height: 1.5;
      opacity: 0.8;
      max-width: 680px;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }

    .section-number {
      font-family: var(--font-body);
      font-size: 13px;
      opacity: 0.6;
      border: 1px solid var(--border);
      background-color: rgba(255, 255, 255, 0.03);
      padding: 2px 8px;
      border-radius: 4px;
    }

    .section-title {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.01em;
      text-transform: uppercase;
    }

    .section-desc {
      font-size: 14px;
      opacity: 0.7;
      margin-top: -12px;
      margin-bottom: 32px;
      max-width: 600px;
    }

    .overview-text, .body-text {
      font-size: 18px;
      font-weight: 300;
      line-height: 1.6;
      opacity: 0.9;
    }

    /* Metrics */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 24px;
    }

    .metric-card {
      border-left: 2px solid rgba(170,59,255,0.3);
      padding-left: 16px;
      padding-top: 8px;
      padding-bottom: 8px;
    }

    .metric-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--accent);
      font-weight: 600;
      margin-bottom: 4px;
    }

    .metric-value {
      font-size: 20px;
      font-weight: 700;
      color: var(--text);
    }

    /* Color Palette */
    .colors-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 24px;
    }

    .colors-strip {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }

    .color-card {
      background-color: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 12px;
      padding: 12px;
      display: flex;
      flex-direction: column;
    }

    .colors-strip .color-card {
      flex: 1 1 200px;
    }

    .color-swatch {
      width: 100%;
      height: 96px;
      border-radius: 8px;
      margin-bottom: 12px;
    }

    .color-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 2px;
    }

    .color-hex {
      font-size: 12px;
      color: var(--accent);
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .color-role {
      font-size: 12px;
      opacity: 0.6;
    }

    /* Mockups */
    .mockups-container {
      display: grid;
      gap: 32px;
    }

    .mockups-container.grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .mockups-container.grid-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .mockups-container.grid-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .mockups-container.scattered {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 48px;
      align-items: start;
    }
    .mockups-container.scattered .mockup-item:nth-child(3n+2) {
      transform: translateY(48px);
    }
    .mockups-container.centered-large {
      display: flex;
      flex-direction: column;
      align-items: center;
      max-width: 800px;
      margin: 0 auto;
    }

    .mockup-item {
      background-color: rgba(255,255,255,0.01);
      border: 1px solid rgba(255,255,255,0.04);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      aspect-ratio: 4 / 5;
      overflow: hidden;
    }

    .mockup-item.device-browser {
      aspect-ratio: 16 / 10;
    }

    .mockup-item img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 8px;
    }

    .mockup-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      opacity: 0.4;
    }

    .device-frame-outline {
      width: 64px;
      height: 120px;
      border: 2px solid currentColor;
      border-radius: 12px;
      margin-bottom: 12px;
    }

    .flow-image-wrapper, .image-wrapper {
      background-color: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 16px;
      padding: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }

    .image-wrapper {
      aspect-ratio: 4 / 3;
    }

    .flow-image-wrapper {
      min-height: 400px;
    }

    .img-placeholder {
      opacity: 0.4;
      font-size: 14px;
      font-family: var(--font-body);
    }

    .image-wrapper img, .flow-image-wrapper img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    /* Steps */
    .steps-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 32px;
    }

    .step-card {
      background-color: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 16px;
      padding: 24px;
      position: relative;
    }

    .step-badge {
      font-size: 12px;
      color: var(--accent);
      font-weight: 700;
      margin-bottom: 16px;
    }

    .step-title {
      font-size: 18px;
      color: var(--text);
      margin-bottom: 8px;
    }

    .step-desc {
      font-size: 14px;
      opacity: 0.7;
      line-height: 1.5;
    }

    /* Typography Display */
    .fonts-list {
      display: flex;
      flex-direction: column;
      gap: 48px;
    }

    .font-item {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 32px;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      padding-bottom: 32px;
    }

    .font-item:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .font-role {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--accent);
      font-weight: 600;
      display: block;
      margin-bottom: 8px;
    }

    .font-name {
      font-size: 28px;
      font-weight: 800;
      color: var(--text);
    }

    .font-sample {
      font-size: 40px;
      letter-spacing: 0.05em;
      font-weight: 300;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Results */
    .results-metrics {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 24px;
    }

    .result-metric-card {
      background-color: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 16px;
      padding: 24px;
    }

    .result-metric-value {
      font-size: 40px;
      font-weight: 800;
      color: var(--accent);
      margin-bottom: 8px;
    }

    .result-metric-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      opacity: 0.6;
    }

    /* Footer */
    .footer-content {
      max-width: 1120px;
      margin: 0 auto;
      width: 100%;
      padding: 0 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255,255,255,0.1);
      padding-top: 48px;
    }

    .footer-author {
      font-size: 20px;
      font-weight: 800;
      color: var(--text);
      margin-bottom: 4px;
    }

    .footer-meta {
      font-size: 13px;
      opacity: 0.6;
    }

    .footer-links {
      display: flex;
      gap: 24px;
    }

    .footer-link {
      color: var(--accent);
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .footer-link:hover {
      text-decoration: underline;
    }

    @media (max-width: 1600px) {
      .section-container {
        width: 100%;
      }
    }

    @media (max-width: 768px) {
      .section-content-grid {
        grid-template-columns: 1fr;
      }
      .col-8, .col-4 {
        grid-column: span 12 / span 12;
      }
      .grid-2-col {
        grid-template-columns: 1fr;
      }
      .font-item {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      .footer-content {
        flex-direction: column;
        gap: 24px;
        align-items: flex-start;
      }
      .title.text-xl { font-size: 48px; }
      .title.text-lg { font-size: 40px; }
      .title.text-md { font-size: 32px; }
      .steps-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
${renderedSections}
</body>
</html>`
}
