import {serializeInstructions, type ReducedInstruction} from '@remotion/paths';
import type {CropRectangle} from 'mediabunny';
import type {Dimensions} from '~/lib/calculate-new-dimensions-from-dimensions';

export const CropBackdrop: React.FC<{
	readonly rect: CropRectangle;
	readonly dimensions: Dimensions;
}> = ({rect, dimensions}) => {
	const path1: ReducedInstruction[] = [
		{
			type: 'M',
			x: 0,
			y: 0,
		},
		{
			type: 'L',
			x: rect.left + rect.width,
			y: 0,
		},
		{
			type: 'L',
			x: rect.left + rect.width,
			y: rect.top,
		},
		{
			type: 'L',
			x: rect.left,
			y: rect.top,
		},
		{
			type: 'L',
			x: rect.left,
			y: dimensions.height,
		},
		{
			type: 'L',
			x: 0,
			y: dimensions.height,
		},
		{
			type: 'Z',
		},
	];
	const d1 = serializeInstructions(path1);

	const path2: ReducedInstruction[] = [
		{
			type: 'M',
			x: dimensions.width,
			y: dimensions.height,
		},
		{
			type: 'L',
			x: dimensions.width,
			y: 0,
		},
		{
			type: 'L',
			x: dimensions.width,
			y: 0,
		},
		{
			type: 'L',
			x: rect.left + rect.width,
			y: 0,
		},
		{
			type: 'L',
			x: rect.left + rect.width,
			y: rect.top + rect.height,
		},
		{type: 'L', x: rect.left, y: rect.top + rect.height},
		{
			type: 'L',
			x: rect.left,
			y: dimensions.height,
		},
		{type: 'Z'},
	];
	const d2 = serializeInstructions(path2);
	return (
		<svg viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}>
			<path d={d1} fill="black" strokeWidth={10} opacity={0.5} />
			<path d={d2} fill="black" strokeWidth={10} opacity={0.5} />
		</svg>
	);
};
