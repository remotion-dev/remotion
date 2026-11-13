// CSSOM has already parsed the descriptor. Retain the single-source subset;
// format and technology hints do not change the selected resource URL.
export const parseSingleSourceFontUrl = (src: string): string | null => {
	const source =
		/^url\((?:"([^"\\]*)"|'([^'\\]*)'|([^()\\]*))\)(?:\s+format\([^)]*\))?(?:\s+tech\([^)]*\))?$/i.exec(
			src,
		);
	return source ? (source[1] ?? source[2] ?? source[3]) : null;
};
