import React, {useCallback, useContext, useMemo} from 'react';
import type {SequencePropsSubscriptionKey, SequenceSchema} from 'remotion';
import {Internals} from 'remotion';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {
	EXPANDED_SECTION_PADDING_RIGHT,
	TREE_GROUP_ROW_HEIGHT,
} from '../../helpers/timeline-layout';
import type {GetIsExpanded} from '../ExpandedTracksProvider';
import {saveEffectProp} from './save-effect-prop';
import {TimelineExpandArrowButton} from './TimelineExpandArrowButton';
import {TimelineLayerEye, TimelineLayerEyeSpacer} from './TimelineLayerEye';
import {TimelineRowChrome} from './TimelineRowChrome';

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
	readonly rowDepth: number;
	readonly getIsExpanded: GetIsExpanded;
	readonly toggleTrack: (nodePathInfo: SequenceNodePathInfo) => void;
}> = ({
	label,
	nodePathInfo,
	effectIndex,
	effectSchema,
	nodePath,
	validatedLocation,
	rowDepth,
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
			if (!canToggle || previewServerState.type !== 'connected') {
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
				clientId: previewServerState.clientId,
			});
		},
		[
			canToggle,
			effectIndex,
			effectSchema,
			nodePath,
			previewServerState,
			setCodeValues,
			validatedLocation.source,
		],
	);

	const isExpanded = getIsExpanded(nodePathInfo);

	const rowStyle = useMemo(
		(): React.CSSProperties => ({
			height: TREE_GROUP_ROW_HEIGHT,
			paddingRight: EXPANDED_SECTION_PADDING_RIGHT,
		}),
		[],
	);

	return (
		<TimelineRowChrome
			depth={rowDepth}
			eye={
				canToggle ? (
					<TimelineLayerEye
						type="effect"
						hidden={isDisabled}
						onInvoked={onToggle}
					/>
				) : (
					<TimelineLayerEyeSpacer />
				)
			}
			arrow={
				<TimelineExpandArrowButton
					isExpanded={isExpanded}
					onClick={() => toggleTrack(nodePathInfo)}
					label={`${label} section`}
					disabled={false}
				/>
			}
			style={rowStyle}
		>
			<span style={rowLabel}>{label}</span>
		</TimelineRowChrome>
	);
};
