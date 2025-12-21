import {type LogLevel} from 'remotion';
import type {PcmS16AudioData} from '../convert-audiodata/convert-audiodata';
import {extractFrameAndAudio} from '../extract-frame-and-audio';
import type {
	ExtractFrameRequest,
	ExtractFrameResponse,
} from './add-broadcast-channel-listener';
import {addBroadcastChannelListener} from './add-broadcast-channel-listener';

export type ExtractFrameViaBroadcastChannelResult =
	| {
			type: 'success';
			frame: ImageBitmap | null;
			audio: PcmS16AudioData | null;
			durationInSeconds: number | null;
	  }
	| {type: 'cannot-decode'; durationInSeconds: number | null}
	| {type: 'cannot-decode-alpha'; durationInSeconds: number | null}
	| {type: 'network-error'}
	| {type: 'unknown-container-format'};

addBroadcastChannelListener();

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
	maxCacheSize,
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
	maxCacheSize: number;
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
			maxCacheSize,
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
		maxCacheSize,
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
