import React, {Suspense} from 'react';
import {Internals} from 'remotion';
import {usePlaybackTime} from './PlayPause';

const RootComponent: React.FC<{
	controls: boolean;
	style?: React.CSSProperties;
}> = ({controls, style}) => {
	const config = Internals.useUnsafeVideoConfig();
	const [toggle] = usePlaybackTime();
	const [playing] = Internals.Timeline.usePlayingState();
	const video = Internals.useVideo();
	const VideoComponent = video ? video.component : null;

	return (
		<Suspense fallback={<h1>Loading...</h1>}>
			<div
				style={
					style
						? style
						: {
								position: 'relative',
								width: config?.width,
								height: config?.height,
								overflow: 'hidden',
						  }
				}
			>
				{controls ? (
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
				) : null}
				{VideoComponent ? (
					<VideoComponent {...(((video?.props as unknown) as {}) ?? {})} />
				) : null}
			</div>
		</Suspense>
	);
};

export default RootComponent;
