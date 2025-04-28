import {StudioServerInternals} from '@remotion/studio-server';
import {expect, test} from 'bun:test';
import {readFileSync} from 'fs';
import {resolve} from 'path';

const visualControlFile = resolve(
	__dirname,
	'..',
	'..',
	'..',
	'example',
	'src',
	'VisualControls',
	'index.tsx',
);

test('Should be able to create visual control', () => {
	const {newContents} = StudioServerInternals.parseAndApplyCodemod({
		input: readFileSync(visualControlFile, 'utf-8'),
		codeMod: {
			type: 'apply-visual-control',
			changes: [
				{
					id: 'my-matrix',
					newValueSerialized: '123',
				},
				{
					id: 'my-matrix-2',
					newValueSerialized: '"456" as const',
				},
			],
		},
	});

	expect(newContents).toContain(
		`const matrix = visualControl('my-matrix', 123,`,
	);
	expect(newContents).toContain(
		'const matrix2 = visualControl(`my-matrix-2`, "456" as const,',
	);
});
