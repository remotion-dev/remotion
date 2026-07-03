import {expect, test} from 'bun:test';
import {NoReactInternals} from 'remotion/no-react';
import {updateSequenceProps} from '../codemods/update-sequence-props/update-sequence-props';
import {lineColumnToNodePath} from './test-utils';

const nestedInput = `import React from 'react';
import {AbsoluteFill} from 'remotion';

export const Example: React.FC = () => {
	return (
		<AbsoluteFill>
			<div style={{opacity: 0.5, scale: 2}} />
			<div />
		</AbsoluteFill>
	);
};
`;

test('updateSequenceProps should update a nested style property', async () => {
	const {output, oldValueStrings} = await updateSequenceProps({
		input: nestedInput,
		nodePath: lineColumnToNodePath(nestedInput, 7),
		updates: [{key: 'style.opacity', value: 0.8, defaultValue: null}],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});
	const oldValueString = oldValueStrings[0];

	expect(oldValueString).toBe('0.5');
	expect(output).toContain('opacity: 0.8');
	expect(output).toContain('scale: 2');
});

test('updateSequenceProps should add a nested property to existing object', async () => {
	const {output, oldValueStrings} = await updateSequenceProps({
		input: nestedInput,
		nodePath: lineColumnToNodePath(nestedInput, 7),
		updates: [{key: 'style.rotate', value: 45, defaultValue: null}],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});
	const oldValueString = oldValueStrings[0];

	expect(oldValueString).toBe('');
	expect(output).toContain('rotate: 45');
	// Existing properties should be preserved
	expect(output).toContain('opacity: 0.5');
	expect(output).toContain('scale: 2');
});

test('updateSequenceProps should create style attribute when it does not exist', async () => {
	const {output, oldValueStrings} = await updateSequenceProps({
		input: nestedInput,
		nodePath: lineColumnToNodePath(nestedInput, 8),
		updates: [{key: 'style.opacity', value: 0.3, defaultValue: null}],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});
	const oldValueString = oldValueStrings[0];

	expect(oldValueString).toBe('');
	expect(output).toContain('style={{');
	expect(output).toContain('opacity: 0.3');
});

test('updateSequenceProps should remove nested property when value equals default', async () => {
	const {output, oldValueStrings} = await updateSequenceProps({
		input: nestedInput,
		nodePath: lineColumnToNodePath(nestedInput, 7),
		updates: [{key: 'style.opacity', value: 1, defaultValue: 1}],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});
	const oldValueString = oldValueStrings[0];

	expect(oldValueString).toBe('0.5');
	expect(output).not.toContain('opacity');
	// Other properties should remain
	expect(output).toContain('scale: 2');
});

test('updateSequenceProps should remove entire style attribute when object becomes empty', async () => {
	// First remove scale, leaving only opacity
	const singlePropInput = `import React from 'react';

export const Example: React.FC = () => {
	return <div style={{opacity: 0.5}} />;
};
`;

	const {output, oldValueStrings} = await updateSequenceProps({
		input: singlePropInput,
		nodePath: lineColumnToNodePath(singlePropInput, 4),
		updates: [{key: 'style.opacity', value: 1, defaultValue: 1}],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});
	const oldValueString = oldValueStrings[0];

	expect(oldValueString).toBe('0.5');
	expect(output).not.toContain('style');
});

test('updateSequenceProps should report default as oldValueString for missing nested property', async () => {
	const {oldValueStrings} = await updateSequenceProps({
		input: nestedInput,
		nodePath: lineColumnToNodePath(nestedInput, 8),
		updates: [{key: 'style.opacity', value: 0.5, defaultValue: 1}],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});
	const oldValueString = oldValueStrings[0];

	expect(oldValueString).toBe('1');
});

test('updateSequenceProps should insert Google Font source loading code', async () => {
	const {output, oldValueStrings} = await updateSequenceProps({
		input: nestedInput,
		nodePath: lineColumnToNodePath(nestedInput, 7),
		updates: [
			{
				key: 'style.fontFamily',
				value: 'Roboto',
				defaultValue: null,
				googleFont: {
					fontFamily: 'Roboto',
					importName: 'Roboto',
					style: 'normal',
					weights: ['400', '700', '800'],
					subsets: ['latin'],
				},
			},
		],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});

	expect(oldValueStrings[0]).toBe('');
	expect(output).toContain(
		"import {loadFont as loadRoboto} from '@remotion/google-fonts/Roboto';",
	);
	expect(output).toContain("loadRoboto('normal', {");
	expect(output).toContain("weights: ['400', '700', '800']");
	expect(output).toContain("subsets: ['latin']");
	expect(output).toContain("fontFamily: 'Roboto'");
});

test('updateSequenceProps should add a separate import if Google Font namespace import exists', async () => {
	const input = `import React from 'react';
import {AbsoluteFill} from 'remotion';
import * as Roboto from '@remotion/google-fonts/Roboto';

export const Example: React.FC = () => {
	return (
		<AbsoluteFill>
			<div />
		</AbsoluteFill>
	);
};
`;
	const {output} = await updateSequenceProps({
		input,
		nodePath: lineColumnToNodePath(input, 8),
		updates: [
			{
				key: 'style.fontFamily',
				value: 'Roboto',
				defaultValue: null,
				googleFont: {
					fontFamily: 'Roboto',
					importName: 'Roboto',
					style: 'normal',
					weights: ['400', '700', '800'],
					subsets: ['latin'],
				},
			},
		],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});

	expect(output).toContain(
		"import * as Roboto from '@remotion/google-fonts/Roboto';",
	);
	expect(output).toContain(
		"import {loadFont as loadRoboto} from '@remotion/google-fonts/Roboto';",
	);
	expect(output).toContain("loadRoboto('normal', {");
});

test('updateSequenceProps should reuse existing Google Font import and call', async () => {
	const input = `import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Roboto';

loadFont('normal', {
	weights: ['400', '700', '800'],
	subsets: ['latin'],
});

export const Example: React.FC = () => {
	return (
		<AbsoluteFill>
			<div />
		</AbsoluteFill>
	);
};
`;
	const {output} = await updateSequenceProps({
		input,
		nodePath: lineColumnToNodePath(input, 12),
		updates: [
			{
				key: 'style.fontFamily',
				value: 'Roboto',
				defaultValue: null,
				googleFont: {
					fontFamily: 'Roboto',
					importName: 'Roboto',
					style: 'normal',
					weights: ['400', '700', '800'],
					subsets: ['latin'],
				},
			},
		],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});

	expect(output.match(/from '@remotion\/google-fonts\/Roboto'/g)?.length).toBe(
		1,
	);
	expect(output.match(/loadFont\('normal'/g)?.length).toBe(1);
	expect(output).toContain("fontFamily: 'Roboto'");
});

test('updateSequenceProps should insert matching load call if existing call has different arguments', async () => {
	const input = `import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Roboto';

loadFont('italic', {
	weights: ['400'],
	subsets: ['latin'],
});

export const Example: React.FC = () => {
	return (
		<AbsoluteFill>
			<div />
		</AbsoluteFill>
	);
};
`;
	const {output} = await updateSequenceProps({
		input,
		nodePath: lineColumnToNodePath(input, 13),
		updates: [
			{
				key: 'style.fontFamily',
				value: 'Roboto',
				defaultValue: null,
				googleFont: {
					fontFamily: 'Roboto',
					importName: 'Roboto',
					style: 'normal',
					weights: ['400', '700', '800'],
					subsets: ['latin'],
				},
			},
		],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});

	expect(output.match(/loadFont\('/g)?.length).toBe(2);
	expect(output).toContain("loadFont('italic', {");
	expect(output).toContain("loadFont('normal', {");
	expect(output).toContain("weights: ['400', '700', '800']");
});

test('updateSequenceProps should keep node paths stable after inserting Google Font loading code', async () => {
	const nodePath = lineColumnToNodePath(nestedInput, 7);
	const first = await updateSequenceProps({
		input: nestedInput,
		nodePath,
		updates: [
			{
				key: 'style.fontFamily',
				value: 'Roboto',
				defaultValue: null,
				googleFont: {
					fontFamily: 'Roboto',
					importName: 'Roboto',
					style: 'normal',
					weights: ['400', '700', '800'],
					subsets: ['latin'],
				},
			},
		],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});

	const second = await updateSequenceProps({
		input: first.output,
		nodePath,
		updates: [
			{
				key: 'style.fontFamily',
				value: 'Ubuntu',
				defaultValue: null,
				googleFont: {
					fontFamily: 'Ubuntu',
					importName: 'Ubuntu',
					style: 'normal',
					weights: ['400', '700'],
					subsets: ['latin'],
				},
			},
		],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});

	expect(second.oldValueStrings[0]).toBe("'Roboto'");
	expect(second.output).toContain("fontFamily: 'Ubuntu'");
	expect(second.output).toContain(
		"import {loadFont as loadUbuntu} from '@remotion/google-fonts/Ubuntu';",
	);
	expect(second.output).not.toContain('@remotion/google-fonts/Roboto');
	expect(second.output).not.toContain('loadRoboto(');
});

test('updateSequenceProps should clear a nested prop with an undefined default', async () => {
	const input = `import React from 'react';
import {AbsoluteFill} from 'remotion';

export const Example: React.FC = () => {
	return (
		<AbsoluteFill>
			<div style={{fontFamily: 'Roboto', color: 'red'}} />
		</AbsoluteFill>
	);
};
`;

	const {output, oldValueStrings} = await updateSequenceProps({
		input,
		nodePath: lineColumnToNodePath(input, 7),
		updates: [
			{
				key: 'style.fontFamily',
				value: undefined,
				defaultValue: null,
			},
		],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});

	expect(oldValueStrings[0]).toBe("'Roboto'");
	expect(output).not.toContain('fontFamily');
	expect(output).toContain("color: 'red'");
});

test('updateSequenceProps should preserve user-authored Google Font loading code when usage is dynamic', async () => {
	const input = `import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFont as loadRoboto} from '@remotion/google-fonts/Roboto';

loadRoboto('normal', {
	weights: ['400', '700', '800'],
	subsets: ['latin'],
});

const titleFont = 'Roboto';
const titleStyle: React.CSSProperties = {
	fontFamily: titleFont,
};

export const Example: React.FC = () => {
	return (
		<AbsoluteFill>
			<div style={titleStyle} />
			<div style={{fontFamily: 'Roboto'}} />
		</AbsoluteFill>
	);
};
`;

	const {output} = await updateSequenceProps({
		input,
		nodePath: lineColumnToNodePath(input, 18),
		updates: [
			{
				key: 'style.fontFamily',
				value: 'Ubuntu',
				defaultValue: null,
				googleFont: {
					fontFamily: 'Ubuntu',
					importName: 'Ubuntu',
					style: 'normal',
					weights: ['400', '700'],
					subsets: ['latin'],
				},
			},
		],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});

	expect(output).toContain('@remotion/google-fonts/Roboto');
	expect(output).toContain('loadRoboto(');
	expect(output).toContain('style={titleStyle}');
	expect(output).toContain('@remotion/google-fonts/Ubuntu');
	expect(output).toContain('loadUbuntu(');
});

test('updateSequenceProps should keep Google Font loading code if the font is still used', async () => {
	const input = `import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFont as loadRoboto} from '@remotion/google-fonts/Roboto';

loadRoboto('normal', {
	weights: ['400', '700', '800'],
	subsets: ['latin'],
});

export const Example: React.FC = () => {
	return (
		<AbsoluteFill>
			<div style={{fontFamily: 'Roboto'}} />
			<div style={{fontFamily: 'Roboto'}} />
		</AbsoluteFill>
	);
};
`;

	const {output} = await updateSequenceProps({
		input,
		nodePath: lineColumnToNodePath(input, 14),
		updates: [
			{
				key: 'style.fontFamily',
				value: 'Ubuntu',
				defaultValue: null,
				googleFont: {
					fontFamily: 'Ubuntu',
					importName: 'Ubuntu',
					style: 'normal',
					weights: ['400', '700'],
					subsets: ['latin'],
				},
			},
		],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});

	expect(output).toContain('@remotion/google-fonts/Roboto');
	expect(output).toContain('loadRoboto(');
	expect(output).toContain('@remotion/google-fonts/Ubuntu');
	expect(output).toContain('loadUbuntu(');
});

test('updateSequenceProps should avoid Google Font import alias collisions', async () => {
	const input = `import React from 'react';
import {AbsoluteFill} from 'remotion';

const loadRoboto = () => null;

export const Example: React.FC = () => {
	return (
		<AbsoluteFill>
			<div />
		</AbsoluteFill>
	);
};
`;
	const {output} = await updateSequenceProps({
		input,
		nodePath: lineColumnToNodePath(input, 9),
		updates: [
			{
				key: 'style.fontFamily',
				value: 'Roboto',
				defaultValue: null,
				googleFont: {
					fontFamily: 'Roboto',
					importName: 'Roboto',
					style: 'normal',
					weights: ['400', '700', '800'],
					subsets: ['latin'],
				},
			},
		],
		schema: NoReactInternals.sequenceSchema,
		prettierConfigOverride: null,
	});

	expect(output).toContain(
		"import {loadFont as loadRoboto2} from '@remotion/google-fonts/Roboto';",
	);
	expect(output).toContain("loadRoboto2('normal', {");
	expect(output).toContain('const loadRoboto = () => null;');
});
