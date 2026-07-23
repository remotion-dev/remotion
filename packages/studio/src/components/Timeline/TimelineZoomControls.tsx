import React, {useCallback, useContext} from 'react';
import {Internals} from 'remotion';
import {BLACK, CURRENT_COLOR_LOWERCASE, WHITE} from '../../helpers/colors';
import {useIsStill} from '../../helpers/is-current-selected-still';
import {Minus} from '../../icons/minus';
import {Plus} from '../../icons/plus';
import {
	getTimelineZoomFromSliderValue,
	getTimelineZoomSliderValue,
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

const iconStyle: React.CSSProperties = {
	color: WHITE,
	width: 14,
};

const ZOOM_BUTTON_FACTOR = 1.2;

export const TimelineZoomControls: React.FC = () => {
	const {canvasContent} = useContext(Internals.CompositionManager);
	const {
		maxZoom: maxZoomMap,
		setZoom,
		zoom: zoomMap,
	} = useContext(TimelineZoomCtx);
	const {tabIndex} = useZIndex();
	const compositionId =
		canvasContent?.type === 'composition' ? canvasContent.compositionId : null;
	const maxZoom =
		compositionId === null
			? TIMELINE_MIN_ZOOM
			: (maxZoomMap[compositionId] ?? TIMELINE_MIN_ZOOM);

	const onMinusClicked = useCallback(() => {
		if (canvasContent === null || canvasContent.type !== 'composition') {
			return;
		}

		setZoom(canvasContent.compositionId, (z) => z / ZOOM_BUTTON_FACTOR, {
			anchorFrame: null,
			anchorContentX: null,
		});
	}, [canvasContent, setZoom]);

	const onPlusClicked = useCallback(() => {
		if (canvasContent === null || canvasContent.type !== 'composition') {
			return;
		}

		setZoom(canvasContent.compositionId, (z) => z * ZOOM_BUTTON_FACTOR, {
			anchorFrame: null,
			anchorContentX: null,
		});
	}, [canvasContent, setZoom]);

	const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			if (canvasContent === null || canvasContent.type !== 'composition') {
				return;
			}

			setZoom(
				canvasContent.compositionId,
				() =>
					getTimelineZoomFromSliderValue({
						maxZoom,
						sliderValue: Number(e.target.value),
					}),
				{
					anchorFrame: null,
					anchorContentX: null,
				},
			);
		},
		[canvasContent, maxZoom, setZoom],
	);

	const isStill = useIsStill();

	if (
		isStill ||
		canvasContent === null ||
		canvasContent.type !== 'composition'
	) {
		return null;
	}

	const zoom = zoomMap[canvasContent.compositionId] ?? TIMELINE_MIN_ZOOM;
	const sliderValue = getTimelineZoomSliderValue({maxZoom, zoom});

	return (
		<div style={container}>
			<ControlButton
				onClick={onMinusClicked}
				style={buttonStyle}
				title="Zoom out timeline"
				role={'ControlButton'}
				type="button"
				disabled={TIMELINE_MIN_ZOOM === zoom}
			>
				<Minus style={iconStyle} />
			</ControlButton>
			<Spacing x={0.5} />
			<input
				title={`Timeline zoom (${zoom}x)`}
				alt={`Timeline zoom (${zoom}x)`}
				type={'range'}
				min={0}
				step={0.001}
				value={sliderValue}
				max={1}
				onChange={onChange}
				className="__remotion-timeline-slider"
				tabIndex={tabIndex}
				disabled={maxZoom === TIMELINE_MIN_ZOOM}
			/>
			<Spacing x={0.5} />
			<ControlButton
				onClick={onPlusClicked}
				style={buttonStyle}
				title="Zoom in timeline"
				role={'button'}
				type="button"
				disabled={maxZoom === zoom}
			>
				<Plus color={CURRENT_COLOR_LOWERCASE} style={iconStyle} />
			</ControlButton>
		</div>
	);
};
