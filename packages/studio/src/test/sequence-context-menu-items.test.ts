import {afterEach, expect, test} from 'bun:test';
import type {TSequence} from 'remotion';
import type {ComboboxValue} from '../components/NewComposition/ComboBox';
import {getSequenceContextMenuItems} from '../components/Timeline/get-sequence-context-menu-items';
import {getTimelineMediaStartFrame} from '../components/Timeline/get-timeline-media-start-frame';
import {
	calculateSequenceFreezeFrame,
	isSequenceVisibleAtTimelinePosition,
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
	const testWindow: Pick<
		Window,
		'open' | 'remotion_cwd' | 'remotion_editorName'
	> = {
		open: () => null,
		remotion_cwd: '/project',
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

test('sequence context menu normalizes dividers before source actions', () => {
	installTestWindow();

	const items = getSequenceContextMenuItems({
		assetLinkInfo: null,
		canOpenInEditor: false,
		codingAgentInfo: null,
		deleteDisabled: false,
		disableInteractivityDisabled: false,
		duplicateDisabled: false,
		editorInfo: null,
		includeSourceEditItems: true,
		isProgrammaticallyDuplicated: false,
		onConfigureApps: null,
		onDeleteSequenceFromSource: noop,
		onDisableSequenceInteractivity: noop,
		onDuplicateSequenceFromSource: noop,
		openInCodingAgent: noop,
		openInEditor: noop,
		originalLocation: null,
		selectAsset: noop,
		sequence: {
			documentationLink: 'https://www.remotion.dev/docs/sequence',
		} as TSequence,
		sourceActions: [renameSequenceItem],
	});

	expectNoExtraDividers(items);

	const copyContextIndex = items.findIndex(
		(item) => item.id === 'copy-context-for-agents',
	);
	const renameIndex = items.findIndex((item) => item.id === 'rename-sequence');

	expect(
		items.slice(copyContextIndex + 1, renameIndex).map((item) => item.type),
	).toEqual(['divider']);
});

test('sequence context menu shares alternate apps without repeating defaults', () => {
	installTestWindow();
	window.remotion_editorName = 'Cursor Editor';

	const openedEditors: Array<string | null> = [];
	const openedCodingAgents: Array<{
		readonly id: string;
		readonly prompt: string | null;
	}> = [];
	let configured = false;
	const items = getSequenceContextMenuItems({
		assetLinkInfo: null,
		canOpenInEditor: true,
		codingAgentInfo: {
			defaultCodingAgent: 'cursor',
			installedCodingAgents: [
				{
					id: 'cursor',
					name: 'Cursor',
					nameWithType: 'Cursor Agent',
					iconDataUrl: null,
				},
				{
					id: 'claude-code',
					name: 'Claude Code',
					nameWithType: 'Claude Code',
					iconDataUrl: null,
				},
			],
		},
		deleteDisabled: false,
		disableInteractivityDisabled: false,
		duplicateDisabled: false,
		editorInfo: {
			defaultEditor: 'cursor',
			installedEditors: [
				{
					id: 'cursor',
					name: 'Cursor',
					nameWithType: 'Cursor Editor',
				},
				{id: 'vscode', name: 'Code', nameWithType: 'Code'},
			],
		},
		includeSourceEditItems: false,
		isProgrammaticallyDuplicated: false,
		onConfigureApps: () => {
			configured = true;
		},
		onDeleteSequenceFromSource: noop,
		onDisableSequenceInteractivity: noop,
		onDuplicateSequenceFromSource: noop,
		openInCodingAgent: (codingAgentId, _codingAgentName, prompt) => {
			openedCodingAgents.push({id: codingAgentId, prompt});
		},
		openInEditor: (editorId) => {
			openedEditors.push(editorId);
		},
		originalLocation: {
			column: 2,
			line: 10,
			source: '/project/src/Video.tsx',
		},
		selectAsset: noop,
		sequence: {displayName: 'Intro card'} as TSequence,
	});

	expect(items.slice(0, 3).map((item) => item.id)).toEqual([
		'open-in-editor',
		'open-in-default-coding-agent',
		'open-in-another-app',
	]);
	expect(items[0]?.type === 'item' ? items[0].label : null).toBe(
		'Open in Cursor Editor',
	);
	expect(items[1]?.type === 'item' ? items[1].label : null).toBe(
		'Open in Cursor Agent',
	);
	const openIn = items.find((item) => item.id === 'open-in-another-app');
	if (openIn?.type !== 'item' || openIn.subMenu === null) {
		throw new Error('Expected Open in submenu');
	}

	const submenuIds = openIn.subMenu.items.map((item) => item.id);
	expect(submenuIds).toContain('open-in-vscode');
	expect(submenuIds).toContain('open-in-coding-agent-claude-code');
	expect(submenuIds).toContain('change-default-apps');
	expect(submenuIds).not.toContain('open-in-cursor');
	expect(submenuIds).not.toContain('open-in-coding-agent-cursor');

	const defaultAgent = items.find(
		(item) => item.id === 'open-in-default-coding-agent',
	);
	if (defaultAgent?.type !== 'item') {
		throw new Error('Expected default coding agent item');
	}

	defaultAgent.onClick('open-in-default-coding-agent', null);
	const claudeCode = openIn.subMenu.items.find(
		(item) => item.id === 'open-in-coding-agent-claude-code',
	);
	if (claudeCode?.type !== 'item') {
		throw new Error('Expected Claude Code menu item');
	}

	claudeCode.onClick('open-in-coding-agent-claude-code', null);
	const configure = openIn.subMenu.items.find(
		(item) => item.id === 'change-default-apps',
	);
	if (configure?.type !== 'item') {
		throw new Error('Expected configure apps item');
	}

	configure.onClick('change-default-apps', null);
	expect(openedEditors).toEqual([]);
	expect(openedCodingAgents).toEqual([
		{id: 'cursor', prompt: 'Intro card in src/Video.tsx:10'},
		{id: 'claude-code', prompt: 'Intro card in src/Video.tsx:10'},
	]);
	expect(configured).toBe(true);
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
		codingAgentInfo: null,
		deleteDisabled: false,
		disableInteractivityDisabled: false,
		duplicateDisabled: false,
		editorInfo: null,
		includeSourceEditItems: true,
		isProgrammaticallyDuplicated: false,
		onConfigureApps: null,
		onDeleteSequenceFromSource: noop,
		onDisableSequenceInteractivity: noop,
		onDuplicateSequenceFromSource: noop,
		openInCodingAgent: noop,
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

	const copySvgIndex = items.findIndex((item) => item.id === 'copy-svg');
	expect(items[copySvgIndex + 1]?.type).toBe('divider');
});

test('programmatically duplicated sequence menus apply actions to all instances', () => {
	installTestWindow();

	const items = getSequenceContextMenuItems({
		assetLinkInfo: null,
		canOpenInEditor: false,
		codingAgentInfo: null,
		deleteDisabled: false,
		disableInteractivityDisabled: false,
		duplicateDisabled: false,
		editorInfo: null,
		includeSourceEditItems: true,
		isProgrammaticallyDuplicated: true,
		onConfigureApps: null,
		onDeleteSequenceFromSource: noop,
		onDisableSequenceInteractivity: noop,
		onDuplicateSequenceFromSource: noop,
		openInCodingAgent: noop,
		openInEditor: noop,
		originalLocation: null,
		selectAsset: noop,
		sequence: {} as TSequence,
	});

	const duplicateItem = items.find((item) => item.id === 'duplicate-sequence');
	const deleteItem = items.find((item) => item.id === 'delete-sequence');
	if (duplicateItem?.type !== 'item' || deleteItem?.type !== 'item') {
		throw new Error('Expected duplicate and delete menu items');
	}

	expect(duplicateItem.disabled).toBe(true);
	expect(deleteItem.label).toBe('Delete all');
});

test('read-only sequence menus only contain non-mutating actions', () => {
	installTestWindow();

	const items = getSequenceContextMenuItems({
		assetLinkInfo: null,
		canOpenInEditor: false,
		codingAgentInfo: null,
		deleteDisabled: true,
		disableInteractivityDisabled: true,
		duplicateDisabled: true,
		editorInfo: null,
		includeSourceEditItems: false,
		isProgrammaticallyDuplicated: false,
		onConfigureApps: null,
		onDeleteSequenceFromSource: noop,
		onDisableSequenceInteractivity: noop,
		onDuplicateSequenceFromSource: noop,
		openInCodingAgent: noop,
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

	expect(items.map((item) => item.id)).toEqual([
		'copy-context-for-agents',
		'copy-svg',
	]);
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

test('sequence freeze frame can only be toggled while the sequence is visible', () => {
	const sequence = {
		from: 20,
		duration: 40,
		premountDisplay: 10,
		postmountDisplay: 10,
	} as TSequence;

	expect(
		isSequenceVisibleAtTimelinePosition({sequence, timelinePosition: 19}),
	).toBe(false);
	expect(
		isSequenceVisibleAtTimelinePosition({sequence, timelinePosition: 20}),
	).toBe(true);
	expect(
		isSequenceVisibleAtTimelinePosition({sequence, timelinePosition: 59}),
	).toBe(true);
	expect(
		isSequenceVisibleAtTimelinePosition({sequence, timelinePosition: 60}),
	).toBe(false);
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
