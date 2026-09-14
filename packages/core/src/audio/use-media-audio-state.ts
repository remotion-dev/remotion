import {useIsInsideFreeze} from '../timeline-position-state.js';
import {usePlayerMutedState} from '../volume-position-state.js';

export type MediaAudioState = {
	readonly isMutedForTimeline: boolean;
	readonly isMutedForPlayback: boolean;
	readonly shouldUseAudio: boolean;
};

export const resolveMediaAudioState = ({
	muted,
	playerMuted,
	volume,
	isInsideFreeze,
	audioEnabled,
}: {
	readonly muted: boolean;
	readonly playerMuted: boolean;
	readonly volume: number | null;
	readonly isInsideFreeze: boolean;
	readonly audioEnabled: boolean;
}): MediaAudioState => {
	const isMutedForTimeline = muted || isInsideFreeze;
	const isMutedForPlayback =
		isMutedForTimeline || playerMuted || (volume !== null && volume <= 0);

	return {
		isMutedForTimeline,
		isMutedForPlayback,
		shouldUseAudio: audioEnabled && !isMutedForPlayback,
	};
};

export const useMediaAudioState = ({
	muted,
	volume,
	audioEnabled,
}: {
	readonly muted: boolean;
	readonly volume: number | null;
	readonly audioEnabled: boolean;
}): MediaAudioState => {
	const [playerMuted] = usePlayerMutedState();
	const isInsideFreeze = useIsInsideFreeze();

	return resolveMediaAudioState({
		muted,
		playerMuted,
		volume,
		isInsideFreeze,
		audioEnabled,
	});
};
