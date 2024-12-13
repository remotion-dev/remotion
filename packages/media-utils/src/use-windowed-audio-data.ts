import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {cancelRender, continueRender, delayRender} from 'remotion';
import {getPartialWaveData} from './get-partial-wave-data';
import {isRemoteAsset} from './is-remote-asset';
import type {WaveProbe} from './probe-wave-file';
import {probeWaveFile} from './probe-wave-file';
import type {AudioData} from './types';

type WaveformMap = Record<number, AudioData>;

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

	const fetchMetadata = useCallback(async () => {
		const handle = delayRender(
			`Waiting for audio metadata with src="${src}" to be loaded`,
		);

		try {
			const data = await probeWaveFile(src);
			if (isMounted.current) {
				setWaveProbe(data);
			}

			continueRender(handle);
		} catch (err) {
			cancelRender(err);
		}
	}, [src]);

	useLayoutEffect(() => {
		fetchMetadata();
	}, [fetchMetadata]);

	const currentTime = frame / fps;
	const currentWindowIndex = Math.floor(currentTime / windowInSeconds);

	const windowsToFetch = useMemo(() => {
		return [
			currentWindowIndex,
			currentWindowIndex - 1,
			currentWindowIndex + 1,
		].filter((i) => i >= 0);
	}, [currentWindowIndex]);

	const fetchAndSetWaveformData = useCallback(
		async (windowIndex: number) => {
			if (!waveProbe) {
				throw new Error('Wave probe is not loaded yet');
			}

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
			});

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
					[windowIndex]: {
						channelWaveforms: [partialWaveData],
						durationInSeconds: waveProbe.durationInSeconds,
						isRemote: isRemoteAsset(src),
						numberOfChannels: 1,
						resultId: String(Math.random()),
						sampleRate: waveProbe.sampleRate,
					},
				};
			});
		},
		[channelIndex, src, waveProbe, windowInSeconds, windowsToFetch],
	);

	useEffect(() => {
		if (!waveProbe) {
			return;
		}

		Promise.all(
			windowsToFetch.map((windowIndex) => {
				return fetchAndSetWaveformData(windowIndex);
			}),
		).catch((err) => {
			cancelRender(err);
		});
	}, [fetchAndSetWaveformData, waveProbe, windowsToFetch]);

	const currentAudioData = useMemo(() => {
		return waveFormMap[currentWindowIndex] ?? null;
	}, [currentWindowIndex, waveFormMap]);

	return {
		audioData: currentAudioData,
		dataOffsetInSeconds: currentWindowIndex * windowInSeconds,
	};
};
