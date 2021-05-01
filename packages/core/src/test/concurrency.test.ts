import {
	Concurrency,
	getConcurrency,
	setConcurrency,
} from '../config/concurrency';
import {expectToThrow} from './expect-to-throw';

const invalidConcurrency: String = 'invalidConcurrency';
let defaultConcurrency: Concurrency;

beforeAll(() => {
	defaultConcurrency = getConcurrency();
});

test('setConcurrency should throw if concurrency is not a number', () => {
	expectToThrow(
		() =>
			// @ts-expect-error
			setConcurrency(invalidConcurrency),
		/--concurrency flag must be a number./
	);
});
test('setConcurrency should NOT throw if concurrency is a number', () => {
	expect(() => setConcurrency(50)).not.toThrow();
});
test('getConcurrency should return null by default', () => {
	expect(defaultConcurrency === null);
});
test('getConcurrency should return number', () => {
	setConcurrency(100);
	expect(getConcurrency()).toEqual(100);
});
