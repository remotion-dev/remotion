import type {MediaParserAdvancedColor} from '../../get-tracks';

export const mediaParserAdvancedColorToWebCodecsColor = (
	color: MediaParserAdvancedColor,
): VideoColorSpaceInit => {
	return {
		transfer: color.transfer as VideoTransferCharacteristics,
		matrix: color.matrix as VideoMatrixCoefficients,
		primaries: color.primaries as VideoColorPrimaries,
		fullRange: color.fullRange,
	};
};
