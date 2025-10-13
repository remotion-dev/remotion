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
	trimAfter: number | undefined;
	trimBefore: number | undefined;
	fps: number;
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
			durationInSeconds: number | null;
	  }
	| {
			type: 'response-cannot-decode-alpha';
			id: string;
			durationInSeconds: number | null;
	  }
	| {
			type: 'response-network-error';
			id: string;
	  }
	| {
			type: 'response-unknown-container-format';
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
						trimAfter: data.trimAfter,
						trimBefore: data.trimBefore,
						fps: data.fps,
					});

					if (result.type === 'cannot-decode') {
						const cannotDecodeResponse: ExtractFrameResponse = {
							type: 'response-cannot-decode',
							id: data.id,
							durationInSeconds: result.durationInSeconds,
						};

						window.remotion_broadcastChannel!.postMessage(cannotDecodeResponse);
						return;
					}

					if (result.type === 'cannot-decode-alpha') {
						const cannotDecodeAlphaResponse: ExtractFrameResponse = {
							type: 'response-cannot-decode-alpha',
							id: data.id,
							durationInSeconds: result.durationInSeconds,
						};

						window.remotion_broadcastChannel!.postMessage(
							cannotDecodeAlphaResponse,
						);
						return;
					}

					if (result.type === 'network-error') {
						const networkErrorResponse: ExtractFrameResponse = {
							type: 'response-network-error',
							id: data.id,
						};

						window.remotion_broadcastChannel!.postMessage(networkErrorResponse);
						return;
					}

					if (result.type === 'unknown-container-format') {
						const unknownContainerFormatResponse: ExtractFrameResponse = {
							type: 'response-unknown-container-format',
							id: data.id,
						};

						window.remotion_broadcastChannel!.postMessage(
							unknownContainerFormatResponse,
						);
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

export type ExtractFrameViaBroadcastChannelResult =
	| {
			type: 'success';
			frame: ImageBitmap | VideoFrame | null;
			audio: PcmS16AudioData | null;
			durationInSeconds: number | null;
	  }
	| {type: 'cannot-decode'; durationInSeconds: number | null}
	| {type: 'cannot-decode-alpha'; durationInSeconds: number | null}
	| {type: 'network-error'}
	| {type: 'unknown-container-format'};

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
	trimAfter,
	trimBefore,
	fps,
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
	trimAfter: number | undefined;
	trimBefore: number | undefined;
	fps: number;
}): Promise<ExtractFrameViaBroadcastChannelResult> => {
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
			trimAfter,
			trimBefore,
			fps,
		});
	}

	const requestId = crypto.randomUUID();

	const resolvePromise = new Promise<
		| {
				type: 'success';
				frame: ImageBitmap | null;
				audio: PcmS16AudioData | null;
				durationInSeconds: number | null;
		  }
		| {type: 'cannot-decode'; durationInSeconds: number | null}
		| {type: 'cannot-decode-alpha'; durationInSeconds: number | null}
		| {type: 'network-error'}
		| {type: 'unknown-container-format'}
	>((resolve, reject) => {
		const onMessage = (event: MessageEvent) => {
			const data = event.data as ExtractFrameResponse;

			if (!data) {
				return;
			}

			if (data.id !== requestId) {
				return;
			}

			if (data.type === 'response-success') {
				resolve({
					type: 'success',
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
				return;
			}

			if (data.type === 'response-error') {
				reject(data.errorStack);
				window.remotion_broadcastChannel!.removeEventListener(
					'message',
					onMessage,
				);
				return;
			}

			if (data.type === 'response-cannot-decode') {
				resolve({
					type: 'cannot-decode',
					durationInSeconds: data.durationInSeconds,
				});
				window.remotion_broadcastChannel!.removeEventListener(
					'message',
					onMessage,
				);
				return;
			}

			if (data.type === 'response-network-error') {
				resolve({type: 'network-error'});
				window.remotion_broadcastChannel!.removeEventListener(
					'message',
					onMessage,
				);
				return;
			}

			if (data.type === 'response-unknown-container-format') {
				resolve({type: 'unknown-container-format'});
				window.remotion_broadcastChannel!.removeEventListener(
					'message',
					onMessage,
				);
				return;
			}

			if (data.type === 'response-cannot-decode-alpha') {
				resolve({
					type: 'cannot-decode-alpha',
					durationInSeconds: data.durationInSeconds,
				});
				window.remotion_broadcastChannel!.removeEventListener(
					'message',
					onMessage,
				);
				return;
			}

			throw new Error(
				`Invalid message: ${JSON.stringify(data satisfies never)}`,
			);
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
		trimAfter,
		trimBefore,
		fps,
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
