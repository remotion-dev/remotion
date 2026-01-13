import React from 'react';
import {Slider} from '~/components/ui/slider';
import {Tabs, TabsList, TabsTrigger} from '~/components/ui/tabs';
import {CheckboxWithLabel} from './CheckboxWithLabel';
import {EASING_OPTIONS} from './defaults';
import {SliderLabel} from './SliderLabel';
import {Spacing} from './Spacing';
import type {EasingType, TimingConfig} from './types';

export const Sidebar: React.FC<{
	readonly config: TimingConfig;
	readonly calculatedDurationInFrames: number;
	readonly onModeChange: (mode: 'spring' | 'interpolate' | 'sine') => void;
	readonly onMassChange: (e: [number]) => void;
	readonly onDampingChange: (e: [number]) => void;
	readonly onStiffnessChange: (e: [number]) => void;
	readonly onDurationInFramesChange: (e: number | null) => void;
	readonly onDelayChange: (e: number) => void;
	readonly onRelease: () => void;
	readonly onOvershootClampingChange: (checked: boolean) => void;
	readonly onReverseChange: (checked: boolean) => void;
	readonly onEasingChange: (easing: EasingType) => void;
	readonly onAmplitudeChange: (e: number) => void;
	readonly onFrequencyChange: (e: number) => void;
	readonly onFrameOffsetChange: (e: number) => void;
}> = ({
	config,
	calculatedDurationInFrames,
	onModeChange,
	onMassChange,
	onDampingChange,
	onStiffnessChange,
	onDurationInFramesChange,
	onRelease,
	onOvershootClampingChange,
	onReverseChange,
	onDelayChange,
	onEasingChange,
	onAmplitudeChange,
	onFrequencyChange,
	onFrameOffsetChange,
}) => {
	return (
		<div
			id="spring-sidebar"
			className="p-4"
			style={{
				display: 'flex',
				flexDirection: 'column',
				borderRight: '1px solid #242424',
			}}
		>
			<Tabs
				value={config.type}
				onValueChange={(value) =>
					onModeChange(value as 'spring' | 'interpolate' | 'sine')
				}
			>
				<TabsList style={{width: '100%'}}>
					<TabsTrigger value="spring" style={{flex: 1}}>
						Spring
					</TabsTrigger>
					<TabsTrigger value="interpolate" style={{flex: 1}}>
						Interpolate
					</TabsTrigger>
					<TabsTrigger value="sine" style={{flex: 1}}>
						Sine
					</TabsTrigger>
				</TabsList>
			</Tabs>
			<Spacing y={3} />

			{config.type === 'spring' ? (
				<>
					<Slider
						value={[config.springConfig.mass]}
						min={0.3}
						step={0.1}
						max={10}
						onValueChange={onMassChange}
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
						onValueChange={onDampingChange}
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
						onValueChange={onStiffnessChange}
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
							onDelayChange(val[0]);
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
							onDurationInFramesChange(val[0]);
						}}
						onPointerUp={onRelease}
					/>
					<SliderLabel
						label="durationInFrames"
						toggleable={(enabled) => {
							if (enabled) {
								onDurationInFramesChange(calculatedDurationInFrames);
							} else {
								onDurationInFramesChange(null);
							}
						}}
						value={config.durationInFrames ?? null}
					/>
					<CheckboxWithLabel
						checked={config.springConfig.overshootClamping}
						id="overshootClamping"
						onCheckedChange={onOvershootClampingChange}
					/>
					<CheckboxWithLabel
						checked={config.reverse}
						id="reverse"
						onCheckedChange={onReverseChange}
					/>
				</>
			) : config.type === 'interpolate' ? (
				<>
					<label
						htmlFor="easing-select"
						style={{
							fontSize: 12,
							color: 'var(--muted-foreground)',
							marginBottom: 4,
						}}
					>
						Easing
					</label>
					<select
						id="easing-select"
						value={config.easing}
						onChange={(e) => onEasingChange(e.target.value as EasingType)}
						style={{
							padding: '8px 12px',
							borderRadius: 6,
							border: '1px solid #333',
							backgroundColor: 'var(--background)',
							color: 'var(--foreground)',
							fontSize: 14,
							marginBottom: 16,
							cursor: 'pointer',
						}}
					>
						{EASING_OPTIONS.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</select>
					<Slider
						min={1}
						max={200}
						value={[config.durationInFrames]}
						onValueChange={(val) => {
							onDurationInFramesChange(val[0]);
						}}
						onPointerUp={onRelease}
					/>
					<SliderLabel
						label="durationInFrames"
						toggleable={null}
						value={config.durationInFrames}
					/>
					<br />
					<Slider
						min={0}
						max={400}
						value={[config.delay]}
						onValueChange={(val) => {
							onDelayChange(val[0]);
						}}
						onPointerUp={onRelease}
					/>
					<SliderLabel label="delay" toggleable={null} value={config.delay} />
				</>
			) : (
				<>
					<Slider
						min={1}
						max={200}
						value={[config.durationInFrames]}
						onValueChange={(val) => {
							onDurationInFramesChange(val[0]);
						}}
						onPointerUp={onRelease}
					/>
					<SliderLabel
						label="durationInFrames"
						toggleable={null}
						value={config.durationInFrames}
					/>
					<br />
					<Slider
						min={0.1}
						max={2}
						step={0.1}
						value={[config.amplitude]}
						onValueChange={(val) => {
							onAmplitudeChange(val[0]);
						}}
						onPointerUp={onRelease}
					/>
					<SliderLabel
						label="amplitude"
						toggleable={null}
						value={config.amplitude}
					/>
					<br />
					<Slider
						min={0.1}
						max={10}
						step={0.1}
						value={[config.frequency]}
						onValueChange={(val) => {
							onFrequencyChange(val[0]);
						}}
						onPointerUp={onRelease}
					/>
					<SliderLabel
						label="frequency"
						toggleable={null}
						value={config.frequency}
					/>
					<br />
					<Slider
						min={0}
						max={100}
						value={[config.frameOffset]}
						onValueChange={(val) => {
							onFrameOffsetChange(val[0]);
						}}
						onPointerUp={onRelease}
					/>
					<SliderLabel
						label="frameOffset"
						toggleable={null}
						value={config.frameOffset}
					/>
				</>
			)}
			<Spacing y={2} />
		</div>
	);
};
