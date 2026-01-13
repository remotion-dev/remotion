import React from 'react';
import {Slider} from '~/components/ui/slider';
import {CheckboxWithLabel} from './CheckboxWithLabel';
import {SliderLabel} from './SliderLabel';
import type {SpringTimingConfig} from './types';

export const SpringEditor: React.FC<{
	readonly config: SpringTimingConfig;
	readonly calculatedDurationInFrames: number;
	readonly onDragChange: (config: SpringTimingConfig) => void;
	readonly onChange: (config: SpringTimingConfig) => void;
	readonly onRelease: () => void;
}> = ({
	config,
	calculatedDurationInFrames,
	onDragChange,
	onRelease,
	onChange,
}) => {
	return (
		<>
			<Slider
				value={[config.springConfig.mass]}
				min={0.3}
				step={0.1}
				max={10}
				onValueChange={(val) => {
					onDragChange({
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
					onDragChange({
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
					onDragChange({
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
				max={6.67}
				step={0.01}
				value={[config.delay / 60]}
				onValueChange={(val) => {
					onDragChange({...config, delay: Math.round(val[0] * 60)});
				}}
				onPointerUp={onRelease}
			/>
			<SliderLabel
				label="delay"
				suffix="s"
				toggleable={null}
				value={Number((config.delay / 60).toFixed(2))}
			/>
			<Slider
				min={0.02}
				max={3.33}
				step={0.01}
				value={[
					(config.durationInFrames ?? calculatedDurationInFrames) / 60,
				]}
				style={{opacity: config.durationInFrames === null ? 0.5 : 1}}
				onValueChange={(val) => {
					onDragChange({
						...config,
						durationInFrames: Math.round(val[0] * 60),
					});
				}}
				onPointerUp={onRelease}
			/>
			<SliderLabel
				label="duration"
				suffix="s"
				toggleable={(enabled) => {
					if (enabled) {
						onDragChange({
							...config,
							durationInFrames: calculatedDurationInFrames,
						});
					} else {
						onDragChange({...config, durationInFrames: null});
					}
				}}
				value={
					config.durationInFrames !== null
						? Number((config.durationInFrames / 60).toFixed(2))
						: null
				}
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
