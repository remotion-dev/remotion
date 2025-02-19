import {interpolate} from '@remotion/serverless-client';

// Always update the code in docs/lambda/concurrency.md too

export const bestFramesPerFunctionParam = (frameCount: number) => {
	// Between 0 and 10 minutes (at 30fps), interpolate the concurrency from 75 to 150
	const concurrency = interpolate(frameCount, [0, 18000], [75, 150], {
		extrapolateRight: 'clamp',
	});

	// At least have 20 as a `framesPerFunction` value
	const framesPerFunction = Math.max(frameCount / concurrency, 20);

	// Evenly distribute: For 21 frames over 2 functions, distribute as 11 + 10 ==> framesPerLambda = 11
	const functionsNeeded = Math.ceil(frameCount / framesPerFunction);

	return Math.ceil(frameCount / functionsNeeded);
};
