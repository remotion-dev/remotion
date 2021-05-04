if (typeof window !== 'undefined') {
	window.ready = false;
}

let handles: number[] = [];
const timeouts: {[key: string]: NodeJS.Timeout} = {};

export const delayRender = (): number => {
	const handle = Math.random();
	handles.push(handle);
	const called = Error().stack?.replace(/^Error/g, '') ?? '';

	if (process.env.NODE_ENV === 'production') {
		timeouts[handle] = setTimeout(() => {
			throw new Error(
				'A delayRender was called but not cleared after 25000ms. See https://remotion.dev/docs/timeout for help. The delayRender was called: ' +
					called
			);
		}, 25000);
	}

	if (typeof window !== 'undefined') {
		window.ready = false;
	}

	return handle;
};

export const continueRender = (handle: number): void => {
	handles = handles.filter((h) => {
		if (h === handle) {
			if (process.env.NODE_ENV === 'production') {
				clearTimeout(timeouts[handle]);
			}

			return false;
		}

		return true;
	});
	if (handles.length === 0 && typeof window !== 'undefined') {
		window.ready = true;
	}
};
