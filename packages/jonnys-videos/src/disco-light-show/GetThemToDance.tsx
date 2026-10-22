import {dropShadow} from '@remotion/effects/drop-shadow';
import {Video} from '@remotion/media';
import React from 'react';
import {
	CanvasImage,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {asset} from './assets';
import {PaperBox} from './PaperBox';

const GetThemToDanceInner: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<PaperBox
				name="Green 'Sing!' visuals paper frame"
				width={1000}
				height={460}
				visualScale={1}
				seed={11}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[0, 6],
						['56px 1920px', '56px 1140px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
						},
					),
					transformOrigin: '50% 50%',
					rotate: '-2.5deg',
					scale: interpolate(frame, [46, 53], [1, 0.6], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.inOut(Easing.cubic),
						output: 'perceptual-scale',
					}),
				}}
			>
				<Video
					name="Green 'Sing!' visuals (lights-05)"
					src={asset('party-suggestions-lights-05-57a7432e2860.mp4')}
					muted
					style={{
						width: 1000,
						height: 562,
						translate: '0px -51px',
						transformOrigin: '45% 38%',
						scale: 1.6,
					}}
				/>
			</PaperBox>
			<PaperBox
				name="Green strobe paper frame"
				width={1000}
				height={460}
				visualScale={1}
				seed={12}
				style={{
					position: 'absolute',
					translate: interpolate(frame, [4, 10], ['24px -560px', '24px 60px'], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.inOut(Easing.cubic),
					}),
					transformOrigin: '50% 50%',
					rotate: '-3.5deg',
					scale: interpolate(frame, [46, 53], [1, 0.6], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.inOut(Easing.cubic),
						output: 'perceptual-scale',
					}),
				}}
			>
				<Video
					name="Green strobe"
					src="https://remotion.media/jonnys-videos/disco-light-show/selects/green-strobe-a4a0a9ab771c.mp4"
					muted
					style={{width: 1150, height: 2044, translate: '-40px -1000px'}}
				/>
			</PaperBox>
			<PaperBox
				name="Three-person dance paper frame"
				width={1000}
				height={389}
				visualScale={1}
				seed={7}
				style={{
					position: 'absolute',
					translate: '40px 620px',
					transformOrigin: '50% 50%',
					rotate: '2deg',
					scale: interpolate(frame, [46, 53], [1, 1.3], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.inOut(Easing.cubic),
						output: 'perceptual-scale',
					}),
				}}
			>
				<Video
					name="Three-person dance footage"
					src="https://remotion.media/jonnys-videos/disco-light-show/selects/three-person-choreography-5s-568702c0016b.mp4"
					muted
					style={{
						width: 1000,
						height: 389,
					}}
				/>
			</PaperBox>
			<CanvasImage
				name="BIC pen pointing at the dancers"
				src={asset('bic-pen-cutout-9256cd944753.png')}
				from={44}
				durationInFrames={41}
				width={1208}
				height={760}
				style={{
					position: 'absolute',
					transformOrigin: '50% 0%',
					translate: interpolate(
						frame,
						[46, 53],
						['592.9px 1385.2px', '218.5px 1001.8px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							outputType: 'translate',
							easing: Easing.inOut(Easing.cubic),
						},
					),
					rotate: '330.6deg',
					scale: 2.185,
				}}
				effects={[
					dropShadow({
						color: '#000000',
						radius: 16,
						offsetX: 12,
						offsetY: 18,
						opacity: 0.7,
					}),
				]}
			/>
		</>
	);
};

export const GetThemToDance = Interactive.create({
	Component: GetThemToDanceInner,
	layout: 'absolute-fill',
});
