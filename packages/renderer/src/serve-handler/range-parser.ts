/*!
 * range-parser
 * Copyright(c) 2012-2014 TJ Holowaychuk
 * Copyright(c) 2015-2016 Douglas Christopher Wilson
 * MIT Licensed
 */

export const rangeParser = (
	size: number,
	str: string,
):
	| {
			type: string;
			ranges: {
				start: number;
				end: number;
			}[];
	  }
	| -1
	| -2 => {
	if (typeof str !== 'string') {
		throw new TypeError('argument str must be a string');
	}

	const index = str.indexOf('=');

	if (index === -1) {
		return -2;
	}

	// split the range string
	const arr = str.slice(index + 1).split(',');
	const ranges = [];

	// add ranges type
	const type = str.slice(0, index);

	// parse all ranges
	for (let i = 0; i < arr.length; i++) {
		const range = arr[i].split('-');
		let start = parseInt(range[0], 10);
		let end = parseInt(range[1], 10);

		// -nnn
		if (isNaN(start)) {
			start = size - end;
			end = size - 1;
			// nnn-
		} else if (isNaN(end)) {
			end = size - 1;
		}

		// limit last-byte-pos to current length
		if (end > size - 1) {
			end = size - 1;
		}

		// invalid or unsatisifiable
		if (isNaN(start) || isNaN(end) || start > end || start < 0) {
			continue;
		}

		// add range
		ranges.push({
			start,
			end,
		});
	}

	if (ranges.length < 1) {
		// unsatisifiable
		return -1;
	}

	return {ranges, type};
};
