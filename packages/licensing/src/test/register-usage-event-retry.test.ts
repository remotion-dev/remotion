import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	expect,
	spyOn,
	test,
} from 'bun:test';
import {http, HttpResponse} from 'msw';
import {setupServer} from 'msw/node';
import * as usageEventModule from '../register-usage-event';
import {
	exponentialBackoffMs,
	HOST,
	registerUsageEvent,
} from '../register-usage-event';

const server = setupServer();

beforeAll(() => {
	server.listen({onUnhandledRequest: 'error'});
});

beforeEach(() => {
	spyOn(usageEventModule, 'sleep').mockImplementation(() => Promise.resolve());
});

afterEach(() => {
	server.resetHandlers();
});

afterAll(() => {
	server.close();
});

test('exponentialBackoffMs returns correct backoff values', () => {
	expect(exponentialBackoffMs(1)).toBe(1000);
	expect(exponentialBackoffMs(2)).toBe(2000);
	expect(exponentialBackoffMs(3)).toBe(4000);
	expect(exponentialBackoffMs(4)).toBe(8000);
});

test('should succeed on first attempt without retry', async () => {
	server.use(
		http.post(`${HOST}/api/track/register-usage-point`, () => {
			return HttpResponse.json({
				success: true,
				billable: true,
				classification: 'billable',
			});
		}),
	);

	const result = await registerUsageEvent({
		licenseKey: 'rm_pub_test123',
		host: 'https://test.com',
		succeeded: true,
		event: 'webcodec-conversion',
	});

	expect(result).toEqual({
		billable: true,
		classification: 'billable',
	});
});

test('should retry and succeed after transient network error', async () => {
	let attemptCount = 0;

	server.use(
		http.post(`${HOST}/api/track/register-usage-point`, () => {
			attemptCount++;
			if (attemptCount === 1) {
				return HttpResponse.error();
			}

			return HttpResponse.json({
				success: true,
				billable: true,
				classification: 'billable',
			});
		}),
	);

	const result = await registerUsageEvent({
		licenseKey: 'rm_pub_test123',
		host: 'https://test.com',
		succeeded: true,
		event: 'webcodec-conversion',
	});

	expect(attemptCount).toBe(2);
	expect(result).toEqual({
		billable: true,
		classification: 'billable',
	});
});

test('should exhaust all retries and throw last error', () => {
	let attemptCount = 0;

	server.use(
		http.post(`${HOST}/api/track/register-usage-point`, () => {
			attemptCount++;
			return HttpResponse.error();
		}),
	);

	expect(
		registerUsageEvent({
			licenseKey: 'rm_pub_test123',
			host: 'https://test.com',
			succeeded: true,
			event: 'webcodec-conversion',
		}),
	).rejects.toThrow();

	expect(attemptCount).toBe(4);
});

test('should not retry on non-retryable errors (invalid API key)', () => {
	let attemptCount = 0;

	server.use(
		http.post(`${HOST}/api/track/register-usage-point`, () => {
			attemptCount++;
			return HttpResponse.json(
				{
					success: false,
					error: 'Invalid API key',
				},
				{status: 401},
			);
		}),
	);

	expect(
		registerUsageEvent({
			licenseKey: 'rm_pub_invalid',
			host: 'https://test.com',
			succeeded: true,
			event: 'webcodec-conversion',
		}),
	).rejects.toThrow('Invalid API key');

	expect(attemptCount).toBe(1);
});

test('should not retry on server errors (500)', () => {
	let attemptCount = 0;

	server.use(
		http.post(`${HOST}/api/track/register-usage-point`, () => {
			attemptCount++;
			return HttpResponse.json(
				{
					success: false,
					error: 'Internal server error',
				},
				{status: 500},
			);
		}),
	);

	expect(
		registerUsageEvent({
			licenseKey: 'rm_pub_test123',
			host: 'https://test.com',
			succeeded: true,
			event: 'webcodec-conversion',
		}),
	).rejects.toThrow('Internal server error');

	expect(attemptCount).toBe(1);
});

test('should retry multiple times before succeeding', async () => {
	let attemptCount = 0;

	server.use(
		http.post(`${HOST}/api/track/register-usage-point`, () => {
			attemptCount++;
			if (attemptCount < 4) {
				return HttpResponse.error();
			}

			return HttpResponse.json({
				success: true,
				billable: false,
				classification: 'development',
			});
		}),
	);

	const result = await registerUsageEvent({
		licenseKey: 'rm_pub_test123',
		host: 'http://localhost:3000',
		succeeded: true,
		event: 'cloud-render',
	});

	expect(attemptCount).toBe(4);
	expect(result).toEqual({
		billable: false,
		classification: 'development',
	});
});

test('should work with apiKey parameter (legacy)', async () => {
	server.use(
		http.post(`${HOST}/api/track/register-usage-point`, () => {
			return HttpResponse.json({
				success: true,
				billable: true,
				classification: 'billable',
			});
		}),
	);

	const result = await registerUsageEvent({
		apiKey: 'rm_pub_test123',
		host: 'https://test.com',
		succeeded: true,
		event: 'webcodec-conversion',
	});

	expect(result).toEqual({
		billable: true,
		classification: 'billable',
	});
});

test('should call sleep with correct backoff values between retries', async () => {
	const sleepCalls: number[] = [];
	spyOn(usageEventModule, 'sleep').mockImplementation((ms: number) => {
		sleepCalls.push(ms);
		return Promise.resolve();
	});

	let attemptCount = 0;

	server.use(
		http.post(`${HOST}/api/track/register-usage-point`, () => {
			attemptCount++;
			if (attemptCount < 4) {
				return HttpResponse.error();
			}

			return HttpResponse.json({
				success: true,
				billable: true,
				classification: 'billable',
			});
		}),
	);

	await registerUsageEvent({
		licenseKey: 'rm_pub_test123',
		host: 'https://test.com',
		succeeded: true,
		event: 'webcodec-conversion',
	});

	expect(sleepCalls).toEqual([1000, 2000, 4000]);
});
