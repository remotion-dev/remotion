import {Internals} from 'remotion';

export const useMediaPlayerMuted = ({
	muted,
	volume,
}: {
	readonly muted: boolean;
	readonly volume: number;
}) => {
	const [playerMuted] = Internals.usePlayerMutedState();
	const audioEnabled = Internals.useAudioEnabled();
	const isInsideNonPremountFreeze = Internals.useIsInsideNonPremountFreeze();

	return (
		audioEnabled === false ||
		muted ||
		playerMuted ||
		volume <= 0 ||
		isInsideNonPremountFreeze
	);
};
