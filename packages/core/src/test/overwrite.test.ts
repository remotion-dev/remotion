import {getShouldOverwrite, setOverwriteOutput} from '../config/overwrite';
import {expectToThrow} from './expect-to-throw';

test('setOverwriteOutput should throw if overwrite is not a boolean value', () => {
	expectToThrow(
		() =>
			setOverwriteOutput(
				// @ts-expect-error
				555
			),
		/overwriteExisting must be a boolean but got number [(]555[)]/
	);
});

test('getShouldOverwrite should return false by default', () => {
	expect(getShouldOverwrite()).toEqual(false);
});

test('setOverwriteOutput should NOT throw if image format is a boolean value', () => {
	expect(() => setOverwriteOutput(true)).not.toThrow();
	expect(getShouldOverwrite()).toEqual(true);
});
