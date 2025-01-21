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
import {getPartialWaveData} from './get-partial-wave-data';
import {isRemoteAsset} from './is-remote-asset';
import type {WaveProbe} from './probe-wave-file';
import {probeWaveFile} from './probe-wave-file';
import type {AudioData} from './types';

type WaveformMap = Record<number, Float32Array>;

export type UseWindowedAudioDataOptions = {
	src: string;
	frame: number;
	fps: number;
	windowInSeconds: number;
	channelIndex?: number;
};

export type UseWindowedAudioDataReturnValue = {
	audioData: AudioData | null;
	dataOffsetInSeconds: number;
};

export const useWindowedAudioData = ({
	src,
	frame,
	fps,
	windowInSeconds,
	channelIndex = 0,
}: UseWindowedAudioDataOptions): UseWindowedAudioDataReturnValue => {
	const isMounted = useRef(true);
	const [waveProbe, setWaveProbe] = useState<WaveProbe | null>(null);
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
				const data = await probeWaveFile(src);
				if (isMounted.current) {
					setWaveProbe(data);
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
		if (!waveProbe) {
			return [];
		}

		const maxWindowIndex = Math.floor(
			waveProbe.durationInSeconds / windowInSeconds,
		);

		// needs to be in order because we rely on the concatenation below
		return [
			currentWindowIndex === 0 ? null : currentWindowIndex - 1,
			currentWindowIndex,
			currentWindowIndex + 1 > maxWindowIndex ? null : currentWindowIndex + 1,
		]
			.filter((i) => i !== null)
			.filter((i) => i >= 0);
	}, [currentWindowIndex, waveProbe, windowInSeconds]);

	const fetchAndSetWaveformData = useCallback(
		async (windowIndex: number) => {
			if (!waveProbe) {
				throw new Error('Wave probe is not loaded yet');
			}

			const controller = new AbortController();
			requests.current[windowIndex] = controller;
			const partialWaveData = await getPartialWaveData({
				bitsPerSample: waveProbe.bitsPerSample,
				blockAlign: waveProbe.blockAlign,
				channelIndex,
				dataOffset: waveProbe.dataOffset,
				fileSize: waveProbe.fileSize,
				fromSeconds: windowIndex * windowInSeconds,
				sampleRate: waveProbe.sampleRate,
				src,
				toSeconds: (windowIndex + 1) * windowInSeconds,
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
		[channelIndex, src, waveProbe, windowInSeconds, windowsToFetch],
	);

	useEffect(() => {
		if (!waveProbe) {
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

		Promise.all(
			windowsToFetch.map((windowIndex) => {
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
	}, [fetchAndSetWaveformData, waveProbe, windowsToFetch]);

	const currentAudioData = useMemo((): AudioData | null => {
		if (!waveProbe) {
			return null;
		}

		if (windowsToFetch.some((i) => !waveFormMap[i])) {
			return null;
		}

		const windows = windowsToFetch.map((i) => waveFormMap[i]);
		const data = combineFloat32Arrays(windows);
		return {
			channelWaveforms: [data],
			durationInSeconds: waveProbe.durationInSeconds,
			isRemote: isRemoteAsset(src),
			numberOfChannels: 1,
			resultId: String(Math.random()),
			sampleRate: waveProbe.sampleRate,
		};
	}, [src, waveFormMap, waveProbe, windowsToFetch]);

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
		dataOffsetInSeconds: windowsToFetch[0] * windowInSeconds,
	};
};
