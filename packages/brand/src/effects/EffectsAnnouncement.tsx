import {brightness} from '@remotion/effects/brightness';
import {burlap} from '@remotion/effects/burlap';
import {colorKey} from '@remotion/effects/color-key';
import {dropShadow} from '@remotion/effects/drop-shadow';
import {duotone} from '@remotion/effects/duotone';
import {noise} from '@remotion/effects/noise';
import {tint} from '@remotion/effects/tint';
import {Video} from '@remotion/media';
import {Solid, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {saturation} from '@remotion/effects/saturation';
import {thermalVision} from '@remotion/effects/thermal-vision';

export const EffectsAnnouncement = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<Solid
				width={1280}
				height={720}
				style={{
					position: 'absolute',
				}}
				color={'#c6b67f'}
				effects={[
					burlap({
						amount: 0.77,
						size: 9,
						seed: interpolate(frame, [2, 199], [12, -17], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							posterize: 10,
						}),
					}),
				]}
			/>
			<Video
				src={staticFile(
					'videohive-QnyctXBY-caucasian-woman-greenscreen-cut-out-businesswoman.mp4',
				)}
				style={{
					position: 'absolute',
					translate: '-40.9px -37.2px',
					scale: 1.1,
				}}
				effects={[
					colorKey({
						similarity: 0.45,
					}),
					duotone({}),
					tint({
						color: '#ffe374',
						amount: 0.45,
					}),
					brightness({
						amount: -0.38,
					}),
					dropShadow({
						opacity: 1,
						offsetX: -14,
						radius: 100,
					}),
					noise({
						amount: 0.25,
					}),
					burlap({
						amount: 1,
						size: 8.4,
					}),
					saturation({}),
				]}
			/>
		</>
	);
};
