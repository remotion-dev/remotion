import type {SupportedConfigs} from '~/components/get-supported-configs';
import {isReencoding} from './is-reencoding';

export const canRotateOrMirror = ({
	supportedConfigs,
	videoConfigIndexSelection,
	enableConvert,
}: {
	supportedConfigs: SupportedConfigs | null;
	videoConfigIndexSelection: Record<number, string>;
	enableConvert: boolean;
}) => {
	return (
		(supportedConfigs &&
			isReencoding({
				supportedConfigs,
				videoConfigIndexSelection,
				enableConvert,
			})) ??
		false
	);
};
