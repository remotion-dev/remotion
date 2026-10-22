import {Internals} from 'remotion';

export const useMediaPlayerMuted = ({
	muted,
	volume,
}: {
	readonly muted: boolean;
	readonly volume: number;
}) => {
	const [playerMuted] = Internals.usePlayerMutedState();
	const isInsideNonPremountFreeze = Internals.useIsInsideNonPremountFreeze();

	// Premounted audio can be scheduled for its future sequence start. Only an
	// explicit mute, zero volume, or an ordinary Freeze should silence its gain.
	return muted || playerMuted || volume <= 0 || isInsideNonPremountFreeze;
};
