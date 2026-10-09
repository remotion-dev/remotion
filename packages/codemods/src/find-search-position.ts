export const findSearchPosition = ({
	contents,
	lineNumber,
	columnNumber,
	search,
}: {
	contents: string;
	lineNumber: number;
	columnNumber: number;
	search: string;
}) => {
	const lines = contents.split(/\r?\n/);
	const startLineIndex = Math.max(0, lineNumber - 1);

	for (let lineIndex = startLineIndex; lineIndex < lines.length; lineIndex++) {
		const startColumnIndex =
			lineIndex === startLineIndex ? Math.max(0, columnNumber - 1) : 0;
		const foundColumnIndex = lines[lineIndex].indexOf(search, startColumnIndex);

		if (foundColumnIndex !== -1) {
			return {
				lineNumber: lineIndex + 1,
				columnNumber: foundColumnIndex + 1,
			};
		}
	}

	return {lineNumber, columnNumber};
};
