import {visualControl} from '@remotion/studio';
import React, {useContext} from 'react';
import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {ExtrudeDiv} from '../3DContext/Div3D';
import {
	RotateX,
	RotateY,
	Scale,
	TranslateX,
	TranslateY,
} from '../3DContext/transformation-context';
import {AtRemotionButton} from '../Compose/AtRemotionButton';
import {DepthContext} from '../Compose/JumpThenDisappear';

export const CallToAction: React.FC<{
	cornerRadius: number;
	children: React.ReactNode;
	width: number;
	height: number;
}> = ({cornerRadius, children, width, height}) => {
	const depth = useContext(DepthContext);

	return (
		<ExtrudeDiv
			width={width}
			height={height}
			depth={depth}
			cornerRadius={cornerRadius}
			backFace={<AbsoluteFill className="bg-white rounded-full border-4" />}
		>
			<AbsoluteFill
				className="bg-white justify-center items-center"
				style={{
					borderRadius: cornerRadius,
					border: '3px solid black',
					overflow: 'hidden',
				}}
			>
				{children}
			</AbsoluteFill>
		</ExtrudeDiv>
	);
};

export const CTAEndCard: React.FC = () => {
	const {height, width, fps} = useVideoConfig();
	const frame = useCurrentFrame();

	const stat = frame * 0.0002;

	const jumpUp =
		spring({
			fps,
			frame,
			config: {
				damping: 200,
			},
			durationInFrames: 100,
			durationRestThreshold: 0.000001,
		}) + stat;

	const shrink = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
		delay: 110,
		durationInFrames: 10,
	});

	const progress = 0.01;

	const WIDTH = interpolate(progress, [0, 1], [450, 350 * 10]);
	const HEIGHT = interpolate(progress, [0, 1], [110, 400 * 6]);

	const up = interpolate(jumpUp, [0, 1], [600, 0]) - frame * 1;

	return (
		<AbsoluteFill
			style={{
				borderRadius: 10,
			}}
		>
			<div className="flex flex-row">
				<div style={{position: 'absolute'}}>
					<DepthContext value={50}>
						<Scale factor={(1 - shrink) * 1.2}>
							<RotateX
								radians={
									visualControl('x', -0.4) * jumpUp +
									0.1 -
									(Math.PI / 2) * shrink
								}
							>
								<RotateY
									radians={
										interpolate(jumpUp, [0, 1], [Math.PI * 2, 0]) -
										frame * 0.004
									}
								>
									<TranslateX px={(width - WIDTH) / 2}>
										<TranslateY px={(height - HEIGHT) / 2 + up + 350}>
											<CallToAction
												cornerRadius={HEIGHT / 2}
												width={WIDTH}
												height={HEIGHT}
											>
												<AtRemotionButton progress={progress} />
											</CallToAction>
										</TranslateY>
									</TranslateX>
								</RotateY>
							</RotateX>
						</Scale>
					</DepthContext>
				</div>
			</div>
		</AbsoluteFill>
	);
};
