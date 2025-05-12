/**
 * Helper function to dispatch progress callbacks.
 *
 * @param {Function} progress_callback The progress callback function to dispatch.
 * @param {any} data The data to pass to the progress callback function.
 * @returns {void}
 * @private
 */
export function dispatchCallback(progress_callback: Function, data: any) {
	if (progress_callback) progress_callback(data);
}
