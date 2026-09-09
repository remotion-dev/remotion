import {expect, test} from 'bun:test';
import * as recast from 'recast';
import {NoReactInternals} from 'remotion/no-react';
import {getNodePathForRecastPath} from '../sequence-props';
import {parseAst} from '../sequence-props/parse-ast';
import {updateMultipleSequenceProps} from '../update-sequence-props';

test('patches an opening element without reprinting its siblings', () => {
	const input = `export const Example = () => {
	return (
		<div>
			<Interactive.Div name="First" />
			<Interactive.Div name="Second" />
			<Interactive.Div name="Third" />
		</div>
	);
};
`;
	const ast = parseAst(input);
	let nodePath = null;
	recast.types.visit(ast, {
		visitJSXOpeningElement(path) {
			if (path.node.loc?.start.line === 5) {
				nodePath = getNodePathForRecastPath(path, ast);
				return false;
			}

			return this.traverse(path);
		},
	});
	if (!nodePath) {
		throw new Error('Could not find the second Interactive.Div');
	}

	const {output} = updateMultipleSequenceProps({
		input,
		changes: [
			{
				nodePath,
				updates: [{key: 'hidden', value: true, defaultValue: false}],
				schema: NoReactInternals.sequenceSchema,
				videoConfigValues: null,
			},
		],
	});

	expect(output).toBe(`export const Example = () => {
	return (
		<div>
			<Interactive.Div name="First" />
			<Interactive.Div name="Second" hidden />
			<Interactive.Div name="Third" />
		</div>
	);
};
`);
});

test('preserves multiplication by a numeric constant', () => {
	const input = `import {Sequence} from 'remotion';

const fps = 30;

export const ShortAudioLoop = () => {
	return <Sequence from={-8 * fps} layout="none" />;
};
`;
	const ast = parseAst(input);
	let nodePath = null;
	recast.types.visit(ast, {
		visitJSXOpeningElement(path) {
			if (path.node.loc?.start.line === 6) {
				nodePath = getNodePathForRecastPath(path, ast);
				return false;
			}

			return this.traverse(path);
		},
	});
	if (!nodePath) {
		throw new Error('Could not find the Sequence');
	}

	const {output} = updateMultipleSequenceProps({
		input,
		changes: [
			{
				nodePath,
				updates: [{key: 'from', value: -300, defaultValue: null}],
				schema: NoReactInternals.sequenceSchema,
				videoConfigValues: null,
			},
		],
	});

	expect(output).toContain('from={-10 * fps}');
});

test('saves exact values when preserving config arithmetic would change them', () => {
	for (const [expression, value] of [
		['4 * fps', 123],
		['fps * 4', 123],
		['durationInFrames - 1', 0.1],
	] as const) {
		const input = `import {Sequence} from "remotion"; const fps = 30; const durationInFrames = 10; export const Comp = () => <Sequence from={${expression}} />;`;
		const ast = parseAst(input);
		let nodePath = null;
		recast.types.visit(ast, {
			visitJSXOpeningElement(path) {
				nodePath = getNodePathForRecastPath(path, ast);
				return false;
			},
		});
		if (!nodePath) throw new Error('Could not find Sequence');
		const {output} = updateMultipleSequenceProps({
			input,
			changes: [
				{
					nodePath,
					updates: [{key: 'from', value, defaultValue: null}],
					schema: NoReactInternals.sequenceSchema,
					videoConfigValues: null,
				},
			],
		});
		expect(output).toContain(`from={${value}}`);
	}
});
