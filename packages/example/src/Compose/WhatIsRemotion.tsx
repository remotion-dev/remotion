import React from 'react';
import {
	AbsoluteFill,
	CalculateMetadataFunction,
	Easing,
	interpolate,
	measureSpring,
	OffthreadVideo,
	Sequence,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {z} from 'zod';
import {ExtrudeDiv} from '../3DContext/Div3D';
import {
	RotateY,
	Scale,
	TranslateX,
	TranslateY,
	TranslateZ,
} from '../3DContext/transformation-context';
import {Captions} from './Captions';
import {CodeFrame} from './CodeFrame';
import {EndCard} from './EndCard';
import {LabelOpacityContext, useLabelOpacity} from './LabelOpacity';
import {Rotations} from './Rotations';

const height = 700;
const width = (height / 16) * 9;
const cornerRadius = 10;
const depth = 60;
const animationStart = 55;

const Label: React.FC<React.HTMLAttributes<HTMLDivElement>> = (rest) => {
	const opacity = useLabelOpacity();
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
				opacity,
			}}
			{...rest}
		/>
	);
};

const getActualLayerWidth = (progress: number) => {
	return {
		width: interpolate(progress, [0, 1], [width * 1.5, width]),
		height: interpolate(progress, [0, 1], [height, height]),
	};
};

const VideoLayers: React.FC<{
	label: string;
	delay: number;
	footage?: boolean;
	bRoll?: boolean;
	boxWidth: number;
	boxHeight: number;
	codeFrame?: boolean;
	endCard?: boolean;
}> = ({
	label,
	delay,
	footage,
	boxHeight,
	boxWidth,
	codeFrame,
	bRoll,
	endCard,
}) => {
	return (
		<Rotations zIndexHack={false} delay={delay}>
			<ExtrudeDiv
				width={boxWidth}
				height={boxHeight}
				depth={depth}
				cornerRadius={10}
				backFace={
					<AbsoluteFill
						className="bg-gray-700"
						style={{
							borderRadius: cornerRadius,
							border: '3px solid black',
						}}
					>
						{codeFrame && <CodeFrame />}
					</AbsoluteFill>
				}
				bottomFace={<Label>{label}</Label>}
			>
				<div
					style={{
						borderRadius: cornerRadius,
						overflow: 'hidden',
						fontFamily: 'GT Planar',
						backgroundColor: 'black',
						border: '3px solid black',
					}}
					className="text-black flex justify-center items-center font-sans text-2xl font-bold flex-1"
				>
					<div
						style={{
							backgroundColor: 'black',
							width: '100%',
							height: '100%',
							overflow: 'hidden',
						}}
					>
						{footage ? (
							<Sequence from={animationStart} layout="none">
								<OffthreadVideo
									muted
									style={{width: '100%', height: '100%', objectFit: 'cover'}}
									src={staticFile('video.mp4')}
								></OffthreadVideo>
							</Sequence>
						) : null}
						{bRoll ? (
							<Sequence from={animationStart} layout="none">
								<OffthreadVideo
									muted
									style={{width: '100%', height: '100%', objectFit: 'cover'}}
									src={staticFile('spiral_.mp4')}
								></OffthreadVideo>
							</Sequence>
						) : null}
						{endCard ? (
							<AbsoluteFill
								className="bg-white"
								style={{borderRadius: cornerRadius, border: '3px solid black'}}
							></AbsoluteFill>
						) : null}
					</div>
				</div>
			</ExtrudeDiv>
		</Rotations>
	);
};

const CaptionLayers: React.FC<{
	delay: number;
}> = ({delay: delay}) => {
	return (
		<Rotations zIndexHack delay={1 + delay}>
			<ExtrudeDiv
				width={300}
				height={60}
				depth={depth}
				cornerRadius={10}
				bottomFace={<Label>&lt;Captions /&gt;</Label>}
				backFace={
					<AbsoluteFill
						className="bg-black"
						style={{borderRadius: cornerRadius, overflow: 'hidden'}}
					></AbsoluteFill>
				}
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
					<Sequence from={animationStart}>
						<Captions></Captions>
					</Sequence>
				</div>
			</ExtrudeDiv>
		</Rotations>
	);
};

export const whatIsRemotionSchema = z.object({
	fade: z.boolean(),
	whiteBackground: z.boolean(),
	reel: z.boolean(),
});

export const whatIsRemotionCalculateMetadata: CalculateMetadataFunction<
	z.infer<typeof whatIsRemotionSchema>
> = ({props}) => {
	return {
		height: props.reel ? 1920 : 1080,
		durationInFrames: props.reel ? 276 : 273,
		props,
	};
};

export const WhatIsRemotion = ({
	fade,
	whiteBackground,
	reel,
}: z.infer<typeof whatIsRemotionSchema>) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const bRollEnter = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
		delay: 50 + animationStart,
		durationInFrames: 25,
		durationRestThreshold: 0.0001,
	});
	const bRollExit = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
		delay: 90 + animationStart,
		durationInFrames: 25,
		durationRestThreshold: 0.0001,
	});

	const endCard = interpolate(
		frame,
		[120 + animationStart, 145 + animationStart],
		[0, 1],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: Easing.bezier(0.42, 0, 0.58, 1),
		},
	);

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

	const outAnimation = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
		delay: 250,
		durationInFrames: 20,
	});

	const spr = spring({
		fps,
		frame,
		delay: animationStart,
		config: {
			damping: 200,
		},
		durationInFrames: measureSpring({fps, config: {}}),
	});
	const actual = getActualLayerWidth(spr);

	const outActual = getActualLayerWidth(1 - outAnimation);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: whiteBackground ? 'white' : undefined,
			}}
			className="flex justify-center items-center"
		>
			<Scale factor={reel ? 1.3 : 1.1}>
				<AbsoluteFill
					style={{
						maskImage:
							frame > 100 && fade
								? 'linear-gradient( -98deg, transparent 5%, red 15%, red 80%, transparent 90%)'
								: 'none',
					}}
				>
					<TranslateX px={firstX}>
						<TranslateZ px={1.5 * depth * layerDownProgress}>
							<VideoLayers
								footage
								codeFrame
								delay={animationStart}
								boxHeight={actual.height}
								boxWidth={actual.width}
								label="<Video />"
							/>
						</TranslateZ>
					</TranslateX>
				</AbsoluteFill>
				<AbsoluteFill
					style={{
						maskImage: fade
							? 'linear-gradient( -7deg, transparent 6%, red 15%, red 84%, transparent 94%)'
							: 'none',
					}}
				>
					<TranslateY
						px={interpolate(
							bRollEnter + bRollExit,
							[0, 1, 2],
							[1900, 0, -1900],
						)}
					>
						<VideoLayers
							bRoll
							boxWidth={width}
							boxHeight={height}
							delay={animationStart}
							label="<BRoll />"
						/>
					</TranslateY>
				</AbsoluteFill>
				<AbsoluteFill
					style={{
						maskImage:
							frame > 100 && fade
								? 'linear-gradient( -98deg, transparent 10%, red 18%, red 80%, transparent 90%)'
								: 'none',
					}}
				>
					{endCard > 0 && (
						<TranslateX px={secondX}>
							<RotateY radians={Math.PI * outAnimation}>
								<LabelOpacityContext.Provider value={1 - outAnimation}>
									<VideoLayers
										boxHeight={outActual.height}
										boxWidth={outActual.width}
										delay={animationStart}
										label="<EndCard />"
										endCard
									></VideoLayers>
								</LabelOpacityContext.Provider>
							</RotateY>
						</TranslateX>
					)}
					<AbsoluteFill
						style={{
							maskImage: fade
								? 'linear-gradient(to bottom, transparent , black 10%)'
								: undefined,
						}}
					>
						<TranslateX px={secondX}>
							<AbsoluteFill
								style={{
									justifyContent: 'center',
									alignItems: 'center',
								}}
							>
								<Sequence layout="none" from={100}>
									<div
										style={{
											width: width,
											height: height,
											position: 'relative',
										}}
									>
										{endCard ? (
											<EndCard cornerRadius={cornerRadius}></EndCard>
										) : null}
									</div>
								</Sequence>
							</AbsoluteFill>
						</TranslateX>
					</AbsoluteFill>
				</AbsoluteFill>
				<TranslateY px={190}>
					<TranslateZ px={-depth * 2 + liftCaptions}>
						<CaptionLayers delay={animationStart} />
					</TranslateZ>
				</TranslateY>
			</Scale>
		</AbsoluteFill>
	);
};
