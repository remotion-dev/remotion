/*!
 * range-parser
 * Copyright(c) 2012-2014 TJ Holowaychuk
 * Copyright(c) 2015-2016 Douglas Christopher Wilson
 * MIT Licensed
 */

type Range = {
	start: number;
	end: number;
};

type Ranges = Range[] & {
	type?: string;
};

type Ordered = {
	start: number;
	end: number;
	index: number;
};

export function parseRange(size: number, str: string | string[]) {
	if (typeof str !== 'string') {
		throw new TypeError('argument str must be a string');
	}

	const index = str.indexOf('=');

	if (index === -1) {
		return -2;
	}

	// split the range string
	const arr = str.slice(index + 1).split(',');
	const ranges: Ranges = [];

	// add ranges type
	ranges.type = str.slice(0, index);

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
		return -1;
	}

	return combineRanges(ranges);
}

function combineRanges(ranges: Ranges) {
	const ordered: Ordered[] = ranges.map(mapWithIndex).sort(sortByRangeStart);

	let j = 0;
	for (let i = 1; i < ordered.length; i++) {
		const range = ordered[i];
		const current = ordered[j];

		if (range.start > current.end + 1) {
			// next range
			ordered[++j] = range;
		} else if (range.end > current.end) {
			// extend range
			current.end = range.end;
			current.index = Math.min(current.index, range.index);
		}
	}

	ordered.length = j + 1;

	const combined: Ranges = ordered.sort(sortByRangeIndex).map(mapWithoutIndex);

	combined.type = ranges.type;

	return combined;
}

function mapWithIndex(range: Range, index: number) {
	return {
		start: range.start,
		end: range.end,
		index,
	};
}

function mapWithoutIndex(range: Range) {
	return {
		start: range.start,
		end: range.end,
	};
}

function sortByRangeIndex(a: Ordered, b: Ordered) {
	return a.index - b.index;
}

function sortByRangeStart(a: Ordered, b: Ordered) {
	return a.start - b.start;
}
