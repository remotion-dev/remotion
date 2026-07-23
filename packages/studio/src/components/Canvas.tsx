import type {Size} from '@remotion/player';
import type {ElementInstallRequest} from '@remotion/studio-shared';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {CanvasContent} from 'remotion';
import {Internals, watchStaticFile, type PreviewSize} from 'remotion';
import {getStaticFiles} from '../api/get-static-files';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {getClipboardFigmaHtml} from '../helpers/clipboard-figma';
import {getClipboardImageFiles} from '../helpers/clipboard-images';
import {getClipboardSvgMarkup} from '../helpers/clipboard-svg';
import {BACKGROUND} from '../helpers/colors';
import type {AssetMetadata} from '../helpers/get-asset-metadata';
import {getAssetMetadata} from '../helpers/get-asset-metadata';
import {
	applyZoomAroundFocalPoint,
	getCenterPointWhileScrolling,
	getEffectiveTranslation,
} from '../helpers/get-effective-translation';
import {getMissingPackages} from '../helpers/install-required-package';
import {useCachedCompositionComponentInfo} from '../helpers/open-in-editor';
import {
	MAX_ZOOM,
	MIN_ZOOM,
	smoothenZoom,
	unsmoothenZoom,
} from '../helpers/smooth-zoom';
import {calculateStudioScale} from '../helpers/studio-fit-padding';
import {
	areKeyboardShortcutsDisabled,
	useKeybinding,
} from '../helpers/use-keybinding';
import {canvasRef} from '../state/canvas-ref';
import {EditorShowGuidesContext} from '../state/editor-guides';
import {EditorZoomGesturesContext} from '../state/editor-zoom-gestures';
import {callApi} from './call-api';
import {useConfirmationDialog} from './ConfirmationDialog';
import {isSupportedDropEvent} from './drop-handler-data';
import EditorGuides from './EditorGuides';
import {EditorRulers} from './EditorRuler';
import {useIsRulerVisible} from './EditorRuler/use-is-ruler-visible';
import {getEffectDragData} from './effect-drag-and-drop';
import {handleDrop} from './handle-drop';
import {
	hasSvgFile,
	importAssets,
	importFigmaClipboard,
	insertElement,
	insertSvgMarkup,
	type InsertElementDropPosition,
} from './import-assets';
import {SPACING_UNIT} from './layout';
import {showNotification} from './Notifications/NotificationCenter';
import {VideoPreview} from './Preview';
import {ResetZoomButton} from './ResetZoomButton';
import {useSvgImportDialog} from './SvgImportDialog';
import {getCurrentFrame} from './Timeline/imperative-state';
import {useResolvedStack} from './Timeline/use-resolved-stack';

const elementInstallCompositionIdStyle: React.CSSProperties = {
	fontFamily: 'monospace',
	fontSize: 13,
};

const elementInstallDependencyListStyle: React.CSSProperties = {
	marginTop: 8,
	marginBottom: 0,
	paddingLeft: 24,
	listStyleType: 'disc',
};

const elementInstallDependencyStyle: React.CSSProperties = {
	color: 'inherit',
	fontFamily: 'monospace',
	fontSize: 13,
	lineHeight: 1.5,
};

const elementInstallCodeDetailsStyle: React.CSSProperties = {
	marginTop: 12,
	fontSize: 13,
};

const elementInstallCodeSummaryStyle: React.CSSProperties = {
	cursor: 'pointer',
	fontSize: 13,
	fontWeight: 500,
};

const elementInstallCodeBlockStyle: React.CSSProperties = {
	marginTop: 8,
	marginBottom: 0,
	maxHeight: 240,
	overflow: 'auto',
	padding: 12,
	borderRadius: 6,
	backgroundColor: 'rgba(255, 255, 255, 0.06)',
	fontSize: 12,
	lineHeight: 1.5,
	whiteSpace: 'pre',
};

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

type WebKitGestureEvent = UIEvent & {
	scale: number;
	clientX: number;
	clientY: number;
};

const calculateCanvasScale = ({
	addFitPadding,
	canvasSize,
	compositionHeight,
	compositionWidth,
	previewSize,
}: {
	readonly addFitPadding: boolean;
	readonly canvasSize: Size;
	readonly compositionHeight: number;
	readonly compositionWidth: number;
	readonly previewSize: PreviewSize['size'];
}) => {
	const options = {
		canvasSize,
		compositionHeight,
		compositionWidth,
		previewSize,
	};

	return addFitPadding
		? calculateStudioScale(options)
		: Internals.calculateScale(options);
};

const getDropPosition = ({
	addFitPadding,
	clientX,
	clientY,
	contentDimensions,
	previewSize,
	size,
}: {
	addFitPadding: boolean;
	clientX: number;
	clientY: number;
	contentDimensions: {width: number; height: number} | 'none' | null;
	previewSize: PreviewSize;
	size: Size;
}): InsertElementDropPosition | null => {
	if (contentDimensions === null || contentDimensions === 'none') {
		return null;
	}

	const scale = calculateCanvasScale({
		addFitPadding,
		canvasSize: size,
		compositionHeight: contentDimensions.height,
		compositionWidth: contentDimensions.width,
		previewSize: previewSize.size,
	});
	const {centerX, centerY} = getCenterPointWhileScrolling({
		size,
		clientX,
		clientY,
		compositionWidth: contentDimensions.width,
		compositionHeight: contentDimensions.height,
		scale,
		translation: previewSize.translation,
	});

	return {centerX, centerY};
};

const isDragEventInsideCanvas = (event: DragEvent): boolean => {
	const {current} = canvasRef;
	if (!current) {
		return false;
	}

	const targetIsNode = event.target instanceof Node;
	if (targetIsNode && current.contains(event.target as Node)) {
		return true;
	}

	const rect = current.getBoundingClientRect();
	return (
		event.clientX >= rect.left &&
		event.clientX <= rect.right &&
		event.clientY >= rect.top &&
		event.clientY <= rect.bottom
	);
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
	const confirm = useConfirmationDialog();
	const chooseSvgImportMode = useSvgImportDialog();
	const config = Internals.useUnsafeVideoConfig();
	const areRulersVisible = useIsRulerVisible();
	const {editorShowGuides} = useContext(EditorShowGuidesContext);
	const {compositions} = useContext(Internals.CompositionManager);
	const {previewServerState, subscribeToEvent} = useContext(
		StudioServerConnectionCtx,
	);
	const previewServerClientId =
		previewServerState.type === 'connected'
			? previewServerState.clientId
			: null;
	const [isAddingAsset, setIsAddingAsset] = useState(false);
	const [installingElementName, setInstallingElementName] = useState<
		string | null
	>(null);
	const [pendingElementInstallRequests, setPendingElementInstallRequests] =
		useState<ElementInstallRequest[]>([]);
	const [activeElementInstallRequest, setActiveElementInstallRequest] =
		useState<ElementInstallRequest | null>(null);
	const lastFocusedAtRef = useRef<number | null>(
		typeof document === 'undefined' || document.hasFocus() ? Date.now() : null,
	);

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
	const canInstallElements =
		previewServerClientId !== null &&
		!window.remotion_isReadOnlyStudio &&
		compositionComponentInfo?.canAddSequence === true &&
		currentCompositionId !== null &&
		compositionFile !== null;
	const canDropAssets = canInstallElements && !isAddingAsset;
	const cannotAddSequence = compositionComponentInfo?.canAddSequence === false;

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
	const addFitPadding = canvasContent.type === 'composition';

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
				const scale = calculateCanvasScale({
					addFitPadding,
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
						addFitPadding,
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
		[
			addFitPadding,
			editorZoomGestures,
			contentDimensions,
			isFit,
			setSize,
			size,
		],
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

			const fitted = calculateCanvasScale({
				addFitPadding,
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
				const scale = calculateCanvasScale({
					addFitPadding,
					canvasSize: canvasSz,
					compositionHeight: dimensions.height,
					compositionWidth: dimensions.width,
					previewSize: prevSize.size,
				});
				const oldNumeric = prevSize.size === 'auto' ? scale : prevSize.size;

				return applyZoomAroundFocalPoint({
					addFitPadding,
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
	}, [addFitPadding, editorZoomGestures, setSize, supportsWebKitPinch]);

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

			const fitted = calculateCanvasScale({
				addFitPadding,
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
				const scale = calculateCanvasScale({
					addFitPadding,
					canvasSize: canvasSz,
					compositionHeight: cdim.height,
					compositionWidth: cdim.width,
					previewSize: prevSize.size,
				});
				const oldNumeric = prevSize.size === 'auto' ? scale : prevSize.size;

				return applyZoomAroundFocalPoint({
					addFitPadding,
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
	}, [addFitPadding, editorZoomGestures, setSize]);

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
			const scale = calculateCanvasScale({
				addFitPadding,
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
	}, [addFitPadding, contentDimensions, setSize, size]);

	const onZoomOut = useCallback(() => {
		if (!contentDimensions || contentDimensions === 'none') {
			return;
		}

		if (!size) {
			return;
		}

		setSize((prevSize) => {
			const scale = calculateCanvasScale({
				addFitPadding,
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
	}, [addFitPadding, contentDimensions, setSize, size]);

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

	const updateElementInstallTarget = useCallback(
		(requestId: string) => {
			if (previewServerClientId === null) {
				return;
			}

			callApi('/api/update-element-install-target', {
				requestId,
				clientId: previewServerClientId,
				compositionFile: canInstallElements ? compositionFile : null,
				compositionId: canInstallElements ? currentCompositionId : null,
				canInstall: canInstallElements,
				lastFocusedAt: lastFocusedAtRef.current,
				readOnly: window.remotion_isReadOnlyStudio,
				studioUrl: window.location.href,
			}).catch(() => undefined);
		},
		[
			canInstallElements,
			compositionFile,
			currentCompositionId,
			previewServerClientId,
		],
	);

	useEffect(() => {
		const markFocused = () => {
			lastFocusedAtRef.current = Date.now();
		};

		window.addEventListener('focus', markFocused);
		document.addEventListener('pointerdown', markFocused, {capture: true});

		return () => {
			window.removeEventListener('focus', markFocused);
			document.removeEventListener('pointerdown', markFocused, {capture: true});
		};
	}, []);

	useEffect(() => {
		return subscribeToEvent('request-element-install-target', (event) => {
			if (event.type !== 'request-element-install-target') {
				return;
			}

			updateElementInstallTarget(event.requestId);
		});
	}, [subscribeToEvent, updateElementInstallTarget]);

	useEffect(() => {
		if (installingElementName === null) {
			return;
		}

		const previousTitle = document.title;
		document.title = `📦 Install ${installingElementName} - Remotion Studio`;

		return () => {
			document.title = previousTitle;
		};
	}, [installingElementName]);

	useEffect(() => {
		if (previewServerClientId === null) {
			return;
		}

		return subscribeToEvent('element-install-request', (event) => {
			if (
				event.type !== 'element-install-request' ||
				event.request.clientId !== previewServerClientId
			) {
				return;
			}

			setPendingElementInstallRequests((requests) => [
				...requests,
				event.request,
			]);
		});
	}, [previewServerClientId, subscribeToEvent]);

	useEffect(() => {
		if (
			activeElementInstallRequest !== null ||
			pendingElementInstallRequests.length === 0
		) {
			return;
		}

		const [nextRequest, ...remainingRequests] = pendingElementInstallRequests;
		if (!nextRequest) {
			throw new Error('Expected pending Element install request');
		}

		setActiveElementInstallRequest(nextRequest);
		setPendingElementInstallRequests(remainingRequests);
	}, [activeElementInstallRequest, pendingElementInstallRequests]);

	useEffect(() => {
		if (activeElementInstallRequest === null) {
			return;
		}

		let canceled = false;

		const handleInstallRequest = async () => {
			setInstallingElementName(activeElementInstallRequest.element.displayName);
			const missingPackages = getMissingPackages(
				activeElementInstallRequest.element.dependencies,
			);
			const accepted = await confirm({
				title: 'Install Element',
				message: (
					<>
						Install “{activeElementInstallRequest.element.displayName}” into{' '}
						<code style={elementInstallCompositionIdStyle}>
							{activeElementInstallRequest.compositionId}
						</code>{' '}
						composition? This will create an Element source file and update the
						composition source.
						{missingPackages.length > 0 ? (
							<>
								<br />
								<br />
								The following dependencies will also be installed:
								<ul style={elementInstallDependencyListStyle}>
									{missingPackages.map((packageName) => (
										<li key={packageName} style={elementInstallDependencyStyle}>
											{packageName}
										</li>
									))}
								</ul>
							</>
						) : null}
						<details style={elementInstallCodeDetailsStyle}>
							<summary style={elementInstallCodeSummaryStyle}>
								Preview Element source
							</summary>
							<pre style={elementInstallCodeBlockStyle}>
								<code>{activeElementInstallRequest.element.sourceCode}</code>
							</pre>
						</details>
					</>
				),
				confirmLabel: 'Install',
				cancelLabel: 'Cancel',
			});

			if (accepted && !canceled) {
				await insertElement({
					element: activeElementInstallRequest.element,
					compositionFile: activeElementInstallRequest.compositionFile,
					compositionId: activeElementInstallRequest.compositionId,
					dropPosition: null,
					from: null,
				});
			}
		};

		handleInstallRequest()
			.finally(() => {
				if (canceled) {
					return;
				}

				setInstallingElementName(null);
				setActiveElementInstallRequest(null);
			})
			.catch((err) => {
				setTimeout(() => {
					throw err;
				}, 0);
			});

		return () => {
			canceled = true;
		};
	}, [activeElementInstallRequest, confirm]);

	const onDragOver = useCallback(
		(event: DragEvent) => {
			if (!isSupportedDropEvent(event) || !isDragEventInsideCanvas(event)) {
				return;
			}

			if (!canDropAssets && !cannotAddSequence) {
				return;
			}

			event.preventDefault();
			if (event.dataTransfer) {
				event.dataTransfer.dropEffect = canDropAssets ? 'copy' : 'none';
			}
		},
		[canDropAssets, cannotAddSequence],
	);

	const onDrop = useCallback(
		async (event: DragEvent) => {
			if (!isSupportedDropEvent(event) || !isDragEventInsideCanvas(event)) {
				return;
			}

			if (cannotAddSequence) {
				event.preventDefault();
				event.stopPropagation();
				showNotification(
					'Cannot insert items into this composition component',
					3000,
				);
				return;
			}

			if (
				!canDropAssets ||
				compositionFile === null ||
				currentCompositionId === null ||
				config === null
			) {
				return;
			}

			if (
				event.dataTransfer &&
				getEffectDragData(event.dataTransfer) !== null
			) {
				event.preventDefault();
				return;
			}

			event.preventDefault();
			event.stopPropagation();

			setIsAddingAsset(true);
			try {
				const dropPosition = getDropPosition({
					addFitPadding,
					clientX: event.clientX,
					clientY: event.clientY,
					contentDimensions,
					previewSize,
					size,
				});

				await handleDrop({
					chooseSvgImportMode,
					compositionFile,
					compositionId: currentCompositionId,
					destinationDimensions:
						contentDimensions === 'none' ? null : contentDimensions,
					dropPosition,
					event,
					fps: config.fps,
					from: getCurrentFrame(),
				});
			} finally {
				setIsAddingAsset(false);
			}
		},
		[
			addFitPadding,
			canDropAssets,
			cannotAddSequence,
			chooseSvgImportMode,
			compositionFile,
			config,
			contentDimensions,
			currentCompositionId,
			previewSize,
			size,
		],
	);

	const onPaste = useCallback(
		async (event: ClipboardEvent) => {
			const {activeElement} = document;
			if (
				!canDropAssets ||
				compositionFile === null ||
				currentCompositionId === null ||
				config === null ||
				event.clipboardData === null ||
				activeElement instanceof HTMLInputElement ||
				activeElement instanceof HTMLTextAreaElement ||
				(activeElement instanceof HTMLElement &&
					activeElement.isContentEditable)
			) {
				return;
			}

			const dropPosition =
				contentDimensions === null || contentDimensions === 'none'
					? null
					: {
							centerX: contentDimensions.width / 2,
							centerY: contentDimensions.height / 2,
						};
			const figmaHtml = getClipboardFigmaHtml(event.clipboardData);
			if (figmaHtml !== null) {
				event.preventDefault();
				setIsAddingAsset(true);
				try {
					await importFigmaClipboard({
						compositionFile,
						compositionId: currentCompositionId,
						destinationDimensions:
							contentDimensions === 'none' ? null : contentDimensions,
						dropPosition,
						html: figmaHtml,
					});
				} finally {
					setIsAddingAsset(false);
				}

				return;
			}

			const svgMarkup = getClipboardSvgMarkup(event.clipboardData);
			if (svgMarkup !== null) {
				event.preventDefault();
				setIsAddingAsset(true);
				try {
					await insertSvgMarkup({
						compositionFile,
						compositionId: currentCompositionId,
						destinationDimensions:
							contentDimensions === 'none' ? null : contentDimensions,
						dropPosition,
						markup: svgMarkup,
					});
				} finally {
					setIsAddingAsset(false);
				}

				return;
			}

			const files = getClipboardImageFiles({
				clipboardData: event.clipboardData,
				existingFileNames: getStaticFiles().map((file) => file.name),
			});
			if (files.length === 0) {
				return;
			}

			event.preventDefault();
			const svgImportMode = hasSvgFile(files)
				? await chooseSvgImportMode()
				: 'image';
			if (svgImportMode === null) {
				return;
			}

			setIsAddingAsset(true);
			try {
				await importAssets({
					files,
					fps: config.fps,
					compositionFile,
					compositionId: currentCompositionId,
					destinationDimensions:
						contentDimensions === 'none' ? null : contentDimensions,
					dropPosition,
					from: null,
					svgImportMode,
				});
			} finally {
				setIsAddingAsset(false);
			}
		},
		[
			canDropAssets,
			chooseSvgImportMode,
			compositionFile,
			config,
			contentDimensions,
			currentCompositionId,
		],
	);

	useEffect(() => {
		document.addEventListener('dragover', onDragOver, {capture: true});
		document.addEventListener('drop', onDrop, {capture: true});

		return () => {
			document.removeEventListener('dragover', onDragOver, {capture: true});
			document.removeEventListener('drop', onDrop, {capture: true});
		};
	}, [onDragOver, onDrop]);

	useEffect(() => {
		if (
			!canDropAssets ||
			!keybindings.isHighestContext ||
			areKeyboardShortcutsDisabled()
		) {
			return;
		}

		document.addEventListener('paste', onPaste);
		return () => document.removeEventListener('paste', onPaste);
	}, [canDropAssets, keybindings.isHighestContext, onPaste]);

	return (
		<>
			<div ref={canvasRef} style={getContainerStyle(editorZoomGestures)}>
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
