/*
	Source code adapted from https://github.com/facebook/create-react-app/tree/main/packages/react-error-overlay and refactored in Typescript. This file is MIT-licensed.
*/

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

let boundErrorHandler: EventListenerObject | null = null;

type ErrorCallback = (error: Error) => void;

function errorHandler(callback: ErrorCallback, e: Event): void {
	// @ts-expect-error
	if (!e.error) {
		return;
	}

	// @ts-expect-error
	const {error} = e;
	if (error instanceof Error) {
		callback(error);
	} else {
		// A non-error was thrown, we don't have a trace. :(
		// Look in your browser's devtools for more information
		callback(new Error(error));
	}
}

function registerUnhandledError(target: EventTarget, callback: ErrorCallback) {
	if (boundErrorHandler !== null) {
		return;
	}

	boundErrorHandler = errorHandler.bind(
		undefined,
		callback,
	) as unknown as EventListenerObject;
	target.addEventListener('error', boundErrorHandler);
}

function unregisterUnhandledError(target: EventTarget) {
	if (boundErrorHandler === null) {
		return;
	}

	target.removeEventListener('error', boundErrorHandler);
	boundErrorHandler = null;
}

export {
	registerUnhandledError as register,
	unregisterUnhandledError as unregister,
};
