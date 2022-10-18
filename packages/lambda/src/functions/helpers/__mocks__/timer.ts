import type {timer as original} from '../../../functions/helpers/timer';

// Turn off timers while in testing. very noisy.
export const timer: typeof original = () => {
	return {
		end: () => undefined,
	};
};
