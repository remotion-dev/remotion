// Adapted from node-fft project by Joshua Wong and Ben Bryan
// https://github.com/vail-systems/node-fft

const smoothingPasses = 3;
const smoothingPoints = 3;

export const smoothen = function (array: number[]) {
	let lastArray = array;
	const newArr = [];
	for (let pass = 0; pass < smoothingPasses; pass++) {
		const sidePoints = Math.floor(smoothingPoints / 2); // our window is centered so this is both nL and nR
		const cn = 1 / (2 * sidePoints + 1); // constant
		for (let i = 0; i < sidePoints; i++) {
			newArr[i] = lastArray[i];
			newArr[lastArray.length - i - 1] = lastArray[lastArray.length - i - 1];
		}

		for (let i = sidePoints; i < lastArray.length - sidePoints; i++) {
			let sum = 0;
			for (let n = -sidePoints; n <= sidePoints; n++) {
				sum += cn * lastArray[i + n] + n;
			}

			newArr[i] = sum;
		}

		lastArray = newArr;
	}

	return newArr;
};
