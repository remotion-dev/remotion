import {expect, test} from 'bun:test';
import {isFlakyError} from '../is-flaky-error';

test('Should detect socket hang up errors', () => {
	const error = new Error('socket hang up');
	expect(isFlakyError(error)).toBe(true);
});

test('Should detect TimeoutError: socket hang up errors', () => {
	const error = new Error(
		'TimeoutError: socket hang up\n    at TLSSocket.socketOnEnd (node:_http_client:524:23)',
	);
	expect(isFlakyError(error)).toBe(true);
});

test('Should detect ECONNRESET errors', () => {
	const error = new Error('ECONNRESET');
	expect(isFlakyError(error)).toBe(true);
});

test('Should detect network errors', () => {
	const error = new Error('A network error occurred');
	expect(isFlakyError(error)).toBe(true);
});

test('Should not detect non-flaky errors', () => {
	const error = new Error('Something else went wrong');
	expect(isFlakyError(error)).toBe(false);
});

test('Should detect errors with stack traces', () => {
	const error = new Error('Test error');
	error.stack = `Error: TimeoutError: socket hang up
    at TLSSocket.socketOnEnd (node:_http_client:524:23)
    at TLSSocket.emit (node:events:530:35)
    at endReadableNT (node:internal/streams/readable:1696:12)
    at process.processTicksAndRejections (node:internal/process/task_queues:82:21)`;
	expect(isFlakyError(error)).toBe(true);
});
