import React from 'react';
import {useVideoConfig} from 'remotion';
import * as svgPathProperties from 'svg-path-properties';
import {COLOR_1, COLOR_2} from './config';

const rx = 170;
const ry = 400;

const arcLength = Math.PI * 2 * Math.sqrt((rx * rx + ry * ry) / 2);

function ellipseToPath(cx: number, cy: number): string {
	let output = 'M' + (cx - rx).toString() + ',' + cy.toString();
	output +=
		'a' +
		rx.toString() +
		',' +
		ry.toString() +
		' 0 1,0 ' +
		(2 * rx).toString() +
		',0';
	output +=
		'a' +
		rx.toString() +
		',' +
		ry.toString() +
		' 0 1,0 ' +
		(-2 * rx).toString() +
		',0';
	return output;
}

const electronRadius = 6;

export const Arc: React.FC<{
	progress: number;
	rotation: number;
	rotateProgress: number;
	electronProgress: number;
	electronOpacity: number;
}> = ({
	progress,
	rotation,
	rotateProgress,
	electronProgress,
	electronOpacity,
}) => {
	const config = useVideoConfig();
	const cx = config.width / 2;
	const cy = config.height / 2;
	const d = ellipseToPath(cx, cy);
	const attributes = new svgPathProperties.svgPathProperties(
		d
	).getPropertiesAtLength((electronProgress % 1) * arcLength);
	const move = (orig: number, x: number, y: number): number =>
		orig + x * attributes.tangentX + y * attributes.tangentY;

	const leftPointArrow = [
		move(attributes.x, 0, electronRadius),
		move(attributes.y, -electronRadius, 0),
	];
	const midPoint = [move(attributes.x, 60, 0), move(attributes.y, 0, 60)];
	const rightPointArrow = [
		move(attributes.x, 0, -electronRadius),
		move(attributes.y, electronRadius, 0),
	];
	return (
		<svg
			viewBox={`0 0 ${config.width} ${config.height}`}
			style={{
				position: 'absolute',
				transform: `rotate(${rotation * rotateProgress}deg)`,
				transformOrigin: `${config.width / 2}px ${config.height / 2}px`,
			}}
		>
			<defs>
				<linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
					<stop offset="0%" stopColor={COLOR_1} />
					<stop offset="100%" stopColor={COLOR_2} />
				</linearGradient>
			</defs>
			<path
				d={d}
				fill="none"
				stroke="url(#gradient)"
				strokeDasharray={arcLength}
				strokeDashoffset={arcLength - arcLength * progress}
				strokeLinecap="round"
				strokeWidth={30}
			/>
			<circle
				r={electronRadius}
				fill="#fff"
				cx={attributes.x}
				cy={attributes.y}
				style={{opacity: electronOpacity}}
			/>
			<path
				d={`M${leftPointArrow[0]} ${leftPointArrow[1]} ${midPoint[0]} ${midPoint[1]} ${rightPointArrow[0]} ${rightPointArrow[1]} Z`}
				fill="white"
				strokeLinecap="round"
				style={{opacity: electronOpacity}}
			/>
		</svg>
	);
};
