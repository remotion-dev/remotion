import {forwardRef, type InputHTMLAttributes} from 'react';
import {Interactive} from 'remotion';

const NativeRange = forwardRef<
	HTMLInputElement,
	Pick<InputHTMLAttributes<HTMLInputElement>, 'style'> &
		Partial<Record<'value' | 'min' | 'max' | 'step', number>>
>(({value = 50, min, max, step, style}, ref) => (
	<input
		key={value}
		ref={ref}
		type="range"
		aria-label="Range input"
		defaultValue={value}
		min={min}
		max={max}
		step={step}
		style={style}
	/>
));

const RangeInput = Interactive.create({
	Component: NativeRange,
	componentName: 'Range input',
	layout: 'none',
	schema: {
		value: {
			type: 'number',
			default: 50,
			description: 'Value',
			hiddenFromList: false,
		},
		min: {
			type: 'number',
			default: 0,
			description: 'Minimum',
			hiddenFromList: false,
		},
		max: {
			type: 'number',
			default: 100,
			description: 'Maximum',
			hiddenFromList: false,
		},
		step: {
			type: 'number',
			default: 1,
			description: 'Step',
			hiddenFromList: false,
		},
	},
});

export const RangeInputScene = () => (
	<div
		style={{
			position: 'absolute',
			inset: 0,
			display: 'grid',
			placeItems: 'center',
			backgroundColor: 'black',
		}}
	>
		<RangeInput name="Range input" value={50} min={0} max={100} step={1} />
	</div>
);
