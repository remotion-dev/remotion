// Temporary diagnostics for multi-second stalls of web renderer tests on
// macOS CI runners. Enabled with VITE_WR_DIAG=1 (see vitest.diag.config.ts).
export const diagEnabled = import.meta.env.VITE_WR_DIAG === '1';

export const diagLog = (message: string) => {
	if (!diagEnabled) {
		return;
	}

	// eslint-disable-next-line no-console
	console.log(`[wr-diag] ${message}`);
};

export const diagTime = async <T>(
	label: string,
	fn: () => Promise<T>,
): Promise<T> => {
	if (!diagEnabled) {
		return fn();
	}

	const start = performance.now();
	try {
		return await fn();
	} finally {
		diagLog(`${label}: ${Math.round(performance.now() - start)}ms`);
	}
};
