import {SupportedConfigs} from '~/components/get-supported-configs';
import {canRotateOrMirror} from './can-rotate-or-mirror';
import {RotateOrMirrorState} from './default-ui';
import {isDroppingEverything} from './is-reencoding';

export const isSubmitDisabled = ({
	supportedConfigs,
	audioConfigIndex,
	videoConfigIndex,
	enableConvert,
	enableRotateOrMirror,
}: {
	supportedConfigs: SupportedConfigs | null;
	audioConfigIndex: Record<number, number>;
	videoConfigIndex: Record<number, number>;
	enableConvert: boolean;
	enableRotateOrMirror: RotateOrMirrorState;
}) => {
	if (!supportedConfigs) {
		return true;
	}

	const allActionsDisabled = !enableConvert && enableRotateOrMirror === null;

	if (allActionsDisabled) {
		return true;
	}

	const isRotatingOrMirroring =
		enableRotateOrMirror !== null &&
		canRotateOrMirror({
			supportedConfigs,
			videoConfigIndex,
		});
	const isConverting =
		enableConvert &&
		!isDroppingEverything({
			audioConfigIndex,
			supportedConfigs,
			videoConfigIndex,
		});

	return !(isRotatingOrMirroring || isConverting);
};
