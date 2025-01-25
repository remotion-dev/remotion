import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {ExtrudeDiv, ThreeDiv} from '../3DContext/Div3D';
import {RotateX, RotateY} from '../3DContext/transformation-context';

export const ParseAndDownloadMedia: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();

	const prog = spring({
		fps,
		frame,
		durationInFrames: 100,
	});

	const rotateX = interpolate(prog, [0, 1], [0, Math.PI / 2]);
	const rotateY = interpolate(prog, [0, 1], [0, Math.PI / 2]);

	return (
		<AbsoluteFill className="bg-white flex justify-center items-center">
			<RotateY radians={rotateX}>
				<RotateX radians={rotateY}>
					<ThreeDiv
						className="text-3xl mb-10"
						style={{fontFamily: 'GT Planar'}}
					>
						hi there
					</ThreeDiv>
					<ExtrudeDiv depth={40} width={700} height={120} cornerRadius={10}>
						<div
							className="h-full w-full overflow-hidden border-black border-solid border-2"
							style={{borderRadius: 10, backgroundColor: 'white'}}
						>
							<div
								style={{
									width: `${interpolate(prog, [0, 1], [0, 100])}%`,
								}}
								className="bg-red-500 h-full"
							/>
						</div>
					</ExtrudeDiv>
				</RotateX>
			</RotateY>
		</AbsoluteFill>
	);
};
