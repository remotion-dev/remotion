import type {MoovBox} from '../../containers/iso-base-media/moov/moov';

export const moovState = () => {
	let moovBox: MoovBox | null = null;
	return {
		setMoovBox: (moov: MoovBox) => {
			moovBox = moov;
		},
		getMoovBox: () => moovBox,
	};
};
