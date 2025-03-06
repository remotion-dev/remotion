import {expect, test} from 'bun:test';
import {calculateAReasonableMp4HeaderLength} from '../create/iso-base-media/header-length';

test('should calculate good header length', () => {
	const result = calculateAReasonableMp4HeaderLength(60 * 110);
	expect(result).toBe(5121246);
});

test('should calculate good header length for null', () => {
	const result = calculateAReasonableMp4HeaderLength(0);
	expect(result).toBe(51200);
});
