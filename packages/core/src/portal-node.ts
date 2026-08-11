let _portalNode: null | HTMLElement = null;
let portalNodeCurrentScale = 1;
let portalNodeCurrentScaleListeners: (() => void)[] = [];

export const getPortalNodeCurrentScale = () => portalNodeCurrentScale;

export const subscribeToPortalNodeCurrentScale = (listener: () => void) => {
	portalNodeCurrentScaleListeners.push(listener);

	return () => {
		portalNodeCurrentScaleListeners = portalNodeCurrentScaleListeners.filter(
			(currentListener) => currentListener !== listener,
		);
	};
};

export const setPortalNodeCurrentScale = (scale: number) => {
	if (portalNodeCurrentScale === scale) {
		return;
	}

	portalNodeCurrentScale = scale;
	for (const listener of portalNodeCurrentScaleListeners) {
		listener();
	}
};

export const portalNode = () => {
	if (!_portalNode) {
		if (typeof document === 'undefined') {
			throw new Error(
				'Tried to call an API that only works in the browser from outside the browser',
			);
		}

		_portalNode = document.createElement('div');
		_portalNode.style.position = 'absolute';
		_portalNode.style.top = '0px';
		_portalNode.style.left = '0px';
		_portalNode.style.right = '0px';
		_portalNode.style.bottom = '0px';
		_portalNode.style.width = '100%';
		_portalNode.style.height = '100%';
		_portalNode.style.display = 'flex';
		_portalNode.style.flexDirection = 'column';

		const containerNode = document.createElement('div');
		containerNode.style.position = 'fixed';
		containerNode.style.top = -999999 + 'px';
		containerNode.appendChild(_portalNode);

		document.body.appendChild(containerNode);
	}

	return _portalNode;
};
