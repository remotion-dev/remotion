import {expect, test} from 'bun:test';
import {mkdtempSync, realpathSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {parseAst} from '../codemods/parse-ast';
import {resolveImportedCaptions} from '../codemods/resolve-imported-captions';
import {
	findJsxElementNodeAtNodePath,
	lineColumnToNodePath,
} from '../preview-server/routes/can-update-sequence-props';

const ownerSource = `import {captions as voiceoverCaptions} from './captions';

export const Video = () => <Sequence captions={voiceoverCaptions} />;
`;

const captionSource = `export const captions = [
	{
		text: 'Hello',
		startMs: 0,
		endMs: 1000,
		timestampMs: 500,
		confidence: null,
	},
] as const;
`;

test('resolves an aliased named import of a static local caption declaration', () => {
	const remotionRoot = mkdtempSync(
		path.join(tmpdir(), 'remotion-imported-captions-'),
	);
	const ownerAbsolutePath = path.join(remotionRoot, 'Video.tsx');
	writeFileSync(ownerAbsolutePath, ownerSource);
	writeFileSync(path.join(remotionRoot, 'captions.ts'), captionSource);

	try {
		const ast = parseAst(ownerSource);
		const nodePath = lineColumnToNodePath(ast, 3);
		if (!nodePath) {
			throw new Error('Could not create a node path');
		}

		const jsxElement = findJsxElementNodeAtNodePath(
			ast,
			nodePath,
		)?.openingElement;
		if (!jsxElement) {
			throw new Error('Could not find JSX element');
		}

		expect(
			resolveImportedCaptions({
				ownerAst: ast,
				jsxElement,
				ownerAbsolutePath,
				remotionRoot,
			}),
		).toEqual({
			absolutePath: realpathSync(path.join(remotionRoot, 'captions.ts')),
			fileRelativeToRoot: 'captions.ts',
			exportName: 'captions',
			captions: [
				{
					text: 'Hello',
					startMs: 0,
					endMs: 1000,
					timestampMs: 500,
					confidence: null,
				},
			],
		});
	} finally {
		rmSync(remotionRoot, {force: true, recursive: true});
	}
});
