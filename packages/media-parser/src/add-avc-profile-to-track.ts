import type {AvcProfileInfo} from './boxes/avc/parse-avc';
import type {VideoTrack} from './get-tracks';

export const addAvcProfileToTrack = (
	track: VideoTrack,
	avc1Profile: AvcProfileInfo | null,
): VideoTrack => {
	if (avc1Profile === null) {
		return track;
	}

	return {
		...track,
		codec: `avc1.${avc1Profile.profile.toString(16)}${avc1Profile.compatibility.toString(16).padStart(2, '0')}${avc1Profile.level.toString(16)}`,
	};
};
