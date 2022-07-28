import React, {useCallback, useContext} from 'react';
import {
	TimelineZoomCtx,
	TIMELINE_MAX_ZOOM,
	TIMELINE_MIN_ZOOM,
} from '../../state/timeline-zoom';
import {ControlButton} from '../ControlButton';

const container: React.CSSProperties = {
	color: 'black',
	flexDirection: 'row',
	display: 'flex',
};

const buttonStyle: React.CSSProperties = {
	fontSize: 24,
};

export const TimelineZoomControls: React.FC = () => {
	const {setZoom, zoom} = useContext(TimelineZoomCtx);

	const onMinusClicked = useCallback(() => {
		setZoom((z) => Math.max(TIMELINE_MIN_ZOOM, z - 0.2));
	}, [setZoom]);

	const onPlusClicked = useCallback(() => {
		setZoom((z) => Math.min(TIMELINE_MAX_ZOOM, z + 0.2));
	}, [setZoom]);

	const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setZoom(Number(e.target.value));
		},
		[setZoom]
	);

	return (
		<div style={container}>
			<ControlButton
				onClick={onMinusClicked}
				style={buttonStyle}
				title="Zoom out timeline"
				role={'ControlButton'}
				type="button"
			>
				-
			</ControlButton>
			<input
				type={'range'}
				min={TIMELINE_MIN_ZOOM}
				step={0.1}
				value={zoom}
				max={TIMELINE_MAX_ZOOM}
				onChange={onChange}
			/>
			<ControlButton
				onClick={onPlusClicked}
				style={buttonStyle}
				title="Zoom in timeline"
				role={'button'}
				type="button"
			>
				+
			</ControlButton>
		</div>
	);
};
