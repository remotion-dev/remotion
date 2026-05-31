import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {
	updateEffectPropsAst,
	updateMultipleEffectProps,
} from '../codemods/update-effect-props/update-effect-props';
import {
	createFileWatcherRegistry,
	setFileWatcherRegistry,
} from '../file-watcher';
import {saveEffectPropsHandler} from '../preview-server/routes/save-effect-props';
import {
	clearUndoStackForTests,
	getUndoStack,
} from '../preview-server/undo-stack';
import {lineColumnToNodePath} from './test-utils';

const tintSchema = {
	color: {
		type: 'color',
		default: 'black',
	},
	opacity: {
		type: 'number',
		default: 1,
	},
	amount: {
		type: 'number',
		default: 1,
	},
	position: {
		type: 'uv-coordinate',
		default: [0, 0.5],
	},
} as const;

const buildInput = (
	effects: string,
) => `import {HtmlInCanvas} from '@remotion/html-in-canvas';
import {tint} from '@remotion/effects/tint';

export const Comp = () => {
\treturn (
\t\t<HtmlInCanvas effects={${effects}}>
\t\t\thi
\t\t</HtmlInCanvas>
\t);
};
`;

test('updateEffectProps updates an existing prop on the right effect', () => {
	const input = buildInput('[tint({color: "red", opacity: 0.5})]');
	const {serialized} = updateEffectPropsAst({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 6),
		effectIndex: 0,
		update: {key: 'opacity', value: 0.8, defaultValue: null},
		schema: tintSchema,
	});

	expect(serialized).toContain('opacity: 0.8');
	expect(serialized).not.toContain('opacity: 0.5');
});

test('updateEffectProps adds a missing prop', () => {
	const input = buildInput('[tint({color: "red"})]');
	const {serialized, effectCallee} = updateEffectPropsAst({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 6),
		effectIndex: 0,
		update: {key: 'opacity', value: 0.25, defaultValue: null},
		schema: tintSchema,
	});

	expect(effectCallee).toBe('tint');
	expect(serialized).toContain('opacity: 0.25');
	expect(serialized).toContain('color: "red"');
});

test('updateEffectProps writes uv-coordinate tuples', () => {
	const input = buildInput('[tint({color: "red"})]');
	const {serialized} = updateEffectPropsAst({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 6),
		effectIndex: 0,
		update: {key: 'position', value: [0.25, 0.75], defaultValue: null},
		schema: tintSchema,
	});

	expect(serialized).toContain('position: [0.25,0.75]');
});

test('updateEffectProps removes a prop equal to default', () => {
	const input = buildInput('[tint({color: "red", opacity: 0.5})]');
	const {serialized} = updateEffectPropsAst({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 6),
		effectIndex: 0,
		update: {key: 'opacity', value: 1, defaultValue: 1},
		schema: tintSchema,
	});

	expect(serialized).not.toContain('opacity:');
	expect(serialized).toContain('color: "red"');
});

test('updateMultipleEffectProps applies several updates to one output', async () => {
	const input = buildInput('[tint({color: "red", opacity: 0.5})]');
	const {output, results} = await updateMultipleEffectProps({
		input,
		changes: [
			{
				sequenceNodePath: lineColumnToNodePath(input, 6),
				effectIndex: 0,
				update: {key: 'opacity', value: 1, defaultValue: 1},
				schema: tintSchema,
			},
			{
				sequenceNodePath: lineColumnToNodePath(input, 6),
				effectIndex: 0,
				update: {key: 'color', value: 'black', defaultValue: 'black'},
				schema: tintSchema,
			},
		],
		prettierConfigOverride: null,
	});

	expect(output).not.toContain('opacity:');
	expect(output).not.toContain('color:');
	expect(results).toHaveLength(2);
});

test('saveEffectPropsHandler pushes one undo entry for multiple edits', async () => {
	clearUndoStackForTests();
	const cleanupFileWatcher = setFileWatcherRegistry(
		createFileWatcherRegistry(),
	);
	const dir = mkdtempSync(path.join(tmpdir(), 'remotion-effect-props-'));
	const input = buildInput('[tint({color: "red", opacity: 0.5})]');
	const fileName = path.join(dir, 'Comp.tsx');
	const sequenceNodePath = {
		absolutePath: fileName,
		nodePath: lineColumnToNodePath(input, 6),
		sequenceKeys: [],
		effectKeys: [['color', 'opacity']],
	};
	writeFileSync(fileName, input);

	try {
		await saveEffectPropsHandler({
			input: {
				edits: [
					{
						fileName,
						sequenceNodePath,
						effectIndex: 0,
						key: 'opacity',
						value: '1',
						defaultValue: '1',
						schema: tintSchema,
					},
					{
						fileName,
						sequenceNodePath,
						effectIndex: 0,
						key: 'color',
						value: '"black"',
						defaultValue: '"black"',
						schema: tintSchema,
					},
				],
				clientId: 'test-client',
				undoLabel: null,
				redoLabel: null,
			},
			entryPoint: fileName,
			remotionRoot: dir,
			request: {} as never,
			response: {} as never,
			logLevel: 'error',
			methods: {} as never,
			publicDir: dir,
			binariesDirectory: null,
		});

		const output = readFileSync(fileName, 'utf-8');
		expect(output).not.toContain('opacity:');
		expect(output).not.toContain('color:');
		expect(getUndoStack()).toHaveLength(1);
		expect(getUndoStack()[0].description.undoMessage).toBe(
			'↩️  Update selected effect props',
		);
	} finally {
		clearUndoStackForTests();
		cleanupFileWatcher();
		rmSync(dir, {recursive: true, force: true});
	}
});

test('updateEffectProps targets the correct effect by index when there are multiple', () => {
	const input = buildInput(
		'[tint({color: "red"}), tint({color: "green", opacity: 0.4})]',
	);
	const {serialized} = updateEffectPropsAst({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 6),
		effectIndex: 1,
		update: {key: 'opacity', value: 0.9, defaultValue: null},
		schema: tintSchema,
	});

	expect(serialized).toContain('opacity: 0.9');
	expect(serialized).toContain('color: "red"');
	expect(serialized).toContain('color: "green"');
});

test('updateEffectProps throws when effect index is out of range', () => {
	const input = buildInput('[tint({color: "red"})]');
	expect(() => {
		updateEffectPropsAst({
			input,
			sequenceNodePath: lineColumnToNodePath(input, 6),
			effectIndex: 5,
			update: {key: 'opacity', value: 0.5, defaultValue: null},
			schema: tintSchema,
		});
	}).toThrow(/not-found/);
});

test('updateEffectProps inserts object literal when effect has no arguments', () => {
	const input = buildInput('[tint()]');
	const {serialized} = updateEffectPropsAst({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 6),
		effectIndex: 0,
		update: {key: 'amount', value: 0.5, defaultValue: null},
		schema: tintSchema,
	});

	expect(serialized).toContain('amount: 0.5');
	expect(serialized).toMatch(/tint\s*\(\s*\{/);
});

test('updateEffectProps throws when first arg is not an object literal', () => {
	const input = buildInput('[tint(getParams())]');
	expect(() => {
		updateEffectPropsAst({
			input,
			sequenceNodePath: lineColumnToNodePath(input, 6),
			effectIndex: 0,
			update: {key: 'opacity', value: 0.5, defaultValue: null},
			schema: tintSchema,
		});
	}).toThrow(/computed/);
});

test('updateEffectProps removes props from inactive enum variants', () => {
	const input = buildInput(
		'[tint({colorMode: "solid", dotColor: "red  blue", opacity: 0.5})]',
	);
	const {serialized, removedProps} = updateEffectPropsAst({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 6),
		effectIndex: 0,
		update: {key: 'colorMode', value: 'source', defaultValue: 'solid'},
		schema: {
			colorMode: {
				type: 'enum',
				default: 'solid',
				variants: {
					solid: {
						dotColor: {
							type: 'color',
							default: 'red',
						},
					},
					source: {},
				},
			},
			opacity: {
				type: 'number',
				default: 1,
			},
		},
	});

	expect(serialized).toContain('colorMode: "source"');
	expect(serialized).not.toContain('dotColor');
	expect(serialized).toContain('opacity: 0.5');
	expect(removedProps).toEqual([{key: 'dotColor', valueString: '"red  blue"'}]);
});
