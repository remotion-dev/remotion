import {StudioInternals} from '@remotion/studio';
import React, {useEffect, useMemo} from 'react';
import {
	AbsoluteFill,
	OffthreadVideo,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const fps = 25;
const src = 'https://remotion.media/BigBuckBunny.mp4#t=0,';
const premountFor = 1.5 * fps;

type Cut = {
	id: string;
	durationInFrames: number;
	videoStartFromInSeconds: number;
};

const cuts: Cut[] = [
	{id: 'cut-00', durationInFrames: 49, videoStartFromInSeconds: 0},
	{id: 'cut-01', durationInFrames: 236, videoStartFromInSeconds: 1.96},
	{id: 'cut-02', durationInFrames: 29, videoStartFromInSeconds: 11.4},
	{id: 'cut-03', durationInFrames: 20, videoStartFromInSeconds: 12.56},
	{id: 'cut-04', durationInFrames: 29, videoStartFromInSeconds: 13.36},
	{id: 'cut-05', durationInFrames: 45, videoStartFromInSeconds: 14.52},
	{id: 'cut-06', durationInFrames: 138, videoStartFromInSeconds: 16.32},
	{id: 'cut-07', durationInFrames: 77, videoStartFromInSeconds: 21.84},
	{id: 'cut-08', durationInFrames: 165, videoStartFromInSeconds: 24.92},
	{id: 'cut-09', durationInFrames: 20, videoStartFromInSeconds: 31.52},
	{id: 'cut-10', durationInFrames: 267, videoStartFromInSeconds: 32.32},
	{id: 'cut-11', durationInFrames: 52, videoStartFromInSeconds: 43},
	{id: 'cut-12', durationInFrames: 48, videoStartFromInSeconds: 45.08},
	{id: 'cut-13', durationInFrames: 57, videoStartFromInSeconds: 47},
	{id: 'cut-14', durationInFrames: 43, videoStartFromInSeconds: 49.28},
	{id: 'cut-15', durationInFrames: 61, videoStartFromInSeconds: 51},
	{id: 'cut-16', durationInFrames: 75, videoStartFromInSeconds: 53.44},
	{id: 'cut-17', durationInFrames: 9, videoStartFromInSeconds: 56.44},
	{id: 'cut-18', durationInFrames: 399, videoStartFromInSeconds: 56.8},
	{id: 'cut-19', durationInFrames: 1, videoStartFromInSeconds: 72.76},
	{id: 'cut-20', durationInFrames: 461, videoStartFromInSeconds: 72.8},
];

const cutsWithTimeline = cuts.reduce<
	(Cut & {
		from: number;
	})[]
>((acc, cut) => {
	const previous = acc[acc.length - 1];
	const from = previous ? previous.from + previous.durationInFrames : 0;

	acc.push({
		...cut,
		from,
	});

	return acc;
}, []);

const durationInFrames = cutsWithTimeline.reduce((acc, cut) => {
	return acc + cut.durationInFrames;
}, 0);

const InstrumentedOffthreadVideo: React.FC<{
	cut: Cut & {
		from: number;
	};
}> = ({cut}) => {
	useEffect(() => {
		const startedAt = performance.now();
		console.log(
			'[issue-7562] video_wrapper_mount',
			`id=${cut.id}`,
			`from=${cut.from}`,
			`startFrom=${cut.videoStartFromInSeconds}`,
		);

		return () => {
			console.log(
				'[issue-7562] video_wrapper_unmount',
				`id=${cut.id}`,
				`from=${cut.from}`,
				`dt=${Math.round(performance.now() - startedAt)}`,
			);
		};
	}, [cut]);

	return (
		<OffthreadVideo
			crossOrigin="anonymous"
			muted
			pauseWhenBuffering
			playbackRate={1}
			src={src}
			startFrom={Math.round(cut.videoStartFromInSeconds * fps)}
			style={{
				height: '100%',
				objectFit: 'cover',
				width: '100%',
			}}
			toneMapped={false}
			volume={() => 1}
		/>
	);
};

const Component: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames: compositionDurationInFrames} = useVideoConfig();
	const activeCut = useMemo(() => {
		return cutsWithTimeline.find((cut) => {
			return frame >= cut.from && frame < cut.from + cut.durationInFrames;
		});
	}, [frame]);

	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			{cutsWithTimeline.map((cut) => (
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
