import React from 'react';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	Sequence,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {ExtrudeDiv, ThreeDiv} from '../3DContext/Div3D';
import {RotateX, RotateY, Scale} from '../3DContext/transformation-context';
import {Cover} from './Covert';
import {FrontFace} from './FrontFace';
import {TopFace} from './TopFace';

export const ParseAndDownloadMedia: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const moveInDelay = 150;

	const moveIn = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
		durationInFrames: moveInDelay - 35,
		delay: 80,
	});

	const rotateX =
		interpolate(moveIn, [0, 1], [0, -10 / 100]) +
		interpolate(frame, [80, 270], [0, 10 / 100], {
			extrapolateLeft: 'clamp',
		});
	const rotateY = interpolate(moveIn, [0, 1], [Math.PI / 2, 10 / 20]);

	const prog = interpolate(frame, [moveInDelay, 200 + moveInDelay], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.in(Easing.ease),
	});

	return (
		<AbsoluteFill className="bg-white flex justify-center items-center">
			<Scale
				factor={interpolate(frame, [0, 20], [1.1, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
					easing: Easing.out(Easing.ease),
				})}
			>
				<RotateY radians={rotateX}>
					<RotateX radians={rotateY}>
						<div
							style={{
								width: 800,
								height: 800,
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<ThreeDiv
								className="text-3xl w-full h-full flex items-center justify-center absolute"
								style={{fontFamily: 'GT Planar'}}
							/>
							<ExtrudeDiv
								depth={90}
								width={800}
								height={160}
								cornerRadius={40}
								topFace={<TopFace delay={100} />}
							>
								<FrontFace delay={moveInDelay} prog={prog} />
							</ExtrudeDiv>
						</div>
					</RotateX>
				</RotateY>
			</Scale>
			<Sequence from={420}>
				<Cover />
			</Sequence>
		</AbsoluteFill>
	);
};
