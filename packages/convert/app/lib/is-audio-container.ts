import type {
	MediaParserContainer,
	MediaParserTracks,
} from '@remotion/media-parser';

export const isAudioOnly = ({
	tracks,
	container,
}: {
	tracks: MediaParserTracks | null;
	container: MediaParserContainer | null;
}) => {
	if (container === 'mp3') {
		return true;
	}

	return (tracks && tracks.videoTracks.length === 0) ?? false;
};
