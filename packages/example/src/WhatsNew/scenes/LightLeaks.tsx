import {Audio, Video} from '@remotion/media';
import React from 'react';
import {Track, Interactive, Series} from 'remotion';
import {Backdrop} from '../components/Background';
import {PunchyCaptions} from '../components/Captions';
import {
	ShotFraming,
	StageLayout,
	useCaptionPlacement,
	Punch,
	Stage,
	type LayoutKeyframe,
} from '../components/Stage';
import {accents} from '../theme';

const layout: LayoutKeyframe[] = [
	{at: 0, layout: 'full'},
	{at: 132, layout: 'split'},
];

const LightLeaksSourceInner = () => {
	const captions = useCaptionPlacement(layout);
	return (
		<>
			<Stage
				style={{overflow: 'visible', flexDirection: 'column'}}
				keyframes={layout}
				showInTimeline={false}
			>
				<Punch>
					<Video
						src={
							'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats2.mp4'
						}
					/>
				</Punch>
			</Stage>
			<PunchyCaptions
				combineTokensWithinMilliseconds={10000}
				width={captions.width}
				fontSize={captions.fontSize}
				style={{...captions.style, zIndex: 1}}
				keywords={['light', 'leaks', 'leak', 'infinite', 'color', 'skill']}
				captions={[
					// @captions whats2
					{
						text: 'First',
						startMs: 6520.666666,
						endMs: 6857.666666,
						timestampMs: 6689.666666,
						confidence: null,
					},
					{
						text: ' up,',
						startMs: 6857.666666,
						endMs: 7138.666666,
						timestampMs: 6998.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' light',
						startMs: 7325.666666,
						endMs: 7699.666666,
						timestampMs: 7512.666666,
						confidence: null,
					},
					{
						text: ' leaks.',
						startMs: 7699.666666,
						endMs: 7999.666666,
						timestampMs: 7849.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' They',
						startMs: 7999.666666,
						endMs: 8279.666666,
						timestampMs: 8139.666666,
						confidence: null,
					},
					{
						text: ' are',
						startMs: 8279.666666,
						endMs: 8523.666666,
						timestampMs: 8401.666666,
						confidence: null,
					},
					{
						text: ' a',
						startMs: 8523.666666,
						endMs: 8784.666666,
						timestampMs: 8654.666666,
						confidence: null,
					},
					{
						text: ' common',
						startMs: 8784.666666,
						endMs: 9046.666666,
						timestampMs: 8915.666666,
						confidence: null,
					},
					{
						text: ' effect',
						startMs: 9046.666666,
						endMs: 9346.666666,
						timestampMs: 9196.666666,
						confidence: null,
					},
					{
						text: ' in',
						startMs: 9346.666666,
						endMs: 9664.666666,
						timestampMs: 9505.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' video',
						startMs: 9664.666666,
						endMs: 10001.666666,
						timestampMs: 9833.666666,
						confidence: null,
					},
					{
						text: ' editing',
						startMs: 10001.666666,
						endMs: 10281.666666,
						timestampMs: 10141.666666,
						confidence: null,
					},
					{
						text: ' and',
						startMs: 10281.666666,
						endMs: 10618.666666,
						timestampMs: 10450.666666,
						confidence: null,
					},
					{
						text: ' now',
						startMs: 10618.666666,
						endMs: 11123.666666,
						timestampMs: 10871.666666,
						confidence: null,
					},
					{
						text: ' we',
						startMs: 11551.666666,
						endMs: 11784.666666,
						timestampMs: 11668.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' have',
						startMs: 11784.666666,
						endMs: 12036.666666,
						timestampMs: 11910.666666,
						confidence: null,
					},
					{
						text: ' a',
						startMs: 12036.666666,
						endMs: 12430.666666,
						timestampMs: 12233.666666,
						confidence: null,
					},
					{
						text: ' native',
						startMs: 12430.666666,
						endMs: 12968.666666,
						timestampMs: 12699.666666,
						confidence: null,
					},
					{
						text: ' component',
						startMs: 12968.666666,
						endMs: 13273.666666,
						timestampMs: 13121.666666,
						confidence: null,
					},
					{
						text: ' for',
						startMs: 13273.666666,
						endMs: 13524.666666,
						timestampMs: 13399.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' it.',
						startMs: 13524.666666,
						endMs: 13668.666666,
						timestampMs: 13596.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' They',
						startMs: 14583.333333,
						endMs: 14818.333333,
						timestampMs: 14701.333333,
						confidence: null,
					},
					{
						text: ' are',
						startMs: 14818.333333,
						endMs: 15089.333333,
						timestampMs: 14954.333333,
						confidence: null,
					},
					{
						text: ' procedurally',
						startMs: 15089.333333,
						endMs: 15812.333333,
						timestampMs: 15451.333333,
						confidence: null,
					},
					{
						text: ' generated',
						startMs: 15812.333333,
						endMs: 16028.333333,
						timestampMs: 15920.333333,
						confidence: null,
					},
					{
						text: ' so',
						startMs: 16028.333333,
						endMs: 16227.333333,
						timestampMs: 16128.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' there',
						startMs: 16227.333333,
						endMs: 16552.333333,
						timestampMs: 16390.333333,
						confidence: null,
					},
					{
						text: ' are',
						startMs: 16552.333333,
						endMs: 16841.333333,
						timestampMs: 16697.333333,
						confidence: null,
					},
					{
						text: ' an',
						startMs: 16841.333333,
						endMs: 17239.333333,
						timestampMs: 17040.333333,
						confidence: null,
					},
					{
						text: ' infinite',
						startMs: 17239.333333,
						endMs: 17564.333333,
						timestampMs: 17402.333333,
						confidence: null,
					},
					{
						text: ' amount',
						startMs: 17564.333333,
						endMs: 17780.333333,
						timestampMs: 17672.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' of',
						startMs: 17780.333333,
						endMs: 18196.333333,
						timestampMs: 17988.333333,
						confidence: null,
					},
					{
						text: ' variations',
						startMs: 18196.333333,
						endMs: 18503.333333,
						timestampMs: 18350.333333,
						confidence: null,
					},
					{
						text: ' for',
						startMs: 18503.333333,
						endMs: 18647.333333,
						timestampMs: 18575.333333,
						confidence: null,
					},
					{
						text: ' it',
						startMs: 18647.333333,
						endMs: 18828.333333,
						timestampMs: 18738.333333,
						confidence: null,
					},
					{
						text: ' and',
						startMs: 18828.333333,
						endMs: 19135.333333,
						timestampMs: 18982.333333,
						confidence: null,
					},
					{
						text: ' also',
						startMs: 19135.333333,
						endMs: 19352.333333,
						timestampMs: 19244.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' they',
						startMs: 19352.333333,
						endMs: 19514.333333,
						timestampMs: 19433.333333,
						confidence: null,
					},
					{
						text: ' can',
						startMs: 19514.333333,
						endMs: 19930.333333,
						timestampMs: 19722.333333,
						confidence: null,
					},
					{
						text: ' assume',
						startMs: 19930.333333,
						endMs: 20670.333333,
						timestampMs: 20300.333333,
						confidence: null,
					},
					{
						text: ' any',
						startMs: 21153.333333,
						endMs: 21653.333333,
						timestampMs: 21403.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' color.',
						startMs: 21653.333333,
						endMs: 21878.333333,
						timestampMs: 21766.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' You',
						startMs: 22447.666666,
						endMs: 22557.666666,
						timestampMs: 22502.666666,
						confidence: null,
					},
					{
						text: ' can',
						startMs: 22557.666666,
						endMs: 22683.666666,
						timestampMs: 22620.666666,
						confidence: null,
					},
					{
						text: ' use',
						startMs: 22683.666666,
						endMs: 22841.666666,
						timestampMs: 22762.666666,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 22841.666666,
						endMs: 22999.666666,
						timestampMs: 22920.666666,
						confidence: null,
					},
					{
						text: ' light',
						startMs: 22999.666666,
						endMs: 23205.666666,
						timestampMs: 23102.666666,
						confidence: null,
					},
					{
						text: ' leak',
						startMs: 23205.666666,
						endMs: 23647.666666,
						timestampMs: 23426.666666,
						confidence: null,
					},
					{
						text: ' components',
						startMs: 23647.666666,
						endMs: 24263.666666,
						timestampMs: 23955.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' directly',
						startMs: 24263.666666,
						endMs: 24323.666666,
						timestampMs: 24293.666666,
						confidence: null,
					},
					{
						text: ' or',
						startMs: 24658.666666,
						endMs: 24895.666666,
						timestampMs: 24777.666666,
						confidence: null,
					},
					{
						text: ' use',
						startMs: 24895.666666,
						endMs: 25021.666666,
						timestampMs: 24958.666666,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 25021.666666,
						endMs: 25337.666666,
						timestampMs: 25179.666666,
						confidence: null,
					},
					{
						text: ' new',
						startMs: 25337.666666,
						endMs: 26079.666666,
						timestampMs: 25708.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' accompanying',
						startMs: 26433.666666,
						endMs: 28185.666666,
						timestampMs: 27309.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' skill',
						startMs: 28185.666666,
						endMs: 28245.666666,
						timestampMs: 28215.666666,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 28682.666666,
						endMs: 28799.666666,
						timestampMs: 28741.666666,
						confidence: null,
					},
					{
						text: ' make',
						startMs: 28799.666666,
						endMs: 28917.666666,
						timestampMs: 28858.666666,
						confidence: null,
					},
					{
						text: ' a',
						startMs: 28917.666666,
						endMs: 29126.666666,
						timestampMs: 29022.666666,
						confidence: null,
					},
					{
						text: ' stylish',
						startMs: 29126.666666,
						endMs: 29519.666666,
						timestampMs: 29323.666666,
						confidence: null,
					},
					{
						text: ' transition',
						startMs: 29519.666666,
						endMs: 29859.666666,
						timestampMs: 29689.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' between',
						startMs: 29859.666666,
						endMs: 30213.666666,
						timestampMs: 30036.666666,
						confidence: null,
					},
					{
						text: ' scenes.',
						startMs: 30213.666666,
						endMs: 30906.666666,
						timestampMs: 30560.666666,
						confidence: null,
						pageBreakAfter: true,
					},
				]}
			/>
		</>
	);
};

const LightLeaksSource = Interactive.create({
	Component: LightLeaksSourceInner,
	layout: 'absolute-fill',
});

const LightLeaksSceneInner: React.FC = () => {
	return (
		<>
			<Backdrop accent={accents.lightLeaks} showInTimeline={false} />
			<StageLayout keyframes={layout}>
				<Series>
					<Series.Sequence
						name="Intro line"
						durationInFrames={224}
						premountFor={30}
					>
						<ShotFraming zoom={1}>
							<LightLeaksSource trimBefore={191} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="Procedurally generated"
						durationInFrames={226}
						premountFor={30}
					>
						<ShotFraming zoom={1.14}>
							<LightLeaksSource trimBefore={435} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="Components or skill"
						durationInFrames={270}
						premountFor={30}
					>
						<ShotFraming zoom={1.02}>
							<LightLeaksSource trimBefore={671} />
						</ShotFraming>
					</Series.Sequence>
				</Series>
			</StageLayout>

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
