import {Audio, Video} from '@remotion/media';
import React from 'react';
import {Track, Interactive, Series, useCurrentFrame} from 'remotion';
import {Backdrop} from '../components/Background';
import {PunchyCaptions} from '../components/Captions';
import {
	getCaptionPlacement,
	Punch,
	Stage,
	type LayoutKeyframe,
} from '../components/Stage';
import {accents} from '../theme';

const layout: LayoutKeyframe[] = [
	{at: 0, layout: 'full'},
	{at: 132, layout: 'split'},
];

const LightLeaksSceneInner: React.FC = () => {
	const frame = useCurrentFrame();
	const captions = getCaptionPlacement(frame, layout);

	return (
		<>
			<Backdrop accent={accents.lightLeaks} showInTimeline={false} />
			<Stage
				style={{overflow: 'visible', flexDirection: 'column'}}
				keyframes={layout}
				showInTimeline={false}
			>
				<Series>
					<Series.Sequence
						name="Intro line"
						durationInFrames={224}
						premountFor={30}
					>
						<Punch zoom={1}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats2.mp4'
								}
								trimBefore={191}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="Procedurally generated"
						durationInFrames={226}
						premountFor={30}
					>
						<Punch zoom={1.14}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats2.mp4'
								}
								trimBefore={435}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="Components or skill"
						durationInFrames={270}
						premountFor={30}
					>
						<Punch zoom={1.02}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats2.mp4'
								}
								trimBefore={671}
							/>
						</Punch>
					</Series.Sequence>
				</Series>
			</Stage>

			<PunchyCaptions
				width={captions.width}
				fontSize={captions.fontSize}
				style={captions.style}
				keywords={['light', 'leaks', 'leak', 'infinite', 'color', 'skill']}
				captions={[
					// @captions whats2
					{
						text: 'First',
						startMs: 154,
						endMs: 491,
						timestampMs: 323,
						confidence: null,
					},
					{
						text: ' up,',
						startMs: 491,
						endMs: 772,
						timestampMs: 632,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' light',
						startMs: 959,
						endMs: 1333,
						timestampMs: 1146,
						confidence: null,
					},
					{
						text: ' leaks.',
						startMs: 1333,
						endMs: 1633,
						timestampMs: 1483,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' They',
						startMs: 1633,
						endMs: 1913,
						timestampMs: 1773,
						confidence: null,
					},
					{
						text: ' are',
						startMs: 1913,
						endMs: 2157,
						timestampMs: 2035,
						confidence: null,
					},
					{
						text: ' a',
						startMs: 2157,
						endMs: 2418,
						timestampMs: 2288,
						confidence: null,
					},
					{
						text: ' common',
						startMs: 2418,
						endMs: 2680,
						timestampMs: 2549,
						confidence: null,
					},
					{
						text: ' effect',
						startMs: 2680,
						endMs: 2980,
						timestampMs: 2830,
						confidence: null,
					},
					{
						text: ' in',
						startMs: 2980,
						endMs: 3298,
						timestampMs: 3139,
						confidence: null,
					},
					{
						text: ' video',
						startMs: 3298,
						endMs: 3635,
						timestampMs: 3467,
						confidence: null,
					},
					{
						text: ' editing',
						startMs: 3635,
						endMs: 3915,
						timestampMs: 3775,
						confidence: null,
					},
					{
						text: ' and',
						startMs: 3915,
						endMs: 4252,
						timestampMs: 4084,
						confidence: null,
					},
					{
						text: ' now',
						startMs: 4252,
						endMs: 4757,
						timestampMs: 4505,
						confidence: null,
					},
					{
						text: ' we',
						startMs: 5185,
						endMs: 5418,
						timestampMs: 5302,
						confidence: null,
					},
					{
						text: ' have',
						startMs: 5418,
						endMs: 5670,
						timestampMs: 5544,
						confidence: null,
					},
					{
						text: ' a',
						startMs: 5670,
						endMs: 6064,
						timestampMs: 5867,
						confidence: null,
					},
					{
						text: ' native',
						startMs: 6064,
						endMs: 6602,
						timestampMs: 6333,
						confidence: null,
					},
					{
						text: ' component',
						startMs: 6602,
						endMs: 6907,
						timestampMs: 6755,
						confidence: null,
					},
					{
						text: ' for',
						startMs: 6907,
						endMs: 7158,
						timestampMs: 7033,
						confidence: null,
					},
					{
						text: ' it.',
						startMs: 7158,
						endMs: 7302,
						timestampMs: 7230,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' They',
						startMs: 7550,
						endMs: 7785,
						timestampMs: 7668,
						confidence: null,
					},
					{
						text: ' are',
						startMs: 7785,
						endMs: 8056,
						timestampMs: 7921,
						confidence: null,
					},
					{
						text: ' procedurally',
						startMs: 8056,
						endMs: 8779,
						timestampMs: 8418,
						confidence: null,
					},
					{
						text: ' generated',
						startMs: 8779,
						endMs: 8995,
						timestampMs: 8887,
						confidence: null,
					},
					{
						text: ' so',
						startMs: 8995,
						endMs: 9194,
						timestampMs: 9095,
						confidence: null,
					},
					{
						text: ' there',
						startMs: 9194,
						endMs: 9519,
						timestampMs: 9357,
						confidence: null,
					},
					{
						text: ' are',
						startMs: 9519,
						endMs: 9808,
						timestampMs: 9664,
						confidence: null,
					},
					{
						text: ' an',
						startMs: 9808,
						endMs: 10206,
						timestampMs: 10007,
						confidence: null,
					},
					{
						text: ' infinite',
						startMs: 10206,
						endMs: 10531,
						timestampMs: 10369,
						confidence: null,
					},
					{
						text: ' amount',
						startMs: 10531,
						endMs: 10747,
						timestampMs: 10639,
						confidence: null,
					},
					{
						text: ' of',
						startMs: 10747,
						endMs: 11163,
						timestampMs: 10955,
						confidence: null,
					},
					{
						text: ' variations',
						startMs: 11163,
						endMs: 11470,
						timestampMs: 11317,
						confidence: null,
					},
					{
						text: ' for',
						startMs: 11470,
						endMs: 11614,
						timestampMs: 11542,
						confidence: null,
					},
					{
						text: ' it',
						startMs: 11614,
						endMs: 11795,
						timestampMs: 11705,
						confidence: null,
					},
					{
						text: ' and',
						startMs: 11795,
						endMs: 12102,
						timestampMs: 11949,
						confidence: null,
					},
					{
						text: ' also',
						startMs: 12102,
						endMs: 12319,
						timestampMs: 12211,
						confidence: null,
					},
					{
						text: ' they',
						startMs: 12319,
						endMs: 12481,
						timestampMs: 12400,
						confidence: null,
					},
					{
						text: ' can',
						startMs: 12481,
						endMs: 12897,
						timestampMs: 12689,
						confidence: null,
					},
					{
						text: ' assume',
						startMs: 12897,
						endMs: 13637,
						timestampMs: 13267,
						confidence: null,
					},
					{
						text: ' any',
						startMs: 14120,
						endMs: 14620,
						timestampMs: 14370,
						confidence: null,
					},
					{
						text: ' color.',
						startMs: 14620,
						endMs: 14845,
						timestampMs: 14733,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' You',
						startMs: 15081,
						endMs: 15191,
						timestampMs: 15136,
						confidence: null,
					},
					{
						text: ' can',
						startMs: 15191,
						endMs: 15317,
						timestampMs: 15254,
						confidence: null,
					},
					{
						text: ' use',
						startMs: 15317,
						endMs: 15475,
						timestampMs: 15396,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 15475,
						endMs: 15633,
						timestampMs: 15554,
						confidence: null,
					},
					{
						text: ' light',
						startMs: 15633,
						endMs: 15839,
						timestampMs: 15736,
						confidence: null,
					},
					{
						text: ' leak',
						startMs: 15839,
						endMs: 16281,
						timestampMs: 16060,
						confidence: null,
					},
					{
						text: ' components',
						startMs: 16281,
						endMs: 16897,
						timestampMs: 16589,
						confidence: null,
					},
					{
						text: ' directly',
						startMs: 16897,
						endMs: 16957,
						timestampMs: 16927,
						confidence: null,
					},
					{
						text: ' or',
						startMs: 17292,
						endMs: 17529,
						timestampMs: 17411,
						confidence: null,
					},
					{
						text: ' use',
						startMs: 17529,
						endMs: 17655,
						timestampMs: 17592,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 17655,
						endMs: 17971,
						timestampMs: 17813,
						confidence: null,
					},
					{
						text: ' new',
						startMs: 17971,
						endMs: 18713,
						timestampMs: 18342,
						confidence: null,
					},
					{
						text: ' accompanying',
						startMs: 19067,
						endMs: 20819,
						timestampMs: 19943,
						confidence: null,
					},
					{
						text: ' skill',
						startMs: 20819,
						endMs: 20879,
						timestampMs: 20849,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 21316,
						endMs: 21433,
						timestampMs: 21375,
						confidence: null,
					},
					{
						text: ' make',
						startMs: 21433,
						endMs: 21551,
						timestampMs: 21492,
						confidence: null,
					},
					{
						text: ' a',
						startMs: 21551,
						endMs: 21760,
						timestampMs: 21656,
						confidence: null,
					},
					{
						text: ' stylish',
						startMs: 21760,
						endMs: 22153,
						timestampMs: 21957,
						confidence: null,
					},
					{
						text: ' transition',
						startMs: 22153,
						endMs: 22493,
						timestampMs: 22323,
						confidence: null,
					},
					{
						text: ' between',
						startMs: 22493,
						endMs: 22847,
						timestampMs: 22670,
						confidence: null,
					},
					{
						text: ' scenes.',
						startMs: 22847,
						endMs: 23540,
						timestampMs: 23194,
						confidence: null,
						pageBreakAfter: true,
					},
				]}
			/>

			<Track name="Sound effects">
				<Audio
					durationInFrames={5}
					name="Sticker whoosh"
					src="https://remotion.media/whoosh.wav"
					from={4}
					volume={0.32}
				/>
				<Audio
					durationInFrames={6}
					name="Split whip"
					src="https://remotion.media/whip.wav"
					from={130}
					volume={0.18}
				/>
				<Audio
					durationInFrames={12}
					name="Grid click"
					src="https://remotion.media/mouse-click.wav"
					from={240}
					volume={0.3}
				/>
				<Audio
					durationInFrames={10}
					name="Skill switch"
					src="https://remotion.media/switch.wav"
					from={532}
					volume={0.3}
				/>
				<Audio
					durationInFrames={5}
					name="Demo whoosh"
					src="https://remotion.media/whoosh.wav"
					from={660}
					volume={0.26}
				/>
			</Track>
		</>
	);
};

export const LightLeaksScene = Interactive.create({
	Component: LightLeaksSceneInner,
	layout: 'absolute-fill',
});
