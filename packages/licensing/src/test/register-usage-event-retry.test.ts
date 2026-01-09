import {afterAll, afterEach, beforeAll, expect, test} from 'bun:test';
import {delay, http, HttpResponse} from 'msw';
import {setupServer} from 'msw/node';
import {HOST, registerUsageEvent} from '../register-usage-event';

const server = setupServer();

beforeAll(() => {
	server.listen({onUnhandledRequest: 'error'});
});

afterEach(() => {
	server.resetHandlers();
});

afterAll(() => {
	server.close();
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
				// Simulate network error on first attempt
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

test('should retry with exponential backoff timing', async () => {
	const timestamps: number[] = [];
	let attemptCount = 0;

	server.use(
		http.post(`${HOST}/api/track/register-usage-point`, () => {
			attemptCount++;
			timestamps.push(Date.now());

			if (attemptCount <= 2) {
				// Fail first 2 attempts
				return HttpResponse.error();
			}

			return HttpResponse.json({
				success: true,
				billable: true,
				classification: 'billable',
			});
		}),
	);

	const startTime = Date.now();
	await registerUsageEvent({
		licenseKey: 'rm_pub_test123',
		host: 'https://test.com',
		succeeded: true,
		event: 'webcodec-conversion',
	});
	const totalTime = Date.now() - startTime;

	expect(attemptCount).toBe(3);
	// First retry after ~1000ms, second retry after ~2000ms
	// Total time should be at least 3000ms (1000 + 2000)
	expect(totalTime).toBeGreaterThanOrEqual(2900);
	expect(totalTime).toBeLessThan(4000);

	// Verify backoff intervals
	if (timestamps.length >= 2) {
		const firstBackoff = timestamps[1] - timestamps[0];
		expect(firstBackoff).toBeGreaterThanOrEqual(950);
		expect(firstBackoff).toBeLessThan(1200);
	}

	if (timestamps.length >= 3) {
		const secondBackoff = timestamps[2] - timestamps[1];
		expect(secondBackoff).toBeGreaterThanOrEqual(1950);
		expect(secondBackoff).toBeLessThan(2200);
	}
});

test('should exhaust all retries and throw last error', async () => {
	let attemptCount = 0;

	server.use(
		http.post(`${HOST}/api/track/register-usage-point`, () => {
			attemptCount++;
			// Always return network error
			return HttpResponse.error();
		}),
	);

	await expect(
		registerUsageEvent({
			licenseKey: 'rm_pub_test123',
			host: 'https://test.com',
			succeeded: true,
			event: 'webcodec-conversion',
		}),
	).rejects.toThrow();

	// Should try 4 times total (1 initial + 3 retries)
	expect(attemptCount).toBe(4);
});

test('should not retry on non-retryable errors (invalid API key)', async () => {
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

	await expect(
		registerUsageEvent({
			licenseKey: 'rm_pub_invalid',
			host: 'https://test.com',
			succeeded: true,
			event: 'webcodec-conversion',
		}),
	).rejects.toThrow('Invalid API key');

	// Should only try once - no retries for non-retryable errors
	expect(attemptCount).toBe(1);
});

test('should not retry on server errors (500)', async () => {
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

	await expect(
		registerUsageEvent({
			licenseKey: 'rm_pub_test123',
			host: 'https://test.com',
			succeeded: true,
			event: 'webcodec-conversion',
		}),
	).rejects.toThrow('Internal server error');

	// Should only try once
	expect(attemptCount).toBe(1);
});

test('should handle timeout and retry', async () => {
	let attemptCount = 0;

	server.use(
		http.post(`${HOST}/api/track/register-usage-point`, async () => {
			attemptCount++;
			if (attemptCount === 1) {
				// Delay longer than 10 second timeout
				await delay(11000);
				return HttpResponse.json({
					success: true,
					billable: true,
					classification: 'billable',
				});
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

test('should retry multiple times before succeeding', async () => {
	let attemptCount = 0;

	server.use(
		http.post(`${HOST}/api/track/register-usage-point`, () => {
			attemptCount++;
			// Fail first 3 attempts, succeed on 4th (last attempt)
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

test('should handle timeout on all attempts and throw timeout error', async () => {
	let attemptCount = 0;

	server.use(
		http.post(`${HOST}/api/track/register-usage-point`, async () => {
			attemptCount++;
			// Always timeout
			await delay(11000);
			return HttpResponse.json({
				success: true,
				billable: true,
				classification: 'billable',
			});
		}),
	);

	await expect(
		registerUsageEvent({
			licenseKey: 'rm_pub_test123',
			host: 'https://test.com',
			succeeded: true,
			event: 'webcodec-conversion',
		}),
	).rejects.toThrow('Request timed out after 10 seconds');

	// Should try 4 times total
	expect(attemptCount).toBe(4);
}, 60000); // Increase test timeout for this long-running test

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
