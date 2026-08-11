import {createContext, useContext, useMemo} from 'react';

const MediaEnabledContext = createContext<{
	videoEnabled: boolean | null;
	audioEnabled: boolean | null;
} | null>(null);

export const useVideoEnabled = () => {
	const context = useContext(MediaEnabledContext);
	if (!context) {
		return window.remotion_videoEnabled;
	}

	if (context.videoEnabled === null) {
		return window.remotion_videoEnabled;
	}

	return context.videoEnabled;
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
