/**
 * Deinterlace function from https://github.com/shachaf/jsgif
 */

export const deinterlace = (pixels: number[], width: number) => {
	const newPixels = new Array(pixels.length);
	const rows = pixels.length / width;
	const cpRow = function (toRow: number, _fromRow: number) {
		const fromPixels = pixels.slice(_fromRow * width, (_fromRow + 1) * width);
		newPixels.splice(
			...([toRow * width, width].concat(fromPixels) as [
				number,
				number,
				number,
			]),
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
