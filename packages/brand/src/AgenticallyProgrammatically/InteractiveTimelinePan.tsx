import {Easing, Img, Interactive, interpolate, useCurrentFrame} from 'remotion';
import {EXPLORE_CAMERA_ANGLE} from '../HomepageAssets/ExploreRemotion/camera-angle';

const InteractiveTimelinePanContent = () => {
	const frame = useCurrentFrame();

	return (
		<Interactive.Div
			name="Homepage timeline screenshot and matching edge colors"
			style={{
				position: 'absolute',
				left: '50%',
				top: '50%',
				width: 2700,
				height: 582,
				maxWidth: 'none',
				scale: 1.8,
				rotate: EXPLORE_CAMERA_ANGLE,
				translate: interpolate(
					frame,
					[0, 153],
					['-550px -291px', '-2150px -291px'],
					{
						easing: Easing.bezier(0.33, 0, 0.67, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				),
				transformOrigin: interpolate(
					frame,
					[0, 153],
					['550px 291px', '2150px 291px'],
					{
						easing: Easing.bezier(0.33, 0, 0.67, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				),
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: -2000,
					top: -2000,
					width: 6700,
					height: 2000,
					backgroundColor: '#202428',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: -2000,
					top: 582,
					width: 6700,
					height: 2000,
					backgroundColor: '#16181b',
				}}
			/>
			<Img
				name="Homepage timeline screenshot"
				src="https://remotion.media/homepage/whats-new-timeline-capture-693f4bc1679c.png"
				style={{position: 'absolute', width: 2700, height: 582}}
			/>
		</Interactive.Div>
	);
};

export const InteractiveTimelinePan = Interactive.create({
	Component: InteractiveTimelinePanContent,
	layout: 'absolute-fill',
	schema: {...Interactive.backgroundSchema},
});
