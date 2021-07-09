import {getRemotionEnvironment} from './get-environment';

if (typeof window !== 'undefined') {
	window.remotion_handlesReady = false;
	window.remotion_fontsReady = false;

	document.fonts.ready
		.then(() => {
			window.remotion_fontsReady = true;
		})
		.catch(() => {
			window.remotion_fontsReady = true;
		});
}

let handles: number[] = [];
const timeouts: {[key: string]: number | NodeJS.Timeout} = {};

export const delayRender = (): number => {
	const handle = Math.random();
	handles.push(handle);
	const called = Error().stack?.replace(/^Error/g, '') ?? '';

	if (getRemotionEnvironment() === 'rendering') {
		timeouts[handle] = setTimeout(() => {
			throw new Error(
				'A delayRender was called but not cleared after 25000ms. See https://remotion.dev/docs/timeout for help. The delayRender was called: ' +
					called
			);
		}, 25000);
	}

	if (typeof window !== 'undefined') {
		window.remotion_handlesReady = false;
	}

	return handle;
};

export const continueRender = (handle: number): void => {
	handles = handles.filter((h) => {
		if (h === handle) {
			if (getRemotionEnvironment() === 'rendering') {
				clearTimeout(timeouts[handle] as number);
			}

			return false;
		}

		return true;
	});
	if (handles.length === 0 && typeof window !== 'undefined') {
		window.remotion_handlesReady = true;
	}
};
