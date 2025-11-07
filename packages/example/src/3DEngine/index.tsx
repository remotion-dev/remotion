import {AbsoluteFill} from 'remotion';
import {Outer} from './Outer';

export const Comp = () => {
	const width = 200;
	const height = 70;

	const cornerRadius = 10;

	return (
		<AbsoluteFill className="flex justify-center items-center bg-[#F9FAFC]">
			<Outer width={width} height={height}>
				<div
					style={{
						borderRadius: cornerRadius,
						width,
						height,
						fontFamily: 'GT Planar',
						backgroundColor: 'white',
						border: '2px solid black',
					}}
					className="text-black flex justify-center items-center font-sans text-2xl border-solid border-black cursor-pointer"
				>
					Get started
				</div>
			</Outer>
		</AbsoluteFill>
	);
};
