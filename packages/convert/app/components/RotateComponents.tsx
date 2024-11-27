import {makePie} from '@remotion/shapes';
import React, {useCallback} from 'react';
import {MultiSelectItem} from './MultiSelect';

const Rotation: React.FC<{
	readonly progress: number;
	readonly active: boolean;
	readonly onClick: () => void;
	readonly disabled: boolean;
}> = ({active, progress, onClick, disabled}) => {
	return (
		<MultiSelectItem
			disabled={disabled}
			active={active && !disabled}
			onClick={onClick}
		>
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
					data-active={active}
					className="stroke-slate-200 data-[active=true]:stroke-slate-200/20"
					strokeWidth={6}
					style={{
						transformOrigin: '50% 50%',
						transform: `rotate(${(progress + 0.08) * 360}deg)`,
					}}
					d={
						makePie({
							progress: 1 - progress - 0.12,
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
							stroke="currentcolor"
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
								fill="currentcolor"
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
		</MultiSelectItem>
	);
};

export const RotateComponents: React.FC<{
	readonly rotation: number;
	readonly setRotation: React.Dispatch<React.SetStateAction<number>>;
	readonly canPixelManipulate: boolean;
}> = ({canPixelManipulate, rotation, setRotation}) => {
	const on90 = useCallback(() => {
		setRotation(90);
	}, [setRotation]);

	const on180 = useCallback(() => {
		setRotation(180);
	}, [setRotation]);

	const on270 = useCallback(() => {
		setRotation(270);
	}, [setRotation]);

	return (
		<div>
			<div className="flex flex-row gap-2 mt-3 mb-3">
				<Rotation
					disabled={!canPixelManipulate}
					active={rotation === 90}
					progress={0.25}
					onClick={on90}
				/>
				<Rotation
					disabled={!canPixelManipulate}
					active={rotation === 180}
					progress={0.5}
					onClick={on180}
				/>
				<Rotation
					disabled={!canPixelManipulate}
					active={rotation === 270}
					progress={0.75}
					onClick={on270}
				/>
			</div>
			{canPixelManipulate ? null : (
				<div className="text-gray-700 text-sm">
					Re-encode the video stream in order to apply rotation.
				</div>
			)}
		</div>
	);
};
