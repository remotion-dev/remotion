import {expect, test} from 'bun:test';
import {getLength} from '../get-length';
import {getPointAtLength} from '../get-point-at-length';

test('Should be able to get parts of a path', () => {
	const parts = getPointAtLength('M 0 0 L 100 0', 50);

	expect(parts).toEqual({x: 50, y: 0});
});

test('Another more complex point', () => {
	const path = `M2 129
		
		C48.6667 84.6666 186 2
		 324 1.99997C476.135 1.99994 616
		 89.9999 663 129`;

	const length = getLength(path);

	expect(getPointAtLength(path, 0.5 * length)).toEqual({
		x: 331.8581614474634,
		y: 2.0777534617004165,
	});
	expect(getPointAtLength(path, length)).toEqual({
		x: 663.0000000000001,
		y: 129.00000000000006,
	});
});

test('Anotehr getPointAtLength()', () => {
	const path =
		'M25 205C3.66665 160.667 -22.4 73.2 44 78C110.4 82.8 120.333 220.667 117 289C108 316 81.8 362.6 49 333C8 296 55 248 75 233C91 221 197.667 158 249 128C281 115 337.6 81.2 308 50C271 11 248 -5 201 4C154 13 124 77 160 106C188.8 129.2 308.667 196.333 365 227C410.667 241.667 501.2 253.6 498 184C494.8 114.4 432 84.3333 401 78C369.333 79.3333 291.4 106.6 233 205C174.6 303.4 248.667 340.667 293 347C341.667 352 441.6 353 452 317C462.4 281 546.333 271.333 587 271';

	const length = getLength(path);

	expect(getPointAtLength(path, 0.5 * length)).toEqual({
		x: 199.67232200916263,
		y: 132.4918282805198,
	});
	expect(getPointAtLength(path, length)).toEqual({
		x: 587.0000000000001,
		y: 271,
	});
});
