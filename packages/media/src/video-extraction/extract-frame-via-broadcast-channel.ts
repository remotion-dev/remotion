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
	loop: boolean;
	audioStreamIndex: number;
};

type ExtractFrameResponse =
	| {
			type: 'response-success';
			id: string;
			frame: ImageBitmap | null;
			audio: PcmS16AudioData | null;
			durationInSeconds: number | null;
	  }
	| {
			type: 'response-error';
			id: string;
			errorStack: string;
	  }
	| {
			type: 'response-cannot-decode';
			id: string;
	  }
	| {
			type: 'response-network-error';
			id: string;
	  };

// Doesn't exist in studio
if (window.remotion_broadcastChannel && window.remotion_isMainTab) {
	window.remotion_broadcastChannel.addEventListener(
		'message',
		async (event) => {
			const data = event.data as ExtractFrameRequest;
			if (data.type === 'request') {
				try {
					const result = await extractFrameAndAudio({
						src: data.src,
						timeInSeconds: data.timeInSeconds,
						logLevel: data.logLevel,
						durationInSeconds: data.durationInSeconds,
						playbackRate: data.playbackRate,
						includeAudio: data.includeAudio,
						includeVideo: data.includeVideo,
						loop: data.loop,
						audioStreamIndex: data.audioStreamIndex,
					});

					if (result === 'cannot-decode') {
						const cannotDecodeResponse: ExtractFrameResponse = {
							type: 'response-cannot-decode',
							id: data.id,
						};

						window.remotion_broadcastChannel!.postMessage(cannotDecodeResponse);
						return;
					}

					if (result === 'network-error') {
						const networkErrorResponse: ExtractFrameResponse = {
							type: 'response-network-error',
							id: data.id,
						};

						window.remotion_broadcastChannel!.postMessage(networkErrorResponse);
						return;
					}

					const {frame, audio, durationInSeconds} = result;

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
						durationInSeconds: durationInSeconds ?? null,
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
	loop,
	audioStreamIndex,
}: {
	src: string;
	timeInSeconds: number;
	durationInSeconds: number;
	playbackRate: number;
	logLevel: LogLevel;
	includeAudio: boolean;
	includeVideo: boolean;
	isClientSideRendering: boolean;
	loop: boolean;
	audioStreamIndex: number;
}): Promise<
	| {
			frame: ImageBitmap | VideoFrame | null;
			audio: PcmS16AudioData | null;
			durationInSeconds: number | null;
	  }
	| 'cannot-decode'
	| 'network-error'
> => {
	if (isClientSideRendering || window.remotion_isMainTab) {
		return extractFrameAndAudio({
			logLevel,
			src,
			timeInSeconds,
			durationInSeconds,
			playbackRate,
			includeAudio,
			includeVideo,
			loop,
			audioStreamIndex,
		});
	}

	const requestId = crypto.randomUUID();

	const resolvePromise = new Promise<
		| {
				frame: ImageBitmap | null;
				audio: PcmS16AudioData | null;
				durationInSeconds: number | null;
		  }
		| 'cannot-decode'
		| 'network-error'
	>((resolve, reject) => {
		const onMessage = (event: MessageEvent) => {
			const data = event.data as ExtractFrameResponse;

			if (!data) {
				return;
			}

			if (data.type === 'response-success' && data.id === requestId) {
				resolve({
					frame: data.frame ? data.frame : null,
					audio: data.audio ? data.audio : null,
					durationInSeconds: data.durationInSeconds
						? data.durationInSeconds
						: null,
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
			} else if (
				data.type === 'response-cannot-decode' &&
				data.id === requestId
			) {
				resolve('cannot-decode');
				window.remotion_broadcastChannel!.removeEventListener(
					'message',
					onMessage,
				);
			} else if (
				data.type === 'response-network-error' &&
				data.id === requestId
			) {
				resolve('network-error');
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
		loop,
		audioStreamIndex,
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
