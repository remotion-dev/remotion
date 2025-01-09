import type {SpsAndPps} from '../../state/parser-state';
import {combineUint8Arrays, serializeUint16} from '../webm/make-header';

export const createSpsPpsData = (avc1Profile: SpsAndPps) => {
	return combineUint8Arrays([
		new Uint8Array([
			// https://gist.github.com/uupaa/8493378ec15f644a3d2b
			1, // version
			avc1Profile.sps.spsData.profile,
			avc1Profile.sps.spsData.compatibility,
			avc1Profile.sps.spsData.level,
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
	]);
};
