import React, {useCallback, useContext} from 'react';
import {Internals} from 'remotion';
import {BLACK} from '../../helpers/colors';
import {
	getTimelineMaxZoom,
	sliderValueToTimelineZoom,
	TIMELINE_MIN_ZOOM,
	TIMELINE_ZOOM_SLIDER_PROPS,
	timelineZoomToSliderValue,
} from '../../helpers/get-timeline-max-zoom';
import {useIsStill} from '../../helpers/is-current-selected-still';
import {CanvasZoomIcon, CanvasZoomOutIcon} from '../../icons/canvas-zoom';
import {TimelineZoomCtx} from '../../state/timeline-zoom';
import {useZIndex} from '../../state/z-index';
import {ControlButton} from '../ControlButton';
import {Spacing} from '../layout';

const TIMELINE_ZOOM_BUTTON_FACTOR = 1.2;

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
	readonly maxZoom: number;
}> = ({maxWidth, maxZoom}) => {
	const {canvasContent} = useContext(Internals.CompositionManager);
	const {setZoom, zoom: zoomMap} = useContext(TimelineZoomCtx);
	const {tabIndex} = useZIndex();
	const isStill = useIsStill();

	const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			if (canvasContent === null || canvasContent.type !== 'composition') {
				return;
			}

			setZoom(
				canvasContent.compositionId,
				() =>
					sliderValueToTimelineZoom({
						sliderValue: Number(e.target.value),
						maxZoom,
					}),
				{
					anchorFrame: null,
					anchorContentX: null,
				},
			);
		},
		[canvasContent, maxZoom, setZoom],
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
			min={TIMELINE_ZOOM_SLIDER_PROPS.min}
			max={TIMELINE_ZOOM_SLIDER_PROPS.max}
			step={TIMELINE_ZOOM_SLIDER_PROPS.step}
			value={timelineZoomToSliderValue({zoom, maxZoom})}
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
	const videoConfig = Internals.useUnsafeVideoConfig();
	const maxZoom = getTimelineMaxZoom(videoConfig?.durationInFrames ?? 1);

	const onMinusClicked = useCallback(() => {
		if (canvasContent === null || canvasContent.type !== 'composition') {
			return;
		}

		setZoom(
			canvasContent.compositionId,
			(z) => z / TIMELINE_ZOOM_BUTTON_FACTOR,
			{anchorFrame: null, anchorContentX: null},
		);
	}, [canvasContent, setZoom]);

	const onPlusClicked = useCallback(() => {
		if (canvasContent === null || canvasContent.type !== 'composition') {
			return;
		}

		setZoom(
			canvasContent.compositionId,
			(z) => z * TIMELINE_ZOOM_BUTTON_FACTOR,
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
			<TimelineZoomSlider maxWidth={sliderMaxWidth} maxZoom={maxZoom} />
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
