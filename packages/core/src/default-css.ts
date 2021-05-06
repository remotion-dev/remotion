const injected: {[key: string]: boolean} = {};

export const injectCSS = (css: string) => {
	// Skip in node
	if (typeof document === 'undefined') {
		return;
	}

	if (injected[css]) {
		return;
	}

	const head = document.head || document.getElementsByTagName('head')[0];
	const style = document.createElement('style');

	style.appendChild(document.createTextNode(css));

	head.appendChild(style);
	injected[css] = true;
};

export const makeDefaultCSS = (scope: string | null) => {
	if (!scope) {
		return `
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
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
  `;
};
