import {afterEach, expect, test} from 'bun:test';
import type {TSequence} from 'remotion';
import type {ComboboxValue} from '../components/NewComposition/ComboBox';
import {getSequenceContextMenuItems} from '../components/Timeline/get-sequence-context-menu-items';
import {shouldShowFreezeFrameMenuItem} from '../components/Timeline/use-sequence-freeze-frame-menu-item';

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

const installTestWindow = () => {
	const testWindow: Pick<Window, 'open' | 'remotion_editorName'> = {
		open: () => null,
		remotion_editorName: null,
	};

	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: testWindow,
	});
};

const renameSequenceItem: ComboboxValue = {
	type: 'item',
	id: 'rename-sequence',
	keyHint: null,
	label: 'Rename...',
	leftItem: null,
	disabled: false,
	onClick: () => undefined,
	quickSwitcherLabel: null,
	subMenu: null,
	value: 'rename-sequence',
};

const noop = () => undefined;

const expectNoExtraDividers = (items: ComboboxValue[]) => {
	expect(items[0]?.type).not.toBe('divider');
	expect(items[items.length - 1]?.type).not.toBe('divider');

	for (let i = 1; i < items.length; i++) {
		expect([items[i - 1].type, items[i].type]).not.toEqual([
			'divider',
			'divider',
		]);
	}
};

test('sequence context menu does not put two dividers between docs and rename', () => {
	installTestWindow();

	const items = getSequenceContextMenuItems({
		assetLinkInfo: null,
		canOpenInEditor: false,
		deleteDisabled: false,
		disableInteractivityDisabled: false,
		duplicateDisabled: false,
		fileLocation: 'src/Video.tsx:10:2',
		includeSourceEditItems: true,
		onDeleteSequenceFromSource: noop,
		onDisableSequenceInteractivity: noop,
		onDuplicateSequenceFromSource: noop,
		openInEditor: noop,
		originalLocation: null,
		selectAsset: noop,
		sequence: {
			documentationLink: 'https://www.remotion.dev/docs/sequence',
		} as TSequence,
		sourceActions: [renameSequenceItem],
	});

	expectNoExtraDividers(items);

	const docsIndex = items.findIndex(
		(item) => item.id === 'open-component-docs',
	);
	const renameIndex = items.findIndex((item) => item.id === 'rename-sequence');

	expect(
		items.slice(docsIndex + 1, renameIndex).map((item) => item.type),
	).toEqual(['divider']);
});

test('sequence freeze context menu item is hidden for audio', () => {
	expect(shouldShowFreezeFrameMenuItem({type: 'audio'} as TSequence)).toBe(
		false,
	);
	expect(shouldShowFreezeFrameMenuItem({type: 'video'} as TSequence)).toBe(
		true,
	);
	expect(shouldShowFreezeFrameMenuItem({type: 'sequence'} as TSequence)).toBe(
		true,
	);
});
