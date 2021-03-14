import {getQuality, setQuality} from '../config/quality';
import {expectToThrow} from './expect-to-throw';

test('set quality tests', () => {
	// input quality
	const valuesA = [50, undefined, 100, 1];
	valuesA.forEach((entry) => {
		setQuality(entry);
		expect(getQuality()).toEqual(entry);
	});

	// input quality, output quality
	const valuesB = [[0, undefined]];
	valuesB.forEach((entry) => {
		setQuality(entry[0]);
		expect(getQuality()).toEqual(entry[1]);
	});

	// input quality
	const valuesC = ['abc', null];
	valuesC.forEach((entry) =>
		expectToThrow(
			// @ts-expect-error
			() => setQuality(entry),
			new RegExp(
				`Quality option must be a number or undefined. Got ${typeof entry}`
			)
		)
	);

	// input quality
	const valuesD = [-1, 101, 150];
	valuesD.forEach((entry) =>
		expectToThrow(
			() => setQuality(entry),
			/Quality option must be between 1 and 100./
		)
	);
});
