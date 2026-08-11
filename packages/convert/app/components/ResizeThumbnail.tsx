import type {CropRectangle} from 'mediabunny';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import type {Dimensions} from '~/lib/calculate-new-dimensions-from-dimensions';
import type {MediabunnyResize} from '~/lib/mediabunny-calculate-resize-option';
import {useThumbnailCopy} from '~/lib/use-thumbnail-copy';
import {ResizeCorner} from './ResizeCorner';
import type {VideoThumbnailRef} from './VideoThumbnail';

const MAX_THUMBNAIL_SIZE = 150;

export const getThumbnailDimensions = (dimensions: Dimensions) => {
	if (dimensions.height > dimensions.width) {
		return {
			height: MAX_THUMBNAIL_SIZE,
			width: Math.floor(
				(dimensions.width / dimensions.height) * MAX_THUMBNAIL_SIZE,
			),
		};
	}

	return {
		height: Math.floor(
			(dimensions.height / dimensions.width) * MAX_THUMBNAIL_SIZE,
		),
		width: MAX_THUMBNAIL_SIZE,
	};
};

export const ResizeThumbnail: React.FC<{
	readonly dimensions: Dimensions;
	readonly dimensionsBeforeCrop: Dimensions;
	readonly sourceDimensions: Dimensions;
	readonly thumbnailRef: React.RefObject<VideoThumbnailRef | null>;
	readonly rotation: number;
	readonly mirrorHorizontal: boolean;
	readonly mirrorVertical: boolean;
	readonly scale: number;
	readonly setResizeMode: React.Dispatch<
		React.SetStateAction<MediabunnyResize | null>
	>;
	readonly inputFocused: boolean;
	readonly cropRect: CropRectangle;
	readonly crop: boolean;
}> = ({
	thumbnailRef,
	dimensions,
	scale,
	setResizeMode,
	rotation,
	inputFocused,
	cropRect,
	crop,
	dimensionsBeforeCrop,
	sourceDimensions,
	mirrorHorizontal,
	mirrorVertical,
}) => {
	const ref = useRef<HTMLCanvasElement>(null);
	const thumbnailDimensions = useMemo(() => {
		return getThumbnailDimensions(dimensions);
	}, [dimensions]);

	const inner = useMemo(() => {
		return {
			height: thumbnailDimensions.height * scale,
			width: thumbnailDimensions.width * scale,
		};
	}, [scale, thumbnailDimensions]);

	const [dragging, setDragging] = useState(false);

	const onEnd = useCallback(() => {
		setDragging(false);
	}, []);

	const onStart = useCallback(() => {
		setDragging(true);
	}, []);

	const animate = !dragging && !inputFocused && !crop;

	const drawn = useThumbnailCopy({
		sourceRef: thumbnailRef,
		targetRef: ref,
		dimensions: thumbnailDimensions,
		cropRect,
		crop,
		fullDimensionsBeforeCrop: dimensionsBeforeCrop,
		sourceDimensions,
		rotation,
		mirrorHorizontal,
		mirrorVertical,
	});

	return (
		<div className="rounded transition-transform">
			<div
				style={{
					width: inner.width,
					height: inner.height,
					position: 'relative',
					outline: '2px solid black',
					overflow: 'hidden',
				}}
				data-animate={animate}
				className="rounded flex justify-center items-center data-[animate=true]:transition-all"
			>
				<canvas
					ref={ref}
					style={{
						position: 'absolute',
						width: Math.ceil(thumbnailDimensions.width * scale),
						height: Math.ceil(thumbnailDimensions.height * scale),
						transitionProperty: animate ? 'all' : 'none',
						transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
						transitionDuration: '150ms',
						opacity: drawn ? 1 : 0,
					}}
					data-animate={animate}
					width={thumbnailDimensions.width}
					height={thumbnailDimensions.height}
				/>
				<ResizeCorner
					outerDimensions={thumbnailDimensions}
					innerDimensions={inner}
					setResizeMode={setResizeMode}
					videoDimensions={dimensions}
					onEnd={onEnd}
					onStart={onStart}
				/>
			</div>
		</div>
	);
};
