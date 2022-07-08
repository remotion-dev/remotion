import {CURRENT_VERSION} from '../../defaults';
import type {OptimizationProfile} from './types';

export const canUseOptimization = ({
	optimization,
	framesPerLambda,
	frameRange,
}: {
	optimization: OptimizationProfile | null;
	framesPerLambda: number;
	frameRange: [number, number];
}) => {
	if (!optimization) {
		return false;
	}

	if (optimization.framesPerLambda !== framesPerLambda) {
		return false;
	}

	if (optimization.lambdaVersion !== CURRENT_VERSION) {
		return false;
	}

	if (optimization.frameRange[0] !== frameRange[0]) {
		return false;
	}

	if (optimization.frameRange[1] !== frameRange[1]) {
		return false;
	}

	return true;
};
