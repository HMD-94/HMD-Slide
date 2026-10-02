import React from 'react';
import { SlideElement } from '../../types/slides';
import { SHAPE_DEFINITIONS } from '../../constants/shapes';
import * as LucideIcons from 'lucide-react';

interface RenderElementProps {
  element: SlideElement;
  isSelected?: boolean;
  isEditingText?: boolean;
  onTextChange?: (newText: string) => void;
  onFinishEditing?: () => void;
  onDoubleClick?: () => void;
  scale?: number;
}

export const RenderElement: React.FC<RenderElementProps> = ({
  element,
  isSelected,
  isEditingText,
  onTextChange,
  onFinishEditing,
  onDoubleClick,
}) => {
  const {
    type,
    width,
    height,
    content = '',
    color = '#ffffff',
    fontSize = 16,
    fontWeight = '400',
    fontStyle = 'normal',
    fontFamily = 'inherit',
    underline,
    strike,
    textAlign = 'left',
    lineHeight = 1.4,
    highlight,
    shadow,
    shadowColor = 'rgba(0,0,0,0.5)',
    shadowBlur = 10,
    shapeType = 'rect',
    fillType = 'solid',
    fillColor = '#4f46e5',
    gradientStart = '#6366f1',
    gradientEnd = '#ec4899',
    gradientAngle = 45,
    strokeColor = '#ffffff',
    strokeWidth = 0,
    strokeStyle = 'solid',
    borderRadius = 0,
    src,
    objectFit = 'cover',
    brightness = 100,
    contrast = 100,
    saturate = 100,
    blur = 0,
    grayscale = 0,
    sepia = 0,
    tableData,
    headerRow,
    headerBg = '#4f46e5',
    altRowBg = 'rgba(30, 41, 59, 0.4)',
    cellBorderColor = 'rgba(255, 255, 255, 0.15)',
    cellPadding = 8,
    chartType = 'bar',
    chartTitle,
    categories = ['T1', 'T2', 'T3', 'T4'],
    series = [{ name: 'Série 1', data: [10, 20, 30, 40], color: '#6366f1' }],
    showLegend = true,
    showGrid = true,
    iconName,
  } = element;

  // Text rendering
  if (type === 'text') {
    if (isEditingText && onTextChange) {
      return (
        <textarea
          autoFocus
          value={content}
          onChange={(e) => onTextChange(e.target.value)}
          onBlur={onFinishEditing}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              onFinishEditing?.();
            }
          }}
          className="w-full h-full bg-transparent resize-none outline-none border border-indigo-400 p-0 overflow-hidden"
          style={{
            color,
            fontSize: `${fontSize}px`,
            fontWeight,
            fontStyle,
            fontFamily,
            textAlign,
            lineHeight,
            backgroundColor: highlight || 'transparent',
            textDecoration: `${underline ? 'underline ' : ''}${strike ? 'line-through' : ''}`.trim() || undefined,
          }}
        />
      );
    }

    return (
      <div
        onDoubleClick={onDoubleClick}
        className="w-full h-full whitespace-pre-wrap break-words select-none pointer-events-auto"
        style={{
          color,
          fontSize: `${fontSize}px`,
          fontWeight,
          fontStyle,
          fontFamily,
          textAlign,
          lineHeight,
          backgroundColor: highlight || 'transparent',
          textDecoration: `${underline ? 'underline ' : ''}${strike ? 'line-through' : ''}`.trim() || undefined,
          textShadow: shadow ? `0 4px ${shadowBlur}px ${shadowColor}` : undefined,
        }}
      >
        {content || 'Double-cliquez pour saisir du texte...'}
      </div>
    );
  }

  // Shape rendering
  if (type === 'shape') {
    const shapeDef = SHAPE_DEFINITIONS[shapeType] || SHAPE_DEFINITIONS.rect;
    const pathD = shapeDef.renderSvg(width, height, borderRadius);
    const gradId = `shape-grad-${element.id}`;

    let strokeDasharray = undefined;
    if (strokeStyle === 'dashed') strokeDasharray = '6 6';
    if (strokeStyle === 'dotted') strokeDasharray = '2 4';

    return (
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible pointer-events-none"
      >
        {fillType === 'gradient' && (
          <defs>
            <linearGradient id={gradId} gradientTransform={`rotate(${gradientAngle})`}>
              <stop offset="0%" stopColor={gradientStart} />
              <stop offset="100%" stopColor={gradientEnd} />
            </linearGradient>
          </defs>
        )}
        <path
          d={pathD}
          fill={fillType === 'gradient' ? `url(#${gradId})` : fillColor}
          stroke={strokeWidth > 0 ? strokeColor : 'none'}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          style={{
            filter: shadow ? `drop-shadow(0 4px 8px ${shadowColor})` : undefined,
          }}
        />
      </svg>
    );
  }

  // Image rendering
  if (type === 'image') {
    const filterStyle = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) blur(${blur}px) grayscale(${grayscale}%) sepia(${sepia}%)`;
    return (
      <div
        className="w-full h-full overflow-hidden"
        style={{
          borderRadius: `${borderRadius}px`,
          border: strokeWidth > 0 ? `${strokeWidth}px solid ${strokeColor}` : undefined,
          boxShadow: shadow ? `0 8px 20px ${shadowColor}` : undefined,
        }}
      >
        <img
          src={src || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800'}
          alt={element.name}
          className="w-full h-full pointer-events-none select-none"
          style={{
            objectFit,
            filter: filterStyle,
          }}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Table rendering
  if (type === 'table') {
    const rows = tableData || [
      ['En-tête 1', 'En-tête 2'],
      ['Donnée 1', 'Donnée 2'],
    ];
    return (
      <div
        onDoubleClick={onDoubleClick}
        className="w-full h-full overflow-hidden rounded-lg border border-slate-700/60 shadow-lg"
        style={{ background: 'rgba(15, 23, 42, 0.7)' }}
      >
        <table className="w-full h-full border-collapse text-xs text-white">
          <tbody>
            {rows.map((row, rIdx) => (
              <tr
                key={rIdx}
                style={{
                  background:
                    rIdx === 0 && headerRow
                      ? headerBg
                      : rIdx % 2 === 1
                      ? altRowBg
                      : 'transparent',
                }}
              >
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    className="border truncate"
                    style={{
                      borderColor: cellBorderColor,
                      padding: `${cellPadding}px`,
                      fontWeight: rIdx === 0 && headerRow ? '700' : '400',
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Chart rendering
  if (type === 'chart') {
    const maxVal = Math.max(...series.flatMap((s) => s.data), 10);

    return (
      <div
        onDoubleClick={onDoubleClick}
        className="w-full h-full flex flex-col p-4 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-md overflow-hidden select-none"
      >
        {chartTitle && (
          <div className="text-xs font-bold text-slate-100 mb-3 truncate flex items-center justify-between">
            <span>{chartTitle}</span>
            <span className="text-[10px] text-slate-500 font-normal">Double-clic pour éditer</span>
          </div>
        )}

        {/* Chart View */}
        <div className="flex-1 w-full flex items-end gap-3 pt-2 border-b border-slate-700/50 relative">
          {showGrid && (
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-white border-dashed w-full" />
              <div className="border-b border-white border-dashed w-full" />
              <div className="border-b border-white border-dashed w-full" />
            </div>
          )}

          {chartType === 'bar' &&
            categories.map((cat, cIdx) => (
              <div
                key={cIdx}
                className="flex-1 h-full flex flex-col items-center justify-end z-10"
              >
                <div className="w-full flex items-end justify-center gap-1.5 h-[80%]">
                  {series.map((s, sIdx) => {
                    const val = s.data[cIdx] || 0;
                    const pct = Math.min(Math.max((val / maxVal) * 100, 4), 100);
                    return (
                      <div
                        key={sIdx}
                        title={`${s.name}: ${val}`}
                        className="flex-1 max-w-[28px] rounded-t-md transition-all duration-300 relative group cursor-pointer"
                        style={{
                          height: `${pct}%`,
                          backgroundColor: s.color,
                        }}
                      >
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono bg-slate-950 px-1 py-0.5 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                          {val}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <span className="text-[11px] text-slate-400 font-medium mt-2 truncate max-w-full">
                  {cat}
                </span>
              </div>
            ))}

          {chartType === 'line' && (
            <div className="w-full h-full relative flex items-center justify-center">
              <svg width="100%" height="100%" className="overflow-visible">
                {series.map((s, sIdx) => {
                  const points = s.data
                    .map((val, i) => {
                      const x = ((i + 0.5) / categories.length) * (width - 40);
                      const y = height - 70 - (val / maxVal) * (height - 90);
                      return `${x},${y}`;
                    })
                    .join(' ');
                  return (
                    <polyline
                      key={sIdx}
                      fill="none"
                      stroke={s.color}
                      strokeWidth={3}
                      points={points}
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>
            </div>
          )}

          {chartType === 'pie' && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-8 border-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-xs font-bold text-white">Secteurs</span>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="flex flex-wrap items-center justify-center gap-4 mt-3 pt-2">
            {series.map((s, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-300">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="truncate max-w-[100px]">{s.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Icon rendering
  if (type === 'icon') {
    const iconsMap = LucideIcons as unknown as Record<string, React.ElementType>;
    const IconComp = iconName ? iconsMap[iconName] : LucideIcons.Sparkles;
    return (
      <div
        className="w-full h-full flex items-center justify-center select-none"
        style={{ color }}
      >
        {IconComp ? (
          <IconComp style={{ width: '80%', height: '80%', strokeWidth: 1.8 }} />
        ) : (
          <span className="text-3xl">{content || '★'}</span>
        )}
      </div>
    );
  }

  return null;
};
