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
	const frame = useCurrentFrame();
	return ${jsx};
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
		<HtmlInCanvas effects={[blur({radius: 5})]} />
	</>`);
	const target = makeNodePath(input, 9);

	const {output, effectLabels} = await pasteEffects({
		input,
		targetFileName: 'Comp.tsx',
		targetSequenceNodePath: target.nodePath,
		type: 'effects-additive',
		effects: [
			{
				callee: 'tint',
				importPath: '@remotion/effects/tint',
				params: {color: 'red'},
			},
		],
	});

	expect(effectLabels).toEqual(['tint()']);
	expect(output).toContain('blur({radius: 5})');
	expect(output).toMatch(/tint\(\{\s*color: ['"]red['"],?\s*\}\)/);
});

test('pasteEffects replaces existing effects with all copied effects', async () => {
	const input = buildInput(`<>
		<HtmlInCanvas effects={[tint({color: "blue"})]} />
	</>`);
	const target = makeNodePath(input, 9);

	const {output, effectLabels} = await pasteEffects({
		input,
		targetFileName: 'Comp.tsx',
		targetSequenceNodePath: target.nodePath,
		type: 'effects-replacing',
		effects: [
			{
				callee: 'tint',
				importPath: '@remotion/effects/tint',
				params: {color: 'red'},
			},
			{
				callee: 'blur',
				importPath: '@remotion/effects/blur',
				params: {radius: 10},
			},
		],
	});

	expect(effectLabels).toEqual(['tint()', 'blur()']);
	expect(output).toMatch(/color: ['"]red['"]/);
	expect(output).toContain('radius: 10');
	expect(output).not.toMatch(/color: ['"]blue['"]/);
});

test('pasteEffects can paste after the source sequence no longer exists', async () => {
	const input = buildInput(`<>
		<HtmlInCanvas />
	</>`);
	const target = makeNodePath(input, 9);

	const {output} = await pasteEffects({
		input,
		targetFileName: 'Comp.tsx',
		targetSequenceNodePath: target.nodePath,
		type: 'effects-additive',
		effects: [
			{
				callee: 'tint',
				importPath: '@remotion/effects/tint',
				params: {amount: 0.8},
			},
		],
	});

	expect(output).toMatch(/tint\(\{\s*amount: 0.8,?\s*\}\)/);
});

test('pasteEffects inserts imports for copied effects', async () => {
	const input = buildInput(`<>
		<HtmlInCanvas />
	</>`);
	const inputWithoutTintImport = input.replace(
		"import {tint} from '@remotion/effects/tint';\n",
		'',
	);
	const target = makeNodePath(inputWithoutTintImport, 8);

	const {output} = await pasteEffects({
		input: inputWithoutTintImport,
		targetFileName: 'Comp.tsx',
		targetSequenceNodePath: target.nodePath,
		type: 'effects-additive',
		effects: [
			{
				callee: 'tint',
				importPath: '@remotion/effects/tint',
				params: {color: 'red'},
			},
		],
	});

	expect(output).toContain("import {tint} from '@remotion/effects/tint';");
	expect(output).toMatch(/tint\(\{\s*color: ['"]red['"],?\s*\}\)/);
});

test('pasteEffects does not duplicate an existing copied effect import', async () => {
	const input = buildInput(`<>
		<HtmlInCanvas />
	</>`);
	const target = makeNodePath(input, 9);

	const {output} = await pasteEffects({
		input,
		targetFileName: 'Comp.tsx',
		targetSequenceNodePath: target.nodePath,
		type: 'effects-additive',
		effects: [
			{
				callee: 'tint',
				importPath: '@remotion/effects/tint',
				params: {color: 'red'},
			},
		],
	});

	expect(
		output.match(/import \{tint\} from '@remotion\/effects\/tint';/g)?.length,
	).toBe(1);
});
