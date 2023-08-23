import {generate, parse} from './parse-generate';
import type {GifState} from './props';
import {makeWorker} from './worker';

export const parseGif = async ({
	src,
	controller,
}: {
	src: string;
	controller: AbortController;
}) => {
	const raw = await parse(src, {signal: controller.signal});
	return generate(raw);
};

export const parseWithWorker = (src: string) => {
	const worker = makeWorker();

	let handler: ((e: MessageEvent) => void) | null = null;

	const prom = new Promise<GifState>((resolve, reject) => {
		handler = (e: MessageEvent) => {
			const message = e.data || e;
			if (message.src === src) {
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
		worker.postMessage({src, type: 'parse'});
	});

	return {
		prom,
		cancel: () => {
			worker.postMessage({src, type: 'cancel'});
			worker.removeEventListener(
				'message',
				handler as (e: MessageEvent) => void,
			);
			worker.terminate();
		},
	};
};
