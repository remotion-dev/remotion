import React, {useCallback, useMemo} from 'react';
import {TSequence} from 'remotion';
import {
	TIMELINE_BORDER,
	TIMELINE_LAYER_HEIGHT,
	TIMELINE_PADDING,
} from '../../helpers/timeline-layout';
import {TimelineActionState} from './timeline-state-reducer';

const HOOK_WIDTH = 7;
const BORDER_BOTTOM_LEFT_RADIUS = 2;
const SPACING = 5;

const outer: React.CSSProperties = {
	height: TIMELINE_LAYER_HEIGHT + TIMELINE_BORDER * 2,
	color: 'white',
	fontFamily: 'Arial, Helvetica, sans-serif',
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	fontSize: 13,
	paddingLeft: TIMELINE_PADDING,
};

const hookContainer: React.CSSProperties = {
	height: TIMELINE_LAYER_HEIGHT,
	width: HOOK_WIDTH,
	position: 'relative',
};

const hook: React.CSSProperties = {
	borderLeft: '1px solid #555',
	borderBottom: '1px solid #555',
	borderBottomLeftRadius: BORDER_BOTTOM_LEFT_RADIUS,
	width: HOOK_WIDTH,
	position: 'absolute',
	bottom: TIMELINE_LAYER_HEIGHT / 2 - 1,
};

const space: React.CSSProperties = {
	width: SPACING,
};

const smallSpace: React.CSSProperties = {
	width: SPACING * 0.5,
};

const collapser: React.CSSProperties = {
	width: 20,
};

export const TimelineListItem: React.FC<{
	sequence: TSequence;
	nestedDepth: number;
	beforeDepth: number;
	collapsed: boolean;
	dispatchStateChange: React.Dispatch<TimelineActionState>;
	hash: string;
	canCollapse: boolean;
}> = ({
	nestedDepth,
	sequence,
	collapsed,
	beforeDepth,
	dispatchStateChange,
	hash,
	canCollapse,
}) => {
	const leftOffset = HOOK_WIDTH + SPACING * 1.5;
	const hookStyle = useMemo(() => {
		return {
			...hook,
			height:
				TIMELINE_LAYER_HEIGHT +
				BORDER_BOTTOM_LEFT_RADIUS / 2 -
				(beforeDepth === nestedDepth ? 2 : 12),
		};
	}, [beforeDepth, nestedDepth]);

	const padder = useMemo((): React.CSSProperties => {
		return {
			width: leftOffset * (nestedDepth - 1),
		};
	}, [leftOffset, nestedDepth]);

	const toggleCollapse = useCallback(() => {
		if (collapsed) {
			dispatchStateChange({
				type: 'expand',
				hash,
			});
		} else {
			dispatchStateChange({
				type: 'collapse',
				hash,
			});
		}
	}, [collapsed, dispatchStateChange, hash]);

	return (
		<div style={outer}>
			{canCollapse ? (
				<div style={collapser} onClick={toggleCollapse}>
					{collapsed ? '+' : '-'}
				</div>
			) : (
				<div style={collapser} />
			)}
			<div style={padder} />
			{sequence.parent && nestedDepth > 0 ? (
				<>
					<div style={smallSpace} />
					<div style={hookContainer}>
						<div style={hookStyle} />
					</div>
					<div style={space} />
				</>
			) : null}
			{sequence.displayName}
		</div>
	);
};
