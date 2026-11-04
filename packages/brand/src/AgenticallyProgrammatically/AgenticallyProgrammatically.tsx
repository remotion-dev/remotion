import {Audio, Video} from '@remotion/media';
import {TransitionSeries} from '@remotion/transitions';
import {BasicCaptions} from '../basic-captions';
import {ThreeWaysHero} from './ThreeWaysHero';
import {QuickEditsBroll} from './QuickEditsBroll';
import {MottoCaptions, MottoPresenter, MottoSidebar} from './MottoSidebar';

export const AgenticallyProgrammatically = () => {
	return (
		<TransitionSeries name="AgenticallyProgrammatically - rough cut">
			<TransitionSeries.Sequence
				name="01 - The new Remotion motto"
				trimBefore={69}
				durationInFrames={451}
			>
				<MottoPresenter>
					<Video
						name="here1.mov"
						src="https://remotion.media/here-2026-11-03/here1-a093d66bdf14.mov"
						muted
						cropLeft={0.151442308}
						cropRight={0.079326923}
						cropTop={0.189458689}
						cropBottom={0.041310541}
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: '130%',
							height: '130%',
							objectFit: 'cover',
							translate: '-378px -266px',
						}}
					/>
				</MottoPresenter>
				<Audio
					name="here1 - cleaned dialogue"
					src="https://remotion.media/here-2026-11-03/audio/here1-auphonic-7a767eea0051.flac"
					volume={0.25}
				/>
				<MottoCaptions>
					<BasicCaptions
						name="01 - Captions"
						width={1200}
						combineTokensWithinMilliseconds={10000}
						style={{position: 'absolute', bottom: 80, translate: '360px 0px'}}
						captions={[
							{
								text: 'Here',
								startMs: 2460,
								endMs: 2660,
								timestampMs: 2560,
								confidence: null,
							},
							{
								text: ' at',
								startMs: 2660,
								endMs: 2840,
								timestampMs: 2750,
								confidence: null,
							},
							{
								text: ' Remotion',
								startMs: 2840,
								endMs: 3640,
								timestampMs: 3240,
								confidence: null,
							},
							{
								text: ' our',
								startMs: 3640,
								endMs: 3900,
								timestampMs: 3770,
								confidence: null,
							},
							{
								text: ' new',
								startMs: 3900,
								endMs: 4080,
								timestampMs: 3990,
								confidence: null,
							},
							{
								text: ' motto',
								startMs: 4080,
								endMs: 4560,
								timestampMs: 4320,
								confidence: null,
							},
							{
								text: ' is',
								startMs: 4560,
								endMs: 5500,
								timestampMs: 5030,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' Make',
								startMs: 5500,
								endMs: 5840,
								timestampMs: 5670,
								confidence: null,
							},
							{
								text: ' videos',
								startMs: 5840,
								endMs: 6340,
								timestampMs: 6090,
								confidence: null,
							},
							{
								text: ' programmatically,',
								startMs: 6340,
								endMs: 7680,
								timestampMs: 7010,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' interactively,',
								startMs: 8000,
								endMs: 8760,
								timestampMs: 8380,
								confidence: null,
							},
							{
								text: ' and',
								startMs: 9420,
								endMs: 9480,
								timestampMs: 9450,
								confidence: null,
							},
							{
								text: ' agentically.',
								startMs: 9780,
								endMs: 10660,
								timestampMs: 10220,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' What',
								startMs: 11220,
								endMs: 11380,
								timestampMs: 11300,
								confidence: null,
							},
							{
								text: ' we',
								startMs: 11380,
								endMs: 11520,
								timestampMs: 11450,
								confidence: null,
							},
							{
								text: ' mean',
								startMs: 11520,
								endMs: 11760,
								timestampMs: 11640,
								confidence: null,
							},
							{
								text: ' by',
								startMs: 11760,
								endMs: 12000,
								timestampMs: 11880,
								confidence: null,
							},
							{
								text: ' that',
								startMs: 12000,
								endMs: 12280,
								timestampMs: 12140,
								confidence: null,
							},
							{
								text: ' is',
								startMs: 12280,
								endMs: 12600,
								timestampMs: 12440,
								confidence: null,
							},
							{
								text: ' that',
								startMs: 12600,
								endMs: 13340,
								timestampMs: 12970,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' everything',
								startMs: 13340,
								endMs: 13620,
								timestampMs: 13480,
								confidence: null,
							},
							{
								text: ' you',
								startMs: 13620,
								endMs: 13740,
								timestampMs: 13680,
								confidence: null,
							},
							{
								text: ' do',
								startMs: 13740,
								endMs: 13900,
								timestampMs: 13820,
								confidence: null,
							},
							{
								text: ' in',
								startMs: 13900,
								endMs: 14100,
								timestampMs: 14000,
								confidence: null,
							},
							{
								text: ' Remotion',
								startMs: 14100,
								endMs: 14840,
								timestampMs: 14470,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' should',
								startMs: 14840,
								endMs: 14980,
								timestampMs: 14910,
								confidence: null,
							},
							{
								text: ' be',
								startMs: 14980,
								endMs: 15000,
								timestampMs: 14990,
								confidence: null,
							},
							{
								text: ' possible',
								startMs: 15380,
								endMs: 16200,
								timestampMs: 15790,
								confidence: null,
							},
							{
								text: ' in',
								startMs: 16200,
								endMs: 16420,
								timestampMs: 16310,
								confidence: null,
							},
							{
								text: ' 3',
								startMs: 16420,
								endMs: 16760,
								timestampMs: 16590,
								confidence: null,
							},
							{
								text: ' ways.',
								startMs: 16760,
								endMs: 17700,
								timestampMs: 17230,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
					/>
				</MottoCaptions>
				<MottoSidebar name="Homepage motto sidebar" />
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="02 - Three ways to create"
				trimBefore={56}
				durationInFrames={274}
			>
				<Video
					name="here2.mov"
					src="https://remotion.media/here-2026-11-03/here2-2922b2c4ffc1.mov"
					muted
					cropLeft={0.142628205}
					cropRight={0.088141026}
					cropTop={0.190883191}
					cropBottom={0.03988604}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: '130%',
						height: '130%',
						objectFit: 'cover',
						translate: '-356px -268px',
					}}
				/>
				<Audio
					name="here2 - cleaned dialogue"
					src="https://remotion.media/here-2026-11-03/audio/here2-auphonic-4a6e2a0ce1df.flac"
					volume={0.25}
				/>
				<ThreeWaysHero
					name="Three ways - homepage hero"
					style={{scale: 1.18, transformOrigin: '50% 100%'}}
				/>
				<BasicCaptions
					name="02 - Captions"
					width={1200}
					combineTokensWithinMilliseconds={10000}
					style={{position: 'absolute', bottom: 80, translate: '360px 0px'}}
					captions={[
						{
							text: 'by',
							startMs: 2020,
							endMs: 2300,
							timestampMs: 2160,
							confidence: null,
						},
						{
							text: ' using',
							startMs: 2300,
							endMs: 2520,
							timestampMs: 2410,
							confidence: null,
						},
						{
							text: ' a',
							startMs: 2520,
							endMs: 2820,
							timestampMs: 2670,
							confidence: null,
						},
						{
							text: ' coding',
							startMs: 2820,
							endMs: 3180,
							timestampMs: 3000,
							confidence: null,
						},
						{
							text: ' agent,',
							startMs: 3180,
							endMs: 3880,
							timestampMs: 3530,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' by',
							startMs: 4360,
							endMs: 4680,
							timestampMs: 4520,
							confidence: null,
						},
						{
							text: ' using',
							startMs: 4680,
							endMs: 4920,
							timestampMs: 4800,
							confidence: null,
						},
						{
							text: ' the',
							startMs: 4920,
							endMs: 5340,
							timestampMs: 5130,
							confidence: null,
						},
						{
							text: ' Studio',
							startMs: 5340,
							endMs: 5820,
							timestampMs: 5580,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' like',
							startMs: 5820,
							endMs: 6100,
							timestampMs: 5960,
							confidence: null,
						},
						{
							text: ' a',
							startMs: 6100,
							endMs: 6440,
							timestampMs: 6270,
							confidence: null,
						},
						{
							text: ' regular',
							startMs: 6440,
							endMs: 6780,
							timestampMs: 6610,
							confidence: null,
						},
						{
							text: ' video',
							startMs: 6780,
							endMs: 7120,
							timestampMs: 6950,
							confidence: null,
						},
						{
							text: ' editor,',
							startMs: 7120,
							endMs: 7760,
							timestampMs: 7440,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' or',
							startMs: 8400,
							endMs: 8620,
							timestampMs: 8510,
							confidence: null,
						},
						{
							text: ' by',
							startMs: 8620,
							endMs: 9080,
							timestampMs: 8850,
							confidence: null,
						},
						{
							text: ' editing',
							startMs: 9080,
							endMs: 9340,
							timestampMs: 9210,
							confidence: null,
						},
						{
							text: ' the',
							startMs: 9340,
							endMs: 9540,
							timestampMs: 9440,
							confidence: null,
						},
						{
							text: ' code',
							startMs: 9540,
							endMs: 10000,
							timestampMs: 9770,
							confidence: null,
						},
						{
							text: ' directly.',
							startMs: 10120,
							endMs: 10780,
							timestampMs: 10450,
							confidence: null,
							pageBreakAfter: true,
						},
					]}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="03 - Everything in all three ways"
				trimBefore={126}
				durationInFrames={412}
			>
				<Video
					name="here3.mov"
					src="https://remotion.media/here-2026-11-03/here3-4d3e68ccecde.mov"
					muted
					cropLeft={0.157451923}
					cropRight={0.073317308}
					cropTop={0.184472934}
					cropBottom={0.046296296}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: '130%',
						height: '130%',
						objectFit: 'cover',
						translate: '-393px -259px',
					}}
				/>
				<Audio
					name="here3 - cleaned dialogue"
					src="https://remotion.media/here-2026-11-03/audio/here3-auphonic-64fe0c400eb6.flac"
					volume={0.25}
				/>
				<BasicCaptions
					name="03 - Captions"
					width={1200}
					combineTokensWithinMilliseconds={10000}
					style={{position: 'absolute', bottom: 80, translate: '360px 0px'}}
					captions={[
						{
							text: 'Whether',
							startMs: 4340,
							endMs: 4620,
							timestampMs: 4480,
							confidence: null,
						},
						{
							text: ' it',
							startMs: 4620,
							endMs: 4760,
							timestampMs: 4690,
							confidence: null,
						},
						{
							text: ' is',
							startMs: 4760,
							endMs: 5040,
							timestampMs: 4900,
							confidence: null,
						},
						{
							text: ' about',
							startMs: 5040,
							endMs: 5420,
							timestampMs: 5230,
							confidence: null,
						},
						{
							text: ' adding',
							startMs: 5420,
							endMs: 5900,
							timestampMs: 5660,
							confidence: null,
						},
						{
							text: ' content,',
							startMs: 5900,
							endMs: 6720,
							timestampMs: 6310,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' editing,',
							startMs: 7080,
							endMs: 7800,
							timestampMs: 7440,
							confidence: null,
						},
						{
							text: ' adding',
							startMs: 8380,
							endMs: 8580,
							timestampMs: 8480,
							confidence: null,
						},
						{
							text: ' and',
							startMs: 8580,
							endMs: 8860,
							timestampMs: 8720,
							confidence: null,
						},
						{
							text: ' working',
							startMs: 8860,
							endMs: 9160,
							timestampMs: 9010,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' with',
							startMs: 9160,
							endMs: 9500,
							timestampMs: 9330,
							confidence: null,
						},
						{
							text: ' captions,',
							startMs: 9500,
							endMs: 10540,
							timestampMs: 10020,
							confidence: null,
						},
						{
							text: ' exporting',
							startMs: 11320,
							endMs: 11620,
							timestampMs: 11470,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' or',
							startMs: 11860,
							endMs: 12220,
							timestampMs: 12040,
							confidence: null,
						},
						{
							text: ' changing',
							startMs: 12220,
							endMs: 12660,
							timestampMs: 12440,
							confidence: null,
						},
						{
							text: ' settings',
							startMs: 12660,
							endMs: 13120,
							timestampMs: 12890,
							confidence: null,
						},
						{
							text: ' in',
							startMs: 13120,
							endMs: 13320,
							timestampMs: 13220,
							confidence: null,
						},
						{
							text: ' Remotion,',
							startMs: 13320,
							endMs: 14300,
							timestampMs: 13810,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' everything',
							startMs: 14800,
							endMs: 15000,
							timestampMs: 14900,
							confidence: null,
						},
						{
							text: ' should',
							startMs: 15000,
							endMs: 15160,
							timestampMs: 15080,
							confidence: null,
						},
						{
							text: ' be',
							startMs: 15160,
							endMs: 15520,
							timestampMs: 15340,
							confidence: null,
						},
						{
							text: ' possible',
							startMs: 15520,
							endMs: 16400,
							timestampMs: 15960,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' in',
							startMs: 16400,
							endMs: 16660,
							timestampMs: 16530,
							confidence: null,
						},
						{
							text: ' all',
							startMs: 16660,
							endMs: 16800,
							timestampMs: 16730,
							confidence: null,
						},
						{
							text: ' of',
							startMs: 16800,
							endMs: 16940,
							timestampMs: 16870,
							confidence: null,
						},
						{
							text: ' the',
							startMs: 16940,
							endMs: 17140,
							timestampMs: 17040,
							confidence: null,
						},
						{
							text: ' 3',
							startMs: 17140,
							endMs: 17400,
							timestampMs: 17270,
							confidence: null,
						},
						{
							text: ' ways.',
							startMs: 17400,
							endMs: 17700,
							timestampMs: 17550,
							confidence: null,
							pageBreakAfter: true,
						},
					]}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="04 - Use Studio for quick edits"
				trimBefore={82}
				durationInFrames={263}
			>
				<Video
					name="here4.mov"
					src="https://remotion.media/here-2026-11-03/here4-d54ad1d71ed5.mov"
					muted
					cropLeft={0.156650641}
					cropRight={0.07411859}
					cropTop={0.185897436}
					cropBottom={0.044871795}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: '130%',
						height: '130%',
						objectFit: 'cover',
						translate: '-391px -261px',
					}}
				/>
				<Audio
					name="here4 - cleaned dialogue"
					src="https://remotion.media/here-2026-11-03/audio/here4-auphonic-4ad550e43242.flac"
					volume={0.25}
				/>
				<QuickEditsBroll
					name="04 - Studio B-roll"
					from={82}
					durationInFrames={263}
					style={{backgroundColor: '#1c1e23', overflow: 'hidden'}}
				/>
				<BasicCaptions
					name="04 - Captions"
					width={1200}
					combineTokensWithinMilliseconds={10000}
					style={{position: 'absolute', bottom: 80, translate: '360px 0px'}}
					captions={[
						{
							text: 'Use',
							startMs: 2900,
							endMs: 3220,
							timestampMs: 3060,
							confidence: null,
						},
						{
							text: ' our',
							startMs: 3220,
							endMs: 3580,
							timestampMs: 3400,
							confidence: null,
						},
						{
							text: ' Studio',
							startMs: 3580,
							endMs: 4040,
							timestampMs: 3810,
							confidence: null,
						},
						{
							text: ' for',
							startMs: 4040,
							endMs: 4340,
							timestampMs: 4190,
							confidence: null,
						},
						{
							text: ' quick',
							startMs: 4340,
							endMs: 4780,
							timestampMs: 4560,
							confidence: null,
						},
						{
							text: ' edits',
							startMs: 4780,
							endMs: 5500,
							timestampMs: 5140,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' that',
							startMs: 5500,
							endMs: 5700,
							timestampMs: 5600,
							confidence: null,
						},
						{
							text: ' you',
							startMs: 5700,
							endMs: 5940,
							timestampMs: 5820,
							confidence: null,
						},
						{
							text: ' want',
							startMs: 5940,
							endMs: 6140,
							timestampMs: 6040,
							confidence: null,
						},
						{
							text: ' to',
							startMs: 6140,
							endMs: 6480,
							timestampMs: 6310,
							confidence: null,
						},
						{
							text: ' preview',
							startMs: 6480,
							endMs: 7300,
							timestampMs: 6890,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' immediately',
							startMs: 7300,
							endMs: 8120,
							timestampMs: 7710,
							confidence: null,
						},
						{
							text: ' without',
							startMs: 8120,
							endMs: 8880,
							timestampMs: 8500,
							confidence: null,
						},
						{
							text: ' having',
							startMs: 8880,
							endMs: 9120,
							timestampMs: 9000,
							confidence: null,
						},
						{
							text: ' to',
							startMs: 9160,
							endMs: 9340,
							timestampMs: 9250,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' describe',
							startMs: 9600,
							endMs: 9900,
							timestampMs: 9750,
							confidence: null,
						},
						{
							text: ' them',
							startMs: 9900,
							endMs: 10600,
							timestampMs: 10250,
							confidence: null,
						},
						{
							text: ' using',
							startMs: 10600,
							endMs: 10880,
							timestampMs: 10740,
							confidence: null,
						},
						{
							text: ' words.',
							startMs: 10880,
							endMs: 11280,
							timestampMs: 11080,
							confidence: null,
							pageBreakAfter: true,
						},
					]}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="05 - Use agents for higher-level tasks"
				trimBefore={69}
				durationInFrames={118}
			>
				<Video
					name="here5.mov"
					src="https://remotion.media/here-2026-11-03/here5-2abed600ebfa.mov"
					muted
					cropLeft={0.146634615}
					cropRight={0.084134615}
					cropTop={0.19017094}
					cropBottom={0.040598291}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: '130%',
						height: '130%',
						objectFit: 'cover',
						translate: '-366px -267px',
					}}
				/>
				<Audio
					name="here5 - cleaned dialogue"
					src="https://remotion.media/here-2026-11-03/audio/here5-auphonic-8ed378907c50.flac"
					volume={0.25}
				/>
				<BasicCaptions
					name="05 - Captions"
					width={1200}
					combineTokensWithinMilliseconds={10000}
					style={{position: 'absolute', bottom: 80, translate: '360px 0px'}}
					captions={[
						{
							text: 'Use',
							startMs: 2440,
							endMs: 2660,
							timestampMs: 2550,
							confidence: null,
						},
						{
							text: ' your',
							startMs: 2660,
							endMs: 2920,
							timestampMs: 2790,
							confidence: null,
						},
						{
							text: ' coding',
							startMs: 2920,
							endMs: 3320,
							timestampMs: 3120,
							confidence: null,
						},
						{
							text: ' agent',
							startMs: 3320,
							endMs: 4040,
							timestampMs: 3680,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' for',
							startMs: 4040,
							endMs: 4400,
							timestampMs: 4220,
							confidence: null,
						},
						{
							text: ' any',
							startMs: 4400,
							endMs: 4880,
							timestampMs: 4640,
							confidence: null,
						},
						{
							text: ' higher',
							startMs: 4880,
							endMs: 5280,
							timestampMs: 5080,
							confidence: null,
						},
						{
							text: ' level',
							startMs: 5280,
							endMs: 5660,
							timestampMs: 5470,
							confidence: null,
						},
						{
							text: ' task.',
							startMs: 5660,
							endMs: 6000,
							timestampMs: 5830,
							confidence: null,
							pageBreakAfter: true,
						},
					]}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="06 - Why the code still matters"
				trimBefore={79}
				durationInFrames={288}
			>
				<Video
					name="here6.mov"
					src="https://remotion.media/here-2026-11-03/here6-d3d82216087e.mov"
					muted
					cropLeft={0.157451923}
					cropRight={0.073317308}
					cropTop={0.191595442}
					cropBottom={0.039173789}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: '130%',
						height: '130%',
						objectFit: 'cover',
						translate: '-393px -269px',
					}}
				/>
				<Audio
					name="here6 - cleaned dialogue"
					src="https://remotion.media/here-2026-11-03/audio/here6-auphonic-c80cab6be6fa.flac"
					volume={0.25}
				/>
				<BasicCaptions
					name="06 - Captions"
					width={1200}
					combineTokensWithinMilliseconds={10000}
					style={{position: 'absolute', bottom: 80, translate: '360px 0px'}}
					captions={[
						{
							text: 'And',
							startMs: 2780,
							endMs: 2980,
							timestampMs: 2880,
							confidence: null,
						},
						{
							text: ' while',
							startMs: 2980,
							endMs: 3140,
							timestampMs: 3060,
							confidence: null,
						},
						{
							text: ' you',
							startMs: 3140,
							endMs: 3320,
							timestampMs: 3230,
							confidence: null,
						},
						{
							text: ' might',
							startMs: 3320,
							endMs: 3520,
							timestampMs: 3420,
							confidence: null,
						},
						{
							text: ' not',
							startMs: 3520,
							endMs: 3840,
							timestampMs: 3680,
							confidence: null,
						},
						{
							text: ' write',
							startMs: 3840,
							endMs: 4220,
							timestampMs: 4030,
							confidence: null,
						},
						{
							text: ' code',
							startMs: 4220,
							endMs: 4620,
							timestampMs: 4420,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' manually,',
							startMs: 4620,
							endMs: 5260,
							timestampMs: 4940,
							confidence: null,
						},
						{
							text: ' it',
							startMs: 5500,
							endMs: 5600,
							timestampMs: 5550,
							confidence: null,
						},
						{
							text: ' is',
							startMs: 5600,
							endMs: 5820,
							timestampMs: 5710,
							confidence: null,
						},
						{
							text: ' still',
							startMs: 5820,
							endMs: 6020,
							timestampMs: 5920,
							confidence: null,
						},
						{
							text: ' very',
							startMs: 6020,
							endMs: 6560,
							timestampMs: 6290,
							confidence: null,
						},
						{
							text: ' important',
							startMs: 6560,
							endMs: 7440,
							timestampMs: 7000,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' because',
							startMs: 7440,
							endMs: 7740,
							timestampMs: 7590,
							confidence: null,
						},
						{
							text: ' it',
							startMs: 7740,
							endMs: 7920,
							timestampMs: 7830,
							confidence: null,
						},
						{
							text: ' can',
							startMs: 7920,
							endMs: 7920,
							timestampMs: 7920,
							confidence: null,
						},
						{
							text: ' do',
							startMs: 8120,
							endMs: 8360,
							timestampMs: 8240,
							confidence: null,
						},
						{
							text: ' things',
							startMs: 8360,
							endMs: 8640,
							timestampMs: 8500,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' which',
							startMs: 8640,
							endMs: 8820,
							timestampMs: 8730,
							confidence: null,
						},
						{
							text: ' are',
							startMs: 8820,
							endMs: 9100,
							timestampMs: 8960,
							confidence: null,
						},
						{
							text: ' just',
							startMs: 9100,
							endMs: 9360,
							timestampMs: 9230,
							confidence: null,
						},
						{
							text: ' not',
							startMs: 9360,
							endMs: 9780,
							timestampMs: 9570,
							confidence: null,
						},
						{
							text: ' possible',
							startMs: 9780,
							endMs: 10220,
							timestampMs: 10000,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' in',
							startMs: 10220,
							endMs: 10320,
							timestampMs: 10270,
							confidence: null,
						},
						{
							text: ' a',
							startMs: 10320,
							endMs: 10600,
							timestampMs: 10460,
							confidence: null,
						},
						{
							text: ' graphical',
							startMs: 10600,
							endMs: 11100,
							timestampMs: 10850,
							confidence: null,
						},
						{
							text: ' user',
							startMs: 11100,
							endMs: 11680,
							timestampMs: 11390,
							confidence: null,
						},
						{
							text: ' interface.',
							startMs: 11680,
							endMs: 12000,
							timestampMs: 11840,
							confidence: null,
							pageBreakAfter: true,
						},
					]}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="07 - A tight editing workflow"
				trimBefore={55}
				durationInFrames={307}
			>
				<Video
					name="here7.mov"
					src="https://remotion.media/here-2026-11-03/here7-48a6fe4485a0.mov"
					muted
					cropLeft={0.143429487}
					cropRight={0.087339744}
					cropTop={0.185185185}
					cropBottom={0.045584046}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: '130%',
						height: '130%',
						objectFit: 'cover',
						translate: '-358px -260px',
					}}
				/>
				<Audio
					name="here7 - cleaned dialogue"
					src="https://remotion.media/here-2026-11-03/audio/here7-auphonic-acadca060add.flac"
					volume={0.25}
				/>
				<BasicCaptions
					name="07 - Captions"
					width={1200}
					combineTokensWithinMilliseconds={10000}
					style={{position: 'absolute', bottom: 80, translate: '360px 0px'}}
					captions={[
						{
							text: 'I',
							startMs: 1980,
							endMs: 2140,
							timestampMs: 2060,
							confidence: null,
						},
						{
							text: ' want',
							startMs: 2140,
							endMs: 2260,
							timestampMs: 2200,
							confidence: null,
						},
						{
							text: ' to',
							startMs: 2260,
							endMs: 2440,
							timestampMs: 2350,
							confidence: null,
						},
						{
							text: ' show',
							startMs: 2440,
							endMs: 2560,
							timestampMs: 2500,
							confidence: null,
						},
						{
							text: ' you',
							startMs: 2560,
							endMs: 2740,
							timestampMs: 2650,
							confidence: null,
						},
						{
							text: ' now',
							startMs: 2740,
							endMs: 3040,
							timestampMs: 2890,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' my',
							startMs: 3040,
							endMs: 3320,
							timestampMs: 3180,
							confidence: null,
						},
						{
							text: ' state',
							startMs: 3320,
							endMs: 3520,
							timestampMs: 3420,
							confidence: null,
						},
						{
							text: ' of',
							startMs: 3520,
							endMs: 3660,
							timestampMs: 3590,
							confidence: null,
						},
						{
							text: ' the',
							startMs: 3660,
							endMs: 4000,
							timestampMs: 3830,
							confidence: null,
						},
						{
							text: ' art',
							startMs: 4000,
							endMs: 4480,
							timestampMs: 4240,
							confidence: null,
						},
						{
							text: ' editing',
							startMs: 4480,
							endMs: 5020,
							timestampMs: 4750,
							confidence: null,
						},
						{
							text: ' workflow',
							startMs: 5020,
							endMs: 5860,
							timestampMs: 5440,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' for',
							startMs: 5860,
							endMs: 6160,
							timestampMs: 6010,
							confidence: null,
						},
						{
							text: ' making',
							startMs: 6160,
							endMs: 6520,
							timestampMs: 6340,
							confidence: null,
						},
						{
							text: ' videos',
							startMs: 6520,
							endMs: 6940,
							timestampMs: 6730,
							confidence: null,
						},
						{
							text: ' like',
							startMs: 6940,
							endMs: 7280,
							timestampMs: 7110,
							confidence: null,
						},
						{
							text: ' this',
							startMs: 7280,
							endMs: 7560,
							timestampMs: 7420,
							confidence: null,
						},
						{
							text: ' one',
							startMs: 7560,
							endMs: 8160,
							timestampMs: 7860,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' and',
							startMs: 8160,
							endMs: 8360,
							timestampMs: 8260,
							confidence: null,
						},
						{
							text: ' how',
							startMs: 8360,
							endMs: 8600,
							timestampMs: 8480,
							confidence: null,
						},
						{
							text: ' Remotion',
							startMs: 8600,
							endMs: 9200,
							timestampMs: 8900,
							confidence: null,
						},
						{
							text: ' allows',
							startMs: 9200,
							endMs: 9460,
							timestampMs: 9330,
							confidence: null,
						},
						{
							text: ' me',
							startMs: 9460,
							endMs: 9580,
							timestampMs: 9520,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' to',
							startMs: 9580,
							endMs: 9800,
							timestampMs: 9690,
							confidence: null,
						},
						{
							text: ' keep',
							startMs: 9800,
							endMs: 10080,
							timestampMs: 9940,
							confidence: null,
						},
						{
							text: ' a',
							startMs: 10080,
							endMs: 10460,
							timestampMs: 10270,
							confidence: null,
						},
						{
							text: ' tight',
							startMs: 10460,
							endMs: 10880,
							timestampMs: 10670,
							confidence: null,
						},
						{
							text: ' iteration',
							startMs: 10880,
							endMs: 11000,
							timestampMs: 10940,
							confidence: null,
						},
						{
							text: ' loop.',
							startMs: 11360,
							endMs: 11840,
							timestampMs: 11600,
							confidence: null,
							pageBreakAfter: true,
						},
					]}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="08 - Install the Remotion plugin"
				trimBefore={60}
				durationInFrames={303}
			>
				<Video
					name="here8.mov"
					src="https://remotion.media/here-2026-11-03/here8-f9b6d04da2ef.mov"
					muted
					cropLeft={0.143429487}
					cropRight={0.087339744}
					cropTop={0.184472934}
					cropBottom={0.046296296}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: '130%',
						height: '130%',
						objectFit: 'cover',
						translate: '-358px -259px',
					}}
				/>
				<Audio
					name="here8 - cleaned dialogue"
					src="https://remotion.media/here-2026-11-03/audio/here8-auphonic-05f66204c627.flac"
					volume={0.25}
				/>
				<BasicCaptions
					name="08 - Captions"
					width={1200}
					combineTokensWithinMilliseconds={10000}
					style={{position: 'absolute', bottom: 80, translate: '360px 0px'}}
					captions={[
						{
							text: 'I',
							startMs: 2160,
							endMs: 2300,
							timestampMs: 2230,
							confidence: null,
						},
						{
							text: ' would',
							startMs: 2300,
							endMs: 2520,
							timestampMs: 2410,
							confidence: null,
						},
						{
							text: ' start',
							startMs: 2520,
							endMs: 2780,
							timestampMs: 2650,
							confidence: null,
						},
						{
							text: ' by',
							startMs: 2780,
							endMs: 3000,
							timestampMs: 2890,
							confidence: null,
						},
						{
							text: ' installing',
							startMs: 3000,
							endMs: 3380,
							timestampMs: 3190,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' the',
							startMs: 3380,
							endMs: 3580,
							timestampMs: 3480,
							confidence: null,
						},
						{
							text: ' Remotion',
							startMs: 3580,
							endMs: 4040,
							timestampMs: 3810,
							confidence: null,
						},
						{
							text: ' plugin',
							startMs: 4040,
							endMs: 4620,
							timestampMs: 4330,
							confidence: null,
						},
						{
							text: ' available',
							startMs: 4620,
							endMs: 5000,
							timestampMs: 4810,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' for',
							startMs: 5000,
							endMs: 5280,
							timestampMs: 5140,
							confidence: null,
						},
						{
							text: ' most',
							startMs: 5280,
							endMs: 5600,
							timestampMs: 5440,
							confidence: null,
						},
						{
							text: ' major',
							startMs: 5600,
							endMs: 5960,
							timestampMs: 5780,
							confidence: null,
						},
						{
							text: ' coding',
							startMs: 5960,
							endMs: 6460,
							timestampMs: 6210,
							confidence: null,
						},
						{
							text: ' agents',
							startMs: 6460,
							endMs: 7680,
							timestampMs: 7070,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' and',
							startMs: 7680,
							endMs: 7760,
							timestampMs: 7720,
							confidence: null,
						},
						{
							text: ' I',
							startMs: 7840,
							endMs: 7960,
							timestampMs: 7900,
							confidence: null,
						},
						{
							text: ' can',
							startMs: 7960,
							endMs: 8140,
							timestampMs: 8050,
							confidence: null,
						},
						{
							text: ' just',
							startMs: 8140,
							endMs: 8480,
							timestampMs: 8310,
							confidence: null,
						},
						{
							text: ' invoke',
							startMs: 8480,
							endMs: 8900,
							timestampMs: 8690,
							confidence: null,
						},
						{
							text: ' it',
							startMs: 8900,
							endMs: 9540,
							timestampMs: 9220,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' and',
							startMs: 9540,
							endMs: 9900,
							timestampMs: 9720,
							confidence: null,
						},
						{
							text: ' drop',
							startMs: 9900,
							endMs: 10180,
							timestampMs: 10040,
							confidence: null,
						},
						{
							text: ' in',
							startMs: 10180,
							endMs: 10380,
							timestampMs: 10280,
							confidence: null,
						},
						{
							text: ' some',
							startMs: 10380,
							endMs: 10640,
							timestampMs: 10510,
							confidence: null,
						},
						{
							text: ' raw',
							startMs: 10640,
							endMs: 10960,
							timestampMs: 10800,
							confidence: null,
						},
						{
							text: ' camera',
							startMs: 10960,
							endMs: 11460,
							timestampMs: 11210,
							confidence: null,
						},
						{
							text: ' footage.',
							startMs: 11460,
							endMs: 11880,
							timestampMs: 11670,
							confidence: null,
							pageBreakAfter: true,
						},
					]}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="09 - Ask for a rough cut"
				trimBefore={20}
				durationInFrames={227}
			>
				<Video
					name="here9.mov"
					src="https://remotion.media/here-2026-11-03/here9-52700eda8cf3.mov"
					muted
					cropLeft={0.154647436}
					cropRight={0.076121795}
					cropTop={0.181623932}
					cropBottom={0.049145299}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: '130%',
						height: '130%',
						objectFit: 'cover',
						translate: '-386px -255px',
					}}
				/>
				<Audio
					name="here9 - cleaned dialogue"
					src="https://remotion.media/here-2026-11-03/audio/here9-auphonic-7dc8b2ef5c28.flac"
					volume={0.25}
				/>
				<BasicCaptions
					name="09 - Captions"
					width={1200}
					combineTokensWithinMilliseconds={10000}
					style={{position: 'absolute', bottom: 80, translate: '360px 0px'}}
					captions={[
						{
							text: 'I',
							startMs: 820,
							endMs: 960,
							timestampMs: 890,
							confidence: null,
						},
						{
							text: ' could',
							startMs: 960,
							endMs: 1100,
							timestampMs: 1030,
							confidence: null,
						},
						{
							text: ' ask',
							startMs: 1100,
							endMs: 1360,
							timestampMs: 1230,
							confidence: null,
						},
						{
							text: ' for',
							startMs: 1360,
							endMs: 1560,
							timestampMs: 1460,
							confidence: null,
						},
						{
							text: ' a',
							startMs: 1560,
							endMs: 1760,
							timestampMs: 1660,
							confidence: null,
						},
						{
							text: ' rough',
							startMs: 1760,
							endMs: 2040,
							timestampMs: 1900,
							confidence: null,
						},
						{
							text: ' cut',
							startMs: 2040,
							endMs: 2880,
							timestampMs: 2460,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' or',
							startMs: 2880,
							endMs: 3380,
							timestampMs: 3130,
							confidence: null,
						},
						{
							text: ' directly',
							startMs: 3380,
							endMs: 3940,
							timestampMs: 3660,
							confidence: null,
						},
						{
							text: ' ask',
							startMs: 3940,
							endMs: 4320,
							timestampMs: 4130,
							confidence: null,
						},
						{
							text: ' for',
							startMs: 4320,
							endMs: 4680,
							timestampMs: 4500,
							confidence: null,
						},
						{
							text: ' captions',
							startMs: 4680,
							endMs: 5180,
							timestampMs: 4930,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' or',
							startMs: 5180,
							endMs: 5440,
							timestampMs: 5310,
							confidence: null,
						},
						{
							text: ' motion',
							startMs: 5440,
							endMs: 5920,
							timestampMs: 5680,
							confidence: null,
						},
						{
							text: ' graphics',
							startMs: 5920,
							endMs: 6320,
							timestampMs: 6120,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' to',
							startMs: 6320,
							endMs: 6480,
							timestampMs: 6400,
							confidence: null,
						},
						{
							text: ' be',
							startMs: 6480,
							endMs: 6840,
							timestampMs: 6660,
							confidence: null,
						},
						{
							text: ' added',
							startMs: 6840,
							endMs: 7080,
							timestampMs: 6960,
							confidence: null,
						},
						{
							text: ' on',
							startMs: 7080,
							endMs: 7260,
							timestampMs: 7170,
							confidence: null,
						},
						{
							text: ' top',
							startMs: 7260,
							endMs: 7420,
							timestampMs: 7340,
							confidence: null,
						},
						{
							text: ' of',
							startMs: 7420,
							endMs: 7600,
							timestampMs: 7510,
							confidence: null,
						},
						{
							text: ' it.',
							startMs: 7600,
							endMs: 8000,
							timestampMs: 7800,
							confidence: null,
							pageBreakAfter: true,
						},
					]}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="10 - Build around a soundtrack"
				trimBefore={68}
				durationInFrames={419}
			>
				<Video
					name="here10.mov"
					src="https://remotion.media/here-2026-11-03/here10-f635d876803f.mov"
					muted
					cropLeft={0.138621795}
					cropRight={0.092147436}
					cropTop={0.184472934}
					cropBottom={0.046296296}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: '130%',
						height: '130%',
						objectFit: 'cover',
						translate: '-346px -259px',
					}}
				/>
				<Audio
					name="here10 - cleaned dialogue"
					src="https://remotion.media/here-2026-11-03/audio/here10-auphonic-c6f51fdf7eaa.flac"
					volume={0.25}
				/>
				<BasicCaptions
					name="10 - Captions"
					width={1200}
					combineTokensWithinMilliseconds={10000}
					style={{position: 'absolute', bottom: 80, translate: '360px 0px'}}
					captions={[
						{
							text: 'Alternatively,',
							startMs: 2400,
							endMs: 2980,
							timestampMs: 2690,
							confidence: null,
						},
						{
							text: ' I',
							startMs: 3100,
							endMs: 3240,
							timestampMs: 3170,
							confidence: null,
						},
						{
							text: ' could',
							startMs: 3240,
							endMs: 3480,
							timestampMs: 3360,
							confidence: null,
						},
						{
							text: ' start',
							startMs: 3480,
							endMs: 3700,
							timestampMs: 3590,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' with',
							startMs: 3700,
							endMs: 3860,
							timestampMs: 3780,
							confidence: null,
						},
						{
							text: ' the',
							startMs: 3860,
							endMs: 4240,
							timestampMs: 4050,
							confidence: null,
						},
						{
							text: ' soundtrack',
							startMs: 4240,
							endMs: 5280,
							timestampMs: 4760,
							confidence: null,
						},
						{
							text: ' and',
							startMs: 5280,
							endMs: 5640,
							timestampMs: 5460,
							confidence: null,
						},
						{
							text: ' ask',
							startMs: 5640,
							endMs: 5880,
							timestampMs: 5760,
							confidence: null,
						},
						{
							text: ' it',
							startMs: 5880,
							endMs: 6120,
							timestampMs: 6000,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' to',
							startMs: 6120,
							endMs: 6540,
							timestampMs: 6330,
							confidence: null,
						},
						{
							text: ' analyze',
							startMs: 6540,
							endMs: 6840,
							timestampMs: 6690,
							confidence: null,
						},
						{
							text: ' the',
							startMs: 6840,
							endMs: 7120,
							timestampMs: 6980,
							confidence: null,
						},
						{
							text: ' beat',
							startMs: 7120,
							endMs: 7400,
							timestampMs: 7260,
							confidence: null,
						},
						{
							text: ' and',
							startMs: 7400,
							endMs: 7480,
							timestampMs: 7440,
							confidence: null,
						},
						{
							text: ' place',
							startMs: 8700,
							endMs: 8840,
							timestampMs: 8770,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' placeholder',
							startMs: 8840,
							endMs: 9480,
							timestampMs: 9160,
							confidence: null,
						},
						{
							text: ' sections',
							startMs: 9480,
							endMs: 10200,
							timestampMs: 9840,
							confidence: null,
						},
						{
							text: ' on',
							startMs: 10200,
							endMs: 10360,
							timestampMs: 10280,
							confidence: null,
						},
						{
							text: ' the',
							startMs: 10360,
							endMs: 10640,
							timestampMs: 10500,
							confidence: null,
						},
						{
							text: ' timeline.',
							startMs: 10640,
							endMs: 11440,
							timestampMs: 11040,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' In',
							startMs: 11520,
							endMs: 11720,
							timestampMs: 11620,
							confidence: null,
						},
						{
							text: ' case,',
							startMs: 11720,
							endMs: 12100,
							timestampMs: 11910,
							confidence: null,
						},
						{
							text: ' for',
							startMs: 12280,
							endMs: 12540,
							timestampMs: 12410,
							confidence: null,
						},
						{
							text: ' example,',
							startMs: 12540,
							endMs: 12700,
							timestampMs: 12620,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' we',
							startMs: 12760,
							endMs: 12860,
							timestampMs: 12810,
							confidence: null,
						},
						{
							text: ' want',
							startMs: 12860,
							endMs: 12980,
							timestampMs: 12920,
							confidence: null,
						},
						{
							text: ' to',
							startMs: 12980,
							endMs: 13140,
							timestampMs: 13060,
							confidence: null,
						},
						{
							text: ' make',
							startMs: 13140,
							endMs: 13280,
							timestampMs: 13210,
							confidence: null,
						},
						{
							text: ' a',
							startMs: 13280,
							endMs: 13520,
							timestampMs: 13400,
							confidence: null,
						},
						{
							text: ' promo',
							startMs: 13520,
							endMs: 14020,
							timestampMs: 13770,
							confidence: null,
						},
						{
							text: ' video',
							startMs: 14020,
							endMs: 14700,
							timestampMs: 14360,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' which',
							startMs: 14700,
							endMs: 15000,
							timestampMs: 14850,
							confidence: null,
						},
						{
							text: ' flows',
							startMs: 15000,
							endMs: 15300,
							timestampMs: 15150,
							confidence: null,
						},
						{
							text: ' with',
							startMs: 15300,
							endMs: 15460,
							timestampMs: 15380,
							confidence: null,
						},
						{
							text: ' the',
							startMs: 15460,
							endMs: 15700,
							timestampMs: 15580,
							confidence: null,
						},
						{
							text: ' music.',
							startMs: 15700,
							endMs: 16000,
							timestampMs: 15850,
							confidence: null,
							pageBreakAfter: true,
						},
					]}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="11 - The interactive timeline"
				trimBefore={78}
				durationInFrames={419}
			>
				<Video
					name="here11.mov"
					src="https://remotion.media/here-2026-11-03/here11-8970aa10f019.mov"
					muted
					cropLeft={0.160657051}
					cropRight={0.070112179}
					cropTop={0.188034188}
					cropBottom={0.042735043}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: '130%',
						height: '130%',
						objectFit: 'cover',
						translate: '-401px -264px',
					}}
				/>
				<Audio
					name="here11 - cleaned dialogue"
					src="https://remotion.media/here-2026-11-03/audio/here11-auphonic-dad7394e02be.flac"
					volume={0.25}
				/>
				<BasicCaptions
					name="11 - Captions"
					width={1200}
					combineTokensWithinMilliseconds={10000}
					style={{position: 'absolute', bottom: 80, translate: '360px 0px'}}
					captions={[
						{
							text: 'The',
							startMs: 2760,
							endMs: 2960,
							timestampMs: 2860,
							confidence: null,
						},
						{
							text: ' Studio',
							startMs: 2960,
							endMs: 3200,
							timestampMs: 3080,
							confidence: null,
						},
						{
							text: ' should',
							startMs: 3200,
							endMs: 3460,
							timestampMs: 3330,
							confidence: null,
						},
						{
							text: ' open',
							startMs: 3460,
							endMs: 3900,
							timestampMs: 3680,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' automatically,',
							startMs: 3900,
							endMs: 4460,
							timestampMs: 4180,
							confidence: null,
						},
						{
							text: ' but',
							startMs: 4520,
							endMs: 4640,
							timestampMs: 4580,
							confidence: null,
						},
						{
							text: ' if',
							startMs: 4640,
							endMs: 4720,
							timestampMs: 4680,
							confidence: null,
						},
						{
							text: ' it',
							startMs: 4720,
							endMs: 4940,
							timestampMs: 4830,
							confidence: null,
						},
						{
							text: " doesn't,",
							startMs: 4940,
							endMs: 5520,
							timestampMs: 5230,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' please',
							startMs: 5780,
							endMs: 6220,
							timestampMs: 6000,
							confidence: null,
						},
						{
							text: ' ask',
							startMs: 6220,
							endMs: 6500,
							timestampMs: 6360,
							confidence: null,
						},
						{
							text: ' your',
							startMs: 6500,
							endMs: 6880,
							timestampMs: 6690,
							confidence: null,
						},
						{
							text: ' agent',
							startMs: 6880,
							endMs: 7380,
							timestampMs: 7130,
							confidence: null,
						},
						{
							text: ' to',
							startMs: 7380,
							endMs: 7520,
							timestampMs: 7450,
							confidence: null,
						},
						{
							text: ' do',
							startMs: 7520,
							endMs: 7740,
							timestampMs: 7630,
							confidence: null,
						},
						{
							text: ' so.',
							startMs: 7740,
							endMs: 8580,
							timestampMs: 8160,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' I',
							startMs: 9060,
							endMs: 9180,
							timestampMs: 9120,
							confidence: null,
						},
						{
							text: ' know',
							startMs: 9180,
							endMs: 9280,
							timestampMs: 9230,
							confidence: null,
						},
						{
							text: ' it',
							startMs: 9280,
							endMs: 9440,
							timestampMs: 9360,
							confidence: null,
						},
						{
							text: ' took',
							startMs: 9440,
							endMs: 9580,
							timestampMs: 9510,
							confidence: null,
						},
						{
							text: ' us',
							startMs: 9580,
							endMs: 9720,
							timestampMs: 9650,
							confidence: null,
						},
						{
							text: ' some',
							startMs: 9720,
							endMs: 9980,
							timestampMs: 9850,
							confidence: null,
						},
						{
							text: ' time,',
							startMs: 9980,
							endMs: 10180,
							timestampMs: 10080,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' but',
							startMs: 10300,
							endMs: 10720,
							timestampMs: 10510,
							confidence: null,
						},
						{
							text: ' finally,',
							startMs: 10720,
							endMs: 11160,
							timestampMs: 10940,
							confidence: null,
						},
						{
							text: ' Remotion',
							startMs: 11440,
							endMs: 12080,
							timestampMs: 11760,
							confidence: null,
						},
						{
							text: ' shows',
							startMs: 12080,
							endMs: 12300,
							timestampMs: 12190,
							confidence: null,
						},
						{
							text: ' you',
							startMs: 12300,
							endMs: 12580,
							timestampMs: 12440,
							confidence: null,
						},
						{
							text: ' a',
							startMs: 12580,
							endMs: 13120,
							timestampMs: 12850,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' full',
							startMs: 13120,
							endMs: 13940,
							timestampMs: 13530,
							confidence: null,
						},
						{
							text: ' interactive',
							startMs: 13940,
							endMs: 14800,
							timestampMs: 14370,
							confidence: null,
						},
						{
							text: ' timeline',
							startMs: 14800,
							endMs: 15320,
							timestampMs: 15060,
							confidence: null,
						},
						{
							text: ' of',
							startMs: 15460,
							endMs: 15600,
							timestampMs: 15530,
							confidence: null,
						},
						{
							text: ' your',
							startMs: 15600,
							endMs: 15980,
							timestampMs: 15790,
							confidence: null,
						},
						{
							text: ' content.',
							startMs: 15980,
							endMs: 16360,
							timestampMs: 16170,
							confidence: null,
							pageBreakAfter: true,
						},
					]}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="12 - Edit clips and delete AI slop"
				trimBefore={79}
				durationInFrames={555}
			>
				<Video
					name="here_bettertake.mov"
					src="https://remotion.media/here-2026-11-03/here_bettertake-09c9f604ddfd.mov"
					muted
					cropLeft={0.148237179}
					cropRight={0.082532051}
					cropTop={0.190883191}
					cropBottom={0.03988604}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: '130%',
						height: '130%',
						objectFit: 'cover',
						translate: '-370px -268px',
					}}
				/>
				<Audio
					name="here_bettertake - cleaned dialogue"
					src="https://remotion.media/here-2026-11-03/audio/here_bettertake-auphonic-eab3f61c6b71.flac"
					volume={0.25}
				/>
				<BasicCaptions
					name="12 - Captions"
					width={1200}
					combineTokensWithinMilliseconds={10000}
					style={{position: 'absolute', bottom: 80, translate: '360px 0px'}}
					captions={[
						{
							text: 'Here',
							startMs: 2780,
							endMs: 3160,
							timestampMs: 2970,
							confidence: null,
						},
						{
							text: ' you',
							startMs: 3160,
							endMs: 3340,
							timestampMs: 3250,
							confidence: null,
						},
						{
							text: ' can',
							startMs: 3340,
							endMs: 3540,
							timestampMs: 3440,
							confidence: null,
						},
						{
							text: ' trim',
							startMs: 3540,
							endMs: 3820,
							timestampMs: 3680,
							confidence: null,
						},
						{
							text: ' and',
							startMs: 3820,
							endMs: 4180,
							timestampMs: 4000,
							confidence: null,
						},
						{
							text: ' edit',
							startMs: 4180,
							endMs: 4500,
							timestampMs: 4340,
							confidence: null,
						},
						{
							text: ' your',
							startMs: 4500,
							endMs: 4820,
							timestampMs: 4660,
							confidence: null,
						},
						{
							text: ' clips,',
							startMs: 4820,
							endMs: 5420,
							timestampMs: 5120,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' keyframe',
							startMs: 5580,
							endMs: 6100,
							timestampMs: 5840,
							confidence: null,
						},
						{
							text: ' your',
							startMs: 6100,
							endMs: 6540,
							timestampMs: 6320,
							confidence: null,
						},
						{
							text: ' animations,',
							startMs: 6540,
							endMs: 7500,
							timestampMs: 7020,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' drag',
							startMs: 7680,
							endMs: 8080,
							timestampMs: 7880,
							confidence: null,
						},
						{
							text: ' items',
							startMs: 8080,
							endMs: 8420,
							timestampMs: 8250,
							confidence: null,
						},
						{
							text: ' around,',
							startMs: 8420,
							endMs: 9220,
							timestampMs: 8820,
							confidence: null,
						},
						{
							text: ' change',
							startMs: 9700,
							endMs: 9740,
							timestampMs: 9720,
							confidence: null,
						},
						{
							text: ' parameters,',
							startMs: 10320,
							endMs: 11340,
							timestampMs: 10830,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' apply',
							startMs: 11520,
							endMs: 11780,
							timestampMs: 11650,
							confidence: null,
						},
						{
							text: ' color',
							startMs: 11780,
							endMs: 12100,
							timestampMs: 11940,
							confidence: null,
						},
						{
							text: ' correction,',
							startMs: 12100,
							endMs: 13280,
							timestampMs: 12690,
							confidence: null,
						},
						{
							text: ' add',
							startMs: 13540,
							endMs: 13740,
							timestampMs: 13640,
							confidence: null,
						},
						{
							text: ' effects',
							startMs: 13740,
							endMs: 14040,
							timestampMs: 13890,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' and',
							startMs: 14040,
							endMs: 14480,
							timestampMs: 14260,
							confidence: null,
						},
						{
							text: ' subtitles,',
							startMs: 14480,
							endMs: 15680,
							timestampMs: 15080,
							confidence: null,
						},
						{
							text: ' and',
							startMs: 15740,
							endMs: 15920,
							timestampMs: 15830,
							confidence: null,
						},
						{
							text: ' most',
							startMs: 15920,
							endMs: 16580,
							timestampMs: 16250,
							confidence: null,
						},
						{
							text: ' importantly,',
							startMs: 16580,
							endMs: 17320,
							timestampMs: 16950,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' press',
							startMs: 17680,
							endMs: 17720,
							timestampMs: 17700,
							confidence: null,
						},
						{
							text: ' delete',
							startMs: 17880,
							endMs: 18600,
							timestampMs: 18240,
							confidence: null,
						},
						{
							text: ' on',
							startMs: 18600,
							endMs: 18840,
							timestampMs: 18720,
							confidence: null,
						},
						{
							text: ' all',
							startMs: 18840,
							endMs: 18960,
							timestampMs: 18900,
							confidence: null,
						},
						{
							text: ' of',
							startMs: 18960,
							endMs: 19100,
							timestampMs: 19030,
							confidence: null,
						},
						{
							text: ' the',
							startMs: 19100,
							endMs: 19340,
							timestampMs: 19220,
							confidence: null,
						},
						{
							text: ' AI',
							startMs: 19340,
							endMs: 19720,
							timestampMs: 19530,
							confidence: null,
						},
						{
							text: ' slop',
							startMs: 19720,
							endMs: 19940,
							timestampMs: 19830,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' that',
							startMs: 19940,
							endMs: 20120,
							timestampMs: 20030,
							confidence: null,
						},
						{
							text: ' was',
							startMs: 20120,
							endMs: 20580,
							timestampMs: 20350,
							confidence: null,
						},
						{
							text: ' generated.',
							startMs: 20580,
							endMs: 20920,
							timestampMs: 20750,
							confidence: null,
							pageBreakAfter: true,
						},
					]}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="13 - Preview changes immediately"
				trimBefore={66}
				durationInFrames={249}
			>
				<Video
					name="here13.mov"
					src="https://remotion.media/here-2026-11-03/here13-2857603dc933.mov"
					muted
					cropLeft={0.139423077}
					cropRight={0.091346154}
					cropTop={0.178774929}
					cropBottom={0.051994302}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: '130%',
						height: '130%',
						objectFit: 'cover',
						translate: '-348px -251px',
					}}
				/>
				<Audio
					name="here13 - cleaned dialogue"
					src="https://remotion.media/here-2026-11-03/audio/here13-auphonic-64ce1b2a7323.flac"
					volume={0.25}
				/>
				<BasicCaptions
					name="13 - Captions"
					width={1200}
					combineTokensWithinMilliseconds={10000}
					style={{position: 'absolute', bottom: 80, translate: '360px 0px'}}
					captions={[
						{
							text: 'The',
							startMs: 2360,
							endMs: 2620,
							timestampMs: 2490,
							confidence: null,
						},
						{
							text: ' benefit',
							startMs: 2620,
							endMs: 2900,
							timestampMs: 2760,
							confidence: null,
						},
						{
							text: ' of',
							startMs: 2900,
							endMs: 3060,
							timestampMs: 2980,
							confidence: null,
						},
						{
							text: ' doing',
							startMs: 3060,
							endMs: 3300,
							timestampMs: 3180,
							confidence: null,
						},
						{
							text: ' this',
							startMs: 3300,
							endMs: 3840,
							timestampMs: 3570,
							confidence: null,
						},
						{
							text: ' interactively',
							startMs: 3840,
							endMs: 4480,
							timestampMs: 4160,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' is',
							startMs: 4480,
							endMs: 4680,
							timestampMs: 4580,
							confidence: null,
						},
						{
							text: ' that',
							startMs: 4680,
							endMs: 4840,
							timestampMs: 4760,
							confidence: null,
						},
						{
							text: ' you',
							startMs: 4840,
							endMs: 4980,
							timestampMs: 4910,
							confidence: null,
						},
						{
							text: ' can',
							startMs: 4980,
							endMs: 5480,
							timestampMs: 5230,
							confidence: null,
						},
						{
							text: ' immediately',
							startMs: 5480,
							endMs: 6060,
							timestampMs: 5770,
							confidence: null,
						},
						{
							text: ' preview',
							startMs: 6060,
							endMs: 6940,
							timestampMs: 6500,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' your',
							startMs: 6940,
							endMs: 7380,
							timestampMs: 7160,
							confidence: null,
						},
						{
							text: ' changes',
							startMs: 7380,
							endMs: 7840,
							timestampMs: 7610,
							confidence: null,
						},
						{
							text: ' and',
							startMs: 8080,
							endMs: 8200,
							timestampMs: 8140,
							confidence: null,
						},
						{
							text: ' you',
							startMs: 8200,
							endMs: 8380,
							timestampMs: 8290,
							confidence: null,
						},
						{
							text: " don't",
							startMs: 8380,
							endMs: 8660,
							timestampMs: 8520,
							confidence: null,
						},
						{
							text: ' need',
							startMs: 8660,
							endMs: 8800,
							timestampMs: 8730,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' to',
							startMs: 8800,
							endMs: 9040,
							timestampMs: 8920,
							confidence: null,
						},
						{
							text: ' describe',
							startMs: 9040,
							endMs: 9440,
							timestampMs: 9240,
							confidence: null,
						},
						{
							text: ' them',
							startMs: 9440,
							endMs: 9600,
							timestampMs: 9520,
							confidence: null,
						},
						{
							text: ' in',
							startMs: 9600,
							endMs: 9860,
							timestampMs: 9730,
							confidence: null,
						},
						{
							text: ' words.',
							startMs: 9860,
							endMs: 10280,
							timestampMs: 10070,
							confidence: null,
							pageBreakAfter: true,
						},
					]}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="14 - Copy context for agents"
				trimBefore={64}
				durationInFrames={299}
			>
				<Video
					name="here14.mov"
					src="https://remotion.media/here-2026-11-03/here14-4ffcaba6a9e2.mov"
					muted
					cropLeft={0.15224359}
					cropRight={0.078525641}
					cropTop={0.188034188}
					cropBottom={0.042735043}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: '130%',
						height: '130%',
						objectFit: 'cover',
						translate: '-380px -264px',
					}}
				/>
				<Audio
					name="here14 - cleaned dialogue"
					src="https://remotion.media/here-2026-11-03/audio/here14-auphonic-025f2f0b7687.flac"
					volume={0.25}
				/>
				<BasicCaptions
					name="14 - Captions"
					width={1200}
					combineTokensWithinMilliseconds={10000}
					style={{position: 'absolute', bottom: 80, translate: '360px 0px'}}
					captions={[
						{
							text: 'On',
							startMs: 2280,
							endMs: 2560,
							timestampMs: 2420,
							confidence: null,
						},
						{
							text: ' every',
							startMs: 2560,
							endMs: 3060,
							timestampMs: 2810,
							confidence: null,
						},
						{
							text: ' layer,',
							startMs: 3060,
							endMs: 3080,
							timestampMs: 3070,
							confidence: null,
						},
						{
							text: ' composition,',
							startMs: 3820,
							endMs: 4540,
							timestampMs: 4180,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' property,',
							startMs: 5160,
							endMs: 5720,
							timestampMs: 5440,
							confidence: null,
						},
						{
							text: ' or',
							startMs: 5760,
							endMs: 6140,
							timestampMs: 5950,
							confidence: null,
						},
						{
							text: ' timing,',
							startMs: 6140,
							endMs: 6840,
							timestampMs: 6490,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' you',
							startMs: 6920,
							endMs: 7060,
							timestampMs: 6990,
							confidence: null,
						},
						{
							text: ' can',
							startMs: 7060,
							endMs: 7320,
							timestampMs: 7190,
							confidence: null,
						},
						{
							text: ' also',
							startMs: 7320,
							endMs: 7720,
							timestampMs: 7520,
							confidence: null,
						},
						{
							text: ' right',
							startMs: 7720,
							endMs: 8080,
							timestampMs: 7900,
							confidence: null,
						},
						{
							text: '-click',
							startMs: 8080,
							endMs: 8900,
							timestampMs: 8490,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' and',
							startMs: 8900,
							endMs: 9280,
							timestampMs: 9090,
							confidence: null,
						},
						{
							text: ' select',
							startMs: 9280,
							endMs: 9880,
							timestampMs: 9580,
							confidence: null,
						},
						{
							text: ' copy',
							startMs: 10300,
							endMs: 10640,
							timestampMs: 10470,
							confidence: null,
						},
						{
							text: ' context',
							startMs: 10640,
							endMs: 11080,
							timestampMs: 10860,
							confidence: null,
						},
						{
							text: ' for',
							startMs: 11080,
							endMs: 11300,
							timestampMs: 11190,
							confidence: null,
						},
						{
							text: ' agents.',
							startMs: 11300,
							endMs: 11880,
							timestampMs: 11590,
							confidence: null,
							pageBreakAfter: true,
						},
					]}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="15 - Describe the change"
				trimBefore={93}
				durationInFrames={124}
			>
				<Video
					name="here15.mov"
					src="https://remotion.media/here-2026-11-03/here15-4f64aa1b27ec.mov"
					muted
					cropLeft={0.153044872}
					cropRight={0.077724359}
					cropTop={0.187321937}
					cropBottom={0.043447293}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: '130%',
						height: '130%',
						objectFit: 'cover',
						translate: '-382px -263px',
					}}
				/>
				<Audio
					name="here15 - cleaned dialogue"
					src="https://remotion.media/here-2026-11-03/audio/here15-auphonic-c6fb53701b82.flac"
					volume={0.25}
				/>
				<BasicCaptions
					name="15 - Captions"
					width={1200}
					combineTokensWithinMilliseconds={10000}
					style={{position: 'absolute', bottom: 80, translate: '360px 0px'}}
					captions={[
						{
							text: 'Paste',
							startMs: 3240,
							endMs: 3580,
							timestampMs: 3410,
							confidence: null,
						},
						{
							text: ' that',
							startMs: 3580,
							endMs: 3820,
							timestampMs: 3700,
							confidence: null,
						},
						{
							text: ' into',
							startMs: 3820,
							endMs: 4000,
							timestampMs: 3910,
							confidence: null,
						},
						{
							text: ' the',
							startMs: 4000,
							endMs: 4240,
							timestampMs: 4120,
							confidence: null,
						},
						{
							text: ' agent',
							startMs: 4240,
							endMs: 4640,
							timestampMs: 4440,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' and',
							startMs: 4640,
							endMs: 5000,
							timestampMs: 4820,
							confidence: null,
						},
						{
							text: ' describe',
							startMs: 5000,
							endMs: 5500,
							timestampMs: 5250,
							confidence: null,
						},
						{
							text: ' the',
							startMs: 5500,
							endMs: 5800,
							timestampMs: 5650,
							confidence: null,
						},
						{
							text: ' change',
							startMs: 5800,
							endMs: 6040,
							timestampMs: 5920,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' that',
							startMs: 6040,
							endMs: 6160,
							timestampMs: 6100,
							confidence: null,
						},
						{
							text: ' you',
							startMs: 6160,
							endMs: 6300,
							timestampMs: 6230,
							confidence: null,
						},
						{
							text: ' want',
							startMs: 6300,
							endMs: 6460,
							timestampMs: 6380,
							confidence: null,
						},
						{
							text: ' to',
							startMs: 6460,
							endMs: 6620,
							timestampMs: 6540,
							confidence: null,
						},
						{
							text: ' see',
							startMs: 6620,
							endMs: 6980,
							timestampMs: 6800,
							confidence: null,
						},
						{
							text: ' happen.',
							startMs: 6980,
							endMs: 7000,
							timestampMs: 6990,
							confidence: null,
							pageBreakAfter: true,
						},
					]}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="16 - Agents can see your selection"
				trimBefore={76}
				durationInFrames={195}
			>
				<Video
					name="here16.mov"
					src="https://remotion.media/here-2026-11-03/here16-af38f084affa.mov"
					muted
					cropLeft={0.158253205}
					cropRight={0.072516026}
					cropTop={0.181623932}
					cropBottom={0.049145299}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: '130%',
						height: '130%',
						objectFit: 'cover',
						translate: '-395px -255px',
					}}
				/>
				<Audio
					name="here16 - cleaned dialogue"
					src="https://remotion.media/here-2026-11-03/audio/here16-auphonic-96a673a13d4a.flac"
					volume={0.25}
				/>
				<BasicCaptions
					name="16 - Captions"
					width={1200}
					combineTokensWithinMilliseconds={10000}
					style={{position: 'absolute', bottom: 80, translate: '360px 0px'}}
					captions={[
						{
							text: 'Some',
							startMs: 2680,
							endMs: 2900,
							timestampMs: 2790,
							confidence: null,
						},
						{
							text: ' agents',
							startMs: 2900,
							endMs: 3280,
							timestampMs: 3090,
							confidence: null,
						},
						{
							text: ' can',
							startMs: 3280,
							endMs: 3560,
							timestampMs: 3420,
							confidence: null,
						},
						{
							text: ' also',
							startMs: 3560,
							endMs: 4000,
							timestampMs: 3780,
							confidence: null,
						},
						{
							text: ' directly',
							startMs: 4000,
							endMs: 4520,
							timestampMs: 4260,
							confidence: null,
						},
						{
							text: ' see',
							startMs: 4520,
							endMs: 4740,
							timestampMs: 4630,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' what',
							startMs: 4740,
							endMs: 4880,
							timestampMs: 4810,
							confidence: null,
						},
						{
							text: ' you',
							startMs: 4880,
							endMs: 5040,
							timestampMs: 4960,
							confidence: null,
						},
						{
							text: ' have',
							startMs: 5040,
							endMs: 5420,
							timestampMs: 5230,
							confidence: null,
						},
						{
							text: ' selected',
							startMs: 5420,
							endMs: 6140,
							timestampMs: 5780,
							confidence: null,
						},
						{
							text: ' without',
							startMs: 6140,
							endMs: 6580,
							timestampMs: 6360,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' you',
							startMs: 6580,
							endMs: 6880,
							timestampMs: 6730,
							confidence: null,
						},
						{
							text: ' having',
							startMs: 6880,
							endMs: 7100,
							timestampMs: 6990,
							confidence: null,
						},
						{
							text: ' to',
							startMs: 7100,
							endMs: 7380,
							timestampMs: 7240,
							confidence: null,
						},
						{
							text: ' paste',
							startMs: 7380,
							endMs: 7720,
							timestampMs: 7550,
							confidence: null,
						},
						{
							text: ' that',
							startMs: 7720,
							endMs: 8000,
							timestampMs: 7860,
							confidence: null,
						},
						{
							text: ' context.',
							startMs: 8220,
							endMs: 8800,
							timestampMs: 8510,
							confidence: null,
							pageBreakAfter: true,
						},
					]}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="17 - Invoke your preferred coding agent"
				trimBefore={88}
				durationInFrames={246}
			>
				<Video
					name="here17.mov"
					src="https://remotion.media/here-2026-11-03/here17-cb02202f8406.mov"
					muted
					cropLeft={0.159054487}
					cropRight={0.071714744}
					cropTop={0.185185185}
					cropBottom={0.045584046}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: '130%',
						height: '130%',
						objectFit: 'cover',
						translate: '-397px -260px',
					}}
				/>
				<Audio
					name="here17 - cleaned dialogue"
					src="https://remotion.media/here-2026-11-03/audio/here17-auphonic-5dabbfad4e95.flac"
					volume={0.25}
				/>
				<BasicCaptions
					name="17 - Captions"
					width={1200}
					combineTokensWithinMilliseconds={10000}
					style={{position: 'absolute', bottom: 80, translate: '360px 0px'}}
					captions={[
						{
							text: 'Remotion',
							startMs: 3100,
							endMs: 3580,
							timestampMs: 3340,
							confidence: null,
						},
						{
							text: ' also',
							startMs: 3580,
							endMs: 4220,
							timestampMs: 3900,
							confidence: null,
						},
						{
							text: ' recognizes',
							startMs: 4220,
							endMs: 4720,
							timestampMs: 4470,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' which',
							startMs: 4720,
							endMs: 5020,
							timestampMs: 4870,
							confidence: null,
						},
						{
							text: ' coding',
							startMs: 5020,
							endMs: 5480,
							timestampMs: 5250,
							confidence: null,
						},
						{
							text: ' agents',
							startMs: 5480,
							endMs: 5900,
							timestampMs: 5690,
							confidence: null,
						},
						{
							text: ' you',
							startMs: 5900,
							endMs: 6060,
							timestampMs: 5980,
							confidence: null,
						},
						{
							text: ' have',
							startMs: 6060,
							endMs: 6480,
							timestampMs: 6270,
							confidence: null,
						},
						{
							text: ' installed',
							startMs: 6480,
							endMs: 7460,
							timestampMs: 6970,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' and',
							startMs: 7460,
							endMs: 7700,
							timestampMs: 7580,
							confidence: null,
						},
						{
							text: ' allows',
							startMs: 7700,
							endMs: 8000,
							timestampMs: 7850,
							confidence: null,
						},
						{
							text: ' you',
							startMs: 8000,
							endMs: 8180,
							timestampMs: 8090,
							confidence: null,
						},
						{
							text: ' to',
							startMs: 8180,
							endMs: 8500,
							timestampMs: 8340,
							confidence: null,
						},
						{
							text: ' invoke',
							startMs: 8500,
							endMs: 8600,
							timestampMs: 8550,
							confidence: null,
						},
						{
							text: ' them',
							startMs: 8840,
							endMs: 9020,
							timestampMs: 8930,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' with',
							startMs: 9020,
							endMs: 9200,
							timestampMs: 9110,
							confidence: null,
						},
						{
							text: ' the',
							startMs: 9200,
							endMs: 9440,
							timestampMs: 9320,
							confidence: null,
						},
						{
							text: ' right',
							startMs: 9440,
							endMs: 9740,
							timestampMs: 9590,
							confidence: null,
						},
						{
							text: ' context',
							startMs: 9740,
							endMs: 10560,
							timestampMs: 10150,
							confidence: null,
						},
						{
							text: ' directly.',
							startMs: 10560,
							endMs: 10920,
							timestampMs: 10740,
							confidence: null,
							pageBreakAfter: true,
						},
					]}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="18 - Annotate in ChatGPT"
				trimBefore={54}
				durationInFrames={187}
			>
				<Video
					name="here18.mov"
					src="https://remotion.media/here-2026-11-03/here18-aa2e709582e3.mov"
					muted
					cropLeft={0.147435897}
					cropRight={0.083333333}
					cropTop={0.186609687}
					cropBottom={0.044159544}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: '130%',
						height: '130%',
						objectFit: 'cover',
						translate: '-368px -262px',
					}}
				/>
				<Audio
					name="here18 - cleaned dialogue"
					src="https://remotion.media/here-2026-11-03/audio/here18-auphonic-a8d64b672499.flac"
					volume={0.25}
				/>
				<BasicCaptions
					name="18 - Captions"
					width={1200}
					combineTokensWithinMilliseconds={10000}
					style={{position: 'absolute', bottom: 80, translate: '360px 0px'}}
					captions={[
						{
							text: 'And',
							startMs: 1960,
							endMs: 2100,
							timestampMs: 2030,
							confidence: null,
						},
						{
							text: ' in',
							startMs: 2100,
							endMs: 2280,
							timestampMs: 2190,
							confidence: null,
						},
						{
							text: ' ChatGPT',
							startMs: 2280,
							endMs: 2980,
							timestampMs: 2630,
							confidence: null,
						},
						{
							text: ' you',
							startMs: 2980,
							endMs: 3120,
							timestampMs: 3050,
							confidence: null,
						},
						{
							text: ' can',
							startMs: 3120,
							endMs: 3400,
							timestampMs: 3260,
							confidence: null,
						},
						{
							text: ' right',
							startMs: 3400,
							endMs: 3680,
							timestampMs: 3540,
							confidence: null,
						},
						{
							text: ' click',
							startMs: 3680,
							endMs: 3960,
							timestampMs: 3820,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' and',
							startMs: 3960,
							endMs: 4440,
							timestampMs: 4200,
							confidence: null,
						},
						{
							text: ' directly',
							startMs: 4440,
							endMs: 4960,
							timestampMs: 4700,
							confidence: null,
						},
						{
							text: ' annotate',
							startMs: 4960,
							endMs: 5680,
							timestampMs: 5320,
							confidence: null,
						},
						{
							text: ' items',
							startMs: 5680,
							endMs: 6300,
							timestampMs: 5990,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' with',
							startMs: 6300,
							endMs: 6460,
							timestampMs: 6380,
							confidence: null,
						},
						{
							text: ' the',
							startMs: 6460,
							endMs: 6680,
							timestampMs: 6570,
							confidence: null,
						},
						{
							text: ' change',
							startMs: 6680,
							endMs: 6940,
							timestampMs: 6810,
							confidence: null,
						},
						{
							text: ' that',
							startMs: 6940,
							endMs: 7000,
							timestampMs: 6970,
							confidence: null,
						},
						{
							text: ' you',
							startMs: 7080,
							endMs: 7280,
							timestampMs: 7180,
							confidence: null,
						},
						{
							text: ' want.',
							startMs: 7280,
							endMs: 7820,
							timestampMs: 7550,
							confidence: null,
							pageBreakAfter: true,
						},
					]}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="19 - Stay in sync"
				trimBefore={98}
				durationInFrames={138}
			>
				<Video
					name="here19.mov"
					src="https://remotion.media/here-2026-11-03/here19-cdedca2737fa.mov"
					muted
					cropLeft={0.149839744}
					cropRight={0.080929487}
					cropTop={0.183760684}
					cropBottom={0.047008547}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: '130%',
						height: '130%',
						objectFit: 'cover',
						translate: '-374px -258px',
					}}
				/>
				<Audio
					name="here19 - cleaned dialogue"
					src="https://remotion.media/here-2026-11-03/audio/here19-auphonic-7b58cf06f4f9.flac"
					volume={0.25}
				/>
				<BasicCaptions
					name="19 - Captions"
					width={1200}
					combineTokensWithinMilliseconds={10000}
					style={{position: 'absolute', bottom: 80, translate: '360px 0px'}}
					captions={[
						{
							text: "That's",
							startMs: 3400,
							endMs: 3640,
							timestampMs: 3520,
							confidence: null,
						},
						{
							text: ' how',
							startMs: 3640,
							endMs: 3820,
							timestampMs: 3730,
							confidence: null,
						},
						{
							text: ' the',
							startMs: 3820,
							endMs: 3980,
							timestampMs: 3900,
							confidence: null,
						},
						{
							text: ' Remotion',
							startMs: 3980,
							endMs: 4500,
							timestampMs: 4240,
							confidence: null,
						},
						{
							text: ' Studio',
							startMs: 4500,
							endMs: 5060,
							timestampMs: 4780,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' and',
							startMs: 5060,
							endMs: 5280,
							timestampMs: 5170,
							confidence: null,
						},
						{
							text: ' your',
							startMs: 5280,
							endMs: 5640,
							timestampMs: 5460,
							confidence: null,
						},
						{
							text: ' agent',
							startMs: 5640,
							endMs: 6380,
							timestampMs: 6010,
							confidence: null,
						},
						{
							text: ' stay',
							startMs: 6380,
							endMs: 6660,
							timestampMs: 6520,
							confidence: null,
						},
						{
							text: ' in',
							startMs: 6660,
							endMs: 7060,
							timestampMs: 6860,
							confidence: null,
						},
						{
							text: ' perfect',
							startMs: 7060,
							endMs: 7400,
							timestampMs: 7230,
							confidence: null,
						},
						{
							text: ' sync.',
							startMs: 7400,
							endMs: 7660,
							timestampMs: 7530,
							confidence: null,
							pageBreakAfter: true,
						},
					]}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="20 - When code becomes too dynamic"
				trimBefore={154}
				durationInFrames={406}
			>
				<Video
					name="here20.mov"
					src="https://remotion.media/here-2026-11-03/here20-976fdac624c8.mov"
					muted
					cropLeft={0.148237179}
					cropRight={0.082532051}
					cropTop={0.194444444}
					cropBottom={0.036324786}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: '130%',
						height: '130%',
						objectFit: 'cover',
						translate: '-370px -273px',
					}}
				/>
				<Audio
					name="here20 - cleaned dialogue"
					src="https://remotion.media/here-2026-11-03/audio/here20-auphonic-230f1edf2127.flac"
					volume={0.25}
				/>
				<BasicCaptions
					name="20 - Captions"
					width={1200}
					combineTokensWithinMilliseconds={10000}
					style={{position: 'absolute', bottom: 80, translate: '360px 0px'}}
					captions={[
						{
							text: 'Since',
							startMs: 5300,
							endMs: 5580,
							timestampMs: 5440,
							confidence: null,
						},
						{
							text: ' the',
							startMs: 5580,
							endMs: 5980,
							timestampMs: 5780,
							confidence: null,
						},
						{
							text: ' internal',
							startMs: 5980,
							endMs: 6420,
							timestampMs: 6200,
							confidence: null,
						},
						{
							text: ' structure',
							startMs: 6420,
							endMs: 6880,
							timestampMs: 6650,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' of',
							startMs: 6880,
							endMs: 7060,
							timestampMs: 6970,
							confidence: null,
						},
						{
							text: ' your',
							startMs: 7060,
							endMs: 7460,
							timestampMs: 7260,
							confidence: null,
						},
						{
							text: ' video',
							startMs: 7460,
							endMs: 7700,
							timestampMs: 7580,
							confidence: null,
						},
						{
							text: ' is',
							startMs: 7700,
							endMs: 7960,
							timestampMs: 7830,
							confidence: null,
						},
						{
							text: ' just',
							startMs: 7960,
							endMs: 8440,
							timestampMs: 8200,
							confidence: null,
						},
						{
							text: ' JavaScript',
							startMs: 8440,
							endMs: 9020,
							timestampMs: 8730,
							confidence: null,
						},
						{
							text: ' code,',
							startMs: 9020,
							endMs: 9720,
							timestampMs: 9370,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' sometimes',
							startMs: 10240,
							endMs: 10740,
							timestampMs: 10490,
							confidence: null,
						},
						{
							text: ' things',
							startMs: 10740,
							endMs: 10840,
							timestampMs: 10790,
							confidence: null,
						},
						{
							text: ' can',
							startMs: 11100,
							endMs: 11240,
							timestampMs: 11170,
							confidence: null,
						},
						{
							text: ' get',
							startMs: 11240,
							endMs: 11540,
							timestampMs: 11390,
							confidence: null,
						},
						{
							text: ' so',
							startMs: 11540,
							endMs: 12040,
							timestampMs: 11790,
							confidence: null,
						},
						{
							text: ' dynamic',
							startMs: 12040,
							endMs: 12340,
							timestampMs: 12190,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' and',
							startMs: 12340,
							endMs: 12780,
							timestampMs: 12560,
							confidence: null,
						},
						{
							text: ' complex',
							startMs: 12780,
							endMs: 13600,
							timestampMs: 13190,
							confidence: null,
						},
						{
							text: ' that',
							startMs: 13600,
							endMs: 13760,
							timestampMs: 13680,
							confidence: null,
						},
						{
							text: ' they',
							startMs: 13760,
							endMs: 14000,
							timestampMs: 13880,
							confidence: null,
						},
						{
							text: ' cannot',
							startMs: 14000,
							endMs: 14400,
							timestampMs: 14200,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' be',
							startMs: 14400,
							endMs: 14820,
							timestampMs: 14610,
							confidence: null,
						},
						{
							text: ' visually',
							startMs: 14820,
							endMs: 15660,
							timestampMs: 15240,
							confidence: null,
						},
						{
							text: ' represented',
							startMs: 15660,
							endMs: 16500,
							timestampMs: 16080,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' and',
							startMs: 16500,
							endMs: 16840,
							timestampMs: 16670,
							confidence: null,
						},
						{
							text: ' edited',
							startMs: 16840,
							endMs: 16840,
							timestampMs: 16840,
							confidence: null,
						},
						{
							text: ' in',
							startMs: 17400,
							endMs: 17520,
							timestampMs: 17460,
							confidence: null,
						},
						{
							text: ' the',
							startMs: 17520,
							endMs: 17760,
							timestampMs: 17640,
							confidence: null,
						},
						{
							text: ' Studio',
							startMs: 17760,
							endMs: 18260,
							timestampMs: 18010,
							confidence: null,
						},
						{
							text: ' anymore.',
							startMs: 18260,
							endMs: 18460,
							timestampMs: 18360,
							confidence: null,
							pageBreakAfter: true,
						},
					]}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="21 - Computed properties"
				trimBefore={91}
				durationInFrames={186}
			>
				<Video
					name="here21.mov"
					src="https://remotion.media/here-2026-11-03/here21-e225ac09dd4b.mov"
					muted
					cropLeft={0.159855769}
					cropRight={0.070913462}
					cropTop={0.184472934}
					cropBottom={0.046296296}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: '130%',
						height: '130%',
						objectFit: 'cover',
						translate: '-399px -259px',
					}}
				/>
				<Audio
					name="here21 - cleaned dialogue"
					src="https://remotion.media/here-2026-11-03/audio/here21-auphonic-14de8d93c297.flac"
					volume={0.25}
				/>
				<BasicCaptions
					name="21 - Captions"
					width={1200}
					combineTokensWithinMilliseconds={10000}
					style={{position: 'absolute', bottom: 80, translate: '360px 0px'}}
					captions={[
						{
							text: 'If',
							startMs: 3180,
							endMs: 3380,
							timestampMs: 3280,
							confidence: null,
						},
						{
							text: ' that',
							startMs: 3380,
							endMs: 3500,
							timestampMs: 3440,
							confidence: null,
						},
						{
							text: ' is',
							startMs: 3500,
							endMs: 3620,
							timestampMs: 3560,
							confidence: null,
						},
						{
							text: ' the',
							startMs: 3620,
							endMs: 3860,
							timestampMs: 3740,
							confidence: null,
						},
						{
							text: ' case,',
							startMs: 3860,
							endMs: 4260,
							timestampMs: 4060,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' properties',
							startMs: 4740,
							endMs: 5140,
							timestampMs: 4940,
							confidence: null,
						},
						{
							text: ' get',
							startMs: 5140,
							endMs: 5540,
							timestampMs: 5340,
							confidence: null,
						},
						{
							text: ' grayed',
							startMs: 5540,
							endMs: 5980,
							timestampMs: 5760,
							confidence: null,
						},
						{
							text: ' out',
							startMs: 5980,
							endMs: 6680,
							timestampMs: 6330,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' and',
							startMs: 6680,
							endMs: 6980,
							timestampMs: 6830,
							confidence: null,
						},
						{
							text: ' show',
							startMs: 6980,
							endMs: 7580,
							timestampMs: 7280,
							confidence: null,
						},
						{
							text: ' computed',
							startMs: 7580,
							endMs: 8680,
							timestampMs: 8130,
							confidence: null,
						},
						{
							text: ' instead.',
							startMs: 8680,
							endMs: 9000,
							timestampMs: 8840,
							confidence: null,
							pageBreakAfter: true,
						},
					]}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="22 - Look at the underlying code"
				trimBefore={195}
				durationInFrames={366}
			>
				<Video
					name="here22.mov"
					src="https://remotion.media/here-2026-11-03/here22-ab31e3d8f25a.mov"
					muted
					cropLeft={0.15224359}
					cropRight={0.078525641}
					cropTop={0.188746439}
					cropBottom={0.042022792}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: '130%',
						height: '130%',
						objectFit: 'cover',
						translate: '-380px -265px',
					}}
				/>
				<Audio
					name="here22 - cleaned dialogue"
					src="https://remotion.media/here-2026-11-03/audio/here22-auphonic-1ffe113c4b4f.flac"
					volume={0.25}
				/>
				<BasicCaptions
					name="22 - Captions"
					width={1200}
					combineTokensWithinMilliseconds={10000}
					style={{position: 'absolute', bottom: 80, translate: '360px 0px'}}
					captions={[
						{
							text: 'Here,',
							startMs: 6660,
							endMs: 7020,
							timestampMs: 6840,
							confidence: null,
						},
						{
							text: ' even',
							startMs: 7240,
							endMs: 7420,
							timestampMs: 7330,
							confidence: null,
						},
						{
							text: ' if',
							startMs: 7420,
							endMs: 7520,
							timestampMs: 7470,
							confidence: null,
						},
						{
							text: ' you',
							startMs: 7520,
							endMs: 7660,
							timestampMs: 7590,
							confidence: null,
						},
						{
							text: " don't",
							startMs: 7660,
							endMs: 7860,
							timestampMs: 7760,
							confidence: null,
						},
						{
							text: ' know',
							startMs: 7860,
							endMs: 8040,
							timestampMs: 7950,
							confidence: null,
						},
						{
							text: ' how',
							startMs: 8040,
							endMs: 8180,
							timestampMs: 8110,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' to',
							startMs: 8180,
							endMs: 8580,
							timestampMs: 8380,
							confidence: null,
						},
						{
							text: ' program,',
							startMs: 8580,
							endMs: 9360,
							timestampMs: 8970,
							confidence: null,
						},
						{
							text: ' it',
							startMs: 9560,
							endMs: 9940,
							timestampMs: 9750,
							confidence: null,
						},
						{
							text: ' might',
							startMs: 9940,
							endMs: 10260,
							timestampMs: 10100,
							confidence: null,
						},
						{
							text: ' be',
							startMs: 10260,
							endMs: 10620,
							timestampMs: 10440,
							confidence: null,
						},
						{
							text: ' useful',
							startMs: 10620,
							endMs: 11440,
							timestampMs: 11030,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' to',
							startMs: 11440,
							endMs: 11680,
							timestampMs: 11560,
							confidence: null,
						},
						{
							text: ' look',
							startMs: 11680,
							endMs: 12040,
							timestampMs: 11860,
							confidence: null,
						},
						{
							text: ' at',
							startMs: 12040,
							endMs: 12320,
							timestampMs: 12180,
							confidence: null,
						},
						{
							text: ' the',
							startMs: 12320,
							endMs: 12880,
							timestampMs: 12600,
							confidence: null,
						},
						{
							text: ' underlying',
							startMs: 12880,
							endMs: 13080,
							timestampMs: 12980,
							confidence: null,
						},
						{
							text: ' structure',
							startMs: 13600,
							endMs: 14100,
							timestampMs: 13850,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' of',
							startMs: 14100,
							endMs: 14320,
							timestampMs: 14210,
							confidence: null,
						},
						{
							text: ' your',
							startMs: 14320,
							endMs: 14660,
							timestampMs: 14490,
							confidence: null,
						},
						{
							text: ' video',
							startMs: 14660,
							endMs: 15540,
							timestampMs: 15100,
							confidence: null,
						},
						{
							text: ' and',
							startMs: 15540,
							endMs: 15840,
							timestampMs: 15690,
							confidence: null,
						},
						{
							text: ' pull',
							startMs: 15840,
							endMs: 16140,
							timestampMs: 15990,
							confidence: null,
						},
						{
							text: ' up',
							startMs: 16140,
							endMs: 16360,
							timestampMs: 16250,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' the',
							startMs: 16360,
							endMs: 16640,
							timestampMs: 16500,
							confidence: null,
						},
						{
							text: ' code',
							startMs: 16640,
							endMs: 17360,
							timestampMs: 17000,
							confidence: null,
						},
						{
							text: ' that',
							startMs: 17360,
							endMs: 17640,
							timestampMs: 17500,
							confidence: null,
						},
						{
							text: ' drives',
							startMs: 17640,
							endMs: 17940,
							timestampMs: 17790,
							confidence: null,
						},
						{
							text: ' your',
							startMs: 17940,
							endMs: 18220,
							timestampMs: 18080,
							confidence: null,
						},
						{
							text: ' video.',
							startMs: 18220,
							endMs: 18480,
							timestampMs: 18350,
							confidence: null,
							pageBreakAfter: true,
						},
					]}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="23a - Restructure with your agent"
				trimBefore={46}
				durationInFrames={310}
			>
				<Video
					name="here23.mov"
					src="https://remotion.media/here-2026-11-03/here23-d9e6d340c45b.mov"
					muted
					cropLeft={0.158253205}
					cropRight={0.072516026}
					cropTop={0.188746439}
					cropBottom={0.042022792}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: '130%',
						height: '130%',
						objectFit: 'cover',
						translate: '-395px -265px',
					}}
				/>
				<Audio
					name="here23 - cleaned dialogue"
					src="https://remotion.media/here-2026-11-03/audio/here23-auphonic-40622844a602.flac"
					volume={0.25}
				/>
				<BasicCaptions
					name="23a - Captions"
					width={1200}
					combineTokensWithinMilliseconds={10000}
					style={{position: 'absolute', bottom: 80, translate: '360px 0px'}}
					captions={[
						{
							text: 'Remotion',
							startMs: 1680,
							endMs: 2200,
							timestampMs: 1940,
							confidence: null,
						},
						{
							text: ' Studio',
							startMs: 2200,
							endMs: 2520,
							timestampMs: 2360,
							confidence: null,
						},
						{
							text: ' can',
							startMs: 2520,
							endMs: 2820,
							timestampMs: 2670,
							confidence: null,
						},
						{
							text: ' show',
							startMs: 2820,
							endMs: 3100,
							timestampMs: 2960,
							confidence: null,
						},
						{
							text: ' you',
							startMs: 3100,
							endMs: 3540,
							timestampMs: 3320,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' the',
							startMs: 3540,
							endMs: 3800,
							timestampMs: 3670,
							confidence: null,
						},
						{
							text: ' code',
							startMs: 3800,
							endMs: 4100,
							timestampMs: 3950,
							confidence: null,
						},
						{
							text: ' snippet',
							startMs: 4100,
							endMs: 4460,
							timestampMs: 4280,
							confidence: null,
						},
						{
							text: ' which',
							startMs: 4460,
							endMs: 4920,
							timestampMs: 4690,
							confidence: null,
						},
						{
							text: ' contains',
							startMs: 4920,
							endMs: 5300,
							timestampMs: 5110,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' the',
							startMs: 5300,
							endMs: 5680,
							timestampMs: 5490,
							confidence: null,
						},
						{
							text: ' computed',
							startMs: 5680,
							endMs: 6460,
							timestampMs: 6070,
							confidence: null,
						},
						{
							text: ' expression.',
							startMs: 6460,
							endMs: 7000,
							timestampMs: 6730,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' And',
							startMs: 7840,
							endMs: 7960,
							timestampMs: 7900,
							confidence: null,
						},
						{
							text: ' it',
							startMs: 7960,
							endMs: 8140,
							timestampMs: 8050,
							confidence: null,
						},
						{
							text: ' gives',
							startMs: 8140,
							endMs: 8340,
							timestampMs: 8240,
							confidence: null,
						},
						{
							text: ' you',
							startMs: 8340,
							endMs: 8500,
							timestampMs: 8420,
							confidence: null,
						},
						{
							text: ' a',
							startMs: 8500,
							endMs: 9040,
							timestampMs: 8770,
							confidence: null,
						},
						{
							text: ' suggested',
							startMs: 9040,
							endMs: 9480,
							timestampMs: 9260,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' prompt',
							startMs: 9480,
							endMs: 10360,
							timestampMs: 9920,
							confidence: null,
						},
						{
							text: ' for',
							startMs: 10360,
							endMs: 10580,
							timestampMs: 10470,
							confidence: null,
						},
						{
							text: ' your',
							startMs: 10580,
							endMs: 10880,
							timestampMs: 10730,
							confidence: null,
						},
						{
							text: ' coding',
							startMs: 10880,
							endMs: 11360,
							timestampMs: 11120,
							confidence: null,
						},
						{
							text: ' agent',
							startMs: 11360,
							endMs: 12680,
							timestampMs: 12020,
							confidence: null,
							pageBreakAfter: true,
						},
					]}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="23b - Restructure with your agent"
				trimBefore={372}
				durationInFrames={58}
			>
				<Video
					name="here23.mov"
					src="https://remotion.media/here-2026-11-03/here23-d9e6d340c45b.mov"
					muted
					cropLeft={0.158253205}
					cropRight={0.072516026}
					cropTop={0.188746439}
					cropBottom={0.042022792}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: '130%',
						height: '130%',
						objectFit: 'cover',
						translate: '-395px -265px',
					}}
				/>
				<Audio
					name="here23 - cleaned dialogue"
					src="https://remotion.media/here-2026-11-03/audio/here23-auphonic-40622844a602.flac"
					volume={0.25}
				/>
				<BasicCaptions
					name="23b - Captions"
					width={1200}
					combineTokensWithinMilliseconds={10000}
					style={{position: 'absolute', bottom: 80, translate: '360px 0px'}}
					captions={[
						{
							text: ' to',
							startMs: 12680,
							endMs: 13040,
							timestampMs: 12860,
							confidence: null,
						},
						{
							text: ' restructure',
							startMs: 13040,
							endMs: 13660,
							timestampMs: 13350,
							confidence: null,
						},
						{
							text: ' the',
							startMs: 13660,
							endMs: 13960,
							timestampMs: 13810,
							confidence: null,
						},
						{
							text: ' markup.',
							startMs: 13960,
							endMs: 14000,
							timestampMs: 13980,
							confidence: null,
							pageBreakAfter: true,
						},
					]}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="23c - Restructure with your agent"
				trimBefore={446}
				durationInFrames={251}
			>
				<Video
					name="here23.mov"
					src="https://remotion.media/here-2026-11-03/here23-d9e6d340c45b.mov"
					muted
					cropLeft={0.158253205}
					cropRight={0.072516026}
					cropTop={0.188746439}
					cropBottom={0.042022792}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: '130%',
						height: '130%',
						objectFit: 'cover',
						translate: '-395px -265px',
					}}
				/>
				<Audio
					name="here23 - cleaned dialogue"
					src="https://remotion.media/here-2026-11-03/audio/here23-auphonic-40622844a602.flac"
					volume={0.25}
				/>
				<BasicCaptions
					name="23c - Captions"
					width={1200}
					combineTokensWithinMilliseconds={10000}
					style={{position: 'absolute', bottom: 80, translate: '360px 0px'}}
					captions={[
						{
							text: ' With',
							startMs: 15120,
							endMs: 15300,
							timestampMs: 15210,
							confidence: null,
						},
						{
							text: ' just',
							startMs: 15300,
							endMs: 15620,
							timestampMs: 15460,
							confidence: null,
						},
						{
							text: ' 1',
							startMs: 15620,
							endMs: 15960,
							timestampMs: 15790,
							confidence: null,
						},
						{
							text: ' click',
							startMs: 15960,
							endMs: 16420,
							timestampMs: 16190,
							confidence: null,
						},
						{
							text: ' you',
							startMs: 16420,
							endMs: 16600,
							timestampMs: 16510,
							confidence: null,
						},
						{
							text: ' can',
							startMs: 16600,
							endMs: 17060,
							timestampMs: 16830,
							confidence: null,
						},
						{
							text: ' invoke',
							startMs: 17060,
							endMs: 17460,
							timestampMs: 17260,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' your',
							startMs: 17460,
							endMs: 17760,
							timestampMs: 17610,
							confidence: null,
						},
						{
							text: ' favorite',
							startMs: 17760,
							endMs: 18020,
							timestampMs: 17890,
							confidence: null,
						},
						{
							text: ' coding',
							startMs: 18020,
							endMs: 18440,
							timestampMs: 18230,
							confidence: null,
						},
						{
							text: ' agent',
							startMs: 18440,
							endMs: 19560,
							timestampMs: 19000,
							confidence: null,
						},
						{
							text: ' or',
							startMs: 19560,
							endMs: 20040,
							timestampMs: 19800,
							confidence: null,
						},
						{
							text: ' open',
							startMs: 20040,
							endMs: 20700,
							timestampMs: 20370,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' the',
							startMs: 20700,
							endMs: 20900,
							timestampMs: 20800,
							confidence: null,
						},
						{
							text: ' code',
							startMs: 20900,
							endMs: 21200,
							timestampMs: 21050,
							confidence: null,
						},
						{
							text: ' snippet',
							startMs: 21200,
							endMs: 21640,
							timestampMs: 21420,
							confidence: null,
						},
						{
							text: ' in',
							startMs: 21640,
							endMs: 21820,
							timestampMs: 21730,
							confidence: null,
						},
						{
							text: ' your',
							startMs: 21820,
							endMs: 22080,
							timestampMs: 21950,
							confidence: null,
						},
						{
							text: ' code',
							startMs: 22080,
							endMs: 22320,
							timestampMs: 22200,
							confidence: null,
						},
						{
							text: ' editor.',
							startMs: 22320,
							endMs: 23000,
							timestampMs: 22660,
							confidence: null,
							pageBreakAfter: true,
						},
					]}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="24a - Jump to the code editor"
				trimBefore={207}
				durationInFrames={238}
			>
				<Video
					name="here24.mov"
					src="https://remotion.media/here-2026-11-03/here24-e51579f03282.mov"
					muted
					cropLeft={0.167067308}
					cropRight={0.063701923}
					cropTop={0.192307692}
					cropBottom={0.038461538}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: '130%',
						height: '130%',
						objectFit: 'cover',
						translate: '-417px -270px',
					}}
				/>
				<Audio
					name="here24 - cleaned dialogue"
					src="https://remotion.media/here-2026-11-03/audio/here24-auphonic-207fd1c39e8b.flac"
					volume={0.25}
				/>
				<BasicCaptions
					name="24a - Captions"
					width={1200}
					combineTokensWithinMilliseconds={10000}
					style={{position: 'absolute', bottom: 80, translate: '360px 0px'}}
					captions={[
						{
							text: 'You',
							startMs: 7050,
							endMs: 7180,
							timestampMs: 7115,
							confidence: null,
						},
						{
							text: ' can',
							startMs: 7180,
							endMs: 7360,
							timestampMs: 7270,
							confidence: null,
						},
						{
							text: ' also',
							startMs: 7360,
							endMs: 7740,
							timestampMs: 7550,
							confidence: null,
						},
						{
							text: ' double',
							startMs: 7740,
							endMs: 8000,
							timestampMs: 7870,
							confidence: null,
						},
						{
							text: '-click',
							startMs: 8000,
							endMs: 8340,
							timestampMs: 8170,
							confidence: null,
						},
						{
							text: ' any',
							startMs: 8340,
							endMs: 8800,
							timestampMs: 8570,
							confidence: null,
						},
						{
							text: ' item',
							startMs: 8800,
							endMs: 9000,
							timestampMs: 8900,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' or',
							startMs: 9000,
							endMs: 9380,
							timestampMs: 9190,
							confidence: null,
						},
						{
							text: ' property',
							startMs: 9380,
							endMs: 9720,
							timestampMs: 9550,
							confidence: null,
						},
						{
							text: ' in',
							startMs: 9720,
							endMs: 9820,
							timestampMs: 9770,
							confidence: null,
						},
						{
							text: ' the',
							startMs: 9820,
							endMs: 10040,
							timestampMs: 9930,
							confidence: null,
						},
						{
							text: ' Remotion',
							startMs: 10040,
							endMs: 10540,
							timestampMs: 10290,
							confidence: null,
						},
						{
							text: ' Studio',
							startMs: 10540,
							endMs: 11500,
							timestampMs: 11020,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' to',
							startMs: 11500,
							endMs: 11820,
							timestampMs: 11660,
							confidence: null,
						},
						{
							text: ' open',
							startMs: 11820,
							endMs: 12520,
							timestampMs: 12170,
							confidence: null,
						},
						{
							text: ' the',
							startMs: 12520,
							endMs: 12760,
							timestampMs: 12640,
							confidence: null,
						},
						{
							text: ' right',
							startMs: 12760,
							endMs: 12820,
							timestampMs: 12790,
							confidence: null,
						},
						{
							text: ' location',
							startMs: 13340,
							endMs: 13620,
							timestampMs: 13480,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' in',
							startMs: 13620,
							endMs: 13780,
							timestampMs: 13700,
							confidence: null,
						},
						{
							text: ' your',
							startMs: 13780,
							endMs: 14000,
							timestampMs: 13890,
							confidence: null,
						},
						{
							text: ' code',
							startMs: 14000,
							endMs: 14260,
							timestampMs: 14130,
							confidence: null,
						},
						{
							text: ' editor.',
							startMs: 14260,
							endMs: 15420,
							timestampMs: 14840,
							confidence: null,
							pageBreakAfter: true,
						},
					]}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="24b - Jump to the code editor"
				trimBefore={464}
				durationInFrames={223}
			>
				<Video
					name="here24.mov"
					src="https://remotion.media/here-2026-11-03/here24-e51579f03282.mov"
					muted
					cropLeft={0.167067308}
					cropRight={0.063701923}
					cropTop={0.192307692}
					cropBottom={0.038461538}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: '130%',
						height: '130%',
						objectFit: 'cover',
						translate: '-417px -270px',
					}}
				/>
				<Audio
					name="here24 - cleaned dialogue"
					src="https://remotion.media/here-2026-11-03/audio/here24-auphonic-207fd1c39e8b.flac"
					volume={0.25}
				/>
				<BasicCaptions
					name="24b - Captions"
					width={1200}
					combineTokensWithinMilliseconds={10000}
					style={{position: 'absolute', bottom: 80, translate: '360px 0px'}}
					captions={[
						{
							text: ' I',
							startMs: 15740,
							endMs: 15940,
							timestampMs: 15840,
							confidence: null,
						},
						{
							text: ' find',
							startMs: 15940,
							endMs: 16120,
							timestampMs: 16030,
							confidence: null,
						},
						{
							text: ' this',
							startMs: 16120,
							endMs: 16280,
							timestampMs: 16200,
							confidence: null,
						},
						{
							text: ' useful',
							startMs: 16280,
							endMs: 16760,
							timestampMs: 16520,
							confidence: null,
						},
						{
							text: ' if',
							startMs: 16760,
							endMs: 16860,
							timestampMs: 16810,
							confidence: null,
						},
						{
							text: ' I,',
							startMs: 16860,
							endMs: 16920,
							timestampMs: 16890,
							confidence: null,
						},
						{
							text: ' for',
							startMs: 17080,
							endMs: 17360,
							timestampMs: 17220,
							confidence: null,
						},
						{
							text: ' example,',
							startMs: 17360,
							endMs: 17720,
							timestampMs: 17540,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' want',
							startMs: 17760,
							endMs: 18080,
							timestampMs: 17920,
							confidence: null,
						},
						{
							text: ' to',
							startMs: 18080,
							endMs: 18820,
							timestampMs: 18450,
							confidence: null,
						},
						{
							text: ' cut',
							startMs: 18820,
							endMs: 19160,
							timestampMs: 18990,
							confidence: null,
						},
						{
							text: ' some',
							startMs: 19160,
							endMs: 19420,
							timestampMs: 19290,
							confidence: null,
						},
						{
							text: ' markup',
							startMs: 19420,
							endMs: 19960,
							timestampMs: 19690,
							confidence: null,
						},
						{
							text: ' and',
							startMs: 19960,
							endMs: 20260,
							timestampMs: 20110,
							confidence: null,
						},
						{
							text: ' paste',
							startMs: 20260,
							endMs: 20500,
							timestampMs: 20380,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' it',
							startMs: 20500,
							endMs: 20860,
							timestampMs: 20680,
							confidence: null,
						},
						{
							text: ' in',
							startMs: 20860,
							endMs: 21180,
							timestampMs: 21020,
							confidence: null,
						},
						{
							text: ' another',
							startMs: 21180,
							endMs: 21260,
							timestampMs: 21220,
							confidence: null,
						},
						{
							text: ' location',
							startMs: 21700,
							endMs: 22120,
							timestampMs: 21910,
							confidence: null,
						},
						{
							text: ' in',
							startMs: 22120,
							endMs: 22240,
							timestampMs: 22180,
							confidence: null,
						},
						{
							text: ' the',
							startMs: 22240,
							endMs: 22440,
							timestampMs: 22340,
							confidence: null,
						},
						{
							text: ' code.',
							startMs: 22440,
							endMs: 22680,
							timestampMs: 22560,
							confidence: null,
							pageBreakAfter: true,
						},
					]}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="25 - Live updates with Fast Refresh"
				trimBefore={96}
				durationInFrames={341}
			>
				<Video
					name="here25.mov"
					src="https://remotion.media/here-2026-11-03/here25-0fb80e6c2984.mov"
					muted
					cropLeft={0.153846154}
					cropRight={0.076923077}
					cropTop={0.191595442}
					cropBottom={0.039173789}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: '130%',
						height: '130%',
						objectFit: 'cover',
						translate: '-384px -269px',
					}}
				/>
				<Audio
					name="here25 - cleaned dialogue"
					src="https://remotion.media/here-2026-11-03/audio/here25-auphonic-a88b1d57a6f6.flac"
					volume={0.25}
				/>
				<BasicCaptions
					name="25 - Captions"
					width={1200}
					combineTokensWithinMilliseconds={10000}
					style={{position: 'absolute', bottom: 80, translate: '360px 0px'}}
					captions={[
						{
							text: 'Of',
							startMs: 3360,
							endMs: 3560,
							timestampMs: 3460,
							confidence: null,
						},
						{
							text: ' course,',
							startMs: 3560,
							endMs: 3980,
							timestampMs: 3770,
							confidence: null,
						},
						{
							text: ' any',
							startMs: 4140,
							endMs: 4460,
							timestampMs: 4300,
							confidence: null,
						},
						{
							text: ' edits',
							startMs: 4460,
							endMs: 4760,
							timestampMs: 4610,
							confidence: null,
						},
						{
							text: ' that',
							startMs: 4760,
							endMs: 4860,
							timestampMs: 4810,
							confidence: null,
						},
						{
							text: ' you',
							startMs: 4860,
							endMs: 5040,
							timestampMs: 4950,
							confidence: null,
						},
						{
							text: ' make',
							startMs: 5040,
							endMs: 5300,
							timestampMs: 5170,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' in',
							startMs: 5300,
							endMs: 5420,
							timestampMs: 5360,
							confidence: null,
						},
						{
							text: ' your',
							startMs: 5420,
							endMs: 5800,
							timestampMs: 5610,
							confidence: null,
						},
						{
							text: ' code',
							startMs: 5800,
							endMs: 6600,
							timestampMs: 6200,
							confidence: null,
						},
						{
							text: ' get',
							startMs: 6600,
							endMs: 6860,
							timestampMs: 6730,
							confidence: null,
						},
						{
							text: ' applied',
							startMs: 6860,
							endMs: 7400,
							timestampMs: 7130,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' using',
							startMs: 7400,
							endMs: 7760,
							timestampMs: 7580,
							confidence: null,
						},
						{
							text: " React's",
							startMs: 7760,
							endMs: 8200,
							timestampMs: 7980,
							confidence: null,
						},
						{
							text: ' Fast',
							startMs: 8200,
							endMs: 8540,
							timestampMs: 8370,
							confidence: null,
						},
						{
							text: ' Refresh',
							startMs: 8540,
							endMs: 9360,
							timestampMs: 8950,
							confidence: null,
						},
						{
							text: ' without',
							startMs: 9800,
							endMs: 10040,
							timestampMs: 9920,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' needing',
							startMs: 10040,
							endMs: 10340,
							timestampMs: 10190,
							confidence: null,
						},
						{
							text: ' to',
							startMs: 10340,
							endMs: 10600,
							timestampMs: 10470,
							confidence: null,
						},
						{
							text: ' reload',
							startMs: 10600,
							endMs: 11460,
							timestampMs: 11030,
							confidence: null,
						},
						{
							text: ' and',
							startMs: 11460,
							endMs: 11660,
							timestampMs: 11560,
							confidence: null,
						},
						{
							text: ' stay',
							startMs: 11660,
							endMs: 11960,
							timestampMs: 11810,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' immediately',
							startMs: 11960,
							endMs: 12820,
							timestampMs: 12390,
							confidence: null,
						},
						{
							text: ' visible',
							startMs: 12820,
							endMs: 13580,
							timestampMs: 13200,
							confidence: null,
						},
						{
							text: ' to',
							startMs: 13580,
							endMs: 13740,
							timestampMs: 13660,
							confidence: null,
						},
						{
							text: ' your',
							startMs: 13740,
							endMs: 14040,
							timestampMs: 13890,
							confidence: null,
						},
						{
							text: ' agent.',
							startMs: 14040,
							endMs: 14360,
							timestampMs: 14200,
							confidence: null,
							pageBreakAfter: true,
						},
					]}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="26a - Closing thoughts"
				trimBefore={77}
				durationInFrames={280}
			>
				<Video
					name="here26.mov"
					src="https://remotion.media/here-2026-11-03/here26-163623811ceb.mov"
					muted
					cropLeft={0.151442308}
					cropRight={0.079326923}
					cropTop={0.195868946}
					cropBottom={0.034900285}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: '130%',
						height: '130%',
						objectFit: 'cover',
						translate: '-378px -275px',
					}}
				/>
				<Audio
					name="here26 - cleaned dialogue"
					src="https://remotion.media/here-2026-11-03/audio/here26-auphonic-cbe214e1b44a.flac"
					volume={0.25}
				/>
				<BasicCaptions
					name="26a - Captions"
					width={1200}
					combineTokensWithinMilliseconds={10000}
					style={{position: 'absolute', bottom: 80, translate: '360px 0px'}}
					captions={[
						{
							text: 'To',
							startMs: 2720,
							endMs: 2900,
							timestampMs: 2810,
							confidence: null,
						},
						{
							text: ' make',
							startMs: 2900,
							endMs: 3160,
							timestampMs: 3030,
							confidence: null,
						},
						{
							text: ' good',
							startMs: 3160,
							endMs: 3500,
							timestampMs: 3330,
							confidence: null,
						},
						{
							text: ' videos',
							startMs: 3500,
							endMs: 3960,
							timestampMs: 3730,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' a',
							startMs: 3960,
							endMs: 4220,
							timestampMs: 4090,
							confidence: null,
						},
						{
							text: ' tight',
							startMs: 4220,
							endMs: 4660,
							timestampMs: 4440,
							confidence: null,
						},
						{
							text: ' iteration',
							startMs: 4660,
							endMs: 5240,
							timestampMs: 4950,
							confidence: null,
						},
						{
							text: ' loop',
							startMs: 5240,
							endMs: 5560,
							timestampMs: 5400,
							confidence: null,
						},
						{
							text: ' is',
							startMs: 5560,
							endMs: 5780,
							timestampMs: 5670,
							confidence: null,
						},
						{
							text: ' still',
							startMs: 5780,
							endMs: 6160,
							timestampMs: 5970,
							confidence: null,
						},
						{
							text: ' crucial',
							startMs: 6160,
							endMs: 7160,
							timestampMs: 6660,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' because',
							startMs: 7160,
							endMs: 7240,
							timestampMs: 7200,
							confidence: null,
						},
						{
							text: ' agents',
							startMs: 7580,
							endMs: 7920,
							timestampMs: 7750,
							confidence: null,
						},
						{
							text: ' can',
							startMs: 7920,
							endMs: 8120,
							timestampMs: 8020,
							confidence: null,
						},
						{
							text: ' run',
							startMs: 8120,
							endMs: 8360,
							timestampMs: 8240,
							confidence: null,
						},
						{
							text: ' for',
							startMs: 8360,
							endMs: 8500,
							timestampMs: 8430,
							confidence: null,
						},
						{
							text: ' a',
							startMs: 8500,
							endMs: 8700,
							timestampMs: 8600,
							confidence: null,
						},
						{
							text: ' long',
							startMs: 8700,
							endMs: 9080,
							timestampMs: 8890,
							confidence: null,
						},
						{
							text: ' time',
							startMs: 9080,
							endMs: 9740,
							timestampMs: 9410,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' and',
							startMs: 9740,
							endMs: 9960,
							timestampMs: 9850,
							confidence: null,
						},
						{
							text: ' they',
							startMs: 9960,
							endMs: 10240,
							timestampMs: 10100,
							confidence: null,
						},
						{
							text: ' produce',
							startMs: 10240,
							endMs: 10720,
							timestampMs: 10480,
							confidence: null,
						},
						{
							text: ' a',
							startMs: 10720,
							endMs: 10980,
							timestampMs: 10850,
							confidence: null,
						},
						{
							text: ' lot',
							startMs: 10980,
							endMs: 11220,
							timestampMs: 11100,
							confidence: null,
						},
						{
							text: ' of',
							startMs: 11220,
							endMs: 11460,
							timestampMs: 11340,
							confidence: null,
						},
						{
							text: ' slop.',
							startMs: 11460,
							endMs: 12600,
							timestampMs: 12030,
							confidence: null,
							pageBreakAfter: true,
						},
					]}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="26b - Closing thoughts"
				trimBefore={385}
				durationInFrames={504}
			>
				<Video
					name="here26.mov"
					src="https://remotion.media/here-2026-11-03/here26-163623811ceb.mov"
					muted
					cropLeft={0.151442308}
					cropRight={0.079326923}
					cropTop={0.195868946}
					cropBottom={0.034900285}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: '130%',
						height: '130%',
						objectFit: 'cover',
						translate: '-378px -275px',
					}}
				/>
				<Audio
					name="here26 - cleaned dialogue"
					src="https://remotion.media/here-2026-11-03/audio/here26-auphonic-cbe214e1b44a.flac"
					volume={0.25}
				/>
				<BasicCaptions
					name="26b - Captions"
					width={1200}
					combineTokensWithinMilliseconds={10000}
					style={{position: 'absolute', bottom: 80, translate: '360px 0px'}}
					captions={[
						{
							text: ' I',
							startMs: 13080,
							endMs: 13220,
							timestampMs: 13150,
							confidence: null,
						},
						{
							text: ' can',
							startMs: 13220,
							endMs: 13420,
							timestampMs: 13320,
							confidence: null,
						},
						{
							text: ' speak',
							startMs: 13420,
							endMs: 13760,
							timestampMs: 13590,
							confidence: null,
						},
						{
							text: ' only',
							startMs: 13760,
							endMs: 13800,
							timestampMs: 13780,
							confidence: null,
						},
						{
							text: ' for',
							startMs: 14060,
							endMs: 14340,
							timestampMs: 14200,
							confidence: null,
						},
						{
							text: ' myself',
							startMs: 14340,
							endMs: 14820,
							timestampMs: 14580,
							confidence: null,
						},
						{
							text: ' but',
							startMs: 14820,
							endMs: 14940,
							timestampMs: 14880,
							confidence: null,
						},
						{
							text: " I've",
							startMs: 14940,
							endMs: 15120,
							timestampMs: 15030,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' been',
							startMs: 15120,
							endMs: 15480,
							timestampMs: 15300,
							confidence: null,
						},
						{
							text: ' making',
							startMs: 15480,
							endMs: 16820,
							timestampMs: 16150,
							confidence: null,
						},
						{
							text: ' videos',
							startMs: 16820,
							endMs: 17420,
							timestampMs: 17120,
							confidence: null,
						},
						{
							text: ' since',
							startMs: 17420,
							endMs: 17580,
							timestampMs: 17500,
							confidence: null,
						},
						{
							text: ' a',
							startMs: 17580,
							endMs: 17700,
							timestampMs: 17640,
							confidence: null,
						},
						{
							text: ' long',
							startMs: 17700,
							endMs: 18040,
							timestampMs: 17870,
							confidence: null,
						},
						{
							text: ' time',
							startMs: 18040,
							endMs: 18300,
							timestampMs: 18170,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' and',
							startMs: 18300,
							endMs: 18540,
							timestampMs: 18420,
							confidence: null,
						},
						{
							text: " I've",
							startMs: 18540,
							endMs: 18700,
							timestampMs: 18620,
							confidence: null,
						},
						{
							text: ' been',
							startMs: 18700,
							endMs: 18920,
							timestampMs: 18810,
							confidence: null,
						},
						{
							text: ' also',
							startMs: 18960,
							endMs: 19300,
							timestampMs: 19130,
							confidence: null,
						},
						{
							text: ' developing',
							startMs: 19740,
							endMs: 19980,
							timestampMs: 19860,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' Remotion',
							startMs: 19980,
							endMs: 20660,
							timestampMs: 20320,
							confidence: null,
						},
						{
							text: ' since',
							startMs: 20660,
							endMs: 21240,
							timestampMs: 20950,
							confidence: null,
						},
						{
							text: ' 6',
							startMs: 21240,
							endMs: 21560,
							timestampMs: 21400,
							confidence: null,
						},
						{
							text: ' years',
							startMs: 21560,
							endMs: 21940,
							timestampMs: 21750,
							confidence: null,
						},
						{
							text: ' now',
							startMs: 21940,
							endMs: 22900,
							timestampMs: 22420,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' and',
							startMs: 22900,
							endMs: 23200,
							timestampMs: 23050,
							confidence: null,
						},
						{
							text: ' only',
							startMs: 23200,
							endMs: 23500,
							timestampMs: 23350,
							confidence: null,
						},
						{
							text: ' these',
							startMs: 23500,
							endMs: 23820,
							timestampMs: 23660,
							confidence: null,
						},
						{
							text: ' recent',
							startMs: 23820,
							endMs: 24400,
							timestampMs: 24110,
							confidence: null,
						},
						{
							text: ' changes',
							startMs: 24400,
							endMs: 25440,
							timestampMs: 24920,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' made',
							startMs: 25440,
							endMs: 25740,
							timestampMs: 25590,
							confidence: null,
						},
						{
							text: ' me',
							startMs: 25740,
							endMs: 26040,
							timestampMs: 25890,
							confidence: null,
						},
						{
							text: ' drop',
							startMs: 26040,
							endMs: 26320,
							timestampMs: 26180,
							confidence: null,
						},
						{
							text: ' other',
							startMs: 26320,
							endMs: 26800,
							timestampMs: 26560,
							confidence: null,
						},
						{
							text: ' programs',
							startMs: 26800,
							endMs: 27200,
							timestampMs: 27000,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' and',
							startMs: 27360,
							endMs: 27620,
							timestampMs: 27490,
							confidence: null,
						},
						{
							text: ' go',
							startMs: 27620,
							endMs: 28020,
							timestampMs: 27820,
							confidence: null,
						},
						{
							text: ' all',
							startMs: 28020,
							endMs: 28440,
							timestampMs: 28230,
							confidence: null,
						},
						{
							text: ' in',
							startMs: 28440,
							endMs: 28740,
							timestampMs: 28590,
							confidence: null,
						},
						{
							text: ' on',
							startMs: 28740,
							endMs: 28980,
							timestampMs: 28860,
							confidence: null,
						},
						{
							text: ' Remotion.',
							startMs: 28980,
							endMs: 30140,
							timestampMs: 29560,
							confidence: null,
							pageBreakAfter: true,
						},
					]}
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="26c - Closing thoughts"
				trimBefore={906}
				durationInFrames={141}
			>
				<Video
					name="here26.mov"
					src="https://remotion.media/here-2026-11-03/here26-163623811ceb.mov"
					muted
					cropLeft={0.151442308}
					cropRight={0.079326923}
					cropTop={0.195868946}
					cropBottom={0.034900285}
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: '130%',
						height: '130%',
						objectFit: 'cover',
						translate: '-378px -275px',
					}}
				/>
				<Audio
					name="here26 - cleaned dialogue"
					src="https://remotion.media/here-2026-11-03/audio/here26-auphonic-cbe214e1b44a.flac"
					volume={0.25}
				/>
				<BasicCaptions
					name="26c - Captions"
					width={1200}
					combineTokensWithinMilliseconds={10000}
					style={{position: 'absolute', bottom: 80, translate: '360px 0px'}}
					captions={[
						{
							text: ' I',
							startMs: 30460,
							endMs: 30680,
							timestampMs: 30570,
							confidence: null,
						},
						{
							text: ' hope',
							startMs: 30680,
							endMs: 31260,
							timestampMs: 30970,
							confidence: null,
						},
						{
							text: ' that',
							startMs: 31260,
							endMs: 31480,
							timestampMs: 31370,
							confidence: null,
						},
						{
							text: ' these',
							startMs: 31480,
							endMs: 31680,
							timestampMs: 31580,
							confidence: null,
						},
						{
							text: ' new',
							startMs: 31680,
							endMs: 31980,
							timestampMs: 31830,
							confidence: null,
						},
						{
							text: ' features',
							startMs: 31980,
							endMs: 33140,
							timestampMs: 32560,
							confidence: null,
							pageBreakAfter: true,
						},
						{
							text: ' also',
							startMs: 33140,
							endMs: 33680,
							timestampMs: 33410,
							confidence: null,
						},
						{
							text: ' are',
							startMs: 33680,
							endMs: 34000,
							timestampMs: 33840,
							confidence: null,
						},
						{
							text: ' valuable',
							startMs: 34000,
							endMs: 34360,
							timestampMs: 34180,
							confidence: null,
						},
						{
							text: ' to',
							startMs: 34360,
							endMs: 34540,
							timestampMs: 34450,
							confidence: null,
						},
						{
							text: ' you.',
							startMs: 34540,
							endMs: 34640,
							timestampMs: 34590,
							confidence: null,
							pageBreakAfter: true,
						},
					]}
				/>
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};
