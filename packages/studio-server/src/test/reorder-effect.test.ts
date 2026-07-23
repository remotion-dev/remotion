import {expect, test} from 'bun:test';
import {reorderEffect} from '../codemods/reorder-effect';
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

test('reorderEffect moves an effect forward', async () => {
	const input = buildInput(
		'[blur({amount: 1}), brightness({amount: 2}), tint({color: "red"})]',
	);
	const {output, effectLabel} = await reorderEffect({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 8),
		fromIndex: 0,
		toIndex: 2,
	});

	expect(effectLabel).toBe('blur()');
	expect(output.indexOf('brightness({')).toBeLessThan(output.indexOf('tint({'));
	expect(output.indexOf('tint({')).toBeLessThan(output.indexOf('blur({'));
});

test('reorderEffect moves an effect backward', async () => {
	const input = buildInput(
		'[blur({amount: 1}), brightness({amount: 2}), tint({color: "red"})]',
	);
	const {output, effectLabel} = await reorderEffect({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 8),
		fromIndex: 2,
		toIndex: 0,
	});

	expect(effectLabel).toBe('tint()');
	expect(output.indexOf('tint({')).toBeLessThan(output.indexOf('blur({'));
	expect(output.indexOf('blur({')).toBeLessThan(output.indexOf('brightness({'));
});

test('reorderEffect throws when source index is out of range', async () => {
	const input = buildInput('[tint({color: "red"})]');
	await expect(
		reorderEffect({
			input,
			sequenceNodePath: lineColumnToNodePath(input, 8),
			fromIndex: 4,
			toIndex: 0,
		}),
	).rejects.toThrow(/source index not-found/);
});

test('reorderEffect throws when effects are not an inline array', async () => {
	const input = buildInput('effects');
	await expect(
		reorderEffect({
			input,
			sequenceNodePath: lineColumnToNodePath(input, 8),
			fromIndex: 0,
			toIndex: 0,
		}),
	).rejects.toThrow(/not an array/);
});
