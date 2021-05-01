const injected: {[key: string]: boolean} = {};

export const injectCSS = (css: string) => {
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
  `;
};
