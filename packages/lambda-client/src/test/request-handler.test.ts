import {expect, test} from 'bun:test';
import type {GetAwsClientInput} from '../get-aws-client';
import type {GetFunctionsInput} from '../get-functions';
import type {RequestHandler} from '../types';

test('RequestHandler type should be properly exported and defined', () => {
	// Just verify the type can be imported
	const requestHandler: RequestHandler = {
		httpsAgent: {
			maxSockets: 100,
		},
	};

	expect(requestHandler).toBeDefined();
	expect(typeof requestHandler).toBe('object');
});

test('API input types should accept requestHandler option', () => {
	// Test that the type checking works for various API inputs
	const getAwsClientInput: GetAwsClientInput<'lambda'> = {
		region: 'us-east-1',
		service: 'lambda',
		requestHandler: {
			httpsAgent: {
				maxSockets: 50,
			},
		},
	};

	const getFunctionsInput: GetFunctionsInput = {
		region: 'us-east-1',
		compatibleOnly: false,
		requestHandler: {
			httpsAgent: {
				maxSockets: 25,
			},
		},
	};

	expect(getAwsClientInput.requestHandler).toBeDefined();
	expect(getFunctionsInput.requestHandler).toBeDefined();
});
