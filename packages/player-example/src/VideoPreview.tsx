import {usePlaybackTime} from '@remotion/player';
import React, {Suspense, useContext, useEffect} from 'react';
import {Internals} from 'remotion';

export type Props = {
	slides: {
		imageUrl: string;
		caption: string;
		transition: string;
	}[];
};

const Loading: React.FC = () => <h1>Loading…</h1>;

const VideoPreview: React.FC<Props> = ({slides}) => {
	const {setCurrentComposition, currentComposition} = useContext(
		Internals.CompositionManager
	);
	const config = Internals.useUnsafeVideoConfig();
	const video = Internals.useVideo();
	const VideoComponent = video ? video.component : null;
	const [playing] = Internals.Timeline.usePlayingState();
	const [toggle] = usePlaybackTime();

	useEffect(() => {
		if (!currentComposition) {
			setCurrentComposition('car-slideshow');
		}

		if (!config) {
			return;
		}
	}, [config, currentComposition, setCurrentComposition]);

	return (
		<Suspense fallback={Loading}>
			<h1>Remotion Video Player</h1>
			<div
				style={{
					position: 'relative',
					width: config?.width,
					height: config?.height,
					overflow: 'hidden',
				}}
			>
				<button
					style={{
						position: 'absolute',
						left: '10px',
						top: '10px',
						zIndex: 100,
					}}
					onClick={toggle}
				>
					{playing ? 'pause' : 'play'}
				</button>
				{VideoComponent ? (
					<VideoComponent {...(((video?.props as unknown) as {}) ?? {})} />
				) : null}
			</div>
		</Suspense>
	);
};

export default VideoPreview;
