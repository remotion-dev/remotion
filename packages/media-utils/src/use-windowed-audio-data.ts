import {parseMedia} from '@remotion/media-parser';
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {cancelRender, continueRender, delayRender} from 'remotion';
import {combineFloat32Arrays} from './combine-float32-arrays';
import {getPartialMediaData} from './get-partial-media-data';
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

export const useWindowedAudioData = ({
	src,
	frame,
	fps,
	windowInSeconds,
	channelIndex = 0,
}: UseWindowedAudioDataOptions): UseWindowedAudioDataReturnValue => {
	const isMounted = useRef(true);
	const [metadata, setMetadata] = useState<AudioMetadata | null>(null);
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
		};
	}, []);

	const fetchMetadata = useCallback(
		async (signal: AbortSignal) => {
			const handle = delayRender(
				`Waiting for audio metadata with src="${src}" to be loaded`,
			);
			const cont = () => {
				continueRender(handle);
			};

			signal.addEventListener('abort', cont, {once: true});

			try {
				const {durationInSeconds, numberOfAudioChannels, sampleRate} =
					await parseMedia({
						src,
						fields: {
							durationInSeconds: true,
							numberOfAudioChannels: true,
							sampleRate: true,
						},
					});

				if (!durationInSeconds) {
					throw new Error('Duration in seconds is null');
				}

				if (!numberOfAudioChannels) {
					throw new Error('Number of audio channels is null');
				}

				if (!sampleRate) {
					throw new Error('Sample rate is null');
				}

				if (isMounted.current) {
					setMetadata({
						durationInSeconds,
						numberOfChannels: numberOfAudioChannels,
						sampleRate,
					});
				}

				continueRender(handle);
			} catch (err) {
				cancelRender(err);
			} finally {
				signal.removeEventListener('abort', cont);
			}
		},
		[src],
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
		if (!metadata) {
			return [];
		}

		const maxWindowIndex = Math.floor(
			// If an audio is exactly divisible by windowInSeconds, we need to
			// subtract 0.000000000001 to avoid fetching an extra window.
			metadata.durationInSeconds / windowInSeconds - 0.000000000001,
		);

		// needs to be in order because we rely on the concatenation below
		return [
			currentWindowIndex === 0 ? null : currentWindowIndex - 1,
			currentWindowIndex,
			currentWindowIndex + 1 > maxWindowIndex ? null : currentWindowIndex + 1,
		]
			.filter((i) => i !== null)
			.filter((i) => i >= 0);
	}, [currentWindowIndex, metadata, windowInSeconds]);

	const fetchAndSetWaveformData = useCallback(
		async (windowIndex: number) => {
			if (!metadata) {
				throw new Error('Media probe is not loaded yet');
			}

			const controller = new AbortController();
			requests.current[windowIndex] = controller;
			const partialWaveData = await getPartialMediaData({
				src,
				fromSeconds: windowIndex * windowInSeconds,
				toSeconds: (windowIndex + 1) * windowInSeconds,
				channelIndex,
				signal: controller.signal,
			});
			requests.current[windowIndex] = null;

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
		},
		[channelIndex, src, metadata, windowInSeconds, windowsToFetch],
	);

	useEffect(() => {
		if (!metadata) {
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
	}, [fetchAndSetWaveformData, metadata, windowsToFetch, waveFormMap]);

	// Calculate available windows for reuse
	const availableWindows = useMemo(() => {
		return windowsToFetch.filter((i) => waveFormMap[i]);
	}, [windowsToFetch, waveFormMap]);

	const currentAudioData = useMemo((): MediaUtilsAudioData | null => {
		if (!metadata) {
			return null;
		}

		if (availableWindows.length === 0) {
			return null;
		}

		const windows = availableWindows.map((i) => waveFormMap[i]);
		const data = combineFloat32Arrays(windows);
		return {
			channelWaveforms: [data],
			durationInSeconds: metadata.durationInSeconds,
			isRemote: isRemoteAsset(src),
			numberOfChannels: 1,
			resultId: String(Math.random()),
			sampleRate: metadata.sampleRate,
		};
	}, [src, waveFormMap, metadata, availableWindows]);

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
	}, [currentAudioData, src]);

	return {
		audioData: currentAudioData,
		dataOffsetInSeconds:
			availableWindows.length > 0 ? availableWindows[0] * windowInSeconds : 0,
	};
};
