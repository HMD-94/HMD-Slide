import { Presentation } from '../types/slides';
import { generateStandaloneHtmlPresentation } from './exportHtml';

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportHmdSlidesProject(presentation: Presentation) {
  const cleanTitle = presentation.title.trim().toLowerCase().replace(/[^a-z0-9_-]/gi, '_') || 'presentation';
  const filename = `${cleanTitle}.hmdslides`;
  const json = JSON.stringify(presentation, null, 2);
  downloadFile(json, filename, 'application/json');
}

export function exportHtmlPresentationFile(presentation: Presentation) {
  const cleanTitle = presentation.title.trim().toLowerCase().replace(/[^a-z0-9_-]/gi, '_') || 'presentation';
  const filename = `${cleanTitle}.html`;
  const html = generateStandaloneHtmlPresentation(presentation);
  downloadFile(html, filename, 'text/html;charset=utf-8');
}

export function exportJsonFile(presentation: Presentation) {
  const cleanTitle = presentation.title.trim().toLowerCase().replace(/[^a-z0-9_-]/gi, '_') || 'presentation';
  const filename = `${cleanTitle}.json`;
  const json = JSON.stringify(presentation, null, 2);
  downloadFile(json, filename, 'application/json');
}

export function importProjectFromFile(file: File): Promise<Presentation> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed && Array.isArray(parsed.slides) && parsed.slides.length > 0) {
          resolve(parsed as Presentation);
        } else {
          reject(new Error('Format de fichier de présentation invalide'));
        }
      } catch (err) {
        reject(new Error('Impossible de lire le fichier (JSON corrompu)'));
      }
    };
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    reader.readAsText(file);
  });
}

export function triggerPrintPdf() {
  window.print();
}

export async function exportCurrentSlideToPng(slideElementId: string, filename: string = 'slide.png') {
  const node = document.getElementById(slideElementId);
  if (!node) return;

  try {
    const rect = node.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    const scale = 2; // High DPI
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(scale, scale);

    // Clone node to sanitize
    const clone = node.cloneNode(true) as HTMLElement;
    // ensure style is fixed
    clone.style.transform = 'none';
    clone.style.margin = '0';
    clone.style.position = 'static';

    const xml = new XMLSerializer().serializeToString(clone);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;">
            ${xml}
          </div>
        </foreignObject>
      </svg>
    `;

    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    img.src = url;
  } catch (err) {
    console.error('Erreur export PNG:', err);
  }
}
