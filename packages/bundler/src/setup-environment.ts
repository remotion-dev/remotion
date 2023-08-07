import {Internals} from 'remotion';

Internals.setupEnvVariables();

Internals.CSSUtils.injectCSS(`
  .css-reset, .css-reset * {
    font-size: 16px;
    line-height: 1.5;
    color: white;
    font-family: Arial, Helvetica, sans-serif;
    background: transparent;
    box-sizing: border-box;
  }

  .algolia-docsearch-suggestion--highlight {
    font-size: 15px;
    line-height: 1.25;
  }

  .__remotion-info-button-container code {
    font-family: monospace;
    font-size: 14px;
    color: #0584f2
  }

  .__remotion-vertical-scrollbar::-webkit-scrollbar {
      width: 6px;
  }
  .__remotion-vertical-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.0);
  }
  .__remotion-vertical-scrollbar:hover::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.6);
  }
  .__remotion-vertical-scrollbar:hover::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 1);
  }


  .__remotion-horizontal-scrollbar::-webkit-scrollbar {
    height: 6px;
  }
  .__remotion-horizontal-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.0);
  }
  .__remotion-horizontal-scrollbar:hover::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.6);
  }
  .__remotion-horizontal-scrollbar:hover::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 1);
  }


  @-moz-document url-prefix() {
    .__remotion-vertical-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: rgba(0, 0, 0, 0.6) rgba(0, 0, 0, 0);
    }

    .__remotion-vertical-scrollbar:hover {
      scrollbar-color: rgba(0, 0, 0, 1) rgba(0, 0, 0, 0);
    }

    .__remotion-horizontal-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: rgba(0, 0, 0, 0.6) rgba(0, 0, 0, 0);
    }

    .__remotion-horizontal-scrollbar:hover {
      scrollbar-width: thin;
      scrollbar-color: rgba(0, 0, 0, 1) rgba(0, 0, 0, 0);
    }
  }


  .__remotion-timeline-slider {
    appearance: none;
    width: 100px;
    border-radius: 3px;
    height: 6px;
    background-color: rgba(255, 255, 255, 0.1);
    accent-color: #ffffff;
  }
  
  .__remotion-timeline-slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: #ffffff;
    appearance: none;
  }



`);
