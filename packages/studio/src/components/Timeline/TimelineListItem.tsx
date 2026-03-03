import React, {useCallback, useContext, useMemo} from 'react';
import type {TSequence} from 'remotion';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {TIMELINE_TRACK_SEPARATOR} from '../../helpers/colors';
import {
	getTimelineLayerHeight,
	TIMELINE_ITEM_BORDER_BOTTOM,
} from '../../helpers/timeline-layout';
import {ExpandedTracksContext} from '../ExpandedTracksProvider';
import {TimelineExpandedSection} from './TimelineExpandedSection';
import {TimelineLayerEye} from './TimelineLayerEye';
import {TimelineStack} from './TimelineStack';
import {useResolvedStack} from './use-resolved-stack';
import {useSequencePropsSubscription} from './use-sequence-props-subscription';

const SPACING = 5;

const space: React.CSSProperties = {
	width: SPACING,
	flexShrink: 0,
};

const arrowButton: React.CSSProperties = {
	background: 'none',
	border: 'none',
	color: 'white',
	cursor: 'pointer',
	padding: 0,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	width: 12,
	height: 12,
	flexShrink: 0,
	fontSize: 8,
	marginRight: 4,
	userSelect: 'none',
	outline: 'none',
	lineHeight: 1,
};

export const TimelineListItem: React.FC<{
	readonly sequence: TSequence;
	readonly nestedDepth: number;
	readonly isCompact: boolean;
}> = ({nestedDepth, sequence, isCompact}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const visualModeEnabled =
		Boolean(process.env.EXPERIMENTAL_VISUAL_MODE_ENABLED) &&
		previewServerState.type === 'connected';
	const {hidden, setHidden} = useContext(
		Internals.SequenceVisibilityToggleContext,
	);
	const {expandedTracks, toggleTrack} = useContext(ExpandedTracksContext);

	const originalLocation = useResolvedStack(sequence.stack ?? null);
	useSequencePropsSubscription(sequence, originalLocation);

	const isExpanded =
		visualModeEnabled && (expandedTracks[sequence.id] ?? false);

	const onToggleExpand = useCallback(() => {
		toggleTrack(sequence.id);
	}, [sequence.id, toggleTrack]);

	const padder = useMemo((): React.CSSProperties => {
		return {
			width: Number(SPACING * 1.5) * nestedDepth,
			flexShrink: 0,
		};
	}, [nestedDepth]);

	const isItemHidden = useMemo(() => {
		return hidden[sequence.id] ?? false;
	}, [hidden, sequence.id]);

	const onToggleVisibility = useCallback(
		(type: 'enable' | 'disable') => {
			setHidden((prev) => {
				return {
					...prev,
					[sequence.id]: type !== 'enable',
				};
			});
		},
		[sequence.id, setHidden],
	);

	const outer: React.CSSProperties = useMemo(() => {
		return {
			height:
				getTimelineLayerHeight(sequence.type === 'video' ? 'video' : 'other') +
				TIMELINE_ITEM_BORDER_BOTTOM,
			color: 'white',
			fontFamily: 'Arial, Helvetica, sans-serif',
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
			wordBreak: 'break-all',
			textAlign: 'left',
			paddingLeft: SPACING,
			borderBottom: `1px solid ${TIMELINE_TRACK_SEPARATOR}`,
		};
	}, [sequence.type]);

	const arrowStyle: React.CSSProperties = useMemo(() => {
		return {
			...arrowButton,
			transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
		};
	}, [isExpanded]);

	return (
		<>
			<div style={outer}>
				<TimelineLayerEye
					type={sequence.type === 'audio' ? 'speaker' : 'eye'}
					hidden={isItemHidden}
					onInvoked={onToggleVisibility}
				/>
				<div style={padder} />
				{sequence.parent && nestedDepth > 0 ? <div style={space} /> : null}
				{visualModeEnabled ? (
					sequence.controls ? (
						<button
							type="button"
							style={arrowStyle}
							onClick={onToggleExpand}
							aria-expanded={isExpanded}
							aria-label={`${isExpanded ? 'Collapse' : 'Expand'} track`}
						>
							<svg
								width="12"
								height="12"
								viewBox="0 0 8 8"
								style={{display: 'block'}}
							>
								<path d="M2 1L6 4L2 7Z" fill="white" />
							</svg>
						</button>
					) : (
						<div style={arrowButton} />
					)
				) : null}
				<TimelineStack
					sequence={sequence}
					isCompact={isCompact}
					originalLocation={originalLocation}
				/>
			</div>
			{visualModeEnabled && isExpanded && sequence.controls ? (
				<TimelineExpandedSection
					sequence={sequence}
					originalLocation={originalLocation}
				/>
			) : null}
		</>
	);
};
