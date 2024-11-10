import {Encoder, QualityControl} from './types';

export const getQualityControlModesForEncoder = (
	encoder: Encoder,
): QualityControl[] => {
	if (encoder === 'libx264') {
		const crfsToTest = new Array(52).fill(true).map((_, i) => i);
		return crfsToTest.map((crf) => {
			return {
				type: 'crf',
				crf,
			};
		});
	}
	if (encoder === 'h264_videotoolbox') {
		const valuesToTest = [
			500_000 + '',
			1_000_000 + '',
			2_000_000 + '',
			3_000_000 + '',
			4_000_000 + '',
			5_000_000 + '',
			6_000_000 + '',
			7_000_000 + '',
			8_000_000 + '',
		];
		return valuesToTest.map((value) => {
			return {
				type: 'bitrate',
				value,
			};
		});
	}
	return [];
};
