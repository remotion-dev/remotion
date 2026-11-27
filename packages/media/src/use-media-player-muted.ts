import {Internals} from 'remotion';

export const useMediaPlayerMuted = (muted: boolean) => {
	const [playerMuted] = Internals.usePlayerMutedState();
	const audioEnabled = Internals.useAudioEnabled();
	const isInsideNonPremountFreeze = Internals.useIsInsideNonPremountFreeze();

	return (
		audioEnabled === false || muted || playerMuted || isInsideNonPremountFreeze
	);
};
