import {afterEach, expect, test} from 'bun:test';
import type {TSequence} from 'remotion';
import type {ComboboxValue} from '../components/NewComposition/ComboBox';
import {getSequenceContextMenuItems} from '../components/Timeline/get-sequence-context-menu-items';
import {getTimelineMediaStartFrame} from '../components/Timeline/get-timeline-media-start-frame';
import {
	calculateSequenceFreezeFrame,
	shouldShowFreezeFrameMenuItem,
} from '../components/Timeline/use-sequence-freeze-frame-menu-item';

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
	globalThis,
	'window',
);
const originalNavigatorDescriptor = Object.getOwnPropertyDescriptor(
	globalThis,
	'navigator',
);

afterEach(() => {
	if (originalWindowDescriptor) {
		Object.defineProperty(globalThis, 'window', originalWindowDescriptor);
	} else {
		Reflect.deleteProperty(globalThis, 'window');
	}

	if (originalNavigatorDescriptor) {
		Object.defineProperty(globalThis, 'navigator', originalNavigatorDescriptor);
	} else {
		Reflect.deleteProperty(globalThis, 'navigator');
	}
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

test('Interactive.Svg context menu can copy the rendered SVG', () => {
	installTestWindow();

	const copiedTexts: string[] = [];
	Object.defineProperty(globalThis, 'navigator', {
		configurable: true,
		value: {
			clipboard: {
				writeText: (text: string) => {
					copiedTexts.push(text);
					return new Promise<void>(() => undefined);
				},
			},
		},
	});

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
			controls: {
				componentIdentity: 'dev.remotion.remotion.Interactive.Svg',
			},
			documentationLink: 'https://www.remotion.dev/docs/interactive',
			refForOutline: {
				current: {outerHTML: '<svg><circle /></svg>'},
			},
		} as unknown as TSequence,
	});

	const copySvg = items.find((item) => item.id === 'copy-svg');
	if (copySvg?.type !== 'item') {
		throw new Error('Expected copy SVG menu item');
	}

	copySvg.onClick('copy-svg', null);
	expect(copiedTexts).toEqual(['<svg><circle /></svg>']);

	const docsIndex = items.findIndex(
		(item) => item.id === 'open-component-docs',
	);
	const copySvgIndex = items.findIndex((item) => item.id === 'copy-svg');
	expect(
		items.slice(docsIndex + 1, copySvgIndex).map((item) => item.type),
	).toEqual(['divider']);
	expect(items[copySvgIndex + 1]?.type).toBe('divider');
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

test('sequence freeze frame accounts for trimBefore', () => {
	const sequence = {
		duration: 120,
		from: 0,
	} as TSequence;

	expect(
		calculateSequenceFreezeFrame({
			sequence,
			sequenceFrameOffset: 20,
			timelinePosition: -10,
		}),
	).toBe(20);
	expect(
		calculateSequenceFreezeFrame({
			sequence,
			sequenceFrameOffset: 20,
			timelinePosition: 0,
		}),
	).toBe(20);
	expect(
		calculateSequenceFreezeFrame({
			sequence,
			sequenceFrameOffset: 20,
			timelinePosition: 119,
		}),
	).toBe(139);
});

test('video freeze preserves the media frame under the playhead at different playback rates', () => {
	const mediaFrameAtSequenceZero = 5;
	const playbackRate = 2;
	const sequence = {
		duration: 120,
		from: 0,
		mediaFrameAtSequenceZero,
		playbackRate,
		type: 'video',
	} as Extract<TSequence, {type: 'video'}>;
	const timelinePosition = 40;
	const freezeFrame = calculateSequenceFreezeFrame({
		sequence,
		sequenceFrameOffset: 0,
		timelinePosition,
	});
	const mediaFrameUnderPlayhead = getTimelineMediaStartFrame({
		startMediaFrom: mediaFrameAtSequenceZero,
		mediaFrameAtSequenceZero,
		sequenceFrameOffset: timelinePosition,
		playbackRate,
	});
	const mediaFrameAfterFreeze =
		mediaFrameAtSequenceZero + freezeFrame * playbackRate;

	expect(freezeFrame).toBe(timelinePosition);
	expect(mediaFrameAfterFreeze).toBe(mediaFrameUnderPlayhead);
});
