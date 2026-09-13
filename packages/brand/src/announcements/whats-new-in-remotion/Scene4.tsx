import {Video} from '@remotion/media';
import {AbsoluteFill, Sequence, interpolate, useVideoConfig} from 'remotion';
import {assetUrl} from './assets';
import {CodeBRoll} from './CodeBRoll';
import {SILENCES} from './Composition';
import {ImageBRoll} from './ImageBRoll';
import {SlideInOverlay, useSlideInProgress} from './SlideInOverlay';
import {UpperReference} from './UpperReference';
import {VideoBRoll} from './VideoBRoll';

const VERCEL_CODE = `
const { sandboxFilePath } = await renderMediaOnVercel({
  sandbox,
  compositionId: 'MyComp',
  inputProps: { title: 'Hello World' },
});
`.trim();

const FILE = 'whats4.mov';

export const Scene4: React.FC = () => {
	const {fps} = useVideoConfig();
	const silence = SILENCES[FILE];
	const trimBefore = Math.floor(silence.leadingEnd * fps);
	const trimAfter = Math.ceil(silence.trailingStart * fps);

	const TETRA_DURATION = 4.16;
	const SLIDE_OUT = 1;
	const overlayProgress = useSlideInProgress({
		startAt: 0.5,
		holdDuration: TETRA_DURATION - SLIDE_OUT - 2,
	});
	const videoX = interpolate(overlayProgress, [0, 1], [0, -20]);

	return (
		<AbsoluteFill>
			<AbsoluteFill style={{transform: `translateX(${videoX}%)`}}>
				<Video
					src={assetUrl(FILE)}
					trimBefore={trimBefore}
					trimAfter={trimAfter}
				/>
			</AbsoluteFill>
			<SlideInOverlay
				startAt={0.5}
				holdDuration={TETRA_DURATION - SLIDE_OUT - 2}
				backgroundColor="black"
			>
				<AbsoluteFill
					style={{
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<Video
						src={assetUrl('tetrahedron.mp4')}
						muted
						style={{
							height: '100%',
							objectFit: 'contain',
						}}
					/>
				</AbsoluteFill>
			</SlideInOverlay>
			<Sequence
				from={160}
				durationInFrames={Math.round(3 * fps)}
				premountFor={30}
			>
				<AbsoluteFill
					style={{
						backgroundColor: 'black',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<Video
						src={assetUrl('remotion-on-vercel.mp4')}
						muted
						style={{
							height: '100%',
							objectFit: 'contain',
						}}
					/>
				</AbsoluteFill>
			</Sequence>
			<Sequence from={368} durationInFrames={Math.round(4 * fps)} layout="none">
				<ImageBRoll src="vercel-screenshot.png" panY={0} scale={1.12} />
			</Sequence>
			<Sequence from={615} durationInFrames={Math.round(4 * fps)} layout="none">
				<VideoBRoll src="vercel-screen-recording.mov" durationSeconds={4} />
			</Sequence>
			<Sequence from={920} durationInFrames={Math.round(4 * fps)} layout="none">
				<CodeBRoll
					code={VERCEL_CODE}
					lang="ts"
					durationSeconds={4}
					topExplainer="renderMediaOnVercel()"
				/>
			</Sequence>
			<Sequence from={1040} layout="none">
				<UpperReference
					text="The tutorial is out now out on YouTube!"
					fontSize={36}
					durationInFrames={Math.ceil(trimAfter - trimBefore - 1040)}
				/>
			</Sequence>
		</AbsoluteFill>
	);
};
