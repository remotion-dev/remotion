import {expect, test} from 'bun:test';
import {parseAndApplyCodemod} from '../parse-and-apply-codemod';
import {parseAst} from '../sequence-props/parse-ast';

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
	const output = parseAndApplyCodemod({
		input,
		codeMod: {
			type: 'rename-folder',
			folderName: 'Old name',
			parentName: null,
			newName: 'New name',
		},
	}).newContents;

	expect(output).toBe(input.replace("'Old name'", "'New name'"));
	parseAst(output);
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
	const topLevel = parseAndApplyCodemod({
		input,
		codeMod: {
			type: 'new-folder',
			folderName: 'Top level',
			parentName: null,
		},
	}).newContents;
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

	const nested = parseAndApplyCodemod({
		input: topLevel,
		codeMod: {
			type: 'new-folder',
			folderName: 'Nested',
			parentName: 'Existing',
		},
	}).newContents;
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
	parseAst(nested);
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
	const output = parseAndApplyCodemod({
		input,
		codeMod: {
			type: 'delete-folder',
			folderName: 'Remove',
			parentName: null,
		},
	}).newContents;

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
	parseAst(output);
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
	const output = parseAndApplyCodemod({
		input,
		codeMod: {
			type: 'move-composition-to-folder',
			idToMove: 'Move',
			folderName: 'Target',
			parentName: null,
		},
	}).newContents;

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
	parseAst(output);
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
	const output = parseAndApplyCodemod({
		input,
		codeMod: {
			type: 'move-composition-or-folder',
			source: {type: 'folder', folderName: 'Move', parentName: null},
			destination: {
				type: 'after',
				target: {type: 'folder', folderName: 'Target', parentName: null},
			},
		},
	}).newContents;

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
	parseAst(output);
});
