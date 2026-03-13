const suppressedFiles = new Map<string, number>();

export function suppressHmrForFile(absolutePath: string) {
	suppressedFiles.set(
		absolutePath,
		(suppressedFiles.get(absolutePath) ?? 0) + 1,
	);
}

export function shouldSuppressHmr(filename: string | null): boolean {
	if (filename === null) {
		return false;
	}

	const count = suppressedFiles.get(filename) ?? 0;
	if (count > 0) {
		if (count === 1) {
			suppressedFiles.delete(filename);
		} else {
			suppressedFiles.set(filename, count - 1);
		}

		return true;
	}

	return false;
}
