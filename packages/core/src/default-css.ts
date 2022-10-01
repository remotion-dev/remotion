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

	head.prepend(style);
	injected[css] = true;
};

export const removeCSS = (css: string) => {
	if (typeof document === 'undefined') {
		return;
	}

	if (injected[css]) {
		const head = document.head || document.getElementsByTagName('head')[0];
		head.childNodes.forEach((node) => {
			if (node.textContent === css) {
				head.removeChild(node);
			}
		});
	}

	injected[css] = false;
};

export const OFFTHREAD_VIDEO_CLASS_NAME = '__remotion_offthreadvideo';

export const makeDefaultCSS = (
	scope: string | null,
	backgroundColor: string
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
    .${OFFTHREAD_VIDEO_CLASS_NAME} {
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
    ${scope} .${OFFTHREAD_VIDEO_CLASS_NAME} {
      object-fit: contain;
    }
  `;
};
