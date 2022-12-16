/**
 * Deinterlace function from https://github.com/shachaf/jsgif
 */

export const deinterlace = (pixels, width) => {
	const newPixels = new Array(pixels.length);
	const rows = pixels.length / width;
	const cpRow = function (toRow, fromRow) {
		const fromPixels = pixels.slice(fromRow * width, (fromRow + 1) * width);
		newPixels.splice.apply(
			newPixels,
			[toRow * width, width].concat(fromPixels)
		);
	};

	// See appendix E.
	const offsets = [0, 4, 2, 1];
	const steps = [8, 8, 4, 2];

	let fromRow = 0;
	for (let pass = 0; pass < 4; pass++) {
		for (let toRow = offsets[pass]; toRow < rows; toRow += steps[pass]) {
			cpRow(toRow, fromRow);
			fromRow++;
		}
	}

	return newPixels;
};
