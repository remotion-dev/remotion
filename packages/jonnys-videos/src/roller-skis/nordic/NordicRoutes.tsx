import type {CSSProperties} from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	interpolateColors,
	type InteractivitySchema,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {nordicRoutes} from './routes';

const CHUNK_SIZE = 8;
const clamp = (value: number) => Math.min(1, Math.max(0, value));

// Small contiguous paths let the trail fade by age, including on routes that
// double back over themselves. All geometry is prepared once, outside playback.
const routeGeometry = nordicRoutes.map((route) => {
	const chunks: {d: string; start: number; end: number}[] = [];
	const last = route.points.length - 1;
	for (let start = 0; start < last; start += CHUNK_SIZE) {
		const end = Math.min(start + CHUNK_SIZE, last);
		chunks.push({
			start: start / last,
			end: end / last,
			d: route.points
				.slice(start, end + 1)
				.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x},${y}`)
				.join(' '),
		});
	}
	return chunks;
});

type RoutePanelProps = {
	routeIndex: number;
	accentColor: string;
	whiteOverlay?: boolean;
	style?: CSSProperties;
};

const RoutePanelInner: React.FC<RoutePanelProps> = ({
	routeIndex,
	accentColor,
	whiteOverlay = false,
	style,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const route = nordicRoutes[routeIndex];
	// Equal visual pacing keeps all four outlines calm. This is a route reveal,
	// not a real-time race; the figures remain the original GPX statistics.
	const progress = interpolate(frame, [0.3 * fps, 4.8 * fps], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.bezier(0.42, 0, 0.58, 1),
	});
	const headIndex = progress * (route.points.length - 1);
	const before = route.points[Math.floor(headIndex)];
	const after =
		route.points[Math.min(Math.floor(headIndex) + 1, route.points.length - 1)];
	const headX = before[0] + (after[0] - before[0]) * (headIndex % 1);
	const headY = before[1] + (after[1] - before[1]) * (headIndex % 1);
	const settling = Math.max(0, frame / fps - 4.8) / 0.75;

	return (
		<Interactive.Div
			style={{
				position: 'absolute',
				width: 760,
				height: 400,
				...style,
			}}
		>
			<svg
				width={760}
				height={270}
				viewBox="0 0 760 270"
				aria-label={`${route.label} Nordic Ski route`}
				style={{
					position: 'absolute',
					left: 0,
					top: 42,
					overflow: 'visible',
					filter: whiteOverlay
						? 'drop-shadow(0 0 42px rgba(0, 0, 0, 0.95)) drop-shadow(0 2px 10px rgba(0, 0, 0, 0.85))'
						: undefined,
				}}
			>
				{routeGeometry[routeIndex].map((chunk, index) => {
					const visible = clamp(
						(progress - chunk.start) / (chunk.end - chunk.start),
					);
					if (visible <= 0) return null;
					const age = Math.max(0, progress - chunk.end) + settling;
					return (
						<path
							key={index}
							d={chunk.d}
							pathLength={1}
							fill="none"
							// Blend into the paper instead of using per-path transparency:
							// opaque round joins avoid dark beads where adjacent paths meet.
							stroke={
								whiteOverlay
									? '#FFFFFF'
									: interpolateColors(
											0.22 + 0.78 * Math.exp(-age * 8),
											[0, 1],
											['#F7F6F2', accentColor],
										)
							}
							opacity={whiteOverlay ? 0.22 + 0.78 * Math.exp(-age * 8) : 1}
							strokeWidth={4.5}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeDasharray={`${visible} 2`}
						/>
					);
				})}
				<circle
					cx={headX}
					cy={headY}
					r={5}
					fill={whiteOverlay ? '#FFFFFF' : accentColor}
					opacity={interpolate(
						frame,
						[0.275 * fps, 0.45 * fps, 4.8 * fps, 5.25 * fps],
						[0, 1, 1, 0],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					)}
				/>
			</svg>
			<div style={{position: 'absolute', left: 0, top: 322}}>
				<div
					style={{
						color: whiteOverlay ? 'rgba(255, 255, 255, 0.85)' : '#85847D',
						fontSize: 19,
						marginBottom: 9,
					}}
				>
					Distance
				</div>
				<div style={{fontSize: 48, lineHeight: 1, letterSpacing: -1.6}}>
					{route.distanceKm.toFixed(2)}
					<span
						style={{
							color: whiteOverlay ? 'rgba(255, 255, 255, 0.85)' : '#85847D',
							fontSize: 24,
							marginLeft: 10,
							letterSpacing: 0,
						}}
					>
						km
					</span>
				</div>
			</div>
			<div style={{position: 'absolute', left: 360, top: 322}}>
				<div
					style={{
						color: whiteOverlay ? 'rgba(255, 255, 255, 0.85)' : '#85847D',
						fontSize: 19,
						marginBottom: 9,
					}}
				>
					Average speed
				</div>
				<div style={{fontSize: 48, lineHeight: 1, letterSpacing: -1.6}}>
					{route.averageSpeedKmh.toFixed(0)}
					<span
						style={{
							color: whiteOverlay ? 'rgba(255, 255, 255, 0.85)' : '#85847D',
							fontSize: 24,
							marginLeft: 0,
							letterSpacing: 0,
						}}
					>
						km/h
					</span>
				</div>
			</div>
		</Interactive.Div>
	);
};

const routePanelSchema = {
	routeIndex: {
		type: 'number',
		default: 0,
		min: 0,
		max: 3,
		integer: true,
		hiddenFromList: false,
		keyframable: false,
		description: 'GPX track',
	},
	accentColor: {
		type: 'color',
		default: '#FC4C02',
		description: 'Route color',
	},
	whiteOverlay: {
		type: 'boolean',
		default: false,
		description: 'Show white routes and stats without a background',
	},
} as const satisfies InteractivitySchema;

const RoutePanel = Interactive.withSchema({
	Component: RoutePanelInner,
	componentName: 'RoutePanel',
	schema: routePanelSchema,
	wrapInSequence: true,
});

const NordicRoutesInner: React.FC<{whiteOverlay?: boolean}> = ({
	whiteOverlay = false,
}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();

	return (
		<AbsoluteFill
			showInTimeline={false}
			style={{
				backgroundColor: whiteOverlay ? 'transparent' : '#F7F6F2',
				color: whiteOverlay ? '#FFFFFF' : '#292C29',
				textShadow: whiteOverlay
					? '0 0 40px rgba(0, 0, 0, 0.95), 0 2px 10px rgba(0, 0, 0, 0.9)'
					: undefined,
				fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
				fontWeight: 400,
				fontVariantNumeric: 'tabular-nums',
			}}
		>
			<Interactive.Div
				name="Four routes fade"
				premountFor={fps}
				style={{
					position: 'absolute',
					inset: 0,
					opacity: interpolate(
						frame,
						[0, 0.25 * fps, 5.25 * fps, durationInFrames - 1],
						[0, 1, 1, 0],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.bezier(0.42, 0, 0.58, 1),
						},
					),
				}}
			>
				<RoutePanel
					name="Morning route"
					routeIndex={0}
					accentColor="#FC4C02"
					whiteOverlay={whiteOverlay}
					premountFor={fps}
					style={{left: 100, top: 90}}
				/>
				<RoutePanel
					name="Lunch route"
					routeIndex={1}
					accentColor="#FC4C02"
					whiteOverlay={whiteOverlay}
					premountFor={fps}
					style={{left: 1060, top: 90}}
				/>
				<RoutePanel
					name="Afternoon route"
					routeIndex={2}
					accentColor="#FC4C02"
					whiteOverlay={whiteOverlay}
					premountFor={fps}
					style={{left: 100, top: whiteOverlay ? 460 : 610}}
				/>
				<RoutePanel
					name="Evening route"
					routeIndex={3}
					accentColor="#FC4C02"
					whiteOverlay={whiteOverlay}
					premountFor={fps}
					style={{left: 1060, top: whiteOverlay ? 460 : 610}}
				/>
			</Interactive.Div>
		</AbsoluteFill>
	);
};

export const NordicRoutes = Interactive.withSchema({
	Component: NordicRoutesInner,
	componentName: 'NordicRoutes',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});
