import {expect, test} from 'bun:test';
import {reorderEffects} from '../effect-operations';
import {lineColumnToNodePath} from './node-path-test-utils';

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

test('reorderEffects moves effects forward', async () => {
	const input = buildInput(
		'[blur({amount: 1}), brightness({amount: 2}), tint({color: "red"})]',
	);
	const {output, effectLabel} = await reorderEffects({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 8),
		fromIndices: [1, 0],
		toIndex: 1,
	});

	expect(effectLabel).toBe('blur(), brightness()');
	expect(output.indexOf('tint({')).toBeLessThan(output.indexOf('blur({'));
	expect(output.indexOf('blur({')).toBeLessThan(output.indexOf('brightness({'));
});

test('reorderEffects moves effects backward', async () => {
	const input = buildInput(
		'[blur({amount: 1}), brightness({amount: 2}), tint({color: "red"})]',
	);
	const {output, effectLabel} = await reorderEffects({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 8),
		fromIndices: [2, 1],
		toIndex: 0,
	});

	expect(effectLabel).toBe('brightness(), tint()');
	expect(output.indexOf('brightness({')).toBeLessThan(output.indexOf('tint({'));
	expect(output.indexOf('tint({')).toBeLessThan(output.indexOf('blur({'));
});

test('reorderEffects throws when source index is out of range', async () => {
	const input = buildInput('[tint({color: "red"})]');
	await expect(
		reorderEffects({
			input,
			sequenceNodePath: lineColumnToNodePath(input, 8),
			fromIndices: [4],
			toIndex: 0,
		}),
	).rejects.toThrow(/source index not-found/);
});

test('reorderEffects throws when effects are not an inline array', async () => {
	const input = buildInput('effects');
	await expect(
		reorderEffects({
			input,
			sequenceNodePath: lineColumnToNodePath(input, 8),
			fromIndices: [0],
			toIndex: 0,
		}),
	).rejects.toThrow(/not an array/);
});
