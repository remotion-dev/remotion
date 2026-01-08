import React from 'react';
import {AbsoluteFill} from 'remotion';

const Face: React.FC<{
	readonly children: React.ReactNode;
	readonly backgroundColor: string;
	readonly transform: string;
}> = ({children, backgroundColor, transform}) => {
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				width: '100%',
				height: '100%',
				position: 'absolute',
				backfaceVisibility: 'inherit',
				fontSize: 30,
				color: 'white',
				backgroundColor,
				transform,
			}}
		>
			{children}
		</div>
	);
};

// TODO: z-indexing is out of scope for
const Cube: React.FC<{readonly perspective: string}> = ({perspective}) => {
	return (
		<div
			style={{
				width: 150,
				height: 150,
				background: 'linear-gradient(skyblue, khaki)',
				perspective,
				perspectiveOrigin: '150% 150%',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<div
				style={{
					width: 50,
					height: 50,
					perspective: '275px',
					transformStyle: 'preserve-3d',
				}}
			>
				<Face
					backgroundColor="rgb(0 210 0 / 0.7)"
					transform="rotateY(180deg) translateZ(25px)"
				>
					2
				</Face>
				<Face
					backgroundColor="rgb(210 0 210 / 0.7)"
					transform="rotateX(-90deg) translateZ(25px)"
				>
					6
				</Face>
				<Face
					backgroundColor="rgb(210 0 0 / 0.7)"
					transform="rotateY(90deg) translateZ(25px)"
				>
					3
				</Face>
				<Face
					backgroundColor="rgb(0 0 210 / 0.7)"
					transform="rotateY(-90deg) translateZ(25px)"
				>
					4
				</Face>
				<Face
					backgroundColor="rgb(210 210 0 / 0.7)"
					transform="rotateX(90deg) translateZ(25px)"
				>
					5
				</Face>
				<Face
					backgroundColor="rgb(90 90 90 / 0.7)"
					transform="translateZ(25px)"
				>
					1
				</Face>
			</div>
		</div>
	);
};

const PerspectiveVariants: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				display: 'flex',
				flexWrap: 'wrap',
			}}
		>
			<Cube perspective="800px" />
			<Cube perspective="none" />
			<Cube perspective="23rem" />
			<Cube perspective="5.5cm" />
		</AbsoluteFill>
	);
};

export const perspectiveVariants = {
	component: PerspectiveVariants,
	id: 'perspective-variants',
	width: 300,
	height: 300,
	fps: 30,
	durationInFrames: 1,
} as const;
