import type {SpsAndPps} from '../../state/parser-state';
import type {AvcInfo} from './parse-avc';

export const getSpsAndPps = (infos: AvcInfo[]): SpsAndPps => {
	const avcProfile = infos.find((i) => i.type === 'avc-profile');
	const ppsProfile = infos.find((i) => i.type === 'avc-pps');

	if (!avcProfile || !ppsProfile) {
		throw new Error('Expected avcProfile and ppsProfile');
	}

	return {pps: ppsProfile, sps: avcProfile};
};
