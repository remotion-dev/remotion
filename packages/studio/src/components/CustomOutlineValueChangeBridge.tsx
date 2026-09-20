import type React from 'react';
import {useContext, useEffect, useRef} from 'react';
import {Internals, type _InternalTypes} from 'remotion';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {showNotification} from './Notifications/NotificationCenter';
import type {SelectedOutlineLayoutTarget} from './selected-outline-types';
import type {AddSequenceKeyframeChange} from './Timeline/call-add-keyframe';
import {getKeyframeDisplayOffset} from './Timeline/get-timeline-keyframes';
import {
	saveSequenceProps,
	type SaveSequencePropChange,
} from './Timeline/save-sequence-prop';

type CustomSequenceValueChange = _InternalTypes['CustomSequenceValueChange'];

export const CustomOutlineValueChangeBridge: React.FC<{
	readonly targets: readonly SelectedOutlineLayoutTarget[];
}> = ({targets}) => {
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const {setDragOverrides, clearDragOverrides, setPropStatuses} = useContext(
		Internals.VisualModeSettersContext,
	);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const interactionRevisionRef = useRef(new Map<string, number>());

	useEffect(() => {
		const cleanups = targets.flatMap((target) => {
			const outline = target.ref.current;
			const {controls} = target.sequence;
			if (outline === null || outline instanceof Element || controls === null) {
				return [];
			}

			const nodePath = target.nodePathInfo.sequenceSubscriptionKey;
			const revisionKey = JSON.stringify(nodePath);
			const statuses = Internals.getPropStatusesCtx(propStatuses, nodePath);
			const handleChange = (change: CustomSequenceValueChange) => {
				const editableValues = Object.entries(change.values).flatMap(
					([fieldKey, value]) => {
						const status = statuses?.[fieldKey];
						const field = controls.schema[fieldKey];
						return status && field ? [{fieldKey, value, status, field}] : [];
					},
				);
				if (change.phase === 'preview') {
					interactionRevisionRef.current.set(
						revisionKey,
						(interactionRevisionRef.current.get(revisionKey) ?? 0) + 1,
					);
					for (const {fieldKey, status, value} of editableValues) {
						if (status.status === 'keyframed') {
							setDragOverrides(
								nodePath,
								fieldKey,
								Internals.makeKeyframedDragOverride({
									status,
									frame:
										timelinePosition -
										getKeyframeDisplayOffset({
											propStatus: status,
											keyframeDisplayOffset: target.keyframeDisplayOffset,
										}),
									value,
								}),
							);
						} else if (status.status === 'static') {
							setDragOverrides(
								nodePath,
								fieldKey,
								Internals.makeStaticDragOverride(value),
							);
						}
					}

					return;
				}

				const clientId =
					previewServerState.type === 'connected'
						? previewServerState.clientId
						: null;
				if (clientId === null) return;
				const changes: SaveSequencePropChange[] = [];
				const addedKeyframes: AddSequenceKeyframeChange[] = [];
				for (const {fieldKey, field, status, value} of editableValues) {
					if (status.status === 'keyframed') {
						addedKeyframes.push({
							fileName: nodePath.absolutePath,
							nodePath,
							fieldKey,
							sourceFrame:
								timelinePosition -
								getKeyframeDisplayOffset({
									propStatus: status,
									keyframeDisplayOffset: target.keyframeDisplayOffset,
								}),
							value,
							schema: controls.schema,
						});
					} else if (status.status === 'static') {
						changes.push({
							fileName: nodePath.absolutePath,
							nodePath,
							fieldKey,
							value,
							defaultValue:
								'default' in field && field.default !== undefined
									? JSON.stringify(field.default)
									: null,
							schema: controls.schema,
						});
					}
				}

				const commitRevision =
					interactionRevisionRef.current.get(revisionKey) ?? 0;
				saveSequenceProps({
					changes,
					addedKeyframes,
					movedKeyframes: null,
					setPropStatuses,
					clientId,
					undoLabel: 'Move 3D group',
					redoLabel: 'Move 3D group back',
				})
					.catch((error) => {
						showNotification(
							`Could not save 3D position: ${error instanceof Error ? error.message : String(error)}`,
							4000,
						);
					})
					.finally(() => {
						if (
							interactionRevisionRef.current.get(revisionKey) === commitRevision
						) {
							clearDragOverrides(nodePath);
						}
					});
			};

			return [outline.subscribeToValueChanges(handleChange)];
		});
		return () => cleanups.forEach((cleanup) => cleanup());
	}, [
		clearDragOverrides,
		previewServerState,
		propStatuses,
		setDragOverrides,
		setPropStatuses,
		targets,
		timelinePosition,
	]);

	return null;
};
