import React from 'react';
import {AbsoluteFill} from 'remotion';

type WheelItem = {
	readonly label: string;
	readonly transform: string;
	readonly counterTransform: string;
	readonly color: string;
};

const wheelItems: readonly WheelItem[] = [
	{
		label: 'Monday',
		transform: 'translateZ(130px) translateY(0px) rotateX(0deg)',
		counterTransform: 'rotateX(0rad)',
		color: 'rgb(1, 6, 74)',
	},
	{
		label: 'Tuesday',
		transform:
			'translateZ(99.5858px) translateY(83.5624px) rotateX(0.698132deg)',
		counterTransform: 'rotateX(-0.698132rad)',
		color: 'rgba(1, 6, 74, 0.3)',
	},
	{
		label: 'Sunday',
		transform:
			'translateZ(99.5858px) translateY(-83.5624px) rotateX(5.58505deg)',
		counterTransform: 'rotateX(-5.58505rad)',
		color: 'rgba(1, 6, 74, 0.3)',
	},
];

const Wheel: React.FC = () => {
	return (
		<div
			style={{
				position: 'absolute',
				right: 0,
				height: '100%',
				width: 360,
			}}
		>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					backgroundImage:
						'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.125) 100%)',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					maskImage:
						'linear-gradient(transparent 0%, rgb(0, 0, 0) 30%, rgb(0, 0, 0) 70%, transparent 100%)',
				}}
			>
				<div
					style={{
						position: 'absolute',
						inset: 0,
						perspective: 10000,
					}}
				>
					{wheelItems.map((item) => {
						return (
							<div
								key={item.label}
								style={{
									position: 'absolute',
									inset: 0,
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'center',
									fontSize: 65,
									transform: item.transform,
									backfaceVisibility: 'hidden',
									perspective: 1000,
									color: item.color,
									fontFamily: 'sans-serif',
									fontWeight: 'bold',
								}}
							>
								<div
									style={{
										transform: item.counterTransform,
										backfaceVisibility: 'hidden',
										textAlign: 'right',
										lineHeight: 1,
										width: 370,
										paddingRight: 50,
									}}
								>
									{item.label}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'rgb(6, 8, 66)',
				overflow: 'hidden',
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: 40,
					top: 60,
					width: 680,
					transform:
						'perspective(1200px) rotateY(4.8deg) rotateX(-3.2deg) skewX(2.24deg) skewY(-1.28deg) scale(0.808)',
					transformOrigin: 'left top',
				}}
			>
				<div
					style={{
						padding: 20,
						backgroundColor: 'rgba(255, 255, 255, 0.1)',
						border: '1px solid rgba(255, 255, 255, 0.2)',
						borderRadius: 70,
					}}
				>
					<div
						style={{
							display: 'flex',
							backgroundColor: 'rgba(230, 225, 252, 0.8)',
							height: 200,
							alignItems: 'center',
							paddingLeft: 50,
							borderRadius: 50,
							position: 'relative',
							overflow: 'hidden',
							border: '2px solid rgba(255, 255, 255, 0.1)',
						}}
					>
						<div
							style={{
								color: 'rgb(1, 6, 74)',
								fontWeight: 'bold',
								fontSize: 45,
								fontFamily: 'sans-serif',
							}}
						>
							Day
						</div>
						<Wheel />
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const issue6211MaskWheel = {
	component: Component,
	id: 'issue-6211-mask-wheel',
	width: 760,
	height: 320,
	fps: 30,
	durationInFrames: 1,
} as const;
