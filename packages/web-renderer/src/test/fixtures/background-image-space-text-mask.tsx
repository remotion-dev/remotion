import {AbsoluteFill} from 'remotion';
import {spaceRaster32} from './background-image-url-space';

export const createSpaceTextMask = (backgroundColor: string) => ({
	id: 'space-text-mask',
	width: 320,
	height: 100,
	fps: 25,
	durationInFrames: 1,
	component: () => (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<div
				style={{
					width: 320,
					height: 100,
					fontFamily: 'Arial',
					fontSize: 90,
					fontWeight: 900,
					lineHeight: '100px',
					backgroundColor,
					backgroundImage: `url("${spaceRaster32}")`,
					backgroundRepeat: 'space',
					backgroundSize: '32px 32px',
					backgroundClip: 'text',
					WebkitBackgroundClip: 'text',
					color: 'transparent',
				}}
			>
				MASK
			</div>
		</AbsoluteFill>
	),
});

export const spaceTextMaskTransparent = createSpaceTextMask('transparent');
export const spaceTextMaskWhite = {
	...createSpaceTextMask('white'),
	id: 'space-text-mask-white',
};
