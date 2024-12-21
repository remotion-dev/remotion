import {Dimensions} from '@remotion/media-parser';
import {ResizeOperation} from '@remotion/webcodecs';
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
	readonly rotation: number;
	readonly setResizeMode: React.Dispatch<
		React.SetStateAction<ResizeOperation | null>
	>;
}> = ({
	dimensions,
	thumbnailRef,
	originalDimensions,
	rotation,
	setResizeMode,
}) => {
	const outer: React.CSSProperties = useMemo(() => {
		return {...getThumbnailDimensions(dimensions), outlineStyle: 'solid'};
	}, [dimensions]);

	const rotatedDimensions = useMemo(() => {
		if (rotation % 360 === 90 || rotation % 360 === 270) {
			return {
				height: originalDimensions.width,
				width: originalDimensions.height,
			};
		}

		return {
			height: originalDimensions.height,
			width: originalDimensions.width,
		};
	}, [originalDimensions, rotation]);

	return (
		<div className="mt-6 mb-6">
			<div className="flex flex-row justify-center items-center">
				<div className="flex-1" />
				<div
					style={outer}
					className="rounded bg-white transition-all flex justify-center items-center outline-2 outline-slate-300"
				>
					<ResizeThumbnail
						dimensions={rotatedDimensions}
						thumbnailRef={thumbnailRef}
						rotation={rotation}
						scale={dimensions.width / rotatedDimensions.width}
						setResizeMode={setResizeMode}
						unrotatedDimensions={originalDimensions}
					/>
				</div>
				<div className="flex-1 flex flex-row items-center ml-[2px]">
					<div className="w-6 border-b-2 border-black border-dotted" />
					<NumberInput value={dimensions.height} />
				</div>
			</div>
			<div className="flex flex-col items-center mt-[2px]">
				<div className="h-6 border-r-2 border-black border-dotted" />
				<div className="flex flex-row justify-center">
					<NumberInput value={dimensions.width} />
				</div>
			</div>
		</div>
	);
};
