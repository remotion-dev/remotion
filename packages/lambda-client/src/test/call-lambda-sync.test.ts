import {beforeAll, expect, mock, test} from 'bun:test';
import type {callFunctionSyncImplementation as CallFnType} from '../call-lambda-sync';

const mockSend = mock();
const stubClient = () => {
	throw new Error('Unmocked AWS client called');
};

mock.module('../aws-clients', () => ({
	getLambdaClient: () => ({
		send: mockSend,
	}),
	getCloudWatchLogsClient: stubClient,
	getIamClient: stubClient,
	getServiceQuotasClient: stubClient,
	getStsClient: stubClient,
}));

let callFunctionSyncImplementation: typeof CallFnType;

beforeAll(async () => {
	const mod = await import('../call-lambda-sync');
	callFunctionSyncImplementation = mod.callFunctionSyncImplementation;
});

const dummyOptions = {
	functionName: 'my-function',
	type: 'info',
	payload: {type: 'info', logLevel: 'info'},
	region: 'us-east-1',
	timeoutInTest: 12000,
	requestHandler: null,
};

test('Throws readable error when FunctionError is set', async () => {
	mockSend.mockResolvedValueOnce({
		FunctionError: 'Unhandled',
		LogResult: 'some-log',
		Payload: undefined,
		StatusCode: 200,
	});

	await expect(
		callFunctionSyncImplementation(dummyOptions as never),
	).rejects.toThrow(/Lambda function returned error: Unhandled/);
});

test('Throws readable error when Payload is null', async () => {
	mockSend.mockResolvedValueOnce({
		FunctionError: undefined,
		Payload: null,
		StatusCode: 429,
	});

	await expect(
		callFunctionSyncImplementation(dummyOptions as never),
	).rejects.toThrow(/Lambda function returned no payload \(status 429\)/);
});

test('Throws readable error when Payload is undefined', async () => {
	mockSend.mockResolvedValueOnce({
		FunctionError: undefined,
		Payload: undefined,
		StatusCode: 500,
	});

	await expect(
		callFunctionSyncImplementation(dummyOptions as never),
	).rejects.toThrow(/Lambda function returned no payload \(status 500\)/);
});

test('Succeeds when Payload is valid', async () => {
	mockSend.mockResolvedValueOnce({
		FunctionError: undefined,
		Payload: new TextEncoder().encode(
			JSON.stringify({type: 'success', version: '1.0.0'}),
		),
		StatusCode: 200,
	});

	const result = await callFunctionSyncImplementation(dummyOptions as never);
	expect(result).toEqual({type: 'success', version: '1.0.0'});
});
