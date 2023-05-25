import {expect, test} from 'vitest';
import {handler} from '../../functions/index';
import type {Await} from '../../shared/await';
import {LambdaRoutines} from '../../shared/constants';
import type {
	LambdaReturnValues,
	StreamedResponse,
} from '../../shared/return-values';

test('Info handler should return version', async () => {
	const response = await handler(
		{
			type: LambdaRoutines.info,
		},
		{invokedFunctionArn: '::::::', getRemainingTimeInMillis: () => 1000}
	);

	const res = response as StreamedResponse;
	const parsed = JSON.parse(res.body) as Await<
		LambdaReturnValues[LambdaRoutines.info]
	>;

	expect(typeof parsed.version === 'string').toBe(true);
});
