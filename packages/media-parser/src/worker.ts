import type {
	AllOptions,
	Options,
	ParseMedia,
	ParseMediaFields,
	ParseMediaOptions,
	ParseMediaResult,
} from './options';
import {deserializeError} from './worker/serialize-error';
import type {
	ParseMediaOnWorker,
	WorkerRequestPayload,
	WorkerResponsePayload,
} from './worker/worker-types';

const convertToWorkerPayload = (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	payload: Omit<ParseMediaOptions<any>, 'controller'>,
): ParseMediaOnWorker => {
	const {onAudioCodec, onContainer, ...others} = payload;

	return {
		type: 'request-worker',
		payload: others,
		postAudioCodec: Boolean(onAudioCodec),
		postContainer: Boolean(onContainer),
	};
};

const post = (worker: Worker, payload: WorkerRequestPayload) => {
	worker.postMessage(payload);
};

export const parseMediaOnWorker: ParseMedia = async <
	F extends Options<ParseMediaFields>,
>({
	controller,
	...params
}: ParseMediaOptions<F>) => {
	if (typeof Worker === 'undefined') {
		throw new Error('"Worker" is not available. Cannot call workerClient()');
	}

	const worker = new Worker(new URL('./worker-server', import.meta.url));

	post(worker, convertToWorkerPayload(params));

	const {promise, resolve, reject} =
		Promise.withResolvers<
			ParseMediaResult<Partial<AllOptions<ParseMediaFields>>>
		>();

	const onAbort = () => {
		post(worker, {type: 'request-abort'});
	};

	const onResume = () => {
		post(worker, {type: 'request-resume'});
	};

	const onPause = () => {
		post(worker, {type: 'request-pause'});
	};

	function onMessage(message: MessageEvent) {
		const data = message.data as WorkerResponsePayload;
		if (data.type === 'response-done') {
			resolve(data.payload);
		}

		if (data.type === 'response-error') {
			// eslint-disable-next-line @typescript-eslint/no-use-before-define
			cleanup();
			reject(deserializeError(data));
		}

		if (data.type === 'response-on-callback-request') {
			Promise.resolve()
				.then(() => {
					if (data.payload.callbackType === 'audio-codec') {
						return params.onAudioCodec?.(data.payload.value);
					}

					if (data.payload.callbackType === 'container') {
						return params.onContainer?.(data.payload.value);
					}

					throw new Error(
						`Unknown callback type: ${data.payload satisfies never}`,
					);
				})
				.then(() => {
					post(worker, {type: 'acknowledge-callback', nonce: data.nonce});
				})
				.catch((err) => {
					reject(err);
					post(worker, {
						type: 'signal-error-in-callback',
						nonce: data.nonce,
					});
				});
		}
	}

	worker.addEventListener('message', onMessage);
	controller?.addEventListener('abort', onAbort);
	controller?.addEventListener('resume', onResume);
	controller?.addEventListener('pause', onPause);

	function cleanup() {
		worker.removeEventListener('message', onMessage);
		controller?.removeEventListener('abort', onAbort);
		controller?.removeEventListener('resume', onResume);
		controller?.removeEventListener('pause', onPause);

		worker.terminate();
	}

	const val = await promise;

	cleanup();
	return val as Promise<ParseMediaResult<F>>;
};
