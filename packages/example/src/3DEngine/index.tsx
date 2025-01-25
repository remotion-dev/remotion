import {StudioInternals} from '@remotion/studio';
import {AbsoluteFill} from 'remotion';
import {Outer} from './Outer';

const Comp = () => {
	const width = 200;
	const height = 70;

	const cornerRadius = 10;

	return (
		<AbsoluteFill className="flex justify-center items-center bg-[#F8FAFC]">
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
					className="text-black flex justify-center items-center font-sans text-2xl border-solid border-black font-bold cursor-pointer"
				>
					Get started
				</div>
			</Outer>
		</AbsoluteFill>
	);
};

export const ThreeDEngine = StudioInternals.createStill({
	component: Comp,
	id: 'ThreeDEngine',
	height: 1080,
	width: 1080,
});
