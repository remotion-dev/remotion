import {Dimensions} from '@remotion/media-parser';
import {ResizeOperation} from '@remotion/webcodecs';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ResizeCorner} from './ResizeCorner';
import {VideoThumbnailRef} from './VideoThumbnail';

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

	useEffect(() => {
		thumbnailRef.current?.copy().then((map) => {
			const ctx = ref.current?.getContext('2d');
			if (!ctx) {
				return;
			}

			ctx.drawImage(
				map,
				0,
				0,
				unrotatedThumbnailDimensions.width,
				unrotatedThumbnailDimensions.height,
			);
		});
	}, [
		unrotatedThumbnailDimensions.height,
		unrotatedThumbnailDimensions.width,
		thumbnailRef,
	]);

	const [dragging, setDragging] = useState(false);

	const onEnd = useCallback(() => {
		setDragging(false);
	}, []);

	const onStart = useCallback(() => {
		setDragging(true);
	}, []);

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
				data-animate={!dragging && !inputFocused}
				className="rounded flex justify-center items-center data-[animate=true]:transition-all"
			>
				<canvas
					ref={ref}
					className="rounded transition-transform data-[animate=true]:transition-all"
					style={{
						position: 'absolute',
						width: Math.ceil(unrotatedThumbnailDimensions.width * scale),
						height: Math.ceil(unrotatedThumbnailDimensions.height * scale),
						transform: `rotate(${rotation}deg)`,
					}}
					data-animate={!dragging && !inputFocused}
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
