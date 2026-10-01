import { Presentation } from '../types/slides';
import { getThemeById } from '../constants/themes';
import { SHAPE_DEFINITIONS } from '../constants/shapes';

export function generateStandaloneHtmlPresentation(presentation: Presentation): string {
  const activeTheme = getThemeById(presentation.themeId, presentation.customTheme);
  const jsonEscaped = JSON.stringify(presentation).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(presentation.title)} — HMD Slides</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@600;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&family=Montserrat:wght@500;600;700&family=Playfair+Display:ital,wght@0,600;0,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body, html {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #020617;
      color: #f8fafc;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      user-select: none;
    }
    #stage-container {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #020617;
    }
    #slide-viewport {
      position: relative;
      overflow: hidden;
      box-shadow: 0 25px 60px -15px rgba(0,0,0,0.8);
      transform-origin: center center;
      transition: opacity 0.4s ease, transform 0.4s ease;
    }
    .slide-element {
      position: absolute;
      transition: all 0.3s ease;
      box-sizing: border-box;
    }
    /* Controls bar */
    #controls {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 8px 16px;
      border-radius: 9999px;
      opacity: 0;
      transition: all 0.25s ease;
      z-index: 9999;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    #stage-container:hover #controls,
    #controls:hover {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    .btn {
      background: transparent;
      border: none;
      color: #e2e8f0;
      padding: 6px 12px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s, color 0.15s;
    }
    .btn:hover {
      background: rgba(255, 255, 255, 0.12);
      color: #ffffff;
    }
    .btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    #slide-counter {
      font-size: 13px;
      font-variant-numeric: tabular-nums;
      font-weight: 600;
      color: #94a3b8;
      padding: 0 8px;
    }
    /* Notes drawer */
    #notes-modal {
      position: fixed;
      top: 24px;
      right: 24px;
      width: 320px;
      max-height: 400px;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      padding: 16px;
      color: #e2e8f0;
      font-size: 14px;
      line-height: 1.5;
      display: none;
      overflow-y: auto;
      z-index: 10000;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    }
    #notes-modal h4 {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #818cf8;
      margin-bottom: 8px;
    }
    /* Laser pointer */
    #laser-dot {
      position: fixed;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #ef4444;
      box-shadow: 0 0 12px #ef4444, 0 0 24px #ef4444;
      pointer-events: none;
      display: none;
      z-index: 100000;
      transform: translate(-50%, -50%);
    }
    /* Transitions */
    .trans-fade-enter { opacity: 0; }
    .trans-fade-enter-active { opacity: 1; transition: opacity 0.4s ease; }
    .trans-slide-enter { transform: translateX(100%); }
    .trans-slide-enter-active { transform: translateX(0); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    .trans-push-enter { transform: translateY(100%); }
    .trans-push-enter-active { transform: translateY(0); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    .trans-zoom-enter { transform: scale(0.7); opacity: 0; }
    .trans-zoom-enter-active { transform: scale(1); opacity: 1; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
  </style>
</head>
<body>
  <div id="stage-container">
    <div id="slide-viewport"></div>
  </div>

  <div id="laser-dot"></div>

  <div id="controls">
    <button class="btn" id="btn-prev" title="Diapositive précédente (←)">❮ Précédent</button>
    <span id="slide-counter">1 / 1</span>
    <button class="btn" id="btn-next" title="Diapositive suivante (→ / Espace)">Suivant ❯</button>
    <div style="width: 1px; height: 16px; background: rgba(255,255,255,0.2);"></div>
    <button class="btn" id="btn-laser" title="Pointeur laser (L)">🔴 Laser</button>
    <button class="btn" id="btn-notes" title="Notes présentateur (N)">📝 Notes</button>
    <button class="btn" id="btn-fullscreen" title="Plein écran (F)">⛶ Plein écran</button>
  </div>

  <div id="notes-modal">
    <h4>Notes du présentateur</h4>
    <p id="notes-content">Aucune note pour cette diapositive.</p>
  </div>

  <script>
    const presentation = ${jsonEscaped};
    const defaultWidth = 1000;
    const defaultHeight = presentation.aspectRatio === '4:3' ? 750 : 562.5;

    let currentSlideIdx = 0;
    let laserActive = false;
    let notesActive = false;

    const viewport = document.getElementById('slide-viewport');
    const counter = document.getElementById('slide-counter');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const btnLaser = document.getElementById('btn-laser');
    const btnNotes = document.getElementById('btn-notes');
    const btnFullscreen = document.getElementById('btn-fullscreen');
    const notesModal = document.getElementById('notes-modal');
    const notesContent = document.getElementById('notes-content');
    const laserDot = document.getElementById('laser-dot');

    function resizeStage() {
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const scale = Math.min((screenW - 20) / defaultWidth, (screenH - 20) / defaultHeight, 1.6);
      
      viewport.style.width = defaultWidth + 'px';
      viewport.style.height = defaultHeight + 'px';
      viewport.style.transform = 'scale(' + scale + ')';
    }

    window.addEventListener('resize', resizeStage);

    function renderSlide(idx) {
      if (idx < 0 || idx >= presentation.slides.length) return;
      currentSlideIdx = idx;
      const slide = presentation.slides[idx];

      // Update counter & buttons
      counter.textContent = (idx + 1) + ' / ' + presentation.slides.length;
      btnPrev.disabled = idx === 0;
      btnNext.disabled = idx === presentation.slides.length - 1;

      // Update notes
      notesContent.textContent = slide.notes || 'Aucune note pour cette diapositive.';

      // Background
      if (slide.background.type === 'gradient' && slide.background.gradient) {
        viewport.style.background = 'linear-gradient(' + slide.background.gradient.from + ', ' + slide.background.gradient.to + ')';
      } else if (slide.background.type === 'image' && slide.background.imageUrl) {
        viewport.style.background = 'url(' + slide.background.imageUrl + ') center/cover no-repeat';
      } else {
        viewport.style.background = slide.background.color || '#0f172a';
      }

      // Render elements
      viewport.innerHTML = '';
      const elements = slide.elements.slice().sort((a,b) => (a.zIndex || 0) - (b.zIndex || 0));

      elements.forEach(el => {
        if (el.hidden) return;
        const div = document.createElement('div');
        div.className = 'slide-element';
        div.style.left = el.x + 'px';
        div.style.top = el.y + 'px';
        div.style.width = el.width + 'px';
        div.style.height = el.height + 'px';
        div.style.zIndex = el.zIndex || 1;
        div.style.transform = 'rotate(' + (el.rotation || 0) + 'deg)';
        div.style.opacity = el.opacity !== undefined ? el.opacity : 1;

        if (el.type === 'text') {
          div.style.fontFamily = el.fontFamily || 'inherit';
          div.style.fontSize = (el.fontSize || 16) + 'px';
          div.style.fontWeight = el.fontWeight || '400';
          div.style.fontStyle = el.fontStyle || 'normal';
          div.style.color = el.color || '#ffffff';
          div.style.textAlign = el.textAlign || 'left';
          div.style.lineHeight = el.lineHeight || 1.4;
          div.style.whiteSpace = 'pre-wrap';
          if (el.underline) div.style.textDecoration = 'underline';
          if (el.strike) div.style.textDecoration = 'line-through';
          if (el.shadow) div.style.textShadow = '0 4px 12px ' + (el.shadowColor || 'rgba(0,0,0,0.5)');
          div.textContent = el.content || '';
        } else if (el.type === 'shape') {
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('width', '100%');
          svg.setAttribute('height', '100%');
          svg.style.overflow = 'visible';

          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          const d = getShapeSvgPath(el.shapeType || 'rect', el.width, el.height, el.borderRadius || 16);
          path.setAttribute('d', d);

          let fill = el.fillColor || '#4f46e5';
          if (el.fillType === 'gradient' && el.gradientStart && el.gradientEnd) {
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const gradId = 'grad-' + el.id;
            const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            grad.setAttribute('id', gradId);
            grad.setAttribute('x1', '0%'); grad.setAttribute('y1', '0%');
            grad.setAttribute('x2', '100%'); grad.setAttribute('y2', '100%');
            
            const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop1.setAttribute('offset', '0%');
            stop1.setAttribute('stop-color', el.gradientStart);
            
            const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop2.setAttribute('offset', '100%');
            stop2.setAttribute('stop-color', el.gradientEnd);

            grad.appendChild(stop1);
            grad.appendChild(stop2);
            defs.appendChild(grad);
            svg.appendChild(defs);
            fill = 'url(#' + gradId + ')';
          }
          path.setAttribute('fill', fill);

          if (el.strokeWidth && el.strokeWidth > 0) {
            path.setAttribute('stroke', el.strokeColor || '#ffffff');
            path.setAttribute('stroke-width', el.strokeWidth);
          }
          svg.appendChild(path);
          div.appendChild(svg);
        } else if (el.type === 'image' && el.src) {
          const img = document.createElement('img');
          img.src = el.src;
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = el.objectFit || 'cover';
          img.style.borderRadius = (el.borderRadius || 0) + 'px';
          div.appendChild(img);
        } else if (el.type === 'table' && el.tableData) {
          const tbl = document.createElement('table');
          tbl.style.width = '100%';
          tbl.style.height = '100%';
          tbl.style.borderCollapse = 'collapse';
          tbl.style.color = '#f8fafc';
          tbl.style.fontSize = '13px';

          el.tableData.forEach((row, rIdx) => {
            const tr = document.createElement('tr');
            if (rIdx === 0 && el.headerRow) {
              tr.style.background = el.headerBg || '#4f46e5';
              tr.style.fontWeight = '700';
            } else if (rIdx % 2 === 1 && el.altRowBg) {
              tr.style.background = el.altRowBg;
            }
            row.forEach(cell => {
              const td = document.createElement(rIdx === 0 && el.headerRow ? 'th' : 'td');
              td.style.border = '1px solid ' + (el.cellBorderColor || 'rgba(255,255,255,0.15)');
              td.style.padding = (el.cellPadding || 8) + 'px';
              td.textContent = cell;
              tr.appendChild(td);
            });
            tbl.appendChild(tr);
          });
          div.appendChild(tbl);
        } else if (el.type === 'chart') {
          div.innerHTML = renderStandaloneChart(el);
        }

        viewport.appendChild(div);
      });
    }

    function getShapeSvgPath(type, w, h, r) {
      if (type === 'circle' || type === 'ellipse') {
        const rx = w / 2; const ry = h / 2;
        return 'M ' + rx + ' 0 A ' + rx + ' ' + ry + ' 0 1 1 ' + rx + ' ' + h + ' A ' + rx + ' ' + ry + ' 0 1 1 ' + rx + ' 0 Z';
      }
      if (type === 'triangle') return 'M ' + (w/2) + ' 0 L ' + w + ' ' + h + ' L 0 ' + h + ' Z';
      if (type === 'diamond') return 'M ' + (w/2) + ' 0 L ' + w + ' ' + (h/2) + ' L ' + (w/2) + ' ' + h + ' L 0 ' + (h/2) + ' Z';
      if (type === 'arrow-right') {
        const headW = w * 0.35; const stemH = h * 0.4; const stemY = (h - stemH) / 2;
        return 'M 0 ' + stemY + ' H ' + (w - headW) + ' V 0 L ' + w + ' ' + (h/2) + ' L ' + (w - headW) + ' ' + h + ' V ' + (stemY + stemH) + ' H 0 Z';
      }
      if (type === 'rounded-rect') {
        const radius = Math.min(r, w/2, h/2);
        return 'M ' + radius + ' 0 H ' + (w - radius) + ' A ' + radius + ' ' + radius + ' 0 0 1 ' + w + ' ' + radius + ' V ' + (h - radius) + ' A ' + radius + ' ' + radius + ' 0 0 1 ' + (w - radius) + ' ' + h + ' H ' + radius + ' A ' + radius + ' ' + radius + ' 0 0 1 0 ' + (h - radius) + ' V ' + radius + ' A ' + radius + ' ' + radius + ' 0 0 1 ' + radius + ' 0 Z';
      }
      return 'M 0 0 H ' + w + ' V ' + h + ' H 0 Z';
    }

    function renderStandaloneChart(el) {
      const cats = el.categories || ['A', 'B', 'C', 'D'];
      const series = el.series || [{ name: 'Série 1', data: [10, 20, 30, 40], color: '#6366f1' }];
      const maxVal = Math.max(...series.flatMap(s => s.data), 10);
      
      let html = '<div style="width:100%;height:100%;display:flex;flex-direction:column;background:rgba(30,41,59,0.7);padding:14px;border-radius:14px;border:1px solid rgba(255,255,255,0.1);">';
      if (el.chartTitle) {
        html += '<div style="font-size:14px;font-weight:700;color:#f8fafc;margin-bottom:10px;">' + el.chartTitle + '</div>';
      }
      html += '<div style="flex:1;display:flex;align-items:flex-end;gap:12px;padding-top:10px;border-bottom:1px solid rgba(255,255,255,0.15);">';
      
      cats.forEach((cat, cIdx) => {
        html += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end;">';
        html += '<div style="width:100%;display:flex;align-items:flex-end;justify-content:center;gap:4px;height:80%;">';
        series.forEach(s => {
          const val = s.data[cIdx] || 0;
          const pct = Math.min(Math.max((val / maxVal) * 100, 4), 100);
          html += '<div title="' + s.name + ': ' + val + '" style="flex:1;max-width:24px;height:' + pct + '%;background:' + s.color + ';border-radius:4px 4px 0 0;"></div>';
        });
        html += '</div>';
        html += '<div style="font-size:11px;color:#94a3b8;margin-top:6px;">' + cat + '</div>';
        html += '</div>';
      });

      html += '</div></div>';
      return html;
    }

    // Keyboard & Events
    window.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        renderSlide(currentSlideIdx + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        renderSlide(currentSlideIdx - 1);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'l' || e.key === 'L') {
        toggleLaser();
      } else if (e.key === 'n' || e.key === 'N') {
        toggleNotes();
      } else if (e.key === 'Escape') {
        if (notesActive) toggleNotes();
      }
    });

    btnPrev.onclick = () => renderSlide(currentSlideIdx - 1);
    btnNext.onclick = () => renderSlide(currentSlideIdx + 1);
    
    function toggleLaser() {
      laserActive = !laserActive;
      btnLaser.style.background = laserActive ? 'rgba(239,68,68,0.3)' : 'transparent';
      laserDot.style.display = laserActive ? 'block' : 'none';
    }
    btnLaser.onclick = toggleLaser;

    window.addEventListener('mousemove', e => {
      if (laserActive) {
        laserDot.style.left = e.clientX + 'px';
        laserDot.style.top = e.clientY + 'px';
      }
    });

    function toggleNotes() {
      notesActive = !notesActive;
      notesModal.style.display = notesActive ? 'block' : 'none';
      btnNotes.style.background = notesActive ? 'rgba(99,102,241,0.3)' : 'transparent';
    }
    btnNotes.onclick = toggleNotes;

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
    btnFullscreen.onclick = toggleFullscreen;

    // Click on stage to advance
    viewport.addEventListener('click', e => {
      if (e.target.tagName !== 'BUTTON' && !laserActive) {
        renderSlide(currentSlideIdx + 1);
      }
    });

    // Initial render
    resizeStage();
    renderSlide(0);
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
