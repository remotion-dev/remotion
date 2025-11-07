import type {_InternalTypes} from 'remotion';

export const waitForReady = (
	timeoutInMilliseconds: number,
	scope: _InternalTypes['DelayRenderScope'],
) => {
	const {promise, resolve, reject} = Promise.withResolvers();

	const start = Date.now();

	const interval = setInterval(() => {
		if (scope.remotion_renderReady === true) {
			resolve(true);
			clearInterval(interval);
			return;
		}

		if (window.remotion_cancelledError !== undefined) {
			reject(window.remotion_cancelledError);
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
