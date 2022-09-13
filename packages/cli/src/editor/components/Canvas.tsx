import {PlayerInternals} from '@remotion/player';
import {calculateScale} from '@remotion/player/src/calculate-scale';
import React, {useCallback, useContext, useEffect, useRef} from 'react';
import {smoothenZoom, unsmoothenZoom} from '../../smooth-zoom';
import {BACKGROUND} from '../helpers/colors';
import {
	getCenterPointWhileScrolling,
	getEffectiveTranslation,
} from '../helpers/get-effective-translation';
import {useDimensions, useIsStill} from '../helpers/is-current-selected-still';
import {PreviewSizeContext} from '../state/preview-size';
import {VideoPreview} from './Preview';

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

				// Zoom in/out
				if (e.ctrlKey || e.metaKey) {
					const oldSize = prevSize.size === 'auto' ? scale : prevSize.size;
					const smoothened = smoothenZoom(oldSize);
					const added = smoothened + e.deltaY * ZOOM_PX_FACTOR;
					const unsmoothened = unsmoothenZoom(added);

					const {centerX, centerY} = getCenterPointWhileScrolling({
						size,
						clientX: e.clientX,
						clientY: e.clientY,
						compositionWidth: dimensions.width,
						compositionHeight: dimensions.height,
						scale,
						translation: prevSize.translation,
					});

					const zoomDifference = unsmoothened - oldSize;

					const uvCoordinatesX = centerX / dimensions.width;
					const uvCoordinatesY = centerY / dimensions.height;

					const correctionLeft =
						-uvCoordinatesX * (zoomDifference * dimensions.width) +
						(1 - uvCoordinatesX) * zoomDifference * dimensions.width;
					const correctionTop =
						-uvCoordinatesY * (zoomDifference * dimensions.height) +
						(1 - uvCoordinatesY) * zoomDifference * dimensions.height;

					return {
						translation: getEffectiveTranslation({
							translation: {
								x: prevSize.translation.x - correctionLeft / 2,
								y: prevSize.translation.y - correctionTop / 2,
							},
							canvasSize: size,
							compositionHeight: dimensions.height,
							compositionWidth: dimensions.width,
							scale,
						}),
						size: unsmoothened,
					};
				}

				const effectiveTranslation = getEffectiveTranslation({
					translation: prevSize.translation,
					canvasSize: size,
					compositionHeight: dimensions.height,
					compositionWidth: dimensions.width,
					scale,
				});

				// Pan
				return {
					...prevSize,

					translation: getEffectiveTranslation({
						translation: {
							x: effectiveTranslation.x + e.deltaX,
							y: effectiveTranslation.y + e.deltaY,
						},
						canvasSize: size,
						compositionHeight: dimensions.height,
						compositionWidth: dimensions.width,
						scale,
					}),
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

	return (
		<div ref={ref} style={container}>
			{size ? <VideoPreview canvasSize={size} /> : null}
		</div>
	);
};
