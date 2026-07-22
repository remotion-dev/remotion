const parseScaleComponent = (component: string) => {
	if (component.endsWith('%')) {
		return Number(component.slice(0, -1)) / 100;
	}

	return Number(component);
};

const parseScale = (transform: string) => {
	const match = /^scale\((.*)\)$/.exec(transform);
	if (!match) {
		return null;
	}

	const scaleValue = match[1].trim();
	if (scaleValue === '') {
		return null;
	}

	const components = scaleValue.split(/\s+/).map(parseScaleComponent);
	if (
		components.length < 1 ||
		components.length > 3 ||
		components.some((component) => !Number.isFinite(component))
	) {
		return null;
	}

	return {
		x: components[0],
		y: components[1] ?? components[0],
		z: components[2] ?? 1,
	};
};

export const makeDOMMatrix = (transform?: string) => {
	if (transform) {
		const scale = parseScale(transform);
		if (scale) {
			return new DOMMatrix().scale(scale.x, scale.y, scale.z);
		}
	}

	return new DOMMatrix(transform);
};
