import React, {useCallback, useContext, useEffect, useState} from 'react';
import type {SequencePropsSubscriptionKey, TSequence} from 'remotion';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {BLUE} from '../../helpers/colors';
import {isStudioInteractivityEnabled} from '../../helpers/interactivity-enabled';
import {noop} from '../../helpers/noop';
import type {
	SchemaFieldInfo,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {showNotification} from '../Notifications/NotificationCenter';
import {saveSequenceProps} from '../Timeline/save-sequence-prop';
import {TimelineExpandArrowSpacer} from '../Timeline/TimelineExpandArrowButton';
import {TimelineFieldRowContent} from '../Timeline/TimelineFieldRowContent';
import {TimelineLayerEyeSpacer} from '../Timeline/TimelineLayerEye';
import {TimelineRowChrome} from '../Timeline/TimelineRowChrome';
import {
	TimelineFieldValue,
	UnsupportedStatus,
} from '../Timeline/TimelineSchemaField';
import {MultiSequenceNumberField} from './MultiSequenceNumberField';

export type MultiSequenceTarget = {
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly controls: NonNullable<TSequence['controls']>;
};

export const MultiSequenceField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly targets: MultiSequenceTarget[];
	readonly readOnlyStudio: boolean;
}> = ({field, targets, readOnlyStudio}) => {
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const {setPropStatuses, setDragOverrides, clearDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const [editingMixed, setEditingMixed] = useState(false);
	const statuses = targets.map(
		(target) =>
			Internals.getPropStatusesCtx(propStatuses, target.nodePath)?.[field.key],
	);
	const values = statuses.map((status) =>
		status?.status === 'static'
			? Internals.getEffectiveVisualModeValue({
					propStatus: status,
					dragOverrideValue: undefined,
					defaultValue: field.fieldSchema.default,
					shouldResortToDefaultValueIfUndefined: true,
				})
			: undefined,
	);
	const mixed = values.some(
		(value) => JSON.stringify(value) !== JSON.stringify(values[0]),
	);
	const staticValues = statuses.every((status) => status?.status === 'static');
	const editable =
		!readOnlyStudio &&
		isStudioInteractivityEnabled() &&
		previewServerState.type === 'connected' &&
		staticValues;
	const clear = useCallback(() => {
		for (const target of targets) {
			clearDragOverrides(target.nodePath);
		}
	}, [clearDragOverrides, targets]);
	useEffect(() => clear, [clear]);
	const preview = useCallback(
		(nextValues: unknown[]) => {
			if (!editable) {
				return;
			}

			for (const [index, target] of targets.entries()) {
				setDragOverrides(
					target.nodePath,
					field.key,
					Internals.makeStaticDragOverride(nextValues[index]),
				);
			}
		},
		[editable, field.key, setDragOverrides, targets],
	);
	const save = useCallback(
		async (
			nextValues: unknown[],
			options: Parameters<TimelineFieldOnSave>[1],
		) => {
			if (!editable || previewServerState.type !== 'connected') {
				return;
			}

			try {
				await saveSequenceProps({
					changes: targets.map((target, index) => ({
						fileName: target.nodePath.absolutePath,
						nodePath: target.nodePath,
						fieldKey: field.key,
						value: nextValues[index],
						defaultValue:
							field.typeName === 'text-content' ||
							field.fieldSchema.default === undefined
								? null
								: JSON.stringify(field.fieldSchema.default),
						schema: target.controls.schema,
						sourceEdit: options?.sourceEdit,
					})),
					addedKeyframes: null,
					movedKeyframes: null,
					setPropStatuses,
					clientId: previewServerState.clientId,
					undoLabel: `Update ${field.description ?? field.key} on selected sequences`,
					redoLabel: `Update ${field.description ?? field.key} on selected sequences again`,
				});
				setEditingMixed(false);
			} catch (err) {
				showNotification(
					`Could not save shared control: ${(err as Error).message}`,
					3000,
				);
			} finally {
				clear();
			}
		},
		[clear, editable, field, previewServerState, setPropStatuses, targets],
	);
	let content: React.ReactNode;
	if (!editable) {
		content = (
			<UnsupportedStatus
				formattedValue={staticValues}
				label={
					!staticValues
						? statuses.some((status) => !status)
							? 'Loading…'
							: statuses.some((status) => status?.status === 'computed')
								? 'Computed'
								: 'Keyframed'
						: mixed
							? 'Mixed'
							: String(values[0] ?? '')
				}
			/>
		);
	} else if (
		(field.typeName === 'number' &&
			values.every(
				(value) => typeof value === 'number' && Number.isFinite(value),
			)) ||
		(field.typeName === 'translate' &&
			values.every(
				(value) =>
					typeof value === 'string' &&
					/^-?\d+(?:\.\d+)?px(?:\s+-?\d+(?:\.\d+)?px){0,2}$/.test(value),
			))
	) {
		content = (
			<MultiSequenceNumberField
				field={field}
				values={values}
				onPreview={preview}
				onSave={(next) => save(next, undefined)}
				onClear={clear}
			/>
		);
	} else if (mixed && !editingMixed) {
		content = (
			<button
				type="button"
				style={{
					appearance: 'none',
					border: 'none',
					background: 'none',
					color: BLUE,
					fontSize: 12,
					padding: 0,
				}}
				title="Set a value for all selected sequences"
				onClick={() => setEditingMixed(true)}
			>
				Mixed
			</button>
		);
	} else {
		content = (
			<>
				{mixed ? <span style={{fontSize: 12}}>Mixed · </span> : null}
				<TimelineFieldValue
					field={field}
					effectiveValue={values[0]}
					propStatus={{
						status: 'static',
						keyframeDisplayOffsetAdjustment: null,
						codeValue: mixed ? undefined : values[0],
					}}
					scaleLockNodePath={
						field.typeName === 'text-content' ? null : targets[0].nodePath
					}
					onSave={(value, options) =>
						save(
							targets.map(() => value),
							options,
						)
					}
					onDragValueChange={(value) => preview(targets.map(() => value))}
					onDragEnd={clear}
				/>
			</>
		);
	}

	return (
		<TimelineRowChrome
			depth={0}
			eye={<TimelineLayerEyeSpacer />}
			arrow={<TimelineExpandArrowSpacer />}
			style={{minHeight: field.rowHeight}}
			selected={false}
			selectable={false}
			onSelect={noop}
			showSelectedBackground={false}
			containsSelection={false}
			outerHeight={null}
		>
			<TimelineFieldRowContent field={field} rowDepth={0} selected={false}>
				{content}
			</TimelineFieldRowContent>
		</TimelineRowChrome>
	);
};
