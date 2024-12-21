import {Dimensions} from '@remotion/media-parser';
import React, {useMemo} from 'react';
import {getThumbnailDimensions, ResizeThumbnail} from './ResizeThumbnail';
import {VideoThumbnailRef} from './VideoThumbnail';

const NumberInput: React.FC<{
	readonly value: number;
}> = ({value}) => {
	return (
		<input
			type="number"
			min="2"
			value={value}
			// TODO: only if h264
			step={2}
			className="border-2 border-black border-b-4 w-20 text-center rounded font-brand h-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none active:border-brand focus:border-brand active:text-brand focus:text-brand outline-none"
			id="myRange"
		/>
	);
};

export const ResizeUi: React.FC<{
	readonly dimensions: Dimensions;
	readonly originalDimensions: Dimensions;
	readonly thumbnailRef: React.RefObject<VideoThumbnailRef | null>;
}> = ({dimensions, thumbnailRef, originalDimensions}) => {
	const outer: React.CSSProperties = useMemo(() => {
		return {...getThumbnailDimensions(dimensions), outline: '2px solid black'};
	}, [dimensions]);

	return (
		<div className="mt-6 mb-6">
			<div className="flex flex-row justify-center items-center">
				<div className="flex-1" />
				<div
					style={outer}
					className="rounded bg-white transition-all overflow-hidden"
				>
					<ResizeThumbnail
						dimensions={originalDimensions}
						thumbnailRef={thumbnailRef}
					/>
				</div>
				<div className="flex-1 flex flex-row items-center">
					<div className="w-6 border-b-2 border-black border-dotted" />
					<NumberInput value={dimensions.height} />
				</div>
			</div>
			<div className="flex flex-col items-center">
				<div className="h-6 border-r-2 border-black border-dotted" />
				<div className="flex flex-row justify-center">
					<NumberInput value={dimensions.width} />
				</div>
			</div>
		</div>
	);
};
