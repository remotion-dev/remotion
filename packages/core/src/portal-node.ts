const _portalNodes: HTMLElement[] = [];

export const portalNode = (index: number) => {
	if (!_portalNodes[index]) {
		if (typeof document === 'undefined') {
			throw new Error(
				'Tried to call an API that only works in the browser from outside the browser'
			);
		}

		_portalNodes[index] = document.createElement('div');
		_portalNodes[index].style.position = 'absolute';
		_portalNodes[index].style.top = '0px';
		_portalNodes[index].style.left = '0px';
		_portalNodes[index].style.right = '0px';
		_portalNodes[index].style.bottom = '0px';
		_portalNodes[index].style.width = '100%';
		_portalNodes[index].style.height = '100%';
		_portalNodes[index].style.display = 'flex';
		_portalNodes[index].style.flexDirection = 'column';
	}

	return _portalNodes[index];
};
