import {Audio, Video} from '@remotion/media';
import type {ReactNode} from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	Sequence,
	useCurrentFrame,
} from 'remotion';
import {BasicCaptions} from '../basic-captions';

const returnScale = (frame: number) =>
	interpolate(frame, [-7, 7], [1, (1680 / 1920) ** 2], {
		easing: Easing.inOut(Easing.cubic),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		output: 'perceptual-scale',
	});

export const OriginReturnPresenter = ({
	children,
	from,
}: {
	readonly children: ReactNode;
	readonly from: number;
}) => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill
			style={{
				scale: returnScale(frame - from) / (1680 / 1920) ** 2,
				transformOrigin: 'center',
			}}
		>
			{children}
		</AbsoluteFill>
	);
};

const RemotionOriginExchangeContent = () => {
	const frame = useCurrentFrame();
	const zoomInStart = 3;
	const zoomDuration = 14;
	return (
		<>
			<Audio
				name="Rewind into 2020 — React Bits Sound Lab"
				src="https://remotion.media/agentically-programmatically/reactbits-rewind-short-763c30476cd0.wav"
				from={zoomInStart}
				durationInFrames={zoomDuration}
				volume={0.2}
			/>
			<Interactive.Div
				name="William zooms in, then the exchange returns to the white plane"
				style={{
					position: 'absolute',
					inset: 0,
					transformOrigin: 'center',
					scale:
						interpolate(
							frame,
							[0, zoomInStart, zoomInStart + zoomDuration],
							[1680 / 1920, 1680 / 1920, 1],
							{
								easing: Easing.inOut(Easing.cubic),
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								output: 'perceptual-scale',
							},
						) * returnScale(frame - 224),
					boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)',
				}}
			>
				<Video
					name="William and Jonny — November 5, 2020"
					src="https://remotion.media/remotion-prototype-2020/02m03s-finally.mp4"
					trimBefore={89}
					durationInFrames={224}
					muted
					style={{
						position: 'absolute',
						inset: 0,
						width: '100%',
						height: '100%',
					}}
				/>
			</Interactive.Div>
			<Audio
				name="Original exchange — clean speech ending"
				src="https://remotion.media/remotion-prototype-2020/02m03s-finally.mp4"
				trimBefore={100}
				from={11}
				durationInFrames={201}
				volume={interpolate(frame, [11, 13, 208, 212], [0, 0.6, 0.6, 0], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				})}
			/>
			<Sequence
				name="Original exchange captions"
				from={11}
				trimBefore={100}
				durationInFrames={201}
				layout="none"
			>
				<BasicCaptions
					name="William and Jonny's exchange"
					width={1480}
					combineTokensWithinMilliseconds={null}
					style={{position: 'absolute', bottom: 80, translate: '220px 0px'}}
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
							text: 'Well, it’s been a dream of mine for a long time.',
							startMs: 5960,
							endMs: 9930,
							timestampMs: null,
							confidence: null,
						},
					]}
				/>
			</Sequence>
			<Interactive.Div
				name="Original video date and title"
				from={90}
				durationInFrames={119}
				style={{
					position: 'absolute',
					top: 32,
					left: 48,
					fontFamily: 'Arial, Helvetica, sans-serif',
					fontSize: 42,
					fontWeight: 400,
					lineHeight: 1.25,
					color: 'white',
					textAlign: 'left',
					textShadow: '0 0 3px black, 0 1px 5px black',
					whiteSpace: 'pre',
					opacity: interpolate(frame, [90, 98, 201, 209], [0, 1, 1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			>
				{'November 5, 2020\n"Jonny\'s secret to incredible motion graphics"'}
			</Interactive.Div>
		</>
	);
};

export const RemotionOriginExchange = Interactive.create({
	Component: RemotionOriginExchangeContent,
	layout: 'absolute-fill',
	schema: {...Interactive.backgroundSchema},
});
