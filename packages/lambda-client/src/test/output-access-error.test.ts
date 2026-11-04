import {expect, test} from 'bun:test';
import {OutputFileAccessDeniedError} from '../find-output-file-in-bucket';

test('recognizes normalized output access errors without accepting names or HTTP statuses', () => {
	const cause = new Error('Forbidden');
	const error = new OutputFileAccessDeniedError('Cannot read output', {cause});
	expect(OutputFileAccessDeniedError.isInstance(error)).toBe(true);
	expect(error).toBeInstanceOf(Error);
	expect(error).toBeInstanceOf(OutputFileAccessDeniedError);
	expect(error.message).toBe('Cannot read output');
	expect(error.cause).toBe(cause);
	for (const other of [
		null,
		undefined,
		'OutputFileAccessDeniedError',
		new Error('Cannot read output'),
		Object.assign(new Error('Forbidden'), {
			name: 'OutputFileAccessDeniedError',
		}),
		Object.assign(new Error('Forbidden'), {$metadata: {httpStatusCode: 403}}),
		{[Symbol.for('remotion.OutputFileAccessDeniedError')]: true},
		Object.assign(new Error('Forbidden'), {
			[Symbol.for('remotion.OutputFileAccessDeniedError')]: false,
		}),
	]) {
		expect(OutputFileAccessDeniedError.isInstance(other)).toBe(false);
	}
});
