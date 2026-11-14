import React, {useEffect, useId, useRef, useState} from 'react';
import type {_InternalTypes} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {startCapturedPointerSession} from '../helpers/pointer-session';
import type {SelectedOutline} from './selected-outline-geometry';
import type {SelectedOutlineLayoutTarget} from './selected-outline-types';

type CustomSequenceLocalAxis = _InternalTypes['CustomSequenceLocalAxis'];
import type {
	TimelineSelection,
	TimelineSelectionInteraction,
} from './Timeline/TimelineSelection';

type AxisKey = 'x' | 'y' | 'z';
type ControlKind = 'move' | 'rotate';
type ControlId = `${ControlKind}-${AxisKey}` | 'scale';
type LocalAxes = {
	readonly originOffset: {readonly x: number; readonly y: number};
	readonly x: CustomSequenceLocalAxis | null;
	readonly y: CustomSequenceLocalAxis | null;
	readonly z: CustomSequenceLocalAxis | null;
};
type ControlGeometry = {
	readonly localAxes: LocalAxes;
	readonly originX: number;
	readonly originY: number;
};
type AxisSides = Record<AxisKey, 1 | -1>;
type DragState = {
	readonly clientX: number;
	readonly clientY: number;
	readonly initial: Readonly<Record<string, unknown>>;
	latest: Readonly<Record<string, unknown>>;
	readonly calculate: (
		dx: number,
		dy: number,
		initial: Readonly<Record<string, unknown>>,
	) => Readonly<Record<string, unknown>>;
};

const ROTATE_HANDLE_DISTANCE = 42;
const ROTATE_HANDLE_RADIUS = 7;
const SCALE_HANDLE_SIZE = 12;
const SCALE_RESPONSE = 0.01;
const MOVE_AXIS_START = 62;
const MOVE_AXIS_LENGTH = 84;
const MOVE_RESPONSE = 0.1;
const AXIS_LINE_LENGTH = 2000;

const axisColors: Record<AxisKey, string> = {
	x: '#ef5350',
	y: '#66bb6a',
	z: '#42a5f5',
};

export const CustomOutlinePositionControls: React.FC<{
	readonly compositionHeight: number;
	readonly compositionWidth: number;
	readonly onDraggingChange: (dragging: boolean) => void;
	readonly onSelect: (
		item: TimelineSelection,
		interaction: TimelineSelectionInteraction,
	) => void;
	readonly outline: SelectedOutline;
	readonly scale: number;
	readonly target: SelectedOutlineLayoutTarget | undefined;
	readonly visible: boolean;
}> = ({
	compositionHeight,
	compositionWidth,
	onDraggingChange,
	onSelect,
	outline,
	scale,
	target,
	visible,
}) => {
	const clipPathId = useId().replaceAll(':', '');
	const [activeControl, setActiveControl] = useState<ControlId | null>(null);
	const [hoveredControl, setHoveredControl] = useState<ControlId | null>(null);
	const [lingerVisible, setLingerVisible] = useState(visible);
	const [hoveringObject, setHoveringObject] = useState(false);
	const [axisSides, setAxisSides] = useState<AxisSides>({x: 1, y: 1, z: 1});
	const dragRef = useRef<DragState | null>(null);
	const dragGeometryRef = useRef<ControlGeometry | null>(null);
	const endPointerSessionRef = useRef<(() => void) | null>(null);
	useEffect(() => {
		if (visible) {
			setLingerVisible(true);
			return;
		}

		const timeout = window.setTimeout(() => setLingerVisible(false), 120);
		return () => window.clearTimeout(timeout);
	}, [visible]);
	useEffect(() => () => endPointerSessionRef.current?.(), []);
	const customOutline = target?.ref.current;
	if (
		target === undefined ||
		customOutline === null ||
		customOutline === undefined ||
		customOutline instanceof Element ||
		customOutline.positionControls === null
	) {
		return null;
	}

	const controls = customOutline.positionControls;
	const xs = outline.points.map((point) => point.x);
	const ys = outline.points.map((point) => point.y);
	const {position, rotation, scale: scaleField} = controls;
	const liveLocalAxes = controls.getLocalAxes();
	const liveOriginX =
		(Math.min(...xs) + Math.max(...xs)) / 2 + liveLocalAxes.originOffset.x;
	const liveOriginY =
		(Math.min(...ys) + Math.max(...ys)) / 2 + liveLocalAxes.originOffset.y;
	const dragGeometry = activeControl === null ? null : dragGeometryRef.current;
	const localAxes = dragGeometry?.localAxes ?? liveLocalAxes;
	const originX = dragGeometry?.originX ?? liveOriginX;
	const originY = dragGeometry?.originY ?? liveOriginY;
	const controlsAreVisible =
		lingerVisible ||
		hoveringObject ||
		activeControl !== null ||
		hoveredControl !== null;

	const begin = (
		event: React.PointerEvent<SVGElement>,
		control: ControlId,
		fields: readonly string[],
		calculate: DragState['calculate'],
	) => {
		event.stopPropagation();
		event.preventDefault();
		endPointerSessionRef.current?.();
		if (!target.selected) {
			onSelect(target.selection, {shiftKey: false, toggleKey: false});
		}

		dragGeometryRef.current = {
			localAxes: liveLocalAxes,
			originX: liveOriginX,
			originY: liveOriginY,
		};
		const currentValues = controls.getValues();
		const initial = Object.fromEntries(
			fields.map((field) => [field, currentValues[field] ?? 0]),
		);
		dragRef.current = {
			clientX: event.clientX,
			clientY: event.clientY,
			initial,
			latest: initial,
			calculate,
		};
		setActiveControl(control);
		onDraggingChange(true);
		endPointerSessionRef.current = startCapturedPointerSession({
			event,
			captureTarget: event.currentTarget,
			onMove: (moveEvent) => {
				const drag = dragRef.current;
				if (drag === null) return;
				drag.latest = drag.calculate(
					moveEvent.clientX - drag.clientX,
					moveEvent.clientY - drag.clientY,
					drag.initial,
				);
				controls.requestValueChange({phase: 'preview', values: drag.latest});
			},
			onEnd: () => {
				const drag = dragRef.current;
				if (drag !== null) {
					controls.requestValueChange({phase: 'commit', values: drag.latest});
				}

				dragRef.current = null;
				dragGeometryRef.current = null;
				endPointerSessionRef.current = null;
				setActiveControl(null);
				onDraggingChange(false);
			},
		});
	};

	const rotate =
		(field: string) =>
		(dx: number, dy: number, initial: Readonly<Record<string, unknown>>) => ({
			[field]: Number(
				(
					(typeof initial[field] === 'number' ? initial[field] : 0) +
					(Math.abs(dx) >= Math.abs(dy) ? dx : -dy) * 0.25
				).toFixed(3),
			),
		});
	const scaleUniform = (field: string): DragState['calculate'] => {
		let dominantAxis: 'x' | 'y' | null = null;
		return (dx, dy, initial) => {
			if (dominantAxis === null && Math.hypot(dx, dy) >= 2) {
				dominantAxis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
			}

			const delta = dominantAxis === 'y' ? -dy : dx;
			const [scaleX, scaleY, scaleZ] = NoReactInternals.parseScaleValue(
				initial[field],
				3,
			);
			const factor = Math.max(0.01, 1 + delta * SCALE_RESPONSE);
			return {
				[field]: NoReactInternals.serializeScaleValue(
					[
						Number(Math.max(0.01, scaleX * factor).toFixed(4)),
						Number(Math.max(0.01, scaleY * factor).toFixed(4)),
						Number(Math.max(0.01, scaleZ * factor).toFixed(4)),
					],
					3,
				),
			};
		};
	};

	const positionFields = [position.x, position.y, position.z] as const;
	const moveAlongLocalAxis =
		(axis: CustomSequenceLocalAxis): DragState['calculate'] =>
		(dx, dy, initial) => {
			const pointerDistance =
				dx * axis.screenDirection.x + dy * axis.screenDirection.y;
			return Object.fromEntries(
				positionFields.map((field, index) => [
					field,
					Number(
						(
							(typeof initial[field] === 'number' ? initial[field] : 0) +
							pointerDistance *
								MOVE_RESPONSE *
								axis.positionDeltaPerPixel[index]
						).toFixed(4),
					),
				]),
			);
		};

	const axes = (['x', 'y', 'z'] as const).map((key) => ({
		axis:
			localAxes[key] === null
				? null
				: {
						screenDirection: {
							x: localAxes[key].screenDirection.x * axisSides[key],
							y: localAxes[key].screenDirection.y * axisSides[key],
						},
						positionDeltaPerPixel: localAxes[key].positionDeltaPerPixel.map(
							(value) => value * axisSides[key],
						) as [number, number, number],
					},
		color: axisColors[key],
		key,
		rotationField: rotation[key],
		side: axisSides[key],
	}));
	const indicatedControl = activeControl ?? hoveredControl;
	const indicatedAxis =
		indicatedControl === null || indicatedControl === 'scale'
			? null
			: (indicatedControl.split('-')[1] as AxisKey);
	const indicatedAxisGeometry =
		indicatedAxis === null ? null : localAxes[indicatedAxis];
	const indicatedColor =
		indicatedAxis === null ? null : axisColors[indicatedAxis];

	return (
		<>
			<defs>
				<clipPath id={clipPathId}>
					<rect
						x={0}
						y={0}
						width={compositionWidth * scale}
						height={compositionHeight * scale}
					/>
				</clipPath>
			</defs>
			<g
				opacity={controlsAreVisible ? 1 : 0}
				style={{pointerEvents: controlsAreVisible ? 'auto' : 'none'}}
			>
				<polygon
					points={outline.points
						.map((point) => `${point.x},${point.y}`)
						.join(' ')}
					fill="#ffffff"
					fillOpacity={0.001}
					style={{pointerEvents: activeControl === null ? 'all' : 'none'}}
					onPointerEnter={() => setHoveringObject(true)}
					onPointerLeave={() => setHoveringObject(false)}
					onPointerMove={(event) => {
						if (activeControl !== null) return;
						const ownerSvg = event.currentTarget.ownerSVGElement;
						if (ownerSvg === null) return;
						const point = ownerSvg.createSVGPoint();
						point.x = event.clientX;
						point.y = event.clientY;
						const screenCtm = ownerSvg.getScreenCTM();
						if (screenCtm === null) return;
						const localPoint = point.matrixTransform(screenCtm.inverse());
						setAxisSides((current) => {
							const next = {...current};
							for (const key of ['x', 'y', 'z'] as const) {
								const axis = liveLocalAxes[key];
								if (axis === null) continue;
								const projection =
									(localPoint.x - liveOriginX) * axis.screenDirection.x +
									(localPoint.y - liveOriginY) * axis.screenDirection.y;
								if (Math.abs(projection) >= 4) {
									next[key] = projection >= 0 ? 1 : -1;
								}
							}

							return next.x === current.x &&
								next.y === current.y &&
								next.z === current.z
								? current
								: next;
						});
					}}
					onPointerDown={(event) => {
						event.preventDefault();
						event.stopPropagation();
						if (!target.selected) {
							onSelect(target.selection, {shiftKey: false, toggleKey: false});
						}
					}}
				/>
				<rect
					x={originX - 16}
					y={originY - 16}
					width={32}
					height={32}
					rx={7}
					fill="#ffffff"
					fillOpacity={0.001}
					style={{
						cursor: activeControl === 'scale' ? 'grabbing' : 'nwse-resize',
						pointerEvents: 'all',
					}}
					onPointerEnter={() => setHoveredControl('scale')}
					onPointerLeave={() => {
						if (activeControl === null) setHoveredControl(null);
					}}
					onPointerDown={(event) =>
						begin(event, 'scale', [scaleField], scaleUniform(scaleField))
					}
				/>
				<rect
					x={originX - SCALE_HANDLE_SIZE / 2}
					y={originY - SCALE_HANDLE_SIZE / 2}
					width={SCALE_HANDLE_SIZE}
					height={SCALE_HANDLE_SIZE}
					rx={3}
					fill="#ffffff"
					fillOpacity={
						activeControl === 'scale'
							? 1
							: activeControl !== null
								? 0.12
								: hoveredControl === 'scale'
									? 0.72
									: 0.38
					}
					style={{pointerEvents: 'none'}}
				/>
				{indicatedAxisGeometry === null || indicatedColor === null ? null : (
					<line
						x1={
							originX -
							indicatedAxisGeometry.screenDirection.x * AXIS_LINE_LENGTH
						}
						y1={
							originY -
							indicatedAxisGeometry.screenDirection.y * AXIS_LINE_LENGTH
						}
						x2={
							originX +
							indicatedAxisGeometry.screenDirection.x * AXIS_LINE_LENGTH
						}
						y2={
							originY +
							indicatedAxisGeometry.screenDirection.y * AXIS_LINE_LENGTH
						}
						stroke={indicatedColor}
						strokeWidth={2}
						strokeOpacity={0.38}
						clipPath={`url(#${clipPathId})`}
						style={{pointerEvents: 'none'}}
					/>
				)}
				<g strokeLinecap="round">
					{axes.map(({axis, color, key, rotationField, side}) => {
						if (axis === null) return null;
						const moveControlId: ControlId = `move-${key}`;
						const rotateControlId: ControlId = `rotate-${key}`;
						const startX = originX + axis.screenDirection.x * MOVE_AXIS_START;
						const startY = originY + axis.screenDirection.y * MOVE_AXIS_START;
						const endX = originX + axis.screenDirection.x * MOVE_AXIS_LENGTH;
						const endY = originY + axis.screenDirection.y * MOVE_AXIS_LENGTH;
						const rotateX =
							originX + axis.screenDirection.x * ROTATE_HANDLE_DISTANCE;
						const rotateY =
							originY + axis.screenDirection.y * ROTATE_HANDLE_DISTANCE;
						const perpendicularX = -axis.screenDirection.y;
						const perpendicularY = axis.screenDirection.x;
						const baseX = endX - axis.screenDirection.x * 12;
						const baseY = endY - axis.screenDirection.y * 12;
						const moveOpacity =
							activeControl === moveControlId
								? 1
								: activeControl !== null
									? 0.12
									: hoveredControl === moveControlId
										? 0.58
										: 0.28;
						const rotateOpacity =
							activeControl === rotateControlId
								? 1
								: activeControl !== null
									? 0.12
									: hoveredControl === rotateControlId
										? 0.58
										: 0.28;
						return (
							<g key={key}>
								<circle
									cx={rotateX}
									cy={rotateY}
									r={14}
									fill={color}
									fillOpacity={0.001}
									style={{
										cursor:
											activeControl === rotateControlId ? 'grabbing' : 'grab',
										pointerEvents: 'all',
									}}
									onPointerEnter={() => setHoveredControl(rotateControlId)}
									onPointerLeave={() => {
										if (activeControl === null) setHoveredControl(null);
									}}
									onPointerDown={(event) =>
										begin(
											event,
											rotateControlId,
											[rotationField],
											(dx, dy, initial) => {
												const values = rotate(rotationField)(dx, dy, initial);
												const nextValue =
													typeof values[rotationField] === 'number'
														? values[rotationField]
														: 0;
												const initialValue =
													typeof initial[rotationField] === 'number'
														? initial[rotationField]
														: 0;
												return {
													[rotationField]:
														nextValue * side + initialValue * (1 - side),
												};
											},
										)
									}
								/>
								<circle
									cx={rotateX}
									cy={rotateY}
									r={ROTATE_HANDLE_RADIUS}
									fill={color}
									fillOpacity={rotateOpacity}
									style={{pointerEvents: 'none'}}
								/>
								<line
									x1={startX}
									y1={startY}
									x2={endX}
									y2={endY}
									stroke="transparent"
									strokeWidth={18}
									style={{
										cursor:
											activeControl === moveControlId ? 'grabbing' : 'grab',
										pointerEvents: 'stroke',
									}}
									onPointerEnter={() => setHoveredControl(moveControlId)}
									onPointerLeave={() => {
										if (activeControl === null) setHoveredControl(null);
									}}
									onPointerDown={(event) =>
										begin(
											event,
											moveControlId,
											positionFields,
											moveAlongLocalAxis(axis),
										)
									}
								/>
								<line
									x1={startX}
									y1={startY}
									x2={endX}
									y2={endY}
									stroke={color}
									strokeOpacity={moveOpacity}
									strokeWidth={3}
									style={{pointerEvents: 'none'}}
								/>
								<polygon
									points={`${endX},${endY} ${baseX + perpendicularX * 6},${baseY + perpendicularY * 6} ${baseX - perpendicularX * 6},${baseY - perpendicularY * 6}`}
									fill={color}
									fillOpacity={moveOpacity}
									style={{pointerEvents: 'none'}}
								/>
							</g>
						);
					})}
				</g>
			</g>
		</>
	);
};
