import {Internals} from 'remotion';
import {DEFAULT_PROPS_PATH_ACTIVE_CLASSNAME} from '../components/RenderModal/SchemaEditor/scroll-to-default-props-path';
import {
	BACKGROUND,
	BLACK,
	BLUE,
	BLUE_HOVERED,
	FOCUS_BOX_SHADOW,
	TRANSPARENT,
	WHITE,
} from './colors';
import {FOCUS_VISIBLE_ONLY_CLASS_NAME, makeHoverableCSS} from './hoverable';
import {prismVscDarkPlus} from './prism-vsc-dark-plus';

const makeDefaultGlobalCSS = () => {
	const dragAreaFactor = 2;
	const fromMiddle = 50 / dragAreaFactor;

	return `
	  html {
	    overscroll-behavior-y: none;
	  }

  body {
    overscroll-behavior-y: none;
    /* Override Chakra UI position: relative on body */
    position: static !important;
  }

  html.__remotion-inspector-forward,
  html.__remotion-inspector-backward {
    view-transition-name: none;
    --remotion-inspector-slide-distance: 100%;
  }

  html.__remotion-inspector-backward {
    --remotion-inspector-slide-distance: -100%;
  }

  html.__remotion-inspector-forward::view-transition,
  html.__remotion-inspector-backward::view-transition {
    pointer-events: none;
  }

  ::view-transition-group(remotion-inspector) {
    animation: none;
    overflow: clip;
  }

  ::view-transition-old(remotion-inspector),
  ::view-transition-new(remotion-inspector) {
    animation-duration: 75ms;
    animation-timing-function: ease-out;
    animation-fill-mode: both;
    mix-blend-mode: normal;
  }

  ::view-transition-old(remotion-inspector) {
    animation-name: remotion-inspector-slide-out;
  }

  ::view-transition-new(remotion-inspector) {
    animation-name: remotion-inspector-slide-in;
  }

  @keyframes remotion-inspector-slide-out {
    to { transform: translateX(calc(-1 * var(--remotion-inspector-slide-distance))); }
  }

  @keyframes remotion-inspector-slide-in {
    from { transform: translateX(var(--remotion-inspector-slide-distance)); }
  }

  @media (prefers-reduced-motion: reduce) {
    ::view-transition-old(remotion-inspector),
    ::view-transition-new(remotion-inspector) {
      animation: none;
    }
  }

  .remotion-splitter {
    user-select: none;
    -webkit-user-select: none;
  }

  .remotion-splitter-horizontal {
    cursor: row-resize;
    transform: scaleY(${dragAreaFactor});
    background: linear-gradient(
      to bottom,
      ${TRANSPARENT} ${50 - fromMiddle}%,
      ${BLACK} ${50 - fromMiddle}%,
      ${BLACK} ${50 + fromMiddle}%,
      ${TRANSPARENT} ${50 + fromMiddle}%
    );
  }

  .remotion-splitter-vertical {
    cursor: col-resize;
    transform: scaleX(${dragAreaFactor});
    background: linear-gradient(
      to right,
      ${TRANSPARENT} ${50 - fromMiddle}%,
      ${BLACK} ${50 - fromMiddle}%,
      ${BLACK} ${50 + fromMiddle}%,
      ${TRANSPARENT} ${50 + fromMiddle}%
    );
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input:focus,
  textarea:focus,
  button:focus:not(.__remotion_input_dragger):not(.__remotion_color_swatch):not(.__remotion-inspector-section-title):not(.${FOCUS_VISIBLE_ONLY_CLASS_NAME}):not(.__remotion-timeline-expand-arrow-button),
  a:focus {
	    outline: none;
	    box-shadow: ${FOCUS_BOX_SHADOW};
	  }

  .__remotion-composition-selector-item:focus,
  .__remotion-inspector-quick-action:focus,
  .__remotion-inspector-section-title:focus,
  .${FOCUS_VISIBLE_ONLY_CLASS_NAME}:focus,
  .__remotion-timeline-expand-arrow-button:focus {
    outline: none;
    box-shadow: none;
  }

  .__remotion-composition-selector-item:focus-visible,
  .__remotion-inspector-quick-action:focus-visible,
  .__remotion-inspector-section-title:focus-visible,
  .${FOCUS_VISIBLE_ONLY_CLASS_NAME}:focus-visible,
  .__remotion-timeline-expand-arrow-button:focus-visible {
    box-shadow: ${FOCUS_BOX_SHADOW};
  }

  .__remotion_color_swatch:focus {
    outline: none;
  }

	  .__remotion_input_dragger:focus-visible {
	    outline: none;
	    box-shadow: ${FOCUS_BOX_SHADOW};
	  }

	  .__remotion_thumb,
	  .__remotion_thumb::-webkit-slider-thumb {
	    -webkit-appearance: none;
	    -webkit-tap-highlight-color: ${TRANSPARENT};
	  }

	  .__remotion_thumb {
	    appearance: none;
	    background: ${TRANSPARENT};
	    border: 0;
	    height: 100%;
	    left: 0;
	    margin: 0;
	    outline: none;
	    padding: 0;
	    pointer-events: none;
	    position: absolute;
	    top: 0;
	    width: 100%;
	    z-index: 2;
	  }

	  .__remotion_thumb::-moz-range-track {
	    background: ${TRANSPARENT};
	    border: 0;
	    height: 6px;
	  }

	  .__remotion_thumb::-webkit-slider-runnable-track {
	    background: ${TRANSPARENT};
	    border: 0;
	    height: 6px;
	  }

	  /* For Firefox browsers */
	  .__remotion_thumb::-moz-range-thumb {
	    appearance: none;
	    border: 0;
	    border-radius: 50%;
	    cursor: pointer;
	    height: 14px;
	    width: 14px;
	    pointer-events: all;
	    background-color: ${WHITE};
	    position: relative;
	  }

	  /* For Chrome browsers */
	  .__remotion_thumb::-webkit-slider-thumb {
	    border: 0;
	    border-radius: 50%;
	    cursor: pointer;
	    height: 14px;
	    margin-top: -4px;
	    width: 14px;
	    pointer-events: all;
	    background-color: ${WHITE};
	    position: relative;
	  }

	.__remotion_input_dragger:hover > span:first-child {
    color: ${BLUE_HOVERED} !important;
  }

  .${DEFAULT_PROPS_PATH_ACTIVE_CLASSNAME} span {
    color: ${BLUE} !important;
    transition: color 0.2s ease-in-out;
  }

  .__remotion-horizontal-scrollbar.__remotion-canvas-tabs::-webkit-scrollbar {
    height: 0;
  }

  .__remotion-horizontal-scrollbar.__remotion-canvas-tabs:hover::-webkit-scrollbar {
    height: 6px;
  }

  .__remotion-horizontal-scrollbar.__remotion-canvas-tabs::-webkit-scrollbar-track {
    background-color: ${BACKGROUND};
  }

  @-moz-document url-prefix() {
    .__remotion-horizontal-scrollbar.__remotion-canvas-tabs {
      scrollbar-width: none;
    }

    .__remotion-horizontal-scrollbar.__remotion-canvas-tabs:hover {
      scrollbar-width: thin;
      scrollbar-color: ${BLACK} ${BACKGROUND};
    }
  }

  ${makeHoverableCSS()}
  `.trim();
};

let injected = false;

export const injectCSS = () => {
	if (injected) {
		return;
	}

	Internals.CSSUtils.injectCSS(prismVscDarkPlus);
	Internals.CSSUtils.injectCSS(makeDefaultGlobalCSS());
	injected = true;
};
