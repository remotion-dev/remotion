import {normalizePath, parsePath} from '@remotion/paths';
import React, {useMemo} from 'react';
import {BLUE, WHITE} from '../helpers/colors';
import type {SelectedOutline} from './selected-outline-geometry';

export const SelectedOutlinePathPoints: React.FC<{
	readonly outline: SelectedOutline;
}> = ({outline}) => {
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

			for (const [instructionIndex, instruction] of instructions.entries()) {
				if (instruction.type === 'Z') {
					x = subpathX;
					y = subpathY;
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
						},
						{
							x: instruction.cp2x,
							y: instruction.cp2y,
							key: `${instructionIndex}-cp2`,
						},
					);
				} else if (instruction.type === 'Q' || instruction.type === 'S') {
					if (instruction.type === 'Q') {
						pathConnections.push({
							x1: x,
							y1: y,
							x2: instruction.cpx,
							y2: instruction.cpy,
							key: `${instructionIndex}-start-handle`,
						});
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
					});
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

				pathPoints.push({x, y, key: `${instructionIndex}-end`});
			}

			const {a, b, c, d, e, f} = outline.path.matrix;
			const transformPoint = (localX: number, localY: number) => ({
				x: a * localX + c * localY + e,
				y: b * localX + d * localY + f,
			});
			return {
				points: pathPoints.map((point) => ({
					...transformPoint(point.x, point.y),
					key: point.key,
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

	return (
		<g pointerEvents="none">
			{connections.map((connection) => (
				<line
					key={connection.key}
					x1={connection.x1}
					y1={connection.y1}
					x2={connection.x2}
					y2={connection.y2}
					stroke={BLUE}
					strokeWidth={2}
				/>
			))}
			{points.map((point) => (
				<circle
					key={point.key}
					cx={point.x}
					cy={point.y}
					r={4.5}
					fill={WHITE}
					stroke={BLUE}
					strokeWidth={2}
				/>
			))}
		</g>
	);
};
