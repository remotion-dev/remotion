import {bestFramesPerLambdaParam} from '../../functions/helpers/best-frames-per-lambda-param';

test('Get reasonable framesPerLambda defaults', () => {
	expect(bestFramesPerLambdaParam(20)).toEqual(20);
	expect(bestFramesPerLambdaParam(21)).toEqual(11);
	expect(bestFramesPerLambdaParam(100)).toEqual(20);
	expect(bestFramesPerLambdaParam(2000)).toEqual(24);
	expect(bestFramesPerLambdaParam(4000)).toEqual(44);
	expect(bestFramesPerLambdaParam(8000)).toEqual(74);
	expect(bestFramesPerLambdaParam(10000)).toEqual(86);
	expect(bestFramesPerLambdaParam(14000)).toEqual(105);
	expect(bestFramesPerLambdaParam(18000)).toEqual(120);
	expect(bestFramesPerLambdaParam(216000)).toEqual(1440);
});
