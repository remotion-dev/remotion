import {getConcurrency, setConcurrency} from '../config/concurrency';
import {expectToThrow} from './expect-to-throw';

test('setConcurrency should throw if concurrency is not a number or null', () => {
	expectToThrow(
		() =>
			setConcurrency(
				// @ts-expect-error
				'invalidConcurrency'
			),
		/--concurrency flag must be a number./
	);
});

test('getConcurrency should return null by default', () => {
	expect(getConcurrency()).toEqual(null);
});

test('setConcurrency should NOT throw if concurrency is a boolean value', () => {
	expect(() => setConcurrency(50)).not.toThrow();
	expect(getConcurrency()).toEqual(50);
});
