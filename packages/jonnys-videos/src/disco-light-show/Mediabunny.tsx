import React from 'react';
import {
	Interactive,
	useVideoConfig,
	CanvasImage,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {asset} from './assets';

const MediabunnyInner: React.FC = () => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();
	return (
		<>
			<CanvasImage
				premountFor={fps}
				src={asset('mediabunny-logo.png')}
				style={{
					position: 'absolute',
					translate: '105px 527.5px',
					width: 870,
					height: 865,
					opacity: interpolate(frame, [0, 8, 17, 26], [0, 0.1, 0.1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					scale: interpolate(frame, [0, 26], [1, 2.5], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'extend',
						output: 'perceptual-scale',
					}),
				}}
			/>
		</>
	);
};

export const Mediabunny = Interactive.withSchema({
	Component: MediabunnyInner,
	componentName: 'Mediabunny',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});
