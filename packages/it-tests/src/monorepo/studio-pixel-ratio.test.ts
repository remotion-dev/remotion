import {expect, test} from 'bun:test';
import {readFileSync} from 'fs';
import path from 'path';

test('Studio canvas pixel ratio override is disabled in committed code', () => {
	const source = readFileSync(
		path.join(
			__dirname,
			'..',
			'..',
			'..',
			'studio',
			'src',
			'helpers',
			'studio-pixel-ratio.ts',
		),
		'utf-8',
	);

	expect(source).toContain('const OVERRIDE_PIXEL_RATIO: number | null = null;');
});
