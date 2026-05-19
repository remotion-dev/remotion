import React, {useCallback, useContext, useMemo} from 'react';
import type {SequencePropsSubscriptionKey, SequenceSchema} from 'remotion';
import {Internals} from 'remotion';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import type {GetIsExpanded} from '../ExpandedTracksProvider';
import {Padder} from './Padder';
import {saveEffectProp} from './save-effect-prop';
import {TimelineExpandArrowButton} from './TimelineExpandArrowButton';
import {TimelineLayerEye, TimelineLayerEyeSpacer} from './TimelineLayerEye';

const groupRowBase: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
};

const rowLabel: React.CSSProperties = {
	fontSize: 12,
	color: 'rgba(255, 255, 255, 0.8)',
	userSelect: 'none',
};

export const TimelineEffectGroupRow: React.FC<{
	readonly label: string;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly effectIndex: number;
	readonly effectSchema: SequenceSchema;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly validatedLocation: CodePosition;
	readonly nestedDepth: number;
	readonly depth: number;
	readonly style: React.CSSProperties;
	readonly getIsExpanded: GetIsExpanded;
	readonly toggleTrack: (nodePathInfo: SequenceNodePathInfo) => void;
}> = ({
	label,
	nodePathInfo,
	effectIndex,
	effectSchema,
	nodePath,
	validatedLocation,
	nestedDepth,
	depth,
	style,
	getIsExpanded,
	toggleTrack,
}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const previewConnected = previewServerState.type === 'connected';
	const {codeValues} = useContext(Internals.VisualModeCodeValuesContext);
	const {setCodeValues} = useContext(Internals.VisualModeSettersContext);

	const effectStatus = useMemo(
		() =>
			Internals.getEffectCodeValuesCtx({
				codeValues,
				nodePath,
				effectIndex,
			}),
		[codeValues, nodePath, effectIndex],
	);

	const disabledStatus =
		effectStatus.type === 'can-update-effect'
			? (effectStatus.props?.disabled ?? null)
			: null;

	const isDisabled = useMemo(() => {
		if (disabledStatus && disabledStatus.canUpdate) {
			return Boolean(disabledStatus.codeValue);
		}

		return false;
	}, [disabledStatus]);

	const canToggle =
		previewConnected && disabledStatus !== null && disabledStatus.canUpdate;

	const onToggle = useCallback(
		(type: 'enable' | 'disable') => {
			if (!canToggle) {
				return;
			}

			const newValue = type !== 'enable';
			const fieldSchema = effectSchema.disabled;
			const defaultValue =
				fieldSchema && fieldSchema.type === 'boolean'
					? JSON.stringify(fieldSchema.default)
					: null;

			saveEffectProp({
				fileName: validatedLocation.source,
				nodePath,
				effectIndex,
				fieldKey: 'disabled',
				value: newValue,
				defaultValue,
				schema: effectSchema,
				setCodeValues,
			});
		},
		[
			canToggle,
			effectIndex,
			effectSchema,
			nodePath,
			setCodeValues,
			validatedLocation.source,
		],
	);

	const isExpanded = getIsExpanded(nodePathInfo);
	const mergedStyle = useMemo(
		(): React.CSSProperties => ({...groupRowBase, ...style}),
		[style],
	);

	return (
		<div style={mergedStyle}>
			{canToggle ? (
				<TimelineLayerEye
					type="effect"
					hidden={isDisabled}
					onInvoked={onToggle}
				/>
			) : (
				<TimelineLayerEyeSpacer />
			)}
			<Padder depth={nestedDepth + 1 + depth} />
			<TimelineExpandArrowButton
				isExpanded={isExpanded}
				onClick={() => toggleTrack(nodePathInfo)}
				label={`${label} section`}
				disabled={false}
			/>
			<span style={rowLabel}>{label}</span>
		</div>
	);
};
