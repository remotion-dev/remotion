import {Internals} from 'remotion';
import {DEFAULT_PROPS_PATH_ACTIVE_CLASSNAME} from '../components/RenderModal/SchemaEditor/scroll-to-default-props-path';

const makeDefaultGlobalCSS = () => {
	return `
  html {
    --remotion-cli-internals-blue: #0b84f3;
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
    transform: scaleY(2);
    background: linear-gradient(
      to bottom,
      transparent 25%,
      black 25%,
      black 75%,
      transparent
    );
  }
  
  .remotion-splitter-horizontal:hover,
  .remotion-splitter-horizontal.remotion-splitter-active {
    background: linear-gradient(
      to bottom,
      var(--remotion-cli-internals-blue),
      var(--remotion-cli-internals-blue)
    );
  }
  
  .remotion-splitter-vertical {
    transform: scaleX(2);
    background: linear-gradient(
      to right,
      transparent 25%,
      black 25%,
      black 75%,
      transparent
    );
  }
  
  .remotion-splitter-vertical:hover,
  .remotion-splitter-vertical.remotion-splitter-active {
    background: linear-gradient(
      to right,
      var(--remotion-cli-internals-blue),
      var(--remotion-cli-internals-blue)
    );
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
    border-radius: 0 !important;
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
