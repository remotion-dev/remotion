import {Video} from '@remotion/media';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {assetUrl} from './assets';

export const WebRendererDemo: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'white',
				justifyContent: 'center',
				alignItems: 'center',
				overflow: 'hidden',
			}}
		>
			<Video
				name="Web renderer screen recording"
				src={assetUrl('web-renderer-demo.mp4')}
				muted
				trimBefore={120}
				playbackRate={2}
				style={{
					height: '100%',
					objectFit: 'contain',
					transformOrigin: interpolate(
						frame,
						[227, 257],
						['50% 50%', '100% 0%'],
						{
							easing: Easing.spring({damping: 200}),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					scale: interpolate(frame, [0, 30], [1, 1.5], {
						easing: Easing.spring({damping: 200}),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			/>
		</AbsoluteFill>
	);
};
