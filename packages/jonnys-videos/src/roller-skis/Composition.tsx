import type {Caption} from '@remotion/captions';
import {lut} from '@remotion/effects/lut';
import {vignette} from '@remotion/effects/vignette';
import {Audio, Video} from '@remotion/media';
import {TransitionSeries} from '@remotion/transitions';
import {
	Interactive,
	AbsoluteFill,
	Composition,
	Easing,
	interpolate,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {rollerSkiAsset} from './assets';
import {BasicCaptions} from './basic-captions';
import {RollerSkiBlueprint} from './blueprint/RollerSkiBlueprint';
import {
	closingThoughtsAfterCaptions,
	closingThoughtsBeforeCaptions,
} from './closing-thoughts-captions';
import {outdoorLut, studioLut} from './color-grade';
import {IntroLowerThird} from './IntroLowerThird';
import {NordicRoutes} from './nordic/NordicRoutes';
import brakeSourceCaptions from './transcripts/IMG_0478.captions.json';
import {YouTubeEndCard} from './YouTubeEndCard';

const FPS = 30;
const COMPOSITION_DURATION_IN_FRAMES = 12377;
const END_CARD_START = 12058;
const END_CARD_DURATION_IN_FRAMES =
	COMPOSITION_DURATION_IN_FRAMES - END_CARD_START;
const brakingCaptionsFor = (startMs: number, endMs: number): Caption[] =>
	brakeSourceCaptions
		.filter((caption) => caption.startMs < endMs && caption.endMs > startMs)
		.map((caption) => {
			return {
				text: caption.text,
				startMs: Math.max(0, caption.startMs - startMs),
				endMs: Math.min(endMs, caption.endMs) - startMs,
				timestampMs:
					Math.min(endMs, Math.max(startMs, caption.timestampMs)) - startMs,
				confidence: null,
				pageBreakAfter: /[.!?]$/.test(caption.text),
			};
		});
const brakingDemonstrationCaptions = brakingCaptionsFor(3500, 42300);
const brakingConclusionCaptions = brakingCaptionsFor(53400, 57367);

export const MyComposition = () => {
	return (
		<Composition
			id="RollerSkiRoughCut"
			component={RollerSkiRoughCut}
			durationInFrames={COMPOSITION_DURATION_IN_FRAMES}
			fps={FPS}
			width={1920}
			height={1080}
		/>
	);
};

const videoStyle: React.CSSProperties = {
	width: '100%',
	height: '100%',
};

const WhiteYouTubeIcon: React.FC = () => (
	<svg
		width={48}
		height={34}
		viewBox="0 0 48 34"
		aria-hidden="true"
		style={{flexShrink: 0}}
	>
		<path
			fill="white"
			fillRule="evenodd"
			d="M10 0H38C43.5 0 48 4.5 48 10V24C48 29.5 43.5 34 38 34H10C4.5 34 0 29.5 0 24V10C0 4.5 4.5 0 10 0ZM20 9V25L34 17 20 9Z"
		/>
	</svg>
);

const OpeningTitleCardInner: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			showInTimeline={false}
			style={{
				backgroundColor: '#000000',
				color: '#ffffff',
				justifyContent: 'center',
				alignItems: 'center',
				padding: '0 180px',
			}}
		>
			<div
				style={{
					fontFamily: 'Arial, Helvetica, sans-serif',
					fontSize: 54,
					fontWeight: 500,
					lineHeight: 1.1,
					display: 'flex',
					flexDirection: 'column',
					gap: 8,
					textAlign: 'center',
					opacity: interpolate(frame, [0, 30, 150, 165], [0, 1, 1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			>
				<div>Today we had an internal video editing competition.</div>
				<div>Everybody had to make a video with Remotion!</div>
				<div>This is what I made.</div>
			</div>
		</AbsoluteFill>
	);
};

const PresenterZoomInner: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const zoom = interpolate(frame, [472, 516], [1, 1.09], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill showInTimeline={false} style={{transform: `scale(${zoom})`}}>
			<Video
				src={rollerSkiAsset('footage/webcam1790843295628.mp4')}
				durationInFrames={436}
				trimBefore={120}
				style={videoStyle}
				objectFit="cover"
				premountFor={fps}
				effects={[
					lut({content: studioLut}),
					vignette({
						amount: interpolate(frame, [423, 466], [0, 0.55], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),

						radius: 0.62,
						feather: 0.35,
						roundness: 1,
						center: [0.5, 0.5],
						color: '#000000',
					}),
				]}
			/>
			<Video
				src={rollerSkiAsset('footage/webcam1790843295628.mp4')}
				from={436}
				trimBefore={556}
				style={videoStyle}
				objectFit="cover"
				premountFor={fps}
				effects={[
					lut({content: studioLut}),
					vignette({
						amount: interpolate(frame, [409, 485], [0, 0.55], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),

						radius: 0.63,
						feather: 0.67,
						roundness: 1,
						center: [0.5, 0.5],
						color: '#000000',
					}),
				]}
				toneFrequency={0.95}
			/>
		</AbsoluteFill>
	);
};

const TvColorBarsInner: React.FC = () => {
	const frame = useCurrentFrame();
	const top = [
		'#e6e6e6',
		'#e5df00',
		'#00d6d8',
		'#00d335',
		'#cc00d3',
		'#dc2028',
		'#2030d4',
	];
	const middle = [
		'#1e2ece',
		'#080808',
		'#cf00d3',
		'#080808',
		'#00d4d6',
		'#080808',
		'#d0d0d0',
	];

	return (
		<AbsoluteFill
			showInTimeline={false}
			style={{backgroundColor: '#080808', overflow: 'hidden'}}
		>
			<div style={{display: 'flex', height: '68%'}}>
				{top.map((color, index) => (
					<div key={index} style={{backgroundColor: color, flex: 1}} />
				))}
			</div>
			<div style={{display: 'flex', height: '16%'}}>
				{middle.map((color, index) => (
					<div key={index} style={{backgroundColor: color, flex: 1}} />
				))}
			</div>
			<div style={{display: 'flex', height: '16%'}}>
				<div style={{backgroundColor: '#062248', width: '19%'}} />
				<div style={{backgroundColor: '#f4f4f4', width: '19%'}} />
				<div style={{backgroundColor: '#3b0a62', width: '19%'}} />
				<div style={{backgroundColor: '#080808', flex: 1}} />
			</div>
			<AbsoluteFill
				style={{
					background:
						'repeating-linear-gradient(to bottom, transparent 0px, rgba(0, 0, 0, 0.24) 2px, transparent 4px)',
					opacity: frame % 3 === 0 ? 0.35 : 0.23,
					pointerEvents: 'none',
				}}
			/>
		</AbsoluteFill>
	);
};

const STRAVA_BROLL_DURATION = 165;

const StravaRidesBrollInner: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			showInTimeline={false}
			style={{
				backgroundColor: '#000000',
				opacity: interpolate(
					frame,
					[0, 15, STRAVA_BROLL_DURATION - 15, STRAVA_BROLL_DURATION - 1],
					[0, 1, 1, 0],
					{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
				),
			}}
		>
			<NordicRoutes whiteOverlay />
		</AbsoluteFill>
	);
};

const PresenterIntroductionInner: React.FC = () => {
	const {fps} = useVideoConfig();

	return (
		<>
			<Video
				src={rollerSkiAsset('footage/webcam1790843295628.mp4')}
				trimBefore={4.833333333333333 * fps}
				style={videoStyle}
				objectFit="cover"
				effects={[lut({content: studioLut})]}
				from={25}
				durationInFrames={350}
			/>
			<IntroLowerThird
				name={'Lower Third'}
				from={36}
				durationInFrames={108}
				nameText="Jonny Burger"
				roleText="Roller Ski Enthusiast"
			/>
			<BasicCaptions
				name="Presenter introduction (1) captions"
				captions={[
					{
						text: 'What',
						startMs: 1000,
						endMs: 1100,
						timestampMs: 1050,
						confidence: null,
					},
					{
						text: ' is',
						startMs: 1100,
						endMs: 1200,
						timestampMs: 1150,
						confidence: null,
					},
					{
						text: ' up',
						startMs: 1200,
						endMs: 1420,
						timestampMs: 1310,
						confidence: null,
					},
					{
						text: ' guys,',
						startMs: 1420,
						endMs: 1600,
						timestampMs: 1510,
						confidence: null,
					},
					{
						text: ' my',
						startMs: 1700,
						endMs: 1840,
						timestampMs: 1770,
						confidence: null,
					},
					{
						text: ' name',
						startMs: 1840,
						endMs: 1980,
						timestampMs: 1910,
						confidence: null,
					},
					{
						text: ' is',
						startMs: 1980,
						endMs: 2160,
						timestampMs: 2070,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' Jonny',
						startMs: 2160,
						endMs: 2340,
						timestampMs: 2250,
						confidence: null,
					},
					{
						text: ' Burger,',
						startMs: 2340,
						endMs: 2860,
						timestampMs: 2600,
						confidence: null,
					},
					{
						text: ' I',
						startMs: 2860,
						endMs: 2960,
						timestampMs: 2910,
						confidence: null,
					},
					{
						text: ' am',
						startMs: 2960,
						endMs: 3100,
						timestampMs: 3030,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 3100,
						endMs: 3260,
						timestampMs: 3180,
						confidence: null,
					},
					{
						text: ' founder',
						startMs: 3260,
						endMs: 3500,
						timestampMs: 3380,
						confidence: null,
					},
					{
						text: ' of',
						startMs: 3500,
						endMs: 3640,
						timestampMs: 3570,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' Remotion',
						startMs: 3640,
						endMs: 4180,
						timestampMs: 3910,
						confidence: null,
					},
					{
						text: ' and',
						startMs: 4180,
						endMs: 4580,
						timestampMs: 4380,
						confidence: null,
					},
					{
						text: ' today',
						startMs: 4580,
						endMs: 5080,
						timestampMs: 4830,
						confidence: null,
					},
					{
						text: " I'll",
						startMs: 5300,
						endMs: 5580,
						timestampMs: 5440,
						confidence: null,
					},
					{
						text: ' use',
						startMs: 5580,
						endMs: 5800,
						timestampMs: 5690,
						confidence: null,
					},
					{
						text: ' my',
						startMs: 5800,
						endMs: 6260,
						timestampMs: 6030,
						confidence: null,
					},
					{
						text: ' massive',
						startMs: 6260,
						endMs: 6580,
						timestampMs: 6420,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' reach',
						startMs: 6580,
						endMs: 7160,
						timestampMs: 6870,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 7160,
						endMs: 7400,
						timestampMs: 7280,
						confidence: null,
					},
					{
						text: ' show',
						startMs: 7400,
						endMs: 7580,
						timestampMs: 7490,
						confidence: null,
					},
					{
						text: ' you',
						startMs: 7580,
						endMs: 7840,
						timestampMs: 7710,
						confidence: null,
					},
					{
						text: ' a',
						startMs: 7840,
						endMs: 8160,
						timestampMs: 8000,
						confidence: null,
					},
					{
						text: ' really',
						startMs: 8160,
						endMs: 9180,
						timestampMs: 8670,
						confidence: null,
					},
					{
						text: ' underrated',
						startMs: 9180,
						endMs: 9720,
						timestampMs: 9450,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' sport –',
						startMs: 9720,
						endMs: 11000,
						timestampMs: 10360,
						confidence: null,
					},
					{
						text: ' roller',
						startMs: 11160,
						endMs: 11480,
						timestampMs: 11320,
						confidence: null,
					},
					{
						text: ' skis.',
						startMs: 11480,
						endMs: 12980,
						timestampMs: 12230,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' I',
						startMs: 13300,
						endMs: 13520,
						timestampMs: 13410,
						confidence: null,
					},
					{
						text: ' picked',
						startMs: 13520,
						endMs: 13760,
						timestampMs: 13640,
						confidence: null,
					},
					{
						text: ' up',
						startMs: 13760,
						endMs: 14040,
						timestampMs: 13900,
						confidence: null,
					},
					{
						text: ' these',
						startMs: 14040,
						endMs: 14340,
						timestampMs: 14190,
						confidence: null,
					},
					{
						text: ' bad',
						startMs: 14340,
						endMs: 14600,
						timestampMs: 14470,
						confidence: null,
					},
					{
						text: ' boys',
						startMs: 14600,
						endMs: 14900,
						timestampMs: 14750,
						confidence: null,
					},
					{
						text: ' at',
						startMs: 14900,
						endMs: 15020,
						timestampMs: 14960,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' a',
						startMs: 15020,
						endMs: 15240,
						timestampMs: 15130,
						confidence: null,
					},
					{
						text: ' yard',
						startMs: 15240,
						endMs: 15520,
						timestampMs: 15380,
						confidence: null,
					},
					{
						text: ' sale',
						startMs: 15520,
						endMs: 15920,
						timestampMs: 15720,
						confidence: null,
					},
					{
						text: ' last',
						startMs: 15920,
						endMs: 16300,
						timestampMs: 16110,
						confidence: null,
					},
					{
						text: ' weekend.',
						startMs: 16300,
						endMs: 17640,
						timestampMs: 16970,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: " Let's",
						startMs: 17740,
						endMs: 17980,
						timestampMs: 17860,
						confidence: null,
					},
					{
						text: ' take',
						startMs: 17980,
						endMs: 18140,
						timestampMs: 18060,
						confidence: null,
					},
					{
						text: ' them',
						startMs: 18140,
						endMs: 18320,
						timestampMs: 18230,
						confidence: null,
					},
					{
						text: ' out',
						startMs: 18320,
						endMs: 18480,
						timestampMs: 18400,
						confidence: null,
					},
					{
						text: ' for',
						startMs: 18480,
						endMs: 18580,
						timestampMs: 18530,
						confidence: null,
					},
					{
						text: ' a',
						startMs: 18580,
						endMs: 18820,
						timestampMs: 18700,
						confidence: null,
					},
					{
						text: ' spin.',
						startMs: 18820,
						endMs: 19040,
						timestampMs: 18930,
						confidence: null,
						pageBreakAfter: true,
					},
				]}
				width={1400}
				style={{position: 'absolute', left: 260, bottom: 90}}
				combineTokensWithinMilliseconds={3000}
			/>
		</>
	);
};

const RollerSkiRoughCutInner: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<>
			<TransitionSeries>
				<TransitionSeries.Sequence
					name="Opening text"
					durationInFrames={185}
					premountFor={fps}
				>
					<OpeningTitleCard />
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="Presenter introduction (1)"
					durationInFrames={346}
					premountFor={fps}
					trimBefore={21}
				>
					<PresenterIntroduction />
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="Roller ski blueprint intro"
					durationInFrames={525}
					premountFor={fps}
				>
					<RollerSkiBlueprint />
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="Opening selfie"
					durationInFrames={15.866666666666667 * FPS}
					premountFor={fps}
					trimBefore={55}
				>
					<Video
						src={rollerSkiAsset('processed/IMG_0456-upright.MOV')}
						trimBefore={0}
						style={videoStyle}
						objectFit="cover"
						premountFor={fps}
						effects={[lut({content: outdoorLut})]}
					/>
					<BasicCaptions
						name="Opening selfie captions"
						captions={[
							{
								text: 'Hello',
								startMs: 2360,
								endMs: 2880,
								timestampMs: 2620,
								confidence: null,
							},
							{
								text: ' everybody!',
								startMs: 2880,
								endMs: 3480,
								timestampMs: 3180,
								confidence: null,
							},
							{
								text: ' It',
								startMs: 3500,
								endMs: 3680,
								timestampMs: 3590,
								confidence: null,
							},
							{
								text: ' is',
								startMs: 3680,
								endMs: 4060,
								timestampMs: 3870,
								confidence: null,
							},
							{
								text: ' 8am',
								startMs: 4060,
								endMs: 4520,
								timestampMs: 4290,
								confidence: null,
							},
							{
								text: ' in',
								startMs: 4520,
								endMs: 4920,
								timestampMs: 4720,
								confidence: null,
							},
							{
								text: ' beautiful',
								startMs: 4920,
								endMs: 5280,
								timestampMs: 5100,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' Zurich,',
								startMs: 5280,
								endMs: 5440,
								timestampMs: 5360,
								confidence: null,
							},
							{
								text: ' Switzerland',
								startMs: 5700,
								endMs: 6760,
								timestampMs: 6230,
								confidence: null,
							},
							{
								text: ' and',
								startMs: 6760,
								endMs: 7120,
								timestampMs: 6940,
								confidence: null,
							},
							{
								text: " I'm",
								startMs: 7120,
								endMs: 7380,
								timestampMs: 7250,
								confidence: null,
							},
							{
								text: ' now',
								startMs: 7380,
								endMs: 7660,
								timestampMs: 7520,
								confidence: null,
							},
							{
								text: ' commuting',
								startMs: 7660,
								endMs: 7940,
								timestampMs: 7800,
								confidence: null,
							},
							{
								text: ' to',
								startMs: 7940,
								endMs: 8160,
								timestampMs: 8050,
								confidence: null,
								pageBreakAfter: false,
							},
							{
								text: ' work.',
								startMs: 8160,
								endMs: 8360,
								timestampMs: 8260,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' Not',
								startMs: 8680,
								endMs: 8980,
								timestampMs: 8830,
								confidence: null,
							},
							{
								text: ' with',
								startMs: 8980,
								endMs: 9140,
								timestampMs: 9060,
								confidence: null,
							},
							{
								text: ' the',
								startMs: 9140,
								endMs: 9440,
								timestampMs: 9290,
								confidence: null,
							},
							{
								text: ' car,',
								startMs: 9440,
								endMs: 9980,
								timestampMs: 9710,
								confidence: null,
							},
							{
								text: ' like',
								startMs: 10240,
								endMs: 10520,
								timestampMs: 10380,
								confidence: null,
							},
							{
								text: ' all',
								startMs: 10520,
								endMs: 10660,
								timestampMs: 10590,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' of',
								startMs: 10660,
								endMs: 10780,
								timestampMs: 10720,
								confidence: null,
							},
							{
								text: ' the',
								startMs: 10780,
								endMs: 10920,
								timestampMs: 10850,
								confidence: null,
							},
							{
								text: ' other',
								startMs: 10920,
								endMs: 11360,
								timestampMs: 11140,
								confidence: null,
							},
							{
								text: ' people,',
								startMs: 11360,
								endMs: 12020,
								timestampMs: 11690,
								confidence: null,
							},
							{
								text: ' but',
								startMs: 12440,
								endMs: 13540,
								timestampMs: 12990,
								confidence: null,
							},
							{
								text: ' with',
								startMs: 13540,
								endMs: 13860,
								timestampMs: 13700,
								confidence: null,
							},
							{
								text: ' my',
								startMs: 13860,
								endMs: 14440,
								timestampMs: 14150,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' roller',
								startMs: 14440,
								endMs: 14880,
								timestampMs: 14660,
								confidence: null,
							},
							{
								text: ' skis',
								startMs: 14880,
								endMs: 15620,
								timestampMs: 15250,
								confidence: null,
							},
							{
								text: ' instead!',
								startMs: 15620,
								endMs: 16320,
								timestampMs: 15970,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' Oh',
								startMs: 16800,
								endMs: 17220,
								timestampMs: 17010,
								confidence: null,
							},
							{
								text: ' yes!',
								startMs: 17220,
								endMs: 18320,
								timestampMs: 17770,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
						width={1400}
						style={{position: 'absolute', left: 260, bottom: 90}}
						combineTokensWithinMilliseconds={3500}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="Getting ready"
					durationInFrames={6.4 * FPS}
					premountFor={fps}
				>
					<Video
						src={rollerSkiAsset('footage/IMG_0457.MOV')}
						durationInFrames={969}
						trimBefore={120}
						style={videoStyle}
						objectFit="cover"
						premountFor={fps}
						playbackRate={5}
						effects={[lut({content: outdoorLut})]}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="Presenter introduction (2)"
					durationInFrames={127}
					premountFor={fps}
					trimBefore={369}
				>
					<PresenterZoom />
					<BasicCaptions
						name="Presenter introduction (2) captions"
						captions={[
							{
								text: ' I',
								startMs: 13300,
								endMs: 13520,
								timestampMs: 13410,
								confidence: null,
							},
							{
								text: ' picked',
								startMs: 13520,
								endMs: 13760,
								timestampMs: 13640,
								confidence: null,
							},
							{
								text: ' up',
								startMs: 13760,
								endMs: 14040,
								timestampMs: 13900,
								confidence: null,
							},
							{
								text: ' these',
								startMs: 14040,
								endMs: 14340,
								timestampMs: 14190,
								confidence: null,
							},
							{
								text: ' bad',
								startMs: 14340,
								endMs: 14600,
								timestampMs: 14470,
								confidence: null,
							},
							{
								text: ' boys',
								startMs: 14600,
								endMs: 14900,
								timestampMs: 14750,
								confidence: null,
							},
							{
								text: ' at',
								startMs: 14900,
								endMs: 15020,
								timestampMs: 14960,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' a',
								startMs: 15020,
								endMs: 15240,
								timestampMs: 15130,
								confidence: null,
							},
							{
								text: ' yard',
								startMs: 15240,
								endMs: 15520,
								timestampMs: 15380,
								confidence: null,
							},
							{
								text: ' sale',
								startMs: 15520,
								endMs: 15920,
								timestampMs: 15720,
								confidence: null,
							},
							{
								text: ' last',
								startMs: 15920,
								endMs: 16300,
								timestampMs: 16110,
								confidence: null,
							},
							{
								text: ' weekend.',
								startMs: 16300,
								endMs: 17640,
								timestampMs: 16970,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: " Let's",
								startMs: 17740,
								endMs: 17980,
								timestampMs: 17860,
								confidence: null,
							},
							{
								text: ' take',
								startMs: 17980,
								endMs: 18140,
								timestampMs: 18060,
								confidence: null,
							},
							{
								text: ' them',
								startMs: 18140,
								endMs: 18320,
								timestampMs: 18230,
								confidence: null,
							},
							{
								text: ' out',
								startMs: 18320,
								endMs: 18480,
								timestampMs: 18400,
								confidence: null,
							},
							{
								text: ' for',
								startMs: 18480,
								endMs: 18580,
								timestampMs: 18530,
								confidence: null,
							},
							{
								text: ' a',
								startMs: 18580,
								endMs: 18820,
								timestampMs: 18700,
								confidence: null,
							},
							{
								text: ' spin.',
								startMs: 18820,
								endMs: 19040,
								timestampMs: 18930,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
						width={1400}
						style={{position: 'absolute', left: 260, bottom: 90}}
						combineTokensWithinMilliseconds={3000}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="TV color bars"
					durationInFrames={15}
					premountFor={fps}
				>
					<TvColorBars />
					<Audio
						src={rollerSkiAsset('audio/tv-static-tone.wav')}
						volume={0.55}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="The pole tips"
					durationInFrames={354}
					premountFor={fps}
					trimBefore={48}
				>
					<Video
						src={rollerSkiAsset('footage/webcam1790859190089.mp4')}
						style={videoStyle}
						objectFit="cover"
						premountFor={fps}
						effects={[lut({content: studioLut})]}
					/>
					<BasicCaptions
						name="The pole tips captions"
						captions={[
							{
								text: 'Check',
								startMs: 2380,
								endMs: 2800,
								timestampMs: 2590,
								confidence: null,
							},
							{
								text: ' out',
								startMs: 2800,
								endMs: 3440,
								timestampMs: 3120,
								confidence: null,
							},
							{
								text: ' the',
								startMs: 3440,
								endMs: 3900,
								timestampMs: 3670,
								confidence: null,
							},
							{
								text: ' tips',
								startMs: 3900,
								endMs: 4700,
								timestampMs: 4300,
								confidence: null,
							},
							{
								text: ' of',
								startMs: 4700,
								endMs: 4980,
								timestampMs: 4840,
								confidence: null,
							},
							{
								text: ' these',
								startMs: 4980,
								endMs: 5440,
								timestampMs: 5210,
								confidence: null,
							},
							{
								text: ' poles.',
								startMs: 5440,
								endMs: 5860,
								timestampMs: 5650,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' They',
								startMs: 5860,
								endMs: 6000,
								timestampMs: 5930,
								confidence: null,
							},
							{
								text: ' are',
								startMs: 6000,
								endMs: 6520,
								timestampMs: 6260,
								confidence: null,
							},
							{
								text: ' really',
								startMs: 6520,
								endMs: 6800,
								timestampMs: 6660,
								confidence: null,
							},
							{
								text: ' really',
								startMs: 6800,
								endMs: 7200,
								timestampMs: 7000,
								confidence: null,
							},
							{
								text: ' sharp.',
								startMs: 7200,
								endMs: 7800,
								timestampMs: 7500,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' You',
								startMs: 8080,
								endMs: 8300,
								timestampMs: 8190,
								confidence: null,
							},
							{
								text: ' could',
								startMs: 8300,
								endMs: 8860,
								timestampMs: 8580,
								confidence: null,
							},
							{
								text: ' actually',
								startMs: 8860,
								endMs: 11420,
								timestampMs: 10140,
								confidence: null,
							},
							{
								text: ' properly',
								startMs: 11420,
								endMs: 12240,
								timestampMs: 11830,
								confidence: null,
							},
							{
								text: ' stab',
								startMs: 12240,
								endMs: 12700,
								timestampMs: 12470,
								confidence: null,
							},
							{
								text: ' somebody',
								startMs: 12700,
								endMs: 12960,
								timestampMs: 12830,
								confidence: null,
							},
							{
								text: ' with',
								startMs: 12960,
								endMs: 13240,
								timestampMs: 13100,
								confidence: null,
							},
							{
								text: ' them.',
								startMs: 13240,
								endMs: 15360,
								timestampMs: 14300,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
						width={1400}
						style={{position: 'absolute', left: 260, bottom: 90}}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="First roll"
					durationInFrames={6.333333333333335 * FPS}
					premountFor={fps}
				>
					<Video
						src={rollerSkiAsset('footage/IMG_0457.MOV')}
						trimBefore={40 * FPS}
						style={videoStyle}
						objectFit="cover"
						premountFor={fps}
						effects={[lut({content: outdoorLut})]}
					/>
					<BasicCaptions
						name="First roll captions"
						captions={[
							{
								text: 'Alright,',
								startMs: 380,
								endMs: 600,
								timestampMs: 490,
								confidence: null,
							},
							{
								text: " let's",
								startMs: 720,
								endMs: 940,
								timestampMs: 830,
								confidence: null,
							},
							{
								text: ' go',
								startMs: 960,
								endMs: 1120,
								timestampMs: 1040,
								confidence: null,
							},
							{
								text: ' to',
								startMs: 1120,
								endMs: 1340,
								timestampMs: 1230,
								confidence: null,
							},
							{
								text: ' work!',
								startMs: 1340,
								endMs: 2100,
								timestampMs: 1720,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
						width={1400}
						style={{position: 'absolute', left: 260, bottom: 90}}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="First roll cutscene"
					durationInFrames={246}
					premountFor={fps}
				>
					<Video
						src={rollerSkiAsset('footage/first-roll-cutscene.mp4')}
						style={videoStyle}
						objectFit="cover"
						premountFor={fps}
						effects={[lut({content: outdoorLut})]}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="Climbing the incline"
					durationInFrames={12.4 * FPS}
					premountFor={fps}
				>
					<Video
						src={rollerSkiAsset('footage/IMG_0459.MOV')}
						trimBefore={1 * FPS}
						style={videoStyle}
						objectFit="cover"
						premountFor={fps}
						effects={[lut({content: outdoorLut})]}
						volume={interpolate(frame, [2697, 2896], [1, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})}
					/>
					<BasicCaptions
						name="Climbing the incline captions"
						captions={[
							{
								text: 'Okay, so now we have a bit of an incline.',
								startMs: 220,
								endMs: 2160,
								timestampMs: 1190,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: " It's a great time to show you one of the awesome features of these roller skis,",
								startMs: 2320,
								endMs: 8980,
								timestampMs: 5650,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' which is that you cannot roll backwards.',
								startMs: 9120,
								endMs: 12940,
								timestampMs: 11030,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
						width={1400}
						style={{position: 'absolute', left: 260, bottom: 90}}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="How the skis roll"
					durationInFrames={15 * FPS}
					premountFor={fps}
				>
					<Video
						src={rollerSkiAsset('footage/IMG_0475.MOV')}
						trimBefore={93 * FPS}
						style={videoStyle}
						objectFit="cover"
						premountFor={fps}
						effects={[lut({content: studioLut})]}
					/>
					<BasicCaptions
						name="How the skis roll captions"
						captions={[
							{
								text: ' And',
								startMs: 0,
								endMs: 600,
								timestampMs: 230,
								confidence: null,
							},
							{
								text: ' here',
								startMs: 600,
								endMs: 720,
								timestampMs: 660,
								confidence: null,
							},
							{
								text: ' you',
								startMs: 720,
								endMs: 840,
								timestampMs: 780,
								confidence: null,
							},
							{
								text: ' can',
								startMs: 840,
								endMs: 1020,
								timestampMs: 930,
								confidence: null,
							},
							{
								text: ' also',
								startMs: 1020,
								endMs: 1280,
								timestampMs: 1150,
								confidence: null,
							},
							{
								text: ' see',
								startMs: 1280,
								endMs: 1520,
								timestampMs: 1400,
								confidence: null,
							},
							{
								text: ' very',
								startMs: 1520,
								endMs: 1780,
								timestampMs: 1650,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' well',
								startMs: 1780,
								endMs: 2040,
								timestampMs: 1910,
								confidence: null,
							},
							{
								text: ' that',
								startMs: 2040,
								endMs: 2860,
								timestampMs: 2450,
								confidence: null,
							},
							{
								text: ' it',
								startMs: 2860,
								endMs: 3100,
								timestampMs: 2980,
								confidence: null,
							},
							{
								text: ' rolls',
								startMs: 3100,
								endMs: 3620,
								timestampMs: 3360,
								confidence: null,
							},
							{
								text: ' on',
								startMs: 3620,
								endMs: 3840,
								timestampMs: 3730,
								confidence: null,
							},
							{
								text: ' one',
								startMs: 3840,
								endMs: 4160,
								timestampMs: 4000,
								confidence: null,
							},
							{
								text: ' side,',
								startMs: 4160,
								endMs: 4780,
								timestampMs: 4470,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' but',
								startMs: 4840,
								endMs: 5000,
								timestampMs: 4920,
								confidence: null,
							},
							{
								text: ' then',
								startMs: 5120,
								endMs: 5360,
								timestampMs: 5240,
								confidence: null,
							},
							{
								text: '...',
								startMs: 5360,
								endMs: 5380,
								timestampMs: 5370,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' It',
								startMs: 5680,
								endMs: 5900,
								timestampMs: 5790,
								confidence: null,
							},
							{
								text: " doesn't?",
								startMs: 5900,
								endMs: 6420,
								timestampMs: 6160,
								confidence: null,
							},
							{
								text: ' Oh,',
								startMs: 6660,
								endMs: 7540,
								timestampMs: 7100,
								confidence: null,
							},
							{
								text: ' wow.',
								startMs: 7540,
								endMs: 7620,
								timestampMs: 7580,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' Oh,',
								startMs: 7940,
								endMs: 8320,
								timestampMs: 8130,
								confidence: null,
							},
							{
								text: ' wow.',
								startMs: 8440,
								endMs: 8500,
								timestampMs: 8580,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' This',
								startMs: 8820,
								endMs: 9220,
								timestampMs: 9020,
								confidence: null,
							},
							{
								text: ' is',
								startMs: 9220,
								endMs: 9340,
								timestampMs: 9280,
								confidence: null,
							},
							{
								text: ' cool.',
								startMs: 9340,
								endMs: 10000,
								timestampMs: 9670,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' Locked in on the other side.',
								startMs: 10000,
								endMs: 10850,
								timestampMs: 10425,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' So',
								startMs: 10850,
								endMs: 11200,
								timestampMs: 11025,
								confidence: null,
							},
							{
								text: ' you',
								startMs: 11200,
								endMs: 11480,
								timestampMs: 11340,
								confidence: null,
							},
							{
								text: ' can',
								startMs: 11480,
								endMs: 12320,
								timestampMs: 11900,
								confidence: null,
							},
							{
								text: ' really',
								startMs: 12320,
								endMs: 12700,
								timestampMs: 12510,
								confidence: null,
							},
							{
								text: ' easily',
								startMs: 12700,
								endMs: 12960,
								timestampMs: 12830,
								confidence: null,
							},
							{
								text: ' go',
								startMs: 12960,
								endMs: 13160,
								timestampMs: 13060,
								confidence: null,
							},
							{
								text: ' up',
								startMs: 13160,
								endMs: 13300,
								timestampMs: 13230,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' a',
								startMs: 13300,
								endMs: 13460,
								timestampMs: 13380,
								confidence: null,
							},
							{
								text: ' hill.',
								startMs: 13460,
								endMs: 14860,
								timestampMs: 14160,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
						italicRangesMs={[[5680, 10000]]}
						width={1400}
						style={{position: 'absolute', left: 260, bottom: 90}}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="People look at me weird"
					durationInFrames={6.7 * FPS}
					premountFor={fps}
				>
					<Video
						src={rollerSkiAsset('footage/IMG_0459.MOV')}
						trimBefore={38 * FPS}
						style={{...videoStyle, rotate: '180deg'}}
						objectFit="cover"
						premountFor={fps}
						effects={[lut({content: outdoorLut})]}
					/>
					<BasicCaptions
						name="People look at me weird captions"
						captions={[
							{
								text: 'One thing I have to tell you, though,',
								startMs: 260,
								endMs: 1560,
								timestampMs: 910,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' is that all the people are looking a bit weird.',
								startMs: 1560,
								endMs: 6660,
								timestampMs: 4110,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
						width={1400}
						style={{position: 'absolute', left: 260, bottom: 90}}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="Cows react"
					durationInFrames={6.7 * FPS}
					premountFor={fps}
				>
					<Video
						src={rollerSkiAsset('footage/IMG_0460.MOV')}
						muted
						style={videoStyle}
						objectFit="cover"
						premountFor={fps}
						durationInFrames={220}
						effects={[lut({content: outdoorLut})]}
					/>
					<Audio
						src={rollerSkiAsset('footage/IMG_0459.MOV')}
						trimBefore={58 * FPS}
						durationInFrames={184}
					/>
					<BasicCaptions
						name="Cows react captions"
						captions={[
							{
								text: 'I feel like even the cows...',
								startMs: 480,
								endMs: 1700,
								timestampMs: 1090,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: " they're looking a bit skeptical at me.",
								startMs: 3640,
								endMs: 6540,
								timestampMs: 5090,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
						width={1400}
						style={{position: 'absolute', left: 260, bottom: 90}}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="Why roller skiing"
					durationInFrames={57.03333333333333 * FPS}
					premountFor={fps}
					trimBefore={22}
				>
					<Video
						src={rollerSkiAsset('footage/webcam1790843470902.mp4')}
						trimBefore={30}
						style={videoStyle}
						objectFit="cover"
						premountFor={fps}
						effects={[lut({content: studioLut})]}
					/>
					<Sequence
						name="Hackathon half-marathon b-roll"
						from={7.2 * FPS}
						durationInFrames={9 * FPS}
						premountFor={fps}
					>
						<Video
							src={rollerSkiAsset('footage/jonny-hackathon-half-marathon.mp4')}
							muted
							style={videoStyle}
							objectFit="cover"
							premountFor={fps}
						/>
						<div
							style={{
								position: 'absolute',
								top: 52,
								left: 64,
								maxWidth: 900,
								padding: '18px 24px',
								borderRadius: 10,
								backgroundColor: 'rgba(12, 18, 22, 0.82)',
								color: 'white',
								fontFamily: 'Arial, Helvetica, sans-serif',
								boxShadow: '0 8px 30px rgba(0, 0, 0, 0.24)',
								display: 'flex',
								alignItems: 'center',
								gap: 16,
							}}
						>
							<WhiteYouTubeIcon />
							<div>
								<div style={{fontSize: 27, fontWeight: 700, lineHeight: 1.2}}>
									Jonny Burger
								</div>
								<div style={{fontSize: 23, lineHeight: 1.25, marginTop: 5}}>
									Winning Europe's biggest hackathon
								</div>
							</div>
						</div>
					</Sequence>
					<Sequence
						name="SkiErg demonstration b-roll"
						from={24.2 * FPS}
						durationInFrames={5.5 * FPS}
						premountFor={fps}
					>
						<Video
							src={rollerSkiAsset('footage/skierg-hwpo-broll.mp4')}
							muted
							style={videoStyle}
							objectFit="cover"
							premountFor={fps}
						/>
						<div
							style={{
								position: 'absolute',
								top: 52,
								left: 64,
								maxWidth: 900,
								padding: '18px 24px',
								borderRadius: 10,
								backgroundColor: 'rgba(12, 18, 22, 0.82)',
								color: 'white',
								fontFamily: 'Arial, Helvetica, sans-serif',
								boxShadow: '0 8px 30px rgba(0, 0, 0, 0.24)',
								display: 'flex',
								alignItems: 'center',
								gap: 16,
							}}
						>
							<WhiteYouTubeIcon />
							<div>
								<div style={{fontSize: 27, fontWeight: 700, lineHeight: 1.2}}>
									Mat Fraser | HWPO
								</div>
								<div style={{fontSize: 23, lineHeight: 1.25, marginTop: 5}}>
									What is the SkiErg? Tips &amp; Tricks for HYROX
								</div>
							</div>
						</div>
					</Sequence>
					<BasicCaptions
						name="Why roller skiing captions"
						captions={[
							{
								text: 'Okay,',
								startMs: 1020,
								endMs: 1100,
								timestampMs: 1060,
								confidence: null,
							},
							{
								text: ' so',
								startMs: 1220,
								endMs: 1360,
								timestampMs: 1290,
								confidence: null,
							},
							{
								text: ' the',
								startMs: 1360,
								endMs: 1640,
								timestampMs: 1500,
								confidence: null,
							},
							{
								text: ' actual',
								startMs: 1640,
								endMs: 1880,
								timestampMs: 1760,
								confidence: null,
							},
							{
								text: ' reason',
								startMs: 1880,
								endMs: 2160,
								timestampMs: 2020,
								confidence: null,
							},
							{
								text: ' why',
								startMs: 2160,
								endMs: 2280,
								timestampMs: 2220,
								confidence: null,
							},
							{
								text: ' I',
								startMs: 2280,
								endMs: 2440,
								timestampMs: 2360,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' want',
								startMs: 2440,
								endMs: 2540,
								timestampMs: 2490,
								confidence: null,
							},
							{
								text: ' to',
								startMs: 2540,
								endMs: 2700,
								timestampMs: 2620,
								confidence: null,
							},
							{
								text: ' get',
								startMs: 2700,
								endMs: 3060,
								timestampMs: 2880,
								confidence: null,
							},
							{
								text: ' into',
								startMs: 3060,
								endMs: 3360,
								timestampMs: 3210,
								confidence: null,
							},
							{
								text: ' roller',
								startMs: 3360,
								endMs: 3660,
								timestampMs: 3510,
								confidence: null,
							},
							{
								text: ' skiing',
								startMs: 3660,
								endMs: 4020,
								timestampMs: 3840,
								confidence: null,
							},
							{
								text: ' is',
								startMs: 4020,
								endMs: 5160,
								timestampMs: 4590,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' that',
								startMs: 5160,
								endMs: 6700,
								timestampMs: 5930,
								confidence: null,
							},
							{
								text: ' essentially',
								startMs: 6700,
								endMs: 7180,
								timestampMs: 6940,
								confidence: null,
							},
							{
								text: ' I',
								startMs: 7180,
								endMs: 7380,
								timestampMs: 7280,
								confidence: null,
							},
							{
								text: ' would',
								startMs: 7380,
								endMs: 7520,
								timestampMs: 7450,
								confidence: null,
							},
							{
								text: ' actually',
								startMs: 7920,
								endMs: 8340,
								timestampMs: 8130,
								confidence: null,
							},
							{
								text: ' prefer',
								startMs: 8340,
								endMs: 8680,
								timestampMs: 8510,
								confidence: null,
							},
							{
								text: ' to',
								startMs: 8680,
								endMs: 9160,
								timestampMs: 8920,
								confidence: null,
								pageBreakAfter: false,
							},
							{
								text: ' run,',
								startMs: 9160,
								endMs: 9400,
								timestampMs: 9280,
								confidence: null,
							},
							{
								text: ' but',
								startMs: 9540,
								endMs: 9780,
								timestampMs: 9660,
								confidence: null,
							},
							{
								text: ' my',
								startMs: 9780,
								endMs: 10080,
								timestampMs: 9930,
								confidence: null,
							},
							{
								text: ' heel',
								startMs: 10080,
								endMs: 10420,
								timestampMs: 10250,
								confidence: null,
							},
							{
								text: ' is',
								startMs: 10420,
								endMs: 11280,
								timestampMs: 10850,
								confidence: null,
							},
							{
								text: ' hurting',
								startMs: 11280,
								endMs: 11660,
								timestampMs: 11470,
								confidence: null,
							},
							{
								text: ' a',
								startMs: 11660,
								endMs: 11920,
								timestampMs: 11790,
								confidence: null,
								pageBreakAfter: false,
							},
							{
								text: ' bit.',
								startMs: 11920,
								endMs: 12660,
								timestampMs: 12290,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' And',
								startMs: 12720,
								endMs: 12840,
								timestampMs: 12780,
								confidence: null,
							},
							{
								text: ' so',
								startMs: 12840,
								endMs: 12940,
								timestampMs: 12890,
								confidence: null,
							},
							{
								text: " I'm",
								startMs: 12940,
								endMs: 13160,
								timestampMs: 13050,
								confidence: null,
							},
							{
								text: ' looking',
								startMs: 13160,
								endMs: 13480,
								timestampMs: 13320,
								confidence: null,
							},
							{
								text: ' for',
								startMs: 13480,
								endMs: 14020,
								timestampMs: 13750,
								confidence: null,
							},
							{
								text: ' another',
								startMs: 14020,
								endMs: 14580,
								timestampMs: 14300,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' sport',
								startMs: 14580,
								endMs: 15180,
								timestampMs: 14880,
								confidence: null,
							},
							{
								text: ' that',
								startMs: 15180,
								endMs: 16600,
								timestampMs: 15890,
								confidence: null,
							},
							{
								text: ' has',
								startMs: 16600,
								endMs: 16980,
								timestampMs: 16790,
								confidence: null,
							},
							{
								text: ' at',
								startMs: 16980,
								endMs: 17100,
								timestampMs: 17040,
								confidence: null,
							},
							{
								text: ' least',
								startMs: 17100,
								endMs: 17280,
								timestampMs: 17190,
								confidence: null,
							},
							{
								text: ' a',
								startMs: 17280,
								endMs: 17420,
								timestampMs: 17350,
								confidence: null,
							},
							{
								text: ' bit',
								startMs: 17420,
								endMs: 17560,
								timestampMs: 17490,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' of',
								startMs: 17560,
								endMs: 18200,
								timestampMs: 17880,
								confidence: null,
							},
							{
								text: ' intensity.',
								startMs: 18200,
								endMs: 19740,
								timestampMs: 18970,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' And',
								startMs: 20980,
								endMs: 21720,
								timestampMs: 21350,
								confidence: null,
							},
							{
								text: ' in',
								startMs: 21720,
								endMs: 22100,
								timestampMs: 21910,
								confidence: null,
							},
							{
								text: ' the',
								startMs: 22100,
								endMs: 22660,
								timestampMs: 22380,
								confidence: null,
							},
							{
								text: ' gym,',
								startMs: 22660,
								endMs: 22980,
								timestampMs: 22820,
								confidence: null,
							},
							{
								text: " there's",
								startMs: 23160,
								endMs: 23440,
								timestampMs: 23300,
								confidence: null,
							},
							{
								text: ' this',
								startMs: 23440,
								endMs: 23640,
								timestampMs: 23540,
								confidence: null,
							},
							{
								text: ' cool',
								startMs: 23660,
								endMs: 23960,
								timestampMs: 23810,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' machine',
								startMs: 23960,
								endMs: 24260,
								timestampMs: 24110,
								confidence: null,
							},
							{
								text: ' called',
								startMs: 24260,
								endMs: 24560,
								timestampMs: 24410,
								confidence: null,
							},
							{
								text: ' the',
								startMs: 24560,
								endMs: 24780,
								timestampMs: 24670,
								confidence: null,
							},
							{
								text: ' SkiErg.',
								startMs: 24780,
								endMs: 25600,
								timestampMs: 25190,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: " It's",
								startMs: 26160,
								endMs: 26660,
								timestampMs: 26410,
								confidence: null,
							},
							{
								text: ' also',
								startMs: 26660,
								endMs: 27320,
								timestampMs: 26990,
								confidence: null,
							},
							{
								text: ' one',
								startMs: 27320,
								endMs: 27540,
								timestampMs: 27430,
								confidence: null,
							},
							{
								text: ' of',
								startMs: 27540,
								endMs: 28300,
								timestampMs: 27920,
								confidence: null,
							},
							{
								text: ' the',
								startMs: 28300,
								endMs: 29380,
								timestampMs: 28840,
								confidence: null,
							},
							{
								text: ' disciplines',
								startMs: 29380,
								endMs: 29740,
								timestampMs: 29560,
								confidence: null,
							},
							{
								text: ' in',
								startMs: 29740,
								endMs: 29920,
								timestampMs: 29830,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' HYROX',
								startMs: 29920,
								endMs: 30440,
								timestampMs: 30180,
								confidence: null,
							},
							{
								text: ' which',
								startMs: 30440,
								endMs: 30660,
								timestampMs: 30550,
								confidence: null,
							},
							{
								text: ' I',
								startMs: 30660,
								endMs: 30820,
								timestampMs: 30740,
								confidence: null,
							},
							{
								text: ' will',
								startMs: 30820,
								endMs: 31100,
								timestampMs: 30960,
								confidence: null,
							},
							{
								text: ' be',
								startMs: 31100,
								endMs: 31960,
								timestampMs: 31530,
								confidence: null,
							},
							{
								text: ' participating',
								startMs: 31960,
								endMs: 32580,
								timestampMs: 32270,
								confidence: null,
							},
							{
								text: ' in',
								startMs: 32580,
								endMs: 33220,
								timestampMs: 32900,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' in',
								startMs: 33220,
								endMs: 34080,
								timestampMs: 33650,
								confidence: null,
							},
							{
								text: ' February.',
								startMs: 34080,
								endMs: 34720,
								timestampMs: 34400,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' And',
								startMs: 35020,
								endMs: 35200,
								timestampMs: 35110,
								confidence: null,
							},
							{
								text: ' now',
								startMs: 35200,
								endMs: 35360,
								timestampMs: 35280,
								confidence: null,
							},
							{
								text: " I'm",
								startMs: 35360,
								endMs: 35520,
								timestampMs: 35440,
								confidence: null,
							},
							{
								text: ' not',
								startMs: 35520,
								endMs: 35720,
								timestampMs: 35620,
								confidence: null,
							},
							{
								text: ' gonna',
								startMs: 35720,
								endMs: 36040,
								timestampMs: 35880,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' put',
								startMs: 36040,
								endMs: 36500,
								timestampMs: 36270,
								confidence: null,
							},
							{
								text: ' any',
								startMs: 36500,
								endMs: 37120,
								timestampMs: 36810,
								confidence: null,
							},
							{
								text: ' AI',
								startMs: 37120,
								endMs: 37420,
								timestampMs: 37270,
								confidence: null,
							},
							{
								text: ' tattoos',
								startMs: 37420,
								endMs: 37880,
								timestampMs: 37650,
								confidence: null,
							},
							{
								text: ' on',
								startMs: 37880,
								endMs: 38040,
								timestampMs: 37960,
								confidence: null,
							},
							{
								text: ' my',
								startMs: 38040,
								endMs: 38460,
								timestampMs: 38250,
								confidence: null,
							},
							{
								text: ' body.',
								startMs: 38460,
								endMs: 38920,
								timestampMs: 38690,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: " Don't",
								startMs: 39780,
								endMs: 40120,
								timestampMs: 39950,
								confidence: null,
							},
							{
								text: ' worry.',
								startMs: 40120,
								endMs: 40680,
								timestampMs: 40400,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' Anyway,',
								startMs: 42340,
								endMs: 42520,
								timestampMs: 42430,
								confidence: null,
							},
							{
								text: ' this',
								startMs: 42840,
								endMs: 43000,
								timestampMs: 42920,
								confidence: null,
							},
							{
								text: ' is',
								startMs: 43000,
								endMs: 43260,
								timestampMs: 43130,
								confidence: null,
							},
							{
								text: ' cool',
								startMs: 43260,
								endMs: 43700,
								timestampMs: 43480,
								confidence: null,
							},
							{
								text: ' but',
								startMs: 43700,
								endMs: 43940,
								timestampMs: 43820,
								confidence: null,
							},
							{
								text: ' it',
								startMs: 43940,
								endMs: 44120,
								timestampMs: 44030,
								confidence: null,
							},
							{
								text: ' is',
								startMs: 44120,
								endMs: 44640,
								timestampMs: 44380,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' inside',
								startMs: 44640,
								endMs: 44880,
								timestampMs: 44760,
								confidence: null,
							},
							{
								text: ' and',
								startMs: 44880,
								endMs: 45220,
								timestampMs: 45050,
								confidence: null,
							},
							{
								text: ' therefore',
								startMs: 45220,
								endMs: 45480,
								timestampMs: 45350,
								confidence: null,
							},
							{
								text: ' it',
								startMs: 45480,
								endMs: 45580,
								timestampMs: 45530,
								confidence: null,
							},
							{
								text: ' is',
								startMs: 45580,
								endMs: 45780,
								timestampMs: 45680,
								confidence: null,
							},
							{
								text: ' pretty',
								startMs: 45780,
								endMs: 46080,
								timestampMs: 45930,
								confidence: null,
							},
							{
								text: ' boring',
								startMs: 46080,
								endMs: 46120,
								timestampMs: 46100,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' and',
								startMs: 47360,
								endMs: 48700,
								timestampMs: 48030,
								confidence: null,
							},
							{
								text: ' roller',
								startMs: 48700,
								endMs: 48940,
								timestampMs: 48820,
								confidence: null,
							},
							{
								text: ' skis',
								startMs: 48940,
								endMs: 49480,
								timestampMs: 49210,
								confidence: null,
							},
							{
								text: ' are',
								startMs: 49480,
								endMs: 49860,
								timestampMs: 49670,
								confidence: null,
							},
							{
								text: ' essentially',
								startMs: 49860,
								endMs: 50600,
								timestampMs: 50230,
								confidence: null,
							},
							{
								text: ' the',
								startMs: 50600,
								endMs: 51060,
								timestampMs: 50830,
								confidence: null,
							},
							{
								text: ' equivalent',
								startMs: 51060,
								endMs: 52280,
								timestampMs: 51670,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' of',
								startMs: 52280,
								endMs: 52640,
								timestampMs: 52460,
								confidence: null,
							},
							{
								text: ' a',
								startMs: 52640,
								endMs: 52900,
								timestampMs: 52770,
								confidence: null,
							},
							{
								text: ' SkiErg',
								startMs: 52900,
								endMs: 54220,
								timestampMs: 53560,
								confidence: null,
							},
							{
								text: ' but',
								startMs: 54220,
								endMs: 54880,
								timestampMs: 54550,
								confidence: null,
							},
							{
								text: ' outside',
								startMs: 54880,
								endMs: 55180,
								timestampMs: 55030,
								confidence: null,
							},
							{
								text: ' so',
								startMs: 55180,
								endMs: 55300,
								timestampMs: 55240,
								confidence: null,
							},
							{
								text: ' I',
								startMs: 55300,
								endMs: 55480,
								timestampMs: 55390,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' can',
								startMs: 55480,
								endMs: 55740,
								timestampMs: 55610,
								confidence: null,
							},
							{
								text: ' roll',
								startMs: 55740,
								endMs: 56040,
								timestampMs: 55890,
								confidence: null,
							},
							{
								text: ' around',
								startMs: 56080,
								endMs: 56240,
								timestampMs: 56160,
								confidence: null,
							},
							{
								text: ' in',
								startMs: 56260,
								endMs: 56620,
								timestampMs: 56440,
								confidence: null,
							},
							{
								text: ' beautiful',
								startMs: 56620,
								endMs: 56820,
								timestampMs: 56720,
								confidence: null,
							},
							{
								text: ' Switzerland',
								startMs: 56820,
								endMs: 58920,
								timestampMs: 57870,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
						width={1400}
						style={{position: 'absolute', left: 260, bottom: 90}}
						combineTokensWithinMilliseconds={4500}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="Best commute footage"
					durationInFrames={444}
					premountFor={fps}
				>
					<Video
						src={rollerSkiAsset('footage/IMG_0463.MOV')}
						trimBefore={0}
						style={videoStyle}
						objectFit="cover"
						premountFor={fps}
						effects={[lut({content: outdoorLut})]}
					/>
					<BasicCaptions
						name="Best commute footage captions"
						captions={[
							{
								text: 'Guys, out of all of the tech bros out there,',
								startMs: 1880,
								endMs: 4860,
								timestampMs: 3370,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: 'I do probably have the best commute, right?',
								startMs: 5880,
								endMs: 10100,
								timestampMs: 7990,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: 'Come on!',
								startMs: 10300,
								endMs: 11280,
								timestampMs: 10790,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: 'Chickens, cows,',
								startMs: 11600,
								endMs: 13480,
								timestampMs: 12540,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
						width={1400}
						style={{position: 'absolute', left: 260, bottom: 90}}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="Approaching the crossing"
					durationInFrames={321}
					premountFor={fps}
				>
					<Video
						src={rollerSkiAsset('footage/IMG_0464.MOV')}
						trimBefore={1 * FPS}
						style={videoStyle}
						objectFit="cover"
						premountFor={fps}
						effects={[lut({content: outdoorLut})]}
					/>
					<BasicCaptions
						name="Approaching the crossing captions"
						captions={[
							{
								text: 'Okay,',
								startMs: 220,
								endMs: 320,
								timestampMs: 270,
								confidence: null,
							},
							{
								text: " I'm",
								startMs: 400,
								endMs: 720,
								timestampMs: 560,
								confidence: null,
							},
							{
								text: ' standing',
								startMs: 720,
								endMs: 940,
								timestampMs: 830,
								confidence: null,
							},
							{
								text: ' on',
								startMs: 940,
								endMs: 1340,
								timestampMs: 1140,
								confidence: null,
							},
							{
								text: ' top',
								startMs: 1340,
								endMs: 1820,
								timestampMs: 1580,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' of',
								startMs: 1820,
								endMs: 2220,
								timestampMs: 2020,
								confidence: null,
							},
							{
								text: ' a',
								startMs: 2220,
								endMs: 3060,
								timestampMs: 2640,
								confidence: null,
							},
							{
								text: ' small',
								startMs: 3060,
								endMs: 3680,
								timestampMs: 3370,
								confidence: null,
							},
							{
								text: ' decline',
								startMs: 3680,
								endMs: 4000,
								timestampMs: 3840,
								confidence: null,
							},
							{
								text: ' and',
								startMs: 4000,
								endMs: 4160,
								timestampMs: 4080,
								confidence: null,
							},
							{
								text: ' it',
								startMs: 4160,
								endMs: 4340,
								timestampMs: 4250,
								confidence: null,
							},
							{
								text: ' goes',
								startMs: 4340,
								endMs: 4700,
								timestampMs: 4520,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' right',
								startMs: 4700,
								endMs: 4940,
								timestampMs: 4820,
								confidence: null,
							},
							{
								text: ' onto',
								startMs: 4940,
								endMs: 5120,
								timestampMs: 5030,
								confidence: null,
							},
							{
								text: ' the',
								startMs: 5120,
								endMs: 5440,
								timestampMs: 5280,
								confidence: null,
							},
							{
								text: ' street.',
								startMs: 5440,
								endMs: 6400,
								timestampMs: 5920,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' And',
								startMs: 6940,
								endMs: 7740,
								timestampMs: 7340,
								confidence: null,
							},
							{
								text: ' here',
								startMs: 7740,
								endMs: 8000,
								timestampMs: 7870,
								confidence: null,
							},
							{
								text: ' comes',
								startMs: 8000,
								endMs: 8340,
								timestampMs: 8170,
								confidence: null,
							},
							{
								text: ' one',
								startMs: 8340,
								endMs: 8520,
								timestampMs: 8430,
								confidence: null,
							},
							{
								text: ' of',
								startMs: 8520,
								endMs: 8700,
								timestampMs: 8610,
								confidence: null,
							},
							{
								text: ' the',
								startMs: 8700,
								endMs: 9180,
								timestampMs: 8940,
								confidence: null,
							},
							{
								text: ' problems',
								startMs: 9180,
								endMs: 9580,
								timestampMs: 9380,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' with',
								startMs: 9580,
								endMs: 9980,
								timestampMs: 9780,
								confidence: null,
							},
							{
								text: ' roller',
								startMs: 9980,
								endMs: 10280,
								timestampMs: 10130,
								confidence: null,
							},
							{
								text: ' skis.',
								startMs: 10280,
								endMs: 10520,
								timestampMs: 10400,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
						width={1400}
						style={{position: 'absolute', left: 260, bottom: 90}}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="Mehmet considers the roller skis"
					durationInFrames={20.733333333333334 * FPS}
					premountFor={fps}
					trimBefore={71}
				>
					<Video
						src={rollerSkiAsset('footage/IMG_0475.MOV')}
						trimBefore={42 * FPS}
						style={videoStyle}
						objectFit="cover"
						premountFor={fps}
						effects={[lut({content: studioLut})]}
					/>
					<BasicCaptions
						name="Mehmet conversation captions"
						captions={[
							{
								text: 'And Mehmet, would you try it?',
								startMs: 340,
								endMs: 4800,
								timestampMs: 2570,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: 'If you give me a one-on-one, then maybe I would.',
								startMs: 6500,
								endMs: 12400,
								timestampMs: 9450,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: 'But I would be scared, to be honest. It seems rather difficult.',
								startMs: 13300,
								endMs: 18400,
								timestampMs: 15850,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: 'Yes, there are no brakes.',
								startMs: 19740,
								endMs: 21200,
								timestampMs: 20470,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: 'Yeah, I see.',
								startMs: 21720,
								endMs: 23000,
								timestampMs: 22360,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
						italicRangesMs={[
							[6500, 18400],
							[21720, 23000],
						]}
						width={1400}
						style={{position: 'absolute', left: 260, bottom: 90}}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="After the descent"
					durationInFrames={924}
					premountFor={fps}
				>
					<Video
						src={rollerSkiAsset('footage/IMG_0465.MOV')}
						trimBefore={0}
						style={videoStyle}
						objectFit="cover"
						premountFor={fps}
						effects={[lut({content: outdoorLut})]}
					/>
					<BasicCaptions
						name="After the descent captions"
						captions={[
							{
								text: 'Okay,',
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
								pageBreakAfter: true,
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
								endMs: 4040,
								timestampMs: 3750,
								confidence: null,
							},
							{
								text: ' of',
								startMs: 4040,
								endMs: 4040,
								timestampMs: 4040,
								confidence: null,
							},
							{
								text: ' kindergarten',
								startMs: 4040,
								endMs: 4520,
								timestampMs: 4280,
								confidence: null,
							},
							{
								text: ' kids',
								startMs: 4520,
								endMs: 5540,
								timestampMs: 5030,
								confidence: null,
							},
							{
								text: ' was',
								startMs: 5540,
								endMs: 5540,
								timestampMs: 5540,
								confidence: null,
							},
							{
								text: ' coming',
								startMs: 5940,
								endMs: 6300,
								timestampMs: 6120,
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
								endMs: 6740,
								timestampMs: 6660,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' and',
								startMs: 6740,
								endMs: 6940,
								timestampMs: 6840,
								confidence: null,
							},
							{
								text: ' then',
								startMs: 6940,
								endMs: 7280,
								timestampMs: 7110,
								confidence: null,
							},
							{
								text: ' and',
								startMs: 7280,
								endMs: 7380,
								timestampMs: 7330,
								confidence: null,
							},
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
								startMs: 8080,
								endMs: 8920,
								timestampMs: 8500,
								confidence: null,
								pageBreakAfter: true,
							},
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
								pageBreakAfter: true,
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
								startMs: 12380,
								endMs: 13280,
								timestampMs: 12830,
								confidence: null,
								pageBreakAfter: true,
							},
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
							{
								text: ' down',
								startMs: 14140,
								endMs: 16080,
								timestampMs: 15110,
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
								endMs: 17380,
								timestampMs: 16960,
								confidence: null,
								pageBreakAfter: true,
							},
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
								startMs: 23680,
								endMs: 23680,
								timestampMs: 23680,
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
								pageBreakAfter: true,
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
								pageBreakAfter: true,
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
						width={1400}
						style={{position: 'absolute', left: 260, bottom: 90}}
						combineTokensWithinMilliseconds={3500}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="Arriving at Remotion"
					durationInFrames={230}
					premountFor={fps}
				>
					<Video
						src={rollerSkiAsset('footage/IMG_0473.MOV')}
						trimBefore={0}
						style={videoStyle}
						objectFit="cover"
						premountFor={fps}
						effects={[lut({content: outdoorLut})]}
					/>
					<BasicCaptions
						name="Arriving at Remotion captions"
						captions={[
							{
								text: 'Here we are, baby!',
								startMs: 3960,
								endMs: 5000,
								timestampMs: 4480,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: 'Remotion headquarters.',
								startMs: 5840,
								endMs: 8000,
								timestampMs: 6920,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
						width={1400}
						style={{position: 'absolute', left: 260, bottom: 90}}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="Remotion office exterior"
					durationInFrames={150}
					premountFor={fps}
					trimBefore={95}
				>
					<Video
						src={rollerSkiAsset('footage/IMG_0474.MOV')}
						trimBefore={0}
						style={videoStyle}
						objectFit="cover"
						premountFor={fps}
						effects={[lut({content: outdoorLut})]}
					/>
					<BasicCaptions
						name="Remotion office exterior captions"
						captions={[
							{
								text: '',
								startMs: 2340,
								endMs: 3320,
								timestampMs: 2830,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: 'Mehmet is already working',
								startMs: 4420,
								endMs: 6658,
								timestampMs: 5539,
								confidence: null,
								pageBreakAfter: false,
							},
							{
								text: ' doing business!',
								startMs: 6658,
								endMs: 8000,
								timestampMs: 7329,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
						width={1400}
						style={{position: 'absolute', left: 260, bottom: 90}}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="Closing thoughts"
					durationInFrames={798}
					premountFor={fps}
				>
					<StravaRidesBroll
						name="Four Strava rides b-roll"
						from={2 * FPS}
						durationInFrames={STRAVA_BROLL_DURATION}
						premountFor={fps}
					/>
					<BasicCaptions
						name="Closing thoughts captions"
						captions={closingThoughtsBeforeCaptions}
						width={1400}
						style={{position: 'absolute', left: 260, bottom: 90}}
						combineTokensWithinMilliseconds={3500}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="How to brake — demonstration"
					durationInFrames={1164}
					premountFor={fps}
				>
					<Video
						src={rollerSkiAsset('footage/IMG_0478.MOV')}
						trimBefore={95}
						style={videoStyle}
						objectFit="cover"
						premountFor={fps}
						effects={[lut({content: outdoorLut})]}
					/>
					<BasicCaptions
						name="How to brake captions"
						captions={brakingDemonstrationCaptions}
						width={1400}
						style={{position: 'absolute', left: 260, bottom: 90}}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="How to brake — conclusion"
					durationInFrames={82}
					premountFor={fps}
				>
					<Video
						src={rollerSkiAsset('footage/IMG_0478.MOV')}
						trimBefore={1602}
						style={videoStyle}
						objectFit="cover"
						premountFor={fps}
						effects={[lut({content: outdoorLut})]}
					/>
					<BasicCaptions
						name="How to brake conclusion captions"
						captions={brakingConclusionCaptions}
						width={1400}
						style={{position: 'absolute', left: 260, bottom: 90}}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="Closing thoughts (continued)"
					durationInFrames={1567}
					premountFor={fps}
				>
					<Video
						src={rollerSkiAsset('footage/webcam1790859120255.mp4')}
						trimBefore={899}
						style={{
							...videoStyle,
							transform: 'translateY(-55px) scale(1.12)',
						}}
						objectFit="cover"
						premountFor={fps}
						effects={[lut({content: studioLut})]}
					/>
					<BasicCaptions
						name="Closing thoughts continued captions"
						captions={closingThoughtsAfterCaptions}
						width={1400}
						style={{position: 'absolute', left: 260, bottom: 90}}
						combineTokensWithinMilliseconds={3500}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="Outro"
					durationInFrames={287}
					premountFor={fps}
				>
					<Video
						src={rollerSkiAsset('footage/webcam1790859310676.mp4')}
						trimBefore={30}
						style={videoStyle}
						objectFit="cover"
						premountFor={fps}
						effects={[lut({content: studioLut})]}
					/>
					<BasicCaptions
						name="Outro captions"
						captions={[
							{
								text: 'Thank',
								startMs: 440,
								endMs: 580,
								timestampMs: 510,
								confidence: null,
							},
							{
								text: ' you',
								startMs: 580,
								endMs: 780,
								timestampMs: 680,
								confidence: null,
							},
							{
								text: ' for',
								startMs: 780,
								endMs: 1040,
								timestampMs: 910,
								confidence: null,
							},
							{
								text: ' sticking',
								startMs: 1040,
								endMs: 1300,
								timestampMs: 1170,
								confidence: null,
							},
							{
								text: ' to',
								startMs: 1300,
								endMs: 1420,
								timestampMs: 1360,
								confidence: null,
							},
							{
								text: ' the',
								startMs: 1420,
								endMs: 1560,
								timestampMs: 1490,
								confidence: null,
							},
							{
								text: ' end',
								startMs: 1560,
								endMs: 1720,
								timestampMs: 1640,
								confidence: null,
							},
							{
								text: ' and',
								startMs: 1720,
								endMs: 2180,
								timestampMs: 1950,
								confidence: null,
							},
							{
								text: ' actually',
								startMs: 2180,
								endMs: 2500,
								timestampMs: 2340,
								confidence: null,
							},
							{
								text: ' watching',
								startMs: 2500,
								endMs: 2800,
								timestampMs: 2650,
								confidence: null,
							},
							{
								text: ' a',
								startMs: 2800,
								endMs: 3140,
								timestampMs: 2970,
								confidence: null,
							},
							{
								text: ' random',
								startMs: 3140,
								endMs: 3440,
								timestampMs: 3290,
								confidence: null,
							},
							{
								text: ' video',
								startMs: 3440,
								endMs: 3800,
								timestampMs: 3620,
								confidence: null,
							},
							{
								text: ' about',
								startMs: 3800,
								endMs: 4120,
								timestampMs: 3960,
								confidence: null,
							},
							{
								text: ' roller',
								startMs: 4120,
								endMs: 4440,
								timestampMs: 4280,
								confidence: null,
							},
							{
								text: ' skis.',
								startMs: 4440,
								endMs: 5080,
								timestampMs: 4760,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' I',
								startMs: 5360,
								endMs: 5700,
								timestampMs: 5530,
								confidence: null,
							},
							{
								text: ' really',
								startMs: 5700,
								endMs: 5940,
								timestampMs: 5820,
								confidence: null,
							},
							{
								text: ' really',
								startMs: 5940,
								endMs: 6540,
								timestampMs: 6240,
								confidence: null,
							},
							{
								text: ' appreciate',
								startMs: 6540,
								endMs: 6960,
								timestampMs: 6750,
								confidence: null,
							},
							{
								text: ' you',
								startMs: 6960,
								endMs: 7560,
								timestampMs: 7260,
								confidence: null,
							},
							{
								text: ' for',
								startMs: 7560,
								endMs: 7800,
								timestampMs: 7680,
								confidence: null,
							},
							{
								text: ' doing',
								startMs: 7800,
								endMs: 8180,
								timestampMs: 7990,
								confidence: null,
							},
							{
								text: ' that.',
								startMs: 8180,
								endMs: 8640,
								timestampMs: 8410,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' Cheers!',
								startMs: 8800,
								endMs: 9120,
								timestampMs: 8960,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
						width={1400}
						style={{position: 'absolute', left: 260, bottom: 90}}
					/>
				</TransitionSeries.Sequence>
			</TransitionSeries>
			<YouTubeEndCard
				name="Jonny Burger YouTube end card"
				from={END_CARD_START}
				durationInFrames={END_CARD_DURATION_IN_FRAMES}
				premountFor={fps}
				style={{
					translate: interpolate(
						frame,
						[12115, 12139],
						['1920px 0px', '0px 0px'],
						{
							easing: [Easing.bezier(0.22, 1, 0.36, 1)],
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
				}}
			/>
			<Audio
				name="No School Today music"
				src={rollerSkiAsset('audio/no-school-today-femme-tov.wav')}
				from={2212}
				durationInFrames={450}
				premountFor={fps}
				volume={(audioFrame) =>
					interpolate(
						audioFrame,
						[0, 12, 48, 78, 390, 414, 449],
						[0, 0.22, 0.22, 0.5, 0.5, 0.26, 0],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
					)
				}
			/>
			<Audio
				name="No School Today music (end card)"
				src={rollerSkiAsset('audio/no-school-today-femme-tov.wav')}
				from={END_CARD_START + 20}
				durationInFrames={END_CARD_DURATION_IN_FRAMES}
				premountFor={fps}
				volume={(audioFrame) =>
					interpolate(
						audioFrame,
						[0, 12, 10 * FPS, END_CARD_DURATION_IN_FRAMES - 1],
						[0, 0.2, 0.2, 0],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
					)
				}
			/>
		</>
	);
};

const OpeningTitleCard = Interactive.withSchema({
	Component: OpeningTitleCardInner,
	componentName: 'OpeningTitleCard',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});

const PresenterZoom = Interactive.withSchema({
	Component: PresenterZoomInner,
	componentName: 'PresenterZoom',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});

const TvColorBars = Interactive.withSchema({
	Component: TvColorBarsInner,
	componentName: 'TvColorBars',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});

const StravaRidesBroll = Interactive.withSchema({
	Component: StravaRidesBrollInner,
	componentName: 'StravaRidesBroll',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});

export const PresenterIntroduction = Interactive.withSchema({
	Component: PresenterIntroductionInner,
	componentName: 'PresenterIntroduction',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});

const RollerSkiRoughCut = Interactive.withSchema({
	Component: RollerSkiRoughCutInner,
	componentName: 'RollerSkiRoughCut',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});
