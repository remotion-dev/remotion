import React, {useCallback, useContext} from 'react';
import {Internals} from 'remotion';
import {BLACK} from '../../helpers/colors';
import {useIsStill} from '../../helpers/is-current-selected-still';
import {CanvasZoomIcon, CanvasZoomOutIcon} from '../../icons/canvas-zoom';
import {
	TIMELINE_MAX_ZOOM,
	TIMELINE_MIN_ZOOM,
	TimelineZoomCtx,
} from '../../state/timeline-zoom';
import {useZIndex} from '../../state/z-index';
import {ControlButton} from '../ControlButton';
import {Spacing} from '../layout';

const container: React.CSSProperties = {
	color: BLACK,
	flexDirection: 'row',
	display: 'flex',
	alignItems: 'center',
};

const buttonStyle: React.CSSProperties = {
	fontSize: 24,
};

const TimelineZoomSlider: React.FC<{
	readonly maxWidth?: number;
}> = ({maxWidth}) => {
	const {canvasContent} = useContext(Internals.CompositionManager);
	const {setZoom, zoom: zoomMap} = useContext(TimelineZoomCtx);
	const {tabIndex} = useZIndex();
	const isStill = useIsStill();

	const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			if (canvasContent === null || canvasContent.type !== 'composition') {
				return;
			}

			setZoom(canvasContent.compositionId, () => Number(e.target.value), {
				anchorFrame: null,
				anchorContentX: null,
			});
		},
		[canvasContent, setZoom],
	);

	if (
		isStill ||
		canvasContent === null ||
		canvasContent.type !== 'composition'
	) {
		return null;
	}

	const zoom = zoomMap[canvasContent.compositionId] ?? TIMELINE_MIN_ZOOM;

	return (
		<input
			style={maxWidth === undefined ? undefined : {maxWidth}}
			title={`Timeline zoom (${zoom}x)`}
			alt={`Timeline zoom (${zoom}x)`}
			type="range"
			min={TIMELINE_MIN_ZOOM}
			step={0.1}
			value={zoom}
			max={TIMELINE_MAX_ZOOM}
			onChange={onChange}
			className="__remotion-timeline-slider"
			tabIndex={tabIndex}
		/>
	);
};

const TimelineZoomControlsInner: React.FC<{
	readonly sliderMaxWidth?: number;
}> = ({sliderMaxWidth}) => {
	const {canvasContent} = useContext(Internals.CompositionManager);
	const {setZoom} = useContext(TimelineZoomCtx);

	const onMinusClicked = useCallback(() => {
		if (canvasContent === null || canvasContent.type !== 'composition') {
			return;
		}

		setZoom(
			canvasContent.compositionId,
			(z) => Math.max(TIMELINE_MIN_ZOOM, z - 0.2),
			{anchorFrame: null, anchorContentX: null},
		);
	}, [canvasContent, setZoom]);

	const onPlusClicked = useCallback(() => {
		if (canvasContent === null || canvasContent.type !== 'composition') {
			return;
		}

		setZoom(
			canvasContent.compositionId,
			(z) => Math.min(TIMELINE_MAX_ZOOM, z + 0.2),
			{anchorFrame: null, anchorContentX: null},
		);
	}, [canvasContent, setZoom]);

	const isStill = useIsStill();

	if (
		isStill ||
		canvasContent === null ||
		canvasContent.type !== 'composition'
	) {
		return null;
	}

	return (
		<div style={container}>
			<ControlButton
				onClick={onMinusClicked}
				style={buttonStyle}
				title="Zoom out timeline"
				role={'ControlButton'}
				type="button"
			>
				{(color) => <CanvasZoomOutIcon color={color} />}
			</ControlButton>
			<Spacing x={0.5} />
			<TimelineZoomSlider maxWidth={sliderMaxWidth} />
			<Spacing x={0.5} />
			<ControlButton
				onClick={onPlusClicked}
				style={buttonStyle}
				title="Zoom in timeline"
				role={'button'}
				type="button"
			>
				{(color) => <CanvasZoomIcon color={color} />}
			</ControlButton>
		</div>
	);
};

export const TimelineZoomControls = React.memo(TimelineZoomControlsInner);
