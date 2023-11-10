import type {
	setCurrentRequestId as originalSetCurrentRequestId,
	startLeakDetection as originalStartLeakDetection,
	stopLeakDetection as originalStopLeakDetection,
} from '../leak-detection';

export const stopLeakDetection: typeof originalStopLeakDetection = () => {};

export const setCurrentRequestId: typeof originalSetCurrentRequestId = () => {};

export const startLeakDetection: typeof originalStartLeakDetection = () => {};
