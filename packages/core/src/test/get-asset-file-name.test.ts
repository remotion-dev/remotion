import {describe, expect, test} from 'vitest';
import {getAssetDisplayName} from '../get-asset-file-name';

describe('get asset file name test', () => {
	const testStrings: [string, string][] = [
		['assets/images/sample.png', 'sample.png'],
		['assets\\images\\sample.png', 'sample.png'],
		['sample.png', 'sample.png'],
	];

	testStrings.forEach((entry) =>
		test(`test for ${entry[0]}`, () => {
			expect(getAssetDisplayName(entry[0])).toEqual(entry[1]);
		})
	);
});
