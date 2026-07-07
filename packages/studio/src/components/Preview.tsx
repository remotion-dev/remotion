import type {Size} from '@remotion/player';
import {PlayerInternals} from '@remotion/player';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
} from 'react';
import type {CanvasContent} from 'remotion';
import {Internals} from 'remotion';
import {ErrorLoader} from '../error-overlay/remotion-overlay/ErrorLoader';
import {
	checkerboardBackgroundColor,
	checkerboardBackgroundImage,
	getCheckerboardBackgroundPos,
	getCheckerboardBackgroundSize,
} from '../helpers/checkerboard-background';
import {LIGHT_TEXT} from '../helpers/colors';
import type {AssetMetadata} from '../helpers/get-asset-metadata';
import {getPreviewFileType} from '../helpers/get-preview-file-type';
import type {Dimensions} from '../helpers/is-current-selected-still';
import {CheckerboardContext} from '../state/checkerboard';
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

	if (contentDimensions === null) {
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

		return PlayerInternals.calculateCanvasTransformation({
			canvasSize,
			compositionHeight: contentDimensions.height,
			compositionWidth: contentDimensions.width,
			previewSize: previewSize.size,
		});
	}, [canvasSize, contentDimensions, previewSize.size]);

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
			justifyContent: canvasContent.type === 'asset' ? 'center' : 'flex-start',
			alignItems:
				canvasContent.type === 'asset' &&
				getPreviewFileType(canvasContent.asset) === 'audio'
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
	]);

	if (canvasContent.type === 'asset') {
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
		<div style={outer}>
			<PortalContainer
				contentDimensions={contentDimensions as Dimensions}
				scale={scale}
				xCorrection={xCorrection}
				yCorrection={yCorrection}
			/>
			<SelectedOutlineOverlay
				compositionHeight={(contentDimensions as Dimensions).height}
				compositionWidth={(contentDimensions as Dimensions).width}
				scale={scale}
				translationX={previewSize.translation.x}
				translationY={previewSize.translation.y}
			/>
		</div>
	);
};

const PortalContainer: React.FC<{
	readonly scale: number;
	readonly xCorrection: number;
	readonly yCorrection: number;
	readonly contentDimensions: Dimensions;
}> = ({scale, xCorrection, yCorrection, contentDimensions}) => {
	const {checkerboard} = useContext(CheckerboardContext);
	const {clearSelection} = useTimelineSelection();
	const portalContainer = useRef<HTMLDivElement>(null);

	const style = useMemo((): React.CSSProperties => {
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
		scale,
		xCorrection,
		yCorrection,
	]);

	useEffect(() => {
		const {current} = portalContainer;
		current?.appendChild(Internals.portalNode());
		return () => {
			current?.removeChild(Internals.portalNode());
		};
	}, []);

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
