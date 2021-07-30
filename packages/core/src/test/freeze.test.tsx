import {render} from '@testing-library/react';
import {Freeze} from '../freeze';
import {expectToThrow} from './expect-to-throw';

describe('Throw with invalid duration props', () => {
	test('It should throw if Freeze has string as frame prop value', () => {
		expectToThrow(
			// @ts-expect-error
			() => render(<Freeze frame={'0'} />),
			/The 'frame' prop of <Freeze \/> must be a number, but is of type string/
		);
	});
	test('It should throw if Freeze has undefined as frame prop value', () => {
		expectToThrow(
			// @ts-expect-error
			() => render(<Freeze />),
			/The <Freeze \/> component requires a 'frame' prop, but none was passed./
		);
	});
});
