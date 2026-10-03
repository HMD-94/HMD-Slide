export type ElementType =
  | 'text'
  | 'shape'
  | 'image'
  | 'table'
  | 'chart'
  | 'diagram'
  | 'icon'
  | 'connector';

export type ShapeType =
  | 'rect'
  | 'rounded-rect'
  | 'circle'
  | 'ellipse'
  | 'triangle'
  | 'diamond'
  | 'star'
  | 'heart'
  | 'arrow-right'
  | 'arrow-left'
  | 'arrow-up'
  | 'arrow-down'
  | 'callout'
  | 'hexagon'
  | 'cloud';

export type ChartType = 'bar' | 'bar-horizontal' | 'line' | 'pie' | 'donut';

export type AnimationType =
  | 'none'
  | 'fade-in'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'slide-down'
  | 'zoom-in'
  | 'rotate-in'
  | 'bounce-in';

export type AnimationTrigger = 'click' | 'after-previous' | 'with-previous';

export interface ElementAnimation {
  type: AnimationType;
  trigger: AnimationTrigger;
  duration: number; // in seconds
  delay: number; // in seconds
  order: number;
}

export type TransitionType =
  | 'none'
  | 'fade'
  | 'slide'
  | 'push'
  | 'zoom'
  | 'flip';

export interface SlideTransition {
  type: TransitionType;
  duration: number; // in seconds
}

export interface ChartSeries {
  name: string;
  data: number[];
  color: string;
}

export interface DiagramNode {
  id: string;
  label: string;
  sublabel?: string;
  color?: string;
  icon?: string;
}

export interface DiagramConnector {
  from: string;
  to: string;
  label?: string;
}

export interface SlideElement {
  id: string;
  type: ElementType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  locked?: boolean;
  hidden?: boolean;
  animation?: ElementAnimation;

  // Text specific
  content?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: 'normal' | 'italic';
  underline?: boolean;
  strike?: boolean;
  color?: string;
  highlight?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
  letterSpacing?: number;
  bulletType?: 'none' | 'disc' | 'number' | 'arrow';
  shadow?: boolean;
  shadowColor?: string;
  shadowBlur?: number;

  // Shape specific
  shapeType?: ShapeType;
  fillType?: 'solid' | 'gradient';
  fillColor?: string;
  gradientStart?: string;
  gradientEnd?: string;
  gradientAngle?: number;
  strokeColor?: string;
  strokeWidth?: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  borderRadius?: number;

  // Image specific
  src?: string;
  objectFit?: 'contain' | 'cover' | 'fill';
  brightness?: number;
  contrast?: number;
  saturate?: number;
  blur?: number;
  grayscale?: number;
  sepia?: number;

  // Table specific
  tableRows?: number;
  tableCols?: number;
  tableData?: string[][];
  headerRow?: boolean;
  headerBg?: string;
  altRowBg?: string;
  cellBorderColor?: string;
  cellPadding?: number;

  // Chart specific
  chartType?: ChartType;
  chartTitle?: string;
  categories?: string[];
  series?: ChartSeries[];
  showLegend?: boolean;
  showGrid?: boolean;

  // Diagram specific
  diagramType?: 'process' | 'hierarchy' | 'cycle' | 'timeline';
  diagramNodes?: DiagramNode[];
  diagramConnectors?: DiagramConnector[];

  // Icon specific
  iconName?: string;

  // Connector specific
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  startArrow?: boolean;
  endArrow?: boolean;

  // Hyperlink
  linkUrl?: string;
}

export type SlideLayout =
  | 'blank'
  | 'title'
  | 'title-content'
  | 'two-column'
  | 'comparison'
  | 'quote'
  | 'big-number'
  | 'section-header';

export interface SlideBackground {
  type: 'solid' | 'gradient' | 'image';
  color: string;
  gradient?: {
    from: string;
    to: string;
    direction: string;
    angle?: number;
  };
  imageUrl?: string;
  imageFit?: 'cover' | 'contain' | 'repeat';
}

export interface Slide {
  id: string;
  title: string;
  elements: SlideElement[];
  background: SlideBackground;
  layout: SlideLayout;
  notes: string;
  transition: SlideTransition;
  hidden?: boolean;
}

export interface PresentationTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgColor: string;
  bgGradient?: {
    from: string;
    to: string;
    direction: string;
  };
  textColor: string;
  mutedTextColor: string;
  titleFont: string;
  bodyFont: string;
  cardBg: string;
  cardBorder: string;
  isDark: boolean;
}

export interface Presentation {
  id: string;
  title: string;
  aspectRatio: '16:9' | '4:3';
  themeId: string;
  customTheme?: PresentationTheme;
  slides: Slide[];
  createdAt: number;
  updatedAt: number;
  author?: string;
  version: string;
}

export interface ClipboardItem {
  type: 'elements' | 'slide';
  data: SlideElement[] | Slide;
}

export interface EditorSettings {
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
  snapToGuides: boolean;
  showRulers: boolean;
  darkMode: boolean;
  autoSaveInterval: number; // in seconds
}
