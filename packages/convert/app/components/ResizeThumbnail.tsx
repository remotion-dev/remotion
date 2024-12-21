import {Dimensions} from '@remotion/media-parser';
import React, {useEffect, useMemo, useRef} from 'react';
import {VideoThumbnailRef} from './VideoThumbnail';

export const getThumbnailDimensions = (dimensions: Dimensions) => {
	if (dimensions.height > dimensions.width) {
		return {
			height: 150,
			width: Math.floor((dimensions.width / dimensions.height) * 150),
		};
	}

	return {
		height: Math.floor((dimensions.height / dimensions.width) * 150),
		width: 150,
	};
};

export const ResizeThumbnail: React.FC<{
	readonly dimensions: Dimensions;
	readonly thumbnailRef: React.RefObject<VideoThumbnailRef | null>;
}> = ({thumbnailRef, dimensions}) => {
	const ref = useRef<HTMLCanvasElement>(null);
	const outer = useMemo(() => {
		return getThumbnailDimensions(dimensions);
	}, [dimensions]);

	useEffect(() => {
		thumbnailRef.current?.copy().then((map) => {
			const ctx = ref.current?.getContext('2d');
			if (!ctx) {
				return;
			}

			ctx.drawImage(map, 0, 0, outer.width, outer.height);
		});
	}, [outer.height, outer.width, thumbnailRef]);

	return (
		<canvas
			ref={ref}
			className="rounded overflow-hidden"
			width={outer.width}
			height={outer.height}
		/>
	);
};
