import type {SupportedConfigs} from '~/components/get-supported-configs';
import {canRotateOrMirror} from './can-rotate-or-mirror';
import type {RotateOrMirrorState} from './default-ui';
import {isDroppingEverything} from './is-reencoding';

export const isSubmitDisabled = ({
	supportedConfigs,
	audioConfigIndexSelection,
	videoConfigIndexSelection,
	enableConvert,
	enableRotateOrMirror,
}: {
	supportedConfigs: SupportedConfigs | null;
	audioConfigIndexSelection: Record<number, string>;
	videoConfigIndexSelection: Record<number, string>;
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

	return !(isRotatingOrMirroring || isConverting);
};
