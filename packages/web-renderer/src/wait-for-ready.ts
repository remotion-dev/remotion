import type {_InternalTypes} from 'remotion';
import {withResolvers} from './with-resolvers';

export const waitForReady = ({
	timeoutInMilliseconds,
	scope,
	signal,
	apiName,
}: {
	timeoutInMilliseconds: number;
	scope: _InternalTypes['DelayRenderScope'];
	signal: AbortSignal | null;
	apiName: 'renderMediaOnWeb' | 'renderStillOnWeb';
}) => {
	const start = Date.now();
	const {promise, resolve, reject} = withResolvers<void>();

	let cancelled = false;
	// We want to wait at least for 1 frame (1 cycle)
	let frameWaited = false;

	const check = () => {
		if (cancelled) {
			return;
		}

		if (signal?.aborted) {
			cancelled = true;
			reject(new Error(`${apiName}() was cancelled`));
			return;
		}

		if (!frameWaited) {
			// Ensure at least one frame has passed
			frameWaited = true;
			requestAnimationFrame(check);
			return;
		}

		if (scope.remotion_renderReady === true) {
			// Wait for useEffects() to apply
			requestAnimationFrame(() => {
				// Firefox needs at least two frames to apply the transform
				requestAnimationFrame(() => {
					resolve();
				});
			});
			return;
		}

		if (scope.remotion_cancelledError !== undefined) {
			cancelled = true;
			reject(scope.remotion_cancelledError);
			return;
		}

		if (Date.now() - start > timeoutInMilliseconds + 3000) {
			cancelled = true;
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
