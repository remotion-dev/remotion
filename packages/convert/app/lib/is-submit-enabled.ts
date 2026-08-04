import type {SupportedConfigs} from '~/components/get-supported-configs';
import {canRotateOrMirror} from './can-rotate-or-mirror';
import type {VideoEditState} from './default-ui';
import {isDroppingEverything} from './is-reencoding';

export const isSubmitDisabled = ({
	supportedConfigs,
	audioConfigIndexSelection,
	videoConfigIndexSelection,
	enableConvert,
	videoEditState,
	enableTrim,
	enableResize,
}: {
	supportedConfigs: SupportedConfigs | null;
	audioConfigIndexSelection: Record<number, string>;
	videoConfigIndexSelection: Record<number, string>;
	enableConvert: boolean;
	videoEditState: VideoEditState;
	enableTrim: boolean;
	enableResize: boolean;
}) => {
	if (!supportedConfigs) {
		return true;
	}

	const hasVideoEdit =
		videoEditState.crop ||
		videoEditState.mirror ||
		videoEditState.rotate ||
		enableResize;
	const allActionsDisabled = !enableConvert && !hasVideoEdit && !enableTrim;

	if (allActionsDisabled) {
		return true;
	}

	const canApplyVideoEdit =
		hasVideoEdit &&
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

	return !(canApplyVideoEdit || isConverting || enableTrim);
};
