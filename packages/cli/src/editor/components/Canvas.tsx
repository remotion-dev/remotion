import {PlayerInternals} from '@remotion/player';
import {calculateScale} from '@remotion/player/src/calculate-scale';
import React, {useCallback, useContext, useEffect, useRef} from 'react';
import {
	MAX_ZOOM,
	MIN_ZOOM,
	smoothenZoom,
	unsmoothenZoom,
} from '../../smooth-zoom';
import {BACKGROUND} from '../helpers/colors';
import {
	getCenterPointWhileScrolling,
	getEffectiveTranslation,
} from '../helpers/get-effective-translation';
import {useDimensions} from '../helpers/is-current-selected-still';
import {useKeybinding} from '../helpers/use-keybinding';
import {PreviewSizeContext} from '../state/preview-size';
import {SPACING_UNIT} from './layout';
import {VideoPreview} from './Preview';
import {ResetZoomButton} from './ResetZoomButton';

const container: React.CSSProperties = {
	flex: 1,
	display: 'flex',
	overflow: 'hidden',
	position: 'relative',
	backgroundColor: BACKGROUND,
};

const resetZoom: React.CSSProperties = {
	position: 'absolute',
	top: SPACING_UNIT * 2,
	right: SPACING_UNIT * 2,
};

const ZOOM_PX_FACTOR = 0.003;

export const Canvas: React.FC = () => {
	const dimensions = useDimensions();
	const ref = useRef<HTMLDivElement>(null);
	const {setSize, size: previewSize} = useContext(PreviewSizeContext);
	const keybindings = useKeybinding();

	const size = PlayerInternals.useElementSize(ref, {
		triggerOnWindowResize: false,
		shouldApplyCssTransforms: true,
	});

	const isFit =
		previewSize.size === 'auto' ||
		(previewSize.size === 1 &&
			previewSize.translation.x === 0 &&
			previewSize.translation.y === 0);

	const onWheel = useCallback(
		(e: WheelEvent) => {
			if (!size) {
				return;
			}

			if (!dimensions) {
				return;
			}

			const wantsToZoom = e.ctrlKey || e.metaKey;

			if (!wantsToZoom && isFit) {
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
				if (wantsToZoom) {
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
		[dimensions, isFit, setSize, size]
	);

	useEffect(() => {
		const {current} = ref;
		if (!current) {
			return;
		}

		current.addEventListener('wheel', onWheel);

		return () => current.removeEventListener('wheel', onWheel);
	}, [onWheel]);

	const onReset = useCallback(() => {
		setSize(() => {
			return {
				translation: {
					x: 0,
					y: 0,
				},
				size: 'auto',
			};
		});
	}, [setSize]);

	const onZoomIn = useCallback(() => {
		if (!dimensions) {
			return;
		}

		if (!size) {
			return;
		}

		setSize((prevSize) => {
			const scale = calculateScale({
				canvasSize: size,
				compositionHeight: dimensions.height,
				compositionWidth: dimensions.width,
				previewSize: prevSize.size,
			});
			return {
				translation: {
					x: 0,
					y: 0,
				},
				size: Math.min(MAX_ZOOM, scale * 2),
			};
		});
	}, [dimensions, setSize, size]);

	const onZoomOut = useCallback(() => {
		if (!dimensions) {
			return;
		}

		if (!size) {
			return;
		}

		setSize((prevSize) => {
			const scale = calculateScale({
				canvasSize: size,
				compositionHeight: dimensions.height,
				compositionWidth: dimensions.width,
				previewSize: prevSize.size,
			});
			return {
				translation: {
					x: 0,
					y: 0,
				},
				size: Math.max(MIN_ZOOM, scale / 2),
			};
		});
	}, [dimensions, setSize, size]);

	useEffect(() => {
		const resetBinding = keybindings.registerKeybinding({
			event: 'keydown',
			key: '0',
			commandCtrlKey: false,
			callback: onReset,
		});

		const zoomIn = keybindings.registerKeybinding({
			event: 'keydown',
			key: '+',
			commandCtrlKey: false,
			callback: onZoomIn,
		});

		const zoomOut = keybindings.registerKeybinding({
			event: 'keydown',
			key: '-',
			commandCtrlKey: false,
			callback: onZoomOut,
		});

		return () => {
			resetBinding.unregister();
			zoomIn.unregister();
			zoomOut.unregister();
		};
	}, [keybindings, onReset, onZoomIn, onZoomOut]);

	return (
		<div ref={ref} style={container}>
			{size ? <VideoPreview canvasSize={size} /> : null}
			{isFit ? null : (
				<div style={resetZoom}>
					<ResetZoomButton onClick={onReset} />
				</div>
			)}
		</div>
	);
};
