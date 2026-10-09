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
import {Callout} from '../elements/Callout';
import {PoppingWordCaptions} from '../elements/popping-word-captions';

const TheDeclineInner: React.FC<InteractiveTransformProps> = ({style}) => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={{backgroundColor: 'black', ...style}}>
			<Series>
				<Series.Sequence
					name="Standing on top"
					trimBefore={30}
					durationInFrames={68}
					premountFor={fps}
				>
					<Video
						name="IMG_0464"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0464.MOV'
						}
						volume={0.87}
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
								text: ' Okay,',
								startMs: 1220,
								endMs: 1340,
								timestampMs: 1280,
								confidence: null,
							},
							{
								text: " I'm",
								startMs: 1340,
								endMs: 1740,
								timestampMs: 1540,
								confidence: null,
							},
							{
								text: ' standing',
								startMs: 1740,
								endMs: 1940,
								timestampMs: 1840,
								confidence: null,
							},
							{
								text: ' on',
								startMs: 1940,
								endMs: 2400,
								timestampMs: 2170,
								confidence: null,
							},
							{
								text: ' top',
								startMs: 2400,
								endMs: 2800,
								timestampMs: 2600,
								confidence: null,
							},
							{
								text: ' of',
								startMs: 2800,
								endMs: 3180,
								timestampMs: 2990,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Small decline"
					trimBefore={113}
					durationInFrames={83}
					premountFor={fps}
				>
					<Video
						name="IMG_0464"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0464.MOV'
						}
						volume={0.87}
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
								text: ' a',
								startMs: 3767,
								endMs: 4060,
								timestampMs: 3914,
								confidence: null,
							},
							{
								text: ' small',
								startMs: 4060,
								endMs: 4620,
								timestampMs: 4340,
								confidence: null,
							},
							{
								text: ' decline',
								startMs: 4620,
								endMs: 4980,
								timestampMs: 4800,
								confidence: null,
							},
							{
								text: ' and',
								startMs: 4980,
								endMs: 5120,
								timestampMs: 5050,
								confidence: null,
							},
							{
								text: ' it',
								startMs: 5120,
								endMs: 5360,
								timestampMs: 5240,
								confidence: null,
							},
							{
								text: ' goes',
								startMs: 5360,
								endMs: 5680,
								timestampMs: 5520,
								confidence: null,
							},
							{
								text: ' right',
								startMs: 5680,
								endMs: 5940,
								timestampMs: 5810,
								confidence: null,
							},
							{
								text: ' onto',
								startMs: 5940,
								endMs: 6100,
								timestampMs: 6020,
								confidence: null,
							},
							{
								text: ' the',
								startMs: 5980,
								endMs: 6100,
								timestampMs: 6040,
								confidence: null,
							},
							{
								text: ' street.',
								startMs: 6100,
								endMs: 6500,
								timestampMs: 6300,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Problems with roller skis"
					trimBefore={257}
					durationInFrames={93}
					premountFor={fps}
				>
					<Video
						name="IMG_0464"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0464.MOV'
						}
						volume={0.87}
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
								text: ' here',
								startMs: 8720,
								endMs: 9020,
								timestampMs: 8870,
								confidence: null,
							},
							{
								text: ' comes',
								startMs: 9020,
								endMs: 9320,
								timestampMs: 9170,
								confidence: null,
							},
							{
								text: ' one',
								startMs: 9320,
								endMs: 9520,
								timestampMs: 9420,
								confidence: null,
							},
							{
								text: ' of',
								startMs: 9520,
								endMs: 9660,
								timestampMs: 9590,
								confidence: null,
							},
							{
								text: ' the',
								startMs: 9660,
								endMs: 10160,
								timestampMs: 9910,
								confidence: null,
							},
							{
								text: ' problems',
								startMs: 10160,
								endMs: 10540,
								timestampMs: 10350,
								confidence: null,
							},
							{
								text: ' with',
								startMs: 10540,
								endMs: 10940,
								timestampMs: 10740,
								confidence: null,
							},
							{
								text: ' roller',
								startMs: 10940,
								endMs: 11240,
								timestampMs: 11090,
								confidence: null,
							},
							{
								text: ' skis.',
								startMs: 11240,
								endMs: 11640,
								timestampMs: 11440,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Freeze"
					durationInFrames={39}
					freeze={349}
					premountFor={fps}
				>
					<Video
						name="IMG_0464"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0464.MOV'
						}
						muted
						premountFor={fps}
						objectFit="cover"
						style={{
							width: '100%',
							height: '100%',
							filter: 'saturate(0.35) contrast(1.15)',
							scale: interpolate(frame, [244, 283], [1, 1.12], {
								easing: Easing.bezier(0.16, 1, 0.3, 1),
								output: 'perceptual-scale',
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
						}}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Stopped filming"
					trimBefore={22}
					durationInFrames={113}
					premountFor={fps}
				>
					<Video
						name="IMG_0465"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0465.MOV'
						}
						volume={0.85}
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
								text: ' Okay,',
								startMs: 940,
								endMs: 1100,
								timestampMs: 1020,
								confidence: null,
							},
							{
								text: ' I',
								startMs: 1100,
								endMs: 1360,
								timestampMs: 1230,
								confidence: null,
							},
							{
								text: ' stopped',
								startMs: 1360,
								endMs: 1900,
								timestampMs: 1630,
								confidence: null,
							},
							{
								text: ' filming',
								startMs: 1900,
								endMs: 2320,
								timestampMs: 2110,
								confidence: null,
							},
							{
								text: ' right',
								startMs: 2320,
								endMs: 2620,
								timestampMs: 2470,
								confidence: null,
							},
							{
								text: ' there',
								startMs: 2620,
								endMs: 2980,
								timestampMs: 2800,
								confidence: null,
							},
							{
								text: ' because',
								startMs: 2980,
								endMs: 3400,
								timestampMs: 3190,
								confidence: null,
							},
							{
								text: ' a',
								startMs: 3400,
								endMs: 3460,
								timestampMs: 3430,
								confidence: null,
							},
							{
								text: ' group',
								startMs: 3460,
								endMs: 3800,
								timestampMs: 3630,
								confidence: null,
							},
							{
								text: ' of',
								startMs: 3800,
								endMs: 3960,
								timestampMs: 3880,
								confidence: null,
							},
							{
								text: ' kindergarten',
								startMs: 3960,
								endMs: 4470,
								timestampMs: 4215,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Kindergarten kids"
					trimBefore={151}
					durationInFrames={51}
					premountFor={fps}
				>
					<Video
						name="IMG_0465"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0465.MOV'
						}
						volume={0.85}
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
								text: ' kids',
								startMs: 5040,
								endMs: 5400,
								timestampMs: 5220,
								confidence: null,
							},
							{
								text: ' was',
								startMs: 5400,
								endMs: 5700,
								timestampMs: 5550,
								confidence: null,
							},
							{
								text: ' coming',
								startMs: 5700,
								endMs: 6300,
								timestampMs: 6000,
								confidence: null,
							},
							{
								text: ' towards',
								startMs: 6300,
								endMs: 6580,
								timestampMs: 6440,
								confidence: null,
							},
							{
								text: ' me',
								startMs: 6580,
								endMs: 6733,
								timestampMs: 6657,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Did not want to"
					trimBefore={221}
					durationInFrames={23}
					premountFor={fps}
				>
					<Video
						name="IMG_0465"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0465.MOV'
						}
						volume={0.85}
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
								text: ' I',
								startMs: 7380,
								endMs: 7580,
								timestampMs: 7480,
								confidence: null,
							},
							{
								text: " didn't",
								startMs: 7580,
								endMs: 7780,
								timestampMs: 7680,
								confidence: null,
							},
							{
								text: ' want',
								startMs: 7780,
								endMs: 8080,
								timestampMs: 7930,
								confidence: null,
							},
							{
								text: ' to',
								startMs: 7950,
								endMs: 8120,
								timestampMs: 8035,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Film with them around"
					trimBefore={261}
					durationInFrames={115}
					premountFor={fps}
				>
					<Video
						name="IMG_0465"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0465.MOV'
						}
						volume={0.85}
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
								text: ' film',
								startMs: 8920,
								endMs: 9200,
								timestampMs: 9060,
								confidence: null,
							},
							{
								text: ' with',
								startMs: 9200,
								endMs: 9420,
								timestampMs: 9310,
								confidence: null,
							},
							{
								text: ' them',
								startMs: 9420,
								endMs: 9600,
								timestampMs: 9510,
								confidence: null,
							},
							{
								text: ' being',
								startMs: 9600,
								endMs: 10000,
								timestampMs: 9800,
								confidence: null,
							},
							{
								text: ' around',
								startMs: 10000,
								endMs: 10260,
								timestampMs: 10130,
								confidence: null,
							},
							{
								text: ' and',
								startMs: 10260,
								endMs: 10320,
								timestampMs: 10290,
								confidence: null,
							},
							{
								text: ' talking',
								startMs: 10600,
								endMs: 10780,
								timestampMs: 10690,
								confidence: null,
							},
							{
								text: ' to',
								startMs: 10780,
								endMs: 10880,
								timestampMs: 10830,
								confidence: null,
							},
							{
								text: ' a',
								startMs: 10880,
								endMs: 11200,
								timestampMs: 11040,
								confidence: null,
							},
							{
								text: ' camera',
								startMs: 11200,
								endMs: 11400,
								timestampMs: 11300,
								confidence: null,
							},
							{
								text: ' while',
								startMs: 11400,
								endMs: 11640,
								timestampMs: 11520,
								confidence: null,
							},
							{
								text: ' being',
								startMs: 11640,
								endMs: 11840,
								timestampMs: 11740,
								confidence: null,
							},
							{
								text: ' on',
								startMs: 11840,
								endMs: 12120,
								timestampMs: 11980,
								confidence: null,
							},
							{
								text: ' roller',
								startMs: 12120,
								endMs: 12380,
								timestampMs: 12250,
								confidence: null,
							},
							{
								text: ' skis',
								startMs: 12300,
								endMs: 12500,
								timestampMs: 12400,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="And falling"
					trimBefore={392}
					durationInFrames={34}
					premountFor={fps}
				>
					<Video
						name="IMG_0465"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0465.MOV'
						}
						volume={0.85}
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
								text: ' and',
								startMs: 13280,
								endMs: 13640,
								timestampMs: 13460,
								confidence: null,
							},
							{
								text: ' falling',
								startMs: 13640,
								endMs: 14140,
								timestampMs: 13890,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Down this decline"
					trimBefore={446}
					durationInFrames={63}
					premountFor={fps}
				>
					<Video
						name="IMG_0465"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0465.MOV'
						}
						volume={0.85}
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
								text: ' down',
								startMs: 14867,
								endMs: 16080,
								timestampMs: 15474,
								confidence: null,
							},
							{
								text: ' this',
								startMs: 16080,
								endMs: 16540,
								timestampMs: 16310,
								confidence: null,
							},
							{
								text: ' decline.',
								startMs: 16540,
								endMs: 16967,
								timestampMs: 16754,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="How it went"
					trimBefore={548}
					durationInFrames={372}
					premountFor={fps}
				>
					<Video
						name="IMG_0465"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0465.MOV'
						}
						volume={0.85}
						premountFor={fps}
						objectFit="cover"
						style={{
							width: '100%',
							height: '100%',
							scale: interpolate(
								frame,
								[926, 933, 953, 1052],
								[1, 1.12, 1.12, 1.22],
								{
									easing: Easing.bezier(0.16, 1, 0.3, 1),
									output: 'perceptual-scale',
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								},
							),
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
								text: ' So',
								startMs: 18400,
								endMs: 18500,
								timestampMs: 18450,
								confidence: null,
							},
							{
								text: ' let',
								startMs: 18500,
								endMs: 18600,
								timestampMs: 18550,
								confidence: null,
							},
							{
								text: ' me',
								startMs: 18600,
								endMs: 18740,
								timestampMs: 18670,
								confidence: null,
							},
							{
								text: ' tell',
								startMs: 18740,
								endMs: 18820,
								timestampMs: 18780,
								confidence: null,
							},
							{
								text: ' you',
								startMs: 18820,
								endMs: 18960,
								timestampMs: 18890,
								confidence: null,
							},
							{
								text: ' how',
								startMs: 18960,
								endMs: 19080,
								timestampMs: 19020,
								confidence: null,
							},
							{
								text: ' it',
								startMs: 19080,
								endMs: 19200,
								timestampMs: 19140,
								confidence: null,
							},
							{
								text: ' went.',
								startMs: 19200,
								endMs: 19400,
								timestampMs: 19300,
								confidence: null,
							},
							{
								text: ' I',
								startMs: 19500,
								endMs: 19900,
								timestampMs: 19700,
								confidence: null,
							},
							{
								text: ' only',
								startMs: 19900,
								endMs: 20500,
								timestampMs: 20200,
								confidence: null,
							},
							{
								text: ' almost',
								startMs: 20500,
								endMs: 21020,
								timestampMs: 20760,
								confidence: null,
							},
							{
								text: ' fell',
								startMs: 21020,
								endMs: 21240,
								timestampMs: 21130,
								confidence: null,
							},
							{
								text: ' on',
								startMs: 21240,
								endMs: 21420,
								timestampMs: 21330,
								confidence: null,
							},
							{
								text: ' my',
								startMs: 21420,
								endMs: 21780,
								timestampMs: 21600,
								confidence: null,
							},
							{
								text: ' ass',
								startMs: 21780,
								endMs: 22800,
								timestampMs: 22290,
								confidence: null,
							},
							{
								text: ' but',
								startMs: 22800,
								endMs: 23100,
								timestampMs: 22950,
								confidence: null,
							},
							{
								text: ' I',
								startMs: 23100,
								endMs: 23480,
								timestampMs: 23290,
								confidence: null,
							},
							{
								text: ' managed',
								startMs: 23480,
								endMs: 23680,
								timestampMs: 23580,
								confidence: null,
							},
							{
								text: ' to',
								startMs: 23700,
								endMs: 23980,
								timestampMs: 23840,
								confidence: null,
							},
							{
								text: ' rescue',
								startMs: 24000,
								endMs: 24600,
								timestampMs: 24300,
								confidence: null,
							},
							{
								text: ' myself',
								startMs: 24600,
								endMs: 25460,
								timestampMs: 25030,
								confidence: null,
							},
							{
								text: ' in',
								startMs: 25460,
								endMs: 25560,
								timestampMs: 25510,
								confidence: null,
							},
							{
								text: ' the',
								startMs: 25560,
								endMs: 25740,
								timestampMs: 25650,
								confidence: null,
							},
							{
								text: ' last',
								startMs: 25740,
								endMs: 26060,
								timestampMs: 25900,
								confidence: null,
							},
							{
								text: ' second.',
								startMs: 26060,
								endMs: 26340,
								timestampMs: 26200,
								confidence: null,
							},
							{
								text: " Let's",
								startMs: 26500,
								endMs: 26780,
								timestampMs: 26640,
								confidence: null,
							},
							{
								text: ' go.',
								startMs: 26780,
								endMs: 27160,
								timestampMs: 26970,
								confidence: null,
							},
							{
								text: ' Because',
								startMs: 27460,
								endMs: 27660,
								timestampMs: 27560,
								confidence: null,
							},
							{
								text: ' last',
								startMs: 27660,
								endMs: 28000,
								timestampMs: 27830,
								confidence: null,
							},
							{
								text: ' time',
								startMs: 28000,
								endMs: 29220,
								timestampMs: 28610,
								confidence: null,
							},
							{
								text: ' it',
								startMs: 29220,
								endMs: 29480,
								timestampMs: 29350,
								confidence: null,
							},
							{
								text: ' went',
								startMs: 29480,
								endMs: 29760,
								timestampMs: 29620,
								confidence: null,
							},
							{
								text: ' way',
								startMs: 29760,
								endMs: 29960,
								timestampMs: 29860,
								confidence: null,
							},
							{
								text: ' more',
								startMs: 29960,
								endMs: 30300,
								timestampMs: 30130,
								confidence: null,
							},
							{
								text: ' poorly.',
								startMs: 30300,
								endMs: 30480,
								timestampMs: 30390,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
			</Series>
			<Callout
				name="Problem callout"
				from={244}
				durationInFrames={152}
				premountFor={fps}
				label="Problem"
				text="No brakes"
				icon="warning"
				accentColor="#dc2626"
				style={{position: 'absolute', left: 80, top: 70}}
			/>
			<Audio
				name="Record scratch"
				src="https://remotion.media/record-scratch.wav"
				from={244}
				volume={0.6}
				premountFor={fps}
			/>
		</AbsoluteFill>
	);
};

export const TheDecline = Interactive.withSchema({
	Component: TheDeclineInner,
	componentName: '<TheDecline>',
	schema: {},
	wrapInSequence: true,
});
