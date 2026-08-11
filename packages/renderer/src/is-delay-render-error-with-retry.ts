import {NoReactInternals} from 'remotion/no-react';

export const getRetriesLeftFromError = (error: Error | undefined): number => {
	if (!error) {
		throw new Error('Expected stack');
	}

	const {stack} = error as Error;
	if (!stack) {
		throw new Error('Expected stack: ' + JSON.stringify(error));
	}

	const beforeIndex = stack.indexOf(
		NoReactInternals.DELAY_RENDER_ATTEMPT_TOKEN,
	);
	if (beforeIndex === -1) {
		throw new Error('Expected to find attempt token in stack');
	}

	const afterIndex = stack.indexOf(NoReactInternals.DELAY_RENDER_RETRY_TOKEN);

	if (afterIndex === -1) {
		throw new Error('Expected to find retry token in stack');
	}

	const inbetween = stack.substring(
		beforeIndex + NoReactInternals.DELAY_RENDER_ATTEMPT_TOKEN.length,
		afterIndex,
	);
	const parsed = Number(inbetween);
	if (Number.isNaN(parsed)) {
		throw new Error(`Expected to find a number in the stack ${stack}`);
	}

	return parsed;
};
