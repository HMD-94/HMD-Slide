export interface BuiltInWallpaper {
  id: string;
  name: string;
  category: 'dark' | 'abstract' | 'gradient' | 'light' | 'geometric';
  type: 'gradient' | 'image';
  previewCss: string;
  backgroundData: {
    type: 'solid' | 'gradient' | 'image';
    color: string;
    gradient?: {
      from: string;
      to: string;
      direction: string;
      angle?: number;
    };
    imageUrl?: string;
  };
}

export interface GradientPreset {
  id: string;
  name: string;
  from: string;
  to: string;
  angle: number;
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  { id: 'cyberpunk', name: 'Cyber Neon', from: '#4f46e5', to: '#ec4899', angle: 135 },
  { id: 'sunset', name: 'Coucher de Soleil', from: '#f97316', to: '#7c3aed', angle: 120 },
  { id: 'ocean-deep', name: 'Océan Abyssal', from: '#0284c7', to: '#0f172a', angle: 180 },
  { id: 'emerald-dark', name: 'Émeraude Sombre', from: '#059669', to: '#064e3b', angle: 135 },
  { id: 'aurora', name: 'Aurore Boréale', from: '#06b6d4', to: '#4f46e5', angle: 90 },
  { id: 'midnight-purple', name: 'Nébuleuse Violette', from: '#6d28d9', to: '#1e1b4b', angle: 160 },
  { id: 'slate-minimal', name: 'Slate Élégant', from: '#334155', to: '#0f172a', angle: 145 },
  { id: 'crimson-fire', name: 'Braise & Flamme', from: '#dc2626', to: '#7f1d1d', angle: 135 },
  { id: 'golden-hour', name: 'Or & Ambre', from: '#f59e0b', to: '#78350f', angle: 120 },
  { id: 'royal-navy', name: 'Bleu Royal Business', from: '#1e40af', to: '#0f172a', angle: 135 },
  { id: 'pure-noir', name: 'Noir & Carbone', from: '#18181b', to: '#09090b', angle: 180 },
  { id: 'rose-blush', name: 'Pastel Rose & Pêche', from: '#f43f5e', to: '#fb923c', angle: 110 },
];

export const BUILT_IN_WALLPAPERS: BuiltInWallpaper[] = [
  {
    id: 'mesh-cosmic',
    name: 'Mesh Spatial & Cyan',
    category: 'abstract',
    type: 'gradient',
    previewCss: 'radial-gradient(circle at 20% 30%, #4338ca 0%, #0f172a 70%), radial-gradient(circle at 80% 80%, #06b6d4 0%, transparent 60%)',
    backgroundData: {
      type: 'gradient',
      color: '#0f172a',
      gradient: {
        from: '#1e1b4b',
        to: '#0f172a',
        direction: '135deg',
        angle: 135,
      },
    },
  },
  {
    id: 'deep-blue-corporate',
    name: 'Bleu Prestige Pro',
    category: 'dark',
    type: 'gradient',
    previewCss: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
    backgroundData: {
      type: 'gradient',
      color: '#0f172a',
      gradient: {
        from: '#1e3a8a',
        to: '#0f172a',
        direction: '135deg',
        angle: 135,
      },
    },
  },
  {
    id: 'cyber-dark',
    name: 'Cyber Glass & Magenta',
    category: 'dark',
    type: 'gradient',
    previewCss: 'linear-gradient(135deg, #4c1d95 0%, #020617 60%, #831843 100%)',
    backgroundData: {
      type: 'gradient',
      color: '#020617',
      gradient: {
        from: '#4c1d95',
        to: '#020617',
        direction: '140deg',
        angle: 140,
      },
    },
  },
  {
    id: 'emerald-mint',
    name: 'Émeraude & Forêt',
    category: 'dark',
    type: 'gradient',
    previewCss: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
    backgroundData: {
      type: 'gradient',
      color: '#022c22',
      gradient: {
        from: '#064e3b',
        to: '#022c22',
        direction: '135deg',
        angle: 135,
      },
    },
  },
  {
    id: 'abstract-geo-dark',
    name: 'Techno Hexagones',
    category: 'geometric',
    type: 'image',
    previewCss: 'radial-gradient(circle, #312e81 0%, #0f172a 100%)',
    backgroundData: {
      type: 'image',
      color: '#0f172a',
      imageUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="562" viewBox="0 0 1000 562"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230f172a"/><stop offset="100%" stop-color="%23020617"/></linearGradient><pattern id="hex" width="40" height="69.282" patternUnits="userSpaceOnUse"><path d="M 40 0 L 20 11.547 L 0 0 L 0 23.094 L 20 34.641 L 40 23.094 Z M 0 34.641 L 20 46.188 L 0 57.735 L 0 80.829 L 20 92.376 L 40 80.829 L 40 57.735 L 20 46.188 Z" fill="none" stroke="%2338bdf8" stroke-width="0.7" opacity="0.12"/></pattern></defs><rect width="100%" height="100%" fill="url(%23bg)"/><rect width="100%" height="100%" fill="url(%23hex)"/><circle cx="200" cy="150" r="180" fill="%236366f1" opacity="0.2" filter="blur(60px)"/><circle cx="850" cy="400" r="220" fill="%2306b6d4" opacity="0.15" filter="blur(70px)"/></svg>`,
    },
  },
  {
    id: 'abstract-waves',
    name: 'Ondes Fluides Lumineuses',
    category: 'abstract',
    type: 'image',
    previewCss: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #0f172a 100%)',
    backgroundData: {
      type: 'image',
      color: '#0f172a',
      imageUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="562" viewBox="0 0 1000 562"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%230f172a"/><stop offset="100%" stop-color="%231e1b4b"/></linearGradient></defs><rect width="1000" height="562" fill="url(%23g1)"/><path d="M0,350 C300,200 600,500 1000,300 L1000,562 L0,562 Z" fill="%236366f1" opacity="0.15"/><path d="M0,420 C400,320 700,550 1000,380 L1000,562 L0,562 Z" fill="%2306b6d4" opacity="0.2"/><path d="M0,480 C300,450 650,530 1000,450 L1000,562 L0,562 Z" fill="%23ec4899" opacity="0.15"/></svg>`,
    },
  },
  {
    id: 'warm-studio',
    name: 'Studio Chaleureux & Ambre',
    category: 'gradient',
    type: 'gradient',
    previewCss: 'linear-gradient(135deg, #78350f 0%, #1e1b4b 100%)',
    backgroundData: {
      type: 'gradient',
      color: '#1e1b4b',
      gradient: {
        from: '#78350f',
        to: '#1e1b4b',
        direction: '135deg',
        angle: 135,
      },
    },
  },
  {
    id: 'clean-light-studio',
    name: 'Minimaliste Blanc & Gris Studio',
    category: 'light',
    type: 'image',
    previewCss: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    backgroundData: {
      type: 'image',
      color: '#f8fafc',
      imageUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="562" viewBox="0 0 1000 562"><defs><linearGradient id="wbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23f8fafc"/><stop offset="100%" stop-color="%23e2e8f0"/></linearGradient><pattern id="gridw" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M 50 0 L 0 0 0 50" fill="none" stroke="%23cbd5e1" stroke-width="0.8" opacity="0.3"/></pattern></defs><rect width="100%" height="100%" fill="url(%23wbg)"/><rect width="100%" height="100%" fill="url(%23gridw)"/><circle cx="850" cy="120" r="260" fill="%236366f1" opacity="0.08" filter="blur(60px)"/><circle cx="150" cy="450" r="220" fill="%230ea5e9" opacity="0.06" filter="blur(60px)"/></svg>`,
    },
  },
  {
    id: 'aurora-borealis',
    name: 'Aurore Boréale Polaire',
    category: 'abstract',
    type: 'image',
    previewCss: 'linear-gradient(135deg, #042f2e 0%, #0f172a 100%)',
    backgroundData: {
      type: 'image',
      color: '#0f172a',
      imageUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="562" viewBox="0 0 1000 562"><rect width="100%" height="100%" fill="%23020617"/><path d="M 0,200 Q 250,50 500,220 T 1000,180 L 1000,562 L 0,562 Z" fill="%2310b981" opacity="0.22" filter="blur(50px)"/><path d="M 0,280 Q 300,100 650,280 T 1000,220 L 1000,562 L 0,562 Z" fill="%2306b6d4" opacity="0.25" filter="blur(40px)"/><path d="M 0,340 Q 400,180 750,320 T 1000,280 L 1000,562 L 0,562 Z" fill="%236366f1" opacity="0.2" filter="blur(50px)"/></svg>`,
    },
  },
  {
    id: 'cosmic-nebula',
    name: 'Cosmos & Étoiles',
    category: 'dark',
    type: 'image',
    previewCss: 'radial-gradient(circle, #581c87 0%, #09090b 100%)',
    backgroundData: {
      type: 'image',
      color: '#09090b',
      imageUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="562" viewBox="0 0 1000 562"><rect width="100%" height="100%" fill="%23030712"/><circle cx="500" cy="280" r="300" fill="%23581c87" opacity="0.3" filter="blur(80px)"/><circle cx="200" cy="400" r="200" fill="%233b82f6" opacity="0.25" filter="blur(70px)"/><circle cx="800" cy="180" r="200" fill="%23ec4899" opacity="0.2" filter="blur(70px)"/><g fill="%23ffffff" opacity="0.7"><circle cx="120" cy="80" r="1.5"/><circle cx="230" cy="220" r="1"/><circle cx="340" cy="90" r="2"/><circle cx="480" cy="160" r="1.5"/><circle cx="650" cy="70" r="2"/><circle cx="780" cy="240" r="1.5"/><circle cx="910" cy="110" r="2"/><circle cx="150" cy="440" r="1.5"/><circle cx="320" cy="380" r="1"/><circle cx="560" cy="470" r="2"/><circle cx="720" cy="410" r="1"/><circle cx="890" cy="480" r="1.5"/></g></svg>`,
    },
  },
  {
    id: 'subtle-carbon',
    name: 'Texture Carbone & Grille',
    category: 'geometric',
    type: 'image',
    previewCss: 'linear-gradient(to right, #111827 0%, #030712 100%)',
    backgroundData: {
      type: 'image',
      color: '#030712',
      imageUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="562" viewBox="0 0 1000 562"><defs><pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="%2364748b" opacity="0.25"/></pattern></defs><rect width="100%" height="100%" fill="%230b0f19"/><rect width="100%" height="100%" fill="url(%23dots)"/></svg>`,
    },
  },
  {
    id: 'peach-blush-glass',
    name: 'Verre Givré Pêche & Lilas',
    category: 'abstract',
    type: 'gradient',
    previewCss: 'linear-gradient(135deg, #831843 0%, #1e1b4b 60%, #431407 100%)',
    backgroundData: {
      type: 'gradient',
      color: '#1e1b4b',
      gradient: {
        from: '#831843',
        to: '#1e1b4b',
        direction: '135deg',
        angle: 135,
      },
    },
  },
];
