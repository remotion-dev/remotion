import type {Size} from '@remotion/player';
import type {InsertableCompositionElement} from '@remotion/studio-shared';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {CanvasContent} from 'remotion';
import {Internals, watchStaticFile} from 'remotion';
import {getStaticFiles} from '../api/get-static-files';
import {writeStaticFile} from '../api/write-static-file';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {BACKGROUND} from '../helpers/colors';
import {detectFileType} from '../helpers/detect-file-type';
import type {FileType} from '../helpers/detect-file-type';
import type {AssetMetadata} from '../helpers/get-asset-metadata';
import {getAssetMetadata} from '../helpers/get-asset-metadata';
import {
	applyZoomAroundFocalPoint,
	getEffectiveTranslation,
} from '../helpers/get-effective-translation';
import {useCachedCompositionComponentInfo} from '../helpers/open-in-editor';
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
import {callApi} from './call-api';
import EditorGuides from './EditorGuides';
import {EditorRulers} from './EditorRuler';
import {useIsRulerVisible} from './EditorRuler/use-is-ruler-visible';
import {SPACING_UNIT} from './layout';
import {showNotification} from './Notifications/NotificationCenter';
import {VideoPreview} from './Preview';
import {ResetZoomButton} from './ResetZoomButton';
import {useResolvedStack} from './Timeline/use-resolved-stack';

const getContainerStyle = (
	editorZoomGestures: boolean,
): React.CSSProperties => ({
	flex: 1,
	display: 'flex',
	overflow: 'hidden',
	position: 'relative',
	backgroundColor: BACKGROUND,
	...(editorZoomGestures ? {touchAction: 'none' as const} : {}),
});

const resetZoom: React.CSSProperties = {
	position: 'absolute',
	top: SPACING_UNIT * 2,
	right: SPACING_UNIT * 2,
};

const ZOOM_PX_FACTOR = 0.003;

const getAssetElement = ({
	fileType,
	src,
}: {
	fileType: FileType;
	src: string;
}): InsertableCompositionElement | null => {
	if (
		fileType.type === 'png' ||
		fileType.type === 'jpeg' ||
		fileType.type === 'webp' ||
		fileType.type === 'bmp'
	) {
		return {
			type: 'asset',
			assetType: 'image',
			src,
			dimensions: fileType.dimensions,
		};
	}

	if (fileType.type === 'gif') {
		return {
			type: 'asset',
			assetType: 'gif',
			src,
			dimensions: fileType.dimensions,
		};
	}

	if (
		fileType.type === 'riff' ||
		fileType.type === 'webm' ||
		fileType.type === 'iso-base-media' ||
		fileType.type === 'transport-stream'
	) {
		return {
			type: 'asset',
			assetType: 'video',
			src,
			dimensions: null,
		};
	}

	return null;
};

const getAssetLabel = (element: InsertableCompositionElement) => {
	if (element.type !== 'asset') {
		throw new Error('Expected asset element');
	}

	if (element.assetType === 'image') {
		return '<Img>';
	}

	if (element.assetType === 'video') {
		return '<Video>';
	}

	return '<Gif>';
};

type WebKitGestureEvent = UIEvent & {
	scale: number;
	clientX: number;
	clientY: number;
};

export const Canvas: React.FC<{
	readonly canvasContent: CanvasContent;
	readonly size: Size;
}> = ({canvasContent, size}) => {
	const {setSize, size: previewSize} = useContext(Internals.PreviewSizeContext);
	const {editorZoomGestures} = useContext(EditorZoomGesturesContext);
	const previewSnapshotRef = useRef({
		previewSize,
		canvasSize: size,
		contentDimensions: null as {width: number; height: number} | 'none' | null,
	});
	const pinchBaseZoomRef = useRef<number | null>(null);
	const suppressWheelFromWebKitPinchRef = useRef(false);
	const touchPinchRef = useRef<{
		initialDistance: number;
		initialZoom: number;
	} | null>(null);
	const keybindings = useKeybinding();
	const config = Internals.useUnsafeVideoConfig();
	const areRulersVisible = useIsRulerVisible();
	const {editorShowGuides} = useContext(EditorShowGuidesContext);
	const {compositions} = useContext(Internals.CompositionManager);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const [isAddingAsset, setIsAddingAsset] = useState(false);

	const [assetResolution, setAssetResolution] = useState<AssetMetadata | null>(
		null,
	);

	const currentCompositionId =
		canvasContent.type === 'composition' ? canvasContent.compositionId : null;
	const currentComposition = useMemo(() => {
		if (currentCompositionId === null) {
			return null;
		}

		return (
			compositions.find(
				(composition) => composition.id === currentCompositionId,
			) ?? null
		);
	}, [compositions, currentCompositionId]);
	const resolvedCompositionLocation = useResolvedStack(
		currentComposition?.stack ?? null,
	);
	const compositionFile = resolvedCompositionLocation?.source ?? null;
	const compositionComponentInfo = useCachedCompositionComponentInfo({
		compositionFile,
		compositionId: currentCompositionId,
	});
	const canDropAssets =
		previewServerState.type === 'connected' &&
		!window.remotion_isReadOnlyStudio &&
		compositionComponentInfo?.canAddSequence === true &&
		currentCompositionId !== null &&
		compositionFile !== null &&
		!isAddingAsset;

	const contentDimensions = useMemo(() => {
		if (
			(canvasContent.type === 'asset' ||
				canvasContent.type === 'output' ||
				canvasContent.type === 'output-blob') &&
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

	previewSnapshotRef.current = {
		previewSize,
		canvasSize: size,
		contentDimensions,
	};

	const onWheel = useCallback(
		(e: Event) => {
			const ev = e as WheelEvent;
			if (!editorZoomGestures) {
				return;
			}

			if (!size) {
				return;
			}

			if (!contentDimensions || contentDimensions === 'none') {
				return;
			}

			const wantsToZoom = ev.ctrlKey || ev.metaKey;

			if (!wantsToZoom && isFit) {
				return;
			}

			if (suppressWheelFromWebKitPinchRef.current && wantsToZoom) {
				ev.preventDefault();
				return;
			}

			ev.preventDefault();

			setSize((prevSize) => {
				const scale = Internals.calculateScale({
					canvasSize: size,
					compositionHeight: contentDimensions.height,
					compositionWidth: contentDimensions.width,
					previewSize: prevSize.size,
				});

				if (wantsToZoom) {
					const oldSize = prevSize.size === 'auto' ? scale : prevSize.size;
					const smoothened = smoothenZoom(oldSize);
					const added = smoothened + ev.deltaY * ZOOM_PX_FACTOR;
					const unsmoothened = unsmoothenZoom(added);

					return applyZoomAroundFocalPoint({
						canvasSize: size,
						contentDimensions,
						previewSizeBefore: prevSize,
						oldNumericSize: oldSize,
						newNumericSize: unsmoothened,
						clientX: ev.clientX,
						clientY: ev.clientY,
					});
				}

				const effectiveTranslation = getEffectiveTranslation({
					translation: prevSize.translation,
					canvasSize: size,
					compositionHeight: contentDimensions.height,
					compositionWidth: contentDimensions.width,
					scale,
				});

				return {
					...prevSize,
					translation: getEffectiveTranslation({
						translation: {
							x: effectiveTranslation.x + ev.deltaX,
							y: effectiveTranslation.y + ev.deltaY,
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

		return () => {
			current.removeEventListener('wheel', onWheel);
		};
	}, [onWheel]);

	const supportsWebKitPinch =
		typeof window !== 'undefined' && 'GestureEvent' in window;

	useEffect(() => {
		const {current} = canvasRef;
		if (!current || !editorZoomGestures || !supportsWebKitPinch) {
			return;
		}

		const endWebKitPinch = () => {
			pinchBaseZoomRef.current = null;
			suppressWheelFromWebKitPinchRef.current = false;
		};

		const onGestureStart = (event: Event) => {
			const e = event as WebKitGestureEvent;
			const snap = previewSnapshotRef.current;
			const canvasSz = snap.canvasSize;
			const cdim = snap.contentDimensions;
			if (!canvasSz || !cdim || cdim === 'none') {
				return;
			}

			e.preventDefault();
			suppressWheelFromWebKitPinchRef.current = true;

			const fitted = Internals.calculateScale({
				canvasSize: canvasSz,
				compositionHeight: cdim.height,
				compositionWidth: cdim.width,
				previewSize: snap.previewSize.size,
			});
			pinchBaseZoomRef.current =
				snap.previewSize.size === 'auto' ? fitted : snap.previewSize.size;
		};

		const onGestureChange = (event: Event) => {
			const e = event as WebKitGestureEvent;
			const base = pinchBaseZoomRef.current;
			const snap = previewSnapshotRef.current;
			const canvasSz = snap.canvasSize;
			const cdim = snap.contentDimensions;
			if (base === null || !canvasSz || !cdim || cdim === 'none') {
				return;
			}

			const dimensions = cdim;

			e.preventDefault();

			setSize((prevSize) => {
				const scale = Internals.calculateScale({
					canvasSize: canvasSz,
					compositionHeight: dimensions.height,
					compositionWidth: dimensions.width,
					previewSize: prevSize.size,
				});
				const oldNumeric = prevSize.size === 'auto' ? scale : prevSize.size;

				return applyZoomAroundFocalPoint({
					canvasSize: canvasSz,
					contentDimensions: dimensions,
					previewSizeBefore: prevSize,
					oldNumericSize: oldNumeric,
					newNumericSize: base * e.scale,
					clientX: e.clientX,
					clientY: e.clientY,
				});
			});
		};

		const onGestureEnd = () => {
			endWebKitPinch();
		};

		current.addEventListener('gesturestart', onGestureStart, {
			passive: false,
		});
		current.addEventListener('gesturechange', onGestureChange, {
			passive: false,
		});
		current.addEventListener('gestureend', onGestureEnd);
		current.addEventListener('gesturecancel', onGestureEnd);

		return () => {
			current.removeEventListener('gesturestart', onGestureStart);
			current.removeEventListener('gesturechange', onGestureChange);
			current.removeEventListener('gestureend', onGestureEnd);
			current.removeEventListener('gesturecancel', onGestureEnd);
		};
	}, [editorZoomGestures, setSize, supportsWebKitPinch]);

	useEffect(() => {
		const {current} = canvasRef;
		if (!current || !editorZoomGestures) {
			return;
		}

		const onTouchStart = (event: TouchEvent) => {
			if (event.touches.length !== 2) {
				touchPinchRef.current = null;
				return;
			}

			const snap = previewSnapshotRef.current;
			if (
				!snap.canvasSize ||
				!snap.contentDimensions ||
				snap.contentDimensions === 'none'
			) {
				return;
			}

			const [t0, t1] = [event.touches[0], event.touches[1]];
			const initialDistance = Math.hypot(
				t1.clientX - t0.clientX,
				t1.clientY - t0.clientY,
			);
			if (initialDistance < 1e-6) {
				return;
			}

			const fitted = Internals.calculateScale({
				canvasSize: snap.canvasSize,
				compositionHeight: snap.contentDimensions.height,
				compositionWidth: snap.contentDimensions.width,
				previewSize: snap.previewSize.size,
			});
			const initialZoom =
				snap.previewSize.size === 'auto' ? fitted : snap.previewSize.size;

			touchPinchRef.current = {initialDistance, initialZoom};
		};

		const onTouchMove = (event: TouchEvent) => {
			const pinch = touchPinchRef.current;
			const snap = previewSnapshotRef.current;
			if (
				pinch === null ||
				event.touches.length !== 2 ||
				!snap.canvasSize ||
				!snap.contentDimensions ||
				snap.contentDimensions === 'none'
			) {
				return;
			}

			event.preventDefault();

			const [t0, t1] = [event.touches[0], event.touches[1]];
			const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
			const ratio = dist / pinch.initialDistance;
			const clientX = (t0.clientX + t1.clientX) / 2;
			const clientY = (t0.clientY + t1.clientY) / 2;

			setSize((prevSize) => {
				const canvasSz = snap.canvasSize!;
				const cdim = snap.contentDimensions as {
					width: number;
					height: number;
				};
				const scale = Internals.calculateScale({
					canvasSize: canvasSz,
					compositionHeight: cdim.height,
					compositionWidth: cdim.width,
					previewSize: prevSize.size,
				});
				const oldNumeric = prevSize.size === 'auto' ? scale : prevSize.size;

				return applyZoomAroundFocalPoint({
					canvasSize: canvasSz,
					contentDimensions: cdim,
					previewSizeBefore: prevSize,
					oldNumericSize: oldNumeric,
					newNumericSize: pinch.initialZoom * ratio,
					clientX,
					clientY,
				});
			});
		};

		const onTouchEnd = (event: TouchEvent) => {
			if (event.touches.length < 2) {
				touchPinchRef.current = null;
			}
		};

		current.addEventListener('touchstart', onTouchStart, {passive: true});
		current.addEventListener('touchmove', onTouchMove, {passive: false});
		current.addEventListener('touchend', onTouchEnd);
		current.addEventListener('touchcancel', onTouchEnd);

		return () => {
			current.removeEventListener('touchstart', onTouchStart);
			current.removeEventListener('touchmove', onTouchMove);
			current.removeEventListener('touchend', onTouchEnd);
			current.removeEventListener('touchcancel', onTouchEnd);
		};
	}, [editorZoomGestures, setSize]);

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

	const onDragOver: React.DragEventHandler<HTMLDivElement> = useCallback(
		(event) => {
			if (!canDropAssets) {
				return;
			}

			event.preventDefault();
		},
		[canDropAssets],
	);

	const onDrop: React.DragEventHandler<HTMLDivElement> = useCallback(
		async (event) => {
			if (
				!canDropAssets ||
				compositionFile === null ||
				currentCompositionId === null
			) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();

			const files = Array.from(event.dataTransfer.files);
			if (files.length === 0) {
				return;
			}

			setIsAddingAsset(true);
			const insertedLabels: string[] = [];
			const unsupportedFiles: string[] = [];
			try {
				for (const file of files) {
					const contents = await file.arrayBuffer();
					const fileType = detectFileType(new Uint8Array(contents));
					const element = getAssetElement({
						fileType,
						src: file.name,
					});

					if (element === null) {
						unsupportedFiles.push(file.name);
						continue;
					}

					const alreadyExists = getStaticFiles().some(
						(staticFile) =>
							staticFile.name === file.name &&
							staticFile.sizeInBytes === file.size,
					);

					if (!alreadyExists) {
						await writeStaticFile({
							contents,
							filePath: file.name,
						});
					}

					const result = await callApi('/api/insert-jsx-element', {
						compositionFile,
						compositionId: currentCompositionId,
						element,
					});

					if (!result.success) {
						showNotification(result.reason, 4000);
						return;
					}

					insertedLabels.push(getAssetLabel(element));
				}

				if (insertedLabels.length === 1) {
					showNotification(`Added ${insertedLabels[0]} to source file`, 2000);
				} else if (insertedLabels.length > 1) {
					showNotification(
						`Added ${insertedLabels.length} assets to source file`,
						2000,
					);
				}

				if (unsupportedFiles.length === 1) {
					showNotification(
						`Cannot add ${unsupportedFiles[0]}: Unsupported file type`,
						3000,
					);
				} else if (unsupportedFiles.length > 1) {
					showNotification(
						`Skipped ${unsupportedFiles.length} unsupported files`,
						3000,
					);
				}
			} catch (error) {
				showNotification(
					`Could not add asset: ${
						error instanceof Error ? error.message : String(error)
					}`,
					4000,
				);
			} finally {
				setIsAddingAsset(false);
			}
		},
		[canDropAssets, compositionFile, currentCompositionId],
	);

	return (
		<>
			<div
				ref={canvasRef}
				style={getContainerStyle(editorZoomGestures)}
				onDragOver={canDropAssets ? onDragOver : undefined}
				onDrop={canDropAssets ? onDrop : undefined}
			>
				{size ? (
					<VideoPreview
						canvasContent={canvasContent}
						contentDimensions={contentDimensions}
						canvasSize={size}
						assetMetadata={assetResolution}
						onRetryAssetMetadata={fetchMetadata}
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
