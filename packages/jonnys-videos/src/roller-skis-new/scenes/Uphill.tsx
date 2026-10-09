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
} from 'remotion';
import {Callout} from '../elements/Callout';
import {PoppingWordCaptions} from '../elements/popping-word-captions';

const UphillInner: React.FC = () => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill showInTimeline={false} style={{backgroundColor: 'black'}}>
			<Series>
				<Series.Sequence
					name="Incline"
					trimBefore={28}
					durationInFrames={83}
					premountFor={fps}
				>
					<Video
						name="IMG_0459"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0459.MOV'
						}
						volume={0.8}
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
								startMs: 1180,
								endMs: 1360,
								timestampMs: 1270,
								confidence: null,
							},
							{
								text: ' so',
								startMs: 1400,
								endMs: 1580,
								timestampMs: 1490,
								confidence: null,
							},
							{
								text: ' now',
								startMs: 1580,
								endMs: 1720,
								timestampMs: 1650,
								confidence: null,
							},
							{
								text: ' we',
								startMs: 1720,
								endMs: 1900,
								timestampMs: 1810,
								confidence: null,
							},
							{
								text: ' have',
								startMs: 1900,
								endMs: 2060,
								timestampMs: 1980,
								confidence: null,
							},
							{
								text: ' a',
								startMs: 2060,
								endMs: 2300,
								timestampMs: 2180,
								confidence: null,
							},
							{
								text: ' bit',
								startMs: 2300,
								endMs: 2480,
								timestampMs: 2390,
								confidence: null,
							},
							{
								text: ' of',
								startMs: 2480,
								endMs: 2600,
								timestampMs: 2540,
								confidence: null,
							},
							{
								text: ' an',
								startMs: 2600,
								endMs: 2820,
								timestampMs: 2710,
								confidence: null,
							},
							{
								text: ' incline,',
								startMs: 2820,
								endMs: 3240,
								timestampMs: 3030,
								confidence: null,
							},
							{
								text: ' so',
								startMs: 3280,
								endMs: 3420,
								timestampMs: 3350,
								confidence: null,
							},
							{
								text: " it's",
								startMs: 3420,
								endMs: 3660,
								timestampMs: 3540,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Awesome features"
					trimBefore={131}
					durationInFrames={145}
					premountFor={fps}
				>
					<Video
						name="IMG_0459"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0459.MOV'
						}
						volume={0.8}
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
								startMs: 4367,
								endMs: 4600,
								timestampMs: 4484,
								confidence: null,
							},
							{
								text: ' great',
								startMs: 4600,
								endMs: 4880,
								timestampMs: 4740,
								confidence: null,
							},
							{
								text: ' time',
								startMs: 4880,
								endMs: 5060,
								timestampMs: 4970,
								confidence: null,
							},
							{
								text: ' to',
								startMs: 5060,
								endMs: 5240,
								timestampMs: 5150,
								confidence: null,
							},
							{
								text: ' show',
								startMs: 5240,
								endMs: 5400,
								timestampMs: 5320,
								confidence: null,
							},
							{
								text: ' you',
								startMs: 5400,
								endMs: 5660,
								timestampMs: 5530,
								confidence: null,
							},
							{
								text: ' one',
								startMs: 5660,
								endMs: 5780,
								timestampMs: 5720,
								confidence: null,
							},
							{
								text: ' of',
								startMs: 5780,
								endMs: 5940,
								timestampMs: 5860,
								confidence: null,
							},
							{
								text: ' the',
								startMs: 5940,
								endMs: 6080,
								timestampMs: 6010,
								confidence: null,
							},
							{
								text: ' awesome',
								startMs: 6440,
								endMs: 6880,
								timestampMs: 6660,
								confidence: null,
							},
							{
								text: ' features',
								startMs: 6880,
								endMs: 8080,
								timestampMs: 7480,
								confidence: null,
							},
							{
								text: ' of',
								startMs: 8080,
								endMs: 8320,
								timestampMs: 8200,
								confidence: null,
							},
							{
								text: ' these',
								startMs: 8320,
								endMs: 8540,
								timestampMs: 8430,
								confidence: null,
							},
							{
								text: ' ski',
								startMs: 8540,
								endMs: 9000,
								timestampMs: 8770,
								confidence: null,
							},
							{
								text: ' rollers,',
								startMs: 9000,
								endMs: 9200,
								timestampMs: 9100,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Which is"
					trimBefore={299}
					durationInFrames={24}
					premountFor={fps}
				>
					<Video
						name="IMG_0459"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0459.MOV'
						}
						volume={0.8}
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
								text: ' which',
								startMs: 10120,
								endMs: 10380,
								timestampMs: 10250,
								confidence: null,
							},
							{
								text: ' is',
								startMs: 10380,
								endMs: 10700,
								timestampMs: 10540,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Cannot roll backwards"
					trimBefore={342}
					durationInFrames={48}
					premountFor={fps}
				>
					<Video
						name="IMG_0459"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0459.MOV'
						}
						volume={0.8}
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
								text: ' that',
								startMs: 11420,
								endMs: 11560,
								timestampMs: 11490,
								confidence: null,
							},
							{
								text: ' you',
								startMs: 11500,
								endMs: 11740,
								timestampMs: 11620,
								confidence: null,
							},
							{
								text: ' cannot',
								startMs: 11740,
								endMs: 12200,
								timestampMs: 11970,
								confidence: null,
							},
							{
								text: ' roll',
								startMs: 12200,
								endMs: 12760,
								timestampMs: 12480,
								confidence: null,
							},
							{
								text: ' backwards.',
								startMs: 12760,
								endMs: 12960,
								timestampMs: 12860,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="So I can just"
					trimBefore={416}
					durationInFrames={21}
					premountFor={fps}
				>
					<Video
						name="IMG_0459"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0459.MOV'
						}
						volume={0.8}
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
								text: ' So',
								startMs: 14020,
								endMs: 14180,
								timestampMs: 14100,
								confidence: null,
							},
							{
								text: ' I',
								startMs: 14180,
								endMs: 14300,
								timestampMs: 14240,
								confidence: null,
							},
							{
								text: ' can',
								startMs: 14300,
								endMs: 14540,
								timestampMs: 14420,
								confidence: null,
							},
							{
								text: ' just',
								startMs: 14300,
								endMs: 14560,
								timestampMs: 14430,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Walk"
					trimBefore={465}
					durationInFrames={24}
					premountFor={fps}
				>
					<Video
						name="IMG_0459"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0459.MOV'
						}
						volume={0.8}
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
								text: ' walk,',
								startMs: 15980,
								endMs: 16280,
								timestampMs: 16130,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Super chill"
					trimBefore={539}
					durationInFrames={40}
					premountFor={fps}
				>
					<Video
						name="IMG_0459"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0459.MOV'
						}
						volume={0.8}
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
								text: ' super',
								startMs: 18160,
								endMs: 18480,
								timestampMs: 18320,
								confidence: null,
							},
							{
								text: ' chill,',
								startMs: 18480,
								endMs: 19280,
								timestampMs: 18880,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Super casual"
					trimBefore={642}
					durationInFrames={37}
					premountFor={fps}
				>
					<Video
						name="IMG_0459"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0459.MOV'
						}
						volume={0.8}
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
								text: ' super',
								startMs: 21640,
								endMs: 22080,
								timestampMs: 21860,
								confidence: null,
							},
							{
								text: ' casual,',
								startMs: 22080,
								endMs: 22560,
								timestampMs: 22320,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Really super cool"
					trimBefore={1050}
					durationInFrames={29}
					premountFor={fps}
				>
					<Video
						name="IMG_0459"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0459.MOV'
						}
						volume={0.8}
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
								text: ' Really',
								startMs: 35240,
								endMs: 35480,
								timestampMs: 35360,
								confidence: null,
							},
							{
								text: ' super',
								startMs: 35480,
								endMs: 35780,
								timestampMs: 35630,
								confidence: null,
							},
							{
								text: ' cool.',
								startMs: 35780,
								endMs: 35967,
								timestampMs: 35874,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="One thing"
					trimBefore={1141}
					durationInFrames={64}
					premountFor={fps}
				>
					<Video
						name="IMG_0459"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0459.MOV'
						}
						volume={0.8}
						premountFor={fps}
						objectFit="cover"
						style={{width: '100%', height: '100%', rotate: '180deg'}}
					/>
					<PoppingWordCaptions
						combineTokensWithinMilliseconds={null}
						name="Captions"
						premountFor={fps}
						width={1600}
						style={{position: 'absolute', bottom: 56, translate: '160px 0px'}}
						captions={[
							{
								text: ' One',
								startMs: 38220,
								endMs: 38400,
								timestampMs: 38310,
								confidence: null,
							},
							{
								text: ' thing',
								startMs: 38400,
								endMs: 38580,
								timestampMs: 38490,
								confidence: null,
							},
							{
								text: ' I',
								startMs: 38580,
								endMs: 38720,
								timestampMs: 38650,
								confidence: null,
							},
							{
								text: ' have',
								startMs: 38720,
								endMs: 38840,
								timestampMs: 38780,
								confidence: null,
							},
							{
								text: ' to',
								startMs: 38840,
								endMs: 39040,
								timestampMs: 38940,
								confidence: null,
							},
							{
								text: ' tell',
								startMs: 39040,
								endMs: 39140,
								timestampMs: 39090,
								confidence: null,
							},
							{
								text: ' you',
								startMs: 39140,
								endMs: 39320,
								timestampMs: 39230,
								confidence: null,
							},
							{
								text: ' though',
								startMs: 39320,
								endMs: 39560,
								timestampMs: 39440,
								confidence: null,
							},
							{
								text: ' is',
								startMs: 39560,
								endMs: 39840,
								timestampMs: 39700,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="People look weird"
					trimBefore={1224}
					durationInFrames={95}
					premountFor={fps}
				>
					<Video
						name="IMG_0459"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0459.MOV'
						}
						volume={0.8}
						premountFor={fps}
						objectFit="cover"
						style={{
							width: '100%',
							height: '100%',
							rotate: '180deg',
							scale: interpolate(frame, [578, 587], [1, 1.1], {
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
								text: ' that',
								startMs: 40800,
								endMs: 41340,
								timestampMs: 41070,
								confidence: null,
							},
							{
								text: ' all',
								startMs: 41340,
								endMs: 41460,
								timestampMs: 41400,
								confidence: null,
							},
							{
								text: ' the',
								startMs: 41460,
								endMs: 41740,
								timestampMs: 41600,
								confidence: null,
							},
							{
								text: ' people',
								startMs: 41740,
								endMs: 42640,
								timestampMs: 42190,
								confidence: null,
							},
							{
								text: ' are',
								startMs: 42640,
								endMs: 42900,
								timestampMs: 42770,
								confidence: null,
							},
							{
								text: ' looking',
								startMs: 42900,
								endMs: 43120,
								timestampMs: 43010,
								confidence: null,
							},
							{
								text: ' a',
								startMs: 43120,
								endMs: 43260,
								timestampMs: 43190,
								confidence: null,
							},
							{
								text: ' bit',
								startMs: 43260,
								endMs: 43560,
								timestampMs: 43410,
								confidence: null,
							},
							{
								text: ' weird.',
								startMs: 43560,
								endMs: 43840,
								timestampMs: 43700,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="What is cool"
					trimBefore={1335}
					durationInFrames={257}
					premountFor={fps}
				>
					<Video
						name="IMG_0459"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0459.MOV'
						}
						volume={0.8}
						premountFor={fps}
						objectFit="cover"
						style={{width: '100%', height: '100%', rotate: '180deg'}}
					/>
					<PoppingWordCaptions
						combineTokensWithinMilliseconds={null}
						name="Captions"
						premountFor={fps}
						width={1600}
						style={{position: 'absolute', bottom: 56, translate: '160px 0px'}}
						captions={[
							{
								text: ' They',
								startMs: 44700,
								endMs: 44860,
								timestampMs: 44780,
								confidence: null,
							},
							{
								text: ' do',
								startMs: 44860,
								endMs: 45020,
								timestampMs: 44940,
								confidence: null,
							},
							{
								text: ' not',
								startMs: 45020,
								endMs: 45260,
								timestampMs: 45140,
								confidence: null,
							},
							{
								text: ' seem',
								startMs: 45260,
								endMs: 45540,
								timestampMs: 45400,
								confidence: null,
							},
							{
								text: ' to',
								startMs: 45500,
								endMs: 47260,
								timestampMs: 46380,
								confidence: null,
							},
							{
								text: ' have',
								startMs: 47260,
								endMs: 47620,
								timestampMs: 47440,
								confidence: null,
							},
							{
								text: ' that',
								startMs: 47620,
								endMs: 48660,
								timestampMs: 48140,
								confidence: null,
							},
							{
								text: ' wide',
								startMs: 48660,
								endMs: 50020,
								timestampMs: 49340,
								confidence: null,
							},
							{
								text: ' of',
								startMs: 50020,
								endMs: 51180,
								timestampMs: 50600,
								confidence: null,
							},
							{
								text: ' understanding',
								startMs: 51180,
								endMs: 51680,
								timestampMs: 51430,
								confidence: null,
							},
							{
								text: ' of',
								startMs: 51680,
								endMs: 51880,
								timestampMs: 51780,
								confidence: null,
							},
							{
								text: ' what',
								startMs: 51880,
								endMs: 52020,
								timestampMs: 51950,
								confidence: null,
							},
							{
								text: ' is',
								startMs: 52020,
								endMs: 52200,
								timestampMs: 52110,
								confidence: null,
							},
							{
								text: ' cool',
								startMs: 52200,
								endMs: 52420,
								timestampMs: 52310,
								confidence: null,
							},
							{
								text: ' and',
								startMs: 52420,
								endMs: 52560,
								timestampMs: 52490,
								confidence: null,
							},
							{
								text: ' what',
								startMs: 52560,
								endMs: 52680,
								timestampMs: 52620,
								confidence: null,
							},
							{
								text: ' is',
								startMs: 52680,
								endMs: 52920,
								timestampMs: 52800,
								confidence: null,
							},
							{
								text: ' not.',
								startMs: 52920,
								endMs: 53000,
								timestampMs: 52960,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Even the cows"
					trimBefore={1751}
					durationInFrames={168}
					premountFor={fps}
				>
					<Video
						name="IMG_0459"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0459.MOV'
						}
						volume={0.8}
						premountFor={fps}
						objectFit="cover"
						style={{width: '100%', height: '100%'}}
					/>
					<Video
						name="Cow close-up"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0460.MOV'
						}
						from={1872}
						trimBefore={75}
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
								startMs: 58440,
								endMs: 58540,
								timestampMs: 58490,
								confidence: null,
							},
							{
								text: ' feel',
								startMs: 58540,
								endMs: 58700,
								timestampMs: 58620,
								confidence: null,
							},
							{
								text: ' like',
								startMs: 58700,
								endMs: 58860,
								timestampMs: 58780,
								confidence: null,
							},
							{
								text: ' even',
								startMs: 58860,
								endMs: 59000,
								timestampMs: 58930,
								confidence: null,
							},
							{
								text: ' the',
								startMs: 59000,
								endMs: 59400,
								timestampMs: 59200,
								confidence: null,
							},
							{
								text: ' cows,',
								startMs: 59400,
								endMs: 59580,
								timestampMs: 59490,
								confidence: null,
							},
							{
								text: " they're",
								startMs: 61620,
								endMs: 61940,
								timestampMs: 61780,
								confidence: null,
							},
							{
								text: ' looking',
								startMs: 61940,
								endMs: 62140,
								timestampMs: 62040,
								confidence: null,
							},
							{
								text: ' a',
								startMs: 62140,
								endMs: 62280,
								timestampMs: 62210,
								confidence: null,
							},
							{
								text: ' bit',
								startMs: 62280,
								endMs: 62580,
								timestampMs: 62430,
								confidence: null,
							},
							{
								text: ' skeptically',
								startMs: 62580,
								endMs: 63100,
								timestampMs: 62840,
								confidence: null,
							},
							{
								text: ' at',
								startMs: 63100,
								endMs: 63320,
								timestampMs: 63210,
								confidence: null,
							},
							{
								text: ' me.',
								startMs: 63320,
								endMs: 63900,
								timestampMs: 63610,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Cow stare"
					trimBefore={122}
					durationInFrames={51}
					premountFor={fps}
				>
					<Video
						name="IMG_0460"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0460.MOV'
						}
						muted
						premountFor={fps}
						objectFit="cover"
						style={{
							width: '100%',
							height: '100%',
							scale: interpolate(frame, [1035, 1044, 1086], [1, 1.2, 1.3], {
								easing: Easing.bezier(0.16, 1, 0.3, 1),
								output: 'perceptual-scale',
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
						}}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="But you know"
					trimBefore={1932}
					durationInFrames={22}
					premountFor={fps}
				>
					<Video
						name="IMG_0459"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0459.MOV'
						}
						volume={0.8}
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
								text: ' But',
								startMs: 64540,
								endMs: 64600,
								timestampMs: 64570,
								confidence: null,
							},
							{
								text: ' you',
								startMs: 64600,
								endMs: 64780,
								timestampMs: 64690,
								confidence: null,
							},
							{
								text: ' know,',
								startMs: 64780,
								endMs: 65080,
								timestampMs: 64930,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Stand for your values"
					trimBefore={2018}
					durationInFrames={255}
					premountFor={fps}
				>
					<Video
						name="IMG_0459"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0459.MOV'
						}
						volume={0.8}
						premountFor={fps}
						objectFit="cover"
						style={{width: '100%', height: '100%', rotate: '180deg'}}
					/>
					<PoppingWordCaptions
						combineTokensWithinMilliseconds={null}
						name="Captions"
						premountFor={fps}
						width={1600}
						style={{position: 'absolute', bottom: 56, translate: '160px 0px'}}
						captions={[
							{
								text: ' sometimes',
								startMs: 67600,
								endMs: 67920,
								timestampMs: 67760,
								confidence: null,
							},
							{
								text: ' you',
								startMs: 67920,
								endMs: 68120,
								timestampMs: 68020,
								confidence: null,
							},
							{
								text: ' just',
								startMs: 68120,
								endMs: 68400,
								timestampMs: 68260,
								confidence: null,
							},
							{
								text: ' gotta',
								startMs: 68400,
								endMs: 70120,
								timestampMs: 69260,
								confidence: null,
							},
							{
								text: ' stand',
								startMs: 70120,
								endMs: 71100,
								timestampMs: 70610,
								confidence: null,
							},
							{
								text: ' for',
								startMs: 71100,
								endMs: 71280,
								timestampMs: 71190,
								confidence: null,
							},
							{
								text: ' your',
								startMs: 71280,
								endMs: 71660,
								timestampMs: 71470,
								confidence: null,
							},
							{
								text: ' values',
								startMs: 71660,
								endMs: 72720,
								timestampMs: 72190,
								confidence: null,
							},
							{
								text: ' and',
								startMs: 72720,
								endMs: 73120,
								timestampMs: 72920,
								confidence: null,
							},
							{
								text: ' slowly',
								startMs: 73120,
								endMs: 75460,
								timestampMs: 74290,
								confidence: null,
							},
							{
								text: ' go',
								startMs: 75460,
								endMs: 75760,
								timestampMs: 75610,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Step by step"
					trimBefore={2273}
					durationInFrames={87}
					premountFor={fps}
				>
					<Video
						name="IMG_0459"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0459.MOV'
						}
						volume={0.8}
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
								text: ' up',
								startMs: 75767,
								endMs: 76700,
								timestampMs: 76234,
								confidence: null,
							},
							{
								text: ' the',
								startMs: 76700,
								endMs: 76980,
								timestampMs: 76840,
								confidence: null,
							},
							{
								text: ' hill,',
								startMs: 76980,
								endMs: 77240,
								timestampMs: 77110,
								confidence: null,
							},
							{
								text: ' step',
								startMs: 77940,
								endMs: 78100,
								timestampMs: 78020,
								confidence: null,
							},
							{
								text: ' by',
								startMs: 78100,
								endMs: 78440,
								timestampMs: 78270,
								confidence: null,
							},
							{
								text: ' step,',
								startMs: 78440,
								endMs: 78667,
								timestampMs: 78554,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
				<Series.Sequence
					name="Reached the top"
					trimBefore={2416}
					durationInFrames={67}
					premountFor={fps}
				>
					<Video
						name="IMG_0459"
						src={
							'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0459.MOV'
						}
						volume={0.8}
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
								text: ' until',
								startMs: 80820,
								endMs: 81740,
								timestampMs: 81280,
								confidence: null,
							},
							{
								text: ' you',
								startMs: 81740,
								endMs: 81880,
								timestampMs: 81810,
								confidence: null,
							},
							{
								text: ' have',
								startMs: 81880,
								endMs: 82120,
								timestampMs: 82000,
								confidence: null,
							},
							{
								text: ' reached',
								startMs: 82120,
								endMs: 82280,
								timestampMs: 82200,
								confidence: null,
							},
							{
								text: ' the',
								startMs: 82280,
								endMs: 82500,
								timestampMs: 82390,
								confidence: null,
							},
							{
								text: ' top.',
								startMs: 82500,
								endMs: 82640,
								timestampMs: 82570,
								confidence: null,
							},
						]}
					/>
				</Series.Sequence>
			</Series>
			<Callout
				name="Feature callout"
				from={258}
				durationInFrames={164}
				premountFor={fps}
				label="Feature"
				text="Can't roll backwards"
				icon="check"
				accentColor="#16a34a"
				style={{position: 'absolute', left: 80, top: 70}}
			/>
			<Audio
				name="Ding"
				src="https://remotion.media/ding.wav"
				from={258}
				volume={0.35}
				premountFor={fps}
			/>
			<Audio
				name="Vine boom"
				src="https://remotion.media/vine-boom.wav"
				from={1035}
				volume={0.5}
				premountFor={fps}
			/>
		</AbsoluteFill>
	);
};

export const Uphill = Interactive.withSchema({
	Component: UphillInner,
	componentName: 'Uphill',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});
