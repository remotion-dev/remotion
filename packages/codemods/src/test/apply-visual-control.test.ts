import {expect, test} from 'bun:test';
import {updateVisualControls} from '../index';

test('updates visual controls without changing surrounding source', () => {
	const input = [
		"import {visualControl} from '@remotion/studio'",
		'',
		'const untouched  =  { value : "keep" }',
		"const opacity=visualControl('opacity', OPACITY)",
		'const mode = visualControl(`mode`, "slow")',
		"const optional = visualControl('optional')",
		'',
	].join('\r\n');
	const {project, updatedControls} = updateVisualControls({
		project: {rootDir: '/', files: {'Root.tsx': input}},
		filePath: 'Root.tsx',
		changes: [
			{
				id: 'opacity',
				newValueSerialized: '0.5',
				newValueIsUndefined: false,
				enumPaths: [],
			},
			{
				id: 'mode',
				newValueSerialized: '"fast"',
				newValueIsUndefined: false,
				enumPaths: [[]],
			},
			{
				id: 'optional',
				newValueSerialized: '',
				newValueIsUndefined: true,
				enumPaths: [],
			},
		],
	});

	expect(updatedControls).toEqual([
		{id: 'opacity', line: 4},
		{id: 'mode', line: 5},
		{id: 'optional', line: 6},
	]);
	expect(project.files['Root.tsx']).toBe(
		input
			.replace('OPACITY', '0.5')
			.replace('"slow"', "'fast' as const")
			.replace("'optional')", "'optional', undefined)"),
	);
});

test('formats object values using the existing source style', () => {
	const input = `const untouched    = {keep:"this spacing"}
const settings = visualControl("settings", { old: true })
`;
	const {project} = updateVisualControls({
		project: {rootDir: '/', files: {'Root.tsx': input}},
		filePath: 'Root.tsx',
		changes: [
			{
				id: 'settings',
				newValueSerialized: JSON.stringify({
					title: 'Hello',
					'dash-key': true,
				}),
				newValueIsUndefined: false,
				enumPaths: [],
			},
		],
	});

	expect(project.files['Root.tsx'])
		.toBe(`const untouched    = {keep:"this spacing"}
const settings = visualControl("settings", { title: "Hello", "dash-key": true })
`);
});

test('wraps long visual-control values using CRLF and tab indentation', () => {
	const input = [
		'import {visualControl} from "@remotion/studio"',
		'',
		'export const value = visualControl(',
		'\t"settings",',
		'\t{ old: true },',
		')',
		'',
	].join('\r\n');
	const {project} = updateVisualControls({
		project: {rootDir: '/', files: {'Root.tsx': input}},
		filePath: 'Root.tsx',
		changes: [
			{
				id: 'settings',
				newValueSerialized: JSON.stringify({
					title:
						'A long visual control title that requires wrapping across multiple lines',
					'dash-key': true,
					items: [1, 2, 3],
				}),
				newValueIsUndefined: false,
				enumPaths: [],
			},
		],
	});

	expect(project.files['Root.tsx']).toBe(
		[
			'import {visualControl} from "@remotion/studio"',
			'',
			'export const value = visualControl(',
			'\t"settings",',
			'\t{',
			'\t\ttitle: "A long visual control title that requires wrapping across multiple lines",',
			'\t\t"dash-key": true,',
			'\t\titems: [1, 2, 3],',
			'\t},',
			')',
			'',
		].join('\r\n'),
	);
});

test('an outer visual control replacement supersedes nested controls', () => {
	const input =
		"const value = visualControl('outer', {nested: visualControl('inner', 1)});\n";
	const {project, updatedControls} = updateVisualControls({
		project: {rootDir: '/', files: {'Root.tsx': input}},
		filePath: 'Root.tsx',
		changes: [
			{
				id: 'outer',
				newValueSerialized: '2',
				newValueIsUndefined: false,
				enumPaths: [],
			},
			{
				id: 'inner',
				newValueSerialized: '3',
				newValueIsUndefined: false,
				enumPaths: [],
			},
		],
	});

	expect(updatedControls).toEqual([{id: 'outer', line: 1}]);
	expect(project.files['Root.tsx']).toBe(
		"const value = visualControl('outer', 2);\n",
	);
});

test('rejects dynamic identifiers and leaves unmatched visual controls unchanged', () => {
	const dynamicIdentifier = `const value = visualControl(\`value-\${suffix}\`, 1);\n`;
	expect(() =>
		updateVisualControls({
			project: {rootDir: '/', files: {'Root.tsx': dynamicIdentifier}},
			filePath: 'Root.tsx',
			changes: [
				{
					id: 'value',
					newValueSerialized: '2',
					newValueIsUndefined: false,
					enumPaths: [],
				},
			],
		}),
	).toThrow('the string may not be dynamic');

	const unchanged = updateVisualControls({
		project: {
			rootDir: '/',
			files: {'Root.tsx': "const value = visualControl('other', 1);\n"},
		},
		filePath: 'Root.tsx',
		changes: [
			{
				id: 'value',
				newValueSerialized: '2',
				newValueIsUndefined: false,
				enumPaths: [],
			},
		],
	});
	expect(unchanged.changes).toEqual([]);
	expect(unchanged.updatedControls).toEqual([]);
	expect(unchanged.project.files['Root.tsx']).toBe(
		"const value = visualControl('other', 1);\n",
	);
});
