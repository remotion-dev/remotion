import {type LogLevel} from 'remotion';
import type {PcmS16AudioData} from '../convert-audiodata/convert-audiodata';
import {extractFrameAndAudio} from '../extract-frame-and-audio';

type ExtractFrameRequest = {
	type: 'request';
	src: string;
	timeInSeconds: number;
	durationInSeconds: number;
	playbackRate: number;
	id: string;
	logLevel: LogLevel;
	includeAudio: boolean;
	includeVideo: boolean;
	volume: number;
	loop: boolean;
};

type ExtractFrameResponse =
	| {
			type: 'response-success';
			id: string;
			frame: ImageBitmap | null;
			audio: PcmS16AudioData | null;
	  }
	| {
			type: 'response-error';
			id: string;
			errorStack: string;
	  };

// Doesn't exist in studio
if (window.remotion_broadcastChannel && window.remotion_isMainTab) {
	window.remotion_broadcastChannel.addEventListener(
		'message',
		async (event) => {
			const data = event.data as ExtractFrameRequest;
			if (data.type === 'request') {
				try {
					const {frame, audio} = await extractFrameAndAudio({
						src: data.src,
						timeInSeconds: data.timeInSeconds,
						logLevel: data.logLevel,
						durationInSeconds: data.durationInSeconds,
						playbackRate: data.playbackRate,
						includeAudio: data.includeAudio,
						includeVideo: data.includeVideo,
						volume: data.volume,
						loop: data.loop,
					});

					const videoFrame = frame;
					const imageBitmap = videoFrame
						? await createImageBitmap(videoFrame)
						: null;
					if (videoFrame) {
						videoFrame.close();
					}

					const response: ExtractFrameResponse = {
						type: 'response-success',
						id: data.id,
						frame: imageBitmap,
						audio,
					};

					window.remotion_broadcastChannel!.postMessage(response);
					videoFrame?.close();
				} catch (error) {
					const response: ExtractFrameResponse = {
						type: 'response-error',
						id: data.id,
						errorStack: (error as Error).stack ?? 'No stack trace',
					};

					window.remotion_broadcastChannel!.postMessage(response);
				}
			} else {
				throw new Error('Invalid message: ' + JSON.stringify(data));
			}
		},
	);
}

export const extractFrameViaBroadcastChannel = ({
	src,
	timeInSeconds,
	logLevel,
	durationInSeconds,
	playbackRate,
	includeAudio,
	includeVideo,
	isClientSideRendering,
	volume,
	loop,
}: {
	src: string;
	timeInSeconds: number;
	durationInSeconds: number;
	playbackRate: number;
	logLevel: LogLevel;
	includeAudio: boolean;
	includeVideo: boolean;
	isClientSideRendering: boolean;
	volume: number;
	loop: boolean;
}): Promise<{
	frame: ImageBitmap | VideoFrame | null;
	audio: PcmS16AudioData | null;
}> => {
	if (isClientSideRendering || window.remotion_isMainTab) {
		return extractFrameAndAudio({
			logLevel,
			src,
			timeInSeconds,
			durationInSeconds,
			playbackRate,
			includeAudio,
			includeVideo,
			volume,
			loop,
		});
	}

	const requestId = crypto.randomUUID();

	const resolvePromise = new Promise<{
		frame: ImageBitmap | null;
		audio: PcmS16AudioData | null;
	}>((resolve, reject) => {
		const onMessage = (event: MessageEvent) => {
			const data = event.data as ExtractFrameResponse;

			if (!data) {
				return;
			}

			if (data.type === 'response-success' && data.id === requestId) {
				resolve({
					frame: data.frame ? data.frame : null,
					audio: data.audio ? data.audio : null,
				});
				window.remotion_broadcastChannel!.removeEventListener(
					'message',
					onMessage,
				);
			} else if (data.type === 'response-error' && data.id === requestId) {
				reject(data.errorStack);
				window.remotion_broadcastChannel!.removeEventListener(
					'message',
					onMessage,
				);
			}
		};

		window.remotion_broadcastChannel!.addEventListener('message', onMessage);
	});

	const request: ExtractFrameRequest = {
		type: 'request',
		src,
		timeInSeconds,
		id: requestId,
		logLevel,
		durationInSeconds,
		playbackRate,
		includeAudio,
		includeVideo,
		volume,
		loop,
	};

	window.remotion_broadcastChannel!.postMessage(request);

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
							`Timeout while extracting frame at time ${timeInSeconds}sec from ${src}`,
						),
					);
				},
				Math.max(3_000, window.remotion_puppeteerTimeout - 5_000),
			);
		}),
	]);
};
