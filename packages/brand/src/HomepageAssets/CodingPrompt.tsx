import {loadFont} from '@remotion/fonts';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	staticFile,
	useCurrentFrame,
} from 'remotion';
import {z} from 'zod';
import {ExtrudeDiv} from '../3DContext/Div3D';
import {
	RotateX,
	RotateY,
	RotateZ,
	Scale,
	TranslateX,
	TranslateY,
} from '../3DContext/transformation-context';

const width = 1080;
const height = 600;
const depth = 95;
const cornerRadius = 42;
const thinking = 'Thinking';
const responseTokens = ['Do', 'ne', '.'] as const;
const fontFamily = 'GT Planar';
const shineLoopInFrames = 60;
const sendStartFrame = 12;
const thinkingStartFrame = 42;
const responseStartFrame = 131;

loadFont({
	family: fontFamily,
	url: staticFile('GT Planar/GT-Planar-Medium.woff2'),
	weight: '500',
});

export const codingPromptSchema = z.object({
	promptLine1: z.string(),
	promptLine2: z.string(),
});

export type CodingPromptProps = z.infer<typeof codingPromptSchema>;

const FrontFace: React.FC<{
	readonly promptLine1: string;
	readonly promptLine2: string;
	readonly shineProgress: number;
	readonly frame: number;
}> = ({promptLine1, promptLine2, shineProgress, frame}) => {
	const shinePosition = 140 - shineProgress * 180;
	const thinkingOpacity = interpolate(
		frame,
		[
			thinkingStartFrame,
			thinkingStartFrame + 12,
			responseStartFrame - 12,
			responseStartFrame,
		],
		[0, 1, 1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);
	const thinkingTranslateY = interpolate(
		frame,
		[thinkingStartFrame, thinkingStartFrame + 12],
		[16, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);
	const sendButtonPress = interpolate(
		frame,
		[sendStartFrame, sendStartFrame + 5, sendStartFrame + 16],
		[0, 1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);
	const sendButtonScale = 1 - 0.12 * sendButtonPress;

	return (
		<div
			style={{
				width: '100%',
				height: '100%',
				borderRadius: cornerRadius,
				border: '9px solid #050505',
				backgroundColor: '#f6f4ee',
				boxSizing: 'border-box',
				fontFamily,
				overflow: 'hidden',
				position: 'relative',
			}}
		>
			<Interactive.Div
				name="Sent prompt bubble"
				style={{
					position: 'absolute',
					right: 56,
					top: 56,
					translate: interpolate(frame, [12, 28], ['0px 322px', '0px 0px'], {
						easing: [
							Easing.spring({
								damping: 200,
								mass: 1,
								stiffness: 100,
								allowTail: true,
								durationRestThreshold: 0.02,
								overshootClamping: false,
							}),
						],
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					color: '#332f2a',
					fontSize: 58,
					backgroundColor: '#ffffff',
					border: '5px solid #050505',
					fontWeight: 500,
					lineHeight: 1.02,
					maxWidth: 520,
					padding: '26px 34px 30px',
					borderRadius: 42,
					boxShadow: '0 10px 0 rgba(5, 5, 5, 0.08)',
					boxSizing: 'border-box',
					textAlign: 'right',
					opacity: interpolate(frame, [12, 24], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					scale: interpolate(frame, [12, 28], [0.86, 1], {
						easing: [
							Easing.spring({
								damping: 200,
								mass: 1,
								stiffness: 100,
								allowTail: true,
								durationRestThreshold: 0.02,
								overshootClamping: false,
							}),
						],
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					transformOrigin: '100% 100%',
				}}
			>
				<Interactive.Div name="Sent prompt line 1">
					{promptLine1}
				</Interactive.Div>
				<Interactive.Div name="Sent prompt line 2">
					{promptLine2}
				</Interactive.Div>
			</Interactive.Div>
			<div
				style={{
					position: 'absolute',
					left: 56,
					top: 252,
					color: '#8c8880',
					fontSize: 64,
					fontWeight: 500,
					lineHeight: 1.18,
					opacity: thinkingOpacity,
					transform: `translateY(${thinkingTranslateY}px)`,
				}}
			>
				<span>{thinking}</span>
				<span
					style={{
						position: 'absolute',
						inset: 0,
						color: 'transparent',
						backgroundImage:
							'linear-gradient(90deg, transparent 0%, transparent 34%, rgba(255, 255, 255, 0.8) 50%, transparent 66%, transparent 100%)',
						backgroundSize: '220% 100%',
						backgroundPosition: `${shinePosition}% 0`,
						WebkitBackgroundClip: 'text',
						backgroundClip: 'text',
						lineHeight: 1.18,
					}}
				>
					{thinking}
				</span>
			</div>
			<div
				style={{
					position: 'absolute',
					left: 56,
					top: 252,
					color: '#332f2a',
					fontSize: 64,
					fontWeight: 500,
					lineHeight: 1.18,
				}}
			>
				{responseTokens.map((token, index) => {
					const tokenOpacity = interpolate(
						frame,
						[
							responseStartFrame + index * 3 - 1,
							responseStartFrame + index * 3,
						],
						[0, 1],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
					);

					return (
						<span key={token} style={{opacity: tokenOpacity}}>
							{token}
						</span>
					);
				})}
			</div>
			<div
				style={{
					position: 'absolute',
					left: 56,
					right: 56,
					bottom: 56,
					height: 96,
					borderRadius: 48,
					backgroundColor: '#ffffff',
					border: '5px solid #050505',
					boxSizing: 'border-box',
					display: 'flex',
					alignItems: 'center',
					padding: '10px 12px 10px 34px',
					boxShadow: '0 10px 0 rgba(5, 5, 5, 0.08)',
				}}
			>
				<div style={{flex: 1}} />
				<div
					style={{
						width: 68,
						height: 68,
						borderRadius: 34,
						backgroundColor: '#0b84f3',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						marginLeft: 22,
						transform: `scale(${sendButtonScale})`,
					}}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 384 512"
						width={30}
						height={40}
						aria-hidden="true"
						style={{
							display: 'block',
							fill: 'white',
						}}
					>
						<path d="M214.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 109.3 160 480c0 17.7 14.3 32 32 32s32-14.3 32-32l0-370.7 105.4 105.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z" />
					</svg>
				</div>
			</div>
		</div>
	);
};

export const CodingPrompt: React.FC<CodingPromptProps> = ({
	promptLine1,
	promptLine2,
}) => {
	const frame = useCurrentFrame();
	const shineFrame = Math.max(0, frame - thinkingStartFrame);
	const shineProgress = (shineFrame % shineLoopInFrames) / shineLoopInFrames;

	return (
		<AbsoluteFill className="justify-center items-center">
			<TranslateX px={20}>
				<TranslateY px={5}>
					<Scale factor={1.15}>
						<RotateZ radians={-0.06}>
							<RotateY radians={-0.3}>
								<RotateX radians={-0.35}>
									<ExtrudeDiv
										width={width}
										height={height}
										depth={depth}
										cornerRadius={cornerRadius}
										backFace={
											<AbsoluteFill
												style={{
													borderRadius: cornerRadius,
													backgroundColor: '#141414',
													border: '9px solid #050505',
												}}
											/>
										}
										style={{
											scale: 0.955,
											translate: '-105.3px 39px',
										}}
									>
										<FrontFace
											promptLine1={promptLine1}
											promptLine2={promptLine2}
											shineProgress={shineProgress}
											frame={frame}
										/>
									</ExtrudeDiv>
								</RotateX>
							</RotateY>
						</RotateZ>
					</Scale>
				</TranslateY>
			</TranslateX>
		</AbsoluteFill>
	);
};
