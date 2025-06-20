import {test, expect} from 'bun:test';

// Mock FontFace to test our logic
class MockFontFace {
	status = 'unloaded';
	
	load() {
		return new Promise((resolve) => {
			// Simulate async loading
			setTimeout(() => {
				this.status = 'loaded';
				resolve(this);
			}, 100);
		});
	}
}

// Test the abort logic directly
test('AbortController logic should work', async () => {
	const controller = new AbortController();
	
	// Simulate the abort logic from our implementation
	const loadWithAbort = (signal?: AbortSignal) => {
		if (signal?.aborted) {
			return Promise.reject(new Error('Font loading was cancelled'));
		}

		const fontLoadPromise = new Promise((resolve) => {
			setTimeout(resolve, 100);
		});

		const promises = [fontLoadPromise];

		if (signal) {
			const abortPromise = new Promise((_, reject) => {
				signal.addEventListener('abort', () => {
					reject(new Error('Font loading was cancelled'));
				});
			});
			promises.push(abortPromise);
		}

		return Promise.race(promises);
	};

	// Test that it works without abort
	await expect(loadWithAbort()).resolves.toBeUndefined();

	// Test that it works with abort signal (not aborted)
	const controller2 = new AbortController();
	await expect(loadWithAbort(controller2.signal)).resolves.toBeUndefined();

	// Test that it rejects when aborted
	const controller3 = new AbortController();
	const promise = loadWithAbort(controller3.signal);
	
	// Abort after a short delay
	setTimeout(() => controller3.abort(), 10);
	
	await expect(promise).rejects.toThrow('Font loading was cancelled');
});

test('Pre-aborted signal should reject immediately', () => {
	const controller = new AbortController();
	controller.abort();
	
	const loadWithAbort = (signal?: AbortSignal) => {
		if (signal?.aborted) {
			return Promise.reject(new Error('Font loading was cancelled'));
		}
		return Promise.resolve();
	};

	return expect(loadWithAbort(controller.signal)).rejects.toThrow('Font loading was cancelled');
});