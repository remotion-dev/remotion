import type {Size} from '@remotion/player';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import type {CanvasContent} from 'remotion';
import {Internals, watchStaticFile} from 'remotion';
import {BACKGROUND} from '../helpers/colors';
import type {AssetMetadata} from '../helpers/get-asset-metadata';
import {getAssetMetadata} from '../helpers/get-asset-metadata';
import {
	getCenterPointWhileScrolling,
	getEffectiveTranslation,
} from '../helpers/get-effective-translation';
import {
	MAX_ZOOM,
	MIN_ZOOM,
	smoothenZoom,
	unsmoothenZoom,
} from '../helpers/smooth-zoom';
import {useKeybinding} from '../helpers/use-keybinding';
import {canvasRef} from '../state/canvas-ref';
import {EditorShowGuidesContext} from '../state/editor-guides';
import {EditorZoomGesturesContext} from '../state/editor-zoom-gestures';
import EditorGuides from './EditorGuides';
import {EditorRulers} from './EditorRuler';
import {useIsRulerVisible} from './EditorRuler/use-is-ruler-visible';
import {VideoPreview} from './Preview';
import {ResetZoomButton} from './ResetZoomButton';
import {SPACING_UNIT} from './layout';

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

export const Canvas: React.FC<{
	readonly canvasContent: CanvasContent;
	readonly size: Size;
	readonly isRefreshing: boolean;
}> = ({canvasContent, size, isRefreshing}) => {
	const {setSize, size: previewSize} = useContext(Internals.PreviewSizeContext);
	const {editorZoomGestures} = useContext(EditorZoomGesturesContext);
	const keybindings = useKeybinding();
	const config = Internals.useUnsafeVideoConfig();
	const areRulersVisible = useIsRulerVisible();
	const {editorShowGuides} = useContext(EditorShowGuidesContext);

	const [assetResolution, setAssetResolution] = useState<AssetMetadata | null>(
		null,
	);

	const contentDimensions = useMemo(() => {
		if (
			(canvasContent.type === 'asset' || canvasContent.type === 'output') &&
			assetResolution &&
			assetResolution.type === 'found'
		) {
			return assetResolution.dimensions;
		}

		if (config) {
			return {width: config.width, height: config.height};
		}

		return null;
	}, [assetResolution, config, canvasContent]);

	const isFit = previewSize.size === 'auto';

	const onWheel = useCallback(
		(e: WheelEvent) => {
			if (!editorZoomGestures) {
				return;
			}

			if (!size) {
				return;
			}

			if (!contentDimensions || contentDimensions === 'none') {
				return;
			}

			const wantsToZoom = e.ctrlKey || e.metaKey;

			if (!wantsToZoom && isFit) {
				return;
			}

			e.preventDefault();

			setSize((prevSize) => {
				const scale = Internals.calculateScale({
					canvasSize: size,
					compositionHeight: contentDimensions.height,
					compositionWidth: contentDimensions.width,
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
						compositionWidth: contentDimensions.width,
						compositionHeight: contentDimensions.height,
						scale,
						translation: prevSize.translation,
					});

					const zoomDifference = unsmoothened - oldSize;

					const uvCoordinatesX = centerX / contentDimensions.width;
					const uvCoordinatesY = centerY / contentDimensions.height;

					const correctionLeft =
						-uvCoordinatesX * (zoomDifference * contentDimensions.width) +
						(1 - uvCoordinatesX) * zoomDifference * contentDimensions.width;
					const correctionTop =
						-uvCoordinatesY * (zoomDifference * contentDimensions.height) +
						(1 - uvCoordinatesY) * zoomDifference * contentDimensions.height;

					return {
						translation: getEffectiveTranslation({
							translation: {
								x: prevSize.translation.x - correctionLeft / 2,
								y: prevSize.translation.y - correctionTop / 2,
							},
							canvasSize: size,
							compositionHeight: contentDimensions.height,
							compositionWidth: contentDimensions.width,
							scale,
						}),
						size: unsmoothened,
					};
				}

				const effectiveTranslation = getEffectiveTranslation({
					translation: prevSize.translation,
					canvasSize: size,
					compositionHeight: contentDimensions.height,
					compositionWidth: contentDimensions.width,
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
						compositionHeight: contentDimensions.height,
						compositionWidth: contentDimensions.width,
						scale,
					}),
				};
			});
		},
		[editorZoomGestures, contentDimensions, isFit, setSize, size],
	);

	useEffect(() => {
		const {current} = canvasRef;
		if (!current) {
			return;
		}

		current.addEventListener('wheel', onWheel, {passive: false});

		return () =>
			// @ts-expect-error
			current.removeEventListener('wheel', onWheel, {
				passive: false,
			});
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
		if (!contentDimensions || contentDimensions === 'none') {
			return;
		}

		if (!size) {
			return;
		}

		setSize((prevSize) => {
			const scale = Internals.calculateScale({
				canvasSize: size,
				compositionHeight: contentDimensions.height,
				compositionWidth: contentDimensions.width,
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
	}, [contentDimensions, setSize, size]);

	const onZoomOut = useCallback(() => {
		if (!contentDimensions || contentDimensions === 'none') {
			return;
		}

		if (!size) {
			return;
		}

		setSize((prevSize) => {
			const scale = Internals.calculateScale({
				canvasSize: size,
				compositionHeight: contentDimensions.height,
				compositionWidth: contentDimensions.width,
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
	}, [contentDimensions, setSize, size]);

	useEffect(() => {
		const resetBinding = keybindings.registerKeybinding({
			event: 'keydown',
			key: '0',
			commandCtrlKey: false,
			callback: onReset,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		const zoomIn = keybindings.registerKeybinding({
			event: 'keydown',
			key: '+',
			commandCtrlKey: false,
			callback: onZoomIn,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		const zoomOut = keybindings.registerKeybinding({
			event: 'keydown',
			key: '-',
			commandCtrlKey: false,
			callback: onZoomOut,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		return () => {
			resetBinding.unregister();
			zoomIn.unregister();
			zoomOut.unregister();
		};
	}, [keybindings, onReset, onZoomIn, onZoomOut]);

	const fetchMetadata = useCallback(async () => {
		setAssetResolution(null);
		if (canvasContent.type === 'composition') {
			return;
		}

		const metadata = await getAssetMetadata(
			canvasContent,
			canvasContent.type === 'asset',
		);
		setAssetResolution(metadata);
	}, [canvasContent]);

	useEffect(() => {
		if (canvasContent.type !== 'asset') {
			return;
		}

		const file = watchStaticFile(canvasContent.asset, () => {
			fetchMetadata();
		});
		return () => {
			file.cancel();
		};
	}, [canvasContent, fetchMetadata]);

	useEffect(() => {
		fetchMetadata();
	}, [fetchMetadata]);

	return (
		<>
			<div ref={canvasRef} style={container}>
				{size ? (
					<VideoPreview
						canvasContent={canvasContent}
						contentDimensions={contentDimensions}
						canvasSize={size}
						assetMetadata={assetResolution}
						isRefreshing={isRefreshing}
					/>
				) : null}
				{isFit ? null : (
					<div style={resetZoom} className="css-reset">
						<ResetZoomButton onClick={onReset} />
					</div>
				)}
				{editorShowGuides && canvasContent.type === 'composition' && (
					<EditorGuides
						canvasSize={size}
						contentDimensions={contentDimensions}
						assetMetadata={assetResolution}
					/>
				)}
			</div>
			{areRulersVisible && (
				<EditorRulers
					contentDimensions={contentDimensions}
					canvasSize={size}
					assetMetadata={assetResolution}
					containerRef={canvasRef}
				/>
			)}
		</>
	);
};
