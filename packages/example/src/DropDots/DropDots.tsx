import {linearGradient} from 'polished';
import {
	Img,
	interpolate,
	random,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const gradients = [
	['#845ec2', '#ff5e78'],
	['rgb(40, 150, 114)', '#e6dd3b'],
	['#e48900', '#be0000'],
	['#fff600', '#f48b2a'],
	['#23689b', '#487e95'],
	['#9d0391', '#120078'],
];

const DropDots: React.FC<{
	opacity: number;
	volume: number;
}> = ({opacity, volume}) => {
	const frame = useCurrentFrame();

	const cycle = 15;
	const iteration = Math.floor(frame / cycle);
	const {height, width} = useVideoConfig();
	const dots = new Array(45).fill(true).map((_x, i) => {
		const startX = random(`x-${i}-${iteration}`) * width;
		const startY = random(`y-${i}-${iteration}`) * height;
		const startRotation = random(`rotation-${i}-${iteration}`) * 360;
		return {
			startX,
			endX:
				startX +
				interpolate(random(`x-end-${i}-${iteration}`), [0, 1], [-600, 600]),
			startY,
			endY:
				startY +
				interpolate(random(`y-end-${i}-${iteration}`), [0, 1], [-600, 600]),
			startRotation,
			endRotation:
				startRotation +
				interpolate(random(`rotatad-${i}`), [0, 1], [-180, 180]),
			size: interpolate(
				random(`size-${i}-${iteration}`),
				[0, 0.9, 0.901, 1],
				[40, 40, 160, 160],
			),

			background:
				gradients[
					Math.floor(random(`color-${i}-${iteration}`) * gradients.length)
				],
			opacity: interpolate(
				random(`opacity-${i}-${iteration}`),
				[0, 1],
				[0.83, 0.95],
			),
			gradId: random(`gradient-${i}-${iteration}`),
			hasShine: random(`shine-${i}`) > 0.6,
			shineOpacity: random(`shine-opacity-${i}-${iteration}`) * 0.7,
		};
	});
	const progress = interpolate(frame % cycle, [0, cycle], [0, 1]);
	return (
		<div style={{width, height, opacity}}>
			{dots.map((d) => {
				const left = interpolate(progress, [0, 1], [d.startX, d.endX]);
				const top = interpolate(progress, [0, 1], [d.startY, d.endY]);
				const rotate = interpolate(
					progress,
					[0, 1],
					[d.startRotation, d.endRotation],
				);
				return (
					<div
						style={{
							position: 'absolute',
							left,
							top,
							transform: `rotate(${rotate}deg)`,
						}}
					>
						<svg
							style={{
								width: d.size * 2,
								height: d.size * 40,
								position: 'absolute',
								top: 0,
							}}
							preserveAspectRatio="none"
							viewBox="0 0 200 4000"
						>
							<defs>
								<filter id="f1" x="0" y="0">
									<feGaussianBlur in="SourceGraphic" stdDeviation="10" />
								</filter>
								<linearGradient id={`${d.gradId}`}>
									<stop
										stopColor={d.background[0]}
										stopOpacity={d.shineOpacity * volume}
										offset={0}
									/>
									<stop
										stopColor={d.background[1]}
										stopOpacity={0.11 * volume}
										offset={1}
									/>
								</linearGradient>
							</defs>
							{d.hasShine ? (
								<path
									d="M 50 50 L 0 4000 L 200 4000 z"
									fill={`url(#${d.gradId})`}
									filter="url(#f1)"
								/>
							) : null}
						</svg>
						<div
							style={{
								height: d.size,
								width: d.size,
								borderRadius: d.size / 2,
								opacity: d.opacity,
								zIndex: d.size,
								...linearGradient({
									colorStops: d.background,
								}),
								boxShadow: `0 0 60px ${
									linearGradient({
										colorStops: d.background,
									}).backgroundColor
								}`,
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<Img
								style={{
									height: (d.size / 3) * 2,
									width: (d.size / 3) * 2,
									marginLeft: d.size * 0.05,
									opacity: 0.55,
								}}
								src="https://github.com/remotion-dev/brand/blob/main/withouttitle/element-0.png?raw=true"
							/>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default DropDots;
