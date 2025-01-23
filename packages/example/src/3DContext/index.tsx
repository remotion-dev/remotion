import {rotateX, rotateY, scaled} from '@remotion/svg-3d-engine';
import {AbsoluteFill} from 'remotion';
import {Div3D} from './Outer';

const Comp = () => {
	const width = 200;
	const height = 70;

	const cornerRadius = 10;

	const angle = Math.PI / 4;

	const transformations = [
		scaled(1.1),
		rotateX(-Math.PI / 16),
		rotateX(Math.sin(angle) / 4),
		// rotateY(-Math.PI / 8),
		rotateY(-Math.cos(angle) / 4),
	];

	return (
		<AbsoluteFill className="flex justify-center items-center bg-[#F8FAFC]">
			<Div3D
				width={width}
				height={height}
				depth={40}
				transformatations={transformations}
				cornerRadius={10}
			>
				<div
					style={{
						borderRadius: cornerRadius,
						fontFamily: 'GT Planar',
						backgroundColor: 'white',
						border: '2px solid black',
					}}
					className="text-black flex justify-center items-center font-sans text-2xl border-solid border-black font-bold cursor-pointer flex-1"
				>
					Get started
				</div>
			</Div3D>
		</AbsoluteFill>
	);
};

export const ThreeDContext = Comp;
