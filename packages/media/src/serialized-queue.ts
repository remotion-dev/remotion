// Serializes async work by chaining it onto a single promise.
//
// The obvious way to write this is `queue = queue.then(() => fn())`, but that
// chain is poisoned by its first rejection: once a link rejects, every later
// `.then()` on it rejects with that same stale error without ever running the
// new work. One media file that fails to decode therefore takes down every
// later extraction that happens to share the queue, and each one reports the
// original file's error rather than its own.
//
// Keeping two references avoids that: the caller gets the real promise, which
// still rejects if its own work failed, while the chain continues from a
// promise that has been settled back to a neutral state.
export const makeSerializedQueue = () => {
	let tail: Promise<unknown> = Promise.resolve(undefined);

	return <T>(fn: () => Promise<T> | T): Promise<T> => {
		const result = tail.then(() => fn());

		// Also marks `result`'s rejection as handled, so a caller that attaches
		// its own handler later does not trip an unhandled rejection warning.
		tail = result.then(
			() => undefined,
			() => undefined,
		);

		return result;
	};
};
