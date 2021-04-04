import React, {Suspense} from 'react';
import {Internals} from 'remotion';
import {usePlaybackTime} from './PlayPause';

const RootComponent: React.FC = () => {
	const config = Internals.useUnsafeVideoConfig();
	const [toggle] = usePlaybackTime();
	const [playing] = Internals.Timeline.usePlayingState();
	const video = Internals.useVideo();
	const VideoComponent = video ? video.component : null;

	return (
		<Suspense fallback={<h1>Loading...</h1>}>
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
					type="button"
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

export default RootComponent;
