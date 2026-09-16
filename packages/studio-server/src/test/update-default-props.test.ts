import {expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {parseAst} from '../codemods/parse-ast';
import {
	getCompositionDefaultPropsLine,
	updateDefaultProps,
} from '../codemods/update-default-props';

test('updates default props without changing surrounding source', async () => {
	const file = readFileSync(
		path.join(__dirname, 'snapshots', 'root-before.tsx'),
		'utf-8',
	);
	const expected = readFileSync(
		path.join(__dirname, 'snapshots', 'root-after.tsx'),
		'utf-8',
	);

	const {output} = await updateDefaultProps({
		input: file,
		compositionId: 'Comp3',
		newDefaultProps: {abc: 'def', newDate: 'remotion-date:2022-01-02'},
		enumPaths: [],
	});

	expect(output).toBe(expected);
});

test('getCompositionDefaultPropsLine returns the opening tag line (ast-types visitor must traverse)', () => {
	const file = readFileSync(
		path.join(__dirname, 'snapshots', 'root-before.tsx'),
		'utf-8',
	);

	expect(
		getCompositionDefaultPropsLine({
			input: file,
			compositionId: 'Comp3',
		}),
	).toBe(27);
});

test('replaces multiline default props with a compact value', async () => {
	const file = readFileSync(
		path.join(__dirname, 'snapshots', 'problematic.tsx'),
		'utf-8',
	);
	const expected = readFileSync(
		path.join(__dirname, 'snapshots', 'fixed.tsx'),
		'utf-8',
	);

	const {output} = await updateDefaultProps({
		input: file,
		compositionId: 'schema-test',
		newDefaultProps: {abc: 'def', newDate: 'remotion-date:2022-01-02'},
		enumPaths: [],
	});

	expect(output).toBe(expected);
});

test('formats multiline default props without calling the compatibility formatter', async () => {
	const input = `import {Composition} from 'remotion'

const untouched    = {keep:"this spacing"}

export const Root=()=>(
	<Composition
		id='Comp'
		defaultProps={{old : "value"}}
	/>
)
`;
	let formatCalls = 0;

	const {output, formatted} = await updateDefaultProps({
		input,
		compositionId: 'Comp',
		newDefaultProps: {
			title: 'Hello',
			publishedAt: 'remotion-date:2026-07-29T00:00:00.000Z',
			audio: 'remotion-file:my%20folder/audio%20%231.wav',
			mode: 'fast',
		},
		enumPaths: [['mode']],
		formatInline: () => {
			formatCalls++;
			throw new Error('Prettier must not be called');
		},
	});

	expect(formatted).toBe(true);
	expect(formatCalls).toBe(0);
	expect(output).toBe(`import {Composition} from 'remotion'

const untouched    = {keep:"this spacing"}

export const Root=()=>(
	<Composition
		id='Comp'
		defaultProps={{
			title: 'Hello',
			publishedAt: new Date('2026-07-29T00:00:00.000Z'),
			audio: staticFile('my folder/audio #1.wav'),
			mode: 'fast' as const,
		}}
	/>
)
`);
});

test('preserves CRLF, spaces, double quotes, and bracket spacing', async () => {
	const input = [
		'import { Composition } from "remotion"',
		'',
		'const untouched    = {keep:"this spacing"}',
		'',
		'export const Root = () => (',
		'  <Composition',
		'    id="Comp"',
		'    defaultProps={{ old: "value" }}',
		'  />',
		')',
		'',
	].join('\r\n');

	const {output} = await updateDefaultProps({
		input,
		compositionId: 'Comp',
		newDefaultProps: {title: 'Hello'},
		enumPaths: [],
	});

	expect(output).toBe(
		input.replace(
			'defaultProps={{ old: "value" }}',
			'defaultProps={{ title: "Hello" }}',
		),
	);
});

test('formats nested arrays and keeps non-identifier keys quoted', async () => {
	const input = `export const Root = () => (
  <Composition id="Comp" defaultProps={{ old: true }} />
)
`;

	const {output} = await updateDefaultProps({
		input,
		compositionId: 'Comp',
		newDefaultProps: {
			items: [
				{mode: 'fast', label: 'hello'},
				{mode: 'slow', label: 'world'},
			],
			'dash-key': true,
		},
		enumPaths: [['items', '[]', 'mode']],
	});

	expect(output).toBe(`export const Root = () => (
  <Composition id="Comp" defaultProps={{
    items: [{
      mode: "fast" as const,
      label: "hello",
    }, {
      mode: "slow" as const,
      label: "world",
    }],
    "dash-key": true,
  }} />
)
`);
	expect(() => parseAst(output)).not.toThrow();
});
