import React from 'react';
import {cn} from './helpers/cn';

export type SliderProps = Omit<
	React.ComponentPropsWithoutRef<'input'>,
	'onChange' | 'type' | 'value'
> & {
	readonly value: number;
	readonly onChange: (value: number) => void;
	// eslint-disable-next-line react/require-default-props -- public API prop is normalized by the component
	readonly unfilledColor?: string;
};

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
	(
		{
			className,
			max = 100,
			min = 0,
			onChange,
			style,
			unfilledColor = 'var(--color-card-bg, white)',
			value,
			...props
		},
		ref,
	) => {
		const numericMin = Number(min);
		const numericMax = Number(max);
		const percentage =
			numericMax === numericMin
				? 0
				: ((value - numericMin) / (numericMax - numericMin)) * 100;

		return (
			<>
				<style>
					{`
						.remotion-design-slider {
							-webkit-appearance: none;
							appearance: none;
							height: 12px;
							border-radius: 8px;
							border: 2px solid black;
							cursor: pointer;
						}
						.remotion-design-slider::-webkit-slider-thumb {
							-webkit-appearance: none;
							appearance: none;
							width: 24px;
							height: 24px;
							border-radius: 50%;
							background: white;
							border: 2px solid black;
							border-bottom-width: 4px;
							cursor: pointer;
							scale: 1.2;
						}
						.remotion-design-slider::-moz-range-thumb {
							width: 24px;
							height: 24px;
							border-radius: 50%;
							background: white;
							border: 2px solid black;
							border-bottom-width: 4px;
							scale: 1.2;
							cursor: pointer;
						}
						.remotion-design-slider:disabled,
						.remotion-design-slider:disabled::-webkit-slider-thumb,
						.remotion-design-slider:disabled::-moz-range-thumb {
							cursor: default;
							opacity: 0.5;
						}
					`}
				</style>
				<input
					ref={ref}
					type="range"
					min={min}
					max={max}
					value={value}
					onChange={(event) => onChange(Number(event.target.value))}
					className={cn('remotion-design-slider w-full', className)}
					style={{
						background: `linear-gradient(to right, var(--color-brand) 0%, var(--color-brand) ${percentage}%, ${unfilledColor} ${percentage}%, ${unfilledColor} 100%)`,
						...style,
					}}
					{...props}
				/>
			</>
		);
	},
);

Slider.displayName = 'Slider';
