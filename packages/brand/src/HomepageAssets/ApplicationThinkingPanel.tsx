import {loadFont} from '@remotion/fonts';
import {
	Easing,
	interpolate,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

loadFont({
	family: 'GT Planar',
	url: staticFile('GT Planar/GT-Planar-Medium.woff2'),
	weight: '500',
});

export const ApplicationThinkingPanel = ({
	contentTop,
}: {
	contentTop: number;
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const time = frame / fps;
	const shineProgress = (Math.max(0, time - 1.4) % 2) / 2;

	return (
		<div
			style={{
				width: '100%',
				height: '100%',
				backgroundColor: '#15181d',
				boxSizing: 'border-box',
				fontFamily: 'GT Planar',
				fontWeight: 500,
				color: '#e5e7eb',
				overflow: 'hidden',
				position: 'relative',
			}}
		>
			<div
				style={{
					position: 'absolute',
					right: 28,
					top: contentTop,
					color: '#f1f3f5',
					fontSize: 44,
					backgroundColor: '#30343c',
					border: '2px solid #454b54',
					borderRadius: 24,
					lineHeight: 1.25,
					width: 360,
					height: 172,
					boxSizing: 'border-box',
					textAlign: 'right',
					padding: '26px 28px',
					translate: interpolate(
						time,
						[0.4, 28 / 30],
						[`0px ${532 - contentTop}px`, '0px 0px'],
						{
							easing: Easing.spring({damping: 200}),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					scale: interpolate(time, [0.4, 28 / 30], [0.86, 1], {
						easing: Easing.spring({damping: 200}),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					transformOrigin: '100% 100%',
					opacity: interpolate(time, [0.4, 0.8], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			>
				<div>Animate from</div>
				<div>NY to LA</div>
			</div>
			<div
				style={{
					position: 'absolute',
					left: 28,
					top: contentTop + 222,
					fontSize: 44,
					color: '#9299a6',
					opacity: interpolate(
						time,
						[1.4, 1.8, 119 / 30, 131 / 30],
						[0, 1, 1, 0],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					translate: interpolate(time, [1.4, 1.8], ['0px 8px', '0px 0px'], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			>
				Thinking
				<span
					style={{
						position: 'absolute',
						inset: 0,
						color: 'transparent',
						backgroundImage:
							'linear-gradient(90deg, transparent 34%, rgba(255, 255, 255, 0.8) 50%, transparent 66%)',
						backgroundSize: '220% 100%',
						backgroundPosition: `${140 - shineProgress * 180}% 0`,
						backgroundClip: 'text',
						WebkitBackgroundClip: 'text',
					}}
				>
					Thinking
				</span>
			</div>
			<div
				style={{
					position: 'absolute',
					left: 28,
					top: contentTop + 222,
					fontSize: 44,
				}}
			>
				{['Do', 'ne', '.'].map((token, index) => (
					<span
						key={token}
						style={{
							opacity: interpolate(
								time,
								[(130 + index * 3) / 30, (131 + index * 3) / 30],
								[0, 1],
								{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
							),
						}}
					>
						{token}
					</span>
				))}
			</div>
			<div
				style={{
					position: 'absolute',
					left: 28,
					right: 28,
					bottom: 28,
					height: 104,
					borderRadius: 52,
					backgroundColor: '#30343c',
					border: '2px solid #454b54',
					boxSizing: 'border-box',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'flex-end',
					padding: 10,
				}}
			>
				<div
					style={{
						width: 80,
						height: 80,
						borderRadius: 40,
						backgroundColor: '#0b84f3',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						scale: interpolate(time, [0.4, 17 / 30, 28 / 30], [1, 0.88, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				>
					<svg width={30} height={42} viewBox="0 0 384 512" fill="white">
						<path d="M214.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 109.3 160 480c0 17.7 14.3 32 32 32s32-14.3 32-32l0-370.7 105.4 105.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z" />
					</svg>
				</div>
			</div>
		</div>
	);
};
