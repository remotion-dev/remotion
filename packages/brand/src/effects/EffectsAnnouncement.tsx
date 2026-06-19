import {burlap} from '@remotion/effects/burlap';
import {colorKey} from '@remotion/effects/color-key';
import {Video} from '@remotion/media';
import {Solid, interpolate, staticFile, useCurrentFrame} from 'remotion';

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
				color={'#ffffff'}
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
					translate: '-126.6px -37.2px',
					scale: 1.1,
				}}
				effects={[
					colorKey({
						similarity: 0.45,
					}),
				]}
			/>
		</>
	);
};
