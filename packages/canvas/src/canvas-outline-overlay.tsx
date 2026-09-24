import type {RefObject} from 'react';
import React, {useEffect, useCallback, useMemo, useRef, useState} from 'react';
import {Internals, type TSequence} from 'remotion';
import type {CanvasController} from './canvas-controller';
import {CanvasOutlinePolygon} from './canvas-outline-polygon';
import {useCanvasHover, useCanvasSequenceHover} from './hover';
import type {CanvasOutline} from './outline-geometry';
import {handleCanvasOutlinePointerDown} from './outline-interaction';
import {
	getCanvasActiveOutlineTargets,
	getCanvasOutlineActivity,
	getCanvasOutlineLayoutTargets,
	getCanvasSelectableOutlines,
	getCanvasSelectedSequenceKeys,
	getCanvasSequenceKeysContainingSelection,
	getCanvasVisibleOutlineTargets,
	type CanvasSelectableOutline,
} from './outline-targets';
import {
	getCanvasSequenceSelectionKey,
	useCanvasSelection,
	type CanvasSelectionItem,
} from './selection';
import type {CanvasSequenceNodePathResolver} from './sequence-node-path';
import {timelineSequenceNodePathToKey} from './timeline-sequence-node-path-to-key';
import {useCanvasOutlines} from './use-canvas-outlines';
import {useCanvasRuntimeValueSnapshots} from './use-runtime-value-snapshots';
import {useSyncExternalStore} from './use-sync-external-store';

const overlayStyle: React.CSSProperties = {
	position: 'absolute',
	inset: 0,
	overflow: 'hidden',
	touchAction: 'none',
	outline: 'none',
};

const CanvasOutlineElement = React.memo(
	({
		controller,
		containerRef,
		outline,
		target,
		selectableItems,
	}: {
		readonly controller: CanvasController;
		readonly containerRef: RefObject<SVGSVGElement | null>;
		readonly outline: CanvasOutline;
		readonly target: ReturnType<typeof getCanvasOutlineLayoutTargets>[number];
		readonly selectableItems: readonly CanvasSelectionItem[];
	}) => {
		const {hovered, onPointerEnter, onPointerLeave} = useCanvasSequenceHover(
			controller.hover,
			target.nodePathInfo,
			'canvas',
		);
		const onHoverChange = useCallback(
			(key: string | null) => {
				if (key === null) {
					onPointerLeave();
				} else {
					onPointerEnter();
				}
			},
			[onPointerEnter, onPointerLeave],
		);
		const onPointerDown = useCallback(
			(event: React.PointerEvent<SVGPolygonElement>) => {
				const decision = handleCanvasOutlinePointerDown({
					event,
					polygon: event.currentTarget,
					hasTarget: true,
					selected: target.selected,
					containsSelection: target.containsSelection,
					translateWithCommandKey: false,
					isMac: false,
				});
				if (decision === null) {
					return;
				}

				containerRef.current?.focus({preventScroll: true});
				// A host with dragging may defer this selection until pointer release.
				if (decision.shouldUpdateSelection) {
					controller.selection.select(
						target.selection,
						decision.interaction,
						selectableItems,
					);
				}
			},
			[containerRef, controller.selection, selectableItems, target],
		);
		return (
			<CanvasOutlinePolygon
				outline={outline}
				directlySelected={target.selected}
				data-selected={target.selected}
				dragging={false}
				visible={target.showSelectedOutline || hovered}
				interactive
				stroke="#0b84f3"
				fill="transparent"
				onHoverChange={onHoverChange}
				onPointerDown={onPointerDown}
			/>
		);
	},
);

// Only this leaf subscribes to the frame. An idle, unselected Canvas does not
// measure its composition or render its layer list on every playback frame.
const ActiveCanvasOutlines = React.memo(
	({
		controller,
		containerRef,
		selectableOutlines,
		sequences,
		selectableItems,
		measureAll,
	}: {
		readonly controller: CanvasController;
		readonly containerRef: RefObject<SVGSVGElement | null>;
		readonly selectableOutlines: readonly CanvasSelectableOutline[];
		readonly sequences: readonly TSequence[];
		readonly selectableItems: readonly CanvasSelectionItem[];
		readonly measureAll: boolean;
	}) => {
		const frame = Internals.Timeline.useTimelinePosition();
		const {selectedItems} = useCanvasSelection(controller.selection);
		const hover = useCanvasHover(controller.hover);
		const selectedSequenceKeys = useMemo(
			() => getCanvasSelectedSequenceKeys(selectedItems),
			[selectedItems],
		);
		const sequenceKeysContainingSelection = useMemo(
			() => getCanvasSequenceKeysContainingSelection(selectedItems),
			[selectedItems],
		);
		const hoveredTimelineNodePathKey =
			hover?.source === 'timeline' ? hover.nodePathKey : null;
		const activeLayers = useMemo(
			() =>
				getCanvasActiveOutlineTargets({
					targets: selectableOutlines,
					selectedSequenceKeys,
					sequenceKeysContainingSelection,
					hoveredNodePathKey: hoveredTimelineNodePathKey,
					measureAll,
				}),
			[
				hoveredTimelineNodePathKey,
				measureAll,
				selectableOutlines,
				selectedSequenceKeys,
				sequenceKeysContainingSelection,
			],
		);
		// Subscribe before filtering by the playback frame to avoid resubscribing
		// every frame when sequences enter or leave the composition.
		const runtimeControls = useMemo(
			() =>
				activeLayers.flatMap(({sequence}) =>
					sequence.controls ? [sequence.controls] : [],
				),
			[activeLayers],
		);
		const runtimeSnapshots = useCanvasRuntimeValueSnapshots(runtimeControls);
		const valuesByStore = useMemo(
			() =>
				new Map(
					runtimeControls.map((controls, index) => [
						controls.runtimeValues,
						runtimeSnapshots[index],
					]),
				),
			[runtimeControls, runtimeSnapshots],
		);
		const targets = useMemo(
			() =>
				getCanvasOutlineLayoutTargets({
					selectableOutlines: getCanvasVisibleOutlineTargets({
						targets: activeLayers,
						timelinePosition: frame,
					}),
					selectedSequenceKeys,
					sequenceKeysContainingSelection,
					targetKey: null,
				}).map((target) => {
					const values = target.sequence.controls
						? (valuesByStore.get(target.sequence.controls.runtimeValues) ?? {})
						: {};
					const cropValue = (key: string) =>
						typeof values[key] === 'number' && Number.isFinite(values[key])
							? values[key]
							: 0;
					return {
						...target,
						crop: Internals.resolveSequenceCrop({
							cropLeft: cropValue('cropLeft'),
							cropRight: cropValue('cropRight'),
							cropTop: cropValue('cropTop'),
							cropBottom: cropValue('cropBottom'),
						}),
					};
				}),
			[
				activeLayers,
				frame,
				selectedSequenceKeys,
				sequenceKeysContainingSelection,
				valuesByStore,
			],
		);
		const {outlinesForRendering, targetsByKey} = useCanvasOutlines({
			containerRef,
			targets,
			sequences,
			hoverController: controller.hover,
			freezeOrder: false,
			updateOutlinesRef: null,
		});
		return (
			<>
				{outlinesForRendering.map((outline) => {
					const target = targetsByKey.get(outline.key);
					return target ? (
						<CanvasOutlineElement
							key={outline.key}
							controller={controller}
							containerRef={containerRef}
							outline={outline}
							target={target}
							selectableItems={selectableItems}
						/>
					) : null;
				})}
			</>
		);
	},
);

export const CanvasOutlineOverlay = React.memo(
	({
		controller,
		resolveSequenceNodePathInfo,
	}: {
		readonly controller: CanvasController;
		readonly resolveSequenceNodePathInfo: CanvasSequenceNodePathResolver;
	}) => {
		const containerRef = useRef<SVGSVGElement | null>(null);
		const [container, setContainer] = useState<SVGSVGElement | null>(null);
		const attachContainer = useCallback((element: SVGSVGElement | null) => {
			containerRef.current = element;
			setContainer(element);
		}, []);
		const [hovered, setHovered] = useState(false);
		const tracks = useSyncExternalStore(
			controller.timeline.subscribe,
			controller.timeline.getSnapshot,
			controller.timeline.getSnapshot,
		);
		const selection = useCanvasSelection(controller.selection);
		const hover = useCanvasHover(controller.hover);
		const sequences = useMemo(
			() => tracks.map(({sequence}) => sequence),
			[tracks],
		);
		const resolvedTracks = useMemo(
			() =>
				tracks.map((track, index) => ({
					...track,
					nodePathInfo: resolveSequenceNodePathInfo(track, index),
				})),
			[resolveSequenceNodePathInfo, tracks],
		);
		const selectableOutlines = useMemo(
			() =>
				getCanvasSelectableOutlines({
					tracks: resolvedTracks,
					timelinePosition: null,
					resolveSequenceNodePathInfo: null,
				}),
			[resolvedTracks],
		);
		const selectableItems = useMemo(
			() =>
				resolvedTracks.flatMap(({nodePathInfo}): CanvasSelectionItem[] =>
					nodePathInfo === null || nodePathInfo.auxiliaryKeys.length !== 0
						? []
						: [{type: 'sequence', nodePathInfo}],
				),
			[resolvedTracks],
		);
		useEffect(() => {
			controller.hover.setHoveredSequence((current) => {
				if (current === null) {
					return current;
				}

				return selectableItems.some(
					(item) =>
						item.type !== 'guide' &&
						(current.source === 'timeline'
							? timelineSequenceNodePathToKey(
									item.nodePathInfo.sequenceSubscriptionKey,
								) === current.nodePathKey
							: getCanvasSequenceSelectionKey(item.nodePathInfo) ===
								current.key),
				)
					? current
					: null;
			});
		}, [controller.hover, selectableItems]);
		useEffect(() => {
			const ownerWindow = containerRef.current?.ownerDocument.defaultView;
			const clearHover = () => {
				setHovered(false);
				controller.hover.clear(null);
			};

			ownerWindow?.addEventListener('blur', clearHover);

			return () => {
				ownerWindow?.removeEventListener('blur', clearHover);
				controller.hover.clear('canvas');
			};
		}, [controller.hover]);
		const {measurementActive, measureAllOutlines} = getCanvasOutlineActivity({
			canvasHovered: hovered,
			dragging: false,
			contextMenuOpen: false,
			hasSelection: selection.selectedItems.some(
				(item) => item.type !== 'guide',
			),
			hoveredSequence: hover,
		});
		return (
			<svg
				ref={attachContainer}
				style={overlayStyle}
				width="100%"
				height="100%"
				tabIndex={0}
				role="group"
				aria-label="Canvas selection"
				onPointerEnter={() => setHovered(true)}
				onPointerLeave={() => {
					setHovered(false);
					controller.hover.clear('canvas');
				}}
				onPointerDown={(event) => {
					if (event.button !== 0) {
						return;
					}

					event.preventDefault();
					event.stopPropagation();
					containerRef.current?.focus({preventScroll: true});
					controller.selection.clear();
				}}
				onDoubleClick={(event) => event.stopPropagation()}
				onKeyDown={(event) => {
					if (event.key === 'Escape') {
						event.preventDefault();
						event.stopPropagation();
						controller.selection.clear();
					}
				}}
			>
				{measurementActive && container !== null ? (
					<ActiveCanvasOutlines
						controller={controller}
						containerRef={containerRef}
						selectableOutlines={selectableOutlines}
						sequences={sequences}
						selectableItems={selectableItems}
						measureAll={measureAllOutlines}
					/>
				) : null}
			</svg>
		);
	},
);
