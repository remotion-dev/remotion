import {useCallback, useContext} from 'react';
import {Minus} from '../icons/minus';
import {Plus} from '../icons/plus';
import {
	PreviewSizeContext,
	PREVIEW_MAX_ZOOM,
	PREVIEW_MIN_ZOOM,
	ZOOM_BUTTON_STEP,
	ZOOM_SLIDER_STEP,
} from '../state/preview-size';
import {ControlButton} from './ControlButton';
import {Spacing} from './layout';

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
	width: 120,
	accentColor: 'var(--blue)',
};

export const PreviewZoomControls: React.FC = () => {
	const {size, setSize} = useContext(PreviewSizeContext);

	const onZoomOutClicked = useCallback(() => {
		setSize((z) => {
			if (z === 'auto') return 1 - ZOOM_BUTTON_STEP;

			const newSize = Number((Number(z) - ZOOM_BUTTON_STEP).toFixed(2));
			return Math.max(PREVIEW_MIN_ZOOM, newSize);
		});
	}, [setSize]);

	const onZoomInClicked = useCallback(() => {
		setSize((z) => {
			if (z === 'auto') return 1 + ZOOM_BUTTON_STEP;

			const newSize = Number((Number(z) + ZOOM_BUTTON_STEP).toFixed(2));
			return Math.min(PREVIEW_MAX_ZOOM, newSize);
		});
	}, [setSize]);

	const onChange = useCallback(
		(e) => {
			setSize(() => Number(e.target.value));
		},
		[setSize]
	);

	const onWheel = useCallback(
		(e) => {
			setSize((z) => {
				if (e.deltaY > 0) {
					if (z === 'auto') return 1 - ZOOM_SLIDER_STEP;

					const newSize = Number((Number(z) - ZOOM_SLIDER_STEP).toFixed(2));
					return Math.max(PREVIEW_MIN_ZOOM, newSize);
				}

				if (e.deltaY < 0) {
					if (z === 'auto') return 1 + ZOOM_SLIDER_STEP;

					const newSize = Number((Number(z) + ZOOM_SLIDER_STEP).toFixed(2));
					return Math.min(PREVIEW_MAX_ZOOM, newSize);
				}

				return z;
			});
		},
		[setSize]
	);

	return (
		<div style={container}>
			<ControlButton
				onClick={onZoomOutClicked}
				style={buttonStyle}
				title="Zoom out preview"
				role={'ControlButton'}
				type="button"
				disabled={PREVIEW_MIN_ZOOM === size}
			>
				<Minus style={iconStyle} />
			</ControlButton>
			<Spacing x={0.5} />
			<input
				title={`Preview size (${size}x)`}
				alt={`Preview size (${size}x)`}
				type={'range'}
				min={PREVIEW_MIN_ZOOM}
				step={ZOOM_SLIDER_STEP}
				value={size}
				max={PREVIEW_MAX_ZOOM}
				onChange={onChange}
				onWheel={onWheel}
				style={slider}
			/>
			<Spacing x={0.5} />
			<ControlButton
				onClick={onZoomInClicked}
				style={buttonStyle}
				title="Zoom in preview"
				role={'button'}
				type="button"
				disabled={PREVIEW_MAX_ZOOM === size}
			>
				<Plus style={iconStyle} />
			</ControlButton>
		</div>
	);
};
