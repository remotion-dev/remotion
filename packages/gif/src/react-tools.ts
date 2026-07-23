import {generate, parse} from './parse-generate';
import type {GifState} from './props';
import {normalizeRequestInit} from './request-init';
import {makeWorker} from './worker';

export const parseGif = async ({
	src,
	controller,
	requestInit,
}: {
	src: string;
	controller: AbortController;
	requestInit?: RequestInit;
}) => {
	const raw = await parse(src, {signal: controller.signal, requestInit});
	return generate(raw);
};

export const parseWithWorker = ({
	src,
	cacheKey,
	requestInit,
}: {
	src: string;
	cacheKey: string;
	requestInit?: RequestInit;
}) => {
	const worker = makeWorker();
	const workerRequestInit = normalizeRequestInit(requestInit);

	let handler: ((e: MessageEvent) => void) | null = null;

	const prom = new Promise<GifState>((resolve, reject) => {
		handler = (e: MessageEvent) => {
			const message = e.data || e;
			if (message.cacheKey === cacheKey) {
				if (message.error) {
					reject(new Error(message.error));
				} else {
					const data = message.error ? message : generate(message);
					resolve(data);
					worker.terminate();
				}
			}
		};

		worker.addEventListener('message', handler as (e: MessageEvent) => void);
		worker.postMessage({
			src,
			cacheKey,
			requestInit: workerRequestInit,
			type: 'parse',
		});
	});

	return {
		prom,
		cancel: () => {
			worker.postMessage({cacheKey, type: 'cancel'});
			worker.removeEventListener(
				'message',
				handler as (e: MessageEvent) => void,
			);
			worker.terminate();
		},
	};
};
