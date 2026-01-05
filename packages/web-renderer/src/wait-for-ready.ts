import type {DelayRenderScope} from 'remotion';
import type {InternalState} from './internal-state';
import {withResolvers} from './with-resolvers';

export const waitForReady = ({
	timeoutInMilliseconds,
	scope,
	signal,
	apiName,
	internalState,
}: {
	timeoutInMilliseconds: number;
	scope: DelayRenderScope;
	signal: AbortSignal | null;
	apiName: 'renderMediaOnWeb' | 'renderStillOnWeb';
	internalState: InternalState | null;
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
			reject(scope.remotion_cancelledError);
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

		requestAnimationFrame(check);
	};

	requestAnimationFrame(check);

	return promise;
};
