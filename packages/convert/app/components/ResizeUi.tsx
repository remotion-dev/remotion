import type {Dimensions} from '@remotion/media-parser';
import type {ResizeOperation} from '@remotion/webcodecs';
import React, {useCallback, useMemo} from 'react';
import {ResizeShortcuts} from './ResizeShortcuts';
import {getThumbnailDimensions, ResizeThumbnail} from './ResizeThumbnail';
import type {VideoThumbnailRef} from './VideoThumbnail';

const NumberInput: React.FC<{
	readonly value: number;
	readonly requireTwoStep: boolean;
	readonly onValueChange: (value: number) => void;
	readonly onFocus: () => void;
	readonly onBlur: () => void;
}> = ({value, requireTwoStep, onValueChange, onBlur, onFocus}) => {
	const ref = React.useRef<HTMLInputElement>(null);
	return (
		<div className="flex flex-row">
			<input
				ref={ref}
				type="number"
				min="2"
				value={value}
				step={requireTwoStep ? 2 : 1}
				className="border-2 border-black border-b-4 w-20 text-center rounded font-brand h-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none active:border-brand focus:border-brand active:text-brand focus:text-brand outline-none"
				onFocus={() => {
					ref.current?.select();
					onFocus();
				}}
				onBlur={onBlur}
				onChange={(e) => {
					onValueChange(Number(e.target.value));
				}}
			/>
		</div>
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
	readonly requireTwoStep: boolean;
}> = ({
	dimensions,
	thumbnailRef,
	originalDimensions,
	rotation,
	setResizeMode,
	requireTwoStep,
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

	const onChangeHeight = useCallback(
		(height: number) => {
			setResizeMode(() => {
				return {
					mode: 'max-height',
					maxHeight: height,
				};
			});
		},
		[setResizeMode],
	);

	const onChangeWidth = useCallback(
		(width: number) => {
			setResizeMode(() => {
				return {
					mode: 'max-width',
					maxWidth: width,
				};
			});
		},
		[setResizeMode],
	);

	const [widthFocused, setWidthFocused] = React.useState(false);
	const [heightFocused, setHeightFocused] = React.useState(false);

	return (
		<div className="mt-6 mb-6">
			<ResizeShortcuts
				originalDimensions={rotatedDimensions}
				resolvedDimensions={dimensions}
				setResizeMode={setResizeMode}
			/>

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
						inputFocused={widthFocused || heightFocused}
					/>
				</div>
				<div className="flex-1 flex flex-row items-center ml-[2px]">
					<div className="w-6 border-b-2 border-black border-dotted" />
					<NumberInput
						requireTwoStep={requireTwoStep}
						value={dimensions.height}
						onValueChange={onChangeHeight}
						onBlur={() => setHeightFocused(false)}
						onFocus={() => setHeightFocused(true)}
					/>
				</div>
			</div>
			<div className="flex flex-col items-center mt-[2px]">
				<div className="h-6 border-r-2 border-black border-dotted" />
				<div className="flex flex-row justify-center">
					<NumberInput
						requireTwoStep={requireTwoStep}
						value={dimensions.width}
						onValueChange={onChangeWidth}
						onBlur={() => setWidthFocused(false)}
						onFocus={() => setWidthFocused(true)}
					/>
				</div>
			</div>
		</div>
	);
};
