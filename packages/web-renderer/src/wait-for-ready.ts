import {withResolvers} from './with-resolvers';

// Local type definition to avoid tsgo declaration emit issues with nested type imports
type DelayRenderScope = {
	remotion_renderReady: boolean;
	remotion_delayRenderTimeouts: {
		[key: string]: {
			label: string | null;
			timeout: number | Timer;
			startTime: number;
		};
	};
	remotion_puppeteerTimeout: number;
	remotion_attempt: number;
	remotion_delayRenderHandles: number[];
	remotion_cancelledError?: string;
};

export const waitForReady = ({
	timeoutInMilliseconds,
	scope,
	signal,
	apiName,
}: {
	timeoutInMilliseconds: number;
	scope: DelayRenderScope;
	signal: AbortSignal | null;
	apiName: 'renderMediaOnWeb' | 'renderStillOnWeb';
}): Promise<void> => {
	const start = Date.now();
	const {promise, resolve, reject} = withResolvers<void>();

	let cancelled = false;

	const check = () => {
		if (cancelled) {
			return;
		}

		if (signal?.aborted) {
			cancelled = true;
			reject(new Error(`${apiName}() was cancelled`));
			return;
		}

		if (scope.remotion_renderReady === true) {
			resolve();
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
