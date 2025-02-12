export type CancellablePromise = {
    promise: Promise<unknown>;
    cancel: () => void;
};
export declare const cancellablePromise: (promise: Promise<unknown>) => CancellablePromise;
