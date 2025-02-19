import {describe, expect, test} from 'bun:test';
import type {LogLevel} from '../log-level';
import {isValidLogLevel} from '../log-level';

describe('loglevel validity', () => {
	test.each<string>(['abc', 'aalsadj', ''])(
		'is %s an invalid level',
		(level) => {
			expect(isValidLogLevel(level)).toEqual(false);
		},
	);
	test.each<string | LogLevel>(['verbose', 'info', 'warn', 'error'])(
		'is %s a valid level',
		(level) => {
			expect(isValidLogLevel(level)).toEqual(true);
		},
	);
});
