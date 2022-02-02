import {timer as original} from '../../../functions/helpers/timer';

// Turn off timers in debug. rather slow
export const timer: typeof original = () => {
	return {
		end: () => undefined,
	};
};
