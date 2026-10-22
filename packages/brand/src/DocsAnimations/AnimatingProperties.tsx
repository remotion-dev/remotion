import {useId, useMemo} from 'react';
import {
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
	type InteractivitySchema,
} from 'remotion';

type Props = {
	readonly theme: 'light' | 'dark';
	readonly animation: 'opacity' | 'easing' | 'posterization';
};

const themeSchema = {
	theme: {
		type: 'enum',
		default: 'light',
		variants: {light: {}, dark: {}},
		keyframable: false,
		description: 'Theme',
	},
	animation: {
		type: 'enum',
		default: 'opacity',
		variants: {opacity: {}, easing: {}, posterization: {}},
		keyframable: false,
		description: 'Animation',
	},
} as const satisfies InteractivitySchema;

const getGraphProgress = (
	frame: number,
	fps: number,
	animation: Props['animation'],
) => {
	return interpolate(frame, [0, 2 * fps], [0, 1], {
		easing:
			animation === 'opacity' ? Easing.linear : Easing.bezier(0.42, 0, 0.58, 1),
		posterize: animation === 'posterization' ? 3 : undefined,
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
};

const AnimatingPropertiesGraphInner = ({theme, animation}: Props) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const clipId = useId();
	const progress = getGraphProgress(frame, fps, animation);
	const path = useMemo(() => {
		return Array.from({length: Math.round(4 * fps) + 1}, (_, pointFrame) => {
			const x = 185 + (pointFrame / (4 * fps)) * 270;
			const y = 315 - getGraphProgress(pointFrame, fps, animation) * 135;
			if (pointFrame === 0) {
				return `M ${x} ${y}`;
			}

			return animation === 'posterization' ? `H ${x} V ${y}` : `L ${x} ${y}`;
		}).join(' ');
	}, [animation, fps]);

	return (
		<Interactive.Svg
			name="Animation graph"
			premountFor={fps}
			width="100%"
			height="100%"
			viewBox="0 0 640 360"
		>
			<defs>
				<clipPath id={clipId}>
					<rect
						x={185}
						y={0}
						width={interpolate(frame, [0, 4 * fps], [0, 270], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})}
						height={360}
					/>
				</clipPath>
			</defs>
			<path
				d="M 185 45 V 315 H 455"
				fill="none"
				stroke={theme === 'dark' ? '#444444' : '#d9dde1'}
				strokeWidth={8}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d={path}
				fill="none"
				stroke={theme === 'dark' ? '#444444' : '#d9dde1'}
				strokeWidth={8}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d={path}
				fill="none"
				stroke="#0b84f3"
				strokeWidth={8}
				strokeLinecap="round"
				strokeLinejoin="round"
				clipPath={`url(#${clipId})`}
			/>
			<circle
				cx={interpolate(frame, [0, 4 * fps], [185, 455], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				})}
				cy={315 - progress * 135}
				r={9}
				fill="#0b84f3"
			/>
			<text
				x={198}
				y={70}
				fontFamily="Arial, sans-serif"
				fontSize={23}
				fill={theme === 'dark' ? '#ffffff' : '#000000'}
			>
				{animation === 'opacity'
					? `opacity = ${progress.toFixed(2)}`
					: `translateY = ${Math.round(240 * (1 - progress))}px`}
			</text>
			<text
				x={455}
				y={300}
				textAnchor="end"
				fontFamily="Arial, sans-serif"
				fontSize={23}
				fill={theme === 'dark' ? '#ffffff' : '#000000'}
			>
				{frame} = frame
			</text>
		</Interactive.Svg>
	);
};

export const AnimatingPropertiesGraph = Interactive.withSchema({
	Component: AnimatingPropertiesGraphInner,
	componentName: 'AnimatingPropertiesGraph',
	schema: themeSchema,
	wrapInSequence: true,
	layout: 'absolute-fill',
});

const AnimatingPropertiesTextInner = ({theme, animation}: Props) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<Interactive.Div
			name="Hello World"
			premountFor={fps}
			style={{
				position: 'absolute',
				inset: 0,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontFamily: 'Arial, sans-serif',
				fontSize: 40,
				fontWeight: 400,
				lineHeight: 1.2,
				color: theme === 'dark' ? '#ffffff' : '#0c0f18',
				opacity:
					animation === 'opacity'
						? interpolate(frame, [0, 2 * fps], [0, 1], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							})
						: 1,
				translate:
					animation === 'opacity'
						? '0px 0px'
						: interpolate(frame, [0, 2 * fps], ['0px 240px', '0px 0px'], {
								easing: Easing.bezier(0.42, 0, 0.58, 1),
								posterize: animation === 'posterization' ? 3 : undefined,
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
			}}
		>
			Hello World!
		</Interactive.Div>
	);
};

export const AnimatingPropertiesText = Interactive.withSchema({
	Component: AnimatingPropertiesTextInner,
	componentName: 'AnimatingPropertiesText',
	schema: themeSchema,
	wrapInSequence: true,
	layout: 'absolute-fill',
});
