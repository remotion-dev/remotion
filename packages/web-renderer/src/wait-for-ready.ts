/* eslint-disable @typescript-eslint/no-use-before-define */
import {Internals, type DelayRenderScope} from 'remotion';
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

	let completed = false;
	let rafId: number | null = null;
	const unsubscribe = Internals.subscribeToRenderReady(scope, () => {
		// A layout effect may clear an old handle and open a new one in the
		// same commit. Check after that stack has finished.
		queueMicrotask(check);
	});

	const finish = () => {
		completed = true;
		unsubscribe();
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
		}

		internalState?.addWaitForReadyTime(performance.now() - start);
	};

	const check = () => {
		if (completed) {
			return;
		}

		if (signal?.aborted) {
			finish();
			reject(new Error(`${apiName}() was cancelled`));
			return;
		}

		if (scope.remotion_renderReady === true) {
			finish();
			resolve();
			return;
		}

		if (scope.remotion_cancelledError !== undefined) {
			finish();
			const stack = scope.remotion_cancelledError;
			const message = stack.split('\n')[0].replace(/^Error: /, '');
			const error = new Error(message);
			error.stack = stack;
			reject(error);
			return;
		}

		if (performance.now() - start > timeoutInMilliseconds + 3000) {
			finish();
			reject(
				new Error(
					Object.values(scope.remotion_delayRenderTimeouts)
						.map((d) => d.label)
						.join(', '),
				),
			);
		}
	};

	// schedule both raf and worker timer - whichever fires first wins.
	// when tab is visible, raf fires first. when backgrounded, worker wins.
	const scheduleNextCheck = () => {
		const rafTick = new Promise<void>((res) => {
			rafId = requestAnimationFrame(() => res());
		});

		// browsers throttle RAF when tab is backgrounded, so race against worker
		const backgroundSafeTick = keepalive
			? Promise.race([rafTick, keepalive.waitForTick()])
			: rafTick;

		backgroundSafeTick.then(() => {
			if (rafId !== null) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}

			check();
			if (!completed) {
				scheduleNextCheck();
			}
		});
	};

	// check immediately first - if already ready, don't wait for RAF
	check();
	if (!completed) {
		scheduleNextCheck();
	}

	return promise;
};
