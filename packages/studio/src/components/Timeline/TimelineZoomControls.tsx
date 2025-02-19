import React, {useCallback, useContext} from 'react';
import {Internals} from 'remotion';
import {useIsStill} from '../../helpers/is-current-selected-still';
import {Minus} from '../../icons/minus';
import {Plus} from '../../icons/plus';
import {
	TIMELINE_MAX_ZOOM,
	TIMELINE_MIN_ZOOM,
	TimelineZoomCtx,
} from '../../state/timeline-zoom';
import {useZIndex} from '../../state/z-index';
import {ControlButton} from '../ControlButton';
import {Spacing} from '../layout';

const container: React.CSSProperties = {
	color: 'black',
	flexDirection: 'row',
	display: 'flex',
	alignItems: 'center',
};

const buttonStyle: React.CSSProperties = {
	fontSize: 24,
};

const iconStyle: React.CSSProperties = {
	color: 'white',
	width: 14,
};

export const TimelineZoomControls: React.FC = () => {
	const {canvasContent} = useContext(Internals.CompositionManager);
	const {setZoom, zoom: zoomMap} = useContext(TimelineZoomCtx);
	const {tabIndex} = useZIndex();

	const onMinusClicked = useCallback(() => {
		if (canvasContent === null || canvasContent.type !== 'composition') {
			return;
		}

		setZoom(canvasContent.compositionId, (z) =>
			Math.max(TIMELINE_MIN_ZOOM, z - 0.2),
		);
	}, [canvasContent, setZoom]);

	const onPlusClicked = useCallback(() => {
		if (canvasContent === null || canvasContent.type !== 'composition') {
			return;
		}

		setZoom(canvasContent.compositionId, (z) =>
			Math.min(TIMELINE_MAX_ZOOM, z + 0.2),
		);
	}, [canvasContent, setZoom]);

	const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			if (canvasContent === null || canvasContent.type !== 'composition') {
				return;
			}

			setZoom(canvasContent.compositionId, () => Number(e.target.value));
		},
		[canvasContent, setZoom],
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
				min={TIMELINE_MIN_ZOOM}
				step={0.1}
				value={zoom}
				max={TIMELINE_MAX_ZOOM}
				onChange={onChange}
				className="__remotion-timeline-slider"
				tabIndex={tabIndex}
			/>
			<Spacing x={0.5} />
			<ControlButton
				onClick={onPlusClicked}
				style={buttonStyle}
				title="Zoom in timeline"
				role={'button'}
				type="button"
				disabled={TIMELINE_MAX_ZOOM === zoom}
			>
				<Plus color="currentcolor" style={iconStyle} />
			</ControlButton>
		</div>
	);
};
