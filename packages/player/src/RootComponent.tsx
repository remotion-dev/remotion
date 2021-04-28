import React, {Suspense} from 'react';
import {Internals} from 'remotion';
import {usePlaybackTime} from './PlayPause';

const RootComponent: React.FC<{
	controls: boolean;
	style?: Omit<React.CSSProperties, 'width' | 'height'>;
}> = ({controls, style}) => {
	const config = Internals.useUnsafeVideoConfig();
	const [toggle] = usePlaybackTime();
	const [playing] = Internals.Timeline.usePlayingState();
	const video = Internals.useVideo();
	const VideoComponent = video ? video.component : null;

	return (
		<Suspense fallback={<h1>Loading...</h1>}>
			<div
				style={{
					position: 'relative',
					width: config?.width,
					height: config?.height,
					overflow: 'hidden',
					...style,
				}}
			>
				{controls ? (
					<button
						type="button"
						style={{
							position: 'absolute',
							left: '50%',
							bottom: '10px',
							zIndex: 100,
							transform: 'translateX(-50%)',
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
