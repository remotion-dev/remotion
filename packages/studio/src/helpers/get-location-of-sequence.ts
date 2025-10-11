import {parseStack} from '../error-overlay/react-overlay/utils/parser';

export const getLocationOfSequence = (stack: string | null) => {
	if (!stack) {
		return null;
	}

	const parsed = parseStack(stack.split('\n'));
	let i = 0;
	while (i < parsed.length) {
		const frame = parsed[i];
		if (frame.functionName === 'apply') {
			i++;
			continue;
		}

		return frame;
	}

	return null;
};

export const getLocationOfFunctionCall = (
	stack: string | null,
	functionName: string,
) => {
	if (!stack) {
		return null;
	}

	const parsed = parseStack(stack.split('\n'));
	let i = 0;
	while (i < parsed.length) {
		const frame = parsed[i];
		if (frame.functionName !== functionName) {
			i++;
			continue;
		}

		return parsed[i + 1];
	}

	return null;
};
