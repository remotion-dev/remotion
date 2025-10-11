import {expect, test} from 'bun:test';
import {calculateAReasonableMp4HeaderLength} from '../create/iso-base-media/header-length';

test('should calculate good header length', () => {
	const result = calculateAReasonableMp4HeaderLength({
		expectedDurationInSeconds: 60 * 110,
		expectedFrameRate: 30,
	});
	expect(result).toBe(5121246);
});

test('should calculate good header length if no fps is provided', () => {
	const result = calculateAReasonableMp4HeaderLength({
		expectedDurationInSeconds: 60 * 110,
		expectedFrameRate: null,
	});
	expect(result).toBe(5121246 * 2 - 1);
});

test('should calculate good header length for null', () => {
	const result = calculateAReasonableMp4HeaderLength({
		expectedDurationInSeconds: 0,
		expectedFrameRate: 60,
	});
	expect(result).toBe(51200);
});
