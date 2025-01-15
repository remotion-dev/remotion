import type {ParseMediaContainer, TracksField} from '@remotion/media-parser';

export const isAudioOnly = ({
	tracks,
	container,
}: {
	tracks: TracksField | null;
	container: ParseMediaContainer | null;
}) => {
	if (container === 'mp3') {
		return true;
	}

	return (tracks && tracks.videoTracks.length === 0) ?? false;
};
