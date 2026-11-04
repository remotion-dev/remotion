import {Audio, Video} from '@remotion/media';
import {TransitionSeries} from '@remotion/transitions';
import type {CSSProperties} from 'react';
import {
	AbsoluteFill,
	Interactive,
	Track,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {BasicCaptions} from './basic-captions';

const picture = {
	position: 'absolute',
	inset: 0,
	width: 1920,
	height: 1080,
} satisfies CSSProperties;

// The filenames give each excerpt's start time in William Candillon's
// original upload. Trims and captions share the excerpt's clock at 24 fps.
// Full transcript: https://remotion.media/remotion-prototype-2020/episode.vtt
export const RemotionPrototype2020 = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<TransitionSeries name="Podcast selects">
				<TransitionSeries.Sequence
					name="William sees the trailer"
					trimBefore={183}
					durationInFrames={60}
				>
					<div
						style={{
							...picture,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: 'white',
						}}
					>
						{/* Isolate the 520px square trailer in the original Twitter embed. */}
						<div
							style={{
								position: 'relative',
								width: 520,
								height: 520,
								overflow: 'hidden',
								scale: picture.height / 520,
							}}
						>
							<Video
								name="Finished AnySticker animation"
								src="https://remotion.media/remotion-prototype-2020/00m07s-trailer.mp4"
								muted
								trimBefore={48}
								style={{
									position: 'absolute',
									width: 1920,
									height: 1080,
									left: -645,
									top: -445,
								}}
							/>
						</div>
					</div>
					<Audio
						name="William’s question"
						src="https://remotion.media/remotion-prototype-2020/00m07s-trailer.mp4"
					/>
					<BasicCaptions
						name="Basic Captions"
						combineTokensWithinMilliseconds={null}
						width={1480}
						style={{position: 'absolute', bottom: 94, translate: '220px 0px'}}
						captions={[
							{
								text: 'That was mind-blowing. How did you do it?',
								startMs: 7625,
								endMs: 10125,
								timestampMs: null,
								confidence: null,
							},
						]}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="The React reveal"
					trimBefore={87}
					durationInFrames={385}
				>
					<Video
						name="Jonny reveals the code"
						src="https://remotion.media/remotion-prototype-2020/00m39s-reveal.mp4"
						style={picture}
					/>
					<BasicCaptions
						name="Basic Captions"
						combineTokensWithinMilliseconds={null}
						width={1480}
						style={{position: 'absolute', bottom: 94, translate: '220px 0px'}}
						captions={[
							{
								text: 'Because I love React,',
								startMs: 3625,
								endMs: 5600,
								timestampMs: null,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' I actually made the trailer in React.',
								startMs: 5600,
								endMs: 8300,
								timestampMs: null,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' What do you mean?',
								startMs: 8600,
								endMs: 10250,
								timestampMs: null,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' So that means I…',
								startMs: 10380,
								endMs: 13350,
								timestampMs: null,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' I used, like, `<div>` and `<span>`',
								startMs: 13350,
								endMs: 16320,
								timestampMs: null,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' and, like, styled-components to write the trailer.',
								startMs: 16320,
								endMs: 19670,
								timestampMs: null,
								confidence: null,
							},
						]}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="The video is a website"
					trimBefore={42}
					durationInFrames={101}
				>
					<Video
						name="Jonny explains the trick"
						src="https://remotion.media/remotion-prototype-2020/01m13s-website.mp4"
						style={picture}
					/>
					<BasicCaptions
						name="Basic Captions"
						combineTokensWithinMilliseconds={null}
						width={1480}
						style={{position: 'absolute', bottom: 94, translate: '220px 0px'}}
						captions={[
							{
								text: 'So that video is actually a website.',
								startMs: 1750,
								endMs: 5960,
								timestampMs: null,
								confidence: null,
							},
						]}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="Scrubbing with useCurrentFrame()"
					trimBefore={76}
					durationInFrames={422}
				>
					<Video
						name="The browser preview and JSX"
						src="https://remotion.media/remotion-prototype-2020/01m32s-frame-hook.mp4"
						style={picture}
					/>
					<BasicCaptions
						name="Basic Captions"
						combineTokensWithinMilliseconds={null}
						width={1480}
						style={{position: 'absolute', bottom: 94, translate: '220px 0px'}}
						captions={[
							{
								text: 'I made a hook which is called `useCurrentFrame()`.',
								startMs: 3170,
								endMs: 7350,
								timestampMs: null,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' And what it does, it just counts up every frame.',
								startMs: 7350,
								endMs: 11980,
								timestampMs: null,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' And I call that hook, I get a number back.',
								startMs: 12000,
								endMs: 14830,
								timestampMs: null,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' And then based on that, if I…',
								startMs: 14880,
								endMs: 17750,
								timestampMs: null,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' I change the animation over time.',
								startMs: 17860,
								endMs: 20750,
								timestampMs: null,
								confidence: null,
							},
						]}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="You can program your animations!"
					trimBefore={80}
					durationInFrames={167}
				>
					<Video
						name="William and Jonny react"
						src="https://remotion.media/remotion-prototype-2020/02m03s-finally.mp4"
						style={picture}
					/>
					<BasicCaptions
						name="Basic Captions"
						combineTokensWithinMilliseconds={null}
						width={1480}
						style={{position: 'absolute', bottom: 94, translate: '220px 0px'}}
						captions={[
							{
								text: 'You can program your animations, finally!',
								startMs: 3340,
								endMs: 5740,
								timestampMs: null,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' Well, it’s been a dream of mine for a long time.',
								startMs: 5960,
								endMs: 10290,
								timestampMs: null,
								confidence: null,
							},
						]}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="A community-backed framework"
					trimBefore={80}
					durationInFrames={260}
				>
					<Video
						name="Jonny on a future framework"
						src="https://remotion.media/remotion-prototype-2020/02m43s-prediction.mp4"
						style={picture}
					/>
					<BasicCaptions
						name="Basic Captions"
						combineTokensWithinMilliseconds={null}
						width={1480}
						style={{position: 'absolute', bottom: 94, translate: '220px 0px'}}
						captions={[
							{
								text: 'I could imagine that a',
								startMs: 3333,
								endMs: 7100,
								timestampMs: null,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' real, uh, community-backed motion graphic',
								startMs: 7100,
								endMs: 11440,
								timestampMs: null,
								confidence: null,
								pageBreakAfter: true,
							},
							{
								text: ' framework for React could be coming out.',
								startMs: 11440,
								endMs: 14167,
								timestampMs: null,
								confidence: null,
							},
						]}
					/>
				</TransitionSeries.Sequence>
			</TransitionSeries>
			<Track name="Video date and title">
				<Interactive.Div
					name="Video date and title"
					style={{
						position: 'absolute',
						top: 32,
						right: 48,
						fontFamily: 'Arial, Helvetica, sans-serif',
						fontSize: 42,
						fontWeight: 400,
						lineHeight: 1.25,
						color: 'white',
						textAlign: 'right',
						textShadow: '0 0 3px black, 0 1px 5px black',
						whiteSpace: 'pre',
						opacity: interpolate(frame, [175, 192], [1, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
					durationInFrames={192}
				>
					{'November 5, 2020\n"Jonny\'s secret to incredible motion graphics"'}
				</Interactive.Div>
			</Track>
		</AbsoluteFill>
	);
};
