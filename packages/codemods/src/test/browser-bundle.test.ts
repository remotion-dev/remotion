import {expect, test} from 'bun:test';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {runInNewContext} from 'node:vm';
import type * as Codemods from '../index';

test('loads and edits registrations in a browser without Node globals', async () => {
	const directory = mkdtempSync(
		path.join(tmpdir(), 'remotion-browser-codemods-'),
	);
	try {
		const entry = path.join(directory, 'entry.js');
		writeFileSync(
			entry,
			`import * as codemods from ${JSON.stringify(path.resolve(import.meta.dir, '../../dist/esm/index.mjs'))}; globalThis.codemods = codemods;`,
		);
		const bundle = await Bun.build({
			entrypoints: [entry],
			target: 'browser',
			format: 'iife',
			define: {'process.env.NODE_ENV': JSON.stringify('development')},
		});
		expect(bundle.success).toBe(true);
		const context = {codemods: null as typeof Codemods | null};
		runInNewContext(await bundle.outputs[0].text(), context, {timeout: 10000});
		expect(context).not.toHaveProperty('process');
		expect(context).not.toHaveProperty('Buffer');
		const codemods = context.codemods!;
		const project = {
			rootDir: '/',
			files: {
				'Root.tsx': `import {Composition, Folder} from 'remotion'; import {Video} from './Video'; export const Root = () => <><Folder name="Source"><Composition id="A" component={Video} durationInFrames={60} /></Folder></>;`,
				'nested/Target.tsx': `import {Composition as C, Folder as F} from 'remotion'; export const Target = () => <F name="Target"/>;`,
			},
		};
		const result = codemods.moveFolder({
			project,
			compositionFile: 'Root.tsx',
			folder: {name: 'Source', parentName: null},
			destinationFile: 'nested/Target.tsx',
			destination: {type: 'folder', folder: {name: 'Target', parentName: null}},
		});
		const moved = codemods.applyCodemodChanges(project, result.changes);
		expect(moved.files['nested/Target.tsx']).toContain('<F name="Source">');
		expect(moved.files['nested/Target.tsx']).toContain(
			'<C id="A" component={Video}',
		);
		expect(moved.files['nested/Target.tsx']).toContain("from '../Video'");
		expect(moved.files['Root.tsx']).not.toContain('id="A"');
		for (const scope of [
			'{enum Timing {Duration = 60}; void Timing.Duration;}',
			'class Local {static {enum Timing {Duration = 60}; void Timing.Duration;}} void Local;',
			'switch (0) {case 0: enum Timing {Duration = 60}; void Timing.Duration;}',
		]) {
			const callbackProject = {
				...project,
				files: {
					...project.files,
					'Root.tsx': project.files['Root.tsx']
						.replace('{Video}', '{Video, Timing}')
						.replace(
							'durationInFrames={60}',
							`durationInFrames={60} calculateMetadata={() => {${scope} return {durationInFrames: Timing.Duration};}}`,
						),
				},
			};
			const callbackResult = codemods.moveComposition({
				project: callbackProject,
				compositionFile: 'Root.tsx',
				compositionId: 'A',
				destinationFile: 'nested/Target.tsx',
				destination: {
					type: 'folder',
					folder: {name: 'Target', parentName: null},
				},
			});
			const callbackMoved = codemods.applyCodemodChanges(
				callbackProject,
				callbackResult.changes,
			);
			expect(callbackMoved.files['nested/Target.tsx']).toContain(
				'Video, Timing',
			);
		}

		for (const declaration of [
			'enum Timing {Duration = 60}',
			'namespace Timing {export const Duration = 60}',
		]) {
			for (const shadowImport of [false, true]) {
				const localProject = {
					...project,
					files: {
						...project.files,
						'Root.tsx': project.files['Root.tsx']
							.replace(
								'export const Root = () =>',
								shadowImport
									? `import {Timing} from './Timing'; export const Root = () => {${declaration}; return`
									: `${declaration}; export const Root = () =>`,
							)
							.replace('</>;', shadowImport ? '</>;};' : '</>;')
							.replace(
								'durationInFrames={60}',
								'durationInFrames={Timing.Duration}',
							),
					},
				};
				expect(() =>
					codemods.moveComposition({
						project: localProject,
						compositionFile: 'Root.tsx',
						compositionId: 'A',
						destinationFile: 'nested/Target.tsx',
						destination: {
							type: 'folder',
							folder: {name: 'Target', parentName: null},
						},
					}),
				).toThrow('local binding "Timing"');
				expect(localProject.files['Root.tsx']).toContain(
					'durationInFrames={Timing.Duration}',
				);
			}
		}
	} finally {
		rmSync(directory, {recursive: true, force: true});
	}
});
