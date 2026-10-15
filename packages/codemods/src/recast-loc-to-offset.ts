const RECAST_TAB_WIDTH = 4;
const lineStartsBySource = new Map<string, number[]>();
const maximumCachedSources = 8;

// Recast normalizes every line ending, removes zero-width indentation, and
// expands tabs in leading whitespace before parsing. Index line starts once
// per source, then walk the requested line to map its normalized column.
export const recastLocToOffset = (
	input: string,
	loc: {line: number; column: number},
): number => {
	let lineStarts = lineStartsBySource.get(input);
	if (!lineStarts) {
		lineStarts = [0];
		for (const match of input.matchAll(/\r\n|[\r\n\u2028\u2029]/g)) {
			lineStarts.push(match.index + match[0].length);
		}
	}

	lineStartsBySource.delete(input);
	lineStartsBySource.set(input, lineStarts);
	if (lineStartsBySource.size > maximumCachedSources) {
		lineStartsBySource.delete(lineStartsBySource.keys().next().value!);
	}

	let sourceOffset = lineStarts[loc.line - 1];
	if (sourceOffset === undefined) {
		return input.length;
	}

	let {line} = loc;
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
