import {Audio, Video} from '@remotion/media';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	Series,
	Track,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveTransformProps,
} from 'remotion';
import {AwardBadge} from '../elements/AwardBadge';
import {PoppingWordCaptions} from '../elements/popping-word-captions';

const BestCommuteInner: React.FC<InteractiveTransformProps> = ({style}) => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={{backgroundColor: 'black', ...style}}>
			<Series>
				<Series.Sequence
					name="Tech bros"
					trimBefore={47}
					durationInFrames={87}
					premountFor={fps}
				>
					<Video
						name="IMG_0463"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0463.MOV'
						}
						volume={0.83}
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
								text: ' Guys,',
								startMs: 1880,
								endMs: 1960,
								timestampMs: 1920,
								confidence: null,
							},
							{
								text: ' out',
								startMs: 2240,
								endMs: 2380,
								timestampMs: 2310,
								confidence: null,
							},
							{
								text: ' of',
								startMs: 2380,
								endMs: 2780,
								timestampMs: 2580,
								confidence: null,
							},
							{
								text: ' all',
								startMs: 2780,
								endMs: 2960,
								timestampMs: 2870,
								confidence: null,
							},
							{
								text: ' of',
								startMs: 2960,
								endMs: 3120,
								timestampMs: 3040,
								confidence: null,
							},
							{
								text: ' the',
								startMs: 3120,
								endMs: 3300,
								timestampMs: 3210,
								confidence: null,
							},
							{
								text: ' tech',
								startMs: 3300,
								endMs: 3600,
								timestampMs: 3450,
								confidence: null,
							},
							{
								text: ' bros',
								startMs: 3600,
								endMs: 3920,
								timestampMs: 3760,
								confidence: null,
							},
							{
								text: ' out',
								startMs: 3920,
								endMs: 4360,
								timestampMs: 4140,
								confidence: null,
							},
							{
								text: ' there,',
								startMs: 4100,
								endMs: 4420,
								timestampMs: 4260,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Best commute"
					trimBefore={170}
					durationInFrames={112}
					premountFor={fps}
				>
					<Video
						name="IMG_0463"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0463.MOV'
						}
						volume={0.83}
						premountFor={fps}
						objectFit="cover"
						style={{width: '100%', height: '100%'}}
					/>
					<Video
						name="Sunrise"
						src={
							'https://remotion.media/jonnys-videos/roller-skis-new/footage/IMG_0462.mp4'
						}
						from={170}
						trimBefore={9}
						muted
						premountFor={fps}
						objectFit="cover"
						style={{position: 'absolute', width: '100%', height: '100%'}}
					/>
					<PoppingWordCaptions
						combineTokensWithinMilliseconds={null}
						name="Captions"
						premountFor={fps}
						width={1600}
						style={{position: 'absolute', bottom: 56, translate: '160px 0px'}}
						captions={[
							{
								text: ' I',
								startMs: 5880,
								endMs: 6160,
								timestampMs: 6020,
								confidence: null,
							},
							{
								text: ' do',
								startMs: 6160,
								endMs: 6820,
								timestampMs: 6490,
								confidence: null,
							},
							{
								text: ' probably',
								startMs: 6820,
								endMs: 8160,
								timestampMs: 7490,
								confidence: null,
							},
							{
								text: ' have',
								startMs: 8160,
								endMs: 8360,
								timestampMs: 8260,
								confidence: null,
							},
							{
								text: ' the',
								startMs: 8360,
								endMs: 8580,
								timestampMs: 8470,
								confidence: null,
							},
							{
								text: ' best',
								startMs: 8580,
								endMs: 8940,
								timestampMs: 8760,
								confidence: null,
							},
							{
								text: ' commute,',
								startMs: 8940,
								endMs: 9200,
								timestampMs: 9070,
								confidence: null,
							},
							{
								text: ' right?',
								startMs: 9200,
								endMs: 9400,
								timestampMs: 9300,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Chickens cows mountains"
					trimBefore={302}
					durationInFrames={154}
					premountFor={fps}
				>
					<Video
						name="IMG_0463"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0463.MOV'
						}
						volume={0.83}
						premountFor={fps}
						objectFit="cover"
						style={{width: '100%', height: '100%'}}
					/>
					<Track name="Chickens, cows, mountains">
						<Video
							name="Chickens"
							src={
								'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0463.MOV'
							}
							from={347}
							durationInFrames={38}
							trimBefore={219}
							muted
							premountFor={fps}
							objectFit="cover"
							style={{position: 'absolute', width: '100%', height: '100%'}}
						/>
						<Video
							name="Cows"
							src={
								'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0459.MOV'
							}
							from={384}
							durationInFrames={30}
							trimBefore={1794}
							muted
							premountFor={fps}
							objectFit="cover"
							style={{position: 'absolute', width: '100%', height: '100%'}}
						/>
						<Video
							name="Mountains"
							src={
								'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0461.MOV'
							}
							from={414}
							trimBefore={6}
							muted
							premountFor={fps}
							objectFit="cover"
							style={{position: 'absolute', width: '100%', height: '100%'}}
						/>
					</Track>
					<PoppingWordCaptions
						combineTokensWithinMilliseconds={null}
						name="Captions"
						premountFor={fps}
						width={1600}
						style={{position: 'absolute', bottom: 56, translate: '160px 0px'}}
						captions={[
							{
								text: ' Come',
								startMs: 10300,
								endMs: 10700,
								timestampMs: 10500,
								confidence: null,
							},
							{
								text: ' on!',
								startMs: 10700,
								endMs: 11280,
								timestampMs: 10990,
								confidence: null,
							},
							{
								text: ' Chickens,',
								startMs: 11600,
								endMs: 12740,
								timestampMs: 12170,
								confidence: null,
							},
							{
								text: ' cows,',
								startMs: 12920,
								endMs: 13480,
								timestampMs: 13200,
								confidence: null,
							},
							{
								text: ' mountains!',
								startMs: 13960,
								endMs: 15000,
								timestampMs: 14480,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Roller skis"
					trimBefore={456}
					durationInFrames={65}
					premountFor={fps}
				>
					<Video
						name="IMG_0463"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0463.MOV'
						}
						volume={0.83}
						premountFor={fps}
						objectFit="cover"
						style={{width: '100%', height: '100%'}}
					/>
					<Video
						name="Skis"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0459.MOV'
						}
						from={456}
						trimBefore={609}
						muted
						premountFor={fps}
						objectFit="cover"
						style={{position: 'absolute', width: '100%', height: '100%'}}
					/>
					<PoppingWordCaptions
						combineTokensWithinMilliseconds={null}
						name="Captions"
						premountFor={fps}
						width={1600}
						style={{position: 'absolute', bottom: 56, translate: '160px 0px'}}
						captions={[
							{
								text: ' What',
								startMs: 15260,
								endMs: 15480,
								timestampMs: 15370,
								confidence: null,
							},
							{
								text: ' more',
								startMs: 15480,
								endMs: 15700,
								timestampMs: 15590,
								confidence: null,
							},
							{
								text: ' could',
								startMs: 15700,
								endMs: 15800,
								timestampMs: 15750,
								confidence: null,
							},
							{
								text: ' you',
								startMs: 15800,
								endMs: 16160,
								timestampMs: 15980,
								confidence: null,
							},
							{
								text: ' want?',
								startMs: 16160,
								endMs: 16280,
								timestampMs: 16220,
								confidence: null,
							},
							{
								text: ' Roller',
								startMs: 16740,
								endMs: 17080,
								timestampMs: 16910,
								confidence: null,
							},
							{
								text: ' skis?',
								startMs: 17080,
								endMs: 17367,
								timestampMs: 17224,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Best commute goes to Jonny"
					trimBefore={534}
					durationInFrames={94}
					premountFor={fps}
				>
					<Video
						name="IMG_0463"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0463.MOV'
						}
						volume={0.83}
						premountFor={fps}
						objectFit="cover"
						style={{
							width: '100%',
							height: '100%',
							rotate: '180deg',
							scale: interpolate(frame, [442, 451], [1, 1.1], {
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
								text: ' Come',
								startMs: 18100,
								endMs: 18360,
								timestampMs: 18230,
								confidence: null,
							},
							{
								text: ' on,',
								startMs: 18360,
								endMs: 18640,
								timestampMs: 18500,
								confidence: null,
							},
							{
								text: ' best',
								startMs: 18780,
								endMs: 19140,
								timestampMs: 18960,
								confidence: null,
							},
							{
								text: ' commute',
								startMs: 19140,
								endMs: 19940,
								timestampMs: 19540,
								confidence: null,
							},
							{
								text: ' goes',
								startMs: 19940,
								endMs: 20160,
								timestampMs: 20050,
								confidence: null,
							},
							{
								text: ' to',
								startMs: 20160,
								endMs: 20300,
								timestampMs: 20230,
								confidence: null,
							},
							{
								text: ' Jonny,',
								startMs: 20300,
								endMs: 20500,
								timestampMs: 20400,
								confidence: null,
							},
							{
								text: ' alright?',
								startMs: 20740,
								endMs: 20840,
								timestampMs: 20790,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
			</Series>
			<AwardBadge
				name="Award"
				from={445}
				durationInFrames={67}
				premountFor={fps}
				award="Best commute"
				winner="Jonny"
				style={{position: 'absolute', right: 80, top: 70}}
			/>
			<Audio
				name="Whoosh"
				src="https://remotion.media/whoosh.wav"
				from={445}
				volume={0.5}
				premountFor={fps}
			/>
		</AbsoluteFill>
	);
};

export const BestCommute = Interactive.withSchema({
	Component: BestCommuteInner,
	componentName: '<BestCommute>',
	schema: {},
	wrapInSequence: true,
});
