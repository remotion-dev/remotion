import type {Dimensions} from '@remotion/media-parser';
import type {ResizeOperation} from '@remotion/webcodecs';
import React, {useCallback, useMemo} from 'react';

export const ResizeOption: React.FC<{
	readonly max: number;
	readonly selected: boolean;
	readonly setResizeMode: React.Dispatch<
		React.SetStateAction<ResizeOperation | null>
	>;
	readonly portrait: boolean;
}> = ({max, selected, setResizeMode, portrait}) => {
	const onClick = useCallback(() => {
		setResizeMode(() => {
			if (portrait) {
				return {
					mode: 'max-width',
					maxWidth: max,
				};
			}

			return {
				mode: 'max-height',
				maxHeight: max,
			};
		});
	}, [max, portrait, setResizeMode]);

	return (
		<div
			data-selected={selected}
			className="font-brand text-sm pl-2 pr-2 text-muted-foreground cursor-pointer transition-colors hover:text-black data-[selected=true]:text-brand"
			onClick={onClick}
		>
			{max}p
		</div>
	);
};

export const ResizeShortcuts: React.FC<{
	readonly originalDimensions: Dimensions;
	readonly resolvedDimensions: Dimensions;
	readonly setResizeMode: React.Dispatch<
		React.SetStateAction<ResizeOperation | null>
	>;
}> = ({originalDimensions, resolvedDimensions, setResizeMode}) => {
	const options = useMemo(() => {
		return [2160, 1080, 720, 480, 360, 240].filter(
			(option) =>
				option < Math.min(originalDimensions.width, originalDimensions.height),
		);
	}, [originalDimensions.height, originalDimensions.width]);

	const smallerSideSelected = useMemo(() => {
		return Math.min(resolvedDimensions.width, resolvedDimensions.height);
	}, [resolvedDimensions.height, resolvedDimensions.width]);

	const portrait = originalDimensions.height > originalDimensions.width;

	return (
		<div className="flex flex-row justify-center mb-6">
			{options.map((option) => (
				<ResizeOption
					key={option}
					portrait={portrait}
					selected={smallerSideSelected === option}
					max={option}
					setResizeMode={setResizeMode}
				/>
			))}
		</div>
	);
};
