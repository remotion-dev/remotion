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

const parseAxisRotate = (transform: string) => {
	const match = /^rotate\((.*)\)$/.exec(transform);
	if (!match) {
		return null;
	}

	const rotateValue = match[1].trim();
	const keywordAxis = /^(x|y|z)\s+(.+)$/i.exec(rotateValue);
	if (keywordAxis) {
		const axisKeyword = keywordAxis[1].toLowerCase();
		const angle = keywordAxis[2];
		const rotateFunction =
			axisKeyword === 'x'
				? 'rotateX'
				: axisKeyword === 'y'
					? 'rotateY'
					: 'rotate';

		return `${rotateFunction}(${angle})`;
	}

	const vectorAxis = /^(\S+)\s+(\S+)\s+(\S+)\s+(.+)$/.exec(rotateValue);
	if (!vectorAxis) {
		return null;
	}

	const axisVector = vectorAxis.slice(1, 4).map(Number);
	if (axisVector.some((component) => !Number.isFinite(component))) {
		return null;
	}

	return `rotate3d(${axisVector.join(', ')}, ${vectorAxis[4]})`;
};

export const makeDOMMatrix = (transform?: string) => {
	if (transform) {
		const scale = parseScale(transform);
		if (scale) {
			return new DOMMatrix().scale(scale.x, scale.y, scale.z);
		}

		const axisRotate = parseAxisRotate(transform);
		if (axisRotate) {
			return new DOMMatrix(axisRotate);
		}
	}

	return new DOMMatrix(transform);
};
