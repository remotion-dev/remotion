import React, {useContext} from 'react';
import {createPortal} from 'react-dom';
import {BLACK_ALPHA_85, LIGHT_TEXT, WHITE} from '../../helpers/colors';
import {renderFrame} from '../../state/render-frame';
import {TimelineTickFormatContext} from './TimelineTickFormatProvider';

export type TimelineTrimTooltipState = {
	readonly deltaFrames: number;
	readonly edgeFrame: number;
	readonly x: number;
	readonly y: number;
};

const tooltip: React.CSSProperties = {
	backgroundColor: BLACK_ALPHA_85,
	borderRadius: 2,
	boxSizing: 'border-box',
	color: WHITE,
	fontSize: 11,
	fontVariantNumeric: 'tabular-nums',
	lineHeight: '14px',
	padding: '4px 7px',
	pointerEvents: 'none',
	position: 'fixed',
	textAlign: 'right',
	whiteSpace: 'nowrap',
	zIndex: 2147483647,
};

export const TimelineTrimTooltip: React.FC<{
	readonly state: TimelineTrimTooltipState;
	readonly fps: number;
}> = ({state, fps}) => {
	const {showFrames} = useContext(TimelineTickFormatContext);
	const delta = Math.round(state.deltaFrames);
	const edge = Math.max(0, Math.round(state.edgeFrame));
	const format = (frame: number) =>
		showFrames ? `${frame}f` : renderFrame(frame, fps);
	const deltaLabel =
		delta === 0
			? format(0)
			: `${delta < 0 ? '−' : '+'}${format(Math.abs(delta))}`;
	const edgeLabel = format(edge);
	const tooltipWidth = Math.max(
		82,
		Math.ceil(Math.max(deltaLabel.length, edgeLabel.length) * 7 + 14),
	);
	const left = Math.max(
		8,
		Math.min(state.x - tooltipWidth / 2, window.innerWidth - tooltipWidth - 8),
	);
	const top = Math.max(8, Math.min(state.y - 40, window.innerHeight - 44));

	return createPortal(
		<div
			aria-hidden="true"
			style={{...tooltip, left, top, width: tooltipWidth}}
			data-remotion-timeline-trim-tooltip="true"
		>
			<div>{deltaLabel}</div>
			<div style={{color: LIGHT_TEXT}}>{edgeLabel}</div>
		</div>,
		document.body,
	);
};
