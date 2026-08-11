let chain: Promise<unknown> = Promise.resolve();

export const withSourceFileWriteQueue = <T>(
	fn: () => Promise<T>,
): Promise<T> => {
	const run = () => fn();
	const next = chain.then(run, run);
	chain = next.then(
		() => undefined,
		() => undefined,
	);
	return next;
};
