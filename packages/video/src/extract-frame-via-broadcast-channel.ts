import {extractFrame} from './extract-frame';
import type {LogLevel} from './log';

type ExtractFrameRequest = {
	type: 'request';
	src: string;
	timeInSeconds: number;
	id: string;
	logLevel: LogLevel;
};

type ExtractFrameResponse =
	| {
			type: 'response-success';
			id: string;
			frame: ImageBitmap | null;
	  }
	| {
			type: 'response-error';
			id: string;
			errorStack: string;
	  };

window.remotion_broadcastChannel.addEventListener('message', async (event) => {
	if (!window.remotion_isMainTab) {
		// Other tabs will also get this message, but only the main tab should process it
		return;
	}

	const data = event.data as ExtractFrameRequest;
	if (data.type === 'request') {
		try {
			const sample = await extractFrame({
				src: data.src,
				timestamp: data.timeInSeconds,
				logLevel: data.logLevel,
			});

			const frame = sample?.toVideoFrame() ?? null;
			const imageBitmap = frame ? await createImageBitmap(frame) : null;
			if (frame) {
				frame.close();
			}

			const response: ExtractFrameResponse = {
				type: 'response-success',
				id: data.id,
				frame: imageBitmap,
			};

			window.remotion_broadcastChannel.postMessage(response);
			frame?.close();
		} catch (error) {
			const response: ExtractFrameResponse = {
				type: 'response-error',
				id: data.id,
				errorStack: (error as Error).stack ?? 'No stack trace',
			};

			window.remotion_broadcastChannel.postMessage(response);
		}
	} else {
		throw new Error('Invalid message: ' + JSON.stringify(data));
	}
});

export const extractFrameViaBroadcastChannel = async ({
	src,
	timestamp,
	logLevel,
}: {
	src: string;
	timestamp: number;
	logLevel: LogLevel;
}): Promise<ImageBitmap | VideoFrame | null> => {
	if (typeof window.remotion_isMainTab === 'undefined') {
		throw new Error('This should be defined');
	}

	if (window.remotion_isMainTab) {
		const sample = await extractFrame({
			logLevel,
			src,
			timestamp,
		});

		if (!sample) {
			return null;
		}

		return sample.toVideoFrame();
	}

	const requestId = crypto.randomUUID();

	const resolvePromise = new Promise<ImageBitmap | null>((resolve, reject) => {
		const onMessage = (event: MessageEvent) => {
			const data = event.data as ExtractFrameResponse;
			console.log('data', event);

			if (!data) {
				return;
			}

			if (data.type === 'response-success' && data.id === requestId) {
				resolve(data.frame ? data.frame : null);
				window.remotion_broadcastChannel.removeEventListener(
					'message',
					onMessage,
				);
			} else if (data.type === 'response-error' && data.id === requestId) {
				reject(data.errorStack);
				window.remotion_broadcastChannel.removeEventListener(
					'message',
					onMessage,
				);
			}
		};

		window.remotion_broadcastChannel.addEventListener('message', onMessage);
	});

	const request: ExtractFrameRequest = {
		type: 'request',
		src,
		timeInSeconds: timestamp,
		id: requestId,
		logLevel,
	};

	window.remotion_broadcastChannel.postMessage(request);

	let timeoutId: NodeJS.Timeout | undefined;

	return Promise.race([
		resolvePromise.then((res) => {
			clearTimeout(timeoutId);
			return res;
		}),
		new Promise<never>((_, reject) => {
			timeoutId = setTimeout(
				() => {
					reject(
						new Error(
							`Timeout while extracting frame ${timestamp} from ${src}`,
						),
					);
				},
				Math.max(3_000, window.remotion_puppeteerTimeout - 5_000),
			);
		}),
	]);
};
