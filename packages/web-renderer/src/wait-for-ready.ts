/* eslint-disable @typescript-eslint/no-use-before-define */
import type {DelayRenderScope} from 'remotion';
import type {BackgroundKeepalive} from './background-keepalive';
import type {InternalState} from './internal-state';
import {withResolvers} from './with-resolvers';

export const waitForReady = ({
	timeoutInMilliseconds,
	scope,
	signal,
	apiName,
	internalState,
	keepalive,
}: {
	timeoutInMilliseconds: number;
	scope: DelayRenderScope;
	signal: AbortSignal | null;
	apiName: 'renderMediaOnWeb' | 'renderStillOnWeb';
	internalState: InternalState | null;
	keepalive: BackgroundKeepalive | null;
}) => {
	const start = performance.now();
	const {promise, resolve, reject} = withResolvers<void>();

	let cancelled = false;

	const check = () => {
		if (cancelled) {
			return;
		}

		if (signal?.aborted) {
			cancelled = true;
			internalState?.addWaitForReadyTime(performance.now() - start);
			reject(new Error(`${apiName}() was cancelled`));
			return;
		}

		if (scope.remotion_renderReady === true) {
			internalState?.addWaitForReadyTime(performance.now() - start);
			resolve();
			return;
		}

		if (scope.remotion_cancelledError !== undefined) {
			cancelled = true;
			internalState?.addWaitForReadyTime(performance.now() - start);
			const stack = scope.remotion_cancelledError;
			const error = new Error(stack.split('\n')[0]);
			error.stack = stack;
			reject(error);
			return;
		}

		if (performance.now() - start > timeoutInMilliseconds + 3000) {
			cancelled = true;
			internalState?.addWaitForReadyTime(performance.now() - start);
			reject(
				new Error(
					Object.values(scope.remotion_delayRenderTimeouts)
						.map((d) => d.label)
						.join(', '),
				),
			);
			return;
		}

		scheduleNextCheck();
	};

	// schedule both raf and worker timer - whichever fires first wins.
	// when tab is visible, raf fires first. when backgrounded, worker wins.
	const scheduleNextCheck = () => {
		const rafTick = new Promise<void>((res) => {
			requestAnimationFrame(() => res());
		});

		// browsers throttle RAF when tab is backgrounded, so race against worker
		const backgroundSafeTick = keepalive
			? Promise.race([rafTick, keepalive.waitForTick()])
			: rafTick;

		backgroundSafeTick.then(check);
	};

	scheduleNextCheck();

	return promise;
};
