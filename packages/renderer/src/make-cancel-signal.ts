type Callback = () => void;

export type CancelSignal = (callback: Callback) => void;

export const makeCancelSignal = (): {
	cancelSignal: CancelSignal;
	cancel: () => void;
} => {
	const callbacks: Callback[] = [];
	let cancelled = false;
	return {
		cancelSignal: (callback: Callback) => {
			callbacks.push(callback);
			if (cancelled) {
				callback();
			}
		},
		cancel: () => {
			if (cancelled) {
				return;
			}

			callbacks.forEach((cb) => {
				cb();
			});
			cancelled = true;
		},
	};
};
