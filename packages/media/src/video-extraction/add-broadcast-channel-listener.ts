import type {LogLevel} from 'remotion';
import type {PcmS16AudioData} from '../convert-audiodata/convert-audiodata';
import {extractFrameAndAudio} from '../extract-frame-and-audio';

export type ExtractFrameResponse =
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

export const addBroadcastChannelListener = () => {
	// Doesn't exist in studio
	if (
		typeof window !== 'undefined' &&
		window.remotion_broadcastChannel &&
		window.remotion_isMainTab
	) {
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
							const cannotDecodeResponse: ExtractFrameResponse = {
								type: 'response-cannot-decode',
								id: data.id,
								durationInSeconds: result.durationInSeconds,
							};

							window.remotion_broadcastChannel!.postMessage(
								cannotDecodeResponse,
							);
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

							window.remotion_broadcastChannel!.postMessage(
								networkErrorResponse,
							);
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

						const imageBitmap = frame ? await createImageBitmap(frame) : null;
						if (frame) {
							frame.close();
						}

						const response: ExtractFrameResponse = {
							type: 'response-success',
							id: data.id,
							frame: imageBitmap,
							audio,
							durationInSeconds: durationInSeconds ?? null,
						};

						window.remotion_broadcastChannel!.postMessage(response);
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
};
