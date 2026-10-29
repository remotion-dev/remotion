import React, {useContext, useEffect, useRef} from 'react';
import type {
	InteractivitySchema,
	RuntimeValueStore,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {Internals} from 'remotion';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {
	canUseEffectOperations,
	canUseKeyframeOperations,
} from '../../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {useRuntimeStoreValue} from '../../helpers/use-runtime-values';
import {showNotification} from '../Notifications/NotificationCenter';
import {callAddEffectKeyframe} from '../Timeline/call-add-keyframe';
import {
	getKeyframeDisplayOffset,
	getKeyframeLocalFrame,
	getKeyframeSourceFrame,
} from '../Timeline/get-timeline-keyframes';
import {saveEffectProp} from '../Timeline/save-effect-prop';
import {EffectHistogram} from './EffectHistogram';
import {
	LevelsControl,
	type LevelsField,
	type LevelsValues,
} from './LevelsControl';

export const LevelsEditor: React.FC<{
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly effectIndex: number;
	readonly schema: InteractivitySchema;
	readonly validatedLocation: CodePosition;
	readonly runtimeValueStore: RuntimeValueStore | null;
	readonly keyframeDisplayOffset: number;
	readonly keyframePlaybackRate: number;
	readonly multipleInstances: boolean;
}> = ({
	nodePath,
	effectIndex,
	schema,
	validatedLocation,
	runtimeValueStore,
	keyframeDisplayOffset,
	keyframePlaybackRate,
	multipleInstances,
}) => {
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const {getEffectDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {setEffectDragOverrides, clearEffectDragOverrides, setPropStatuses} =
		useContext(Internals.VisualModeSettersContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const nodePathKey = Internals.makeSequencePropsSubscriptionKey(nodePath);
	const nodePathRef = useRef(nodePath);
	nodePathRef.current = nodePath;
	const displayFrame = Internals.Timeline.useTimelinePosition();
	const runtimeValues = {
		blackPoint: useRuntimeStoreValue(runtimeValueStore, 'blackPoint'),
		whitePoint: useRuntimeStoreValue(runtimeValueStore, 'whitePoint'),
		gamma: useRuntimeStoreValue(runtimeValueStore, 'gamma'),
		outputBlack: useRuntimeStoreValue(runtimeValueStore, 'outputBlack'),
		outputWhite: useRuntimeStoreValue(runtimeValueStore, 'outputWhite'),
		channel: useRuntimeStoreValue(runtimeValueStore, 'channel'),
		disabled: useRuntimeStoreValue(runtimeValueStore, 'disabled'),
	};
	const effectStatus = Internals.getEffectPropStatusesCtx({
		propStatuses,
		nodePath,
		effectIndex,
	});
	const overrides = getEffectDragOverrides(nodePath, effectIndex);
	const getStatus = (key: string) =>
		effectStatus.type === 'can-update-effect'
			? (effectStatus.props[key] ?? null)
			: null;
	const getDefaultValue = (key: string) => {
		const fieldSchema = schema[key];
		return fieldSchema?.type === 'hidden' ? undefined : fieldSchema?.default;
	};

	const sourceFrame = (key: string) => {
		const propStatus = getStatus(key);
		return getKeyframeSourceFrame({
			displayFrame,
			keyframeDisplayOffset: getKeyframeDisplayOffset({
				propStatus,
				keyframeDisplayOffset,
				keyframePlaybackRate,
			}),
			keyframePlaybackRate,
			propStatus,
		});
	};

	const getValue = (key: keyof typeof runtimeValues) => {
		const propStatus = getStatus(key);
		if (!propStatus || propStatus.status === 'computed') {
			return runtimeValues[key] ?? getDefaultValue(key);
		}

		return Internals.getEffectiveVisualModeValue({
			propStatus,
			dragOverrideValue: overrides[key],
			defaultValue: getDefaultValue(key),
			frame: getKeyframeLocalFrame(sourceFrame(key), propStatus),
			shouldResortToDefaultValueIfUndefined: true,
		});
	};

	const values: LevelsValues = {
		blackPoint: Number(getValue('blackPoint') ?? 0),
		whitePoint: Number(getValue('whitePoint') ?? 1),
		gamma: Number(getValue('gamma') ?? 1),
		outputBlack: Number(getValue('outputBlack') ?? 0),
		outputWhite: Number(getValue('outputWhite') ?? 1),
	};
	const rawChannel = getValue('channel');
	const channel =
		rawChannel === 'red' || rawChannel === 'green' || rawChannel === 'blue'
			? rawChannel
			: 'rgb';
	const disabled = Boolean(getValue('disabled'));
	const editable = Object.fromEntries(
		Object.keys(values).map((key) => {
			const status = getStatus(key);
			return [
				key,
				!disabled &&
					canUseEffectOperations() &&
					previewServerState.type === 'connected' &&
					status !== null &&
					status.status !== 'computed' &&
					(status.status !== 'keyframed' || canUseKeyframeOperations()),
			];
		}),
	) as Record<LevelsField, boolean>;

	useEffect(() => {
		const cleanupNodePath = nodePathRef.current;
		return () => clearEffectDragOverrides(cleanupNodePath, effectIndex);
	}, [clearEffectDragOverrides, effectIndex, nodePathKey]);

	const onChange = (field: LevelsField, value: number, commit: boolean) => {
		const status = getStatus(field);
		if (
			!editable[field] ||
			!status ||
			status.status === 'computed' ||
			previewServerState.type !== 'connected'
		)
			return;
		if (!commit) {
			setEffectDragOverrides(
				nodePath,
				effectIndex,
				field,
				status.status === 'keyframed'
					? Internals.makeKeyframedDragOverride({
							status,
							frame: sourceFrame(field),
							value,
						})
					: Internals.makeStaticDragOverride(value),
			);
			return;
		}

		const common = {
			fileName: validatedLocation.source,
			nodePath,
			effectIndex,
			fieldKey: field,
			value,
			schema,
			setPropStatuses,
			clientId: previewServerState.clientId,
		};
		const save =
			status.status === 'keyframed'
				? callAddEffectKeyframe({...common, sourceFrame: sourceFrame(field)})
				: saveEffectProp({
						...common,
						type: 'value',
						defaultValue:
							getDefaultValue(field) === undefined
								? null
								: JSON.stringify(getDefaultValue(field)),
					});
		// Saving applies an optimistic value synchronously. End this preview now,
		// so a late response cannot clear a later drag's overrides.
		clearEffectDragOverrides(nodePath, effectIndex);
		save.catch((err: Error) => showNotification(err.message, 4000));
	};

	return (
		<LevelsControl
			values={values}
			editable={editable}
			onChange={onChange}
			onCancel={() => clearEffectDragOverrides(nodePath, effectIndex)}
			histogram={
				<EffectHistogram
					height={80}
					nodePath={nodePath}
					effectIndex={effectIndex}
					channel={channel}
					disabled={disabled}
					multipleInstances={multipleInstances}
				/>
			}
		/>
	);
};
