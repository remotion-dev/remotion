import {expect, test} from 'bun:test';
import {
	addFolder,
	moveComposition,
	moveFolder,
	renameFolder,
	unwrapFolder,
} from '../index';

const compositionFile = 'Root.tsx';

const untouched = 'const untouched  =  { value : "keep" }; // preserve';

test('renames a folder without formatting the file', () => {
	const input = `import {Folder} from 'remotion';

${untouched}
export const Root = () => (
  <Folder name={'Old name'}>
    <div />
  </Folder>
);
`;
	const output = renameFolder({
		project: {rootDir: '/', files: {[compositionFile]: input}},
		compositionFile,
		folder: {name: 'Old name', parentName: null},
		newName: 'New name',
	}).project.files[compositionFile];

	expect(output).toBe(input.replace("'Old name'", "'New name'"));
});

test('creates top-level and nested folders without formatting the file', () => {
	const input = [
		'import {Composition} from "remotion"',
		'',
		untouched,
		'export const Root=()=>(',
		'  <>',
		'    <Folder name="Existing" />',
		'    <Composition id="Keep" />',
		'  </>',
		')',
		'',
	].join('\r\n');
	const topLevel = addFolder({
		project: {rootDir: '/', files: {[compositionFile]: input}},
		compositionFile,
		folder: {name: 'Top level', parentName: null},
	}).project.files[compositionFile];
	expect(topLevel).toBe(
		input
			.replace(
				'import {Composition} from "remotion"',
				'import {Composition, Folder} from "remotion"',
			)
			.replace(
				'    <Composition id="Keep" />\r\n  </>',
				'    <Composition id="Keep" />\r\n    <Folder name="Top level" />\r\n  </>',
			),
	);

	const nested = addFolder({
		project: {rootDir: '/', files: {[compositionFile]: topLevel}},
		compositionFile,
		folder: {name: 'Nested', parentName: 'Existing'},
	}).project.files[compositionFile];
	expect(nested).toBe(
		topLevel.replace(
			'    <Folder name="Existing" />',
			[
				'    <Folder name="Existing">',
				'      <Folder name="Nested" />',
				'    </Folder>',
			].join('\r\n'),
		),
	);
});

test('deletes a folder by unwrapping its source without formatting it', () => {
	const input = `import {Folder} from 'remotion';

${untouched}
export const Root = () => (
  <>
    <Folder name="Remove">
      {/* preserve this comment */}
      <Folder name="Nested">
        <div data-spacing = "keep" />
      </Folder>
    </Folder>
    <div />
  </>
);
`;
	const output = unwrapFolder({
		project: {rootDir: '/', files: {[compositionFile]: input}},
		compositionFile,
		folder: {name: 'Remove', parentName: null},
	}).project.files[compositionFile];

	expect(output).toBe(
		input.replace(
			`    <Folder name="Remove">
      {/* preserve this comment */}
      <Folder name="Nested">
        <div data-spacing = "keep" />
      </Folder>
    </Folder>
`,
			`    {/* preserve this comment */}
    <Folder name="Nested">
      <div data-spacing = "keep" />
    </Folder>
`,
		),
	);
});

test('moves a composition into a folder without formatting either node', () => {
	const input = `import {Composition, Folder} from 'remotion';

${untouched}
export const Root = () => {
  return (
    <>
      <Folder name="Target">
        {/* keep target */}
      </Folder>
      <Composition
        id="Move"
        component = {Video}
      />
    </>
  );
};
`;
	const output = moveComposition({
		project: {rootDir: '/', files: {[compositionFile]: input}},
		compositionFile,
		compositionId: 'Move',
		destination: {type: 'folder', folder: {name: 'Target', parentName: null}},
	}).project.files[compositionFile];

	expect(output).toBe(
		input
			.replace(
				`      <Composition
        id="Move"
        component = {Video}
      />
`,
				'',
			)
			.replace(
				'      </Folder>',
				`        <Composition
          id="Move"
          component = {Video}
        />
      </Folder>`,
			),
	);
});

test('moves a folder next to another item without formatting it', () => {
	const input = `import {Composition, Folder} from 'remotion';

${untouched}
export const Root = () => {
  return (
    <>
      <Folder name="Move">
        <Composition id="Nested" />
      </Folder>
      <Composition id="Middle" />
      <Folder name="Target" />
    </>
  );
};
`;
	const output = moveFolder({
		project: {rootDir: '/', files: {[compositionFile]: input}},
		compositionFile,
		folder: {name: 'Move', parentName: null},
		destination: {
			type: 'after',
			target: {type: 'folder', name: 'Target', parentName: null},
		},
	}).project.files[compositionFile];

	expect(output).toBe(
		input
			.replace(
				`      <Folder name="Move">
        <Composition id="Nested" />
      </Folder>
`,
				'',
			)
			.replace(
				'      <Folder name="Target" />',
				`      <Folder name="Target" />
      <Folder name="Move">
        <Composition id="Nested" />
      </Folder>`,
			),
	);
});

test('folder moves reject self, descendants, attribute targets, and standalone sources atomically', () => {
	const input = `import {Composition, Folder} from 'remotion';
export const Root = () => <>
  <Folder name="Parent"><Folder name="Child" /></Folder>
  <Wrapper content={<Folder name="Attribute" />} />
  <Composition id="Move" />
</>;
export const Standalone = () => <Composition id="Standalone" />;
`;
	const project = {rootDir: '/', files: {[compositionFile]: input}};
	for (const folder of [
		{name: 'Parent', parentName: null},
		{name: 'Child', parentName: 'Parent'},
	]) {
		expect(() =>
			moveFolder({
				project,
				compositionFile,
				folder: {name: 'Parent', parentName: null},
				destination: {type: 'folder', folder},
			}),
		).toThrow('inside itself');
	}

	expect(() =>
		moveComposition({
			project,
			compositionFile,
			compositionId: 'Move',
			destination: {
				type: 'folder',
				folder: {name: 'Attribute', parentName: null},
			},
		}),
	).toThrow('direct JSX child');
	expect(() =>
		moveComposition({
			project,
			compositionFile,
			compositionId: 'Standalone',
			destination: {type: 'folder', folder: {name: 'Parent', parentName: null}},
		}),
	).toThrow('direct JSX child');
	const moved = moveComposition({
		project,
		compositionFile,
		compositionId: 'Move',
		destination: {type: 'folder', folder: {name: 'Parent', parentName: null}},
	});
	expect(moved.project.files[compositionFile]).toContain(
		'<Folder name="Child" />\n    <Composition id="Move" />\n  </Folder>',
	);
	expect(project.files[compositionFile]).toBe(input);
});
