/**
 * The motion collection — 33 components.
 *
 * The API surface follows Motion Primitives (https://motion-primitives.com,
 * MIT © Julien Thibeaut): same component names, same part names, same prop
 * names wherever the prop still means something here.
 *
 * The implementations are this project's own. Upstream is built on
 * `motion`/framer-motion; this collection has no runtime dependency beyond
 * React, so props typed `Transition`, `Variants`, or `SpringOptions` there
 * become plain numbers and CSS style objects here:
 *
 *   transition   → `duration` in seconds (plus `stagger`/`delay` where useful)
 *   variants     → plain `CSSProperties` objects
 *   SpringOptions→ `{ stiffness, damping, mass }`, run by a small rAF spring
 *
 * Exported from the `taste-is-the-moat/motion` subpath rather than the main
 * `ui` barrel, because `Accordion`, `MorphingDialog`, and `ProgressiveBlur`
 * already exist there with different APIs.
 */

/* ---- Core --------------------------------------------------------------- */
export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  AnimatedBackground,
  AnimatedGroup,
  BorderTrail,
  Disclosure,
  DisclosureTrigger,
  DisclosureContent,
  InView,
  InfiniteSlider,
  TransitionPanel,
} from "./core";
export type {
  AccordionProps,
  AccordionItemProps,
  AccordionTriggerProps,
  AccordionContentProps,
  AnimatedBackgroundProps,
  AnimatedGroupProps,
  AnimatedGroupPreset,
  BorderTrailProps,
  DisclosureProps,
  InViewProps,
  InfiniteSliderProps,
  TransitionPanelProps,
} from "./core";

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNavigation,
  CarouselIndicator,
  useCarousel,
} from "./carousel";
export type {
  CarouselProps,
  CarouselContentProps,
  CarouselItemProps,
  CarouselNavigationProps,
  CarouselIndicatorProps,
} from "./carousel";

/* ---- Pointer-driven ----------------------------------------------------- */
export { Cursor, Magnetic, Spotlight, Tilt } from "./pointer";
export type {
  CursorProps,
  MagneticProps,
  SpotlightProps,
  TiltProps,
} from "./pointer";

/* ---- Text effects ------------------------------------------------------- */
export {
  TextEffect,
  TextLoop,
  TextMorph,
  TextRoll,
  TextScramble,
  TextShimmer,
  TextShimmerWave,
} from "./text";
export type {
  TextEffectProps,
  TextEffectPreset,
  TextLoopProps,
  TextMorphProps,
  TextRollProps,
  TextScrambleProps,
  TextShimmerProps,
  TextShimmerWaveProps,
} from "./text";

/* ---- Number effects ----------------------------------------------------- */
export { AnimatedNumber, SlidingNumber } from "./numbers";
export type { AnimatedNumberProps, SlidingNumberProps } from "./numbers";

/* ---- Interactive elements ----------------------------------------------- */
export {
  Dock,
  DockItem,
  DockLabel,
  DockIcon,
  GlowEffect,
  ImageComparison,
  ImageComparisonImage,
  ImageComparisonSlider,
  ScrollProgress,
  SpinningText,
  ProgressiveBlur,
} from "./interactive";
export type {
  DockProps,
  DockItemProps,
  GlowEffectProps,
  GlowMode,
  GlowBlur,
  ImageComparisonProps,
  ImageComparisonImageProps,
  ScrollProgressProps,
  SpinningTextProps,
  ProgressiveBlurProps,
} from "./interactive";

/* ---- Overlays ----------------------------------------------------------- */
export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogTitle,
  MorphingDialogSubtitle,
  MorphingDialogDescription,
  MorphingDialogImage,
  MorphingDialogClose,
  MorphingPopover,
  MorphingPopoverTrigger,
  MorphingPopoverContent,
} from "./overlays";
export type {
  DialogProps,
  MorphingDialogProps,
  MorphingPopoverProps,
} from "./overlays";

/* ---- Toolbars ----------------------------------------------------------- */
export { ToolbarDynamic, ToolbarExpandable } from "./toolbars";
export type {
  ToolbarDynamicProps,
  ToolbarAction,
  ToolbarExpandableProps,
  ToolbarPanel,
} from "./toolbars";

/* ---- Shared types ------------------------------------------------------- */
export type { SpringOptions } from "./internal";
