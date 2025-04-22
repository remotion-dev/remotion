import type {MoovBox} from '../../containers/iso-base-media/moov/moov';

type MoovBoxAndPrecomputed = {
	moovBox: MoovBox;
	precomputed: boolean;
};

export const moovState = () => {
	let moovBox: MoovBoxAndPrecomputed | null = null;

	return {
		setMoovBox: (moov: MoovBoxAndPrecomputed) => {
			moovBox = moov;
		},
		getMoovBoxAndPrecomputed: () => moovBox,
	};
};
