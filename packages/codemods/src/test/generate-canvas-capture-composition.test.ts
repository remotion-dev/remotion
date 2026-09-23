import {expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {
	CANVAS_CAPTURE_METADATA_TAG,
	parseCanvasCaptureData,
} from '@remotion/studio-shared';
import {addCanvasCaptureComposition, type CodemodProject} from '../index';

test('creates and registers an interactive Canvas Capture composition', () => {
	const fixtureDirectory = path.join(__dirname, 'fixtures');
	const metadata = readFileSync(
		path.join(fixtureDirectory, 'canvas-capture-metadata.json'),
		'utf-8',
	);
	const data = parseCanvasCaptureData({
		raw: {[CANVAS_CAPTURE_METADATA_TAG]: metadata},
	});
	if (data === null) {
		throw new Error('Could not parse the Canvas Capture metadata fixture');
	}

	const compositionFile = 'src/Root.tsx';
	const componentFile = 'src/CanvasCaptureComposition.tsx';
	const root =
		'import {Folder} from \'remotion\';\nexport const Root = () => <Folder name="Captures" />;\n';
	const project: CodemodProject = {
		rootDir: '/',
		files: {[compositionFile]: root},
	};
	const options = {
		project,
		compositionFile,
		compositionId: 'canvas-capture-promo',
		component: {
			filePath: componentFile,
			importName: 'CanvasCaptureComposition',
			importPath: './CanvasCaptureComposition',
		},
		metadata: {durationInFrames: 500, fps: 60, height: 1080, width: 1920},
		folder: {name: 'Captures', parentName: null},
		capture: {
			data,
			keyframeFps: 30,
			videoFileName: 'remotion-capture-editor-starter.mp4',
			videoHeight: 1386,
			videoWidth: 3026,
		},
	};
	const result = addCanvasCaptureComposition(options);
	const expected = readFileSync(
		path.join(fixtureDirectory, 'canvas-capture-composition.txt'),
		'utf-8',
	)
		.replaceAll('\r\n', '\n')
		.replaceAll('\r', '\n');

	expect(result.project.files[componentFile]).toBe(expected);
	expect(result.project.files[compositionFile]).toContain(
		"import {CanvasCaptureComposition} from './CanvasCaptureComposition';",
	);
	expect(result.project.files[compositionFile]).toMatch(
		/<Folder name="Captures">\s*<CanvasCaptureComposition \/>\s*<\/Folder>/,
	);
	expect(result.changes.map((change) => change.filePath)).toEqual([
		compositionFile,
		componentFile,
	]);
	expect(project.files).toEqual({[compositionFile]: root});

	for (const [existingPath, requestedPath] of [
		[componentFile, componentFile],
		[componentFile, `/project/${componentFile}`],
		[componentFile, `./${componentFile}`],
		[componentFile, `src/../${componentFile}`],
		[`/project/${componentFile}`, componentFile],
	]) {
		const existingSource = 'export const Existing = () => null;';
		const existingProject = {
			rootDir: '/project',
			files: {[compositionFile]: root, [existingPath]: existingSource},
		};
		expect(() =>
			addCanvasCaptureComposition({
				...options,
				project: existingProject,
				component: {...options.component, filePath: requestedPath},
			}),
		).toThrow('already exists');
		expect(existingProject.files).toEqual({
			[compositionFile]: root,
			[existingPath]: existingSource,
		});
	}
});
