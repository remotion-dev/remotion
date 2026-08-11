export const getChildNodeFrom = (htmlElement: HTMLDivElement | null) => {
	if (!htmlElement) {
		return null;
	}

	const {childNodes} = htmlElement;
	if (childNodes.length === 0) {
		return null;
	}

	const childNode = childNodes[0] as HTMLElement;
	if (!childNode) {
		return null;
	}

	return childNode;
};
