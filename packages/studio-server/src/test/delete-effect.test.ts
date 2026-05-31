import {expect, test} from 'bun:test';
import {deleteEffect, deleteEffects} from '../codemods/delete-effect';
import {lineColumnToNodePath} from './test-utils';

const buildInput = (
	effects: string,
) => `import {HtmlInCanvas} from '@remotion/html-in-canvas';
import {tint} from '@remotion/effects/tint';

export const Comp = () => {
	return (
		<HtmlInCanvas effects={${effects}}>
			hi
		</HtmlInCanvas>
	);
};
`;

test('deleteEffect removes the only effect and the effects prop', async () => {
	const input = buildInput('[tint({color: "red"})]');
	const {output, effectLabel} = await deleteEffect({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 6),
		effectIndex: 0,
	});

	expect(effectLabel).toBe('tint()');
	expect(output).not.toContain('effects=');
	expect(output).not.toContain('tint(');
	expect(output).toContain('<HtmlInCanvas>');
});

test('deleteEffect removes the targeted effect by index', async () => {
	const input = buildInput(
		'[tint({color: "red"}), tint({color: "green"}), tint({color: "blue"})]',
	);
	const {output} = await deleteEffect({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 6),
		effectIndex: 1,
	});

	expect(output).toMatch(/color: ['"]red['"]/);
	expect(output).not.toMatch(/color: ['"]green['"]/);
	expect(output).toMatch(/color: ['"]blue['"]/);
	expect(output).toContain('effects={[');
});

test('deleteEffects removes multiple targeted effects in one pass', async () => {
	const input = buildInput(
		'[tint({color: "red"}), tint({color: "green"}), tint({color: "blue"})]',
	);
	const {output, effectLabels} = await deleteEffects({
		input,
		effects: [
			{
				type: 'single-effect',
				sequenceNodePath: lineColumnToNodePath(input, 6),
				effectIndex: 0,
			},
			{
				type: 'single-effect',
				sequenceNodePath: lineColumnToNodePath(input, 6),
				effectIndex: 2,
			},
		],
	});

	expect(effectLabels).toEqual(['tint()', 'tint()']);
	expect(output).not.toMatch(/color: ['"]red['"]/);
	expect(output).toMatch(/color: ['"]green['"]/);
	expect(output).not.toMatch(/color: ['"]blue['"]/);
	expect(output).toContain('effects={[');
});

test('deleteEffects removes all effects from the target sequence', async () => {
	const input = buildInput(
		'[tint({color: "red"}), tint({color: "green"}), tint({color: "blue"})]',
	);
	const {output, effectLabels} = await deleteEffects({
		input,
		effects: [
			{
				type: 'all-effects',
				sequenceNodePath: lineColumnToNodePath(input, 6),
			},
		],
	});

	expect(effectLabels).toEqual(['tint()', 'tint()', 'tint()']);
	expect(output).not.toContain('effects=');
	expect(output).not.toContain('tint(');
	expect(output).toContain('<HtmlInCanvas>');
});

test('deleteEffect keeps the effects prop when other effects remain', async () => {
	const input = buildInput('[tint({color: "red"}), tint({color: "green"})]');
	const {output} = await deleteEffect({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 6),
		effectIndex: 1,
	});

	expect(output).toContain('effects={[');
	expect(output).toMatch(/color: ['"]red['"]/);
	expect(output).not.toMatch(/color: ['"]green['"]/);
});

test('deleteEffect throws when effect index is out of range', async () => {
	const input = buildInput('[tint({color: "red"})]');
	await expect(
		deleteEffect({
			input,
			sequenceNodePath: lineColumnToNodePath(input, 6),
			effectIndex: 5,
		}),
	).rejects.toThrow(/not-found/);
});

test('deleteEffect throws when effects are not an inline array', async () => {
	const input = buildInput('effects');
	await expect(
		deleteEffect({
			input,
			sequenceNodePath: lineColumnToNodePath(input, 6),
			effectIndex: 0,
		}),
	).rejects.toThrow(/not an array/);
});

test('deleteEffect throws when the target effect is unsupported', async () => {
	const input = buildInput('[tint({color: "red"}), ...effects]');
	await expect(
		deleteEffect({
			input,
			sequenceNodePath: lineColumnToNodePath(input, 6),
			effectIndex: 1,
		}),
	).rejects.toThrow(/not-call-expression/);
});
