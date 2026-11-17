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
	apiName: 'renderMediaOnWeb' | 'renderStillOnWeb' | 'renderFramesOnWeb';
	internalState: InternalState | null;
	keepalive: BackgroundKeepalive | null;
}) => {
	const start = performance.now();
	const suspensionStart = Internals.getDelayRenderSuspendedTime(scope);
	const {promise, resolve, reject} = withResolvers<void>();

	let settled = false;
	let frame: number | undefined;
	let deadline: ReturnType<typeof setTimeout> | undefined;

	const finish = () => {
		settled = true;
		clearTimeout(deadline);
		if (frame !== undefined) {
			cancelAnimationFrame(frame);
		}

		signal?.removeEventListener('abort', onAbort);
		internalState?.addWaitForReadyTime(performance.now() - start);
	};

	const onAbort = () => {
		finish();
		reject(new Error(`${apiName}() was cancelled`));
	};

	const timeRemaining = () =>
		timeoutInMilliseconds +
		3000 +
		(Internals.getDelayRenderSuspendedTime(scope) - suspensionStart) -
		(performance.now() - start);

	const check = () => {
		if (signal?.aborted) {
			onAbort();
			return;
		}

		if (scope.remotion_cancelledError !== undefined) {
			finish();
			// No serialization is needed for browser rendering. Reject with the
			// original Error so its identity, cause chain and custom fields survive.
			if (scope.remotion_cancelledErrorObject) {
				reject(scope.remotion_cancelledErrorObject);
				return;
			}

			// Keep accepting cancellations from core versions that only store a stack.
			const stack = scope.remotion_cancelledError;
			const message = stack.split('\n')[0].replace(/^Error: /, '');
			const error = new Error(message);
			error.stack = stack;
			reject(error);
			return;
		}

		if (scope.remotion_renderReady === true) {
			finish();
			resolve();
			return;
		}

		if (timeRemaining() <= 0) {
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
		const rafTick = withResolvers<void>();
		const id = requestAnimationFrame(() => rafTick.resolve());
		frame = id;

		// browsers throttle RAF when tab is backgrounded, so race against worker
		const backgroundSafeTick = keepalive
			? Promise.race([rafTick.promise, keepalive.waitForTick()])
			: rafTick.promise;

		backgroundSafeTick.then(() => {
			if (settled) {
				return;
			}

			cancelAnimationFrame(id);
			frame = undefined;
			check();
			if (!settled) {
				scheduleNextCheck();
			}
		});
	};

	const checkDeadline = () => {
		check();
		if (!settled) {
			// Offline suspension may have moved the deadline.
			deadline = setTimeout(checkDeadline, Math.max(1000, timeRemaining()));
		}
	};

	// Check immediately so an already-ready composition needs no tick or timer.
	check();
	if (!settled) {
		// A stopped compositor must not prevent cancellation or the deadline.
		signal?.addEventListener('abort', onAbort, {once: true});
		deadline = setTimeout(checkDeadline, timeRemaining());
		scheduleNextCheck();
	}

	return promise;
};
