// Captures may stop waiting without cancelling a drawable shared by other captures.
export const awaitSvgDrawable = <T>(
	operation: Promise<T>,
	signal: AbortSignal | null,
): Promise<T> => {
	if (signal === null) return operation;
	return new Promise<T>((resolve, reject) => {
		const onAbort = () => {
			signal.removeEventListener('abort', onAbort);
			reject(new Error('SVG image loading was cancelled'));
		};

		operation.then(
			(value) => {
				signal.removeEventListener('abort', onAbort);
				resolve(value);
			},
			(error) => {
				signal.removeEventListener('abort', onAbort);
				reject(error);
			},
		);
		if (signal.aborted) {
			onAbort();
			return;
		}

		signal.addEventListener('abort', onAbort, {once: true});
	});
};
