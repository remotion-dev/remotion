import {makePie} from '@remotion/shapes';
import React from 'react';

const Rotation: React.FC<{
	readonly progress: number;
}> = ({progress}) => {
	return (
		<div className="flex-1 border-black border-2 rounded flex flex-col items-center p-2">
			<svg
				viewBox="0 0 100 100"
				width={40}
				height={40}
				style={{
					overflow: 'visible',
				}}
			>
				<path
					fill="transparent"
					className="stroke-slate-200"
					strokeWidth={6}
					style={{
						transformOrigin: '50% 50%',
						transform: `rotate(${progress * 360}deg)`,
					}}
					d={
						makePie({
							progress: 1 - progress - 0.1,
							radius: 50,
							closePath: false,
							counterClockwise: false,
						}).path
					}
				/>
				{progress === 0 ? null : (
					<>
						<path
							fill="transparent"
							stroke="black"
							strokeWidth={6}
							d={
								makePie({
									progress,
									radius: 50,
									closePath: false,
									counterClockwise: false,
								}).path
							}
						/>
						<g
							style={{
								transformOrigin: '50% 50%',
								transform: `rotate(${progress * 360 - 90}deg)`,
							}}
						>
							<path
								d="M 85 50 L 115 50 L 100 70 z"
								fill="black"
								strokeWidth={10}
							/>
						</g>
					</>
				)}
			</svg>
			<div className="h-2" />
			<div className="text-center font-brand font-medium">
				{Math.round(progress * 360)}°
			</div>
		</div>
	);
};

export const RotateComponents: React.FC = () => {
	return (
		<div className="flex flex-row gap-2 mt-3 mb-3">
			<Rotation progress={0} />
			<Rotation progress={0.25} />
			<Rotation progress={0.5} />
			<Rotation progress={0.75} />
		</div>
	);
};
