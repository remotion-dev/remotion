import {Video} from '@remotion/media';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {asset} from '../assets';

// lights-06 (IMG_7933 29:00, tracker-stabilized) reframed for 9:16.
// The 1920x1080 clip is scaled to fill the height (3413 x 1920) and the
// visible window keeps you centred (tracked with OpenCV's MIL tracker) until
// the pan carries you out of frame at ~2.8s, then lands on the crowd.
const GreenLaserVerticalInner: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{backgroundColor: 'black', overflow: 'hidden'}}>
			<Video
				name="Green laser over the crowd"
				src={asset('party-suggestions-lights-06-0bda6908023a.mp4')}
				trimBefore={0}
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: 3413,
					height: 1920,
					translate: interpolate(
						frame,
						[0, 24, 42, 54, 60, 66, 72, 78, 86, 94, 105],
						[
							'-1264px 0px',
							'-1290px 0px',
							'-1396px 0px',
							'-1454px 0px',
							'-1605px 0px',
							'-1821px 0px',
							'-2054px 0px',
							'-2299px 0px',
							'-2333px 0px',
							'-527px 0px',
							'-598px 0px',
						],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [
								Easing.inOut(Easing.sin),
								Easing.inOut(Easing.sin),
								Easing.inOut(Easing.sin),
								Easing.inOut(Easing.sin),
								Easing.inOut(Easing.sin),
								Easing.inOut(Easing.sin),
								Easing.inOut(Easing.sin),
								Easing.inOut(Easing.sin),
								Easing.inOut(Easing.sin),
								Easing.inOut(Easing.sin),
							],
						},
					),
				}}
				muted
			/>
		</AbsoluteFill>
	);
};

export const GreenLaserVertical = Interactive.create({
	Component: GreenLaserVerticalInner,
	layout: 'absolute-fill',
});
