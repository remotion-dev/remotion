import type {
	CurvesChannel,
	CurvesInterpolation,
	CurvesPoint,
} from '@remotion/effects/curves';
import React, {useMemo, useRef, useState} from 'react';
import {Internals} from 'remotion';

export const CurvesPointsControl: React.FC<{
	readonly points: readonly CurvesPoint[];
	readonly interpolation: CurvesInterpolation;
	readonly channel: CurvesChannel;
	readonly setValue: (points: readonly CurvesPoint[]) => void;
}> = ({points, interpolation, channel, setValue}) => {
	const [selected, setSelected] = useState(0);
	const dragging = useRef<number | null>(null);
	const selectedIndex = Math.min(selected, points.length - 1);
	const point = points[selectedIndex];
	const minimumInput =
		selectedIndex === 0
			? 0
			: Math.min(point[0], points[selectedIndex - 1][0] + 0.001);
	const maximumInput =
		selectedIndex === points.length - 1
			? 1
			: Math.max(point[0], points[selectedIndex + 1][0] - 0.001);
	const path = useMemo(() => {
		const sample = Internals.createCurveSampler(points, interpolation);
		return Array.from({length: 201}, (_, index) => {
			return `${index === 0 ? 'M' : 'L'}${index},${200 * (1 - sample(index / 200))}`;
		}).join(' ');
	}, [points, interpolation]);
	const color =
		channel === 'rgb'
			? 'currentColor'
			: {red: '#f45b69', green: '#39b871', blue: '#5299ef'}[channel];

	return (
		<div style={{padding: 16, width: '100%'}}>
			<div style={{fontSize: 13, marginBottom: 12}}>
				Click to add a point. Drag to adjust.
			</div>
			<svg
				viewBox="0 0 200 200"
				aria-label="Curves input and output graph"
				style={{
					display: 'block',
					width: 200,
					height: 200,
					maxWidth: '100%',
					overflow: 'visible',
					touchAction: 'none',
					border: '1px solid var(--ifm-color-emphasis-300)',
				}}
				onPointerDown={(event) => {
					if (event.button !== 0) return;
					const rect = event.currentTarget.getBoundingClientRect();
					const input = Math.max(
						0,
						Math.min(1, (event.clientX - rect.left) / rect.width),
					);
					const output = Math.max(
						0,
						Math.min(1, 1 - (event.clientY - rect.top) / rect.height),
					);
					let index = points.findIndex(
						(entry) => Math.hypot(entry[0] - input, entry[1] - output) < 0.05,
					);
					if (index === -1) {
						if (
							points.length >= 32 ||
							points.some((entry) => Math.abs(entry[0] - input) < 0.001)
						) {
							return;
						}

						const next: CurvesPoint[] = [...points, [input, output]];
						next.sort((first, second) => first[0] - second[0]);
						index = next.findIndex((entry) => entry[0] === input);
						setValue(next);
					}

					setSelected(index);
					dragging.current = index;
					event.currentTarget.setPointerCapture(event.pointerId);
				}}
				onPointerMove={(event) => {
					const index = dragging.current;
					if (index === null) return;
					const rect = event.currentTarget.getBoundingClientRect();
					const min =
						index === 0
							? 0
							: Math.min(points[index][0], points[index - 1][0] + 0.001);
					const max =
						index === points.length - 1
							? 1
							: Math.max(points[index][0], points[index + 1][0] - 0.001);
					const input = Math.max(
						min,
						Math.min(max, (event.clientX - rect.left) / rect.width),
					);
					const output = Math.max(
						0,
						Math.min(1, 1 - (event.clientY - rect.top) / rect.height),
					);
					setValue(
						points.map((entry, entryIndex) =>
							entryIndex === index ? [input, output] : entry,
						),
					);
				}}
				onPointerUp={() => {
					dragging.current = null;
				}}
				onPointerCancel={() => {
					dragging.current = null;
				}}
			>
				{[50, 100, 150].map((position) => (
					<path
						key={position}
						d={`M${position},0V200M0,${position}H200`}
						stroke="currentColor"
						opacity={0.15}
					/>
				))}
				<path d="M0,200L200,0" stroke="currentColor" opacity={0.25} />
				<path d={path} fill="none" stroke={color} strokeWidth={2} />
				{points.map((entry, index) => (
					<circle
						key={entry[0]}
						cx={entry[0] * 200}
						cy={(1 - entry[1]) * 200}
						r={index === selectedIndex ? 5 : 4}
						fill={
							index === selectedIndex
								? color
								: 'var(--ifm-background-surface-color)'
						}
						stroke={color}
						strokeWidth={2}
					/>
				))}
			</svg>
			<div style={{display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap'}}>
				<label>
					Point{' '}
					<select
						value={selectedIndex}
						onChange={(event) => setSelected(Number(event.target.value))}
					>
						{points.map((entry, index) => (
							<option key={entry[0]} value={index}>
								{index + 1}
							</option>
						))}
					</select>
				</label>
				{(['Input', 'Output'] as const).map((label, coordinate) => (
					<label key={label}>
						{label}{' '}
						<input
							type="number"
							min={coordinate === 0 ? minimumInput : 0}
							max={coordinate === 0 ? maximumInput : 1}
							step={0.001}
							value={Number(point[coordinate].toFixed(3))}
							style={{width: 70}}
							onChange={(event) => {
								const value = event.target.valueAsNumber;
								if (!Number.isFinite(value)) return;
								const bounded = Math.max(
									coordinate === 0 ? minimumInput : 0,
									Math.min(coordinate === 0 ? maximumInput : 1, value),
								);
								setValue(
									points.map((entry, index) => {
										if (index !== selectedIndex) return entry;
										return coordinate === 0
											? [bounded, entry[1]]
											: [entry[0], bounded];
									}),
								);
							}}
						/>
					</label>
				))}
			</div>
			<div style={{display: 'flex', gap: 8, marginTop: 8}}>
				<button
					type="button"
					disabled={points.length >= 32}
					onClick={() => {
						let insertAfter = -1;
						let largestGap = 0;
						for (let index = 0; index < points.length - 1; index++) {
							const gap = points[index + 1][0] - points[index][0];
							const midpoint = points[index][0] + gap / 2;
							if (
								gap > largestGap &&
								midpoint > points[index][0] &&
								midpoint < points[index + 1][0]
							) {
								insertAfter = index;
								largestGap = gap;
							}
						}

						if (insertAfter === -1) return;
						const input = points[insertAfter][0] + largestGap / 2;
						const sample = Internals.createCurveSampler(points, interpolation);
						setValue([
							...points.slice(0, insertAfter + 1),
							[input, sample(input)],
							...points.slice(insertAfter + 1),
						]);
						setSelected(insertAfter + 1);
					}}
				>
					Add point
				</button>
				<button
					type="button"
					disabled={points.length <= 2}
					onClick={() => {
						setValue(points.filter((_entry, index) => index !== selectedIndex));
						setSelected(Math.max(0, selectedIndex - 1));
					}}
				>
					Delete point
				</button>
				<button
					type="button"
					onClick={() => {
						setValue([
							[0, 0],
							[1, 1],
						]);
						setSelected(0);
					}}
				>
					Reset curve
				</button>
			</div>
		</div>
	);
};
