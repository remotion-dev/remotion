import React, {
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
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
import {ContextMenu} from '../ContextMenu';
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
import {useClampSequenceTimingValue} from '../Timeline/use-clamp-sequence-timing-value';
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
	const {setPropStatuses, setDragOverrides, clearDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);
	const batchSetters = useContext(Internals.VisualModeBatchSettersContext);
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
	const clear = useCallback(() => {
		clearTimingLimits();
		for (const target of targets) {
			clearDragOverrides(target.nodePath);
		}
	}, [clearDragOverrides, clearTimingLimits, targets]);
	const targetsRef = useRef(targets);
	targetsRef.current = targets;
	useEffect(() => {
		return () => {
			for (const target of targetsRef.current) {
				clearDragOverrides(target.nodePath);
			}
		};
	}, [clearDragOverrides]);
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
			if (batchSetters) {
				batchSetters.setDragOverridesBatch(updates);
			} else {
				for (const update of updates) {
					setDragOverrides(update.nodePath, update.key, update.value);
				}
			}
		},
		[
			batchSetters,
			clampTimingValue,
			editable,
			field.key,
			setDragOverrides,
			targets,
		],
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
				const clamped = targets.map((target, index) =>
					clampTimingValue(target.nodePath, field.key, nextValues[index]),
				);
				await saveSequenceProps({
					changes: targets.map((target, index) => ({
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
		[
			clampTimingValue,
			clear,
			editable,
			field,
			previewServerState,
			setPropStatuses,
			targets,
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
