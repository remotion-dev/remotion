import {parse} from '../parse-generate';

const abortMap = new Map();

self.addEventListener('message', (e) => {
	const {type, src, cacheKey, requestInit} = e.data || e;

	switch (type) {
		case 'parse': {
			if (!abortMap.has(cacheKey)) {
				const controller = new AbortController();
				const signal = {signal: controller.signal, requestInit};

				abortMap.set(cacheKey, controller);

				parse(src, signal)
					.then((result) => {
						self.postMessage(
							Object.assign(result, {src, cacheKey}),
							// @ts-expect-error
							result.frames.map((frame) => frame.buffer),
						);
					})
					.catch((error) => {
						self.postMessage({src, cacheKey, error, loaded: true});
					})
					.finally(() => {
						abortMap.delete(cacheKey);
					});
			}

			break;
		}

		case 'cancel': {
			if (abortMap.has(cacheKey)) {
				const controller = abortMap.get(cacheKey);
				controller.abort();
				abortMap.delete(cacheKey);
			}

			break;
		}

		default:
			break;
	}
});
