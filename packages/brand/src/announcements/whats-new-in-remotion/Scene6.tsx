import {Video} from '@remotion/media';
import {AbsoluteFill, Sequence, interpolate, useVideoConfig} from 'remotion';
import {assetUrl} from './assets';
import {SILENCES} from './Composition';
import {NumberedChapter} from './NumberedChapter';
import {SlideInOverlay, useSlideInProgress} from './SlideInOverlay';
import {UpperReference} from './UpperReference';
import {WebRendererDemo} from './WebRendererDemo';

const FILE = 'whats6.mov';

const CSS_PROPERTIES = [
	'border-style',
	'border-width',
	'border-color',
	'box-shadow',
	'text-shadow',
	'font-style',
	'object-fit',
	'filter',
	'paint-order',
	'-webkit-text-stroke',
];

const CssPropertyList: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'white',
				flexDirection: 'column',
				display: 'flex',
				padding: '0 40px',
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontFamily: 'GT Planar',
					fontSize: 32,
					fontWeight: 700,
					color: '#111',
					borderBottom: '1px solid #e0e0e0',
					height: 80,
					flexShrink: 0,
				}}
			>
				New CSS Properties
			</div>
			{CSS_PROPERTIES.map((prop, i) => (
				<div
					key={prop}
					style={{
						flex: 1,
						display: 'flex',
						alignItems: 'center',
						fontFamily: 'GT Planar',
						fontSize: 28,
						fontWeight: 500,
						color: '#333',
						borderBottom:
							i < CSS_PROPERTIES.length - 1 ? '1px solid #e0e0e0' : 'none',
						paddingLeft: 24,
					}}
				>
					{prop}
				</div>
			))}
		</AbsoluteFill>
	);
};

export const Scene6: React.FC = () => {
	const {fps} = useVideoConfig();
	const silence = SILENCES[FILE];
	const trimBefore = Math.floor(silence.leadingEnd * fps);
	const trimAfter = Math.ceil(silence.trailingStart * fps);
	const sceneDuration = silence.trailingStart - silence.leadingEnd;
	const listStartAt = sceneDuration - 3 - 1; // 5s before end, minus 1s for slide-in

	const overlayProgress = useSlideInProgress({startAt: 0.5, holdDuration: 2.5});
	const overlay2Progress = useSlideInProgress({startAt: listStartAt});
	const combinedProgress = Math.max(overlayProgress, overlay2Progress);
	const videoX = interpolate(combinedProgress, [0, 1], [0, -20]);

	return (
		<AbsoluteFill>
			<AbsoluteFill style={{transform: `translateX(${videoX}%)`}}>
				<Video
					src={assetUrl(FILE)}
					trimBefore={trimBefore}
					trimAfter={trimAfter}
				/>
			</AbsoluteFill>
			<SlideInOverlay startAt={0.5} holdDuration={2.5}>
				<NumberedChapter chapterNumber={5} chapterTitle="Web Renderer Update" />
			</SlideInOverlay>
			<Sequence
				from={180}
				durationInFrames={Math.round(15 * fps)}
				premountFor={30}
			>
				<WebRendererDemo />
			</Sequence>
			<Sequence from={190} layout="none">
				<UpperReference
					text="Fun fact: This video was edited with Claude Code and rendered completely client-side!"
					fontSize={30}
					maxWidth={800}
					durationInFrames={Math.round(5 * fps)}
				/>
			</Sequence>
			<Sequence from={Math.round(listStartAt * fps)} layout="none">
				<SlideInOverlay startAt={0}>
					<CssPropertyList />
				</SlideInOverlay>
			</Sequence>
		</AbsoluteFill>
	);
};
