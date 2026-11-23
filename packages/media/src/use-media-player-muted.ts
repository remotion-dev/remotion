import {Internals} from 'remotion';

// Volume is not part of this: a volume of 0 is a gain of 0, and the audio keeps
// decoding so that a fade-in from 0 does not have to wait for a new iterator.
export const useMediaPlayerMuted = ({muted}: {readonly muted: boolean}) => {
	const [playerMuted] = Internals.usePlayerMutedState();
	const audioEnabled = Internals.useAudioEnabled();
	const isInsideNonPremountFreeze = Internals.useIsInsideNonPremountFreeze();

	return (
		audioEnabled === false || muted || playerMuted || isInsideNonPremountFreeze
	);
};
