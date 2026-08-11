import {StudioInternals} from '@remotion/studio';
import React, {useMemo} from 'react';
import {
	AbsoluteFill,
	OffthreadVideo,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const fps = 25;
const src =
	'https://cdn.realoficial.com.br/shorts/01ks841xnddqfccpjxkaqp4jnk/01ks84dcvkkwak4pvfa82tr2b3_preview.mp4?v=20260522152242';
const premountFor = 1.5 * fps;

type Cut = {
	id: string;
	from: number;
	durationInFrames: number;
	videoStartFromInSeconds: number;
	cropLeft: number;
	cropTop: number;
	cropRight: number;
	cropBottom: number;
};

const cuts: Cut[] = [
	{
		id: 'eYYNflyP',
		from: 0,
		durationInFrames: 49,
		videoStartFromInSeconds: 0,
		cropLeft: 0.35,
		cropTop: 0,
		cropRight: 0.33,
		cropBottom: 0,
	},
	{
		id: 'dMcoqh8Z',
		from: 49,
		durationInFrames: 236,
		videoStartFromInSeconds: 1.96,
		cropLeft: 0.35,
		cropTop: 0,
		cropRight: 0.33,
		cropBottom: 0,
	},
];

const getCropObjectPosition = (cut: Cut) => {
	const horizontalCrop = cut.cropLeft + cut.cropRight;
	const verticalCrop = cut.cropTop + cut.cropBottom;
	const x = horizontalCrop === 0 ? 50 : (cut.cropLeft / horizontalCrop) * 100;
	const y = verticalCrop === 0 ? 50 : (cut.cropTop / verticalCrop) * 100;

	return `${x}% ${y}%`;
};

const durationInFrames = cuts.reduce((acc, cut) => {
	return Math.max(acc, cut.from + cut.durationInFrames);
}, 0);

const InstrumentedOffthreadVideo: React.FC<{
	cut: Cut;
}> = ({cut}) => {
	return (
		<OffthreadVideo
			pauseWhenBuffering
			src={src}
			trimBefore={Math.round(cut.videoStartFromInSeconds * fps)}
			style={{
				height: '100%',
				objectFit: 'cover',
				objectPosition: getCropObjectPosition(cut),
				width: '100%',
			}}
		/>
	);
};

const Component: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames: compositionDurationInFrames} = useVideoConfig();
	const activeCut = useMemo(() => {
		return cuts.find((cut) => {
			return frame >= cut.from && frame < cut.from + cut.durationInFrames;
		});
	}, [frame]);

	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			{cuts.map((cut) => (
				<Sequence
					key={cut.id}
					from={cut.from}
					durationInFrames={cut.durationInFrames}
					premountFor={premountFor}
					styleWhilePremounted={{display: 'block'}}
				>
					<InstrumentedOffthreadVideo cut={cut} />
				</Sequence>
			))}
			<AbsoluteFill
				style={{
					alignItems: 'flex-start',
					color: 'white',
					display: 'flex',
					fontFamily: 'monospace',
					fontSize: 34,
					justifyContent: 'flex-end',
					padding: 40,
					textShadow: '0 2px 8px black',
				}}
			>
				<div>
					<div>Issue #7562 OffthreadVideo cuts</div>
					<div>
						frame {frame} / {compositionDurationInFrames}
					</div>
					<div>
						{activeCut
							? `${activeCut.id}: from ${activeCut.from}, duration ${activeCut.durationInFrames}, start ${activeCut.videoStartFromInSeconds}s`
							: 'No active cut'}
					</div>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const Issue7562OffthreadVideoCuts = StudioInternals.createComposition({
	component: Component,
	id: 'issue-7562-offthread-video-cuts',
	width: 1080,
	height: 1920,
	fps,
	durationInFrames,
});
