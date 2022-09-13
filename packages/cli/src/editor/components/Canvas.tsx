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
	const {setSize} = useContext(PreviewSizeContext);

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

			setSize((prevSize) => {
				const scale = calculateScale({
					canvasSize: size,
					compositionHeight: dimensions.height,
					compositionWidth: dimensions.width,
					previewSize: prevSize.size,
				});
				const effectiveTranslation = getEffectiveTranslation({
					translation: prevSize.translation,
					canvasSize: size,
					compositionHeight: dimensions.height,
					compositionWidth: dimensions.width,
					scale,
				});
				if (e.ctrlKey || e.metaKey) {
					const oldSize =
						prevSize.size === 'auto'
							? calculateScale({
									canvasSize: size,
									compositionHeight: dimensions.height,
									compositionWidth: dimensions.width,
									previewSize: prevSize.size,
							  })
							: prevSize.size;
					const unsmoothened = smoothenZoom(oldSize);
					const added = unsmoothened + e.deltaY * ZOOM_PX_FACTOR;
					const smoothened = unsmoothenZoom(added);

					return {
						translation: {
							x: effectiveTranslation.x,
							y: effectiveTranslation.y,
						},
						size: smoothened,
					};
				}

				return {
					...prevSize,
					translation: {
						x: effectiveTranslation.x + e.deltaX,
						y: effectiveTranslation.y + e.deltaY,
					},
				};
			});
		},
		[dimensions, setSize, size]
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
