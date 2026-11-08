import React, {useContext, useEffect, useRef} from 'react';
import type {
	InteractivitySchema,
	RuntimeValueStore,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {Internals} from 'remotion';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {canUseEffectOperations} from '../../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {useRuntimeStoreValue} from '../../helpers/use-runtime-values';
import {showNotification} from '../Notifications/NotificationCenter';
import {saveEffectProp} from '../Timeline/save-effect-prop';
import {CurvesControl, type CurvePoints} from './CurvesControl';
import {EffectHistogram} from './EffectHistogram';

export const CurvesEditor: React.FC<{
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly effectIndex: number;
	readonly schema: InteractivitySchema;
	readonly validatedLocation: CodePosition;
	readonly runtimeValueStore: RuntimeValueStore | null;
	readonly multipleInstances: boolean;
}> = ({
	nodePath,
	effectIndex,
	schema,
	validatedLocation,
	runtimeValueStore,
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
	const runtimeValues = {
		points: useRuntimeStoreValue(runtimeValueStore, 'points'),
		channel: useRuntimeStoreValue(runtimeValueStore, 'channel'),
		interpolation: useRuntimeStoreValue(runtimeValueStore, 'interpolation'),
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
	const getDefault = (key: string) =>
		schema[key]?.type === 'hidden' ? undefined : schema[key]?.default;
	const getValue = (key: keyof typeof runtimeValues) => {
		const status = getStatus(key);
		if (!status || status.status !== 'static')
			return runtimeValues[key] ?? getDefault(key);
		return Internals.getEffectiveVisualModeValue({
			propStatus: status,
			dragOverrideValue: overrides[key],
			defaultValue: getDefault(key),
			frame: 0,
			shouldResortToDefaultValueIfUndefined: true,
		});
	};

	const points = (getValue('points') ?? [
		[0, 0],
		[1, 1],
	]) as CurvePoints;
	const rawChannel = getValue('channel');
	const channel =
		rawChannel === 'red' || rawChannel === 'green' || rawChannel === 'blue'
			? rawChannel
			: 'rgb';
	const interpolation =
		getValue('interpolation') === 'linear' ? 'linear' : 'smooth';
	const disabled = Boolean(getValue('disabled'));
	const editable =
		!disabled &&
		canUseEffectOperations() &&
		previewServerState.type === 'connected' &&
		getStatus('points')?.status === 'static';

	useEffect(() => {
		const cleanupNodePath = nodePathRef.current;
		return () => clearEffectDragOverrides(cleanupNodePath, effectIndex);
	}, [clearEffectDragOverrides, effectIndex, nodePathKey]);

	const onChange = (value: CurvePoints, commit: boolean) => {
		if (!editable || previewServerState.type !== 'connected') return;
		if (!commit) {
			setEffectDragOverrides(
				nodePath,
				effectIndex,
				'points',
				Internals.makeStaticDragOverride(value),
			);
			return;
		}

		const save = saveEffectProp({
			type: 'value',
			fileName: validatedLocation.source,
			nodePath,
			effectIndex,
			fieldKey: 'points',
			value,
			schema,
			setPropStatuses,
			clientId: previewServerState.clientId,
			defaultValue: JSON.stringify(getDefault('points')),
		});
		clearEffectDragOverrides(nodePath, effectIndex);
		save.catch((err: Error) => showNotification(err.message, 4000));
	};

	return (
		<CurvesControl
			points={points}
			channel={channel}
			interpolation={interpolation}
			editable={editable}
			onChange={onChange}
			onCancel={() => clearEffectDragOverrides(nodePath, effectIndex)}
			histogram={
				<EffectHistogram
					height="100%"
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
