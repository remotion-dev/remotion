/*
	Source code adapted from https://github.com/facebook/create-react-app/tree/main/packages/react-error-overlay and refactored in Typescript. This file is MIT-licensed.
*/

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

let boundRejectionHandler: EventListener | null = null;

type ErrorCallback = (error: Error) => void;

const rejectionHandler = (
	callback: ErrorCallback,
	e: PromiseRejectionEvent
): void => {
	if (!e?.reason) {
		return callback(new Error('Unknown'));
	}

	const {reason} = e;
	if (reason instanceof Error) {
		return callback(reason);
	}

	// A non-error was rejected, we don't have a trace :(
	// Look in your browser's devtools for more information
	return callback(new Error(reason));
};

const registerUnhandledRejection = (
	target: EventTarget,
	callback: ErrorCallback
) => {
	if (boundRejectionHandler !== null) {
		return;
	}

	boundRejectionHandler = rejectionHandler.bind(
		undefined,
		callback
	) as unknown as EventListener;
	target.addEventListener('unhandledrejection', boundRejectionHandler);
};

const unregisterUnhandledRejection = (target: EventTarget) => {
	if (boundRejectionHandler === null) {
		return;
	}

	target.removeEventListener('unhandledrejection', boundRejectionHandler);
	boundRejectionHandler = null;
};

export {
	registerUnhandledRejection as register,
	unregisterUnhandledRejection as unregister,
};
