import {expect, test} from 'bun:test';
import {duplicateEffect, duplicateEffects} from '../codemods/duplicate-effect';
import {lineColumnToNodePath} from './test-utils';

const buildInput = (
	effects: string,
) => `import {HtmlInCanvas} from '@remotion/html-in-canvas';
import {blur} from '@remotion/effects/blur';
import {brightness} from '@remotion/effects/brightness';
import {tint} from '@remotion/effects/tint';

export const Comp = () => {
	return (
		<HtmlInCanvas effects={${effects}}>
			hi
		</HtmlInCanvas>
	);
};
`;

test('duplicateEffect clones the targeted effect after itself', async () => {
	const input = buildInput(
		'[blur({radius: 5}), tint({color: "red"}), brightness({amount: 2})]',
	);
	const {output, effectLabel} = await duplicateEffect({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 8),
		effectIndex: 1,
	});

	expect(effectLabel).toBe('tint()');
	expect(output.indexOf('blur({')).toBeLessThan(output.indexOf('tint({'));
	expect(output.match(/tint\(\{\s*color: ['"]red['"],?\s*\}\)/g)).toHaveLength(
		2,
	);
	expect(output.lastIndexOf('tint({')).toBeLessThan(
		output.indexOf('brightness({'),
	);
});

test('duplicateEffects clones multiple targeted effects in one pass', async () => {
	const input = buildInput(
		'[blur({radius: 5}), tint({color: "red"}), brightness({amount: 2})]',
	);
	const {output, effectLabels} = await duplicateEffects({
		input,
		effects: [
			{
				sequenceNodePath: lineColumnToNodePath(input, 8),
				effectIndex: 0,
			},
			{
				sequenceNodePath: lineColumnToNodePath(input, 8),
				effectIndex: 2,
			},
		],
	});

	expect(effectLabels).toEqual(['blur()', 'brightness()']);
	expect(output.match(/blur\(\{\s*radius: 5,?\s*\}\)/g)).toHaveLength(2);
	expect(output.match(/brightness\(\{\s*amount: 2,?\s*\}\)/g)).toHaveLength(2);
	expect(output.indexOf('blur({')).toBeLessThan(output.indexOf('tint({'));
	expect(output.indexOf('tint({')).toBeLessThan(output.indexOf('brightness({'));
});

test('duplicateEffect throws when effect index is out of range', async () => {
	const input = buildInput('[tint({color: "red"})]');
	await expect(
		duplicateEffect({
			input,
			sequenceNodePath: lineColumnToNodePath(input, 8),
			effectIndex: 5,
		}),
	).rejects.toThrow(/not-found/);
});

test('duplicateEffect throws when effects are not an inline array', async () => {
	const input = buildInput('effects');
	await expect(
		duplicateEffect({
			input,
			sequenceNodePath: lineColumnToNodePath(input, 8),
			effectIndex: 0,
		}),
	).rejects.toThrow(/not an array/);
});

test('duplicateEffect throws when the target effect is unsupported', async () => {
	const input = buildInput('[tint({color: "red"}), ...effects]');
	await expect(
		duplicateEffect({
			input,
			sequenceNodePath: lineColumnToNodePath(input, 8),
			effectIndex: 1,
		}),
	).rejects.toThrow(/not-call-expression/);
});
