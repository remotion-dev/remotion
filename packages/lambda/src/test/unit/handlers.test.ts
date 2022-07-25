import {handler} from '../../functions/index';
import type {Await} from '../../shared/await';
import {LambdaRoutines} from '../../shared/constants';
import type {LambdaReturnValues} from '../../shared/return-values';

test('Info handler should return version', async () => {
	const response = await handler(
		{
			type: LambdaRoutines.info,
		},
		{invokedFunctionArn: '::::::', getRemainingTimeInMillis: () => 1000}
	);

	expect(
		typeof (response as Await<LambdaReturnValues[LambdaRoutines.info]>)
			.version === 'string'
	).toBe(true);
});
