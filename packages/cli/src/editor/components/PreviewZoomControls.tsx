import {useCallback, useContext} from 'react';
import {Minus} from '../icons/minus';
import {Plus} from '../icons/plus';
import {
	PreviewSizeContext,
	PREVIEW_MAX_ZOOM,
	PREVIEW_MIN_ZOOM,
	ZOOM_BUTTON_STEP,
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

export const PreviewZoomControls: React.FC = () => {
	const {size, setSize} = useContext(PreviewSizeContext);

	const onZoomOutClicked = useCallback(() => {
		setSize((z) => {
			// TODO: Don't assume 1
			const newSize = Number(
				(z.size === 'auto' ? 1 : z.size - ZOOM_BUTTON_STEP).toFixed(2)
			);
			return {...z, size: Math.max(PREVIEW_MIN_ZOOM, newSize)};
		});
	}, [setSize]);

	const onZoomInClicked = useCallback(() => {
		setSize((z) => {
			// TODO: Don't assume 1
			if (z.size === 'auto')
				return {
					size: 1 + ZOOM_BUTTON_STEP,
					translation: {
						x: 0,
						y: 0,
					},
				};

			const newSize = Number((Number(z) + ZOOM_BUTTON_STEP).toFixed(2));
			return {...z, size: Math.min(PREVIEW_MAX_ZOOM, newSize)};
		});
	}, [setSize]);

	return (
		<div style={container}>
			<ControlButton
				onClick={onZoomOutClicked}
				style={buttonStyle}
				title="Zoom out preview"
				role={'ControlButton'}
				type="button"
				disabled={size.size !== 'auto' && PREVIEW_MIN_ZOOM === size.size}
			>
				<Minus style={iconStyle} />
			</ControlButton>
			<Spacing x={0.5} />
			<Spacing x={0.5} />
			<ControlButton
				onClick={onZoomInClicked}
				style={buttonStyle}
				title="Zoom in preview"
				role={'button'}
				type="button"
				disabled={size.size !== 'auto' && PREVIEW_MAX_ZOOM === size.size}
			>
				<Plus style={iconStyle} />
			</ControlButton>
		</div>
	);
};
