const RECAST_TAB_WIDTH = 4;

// Recast normalizes every line ending, removes zero-width indentation, and
// expands tabs in leading whitespace before parsing. Walk the parsed location
// and original source together so the offset remains platform-independent.
export const recastLocToOffset = (
	input: string,
	loc: {line: number; column: number},
): number => {
	let sourceOffset = 0;
	let line = 1;
	let column = 0;
	let isLeadingWhitespace = true;

	while (sourceOffset < input.length) {
		const character = input[sourceOffset];
		if (
			isLeadingWhitespace &&
			(character === '\v' || character === '\f' || character === '\uFEFF')
		) {
			sourceOffset++;
			continue;
		}

		if (line === loc.line && column === loc.column) {
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
			line++;
			column = 0;
			isLeadingWhitespace = true;
			continue;
		}

		if (isLeadingWhitespace && character === '\t') {
			const width = RECAST_TAB_WIDTH - (column % RECAST_TAB_WIDTH);
			if (loc.line === line && loc.column < column + width) {
				return sourceOffset;
			}

			sourceOffset++;
			column += width;
			continue;
		}

		sourceOffset++;
		column++;
		isLeadingWhitespace = isLeadingWhitespace && /\s/.test(character);
	}

	return sourceOffset;
};
