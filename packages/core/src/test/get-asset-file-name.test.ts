import {describe, expect, test} from 'bun:test';
import {getAssetDisplayName} from '../get-asset-file-name.js';

describe('get asset file name test', () => {
	const testStrings: [string, string][] = [
		['assets/images/sample.png', 'sample.png'],
		['assets\\images\\sample.png', 'sample.png'],
		['sample.png', 'sample.png'],
		['data:video/mp4;base64,AAAA', 'Data URL'],
		['blob:https://remotion.dev/unknown', 'Blob URL'],
	];

	testStrings.forEach((entry) =>
		test(`test for ${entry[0]}`, () => {
			expect(getAssetDisplayName(entry[0])).toEqual(entry[1]);
		}),
	);

	test('resolves a blob URL to its public asset name', () => {
		const previousStaticFiles = window.remotion_staticFiles;
		window.remotion_staticFiles = [
			{
				lastModified: 0,
				name: 'videos/intro.mp4',
				sizeInBytes: 123,
				src: 'blob:https://remotion.dev/intro',
			},
		];

		try {
			expect(getAssetDisplayName('blob:https://remotion.dev/intro')).toEqual(
				'intro.mp4',
			);
		} finally {
			window.remotion_staticFiles = previousStaticFiles;
		}
	});
});
