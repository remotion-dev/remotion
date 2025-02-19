import {StudioServerInternals} from '@remotion/studio-server';
import {expect, test} from 'bun:test';
import {readFileSync} from 'fs';
import {resolve} from 'path';

const rootFile = resolve(
	__dirname,
	'..',
	'..',
	'..',
	'example',
	'src',
	'CodemodTestbed.tsx',
);

const getCompositionCount = (comp: string) => {
	const lines = comp.split('\n');
	const compositions = lines.filter(
		(l) => l.includes('<Composition') || l.includes('<Still'),
	);
	return compositions.length;
};

const contents = readFileSync(rootFile, 'utf-8');
const compCount = getCompositionCount(contents);

test('Should be able to delete composition', () => {
	expect(contents).toContain('"one"');

	const {changesMade, newContents} = StudioServerInternals.parseAndApplyCodemod(
		{
			input: contents,
			codeMod: {
				type: 'delete-composition',
				idToDelete: 'one',
			},
		},
	);
	expect(changesMade.length).toBe(1);
	expect(getCompositionCount(newContents)).toBe(compCount - 1);
	expect(newContents).not.toContain('"one"');
});

test('Should be able to rename composition', () => {
	const {changesMade, newContents} = StudioServerInternals.parseAndApplyCodemod(
		{
			input: contents,
			codeMod: {
				type: 'rename-composition',
				idToRename: 'one',
				newId: 'abc',
			},
		},
	);
	expect(changesMade.length).toBe(1);
	expect(getCompositionCount(newContents)).toBe(compCount);
	expect(newContents).not.toContain('"one"');
	expect(newContents).toContain('"abc"');
});

test('Should be able to duplicate composition', () => {
	const {newContents} = StudioServerInternals.parseAndApplyCodemod({
		input: contents,
		codeMod: {
			type: 'duplicate-composition',
			idToDuplicate: 'one',
			newDurationInFrames: 200,
			newFps: 24,
			newHeight: 999,
			newWidth: 998,
			newId: 'def',
			tag: 'Composition',
		},
	});

	expect(getCompositionCount(newContents)).toBe(compCount + 1);
	expect(newContents).toContain('"def"');
	expect(newContents).toContain('width={998}');
	expect(newContents).toContain('height={999}');
	expect(newContents).toContain('fps={24}');
	expect(newContents).toContain('durationInFrames={200}');
});

test('Should be able to duplicate composition into a still', () => {
	const {newContents} = StudioServerInternals.parseAndApplyCodemod({
		input: contents,
		codeMod: {
			type: 'duplicate-composition',
			idToDuplicate: 'one',
			newDurationInFrames: 200,
			newFps: 24,
			newHeight: 999,
			newWidth: 998,
			newId: 'def',
			tag: 'Still',
		},
	});

	expect(getCompositionCount(newContents)).toBe(compCount + 1);
	expect(newContents).toContain('"def"');
	expect(newContents).toContain('width={998}');
	expect(newContents).toContain('height={999}');
	expect(newContents).not.toContain('fps={24}');
	expect(newContents).not.toContain('durationInFrames={200}');
});

test('Should be able to recognize non-arrow function', () => {
	const {changesMade, newContents} = StudioServerInternals.parseAndApplyCodemod(
		{
			input: contents,
			codeMod: {
				type: 'rename-composition',
				idToRename: 'four',
				newId: 'ghi',
			},
		},
	);
	expect(changesMade.length).toBe(1);
	expect(getCompositionCount(newContents)).toBe(compCount);
	expect(newContents).not.toContain('"four"');
	expect(newContents).toContain('"ghi"');
});

test.todo('should work if there is no fragment');

test('in non-return statement', () => {
	const {changesMade, newContents} = StudioServerInternals.parseAndApplyCodemod(
		{
			input: contents,
			codeMod: {
				type: 'rename-composition',
				idToRename: 'six',
				newId: 'jkl',
			},
		},
	);
	expect(changesMade.length).toBe(1);
	expect(getCompositionCount(newContents)).toBe(compCount);
	expect(newContents).not.toContain('"six"');
	expect(newContents).toContain('"jkl"');
});

test("curly braces id={'seven'}", () => {
	const {changesMade, newContents} = StudioServerInternals.parseAndApplyCodemod(
		{
			input: contents,
			codeMod: {
				type: 'rename-composition',
				idToRename: 'seven',
				newId: 'mno',
			},
		},
	);
	expect(changesMade.length).toBe(1);
	expect(getCompositionCount(newContents)).toBe(compCount);
	expect(newContents).not.toContain('"seven"');
	expect(newContents).toContain('"mno"');
});
