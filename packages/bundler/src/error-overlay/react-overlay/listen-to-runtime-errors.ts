import {StackFrame} from './utils/stack-frame';

export type ErrorRecord = {
	error: Error;
	unhandledRejection: boolean;
	contextSize: number;
	stackFrames: StackFrame[];
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
import {massage as massageWarning} from './effects/format-warning';
import {getStackFrames} from './utils/get-stack-frames';
import {setErrorsRef} from '../remotion-overlay/Overlay';

const CONTEXT_SIZE = 3;

export const crashWithFrames =
	(crash: (rec: ErrorRecord) => void) =>
	async (
		error: Error & {
			__unmap_source?: string;
		},
		unhandledRejection = false
	) => {
		try {
			setErrorsRef.current?.setErrors({
				type: 'symbolicating',
			});

			const stackFrames = await getStackFrames(error, CONTEXT_SIZE);

			if (stackFrames === null || stackFrames === undefined) {
				return;
			}

			crash({
				error,
				unhandledRejection,
				contextSize: CONTEXT_SIZE,
				stackFrames,
			});
		} catch (e) {
			console.log('Could not get the stack frames of error:', e);
		}
	};

export const listenToRuntimeErrors = (
	crash: (rec: ErrorRecord) => void,
	filename: string
) => {
	const crashWithFramesRunTime = crashWithFrames(crash);

	registerError(window, (error) => crashWithFramesRunTime(error, false));
	registerPromise(window, (error) => crashWithFramesRunTime(error, true));
	registerStackTraceLimit();
	registerReactStack();
	permanentRegisterConsole('error', (warning, stack) => {
		const data = massageWarning(warning, stack);
		crashWithFramesRunTime(
			{
				message: data.message,
				stack: data.stack,
				__unmap_source: filename,
				name: '',
			},
			false
		);
	});

	return () => {
		unregisterStackTraceLimit();
		unregisterPromise(window);
		unregisterError(window);
		unregisterReactStack();
	};
};
