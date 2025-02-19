import {parse} from '../parse-generate';

const abortMap = new Map();

self.addEventListener('message', (e) => {
	const {type, src} = e.data || e;

	switch (type) {
		case 'parse': {
			if (!abortMap.has(src)) {
				const controller = new AbortController();
				const signal = {signal: controller.signal};

				abortMap.set(src, controller);

				parse(src, signal)
					.then((result) => {
						self.postMessage(
							Object.assign(result, {src}),
							// @ts-expect-error
							result.frames.map((frame) => frame.buffer),
						);
					})
					.catch((error) => {
						self.postMessage({src, error, loaded: true});
					})
					.finally(() => {
						abortMap.delete(src);
					});
			}

			break;
		}

		case 'cancel': {
			if (abortMap.has(src)) {
				const controller = abortMap.get(src);
				controller.abort();
				abortMap.delete(src);
			}

			break;
		}

		default:
			break;
	}
});
