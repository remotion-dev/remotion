import {
	normalizePath,
	parsePath,
	serializeInstructions,
	type AbsoluteInstruction,
} from '@remotion/paths';
import React, {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {BLUE, WHITE} from '../helpers/colors';
import {
	isPointerSessionRelease,
	startCapturedPointerSession,
} from '../helpers/pointer-session';
import {showNotification} from './Notifications/NotificationCenter';
import type {SelectedOutline} from './selected-outline-geometry';
import type {SelectedOutlinePathDragTarget} from './selected-outline-types';
import {saveSequenceProps} from './Timeline/save-sequence-prop';

type PathPointRole = 'end' | 'cp1' | 'cp2' | 'cp' | 'reflected-cp';

export const SelectedOutlinePathPoints: React.FC<{
	readonly outline: SelectedOutline;
	readonly pathDrag: SelectedOutlinePathDragTarget;
	readonly onDraggingChange: (dragging: boolean) => void;
}> = ({outline, pathDrag, onDraggingChange}) => {
	const {setDragOverrides, clearDragOverrides, setPropStatuses} = useContext(
		Internals.VisualModeSettersContext,
	);
	const {points, connections} = useMemo(() => {
		if (outline.path === null) {
			return {points: [], connections: []};
		}

		try {
			const instructions = parsePath(normalizePath(outline.path.d));
			const pathPoints: {
				x: number;
				y: number;
				key: string;
				instructionIndex: number;
				role: PathPointRole;
			}[] = [];
			const pathConnections: {
				x1: number;
				y1: number;
				x2: number;
				y2: number;
				key: string;
			}[] = [];
			let x = 0;
			let y = 0;
			let subpathX = 0;
			let subpathY = 0;
			let previousCubicControl: {x: number; y: number} | null = null;
			let previousQuadraticControl: {x: number; y: number} | null = null;

			for (const [instructionIndex, instruction] of instructions.entries()) {
				if (instruction.type === 'Z') {
					x = subpathX;
					y = subpathY;
					previousCubicControl = null;
					previousQuadraticControl = null;
					continue;
				}

				if (instruction.type === 'C') {
					pathConnections.push(
						{
							x1: x,
							y1: y,
							x2: instruction.cp1x,
							y2: instruction.cp1y,
							key: `${instructionIndex}-start-handle`,
						},
						{
							x1: instruction.x,
							y1: instruction.y,
							x2: instruction.cp2x,
							y2: instruction.cp2y,
							key: `${instructionIndex}-end-handle`,
						},
					);
					pathPoints.push(
						{
							x: instruction.cp1x,
							y: instruction.cp1y,
							key: `${instructionIndex}-cp1`,
							instructionIndex,
							role: 'cp1',
						},
						{
							x: instruction.cp2x,
							y: instruction.cp2y,
							key: `${instructionIndex}-cp2`,
							instructionIndex,
							role: 'cp2',
						},
					);
					previousCubicControl = {x: instruction.cp2x, y: instruction.cp2y};
					previousQuadraticControl = null;
				} else if (instruction.type === 'S') {
					if (previousCubicControl !== null) {
						const reflectedX = 2 * x - previousCubicControl.x;
						const reflectedY = 2 * y - previousCubicControl.y;
						if (reflectedX !== x || reflectedY !== y) {
							pathConnections.push({
								x1: x,
								y1: y,
								x2: reflectedX,
								y2: reflectedY,
								key: `${instructionIndex}-start-handle`,
							});
							pathPoints.push({
								x: reflectedX,
								y: reflectedY,
								key: `${instructionIndex}-reflected-cp`,
								instructionIndex,
								role: 'reflected-cp',
							});
						}
					}

					pathConnections.push({
						x1: instruction.x,
						y1: instruction.y,
						x2: instruction.cpx,
						y2: instruction.cpy,
						key: `${instructionIndex}-end-handle`,
					});
					pathPoints.push({
						x: instruction.cpx,
						y: instruction.cpy,
						key: `${instructionIndex}-cp`,
						instructionIndex,
						role: 'cp',
					});
					previousCubicControl = {x: instruction.cpx, y: instruction.cpy};
					previousQuadraticControl = null;
				} else if (instruction.type === 'Q') {
					pathConnections.push(
						{
							x1: x,
							y1: y,
							x2: instruction.cpx,
							y2: instruction.cpy,
							key: `${instructionIndex}-start-handle`,
						},
						{
							x1: instruction.x,
							y1: instruction.y,
							x2: instruction.cpx,
							y2: instruction.cpy,
							key: `${instructionIndex}-end-handle`,
						},
					);
					pathPoints.push({
						x: instruction.cpx,
						y: instruction.cpy,
						key: `${instructionIndex}-cp`,
						instructionIndex,
						role: 'cp',
					});
					previousQuadraticControl = {x: instruction.cpx, y: instruction.cpy};
					previousCubicControl = null;
				} else if (instruction.type === 'T') {
					const control: {x: number; y: number} =
						previousQuadraticControl === null
							? {x, y}
							: {
									x: 2 * x - previousQuadraticControl.x,
									y: 2 * y - previousQuadraticControl.y,
								};
					if (control.x !== x || control.y !== y) {
						pathConnections.push(
							{
								x1: x,
								y1: y,
								x2: control.x,
								y2: control.y,
								key: `${instructionIndex}-start-handle`,
							},
							{
								x1: instruction.x,
								y1: instruction.y,
								x2: control.x,
								y2: control.y,
								key: `${instructionIndex}-end-handle`,
							},
						);
						pathPoints.push({
							x: control.x,
							y: control.y,
							key: `${instructionIndex}-reflected-cp`,
							instructionIndex,
							role: 'reflected-cp',
						});
					}

					previousQuadraticControl = control;
					previousCubicControl = null;
				} else {
					previousCubicControl = null;
					previousQuadraticControl = null;
				}

				if (instruction.type === 'H') {
					x = instruction.x;
				} else if (instruction.type === 'V') {
					y = instruction.y;
				} else if ('x' in instruction && 'y' in instruction) {
					x = instruction.x;
					y = instruction.y;
				}

				if (instruction.type === 'M') {
					subpathX = x;
					subpathY = y;
				}

				pathPoints.push({
					x,
					y,
					key: `${instructionIndex}-end`,
					instructionIndex,
					role: 'end',
				});
			}

			const {a, b, c, d, e, f} = outline.path.matrix;
			const transformPoint = (localX: number, localY: number) => ({
				x: a * localX + c * localY + e,
				y: b * localX + d * localY + f,
			});
			return {
				points: pathPoints.map((point) => ({
					...transformPoint(point.x, point.y),
					localX: point.x,
					localY: point.y,
					key: point.key,
					instructionIndex: point.instructionIndex,
					role: point.role,
				})),
				connections: pathConnections.map((connection) => {
					const from = transformPoint(connection.x1, connection.y1);
					const to = transformPoint(connection.x2, connection.y2);
					return {
						x1: from.x,
						y1: from.y,
						x2: to.x,
						y2: to.y,
						key: connection.key,
					};
				}),
			};
		} catch {
			return {points: [], connections: []};
		}
	}, [outline.path]);

	const onPointPointerDown = (
		event: React.PointerEvent<SVGCircleElement>,
		point: (typeof points)[number],
	) => {
		if (event.button !== 0 || outline.path === null) {
			return;
		}

		const svg = event.currentTarget.ownerSVGElement;
		if (svg === null) {
			return;
		}

		const {a, b, c, d} = outline.path.matrix;
		const determinant = a * d - b * c;
		if (!Number.isFinite(determinant) || determinant === 0) {
			return;
		}

		let instructions: AbsoluteInstruction[];
		try {
			instructions = parsePath(
				normalizePath(outline.path.d),
			) as AbsoluteInstruction[];
		} catch {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		onDraggingChange(true);
		const startX = event.clientX;
		const startY = event.clientY;
		const originalD = serializeInstructions(instructions);
		let lastD = originalD;

		startCapturedPointerSession({
			event,
			captureTarget: svg,
			onMove: (moveEvent) => {
				moveEvent.preventDefault();
				const deltaX = moveEvent.clientX - startX;
				const deltaY = moveEvent.clientY - startY;
				const localDeltaX =
					Math.round(((d * deltaX - c * deltaY) / determinant) * 100) / 100;
				const localDeltaY =
					Math.round(((a * deltaY - b * deltaX) / determinant) * 100) / 100;
				if (localDeltaX === 0 && localDeltaY === 0) {
					if (lastD !== originalD) {
						lastD = originalD;
						setDragOverrides(
							pathDrag.nodePath,
							'd',
							Internals.makeStaticDragOverride(originalD),
						);
					}

					return;
				}

				const nextX =
					localDeltaX === 0
						? point.localX
						: Math.round((point.localX + localDeltaX) * 100) / 100;
				const nextY =
					localDeltaY === 0
						? point.localY
						: Math.round((point.localY + localDeltaY) * 100) / 100;

				const instruction = instructions[point.instructionIndex];
				if (instruction === undefined) {
					return;
				}

				let updated: AbsoluteInstruction;
				if (point.role === 'end') {
					if (instruction.type === 'H') {
						updated =
							nextY === point.localY
								? {...instruction, x: nextX}
								: {type: 'L', x: nextX, y: nextY};
					} else if (instruction.type === 'V') {
						updated =
							nextX === point.localX
								? {...instruction, y: nextY}
								: {type: 'L', x: nextX, y: nextY};
					} else if ('x' in instruction && 'y' in instruction) {
						updated = {...instruction, x: nextX, y: nextY};
					} else {
						return;
					}
				} else if (point.role === 'cp1' && instruction.type === 'C') {
					updated = {...instruction, cp1x: nextX, cp1y: nextY};
				} else if (point.role === 'cp2' && instruction.type === 'C') {
					updated = {...instruction, cp2x: nextX, cp2y: nextY};
				} else if (
					point.role === 'cp' &&
					(instruction.type === 'Q' || instruction.type === 'S')
				) {
					updated = {...instruction, cpx: nextX, cpy: nextY};
				} else if (point.role === 'reflected-cp' && instruction.type === 'S') {
					updated = {
						type: 'C',
						cp1x: nextX,
						cp1y: nextY,
						cp2x: instruction.cpx,
						cp2y: instruction.cpy,
						x: instruction.x,
						y: instruction.y,
					};
				} else if (point.role === 'reflected-cp' && instruction.type === 'T') {
					updated = {
						type: 'Q',
						cpx: nextX,
						cpy: nextY,
						x: instruction.x,
						y: instruction.y,
					};
				} else {
					return;
				}

				const nextInstructions = instructions.slice();
				nextInstructions[point.instructionIndex] = updated;
				const nextD = serializeInstructions(nextInstructions);
				if (lastD === nextD) {
					return;
				}

				lastD = nextD;
				setDragOverrides(
					pathDrag.nodePath,
					'd',
					Internals.makeStaticDragOverride(nextD),
				);
			},
			onEnd: (reason, endEvent) => {
				onDraggingChange(false);
				if (!isPointerSessionRelease(reason, endEvent) || lastD === originalD) {
					clearDragOverrides(pathDrag.nodePath);
					return;
				}

				saveSequenceProps({
					changes: [
						{
							fileName: pathDrag.nodePath.absolutePath,
							nodePath: pathDrag.nodePath,
							fieldKey: 'd',
							value: lastD,
							defaultValue: null,
							schema: pathDrag.schema,
						},
					],
					addedKeyframes: null,
					movedKeyframes: null,
					setPropStatuses,
					clientId: pathDrag.clientId,
					undoLabel: 'Edit path point',
					redoLabel: 'Edit path point back',
				})
					.catch((error) => {
						showNotification(
							`Could not save path: ${error instanceof Error ? error.message : String(error)}`,
							3000,
						);
					})
					.finally(() => clearDragOverrides(pathDrag.nodePath));
			},
		});
	};

	return (
		<g>
			{connections.map((connection) => (
				<line
					key={connection.key}
					x1={connection.x1}
					y1={connection.y1}
					x2={connection.x2}
					y2={connection.y2}
					stroke={BLUE}
					strokeWidth={2}
					pointerEvents="none"
				/>
			))}
			{points.map((point) => (
				<g key={point.key}>
					<circle
						cx={point.x}
						cy={point.y}
						r={10}
						fill="transparent"
						pointerEvents="all"
						onPointerDown={(event) => onPointPointerDown(event, point)}
						style={{cursor: 'crosshair'}}
					/>
					<circle
						cx={point.x}
						cy={point.y}
						r={4.5}
						fill={WHITE}
						stroke={BLUE}
						strokeWidth={2}
						pointerEvents="none"
					/>
				</g>
			))}
		</g>
	);
};
