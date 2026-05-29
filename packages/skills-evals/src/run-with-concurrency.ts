export const runWithConcurrency = async <TInput, TOutput>({
	inputs,
	limit,
	worker,
}: {
	inputs: TInput[];
	limit: number;
	worker: (input: TInput) => Promise<TOutput>;
}) => {
	const results: TOutput[] = [];
	let nextIndex = 0;
	let firstError: unknown = null;
	const workerCount = Math.min(limit, inputs.length);

	await Promise.allSettled(
		Array.from({length: workerCount}, async () => {
			while (nextIndex < inputs.length && !firstError) {
				const currentIndex = nextIndex;
				nextIndex++;

				try {
					results[currentIndex] = await worker(inputs[currentIndex]);
				} catch (error) {
					firstError ??= error;
					throw error;
				}
			}
		}),
	);

	if (firstError) {
		throw firstError;
	}

	return results;
};
