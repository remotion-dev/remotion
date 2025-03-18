import {RENDER_FN_PREFIX} from './constants';

type ReturnType = {
	version: string;
	memorySizeInMb: number;
	diskSizeInMb: number;
	timeoutInSeconds: number;
};

export const parseFunctionName = (functionName: string): ReturnType | null => {
	const match = functionName.match(
		new RegExp(RENDER_FN_PREFIX + '(.*)-mem(\\d+)mb-disk(\\d+)mb-(\\d+)sec$'),
	);
	if (!match) {
		return null;
	}

	return {
		version: match[1],
		memorySizeInMb: parseInt(match[2], 10),
		diskSizeInMb: parseInt(match[3], 10),
		timeoutInSeconds: parseInt(match[4], 10),
	};
};
