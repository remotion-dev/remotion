import {expect, test} from 'bun:test';
import * as recast from 'recast';
import {getNodePathForRecastPath} from '../sequence-props';
import {parseAst} from '../sequence-props/parse-ast';
import {splitJsxSequence, splitJsxSequences} from '../split-jsx-sequence';
import {
	lineColumnToNodePath,
	lineContainingToNodePath,
} from './node-path-test-utils';

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

const wrap = (
	sequence: string,
) => `import {AbsoluteFill, Img, Interactive, Sequence, Series, Solid} from 'remotion';
import {Gif} from '@remotion/gif';

export const Comp = () => {
	return (
		<>
			${sequence}
		</>
	);
};
`;

const sequenceLine = 7;
const sequenceTimingKeys = ['from', 'durationInFrames', 'trimBefore'];

const split = async (
	sequence: string,
	splitFrame: number,
	sequenceKeys = sequenceTimingKeys,
) => {
	const input = wrap(sequence);
	const {output} = await splitJsxSequence({
		input,
		nodePath: lineColumnToNodePath(input, sequenceLine),
		sequenceKeys,
		splitFrame,
	});

	return output;
};

test('splitJsxSequence splits a sequence with no duration', async () => {
	const output = await split('<Sequence from={0} />', 30);

	expect(output).toContain('<Sequence from={0} durationInFrames={30} />');
	expect(output).toContain('<Sequence from={30} trimBefore={30} />');
});

test('splitJsxSequence remaps following JSX siblings', async () => {
	const input = wrap(
		'<Sequence name="split" from={0} durationInFrames={50} />\n\t\t\t<Sequence name="following" />',
	);
	const {output, nodePathRemappings} = await splitJsxSequence({
		input,
		nodePath: lineContainingToNodePath(input, 'name="split"'),
		sequenceKeys: sequenceTimingKeys,
		splitFrame: 30,
	});

	expect(nodePathRemappings).toEqual([
		{
			oldNodePath: lineContainingToNodePath(input, 'name="split"'),
			newNodePath: lineContainingToNodePath(output, 'name="split"'),
		},
		{
			oldNodePath: lineContainingToNodePath(input, 'name="following"'),
			newNodePath: lineContainingToNodePath(output, 'name="following"'),
		},
		{
			oldNodePath: null,
			newNodePath: lineContainingToNodePath(output, 'from={30}'),
		},
	]);
});

test('splitJsxSequence omits right Infinity duration', async () => {
	const output = await split(
		'<Sequence from={0} durationInFrames={Infinity} />',
		30,
	);

	expect(output).toContain('<Sequence from={0} durationInFrames={30} />');
	expect(output).toContain('<Sequence from={30} trimBefore={30} />');
	expect(output).not.toContain('durationInFrames={Infinity}');
});

test('splitJsxSequence keeps missing left from omitted', async () => {
	const output = await split('<Sequence durationInFrames={50} />', 30);

	expect(output).toContain('<Sequence durationInFrames={30} />');
	expect(output).toContain(
		'<Sequence from={30} durationInFrames={20} trimBefore={30} />',
	);
});

test('splitJsxSequence splits finite duration and trimBefore', async () => {
	const output = await split(
		'<Sequence from={10} durationInFrames={50} trimBefore={5} />',
		30,
	);

	expect(output).toContain(
		'<Sequence from={10} durationInFrames={20} trimBefore={5} />',
	);
	expect(output).toContain(
		'<Sequence from={30} durationInFrames={30} trimBefore={25} />',
	);
});

test('splitJsxSequence preserves surrounding formatting without calling Prettier', async () => {
	const input = `const deliberatelyUnformatted = {value : true}

export const Comp = () => {
  return (
    <>
      <Sequence
        name="clip"
        from={0}
        durationInFrames={50}
      >
        <div>Child</div>
      </Sequence>
      <Keep prop = {1}/>
    </>
  )
}
`;
	const {output} = await splitJsxSequence({
		input,
		nodePath: lineContainingToNodePath(input, '<Sequence'),
		sequenceKeys: sequenceTimingKeys,
		splitFrame: 30,
	});

	expect(output).toStartWith(
		'const deliberatelyUnformatted = {value : true}\n',
	);
	expect(output).toContain(
		'<Sequence name="clip" from={0} durationInFrames={30}>\n',
	);
	expect(output).toContain(
		'<Sequence name="clip" from={30} durationInFrames={20} trimBefore={30}>\n',
	);
	expect(output).toContain('      <Keep prop = {1}/>');
	expect(output).toEndWith('  )\n}\n');
});

test('splitJsxSequence formats a split component root as a fragment', async () => {
	const input = `export const Comp = () => <Sequence from={0} durationInFrames={50}><span>Hi</span></Sequence>;

const keep = { value : true }
`;
	const {output} = await splitJsxSequence({
		input,
		nodePath: lineContainingToNodePath(input, '<Sequence'),
		sequenceKeys: sequenceTimingKeys,
		splitFrame: 30,
	});

	expect(output).toBe(`export const Comp = () => <>
  <Sequence from={0} durationInFrames={30}>
    <span>Hi</span>
  </Sequence>
  <Sequence from={30} durationInFrames={20} trimBefore={30}>
    <span>Hi</span>
  </Sequence>
</>;

const keep = { value : true }
`);
});

test('splitJsxSequence splits a video with a negative from', async () => {
	const output = await split(
		'<Video src="video.mov" from={-2644} trimBefore={272} />',
		100,
	);

	expect(output).toContain('from={-2644}');
	expect(output).toContain('durationInFrames={2744}');
	expect(output).toContain('trimBefore={272}');
	expect(output).toContain(
		'<Video src="video.mov" from={100} trimBefore={3016} />',
	);
});

test('splitJsxSequence splits from-only sequence', async () => {
	const output = await split('<Sequence from={10} />', 30);

	expect(output).toContain('<Sequence from={10} durationInFrames={20} />');
	expect(output).toContain('<Sequence from={30} trimBefore={20} />');
});

test('splitJsxSequence splits sequence-backed components', async () => {
	expect(
		await split('<AbsoluteFill from={0} durationInFrames={50} />', 30),
	).toContain(
		'<AbsoluteFill from={30} durationInFrames={20} trimBefore={30} />',
	);
	expect(
		await split('<Img src="image.png" from={0} durationInFrames={50} />', 30),
	).toContain(
		'<Img src="image.png" from={30} durationInFrames={20} trimBefore={30} />',
	);
	expect(
		await split('<Gif src="anim.gif" from={0} durationInFrames={50} />', 30),
	).toContain(
		'<Gif src="anim.gif" from={30} durationInFrames={20} trimBefore={30} />',
	);
	const solidOutput = await split(
		'<Solid width={100} height={100} from={0} durationInFrames={50} />',
		30,
	);
	expect(solidOutput).toContain(
		'<Solid width={100} height={100} from={0} durationInFrames={30} />',
	);
	expect(solidOutput).toContain('from={30}');
	expect(solidOutput).toContain('durationInFrames={20}');
	expect(solidOutput).toContain('trimBefore={30}');
	expect(
		await split('<Interactive.Div from={0} durationInFrames={50} />', 30),
	).toContain(
		'<Interactive.Div from={30} durationInFrames={20} trimBefore={30} />',
	);
});

test('splitJsxSequence rejects boundary and dynamic splits', async () => {
	await expect(
		split('<Sequence from={10} durationInFrames={20} />', 10),
	).rejects.toThrow(/sequence start/);
	await expect(
		split('<Sequence from={10} durationInFrames={20} />', 30),
	).rejects.toThrow(/sequence end/);
	await expect(
		split('<Sequence from={10} durationInFrames={20} />', 8),
	).rejects.toThrow(/sequence start/);
	await expect(
		split('<Sequence from={10} durationInFrames={20} />', 10.5),
	).rejects.toThrow(/integer/);
	await expect(
		split('<Sequence from={start} durationInFrames={20} />', 15),
	).rejects.toThrow(/dynamic from/);
});

test('splitJsxSequence rejects Series.Sequence', async () => {
	await expect(
		split('<Series.Sequence durationInFrames={50} />', 30, [
			'durationInFrames',
			'trimBefore',
		]),
	).rejects.toThrow('<Series.Sequence> cannot be split');
});

test('splitJsxSequence rejects regular DOM elements', async () => {
	await expect(
		split('<div from={0} durationInFrames={50} />', 30, []),
	).rejects.toThrow('<div> cannot be split');
});
