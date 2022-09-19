import {useCallback, useEffect, useLayoutEffect, useRef} from 'react';

import {generate, parse} from './parse-generate';
import {makeWorker} from './worker';

type WorkerRef = {
	instance?: Worker;
	timeout?: NodeJS.Timeout;
	usageCount?: number;
};

const createSingleton = (
	constructor: () => Worker,
	destructor: (worker: Worker) => void
): (() => Worker) => {
	const ref: WorkerRef = {};
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
						destructor?.(ref.instance as Worker);
						delete ref.instance;
						delete ref.timeout;
					}
				});
			};
		}, []);

		return ref.instance;
	};
};

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

const useUpdatedRef = (value: Function) => {
	const ref = useRef(value);
	useEffect(() => {
		ref.current = value;
	}, [value]);
	return ref;
};

const useEventCallback = (callback: Function) => {
	const ref = useUpdatedRef(callback);
	return useCallback((arg: unknown) => ref.current?.(arg), [ref]);
};

const useAsyncEffect = (
	fn: (controller: AbortController) => void,
	deps: unknown[]
) => {
	const cb = useEventCallback(fn);

	useEffect(() => {
		const controller = new AbortController();
		const dest = cb(controller);

		return () => {
			controller.abort();
			dest?.();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [...deps]);
};

type ParserCallbackArgs =
	| {
			loaded: true;
			width: number;
			height: number;
			delays: number[];
			frames: ImageData[];
	  }
	| {loaded: true; error: Error};

const useParser = (
	src: string,
	callback: (data: ParserCallbackArgs) => void
) => {
	const cb = useEventCallback(callback);

	useAsyncEffect(
		(controller) => {
			if (typeof src === 'string') {
				parse(src, {signal: controller.signal})
					.then((raw) => generate(raw))
					.then((info) => cb(info))
					.catch((error) => cb({error, loaded: true}));
			}
		},
		[src]
	);
};

const useWorkerSingleton = createSingleton(
	() => makeWorker(),
	(worker) => worker.terminate()
);

const useWorkerParser = (
	src: string | boolean,
	callback: (data: ParserCallbackArgs) => void
) => {
	const cb = useEventCallback(callback);
	const worker = useWorkerSingleton();

	useEffect(() => {
		if (typeof src === 'string') {
			const handler = (e: MessageEvent) => {
				const message = e.data || e;
				if (message.src === src) {
					const data = message.error ? message : generate(message);
					cb(data);
				}
			};

			worker.addEventListener('message', handler);
			worker.postMessage({src, type: 'parse'});

			return () => {
				worker.postMessage({src, type: 'cancel'});
				worker.removeEventListener('message', handler);
			};
		}
	}, [worker, src, cb]);
};

export {createSingleton, useParser, useWorkerParser};
