import type {CanvasHover, CanvasSelectableOutline} from '@remotion/sdk';
import type React from 'react';
import {useContext, useEffect, useRef} from 'react';
import type {CanUpdateSequencePropStatus} from 'remotion';
import {Internals} from 'remotion';
import {isStudioInteractivityEnabled} from '../helpers/interactivity-enabled';
import {createCanvasDragPreview} from './canvas-drag-preview';
import {showNotification} from './Notifications/NotificationCenter';
import type {SelectedOutlineDragChange} from './selected-outline-drag';
import type {SelectedOutlineTarget} from './selected-outline-types';
import {commitPendingInspectorFields} from './Timeline/focus-inspector-field';
import {
	getKeyframeDisplayOffset,
	getKeyframeLocalFrame,
	getKeyframeSourceFrame,
} from './Timeline/get-timeline-keyframes';
import {getCurrentFrame} from './Timeline/imperative-state';
import {saveSequencePropsWithResult} from './Timeline/save-sequence-prop';
import {claimSelectionPointerDown} from './Timeline/should-clear-selection-on-pointer-down';
import type {
	TimelineSelection,
	TimelineSelectionInteraction,
} from './Timeline/TimelineSelection';

type InteractiveEditorSlot = NonNullable<
	ReturnType<typeof Internals.getInteractiveEditorSlot>
>;

type EditableStatus = Extract<
	CanUpdateSequencePropStatus,
	{status: 'static' | 'keyframed'}
>;

type FieldState = {
	readonly propStatus: EditableStatus;
	readonly sourceFrame: number;
	readonly startValue: unknown;
	readonly defaultValue: string | null;
	value: unknown;
};

export const InteractiveEditorConnector: React.FC<{
	readonly connectedClientId: string | null;
	readonly getLatestOutlineTargetByKey: (
		key: string,
	) => SelectedOutlineTarget | undefined;
	readonly hover: CanvasHover | null;
	readonly onSelect: (
		item: TimelineSelection,
		interaction?: TimelineSelectionInteraction,
	) => void;
	readonly selectableOutlines: readonly CanvasSelectableOutline[];
	readonly selectedSequenceKeys: ReadonlySet<string>;
	readonly setHoveredSequence: (
		update: (current: CanvasHover | null) => CanvasHover | null,
	) => void;
}> = ({
	connectedClientId,
	getLatestOutlineTargetByKey,
	hover,
	onSelect,
	selectableOutlines,
	selectedSequenceKeys,
	setHoveredSequence,
}) => {
	const {setPropStatuses, updateDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);
	const dragOverridesRef = useContext(
		Internals.VisualModeDragOverridesRefContext,
	);
	const propStatusesRef = useContext(
		Internals.VisualModePropStatusesRefContext,
	);
	const latest = useRef({
		connectedClientId,
		getLatestOutlineTargetByKey,
		onSelect,
		setHoveredSequence,
	});
	latest.current = {
		connectedClientId,
		getLatestOutlineTargetByKey,
		onSelect,
		setHoveredSequence,
	};

	const connectedSlots = useRef(
		new Map<InteractiveEditorSlot, {key: string; cancel: () => void}>(),
	);
	useEffect(() => {
		const slots = connectedSlots.current;
		return () => {
			for (const [slot, connected] of slots) {
				connected.cancel();
				slot.setConnection(null);
			}

			slots.clear();
		};
	}, []);

	useEffect(() => {
		const present = new Set<InteractiveEditorSlot>();
		for (const {key, sequence} of selectableOutlines) {
			const slot = sequence.controls
				? Internals.getInteractiveEditorSlot(sequence.controls)
				: null;
			if (slot === null) {
				continue;
			}

			present.add(slot);
			const existing = connectedSlots.current.get(slot);
			if (existing !== undefined) {
				existing.key = key;
				continue;
			}

			const connected: {key: string; cancel: () => void} = {
				key,
				cancel: () => undefined,
			};
			const controls = sequence.controls!;
			let session: {
				readonly target: SelectedOutlineTarget;
				readonly clientId: string;
				readonly preview: ReturnType<typeof createCanvasDragPreview>;
				readonly fields: Map<string, FieldState>;
				readonly rejectedFields: Set<string>;
			} | null = null;

			const start = () => {
				claimSelectionPointerDown();
				if (session !== null) {
					return;
				}

				const target = latest.current.getLatestOutlineTargetByKey(
					connected.key,
				);
				const clientId = latest.current.connectedClientId;
				if (
					target === undefined ||
					clientId === null ||
					!isStudioInteractivityEnabled() ||
					commitPendingInspectorFields()
				) {
					return;
				}

				session = {
					target,
					clientId,
					fields: new Map(),
					rejectedFields: new Set(),
					preview: createCanvasDragPreview({
						updateDragOverrides,
						setPropStatuses,
						setPropStatusesBatch: null,
						getPropStatuses: (nodePath) =>
							propStatusesRef.current[
								Internals.makeSequencePropsSubscriptionKey(nodePath)
							],
					}),
				};
			};

			const preview = (values: Readonly<Record<string, unknown>>) => {
				start();
				if (session === null) {
					return;
				}

				const {target, fields, rejectedFields} = session;
				const nodePath = target.nodePathInfo.sequenceSubscriptionKey;
				for (const [fieldKey, value] of Object.entries(values)) {
					let field = fields.get(fieldKey);
					if (field === undefined) {
						if (rejectedFields.has(fieldKey)) {
							continue;
						}

						const propStatus = Internals.getPropStatusesCtx(
							propStatusesRef.current,
							nodePath,
						)?.[fieldKey];
						const fieldSchema = controls.schema[fieldKey];
						if (
							fieldSchema === undefined ||
							!(
								propStatus?.status === 'static' ||
								(propStatus?.status === 'keyframed' &&
									propStatus.interpolationFunction === 'interpolate')
							)
						) {
							rejectedFields.add(fieldKey);
							showNotification(
								`Cannot edit "${fieldKey}": it must be a schema prop that is static or keyframed with interpolate().`,
								3000,
							);
							continue;
						}

						const sourceFrame = getKeyframeSourceFrame({
							displayFrame: getCurrentFrame(),
							keyframeDisplayOffset: getKeyframeDisplayOffset({
								propStatus,
								keyframeDisplayOffset: target.keyframeDisplayOffset,
								keyframePlaybackRate: target.keyframePlaybackRate,
							}),
							keyframePlaybackRate: target.keyframePlaybackRate,
							propStatus,
						});
						const defaultValue =
							'default' in fieldSchema ? fieldSchema.default : undefined;
						field = {
							propStatus,
							sourceFrame,
							startValue: Internals.getEffectiveVisualModeValue({
								propStatus,
								dragOverrideValue: (dragOverridesRef.current.getDragOverrides(
									nodePath,
								) ?? {})[fieldKey],
								defaultValue,
								frame: getKeyframeLocalFrame(sourceFrame, propStatus),
								shouldResortToDefaultValueIfUndefined: true,
							}),
							defaultValue:
								defaultValue === undefined
									? null
									: JSON.stringify(defaultValue),
							value: undefined,
						};
						fields.set(fieldKey, field);
					}

					field.value = value;
					session.preview.setDragOverrides(
						nodePath,
						fieldKey,
						field.propStatus.status === 'keyframed'
							? Internals.makeKeyframedDragOverride({
									status: field.propStatus,
									frame: field.sourceFrame,
									value,
								})
							: Internals.makeStaticDragOverride(value),
					);
				}
			};

			const cancel = () => {
				session?.preview.cancel();
				session = null;
			};

			connected.cancel = cancel;

			const commit = (values: Readonly<Record<string, unknown>> | null) => {
				if (values !== null) {
					preview(values);
				}

				if (session === null) {
					return;
				}

				const {target, fields, clientId, preview: dragPreview} = session;
				session = null;
				const nodePath = target.nodePathInfo.sequenceSubscriptionKey;
				const changes: SelectedOutlineDragChange[] = [];
				for (const [fieldKey, field] of fields) {
					const stringified = JSON.stringify(field.value);
					if (field.propStatus.status === 'keyframed') {
						if (stringified !== JSON.stringify(field.startValue)) {
							changes.push({
								type: 'keyframed',
								fileName: nodePath.absolutePath,
								nodePath,
								fieldKey,
								sourceFrame: field.sourceFrame,
								value: field.value,
								schema: controls.schema,
							});
						}
					} else if (
						stringified !== JSON.stringify(field.propStatus.codeValue) &&
						!(
							field.defaultValue === stringified &&
							field.propStatus.codeValue === undefined
						)
					) {
						changes.push({
							type: 'static',
							fileName: nodePath.absolutePath,
							nodePath,
							fieldKey,
							value: field.value,
							defaultValue: field.defaultValue,
							schema: controls.schema,
						});
					}
				}

				const savedNodePath = dragPreview.getNodePath(nodePath);
				if (changes.length === 0 || savedNodePath === null) {
					dragPreview.cancel();
					return;
				}

				const withNodePath = changes.map((change) => ({
					...change,
					nodePath: savedNodePath,
				}));
				saveSequencePropsWithResult({
					changes: withNodePath.filter((c) => c.type === 'static'),
					addedKeyframes: withNodePath.filter((c) => c.type === 'keyframed'),
					movedKeyframes: null,
					setPropStatuses: dragPreview.setPropStatuses,
					clientId,
					undoLabel: `Edit ${controls.componentName}`,
					redoLabel: `Edit ${controls.componentName} back`,
				})
					.then((response) => {
						if (response && !response.canUpdate) {
							throw new Error(
								'The layer could not be updated. Try the edit again.',
							);
						}

						dragPreview.acknowledge(response);
					})
					.catch((error) => {
						dragPreview.fail();
						showNotification(
							`Could not save sequence props: ${
								error instanceof Error ? error.message : String(error)
							}`,
							4000,
						);
					});
			};

			slot.setConnection({
				select: () => {
					claimSelectionPointerDown();
					const target = latest.current.getLatestOutlineTargetByKey(
						connected.key,
					);
					if (target !== undefined) {
						latest.current.onSelect(target.selection);
					}
				},
				setHovered: (hovered) => {
					const {key: currentKey} = connected;
					const target = latest.current.getLatestOutlineTargetByKey(currentKey);
					latest.current.setHoveredSequence((current) =>
						hovered && target !== undefined
							? {
									key: currentKey,
									nodePathKey: target.nodePathKey,
									source: 'canvas',
								}
							: current?.key === currentKey
								? null
								: current,
					);
				},
				start,
				preview,
				commit,
				cancel,
			});
			connectedSlots.current.set(slot, connected);
		}

		for (const [slot, {cancel}] of connectedSlots.current) {
			if (!present.has(slot)) {
				cancel();
				slot.setConnection(null);
				connectedSlots.current.delete(slot);
			}
		}
	}, [
		dragOverridesRef,
		propStatusesRef,
		selectableOutlines,
		setPropStatuses,
		updateDragOverrides,
	]);

	useEffect(() => {
		for (const {key, sequence} of selectableOutlines) {
			const slot = sequence.controls
				? Internals.getInteractiveEditorSlot(sequence.controls)
				: null;
			slot?.setState({
				selected: selectedSequenceKeys.has(key),
				hovered: hover?.key === key,
			});
		}
	}, [hover, selectableOutlines, selectedSequenceKeys]);

	return null;
};
