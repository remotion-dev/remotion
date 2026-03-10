export const extendViewbox = (currentViewbox: string, scale: number) => {
	const relativeScale = scale - 1;
	const [x, y, width, height] = currentViewbox.split(' ').map(Number);
	const newViewBox = [
		x - (relativeScale * width) / 2,
		y - (relativeScale * height) / 2,
		width + relativeScale * width,
		height + relativeScale * height,
	].join(' ');
	return newViewBox;
};
