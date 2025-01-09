// These tests can only be run locally on a machine
// of a Remotion team member with an instance of remotion.pro running locally

import {expect, test} from 'bun:test';
import {getUsage} from '../get-usage';
import {registerUsageEvent} from '../register-usage-point';

test('Should be able to track production usage', async () => {
	const result = await registerUsageEvent({
		apiKey: 'rm_pub_cbbf1d1e7f07cb0b86daa0247693d6c9af4740463768f2f6',
		host: 'http://localhost:50955',
		succeeded: true,
		event: 'webcodec-conversion',
	});
	expect(result).toEqual({
		billable: false,
		classification: 'development',
	});
});

test('Should be able to track development usage', async () => {
	const result = await registerUsageEvent({
		apiKey: 'rm_pub_cbbf1d1e7f07cb0b86daa0247693d6c9af4740463768f2f6',
		host: 'https://remotion.dev',
		succeeded: true,
		event: 'webcodec-conversion',
	});
	expect(result).toEqual({
		billable: true,
		classification: 'billable',
	});
});
test('Should be able to track without host', async () => {
	const result = await registerUsageEvent({
		apiKey: 'rm_pub_cbbf1d1e7f07cb0b86daa0247693d6c9af4740463768f2f6',
		host: null,
		succeeded: true,
		event: 'webcodec-conversion',
	});
	expect(result).toEqual({
		billable: true,
		classification: 'billable',
	});
});

test('Should reject invalid API key', () => {
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
		/Secret API key passed - use public key instead/,
	);
});

test('should require secret key for usage', () => {
	const result = getUsage({
		apiKey: 'rm_pub_1dd7193534bbe72571b55bd43926654ddaaca3dd6f07772b',
		since: null,
	});
	expect(result).rejects.toThrowError(/Public API key/);
});

test('should be able to get usage', async () => {
	const result = await getUsage({
		apiKey: 'rm_sec_b776a51f683c850101ece5c580c7db7281397d1864e076a9',
		since: null,
	});

	expect(result.webcodecConversions.billable).toBeGreaterThan(0);
	expect(result.webcodecConversions.development).toBeGreaterThan(0);
	expect(result.webcodecConversions.failed).toBeGreaterThanOrEqual(0);
	expect(result.cloudRenders.billable).toBeGreaterThanOrEqual(0);
	expect(result.cloudRenders.development).toBeGreaterThanOrEqual(0);
	expect(result.cloudRenders.failed).toBeGreaterThanOrEqual(0);
});

test('should not be able to get usage older than 90 says', () => {
	const result = getUsage({
		apiKey: 'rm_sec_7cef7338672c2b474729ac081134a6ded7dc360baf0068fe',
		since: new Date().getTime() - 1000 * 60 * 60 * 24 * 700,
	});

	expect(result).rejects.toThrowError(/Cannot query usage older than 90 days/);
});
