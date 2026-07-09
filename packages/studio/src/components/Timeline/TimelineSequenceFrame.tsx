import React from 'react';
import {CURRENT_COLOR, WHITE} from '../../helpers/colors';

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

const FreezeFrameIcon: React.FC = () => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 512 512"
			style={snowflakeStyle}
			fill={CURRENT_COLOR}
		>
			<path d="M288 32l0-32-64 0 0 88.4-64-64-39.6 39.6 103.6 103.6 0 56.4-56.4 0-103.6-103.6-39.6 39.6 64 64-88.4 0 0 64 88.4 0c-33.5 33.5-54.9 54.9-64 64L64 391.6c2.5-2.5 37.1-37.1 103.6-103.6l56.4 0 0 56.4C157.5 410.9 122.9 445.5 120.4 448L160 487.6c9.1-9.1 30.5-30.5 64-64l0 88.4 64 0 0-88.4 64 64 39.6-39.6-103.6-103.6 0-56.4 56.4 0 103.6 103.6 39.6-39.6-64-64 88.4 0 0-64-88.4 0c33.5-33.5 54.9-54.9 64-64L448 120.4c-2.5 2.5-37.1 37.1-103.6 103.6l-56.4 0 0-56.4C354.5 101.1 389.1 66.5 391.6 64L352 24.4c-9.1 9.1-30.5 30.5-64 64L288 32z" />
		</svg>
	);
};

export const TimelineSequenceFrame: React.FC<{
	readonly roundedFrame: number;
	readonly frozenFrame: number | null;
	readonly premounted: boolean;
	readonly postmounted: number | null;
}> = ({roundedFrame, frozenFrame, premounted, postmounted}) => {
	return (
		<div style={relativeFrameStyle}>
			{frozenFrame === null ? null : <FreezeFrameIcon />}
			{frozenFrame ??
				(premounted
					? '0 (Premounted)'
					: postmounted !== null
						? `${postmounted} (Postmounted)`
						: roundedFrame)}
		</div>
	);
};
