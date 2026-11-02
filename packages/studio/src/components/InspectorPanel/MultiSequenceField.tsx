import React, {useCallback, useContext, useState} from 'react';
import type {SequencePropsSubscriptionKey, TSequence} from 'remotion';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {BLUE} from '../../helpers/colors';
import {isStudioInteractivityEnabled} from '../../helpers/interactivity-enabled';
import {noop} from '../../helpers/noop';
import type {
	SchemaFieldInfo,
	TimelineFieldOnSave,
	TimelineFieldOnDragEnd,
} from '../../helpers/timeline-layout';
import {ContextMenu} from '../ContextMenu';
import {showNotification} from '../Notifications/NotificationCenter';
import {saveSequencePropsWithResult} from '../Timeline/save-sequence-prop';
import {TimelineExpandArrowSpacer} from '../Timeline/TimelineExpandArrowButton';
import {TimelineFieldRowContent} from '../Timeline/TimelineFieldRowContent';
import {TimelineLayerEyeSpacer} from '../Timeline/TimelineLayerEye';
import {TimelineRowChrome} from '../Timeline/TimelineRowChrome';
import {
	TimelineFieldValue,
	UnsupportedStatus,
} from '../Timeline/TimelineSchemaField';
import {useClampSequenceTimingValue} from '../Timeline/use-clamp-sequence-timing-value';
import {useSequencePropPreview} from '../Timeline/use-sequence-prop-preview';
import {useTimelineFieldEdit} from '../Timeline/use-timeline-field-edit';
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
	const defaultPremountInSeconds = useContext(Internals.DefaultPremountContext);
	const video = Internals.useVideo();
	const {clampTimingValue, clearTimingLimits} = useClampSequenceTimingValue();
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const {setPropStatuses, updateDragOverridesBatch} = useContext(
		Internals.VisualModeSettersContext,
	);
	const {getPreview, takePreview, cancelPreview} = useSequencePropPreview();
	const {markEdit, finishEdit} = useTimelineFieldEdit();
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const [editingMixed, setEditingMixed] = useState(false);
	const statuses = targets.map(
		(target) =>
			Internals.getPropStatusesCtx(propStatuses, target.nodePath)?.[field.key],
	);
	const inherited = statuses.map(
		(status) =>
			field.key === 'premountFor' &&
			field.fieldSchema.default === undefined &&
			status?.status === 'static' &&
			status.codeValue === undefined,
	);
	const values = statuses.map((status, index) => {
		const fps = targets[index].nodePath.videoConfigValues?.fps ?? video?.fps;
		return status?.status === 'static'
			? Internals.getEffectiveVisualModeValue({
					propStatus: status,
					dragOverrideValue: undefined,
					defaultValue:
						inherited[index] && fps !== undefined
							? Math.round(defaultPremountInSeconds * fps)
							: field.fieldSchema.default,
					shouldResortToDefaultValueIfUndefined: true,
				})
			: undefined;
	});
	const mixed = values.some(
		(value, index) =>
			JSON.stringify(value) !== JSON.stringify(values[0]) ||
			inherited[index] !== inherited[0],
	);
	const staticValues = statuses.every((status) => status?.status === 'static');
	const editable =
		!readOnlyStudio &&
		isStudioInteractivityEnabled() &&
		previewServerState.type === 'connected' &&
		staticValues;
	const clear = useCallback<TimelineFieldOnDragEnd>(
		(reason) => {
			if (reason === 'commit') return;
			markEdit();
			clearTimingLimits();
			cancelPreview();
		},
		[cancelPreview, clearTimingLimits, markEdit],
	);
	const preview = useCallback(
		(nextValues: unknown[]) => {
			if (!editable || targets.length === 0) {
				return;
			}

			const clamped = targets.map((target, index) =>
				clampTimingValue(target.nodePath, field.key, nextValues[index]),
			);
			const updates = targets.map((target, index) => ({
				nodePath: target.nodePath,
				key: field.key,
				value: Internals.makeStaticDragOverride(clamped[index]),
			}));
			markEdit();
			getPreview().setDragOverridesBatch(updates, updateDragOverridesBatch);
		},
		[
			getPreview,
			markEdit,
			updateDragOverridesBatch,
			clampTimingValue,
			editable,
			field.key,
			targets,
		],
	);
	const save = useCallback(
		(nextValues: unknown[], options: Parameters<TimelineFieldOnSave>[1]) => {
			if (!editable || previewServerState.type !== 'connected') {
				clear('cancel');
				return Promise.resolve();
			}

			markEdit();
			const owner = takePreview();
			const currentTargets = targets.flatMap((target) => {
				const nodePath = owner.getNodePath(target.nodePath);
				return nodePath === null ? [] : [{...target, nodePath}];
			});
			if (currentTargets.length !== targets.length) {
				owner.cancel();
				clearTimingLimits();
				return Promise.resolve();
			}

			const clamped = currentTargets.map((target, index) =>
				clampTimingValue(target.nodePath, field.key, nextValues[index]),
			);
			clearTimingLimits();
			const preparesSource =
				options?.sourceEdit?.type === 'google-font' ||
				options?.sourceEdit?.type === 'clipboard-param';
			if (!preparesSource)
				owner.setDragOverridesBatch(
					targets.map((target, index) => ({
						nodePath: target.nodePath,
						key: field.key,
						value: Internals.makeStaticDragOverride(clamped[index]),
					})),
					updateDragOverridesBatch,
				);
			return finishEdit(
				saveSequencePropsWithResult({
					changes: currentTargets.map((target, index) => ({
						fileName: target.nodePath.absolutePath,
						nodePath: target.nodePath,
						fieldKey: field.key,
						value: clamped[index],
						defaultValue:
							field.typeName === 'string' ||
							field.typeName === 'text-content' ||
							field.fieldSchema.default === undefined
								? null
								: JSON.stringify(field.fieldSchema.default),
						schema: target.controls.schema,
						sourceEdit: options?.sourceEdit,
					})),
					addedKeyframes: null,
					movedKeyframes: null,
					setPropStatuses: preparesSource
						? setPropStatuses
						: owner.setPropStatuses,
					clientId: previewServerState.clientId,
					undoLabel: `Update ${field.description ?? field.key} on selected sequences`,
					redoLabel: `Update ${field.description ?? field.key} on selected sequences again`,
				})
					.then((response) => {
						if (response && !response.canUpdate)
							throw new Error(
								'The layers could not be updated. Try the edit again.',
							);
						owner.acknowledge(response);
					})
					.catch((error) => {
						owner.fail();
						showNotification(
							`Could not save shared control: ${error instanceof Error ? error.message : String(error)}`,
							3000,
						);
					}),
				() => setEditingMixed(false),
			);
		},
		[
			editable,
			previewServerState,
			clear,
			markEdit,
			takePreview,
			targets,
			clampTimingValue,
			clearTimingLimits,
			field,
			updateDragOverridesBatch,
			finishEdit,
			setPropStatuses,
		],
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
				forceMixed={inherited.some((value) => value !== inherited[0])}
				inherited={inherited.every(Boolean)}
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
				aria-label="Set a value for all selected sequences"
				onClick={() => {
					markEdit();
					setEditingMixed(true);
				}}
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
						field.typeName === 'string' || field.typeName === 'text-content'
							? null
							: targets[0].nodePath
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

	const row = (
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
			showBottomBorder={false}
		>
			<TimelineFieldRowContent field={field} rowDepth={0} selected={false}>
				{content}
			</TimelineFieldRowContent>
		</TimelineRowChrome>
	);
	if (field.key !== 'premountFor' || field.fieldSchema.default !== undefined) {
		return row;
	}

	return (
		<ContextMenu
			getItems={() => [
				{
					type: 'item',
					id: 'reset-premount-for',
					keyHint: null,
					label: 'Reset',
					leftItem: null,
					disabled: !editable || inherited.every(Boolean),
					onClick: () =>
						save(
							targets.map(() => undefined),
							undefined,
						),
					quickSwitcherLabel: null,
					subMenu: null,
					value: 'reset-premount-for',
				},
			]}
		>
			{row}
		</ContextMenu>
	);
};
