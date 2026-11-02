import {linearProgressiveBlur} from '@remotion/effects/linear-progressive-blur';
import {
	AbsoluteFill,
	Composition,
	HtmlInCanvas,
	Interactive,
	useVideoConfig,
} from 'remotion';
import {RenderOnWebCaptureComposition} from './RenderOnWebCaptureComposition';

export const RenderOnWebPreview = () => {
	const {fps} = useVideoConfig();

	return (
		<AbsoluteFill showInTimeline={false} style={{backgroundColor: '#1f2427'}}>
			<HtmlInCanvas
				width={1920}
				height={1080}
				effects={[
					linearProgressiveBlur({
						end: [0.09, -0.121],
						start: [0.471, 0.38],
						endBlur: 25,
					}),
				]}
			>
				<AbsoluteFill
					name="Re-imported browser-render capture"
					style={{
						width: 1596,
						height: 1440,
						translate: '-510.4px -180px',
						scale: 1.384,
						rotate: '-0.177364 0.926222 0.332648 27.792007deg',
					}}
					from={(-99 / 60) * fps}
					playbackRate={0.7}
				>
					<RenderOnWebCaptureComposition />
				</AbsoluteFill>
			</HtmlInCanvas>
		</AbsoluteFill>
	);
};

const StudioRenderOnWebContent = () => {
	const {fps, width, height} = useVideoConfig();

	return (
		<AbsoluteFill
			name="Client-side render menu - close-up"
			style={{
				width: 1596,
				height: 1440,
				left: '50%',
				top: '50%',
				translate: '-1280px -630px',
				transformOrigin: '1280px 630px',
				rotate: '0deg',
				scale: 4.2 * Math.min(width / 2560, height / 1600),
			}}
		>
			<AbsoluteFill
				name="Choose client-side rendering - corrected cursor"
				trimBefore={(58 / 30) * fps}
				durationInFrames={(52 / 30) * fps}
				playbackRate={4}
			>
				<RenderOnWebCaptureComposition />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const StudioRenderOnWeb = Interactive.create({
	Component: StudioRenderOnWebContent,
	layout: 'absolute-fill',
	schema: {...Interactive.backgroundSchema},
});

export const RenderOnWeb = () => {
	return (
		<Composition
			id="RenderOnWeb"
			component={RenderOnWebPreview}
			width={1920}
			height={1080}
			fps={60}
			durationInFrames={250}
		/>
	);
};
