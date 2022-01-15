import {StackFrame} from './utils/stack-frame';

export type ErrorRecord = {
	error: Error;
	unhandledRejection: boolean;
	contextSize: number;
	stackFrames: StackFrame[];
	type: 'exception' | 'syntax';
};

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
	register as registerError,
	unregister as unregisterError,
} from './effects/unhandled-error';
import {
	register as registerPromise,
	unregister as unregisterPromise,
} from './effects/unhandled-rejection';
import {
	register as registerStackTraceLimit,
	unregister as unregisterStackTraceLimit,
} from './effects/stack-trace-limit';
import {
	permanentRegister as permanentRegisterConsole,
	registerReactStack,
	unregisterReactStack,
} from './effects/proxy-console';
import {massageWarning} from './effects/format-warning';
import {getStackFrames} from './utils/get-stack-frames';
import {setErrorsRef} from '../remotion-overlay/Overlay';

const CONTEXT_SIZE = 3;

const crashWithFrames =
	(crash: (rec: ErrorRecord) => void) =>
	async (
		error: Error & {
			__unmap_source?: string;
		},
		unhandledRejection: boolean
	) => {
		try {
			setErrorsRef.current?.setErrors({
				type: 'symbolicating',
			});

			const {frames: stackFrames, type} = await getStackFrames(
				error,
				CONTEXT_SIZE
			);

			if (stackFrames === null || stackFrames === undefined) {
				return;
			}

			crash({
				error,
				unhandledRejection,
				contextSize: CONTEXT_SIZE,
				stackFrames,
				type,
			});
		} catch (e) {
			console.log('Could not get the stack frames of error:', e);
		}
	};

export function listenToRuntimeErrors(
	crash: (rec: ErrorRecord) => void,
	filename: string
) {
	const crashWithFramesRunTime = crashWithFrames(crash);

	registerError(window, (error) => {
		return crashWithFramesRunTime(error, false);
	});
	registerPromise(window, (error) => {
		return crashWithFramesRunTime(error, true);
	});
	registerStackTraceLimit();
	registerReactStack();
	permanentRegisterConsole('error', (d) => {
		if (d.type === 'webpack-error') {
			const {message, frames} = d;
			const data = massageWarning(message, frames);
			crashWithFramesRunTime(
				{
					message: data.message,
					stack: data.stack,
					__unmap_source: filename,
					name: '',
				},
				false
			);
		}

		if (d.type === 'build-error') {
			crashWithFramesRunTime(d.error, false);
		}
	});

	return function () {
		unregisterStackTraceLimit();
		unregisterPromise(window);
		unregisterError(window);
		unregisterReactStack();
	};
}
