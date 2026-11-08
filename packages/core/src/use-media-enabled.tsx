import {createContext, useContext, useMemo} from 'react';

const MediaEnabledContext = createContext<{
	videoEnabled: boolean | null;
	audioEnabled: boolean | null;
} | null>(null);

export const useVideoEnabled = () => {
	const context = useContext(MediaEnabledContext);
	if (context && context.videoEnabled !== null) {
		return context.videoEnabled;
	}

	return typeof window === 'undefined' ? true : window.remotion_videoEnabled;
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
