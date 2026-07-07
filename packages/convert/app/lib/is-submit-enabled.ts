import type {SupportedConfigs} from '~/components/get-supported-configs';
import {canRotateOrMirror} from './can-rotate-or-mirror';
import type {RotateOrMirrorOrCropState} from './default-ui';
import {isDroppingEverything} from './is-reencoding';

export const isSubmitDisabled = ({
	supportedConfigs,
	audioConfigIndexSelection,
	videoConfigIndexSelection,
	enableConvert,
	enableRotateOrMirror,
	enableTrim,
}: {
	supportedConfigs: SupportedConfigs | null;
	audioConfigIndexSelection: Record<number, string>;
	videoConfigIndexSelection: Record<number, string>;
	enableConvert: boolean;
	enableRotateOrMirror: RotateOrMirrorOrCropState;
	enableTrim: boolean;
}) => {
	if (!supportedConfigs) {
		return true;
	}

	const allActionsDisabled =
		!enableConvert && enableRotateOrMirror === null && !enableTrim;

	if (allActionsDisabled) {
		return true;
	}

	const isRotatingOrMirroring =
		enableRotateOrMirror !== null &&
		canRotateOrMirror({
			supportedConfigs,
			enableConvert,
			videoConfigIndexSelection,
		});
	const isConverting =
		enableConvert &&
		!isDroppingEverything({
			audioConfigIndexSelection,
			supportedConfigs,
			videoConfigIndexSelection,
			enableConvert,
		});

	return !(isRotatingOrMirroring || isConverting || enableTrim);
};
