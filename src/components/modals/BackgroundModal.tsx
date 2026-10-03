import React, { useState, useRef } from 'react';
import { SlideBackground } from '../../types/slides';
import {
  BUILT_IN_WALLPAPERS,
  GRADIENT_PRESETS,
  BuiltInWallpaper,
  GradientPreset,
} from '../../constants/wallpapers';
import { ColorPicker } from '../common/ColorPicker';
import {
  X,
  Image as ImageIcon,
  Palette,
  Sliders,
  Sparkles,
  Upload,
  Check,
  RotateCw,
  Layers,
  Sun,
  Eye,
} from 'lucide-react';

interface BackgroundModalProps {
  currentBackground: SlideBackground;
  onApplyBackground: (background: SlideBackground, applyToAll: boolean) => void;
  onClose: () => void;
}

const SOLID_PRESETS = [
  '#0f172a', '#020617', '#18181b', '#1e1b4b', '#1e3a8a', '#064e3b',
  '#701a75', '#831843', '#78350f', '#1e293b', '#334155', '#475569',
  '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#fee2e2', '#fef3c7',
  '#ecfdf5', '#f0fdf4', '#eff6ff', '#e0e7ff', '#fae8ff', '#fce7f3',
];

export const BackgroundModal: React.FC<BackgroundModalProps> = ({
  currentBackground,
  onApplyBackground,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'wallpapers' | 'gradients' | 'upload' | 'solid'>('wallpapers');
  const [selectedBg, setSelectedBg] = useState<SlideBackground>(() => ({
    ...currentBackground,
  }));

  // Custom gradient generator state
  const [gradFrom, setGradFrom] = useState<string>(
    currentBackground.gradient?.from || '#4f46e5'
  );
  const [gradTo, setGradTo] = useState<string>(
    currentBackground.gradient?.to || '#ec4899'
  );
  const [gradAngle, setGradAngle] = useState<number>(
    currentBackground.gradient?.angle !== undefined ? currentBackground.gradient.angle : 135
  );

  // Uploaded image state
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>(
    currentBackground.type === 'image' ? currentBackground.imageUrl || '' : ''
  );
  const [imageFit, setImageFit] = useState<'cover' | 'contain' | 'repeat'>(
    (currentBackground as any).imageFit || 'cover'
  );
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.2);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local image file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          setUploadedImageUrl(dataUrl);
          setSelectedBg({
            type: 'image',
            color: '#0f172a',
            imageUrl: dataUrl,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Select a built-in wallpaper
  const handleSelectWallpaper = (wp: BuiltInWallpaper) => {
    setSelectedBg({
      ...wp.backgroundData,
    });
  };

  // Select a gradient preset
  const handleSelectGradientPreset = (preset: GradientPreset) => {
    setGradFrom(preset.from);
    setGradTo(preset.to);
    setGradAngle(preset.angle);
    setSelectedBg({
      type: 'gradient',
      color: preset.to,
      gradient: {
        from: preset.from,
        to: preset.to,
        direction: `${preset.angle}deg`,
        angle: preset.angle,
      },
    });
  };

  // Update custom gradient
  const handleUpdateCustomGradient = (from: string, to: string, angle: number) => {
    setGradFrom(from);
    setGradTo(to);
    setGradAngle(angle);
    setSelectedBg({
      type: 'gradient',
      color: to,
      gradient: {
        from,
        to,
        direction: `${angle}deg`,
        angle,
      },
    });
  };

  // Select a solid color
  const handleSelectSolid = (color: string) => {
    setSelectedBg({
      type: 'solid',
      color,
    });
  };

  // Compute live preview CSS style
  const getPreviewStyle = (): React.CSSProperties => {
    if (selectedBg.type === 'gradient' && selectedBg.gradient) {
      const dir = selectedBg.gradient.angle !== undefined
        ? `${selectedBg.gradient.angle}deg`
        : selectedBg.gradient.direction || '135deg';
      return {
        backgroundImage: `linear-gradient(${dir}, ${selectedBg.gradient.from}, ${selectedBg.gradient.to})`,
      };
    }
    if (selectedBg.type === 'image' && selectedBg.imageUrl) {
      return {
        backgroundImage: `url(${selectedBg.imageUrl})`,
        backgroundSize: imageFit === 'repeat' ? 'auto' : imageFit,
        backgroundRepeat: imageFit === 'repeat' ? 'repeat' : 'no-repeat',
        backgroundPosition: 'center',
      };
    }
    return {
      backgroundColor: selectedBg.color || '#0f172a',
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight font-['Cabinet_Grotesk']">
                Arrière-plan & Fonds d'écran
              </h2>
              <p className="text-xs text-slate-400">
                Fonds intégrés, importation d'images de votre appareil et dégradés personnalisés
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40 gap-2">
          {[
            { id: 'wallpapers', label: 'Fonds d’écran intégrés', icon: Sparkles },
            { id: 'gradients', label: 'Dégradés personnalisables', icon: Sliders },
            { id: 'upload', label: 'Importer une image (Fichier)', icon: Upload },
            { id: 'solid', label: 'Couleur unie', icon: Palette },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                  isActive
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body & Split View */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Tab 1: Built-in Wallpapers */}
            {activeTab === 'wallpapers' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Galerie de fonds d’écran professionnels
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">12 fonds inclus</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {BUILT_IN_WALLPAPERS.map((wp) => {
                    const isSelected =
                      (wp.type === 'gradient' &&
                        selectedBg.type === 'gradient' &&
                        selectedBg.gradient?.from === wp.backgroundData.gradient?.from &&
                        selectedBg.gradient?.to === wp.backgroundData.gradient?.to) ||
                      (wp.type === 'image' &&
                        selectedBg.type === 'image' &&
                        selectedBg.imageUrl === wp.backgroundData.imageUrl);

                    return (
                      <button
                        key={wp.id}
                        type="button"
                        onClick={() => handleSelectWallpaper(wp)}
                        className={`flex flex-col rounded-xl overflow-hidden border p-1.5 transition-all group text-left ${
                          isSelected
                            ? 'border-cyan-400 ring-2 ring-cyan-500/50 bg-slate-800'
                            : 'border-slate-800 hover:border-slate-600 bg-slate-950/60'
                        }`}
                      >
                        <div
                          className="w-full aspect-video rounded-lg relative overflow-hidden shadow-inner flex items-end p-2 border border-white/10"
                          style={{
                            background: wp.previewCss,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        >
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-200 mt-1.5 px-1 truncate block group-hover:text-white">
                          {wp.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 2: Customizable Gradients */}
            {activeTab === 'gradients' && (
              <div className="space-y-5">
                {/* Live Custom Gradient Builder */}
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block">
                    Générateur de Dégradé sur-mesure
                  </span>

                  <div className="grid grid-cols-2 gap-4">
                    <ColorPicker
                      label="Couleur de départ"
                      color={gradFrom}
                      onChange={(c) => handleUpdateCustomGradient(c, gradTo, gradAngle)}
                    />
                    <ColorPicker
                      label="Couleur d'arrivée"
                      color={gradTo}
                      onChange={(c) => handleUpdateCustomGradient(gradFrom, c, gradAngle)}
                    />
                  </div>

                  {/* Angle slider */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">Angle d'orientation</span>
                      <span className="font-mono text-cyan-400 font-bold">{gradAngle}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="5"
                      value={gradAngle}
                      onChange={(e) =>
                        handleUpdateCustomGradient(gradFrom, gradTo, parseInt(e.target.value) || 0)
                      }
                      className="w-full accent-cyan-400"
                    />

                    {/* Quick angle buttons */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {[
                        { label: '0° →', val: 90 },
                        { label: '45° ↗', val: 45 },
                        { label: '90° ↓', val: 180 },
                        { label: '135° ↘', val: 135 },
                        { label: '270° ↑', val: 0 },
                      ].map((ang) => (
                        <button
                          key={ang.label}
                          type="button"
                          onClick={() => handleUpdateCustomGradient(gradFrom, gradTo, ang.val)}
                          className={`px-2 py-1 rounded text-[10px] font-mono font-medium border transition-colors ${
                            gradAngle === ang.val
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {ang.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Gradient Presets */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Modèles de dégradés pré-configurés
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {GRADIENT_PRESETS.map((gp) => {
                      const isSelected =
                        selectedBg.type === 'gradient' &&
                        selectedBg.gradient?.from === gp.from &&
                        selectedBg.gradient?.to === gp.to;

                      return (
                        <button
                          key={gp.id}
                          type="button"
                          onClick={() => handleSelectGradientPreset(gp)}
                          className={`p-2 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                            isSelected
                              ? 'border-cyan-400 bg-cyan-950/30'
                              : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                          }`}
                        >
                          <div
                            className="w-8 h-8 rounded-lg shrink-0 shadow-sm border border-white/20"
                            style={{
                              backgroundImage: `linear-gradient(${gp.angle}deg, ${gp.from}, ${gp.to})`,
                            }}
                          />
                          <div className="min-w-0">
                            <span className="text-[11px] font-semibold text-white truncate block">
                              {gp.name}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400">
                              {gp.angle}°
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Upload Image File */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-cyan-400 rounded-2xl p-8 text-center cursor-pointer bg-slate-950/40 hover:bg-slate-900/40 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 mx-auto mb-3 group-hover:scale-105 group-hover:border-cyan-400 group-hover:text-cyan-400 transition-all">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">
                    Choisir un fichier image sur votre ordinateur
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Prend en charge JPG, PNG, WebP, SVG. Cliquez pour parcourir vos fichiers.
                  </p>
                </div>

                {uploadedImageUrl && (
                  <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Image importée</span>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedImageUrl('');
                          setSelectedBg({ type: 'solid', color: '#0f172a' });
                        }}
                        className="text-xs text-red-400 hover:text-red-300 font-medium"
                      >
                        Retirer l'image
                      </button>
                    </div>

                    {/* Fit Options */}
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1 font-medium">
                        Disposition de l'image
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'cover', label: 'Remplir (Couvrir)' },
                          { id: 'contain', label: 'Ajuster (Entier)' },
                          { id: 'repeat', label: 'Répéter (Mosaïque)' },
                        ].map((fit) => (
                          <button
                            key={fit.id}
                            type="button"
                            onClick={() => {
                              setImageFit(fit.id as any);
                              setSelectedBg((prev) => ({
                                ...prev,
                                type: 'image',
                                imageUrl: uploadedImageUrl,
                                imageFit: fit.id as any,
                              }));
                            }}
                            className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                              imageFit === fit.id
                                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {fit.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Solid Colors */}
            {activeTab === 'solid' && (
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block">
                  Couleurs unies de fond
                </span>

                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                  {SOLID_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleSelectSolid(c)}
                      className={`aspect-square rounded-xl border transition-all relative ${
                        selectedBg.type === 'solid' && selectedBg.color === c
                          ? 'border-cyan-400 scale-110 shadow-lg'
                          : 'border-white/10 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                    >
                      {selectedBg.type === 'solid' && selectedBg.color === c && (
                        <Check
                          className={`w-3.5 h-3.5 absolute inset-0 m-auto stroke-[3] ${
                            c === '#ffffff' || c.startsWith('#f') ? 'text-slate-900' : 'text-white'
                          }`}
                        />
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <ColorPicker
                    label="Couleur unie personnalisée"
                    color={selectedBg.color || '#0f172a'}
                    onChange={(c) => handleSelectSolid(c)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Live Preview Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  Aperçu de la diapositive
                </span>
                <span className="text-[10px] text-slate-500 font-mono">16:9</span>
              </div>

              {/* Slide Preview Canvas */}
              <div
                className="w-full aspect-video rounded-xl shadow-2xl p-4 flex flex-col justify-between border border-white/15 relative overflow-hidden transition-all"
                style={getPreviewStyle()}
              >
                {/* Simulated Content */}
                <div className="space-y-1">
                  <div className="w-2/3 h-4 bg-white/90 rounded font-bold shadow-sm" />
                  <div className="w-1/3 h-2 bg-white/50 rounded" />
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-12 h-6 rounded bg-indigo-500/80 shadow" />
                  <div className="w-12 h-6 rounded bg-cyan-500/80 shadow" />
                </div>
              </div>
            </div>

            {/* Info details */}
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Type sélectionné :</span>
                <span className="font-semibold text-white capitalize">{selectedBg.type}</span>
              </div>
              {selectedBg.type === 'gradient' && (
                <div className="flex justify-between">
                  <span>Dégradé :</span>
                  <span className="font-mono text-cyan-300">
                    {selectedBg.gradient?.angle !== undefined ? `${selectedBg.gradient.angle}°` : selectedBg.gradient?.direction}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              const defaultSolid: SlideBackground = { type: 'solid', color: '#0f172a' };
              setSelectedBg(defaultSolid);
              onApplyBackground(defaultSolid, false);
            }}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium"
          >
            Réinitialiser au fond sombre par défaut
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onApplyBackground(selectedBg, true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-colors border border-slate-700"
              title="Appliquer cet arrière-plan à l'ensemble des diapositives du projet"
            >
              Appliquer à toutes les diapos
            </button>

            <button
              type="button"
              onClick={() => onApplyBackground(selectedBg, false)}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all"
            >
              Appliquer à cette diapositive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
