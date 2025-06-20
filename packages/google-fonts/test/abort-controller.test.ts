import {test, expect} from 'bun:test';
import {loadFont} from '../src/Inter';

test('AbortController should cancel font loading', async () => {
	// Skip this test if FontFace is not available (test environment)
	if (typeof FontFace === 'undefined') {
		return;
	}

	const controller = new AbortController();
	
	// Start loading the font
	const fontPromise = loadFont('normal', {
		weights: ['400'],
		subsets: ['latin'],
		controller,
	});

	// Abort immediately
	controller.abort();

	// The waitUntilDone promise should reject with cancellation error
	let error: Error | null = null;
	try {
		await fontPromise.waitUntilDone();
	} catch (err) {
		error = err as Error;
	}

	expect(error).toBeTruthy();
	expect(error?.message).toBe('Font loading was cancelled');
});

test('Font loading should work normally without AbortController', async () => {
	const result = loadFont('normal', {
		weights: ['400'],
		subsets: ['latin'],
	});

	// Should not throw
	expect(result.fontFamily).toBe('Inter');
	expect(result.waitUntilDone).toBeInstanceOf(Function);
});

test('Font loading should work normally with AbortController that is not aborted', async () => {
	const controller = new AbortController();
	
	const result = loadFont('normal', {
		weights: ['400'],
		subsets: ['latin'],
		controller,
	});

	// Should not throw
	expect(result.fontFamily).toBe('Inter');
	expect(result.waitUntilDone).toBeInstanceOf(Function);
	
	// Don't abort - should work normally
	// Note: We won't await waitUntilDone() as it would try to actually load fonts
	// which may not work in test environment
});