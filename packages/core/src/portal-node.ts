let _portalNode: null | HTMLElement = null;

export const portalNode = () => {
	if (!_portalNode) {
		if (typeof document === 'undefined') {
			throw new Error(
				'Tried to call an API that only works in the browser outsdide hte browser'
			);
		}

		_portalNode = document.createElement('div');
	}

	return _portalNode;
};
