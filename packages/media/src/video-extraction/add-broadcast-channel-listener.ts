import type {LogLevel} from 'remotion';
import type {PcmS16AudioData} from '../convert-audiodata/convert-audiodata';
import {extractFrameAndAudio} from '../extract-frame-and-audio';

export type MessageFromMainTab =
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
	  }
	| {
			type: 'main-tab-ready';
	  };

export type ExtractFrameRequest = {
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
	maxCacheSize: number;
};

// Send to other channels a message to let them know that the
// tab was loaded and is ready to receive requests.
// Emit "readiness" messages for approximately 10 seconds.
const emitReadiness = (channel: BroadcastChannel) => {
	channel.postMessage({
		type: 'main-tab-ready',
	} as MessageFromMainTab);

	setInterval(() => {
		channel.postMessage({
			type: 'main-tab-ready',
		} as MessageFromMainTab);
	}, 300);
};

export const addBroadcastChannelListener = () => {
	// Doesn't exist in studio
	if (
		!(
			typeof window !== 'undefined' &&
			window.remotion_broadcastChannel &&
			window.remotion_isMainTab
		)
	) {
		return;
	}

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
						maxCacheSize: data.maxCacheSize,
					});

					if (result.type === 'cannot-decode') {
						const cannotDecodeResponse: MessageFromMainTab = {
							type: 'response-cannot-decode',
							id: data.id,
							durationInSeconds: result.durationInSeconds,
						};

						window.remotion_broadcastChannel!.postMessage(cannotDecodeResponse);
						return;
					}

					if (result.type === 'cannot-decode-alpha') {
						const cannotDecodeAlphaResponse: MessageFromMainTab = {
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
						const networkErrorResponse: MessageFromMainTab = {
							type: 'response-network-error',
							id: data.id,
						};

						window.remotion_broadcastChannel!.postMessage(networkErrorResponse);
						return;
					}

					if (result.type === 'unknown-container-format') {
						const unknownContainerFormatResponse: MessageFromMainTab = {
							type: 'response-unknown-container-format',
							id: data.id,
						};

						window.remotion_broadcastChannel!.postMessage(
							unknownContainerFormatResponse,
						);
						return;
					}

					const {frame, audio, durationInSeconds} = result;

					const imageBitmap = frame ? await createImageBitmap(frame) : null;
					if (frame) {
						frame.close();
					}

					const response: MessageFromMainTab = {
						type: 'response-success',
						id: data.id,
						frame: imageBitmap,
						audio,
						durationInSeconds: durationInSeconds ?? null,
					};

					window.remotion_broadcastChannel!.postMessage(response);
				} catch (error) {
					const response: MessageFromMainTab = {
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

	emitReadiness(window.remotion_broadcastChannel!);
};

let mainTabIsReadyProm = null as Promise<void> | null;

export const waitForMainTabToBeReady = (channel: BroadcastChannel) => {
	if (mainTabIsReadyProm) {
		return mainTabIsReadyProm;
	}

	mainTabIsReadyProm = new Promise<void>((resolve) => {
		const onMessage = (event: MessageEvent) => {
			const data = event.data as MessageFromMainTab;
			if (data.type === 'main-tab-ready') {
				resolve();
				channel.removeEventListener('message', onMessage);
			}
		};

		channel.addEventListener('message', onMessage);
	});

	return mainTabIsReadyProm;
};
