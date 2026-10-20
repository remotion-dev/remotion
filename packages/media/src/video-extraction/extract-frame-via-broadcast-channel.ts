import {type LogLevel} from 'remotion';
import type {MediaCache} from '../caches';
import type {PcmS16AudioData} from '../convert-audiodata/convert-audiodata';
import {extractFrameAndAudio} from '../extract-frame-and-audio';
import {
	normalizeMediaRequestInit,
	type MediaRequestInit,
} from '../request-init';
import type {
	ExtractFrameRequest,
	MessageFromMainTab,
} from './add-broadcast-channel-listener';
import {
	addBroadcastChannelListener,
	waitForMainTabToBeReady,
} from './add-broadcast-channel-listener';

export type ExtractFrameViaBroadcastChannelResult =
	| {
			type: 'success';
			frame: ImageBitmap | null;
			audio: PcmS16AudioData | null;
			durationInSeconds: number | null;
	  }
	| {type: 'cannot-decode'; durationInSeconds: number | null}
	| {type: 'cannot-decode-prores'; durationInSeconds: number | null}
	| {type: 'cannot-decode-alpha'; durationInSeconds: number | null}
	| {type: 'network-error'; error: Error | null}
	| {type: 'unknown-container-format'; error: Error | null};

addBroadcastChannelListener();

export const extractFrameViaBroadcastChannel = async ({
	sampleRate,
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
	credentials,
	requestInit,
	mediaCache,
}: {
	sampleRate: number;
	src: string;
	timeInSeconds: number;
	durationInSeconds: number;
	playbackRate: number;
	logLevel: LogLevel;
	includeAudio: boolean;
	includeVideo: boolean;
	isClientSideRendering: boolean;
	loop: boolean;
	audioStreamIndex: number | null;
	trimAfter: number | undefined;
	trimBefore: number | undefined;
	fps: number;
	maxCacheSize: number;
	credentials: RequestCredentials | undefined;
	requestInit?: MediaRequestInit;
	mediaCache: MediaCache;
}): Promise<ExtractFrameViaBroadcastChannelResult> => {
	if (isClientSideRendering || window.remotion_isMainTab) {
		return extractFrameAndAudio({
			sampleRate,
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
			credentials,
			requestInit,
			mediaCache,
		});
	}

	const channel = window.remotion_broadcastChannel!;
	let mainTabId = await waitForMainTabToBeReady(channel);
	const request: ExtractFrameRequest = {
		type: 'request',
		sampleRate,
		src,
		timeInSeconds,
		id: crypto.randomUUID(),
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
		credentials,
		requestInit: normalizeMediaRequestInit(requestInit),
	};
	let cleanup = () => {};

	const resolvePromise = new Promise<ExtractFrameViaBroadcastChannelResult>(
		(resolve, reject) => {
			const onMessage = (event: MessageEvent) => {
				const data = event.data as MessageFromMainTab;

				if (!data) {
					return;
				}

				if (data.type === 'main-tab-ready') {
					if (data.mainTabId !== mainTabId) {
						mainTabId = data.mainTabId;
						// The old tab may have closed with this request still pending.
						channel.postMessage(request);
					}

					return;
				}

				if (data.id !== request.id) {
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
					return;
				}

				if (data.type === 'response-error') {
					reject(data.errorStack);
					return;
				}

				if (data.type === 'response-cannot-decode') {
					resolve({
						type: 'cannot-decode',
						durationInSeconds: data.durationInSeconds,
					});
					return;
				}

				if (data.type === 'response-cannot-decode-prores') {
					resolve({
						type: 'cannot-decode-prores',
						durationInSeconds: data.durationInSeconds,
					});
					return;
				}

				if (
					data.type === 'response-network-error' ||
					data.type === 'response-unknown-container-format'
				) {
					const error = data.error ? new Error(data.error.message) : null;
					if (error && data.error) {
						error.name = data.error.name;
						error.stack = data.error.stack ?? undefined;
					}

					resolve({
						type:
							data.type === 'response-network-error'
								? 'network-error'
								: 'unknown-container-format',
						error,
					});
					return;
				}

				if (data.type === 'response-cannot-decode-alpha') {
					resolve({
						type: 'cannot-decode-alpha',
						durationInSeconds: data.durationInSeconds,
					});
					return;
				}

				throw new Error(
					`Invalid message: ${JSON.stringify(data satisfies never)}`,
				);
			};

			channel.addEventListener('message', onMessage);
			cleanup = () => channel.removeEventListener('message', onMessage);
		},
	);

	let timeoutId: NodeJS.Timeout | null = null;
	try {
		channel.postMessage(request);
		return await Promise.race([
			resolvePromise,
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
	} finally {
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
		}

		cleanup();
	}
};
