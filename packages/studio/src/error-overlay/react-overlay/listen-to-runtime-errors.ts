import {setErrorsRef} from '../remotion-overlay/Overlay';
import {massageWarning} from './effects/format-warning';
import {
	permanentRegister as permanentRegisterConsole,
	registerReactStack,
	unregisterReactStack,
} from './effects/proxy-console';
import {
	register as registerStackTraceLimit,
	unregister as unregisterStackTraceLimit,
} from './effects/stack-trace-limit';
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type {SymbolicatedStackFrame} from '@remotion/studio-shared';
import {reloadUrl} from '../../helpers/url-state';
import {
	register as registerError,
	unregister as unregisterError,
} from './effects/unhandled-error';
import {
	register as registerPromise,
	unregister as unregisterPromise,
} from './effects/unhandled-rejection';
import {getStackFrames} from './utils/get-stack-frames';

export type ErrorRecord = {
	error: Error;
	contextSize: number;
	stackFrames: SymbolicatedStackFrame[];
};

const CONTEXT_SIZE = 3;

export const getErrorRecord = async (
	error: Error,
): Promise<ErrorRecord | null> => {
	const stackFrames = await getStackFrames(error, CONTEXT_SIZE);

	if (stackFrames === null || stackFrames === undefined) {
		return null;
	}

	return {
		error,
		contextSize: CONTEXT_SIZE,
		stackFrames,
	};
};

const crashWithFrames = (crash: () => void) => (error: Error) => {
	const didHookOrderChange =
		error.message.startsWith('Rendered fewer hooks') ||
		error.message.startsWith('Rendered more hooks');

	const key = 'remotion.lastCrashBecauseOfHooks';
	const previousCrashWasBecauseOfHooks = window.localStorage.getItem(key);

	// When rendering conditional hooks, refreshing does not help.
	// So we only refresh once.
	const justRefreshedBecauseOfHooks = previousCrashWasBecauseOfHooks
		? Date.now() - Number(previousCrashWasBecauseOfHooks) < 5000
		: false;

	window.localStorage.setItem(
		'remotion.lastCrashBecauseOfHooks',
		String(Date.now()),
	);

	if (didHookOrderChange && !justRefreshedBecauseOfHooks) {
		// eslint-disable-next-line no-console
		console.log('Hook order changed. Reloading app...');

		window.remotion_unsavedProps = false;
		reloadUrl();
	} else {
		setErrorsRef.current?.addError(error);

		crash();
	}
};

export function listenToRuntimeErrors(crash: () => void) {
	const crashWithFramesRunTime = crashWithFrames(crash);

	registerError(window, (error) => {
		return crashWithFramesRunTime({
			message: error.message,
			stack: error.stack,
			name: error.name,
		});
	});
	registerPromise(window, (error) => {
		return crashWithFramesRunTime(error);
	});
	registerStackTraceLimit();
	registerReactStack();
	permanentRegisterConsole('error', (d) => {
		if (d.type === 'webpack-error') {
			const {message, frames} = d;
			const data = massageWarning(message, frames);

			crashWithFramesRunTime({
				message: data.message,
				stack: data.stack,
				name: '',
			});
		}

		if (d.type === 'build-error') {
			crashWithFramesRunTime(d.error);
		}
	});

	return function () {
		unregisterStackTraceLimit();
		unregisterPromise(window);
		unregisterError(window);
		unregisterReactStack();
	};
}
