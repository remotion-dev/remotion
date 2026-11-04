export type SourceMutationOperation = {
	readonly id: string;
	readonly revision: number;
};

let revision = 0;
let lastDispatchedRevision = 0;
let activeRevision: number | null = null;
let chain: Promise<unknown> = Promise.resolve();

export const getSourceMutationRevision = () => revision;
export const getLastDispatchedSourceMutationRevision = () =>
	lastDispatchedRevision;
export const getActiveSourceMutationRevision = () => activeRevision;
export const waitForSourceMutationQueue = (): Promise<unknown> => chain;

// Reserve the revision synchronously, in user action order. A response may finish
// after a newer intent was queued, even though persistence runs serially.
export const enqueueSourceMutation = <T>(
	run: (operation: SourceMutationOperation) => Promise<T>,
	onQueued: ((operation: SourceMutationOperation) => void) | null = null,
): Promise<T> => {
	const operation = {id: `source-operation-${++revision}`, revision};
	const next = chain.then(async () => {
		lastDispatchedRevision = operation.revision;
		activeRevision = operation.revision;
		try {
			return await run(operation);
		} finally {
			activeRevision = null;
		}
	});
	chain = next.then(
		() => undefined,
		() => undefined,
	);
	onQueued?.(operation);
	return next;
};
