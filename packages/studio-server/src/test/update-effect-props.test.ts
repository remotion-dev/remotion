import {expect, test} from 'bun:test';
import {updateEffectPropsAst} from '../codemods/update-effect-props/update-effect-props';
import {lineColumnToNodePath} from './test-utils';

const buildInput = (
	effects: string,
) => `import {HtmlInCanvas} from '@remotion/html-in-canvas';
import {EffectInternals} from '@remotion/effects';

export const Comp = () => {
\treturn (
\t\t<HtmlInCanvas effects={${effects}}>
\t\t\thi
\t\t</HtmlInCanvas>
\t);
};
`;

test('updateEffectProps updates an existing prop on the right effect', () => {
	const input = buildInput(
		'[EffectInternals.tint({color: "red", opacity: 0.5})]',
	);
	const {serialized} = updateEffectPropsAst({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 6),
		effectIndex: 0,
		update: {key: 'opacity', value: 0.8, defaultValue: null},
	});

	expect(serialized).toContain('opacity: 0.8');
	expect(serialized).not.toContain('opacity: 0.5');
});

test('updateEffectProps adds a missing prop', () => {
	const input = buildInput('[EffectInternals.tint({color: "red"})]');
	const {serialized, effectCallee} = updateEffectPropsAst({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 6),
		effectIndex: 0,
		update: {key: 'opacity', value: 0.25, defaultValue: null},
	});

	expect(effectCallee).toBe('tint');
	expect(serialized).toContain('opacity: 0.25');
	expect(serialized).toContain('color: "red"');
});

test('updateEffectProps removes a prop equal to default', () => {
	const input = buildInput(
		'[EffectInternals.tint({color: "red", opacity: 0.5})]',
	);
	const {serialized} = updateEffectPropsAst({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 6),
		effectIndex: 0,
		update: {key: 'opacity', value: 1, defaultValue: 1},
	});

	expect(serialized).not.toContain('opacity:');
	expect(serialized).toContain('color: "red"');
});

test('updateEffectProps targets the correct effect by index when there are multiple', () => {
	const input = buildInput(
		'[EffectInternals.tint({color: "red"}), EffectInternals.tint({color: "green", opacity: 0.4})]',
	);
	const {serialized} = updateEffectPropsAst({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 6),
		effectIndex: 1,
		update: {key: 'opacity', value: 0.9, defaultValue: null},
	});

	expect(serialized).toContain('opacity: 0.9');
	expect(serialized).toContain('color: "red"');
	expect(serialized).toContain('color: "green"');
});

test('updateEffectProps throws when effect index is out of range', () => {
	const input = buildInput('[EffectInternals.tint({color: "red"})]');
	expect(() => {
		updateEffectPropsAst({
			input,
			sequenceNodePath: lineColumnToNodePath(input, 6),
			effectIndex: 5,
			update: {key: 'opacity', value: 0.5, defaultValue: null},
		});
	}).toThrow(/not-found/);
});

test('updateEffectProps inserts object literal when effect has no arguments', () => {
	const input = buildInput('[EffectInternals.tint()]');
	const {serialized} = updateEffectPropsAst({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 6),
		effectIndex: 0,
		update: {key: 'amount', value: 0.5, defaultValue: null},
	});

	expect(serialized).toContain('amount: 0.5');
	expect(serialized).toMatch(/tint\s*\(\s*\{/);
});

test('updateEffectProps throws when first arg is not an object literal', () => {
	const input = buildInput('[EffectInternals.tint(getParams())]');
	expect(() => {
		updateEffectPropsAst({
			input,
			sequenceNodePath: lineColumnToNodePath(input, 6),
			effectIndex: 0,
			update: {key: 'opacity', value: 0.5, defaultValue: null},
		});
	}).toThrow(/computed/);
});
