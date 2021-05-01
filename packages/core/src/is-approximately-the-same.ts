const FLOATING_POINT_ERROR_THRESHOLD = 0.00001;

export const isApproximatelyTheSame = (num1: number, num2: number) => {
	return Math.abs(num1 - num2) < FLOATING_POINT_ERROR_THRESHOLD;
};
