const injected: {[key: string]: HTMLStyleElement} = {};

export const injectCSS = (css: string): (() => void) => {
	// Skip in node
	if (typeof document === 'undefined') {
		return () => {};
	}

	if (injected[css]) {
		return () => {};
	}

	const head = document.head || document.getElementsByTagName('head')[0];
	const style = document.createElement('style');

	style.appendChild(document.createTextNode(css));

	head.prepend(style);
	injected[css] = style;

	return () => {
		if (injected[css]) {
			head.removeChild(style);
			delete injected[css];
		}
	};
};

// make object-fit: contain low priority, so it can be overridden by another class name
export const OBJECTFIT_CONTAIN_CLASS_NAME = '__remotion_objectfitcontain';

export const makeDefaultPreviewCSS = (
	scope: string | null,
	backgroundColor: string,
) => {
	if (!scope) {
		return `
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
	    background-color: ${backgroundColor};
    }
    .${OBJECTFIT_CONTAIN_CLASS_NAME} {
      object-fit: contain;
    }
    `;
	}

	return `
    ${scope} * {
      box-sizing: border-box;
    }
    ${scope} *:-webkit-full-screen {
      width: 100%;
      height: 100%;
    }
    ${scope} .${OBJECTFIT_CONTAIN_CLASS_NAME} {
      object-fit: contain;
    }
  `;
};
