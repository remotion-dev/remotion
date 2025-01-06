import type {Dimensions} from '@remotion/media-parser';
import type {ResizeOperation} from '@remotion/webcodecs';
import React, {useCallback, useMemo, useRef, useState} from 'react';
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
	readonly unrotatedDimensions: Dimensions;
	readonly thumbnailRef: React.RefObject<VideoThumbnailRef | null>;
	readonly rotation: number;
	readonly scale: number;
	readonly setResizeMode: React.Dispatch<
		React.SetStateAction<ResizeOperation | null>
	>;
	readonly inputFocused: boolean;
}> = ({
	thumbnailRef,
	dimensions,
	scale,
	setResizeMode,
	rotation,
	unrotatedDimensions,
	inputFocused,
}) => {
	const ref = useRef<HTMLCanvasElement>(null);
	const thumbnailDimensions = useMemo(() => {
		return getThumbnailDimensions(dimensions);
	}, [dimensions]);

	const unrotatedThumbnailDimensions = useMemo(() => {
		return getThumbnailDimensions(unrotatedDimensions);
	}, [unrotatedDimensions]);

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

	const animate = !dragging && !inputFocused;

	const drawn = useThumbnailCopy({
		sourceRef: thumbnailRef,
		targetRef: ref,
		dimensions: unrotatedThumbnailDimensions,
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
						width: Math.ceil(unrotatedThumbnailDimensions.width * scale),
						height: Math.ceil(unrotatedThumbnailDimensions.height * scale),
						transform: `rotate(${rotation}deg)`,
						transitionProperty: animate ? 'all' : 'none',
						transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
						transitionDuration: '150ms',
						opacity: drawn ? 1 : 0,
					}}
					data-animate={animate}
					width={unrotatedThumbnailDimensions.width}
					height={unrotatedThumbnailDimensions.height}
				/>
				<ResizeCorner
					outerDimensions={thumbnailDimensions}
					innerDimensions={inner}
					setResizeMode={setResizeMode}
					videoDimensions={unrotatedDimensions}
					onEnd={onEnd}
					onStart={onStart}
				/>
			</div>
		</div>
	);
};
