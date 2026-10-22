import {expect, test} from 'bun:test';
import {
	addComposition,
	applyCodemodChanges,
	deleteComposition,
	duplicateComposition,
	renameComposition,
	updateCompositionMetadata,
} from '../index';
import {getChangedContents} from './get-changed-contents';

const compositionFile = 'Root.tsx';

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
		const project = {rootDir: '/', files: {[compositionFile]: input}};
		const renamed = renameComposition({
			project,
			compositionFile,
			compositionId: 'Original',
			newId: 'Renamed',
		});
		expect(getChangedContents(renamed, compositionFile)).toBe(
			input.replace('id="Original"', 'id="Renamed"'),
		);
		const afterRename = applyCodemodChanges(project, renamed.changes);
		const duplicated = duplicateComposition({
			project: afterRename,
			compositionFile,
			compositionId: 'Renamed',
			newId: 'Copy',
		});
		expect(getChangedContents(duplicated, compositionFile)).toBe(
			getChangedContents(renamed, compositionFile).replace(
				composition.replace('Original', 'Renamed'),
				composition.replace('Original', 'Renamed') +
					eol +
					composition.replace('Original', 'Copy'),
			),
		);
		const afterDuplicate = applyCodemodChanges(afterRename, duplicated.changes);
		const deleted = deleteComposition({
			project: afterDuplicate,
			compositionFile,
			compositionId: 'Copy',
		});
		expect(getChangedContents(deleted, compositionFile)).toBe(
			getChangedContents(renamed, compositionFile),
		);
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
		const result = addComposition({
			project: {rootDir: '/', files: {[compositionFile]: input}},
			compositionFile,
			compositionId: 'Fresh',
			component: {importName: 'Fresh', importPath: './Fresh'},
			metadata: {width: 1920, height: 1080, durationInFrames: 90, fps: 30},
			folder:
				folderName === null ? undefined : {name: folderName, parentName: null},
		});
		const inserted =
			'<Composition\n    id="Fresh"\n    component={Fresh}\n    durationInFrames={90}\n    fps={30}\n    width={1920}\n    height={1080}\n  />';
		expect(getChangedContents(result, compositionFile)).toBe(
			"import {Fresh} from './Fresh';\n" +
				input.replace(root, expected.replace('INSERT', inserted)),
		);
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
	const result = duplicateComposition({
		project: {rootDir: '/', files: {[compositionFile]: input}},
		compositionFile,
		compositionId: 'Original',
		newId: 'Poster',
		tag: 'Still',
		metadata: {width: 500, height: 400},
	});
	const output = getChangedContents(result, compositionFile);
	expect(output).toContain("import {Composition, Still} from 'remotion';");
	expect(output).toContain(
		'    <Still id="Poster" width={500} height={400}>\n      {/* keep the child */}\n      <Child />\n    </Still>',
	);
	expect(output).toContain(
		'    <Composition id="Original" fps={30} durationInFrames={90}>',
	);
});

test('rename preserves expression quotes and delete replaces standalone and conditional JSX with null', () => {
	const imports = "import {Composition, Still} from 'remotion';\n";
	for (const original of [
		'<Composition id={"Original"} />',
		"<Still id={'Original'} />",
	]) {
		for (const expression of [
			original,
			`(${original})`,
			`enabled ? ${original} : null`,
		]) {
			const input = `${imports}export const Root = () => ${expression};\n`;
			const project = {rootDir: '/', files: {[compositionFile]: input}};
			const renamed = renameComposition({
				project,
				compositionFile,
				compositionId: 'Original',
				newId: 'Renamed',
			});
			expect(getChangedContents(renamed, compositionFile)).toBe(
				input.replace('Original', 'Renamed'),
			);
			const afterRename = applyCodemodChanges(project, renamed.changes);
			const deleted = deleteComposition({
				project: afterRename,
				compositionFile,
				compositionId: 'Renamed',
			});
			expect(getChangedContents(deleted, compositionFile)).toBe(
				imports +
					(expression.startsWith('enabled')
						? 'export const Root = () => enabled ? null : null;\n'
						: 'export const Root = () => null;\n'),
			);
		}
	}
});

test('updates computed and shorthand metadata while adding missing values without changing surrounding source', () => {
	const input = [
		'import { Composition } from "remotion"',
		'',
		'const preserve  =  { value : "keep" }',
		'export const Root = () => (',
		'    <Composition id={"Original"} width = { WIDTH } height>',
		'        {/* keep child */}',
		'        <Child />',
		'    </Composition>',
		')',
		'',
	].join('\r\n');
	const result = updateCompositionMetadata({
		project: {rootDir: '/', files: {[compositionFile]: input}},
		compositionFile,
		compositionId: 'Original',
		metadata: {durationInFrames: 240, fps: 60, width: 1920, height: 1080},
	});
	expect(getChangedContents(result, compositionFile)).toBe(
		input.replace(
			'{ WIDTH } height>',
			'{1920} height={1080} fps={60} durationInFrames={240}>',
		),
	);
});

test('adds missing composition metadata using multiline source style', () => {
	for (const [indent, eol] of [
		['\t', '\n'],
		['  ', '\n'],
		['    ', '\r\n'],
	]) {
		const input = [
			"import {Composition} from 'remotion';",
			'export const Root = () => (',
			`${indent}<Composition`,
			`${indent}${indent}id="Original"`,
			`${indent}/>`,
			')',
			'',
		].join(eol);
		const result = updateCompositionMetadata({
			project: {rootDir: '/', files: {[compositionFile]: input}},
			compositionFile,
			compositionId: 'Original',
			metadata: {durationInFrames: 90, fps: 30, width: 1920, height: 1080},
		});
		expect(getChangedContents(result, compositionFile)).toBe(
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
	}
});

test('updates an inline Still without adding timing props or reformatting its tag', () => {
	const input = `import {Still} from 'remotion';
const preserve  =  { value : "keep" };
export const Root=()=> <Still id={'Original'} height = "720"/>;
`;
	const result = updateCompositionMetadata({
		project: {rootDir: '/', files: {[compositionFile]: input}},
		compositionFile,
		compositionId: 'Original',
		metadata: {width: 1920, height: 1080},
	});
	expect(getChangedContents(result, compositionFile)).toBe(
		input.replace('height = "720"', 'height = {1080} width={1920}'),
	);
});

test('composition edits resolve named aliases and namespace imports without changing the original registration', () => {
	for (const [imports, originalTag, expectedTag] of [
		[
			"import {Composition as Comp, Still as Poster} from 'remotion';",
			'Comp',
			'Poster',
		],
		["import * as R from 'remotion';", 'R.Composition', 'Still'],
	]) {
		const original = `<${originalTag} id="Original" fps={30} durationInFrames={90}><Child /></${originalTag}>`;
		const input = `${imports}\nexport const Root = () => ${original};\n`;
		const project = {rootDir: '/', files: {[compositionFile]: input}};
		const copy = duplicateComposition({
			project,
			compositionFile,
			compositionId: 'Original',
			newId: 'Poster',
			tag: 'Still',
			metadata: {width: 500, height: 400},
		});
		const renamed = renameComposition({
			project: applyCodemodChanges(project, copy.changes),
			compositionFile,
			compositionId: 'Poster',
			newId: 'Renamed',
		});
		expect(getChangedContents(renamed, compositionFile)).toContain(original);
		expect(getChangedContents(renamed, compositionFile)).toContain(
			`<${expectedTag} id="Renamed" width={500} height={400}>`,
		);
		expect(getChangedContents(renamed, compositionFile)).toContain(
			`</${expectedTag}>`,
		);
	}
});
