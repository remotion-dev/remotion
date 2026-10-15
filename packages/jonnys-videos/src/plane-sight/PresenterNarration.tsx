import {Audio, Video} from '@remotion/media';
import {
	AbsoluteFill,
	CanvasImage,
	type InteractiveTransformProps,
	Interactive,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {AirportSignZoom} from './AirportSignZoom';
import {BasicCaptions} from './basic-captions';
import {EntireCommitsBroll} from './EntireCommitsBroll';
import {EntireTrailsOverlay} from './EntireTrailsOverlay';
import {AirportOverview, FiveAgentsIntro} from './FiveAgentDemo';
import {FrontOfLineZoom} from './FrontOfLineZoom';
import {GeminiTowerScene} from './GeminiTowerScene';
import {HerdrGroundControl} from './HerdrGroundControl';
import {PlaneSightLogo} from './PlaneSightLogo';
import {TaxiwayDependencies} from './TaxiwayDependencies';
import {TowerZoom} from './TowerZoom';

const PresenterNarrationContent = ({style}: InteractiveTransformProps) => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();
	const showingTower =
		(frame >= (994 / 30) * fps && frame < (1056 / 30) * fps) ||
		(frame >= (1588 / 30) * fps && frame < (1745 / 30) * fps) ||
		(frame >= (2529 / 30) * fps && frame < (2591 / 30) * fps);
	const showingHerdr = frame >= (1745 / 30) * fps && frame < (1997 / 30) * fps;

	return (
		<AbsoluteFill style={style}>
			<Audio
				name="Normalized narration"
				src={
					'https://remotion.media/jonnys-videos/plane-sight/audio/presenter-normalized.wav'
				}
				premountFor={fps}
			/>
			<AirportOverview
				name="Airport — control tower and priority queue"
				from={35.2 * fps}
				durationInFrames={40 * fps}
				premountFor={fps}
			/>
			<CanvasImage
				name="Airport after the Herdr handoff"
				src={
					'https://remotion.media/jonnys-videos/plane-sight/screenshots/herdr-terminal-airport.png'
				}
				from={Math.round((1997 / 30) * fps)}
				durationInFrames={(758 / 30) * fps}
				premountFor={fps}
				style={{
					position: 'absolute',
					inset: 0,
					width: '100%',
					height: '100%',
					objectFit: 'cover',
				}}
			/>
			<GeminiTowerScene
				name="Gemini — control tower hover"
				from={(1588 / 30) * fps}
				durationInFrames={(157 / 30) * fps}
				premountFor={fps}
			/>
			<HerdrGroundControl
				name="Herdr — send and return to the airport automatically"
				from={(1745 / 30) * fps}
				durationInFrames={(252 / 30) * fps}
				premountFor={fps}
			/>
			<TaxiwayDependencies
				name="Identifies dependencies — zoom into taxiway"
				from={(1412 / 30) * fps}
				durationInFrames={(176 / 30) * fps}
				premountFor={fps}
			/>
			<FrontOfLineZoom
				name="In front of the line — priority-one plane"
				from={Math.round((1321 / 30) * fps)}
				durationInFrames={Math.round((91 / 30) * fps)}
				premountFor={fps}
			/>
			<AirportSignZoom
				name="Agent Airport International — zoom into sign"
				from={(2018 / 30) * fps}
				durationInFrames={Math.round((69 / 30) * fps)}
				premountFor={fps}
			/>
			<EntireCommitsBroll
				name="Operated by Entire — PlaneSight commit history"
				from={Math.round((2087 / 30) * fps)}
				durationInFrames={Math.round((169 / 30) * fps)}
				premountFor={fps}
			/>
			<TowerZoom
				name="Air traffic controller — tower introduction"
				from={Math.round((994 / 30) * fps)}
				durationInFrames={Math.round((62 / 30) * fps)}
				afterHerdr={false}
				premountFor={fps}
			/>
			<TowerZoom
				name="Air traffic controller — tower callback"
				from={Math.round((2529 / 30) * fps)}
				durationInFrames={Math.round((62 / 30) * fps)}
				afterHerdr
				premountFor={fps}
			/>
			<FiveAgentsIntro
				name="Closing — five agents in Herdr"
				from={75.2 * fps}
				durationInFrames={8.1 * fps}
				premountFor={fps}
			/>
			<Interactive.Div
				name="Presenter circle"
				premountFor={fps}
				style={{
					position: 'absolute',
					top: 32,
					right: showingTower ? undefined : 32,
					left: showingTower ? 32 : undefined,
					width: 240,
					height: 240,
					borderRadius: '50%',
					overflow: 'hidden',
				}}
			>
				<Video
					name="Webcam footage"
					src={
						'https://remotion.media/jonnys-videos/plane-sight/webcam1791640657618.mp4'
					}
					muted
					premountFor={fps}
					objectFit="cover"
					style={{
						width: '100%',
						height: '100%',
						scale: 1.6,
						transformOrigin: '50% 40%',
					}}
				/>
			</Interactive.Div>
			<PlaneSightLogo
				name="Plane Sight introduction"
				from={(362 / 30) * fps}
				durationInFrames={(82 / 30) * fps}
				premountFor={fps}
			/>
			<PlaneSightLogo
				name="Plane Sight air traffic controller"
				from={(946 / 30) * fps}
				durationInFrames={(48 / 30) * fps}
				premountFor={fps}
			/>
			<PlaneSightLogo
				name="Plane Sight closing — logo only"
				from={(2728 / 30) * fps}
				durationInFrames={(27 / 30) * fps}
				premountFor={fps}
				style={{backgroundColor: '#ffffff', zIndex: 10}}
			/>
			<EntireTrailsOverlay
				name="Entire Trails wink — 1.5 seconds on trails"
				from={Math.round((679 / 30) * fps)}
				durationInFrames={1.5 * fps}
				premountFor={fps}
			/>
			<BasicCaptions
				name="Speech captions"
				premountFor={fps}
				width={showingHerdr ? 1120 : 1280}
				combineTokensWithinMilliseconds={5000}
				style={{
					position: 'absolute',
					top: showingHerdr ? 72 : undefined,
					bottom: showingHerdr ? undefined : 48,
					scale: '0.6666667',
					transformOrigin: showingHerdr ? '50% 0%' : '50% 100%',
				}}
				captions={[
					{
						text: 'Imagine',
						startMs: 3560,
						endMs: 3900,
						timestampMs: 3730,
						confidence: null,
					},
					{
						text: ' you',
						startMs: 3900,
						endMs: 3960,
						timestampMs: 3930,
						confidence: null,
					},
					{
						text: ' are',
						startMs: 3960,
						endMs: 4200,
						timestampMs: 4080,
						confidence: null,
					},
					{
						text: ' coming',
						startMs: 4200,
						endMs: 4460,
						timestampMs: 4330,
						confidence: null,
					},
					{
						text: ' back',
						startMs: 4460,
						endMs: 4740,
						timestampMs: 4600,
						confidence: null,
					},
					{
						text: ' from',
						startMs: 4740,
						endMs: 5000,
						timestampMs: 4870,
						confidence: null,
					},
					{
						text: ' lunch',
						startMs: 5000,
						endMs: 5280,
						timestampMs: 5140,
						confidence: null,
					},
					{
						text: ' and',
						startMs: 5280,
						endMs: 5420,
						timestampMs: 5350,
						confidence: null,
					},
					{
						text: ' you',
						startMs: 5420,
						endMs: 5600,
						timestampMs: 5510,
						confidence: null,
					},
					{
						text: ' see',
						startMs: 5600,
						endMs: 5880,
						timestampMs: 5740,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' 8',
						startMs: 5880,
						endMs: 6340,
						timestampMs: 6110,
						confidence: null,
					},
					{
						text: ' agents',
						startMs: 6340,
						endMs: 7020,
						timestampMs: 6680,
						confidence: null,
					},
					{
						text: ' requiring',
						startMs: 7020,
						endMs: 7540,
						timestampMs: 7280,
						confidence: null,
					},
					{
						text: ' your',
						startMs: 7540,
						endMs: 7920,
						timestampMs: 7730,
						confidence: null,
					},
					{
						text: ' attention.',
						startMs: 7920,
						endMs: 8920,
						timestampMs: 8420,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' Which',
						startMs: 9080,
						endMs: 9280,
						timestampMs: 9180,
						confidence: null,
					},
					{
						text: ' one',
						startMs: 9280,
						endMs: 9480,
						timestampMs: 9380,
						confidence: null,
					},
					{
						text: ' should',
						startMs: 9480,
						endMs: 9600,
						timestampMs: 9540,
						confidence: null,
					},
					{
						text: ' you',
						startMs: 9600,
						endMs: 9740,
						timestampMs: 9670,
						confidence: null,
					},
					{
						text: ' look',
						startMs: 9740,
						endMs: 10000,
						timestampMs: 9870,
						confidence: null,
					},
					{
						text: ' into',
						startMs: 10000,
						endMs: 10340,
						timestampMs: 10170,
						confidence: null,
					},
					{
						text: ' first?',
						startMs: 10340,
						endMs: 11180,
						timestampMs: 10760,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' This',
						startMs: 11380,
						endMs: 11680,
						timestampMs: 11530,
						confidence: null,
					},
					{
						text: ' is',
						startMs: 11680,
						endMs: 11840,
						timestampMs: 11760,
						confidence: null,
					},
					{
						text: ' what',
						startMs: 11840,
						endMs: 12080,
						timestampMs: 11960,
						confidence: null,
					},
					{
						text: ' Plane',
						startMs: 12080,
						endMs: 12380,
						timestampMs: 12230,
						confidence: null,
					},
					{
						text: ' Sight',
						startMs: 12380,
						endMs: 12580,
						timestampMs: 12480,
						confidence: null,
					},
					{
						text: ' is',
						startMs: 12580,
						endMs: 12800,
						timestampMs: 12690,
						confidence: null,
					},
					{
						text: ' trying',
						startMs: 12800,
						endMs: 12940,
						timestampMs: 12870,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 12940,
						endMs: 13080,
						timestampMs: 13010,
						confidence: null,
					},
					{
						text: ' help',
						startMs: 13080,
						endMs: 13220,
						timestampMs: 13150,
						confidence: null,
					},
					{
						text: ' you',
						startMs: 13220,
						endMs: 13560,
						timestampMs: 13390,
						confidence: null,
					},
					{
						text: ' decide.',
						startMs: 13560,
						endMs: 14600,
						timestampMs: 14080,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' Your',
						startMs: 14800,
						endMs: 15120,
						timestampMs: 14960,
						confidence: null,
					},
					{
						text: ' product',
						startMs: 15120,
						endMs: 15480,
						timestampMs: 15300,
						confidence: null,
					},
					{
						text: ' development',
						startMs: 15480,
						endMs: 16040,
						timestampMs: 15760,
						confidence: null,
					},
					{
						text: ' is',
						startMs: 16040,
						endMs: 16220,
						timestampMs: 16130,
						confidence: null,
					},
					{
						text: ' like',
						startMs: 16220,
						endMs: 16380,
						timestampMs: 16300,
						confidence: null,
					},
					{
						text: ' an',
						startMs: 16380,
						endMs: 16680,
						timestampMs: 16530,
						confidence: null,
					},
					{
						text: ' airport.',
						startMs: 16680,
						endMs: 17680,
						timestampMs: 17180,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' Agents',
						startMs: 17680,
						endMs: 17940,
						timestampMs: 17810,
						confidence: null,
					},
					{
						text: ' are',
						startMs: 17940,
						endMs: 18200,
						timestampMs: 18070,
						confidence: null,
					},
					{
						text: ' taking',
						startMs: 18200,
						endMs: 18540,
						timestampMs: 18370,
						confidence: null,
					},
					{
						text: ' off',
						startMs: 18540,
						endMs: 18840,
						timestampMs: 18690,
						confidence: null,
					},
					{
						text: ' from',
						startMs: 18840,
						endMs: 19000,
						timestampMs: 18920,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 19000,
						endMs: 19440,
						timestampMs: 19220,
						confidence: null,
					},
					{
						text: ' terminal,',
						startMs: 19440,
						endMs: 20080,
						timestampMs: 19760,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' spin',
						startMs: 20320,
						endMs: 20500,
						timestampMs: 20410,
						confidence: null,
					},
					{
						text: ' their',
						startMs: 20500,
						endMs: 20940,
						timestampMs: 20720,
						confidence: null,
					},
					{
						text: ' engines',
						startMs: 20940,
						endMs: 21600,
						timestampMs: 21270,
						confidence: null,
					},
					{
						text: ' and',
						startMs: 21600,
						endMs: 22100,
						timestampMs: 21850,
						confidence: null,
					},
					{
						text: ' generate',
						startMs: 22100,
						endMs: 22620,
						timestampMs: 22360,
						confidence: null,
					},
					{
						text: ' trails',
						startMs: 22620,
						endMs: 23260,
						timestampMs: 22940,
						confidence: null,
					},
					{
						text: ' before',
						startMs: 23300,
						endMs: 23440,
						timestampMs: 23370,
						confidence: null,
					},
					{
						text: ' they',
						startMs: 23500,
						endMs: 23720,
						timestampMs: 23610,
						confidence: null,
					},
					{
						text: ' land',
						startMs: 23720,
						endMs: 24100,
						timestampMs: 23910,
						confidence: null,
					},
					{
						text: ' again.',
						startMs: 24080,
						endMs: 24920,
						timestampMs: 24500,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' To',
						startMs: 25140,
						endMs: 25460,
						timestampMs: 25300,
						confidence: null,
					},
					{
						text: ' prevent',
						startMs: 25460,
						endMs: 25840,
						timestampMs: 25650,
						confidence: null,
					},
					{
						text: ' any',
						startMs: 25840,
						endMs: 26340,
						timestampMs: 26090,
						confidence: null,
					},
					{
						text: ' unnecessary',
						startMs: 26340,
						endMs: 26880,
						timestampMs: 26610,
						confidence: null,
					},
					{
						text: ' delays,',
						startMs: 26880,
						endMs: 27440,
						timestampMs: 27160,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' a',
						startMs: 27600,
						endMs: 27900,
						timestampMs: 27750,
						confidence: null,
					},
					{
						text: ' short',
						startMs: 27900,
						endMs: 28340,
						timestampMs: 28120,
						confidence: null,
					},
					{
						text: ' turnaround',
						startMs: 28340,
						endMs: 28840,
						timestampMs: 28590,
						confidence: null,
					},
					{
						text: ' time',
						startMs: 28840,
						endMs: 29520,
						timestampMs: 29180,
						confidence: null,
					},
					{
						text: ' is',
						startMs: 29520,
						endMs: 29920,
						timestampMs: 29720,
						confidence: null,
					},
					{
						text: ' crucial.',
						startMs: 29920,
						endMs: 31280,
						timestampMs: 30600,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' Plane',
						startMs: 31520,
						endMs: 31860,
						timestampMs: 31690,
						confidence: null,
					},
					{
						text: ' Sight',
						startMs: 31860,
						endMs: 32420,
						timestampMs: 32140,
						confidence: null,
					},
					{
						text: ' acts',
						startMs: 32420,
						endMs: 32680,
						timestampMs: 32550,
						confidence: null,
					},
					{
						text: ' as',
						startMs: 32680,
						endMs: 32880,
						timestampMs: 32780,
						confidence: null,
					},
					{
						text: ' your',
						startMs: 32880,
						endMs: 33140,
						timestampMs: 33010,
						confidence: null,
					},
					{
						text: ' air',
						startMs: 33140,
						endMs: 33560,
						timestampMs: 33350,
						confidence: null,
					},
					{
						text: ' traffic',
						startMs: 33560,
						endMs: 34120,
						timestampMs: 33840,
						confidence: null,
					},
					{
						text: ' controller.',
						startMs: 34120,
						endMs: 35020,
						timestampMs: 34570,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' It',
						startMs: 35200,
						endMs: 35520,
						timestampMs: 35360,
						confidence: null,
					},
					{
						text: ' hides',
						startMs: 35520,
						endMs: 35720,
						timestampMs: 35620,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 35720,
						endMs: 36000,
						timestampMs: 35860,
						confidence: null,
					},
					{
						text: ' agents',
						startMs: 36000,
						endMs: 36340,
						timestampMs: 36170,
						confidence: null,
					},
					{
						text: ' which',
						startMs: 36340,
						endMs: 36560,
						timestampMs: 36450,
						confidence: null,
					},
					{
						text: ' are',
						startMs: 36560,
						endMs: 36740,
						timestampMs: 36650,
						confidence: null,
					},
					{
						text: ' in',
						startMs: 36740,
						endMs: 37060,
						timestampMs: 36900,
						confidence: null,
					},
					{
						text: ' flight',
						startMs: 37060,
						endMs: 37540,
						timestampMs: 37300,
						confidence: null,
					},
					{
						text: ' because',
						startMs: 37960,
						endMs: 38220,
						timestampMs: 38090,
						confidence: null,
					},
					{
						text: ' they',
						startMs: 38220,
						endMs: 38360,
						timestampMs: 38290,
						confidence: null,
					},
					{
						text: ' are',
						startMs: 38360,
						endMs: 38560,
						timestampMs: 38460,
						confidence: null,
					},
					{
						text: ' not',
						startMs: 38560,
						endMs: 38940,
						timestampMs: 38750,
						confidence: null,
					},
					{
						text: ' actionable.',
						startMs: 38940,
						endMs: 40200,
						timestampMs: 39570,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' It',
						startMs: 40340,
						endMs: 40980,
						timestampMs: 40660,
						confidence: null,
					},
					{
						text: ' recognizes',
						startMs: 40980,
						endMs: 41380,
						timestampMs: 41180,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 41380,
						endMs: 41640,
						timestampMs: 41510,
						confidence: null,
					},
					{
						text: ' most',
						startMs: 41640,
						endMs: 42040,
						timestampMs: 41840,
						confidence: null,
					},
					{
						text: ' urgent',
						startMs: 42040,
						endMs: 42540,
						timestampMs: 42290,
						confidence: null,
					},
					{
						text: ' tasks',
						startMs: 42540,
						endMs: 43120,
						timestampMs: 42830,
						confidence: null,
					},
					{
						text: ' and',
						startMs: 43320,
						endMs: 43560,
						timestampMs: 43440,
						confidence: null,
					},
					{
						text: ' puts',
						startMs: 43560,
						endMs: 43780,
						timestampMs: 43670,
						confidence: null,
					},
					{
						text: ' them',
						startMs: 43780,
						endMs: 44040,
						timestampMs: 43910,
						confidence: null,
					},
					{
						text: ' in',
						startMs: 44040,
						endMs: 44220,
						timestampMs: 44130,
						confidence: null,
					},
					{
						text: ' front',
						startMs: 44220,
						endMs: 44420,
						timestampMs: 44320,
						confidence: null,
					},
					{
						text: ' of',
						startMs: 44420,
						endMs: 44540,
						timestampMs: 44480,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 44540,
						endMs: 44760,
						timestampMs: 44650,
						confidence: null,
					},
					{
						text: ' line.',
						startMs: 44760,
						endMs: 45000,
						timestampMs: 44880,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' And',
						startMs: 45840,
						endMs: 45940,
						timestampMs: 45890,
						confidence: null,
					},
					{
						text: ' it',
						startMs: 45940,
						endMs: 46180,
						timestampMs: 46060,
						confidence: null,
					},
					{
						text: ' also',
						startMs: 46180,
						endMs: 47060,
						timestampMs: 46620,
						confidence: null,
					},
					{
						text: ' identifies',
						startMs: 47060,
						endMs: 47720,
						timestampMs: 47390,
						confidence: null,
					},
					{
						text: ' dependencies',
						startMs: 47720,
						endMs: 48560,
						timestampMs: 48140,
						confidence: null,
					},
					{
						text: ' between',
						startMs: 48560,
						endMs: 49000,
						timestampMs: 48780,
						confidence: null,
					},
					{
						text: ' agents',
						startMs: 49000,
						endMs: 49880,
						timestampMs: 49440,
						confidence: null,
					},
					{
						text: ' so',
						startMs: 49880,
						endMs: 50060,
						timestampMs: 49970,
						confidence: null,
					},
					{
						text: ' they',
						startMs: 50060,
						endMs: 50260,
						timestampMs: 50160,
						confidence: null,
					},
					{
						text: " don't",
						startMs: 50260,
						endMs: 50660,
						timestampMs: 50460,
						confidence: null,
					},
					{
						text: ' collide',
						startMs: 50660,
						endMs: 50920,
						timestampMs: 50790,
						confidence: null,
					},
					{
						text: ' in',
						startMs: 50920,
						endMs: 51180,
						timestampMs: 51050,
						confidence: null,
					},
					{
						text: ' flight.',
						startMs: 51180,
						endMs: 52000,
						timestampMs: 51590,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' In',
						startMs: 52920,
						endMs: 53200,
						timestampMs: 53060,
						confidence: null,
					},
					{
						text: ' our',
						startMs: 53200,
						endMs: 53560,
						timestampMs: 53380,
						confidence: null,
					},
					{
						text: ' control',
						startMs: 53560,
						endMs: 53980,
						timestampMs: 53770,
						confidence: null,
					},
					{
						text: ' tower',
						startMs: 53980,
						endMs: 54420,
						timestampMs: 54200,
						confidence: null,
					},
					{
						text: ' sits',
						startMs: 54420,
						endMs: 54760,
						timestampMs: 54590,
						confidence: null,
					},
					{
						text: ' our',
						startMs: 54760,
						endMs: 55440,
						timestampMs: 55100,
						confidence: null,
					},
					{
						text: ' operator,',
						startMs: 55440,
						endMs: 55940,
						timestampMs: 55690,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' Gemini',
						startMs: 56140,
						endMs: 56620,
						timestampMs: 56380,
						confidence: null,
					},
					{
						text: ' 3',
						startMs: 56620,
						endMs: 56780,
						timestampMs: 56700,
						confidence: null,
					},
					{
						text: '.8',
						startMs: 56780,
						endMs: 57400,
						timestampMs: 57090,
						confidence: null,
					},
					{
						text: ' Flash,',
						startMs: 57400,
						endMs: 57880,
						timestampMs: 57640,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' which',
						startMs: 58160,
						endMs: 58460,
						timestampMs: 58310,
						confidence: null,
					},
					{
						text: ' sees',
						startMs: 58460,
						endMs: 58800,
						timestampMs: 58630,
						confidence: null,
					},
					{
						text: ' all',
						startMs: 58800,
						endMs: 58940,
						timestampMs: 58870,
						confidence: null,
					},
					{
						text: ' of',
						startMs: 58940,
						endMs: 59140,
						timestampMs: 59040,
						confidence: null,
					},
					{
						text: ' your',
						startMs: 59140,
						endMs: 59440,
						timestampMs: 59290,
						confidence: null,
					},
					{
						text: ' agent',
						startMs: 59440,
						endMs: 59760,
						timestampMs: 59600,
						confidence: null,
					},
					{
						text: ' sessions',
						startMs: 59760,
						endMs: 60060,
						timestampMs: 59910,
						confidence: null,
					},
					{
						text: ' from',
						startMs: 60060,
						endMs: 60400,
						timestampMs: 60230,
						confidence: null,
					},
					{
						text: ' above',
						startMs: 60400,
						endMs: 61160,
						timestampMs: 60780,
						confidence: null,
					},
					{
						text: ' and',
						startMs: 61160,
						endMs: 61440,
						timestampMs: 61300,
						confidence: null,
					},
					{
						text: ' lines',
						startMs: 61440,
						endMs: 61620,
						timestampMs: 61530,
						confidence: null,
					},
					{
						text: ' them',
						startMs: 61620,
						endMs: 61900,
						timestampMs: 61760,
						confidence: null,
					},
					{
						text: ' up',
						startMs: 61900,
						endMs: 62420,
						timestampMs: 62160,
						confidence: null,
					},
					{
						text: ' in',
						startMs: 62420,
						endMs: 62520,
						timestampMs: 62470,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 62520,
						endMs: 62780,
						timestampMs: 62650,
						confidence: null,
					},
					{
						text: ' right',
						startMs: 62780,
						endMs: 63100,
						timestampMs: 62940,
						confidence: null,
					},
					{
						text: ' order',
						startMs: 63100,
						endMs: 63360,
						timestampMs: 63230,
						confidence: null,
					},
					{
						text: ' of',
						startMs: 63360,
						endMs: 63880,
						timestampMs: 63620,
						confidence: null,
					},
					{
						text: ' priority.',
						startMs: 63880,
						endMs: 65060,
						timestampMs: 64470,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' The',
						startMs: 65460,
						endMs: 65660,
						timestampMs: 65560,
						confidence: null,
					},
					{
						text: ' check',
						startMs: 65660,
						endMs: 65800,
						timestampMs: 65730,
						confidence: null,
					},
					{
						text: '-in',
						startMs: 65800,
						endMs: 66280,
						timestampMs: 66040,
						confidence: null,
					},
					{
						text: ' process',
						startMs: 66280,
						endMs: 66980,
						timestampMs: 66630,
						confidence: null,
					},
					{
						text: ' in',
						startMs: 66980,
						endMs: 67280,
						timestampMs: 67130,
						confidence: null,
					},
					{
						text: ' Agent',
						startMs: 67280,
						endMs: 67760,
						timestampMs: 67520,
						confidence: null,
					},
					{
						text: ' Airport',
						startMs: 67760,
						endMs: 67840,
						timestampMs: 67800,
						confidence: null,
					},
					{
						text: ' International',
						startMs: 68320,
						endMs: 69140,
						timestampMs: 68730,
						confidence: null,
					},
					{
						text: ' is',
						startMs: 69140,
						endMs: 69560,
						timestampMs: 69350,
						confidence: null,
					},
					{
						text: ' operated',
						startMs: 69560,
						endMs: 69860,
						timestampMs: 69710,
						confidence: null,
					},
					{
						text: ' by',
						startMs: 69860,
						endMs: 70040,
						timestampMs: 69950,
						confidence: null,
					},
					{
						text: ' Entire',
						startMs: 70040,
						endMs: 71040,
						timestampMs: 70540,
						confidence: null,
					},
					{
						text: ' so',
						startMs: 71040,
						endMs: 71160,
						timestampMs: 71100,
						confidence: null,
					},
					{
						text: ' it',
						startMs: 71160,
						endMs: 71440,
						timestampMs: 71300,
						confidence: null,
					},
					{
						text: " doesn't",
						startMs: 71440,
						endMs: 71820,
						timestampMs: 71630,
						confidence: null,
					},
					{
						text: ' crack',
						startMs: 71820,
						endMs: 72500,
						timestampMs: 72160,
						confidence: null,
					},
					{
						text: ' under',
						startMs: 72500,
						endMs: 72720,
						timestampMs: 72610,
						confidence: null,
					},
					{
						text: ' high',
						startMs: 72720,
						endMs: 73100,
						timestampMs: 72910,
						confidence: null,
					},
					{
						text: ' throughput.',
						startMs: 73100,
						endMs: 74520,
						timestampMs: 73810,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' So',
						startMs: 74780,
						endMs: 75680,
						timestampMs: 75230,
						confidence: null,
					},
					{
						text: " you're",
						startMs: 75680,
						endMs: 75920,
						timestampMs: 75800,
						confidence: null,
					},
					{
						text: ' coming',
						startMs: 75960,
						endMs: 75960,
						timestampMs: 75960,
						confidence: null,
					},
					{
						text: ' back',
						startMs: 76200,
						endMs: 76400,
						timestampMs: 76300,
						confidence: null,
					},
					{
						text: ' from',
						startMs: 76400,
						endMs: 76620,
						timestampMs: 76510,
						confidence: null,
					},
					{
						text: ' lunch.',
						startMs: 76620,
						endMs: 76940,
						timestampMs: 76780,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' 8',
						startMs: 77640,
						endMs: 78040,
						timestampMs: 77840,
						confidence: null,
					},
					{
						text: ' agents',
						startMs: 78040,
						endMs: 78660,
						timestampMs: 78350,
						confidence: null,
					},
					{
						text: ' are',
						startMs: 78660,
						endMs: 78920,
						timestampMs: 78790,
						confidence: null,
					},
					{
						text: ' ready',
						startMs: 78920,
						endMs: 79280,
						timestampMs: 79100,
						confidence: null,
					},
					{
						text: ' for',
						startMs: 79280,
						endMs: 79480,
						timestampMs: 79380,
						confidence: null,
					},
					{
						text: ' their',
						startMs: 79480,
						endMs: 79780,
						timestampMs: 79630,
						confidence: null,
					},
					{
						text: ' next',
						startMs: 79780,
						endMs: 80180,
						timestampMs: 79980,
						confidence: null,
					},
					{
						text: ' flight.',
						startMs: 80180,
						endMs: 81080,
						timestampMs: 80630,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' Which',
						startMs: 81200,
						endMs: 81400,
						timestampMs: 81300,
						confidence: null,
					},
					{
						text: ' one',
						startMs: 81400,
						endMs: 81700,
						timestampMs: 81550,
						confidence: null,
					},
					{
						text: ' should',
						startMs: 81700,
						endMs: 81840,
						timestampMs: 81770,
						confidence: null,
					},
					{
						text: ' you',
						startMs: 81840,
						endMs: 82040,
						timestampMs: 81940,
						confidence: null,
					},
					{
						text: ' send',
						startMs: 82040,
						endMs: 82240,
						timestampMs: 82140,
						confidence: null,
					},
					{
						text: ' off',
						startMs: 82240,
						endMs: 82560,
						timestampMs: 82400,
						confidence: null,
					},
					{
						text: ' next?',
						startMs: 82600,
						endMs: 83300,
						timestampMs: 82950,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' You',
						startMs: 83580,
						endMs: 83740,
						timestampMs: 83660,
						confidence: null,
					},
					{
						text: ' need',
						startMs: 83740,
						endMs: 83980,
						timestampMs: 83860,
						confidence: null,
					},
					{
						text: ' an',
						startMs: 83980,
						endMs: 84300,
						timestampMs: 84140,
						confidence: null,
					},
					{
						text: ' air',
						startMs: 84300,
						endMs: 84760,
						timestampMs: 84530,
						confidence: null,
					},
					{
						text: ' traffic',
						startMs: 84760,
						endMs: 85300,
						timestampMs: 85030,
						confidence: null,
					},
					{
						text: ' controller',
						startMs: 85300,
						endMs: 85920,
						timestampMs: 85610,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 85920,
						endMs: 86140,
						timestampMs: 86030,
						confidence: null,
					},
					{
						text: ' help',
						startMs: 86140,
						endMs: 86300,
						timestampMs: 86220,
						confidence: null,
					},
					{
						text: ' you',
						startMs: 86300,
						endMs: 86480,
						timestampMs: 86390,
						confidence: null,
					},
					{
						text: ' make',
						startMs: 86480,
						endMs: 86700,
						timestampMs: 86590,
						confidence: null,
					},
					{
						text: ' a',
						startMs: 86700,
						endMs: 87000,
						timestampMs: 86850,
						confidence: null,
					},
					{
						text: ' decision.',
						startMs: 87060,
						endMs: 87880,
						timestampMs: 87470,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' And',
						startMs: 87980,
						endMs: 88200,
						timestampMs: 88090,
						confidence: null,
					},
					{
						text: ' thanks',
						startMs: 88200,
						endMs: 88420,
						timestampMs: 88310,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 88420,
						endMs: 88720,
						timestampMs: 88570,
						confidence: null,
					},
					{
						text: ' our',
						startMs: 88720,
						endMs: 89100,
						timestampMs: 88910,
						confidence: null,
					},
					{
						text: ' tool,',
						startMs: 89100,
						endMs: 89840,
						timestampMs: 89470,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: '',
						startMs: 90020,
						endMs: 90300,
						timestampMs: 90160,
						confidence: null,
					},
					{
						text: '',
						startMs: 90300,
						endMs: 90600,
						timestampMs: 90450,
						confidence: null,
					},
					{
						text: '',
						startMs: 90600,
						endMs: 90760,
						timestampMs: 90680,
						confidence: null,
					},
					{
						text: '',
						startMs: 90760,
						endMs: 90920,
						timestampMs: 90840,
						confidence: null,
					},
					{
						text: '',
						startMs: 90920,
						endMs: 91220,
						timestampMs: 91070,
						confidence: null,
					},
					{
						text: '',
						startMs: 91220,
						endMs: 91400,
						timestampMs: 91310,
						confidence: null,
						pageBreakAfter: true,
					},
				]}
			/>
		</AbsoluteFill>
	);
};

export const PresenterNarration = Interactive.create({
	Component: PresenterNarrationContent,
	componentName: 'PresenterNarration',
});
