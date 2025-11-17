export const parseTransformOrigin = (transformOrigin: string) => {
	const [x, y] = transformOrigin.split(' ');
	return {x: parseFloat(x), y: parseFloat(y)};
};
