import {Video} from '@remotion/media';
import {
	AbsoluteFill,
	Sequence,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {assetUrl} from './assets';
import {SILENCES} from './Composition';
import {ImageBRoll} from './ImageBRoll';
import {NumberedChapter} from './NumberedChapter';
import {SlideInOverlay, useSlideInProgress} from './SlideInOverlay';

const FILE = 'whats3.mov';

const SFX_URLS = [
	'https://remotion.media/whip.wav',
	'https://remotion.media/whoosh.wav',
	'https://remotion.media/page-turn.wav',
	'https://remotion.media/switch.wav',
	'https://remotion.media/mouse-click.wav',
	'https://remotion.media/shutter-modern.wav',
	'https://remotion.media/shutter-old.wav',
	'https://remotion.media/ding.wav',
	'https://remotion.media/bruh.wav',
	'https://remotion.media/vine-boom.wav',
	'https://remotion.media/windows-xp-error.wav',
];

// Repeat URLs enough to fill scroll
const REPEATED_URLS = [0, 1, 2, 3].flatMap((repetition) =>
	SFX_URLS.map((url) => ({id: `${repetition}-${url}`, url})),
);

const SfxUrlList: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const LINE_HEIGHT = 160;
	const SCROLL_SPEED = 40; // pixels per second

	const scrollY = -(frame / fps) * SCROLL_SPEED;

	const FADE_HEIGHT = 200;

	return (
		<AbsoluteFill style={{backgroundColor: 'white', overflow: 'hidden'}}>
			<div
				style={{
					transform: `translateY(${scrollY}px)`,
					padding: '80px 40px',
				}}
			>
				{REPEATED_URLS.map(({id, url}) => (
					<div
						key={id}
						style={{
							fontFamily: 'GT Planar',
							fontSize: 38,
							fontWeight: 500,
							color: '#333',
							height: LINE_HEIGHT,
							display: 'flex',
							alignItems: 'center',
							whiteSpace: 'nowrap',
							borderBottom: '1px solid #e0e0e0',
							marginLeft: -40,
							marginRight: -40,
							paddingLeft: 40,
						}}
					>
						{url.replace('https://', '')}
					</div>
				))}
			</div>
			{/* Top fade mask */}
			<AbsoluteFill
				style={{
					height: FADE_HEIGHT,
					bottom: 'auto',
					background:
						'linear-gradient(to bottom, white, rgba(255, 255, 255, 0))',
					pointerEvents: 'none',
				}}
			/>
			{/* Bottom fade mask */}
			<AbsoluteFill
				style={{
					height: FADE_HEIGHT,
					top: 'auto',
					background: 'linear-gradient(to top, white, rgba(255, 255, 255, 0))',
					pointerEvents: 'none',
				}}
			/>
		</AbsoluteFill>
	);
};

export const Scene3: React.FC = () => {
	const {fps} = useVideoConfig();
	const silence = SILENCES[FILE];
	const trimBefore = Math.floor(silence.leadingEnd * fps);
	const trimAfter = Math.ceil(silence.trailingStart * fps);

	// Combine progress from both overlays to shift background
	const overlay1Progress = useSlideInProgress({startAt: 0.5});
	const overlay2Progress = useSlideInProgress({
		startAt: 590 / fps,
		slideInDuration: 1,
		holdDuration: 3.5,
		slideOutDuration: 1,
	});
	const combinedProgress = Math.max(overlay1Progress, overlay2Progress);
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
			<SlideInOverlay startAt={0.5}>
				<NumberedChapter chapterNumber={2} chapterTitle="Sound Effects" />
			</SlideInOverlay>
			<Sequence from={440} durationInFrames={Math.round(4 * fps)} layout="none">
				<ImageBRoll src="sfx-screenshot.png" />
			</Sequence>
			<Sequence from={590} layout="none">
				<SlideInOverlay startAt={0}>
					<SfxUrlList />
				</SlideInOverlay>
			</Sequence>
		</AbsoluteFill>
	);
};
