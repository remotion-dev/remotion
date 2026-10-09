export type SourceMutationOperation = {
	readonly id: string;
	readonly revision: number;
};

let revision = 0;
let lastDispatchedRevision = 0;
let chain: Promise<unknown> = Promise.resolve();

export const getSourceMutationRevision = () => revision;
export const getLastDispatchedSourceMutationRevision = () =>
	lastDispatchedRevision;

// Reserve the revision synchronously, in user action order. A response may finish
// after a newer intent was queued, even though persistence runs serially.
export const enqueueSourceMutation = <T>(
	run: (operation: SourceMutationOperation) => Promise<T>,
	onQueued: ((operation: SourceMutationOperation) => void) | null = null,
): Promise<T> => {
	const operation = {id: `source-operation-${++revision}`, revision};
	const next = chain.then(() => {
		lastDispatchedRevision = operation.revision;
		return run(operation);
	});
	chain = next.then(
		() => undefined,
		() => undefined,
	);
	onQueued?.(operation);
	return next;
};
