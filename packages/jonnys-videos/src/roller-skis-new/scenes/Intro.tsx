import {Audio, Video} from '@remotion/media';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	Series,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveTransformProps,
} from 'remotion';
import {LocationLowerThird} from '../elements/LocationLowerThird';
import {PoppingWordCaptions} from '../elements/popping-word-captions';

const IntroInner: React.FC<InteractiveTransformProps> = ({style}) => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={{backgroundColor: 'black', ...style}}>
			<Series>
				<Series.Sequence
					name="Good morning"
					trimBefore={45}
					durationInFrames={239}
					premountFor={fps}
				>
					<Video
						name="IMG_0455"
						src={
							'https://remotion.media/jonnys-videos/roller-skis-new/footage/IMG_0455.mp4'
						}
						volume={1}
						premountFor={fps}
						objectFit="cover"
						style={{width: '100%', height: '100%'}}
					/>
					<PoppingWordCaptions
						combineTokensWithinMilliseconds={null}
						name="Captions"
						premountFor={fps}
						width={1600}
						style={{position: 'absolute', bottom: 56, translate: '160px 0px'}}
						captions={[
							{
								text: ' Good',
								startMs: 1820,
								endMs: 2200,
								timestampMs: 2010,
								confidence: null,
							},
							{
								text: ' morning',
								startMs: 2200,
								endMs: 2700,
								timestampMs: 2450,
								confidence: null,
							},
							{
								text: ' everyone!',
								startMs: 2700,
								endMs: 3100,
								timestampMs: 2900,
								confidence: null,
							},
							{
								text: ' It',
								startMs: 3160,
								endMs: 3360,
								timestampMs: 3260,
								confidence: null,
							},
							{
								text: ' is',
								startMs: 3360,
								endMs: 3700,
								timestampMs: 3530,
								confidence: null,
							},
							{
								text: ' 8am',
								startMs: 3700,
								endMs: 4280,
								timestampMs: 3990,
								confidence: null,
							},
							{
								text: ' in',
								startMs: 4280,
								endMs: 4740,
								timestampMs: 4510,
								confidence: null,
							},
							{
								text: ' beautiful',
								startMs: 4740,
								endMs: 5080,
								timestampMs: 4910,
								confidence: null,
							},
							{
								text: ' Zurich,',
								startMs: 5080,
								endMs: 5240,
								timestampMs: 5160,
								confidence: null,
							},
							{
								text: ' Switzerland',
								startMs: 5460,
								endMs: 6580,
								timestampMs: 6020,
								confidence: null,
							},
							{
								text: ' and',
								startMs: 6580,
								endMs: 7020,
								timestampMs: 6800,
								confidence: null,
							},
							{
								text: ' I',
								startMs: 7020,
								endMs: 7120,
								timestampMs: 7070,
								confidence: null,
							},
							{
								text: ' am',
								startMs: 7120,
								endMs: 7440,
								timestampMs: 7280,
								confidence: null,
							},
							{
								text: ' now',
								startMs: 7440,
								endMs: 8000,
								timestampMs: 7720,
								confidence: null,
							},
							{
								text: ' commuting',
								startMs: 8000,
								endMs: 8560,
								timestampMs: 8280,
								confidence: null,
							},
							{
								text: ' to',
								startMs: 8560,
								endMs: 8940,
								timestampMs: 8750,
								confidence: null,
							},
							{
								text: ' work.',
								startMs: 8940,
								endMs: 9467,
								timestampMs: 9204,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Roller skis"
					trimBefore={312}
					durationInFrames={290}
					premountFor={fps}
				>
					<Video
						name="IMG_0455"
						src={
							'https://remotion.media/jonnys-videos/roller-skis-new/footage/IMG_0455.mp4'
						}
						volume={1}
						premountFor={fps}
						objectFit="cover"
						style={{
							width: '100%',
							height: '100%',
							scale: interpolate(frame, [471, 481], [1, 1.14], {
								easing: Easing.bezier(0.16, 1, 0.3, 1),
								output: 'perceptual-scale',
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
						}}
					/>
					<PoppingWordCaptions
						combineTokensWithinMilliseconds={null}
						name="Captions"
						premountFor={fps}
						width={1600}
						style={{position: 'absolute', bottom: 56, translate: '160px 0px'}}
						captions={[
							{
								text: ' Not',
								startMs: 10640,
								endMs: 10840,
								timestampMs: 10740,
								confidence: null,
							},
							{
								text: ' with',
								startMs: 10840,
								endMs: 10980,
								timestampMs: 10910,
								confidence: null,
							},
							{
								text: ' the',
								startMs: 10980,
								endMs: 11220,
								timestampMs: 11100,
								confidence: null,
							},
							{
								text: ' car',
								startMs: 11220,
								endMs: 11500,
								timestampMs: 11360,
								confidence: null,
							},
							{
								text: ' like',
								startMs: 11500,
								endMs: 11780,
								timestampMs: 11640,
								confidence: null,
							},
							{
								text: ' all',
								startMs: 11780,
								endMs: 11900,
								timestampMs: 11840,
								confidence: null,
							},
							{
								text: ' the',
								startMs: 11900,
								endMs: 12020,
								timestampMs: 11960,
								confidence: null,
							},
							{
								text: ' other',
								startMs: 12020,
								endMs: 12440,
								timestampMs: 12230,
								confidence: null,
							},
							{
								text: ' people,',
								startMs: 12440,
								endMs: 13100,
								timestampMs: 12770,
								confidence: null,
							},
							{
								text: ' but',
								startMs: 13440,
								endMs: 15120,
								timestampMs: 14280,
								confidence: null,
							},
							{
								text: ' with',
								startMs: 15120,
								endMs: 15460,
								timestampMs: 15290,
								confidence: null,
							},
							{
								text: ' my',
								startMs: 15460,
								endMs: 16020,
								timestampMs: 15740,
								confidence: null,
							},
							{
								text: ' roller',
								startMs: 16020,
								endMs: 16520,
								timestampMs: 16270,
								confidence: null,
							},
							{
								text: ' skis!',
								startMs: 16520,
								endMs: 17840,
								timestampMs: 17180,
								confidence: null,
							},
							{
								text: ' Oh',
								startMs: 18280,
								endMs: 18680,
								timestampMs: 18480,
								confidence: null,
							},
							{
								text: ' yes,',
								startMs: 18680,
								endMs: 18860,
								timestampMs: 18770,
								confidence: null,
							},
							{
								text: " let's",
								startMs: 19060,
								endMs: 19400,
								timestampMs: 19230,
								confidence: null,
							},
							{
								text: ' get',
								startMs: 19400,
								endMs: 19740,
								timestampMs: 19570,
								confidence: null,
							},
							{
								text: ' it!',
								startMs: 19740,
								endMs: 20000,
								timestampMs: 19870,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
			</Series>
			<LocationLowerThird
				name="Location"
				from={81}
				durationInFrames={110}
				premountFor={fps}
				location="Zürich, Switzerland"
				time="08:07"
				accentColor="#2563eb"
				style={{position: 'absolute', left: 80, top: 70}}
			/>
			<Audio
				name="Whoosh"
				src="https://remotion.media/whoosh.wav"
				from={521}
				volume={0.6}
				premountFor={fps}
			/>
		</AbsoluteFill>
	);
};

export const Intro = Interactive.withSchema({
	Component: IntroInner,
	componentName: '<Intro>',
	schema: {},
	wrapInSequence: true,
});
