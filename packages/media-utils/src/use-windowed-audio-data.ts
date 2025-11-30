import type {InputAudioTrack} from 'mediabunny';
import {ALL_FORMATS, Input, InputDisposedError, UrlSource} from 'mediabunny';
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {cancelRender, useDelayRender} from 'remotion';
import {combineFloat32Arrays} from './combine-float32-arrays';
import {getPartialAudioData} from './get-partial-audio-data';
import {isRemoteAsset} from './is-remote-asset';
import type {MediaUtilsAudioData} from './types';

type WaveformMap = Record<number, Float32Array>;

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

			// abort all pending requests
			Object.values(requests.current).forEach((controller) => {
				if (controller) {
					controller.abort();
				}
			});
			requests.current = {};

			// clear all Float32Array references
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

				if (isMounted.current) {
					setAudioUtils({
						input,
						track: audioTrack,
						metadata: {
							durationInSeconds,
							numberOfChannels,
							sampleRate,
						},
					});
				}

				continueRender(handle);
			} catch (err) {
				input.dispose();
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
	}, [currentWindowIndex, audioUtils?.metadata, windowInSeconds]);

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

			// Add a small delay to allow for rapid seeking to settle
			// this also creates a short window for the signal to be aborted in case of super-rapid seeking
			// await sleep(250);

			// Check if we were aborted during the delay
			if (controller.signal.aborted) {
				return;
			}

			const fromSeconds = windowIndex * windowInSeconds;
			const toSeconds = (windowIndex + 1) * windowInSeconds;

			try {
				const partialWaveData = await getPartialAudioData({
					track: audioUtils.track,
					fromSeconds,
					toSeconds,
					channelIndex,
					signal: controller.signal,
				});

				// Only update if we still have a valid controller (not aborted)
				if (!controller.signal.aborted) {
					setWaveformMap((prev) => {
						const entries = Object.keys(prev);
						const windowsToClear = entries.filter(
							(entry) => !windowsToFetch.includes(Number(entry)),
						);
						return {
							...prev,
							// Delete windows that are not needed anymore
							...windowsToClear.reduce(
								(acc, key) => {
									acc[key] = null;
									return acc;
								},
								{} as Record<string, null>,
							),
							// Add the new window
							[windowIndex]: partialWaveData,
						};
					});
				}
			} catch (err) {
				// If the request was aborted, don't throw
				if (controller.signal.aborted) {
					return;
				}

				// if it's mediabunny disposed error, don't throw
				if (err instanceof InputDisposedError) {
					return;
				}

				throw err;
			} finally {
				// Clean up the request reference
				if (requests.current[windowIndex] === controller) {
					requests.current[windowIndex] = null;
				}
			}
		},
		[channelIndex, audioUtils, windowInSeconds, windowsToFetch],
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
			(windowIndex) => !waveFormMap[windowIndex],
		);

		if (windowsToActuallyFetch.length === 0) {
			return;
		}

		Promise.all(
			windowsToActuallyFetch.map((windowIndex) => {
				return fetchAndSetWaveformData(windowIndex);
			}),
		).catch((err) => {
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
	}, [fetchAndSetWaveformData, audioUtils, windowsToFetch, waveFormMap]);

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
			resultId: String(Math.random()),
			sampleRate: audioUtils.metadata.sampleRate,
		};
	}, [src, waveFormMap, audioUtils?.metadata, availableWindows]);

	useLayoutEffect(() => {
		if (currentAudioData) {
			return;
		}

		const handle = delayRender(
			`Waiting for audio data with src="${src}" to be loaded`,
		);
		return () => {
			continueRender(handle);
		};
	}, [currentAudioData, src, delayRender, continueRender]);

	return {
		audioData: currentAudioData,
		dataOffsetInSeconds:
			availableWindows.length > 0 ? availableWindows[0] * windowInSeconds : 0,
	};
};
