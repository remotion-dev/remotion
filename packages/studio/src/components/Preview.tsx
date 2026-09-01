import {Audio, Video} from '@remotion/media';
import type {Size} from '@remotion/player';
import {PlayerInternals} from '@remotion/player';
import React, {
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {createPortal} from 'react-dom';
import type {CanvasContent} from 'remotion';
import {Internals, staticFile} from 'remotion';
import {ErrorLoader} from '../error-overlay/remotion-overlay/ErrorLoader';
import {addAssetCacheBust} from '../helpers/add-asset-cache-bust';
import {
	checkerboardBackgroundColor,
	checkerboardBackgroundImage,
	getCheckerboardBackgroundPos,
	getCheckerboardBackgroundSize,
} from '../helpers/checkerboard-background';
import {LIGHT_TEXT, RULER_COLOR} from '../helpers/colors';
import type {AssetMetadata} from '../helpers/get-asset-metadata';
import {getPreviewFileType} from '../helpers/get-preview-file-type';
import type {Dimensions} from '../helpers/is-current-selected-still';
import {calculateStudioCanvasTransformation} from '../helpers/studio-fit-padding';
import {AudioFileIcon} from '../icons/audio';
import {CheckerboardContext} from '../state/checkerboard';
import {EditorShowPixelGridContext} from '../state/editor-pixel-grid';
import {VERTICAL_SCROLLBAR_CLASSNAME} from './Menu/is-menu-item';
import {RenderPreview} from './RenderPreview';
import {SelectedOutlineOverlay} from './SelectedOutlineOverlay';
import {Spinner} from './Spinner';
import {StaticFilePreview} from './StaticFilePreview';
import {shouldClearSelectionOnPointerDown} from './Timeline/should-clear-selection-on-pointer-down';
import {useTimelineSelection} from './Timeline/TimelineSelection';

const centeredContainer: React.CSSProperties = {
	display: 'flex',
	flex: 1,
	justifyContent: 'center',
	alignItems: 'center',
};

const label: React.CSSProperties = {
	fontFamily: 'sans-serif',
	fontSize: 14,
	color: LIGHT_TEXT,
};

const assetMetadataErrorContainer: React.CSSProperties = {
	marginLeft: 'auto',
	marginRight: 'auto',
	width: '100%',
	position: 'absolute',
	height: '100%',
	overflowY: 'auto',
};

const checkerboardSize = 49;
const PIXEL_GRID_MIN_SCALE = 4;

const containerStyle = (options: {
	scale: number;
	xCorrection: number;
	yCorrection: number;
	width: number;
	height: number;
	checkerboard: boolean;
}): React.CSSProperties => {
	return {
		transform: `scale(${options.scale})`,
		// Avoid the background bleeding through opaque compositions at fractional
		// scales due to Chromium compositing the child and background together.
		willChange: 'transform',
		marginLeft: options.xCorrection,
		marginTop: options.yCorrection,
		width: options.width,
		height: options.height,
		display: 'flex',
		overflow: 'hidden',
		position: 'absolute',
		backgroundColor: checkerboardBackgroundColor(options.checkerboard),
		backgroundImage: checkerboardBackgroundImage(options.checkerboard),
		backgroundSize:
			getCheckerboardBackgroundSize(checkerboardSize) /* Must be a square */,
		backgroundPosition:
			getCheckerboardBackgroundPos(
				checkerboardSize,
			) /* Must be half of one side of the square */,
	};
};

const PixelGrid: React.FC<{
	readonly scale: number;
}> = ({scale}) => {
	const {editorShowPixelGrid} = useContext(EditorShowPixelGridContext);

	if (!editorShowPixelGrid || scale < PIXEL_GRID_MIN_SCALE) {
		return null;
	}

	return (
		<div
			aria-hidden="true"
			className="css-reset"
			data-testid="pixel-grid"
			style={{
				position: 'absolute',
				inset: 0,
				pointerEvents: 'none',
				opacity: 0.35,
				backgroundImage: `linear-gradient(to right, ${RULER_COLOR} 1px, transparent 1px), linear-gradient(to bottom, ${RULER_COLOR} 1px, transparent 1px)`,
				backgroundSize: `${scale}px ${scale}px`,
			}}
		/>
	);
};

export const VideoPreview: React.FC<{
	readonly canvasSize: Size;
	readonly contentDimensions: Dimensions | 'none' | null;
	readonly canvasContent: CanvasContent;
	readonly assetMetadata: AssetMetadata | null;
	readonly onRetryAssetMetadata?: () => void;
}> = ({
	canvasSize,
	contentDimensions,
	canvasContent,
	assetMetadata,
	onRetryAssetMetadata,
}) => {
	if (assetMetadata && assetMetadata.type === 'not-found') {
		return (
			<div style={centeredContainer}>
				<div style={label}>File does not exist</div>
			</div>
		);
	}

	if (assetMetadata && assetMetadata.type === 'metadata-error') {
		return (
			<div
				style={assetMetadataErrorContainer}
				className={VERTICAL_SCROLLBAR_CLASSNAME}
			>
				<ErrorLoader
					key={assetMetadata.error.stack}
					canHaveDismissButton={false}
					keyboardShortcuts={false}
					error={assetMetadata.error}
					onRetry={onRetryAssetMetadata ?? null}
					calculateMetadata={false}
				/>
			</div>
		);
	}

	if (
		contentDimensions === null ||
		(canvasContent.type !== 'composition' && assetMetadata === null)
	) {
		return (
			<div style={centeredContainer}>
				<Spinner duration={0.5} size={24} />
			</div>
		);
	}

	return (
		<CompWhenItHasDimensions
			contentDimensions={contentDimensions}
			canvasSize={canvasSize}
			canvasContent={canvasContent}
			assetMetadata={assetMetadata}
		/>
	);
};

const CompWhenItHasDimensions: React.FC<{
	readonly contentDimensions: Dimensions | 'none';
	readonly canvasSize: Size;
	readonly canvasContent: CanvasContent;
	readonly assetMetadata: AssetMetadata | null;
}> = ({contentDimensions, canvasSize, canvasContent, assetMetadata}) => {
	const {size: previewSize} = useContext(Internals.PreviewSizeContext);
	const {currentAssetMetadata} = useContext(Internals.CompositionManager);
	const [canvasHovered, setCanvasHovered] = useState(false);
	const compositionContainerRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const compositionContainer = compositionContainerRef.current;
		if (compositionContainer === null) {
			setCanvasHovered(false);
			return;
		}

		const onPointerEnter = () => setCanvasHovered(true);
		const onPointerLeave = () => setCanvasHovered(false);
		setCanvasHovered(compositionContainer.matches(':hover'));
		compositionContainer.addEventListener('pointerenter', onPointerEnter);
		compositionContainer.addEventListener('pointerleave', onPointerLeave);

		return () => {
			compositionContainer.removeEventListener('pointerenter', onPointerEnter);
			compositionContainer.removeEventListener('pointerleave', onPointerLeave);
		};
	}, [canvasContent.type]);

	const {centerX, centerY, yCorrection, xCorrection, scale} = useMemo(() => {
		if (contentDimensions === 'none') {
			return {
				centerX: 0,
				centerY: 0,
				yCorrection: 0,
				xCorrection: 0,
				scale: 1,
			};
		}

		return canvasContent.type === 'composition'
			? calculateStudioCanvasTransformation({
					canvasSize,
					compositionHeight: contentDimensions.height,
					compositionWidth: contentDimensions.width,
					previewSize: previewSize.size,
				})
			: PlayerInternals.calculateCanvasTransformation({
					canvasSize,
					compositionHeight: contentDimensions.height,
					compositionWidth: contentDimensions.width,
					previewSize: previewSize.size,
				});
	}, [canvasContent.type, canvasSize, contentDimensions, previewSize.size]);
	const assetFileType =
		canvasContent.type === 'asset'
			? getPreviewFileType(canvasContent.asset)
			: null;
	const mediaCompositionFileType =
		(assetFileType === 'audio' || assetFileType === 'video') &&
		assetMetadata?.type === 'found' &&
		assetMetadata.mediaMetadata !== null &&
		canvasContent.type === 'asset' &&
		currentAssetMetadata?.asset === canvasContent.asset &&
		contentDimensions !== 'none'
			? assetFileType
			: null;

	const outer: React.CSSProperties = useMemo(() => {
		return {
			width:
				contentDimensions === 'none' ? '100%' : contentDimensions.width * scale,
			height:
				contentDimensions === 'none'
					? '100%'
					: contentDimensions.height * scale,
			display: 'flex',
			flexDirection: 'column',
			position: 'absolute',
			left: centerX - previewSize.translation.x,
			top: centerY - previewSize.translation.y,
			overflow: canvasContent.type === 'composition' ? 'visible' : 'hidden',
			justifyContent:
				canvasContent.type === 'asset' && mediaCompositionFileType === null
					? 'center'
					: 'flex-start',
			alignItems:
				canvasContent.type === 'asset' &&
				mediaCompositionFileType === null &&
				assetFileType === 'audio'
					? 'center'
					: 'normal',
		};
	}, [
		contentDimensions,
		scale,
		centerX,
		previewSize.translation.x,
		previewSize.translation.y,
		centerY,
		canvasContent,
		mediaCompositionFileType,
		assetFileType,
	]);

	if (canvasContent.type === 'asset') {
		if (
			mediaCompositionFileType !== null &&
			assetMetadata?.type === 'found' &&
			contentDimensions !== 'none'
		) {
			return (
				<div
					ref={compositionContainerRef}
					className="remotion-studio-composition-container"
					style={outer}
				>
					{mediaCompositionFileType === 'audio' ? (
						<AudioFileIcon
							aria-label="Audio asset"
							color={LIGHT_TEXT}
							role="img"
							style={{
								height: 64,
								left: '50%',
								opacity: 0.25,
								pointerEvents: 'none',
								position: 'absolute',
								top: '50%',
								transform: 'translate(-50%, -50%)',
								width: 64,
							}}
						/>
					) : null}
					<PortalContainer
						contentDimensions={contentDimensions}
						offscreen={mediaCompositionFileType === 'audio'}
						scale={scale}
						xCorrection={xCorrection}
						yCorrection={yCorrection}
					/>
					<AssetMediaComposition
						asset={canvasContent.asset}
						fetchedAt={assetMetadata.fetchedAt}
						fileType={mediaCompositionFileType}
					/>
				</div>
			);
		}

		return (
			<div style={outer}>
				<StaticFilePreview
					assetMetadata={assetMetadata}
					currentAsset={canvasContent.asset}
				/>
			</div>
		);
	}

	if (canvasContent.type === 'output') {
		return (
			<div style={outer}>
				<RenderPreview
					path={canvasContent.path}
					assetMetadata={assetMetadata}
				/>
			</div>
		);
	}

	if (canvasContent.type === 'output-blob') {
		return (
			<div style={outer}>
				<RenderPreview
					path={canvasContent.displayName}
					assetMetadata={assetMetadata}
					getBlob={canvasContent.getBlob}
				/>
			</div>
		);
	}

	return (
		<div
			ref={compositionContainerRef}
			className="remotion-studio-composition-container"
			style={outer}
		>
			<PortalContainer
				contentDimensions={contentDimensions as Dimensions}
				offscreen={false}
				scale={scale}
				xCorrection={xCorrection}
				yCorrection={yCorrection}
			/>
			<PixelGrid scale={scale} />
			<SelectedOutlineOverlay
				canvasHovered={canvasHovered}
				compositionHeight={(contentDimensions as Dimensions).height}
				compositionWidth={(contentDimensions as Dimensions).width}
				scale={scale}
				translationX={previewSize.translation.x}
				translationY={previewSize.translation.y}
			/>
		</div>
	);
};

const AssetMediaComposition: React.FC<{
	readonly asset: string;
	readonly fetchedAt: number;
	readonly fileType: 'audio' | 'video';
}> = ({asset, fetchedAt, fileType}) => {
	const src = addAssetCacheBust({
		fetchedAt,
		src: staticFile(asset),
	});
	const style: React.CSSProperties = {
		width: '100%',
		height: '100%',
	};

	return createPortal(
		<Internals.CanUseRemotionHooksProvider>
			<Internals.DisableInteractivityProvider>
				<div data-testid="asset-media-preview" style={style}>
					{fileType === 'video' ? (
						<Video name={asset} src={src} style={style} />
					) : (
						<Audio name={asset} src={src} />
					)}
				</div>
			</Internals.DisableInteractivityProvider>
		</Internals.CanUseRemotionHooksProvider>,
		Internals.portalNode(),
	);
};

const PortalContainer: React.FC<{
	readonly offscreen: boolean;
	readonly scale: number;
	readonly xCorrection: number;
	readonly yCorrection: number;
	readonly contentDimensions: Dimensions;
}> = ({offscreen, scale, xCorrection, yCorrection, contentDimensions}) => {
	const {checkerboard} = useContext(CheckerboardContext);
	const {clearSelection} = useTimelineSelection();
	const portalContainer = useRef<HTMLDivElement>(null);

	const style = useMemo((): React.CSSProperties => {
		if (offscreen) {
			return {
				height: contentDimensions.height,
				left: -999999,
				overflow: 'hidden',
				position: 'fixed',
				top: 0,
				width: contentDimensions.width,
			};
		}

		return containerStyle({
			checkerboard,
			scale,
			xCorrection,
			yCorrection,
			width: contentDimensions.width,
			height: contentDimensions.height,
		});
	}, [
		checkerboard,
		contentDimensions.height,
		contentDimensions.width,
		offscreen,
		scale,
		xCorrection,
		yCorrection,
	]);

	useLayoutEffect(() => {
		const {current} = portalContainer;
		current?.appendChild(Internals.portalNode());

		return () => {
			const portalNode = Internals.portalNode();
			if (current && portalNode.parentNode === current) {
				current.removeChild(portalNode);
				Internals.setPortalNodeCurrentScale(1);
			}
		};
	}, []);

	useLayoutEffect(() => {
		Internals.setPortalNodeCurrentScale(scale);
	}, [scale]);

	const onPointerDown = useCallback(
		(event: PointerEvent) => {
			if (!shouldClearSelectionOnPointerDown(event)) {
				return;
			}

			clearSelection();
		},
		[clearSelection],
	);

	useEffect(() => {
		const {current} = portalContainer;
		if (!current) {
			return;
		}

		current.addEventListener('pointerdown', onPointerDown);

		return () => {
			current.removeEventListener('pointerdown', onPointerDown);
		};
	}, [onPointerDown]);

	return <div ref={portalContainer} style={style} />;
};
