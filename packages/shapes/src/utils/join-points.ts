export const joinPoints = (points: [number, number][]) => {
	const pointsString = points
		.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`)
		.join(' ');
	return pointsString;
};
