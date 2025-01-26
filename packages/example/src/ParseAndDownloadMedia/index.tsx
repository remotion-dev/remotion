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

const ENABLE_EXTRUDE = 1;

export const ParseAndDownloadMedia: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();

	const prog = spring({
		fps,
		frame,
		durationInFrames: 100,
	});

	return (
		<AbsoluteFill className="bg-white flex justify-center items-center">
			<RotateY radians={frame / 100}>
				<RotateX radians={frame / 20}>
					<ThreeDiv
						className="text-3xl mb-10"
						style={{fontFamily: 'GT Planar', backgroundColor: 'red'}}
					>
						hi there
					</ThreeDiv>
					<ExtrudeDiv
						depth={80}
						width={800}
						height={160}
						cornerRadius={10}
						topFace={
							<div
								style={{fontFamily: 'GT Planar'}}
								className="w-full h-full flex items-center text-white pl-6"
							>
								Up top
							</div>
						}
						bottomFace={
							<div
								style={{fontFamily: 'GT Planar'}}
								className="w-full h-full flex items-center text-white pl-6 text-4xl"
							>
								Bottom top
							</div>
						}
					>
						<div
							className="h-full w-full overflow-hidden border-black border-solid border-2"
							style={{borderRadius: 10, backgroundColor: 'white'}}
						>
							<div
								style={{
									width: `${interpolate(prog, [0, 1], [0, 100])}%`,
								}}
								className="bg-[#0B84F3] h-full"
							/>
						</div>
					</ExtrudeDiv>
				</RotateX>
			</RotateY>
		</AbsoluteFill>
	);
};
