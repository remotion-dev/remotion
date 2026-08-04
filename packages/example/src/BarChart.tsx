import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

type ChartItem = {
	label: string;
	value: number;
	color: string;
};

const data: ChartItem[] = [
	{label: 'North', value: 42, color: '#58D6FF'},
	{label: 'South', value: 68, color: '#7C83FF'},
	{label: 'East', value: 55, color: '#C879FF'},
	{label: 'West', value: 87, color: '#FF6DAE'},
	{label: 'Central', value: 74, color: '#FFB45F'},
];

const AnimatedBar: React.FC<{item: ChartItem; index: number}> = ({
	item,
	index,
}) => {
	const frame = useCurrentFrame();
	const start = 35 + index * 8;
	const end = start + 34;
	const height = (item.value / 100) * 286;
	const animatedValue = Math.round(
		interpolate(frame, [start, end], [0, item.value], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: Easing.bezier(0.16, 1, 0.3, 1),
		}),
	);

	return (
		<Interactive.Div
			name={`${item.label} bar`}
			style={{
				height: 350,
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'flex-end',
				alignItems: 'center',
				position: 'relative',
			}}
		>
			<Interactive.Div
				name={`${item.label} value`}
				style={{
					color: '#F8FAFF',
					fontSize: 31,
					fontWeight: 750,
					letterSpacing: -1,
					marginBottom: 12,
					opacity: interpolate(frame, [start + 3, start + 18], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.bezier(0.16, 1, 0.3, 1),
					}),
					translate: interpolate(
						frame,
						[start + 3, start + 18],
						['0px 12px', '0px 0px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.bezier(0.16, 1, 0.3, 1),
						},
					),
				}}
			>
				{animatedValue}%
			</Interactive.Div>
			<Interactive.Div
				name={`${item.label} column`}
				style={{
					width: 100,
					height: interpolate(frame, [start, end], [0, height], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.bezier(0.16, 1, 0.3, 1),
					}),
					borderRadius: '22px 22px 9px 9px',
					background: `linear-gradient(180deg, ${item.color} 0%, ${item.color}B8 100%)`,
					boxShadow:
						item.value === 87
							? `0 0 34px ${item.color}66, inset 0 1px 0 rgba(255,255,255,0.46)`
							: 'inset 0 1px 0 rgba(255,255,255,0.38)',
					border: '1px solid rgba(255,255,255,0.18)',
				}}
			/>
			<Interactive.Div
				name={`${item.label} label`}
				style={{
					position: 'absolute',
					top: 365,
					color: '#ABB4CC',
					fontSize: 23,
					fontWeight: 600,
					letterSpacing: 0.2,
					opacity: interpolate(frame, [start + 8, start + 23], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.bezier(0.16, 1, 0.3, 1),
					}),
				}}
			>
				{item.label}
			</Interactive.Div>
		</Interactive.Div>
	);
};

export const BarChart: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	return (
		<AbsoluteFill
			style={{
				background:
					'radial-gradient(circle at 75% 12%, #202758 0%, #101632 34%, #080D1F 72%)',
				color: 'white',
				fontFamily:
					"Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
				overflow: 'hidden',
			}}
		>
			<Interactive.Div
				name="Ambient glow"
				style={{
					position: 'absolute',
					width: 520,
					height: 520,
					right: -150,
					top: -230,
					borderRadius: 999,
					background: 'rgba(115, 91, 255, 0.18)',
					filter: 'blur(90px)',
					scale: interpolate(frame, [0, durationInFrames - 1], [0.92, 1.08], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.inOut(Easing.sin),
						output: 'perceptual-scale',
					}),
				}}
			/>

			<Interactive.Div
				name="Eyebrow"
				style={{
					position: 'absolute',
					left: 86,
					top: 66,
					color: '#8E9AB8',
					fontSize: 20,
					fontWeight: 750,
					letterSpacing: 4.4,
					textTransform: 'uppercase',
					opacity: interpolate(frame, [3, 20], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.bezier(0.16, 1, 0.3, 1),
					}),
				}}
			>
				Performance overview
			</Interactive.Div>

			<Interactive.Div
				name="Title"
				style={{
					position: 'absolute',
					left: 82,
					top: 91,
					fontSize: 61,
					lineHeight: 1,
					fontWeight: 780,
					letterSpacing: -3.2,
					opacity: interpolate(frame, [5, 26], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.bezier(0.16, 1, 0.3, 1),
					}),
					translate: interpolate(frame, [5, 26], ['0px 22px', '0px 0px'], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.bezier(0.16, 1, 0.3, 1),
					}),
				}}
			>
				Regional growth
			</Interactive.Div>
			<Interactive.Div
				name="Chart panel"
				style={{
					position: 'absolute',
					left: 80,
					right: 80,
					top: 178,
					bottom: 80,
					borderRadius: 34,
					background:
						'linear-gradient(145deg, rgba(255,255,255,0.080), rgba(255,255,255,0.025))',
					border: '1px solid rgba(255,255,255,0.11)',
					boxShadow: '0 28px 80px rgba(0,0,0,0.28)',
					backdropFilter: 'blur(16px)',
					opacity: interpolate(frame, [12, 31], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.bezier(0.16, 1, 0.3, 1),
					}),
					translate: interpolate(frame, [12, 31], ['0px 20px', '0px 0px'], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.bezier(0.16, 1, 0.3, 1),
					}),
				}}
			>
				{[0, 25, 50, 75, 100].map((tick, tickIndex) => (
					<Interactive.Div
						key={tick}
						name={`${tick}% gridline`}
						style={{
							position: 'absolute',
							left: 86,
							right: 36,
							bottom: 67 + tickIndex * 71.5,
							height: 1,
							background: 'rgba(202,211,238,0.11)',
							opacity: interpolate(
								frame,
								[20 + tickIndex * 3, 38 + tickIndex * 3],
								[0, 1],
								{
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
									easing: Easing.bezier(0.16, 1, 0.3, 1),
								},
							),
						}}
					>
						<Interactive.Div
							name={`${tick}% axis label`}
							style={{
								position: 'absolute',
								left: -55,
								top: -11,
								width: 40,
								textAlign: 'right',
								color: '#69738F',
								fontSize: 17,
								fontWeight: 650,
							}}
						>
							{tick}
						</Interactive.Div>
					</Interactive.Div>
				))}

				<Interactive.Div
					name="Bars"
					style={{
						position: 'absolute',
						left: 107,
						right: 46,
						bottom: 67,
						height: 390,
						display: 'grid',
						gridTemplateColumns: 'repeat(5, 1fr)',
						columnGap: 35,
						alignItems: 'end',
					}}
				>
					{data.map((item, index) => (
						<AnimatedBar key={item.label} item={item} index={index} />
					))}
				</Interactive.Div>
			</Interactive.Div>

			<Interactive.Div
				name="Peak badge"
				style={{
					position: 'absolute',
					right: 94,
					top: 91,
					display: 'flex',
					alignItems: 'center',
					gap: 11,
					padding: '11px 18px',
					borderRadius: 999,
					background: 'rgba(255,109,174,0.13)',
					border: '1px solid rgba(255,109,174,0.25)',
					color: '#FF9BC8',
					fontSize: 18,
					fontWeight: 720,
					opacity: interpolate(frame, [82, 101], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.bezier(0.16, 1, 0.3, 1),
					}),
					scale: interpolate(frame, [82, 101], [0.86, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.spring({damping: 18}),
						output: 'perceptual-scale',
					}),
				}}
			>
				<span style={{fontSize: 13}}>●</span> West leads at 87%
			</Interactive.Div>
		</AbsoluteFill>
	);
};
