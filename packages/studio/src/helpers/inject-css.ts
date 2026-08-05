import {Internals} from 'remotion';
import {DEFAULT_PROPS_PATH_ACTIVE_CLASSNAME} from '../components/RenderModal/SchemaEditor/scroll-to-default-props-path';
import {
	BLACK,
	BLUE,
	BLUE_HOVERED,
	FOCUS_BOX_SHADOW,
	TRANSPARENT,
	WHITE,
} from './colors';
import {makeHoverableCSS} from './hoverable';

const makeDefaultGlobalCSS = () => {
	const dragAreaFactor = 2;
	const fromMiddle = 50 / dragAreaFactor;

	return `
	  html {
	    --remotion-cli-internals-blue: ${BLUE};
	    --remotion-cli-internals-blue-hovered: ${BLUE_HOVERED};
	    overscroll-behavior-y: none;
	  }

  body {
    overscroll-behavior-y: none;
    /* Override Chakra UI position: relative on body */
    position: static !important;
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
  button:focus:not(.__remotion_input_dragger):not(.__remotion_color_swatch):not(.__remotion-inspector-section-title),
  a:focus {
	    outline: none;
	    box-shadow: ${FOCUS_BOX_SHADOW};
	  }

  .__remotion-composition-selector-item:focus,
  .__remotion-inspector-inline-action:focus,
  .__remotion-inspector-section-title:focus {
    outline: none;
    box-shadow: none;
  }

  .__remotion-composition-selector-item:focus-visible,
  .__remotion-inspector-inline-action:focus-visible,
  .__remotion-inspector-section-title:focus-visible {
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
	    background: transparent;
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
	    background: transparent;
	    border: 0;
	    height: 6px;
	  }

	  .__remotion_thumb::-webkit-slider-runnable-track {
	    background: transparent;
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
    color: var(--remotion-cli-internals-blue-hovered) !important;
  }

  .${DEFAULT_PROPS_PATH_ACTIVE_CLASSNAME} span {
    color: var(--remotion-cli-internals-blue) !important;
    transition: color 0.2s ease-in-out;
  }

  ${makeHoverableCSS()}
  `.trim();
};

let injected = false;

export const injectCSS = () => {
	if (injected) {
		return;
	}

	Internals.CSSUtils.injectCSS(makeDefaultGlobalCSS());
	injected = true;
};
