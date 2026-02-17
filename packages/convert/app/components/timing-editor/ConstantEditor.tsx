import React from 'react';
import {Slider} from '~/components/ui/slider';
import {SliderLabel} from './SliderLabel';
import type {ConstantTimingConfig} from './types';

export const ConstantEditor: React.FC<{
	readonly config: ConstantTimingConfig;
	readonly onChange: (config: ConstantTimingConfig) => void;
	readonly onRelease: () => void;
}> = ({config, onChange, onRelease}) => {
	return (
		<>
			<Slider
				min={-5}
				max={5}
				step={0.1}
				value={[config.value]}
				onValueChange={(val) => {
					onChange({...config, value: val[0]});
				}}
				onPointerUp={onRelease}
			/>
			<SliderLabel label="value" toggleable={null} value={config.value} />
		</>
	);
};
