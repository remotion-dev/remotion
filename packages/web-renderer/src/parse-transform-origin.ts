export const parseTransformOrigin = (transformOrigin: string) => {
	if (!transformOrigin.trim()) {
		return null;
	}

	const [x, y] = transformOrigin.split(' ');

	return {
		x: parseFloat(x),
		y: parseFloat(y),
	};
};
