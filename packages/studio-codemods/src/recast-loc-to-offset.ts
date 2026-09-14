const RECAST_TAB_WIDTH = 4;

// Recast removes a byte order mark, normalizes CRLF line endings, and expands
// tabs before parsing. Absolute indexes stored in Babel's `extra` metadata
// therefore need to be mapped back to offsets in the original source.
export const recastIndexToOffset = (input: string, index: number): number => {
	let sourceOffset = input.startsWith('\uFEFF') ? 1 : 0;
	let recastIndex = 0;
	let column = 0;
	while (sourceOffset < input.length && recastIndex < index) {
		if (input[sourceOffset] === '\r' && input[sourceOffset + 1] === '\n') {
			sourceOffset += 2;
			recastIndex++;
			column = 0;
			continue;
		}

		if (input[sourceOffset] === '\n' || input[sourceOffset] === '\r') {
			sourceOffset++;
			recastIndex++;
			column = 0;
			continue;
		}

		if (input[sourceOffset] === '\t') {
			const width = RECAST_TAB_WIDTH - (column % RECAST_TAB_WIDTH);
			sourceOffset++;
			recastIndex += width;
			column += width;
			continue;
		}

		sourceOffset++;
		recastIndex++;
		column++;
	}

	return sourceOffset;
};

// Recast expands tabs before parsing, so its columns cannot be used as
// character offsets in the original source.
export const recastLocToOffset = (
	input: string,
	loc: {line: number; column: number},
): number => {
	const lines = input.split('\n');
	let offset = 0;
	for (let i = 0; i < loc.line - 1; i++) {
		offset += lines[i].length + 1;
	}

	const line = lines[loc.line - 1];
	let column = 0;
	const firstSourceCharacter =
		loc.line === 1 && line.startsWith('\uFEFF') ? 1 : 0;
	for (let i = firstSourceCharacter; i < line.length; i++) {
		if (column >= loc.column) {
			return offset + i;
		}

		column +=
			line[i] === '\t' ? RECAST_TAB_WIDTH - (column % RECAST_TAB_WIDTH) : 1;
	}

	return offset + line.length;
};
