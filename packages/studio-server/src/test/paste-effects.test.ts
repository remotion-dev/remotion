import {expect, test} from 'bun:test';
import {pasteEffects} from '../codemods/paste-effects';
import {lineColumnToNodePath} from './test-utils';

const buildInput = (
	jsx: string,
) => `import {HtmlInCanvas} from '@remotion/html-in-canvas';
import {blur} from '@remotion/effects/blur';
import {tint} from '@remotion/effects/tint';
import {interpolate, useCurrentFrame} from 'remotion';

export const Comp = () => {
\tconst frame = useCurrentFrame();
\treturn ${jsx};
};
`;

const makeNodePath = (input: string, line: number) => ({
	absolutePath: 'Comp.tsx',
	nodePath: lineColumnToNodePath(input, line),
	sequenceKeys: [],
	effectKeys: [],
});

test('pasteEffects appends a copied effect to a target sequence', async () => {
	const input = buildInput(`<>
\t\t<HtmlInCanvas effects={[tint({color: "red"})]} />
\t\t<HtmlInCanvas effects={[blur({radius: 5})]} />
\t</>`);
	const source = makeNodePath(input, 9);
	const target = makeNodePath(input, 10);

	const {output, effectLabels} = await pasteEffects({
		input,
		targetFileName: 'Comp.tsx',
		targetSequenceNodePath: target.nodePath,
		type: 'effects-additive',
		sources: [
			{
				type: 'single-effect',
				fileName: 'Comp.tsx',
				sequenceNodePath: source,
				effectIndex: 0,
			},
		],
	});

	expect(effectLabels).toEqual(['tint()']);
	expect(output).toContain('blur({radius: 5})');
	expect(output).toMatch(/tint\(\{color: ['"]red['"]\}\)/);
});

test('pasteEffects replaces existing effects with all copied effects', async () => {
	const input = buildInput(`<>
\t\t<HtmlInCanvas effects={[tint({color: "red"}), blur({radius: 10})]} />
\t\t<HtmlInCanvas effects={[tint({color: "blue"})]} />
\t</>`);
	const source = makeNodePath(input, 9);
	const target = makeNodePath(input, 10);

	const {output, effectLabels} = await pasteEffects({
		input,
		targetFileName: 'Comp.tsx',
		targetSequenceNodePath: target.nodePath,
		type: 'effects-replacing',
		sources: [
			{
				type: 'all-effects',
				fileName: 'Comp.tsx',
				sequenceNodePath: source,
			},
		],
	});

	expect(effectLabels).toEqual(['tint()', 'blur()']);
	expect(output).toMatch(/color: ['"]red['"]/);
	expect(output).toContain('radius: 10');
	expect(output).not.toMatch(/color: ['"]blue['"]/);
});

test('pasteEffects preserves inline effect keyframes in the same file', async () => {
	const input = buildInput(`<>
\t\t<HtmlInCanvas
\t\t\teffects={[tint({amount: interpolate(frame, [0, 20], [0.2, 0.8])})]}
\t\t/>
\t\t<HtmlInCanvas />
\t</>`);
	const source = makeNodePath(input, 9);
	const target = makeNodePath(input, 12);

	const {output} = await pasteEffects({
		input,
		targetFileName: 'Comp.tsx',
		targetSequenceNodePath: target.nodePath,
		type: 'effects-additive',
		sources: [
			{
				type: 'single-effect',
				fileName: 'Comp.tsx',
				sequenceNodePath: source,
				effectIndex: 0,
			},
		],
	});

	expect(output).toContain(
		'tint({amount: interpolate(frame, [0, 20], [0.2, 0.8])})',
	);
});

test('pasteEffects rejects cross-file pastes to avoid broken keyframe references', async () => {
	const input = buildInput(`<>
\t\t<HtmlInCanvas effects={[tint({color: "red"})]} />
\t\t<HtmlInCanvas />
\t</>`);
	const source = makeNodePath(input, 9);
	const target = makeNodePath(input, 10);

	await expect(
		pasteEffects({
			input,
			targetFileName: 'Comp.tsx',
			targetSequenceNodePath: target.nodePath,
			type: 'effects-additive',
			sources: [
				{
					type: 'single-effect',
					fileName: 'Other.tsx',
					sequenceNodePath: source,
					effectIndex: 0,
				},
			],
		}),
	).rejects.toThrow(/different source file/);
});
