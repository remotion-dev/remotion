import React, {useCallback, useContext} from 'react';
import {useIsStill} from '../../helpers/is-current-selected-still';
import {Minus} from '../../icons/minus';
import {Plus} from '../../icons/plus';
import {
	PreviewSizeContext,
	PREVIEW_MAX_ZOOM,
	PREVIEW_MIN_ZOOM,
} from '../../state/preview-size';
import {
	TimelineZoomCtx,
	TIMELINE_MAX_ZOOM,
	TIMELINE_MIN_ZOOM,
} from '../../state/timeline-zoom';
import {ControlButton} from '../ControlButton';
import {Spacing} from '../layout';

const container: React.CSSProperties = {
	color: 'black',
	flexDirection: 'row',
	display: 'flex',
};

const buttonStyle: React.CSSProperties = {
	fontSize: 24,
};

const iconStyle: React.CSSProperties = {
	color: 'white',
	width: 14,
};

const slider: React.CSSProperties = {
	width: 60,
	accentColor: 'var(--blue)',
};

export const TimelineZoomControls: React.FC = () => {
	const {setZoom, zoom} = useContext(TimelineZoomCtx);
	const {size, setSize} = useContext(PreviewSizeContext);

	const onMinusClicked = useCallback(() => {
		setZoom((z) => Math.max(TIMELINE_MIN_ZOOM, z - 0.2));
	}, [setZoom]);

	const onPlusClicked = useCallback(() => {
		setZoom((z) => Math.min(TIMELINE_MAX_ZOOM, z + 0.2));
	}, [setZoom]);

	const onZoomOutClicked = useCallback(() => {
		setSize((z) => Math.max(PREVIEW_MIN_ZOOM, Number(z) - 0.1));
	}, [setSize]);

	const onZoomInClicked = useCallback(() => {
		setSize((z) => Math.min(PREVIEW_MAX_ZOOM, Number(z) + 1));
	}, [setSize]);

	const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setZoom(() => Number(e.target.value));
		},
		[setZoom]
	);
	const isStill = useIsStill();

	if (isStill) {
		return (
			<div style={container}>
				<ControlButton
					onClick={onZoomOutClicked}
					style={buttonStyle}
					title="Zoom out timeline"
					role={'ControlButton'}
					type="button"
					disabled={PREVIEW_MIN_ZOOM === zoom}
				>
					<Minus style={iconStyle} />
				</ControlButton>
				<Spacing x={0.5} />
				<input
					title={`Timeline zoom (${zoom}x)`}
					alt={`Timeline zoom (${zoom}x)`}
					type={'range'}
					min={PREVIEW_MIN_ZOOM}
					step={0.1}
					value={size}
					max={PREVIEW_MAX_ZOOM}
					onChange={onChange}
					style={slider}
				/>
				<Spacing x={0.5} />
				<ControlButton
					onClick={onZoomInClicked}
					style={buttonStyle}
					title="Zoom in timeline"
					role={'button'}
					type="button"
					disabled={PREVIEW_MAX_ZOOM === zoom}
				>
					<Plus style={iconStyle} />
				</ControlButton>
			</div>
		);
	}

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
				style={slider}
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
				<Plus style={iconStyle} />
			</ControlButton>
		</div>
	);
};
