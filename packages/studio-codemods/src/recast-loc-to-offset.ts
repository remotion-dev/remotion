const RECAST_TAB_WIDTH = 4;

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
	for (let i = 0; i < line.length; i++) {
		if (column >= loc.column) {
			return offset + i;
		}

		column +=
			line[i] === '\t' ? RECAST_TAB_WIDTH - (column % RECAST_TAB_WIDTH) : 1;
	}

	return offset + line.length;
};
