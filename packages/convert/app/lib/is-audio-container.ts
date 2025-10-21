import {type InputTrack} from 'mediabunny';

export const isAudioOnly = ({tracks}: {tracks: InputTrack[] | null}) => {
	return (
		(tracks && tracks.filter((t) => t.isVideoTrack()).length === 0) ?? false
	);
};
