import type {InputAudioTrack} from 'mediabunny';
import {
	ALL_FORMATS,
	Input,
	InputDisposedError,
	MATROSKA,
	UrlSource,
	WEBM,
} from 'mediabunny';
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {cancelRender, Internals, useDelayRender} from 'remotion';
import {combineFloat32Arrays} from './combine-float32-arrays';
import {getPartialAudioData} from './get-partial-audio-data';
import {isRemoteAsset} from './is-remote-asset';

import type {MediaUtilsAudioData} from './types';

type WaveformMap = Record<number, Float32Array>;

const warnedMatroska: Record<string, boolean> = {};

export type UseWindowedAudioDataOptions = {
	src: string;
	frame: number;
	fps: number;
	windowInSeconds: number;
	channelIndex?: number;
};

export type UseWindowedAudioDataReturnValue = {
	audioData: MediaUtilsAudioData | null;
	dataOffsetInSeconds: number;
};

interface AudioMetadata {
	durationInSeconds: number;
	numberOfChannels: number;
	sampleRate: number;
}

interface AudioUtils {
	input: Input;
	track: InputAudioTrack;
	metadata: AudioMetadata;
	isMatroska: boolean;
}

export const useWindowedAudioData = ({
	src,
	frame,
	fps,
	windowInSeconds,
	channelIndex = 0,
}: UseWindowedAudioDataOptions): UseWindowedAudioDataReturnValue => {
	const isMounted = useRef(true);
	const [audioUtils, setAudioUtils] = useState<AudioUtils | null>(null);
	const [waveFormMap, setWaveformMap] = useState({} as WaveformMap);
	const requests = useRef<Record<string, AbortController | null>>({});
	const [initialWindowInSeconds] = useState(windowInSeconds);

	if (windowInSeconds !== initialWindowInSeconds) {
		throw new Error('windowInSeconds cannot be changed dynamically');
	}

	useEffect(() => {
		isMounted.current = true;

		return () => {
			isMounted.current = false;

			Object.values(requests.current).forEach((controller) => {
				if (controller) {
					controller.abort();
				}
			});
			requests.current = {};

			setWaveformMap({});

			if (audioUtils) {
				audioUtils.input.dispose();
			}
		};
	}, [audioUtils]);

	const {delayRender, continueRender} = useDelayRender();

	const fetchMetadata = useCallback(
		async (signal: AbortSignal) => {
			const handle = delayRender(
				`Waiting for audio metadata with src="${src}" to be loaded`,
			);
			const cont = () => {
				continueRender(handle);
			};

			signal.addEventListener('abort', cont, {once: true});

			const input = new Input({
				formats: ALL_FORMATS,
				source: new UrlSource(src),
			});

			const onAbort = () => {
				input.dispose();
			};

			signal.addEventListener('abort', onAbort, {once: true});

			try {
				const durationInSeconds = await input.computeDuration();

				const audioTrack = await input.getPrimaryAudioTrack();

				if (!audioTrack) {
					throw new Error('No audio track found');
				}

				const canDecode = await audioTrack.canDecode();

				if (!canDecode) {
					throw new Error('Audio track cannot be decoded');
				}

				if (channelIndex >= audioTrack.numberOfChannels || channelIndex < 0) {
					throw new Error(
						`Invalid channel index ${channelIndex} for audio with ${audioTrack.numberOfChannels} channels`,
					);
				}

				const {numberOfChannels, sampleRate} = audioTrack;

				const format = await input.getFormat();

				const isMatroska = format === MATROSKA || format === WEBM;

				if (isMounted.current) {
					setAudioUtils({
						input,
						track: audioTrack,
						metadata: {
							durationInSeconds,
							numberOfChannels,
							sampleRate,
						},
						isMatroska,
					});
				}

				continueRender(handle);
			} catch (err) {
				cancelRender(err);
			} finally {
				signal.removeEventListener('abort', cont);
				signal.removeEventListener('abort', onAbort);
			}
		},
		[src, delayRender, continueRender, channelIndex],
	);

	useLayoutEffect(() => {
		const controller = new AbortController();
		fetchMetadata(controller.signal);

		return () => {
			controller.abort();
		};
	}, [fetchMetadata]);

	const currentTime = frame / fps;
	const currentWindowIndex = Math.floor(currentTime / windowInSeconds);

	const windowsToFetch = useMemo(() => {
		if (!audioUtils?.metadata) {
			return [];
		}

		const maxWindowIndex = Math.floor(
			// If an audio is exactly divisible by windowInSeconds, we need to
			// subtract 0.000000000001 to avoid fetching an extra window.
			audioUtils.metadata.durationInSeconds / windowInSeconds - 0.000000000001,
		);

		// needs to be in order because we rely on the concatenation below
		return [
			currentWindowIndex === 0 ? null : currentWindowIndex - 1,
			currentWindowIndex,
			currentWindowIndex + 1 > maxWindowIndex ? null : currentWindowIndex + 1,
		]
			.filter((i) => i !== null)
			.filter((i) => i >= 0);
	}, [currentWindowIndex, audioUtils, windowInSeconds]);

	const fetchAndSetWaveformData = useCallback(
		async (windowIndex: number) => {
			if (!audioUtils?.metadata || !audioUtils) {
				throw new Error('MediaBunny context is not loaded yet');
			}

			// Cancel any existing request for this window, we don't want to over-fetch
			const existingController = requests.current[windowIndex];
			if (existingController) {
				existingController.abort();
			}

			const controller = new AbortController();
			requests.current[windowIndex] = controller;

			if (controller.signal.aborted) {
				return;
			}

			const fromSeconds = windowIndex * windowInSeconds;
			const toSeconds = (windowIndex + 1) * windowInSeconds;

			// if both fromSeconds and toSeconds are outside of the audio duration, skip fetching
			if (
				fromSeconds >= audioUtils.metadata.durationInSeconds ||
				toSeconds <= 0
			) {
				return;
			}

			try {
				const {isMatroska} = audioUtils;

				if (isMatroska && !warnedMatroska[src]) {
					warnedMatroska[src] = true;
					Internals.Log.warn(
						{logLevel: 'info', tag: '@remotion/media-utils'},
						`[useWindowedAudioData] Matroska/WebM file detected at "${src}".\n\nDue to format limitation, audio decoding must start from the beginning of the file, which may lead to increased memory usage and slower performance for large files. Consider converting the audio to a more suitable format like MP3 or AAC for better performance.`,
					);
				}

				const partialWaveData = await getPartialAudioData({
					track: audioUtils.track,
					fromSeconds,
					toSeconds,
					channelIndex,
					signal: controller.signal,
					isMatroska,
				});

				if (!controller.signal.aborted) {
					setWaveformMap((prev) => {
						const entries = Object.keys(prev);
						const windowsToClear = entries.filter(
							(entry) => !windowsToFetch.includes(Number(entry)),
						);
						return {
							...prev,

							...windowsToClear.reduce(
								(acc, key) => {
									acc[key] = null;
									return acc;
								},
								{} as Record<string, null>,
							),

							[windowIndex]: partialWaveData,
						};
					});
				}
			} catch (err) {
				if (controller.signal.aborted) {
					return;
				}

				if (err instanceof InputDisposedError) {
					return;
				}

				throw err;
			} finally {
				if (requests.current[windowIndex] === controller) {
					requests.current[windowIndex] = null;
				}
			}
		},
		[channelIndex, audioUtils, windowInSeconds, windowsToFetch, src],
	);

	useEffect(() => {
		if (!audioUtils?.metadata) {
			return;
		}

		const windowsToClear = Object.keys(requests.current).filter(
			(entry) => !windowsToFetch.includes(Number(entry)),
		);

		for (const windowIndex of windowsToClear) {
			const controller = requests.current[windowIndex];
			if (controller) {
				controller.abort();
				requests.current[windowIndex] = null;
			}
		}

		// Only fetch windows that don't already exist
		const windowsToActuallyFetch = windowsToFetch.filter(
			(windowIndex) =>
				!waveFormMap[windowIndex] && !requests.current[windowIndex],
		);

		if (windowsToActuallyFetch.length === 0) {
			return;
		}

		// Prioritize the current window where playback is at.
		// On slow connections, this ensures the most important window loads first.
		const currentWindowNeedsFetch = windowsToActuallyFetch.includes(
			currentWindowIndex,
		);
		const otherWindowsToFetch = windowsToActuallyFetch.filter(
			(w) => w !== currentWindowIndex,
		);

		const fetchWindows = async () => {
			// First, load the current window where playback is at
			if (currentWindowNeedsFetch) {
				await fetchAndSetWaveformData(currentWindowIndex);
			}

			// Then load the surrounding windows in parallel
			if (otherWindowsToFetch.length > 0) {
				await Promise.all(
					otherWindowsToFetch.map((windowIndex) => {
						return fetchAndSetWaveformData(windowIndex);
					}),
				);
			}
		};

		fetchWindows().catch((err) => {
			if ((err as Error).stack?.includes('Cancelled')) {
				return;
			}

			if ((err as Error).stack?.toLowerCase()?.includes('aborted')) {
				return;
			}

			// firefox
			if ((err as Error).message?.toLowerCase()?.includes('aborted')) {
				return;
			}

			cancelRender(err);
		});
	}, [
		fetchAndSetWaveformData,
		audioUtils,
		windowsToFetch,
		waveFormMap,
		currentWindowIndex,
	]);

	// Calculate available windows for reuse
	const availableWindows = useMemo(() => {
		return windowsToFetch.filter((i) => waveFormMap[i]);
	}, [windowsToFetch, waveFormMap]);

	const currentAudioData = useMemo((): MediaUtilsAudioData | null => {
		if (!audioUtils?.metadata) {
			return null;
		}

		if (availableWindows.length === 0) {
			return null;
		}

		const windows = availableWindows.map((i) => waveFormMap[i]);
		const data = combineFloat32Arrays(windows);
		return {
			channelWaveforms: [data],
			durationInSeconds: audioUtils.metadata.durationInSeconds,
			isRemote: isRemoteAsset(src),
			numberOfChannels: 1,
			resultId: `${src}-windows-${availableWindows.join(',')}`,
			sampleRate: audioUtils.metadata.sampleRate,
		};
	}, [src, waveFormMap, audioUtils, availableWindows]);

	const isBeyondAudioDuration = audioUtils
		? currentTime >= audioUtils.metadata.durationInSeconds
		: false;

	useLayoutEffect(() => {
		if (currentAudioData) {
			return;
		}

		if (isBeyondAudioDuration) {
			return;
		}

		const handle = delayRender(
			`Waiting for audio data with src="${src}" to be loaded`,
		);
		return () => {
			continueRender(handle);
		};
	}, [
		currentAudioData,
		src,
		delayRender,
		continueRender,
		isBeyondAudioDuration,
	]);

	const audioData = isBeyondAudioDuration ? null : currentAudioData;

	return {
		audioData,
		dataOffsetInSeconds:
			availableWindows.length > 0 ? availableWindows[0] * windowInSeconds : 0,
	};
};
