import React, {Suspense, useContext, useEffect} from 'react';
import {Internals} from 'remotion';
import {usePlaybackTime} from './PlayPause';

const Loading: React.FC = () => <h1>Loading…</h1>;

const RemotionRootComponent: React.FC<{id: string}> = ({id}) => {
	const {setCurrentComposition, currentComposition} = useContext(
		Internals.CompositionManager
	);
	const config = Internals.useUnsafeVideoConfig();
	const [toggle] = usePlaybackTime();
	const [playing] = Internals.Timeline.usePlayingState();
	const video = Internals.useVideo();
	const VideoComponent = video ? video.component : null;

	useEffect(() => {
		if (!currentComposition) {
			setCurrentComposition(id);
		}

		if (!config) {
			return;
		}
	}, [config, currentComposition, setCurrentComposition]);

	console.log(currentComposition, 'video');

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

export default RemotionRootComponent;
