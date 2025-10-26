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

	const stat = frame * 0.0005;

	const jumpUp =
		spring({
			fps,
			frame,
			config: {
				damping: 200,
			},
			durationInFrames: 40,
		}) + stat;

	const progress =
		spring({
			fps,
			frame,
			durationInFrames: 25,
			delay: 40,
			config: {
				damping: 14,
			},
		}) + stat;

	const WIDTH = interpolate(progress, [0, 1], [350, 350 * 8]);
	const HEIGHT = interpolate(progress, [0, 1], [100, 400 * 4]);

	const up = interpolate(jumpUp, [0, 1], [600, 0]);

	return (
		<AbsoluteFill
			style={{
				borderRadius: 10,
			}}
		>
			<div className="flex flex-row">
				<div style={{position: 'absolute'}}>
					<DepthContext value={50}>
						<RotateX radians={visualControl('x', -0.4) * jumpUp + 0.1}>
							<RotateY radians={visualControl('y', -0.8) * jumpUp}>
								<TranslateX px={(width - WIDTH) / 2}>
									<TranslateY px={(height - HEIGHT) / 2 + up + 200}>
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
					</DepthContext>
				</div>
			</div>
		</AbsoluteFill>
	);
};
