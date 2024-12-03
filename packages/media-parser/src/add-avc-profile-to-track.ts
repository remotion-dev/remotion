import {combineUint8Arrays, serializeUint16} from './boxes/webm/make-header';
import type {VideoTrack} from './get-tracks';
import type {SpsAndPps} from './state/parser-state';

export const addAvcProfileToTrack = (
	track: VideoTrack,
	avc1Profile: SpsAndPps | null,
): VideoTrack => {
	if (avc1Profile === null) {
		return track;
	}

	return {
		...track,
		codec: `avc1.${avc1Profile.sps.profile.toString(16).padStart(2, '0')}${avc1Profile.sps.compatibility.toString(16).padStart(2, '0')}${avc1Profile.sps.level.toString(16).padStart(2, '0')}`,
		codecPrivate: combineUint8Arrays([
			new Uint8Array([
				// https://gist.github.com/uupaa/8493378ec15f644a3d2b
				1,
				avc1Profile.sps.level,
				avc1Profile.sps.compatibility,
				avc1Profile.sps.profile,
				0xff,
				0xe1,
			]),
			// sequence parameter set length
			serializeUint16(avc1Profile.sps.sps.length),
			// sequence parameter set
			avc1Profile.sps.sps,
			// num of PPS
			new Uint8Array([0x01]),
			// picture parameter set length
			serializeUint16(avc1Profile.pps.pps.length),
			// PPS
			avc1Profile.pps.pps,
		]),
	};
};
