import {Internals} from 'remotion';
import {DEFAULT_PROPS_PATH_ACTIVE_CLASSNAME} from '../components/RenderModal/SchemaEditor/scroll-to-default-props-path';

const makeDefaultGlobalCSS = () => {
	const unhoveredDragAreaFactor = 2;
	const fromMiddle = 50 / unhoveredDragAreaFactor;

	const hoveredDragAreaFactor = 6;
	const fromMiddleHovered = 50 / hoveredDragAreaFactor;

	return `
  html {
    --remotion-cli-internals-blue: #0b84f3;
    overscroll-behavior-y: none;
    overscroll-behavior-x: none;
  }
  
  body {
    overscroll-behavior-y: none;
    overscroll-behavior-x: none;
    /* Override Chakra UI position: relative on body */
    position: static !important;
  }
  
  .remotion-splitter {
    user-select: none;
  }
  
  .remotion-splitter-horizontal {
    transform: scaleY(${unhoveredDragAreaFactor});
    background: linear-gradient(
      to bottom,
      transparent ${50 - fromMiddle}%,
      black ${50 - fromMiddle}%,
      black ${50 + fromMiddle}%,
      transparent ${50 + fromMiddle}%
    );
  }
  
  .remotion-splitter-horizontal.remotion-splitter-active, .remotion-splitter-horizontal.remotion-splitter-hover {
    background: linear-gradient(
      to bottom,
      transparent ${50 - fromMiddleHovered}%,
      var(--remotion-cli-internals-blue) ${50 - fromMiddleHovered}%,
      var(--remotion-cli-internals-blue) ${50 + fromMiddleHovered}%,
      transparent ${50 + fromMiddleHovered}%
    );
    cursor: row-resize;
    transform: scaleY(${hoveredDragAreaFactor});
    z-index: 1000;
  }
  
  .remotion-splitter-vertical {
    transform: scaleX(${unhoveredDragAreaFactor});
    background: linear-gradient(
      to right,
      transparent ${50 - fromMiddle}%,
      black ${50 - fromMiddle}%,
      black ${50 + fromMiddle}%,
      transparent ${50 + fromMiddle}%
    );
  }
  
  .remotion-splitter-vertical.remotion-splitter-active, .remotion-splitter-vertical.remotion-splitter-hover {
    background: linear-gradient(
      to right,
      transparent ${50 - fromMiddleHovered}%,
      var(--remotion-cli-internals-blue) ${50 - fromMiddleHovered}%,
      var(--remotion-cli-internals-blue) ${50 + fromMiddleHovered}%,
      transparent ${50 + fromMiddleHovered}%
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
  button:focus,
  a:focus {
    outline: none;
    box-shadow:
      inset 1px 1px #555,
      inset -1px -1px #555,
      inset 1px -1px #555,
      inset -1px 1px #555;
  }
  
  input[type='color'].__remotion_color_picker::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  input[type='color'].__remotion_color_picker::-webkit-color-swatch {
    border: none;
  }
  
  .__remotion_thumb,
  .__remotion_thumb::-webkit-slider-thumb {
    -webkit-appearance: none;
    -webkit-tap-highlight-color: transparent;
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
    border: 1px solid black;
    border-radius: 2px;
    cursor: pointer;
    height: 37px;
    width: 10px;
    pointer-events: all;
    border-color: black;
    background-color: white;
    position: relative;
  }
  
  /* For Chrome browsers */
  .__remotion_thumb::-webkit-slider-thumb {
    border: 1px solid black;
    border-radius: 2px;
    cursor: pointer;
    height: 39px;
    width: 10px;
    pointer-events: all;
    border-color: black;
    background-color: white;
    position: relative;
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
