import React from 'react';
import {Slider} from '~/components/ui/slider';
import {Tabs, TabsList, TabsTrigger} from '~/components/ui/tabs';
import {CheckboxWithLabel} from './CheckboxWithLabel';
import {EASING_OPTIONS} from './defaults';
import {PADDING_LEFT} from './draw-trajectory';
import {SliderLabel} from './SliderLabel';
import {Spacing} from './Spacing';
import type {EasingType, TimingConfig} from './types';

export const Sidebar: React.FC<{
	readonly config: TimingConfig;
	readonly calculatedDurationInFrames: number;
	readonly onModeChange: (mode: 'spring' | 'interpolate') => void;
	readonly onMassChange: (e: [number]) => void;
	readonly onDampingChange: (e: [number]) => void;
	readonly onStiffnessChange: (e: [number]) => void;
	readonly onDurationInFramesChange: (e: number | null) => void;
	readonly onDelayChange: (e: number) => void;
	readonly onRelease: () => void;
	readonly onOvershootClampingChange: (checked: boolean) => void;
	readonly onReverseChange: (checked: boolean) => void;
	readonly onEasingChange: (easing: EasingType) => void;
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
}) => {
	return (
		<div
			id="spring-sidebar"
			style={{
				padding: PADDING_LEFT,
				display: 'flex',
				flexDirection: 'column',
				borderRight: '1px solid #242424',
			}}
		>
			<Spacing y={3} />
			<Tabs
				value={config.type}
				onValueChange={(value) =>
					onModeChange(value as 'spring' | 'interpolate')
				}
			>
				<TabsList style={{width: '100%'}}>
					<TabsTrigger value="spring" style={{flex: 1}}>
						Spring
					</TabsTrigger>
					<TabsTrigger value="interpolate" style={{flex: 1}}>
						Interpolate
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
					<br />
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
					<br />
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
					<br />
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
					<br />
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
			) : (
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
			)}
			<Spacing y={2} />
		</div>
	);
};
