import React from 'react';
import {Slider} from '~/components/ui/slider';
import {SliderLabel} from './SliderLabel';
import type {SineTimingConfig} from './types';

export const SineEditor: React.FC<{
	readonly config: SineTimingConfig;
	readonly onChange: (config: SineTimingConfig) => void;
	readonly onRelease: () => void;
}> = ({config, onChange, onRelease}) => {
	return (
		<>
			<Slider
				min={1}
				max={200}
				value={[config.durationInFrames]}
				onValueChange={(val) => {
					onChange({...config, durationInFrames: val[0]});
				}}
				onPointerUp={onRelease}
			/>
			<SliderLabel
				label="durationInFrames"
				toggleable={null}
				value={config.durationInFrames}
			/>
			<Slider
				min={0.1}
				max={2}
				step={0.1}
				value={[config.amplitude]}
				onValueChange={(val) => {
					onChange({...config, amplitude: val[0]});
				}}
				onPointerUp={onRelease}
			/>
			<SliderLabel
				label="amplitude"
				toggleable={null}
				value={config.amplitude}
			/>
			<Slider
				min={0.1}
				max={10}
				step={0.1}
				value={[config.frequency]}
				onValueChange={(val) => {
					onChange({...config, frequency: val[0]});
				}}
				onPointerUp={onRelease}
			/>
			<SliderLabel
				label="frequency"
				toggleable={null}
				value={config.frequency}
			/>
			<Slider
				min={0}
				max={100}
				value={[config.frameOffset]}
				onValueChange={(val) => {
					onChange({...config, frameOffset: val[0]});
				}}
				onPointerUp={onRelease}
			/>
			<SliderLabel
				label="frameOffset"
				toggleable={null}
				value={config.frameOffset}
			/>
		</>
	);
};
