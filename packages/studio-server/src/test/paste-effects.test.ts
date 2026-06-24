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

const getLine = (input: string, needle: string): number => {
	const lineIndex = input
		.split('\n')
		.findIndex((line) => line.includes(needle));
	if (lineIndex === -1) {
		throw new Error(`Could not find line containing ${needle}`);
	}

	return lineIndex + 1;
};

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
				params: {color: {type: 'static', value: 'red'}},
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
				params: {color: {type: 'static', value: 'red'}},
			},
			{
				callee: 'blur',
				importPath: '@remotion/effects/blur',
				params: {radius: {type: 'static', value: 10}},
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
				params: {amount: {type: 'static', value: 0.8}},
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
				params: {color: {type: 'static', value: 'red'}},
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
				params: {color: {type: 'static', value: 'red'}},
			},
		],
	});

	expect(
		output.match(/import \{tint\} from '@remotion\/effects\/tint';/g)?.length,
	).toBe(1);
});

test('pasteEffects appends a keyframed effect and inserts frame dependencies', async () => {
	const input = `import {HtmlInCanvas} from '@remotion/html-in-canvas';

export const Comp = () => {
	return (
		<HtmlInCanvas />
	);
};
`;
	const target = makeNodePath(input, getLine(input, '<HtmlInCanvas'));

	const {output} = await pasteEffects({
		input,
		targetFileName: 'Comp.tsx',
		targetSequenceNodePath: target.nodePath,
		type: 'effects-additive',
		effects: [
			{
				callee: 'brightness',
				importPath: '@remotion/effects/brightness',
				params: {
					amount: {
						type: 'keyframed',
						interpolationFunction: 'interpolate',
						keyframes: [
							{frame: 0, value: 0},
							{frame: 100, value: 1},
						],
						easing: [{type: 'bezier', x1: 0.1, y1: 0.2, x2: 0.3, y2: 0.4}],
						clamping: {left: 'clamp', right: 'wrap'},
						posterize: 2,
					},
				},
			},
		],
	});

	expect(output).toContain(
		"import {brightness} from '@remotion/effects/brightness';",
	);
	expect(output).toContain('useCurrentFrame');
	expect(output).toContain('interpolate');
	expect(output).toContain('Easing');
	expect(output).toContain('const frame = useCurrentFrame();');
	expect(output).toContain('amount: interpolate(frame, [0, 100], [0, 1], {');
	expect(output).toContain("extrapolateLeft: 'clamp'");
	expect(output).toContain("extrapolateRight: 'wrap'");
	expect(output).toContain('easing: [Easing.bezier(0.1, 0.2, 0.3, 0.4)]');
	expect(output).toContain('posterize: 2');
});

test('pasteEffects serializes spring easing for keyframed effects', async () => {
	const input = `import {HtmlInCanvas} from '@remotion/html-in-canvas';

export const Comp = () => {
	return (
		<HtmlInCanvas />
	);
};
`;
	const target = makeNodePath(input, getLine(input, '<HtmlInCanvas'));

	const {output} = await pasteEffects({
		input,
		targetFileName: 'Comp.tsx',
		targetSequenceNodePath: target.nodePath,
		type: 'effects-additive',
		effects: [
			{
				callee: 'brightness',
				importPath: '@remotion/effects/brightness',
				params: {
					amount: {
						type: 'keyframed',
						interpolationFunction: 'interpolate',
						keyframes: [
							{frame: 0, value: 0},
							{frame: 100, value: 1},
						],
						easing: [
							{
								type: 'spring',
								allowTail: true,
								damping: 12,
								durationRestThreshold: 0.1,
								mass: 1.5,
								stiffness: 180,
								overshootClamping: true,
							},
						],
						clamping: {left: 'extend', right: 'extend'},
					},
				},
			},
		],
	});

	expect(output).toContain('Easing.spring({');
	expect(output).toContain('damping: 12');
	expect(output).toContain('mass: 1.5');
	expect(output).toContain('stiffness: 180');
	expect(output).toContain('allowTail: true');
	expect(output).toContain('durationRestThreshold: 0.1');
	expect(output).toContain('overshootClamping: true');
});

test('pasteEffects uses aliased Remotion imports for keyframed effects', async () => {
	const input = `import {HtmlInCanvas} from '@remotion/html-in-canvas';
import {interpolate as i, useCurrentFrame as useFrame} from 'remotion';

export const Comp = () => {
	return (
		<HtmlInCanvas />
	);
};
`;
	const target = makeNodePath(input, getLine(input, '<HtmlInCanvas'));

	const {output} = await pasteEffects({
		input,
		targetFileName: 'Comp.tsx',
		targetSequenceNodePath: target.nodePath,
		type: 'effects-additive',
		effects: [
			{
				callee: 'brightness',
				importPath: '@remotion/effects/brightness',
				params: {
					amount: {
						type: 'keyframed',
						interpolationFunction: 'interpolate',
						keyframes: [
							{frame: 0, value: 0},
							{frame: 100, value: 1},
						],
						easing: [{type: 'linear'}],
						clamping: {left: 'extend', right: 'extend'},
					},
				},
			},
		],
	});

	expect(output).toContain('const frame = useFrame();');
	expect(output).toContain('amount: i(frame, [0, 100], [0, 1])');
});

test('pasteEffects replaces existing effects with mixed static and keyframed params', async () => {
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
				params: {
					color: {
						type: 'keyframed',
						interpolationFunction: 'interpolateColors',
						keyframes: [
							{frame: 0, value: 'red'},
							{frame: 100, value: 'green'},
						],
						easing: [{type: 'bezier', x1: 0.1, y1: 0.2, x2: 0.3, y2: 0.4}],
						clamping: {left: 'clamp', right: 'clamp'},
						posterize: 5,
					},
					amount: {type: 'static', value: 0.7},
				},
			},
		],
	});

	expect(effectLabels).toEqual(['tint()']);
	expect(output).toContain(
		"color: interpolateColors(frame, [0, 100], ['red', 'green'], {",
	);
	expect(output).toContain('Easing');
	expect(output).toContain('easing: [Easing.bezier(0.1, 0.2, 0.3, 0.4)]');
	expect(output).toContain('posterize: 5');
	expect(output).toContain('amount: 0.7');
	expect(output).not.toMatch(/color: ['"]blue['"]/);
});

test('pasteEffects supports interpolated rotate keyframed params', async () => {
	const input = buildInput(`<>
		<HtmlInCanvas effects={[tint({color: "blue"})]} />
	</>`);
	const target = makeNodePath(input, 9);

	const {output} = await pasteEffects({
		input,
		targetFileName: 'Comp.tsx',
		targetSequenceNodePath: target.nodePath,
		type: 'effects-replacing',
		effects: [
			{
				callee: 'tint',
				importPath: '@remotion/effects/tint',
				params: {
					angle: {
						type: 'keyframed',
						interpolationFunction: 'interpolate',
						keyframes: [
							{frame: 0, value: '0deg'},
							{frame: 100, value: '90deg'},
						],
						easing: [{type: 'linear'}],
						clamping: {left: 'extend', right: 'extend'},
					},
				},
			},
		],
	});

	expect(output).toContain(
		"angle: interpolate(frame, [0, 100], ['0deg', '90deg'])",
	);
});
