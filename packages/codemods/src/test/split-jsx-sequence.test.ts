import {expect, test} from 'bun:test';
import * as recast from 'recast';
import {getNodePathForRecastPath} from '../sequence-props';
import {parseAst} from '../sequence-props/parse-ast';
import {splitJsxSequence, splitJsxSequences} from '../split-jsx-sequence';

test('splits fractional timing without persisting arithmetic noise', async () => {
	const input =
		'export const Comp = () => <Sequence from={0.1} durationInFrames={1.2} trimBefore={0.2} />;';
	const ast = parseAst(input);
	let nodePath = null;
	recast.types.visit(ast, {
		visitJSXOpeningElement(path) {
			nodePath = getNodePathForRecastPath(path, ast);
			return false;
		},
	});
	if (!nodePath) throw new Error('Could not find Sequence');
	const {output} = await splitJsxSequence({
		input,
		nodePath,
		sequenceKeys: ['from', 'durationInFrames', 'trimBefore'],
		splitFrame: 1,
	});
	expect(output).toContain('durationInFrames={0.9}');
	expect(output).toContain('durationInFrames={0.3}');
	expect(output).toContain('trimBefore={1.1}');
});

test('splits multiple sibling sequences from the same source snapshot', async () => {
	const input = `export const Comp = () => (
	<>
		<Sequence name="video" from={0} durationInFrames={50} />
		<Audio name="audio" from={10} durationInFrames={50} trimBefore={5} />
	</>
);`;
	const ast = parseAst(input);
	const nodePaths: Parameters<
		typeof splitJsxSequences
	>[0]['splits'][number]['nodePath'][] = [];
	recast.types.visit(ast, {
		visitJSXOpeningElement(path) {
			if (
				path.node.name.type === 'JSXIdentifier' &&
				(path.node.name.name === 'Sequence' || path.node.name.name === 'Audio')
			) {
				nodePaths.push(getNodePathForRecastPath(path, ast));
			}

			return this.traverse(path);
		},
	});
	const {output, nodePathRemappings} = await splitJsxSequences({
		input,
		splits: nodePaths.map((nodePath) => ({
			nodePath,
			sequenceKeys: ['from', 'durationInFrames', 'trimBefore'],
			splitFrame: 30,
		})),
	});

	expect(output).toContain(
		'<Sequence name="video" from={0} durationInFrames={30} />',
	);
	expect(output).toContain(
		'<Sequence name="video" from={30} durationInFrames={20} trimBefore={30} />',
	);
	expect(output).toContain(
		'<Audio name="audio" from={10} durationInFrames={20} trimBefore={5} />',
	);
	expect(output).toContain(
		'<Audio name="audio" from={30} durationInFrames={30} trimBefore={25} />',
	);
	expect(
		nodePathRemappings.filter((remapping) => remapping.oldNodePath === null),
	).toHaveLength(2);
});

test('splitting a sped-up sequence preserves its child clock across a fractional parent frame', async () => {
	const input =
		'export const Comp = () => <Sequence from={10} durationInFrames={50} trimBefore={5} playbackRate={2} />;';
	const ast = parseAst(input);
	let nodePath = null;
	recast.types.visit(ast, {
		visitJSXOpeningElement(path) {
			nodePath = getNodePathForRecastPath(path, ast);
			return false;
		},
	});
	if (!nodePath) throw new Error('Could not find Sequence');
	const {output} = await splitJsxSequence({
		input,
		nodePath,
		sequenceKeys: ['from', 'durationInFrames', 'trimBefore', 'playbackRate'],
		splitFrame: 22.5,
	});
	expect(output.replace(/\s+/g, ' ')).toContain(
		'from={10} durationInFrames={12.5} trimBefore={5} playbackRate={2}',
	);
	expect(output.replace(/\s+/g, ' ')).toContain(
		'from={22.5} durationInFrames={37.5} trimBefore={30} playbackRate={2}',
	);
});
