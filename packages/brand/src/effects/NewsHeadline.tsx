import {vignette} from '@remotion/effects/vignette';
import {
	HtmlInCanvas,
	Img,
	Solid,
	staticFile,
	interpolate,
	useCurrentFrame,
	Easing,
} from 'remotion';
import {linearProgressiveBlur} from '@remotion/effects/linear-progressive-blur';
import {noise} from '@remotion/effects/noise';

export const NewsHeadline = () => {
	const frame = useCurrentFrame();
	return (
		<HtmlInCanvas
			width={1280}
			height={720}
			effects={[
				noise({
					amount: 0.39,
					premultiply: true,
				}),
				linearProgressiveBlur({
					end: [0.799, -0.014],
					start: [0.5, 0.5],
				}),
				linearProgressiveBlur({
					end: [-0.098, 1.202],
					start: [0.456, 0.52],
				}),
				vignette({
					radius: 0.84,
					amount: 0.46,
					color: '#030013',
				}),
			]}
			style={{
				scale: 1,
				transformOrigin: interpolate(frame, [81, 104], ['50% 50%', '50% 50%'], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				}),
			}}
		>
			<Solid
				width={1280}
				height={720}
				style={{
					position: 'absolute',
				}}
				color={'#ffffff'}
				showInTimeline={false}
			/>
			<Img
				src={staticFile('Screenshot 2026-06-17 at 14.40.23.png')}
				style={{
					position: 'absolute',
					translate: '362.7px 264.2px',
					scale: interpolate(frame, [22, 179], [1.54, 1.711], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: [Easing.bezier(0, 0, 0.58, 1)],
					}),
				}}
				width={966}
				height={380}
				showInTimeline={false}
			/>
		</HtmlInCanvas>
	);
};
