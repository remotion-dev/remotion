import {useRef} from 'react';
import {CancellablePromise} from './cancellable-promise';

const useCancellablePromises = () => {
	const pendingPromises = useRef<CancellablePromise[]>([]);

	const appendPendingPromise = (promise: CancellablePromise) => {
		pendingPromises.current = [...pendingPromises.current, promise];
	};

	const removePendingPromise = (promise: CancellablePromise) => {
		pendingPromises.current = pendingPromises.current.filter(
			(p) => p !== promise
		);
	};

	const clearPendingPromises = () =>
		pendingPromises.current.map((p) => p.cancel());

	const api = {
		appendPendingPromise,
		removePendingPromise,
		clearPendingPromises,
	};

	return api;
};

export {useCancellablePromises};
