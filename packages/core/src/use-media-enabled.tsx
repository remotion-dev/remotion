import {createContext, useContext, useMemo} from 'react';

export const MediaEnabledContext = createContext<{
	videoEnabled: boolean | null;
	audioEnabled: boolean | null;
	artifactsEnabled: boolean;
} | null>(null);

export const useVideoEnabled = () => {
	const context = useContext(MediaEnabledContext);
	if (context && context.videoEnabled !== null) {
		return context.videoEnabled;
	}

	return typeof window === 'undefined'
		? true
		: (window.remotion_videoEnabled ?? true);
};

export const useAudioEnabled = () => {
	const context = useContext(MediaEnabledContext);
	if (!context) {
		return window.remotion_audioEnabled;
	}

	if (context.audioEnabled === null) {
		return window.remotion_audioEnabled;
	}

	return context.audioEnabled;
};

export const MediaEnabledProvider = ({
	children,
	videoEnabled,
	audioEnabled,
	artifactsEnabled,
}: {
	readonly children: React.ReactNode;
	readonly videoEnabled: boolean | null;
	readonly audioEnabled: boolean | null;
	readonly artifactsEnabled: boolean;
}) => {
	const value = useMemo(
		() => ({videoEnabled, audioEnabled, artifactsEnabled}),
		[videoEnabled, audioEnabled, artifactsEnabled],
	);

	return (
		<MediaEnabledContext.Provider value={value}>
			{children}
		</MediaEnabledContext.Provider>
	);
};
