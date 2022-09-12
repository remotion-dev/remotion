import {PlayerInternals} from '@remotion/player';
import {calculateScale} from '@remotion/player/src/calculate-scale';
import React, {useCallback, useContext, useEffect, useRef} from 'react';
import {smoothenZoom, unsmoothenZoom} from '../../smooth-zoom';
import {BACKGROUND} from '../helpers/colors';
import {getEffectiveTranslation} from '../helpers/get-effective-translation';
import {useDimensions, useIsStill} from '../helpers/is-current-selected-still';
import {PreviewSizeContext} from '../state/preview-size';
import {StillPreview, VideoPreview} from './Preview';

const container: React.CSSProperties = {
	flex: 1,
	display: 'flex',
	overflow: 'hidden',
	position: 'relative',
	backgroundColor: BACKGROUND,
};

const stillContainer: React.CSSProperties = {
	flex: 1,
	display: 'flex',
	overflow: 'auto',
	position: 'relative',
	backgroundColor: BACKGROUND,
};

const ZOOM_PX_FACTOR = 0.003;

export const Canvas: React.FC = () => {
	const isStill = useIsStill();
	const dimensions = useDimensions();
	const ref = useRef<HTMLDivElement>(null);
	const {
		setSize,
		setTranslation,
		size: previewSize,
	} = useContext(PreviewSizeContext);

	const size = PlayerInternals.useElementSize(ref, {
		triggerOnWindowResize: false,
		shouldApplyCssTransforms: true,
	});

	const onWheel = useCallback(
		(e: WheelEvent) => {
			if (!size) {
				return;
			}

			if (!dimensions) {
				return;
			}

			if (e.ctrlKey || e.metaKey) {
				setSize((prevSize) => {
					const oldSize =
						prevSize === 'auto'
							? calculateScale({
									canvasSize: size,
									compositionHeight: dimensions.height,
									compositionWidth: dimensions.width,
									previewSize: prevSize,
							  })
							: prevSize;
					const unsmoothened = smoothenZoom(oldSize);
					const added = unsmoothened + e.deltaY * ZOOM_PX_FACTOR;
					const smoothened = unsmoothenZoom(added);

					return smoothened;
				});
			} else {
				setTranslation((prevTranslation) => {
					const scale = calculateScale({
						canvasSize: size,
						compositionHeight: dimensions.height,
						compositionWidth: dimensions.width,
						previewSize,
					});

					const effectiveTranslation = getEffectiveTranslation({
						translation: prevTranslation,
						canvasSize: size,
						compositionHeight: dimensions.height,
						compositionWidth: dimensions.width,
						scale,
					});
					return {
						x: effectiveTranslation.x + e.deltaX,
						y: effectiveTranslation.y + e.deltaY,
					};
				});
			}
		},
		[dimensions, previewSize, setSize, setTranslation, size]
	);

	useEffect(() => {
		const {current} = ref;
		if (!current) {
			return;
		}

		current.addEventListener('wheel', onWheel);

		return () => current.removeEventListener('wheel', onWheel);
	}, [onWheel]);

	if (isStill) {
		return (
			<div ref={ref} style={stillContainer}>
				{size ? <StillPreview canvasSize={size} /> : null}
			</div>
		);
	}

	return (
		<div ref={ref} style={container}>
			{size ? <VideoPreview canvasSize={size} /> : null}
		</div>
	);
};
