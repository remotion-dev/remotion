import {loadFont} from '@remotion/fonts';
import type {ReactNode} from 'react';
import {
	CanvasImage,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

loadFont({
	family: 'Here GT Planar',
	url: 'https://remotion.media/agentically-programmatically/gt-planar-black-fe8aa1491f7a.woff2',
	weight: '900',
});

export const MottoPresenter = ({
	children,
	startWithPanelVisible,
}: {
	readonly children: ReactNode;
	readonly startWithPanelVisible: boolean;
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const layoutFrame = startWithPanelVisible
		? Math.max(frame, 2.9 * fps)
		: frame;

	return (
		<Interactive.Div
			name="Presenter beside motto"
			style={{
				position: 'absolute',
				inset: 0,
				translate: interpolate(
					layoutFrame,
					[2.3 * fps, 2.9 * fps, 13.34 * fps, 13.94 * fps],
					['0px 0px', '-460px 0px', '-460px 0px', '0px 0px'],
					{
						easing: Easing.bezier(0.42, 0, 0.58, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				),
			}}
		>
			{children}
		</Interactive.Div>
	);
};

export const MottoCaptions = ({
	children,
	startWithPanelVisible,
}: {
	readonly children: ReactNode;
	readonly startWithPanelVisible: boolean;
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const layoutFrame = startWithPanelVisible
		? Math.max(frame, 2.9 * fps)
		: frame;

	return (
		<Interactive.Div
			name="Captions beside motto"
			style={{
				position: 'absolute',
				inset: 0,
				zIndex: 2,
				transformOrigin: '960px 1000px',
				scale: interpolate(
					layoutFrame,
					[2.3 * fps, 2.9 * fps, 13.34 * fps, 13.94 * fps],
					[1, 0.82, 0.82, 1],
					{
						easing: Easing.bezier(0.42, 0, 0.58, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
					},
				),
				translate: interpolate(
					layoutFrame,
					[2.3 * fps, 2.9 * fps, 13.34 * fps, 13.94 * fps],
					['0px 0px', '-420px 0px', '-420px 0px', '0px 0px'],
					{
						easing: Easing.bezier(0.42, 0, 0.58, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				),
			}}
		>
			{children}
		</Interactive.Div>
	);
};

const MottoSidebarContent = ({
	startWithPanelVisible,
}: {
	readonly startWithPanelVisible: boolean;
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const layoutFrame = startWithPanelVisible
		? Math.max(frame, 2.9 * fps)
		: frame;

	return (
		<Interactive.Div
			name="Motto sidebar panel"
			style={{
				position: 'absolute',
				right: 0,
				top: 0,
				width: 840,
				height: '100%',
				boxSizing: 'border-box',
				backgroundColor: '#f8fafc',
				color: '#18191a',
				zIndex: 1,
				translate: interpolate(
					layoutFrame,
					[2.3 * fps, 2.9 * fps, 13.34 * fps, 13.94 * fps],
					['840px 0px', '0px 0px', '0px 0px', '840px 0px'],
					{
						easing: Easing.bezier(0.42, 0, 0.58, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				),
			}}
		>
			<CanvasImage
				name="Remotion logo"
				src={
					'https://remotion.media/agentically-programmatically/remotion-logo-on-light-96f0dc86e90d.svg'
				}
				style={{
					position: 'absolute',
					left: 60,
					top: 500,
					width: 200,
					height: (200 / 410) * 425,
					transformOrigin: 'top left',
					scale: interpolate(
						frame,
						[4.733333333333333 * fps, 5.133333333333334 * fps],
						[1, 0.6],
						{
							easing: [
								Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.055,
									overshootClamping: false,
								}),
							],
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							output: 'perceptual-scale',
						},
					),
					translate: interpolate(
						frame,
						[4.733333333333333 * fps, 5.133333333333334 * fps],
						['260px -63.65853658536582px', '-6px -148.390243902439px'],
						{
							easing: [
								Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.055,
									overshootClamping: false,
								}),
							],
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
				}}
			/>
			<Interactive.Div
				name="Motto type"
				style={{
					position: 'absolute',
					left: 60,
					top: 500,
					right: 60,
					textAlign: 'left',

					opacity: interpolate(frame, [5.18 * fps, 5.5 * fps], [0, 1], {
						easing: Easing.bezier(0.42, 0, 0.58, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),

					fontFamily: 'Here GT Planar',
					fontWeight: 900,
					fontSize: 80,
					lineHeight: 0.95,
					letterSpacing: '-0.025em',
					wordSpacing: '-0.025em',
					fontFeatureSettings: '"ss03" 1',
				}}
			>
				<Interactive.Div name="Make videos">Make videos</Interactive.Div>
				<div style={{display: 'grid', whiteSpace: 'nowrap'}}>
					<Interactive.Div
						name="Programmatically"
						style={{
							gridArea: '1 / 1',
							opacity: interpolate(frame, [7.8 * fps, 8 * fps], [1, 0], {
								easing: Easing.bezier(0.42, 0, 0.58, 1),
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
							translate: interpolate(
								frame,
								[7.8 * fps, 8.2 * fps],
								['0px 0px', '60px 0px'],
								{
									easing: Easing.bezier(0.42, 0, 0.58, 1),
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								},
							),
						}}
					>
						programmatically.
					</Interactive.Div>
					<Interactive.Div
						name="Interactively"
						style={{
							gridArea: '1 / 1',
							opacity: interpolate(
								frame,
								[8 * fps, 8.2 * fps, 9.58 * fps, 9.78 * fps],
								[0, 1, 1, 0],
								{
									easing: Easing.bezier(0.42, 0, 0.58, 1),
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								},
							),
							translate: `${
								interpolate(frame, [7.8 * fps, 8.2 * fps], [-60, 0], {
									easing: Easing.bezier(0.42, 0, 0.58, 1),
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								}) +
								interpolate(frame, [9.58 * fps, 9.98 * fps], [0, 60], {
									easing: Easing.bezier(0.42, 0, 0.58, 1),
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								})
							}px 0px`,
						}}
					>
						interactively.
					</Interactive.Div>
					<Interactive.Div
						name="Agentically"
						style={{
							gridArea: '1 / 1',
							opacity: interpolate(frame, [9.78 * fps, 9.98 * fps], [0, 1], {
								easing: Easing.bezier(0.42, 0, 0.58, 1),
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
							translate: interpolate(
								frame,
								[9.58 * fps, 9.98 * fps],
								['-60px 0px', '0px 0px'],
								{
									easing: Easing.bezier(0.42, 0, 0.58, 1),
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								},
							),
						}}
					>
						agentically.
					</Interactive.Div>
				</div>
			</Interactive.Div>
		</Interactive.Div>
	);
};

export const MottoSidebar = Interactive.create({
	Component: MottoSidebarContent,
	layout: 'absolute-fill',
	schema: {
		startWithPanelVisible: {
			type: 'boolean',
			default: false,
			description: 'Show the panel from the start',
		},
	},
});
