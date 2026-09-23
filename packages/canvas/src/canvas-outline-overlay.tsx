import type {RefObject} from 'react';
import React, {useEffect, useCallback, useMemo, useRef, useState} from 'react';
import {Internals} from 'remotion';
import type {CanvasController} from './canvas-controller';
import type {
	SequenceNodePathInfo,
	TimelineTrackData,
} from './get-timeline-sequence-sort-key';
import {useCanvasHover} from './hover';
import type {CanvasOutlineTarget} from './outline-geometry';
import {orderCanvasOutlinesForRendering} from './outline-order';
import {
	getCanvasSequenceSelectionKey,
	useCanvasSelection,
	type CanvasSelectionItem,
} from './selection';
import type {CanvasSequenceNodePathResolver} from './sequence-node-path';
import {timelineSequenceNodePathToKey} from './timeline-sequence-node-path-to-key';
import {useCanvasOutlineMeasurements} from './use-canvas-outline-measurements';
import {useCanvasRuntimeValueSnapshots} from './use-runtime-value-snapshots';
import {useSyncExternalStore} from './use-sync-external-store';

type OutlineLayer = {
	readonly track: TimelineTrackData;
	readonly key: string;
	readonly nodePathKey: string;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly selection: CanvasSelectionItem;
};

const overlayStyle: React.CSSProperties = {
	position: 'absolute',
	inset: 0,
	overflow: 'hidden',
	touchAction: 'none',
	outline: 'none',
};

// Only this leaf subscribes to the frame. An idle, unselected Canvas does not
// measure its composition or render its layer list on every playback frame.
const ActiveCanvasOutlines = React.memo(
	({
		controller,
		containerRef,
		layers,
		measureAll,
	}: {
		readonly controller: CanvasController;
		readonly containerRef: RefObject<SVGSVGElement | null>;
		readonly layers: readonly OutlineLayer[];
		readonly measureAll: boolean;
	}) => {
		const frame = Internals.Timeline.useTimelinePosition();
		const selection = useCanvasSelection(controller.selection);
		const hover = useCanvasHover(controller.hover);
		const selectedSourceKeys = useMemo(
			() =>
				new Set(
					selection.selectedItems.flatMap((item) =>
						item.type === 'guide'
							? []
							: [
									timelineSequenceNodePathToKey(
										item.nodePathInfo.sequenceSubscriptionKey,
									),
								],
					),
				),
			[selection.selectedItems],
		);
		const selectedKeys = useMemo(
			() =>
				new Set(
					selection.selectedItems.flatMap((item) =>
						item.type === 'guide'
							? []
							: [getCanvasSequenceSelectionKey(item.nodePathInfo)],
					),
				),
			[selection.selectedItems],
		);
		const activeLayers = useMemo(
			() =>
				layers.filter(
					({track, nodePathKey}) =>
						track.sequence.refForOutline !== null &&
						track.sequence.showInTimeline &&
						(measureAll ||
							selectedSourceKeys.has(nodePathKey) ||
							hover?.nodePathKey === nodePathKey),
				),
			[hover?.nodePathKey, layers, measureAll, selectedSourceKeys],
		);
		const runtimeControls = useMemo(
			() =>
				activeLayers.flatMap(({track}) =>
					track.sequence.controls ? [track.sequence.controls] : [],
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
		const visibleLayers = useMemo(
			() =>
				activeLayers.filter(
					({track: {sequence}}) =>
						frame >= sequence.from && frame < sequence.from + sequence.duration,
				),
			[activeLayers, frame],
		);
		const targets = useMemo(
			() =>
				visibleLayers.map((layer) => {
					const {sequence} = layer.track;
					const values = sequence.controls
						? (valuesByStore.get(sequence.controls.runtimeValues) ?? {})
						: {};
					const cropValue = (key: string) =>
						typeof values[key] === 'number' && Number.isFinite(values[key])
							? values[key]
							: 0;
					return {
						...layer,
						sequence,
						ref: sequence.refForOutline!,
						crop: Internals.resolveSequenceCrop({
							cropLeft: cropValue('cropLeft'),
							cropRight: cropValue('cropRight'),
							cropTop: cropValue('cropTop'),
							cropBottom: cropValue('cropBottom'),
						}),
						selected: selectedKeys.has(layer.key),
						containsSelection: selectedKeys.has(layer.key),
						includeOutsideContainer:
							selectedSourceKeys.has(layer.nodePathKey) ||
							hover?.nodePathKey === layer.nodePathKey,
					};
				}),
			[
				hover?.nodePathKey,
				valuesByStore,
				selectedKeys,
				selectedSourceKeys,
				visibleLayers,
			],
		);
		const outlines = useCanvasOutlineMeasurements({
			containerRef,
			targets: targets satisfies readonly CanvasOutlineTarget[],
			updateOutlinesRef: null,
		});
		const targetsByKey = useMemo(
			() => new Map(targets.map((target) => [target.key, target])),
			[targets],
		);
		const sequences = useMemo(
			() => layers.map(({track}) => track.sequence),
			[layers],
		);
		const orderedOutlines = useMemo(
			() =>
				orderCanvasOutlinesForRendering({
					outlines,
					sequences,
					targetsByKey,
				}),
			[outlines, sequences, targetsByKey],
		);
		const selectableItems = useMemo(
			() => layers.map((layer) => layer.selection),
			[layers],
		);
		useEffect(() => {
			const current = controller.hover.getSnapshot();
			if (
				current?.source === 'canvas' &&
				!outlines.some((outline) => outline.key === current.key)
			) {
				controller.hover.clear('canvas');
			}
		}, [controller.hover, outlines]);

		return (
			<>
				{orderedOutlines.map((outline) => {
					const target = targetsByKey.get(outline.key);
					if (!target) {
						return null;
					}

					const visible =
						selectedSourceKeys.has(target.nodePathKey) ||
						hover?.nodePathKey === target.nodePathKey;
					return (
						<polygon
							key={outline.key}
							data-remotion-canvas-outline-key={outline.key}
							data-selected={target.selected}
							points={outline.points
								.map((point) => `${point.x},${point.y}`)
								.join(' ')}
							fill="transparent"
							stroke="#0b84f3"
							strokeWidth={2}
							strokeOpacity={visible ? 1 : 0}
							vectorEffect="non-scaling-stroke"
							pointerEvents="all"
							onPointerEnter={() =>
								controller.hover.setHoveredSequence({
									key: target.key,
									nodePathKey: target.nodePathKey,
									source: 'canvas',
								})
							}
							onPointerLeave={() =>
								controller.hover.setHoveredSequence((current) =>
									current?.source === 'canvas' && current.key === target.key
										? null
										: current,
								)
							}
							onPointerDown={(event) => {
								if (event.button !== 0) {
									return;
								}

								event.preventDefault();
								event.stopPropagation();
								containerRef.current?.focus({preventScroll: true});
								controller.selection.select(
									target.selection,
									{
										shiftKey: event.shiftKey,
										toggleKey: event.metaKey || event.ctrlKey,
									},
									selectableItems,
								);
							}}
						/>
					);
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
		const layers = useMemo(
			() =>
				tracks.flatMap((track, index): OutlineLayer[] => {
					const nodePathInfo = resolveSequenceNodePathInfo(track, index);
					if (
						nodePathInfo === null ||
						nodePathInfo.auxiliaryKeys.length !== 0
					) {
						return [];
					}

					return [
						{
							track,
							key: getCanvasSequenceSelectionKey(nodePathInfo),
							nodePathKey: timelineSequenceNodePathToKey(
								nodePathInfo.sequenceSubscriptionKey,
							),
							nodePathInfo,
							selection: {type: 'sequence', nodePathInfo},
						},
					];
				}),
			[resolveSequenceNodePathInfo, tracks],
		);
		useEffect(() => {
			controller.hover.setHoveredSequence((current) => {
				if (current === null) {
					return current;
				}

				return layers.some((layer) =>
					current.source === 'timeline'
						? layer.nodePathKey === current.nodePathKey
						: layer.key === current.key,
				)
					? current
					: null;
			});
		}, [controller.hover, layers]);
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
		const active =
			hovered ||
			selection.selectedItems.some((item) => item.type !== 'guide') ||
			hover?.source === 'timeline';
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
				{active && container !== null ? (
					<ActiveCanvasOutlines
						controller={controller}
						containerRef={containerRef}
						layers={layers}
						measureAll={hovered}
					/>
				) : null}
			</svg>
		);
	},
);
