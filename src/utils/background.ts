import React from 'react';
import { SlideBackground } from '../types/slides';

/**
 * Returns React inline CSS properties for rendering a slide background accurately
 * across CanvasEditor, PresentationMode, PresenterMode, and Previews.
 */
export function getSlideBackgroundCss(background?: SlideBackground): React.CSSProperties {
  if (!background) {
    return { backgroundColor: '#0f172a' };
  }

  if (background.type === 'gradient' && background.gradient) {
    const dir =
      background.gradient.angle !== undefined
        ? `${background.gradient.angle}deg`
        : background.gradient.direction || '135deg';
    return {
      backgroundImage: `linear-gradient(${dir}, ${background.gradient.from}, ${background.gradient.to})`,
    };
  }

  if (background.type === 'image' && background.imageUrl) {
    const fit = background.imageFit || 'cover';
    return {
      backgroundImage: `url(${background.imageUrl})`,
      backgroundSize: fit === 'repeat' ? 'auto' : fit,
      backgroundRepeat: fit === 'repeat' ? 'repeat' : 'no-repeat',
      backgroundPosition: 'center',
    };
  }

  return {
    backgroundColor: background.color || '#0f172a',
  };
}

/**
 * Returns a CSS string for thumbnail background styles.
 */
export function getSlideBackgroundCssString(background?: SlideBackground): string {
  if (!background) return '#0f172a';
  if (background.type === 'gradient' && background.gradient) {
    const dir =
      background.gradient.angle !== undefined
        ? `${background.gradient.angle}deg`
        : background.gradient.direction || '135deg';
    return `linear-gradient(${dir}, ${background.gradient.from}, ${background.gradient.to})`;
  }
  if (background.type === 'image' && background.imageUrl) {
    const fit = background.imageFit || 'cover';
    if (fit === 'repeat') {
      return `url("${background.imageUrl}") repeat center`;
    }
    return `url("${background.imageUrl}") center/${fit} no-repeat`;
  }
  return background.color || '#0f172a';
}
