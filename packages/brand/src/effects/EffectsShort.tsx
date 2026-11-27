import {colorCorrection} from '@remotion/effects/color-correction';
import {loadFont} from '@remotion/fonts';
import {Audio, Video} from '@remotion/media';
import {TransitionSeries} from '@remotion/transitions';
import {Sequence, staticFile} from 'remotion';
import {z} from 'zod';
import {BasicCaptions} from '../basic-captions';
import {EffectsRangeInputIntro} from '../EffectsIntroCaptureComposition';
import {EffectsBackendsSlide} from './EffectsBackendsSlide';
import {EffectsPowerRangers} from './EffectsPowerRangers';
import {EffectsRangersMusic, rangersMusicSchema} from './EffectsRangersMusic';
import {EffectsShaderGallery} from './EffectsShaderGallery';
import {EffectsSuperheroBadges} from './EffectsSuperheroBadges';

loadFont({
	family: 'Effects GT Planar',
	url: staticFile('GT Planar/GT-Planar-Medium.woff2'),
	weight: '500',
});

export const effectsShortSchema = z.object({
	format: z.enum(['portrait', 'landscape']).describe('Video format'),
	ending: z
		.enum(['Power Rangers', 'Deadpool & Wolverine'])
		.describe('Ending footage'),
	rangersMusic: rangersMusicSchema,
});

export const EffectsShort = ({
	format,
	ending,
	rangersMusic,
}: z.infer<typeof effectsShortSchema>) => {
	const portrait = format === 'portrait';

	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				overflow: 'hidden',
				backgroundColor: '#ffffff',
			}}
		>
			<TransitionSeries name="Effects - rough cut">
				<TransitionSeries.Sequence
					name="1 - Apply an effect"
					trimBefore={69}
					durationInFrames={125}
				>
					<Video
						name="effect1.mov"
						src="https://remotion.media/effects-promo-2026-11-27/effect1-d81422461089.mov"
						muted
						objectFit="cover"
						effects={[
							colorCorrection({
								exposure: 0.42,
								temperature: -0.08,
								tint: -0.28,
								contrast: 1.02,
								shadows: 0.09,
								highlights: -0.08,
								saturation: 0.95,
							}),
						]}
						cropLeft={portrait ? 0.236413043 : 0.263586957}
						cropRight={portrait ? 0.274456522 : 0.301630435}
						cropTop={portrait ? 0.112721417 : 0.041062802}
						cropBottom={portrait ? 0.114331723 : 0.08937198}
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: 2208,
							height: 1242,
							translate: portrait ? '-522px 820px' : '378px -51px',
						}}
					/>
					<Audio
						name="1 - Dialogue"
						src="https://remotion.media/effects-promo-2026-11-27/effect1-auphonic-62a9f9a2854b.flac"
					/>
					<Sequence
						name="Range input close-up"
						from={69}
						durationInFrames={125}
						width={portrait ? 1080 : 960}
						height={portrait ? 960 : 1080}
						style={{
							left: 0,
							top: 0,
							overflow: 'hidden',
							backgroundColor: 'black',
							perspective: 1400,
						}}
					>
						<Sequence
							name="Screen tilt"
							style={{rotate: '0.88 -0.06 -0.46 18deg'}}
						>
							<EffectsRangeInputIntro />
						</Sequence>
					</Sequence>
					<BasicCaptions
						name="1 - Captions"
						width={portrait ? 1040 : 1200}
						combineTokensWithinMilliseconds={10000}
						style={{
							position: 'absolute',
							left: portrait ? 20 : 360,
							top: 860,
							height: 200,
							fontSize: portrait ? 80 : 64,
							backgroundColor: '#ffffff',
							color: '#000000',
							fontFamily: 'Effects GT Planar',
							fontWeight: 500,
							paddingInline: portrait ? 40 : 32,
							whiteSpace: 'nowrap',
						}}
						captions={[
							{
								text: 'In',
								startMs: 2390,
								endMs: 2500,
								timestampMs: 2445,
								confidence: null,
							},
							{
								text: ' Remotion,',
								startMs: 2500,
								endMs: 2980,
								timestampMs: 2740,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' you',
								startMs: 2980,
								endMs: 3180,
								timestampMs: 3080,
								confidence: null,
							},
							{
								text: ' can',
								startMs: 3180,
								endMs: 3340,
								timestampMs: 3260,
								confidence: null,
							},
							{
								text: ' select',
								startMs: 3340,
								endMs: 3580,
								timestampMs: 3460,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' any',
								startMs: 3580,
								endMs: 4060,
								timestampMs: 3820,
								confidence: null,
							},
							{
								text: ' element',
								startMs: 4060,
								endMs: 4420,
								timestampMs: 4240,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' and',
								startMs: 4420,
								endMs: 4880,
								timestampMs: 4650,
								confidence: null,
							},
							{
								text: ' apply',
								startMs: 4880,
								endMs: 5180,
								timestampMs: 5030,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' an',
								startMs: 5180,
								endMs: 5560,
								timestampMs: 5370,
								confidence: null,
							},
							{
								text: ' effect',
								startMs: 5560,
								endMs: 5880,
								timestampMs: 5720,
								confidence: null,
							},
							{
								text: ' to',
								startMs: 5880,
								endMs: 6120,
								timestampMs: 6000,
								confidence: null,
							},
							{
								text: ' it.',
								startMs: 6120,
								endMs: 6410,
								timestampMs: 6265,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="2 - Preview presets"
					trimBefore={80}
					durationInFrames={138}
				>
					<Video
						name="effect2.mov"
						src="https://remotion.media/effects-promo-2026-11-27/effect2-55d3780fa6ec.mov"
						muted
						objectFit="cover"
						effects={[
							colorCorrection({
								exposure: 0.42,
								temperature: -0.08,
								tint: -0.28,
								contrast: 1.02,
								shadows: 0.09,
								highlights: -0.08,
								saturation: 0.95,
							}),
						]}
						cropLeft={portrait ? 0.224184783 : 0.251358696}
						cropRight={portrait ? 0.286684783 : 0.313858696}
						cropTop={portrait ? 0.112721417 : 0.041062802}
						cropBottom={portrait ? 0.114331723 : 0.08937198}
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: 2208,
							height: 1242,
							translate: portrait ? '-495px 820px' : '405px -51px',
						}}
					/>
					<Audio
						name="2 - Dialogue"
						src="https://remotion.media/effects-promo-2026-11-27/effect2-auphonic-fe954ce8dbd3.flac"
					/>
					<BasicCaptions
						name="2 - Captions"
						width={portrait ? 1040 : 1200}
						combineTokensWithinMilliseconds={10000}
						style={{
							position: 'absolute',
							left: portrait ? 20 : 360,
							top: 860,
							height: 200,
							fontSize: portrait ? 80 : 64,
							backgroundColor: '#ffffff',
							color: '#000000',
							fontFamily: 'Effects GT Planar',
							fontWeight: 500,
							paddingInline: portrait ? 40 : 32,
							whiteSpace: 'nowrap',
						}}
						captions={[
							{
								text: 'Hover',
								startMs: 2770,
								endMs: 3060,
								timestampMs: 2915,
								confidence: null,
							},
							{
								text: ' over',
								startMs: 3060,
								endMs: 3360,
								timestampMs: 3210,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' any',
								startMs: 3360,
								endMs: 3640,
								timestampMs: 3500,
								confidence: null,
							},
							{
								text: ' of',
								startMs: 3640,
								endMs: 3820,
								timestampMs: 3730,
								confidence: null,
							},
							{
								text: ' our',
								startMs: 3820,
								endMs: 4060,
								timestampMs: 3940,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' 90',
								startMs: 4060,
								endMs: 4440,
								timestampMs: 4250,
								confidence: null,
							},
							{
								text: ' presets',
								startMs: 4440,
								endMs: 4800,
								timestampMs: 4620,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' and',
								startMs: 4800,
								endMs: 5180,
								timestampMs: 4990,
								confidence: null,
							},
							{
								text: ' see',
								startMs: 5180,
								endMs: 5420,
								timestampMs: 5300,
								confidence: null,
							},
							{
								text: ' a',
								startMs: 5420,
								endMs: 5620,
								timestampMs: 5520,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' live',
								startMs: 5620,
								endMs: 5880,
								timestampMs: 5750,
								confidence: null,
							},
							{
								text: ' preview',
								startMs: 5880,
								endMs: 6300,
								timestampMs: 6090,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' immediately.',
								startMs: 6300,
								endMs: 7150,
								timestampMs: 6725,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="3 - Create effects with an agent"
					trimBefore={94}
					durationInFrames={141}
				>
					<Video
						name="effect3.mov"
						src="https://remotion.media/effects-promo-2026-11-27/effect3-dfa6178e22a5.mov"
						muted
						objectFit="cover"
						effects={[
							colorCorrection({
								exposure: 0.42,
								temperature: -0.08,
								tint: -0.28,
								contrast: 1.02,
								shadows: 0.09,
								highlights: -0.08,
								saturation: 0.95,
							}),
						]}
						cropLeft={portrait ? 0.216938406 : 0.244112319}
						cropRight={portrait ? 0.293931159 : 0.321105072}
						cropTop={portrait ? 0.112721417 : 0.041062802}
						cropBottom={portrait ? 0.114331723 : 0.08937198}
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: 2208,
							height: 1242,
							translate: portrait ? '-479px 820px' : '421px -51px',
						}}
					/>
					<Audio
						name="3 - Dialogue"
						src="https://remotion.media/effects-promo-2026-11-27/effect3-auphonic-9b5ee882f7d9.flac"
					/>
					<BasicCaptions
						name="3 - Captions"
						width={portrait ? 1040 : 1200}
						combineTokensWithinMilliseconds={10000}
						style={{
							position: 'absolute',
							left: portrait ? 20 : 360,
							top: 860,
							height: 200,
							fontSize: portrait ? 80 : 64,
							backgroundColor: '#ffffff',
							color: '#000000',
							fontFamily: 'Effects GT Planar',
							fontWeight: 500,
							paddingInline: portrait ? 40 : 32,
							whiteSpace: 'nowrap',
						}}
						captions={[
							{
								text: 'If',
								startMs: 3240,
								endMs: 3360,
								timestampMs: 3300,
								confidence: null,
							},
							{
								text: ' the',
								startMs: 3360,
								endMs: 3500,
								timestampMs: 3430,
								confidence: null,
							},
							{
								text: ' effect',
								startMs: 3500,
								endMs: 3820,
								timestampMs: 3660,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' you',
								startMs: 3820,
								endMs: 4020,
								timestampMs: 3920,
								confidence: null,
							},
							{
								text: ' need',
								startMs: 4020,
								endMs: 4140,
								timestampMs: 4080,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' does',
								startMs: 4140,
								endMs: 4380,
								timestampMs: 4260,
								confidence: null,
							},
							{
								text: ' not',
								startMs: 4380,
								endMs: 4540,
								timestampMs: 4460,
								confidence: null,
							},
							{
								text: ' exist,',
								startMs: 4540,
								endMs: 4940,
								timestampMs: 4740,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' you',
								startMs: 5140,
								endMs: 5160,
								timestampMs: 5150,
								confidence: null,
							},
							{
								text: ' can',
								startMs: 5160,
								endMs: 5300,
								timestampMs: 5230,
								confidence: null,
							},
							{
								text: ' simply',
								startMs: 5300,
								endMs: 5660,
								timestampMs: 5480,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' vibe',
								startMs: 5660,
								endMs: 6040,
								timestampMs: 5850,
								confidence: null,
							},
							{
								text: ' code',
								startMs: 6040,
								endMs: 6380,
								timestampMs: 6210,
								confidence: null,
							},
							{
								text: ' one',
								startMs: 6380,
								endMs: 6640,
								timestampMs: 6510,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' with',
								startMs: 6640,
								endMs: 6940,
								timestampMs: 6790,
								confidence: null,
							},
							{
								text: ' your',
								startMs: 6940,
								endMs: 7120,
								timestampMs: 7030,
								confidence: null,
							},
							{
								text: ' agent.',
								startMs: 7120,
								endMs: 7750,
								timestampMs: 7435,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="4 - Port shaders"
					trimBefore={58}
					durationInFrames={251}
				>
					<Video
						name="effect4.mov"
						src="https://remotion.media/effects-promo-2026-11-27/effect4-54f656470478.mov"
						muted
						objectFit="cover"
						effects={[
							colorCorrection({
								exposure: 0.42,
								temperature: -0.08,
								tint: -0.28,
								contrast: 1.02,
								shadows: 0.09,
								highlights: -0.08,
								saturation: 0.95,
							}),
						]}
						cropLeft={portrait ? 0.230072464 : 0.257246377}
						cropRight={portrait ? 0.280797101 : 0.307971014}
						cropTop={portrait ? 0.112721417 : 0.041062802}
						cropBottom={portrait ? 0.114331723 : 0.08937198}
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: 2208,
							height: 1242,
							translate: portrait ? '-508px 820px' : '392px -51px',
						}}
					/>
					<Audio
						name="4 - Dialogue"
						src="https://remotion.media/effects-promo-2026-11-27/effect4-auphonic-3c24a98dc37f.flac"
					/>
					<EffectsShaderGallery
						name="Paper Shaders"
						from={58}
						durationInFrames={68}
						width={portrait ? 1080 : 960}
						height={portrait ? 960 : 1080}
						gallery="Paper Shaders"
						style={{left: 0, top: 0}}
					/>
					<EffectsShaderGallery
						name="Shadertoy"
						from={126}
						durationInFrames={39}
						width={portrait ? 1080 : 960}
						height={portrait ? 960 : 1080}
						gallery="Shadertoy"
						style={{left: 0, top: 0}}
					/>
					<BasicCaptions
						name="4 - Captions"
						width={portrait ? 1040 : 1200}
						combineTokensWithinMilliseconds={10000}
						style={{
							position: 'absolute',
							left: portrait ? 20 : 360,
							top: 860,
							height: 200,
							fontSize: portrait ? 80 : 64,
							backgroundColor: '#ffffff',
							color: '#000000',
							fontFamily: 'Effects GT Planar',
							fontWeight: 500,
							paddingInline: portrait ? 40 : 32,
							whiteSpace: 'nowrap',
						}}
						captions={[
							{
								text: 'Effects',
								startMs: 2030,
								endMs: 2220,
								timestampMs: 2125,
								confidence: null,
							},
							{
								text: ' can',
								startMs: 2220,
								endMs: 2560,
								timestampMs: 2390,
								confidence: null,
							},
							{
								text: ' easily',
								startMs: 2560,
								endMs: 2940,
								timestampMs: 2750,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' be',
								startMs: 2940,
								endMs: 3160,
								timestampMs: 3050,
								confidence: null,
							},
							{
								text: ' ported',
								startMs: 3160,
								endMs: 3580,
								timestampMs: 3370,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' from',
								startMs: 3580,
								endMs: 3760,
								timestampMs: 3670,
								confidence: null,
							},
							{
								text: ' any',
								startMs: 3760,
								endMs: 4120,
								timestampMs: 3940,
								confidence: null,
							},
							{
								text: ' shader',
								startMs: 4120,
								endMs: 4500,
								timestampMs: 4310,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' you',
								startMs: 4500,
								endMs: 4660,
								timestampMs: 4580,
								confidence: null,
							},
							{
								text: ' find',
								startMs: 4660,
								endMs: 4840,
								timestampMs: 4750,
								confidence: null,
							},
							{
								text: ' on',
								startMs: 4840,
								endMs: 5000,
								timestampMs: 4920,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' the',
								startMs: 5000,
								endMs: 5160,
								timestampMs: 5080,
								confidence: null,
							},
							{
								text: ' internet,',
								startMs: 5160,
								endMs: 5480,
								timestampMs: 5320,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' and',
								startMs: 5480,
								endMs: 5760,
								timestampMs: 5620,
								confidence: null,
							},
							{
								text: ' you',
								startMs: 5760,
								endMs: 5880,
								timestampMs: 5820,
								confidence: null,
							},
							{
								text: ' can',
								startMs: 5880,
								endMs: 6000,
								timestampMs: 5940,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' apply',
								startMs: 6000,
								endMs: 6340,
								timestampMs: 6170,
								confidence: null,
							},
							{
								text: ' them',
								startMs: 6340,
								endMs: 6600,
								timestampMs: 6470,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' agentically,',
								startMs: 6930,
								endMs: 7560,
								timestampMs: 7245,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' interactively,',
								startMs: 7880,
								endMs: 8660,
								timestampMs: 8270,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' and',
								startMs: 8660,
								endMs: 9280,
								timestampMs: 8970,
								confidence: null,
							},
							{
								text: ' programmatically.',
								startMs: 9280,
								endMs: 10190,
								timestampMs: 9735,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="5 - Interactive controls and keyframes"
					trimBefore={63}
					durationInFrames={161}
				>
					<Video
						name="effect5.mov"
						src="https://remotion.media/effects-promo-2026-11-27/effect5-800d55bb5477.mov"
						muted
						objectFit="cover"
						effects={[
							colorCorrection({
								exposure: 0.42,
								temperature: -0.08,
								tint: -0.28,
								contrast: 1.02,
								shadows: 0.09,
								highlights: -0.08,
								saturation: 0.95,
							}),
						]}
						cropLeft={portrait ? 0.216032609 : 0.243206522}
						cropRight={portrait ? 0.294836957 : 0.32201087}
						cropTop={portrait ? 0.112721417 : 0.041062802}
						cropBottom={portrait ? 0.114331723 : 0.08937198}
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: 2208,
							height: 1242,
							translate: portrait ? '-477px 820px' : '423px -51px',
						}}
					/>
					<Audio
						name="5 - Dialogue"
						src="https://remotion.media/effects-promo-2026-11-27/effect5-auphonic-18af99532d13.flac"
					/>
					<Sequence
						name="Supported Effect Backends"
						from={158}
						durationInFrames={66}
						width={portrait ? 1080 : 960}
						height={portrait ? 960 : 1080}
						style={{left: 0, top: 0}}
					>
						<EffectsBackendsSlide />
					</Sequence>
					<BasicCaptions
						name="5 - Captions"
						width={portrait ? 1040 : 1200}
						combineTokensWithinMilliseconds={10000}
						style={{
							position: 'absolute',
							left: portrait ? 20 : 360,
							top: 860,
							height: 200,
							fontSize: portrait ? 80 : 64,
							backgroundColor: '#ffffff',
							color: '#000000',
							fontFamily: 'Effects GT Planar',
							fontWeight: 500,
							paddingInline: portrait ? 40 : 32,
							whiteSpace: 'nowrap',
						}}
						captions={[
							{
								text: 'Effects',
								startMs: 2200,
								endMs: 2420,
								timestampMs: 2310,
								confidence: null,
							},
							{
								text: ' have',
								startMs: 2420,
								endMs: 2740,
								timestampMs: 2580,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' interactive',
								startMs: 2740,
								endMs: 3220,
								timestampMs: 2980,
								confidence: null,
							},
							{
								text: ' controls,',
								startMs: 3220,
								endMs: 3840,
								timestampMs: 3530,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' are',
								startMs: 4060,
								endMs: 4140,
								timestampMs: 4100,
								confidence: null,
							},
							{
								text: ' keyframable,',
								startMs: 4140,
								endMs: 4900,
								timestampMs: 4520,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' and',
								startMs: 4900,
								endMs: 5240,
								timestampMs: 5070,
								confidence: null,
							},
							{
								text: ' are',
								startMs: 5240,
								endMs: 5420,
								timestampMs: 5330,
								confidence: null,
							},
							{
								text: ' based',
								startMs: 5420,
								endMs: 5720,
								timestampMs: 5570,
								confidence: null,
							},
							{
								text: ' on',
								startMs: 5720,
								endMs: 5920,
								timestampMs: 5820,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' regular',
								startMs: 5920,
								endMs: 6340,
								timestampMs: 6130,
								confidence: null,
							},
							{
								text: ' web',
								startMs: 6340,
								endMs: 6660,
								timestampMs: 6500,
								confidence: null,
							},
							{
								text: ' technology.',
								startMs: 6660,
								endMs: 7400,
								timestampMs: 7030,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="6 - Combine effects and nest elements"
					trimBefore={94}
					durationInFrames={521}
				>
					<Video
						name="effect6.mov"
						src="https://remotion.media/effects-promo-2026-11-27/effect6-d0c0e0ec128b.mov"
						muted
						objectFit="cover"
						effects={[
							colorCorrection({
								exposure: 0.42,
								temperature: -0.08,
								tint: -0.28,
								contrast: 1.02,
								shadows: 0.09,
								highlights: -0.08,
								saturation: 0.95,
							}),
						]}
						cropLeft={portrait ? 0.219655797 : 0.24682971}
						cropRight={portrait ? 0.291213768 : 0.318387681}
						cropTop={portrait ? 0.112721417 : 0.041062802}
						cropBottom={portrait ? 0.114331723 : 0.08937198}
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: 2208,
							height: 1242,
							translate: portrait ? '-485px 820px' : '415px -51px',
						}}
					/>
					<Audio
						name="6 - Dialogue"
						src="https://remotion.media/effects-promo-2026-11-27/effect6-auphonic-e1dfa4d22d5a.flac"
					/>
					{ending === 'Power Rangers' ? (
						<Sequence
							name="Power Rangers"
							from={389}
							durationInFrames={226}
							width={portrait ? 1080 : 960}
							height={portrait ? 960 : 1080}
							style={{left: 0, top: 0, overflow: 'hidden'}}
						>
							<EffectsPowerRangers />
							<EffectsRangersMusic music={rangersMusic} />
						</Sequence>
					) : (
						<Sequence
							name="HTML and Canvas"
							from={389}
							durationInFrames={90}
							playbackRate={0.72}
							width={portrait ? 1080 : 960}
							height={portrait ? 960 : 1080}
							style={{left: 0, top: 0, overflow: 'hidden'}}
						>
							<div
								style={{
									position: 'absolute',
									left: 0,
									top: portrait ? 130 : 210,
									width: 1200,
									height: 804,
									scale: portrait ? 0.9 : 0.8,
									transformOrigin: 'top left',
								}}
							>
								<Video
									name="Deadpool & Wolverine - trailer at 0:43"
									src="https://remotion.media/effects-promo-2026-11-27/deadpool-wolverine-00-43-deab48952c3a.mp4"
									muted
									style={{width: '100%', height: '100%'}}
								/>
								<EffectsSuperheroBadges />
							</div>
						</Sequence>
					)}
					<BasicCaptions
						name="6 - Captions"
						width={portrait ? 1040 : 1200}
						combineTokensWithinMilliseconds={10000}
						style={{
							position: 'absolute',
							left: portrait ? 20 : 360,
							top: 860,
							height: 200,
							fontSize: portrait ? 80 : 64,
							backgroundColor: '#ffffff',
							color: '#000000',
							fontFamily: 'Effects GT Planar',
							fontWeight: 500,
							paddingInline: portrait ? 40 : 32,
							whiteSpace: 'nowrap',
						}}
						captions={[
							{
								text: 'Effects',
								startMs: 3225,
								endMs: 3400,
								timestampMs: 3312,
								confidence: null,
							},
							{
								text: ' can',
								startMs: 3400,
								endMs: 3720,
								timestampMs: 3560,
								confidence: null,
							},
							{
								text: ' be',
								startMs: 3720,
								endMs: 3880,
								timestampMs: 3800,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' combined,',
								startMs: 3880,
								endMs: 4240,
								timestampMs: 4060,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' and',
								startMs: 4240,
								endMs: 4980,
								timestampMs: 4610,
								confidence: null,
							},
							{
								text: ' elements',
								startMs: 4980,
								endMs: 5440,
								timestampMs: 5210,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' with',
								startMs: 5440,
								endMs: 5800,
								timestampMs: 5620,
								confidence: null,
							},
							{
								text: ' effects',
								startMs: 5800,
								endMs: 6120,
								timestampMs: 5960,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' can',
								startMs: 6120,
								endMs: 6440,
								timestampMs: 6280,
								confidence: null,
							},
							{
								text: ' be',
								startMs: 6440,
								endMs: 6600,
								timestampMs: 6520,
								confidence: null,
							},
							{
								text: ' nested',
								startMs: 6600,
								endMs: 7060,
								timestampMs: 6830,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' arbitrarily.',
								startMs: 7060,
								endMs: 7860,
								timestampMs: 7460,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' Now',
								startMs: 8800,
								endMs: 9000,
								timestampMs: 8900,
								confidence: null,
							},
							{
								text: ' that',
								startMs: 9000,
								endMs: 9160,
								timestampMs: 9080,
								confidence: null,
							},
							{
								text: ' you',
								startMs: 9160,
								endMs: 9280,
								timestampMs: 9220,
								confidence: null,
							},
							{
								text: ' can',
								startMs: 9280,
								endMs: 9440,
								timestampMs: 9360,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' apply',
								startMs: 9440,
								endMs: 9720,
								timestampMs: 9580,
								confidence: null,
							},
							{
								text: ' effects',
								startMs: 9720,
								endMs: 10180,
								timestampMs: 9950,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' to',
								startMs: 10180,
								endMs: 10440,
								timestampMs: 10310,
								confidence: null,
							},
							{
								text: ' any',
								startMs: 10440,
								endMs: 10820,
								timestampMs: 10630,
								confidence: null,
							},
							{
								text: ' element,',
								startMs: 10820,
								endMs: 11280,
								timestampMs: 11050,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' the',
								startMs: 11860,
								endMs: 11940,
								timestampMs: 11900,
								confidence: null,
							},
							{
								text: ' boundaries',
								startMs: 11940,
								endMs: 12480,
								timestampMs: 12210,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' between',
								startMs: 12480,
								endMs: 12960,
								timestampMs: 12720,
								confidence: null,
							},
							{
								text: ' HTML',
								startMs: 12960,
								endMs: 13700,
								timestampMs: 13330,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' and',
								startMs: 13700,
								endMs: 14220,
								timestampMs: 13960,
								confidence: null,
							},
							{
								text: ' canvas-based',
								startMs: 14220,
								endMs: 14900,
								timestampMs: 14560,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' content',
								startMs: 14900,
								endMs: 15500,
								timestampMs: 15200,
								confidence: null,
							},
							{
								text: ' are',
								startMs: 16045,
								endMs: 16160,
								timestampMs: 16102,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' broken',
								startMs: 16160,
								endMs: 16580,
								timestampMs: 16370,
								confidence: null,
							},
							{
								text: ' down,',
								startMs: 16580,
								endMs: 17060,
								timestampMs: 16820,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' and',
								startMs: 17590,
								endMs: 17700,
								timestampMs: 17645,
								confidence: null,
							},
							{
								text: ' you',
								startMs: 17700,
								endMs: 17840,
								timestampMs: 17770,
								confidence: null,
							},
							{
								text: ' can',
								startMs: 17840,
								endMs: 17980,
								timestampMs: 17910,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' create',
								startMs: 17980,
								endMs: 18380,
								timestampMs: 18180,
								confidence: null,
							},
							{
								text: ' using',
								startMs: 18380,
								endMs: 18640,
								timestampMs: 18510,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' the',
								startMs: 18640,
								endMs: 18880,
								timestampMs: 18760,
								confidence: null,
							},
							{
								text: ' best',
								startMs: 18880,
								endMs: 19200,
								timestampMs: 19040,
								confidence: null,
							},
							{
								text: ' of',
								startMs: 19200,
								endMs: 19420,
								timestampMs: 19310,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' both',
								startMs: 19420,
								endMs: 19640,
								timestampMs: 19530,
								confidence: null,
							},
							{
								text: ' worlds.',
								startMs: 19640,
								endMs: 20290,
								timestampMs: 19965,
								confidence: null,
								pageBreakAfter: true,
							},
						]}
					/>
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</div>
	);
};
