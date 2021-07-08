import {render} from '@testing-library/react';
import {Freeze} from '../freeze';
import {expectToThrow} from './expect-to-throw';

describe('Throw with invalid duration props', () => {
	test('It should throw if Freeze has string as frame prop value', () => {
		expectToThrow(
			// @ts-expect-error
			() => render(<Freeze frame={'0'} />),
			/You passed to 'frame' an argument of type string, but it must be a number./
		);
	});
	test('It should throw if Freeze has undefined as frame prop value', () => {
		expectToThrow(
			// @ts-expect-error
			() => render(<Freeze />),
			/You passed to 'frame' an argument of type undefined, but it must be a number./
		);
	});
});
