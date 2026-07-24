import {Internals} from 'remotion';
import {DEFAULT_PROPS_PATH_ACTIVE_CLASSNAME} from '../components/RenderModal/SchemaEditor/scroll-to-default-props-path';
import {
	BLACK,
	BLUE,
	BLUE_HOVERED,
	BORDER_BLACK,
	FOCUS_BOX_SHADOW,
	TRANSPARENT,
	WHITE,
} from './colors';

const makeDefaultGlobalCSS = () => {
	const unhoveredDragAreaFactor = 2;
	const fromMiddle = 50 / unhoveredDragAreaFactor;

	const hoveredDragAreaFactor = 6;
	const fromMiddleHovered = 50 / hoveredDragAreaFactor;

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
	    transform: scaleY(${unhoveredDragAreaFactor});
	    background: linear-gradient(
	      to bottom,
	      ${TRANSPARENT} ${50 - fromMiddle}%,
	      ${BLACK} ${50 - fromMiddle}%,
	      ${BLACK} ${50 + fromMiddle}%,
	      ${TRANSPARENT} ${50 + fromMiddle}%
	    );
	  }

  .remotion-splitter-horizontal.remotion-splitter-active, .remotion-splitter-horizontal.remotion-splitter-hover {
	    background: linear-gradient(
	      to bottom,
	      ${TRANSPARENT} ${50 - fromMiddleHovered}%,
	      var(--remotion-cli-internals-blue) ${50 - fromMiddleHovered}%,
	      var(--remotion-cli-internals-blue) ${50 + fromMiddleHovered}%,
	      ${TRANSPARENT} ${50 + fromMiddleHovered}%
	    );
    cursor: row-resize;
    transform: scaleY(${hoveredDragAreaFactor});
    z-index: 1000;
  }

  .remotion-splitter-vertical {
	    transform: scaleX(${unhoveredDragAreaFactor});
	    background: linear-gradient(
	      to right,
	      ${TRANSPARENT} ${50 - fromMiddle}%,
	      ${BLACK} ${50 - fromMiddle}%,
	      ${BLACK} ${50 + fromMiddle}%,
	      ${TRANSPARENT} ${50 + fromMiddle}%
	    );
	  }

  .remotion-splitter-vertical.remotion-splitter-active, .remotion-splitter-vertical.remotion-splitter-hover {
	    background: linear-gradient(
	      to right,
	      ${TRANSPARENT} ${50 - fromMiddleHovered}%,
	      var(--remotion-cli-internals-blue) ${50 - fromMiddleHovered}%,
	      var(--remotion-cli-internals-blue) ${50 + fromMiddleHovered}%,
	      ${TRANSPARENT} ${50 + fromMiddleHovered}%
	    );
    transform: scaleX(${hoveredDragAreaFactor});
    cursor: col-resize;
    z-index: 1000;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input:focus,
  textarea:focus,
  button:focus:not(.__remotion_input_dragger):not(.__remotion_color_swatch),
  a:focus {
	    outline: none;
	    box-shadow: ${FOCUS_BOX_SHADOW};
	  }

  .__remotion-composition-selector-item:focus,
  .__remotion-inspector-inline-action:focus {
    outline: none;
    box-shadow: none;
  }

  .__remotion-composition-selector-item:focus-visible,
  .__remotion-inspector-inline-action:focus-visible {
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
    pointer-events: none;
    position: absolute;
    height: 0;
    outline: none;
    top: 15.5px;
    width: 221px;
    margin-left: -2px;
    z-index: 2;
  }

	  /* For Firefox browsers */
	  .__remotion_thumb::-moz-range-thumb {
	    border: ${BORDER_BLACK};
	    border-radius: 2px;
	    cursor: pointer;
	    height: 37px;
	    width: 10px;
	    pointer-events: all;
	    border-color: ${BLACK};
	    background-color: ${WHITE};
	    position: relative;
	  }

	  /* For Chrome browsers */
	  .__remotion_thumb::-webkit-slider-thumb {
	    border: ${BORDER_BLACK};
	    border-radius: 2px;
	    cursor: pointer;
	    height: 39px;
	    width: 10px;
	    pointer-events: all;
	    border-color: ${BLACK};
	    background-color: ${WHITE};
	    position: relative;
	  }

  .__remotion_input_dragger:hover span {
    color: var(--remotion-cli-internals-blue-hovered) !important;
  }

  .${DEFAULT_PROPS_PATH_ACTIVE_CLASSNAME} span {
    color: var(--remotion-cli-internals-blue) !important;
    transition: color 0.2s ease-in-out;
  }
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
