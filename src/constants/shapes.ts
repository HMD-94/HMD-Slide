import { ShapeType } from '../types/slides';

export interface ShapeDefinition {
  id: ShapeType;
  label: string;
  category: 'base' | 'arrows' | 'symbols' | 'callouts';
  renderSvg: (width: number, height: number, borderRadius?: number) => string;
}

export const SHAPE_DEFINITIONS: Record<ShapeType, ShapeDefinition> = {
  rect: {
    id: 'rect',
    label: 'Rectangle',
    category: 'base',
    renderSvg: (w, h) => `M 0 0 H ${w} V ${h} H 0 Z`,
  },
  'rounded-rect': {
    id: 'rounded-rect',
    label: 'Rectangle arrondi',
    category: 'base',
    renderSvg: (w, h, r = 16) => {
      const radius = Math.min(r, w / 2, h / 2);
      return `M ${radius} 0 H ${w - radius} A ${radius} ${radius} 0 0 1 ${w} ${radius} V ${h - radius} A ${radius} ${radius} 0 0 1 ${w - radius} ${h} H ${radius} A ${radius} ${radius} 0 0 1 0 ${h - radius} V ${radius} A ${radius} ${radius} 0 0 1 ${radius} 0 Z`;
    },
  },
  circle: {
    id: 'circle',
    label: 'Cercle / Disque',
    category: 'base',
    renderSvg: (w, h) => {
      const rx = w / 2;
      const ry = h / 2;
      return `M ${rx} 0 A ${rx} ${ry} 0 1 1 ${rx} ${h} A ${rx} ${ry} 0 1 1 ${rx} 0 Z`;
    },
  },
  ellipse: {
    id: 'ellipse',
    label: 'Ellipse',
    category: 'base',
    renderSvg: (w, h) => {
      const rx = w / 2;
      const ry = h / 2;
      return `M ${rx} 0 A ${rx} ${ry} 0 1 1 ${rx} ${h} A ${rx} ${ry} 0 1 1 ${rx} 0 Z`;
    },
  },
  triangle: {
    id: 'triangle',
    label: 'Triangle',
    category: 'base',
    renderSvg: (w, h) => `M ${w / 2} 0 L ${w} ${h} L 0 ${h} Z`,
  },
  diamond: {
    id: 'diamond',
    label: 'Losange',
    category: 'base',
    renderSvg: (w, h) => `M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${h / 2} Z`,
  },
  star: {
    id: 'star',
    label: 'Étoile',
    category: 'symbols',
    renderSvg: (w, h) => {
      const cx = w / 2;
      const cy = h / 2;
      const outerR = Math.min(w, h) / 2;
      const innerR = outerR * 0.42;
      let path = '';
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        path += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `;
      }
      return path + 'Z';
    },
  },
  heart: {
    id: 'heart',
    label: 'Cœur',
    category: 'symbols',
    renderSvg: (w, h) => {
      return `M ${w / 2} ${h * 0.85} 
        C ${w * 0.1} ${h * 0.55} 0 ${h * 0.3} 0 ${h * 0.18} 
        C 0 ${h * 0.05} ${w * 0.2} 0 ${w * 0.38} 0 
        C ${w * 0.45} 0 ${w / 2} ${h * 0.12} ${w / 2} ${h * 0.12} 
        C ${w / 2} ${h * 0.12} ${w * 0.55} 0 ${w * 0.62} 0 
        C ${w * 0.8} 0 ${w} ${h * 0.05} ${w} ${h * 0.18} 
        C ${w} ${h * 0.3} ${w * 0.9} ${h * 0.55} ${w / 2} ${h * 0.85} Z`;
    },
  },
  'arrow-right': {
    id: 'arrow-right',
    label: 'Flèche droite',
    category: 'arrows',
    renderSvg: (w, h) => {
      const headW = w * 0.35;
      const stemH = h * 0.4;
      const stemY = (h - stemH) / 2;
      return `M 0 ${stemY} H ${w - headW} V 0 L ${w} ${h / 2} L ${w - headW} ${h} V ${stemY + stemH} H 0 Z`;
    },
  },
  'arrow-left': {
    id: 'arrow-left',
    label: 'Flèche gauche',
    category: 'arrows',
    renderSvg: (w, h) => {
      const headW = w * 0.35;
      const stemH = h * 0.4;
      const stemY = (h - stemH) / 2;
      return `M ${w} ${stemY} H ${headW} V 0 L 0 ${h / 2} L ${headW} ${h} V ${stemY + stemH} H ${w} Z`;
    },
  },
  'arrow-up': {
    id: 'arrow-up',
    label: 'Flèche haut',
    category: 'arrows',
    renderSvg: (w, h) => {
      const headH = h * 0.35;
      const stemW = w * 0.4;
      const stemX = (w - stemW) / 2;
      return `M ${w / 2} 0 L ${w} ${headH} H ${stemX + stemW} V ${h} H ${stemX} V ${headH} H 0 Z`;
    },
  },
  'arrow-down': {
    id: 'arrow-down',
    label: 'Flèche bas',
    category: 'arrows',
    renderSvg: (w, h) => {
      const headH = h * 0.35;
      const stemW = w * 0.4;
      const stemX = (w - stemW) / 2;
      return `M ${stemX} 0 H ${stemX + stemW} V ${h - headH} H ${w} L ${w / 2} ${h} L 0 ${h - headH} H ${stemX} Z`;
    },
  },
  callout: {
    id: 'callout',
    label: 'Bulle de dialogue',
    category: 'callouts',
    renderSvg: (w, h) => {
      const bodyH = h * 0.78;
      const r = 12;
      return `M ${r} 0 H ${w - r} A ${r} ${r} 0 0 1 ${w} ${r} V ${bodyH - r} A ${r} ${r} 0 0 1 ${w - r} ${bodyH} H ${w * 0.45} L ${w * 0.25} ${h} L ${w * 0.3} ${bodyH} H ${r} A ${r} ${r} 0 0 1 0 ${bodyH - r} V ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`;
    },
  },
  hexagon: {
    id: 'hexagon',
    label: 'Hexagone',
    category: 'base',
    renderSvg: (w, h) => {
      const w4 = w / 4;
      return `M ${w4} 0 H ${w - w4} L ${w} ${h / 2} L ${w - w4} ${h} H ${w4} L 0 ${h / 2} Z`;
    },
  },
  cloud: {
    id: 'cloud',
    label: 'Nuage',
    category: 'symbols',
    renderSvg: (w, h) => {
      return `M ${w * 0.25} ${h * 0.75} 
        A ${w * 0.15} ${h * 0.2} 0 0 1 ${w * 0.15} ${h * 0.45} 
        A ${w * 0.2} ${h * 0.28} 0 0 1 ${w * 0.45} ${h * 0.25} 
        A ${w * 0.22} ${h * 0.28} 0 0 1 ${w * 0.8} ${h * 0.35} 
        A ${w * 0.18} ${h * 0.25} 0 0 1 ${w * 0.88} ${h * 0.75} Z`;
    },
  },
};

export const COMMON_EMOJIS = [
  '💡', '🚀', '🎯', '✨', '📊', '📈', '⭐', '🔥', '🏆', '💎',
  '✅', '⚡', '💻', '🌍', '🎨', '📱', '🔔', '📌', '🤝', '🧠',
  '❤️', '🎉', '⏳', '🛡️', '⚙️', '🔍', '💬', '📦', '🌟', '👍',
];

export const POPULAR_ICONS = [
  'Presentation', 'Layers', 'Sparkles', 'Target', 'Rocket', 'TrendingUp',
  'BarChart2', 'PieChart', 'CheckCircle', 'AlertCircle', 'Clock', 'Award',
  'Shield', 'Heart', 'Star', 'Folder', 'FileText', 'Image', 'Video',
  'Cpu', 'Database', 'Cloud', 'Globe', 'Zap', 'Lightbulb', 'Compass',
  'MessageSquare', 'Share2', 'Download', 'Settings',
];
