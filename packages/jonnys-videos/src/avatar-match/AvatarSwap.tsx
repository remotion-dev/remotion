import {
	AbsoluteFill,
	CanvasImage,
	Easing,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import avatarAssets from './assets.json';
import {MatchedAvatar} from './Avatar';

export const AvatarSwap = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const angle = interpolate(frame, [fps, 3 * fps], [0, Math.PI], {
		easing: Easing.bezier(0.42, 0, 0.58, 1),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const horizontal = Math.sin(angle) * 225;
	const depth = Math.cos(angle);

	return (
		<AbsoluteFill style={{backgroundColor: 'white', overflow: 'hidden'}}>
			<CanvasImage
				name="Old portrait — circular orbit"
				src={avatarAssets['reference.png']}
				style={{
					position: 'absolute',
					left: 300,
					top: 300,
					width: 480,
					height: 480,
					borderRadius: '50%',
					overflow: 'hidden',
					backgroundColor: 'white',
					boxShadow: '0 8px 28px rgba(20, 30, 45, 0.1)',
					translate: String(horizontal) + 'px ' + String(depth * 36) + 'px',
					scale: 0.875 + depth * 0.125,
					opacity: interpolate(angle, [0.85 * Math.PI, Math.PI], [1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					zIndex: depth >= 0 ? 2 : 1,
				}}
			/>
			<MatchedAvatar
				name="New portrait — opposite circular orbit"
				style={{
					left: 300,
					top: 300,
					width: 480,
					height: 480,
					backgroundColor: 'white',
					borderRadius: '50%',
					overflow: 'hidden',
					boxShadow: '0 8px 28px rgba(20, 30, 45, 0.1)',
					translate: String(-horizontal) + 'px ' + String(-depth * 36) + 'px',
					scale: 0.875 - depth * 0.125,
					zIndex: depth >= 0 ? 1 : 2,
				}}
			/>
		</AbsoluteFill>
	);
};
