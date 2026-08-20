import {afterEach, expect, test} from 'bun:test';
import type {BrowserStudioEffectOperations} from '@remotion/studio-shared';
import {
	addEffect,
	deleteEffects,
	duplicateEffects,
	pasteEffects,
	reorderEffect,
	saveEffectProps,
	saveMultipleEffectProps,
} from '../components/effect-operations-api';
import {canUseEffectOperations} from '../helpers/browser-studio-operations';
import {makeBrowserStudioOperations} from './make-browser-studio-operations';

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
	globalThis,
	'window',
);

afterEach(() => {
	if (originalWindowDescriptor) {
		Object.defineProperty(globalThis, 'window', originalWindowDescriptor);
		return;
	}

	Reflect.deleteProperty(globalThis, 'window');
});

test('routes effect mutations through the explicit Browser Studio capability', async () => {
	const calls: string[] = [];
	const effects: BrowserStudioEffectOperations = {
		addEffect: (request) => {
			calls.push(`add:${request.effectName}`);
			return Promise.resolve({success: true});
		},
		deleteEffects: (request) => {
			calls.push(`delete:${request.length}`);
			return Promise.resolve({success: true});
		},
		duplicateEffects: (request) => {
			calls.push(`duplicate:${request.length}`);
			return Promise.resolve({success: true});
		},
		pasteEffects: (request) => {
			calls.push(`paste:${request.effects.length}`);
			return Promise.resolve({success: true});
		},
		reorderEffect: (request) => {
			calls.push(`reorder:${request.fromIndex}:${request.toIndex}`);
			return Promise.resolve({success: true});
		},
		saveEffectProps: (request) => {
			calls.push(`save:${request.key}`);
			return Promise.resolve({
				canUpdate: true,
				callee: 'brightness',
				importPath: '@remotion/effects/brightness',
				effectIndex: request.effectIndex,
				props: {},
			});
		},
		saveMultipleEffectProps: (request) => {
			calls.push(`save-multiple:${request.edits.length}`);
			return Promise.resolve({results: []});
		},
	};
	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: {
			remotion_browserStudio: makeBrowserStudioOperations({effects}),
			remotion_isReadOnlyStudio: true,
		},
	});
	const nodePath = {
		absolutePath: '/project/src/Comp.tsx',
		nodePath: ['program', 'body', 1],
		sequenceKeys: [],
		effectKeys: [['amount']],
		videoConfigValues: null,
	};
	const schema = {
		amount: {type: 'number' as const, default: 1, hiddenFromList: false},
	};

	expect(canUseEffectOperations()).toBe(true);
	await addEffect({
		fileName: 'src/Comp.tsx',
		sequenceNodePath: nodePath,
		effectName: 'brightness',
		effectImportPath: '@remotion/effects/brightness',
		effectConfig: {amount: 1},
		clientId: 'browser-studio',
	});
	await duplicateEffects([
		{
			fileName: 'src/Comp.tsx',
			sequenceNodePath: nodePath,
			effectIndex: 0,
		},
	]);
	await reorderEffect({
		fileName: 'src/Comp.tsx',
		sequenceNodePath: nodePath,
		fromIndex: 0,
		toIndex: 1,
		clientId: 'browser-studio',
	});
	await saveEffectProps({
		type: 'value',
		fileName: 'src/Comp.tsx',
		sequenceNodePath: nodePath,
		effectIndex: 0,
		key: 'amount',
		value: '0.5',
		defaultValue: '1',
		schema,
		clientId: 'browser-studio',
	});
	await saveMultipleEffectProps({
		edits: [],
		clientId: 'browser-studio',
		undoLabel: 'Undo effect edit',
		redoLabel: 'Redo effect edit',
	});
	await pasteEffects({
		targetFileName: 'src/Comp.tsx',
		targetSequenceNodePath: nodePath,
		type: 'effects-additive',
		effects: [],
		clientId: 'browser-studio',
		insertAtIndices: null,
	});
	await deleteEffects([
		{
			type: 'single-effect',
			fileName: 'src/Comp.tsx',
			sequenceNodePath: nodePath,
			effectIndex: 0,
		},
	]);

	expect(calls).toEqual([
		'add:brightness',
		'duplicate:1',
		'reorder:0:1',
		'save:amount',
		'save-multiple:0',
		'paste:0',
		'delete:1',
	]);
});

test('reports the capability as unavailable for an older Browser Studio host', () => {
	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: {
			remotion_browserStudio: makeBrowserStudioOperations({}),
			remotion_isReadOnlyStudio: true,
		},
	});
	expect(canUseEffectOperations()).toBe(false);
});
