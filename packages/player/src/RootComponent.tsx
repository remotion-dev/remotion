import React, {Suspense, useMemo, useRef} from 'react';
import {Internals} from 'remotion';
import {Controls} from './PlayerControls';
import {useHoverState} from './use-hover-state';

const RootComponent: React.FC<{
	controls: boolean;
	style?: Omit<React.CSSProperties, 'width' | 'height'>;
}> = ({controls, style}) => {
	const config = Internals.useUnsafeVideoConfig();
	const video = Internals.useVideo();
	const container = useRef<HTMLDivElement>(null);
	const hovered = useHoverState(container);

	const VideoComponent = video ? video.component : null;

	const containerStyle: React.CSSProperties = useMemo(() => {
		if (!config) {
			return {};
		}
		return {
			position: 'relative',
			width: config.width,
			height: config.height,
			overflow: 'hidden',
			...style,
		};
	}, [config, style]);

	if (!config) {
		return null;
	}

	return (
		<Suspense fallback={<h1>Loading...</h1>}>
			<div ref={container} style={containerStyle}>
				{VideoComponent ? (
					<VideoComponent {...(((video?.props as unknown) as {}) ?? {})} />
				) : null}
				{controls ? (
					<Controls
						fps={config.fps}
						durationInFrames={config.durationInFrames}
						hovered={hovered}
					/>
				) : null}
			</div>
		</Suspense>
	);
};

export default RootComponent;
