import {SupportedConfigs} from '~/components/get-supported-configs';
import {isReencoding} from './is-reencoding';

export const canRotateOrMirror = ({
	supportedConfigs,
	videoConfigIndex,
}: {
	supportedConfigs: SupportedConfigs | null;
	videoConfigIndex: Record<number, number>;
}) => {
	return (
		(supportedConfigs && isReencoding({supportedConfigs, videoConfigIndex})) ??
		false
	);
};
