import React from 'react';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {ExtrudeDiv} from '../3DContext/Div3D';
import {
	RotateX,
	RotateY,
	RotateZ,
	Scale,
	TranslateX,
	TranslateY,
	TranslateZ,
} from '../3DContext/transformation-context';

const height = 700;
const width = (height / 16) * 9;
const cornerRadius = 10;
const depth = 60;

const Label: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	return (
		<div
			className="text-white "
			style={{
				fontFamily: 'GT Planar',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				paddingLeft: 20,
				fontSize: 24,
			}}
		>
			{children}
		</div>
	);
};

const VideoLayers: React.FC<{
	label: string;
}> = ({label}) => {
	return (
		<AbsoluteFill className="flex justify-center items-center">
			<Rotations delay={0}>
				<ExtrudeDiv
					width={width}
					height={height}
					depth={depth}
					cornerRadius={10}
					backFace={<AbsoluteFill className="bg-black"></AbsoluteFill>}
					bottomFace={<Label>{label}</Label>}
				>
					<div
						style={{
							borderRadius: cornerRadius,
							overflow: 'hidden',
							fontFamily: 'GT Planar',
							backgroundColor: 'white',
							border: '3px solid black',
						}}
						className="text-black flex justify-center items-center font-sans text-2xl font-bold flex-1"
					>
						<div
							style={{
								backgroundColor: 'white',
								width: '100%',
								height: '100%',
							}}
						></div>
					</div>
				</ExtrudeDiv>
			</Rotations>
		</AbsoluteFill>
	);
};

const CaptionLayers = () => {
	return (
		<AbsoluteFill className="flex justify-center items-center">
			<Rotations delay={1}>
				<ExtrudeDiv
					width={300}
					height={60}
					depth={depth}
					cornerRadius={10}
					backFace={<AbsoluteFill className="bg-black"></AbsoluteFill>}
					bottomFace={<Label>&lt;Captions /&gt;</Label>}
				>
					<div
						style={{
							borderRadius: cornerRadius,
							overflow: 'hidden',
							fontFamily: 'GT Planar',
							backgroundColor: 'white',
							border: '3px solid black',
						}}
						className="text-black flex justify-center items-center font-sans text-2xl font-bold flex-1"
					>
						<div>
							Hallo{' '}
							<span className="bg-blue-600 px-2 py-1 rounded text-white">
								IPT!
							</span>
						</div>
					</div>
				</ExtrudeDiv>
			</Rotations>
		</AbsoluteFill>
	);
};

const Rotations: React.FC<{
	children: React.ReactNode;
	delay: number;
}> = ({children, delay}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const spr = spring({
		fps,
		frame,
		delay,
	});

	const rotate = interpolate(spr, [0, 1], [Math.PI, 0]);

	return (
		<RotateY radians={rotate - 0.4}>
			<RotateX radians={-0.6}>
				<RotateZ radians={-0.5}>{children}</RotateZ>
			</RotateX>
		</RotateY>
	);
};

export const Compose = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const bRollEnter = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
		delay: 50,
		durationInFrames: 25,
		durationRestThreshold: 0.0001,
	});
	const bRollExit = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
		delay: 90,
		durationInFrames: 25,
		durationRestThreshold: 0.0001,
	});

	const endCard = interpolate(frame, [120, 145], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.bezier(0.42, 0, 0.58, 1),
	});

	const layerDownProgress =
		interpolate(bRollEnter, [0, 0.5], [0, 1], {
			extrapolateRight: 'clamp',
		}) -
		interpolate(bRollExit, [0.5, 1], [0, 1], {
			extrapolateLeft: 'clamp',
		});

	const firstX = interpolate(endCard, [0.7, 1], [0, -1500], {
		extrapolateLeft: 'clamp',
	});
	const secondX = interpolate(endCard, [0, 1], [1500, 0], {
		extrapolateLeft: 'clamp',
	});

	const liftCaptions = interpolate(endCard, [0, 1], [0, -2000]);

	return (
		<AbsoluteFill className="flex justify-center items-center">
			<Scale factor={1.3}>
				<TranslateX px={firstX}>
					<TranslateZ px={1.5 * depth * layerDownProgress}>
						<VideoLayers label="<Video />" />
					</TranslateZ>
				</TranslateX>
				<TranslateY
					px={interpolate(bRollEnter + bRollExit, [0, 1, 2], [1500, 0, -1500])}
				>
					<VideoLayers label="<BRoll />" />
				</TranslateY>
				{endCard > 0 && (
					<TranslateX px={secondX}>
						<VideoLayers label="<EndCard />" />
					</TranslateX>
				)}
				<TranslateY px={190}>
					<TranslateZ px={-depth + liftCaptions}>
						<CaptionLayers />
					</TranslateZ>
				</TranslateY>
			</Scale>
		</AbsoluteFill>
	);
};
