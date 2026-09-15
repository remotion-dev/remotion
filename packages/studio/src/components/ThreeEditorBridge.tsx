import {getCanvasSequenceSelectionKey} from '@remotion/canvas';
import type React from 'react';
import {useContext, useEffect, useMemo, useSyncExternalStore} from 'react';
import {Internals} from 'remotion';
import {calculateTimeline} from '../helpers/calculate-timeline';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {showNotification} from './Notifications/NotificationCenter';
import type {AddSequenceKeyframeChange} from './Timeline/call-add-keyframe';
import {getKeyframeDisplayOffset} from './Timeline/get-timeline-keyframes';
import {
	saveSequenceProps,
	type SaveSequencePropChange,
} from './Timeline/save-sequence-prop';
import {useTimelineSelection} from './Timeline/TimelineSelection';

const POSITION_FIELDS = ['positionX', 'positionY', 'positionZ'] as const;
const ROTATION_FIELDS = ['rotationX', 'rotationY', 'rotationZ'] as const;
const SCALE_FIELDS = ['scaleX', 'scaleY', 'scaleZ'] as const;

export const ThreeEditorBridge: React.FC<{
	readonly readOnlyStudio: boolean;
}> = ({readOnlyStudio}) => {
	const {selectedItems, selectItem} = useTimelineSelection();
	const {sequences} = useContext(Internals.SequenceManager);
	const {compositions} = useContext(Internals.CompositionManager);
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const {setDragOverrides, clearDragOverrides, setPropStatuses} = useContext(
		Internals.VisualModeSettersContext,
	);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const editor = useSyncExternalStore(
		Internals.ThreeEditorStore.subscribe,
		Internals.ThreeEditorStore.getSnapshot,
	);
	const timeline = useMemo(
		() =>
			calculateTimeline({
				sequences,
				overrideIdsToNodePaths: overrideIdToNodePathMappings,
				compositions,
			}),
		[compositions, overrideIdToNodePathMappings, sequences],
	);

	const selectedItem =
		selectedItems.length === 1 && selectedItems[0]?.type === 'sequence'
			? selectedItems[0]
			: null;
	const selectedTrack =
		selectedItem === null
			? null
			: (timeline.find(
					(track) =>
						track.nodePathInfo !== null &&
						getCanvasSequenceSelectionKey(track.nodePathInfo) ===
							getCanvasSequenceSelectionKey(selectedItem.nodePathInfo),
				) ?? null);
	const selectedSequenceId =
		selectedTrack &&
		editor.registeredSequenceIds.includes(selectedTrack.sequence.id)
			? selectedTrack.sequence.id
			: null;

	useEffect(() => {
		if (selectedSequenceId === null || selectedTrack === null) {
			Internals.ThreeEditorStore.setSelectedSequence(null, null, []);
			return;
		}

		const {controls} = selectedTrack.sequence;
		const nodePath = controls
			? overrideIdToNodePathMappings[controls.overrideId]
			: null;
		const runtime = controls?.runtimeValues.getSnapshot() ?? {};
		const statuses = nodePath
			? Internals.getPropStatusesCtx(propStatuses, nodePath)
			: undefined;
		const canEdit =
			!readOnlyStudio && previewServerState.type === 'connected' && nodePath;
		const availableModes = canEdit
			? (
					[
						['translate', POSITION_FIELDS],
						['rotate', ROTATION_FIELDS],
						['scale', SCALE_FIELDS],
					] as const
				)
					.filter(([, fields]) =>
						fields.every((key) => {
							const status = statuses?.[key];
							return (
								status?.status === 'static' || status?.status === 'keyframed'
							);
						}),
					)
					.map(([mode]) => mode)
			: [];
		const referencePosition = POSITION_FIELDS.map((key) => {
			if (!controls || !selectedTrack) return undefined;
			const status = statuses?.[key];
			const sourceFrame =
				timelinePosition -
				getKeyframeDisplayOffset({
					propStatus: status,
					keyframeDisplayOffset: selectedTrack.keyframeDisplayOffset,
				});
			return Internals.computeEffectiveSchemaValuesDotNotation({
				schema: controls.schema,
				currentValue: runtime,
				overrideValues: {},
				propStatus: statuses,
				frame: Math.max(0, sourceFrame - 5),
			}).merged[key];
		});
		Internals.ThreeEditorStore.setSelectedSequence(
			selectedSequenceId,
			referencePosition.every((value) => typeof value === 'number')
				? (referencePosition as [number, number, number])
				: null,
			availableModes,
		);
	}, [
		overrideIdToNodePathMappings,
		propStatuses,
		previewServerState.type,
		readOnlyStudio,
		selectedSequenceId,
		selectedTrack,
		timelinePosition,
	]);

	useEffect(() => {
		const findTrack = (sequenceId: string) =>
			timeline.find((track) => track.sequence.id === sequenceId) ?? null;
		const valuesForMode = (
			mode: 'translate' | 'rotate' | 'scale',
			transform: {
				position: readonly [number, number, number];
				rotation: readonly [number, number, number];
				scale: readonly [number, number, number];
			},
		) => {
			const fields =
				mode === 'translate'
					? POSITION_FIELDS
					: mode === 'rotate'
						? ROTATION_FIELDS
						: SCALE_FIELDS;
			const values =
				mode === 'translate'
					? transform.position
					: mode === 'rotate'
						? transform.rotation.map((value) => (value * 180) / Math.PI)
						: transform.scale;
			return fields.map((key, index) => ({key, value: values[index]}));
		};

		const getEdit = (sequenceId: string) => {
			const track = findTrack(sequenceId);
			const controls = track?.sequence.controls;
			const nodePath = controls
				? overrideIdToNodePathMappings[controls.overrideId]
				: null;
			if (!track || !controls || !nodePath) return null;
			return {
				track,
				controls,
				nodePath,
				statuses: Internals.getPropStatusesCtx(propStatuses, nodePath),
			};
		};

		return Internals.ThreeEditorStore.setHandlers({
			select: (sequenceId) => {
				const track = findTrack(sequenceId);
				if (track?.nodePathInfo) {
					selectItem({type: 'sequence', nodePathInfo: track.nodePathInfo});
				}
			},
			preview: (sequenceId, mode, transform, _frame) => {
				const edit = getEdit(sequenceId);
				if (!edit) return;
				for (const {key, value} of valuesForMode(mode, transform)) {
					const status = edit.statuses?.[key];
					if (status?.status === 'keyframed') {
						const sourceFrame =
							timelinePosition -
							getKeyframeDisplayOffset({
								propStatus: status,
								keyframeDisplayOffset: edit.track.keyframeDisplayOffset,
							});
						setDragOverrides(
							edit.nodePath,
							key,
							Internals.makeKeyframedDragOverride({
								status,
								frame: sourceFrame,
								value,
							}),
						);
					} else if (status?.status === 'static') {
						setDragOverrides(
							edit.nodePath,
							key,
							Internals.makeStaticDragOverride(value),
						);
					}
				}
			},
			commit: (sequenceId, mode, transform, _frame) => {
				const edit = getEdit(sequenceId);
				const clientId =
					previewServerState.type === 'connected'
						? previewServerState.clientId
						: null;
				if (!edit || !clientId) {
					showNotification('3D source editing is unavailable', 4000);
					return;
				}

				const staticChanges: SaveSequencePropChange[] = [];
				const keyframedChanges: AddSequenceKeyframeChange[] = [];
				for (const {key, value} of valuesForMode(mode, transform)) {
					const status = edit.statuses?.[key];
					const field = edit.controls.schema[key];
					if (!status || !field) continue;
					if (status.status === 'keyframed') {
						const sourceFrame =
							timelinePosition -
							getKeyframeDisplayOffset({
								propStatus: status,
								keyframeDisplayOffset: edit.track.keyframeDisplayOffset,
							});
						keyframedChanges.push({
							fileName: edit.nodePath.absolutePath,
							nodePath: edit.nodePath,
							fieldKey: key,
							sourceFrame,
							value,
							schema: edit.controls.schema,
						});
					} else if (status.status === 'static') {
						staticChanges.push({
							fileName: edit.nodePath.absolutePath,
							nodePath: edit.nodePath,
							fieldKey: key,
							value,
							defaultValue:
								'default' in field && field.default !== undefined
									? JSON.stringify(field.default)
									: null,
							schema: edit.controls.schema,
						});
					}
				}

				saveSequenceProps({
					changes: staticChanges,
					addedKeyframes: keyframedChanges,
					movedKeyframes: null,
					setPropStatuses,
					clientId,
					undoLabel: 'Transform 3D group',
					redoLabel: 'Transform 3D group back',
				})
					.catch((error) => {
						showNotification(
							`Could not save 3D transform: ${error instanceof Error ? error.message : String(error)}`,
							4000,
						);
					})
					.finally(() => {
						clearDragOverrides(edit.nodePath);
					});
			},
		});
	}, [
		clearDragOverrides,
		overrideIdToNodePathMappings,
		previewServerState,
		propStatuses,
		selectItem,
		setDragOverrides,
		setPropStatuses,
		timeline,
		timelinePosition,
	]);

	return null;
};
