// https://superuser.com/questions/907933/correct-aspect-ratio-without-re-encoding-video-file

export const calculateDisplayVideoSize = ({
	darX,
	darY,
	x,
	y,
}: {
	x: number;
	y: number;
	darX: number;
	darY: number;
}): {width: number; height: number} => {
	// We know two equations:
	//   newWidth / newHeight = darX / darY
	// and:
	//   x * y = (newWidth * newHeight)

	// I solved it then on pen and paper and simplified the formula:

	const dimensions = x * y;
	const newWidth = Math.sqrt(dimensions * (darX / darY));
	const newHeight = dimensions / newWidth;

	return {
		height: Math.round(newHeight),
		width: Math.round(newWidth),
	};
};
