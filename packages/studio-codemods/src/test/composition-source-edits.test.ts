import {expect, test} from 'bun:test';
import {parseAndApplyCodemod} from '../parse-and-apply-codemod';
import {parseAst} from '../sequence-props/parse-ast';

for (const [indent, eol] of [
	['\t', '\n'],
	['  ', '\n'],
	['    ', '\r\n'],
]) {
	test(`composition edits preserve ${JSON.stringify({indent, eol})}`, () => {
		const composition = [
			`${indent}<Composition`,
			`${indent}${indent}id="Original"`,
			`${indent}${indent}component={Video}`,
			`${indent}${indent}durationInFrames={120}`,
			`${indent}${indent}fps={30}`,
			`${indent}${indent}width={1280}`,
			`${indent}${indent}height={720}`,
			`${indent}/>`,
		].join(eol);
		const input = [
			"import {Composition} from 'remotion';",
			'',
			'const preserve  =  { custom : "spacing" }; // keep this',
			'export const Root = () => <>',
			composition,
			`${indent}{/* keep this comment */}`,
			'</>;',
			'',
		].join(eol);
		const renamed = parseAndApplyCodemod({
			input,
			codeMod: {
				type: 'rename-composition',
				idToRename: 'Original',
				newId: 'Renamed',
			},
		}).newContents;
		expect(renamed).toBe(input.replace('id="Original"', 'id="Renamed"'));
		const duplicated = parseAndApplyCodemod({
			input: renamed,
			codeMod: {
				type: 'duplicate-composition',
				idToDuplicate: 'Renamed',
				newId: 'Copy',
				tag: 'Composition',
				newFps: null,
				newHeight: null,
				newWidth: null,
				newDurationInFrames: null,
			},
		}).newContents;
		expect(duplicated).toBe(
			renamed.replace(
				composition.replace('Original', 'Renamed'),
				composition.replace('Original', 'Renamed') +
					eol +
					composition.replace('Original', 'Copy'),
			),
		);
		const deleted = parseAndApplyCodemod({
			input: duplicated,
			codeMod: {type: 'delete-composition', idToDelete: 'Copy'},
		}).newContents;
		expect(deleted).toBe(renamed);
		parseAst(duplicated);
	});
}

test('new compositions append to fragments and folders and wrap standalone roots', () => {
	for (const [root, folderName, expected] of [
		['<>\n  {/* keep */}\n</>', null, '<>\n  {/* keep */}\n  INSERT\n</>'],
		[
			'<Folder name="Target" />',
			'Target',
			'<Folder name="Target">\n  INSERT\n</Folder>',
		],
		[
			'<Folder name="Target"><Composition id="Old" /></Folder>',
			'Target',
			'<Folder name="Target"><Composition id="Old" />\n  INSERT\n</Folder>',
		],
		[
			'<Composition id="Old" />',
			null,
			'<>\n  <Composition id="Old" />\n  INSERT\n</>',
		],
	] as const) {
		const input = `import {Composition, Folder} from 'remotion';\nexport const Root = () => (${root});\n`;
		const output = parseAndApplyCodemod({
			input,
			codeMod: {
				type: 'new-composition',
				componentName: 'Fresh',
				componentImportPath: './Fresh',
				newId: 'Fresh',
				newWidth: 1920,
				newHeight: 1080,
				newDurationInFrames: 90,
				newFps: 30,
				folderName,
				parentName: null,
				canvasCapture: null,
			},
		}).newContents;
		const inserted =
			'<Composition\n    id="Fresh"\n    component={Fresh}\n    durationInFrames={90}\n    fps={30}\n    width={1920}\n    height={1080}\n  />';
		expect(output).toBe(
			"import {Fresh} from './Fresh';\n" +
				input.replace(root, expected.replace('INSERT', inserted)),
		);
		parseAst(output);
	}
});

test('duplicating a standalone composition into a Still updates both tags and removes timing props', () => {
	const input = `import {Composition} from 'remotion';
export const Root = () => (
  <Composition id="Original" fps={30} durationInFrames={90}>
    {/* keep the child */}
    <Child />
  </Composition>
);
`;
	const output = parseAndApplyCodemod({
		input,
		codeMod: {
			type: 'duplicate-composition',
			idToDuplicate: 'Original',
			newId: 'Poster',
			tag: 'Still',
			newFps: null,
			newDurationInFrames: null,
			newWidth: 500,
			newHeight: 400,
		},
	}).newContents;
	expect(output).toContain("import {Composition, Still} from 'remotion';");
	expect(output).toContain(
		'    <Still id="Poster" width={500} height={400}>\n      {/* keep the child */}\n      <Child />\n    </Still>',
	);
	expect(output).toContain(
		'    <Composition id="Original" fps={30} durationInFrames={90}>',
	);
	parseAst(output);
});

test('rename preserves expression quotes and delete replaces standalone and conditional JSX with null', () => {
	for (const original of [
		'<Composition id={"Original"} />',
		"<Still id={'Original'} />",
	]) {
		for (const expression of [
			original,
			`(${original})`,
			`enabled ? ${original} : null`,
		]) {
			const input = `export const Root = () => ${expression};\n`;
			const renamed = parseAndApplyCodemod({
				input,
				codeMod: {
					type: 'rename-composition',
					idToRename: 'Original',
					newId: 'Renamed',
				},
			}).newContents;
			expect(renamed).toBe(input.replace('Original', 'Renamed'));
			const deleted = parseAndApplyCodemod({
				input: renamed,
				codeMod: {type: 'delete-composition', idToDelete: 'Renamed'},
			}).newContents;
			expect(deleted).toBe(
				expression.startsWith('enabled')
					? 'export const Root = () => enabled ? null : null;\n'
					: 'export const Root = () => null;\n',
			);
		}
	}
});

test('updates existing composition metadata without changing surrounding source', () => {
	const input = [
		'import { Composition } from "remotion"',
		'',
		'const preserve  =  { value : "keep" }',
		'export const Root = () => (',
		'    <Composition',
		'        id={"Original"}',
		'        durationInFrames = { DURATION }',
		'        fps={FPS}',
		'        width',
		'        height="720"',
		'    />',
		')',
		'',
	].join('\r\n');
	const {changesMade, newContents} = parseAndApplyCodemod({
		input,
		codeMod: {
			type: 'update-composition-metadata',
			idToUpdate: 'Original',
			newDurationInFrames: 240,
			newFps: 60,
			newWidth: 1920,
			newHeight: 1080,
		},
	});

	expect(changesMade).toEqual([
		{description: 'Replaced durationInFrames'},
		{description: 'Replaced FPS'},
		{description: 'Replaced width'},
		{description: 'Replaced height'},
	]);
	expect(newContents).toBe(
		input
			.replace('{ DURATION }', '{240}')
			.replace('{FPS}', '{60}')
			.replace('        width\r\n', '        width={1920}\r\n')
			.replace('height="720"', 'height={1080}'),
	);
	expect(() => parseAst(newContents)).not.toThrow();
});

test('adds missing composition metadata using multiline source style', () => {
	for (const [indent, eol] of [
		['\t', '\n'],
		['  ', '\n'],
		['    ', '\r\n'],
	]) {
		const input = [
			'export const Root = () => (',
			`${indent}<Composition`,
			`${indent}${indent}id="Original"`,
			`${indent}/>`,
			')',
			'',
		].join(eol);
		const {changesMade, newContents} = parseAndApplyCodemod({
			input,
			codeMod: {
				type: 'update-composition-metadata',
				idToUpdate: 'Original',
				newDurationInFrames: 90,
				newFps: 30,
				newWidth: 1920,
				newHeight: 1080,
			},
		});

		expect(changesMade).toEqual([
			{description: 'Added FPS'},
			{description: 'Added durationInFrames'},
			{description: 'Added width'},
			{description: 'Added height'},
		]);
		expect(newContents).toBe(
			input.replace(
				`${indent}/>`,
				[
					`${indent}${indent}fps={30}`,
					`${indent}${indent}durationInFrames={90}`,
					`${indent}${indent}width={1920}`,
					`${indent}${indent}height={1080}`,
					`${indent}/>`,
				].join(eol),
			),
		);
		expect(() => parseAst(newContents)).not.toThrow();
	}
});

test('adds missing composition metadata without reformatting an inline tag', () => {
	const input = `const preserve  =  { value : "keep" };
export const Root=()=> <Still id={'Original'} height = "720"/>;
`;
	const {changesMade, newContents} = parseAndApplyCodemod({
		input,
		codeMod: {
			type: 'update-composition-metadata',
			idToUpdate: 'Original',
			newDurationInFrames: null,
			newFps: null,
			newWidth: 1920,
			newHeight: 1080,
		},
	});

	expect(changesMade).toEqual([
		{description: 'Replaced height'},
		{description: 'Added width'},
	]);
	expect(newContents).toBe(`const preserve  =  { value : "keep" };
export const Root=()=> <Still id={'Original'} height = {1080} width={1920}/>;
`);
	expect(() => parseAst(newContents)).not.toThrow();
});
