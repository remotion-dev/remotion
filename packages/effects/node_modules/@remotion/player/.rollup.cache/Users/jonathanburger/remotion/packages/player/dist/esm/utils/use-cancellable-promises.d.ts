import type { CancellablePromise } from './cancellable-promise.js';
declare const useCancellablePromises: () => {
    appendPendingPromise: (promise: CancellablePromise) => void;
    removePendingPromise: (promise: CancellablePromise) => void;
    clearPendingPromises: () => void[];
};
export { useCancellablePromises };
