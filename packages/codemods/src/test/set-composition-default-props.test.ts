import {expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {setCompositionDefaultProps} from '../index';
import {getChangedContents} from './get-changed-contents';

test('updates default props without changing surrounding source', () => {
	const input = readFileSync(
		path.join(__dirname, 'fixtures', 'root-before.tsx.txt'),
		'utf-8',
	);
	const expected = readFileSync(
		path.join(__dirname, 'fixtures', 'root-after.tsx.txt'),
		'utf-8',
	);

	const result = setCompositionDefaultProps({
		project: {rootDir: '/', files: {'Root.tsx': input}},
		compositionFile: 'Root.tsx',
		compositionId: 'Comp3',
		defaultProps: {abc: 'def', newDate: 'remotion-date:2022-01-02'},
		enumPaths: [],
	});

	expect(getChangedContents(result, 'Root.tsx')).toBe(expected);
	expect(result.logLine).toBe(27);
});

test('replaces multiline default props with a compact value', () => {
	const input =
		"import {Composition} from 'remotion';\n" +
		readFileSync(
			path.join(__dirname, 'fixtures', 'problematic.tsx.txt'),
			'utf-8',
		);
	const expected =
		"import {Composition} from 'remotion';\n" +
		readFileSync(path.join(__dirname, 'fixtures', 'fixed.tsx.txt'), 'utf-8');

	const result = setCompositionDefaultProps({
		project: {rootDir: '/', files: {'Root.tsx': input}},
		compositionFile: 'Root.tsx',
		compositionId: 'schema-test',
		defaultProps: {abc: 'def', newDate: 'remotion-date:2022-01-02'},
		enumPaths: [],
	});

	expect(getChangedContents(result, 'Root.tsx')).toBe(expected);
});

test('formats multiline default props without Prettier', () => {
	const input = `import {Composition} from 'remotion'

const untouched    = {keep:"this spacing"}

export const Root=()=>(
	<Composition
		id='Comp'
		defaultProps={{old : "value"}}
	/>
)
`;
	const result = setCompositionDefaultProps({
		project: {rootDir: '/', files: {'Root.tsx': input}},
		compositionFile: 'Root.tsx',
		compositionId: 'Comp',
		defaultProps: {
			title: 'Hello',
			publishedAt: 'remotion-date:2026-07-29T00:00:00.000Z',
			audio: 'remotion-file:my%20folder/audio%20%231.wav',
			mode: 'fast',
		},
		enumPaths: [['mode']],
	});

	expect(getChangedContents(result, 'Root.tsx'))
		.toBe(`import {Composition} from 'remotion'

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

test('preserves CRLF, spaces, double quotes, and bracket spacing', () => {
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

	const result = setCompositionDefaultProps({
		project: {rootDir: '/', files: {'Root.tsx': input}},
		compositionFile: 'Root.tsx',
		compositionId: 'Comp',
		defaultProps: {title: 'Hello'},
		enumPaths: [],
	});

	expect(getChangedContents(result, 'Root.tsx')).toBe(
		input.replace(
			'defaultProps={{ old: "value" }}',
			'defaultProps={{ title: "Hello" }}',
		),
	);
});

test('formats nested arrays and keeps non-identifier keys quoted', () => {
	const input = `import {Composition} from "remotion";
export const Root = () => (
  <Composition id="Comp" defaultProps={{ old: true }} />
)
`;

	const result = setCompositionDefaultProps({
		project: {rootDir: '/', files: {'Root.tsx': input}},
		compositionFile: 'Root.tsx',
		compositionId: 'Comp',
		defaultProps: {
			items: [
				{mode: 'fast', label: 'hello'},
				{mode: 'slow', label: 'world'},
			],
			'dash-key': true,
		},
		enumPaths: [['items', '[]', 'mode']],
	});

	expect(getChangedContents(result, 'Root.tsx'))
		.toBe(`import {Composition} from "remotion";
export const Root = () => (
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
});
