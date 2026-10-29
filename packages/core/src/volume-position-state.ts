import {createContext, useCallback, useContext, useMemo, useRef} from 'react';
import {flushSync} from 'react-dom';
import {
	SharedAudioContext,
	SharedAudioTagsContext,
} from './audio/shared-audio-tags.js';
import {SetTimelineContext} from './TimelineContext.js';

export type MediaVolumeContextValue = {
	playerMuted: boolean;
	mediaVolume: number;
};

export type SetMediaVolumeContextValue = {
	setPlayerMuted: (u: React.SetStateAction<boolean>) => void;
	setMediaVolume: (u: number) => void;
};

export const MediaVolumeContext = createContext<MediaVolumeContextValue>({
	playerMuted: false,
	mediaVolume: 1,
});

export const SetMediaVolumeContext = createContext<SetMediaVolumeContextValue>({
	setPlayerMuted: () => {
		throw new Error('default');
	},
	setMediaVolume: () => {
		throw new Error('default');
	},
});

type MediaVolumeReturnType = readonly [number, (u: number) => void];

const useResumeAudioOnUnmute = () => {
	const volume = useContext(MediaVolumeContext);
	const audioContext = useContext(SharedAudioContext);
	const audioTags = useContext(SharedAudioTagsContext);
	const {isPlaying} = useContext(SetTimelineContext);
	const current = useRef({volume, audioContext, audioTags});
	current.current = {volume, audioContext, audioTags};

	return useCallback(
		(update: () => void) => {
			const before = current.current.volume;
			if (!isPlaying() || (!before.playerMuted && before.mediaVolume > 0)) {
				update();
				return;
			}

			// A Player that starts muted creates its AudioContext on unmute.
			// Commit that update before resuming, while still in the user gesture.
			flushSync(update);
			const after = current.current;
			if (after.volume.playerMuted || after.volume.mediaVolume === 0) {
				return;
			}

			after.audioContext?.resume();
			after.audioTags?.playAllAudios();
		},
		[isPlaying],
	);
};

export const useMediaVolumeState = (): MediaVolumeReturnType => {
	const {mediaVolume} = useContext(MediaVolumeContext);
	const {setMediaVolume} = useContext(SetMediaVolumeContext);
	const updateAndResume = useResumeAudioOnUnmute();
	const setVolume = useCallback(
		(volume: number) => updateAndResume(() => setMediaVolume(volume)),
		[setMediaVolume, updateAndResume],
	);
	return useMemo(() => {
		return [mediaVolume, setVolume];
	}, [mediaVolume, setVolume]);
};

type PlayerMutedReturnType = readonly [
	boolean,
	(u: React.SetStateAction<boolean>) => void,
];

export const usePlayerMutedState = (): PlayerMutedReturnType => {
	const {playerMuted} = useContext(MediaVolumeContext);
	const {setPlayerMuted} = useContext(SetMediaVolumeContext);
	const updateAndResume = useResumeAudioOnUnmute();
	const setMuted = useCallback(
		(muted: React.SetStateAction<boolean>) =>
			updateAndResume(() => setPlayerMuted(muted)),
		[setPlayerMuted, updateAndResume],
	);

	return useMemo(() => {
		return [playerMuted, setMuted];
	}, [playerMuted, setMuted]);
};
