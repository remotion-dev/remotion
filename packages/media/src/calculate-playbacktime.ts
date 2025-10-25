export const calculatePlaybackTime = ({
	audioSyncAnchor,
	currentTime,
	playbackRate,
}: {
	audioSyncAnchor: number;
	currentTime: number;
	playbackRate: number;
}) => {
	const timeSinceAnchor = currentTime - audioSyncAnchor;
	return timeSinceAnchor * playbackRate;
};
