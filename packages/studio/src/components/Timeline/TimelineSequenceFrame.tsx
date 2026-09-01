import React from 'react';
import {CURRENT_COLOR, WHITE} from '../../helpers/colors';
import {SnowflakeIcon} from '../../icons/snowflake';

const relativeFrameStyle: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	fontSize: 11,
	fontFamily: 'Arial, Helvetica, sans-serif',
	gap: 4,
	color: WHITE,
	opacity: 0.5,
	whiteSpace: 'nowrap',
	pointerEvents: 'none',
	userSelect: 'none',
};

const snowflakeStyle: React.CSSProperties = {
	flexShrink: 0,
	height: 12,
	width: 12,
};

export const TimelineSequenceFrame: React.FC<{
	readonly roundedFrame: number;
	readonly frozenFrame: number | null;
	readonly premounted: boolean;
	readonly postmounted: number | null;
}> = ({roundedFrame, frozenFrame, premounted, postmounted}) => {
	return (
		<div style={relativeFrameStyle}>
			{frozenFrame === null ? null : (
				<SnowflakeIcon style={snowflakeStyle} color={CURRENT_COLOR} />
			)}
			{frozenFrame ??
				(premounted
					? '0 (Premounted)'
					: postmounted !== null
						? `${postmounted} (Postmounted)`
						: roundedFrame)}
		</div>
	);
};
