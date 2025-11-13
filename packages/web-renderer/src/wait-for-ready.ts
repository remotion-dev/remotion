import type {_InternalTypes} from 'remotion';
import {withResolvers} from './with-resolvers';

export const waitForReady = (
	timeoutInMilliseconds: number,
	scope: _InternalTypes['DelayRenderScope'],
) => {
	if (scope.remotion_renderReady === true) {
		return;
	}

	const start = Date.now();
	const {promise, resolve, reject} = withResolvers<void>();

	const interval = setInterval(() => {
		if (scope.remotion_renderReady === true) {
			// Wait for useEffects() to apply
			requestAnimationFrame(() => {
				resolve();
			});

			clearInterval(interval);
			return;
		}

		if (scope.remotion_cancelledError !== undefined) {
			reject(scope.remotion_cancelledError);
			clearInterval(interval);
			return;
		}

		if (Date.now() - start > timeoutInMilliseconds + 3000) {
			// TODO: Error message should be just as good
			reject(
				new Error(
					Object.values(scope.remotion_delayRenderTimeouts)
						.map((d) => d.label)
						.join(', '),
				),
			);
			clearInterval(interval);
		}
	}, 50);

	return promise;
};
