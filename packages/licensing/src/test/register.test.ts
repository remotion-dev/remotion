// These tests can only be run locally on a machine
// of a Remotion team member with an instance of remotion.pro running locally

import {expect, test} from 'bun:test';
import {registerUsageEvent} from '../register-usage-point';

test('Should be able to track production usage', async () => {
	const result = await registerUsageEvent({
		apiKey: 'rm_pub_1dd7193534bbe72571b55bd43926654ddaaca3dd6f07772b',
		host: 'http://localhost:50955',
		succeeded: true,
		event: 'webcodec-conversion',
	});
	expect(result).toEqual({
		success: true,
		billable: false,
		classification: 'development',
	});
});

test('Should be able to track development usage', async () => {
	const result = await registerUsageEvent({
		apiKey: 'rm_pub_1dd7193534bbe72571b55bd43926654ddaaca3dd6f07772b',
		host: 'https://remotion.dev',
		succeeded: true,
		event: 'webcodec-conversion',
	});
	expect(result).toEqual({
		success: true,
		billable: true,
		classification: 'billable',
	});
});

test('Should reject invalid API key', async () => {
	const result = registerUsageEvent({
		apiKey: 'rm_pub_1dd719b',
		host: 'http://localhost:50955',
		succeeded: true,
		event: 'webcodec-conversion',
	});
	expect(result).rejects.toThrowError(/Invalid API key/);
});

test('Should reject invalid secret API key', async () => {
	const result = registerUsageEvent({
		apiKey: 'rm_sec_1dd719b',
		host: 'http://localhost:50955',
		succeeded: true,
		event: 'webcodec-conversion',
	});
	expect(result).rejects.toThrowError(
		/Secret API passed - use public key instead/,
	);
});
