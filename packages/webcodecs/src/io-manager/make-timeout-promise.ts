import {withResolvers} from '../create/with-resolvers';
import type {WebCodecsController} from '../webcodecs-controller';

export const makeTimeoutPromise = ({
	label,
	ms,
	controller,
}: {
	label: () => string;
	ms: number;
	controller: WebCodecsController | null;
}) => {
	const {promise, reject, resolve} = withResolvers<void>();

	let timeout: Timer | null = null;

	const set = () => {
		timeout = setTimeout(() => {
			reject(new Error(`${label()} (timed out after ${ms}ms)`));
		}, ms);
	};

	set();

	const onPause = () => {
		if (timeout) {
			clearTimeout(timeout);
		}
	};

	const onResume = () => {
		set();
	};

	if (controller) {
		controller.addEventListener('pause', onPause);
		controller.addEventListener('resume', onResume);
	}

	return {
		timeoutPromise: promise,
		clear: () => {
			if (timeout) {
				clearTimeout(timeout);
			}

			resolve();
			if (controller) {
				controller.removeEventListener('pause', onPause);
				controller.removeEventListener('resume', onResume);
			}
		},
	};
};
