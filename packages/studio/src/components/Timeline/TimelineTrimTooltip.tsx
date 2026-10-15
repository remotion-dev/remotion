import React, {useContext, useRef} from 'react';
import {createPortal} from 'react-dom';
import {BLACK_ALPHA_85, LIGHT_TEXT, WHITE} from '../../helpers/colors';
import {renderFrame} from '../../state/render-frame';
import {useZIndex} from '../../state/z-index';
import {getPortal} from '../Menu/portals';
import {
	getVisibleTimelineTrimLimitReason,
	type TimelineTrimLimitReason,
} from './timeline-trim-limit-reason';
import {TimelineTickFormatContext} from './TimelineTickFormatProvider';

export type TimelineTrimTooltipState = {
	readonly deltaFrames: number;
	readonly edgeFrame: number;
	readonly x: number;
	readonly y: number;
	readonly limitReason: TimelineTrimLimitReason | null;
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

// `.css-reset *` sets font-size and line-height on descendants
const line: React.CSSProperties = {
	fontSize: 11,
	lineHeight: '14px',
};

export const TimelineTrimTooltip: React.FC<{
	readonly state: TimelineTrimTooltipState;
	readonly fps: number;
	readonly showSourceLimits: boolean;
}> = ({state, fps, showSourceLimits}) => {
	const {showFrames} = useContext(TimelineTickFormatContext);
	const {currentZIndex} = useZIndex();
	const delta = Math.round(state.deltaFrames);
	const edge = Math.max(0, Math.round(state.edgeFrame));
	const format = (frame: number) =>
		showFrames ? `${frame}f` : renderFrame(frame, fps);
	const deltaLabel =
		delta === 0
			? format(0)
			: `${delta < 0 ? '−' : '+'}${format(Math.abs(delta))}`;
	const edgeLabel = format(edge);
	const limitReason =
		showSourceLimits &&
		(state.limitReason === 'Source start' || state.limitReason === 'Source end')
			? state.limitReason
			: getVisibleTimelineTrimLimitReason(state.limitReason);
	const tooltipWidth = Math.max(
		82,
		Math.ceil(
			Math.max(deltaLabel.length, edgeLabel.length, limitReason?.length ?? 0) *
				7 +
				14,
		),
	);
	// Start centered on the trim edge, then grow to the left when the text changes.
	const initialWidth = useRef(tooltipWidth).current;
	const tooltipHeight = limitReason === null ? 36 : 50;
	const left = Math.max(
		8,
		Math.min(
			state.x + initialWidth / 2 - tooltipWidth,
			window.innerWidth - tooltipWidth - 8,
		),
	);
	const top = Math.max(
		8,
		Math.min(
			state.y - tooltipHeight - 4,
			window.innerHeight - tooltipHeight - 8,
		),
	);

	return createPortal(
		<div
			aria-hidden="true"
			className="css-reset"
			style={{...tooltip, left, top, width: tooltipWidth}}
			data-remotion-timeline-trim-tooltip="true"
		>
			{limitReason === null ? null : (
				<div style={{...line, color: WHITE}}>{limitReason}</div>
			)}
			<div style={{...line, color: WHITE}}>{deltaLabel}</div>
			<div style={{...line, color: LIGHT_TEXT}}>{edgeLabel}</div>
		</div>,
		getPortal(currentZIndex),
	);
};
