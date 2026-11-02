import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Internals} from 'remotion';
import {FOCUS_VISIBLE_ONLY_CLASS_NAME} from '../../helpers/hoverable';
import {ContextMenu} from '../ContextMenu';

export type CurvePoints = readonly (readonly [number, number])[];

const pointBounds = (points: CurvePoints, index: number) => ({
	min:
		index === 0 ? 0 : Math.min(points[index][0], points[index - 1][0] + 0.001),
	max:
		index === points.length - 1
			? 1
			: Math.max(points[index][0], points[index + 1][0] - 0.001),
});

const movePoint = (
	points: CurvePoints,
	index: number,
	input: number,
	output: number,
): CurvePoints => {
	const {min, max} = pointBounds(points, index);
	return points.map((point, i) =>
		i === index
			? [
					input === point[0]
						? point[0]
						: Math.min(max, Math.max(min, Math.round(input * 1000) / 1000)),
					output === point[1]
						? point[1]
						: Math.min(1, Math.max(0, Math.round(output * 1000) / 1000)),
				]
			: point,
	);
};

export const CurvesControl: React.FC<{
	readonly points: CurvePoints;
	readonly channel: 'rgb' | 'red' | 'green' | 'blue';
	readonly interpolation: 'smooth' | 'linear';
	readonly editable: boolean;
	readonly histogram: React.ReactNode;
	readonly onChange: (points: CurvePoints, commit: boolean) => void;
	readonly onCancel: () => void;
}> = ({
	points,
	channel,
	interpolation,
	editable,
	histogram,
	onChange,
	onCancel,
}) => {
	const graph = useRef<HTMLDivElement>(null);
	const onCancelRef = useRef(onCancel);
	onCancelRef.current = onCancel;
	const [selection, setSelection] = useState(0);
	const selected = Math.min(selection, points.length - 1);
	const drag = useRef<{
		pointerId: number;
		index: number;
		initial: CurvePoints;
		points: CurvePoints;
		rect: DOMRect;
		offsetX: number;
		offsetY: number;
	} | null>(null);
	const cancel = useCallback(() => {
		const {current} = drag;
		drag.current = null;
		if (current && graph.current?.hasPointerCapture(current.pointerId)) {
			graph.current.releasePointerCapture(current.pointerId);
		}

		onCancelRef.current();
	}, []);

	useEffect(() => {
		if (!editable && drag.current) cancel();
	}, [cancel, editable]);

	useEffect(() => {
		const onBlur = () => {
			if (drag.current) cancel();
		};

		const onVisibilityChange = () => {
			if (document.visibilityState === 'hidden') onBlur();
		};

		window.addEventListener('blur', onBlur);
		document.addEventListener('visibilitychange', onVisibilityChange);
		return () => {
			window.removeEventListener('blur', onBlur);
			document.removeEventListener('visibilitychange', onVisibilityChange);
		};
	}, [cancel]);
	const sample = useMemo(
		() => Internals.createCurveSampler(points, interpolation),
		[points, interpolation],
	);
	const curvePath = Array.from({length: 257}, (_, i) => {
		const x = i / 256;
		return `${i === 0 ? 'M' : 'L'}${x * 256} ${(1 - sample(x)) * 256}`;
	}).join(' ');
	const color =
		channel === 'red'
			? '#ed7777'
			: channel === 'green'
				? '#80d995'
				: channel === 'blue'
					? '#87acff'
					: '#e5e5e8';
	const removePoint = (index: number) => {
		if (!editable || points.length <= 2) return;
		setSelection(Math.max(0, index - 1));
		onChange(
			points.filter((_, i) => i !== index),
			true,
		);
	};

	const beginDrag = (event: React.PointerEvent, index: number | null) => {
		if (!editable || event.button !== 0 || !graph.current || drag.current)
			return;
		event.preventDefault();
		event.stopPropagation();
		(event.currentTarget as HTMLElement).focus({preventScroll: true});
		if (event.altKey && index !== null) {
			removePoint(index);
			return;
		}

		const rect = graph.current.getBoundingClientRect();
		if (rect.width === 0 || rect.height === 0) return;
		let nextPoints = points;
		let pointIndex = index;
		if (pointIndex === null) {
			if (points.length >= 32) return;
			const x = Math.min(
				1,
				Math.max(
					0,
					Math.round(((event.clientX - rect.left) / rect.width) * 1000) / 1000,
				),
			);
			const y = Math.min(
				1,
				Math.max(
					0,
					Math.round((1 - (event.clientY - rect.top) / rect.height) * 1000) /
						1000,
				),
			);
			if (points.some((point) => Math.abs(point[0] - x) < 0.001)) return;
			pointIndex = points.findIndex((point) => point[0] > x);
			if (pointIndex === -1) pointIndex = points.length;
			nextPoints = [
				...points.slice(0, pointIndex),
				[x, y],
				...points.slice(pointIndex),
			];
			onChange(nextPoints, false);
		}

		setSelection(pointIndex);
		graph.current.setPointerCapture(event.pointerId);
		drag.current = {
			pointerId: event.pointerId,
			index: pointIndex,
			initial: points,
			points: nextPoints,
			rect,
			offsetX:
				event.clientX - rect.left - nextPoints[pointIndex][0] * rect.width,
			offsetY:
				event.clientY -
				rect.top -
				(1 - nextPoints[pointIndex][1]) * rect.height,
		};
	};

	return (
		<div style={{padding: '6px 16px 8px', opacity: editable ? 1 : 0.55}}>
			<div
				ref={graph}
				tabIndex={-1}
				role="group"
				aria-label="Curves graph"
				style={{
					position: 'relative',
					aspectRatio: '1',
					touchAction: 'none',
					cursor: 'default',
				}}
				onPointerDown={(event) => beginDrag(event, null)}
				onPointerMove={(event) => {
					const {current} = drag;
					if (!current || current.pointerId !== event.pointerId) return;
					current.points = movePoint(
						current.points,
						current.index,
						(event.clientX - current.rect.left - current.offsetX) /
							current.rect.width,
						1 -
							(event.clientY - current.rect.top - current.offsetY) /
								current.rect.height,
					);
					onChange(current.points, false);
				}}
				onPointerUp={(event) => {
					const {current} = drag;
					if (!current || current.pointerId !== event.pointerId) return;
					drag.current = null;
					event.currentTarget.releasePointerCapture(event.pointerId);
					if (
						JSON.stringify(current.points) === JSON.stringify(current.initial)
					) {
						onCancel();
					} else {
						onChange(current.points, true);
					}
				}}
				onPointerCancel={(event) => {
					if (drag.current?.pointerId === event.pointerId) cancel();
				}}
				onLostPointerCapture={(event) => {
					if (drag.current?.pointerId === event.pointerId) cancel();
				}}
				onKeyDown={(event) => {
					if (event.key === 'Escape' && drag.current) {
						event.preventDefault();
						event.stopPropagation();
						cancel();
					}
				}}
			>
				<div
					style={{
						position: 'absolute',
						inset: 0,
						opacity: 0.32,
						pointerEvents: 'none',
					}}
				>
					{histogram}
				</div>
				<svg
					viewBox="0 0 256 256"
					preserveAspectRatio="none"
					aria-hidden
					style={{
						position: 'absolute',
						inset: 0,
						width: '100%',
						height: '100%',
						border: '1px solid #45454b',
						pointerEvents: 'none',
					}}
				>
					<path
						d="M64 0V256M128 0V256M192 0V256M0 64H256M0 128H256M0 192H256"
						stroke="#38383e"
						strokeWidth={0.7}
					/>
					<path
						d="M0 256L256 0"
						stroke="#64646d"
						strokeDasharray="3 4"
						strokeWidth={0.8}
					/>
					<path
						d={curvePath}
						fill="none"
						stroke={color}
						strokeWidth={1.7}
						vectorEffect="non-scaling-stroke"
					/>
				</svg>
				{points.map((point, index) => (
					<ContextMenu
						// Preserve focus while a point moves; insertion selects the new point.
						// eslint-disable-next-line react/no-array-index-key
						key={index}
						style={{
							position: 'absolute',
							left: `${point[0] * 100}%`,
							top: `${(1 - point[1]) * 100}%`,
							transform: 'translate(-50%, -50%)',
							width: 18,
							height: 18,
						}}
						getItems={() => {
							setSelection(index);
							return [
								{
									type: 'item',
									id: 'remove-curve-point',
									label: 'Remove point',
									keyHint: '⌫',
									leftItem: null,
									disabled: !editable || points.length <= 2,
									onClick: () => removePoint(index),
									quickSwitcherLabel: null,
									subMenu: null,
									value: 'remove-curve-point',
								},
							];
						}}
					>
						<button
							type="button"
							disabled={!editable}
							aria-label={`Curve point ${index + 1}, input ${point[0]}, output ${point[1]}`}
							aria-pressed={selected === index}
							className={FOCUS_VISIBLE_ONLY_CLASS_NAME}
							style={{
								display: 'block',
								width: 18,
								height: 18,
								padding: 5,
								border: 'none',
								cursor: 'default',
								touchAction: 'none',
							}}
							onPointerDown={(event) => beginDrag(event, index)}
							onFocus={() => setSelection(index)}
							onClick={() => setSelection(index)}
							onKeyDown={(event) => {
								if (event.key === 'Delete' || event.key === 'Backspace') {
									event.preventDefault();
									event.stopPropagation();
									removePoint(index);
									return;
								}

								if (
									!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(
										event.key,
									)
								)
									return;
								event.preventDefault();
								event.stopPropagation();
								const delta = event.shiftKey ? 0.1 : 0.01;
								onChange(
									movePoint(
										points,
										index,
										point[0] +
											(event.key === 'ArrowRight'
												? delta
												: event.key === 'ArrowLeft'
													? -delta
													: 0),
										point[1] +
											(event.key === 'ArrowUp'
												? delta
												: event.key === 'ArrowDown'
													? -delta
													: 0),
									),
									true,
								);
							}}
						>
							<span
								style={{
									display: 'block',
									width: 8,
									height: 8,
									backgroundColor: selected === index ? color : '#202024',
									border: `1px solid ${color}`,
									boxShadow: '0 0 0 1px #151519',
								}}
							/>
						</button>
					</ContextMenu>
				))}
			</div>
			<div
				style={{
					height: 5,
					marginTop: 10,
					background: `linear-gradient(to right, #000, ${color})`,
				}}
			/>
		</div>
	);
};
