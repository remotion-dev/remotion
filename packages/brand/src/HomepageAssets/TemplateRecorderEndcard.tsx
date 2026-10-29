import {loadFont} from '@remotion/fonts';
import React from 'react';
import {
	AbsoluteFill,
	Composition,
	Img,
	Interactive,
	interpolate,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {ExtrudeDiv} from '../3DContext/Div3D';
import {SelectionOutline} from './SelectionOutline';

const cardWidth = 880;
const cardHeight = 1320;
const cornerRadius = 52;
const canvasWidth = 1080;
const canvasHeight = 1620;
const outlineHorizontalGap = 36;
const outlineVerticalGap = 60;
const outlineHandleSizeDefault = 40;
const defaultOutlineStrokeWidth = 6;
const outlineWidth = cardWidth + outlineHorizontalGap * 2;
const outlineHeight = cardHeight + outlineVerticalGap * 2;
const outlineLeft = (canvasWidth - cardWidth) / 2 - outlineHorizontalGap;
const outlineVerticalNudge = 30;
const outlineTop =
	(canvasHeight - cardHeight) / 2 - outlineVerticalGap + outlineVerticalNudge;
const fontFamily = 'GT Planar';
const followButtonHeight = 140;
const spaceBetweenImgAndText = 30;
const slideDelay = 35;
const slideDuration = 30;
const iconFill = 'black';

loadFont({
	family: fontFamily,
	url: staticFile('GT Planar/GT-Planar-Medium.woff2'),
	weight: '500',
});

const iconPaths = {
	instagram: {
		height: 70,
		viewBox: '0 0 448 512',
		path: 'M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z',
	},
	linkedin: {
		height: 60,
		viewBox: '0 0 448 512',
		path: 'M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z',
	},
	youtube: {
		height: 60,
		viewBox: '0 0 576 512',
		path: 'M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z',
	},
} as const;

type IconType = keyof typeof iconPaths;

const remotionSocialRows: readonly {type: IconType; label: string}[] = [
	{type: 'instagram', label: '@remotion'},
	{type: 'linkedin', label: 'Remotion'},
	{type: 'youtube', label: '@remotion_dev'},
];

const Icon: React.FC<{
	readonly type: IconType;
}> = ({type}) => {
	const icon = iconPaths[type];

	return (
		<svg height={icon.height} viewBox={icon.viewBox}>
			<path fill={iconFill} d={icon.path} />
		</svg>
	);
};

const IconRow: React.FC<{
	readonly label: string;
	readonly opacity: number;
	readonly type: IconType;
}> = ({label, opacity, type}) => {
	return (
		<div
			style={{
				alignItems: 'center',
				display: 'flex',
				flexDirection: 'row',
				opacity,
				paddingBottom: 20,
				paddingTop: 20,
			}}
		>
			<div
				style={{
					alignItems: 'center',
					display: 'flex',
					height: 60,
					justifyContent: 'center',
					width: followButtonHeight,
				}}
			>
				<Icon type={type} />
			</div>
			<div style={{width: spaceBetweenImgAndText}} />
			<div
				style={{
					color: 'black',
					fontFamily,
					fontSize: 50,
					fontWeight: 500,
					marginLeft: 20,
					whiteSpace: 'nowrap',
				}}
			>
				{label}
			</div>
		</div>
	);
};

const TemplateRecorderEndcardFace: React.FC<{
	readonly frame?: number;
}> = ({frame: frameOverride}) => {
	const currentFrame = useCurrentFrame();
	const frame = frameOverride ?? currentFrame;
	const {fps, width} = useVideoConfig();
	const totalLinks = remotionSocialRows.length;
	const slideUp = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
		delay: slideDelay,
		durationInFrames: slideDuration,
	});

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#fafafa',
			}}
		>
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					left: 80,
					maxWidth: Math.min(width - 160, 1000),
				}}
			>
				<div
					style={{
						transform: `translateY(${interpolate(slideUp, [0, 1], [330, 0])}px)`,
					}}
				>
					<div
						style={{
							alignItems: 'center',
							display: 'flex',
						}}
					>
						<Img
							src={staticFile('remotion.png')}
							style={{
								borderRadius: '50%',
								boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.2)',
								height: followButtonHeight,
								width: followButtonHeight,
							}}
						/>
						<div style={{width: spaceBetweenImgAndText}} />
						<div
							style={{
								alignItems: 'center',
								backgroundColor: 'black',
								borderRadius: followButtonHeight / 2,
								color: 'white',
								display: 'flex',
								fontFamily,
								fontSize: 50,
								fontWeight: 500,
								height: followButtonHeight,
								justifyContent: 'center',
								width: 400,
							}}
						>
							Follow
						</div>
					</div>
				</div>
				{/* Keep the social rows above the overlapping composition selector. */}
				<div style={{paddingBottom: 180}}>
					<div style={{height: 80}} />
					{remotionSocialRows.map((row, index) => {
						const indexFromLast = totalLinks - index;
						const opacity = spring({
							fps,
							frame,
							config: {
								damping: 200,
							},
							delay:
								slideDelay +
								((indexFromLast - 1) / totalLinks) * (slideDuration - 15),
							durationInFrames: 15,
						});

						return (
							<IconRow
								key={row.type}
								label={row.label}
								opacity={opacity}
								type={row.type}
							/>
						);
					})}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const TemplateRecorderEndcard: React.FC<{
	readonly frame?: number;
	readonly scale: number | null;
	readonly outlineStrokeWidth: number | null;
	readonly outlineHandleSize: number | null;
}> = ({frame, scale, outlineStrokeWidth, outlineHandleSize}) => {
	const selectionScale = scale ?? 1;
	return (
		<AbsoluteFill className="justify-center items-center">
			<AbsoluteFill
				className="justify-center items-center"
				style={{scale: scale ?? 1}}
			>
				<ExtrudeDiv
					width={cardWidth}
					height={cardHeight}
					depth={54}
					cornerRadius={cornerRadius}
					translationX={-20}
					translationY={8}
					translationZ={4}
					rotationX={0.09}
					rotationY={-0.34}
					rotationZ={-0.04}
					backFace={
						<Interactive.Div
							style={{
								backgroundColor: '#d8d8d8',
								borderRadius: cornerRadius,
								height: '100%',
								width: '100%',
							}}
						/>
					}
				>
					<Interactive.Div
						style={{
							backgroundColor: '#fafafa',
							borderRadius: cornerRadius,
							border: '5px solid black',
							height: cardHeight,
							overflow: 'hidden',
							position: 'relative',
							width: cardWidth,
						}}
					>
						<Interactive.Div
							style={{
								height: 1080,
								left: 0,
								position: 'absolute',
								top: (cardHeight - 1080) / 2,
								width: 1080,
								translate: '-36.3px 0px',
							}}
						>
							<TemplateRecorderEndcardFace frame={frame} />
						</Interactive.Div>
					</Interactive.Div>
				</ExtrudeDiv>
			</AbsoluteFill>
			<SelectionOutline
				canvasSize={{width: canvasWidth, height: canvasHeight}}
				bounds={{
					left:
						canvasWidth / 2 + (outlineLeft - canvasWidth / 2) * selectionScale,
					top:
						canvasHeight / 2 + (outlineTop - canvasHeight / 2) * selectionScale,
					width: outlineWidth * selectionScale,
					height: outlineHeight * selectionScale,
				}}
				handleSize={
					outlineHandleSize ?? outlineHandleSizeDefault * selectionScale
				}
				strokeWidth={outlineStrokeWidth ?? defaultOutlineStrokeWidth}
			/>
		</AbsoluteFill>
	);
};

export const TemplateRecorderEndcardComposition: React.FC = () => {
	return (
		<Composition
			id="TemplateRecorderEndcard"
			component={TemplateRecorderEndcard}
			defaultProps={{
				scale: null,
				outlineStrokeWidth: null,
				outlineHandleSize: null,
			}}
			durationInFrames={200}
			fps={30}
			width={canvasWidth}
			height={canvasHeight}
		/>
	);
};
