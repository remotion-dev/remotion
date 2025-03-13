import {expect, test} from 'bun:test';
import {makeMatroskaBytes} from '../create/matroska/matroska-utils';

test('should serialize with correct byte length', () => {
	const withInheritedWidth = makeMatroskaBytes({
		type: 'Timestamp',
		minVintWidth: null,
		value: {
			value: 0,
			byteLength: null,
		},
	});

	const withFixedWidth = makeMatroskaBytes({
		type: 'Timestamp',
		minVintWidth: null,
		value: {
			value: 0,
			byteLength: 1,
		},
	});
	expect(withFixedWidth.bytes).toEqual(withInheritedWidth.bytes);
});
