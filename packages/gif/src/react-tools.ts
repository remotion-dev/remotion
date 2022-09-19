import {useLayoutEffect} from 'react';

import {generate, parse} from './parse-generate';
import type {GifState} from './props';
import {makeWorker} from './worker';

type Ref = {
	instance?: CanvasRenderingContext2D | null;
	timeout?: NodeJS.Timeout;
	usageCount?: number;
};

export const createCanvasSingleton = (
	constructor: () => CanvasRenderingContext2D | null
): (() => CanvasRenderingContext2D | null) => {
	const ref: Ref = {};
	return () => {
		if (!ref.instance) {
			ref.instance = constructor();
		}

		useLayoutEffect(() => {
			if (ref.timeout) {
				clearTimeout(ref.timeout);
				delete ref.timeout;
			} else {
				ref.usageCount = (ref.usageCount || 0) + 1;
			}

			return () => {
				ref.timeout = setTimeout(() => {
					if (ref.usageCount !== undefined) {
						ref.usageCount -= 1;
					}

					if (ref.usageCount === 0) {
						delete ref.instance;
						delete ref.timeout;
					}
				});
			};
		}, []);

		return ref.instance;
	};
};

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

let worker: Worker | null = null;

export const parseWithWorker = (src: string) => {
	if (!worker) {
		worker = makeWorker();
	}

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
				}
			}
		};

		(worker as Worker).addEventListener(
			'message',
			handler as (e: MessageEvent) => void
		);
		(worker as Worker).postMessage({src, type: 'parse'});
	});

	return {
		prom,
		cancel: () => {
			(worker as Worker).postMessage({src, type: 'cancel'});
			(worker as Worker).removeEventListener(
				'message',
				handler as (e: MessageEvent) => void
			);
		},
	};
};
