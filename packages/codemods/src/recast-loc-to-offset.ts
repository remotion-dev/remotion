const RECAST_TAB_WIDTH = 4;
const sourceLines = new Map<
	string,
	{starts: number[]; jsxColumnAdjustments: Map<number, number>}
>();
const maximumCachedSources = 8;

const getSourceLines = (input: string) => {
	let lines = sourceLines.get(input);
	if (!lines) {
		lines = {starts: [0], jsxColumnAdjustments: new Map()};
		for (const match of input.matchAll(/\r\n|[\r\n\u2028\u2029]/g)) {
			lines.starts.push(match.index + match[0].length);
		}
	}

	sourceLines.delete(input);
	sourceLines.set(input, lines);
	if (sourceLines.size > maximumCachedSources) {
		sourceLines.delete(sourceLines.keys().next().value!);
	}

	return lines;
};

// Recast normalizes every line ending, removes zero-width indentation, and
// expands tabs in leading whitespace before parsing.
export const recastLocToOffset = (
	input: string,
	loc: {line: number; column: number},
): number => {
	let sourceOffset = getSourceLines(input).starts[loc.line - 1];
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

export const getJsxSourceLocation = (
	input: string,
	loc: {line: number; column: number},
) => {
	const {starts, jsxColumnAdjustments} = getSourceLines(input);
	let adjustment = jsxColumnAdjustments.get(loc.line);
	if (adjustment === undefined) {
		// Recast only changes indentation, so all JSX tokens on one line share
		// the same difference between parser columns and authored columns.
		adjustment =
			recastLocToOffset(input, loc) - starts[loc.line - 1] - loc.column;
		jsxColumnAdjustments.set(loc.line, adjustment);
	}

	return {line: loc.line, column: loc.column + adjustment};
};
