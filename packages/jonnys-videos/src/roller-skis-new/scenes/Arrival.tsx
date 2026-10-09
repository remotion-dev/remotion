import {Audio, Video} from '@remotion/media';
import React from 'react';
import {
	Easing,
	Interactive,
	interpolate,
	Series,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {LocationLowerThird} from '../elements/LocationLowerThird';
import {PoppingWordCaptions} from '../elements/popping-word-captions';

const ArrivalInner: React.FC = () => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();

	return (
		<>
			<Series>
				<Series.Sequence
					name="Low angle"
					trimBefore={75}
					durationInFrames={135}
					premountFor={fps}
				>
					<Video
						name="IMG_0471"
						src={
							'https://remotion.media/jonnys-videos/roller-skis-new/footage/IMG_0471.mp4'
						}
						volume={1}
						premountFor={fps}
						objectFit="cover"
						style={{width: '100%', height: '100%'}}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Remotion headquarters"
					trimBefore={98}
					durationInFrames={124}
					premountFor={fps}
				>
					<Video
						name="IMG_0472"
						src={
							'https://remotion.media/jonnys-videos/roller-skis-new/footage/IMG_0472.mp4'
						}
						volume={1}
						premountFor={fps}
						objectFit="cover"
						style={{
							width: '100%',
							height: '100%',
							scale: interpolate(frame, [193, 202], [1, 1.1], {
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
								text: ' Here',
								startMs: 3500,
								endMs: 3680,
								timestampMs: 3590,
								confidence: null,
							},
							{
								text: ' we',
								startMs: 3680,
								endMs: 3860,
								timestampMs: 3770,
								confidence: null,
							},
							{
								text: ' are',
								startMs: 3860,
								endMs: 4220,
								timestampMs: 4040,
								confidence: null,
							},
							{
								text: ' baby,',
								startMs: 4220,
								endMs: 5060,
								timestampMs: 4640,
								confidence: null,
							},
							{
								text: ' Remotion',
								startMs: 5340,
								endMs: 6760,
								timestampMs: 6050,
								confidence: null,
							},
							{
								text: ' headquarters!',
								startMs: 6760,
								endMs: 7280,
								timestampMs: 7020,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Here we are"
					trimBefore={60}
					durationInFrames={50}
					premountFor={fps}
				>
					<Video
						name="IMG_0474"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0474.MOV'
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
								text: ' Here',
								startMs: 2340,
								endMs: 2580,
								timestampMs: 2460,
								confidence: null,
							},
							{
								text: ' we',
								startMs: 2580,
								endMs: 2940,
								timestampMs: 2760,
								confidence: null,
							},
							{
								text: ' are!',
								startMs: 2940,
								endMs: 3667,
								timestampMs: 3304,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Mehmet is working"
					trimBefore={125}
					durationInFrames={117}
					premountFor={fps}
				>
					<Video
						name="IMG_0474"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0474.MOV'
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
								text: ' Mehmet',
								startMs: 4400,
								endMs: 4700,
								timestampMs: 4550,
								confidence: null,
							},
							{
								text: ' is',
								startMs: 4700,
								endMs: 5060,
								timestampMs: 4880,
								confidence: null,
							},
							{
								text: ' already',
								startMs: 5060,
								endMs: 5580,
								timestampMs: 5320,
								confidence: null,
							},
							{
								text: ' working,',
								startMs: 5580,
								endMs: 6100,
								timestampMs: 5840,
								confidence: null,
							},
							{
								text: ' doing',
								startMs: 6840,
								endMs: 7500,
								timestampMs: 7170,
								confidence: null,
							},
							{
								text: ' business!',
								startMs: 7500,
								endMs: 8040,
								timestampMs: 7770,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
			</Series>
			<LocationLowerThird
				name="Location"
				from={15}
				durationInFrames={244}
				premountFor={fps}
				location="Remotion HQ"
				time="08:52"
				accentColor="#2563eb"
				style={{position: 'absolute', left: 80, top: 70}}
			/>
			<Audio
				name="Whoosh"
				src="https://remotion.media/whoosh.wav"
				from={13}
				volume={0.4}
				premountFor={fps}
			/>
		</>
	);
};

export const Arrival = Interactive.withSchema({
	Component: ArrivalInner,
	componentName: 'Arrival',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});
