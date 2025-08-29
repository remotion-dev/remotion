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
			frame: VideoFrame | null;
	  }
	| {
			type: 'response-error';
			id: string;
			errorStack: Error;
	  };

let singleBroadcastChannel: BroadcastChannel | undefined;

const getBroadcastChannel = () => {
	if (singleBroadcastChannel) {
		return singleBroadcastChannel;
	}

	const channel = new BroadcastChannel('remotion-video-frame-extraction');

	singleBroadcastChannel = channel;

	singleBroadcastChannel.addEventListener('message', (event) => {
		if (!window.remotion_isMainTab) {
			// Other tabs will also get this message, but only the main tab should process it
			return;
		}

		console.log('data', event.data);
		const data = event.data as ExtractFrameRequest;
		if (data.type === 'request') {
			extractFrame({
				src: data.src,
				timestamp: data.timeInSeconds,
				logLevel: data.logLevel,
			})
				.then((frame) => {
					channel.postMessage({
						type: 'response-success',
						id: data.id,
						frame: frame?.toVideoFrame() ?? null,
					} as ExtractFrameResponse);
				})
				.catch((error) => {
					channel.postMessage({
						type: 'response-error',
						id: data.id,
						errorStack: error?.stack ?? 'No stack trace',
					} as ExtractFrameResponse);
				});
		} else {
			throw new Error('Invalid message: ' + JSON.stringify(data));
		}
	});

	return singleBroadcastChannel;
};

export const extractFrameViaBroadcastChannel = async ({
	src,
	timestamp,
	logLevel,
}: {
	src: string;
	timestamp: number;
	logLevel: LogLevel;
}): Promise<VideoFrame | null> => {
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

	const broadcastChannel = getBroadcastChannel();

	const requestId = crypto.randomUUID();

	broadcastChannel.postMessage({
		type: 'request',
		src,
		timeInSeconds: timestamp,
		id: requestId,
	});

	const resolvePromise = new Promise<VideoFrame | null>((resolve, reject) => {
		broadcastChannel.addEventListener(
			'message',
			(event) => {
				const data = event.data as ExtractFrameResponse;
				if (data.type === 'response-success' && data.id === requestId) {
					resolve(data.frame);
				} else if (data.type === 'response-error' && data.id === requestId) {
					reject(data.errorStack);
				}
			},
			{once: true},
		);
	});

	return Promise.race([
		resolvePromise,
		new Promise<never>((_, reject) => {
			setTimeout(
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
