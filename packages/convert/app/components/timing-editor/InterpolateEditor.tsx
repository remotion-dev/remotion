import React from 'react';
import {Slider} from '~/components/ui/slider';
import {SliderLabel} from './SliderLabel';
import type {EasingType, InterpolateTimingConfig} from './types';

type Direction = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
type Curve = 'quad' | 'cubic' | 'sin' | 'exp' | 'circle' | 'bounce';

const LinearIcon: React.FC = () => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none">
		<path
			d="M4 20 L20 4"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
		/>
	</svg>
);

const EaseInIcon: React.FC = () => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none">
		<path
			d="M4 20 Q20 20 20 4"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			fill="none"
		/>
	</svg>
);

const EaseOutIcon: React.FC = () => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none">
		<path
			d="M4 20 Q4 4 20 4"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			fill="none"
		/>
	</svg>
);

const EaseInOutIcon: React.FC = () => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none">
		<path
			d="M4 20 C14 20 10 4 20 4"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			fill="none"
		/>
	</svg>
);

const DIRECTION_ICONS: Record<Direction, React.FC> = {
	linear: LinearIcon,
	'ease-in': EaseInIcon,
	'ease-out': EaseOutIcon,
	'ease-in-out': EaseInOutIcon,
};

const DIRECTIONS: {value: Direction; label: string}[] = [
	{value: 'linear', label: 'Linear'},
	{value: 'ease-in', label: 'In'},
	{value: 'ease-out', label: 'Out'},
	{value: 'ease-in-out', label: 'In-Out'},
];

// Curve icons show ease-in style (concave, belly facing bottom-right)
const QuadIcon: React.FC = () => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none">
		<path
			d="M4 20 Q14 20 20 4"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			fill="none"
		/>
	</svg>
);

const CubicIcon: React.FC = () => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none">
		<path
			d="M4 20 Q20 20 20 4"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			fill="none"
		/>
	</svg>
);

const SinIcon: React.FC = () => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none">
		<path
			d="M4 20 C16 20 20 16 20 4"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			fill="none"
		/>
	</svg>
);

const ExpIcon: React.FC = () => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none">
		<path
			d="M4 20 L12 20 Q20 20 20 4"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			fill="none"
		/>
	</svg>
);

const CircleIcon: React.FC = () => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none">
		<path
			d="M4 20 A16 16 0 0 0 20 4"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			fill="none"
		/>
	</svg>
);

const BounceIcon: React.FC = () => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none">
		<path
			d="M4 20 Q4 4 7 4 Q9 4 9 10 Q9 4 12 4 Q14 4 14 8 Q14 4 17 4 L20 4"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			fill="none"
		/>
	</svg>
);

const CURVE_ICONS: Record<Curve, React.FC> = {
	quad: QuadIcon,
	cubic: CubicIcon,
	sin: SinIcon,
	exp: ExpIcon,
	circle: CircleIcon,
	bounce: BounceIcon,
};

const CURVES: {value: Curve; label: string}[] = [
	{value: 'quad', label: 'Quad'},
	{value: 'cubic', label: 'Cubic'},
	{value: 'sin', label: 'Sin'},
	{value: 'exp', label: 'Exp'},
	{value: 'circle', label: 'Circle'},
	{value: 'bounce', label: 'Bounce'},
];

const parseEasing = (
	easing: EasingType,
): {direction: Direction; curve: Curve} => {
	if (easing === 'linear' || easing === 'ease') {
		return {direction: 'linear', curve: 'cubic'};
	}

	const parts = easing.split('-');
	// e.g., "ease-in-cubic" -> ["ease", "in", "cubic"]
	// e.g., "ease-in-out-cubic" -> ["ease", "in", "out", "cubic"]
	const curve = parts[parts.length - 1] as Curve;
	const direction = parts.slice(0, -1).join('-') as Direction;

	return {direction, curve};
};

const combineEasing = (direction: Direction, curve: Curve): EasingType => {
	if (direction === 'linear') {
		return 'linear';
	}

	return `${direction}-${curve}` as EasingType;
};

export const InterpolateEditor: React.FC<{
	readonly config: InterpolateTimingConfig;
	readonly onDragChange: (config: InterpolateTimingConfig) => void;
	readonly onChange: (config: InterpolateTimingConfig) => void;
	readonly onRelease: () => void;
}> = ({config, onDragChange, onRelease, onChange}) => {
	const {direction, curve} = parseEasing(config.easing);

	const handleDirectionChange = (newDirection: Direction) => {
		const newEasing = combineEasing(newDirection, curve);
		onChange({...config, easing: newEasing});
		onRelease();
	};

	const handleCurveChange = (newCurve: Curve) => {
		const newEasing = combineEasing(direction, newCurve);
		onChange({...config, easing: newEasing});
		onRelease();
	};

	return (
		<>
			<label className="text-xs text-muted-foreground mb-1">Convexity</label>
			<div className="flex flex-row gap-1 mb-4">
				{DIRECTIONS.map((d) => {
					const Icon = DIRECTION_ICONS[d.value];
					return (
						<div key={d.value} className="flex-1">
							<button
								type="button"
								className={`w-full font-brand text-xs h-15 flex flex-col items-center justify-center gap-0.5 rounded-md border border-transparent cursor-pointer ${
									direction === d.value
										? ''
										: 'text-gray-300 hover:text-gray-500'
								}`}
								onClick={() => handleDirectionChange(d.value)}
							>
								<Icon />
								{d.label}
							</button>
						</div>
					);
				})}
			</div>
			{direction !== 'linear' && (
				<>
					<label className="text-xs text-muted-foreground mb-1">Curve</label>
					<div className="flex flex-row gap-1 mb-4">
						{CURVES.map((c) => {
							const Icon = CURVE_ICONS[c.value];
							return (
								<div key={c.value} className="flex-1">
									<button
										type="button"
										className={`w-full font-brand text-xs h-15 flex flex-col items-center justify-center gap-0.5 rounded-md border border-transparent cursor-pointer ${
											curve === c.value
												? ''
												: 'text-gray-300 hover:text-gray-500'
										}`}
										onClick={() => handleCurveChange(c.value)}
									>
										<Icon />
										{c.label}
									</button>
								</div>
							);
						})}
					</div>
				</>
			)}
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
