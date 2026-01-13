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
				min={0.02}
				max={3.33}
				step={0.01}
				value={[config.durationInFrames / 60]}
				onValueChange={(val) => {
					onChange({...config, durationInFrames: Math.round(val[0] * 60)});
				}}
				onPointerUp={onRelease}
			/>
			<SliderLabel
				label="duration"
				suffix="s"
				toggleable={null}
				value={Number((config.durationInFrames / 60).toFixed(2))}
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
				max={1.67}
				step={0.01}
				value={[config.frameOffset / 60]}
				onValueChange={(val) => {
					onChange({...config, frameOffset: Math.round(val[0] * 60)});
				}}
				onPointerUp={onRelease}
			/>
			<SliderLabel
				label="offset"
				suffix="s"
				toggleable={null}
				value={Number((config.frameOffset / 60).toFixed(2))}
			/>
		</>
	);
};
