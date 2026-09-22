import {expect, test} from 'bun:test';
import {
	addComposition,
	moveComposition,
	moveFolder,
	renameFolder,
	unwrapFolder,
} from '../index';

const compositionFile = 'src/Root.tsx';

test('resolves same-named nested folders by parent throughout registration edits', () => {
	const input = `import {Composition, Folder} from 'remotion';
export const Root = () => (
  <>
    <Folder name="Parent">
      <Folder name="Shared">
        <Composition id="NestedA" component={Video} />
      </Folder>
    </Folder>
    <Folder name="Other">
      <Folder name="Shared">
        <Composition id="NestedB" component={Video} />
      </Folder>
    </Folder>
  </>
);
`;
	const original = {rootDir: '/', files: {[compositionFile]: input}};
	expect(() =>
		moveFolder({
			project: original,
			compositionFile,
			folder: {name: 'Shared', parentName: 'Parent'},
			destination: {
				type: 'folder',
				folder: {name: 'Other', parentName: null},
			},
		}),
	).toThrow('A folder named "Shared" already exists in the destination');

	let {project} = addComposition({
		project: original,
		compositionFile,
		compositionId: 'Fresh',
		component: {importName: 'Fresh', importPath: './Fresh'},
		metadata: {durationInFrames: 90, fps: 30, width: 1920, height: 1080},
		folder: {name: 'Shared', parentName: 'Other'},
	});
	const added = project.files[compositionFile];
	expect(added).toContain(`    <Folder name="Other">
      <Folder name="Shared">
        <Composition id="NestedB" component={Video} />
        <Composition
          id="Fresh"`);

	project = renameFolder({
		project,
		compositionFile,
		folder: {name: 'Shared', parentName: 'Parent'},
		newName: 'Renamed',
	}).project;
	expect(project.files[compositionFile]).toBe(
		added.replace('<Folder name="Shared">', '<Folder name="Renamed">'),
	);
	project = unwrapFolder({
		project,
		compositionFile,
		folder: {name: 'Renamed', parentName: 'Parent'},
	}).project;
	expect(project.files[compositionFile]).toContain(`    <Folder name="Parent">
      <Composition id="NestedA" component={Video} />
    </Folder>`);
	expect(
		project.files[compositionFile].slice(
			project.files[compositionFile].indexOf('<Folder name="Other">'),
		),
	).toBe(added.slice(added.indexOf('<Folder name="Other">')));
	expect(original.files[compositionFile]).toBe(input);
});

test('moves a composition to its registration root after an unrelated JSX component', () => {
	const helper = 'const Component = () => {return <><div>Content</div></>;};';
	const input = `import {Composition, Folder} from 'remotion';
${helper}
export const Root = () => {
  return (
    <>
      <Folder name="Parent">
        <Composition id="Nested" component={Component} />
      </Folder>
    </>
  );
};
`;
	const {project} = moveComposition({
		project: {rootDir: '/', files: {[compositionFile]: input}},
		compositionFile,
		compositionId: 'Nested',
		destination: {type: 'root'},
	});
	expect(project.files[compositionFile]).toBe(
		input
			.replace(
				'        <Composition id="Nested" component={Component} />\n',
				'',
			)
			.replace(
				'      </Folder>',
				'      </Folder>\n      <Composition id="Nested" component={Component} />',
			),
	);
});
