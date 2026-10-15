import {expect, spyOn, test} from 'bun:test';
import {awsImplementation} from '../aws-provider';
import {getCompositionsOnLambda} from '../get-compositions-on-lambda';

test('defaults envVariables to {} when they are omitted', async () => {
	const callFunctionSync = spyOn(
		awsImplementation,
		'callFunctionSync',
	).mockResolvedValue({type: 'success', compositions: []} as never);
	try {
		await getCompositionsOnLambda({
			region: 'us-east-1',
			functionName: 'remotion-render-test',
			serveUrl: 'https://example.com',
			inputProps: {},
		});

		expect(callFunctionSync).toHaveBeenCalledTimes(1);
		expect(callFunctionSync.mock.calls[0][0].payload).toHaveProperty(
			'envVariables',
			{},
		);
	} finally {
		callFunctionSync.mockRestore();
	}
});
