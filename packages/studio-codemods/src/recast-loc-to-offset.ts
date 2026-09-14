const RECAST_TAB_WIDTH = 4;

type RecastPosition =
	| {index: number; type: 'index'}
	| {column: number; line: number; type: 'location'};

// Recast normalizes every line ending, removes zero-width indentation, and
// expands tabs in leading whitespace before parsing. Walk both representations
// together so parser positions can be mapped back to the original source.
const recastPositionToOffset = (
	input: string,
	target: RecastPosition,
): number => {
	let sourceOffset = 0;
	let recastIndex = 0;
	let line = 1;
	let column = 0;
	let isLeadingWhitespace = true;
	const isAtTarget = () =>
		target.type === 'index'
			? recastIndex === target.index
			: line === target.line && column === target.column;

	while (sourceOffset < input.length) {
		const character = input[sourceOffset];
		if (
			isLeadingWhitespace &&
			(character === '\v' || character === '\f' || character === '\uFEFF')
		) {
			sourceOffset++;
			continue;
		}

		if (isAtTarget()) {
			return sourceOffset;
		}

		const isCrLf = character === '\r' && input[sourceOffset + 1] === '\n';
		if (
			isCrLf ||
			character === '\r' ||
			character === '\n' ||
			character === '\u2028' ||
			character === '\u2029'
		) {
			sourceOffset += isCrLf ? 2 : 1;
			recastIndex++;
			line++;
			column = 0;
			isLeadingWhitespace = true;
			continue;
		}

		if (isLeadingWhitespace && character === '\t') {
			const width = RECAST_TAB_WIDTH - (column % RECAST_TAB_WIDTH);
			const targetIsInsideTab =
				target.type === 'index'
					? target.index < recastIndex + width
					: target.line === line && target.column < column + width;
			if (targetIsInsideTab) {
				return sourceOffset;
			}

			sourceOffset++;
			recastIndex += width;
			column += width;
			continue;
		}

		sourceOffset++;
		recastIndex++;
		column++;
		isLeadingWhitespace = isLeadingWhitespace && /\s/.test(character);
	}

	return sourceOffset;
};

export const recastIndexToOffset = (input: string, index: number): number =>
	recastPositionToOffset(input, {index, type: 'index'});

export const recastLocToOffset = (
	input: string,
	loc: {line: number; column: number},
): number => recastPositionToOffset(input, {...loc, type: 'location'});
