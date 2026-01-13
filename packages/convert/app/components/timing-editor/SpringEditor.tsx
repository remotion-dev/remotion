import React from 'react';
import {Slider} from '~/components/ui/slider';
import {CheckboxWithLabel} from './CheckboxWithLabel';
import {SliderLabel} from './SliderLabel';
import type {SpringTimingConfig} from './types';

export const SpringEditor: React.FC<{
	readonly config: SpringTimingConfig;
	readonly calculatedDurationInFrames: number;
	readonly onChange: (config: SpringTimingConfig) => void;
	readonly onRelease: () => void;
}> = ({config, calculatedDurationInFrames, onChange, onRelease}) => {
	return (
		<>
			<Slider
				value={[config.springConfig.mass]}
				min={0.3}
				step={0.1}
				max={10}
				onValueChange={(val) => {
					onChange({
						...config,
						springConfig: {...config.springConfig, mass: val[0]},
					});
				}}
				onPointerUp={onRelease}
			/>
			<SliderLabel
				label="mass"
				value={config.springConfig.mass}
				toggleable={null}
			/>
			<Slider
				min={1}
				max={200}
				value={[config.springConfig.damping]}
				onValueChange={(val) => {
					onChange({
						...config,
						springConfig: {...config.springConfig, damping: val[0]},
					});
				}}
				onPointerUp={onRelease}
			/>
			<SliderLabel
				label="damping"
				value={config.springConfig.damping}
				toggleable={null}
			/>
			<Slider
				min={1}
				max={200}
				value={[config.springConfig.stiffness]}
				onValueChange={(val) => {
					onChange({
						...config,
						springConfig: {...config.springConfig, stiffness: val[0]},
					});
				}}
				onPointerUp={onRelease}
			/>
			<SliderLabel
				toggleable={null}
				label="stiffness"
				value={config.springConfig.stiffness}
			/>
			<Slider
				min={0}
				max={400}
				value={[config.delay]}
				onValueChange={(val) => {
					onChange({...config, delay: val[0]});
				}}
				onPointerUp={onRelease}
			/>
			<SliderLabel label="delay" toggleable={null} value={config.delay} />
			<Slider
				min={1}
				max={200}
				value={[config.durationInFrames ?? calculatedDurationInFrames]}
				style={{opacity: config.durationInFrames === null ? 0.5 : 1}}
				onValueChange={(val) => {
					onChange({...config, durationInFrames: val[0]});
				}}
				onPointerUp={onRelease}
			/>
			<SliderLabel
				label="durationInFrames"
				toggleable={(enabled) => {
					if (enabled) {
						onChange({...config, durationInFrames: calculatedDurationInFrames});
					} else {
						onChange({...config, durationInFrames: null});
					}
				}}
				value={config.durationInFrames ?? null}
			/>
			<CheckboxWithLabel
				checked={config.springConfig.overshootClamping}
				id="overshootClamping"
				onCheckedChange={(checked) => {
					onChange({
						...config,
						springConfig: {...config.springConfig, overshootClamping: checked},
					});
				}}
			/>
			<CheckboxWithLabel
				checked={config.reverse}
				id="reverse"
				onCheckedChange={(checked) => {
					onChange({...config, reverse: checked});
				}}
			/>
		</>
	);
};
