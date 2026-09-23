import {expect, test} from 'bun:test';
import {readFileSync} from 'fs';
import {resolve} from 'path';
import {
	applyCodemodChanges,
	deleteComposition,
	duplicateComposition,
	getJsxNodeProps,
	getJsxNodes,
	renameComposition,
} from '@remotion/codemods';

const compositionFile = resolve(
	__dirname,
	'..',
	'..',
	'..',
	'example',
	'src',
	'CodemodTestbed.tsx',
);
const contents = readFileSync(compositionFile, 'utf-8');
const original = {rootDir: '/', files: {[compositionFile]: contents}};

test('edits composition registrations through the packaged public API', () => {
	let project = applyCodemodChanges(
		original,
		renameComposition({
			project: original,
			compositionFile,
			compositionId: 'one',
			newId: 'Renamed',
		}).changes,
	);
	expect(project.files[compositionFile]).toBe(
		contents.replace('id="one"', 'id="Renamed"'),
	);
	project = applyCodemodChanges(
		project,
		duplicateComposition({
			project,
			compositionFile,
			compositionId: 'Renamed',
			newId: 'Copy',
			metadata: {width: 998, height: 999, fps: 24, durationInFrames: 200},
		}).changes,
	);
	project = applyCodemodChanges(
		project,
		duplicateComposition({
			project,
			compositionFile,
			compositionId: 'Copy',
			newId: 'Poster',
			tag: 'Still',
			metadata: {width: 500, height: 400},
		}).changes,
	);

	const registrations = getJsxNodes({project, filePath: compositionFile})
		.filter(
			(node) => node.tagName === 'Composition' || node.tagName === 'Still',
		)
		.map((node) => ({
			tagName: node.tagName,
			props: getJsxNodeProps({
				project,
				node,
				keys: ['id', 'width', 'height', 'fps', 'durationInFrames'],
			}).props,
		}));
	expect(registrations).toContainEqual({
		tagName: 'Composition',
		props: expect.objectContaining({
			id: expect.objectContaining({codeValue: 'Copy'}),
			width: expect.objectContaining({codeValue: 998}),
			height: expect.objectContaining({codeValue: 999}),
			fps: expect.objectContaining({codeValue: 24}),
			durationInFrames: expect.objectContaining({codeValue: 200}),
		}),
	});
	expect(registrations).toContainEqual({
		tagName: 'Still',
		props: expect.objectContaining({
			id: expect.objectContaining({codeValue: 'Poster'}),
			width: expect.objectContaining({codeValue: 500}),
			height: expect.objectContaining({codeValue: 400}),
			fps: expect.objectContaining({status: 'static', codeValue: undefined}),
			durationInFrames: expect.objectContaining({
				status: 'static',
				codeValue: undefined,
			}),
		}),
	});
	project = applyCodemodChanges(
		project,
		deleteComposition({
			project,
			compositionFile,
			compositionId: 'Renamed',
		}).changes,
	);
	expect(project.files[compositionFile]).not.toContain('id="Renamed"');
	expect(project.files[compositionFile]).toContain('id="Copy"');
	expect(project.files[compositionFile]).toContain('id="Poster"');
	expect(original.files[compositionFile]).toBe(contents);
});

test('renames registrations in functions, variables, and expression attributes', () => {
	let project = original;
	let expected = contents;
	for (const [compositionId, newId, before, after] of [
		['four', 'Function', 'id="four"', 'id="Function"'],
		['six', 'Variable', 'id="six"', 'id="Variable"'],
		['seven', 'Expression', "id={'seven'}", "id={'Expression'}"],
	]) {
		project = applyCodemodChanges(
			project,
			renameComposition({
				project,
				compositionFile,
				compositionId,
				newId,
			}).changes,
		);
		expected = expected.replace(before, after);
		expect(project.files[compositionFile]).toBe(expected);
	}
});
