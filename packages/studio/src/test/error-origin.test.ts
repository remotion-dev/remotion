import {expect, test} from 'bun:test';
import {
	markErrorAsLoggedByServer,
	markErrorMessageAsLoggedByServer,
	wasErrorLoggedByServer,
} from '../error-overlay/error-origin';

test('marks errors that originated from server logging paths', () => {
	const serverError = new Error('Already logged by server');
	const browserError = new Error('Browser-only error');

	expect(wasErrorLoggedByServer(serverError)).toBe(false);
	expect(wasErrorLoggedByServer(browserError)).toBe(false);

	markErrorAsLoggedByServer(serverError);

	expect(wasErrorLoggedByServer(serverError)).toBe(true);
	expect(wasErrorLoggedByServer(browserError)).toBe(false);
});

test('marks server logged errors by message', () => {
	const serverLoggedMessage = 'Module build failed from server';
	const buildError = new Error(serverLoggedMessage);
	const buildErrorWithStack = new Error('Wrapped build error');
	buildErrorWithStack.stack = `Error: Wrapped build error\n${serverLoggedMessage}`;

	expect(wasErrorLoggedByServer(buildError)).toBe(false);

	markErrorMessageAsLoggedByServer(serverLoggedMessage);

	expect(wasErrorLoggedByServer(buildError)).toBe(true);
	expect(wasErrorLoggedByServer(buildErrorWithStack)).toBe(true);
});
