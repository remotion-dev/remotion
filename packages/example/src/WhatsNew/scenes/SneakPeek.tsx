import {Audio, Video} from '@remotion/media';
import React from 'react';
import {
	Track,
	Interactive,
	type InteractiveTransformProps,
	interpolate,
	Sequence,
	Series,
	useCurrentFrame,
} from 'remotion';
import {easeInOut, pop, rise} from '../anim';
import {Backdrop} from '../components/Background';
import {PunchyCaptions} from '../components/Captions';
import {Letterbox} from '../components/fx';
import {EyeIcon, WandIcon} from '../components/icons';
import {
	ShotFraming,
	StageLayout,
	useCaptionPlacement,
	Punch,
	Stage,
	type LayoutKeyframe,
} from '../components/Stage';
import {StudioMock} from '../components/StudioMock';
import {
	ChapterSticker,
	Chip,
	CodeLines,
	Label,
	Panel,
	Pop,
	Stamp,
	syntax,
	Window,
} from '../components/ui';
import {display} from '../fonts';
import {accents, colors} from '../theme';

const layout: LayoutKeyframe[] = [
	{at: 0, layout: 'full'},
	{at: 184, layout: 'split'},
	{at: 518, layout: 'pip', duration: 26},
];

const SpotlightInner: React.FC<InteractiveTransformProps> = ({style}) => {
	const frame = useCurrentFrame();
	const p = interpolate(frame, [0, 20, 150, 184], [0, 1, 1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return (
		<div
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				opacity: p,
				background:
					'radial-gradient(ellipse 45% 60% at 52% 40%, rgba(20,10,40,0) 40%, rgba(12,6,28,0.72) 100%)',
				...style,
			}}
		/>
	);
};

const requests = [
	{text: 'Can Remotion be easier to use?', at: 13, x: 90, y: 180, rotate: -3},
	{
		text: 'A visual editor would be amazing!',
		at: 37,
		x: 130,
		y: 330,
		rotate: 2,
	},
	{text: 'Make it easier, please!', at: 67, x: 100, y: 480, rotate: -2},
];

const RequestsInner: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			{requests.map((r, i) => {
				const p = pop(frame, r.at, 11);
				return (
					<div
						key={r.text}
						style={{
							position: 'absolute',
							left: r.x,
							top: r.y,
							display: 'flex',
							alignItems: 'center',
							gap: 18,
							padding: '20px 32px 22px 20px',
							borderRadius: '34px 34px 34px 10px',
							backgroundColor: colors.paper,
							boxShadow: '0 22px 50px rgba(0,0,0,0.35)',
							opacity: Math.min(1, p * 2),
							scale: 0.5 + 0.5 * p,
							rotate: `${r.rotate}deg`,
							transformOrigin: '0% 100%',
						}}
					>
						<div
							style={{
								width: 58,
								height: 58,
								borderRadius: 29,
								background: [
									'linear-gradient(135deg,#FF8A00,#FF3B8D)',
									'linear-gradient(135deg,#10B981,#0B84F3)',
									'linear-gradient(135deg,#7C5CFF,#A78BFA)',
								][i],
							}}
						/>
						<div
							style={{
								fontFamily: display,
								fontWeight: 700,
								fontSize: 38,
								color: colors.ink,
								whiteSpace: 'nowrap',
							}}
						>
							{r.text}
						</div>
					</div>
				);
			})}
		</>
	);
};

const Tradeoff: React.FC = () => {
	const frame = useCurrentFrame();
	// Sequence starts at scene frame 188.
	const wobble = interpolate(frame, [17, 127], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const settle = interpolate(frame, [127, 147], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: easeInOut,
	});
	const knob =
		0.5 +
		(1 - settle) *
			0.42 *
			Math.sin(wobble * Math.PI * 4) *
			Math.min(1, frame / 20);
	const both = rise(frame, 130, 14);
	return (
		<Panel style={{gap: 40}}>
			<Pop from="up" delay={2}>
				<div
					style={{
						width: 800,
						borderRadius: 34,
						backgroundColor: '#14111F',
						border: '1px solid rgba(255,255,255,0.08)',
						padding: '34px 38px 40px',
						boxSizing: 'border-box',
						boxShadow: '0 30px 70px rgba(0,0,0,0.45)',
					}}
				>
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							marginBottom: 26,
						}}
					>
						<div style={{display: 'flex', alignItems: 'center', gap: 12}}>
							<WandIcon size={38} color={accents.sneakPeek} />
							<div
								style={{
									fontFamily: display,
									fontWeight: 700,
									fontSize: 36,
									color: colors.paper,
								}}
							>
								Easy to use
							</div>
						</div>
						<div
							style={{
								fontFamily: display,
								fontWeight: 700,
								fontSize: 36,
								color: colors.paper,
							}}
						>
							{'</>'} Dynamic code
						</div>
					</div>
					<div
						style={{
							height: 18,
							borderRadius: 9,
							background: `linear-gradient(90deg, ${accents.sneakPeek}, ${colors.blue})`,
							position: 'relative',
						}}
					>
						<div
							style={{
								position: 'absolute',
								top: -17,
								left: `calc(${knob * 100}% - 26px)`,
								width: 52,
								height: 52,
								borderRadius: 26,
								backgroundColor: colors.paper,
								boxShadow: `0 0 0 ${10 * both}px rgba(167,139,250,0.35), 0 8px 20px rgba(0,0,0,0.4)`,
							}}
						/>
					</div>
					<div
						style={{
							marginTop: 34,
							textAlign: 'center',
							fontFamily: display,
							fontWeight: 700,
							fontSize: 40,
							color: both > 0.5 ? accents.sneakPeek : '#8A8F98',
						}}
					>
						{both > 0.5 ? 'Without compromising either' : 'How do we get both?'}
					</div>
				</div>
			</Pop>
			<Pop from="up" delay={150}>
				<Window title="MyVideo.tsx" width={800} fontSize={29}>
					<CodeLines
						start={156}
						speed={2.4}
						lines={[
							[
								['const', syntax.keyword],
								[' frame = ', syntax.plain],
								['useCurrentFrame', syntax.fn],
								['();', syntax.punct],
							],
							[
								['const', syntax.keyword],
								[' scale = ', syntax.plain],
								['spring', syntax.fn],
								['({frame, fps});', syntax.punct],
							],
							[
								['return', syntax.keyword],
								[' <', syntax.punct],
								['Title', syntax.tag],
								[' style', syntax.attr],
								['={{scale}} />', syntax.punct],
							],
						]}
					/>
				</Window>
			</Pop>
			<Pop from="up" delay={226}>
				<Label color="#B9B2D9">Everything is expressed as code</Label>
			</Pop>
		</Panel>
	);
};

const VisualModeTitle: React.FC = () => (
	<div
		style={{
			position: 'absolute',
			left: 1500,
			top: 150,
			width: 380,
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			gap: 18,
		}}
	>
		<Pop from="up">
			<Label color={accents.sneakPeek}>Remotion Studio</Label>
		</Pop>
		<Pop from="up" delay={4}>
			<div
				style={{
					fontFamily: display,
					fontWeight: 700,
					fontSize: 76,
					lineHeight: 0.95,
					letterSpacing: '-0.04em',
					color: colors.paper,
					textAlign: 'center',
				}}
			>
				Visual
				<br />
				mode
			</div>
		</Pop>
		<Stamp
			color={accents.sneakPeek}
			delay={16}
			rotate={-6}
			fontSize={34}
			style={{backgroundColor: 'rgba(20,10,40,0.9)'}}
		>
			Prototype
		</Stamp>
	</div>
);

const SneakPeekRequestsSourceInner = () => {
	const captions = useCaptionPlacement(layout);
	return (
		<>
			<Stage
				style={{overflow: 'visible', flexDirection: 'column'}}
				keyframes={layout}
			>
				<Punch>
					<Video
						src={
							'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats9.mp4'
						}
					/>
				</Punch>
			</Stage>
			<PunchyCaptions
				combineTokensWithinMilliseconds={10000}
				width={captions.width}
				fontSize={captions.fontSize}
				style={{...captions.style, zIndex: 1}}
				keywords={['sneak', 'peek', 'easier', 'code.']}
				captions={[
					// @captions whats9
					{
						text: 'And',
						startMs: 1849,
						endMs: 2102,
						timestampMs: 1976,
						confidence: null,
					},
					{
						text: ' now',
						startMs: 2102,
						endMs: 2287,
						timestampMs: 2195,
						confidence: null,
					},
					{
						text: ' a',
						startMs: 2287,
						endMs: 2456,
						timestampMs: 2372,
						confidence: null,
					},
					{
						text: ' little',
						startMs: 2456,
						endMs: 2709,
						timestampMs: 2583,
						confidence: null,
					},
					{
						text: ' sneak',
						startMs: 2709,
						endMs: 2911,
						timestampMs: 2810,
						confidence: null,
					},
					{
						text: ' peek',
						startMs: 2911,
						endMs: 3147,
						timestampMs: 3029,
						confidence: null,
					},
					{
						text: ' of',
						startMs: 3147,
						endMs: 3350,
						timestampMs: 3249,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: " what's",
						startMs: 3350,
						endMs: 3552,
						timestampMs: 3451,
						confidence: null,
					},
					{
						text: ' next.',
						startMs: 3704,
						endMs: 4159,
						timestampMs: 3932,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' We',
						startMs: 4971.666666,
						endMs: 5152.666666,
						timestampMs: 5062.666666,
						confidence: null,
					},
					{
						text: ' hear',
						startMs: 5152.666666,
						endMs: 5372.666666,
						timestampMs: 5262.666666,
						confidence: null,
					},
					{
						text: ' that',
						startMs: 5372.666666,
						endMs: 5533.666666,
						timestampMs: 5453.666666,
						confidence: null,
					},
					{
						text: ' you',
						startMs: 5533.666666,
						endMs: 5753.666666,
						timestampMs: 5643.666666,
						confidence: null,
					},
					{
						text: ' want',
						startMs: 5753.666666,
						endMs: 6014.666666,
						timestampMs: 5884.666666,
						confidence: null,
					},
					{
						text: ' Remotion',
						startMs: 6014.666666,
						endMs: 6355.666666,
						timestampMs: 6185.666666,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 6355.666666,
						endMs: 6655.666666,
						timestampMs: 6505.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' become',
						startMs: 6655.666666,
						endMs: 7117.666666,
						timestampMs: 6886.666666,
						confidence: null,
					},
					{
						text: ' easier',
						startMs: 7117.666666,
						endMs: 7397.666666,
						timestampMs: 7257.666666,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 7397.666666,
						endMs: 7718.666666,
						timestampMs: 7558.666666,
						confidence: null,
					},
					{
						text: ' use.',
						startMs: 7969.666666,
						endMs: 8048.666666,
						timestampMs: 8009.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' And',
						startMs: 8299.666666,
						endMs: 8425.666666,
						timestampMs: 8362.666666,
						confidence: null,
					},
					{
						text: ' for',
						startMs: 8425.666666,
						endMs: 8598.666666,
						timestampMs: 8512.666666,
						confidence: null,
					},
					{
						text: ' a',
						startMs: 8598.666666,
						endMs: 8692.666666,
						timestampMs: 8645.666666,
						confidence: null,
					},
					{
						text: ' long',
						startMs: 8692.666666,
						endMs: 8928.666666,
						timestampMs: 8810.666666,
						confidence: null,
					},
					{
						text: ' time',
						startMs: 8928.666666,
						endMs: 9101.666666,
						timestampMs: 9015.666666,
						confidence: null,
					},
					{
						text: ' we',
						startMs: 9101.666666,
						endMs: 9211.666666,
						timestampMs: 9156.666666,
						confidence: null,
					},
					{
						text: ' did',
						startMs: 9211.666666,
						endMs: 9415.666666,
						timestampMs: 9313.666666,
						confidence: null,
					},
					{
						text: ' not',
						startMs: 9415.666666,
						endMs: 9777.666666,
						timestampMs: 9596.666666,
						confidence: null,
					},
					{
						text: ' know',
						startMs: 9777.666666,
						endMs: 10138.666666,
						timestampMs: 9958.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' how',
						startMs: 10490.666666,
						endMs: 10625.666666,
						timestampMs: 10558.666666,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 10625.666666,
						endMs: 10788.666666,
						timestampMs: 10707.666666,
						confidence: null,
					},
					{
						text: ' achieve',
						startMs: 10788.666666,
						endMs: 11087.666666,
						timestampMs: 10938.666666,
						confidence: null,
					},
					{
						text: ' that',
						startMs: 11087.666666,
						endMs: 11399.666666,
						timestampMs: 11243.666666,
						confidence: null,
					},
					{
						text: ' without',
						startMs: 11695.666666,
						endMs: 12751.666666,
						timestampMs: 12223.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' compromising',
						startMs: 12751.666666,
						endMs: 12982.666666,
						timestampMs: 12867.666666,
						confidence: null,
					},
					{
						text: ' on',
						startMs: 13317.666666,
						endMs: 13563.666666,
						timestampMs: 13440.666666,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 13563.666666,
						endMs: 13974.666666,
						timestampMs: 13769.666666,
						confidence: null,
					},
					{
						text: ' dynamicness',
						startMs: 13974.666666,
						endMs: 14730.666666,
						timestampMs: 14352.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' that',
						startMs: 15095.666666,
						endMs: 15211.666666,
						timestampMs: 15153.666666,
						confidence: null,
					},
					{
						text: ' you',
						startMs: 15211.666666,
						endMs: 15391.666666,
						timestampMs: 15301.666666,
						confidence: null,
					},
					{
						text: ' get',
						startMs: 15391.666666,
						endMs: 15661.666666,
						timestampMs: 15526.666666,
						confidence: null,
					},
					{
						text: ' when',
						startMs: 15948.666666,
						endMs: 16214.666666,
						timestampMs: 16081.666666,
						confidence: null,
					},
					{
						text: ' everything',
						startMs: 16214.666666,
						endMs: 16425.666666,
						timestampMs: 16320.666666,
						confidence: null,
					},
					{
						text: ' is',
						startMs: 16425.666666,
						endMs: 16713.666666,
						timestampMs: 16569.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' expressed',
						startMs: 16713.666666,
						endMs: 16891.666666,
						timestampMs: 16802.666666,
						confidence: null,
					},
					{
						text: ' as',
						startMs: 16891.666666,
						endMs: 17013.666666,
						timestampMs: 16952.666666,
						confidence: null,
					},
					{
						text: ' code.',
						startMs: 17068.666666,
						endMs: 17950.666666,
						timestampMs: 17509.666666,
						confidence: null,
						pageBreakAfter: true,
					},
				]}
			/>
		</>
	);
};

const SneakPeekRequestsSource = Interactive.create({
	Component: SneakPeekRequestsSourceInner,
	layout: 'absolute-fill',
});

const SneakPeekVisualModeSourceInner = () => {
	const captions = useCaptionPlacement(layout);
	return (
		<>
			<Stage
				style={{overflow: 'visible', flexDirection: 'column'}}
				keyframes={layout}
			>
				<Punch>
					<Video
						src={
							'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats10.mp4'
						}
					/>
				</Punch>
			</Stage>
			<PunchyCaptions
				combineTokensWithinMilliseconds={10000}
				width={captions.width}
				fontSize={captions.fontSize}
				style={{...captions.style, zIndex: 1}}
				keywords={['visual', 'mode', 'interactively', 'react']}
				captions={[
					// @captions whats10
					{
						text: 'We',
						startMs: 1841,
						endMs: 2065,
						timestampMs: 1953,
						confidence: null,
					},
					{
						text: ' are',
						startMs: 2065,
						endMs: 2233,
						timestampMs: 2149,
						confidence: null,
					},
					{
						text: ' now',
						startMs: 2233,
						endMs: 2699,
						timestampMs: 2466,
						confidence: null,
					},
					{
						text: ' prototyping',
						startMs: 2699,
						endMs: 3129,
						timestampMs: 2914,
						confidence: null,
					},
					{
						text: ' a',
						startMs: 3129,
						endMs: 3502,
						timestampMs: 3316,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' new',
						startMs: 3502,
						endMs: 4006,
						timestampMs: 3754,
						confidence: null,
					},
					{
						text: ' visual',
						startMs: 4006,
						endMs: 4566,
						timestampMs: 4286,
						confidence: null,
					},
					{
						text: ' mode',
						startMs: 4566,
						endMs: 4790,
						timestampMs: 4678,
						confidence: null,
					},
					{
						text: ' for',
						startMs: 4790,
						endMs: 4939,
						timestampMs: 4865,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 4939,
						endMs: 5107,
						timestampMs: 5023,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' Remotion',
						startMs: 5107,
						endMs: 5760,
						timestampMs: 5434,
						confidence: null,
					},
					{
						text: ' Studio',
						startMs: 5760,
						endMs: 6414,
						timestampMs: 6087,
						confidence: null,
					},
					{
						text: ' which',
						startMs: 6775,
						endMs: 6936,
						timestampMs: 6856,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' will',
						startMs: 6936,
						endMs: 7113,
						timestampMs: 7025,
						confidence: null,
					},
					{
						text: ' allow',
						startMs: 7113,
						endMs: 7290,
						timestampMs: 7202,
						confidence: null,
					},
					{
						text: ' you',
						startMs: 7290,
						endMs: 7435,
						timestampMs: 7363,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 7435,
						endMs: 7515,
						timestampMs: 7475,
						confidence: null,
					},
					{
						text: ' interactively',
						startMs: 7933,
						endMs: 8657,
						timestampMs: 8295,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' change',
						startMs: 8657,
						endMs: 9284,
						timestampMs: 8971,
						confidence: null,
					},
					{
						text: ' many',
						startMs: 9564,
						endMs: 9868,
						timestampMs: 9716,
						confidence: null,
					},
					{
						text: ' things',
						startMs: 9868,
						endMs: 10172,
						timestampMs: 10020,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' about',
						startMs: 10172,
						endMs: 10418,
						timestampMs: 10295,
						confidence: null,
					},
					{
						text: ' your',
						startMs: 10418,
						endMs: 10798,
						timestampMs: 10608,
						confidence: null,
					},
					{
						text: ' video',
						startMs: 10798,
						endMs: 11348,
						timestampMs: 11073,
						confidence: null,
					},
					{
						text: ' while',
						startMs: 11736,
						endMs: 11987,
						timestampMs: 11862,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' still',
						startMs: 11987,
						endMs: 12449,
						timestampMs: 12218,
						confidence: null,
					},
					{
						text: ' writing',
						startMs: 12449,
						endMs: 12953,
						timestampMs: 12701,
						confidence: null,
					},
					{
						text: ' everything',
						startMs: 12953,
						endMs: 13625,
						timestampMs: 13289,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' back',
						startMs: 13625,
						endMs: 13685,
						timestampMs: 13655,
						confidence: null,
					},
					{
						text: ' as',
						startMs: 14176.666666,
						endMs: 14683.666666,
						timestampMs: 14430.666666,
						confidence: null,
					},
					{
						text: ' regular',
						startMs: 14683.666666,
						endMs: 15255.666666,
						timestampMs: 14969.666666,
						confidence: null,
					},
					{
						text: ' React',
						startMs: 15255.666666,
						endMs: 15696.666666,
						timestampMs: 15476.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' code.',
						startMs: 15696.666666,
						endMs: 15784.666666,
						timestampMs: 15740.666666,
						confidence: null,
						pageBreakAfter: true,
					},
				]}
			/>
		</>
	);
};

const SneakPeekVisualModeSource = Interactive.create({
	Component: SneakPeekVisualModeSourceInner,
	layout: 'absolute-fill',
});

const SneakPeekSceneInner: React.FC = () => {
	return (
		<>
			<Backdrop accent={accents.sneakPeek} dark />
			<StageLayout keyframes={layout}>
				<Series>
					<Series.Sequence
						name="Sneak peek"
						durationInFrames={79}
						premountFor={30}
					>
						<ShotFraming zoom={1.06}>
							<SneakPeekRequestsSource trimBefore={51} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="Easier to use"
						durationInFrames={405}
						premountFor={30}
					>
						<ShotFraming zoom={1.18}>
							<SneakPeekRequestsSource trimBefore={147} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="Visual mode"
						durationInFrames={361}
						premountFor={30}
					>
						<ShotFraming zoom={1.04}>
							<SneakPeekVisualModeSource trimBefore={51} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="Regular React code"
						durationInFrames={67}
						premountFor={30}
					>
						<ShotFraming zoom={1.16}>
							<SneakPeekVisualModeSource trimBefore={423} />
						</ShotFraming>
					</Series.Sequence>
				</Series>
			</StageLayout>

			<Spotlight name="Spotlight" durationInFrames={184} />
			<Letterbox name="Letterbox" durationInFrames={190} />
			<Sequence name="Sneak peek sticker" from={26} durationInFrames={58}>
				<ChapterSticker
					index={<EyeIcon size={64} color={colors.paper} strokeWidth={2.4} />}
					title="Sneak peek"
					overline="What's next"
					accent={accents.soundEffects}
				/>
			</Sequence>
			<Requests
				name="Requests"
				from={79}
				durationInFrames={104}
				style={{overflow: 'visible', flexDirection: 'column'}}
			/>
			<Sequence name="Tradeoff" from={188} durationInFrames={300}>
				<Tradeoff />
			</Sequence>
			<Sequence name="Studio mock" from={520} durationInFrames={392}>
				<div style={{position: 'absolute', left: 60, top: 70}}>
					<Pop from="up" exitDuration={1}>
						<StudioMock />
					</Pop>
				</div>
			</Sequence>
			<Sequence name="Visual mode title" from={540} durationInFrames={372}>
				<VisualModeTitle />
			</Sequence>
			<Sequence name="React code chip" from={858} durationInFrames={54}>
				<div
					style={{
						position: 'absolute',
						left: 760,
						top: 600,
						translate: '-50% 0',
					}}
				>
					<Pop from="up">
						<Chip background={colors.blue} color={colors.paper} fontSize={40}>
							{'</>'} Regular React code
						</Chip>
					</Pop>
				</div>
			</Sequence>

			<Track name="Sound effects">
				<Audio
					durationInFrames={10}
					name="Shutter"
					src="https://remotion.media/shutter-old.wav"
					from={28}
					volume={0.3}
				/>
				<Audio
					durationInFrames={7}
					name="Request 1"
					src="https://remotion.media/snapchat-notification.wav"
					from={92}
					volume={0.12}
				/>
				<Audio
					durationInFrames={7}
					name="Request 2"
					src="https://remotion.media/snapchat-notification.wav"
					from={116}
					volume={0.1}
				/>
				<Audio
					durationInFrames={7}
					name="Request 3"
					src="https://remotion.media/snapchat-notification.wav"
					from={146}
					volume={0.1}
				/>
				<Audio
					durationInFrames={5}
					name="Split whoosh"
					src="https://remotion.media/whoosh.wav"
					from={182}
					volume={0.22}
				/>
				<Audio
					durationInFrames={5}
					name="Reveal whoosh"
					src="https://remotion.media/whoosh.wav"
					from={516}
					volume={0.36}
				/>
				<Audio
					durationInFrames={10}
					name="Visual mode toggle"
					src="https://remotion.media/switch.wav"
					from={554}
					volume={0.3}
				/>
				<Audio
					durationInFrames={12}
					name="Select click"
					src="https://remotion.media/mouse-click.wav"
					from={618}
					volume={0.32}
				/>
				<Audio
					durationInFrames={12}
					name="Color click"
					src="https://remotion.media/mouse-click.wav"
					from={798}
					volume={0.3}
				/>
				<Audio
					durationInFrames={42}
					name="Saved ding"
					src="https://remotion.media/ding.wav"
					from={820}
					volume={0.22}
				/>
			</Track>
		</>
	);
};

const Spotlight = Interactive.create({
	Component: SpotlightInner,
	layout: 'none',
});
const Requests = Interactive.create({
	Component: RequestsInner,
	layout: 'absolute-fill',
});
export const SneakPeekScene = Interactive.create({
	Component: SneakPeekSceneInner,
	layout: 'absolute-fill',
});
