import React from 'react';
import {Slider} from '~/components/ui/slider';
import {EASING_OPTIONS} from './defaults';
import {SliderLabel} from './SliderLabel';
import type {EasingType, InterpolateTimingConfig} from './types';

export const InterpolateEditor: React.FC<{
	readonly config: InterpolateTimingConfig;
	readonly onDragChange: (config: InterpolateTimingConfig) => void;
	readonly onChange: (config: InterpolateTimingConfig) => void;
	readonly onRelease: () => void;
}> = ({config, onDragChange, onRelease, onChange}) => {
	return (
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
				onChange={(e) => {
					onChange({...config, easing: e.target.value as EasingType});
					onRelease();
				}}
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
				min={0.02}
				max={3.33}
				step={0.01}
				value={[config.durationInFrames / 60]}
				onValueChange={(val) => {
					onDragChange({...config, durationInFrames: Math.round(val[0] * 60)});
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
		</>
	);
};
