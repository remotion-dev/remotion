import {expect, test} from 'bun:test';
import {cleanup, render} from '@testing-library/react';
import React, {useMemo} from 'react';
import type {TSequence} from 'remotion';
import {Internals} from 'remotion';
import type {
	SelectedOutlineLayoutTarget,
	SelectedOutlineRotationDragTarget,
	SelectedOutlineTarget,
} from '../components/selected-outline-types';
import {SelectedOutlineRenderer} from '../components/SelectedOutlineRenderer';
import {SettingsProvider} from '../components/SettingsContext';
import {TimelineSelectionProvider} from '../components/Timeline/TimelineSelection';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';
import {KeybindingContextProvider} from '../state/keybindings';

const nodePathInfo = (id: string): SequenceNodePathInfo => ({
	sequenceSubscriptionKey: {
		absolutePath: '/project/src/ParentRotationSelectionRepro.tsx',
		nodePath: [id],
		sequenceKeys: ['from', 'durationInFrames'],
		effectKeys: [],
		videoConfigValues: null,
	},
	auxiliaryKeys: [],
	index: 0,
	numberOfSequencesWithThisNodePath: 1,
	supportsEffects: false,
});

const sequence = (id: string, parent: string | null): TSequence =>
	({
		id,
		parent,
		displayName: id,
		from: 0,
		duration: 90,
		trimBefore: null,
		sequencePlaybackRate: 1,
		documentationLink: null,
		showInTimeline: true,
		timelineOrder: null,
		loopDisplay: undefined,
		getStack: () => null,
		premountDisplay: null,
		postmountDisplay: null,
		controls: null,
		refForOutline: null,
		effects: [],
		effectRuntimeValues: null,
		isInsideSeries: false,
		frozenFrame: null,
	}) as unknown as TSequence;

const setBox = (
	element: HTMLElement,
	box: {left: number; top: number; width: number; height: number},
) => {
	Object.defineProperty(element, 'getBoundingClientRect', {
		configurable: true,
		value: () => ({
			x: box.left,
			y: box.top,
			left: box.left,
			top: box.top,
			right: box.left + box.width,
			bottom: box.top + box.height,
			width: box.width,
			height: box.height,
			toJSON() {
				return this;
			},
		}),
	});
	Object.defineProperty(element, 'offsetWidth', {
		configurable: true,
		value: box.width,
	});
	Object.defineProperty(element, 'offsetHeight', {
		configurable: true,
		value: box.height,
	});
};

const layoutTarget = ({
	id,
	parent,
	ref,
	selectedForRotation,
}: {
	id: string;
	parent: string | null;
	ref: React.RefObject<HTMLElement | null>;
	selectedForRotation: boolean;
}): SelectedOutlineLayoutTarget => {
	const info = nodePathInfo(id);
	return {
		crop: {left: 0, right: 0, top: 0, bottom: 0},
		depth: parent === null ? 0 : 1,
		key: id,
		keyframeDisplayOffset: 0,
		keyframePlaybackRate: 1,
		nodePathInfo: info,
		nodePathKey: id,
		registeredNodePathInfo: info,
		ref,
		selected: selectedForRotation,
		containsSelection: selectedForRotation,
		showSelectedOutline: true,
		selectedForCrop: false,
		selectedForRotation,
		selectedForTransformOrigin: false,
		selectedForUvHandles: false,
		transformOriginValue: '50% 50%',
		selection: {type: 'sequence', nodePathInfo: info},
		sequence: sequence(id, parent),
	};
};

test('a parent rotation surface is hit before a child outline', () => {
	const root = Internals.portalNode();
	const parent = document.createElement('div');
	const child = document.createElement('div');
	setBox(root, {left: 0, top: 0, width: 1280, height: 720});
	setBox(parent, {left: 240, top: 160, width: 800, height: 400});
	setBox(child, {left: 240, top: 160, width: 520, height: 400});
	root.append(parent, child);
	const parentRef = {current: parent};
	const childRef = {current: child};
	const targets = [
		layoutTarget({
			id: 'parent',
			parent: null,
			ref: parentRef,
			selectedForRotation: true,
		}),
		layoutTarget({
			id: 'child',
			parent: 'parent',
			ref: childRef,
			selectedForRotation: false,
		}),
	];

	const Harness = () => {
		const outlineTargets = useMemo(() => targets, []);
		const getLatestOutlineTargetByKey = useMemo(() => {
			return (key: string) => {
				const target = outlineTargets.find((item) => item.key === key);
				if (target === undefined) {
					return undefined;
				}

				return {
					...target,
					canCrop: false,
					pathDrag: null,
					cropDrag: null,
					drag: null,
					scaleDrag: null,
					rotationDrag:
						key === 'parent'
							? ({
									transform3DMode: false,
								} as SelectedOutlineRotationDragTarget)
							: null,
					transformOriginDrag: null,
				} as SelectedOutlineTarget;
			};
		}, [outlineTargets]);
		const connection = useMemo(
			() => ({
				previewServerState: {type: 'init' as const},
				configFileChangeRevision: 0,
				restartRequired: false,
				subscribeToEvent: () => () => undefined,
			}),
			[],
		);

		return (
			<StudioServerConnectionCtx.Provider value={connection}>
				<KeybindingContextProvider>
					<SettingsProvider>
						<TimelineSelectionProvider>
							<SelectedOutlineRenderer
								compositionHeight={720}
								compositionWidth={1280}
								dragging={false}
								getAllDragTargets={() => []}
								getLatestOutlineTargetByKey={getLatestOutlineTargetByKey}
								outlineTargets={outlineTargets}
								onContextMenuOpenChange={() => undefined}
								onDraggingChange={() => undefined}
								onSelect={() => undefined}
								scale={1}
								sequences={[
									{id: 'parent', parent: null},
									{id: 'child', parent: 'parent'},
								]}
							/>
						</TimelineSelectionProvider>
					</SettingsProvider>
				</KeybindingContextProvider>
			</StudioServerConnectionCtx.Provider>
		);
	};

	try {
		render(<Harness />);
		const svg = document.querySelector('svg');
		expect(svg).not.toBeNull();
		const paintOrder = [...svg!.querySelectorAll('polygon')].flatMap(
			(polygon) => {
				if (polygon.hasAttribute('data-remotion-studio-canvas-rotation')) {
					return ['rotation'];
				}

				const key = polygon.getAttribute('data-remotion-canvas-outline-key');
				return key === null ? [] : [key];
			},
		);
		expect(paintOrder).toContain('parent');
		expect(paintOrder).toContain('child');
		expect(paintOrder).toContain('rotation');
		expect(paintOrder.indexOf('child')).toBeGreaterThan(
			paintOrder.indexOf('parent'),
		);
		expect(paintOrder.indexOf('rotation')).toBeGreaterThan(
			paintOrder.indexOf('child'),
		);
	} finally {
		cleanup();
		parent.remove();
		child.remove();
	}
});
