"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancellablePromise = void 0;
const cancellablePromise = (promise) => {
    let isCanceled = false;
    const wrappedPromise = new Promise((resolve, reject) => {
        promise
            .then((value) => {
            if (isCanceled) {
                reject({ isCanceled, value });
                return;
            }
            resolve(value);
        })
            .catch((error) => {
            reject({ isCanceled, error });
        });
    });
    return {
        promise: wrappedPromise,
        cancel: () => {
            isCanceled = true;
        },
    };
};
exports.cancellablePromise = cancellablePromise;
