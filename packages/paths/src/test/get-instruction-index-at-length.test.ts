import {expect, test} from 'bun:test';
import {getInstructionIndexAtLength} from '../get-instruction-index-at-length';
import {parsePath} from '../parse-path';

test('getInstructionIndexAtLength() should work', () => {
	expect(() => getInstructionIndexAtLength('M 0 0', 100)).toThrow(
		'A length of 100 was passed to getInstructionIndexAtLength() but the total length of the path is only 0',
	);
	expect(getInstructionIndexAtLength('M 0 0', 0)).toEqual({
		lengthIntoInstruction: 0,
		index: 0,
	});
	expect(getInstructionIndexAtLength('M 0 0 L 100 0 L 200 0', 104)).toEqual({
		lengthIntoInstruction: 4,
		index: 1,
	});

	const path = 'M 0 0 L 100 0 L 200 0';
	const {index} = getInstructionIndexAtLength(path, 104);
	expect(parsePath(path)[index]).toEqual({type: 'L', x: 100, y: 0});
});
