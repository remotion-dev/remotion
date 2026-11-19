import {
	createContext,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
} from 'react';

export const MediaEnabledContext = createContext<{
	videoEnabled: boolean | null;
	audioEnabled: boolean | null;
} | null>(null);

export const useVideoEnabled = (): boolean => {
	const context = useContext(MediaEnabledContext);
	if (context && context.videoEnabled !== null) {
		return context.videoEnabled;
	}

	// Only the renderer sets the global; the Player and tests leave it undefined.
	return typeof window === 'undefined'
		? true
		: window.remotion_videoEnabled !== false;
};

const useIsomorphicLayoutEffect =
	typeof window === 'undefined' ? useEffect : useLayoutEffect;

// A sequence can first mount during an audio-only sample. Defer its initial
// visual load, then retain the resource across later audio-only samples.
export const useVisualLoadEnabled = (): boolean => {
	const videoEnabled = useVideoEnabled();
	const hasVideoSample = useRef(false);
	useIsomorphicLayoutEffect(() => {
		if (videoEnabled) hasVideoSample.current = true;
	}, [videoEnabled]);
	return videoEnabled || hasVideoSample.current;
};

export const useAudioEnabled = () => {
	const context = useContext(MediaEnabledContext);
	if (!context) {
		return typeof window === 'undefined' ? true : window.remotion_audioEnabled;
	}

	if (context.audioEnabled === null) {
		return typeof window === 'undefined' ? true : window.remotion_audioEnabled;
	}

	return context.audioEnabled;
};

export const MediaEnabledProvider = ({
	children,
	videoEnabled,
	audioEnabled,
}: {
	readonly children: React.ReactNode;
	readonly videoEnabled: boolean | null;
	readonly audioEnabled: boolean | null;
}) => {
	const value = useMemo(
		() => ({videoEnabled, audioEnabled}),
		[videoEnabled, audioEnabled],
	);

	return (
		<MediaEnabledContext.Provider value={value}>
			{children}
		</MediaEnabledContext.Provider>
	);
};
