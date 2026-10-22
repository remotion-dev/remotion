import {expect, test} from 'bun:test';
import * as recast from 'recast';
import type {InteractivitySchema, SequenceNodePath} from 'remotion';
import {
	addEffect,
	deleteEffects,
	duplicateEffects,
	pasteEffects,
	reorderEffect,
	updateEffectProps,
} from '../effect-operations';
import {getNodePathForRecastPath} from '../sequence-props';
import {parseAst} from '../sequence-props/parse-ast';

const getNodePathAtLine = (input: string, line: number): SequenceNodePath => {
	const ast = parseAst(input);
	let nodePath: SequenceNodePath | null = null;
	recast.types.visit(ast, {
		visitJSXOpeningElement(path) {
			if (path.node.loc?.start.line === line) {
				nodePath = getNodePathForRecastPath(path, ast);
				return false;
			}

			return this.traverse(path);
		},
	});
	if (!nodePath) {
		throw new Error(`Could not find a JSX element on line ${line}`);
	}

	return nodePath;
};

const formatFile = () => {
	throw new Error('The compatibility formatter must not be called');
};

const amountSchema = {
	amount: {type: 'number', default: 1, hiddenFromList: false},
} satisfies InteractivitySchema;

test('effect operations preserve unrelated source without calling Prettier', async () => {
	let output = `import { AbsoluteFill } from 'remotion'
import { brightness } from '@remotion/effects/brightness'

const unrelated    = {keep:"this spacing"}

export const Comp = () => (
  <AbsoluteFill effects={[brightness({amount:1})]} />
)
`;
	const sequenceNodePath = getNodePathAtLine(output, 7);

	output = (
		await addEffect({
			input: output,
			sequenceNodePath,
			effectName: 'tint',
			effectImportPath: '@remotion/effects/tint',
			effectConfig: {color: 'red'},
			formatFile,
		})
	).output;
	output = (
		await duplicateEffects({
			input: output,
			effects: [{sequenceNodePath, effectIndex: 0}],
			formatFile,
		})
	).output;
	output = (
		await reorderEffect({
			input: output,
			sequenceNodePath,
			fromIndex: 2,
			toIndex: 0,
			formatFile,
		})
	).output;
	output = (
		await updateEffectProps({
			input: output,
			sequenceNodePath,
			effectIndex: 1,
			update: {key: 'amount', value: 2, defaultValue: null},
			schema: amountSchema,
			formatFile,
		})
	).output;
	output = (
		await pasteEffects({
			input: output,
			targetSequenceNodePath: sequenceNodePath,
			type: 'effects-additive',
			effects: [
				{
					callee: 'blur',
					importPath: '@remotion/effects/blur',
					params: {radius: {type: 'static', value: 12}},
				},
			],
			insertAtIndices: null,
			formatFile,
		})
	).output;
	output = (
		await deleteEffects({
			input: output,
			effects: [{type: 'single-effect', sequenceNodePath, effectIndex: 2}],
			formatFile,
		})
	).output;

	expect(output).toBe(`import { blur } from '@remotion/effects/blur'
import { tint } from '@remotion/effects/tint'
import { AbsoluteFill } from 'remotion'
import { brightness } from '@remotion/effects/brightness'

const unrelated    = {keep:"this spacing"}

export const Comp = () => (
  <AbsoluteFill
    effects={[tint({
      color: 'red'
    }), brightness({
      amount: 2
    }), blur({
      radius: 12
    })]}
  />
)
`);
});

test('effect updates preserve blank lines in unrelated JSX object props', async () => {
	const input = `import { Solid } from 'remotion'

export const Comp = () => (
  <Solid
    style={{
      amount: 3,

      color: 'red',
    }}
  />
)
`;

	const {output} = await addEffect({
		input,
		sequenceNodePath: getNodePathAtLine(input, 4),
		effectName: 'brightness',
		effectImportPath: '@remotion/effects/brightness',
		effectConfig: {amount: 1},
		formatFile,
	});

	expect(output).toBe(`import { brightness } from '@remotion/effects/brightness'
import { Solid } from 'remotion'

export const Comp = () => (
  <Solid
    style={{
      amount: 3,

      color: 'red',
    }}
    effects={[brightness({
      amount: 1
    })]}
  />
)
`);
});

test('keyframed effect pastes preserve CRLF expression bodies and JSX comments', async () => {
	const input = `'use client'
import { HtmlInCanvas } from '@remotion/html-in-canvas'

export const Comp = () => (
  <HtmlInCanvas>
    {/* keep me */}
    content
  </HtmlInCanvas>
)
`.replaceAll(/\r?\n/g, '\r\n');

	const {output} = await pasteEffects({
		input,
		targetSequenceNodePath: getNodePathAtLine(input, 5),
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
							{frame: 30, value: 1},
						],
						easing: [{type: 'linear'}],
						clamping: {left: 'extend', right: 'extend'},
					},
				},
			},
		],
		insertAtIndices: null,
		formatFile,
	});

	expect(output).toBe(
		`'use client'
import { useCurrentFrame, interpolate } from 'remotion'
import { brightness } from '@remotion/effects/brightness'
import { HtmlInCanvas } from '@remotion/html-in-canvas'

export const Comp = () => {
  const frame = useCurrentFrame()
  return (
  <HtmlInCanvas
    effects={[brightness({
      amount: interpolate(frame, [0, 30], [0, 1])
    })]}
  >
    {/* keep me */}
    content
  </HtmlInCanvas>
)
}
`.replaceAll(/\r?\n/g, '\r\n'),
	);
});

test('no-op effect operations leave source byte-identical', async () => {
	const input = `import { brightness } from '@remotion/effects/brightness'

export const Comp = () => <div effects={[brightness()]} />
`;
	const sequenceNodePath = getNodePathAtLine(input, 3);
	const reordered = await reorderEffect({
		input,
		sequenceNodePath,
		fromIndex: 0,
		toIndex: 0,
		formatFile,
	});
	const updated = await updateEffectProps({
		input: reordered.output,
		sequenceNodePath,
		effectIndex: 0,
		update: {key: 'amount', value: 1, defaultValue: 1},
		schema: amountSchema,
		formatFile,
	});

	expect(updated.output).toBe(input);
});

test('batched duplicate and delete preserve source between distinct JSX elements', async () => {
	const input = `import { brightness } from '@remotion/effects/brightness'

const unrelated    = {keep:"this spacing"}

export const Comp = () => (
  <>
    <div effects={[brightness()]} />
    {/*   keep this oddly-spaced comment   */}
    <section effects={[brightness()]} />
  </>
)
`;
	const firstSequenceNodePath = getNodePathAtLine(input, 7);
	const secondSequenceNodePath = getNodePathAtLine(input, 9);

	const duplicated = await duplicateEffects({
		input,
		effects: [
			{sequenceNodePath: firstSequenceNodePath, effectIndex: 0},
			{sequenceNodePath: secondSequenceNodePath, effectIndex: 0},
		],
		formatFile,
	});

	expect(duplicated.output)
		.toBe(`import { brightness } from '@remotion/effects/brightness'

const unrelated    = {keep:"this spacing"}

export const Comp = () => (
  <>
    <div effects={[brightness(), brightness()]} />
    {/*   keep this oddly-spaced comment   */}
    <section effects={[brightness(), brightness()]} />
  </>
)
`);

	const deleted = await deleteEffects({
		input: duplicated.output,
		effects: [
			{
				type: 'single-effect',
				sequenceNodePath: firstSequenceNodePath,
				effectIndex: 1,
			},
			{
				type: 'single-effect',
				sequenceNodePath: secondSequenceNodePath,
				effectIndex: 1,
			},
		],
		formatFile,
	});

	expect(deleted.output).toBe(input);
});
