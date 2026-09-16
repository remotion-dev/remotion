import {expect, test} from 'bun:test';
import {applyVisualControl} from '../apply-visual-control';
import {parseAndApplyCodemod} from '../parse-and-apply-codemod';
import {parseAst} from '../sequence-props/parse-ast';

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
	const {changesMade, newContents} = applyVisualControl({
		input,
		transformation: {
			type: 'apply-visual-control',
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
		},
	});

	expect(changesMade).toEqual([
		{description: 'Applied visual control opacity'},
		{description: 'Applied visual control mode'},
		{description: 'Applied visual control optional'},
	]);
	expect(newContents).toBe(
		input
			.replace('OPACITY', '0.5')
			.replace('"slow"', "'fast' as const")
			.replace("'optional')", "'optional', undefined)"),
	);
	expect(() => parseAst(newContents)).not.toThrow();
});

test('formats object values using the existing source style', () => {
	const input = `const untouched    = {keep:"this spacing"}
const settings = visualControl("settings", { old: true })
`;
	const {newContents} = applyVisualControl({
		input,
		transformation: {
			type: 'apply-visual-control',
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
		},
	});

	expect(newContents).toBe(`const untouched    = {keep:"this spacing"}
const settings = visualControl("settings", { title: "Hello", "dash-key": true })
`);
	expect(() => parseAst(newContents)).not.toThrow();
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
	const {newContents} = applyVisualControl({
		input,
		transformation: {
			type: 'apply-visual-control',
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
		},
	});

	expect(newContents).toBe(
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
	expect(() => parseAst(newContents)).not.toThrow();
});

test('an outer visual control replacement supersedes nested controls', () => {
	const input =
		"const value = visualControl('outer', {nested: visualControl('inner', 1)});\n";
	const {changesMade, newContents} = applyVisualControl({
		input,
		transformation: {
			type: 'apply-visual-control',
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
		},
	});

	expect(changesMade).toEqual([{description: 'Applied visual control outer'}]);
	expect(newContents).toBe("const value = visualControl('outer', 2);\n");
});

test('rejects dynamic and unmatched visual control identifiers', () => {
	const dynamicIdentifier = `const value = visualControl(\`value-\${suffix}\`, 1);\n`;
	expect(() =>
		applyVisualControl({
			input: dynamicIdentifier,
			transformation: {
				type: 'apply-visual-control',
				changes: [
					{
						id: 'value',
						newValueSerialized: '2',
						newValueIsUndefined: false,
						enumPaths: [],
					},
				],
			},
		}),
	).toThrow('the string may not be dynamic');

	expect(() =>
		parseAndApplyCodemod({
			input: "const value = visualControl('other', 1);\n",
			codeMod: {
				type: 'apply-visual-control',
				changes: [
					{
						id: 'value',
						newValueSerialized: '2',
						newValueIsUndefined: false,
						enumPaths: [],
					},
				],
			},
		}),
	).toThrow('Unable to calculate the changes');
});
