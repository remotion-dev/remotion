import {Internals} from 'remotion';
import {DEFAULT_PROPS_PATH_ACTIVE_CLASSNAME} from '../components/RenderModal/SchemaEditor/scroll-to-default-props-path';
import {
	BACKGROUND,
	BLACK,
	BLUE,
	BLUE_HOVERED,
	FOCUS_BOX_SHADOW,
	SPLITTER_COLOR,
	TEXT_SELECTION_BACKGROUND,
	TRANSPARENT,
	WHITE,
} from './colors';
import {FOCUS_VISIBLE_ONLY_CLASS_NAME, makeHoverableCSS} from './hoverable';
import {prismVscDarkPlus} from './prism-vsc-dark-plus';

const inspectorSectionTransitionDuration = 120;
const inspectorSectionTransition = `${inspectorSectionTransitionDuration}ms cubic-bezier(0.16, 1, 0.3, 1)`;

const makeDefaultGlobalCSS = () => {
	const dragAreaFactor = 6;
	const fromMiddle = 50 / dragAreaFactor;

	return `
	  html {
	    overscroll-behavior: none;
	  }

  body {
    overscroll-behavior: none;
    /* Override Chakra UI position: relative on body */
    position: static !important;
  }

  html.__remotion-slide-forward,
  html.__remotion-slide-backward {
    view-transition-name: none;
    --remotion-slide-distance: 15%;
  }

  html.__remotion-slide-backward {
    --remotion-slide-distance: -15%;
  }

  html.__remotion-slide-forward::view-transition,
  html.__remotion-slide-backward::view-transition {
    pointer-events: none;
  }

  @keyframes remotion-slide-out {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(calc(-1 * var(--remotion-slide-distance))); }
  }

  @keyframes remotion-slide-in {
    from { opacity: 0; transform: translateX(var(--remotion-slide-distance)); }
    to { opacity: 1; transform: translateX(0); }
  }

  .__remotion-inspector-section-title {
    --remotion-disclosure-transition: transform ${inspectorSectionTransition};
  }

  .__remotion-inspector-section-content {
    transition: grid-template-rows ${inspectorSectionTransition}, opacity ${inspectorSectionTransition}, visibility 0s ${inspectorSectionTransitionDuration}ms;
  }

  .__remotion-inspector-section-clip {
    mask-repeat: no-repeat;
    -webkit-mask-repeat: no-repeat;
    mask-size: 100% 100%;
    -webkit-mask-size: 100% 100%;
    transition: mask-size ${inspectorSectionTransition};
  }

  .__remotion-inspector-section-content[data-animating="true"] > .__remotion-inspector-section-clip {
    mask-image: linear-gradient(to bottom, black calc(100% - 40px), transparent);
    -webkit-mask-image: linear-gradient(to bottom, black calc(100% - 40px), transparent);
  }

  .__remotion-inspector-section-content[data-expanded="true"] > .__remotion-inspector-section-clip {
    mask-size: 100% calc(100% + 40px);
    -webkit-mask-size: 100% calc(100% + 40px);
  }

  .__remotion-inspector-section-content[data-expanded="true"] {
    transition-delay: 0s;
  }

  @media (prefers-reduced-motion: reduce) {
    .__remotion-inspector-section-title {
      --remotion-disclosure-transition: none;
    }

    .__remotion-inspector-section-content,
    .__remotion-inspector-section-clip {
      transition: none;
    }
  }

  .remotion-splitter,
  html[data-remotion-high-contrast] .remotion-splitter {
    user-select: none;
    -webkit-user-select: none;
    background-image: linear-gradient(
      var(--remotion-splitter-direction),
      ${TRANSPARENT} ${50 - fromMiddle}%,
      ${SPLITTER_COLOR} ${50 - fromMiddle}%,
      ${SPLITTER_COLOR} ${50 + fromMiddle}%,
      ${TRANSPARENT} ${50 + fromMiddle}%
    );
  }

  .remotion-preview-toolbar-splitter {
    opacity: 0;
  }

  html[data-remotion-high-contrast] .remotion-preview-toolbar {
    --remotion-preview-toolbar-line-color: ${SPLITTER_COLOR};
  }

  .remotion-splitter-horizontal {
    --remotion-splitter-direction: to bottom;
    cursor: row-resize;
    transform: scaleY(${dragAreaFactor});
  }

  .remotion-splitter-vertical {
    --remotion-splitter-direction: to right;
    cursor: col-resize;
    transform: scaleX(${dragAreaFactor});
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

  .css-reset::selection,
  .css-reset *::selection,
  pre[class*="language-"]::selection,
  code[class*="language-"]::selection,
  pre[class*="language-"] *::selection,
  code[class*="language-"] *::selection {
    background-color: ${TEXT_SELECTION_BACKGROUND};
    color: ${WHITE};
    text-shadow: none;
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
