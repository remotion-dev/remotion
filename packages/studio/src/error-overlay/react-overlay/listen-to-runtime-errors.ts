/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type {
	HotMiddlewareMessage,
	SymbolicatedStackFrame,
} from '@remotion/studio-shared';
import {stripAnsi} from '@remotion/studio-shared';
import {subscribeToPreviewServerEvents} from '../../helpers/preview-server-events';
import {reloadUrl} from '../../helpers/url-state';
import {markErrorAsLoggedByServer} from '../error-origin';
import {
	addErrorToOverlay,
	clearErrorsInOverlay,
} from '../remotion-overlay/Overlay';
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
		error.message.startsWith('Rendered more hooks') ||
		error.message.startsWith('Should have a queue');

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

		reloadUrl();
	} else {
		addErrorToOverlay(error);

		crash();
	}
};

const formatHmrError = (error: unknown): string => {
	if (typeof error === 'string') {
		return stripAnsi(error);
	}

	if (error && typeof error === 'object') {
		const {message, stack} = error as {
			message?: unknown;
			stack?: unknown;
		};

		if (typeof message === 'string') {
			return stripAnsi(message);
		}

		if (typeof stack === 'string') {
			return stripAnsi(stack);
		}
	}

	try {
		return stripAnsi(JSON.stringify(error));
	} catch {
		return String(error);
	}
};

const getHmrErrorMessage = (
	hmrEvent: Extract<HotMiddlewareMessage, {action: 'built' | 'sync'}>,
): string | null => {
	const message = hmrEvent.errors
		.map(formatHmrError)
		.filter(Boolean)
		.join('\n\n');

	return message.trim() === '' ? null : message;
};

export function listenToRuntimeErrors(crash: () => void) {
	const crashWithFramesRunTime = crashWithFrames(crash);
	let lastHmrErrorMessage: string | null = null;

	registerError(window, (error) => {
		return crashWithFramesRunTime(error);
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
			const error = {
				message: data.message,
				stack: data.stack,
				name: '',
			};

			markErrorAsLoggedByServer(error);
			crashWithFramesRunTime(error);
		}

		if (d.type === 'build-error') {
			markErrorAsLoggedByServer(d.error);
			crashWithFramesRunTime(d.error);
		}
	});
	const unsubscribeFromPreviewServerEvents = subscribeToPreviewServerEvents(
		(event) => {
			if (event.type !== 'hmr') {
				return;
			}

			if (event.hmrEvent.action === 'building') {
				return;
			}

			const message = getHmrErrorMessage(event.hmrEvent);
			if (message === null) {
				lastHmrErrorMessage = null;
				clearErrorsInOverlay();
				return;
			}

			if (message === lastHmrErrorMessage) {
				return;
			}

			lastHmrErrorMessage = message;
			const error = new Error(message);
			error.name = 'Build Error';
			markErrorAsLoggedByServer(error);
			crashWithFramesRunTime(error);
		},
	);

	return function () {
		unsubscribeFromPreviewServerEvents();
		unregisterStackTraceLimit();
		unregisterPromise(window);
		unregisterError(window);
		unregisterReactStack();
	};
}
