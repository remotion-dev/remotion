import {Video} from '@remotion/media';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {assetUrl} from './assets';
import {SILENCES} from './Composition';
import type {EndCardPlatform} from './EndCard';
import {EndCard} from './EndCard';

const FILE = 'whats11.mov';

export const Scene11: React.FC<{platform: EndCardPlatform}> = ({platform}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const silence = SILENCES[FILE];
	const trimBefore = Math.floor(silence.leadingEnd * fps);
	const trimAfter = Math.ceil(silence.trailingStart * fps);

	return (
		<>
			<Video
				name="Presenter video"
				style={{
					translate: interpolate(
						frame,
						[16.73 * fps, 17.73 * fps],
						['0% 0px', '-20% 0px'],
						{
							easing: Easing.out(Easing.cubic),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
				}}
				src={assetUrl(FILE)}
				trimBefore={trimBefore}
				trimAfter={trimAfter}
			/>
			<div
				style={{
					backgroundColor: 'white',
					bottom: 0,
					left: '60%',
					overflow: 'hidden',
					position: 'absolute',
					top: 0,
					translate: interpolate(
						frame,
						[16.73 * fps, 17.73 * fps],
						['102% 0px', '0% 0px'],
						{
							easing: Easing.out(Easing.cubic),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					width: '40%',
				}}
			>
				<EndCard platform={platform} />
			</div>
		</>
	);
};
