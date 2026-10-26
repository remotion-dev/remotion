import {loadFont} from '@remotion/fonts';
import type {CSSProperties} from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	Solid,
	interpolate,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {FxIcon} from './effects/FxIconComposition';
import {BLUE} from './HomepageAssets/colors';

loadFont({
	family: 'Compose layers',
	url: staticFile('GT Planar/GT-Planar-Medium.woff2'),
	weight: '500',
});

const motion = {
	easing: Easing.bezier(0.65, 0, 0.35, 1),
	extrapolateLeft: 'clamp' as const,
	extrapolateRight: 'clamp' as const,
};

const ComposedSceneInner = ({style}: {readonly style: CSSProperties}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<div
			style={{
				position: 'absolute',
				left: -308,
				top: -182,
				width: 616,
				height: 364,
				color: BLUE,
				transformStyle: 'preserve-3d',
				...style,
			}}
		>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					display: 'grid',
					gridTemplateColumns: '3fr 2fr',
					transformStyle: 'preserve-3d',
					fontSize: 34,
					lineHeight: 1,
				}}
			>
				<div
					style={{
						position: 'relative',
						gridColumn: '1 / -1',
						gridRow: 1,
						display: 'grid',
						placeItems: 'center',
						boxSizing: 'border-box',
						border: `2px solid ${BLUE}`,
						borderRadius: 20,
						backgroundColor: 'white',
						backgroundImage:
							'repeating-linear-gradient(135deg, transparent 0px, transparent 16px, rgba(11, 132, 243, 0.4) 16px, rgba(11, 132, 243, 0.4) 18px)',
					}}
				>
					<div
						style={{
							position: 'absolute',
							left: 16,
							bottom: 8,
							padding: '6px 8px',
							borderRadius: 6,
							backgroundColor: 'white',
						}}
					>
						{'<Video>'}
					</div>
					<Interactive.Div
						name="LUT effect"
						style={{
							position: 'absolute',
							top: 20,
							left: 20,
							display: 'flex',
							alignItems: 'center',
							gap: 8,
							padding: '10px 16px',
							fontSize: 24,
							borderRadius: 10,
							border: `2px solid ${BLUE}`,
							backgroundColor: BLUE,
							color: 'white',
							backdropFilter: 'blur(8px)',
						}}
					>
						<FxIcon size={24} />
						lut()
					</Interactive.Div>
				</div>
				<Interactive.Div
					name="Interactive.Div card"
					style={{
						position: 'relative',
						gridColumn: 2,
						gridRow: 1,
						marginLeft: -2,
						boxSizing: 'border-box',
						border: `2px solid ${BLUE}`,
						borderRadius: '0 20px 20px 0',
						backgroundColor: 'white',
						transformStyle: 'preserve-3d',
						fontSize: 24,
						whiteSpace: 'nowrap',
						translate: interpolate(
							frame,
							[fps, 3.1 * fps, 4.4 * fps, 6.5 * fps],
							['0px 0px 30px', '0px 0px 0px', '0px 0px 0px', '0px 0px 30px'],
							motion,
						),
					}}
				>
					<Interactive.Div
						name="Subscribe button"
						style={{
							position: 'absolute',
							top: 24,
							left: '50%',
							translate: interpolate(
								frame,
								[fps, 3.1 * fps, 4.4 * fps, 6.5 * fps],
								[
									'-50% 0px 30px',
									'-50% 0px 0px',
									'-50% 0px 0px',
									'-50% 0px 30px',
								],
								motion,
							),
							padding: '14px 18px',
							borderRadius: 999,
							border: `2px solid ${BLUE}`,
							backgroundColor: 'white',
							color: BLUE,
						}}
					>
						{'<Subscribe>'}
					</Interactive.Div>
					<div
						style={{
							position: 'absolute',
							bottom: 14,
							left: 0,
							right: 0,
							textAlign: 'center',
						}}
					>
						{'<Interactive.Div>'}
					</div>
				</Interactive.Div>
			</div>
		</div>
	);
};

const ComposedScene = Interactive.create({
	Component: ComposedSceneInner,
	layout: 'none',
	schema: {},
});

const FeatureCardInner = ({style}: {readonly style: CSSProperties}) => (
	<div
		style={{
			position: 'absolute',
			boxSizing: 'border-box',
			border: `2px solid ${BLUE}`,
			borderRadius: 18,
			backgroundColor: 'white',
			...style,
		}}
	/>
);

const FeatureCard = Interactive.create({
	Component: FeatureCardInner,
	layout: 'none',
	schema: {},
});

const FeatureSceneInner = ({style}: {readonly style: CSSProperties}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<div
			style={{
				position: 'absolute',
				left: -308,
				top: -182,
				width: 616,
				height: 364,
				color: BLUE,
				transformStyle: 'preserve-3d',
				...style,
			}}
		>
			<Solid
				name="Solid background"
				width={616}
				height={364}
				color="white"
				style={{
					position: 'absolute',
					inset: 0,
					border: `2px solid ${BLUE}`,
					borderRadius: 20,
					boxSizing: 'border-box',
				}}
			/>
			<div style={{position: 'absolute', right: 24, bottom: 14, fontSize: 34}}>
				{'<Solid>'}
			</div>
			<FeatureCard
				name="Large card"
				style={{
					left: 20,
					top: 20,
					width: 226,
					height: 264,
					translate: interpolate(
						frame,
						[fps, 3.1 * fps, 4.4 * fps, 6.5 * fps],
						['0px 0px 30px', '0px 0px 0px', '0px 0px 0px', '0px 0px 30px'],
						motion,
					),
				}}
			/>
			<FeatureCard
				name="Top middle card"
				style={{
					left: 258,
					top: 20,
					width: 163,
					height: 126,
					translate: interpolate(
						frame,
						[fps, 3.1 * fps, 4.4 * fps, 6.5 * fps],
						['0px 0px 30px', '0px 0px 0px', '0px 0px 0px', '0px 0px 30px'],
						motion,
					),
				}}
			/>
			<FeatureCard
				name="Top right card"
				style={{
					left: 433,
					top: 20,
					width: 163,
					height: 126,
					translate: interpolate(
						frame,
						[fps, 3.1 * fps, 4.4 * fps, 6.5 * fps],
						['0px 0px 30px', '0px 0px 0px', '0px 0px 0px', '0px 0px 30px'],
						motion,
					),
				}}
			/>
			<FeatureCard
				name="Bottom middle card"
				style={{
					left: 258,
					top: 158,
					width: 163,
					height: 126,
					translate: interpolate(
						frame,
						[fps, 3.1 * fps, 4.4 * fps, 6.5 * fps],
						['0px 0px 30px', '0px 0px 0px', '0px 0px 0px', '0px 0px 30px'],
						motion,
					),
				}}
			/>
			<FeatureCard
				name="Bottom right card"
				style={{
					left: 433,
					top: 158,
					width: 163,
					height: 126,
					translate: interpolate(
						frame,
						[fps, 3.1 * fps, 4.4 * fps, 6.5 * fps],
						['0px 0px 30px', '0px 0px 0px', '0px 0px 0px', '0px 0px 30px'],
						motion,
					),
				}}
			/>
		</div>
	);
};

const FeatureScene = Interactive.create({
	Component: FeatureSceneInner,
	layout: 'none',
	schema: {},
});

export const ComposeLayers = () => {
	const frame = useCurrentFrame();
	const {fps, height, width} = useVideoConfig();
	const connectorLength = 144;

	return (
		<AbsoluteFill
			showInTimeline={false}
			style={{
				backgroundColor: 'white',
				fontFamily: 'Compose layers, sans-serif',
				fontWeight: 500,
			}}
		>
			<Interactive.Div
				name="Connected scenes"
				style={{
					position: 'absolute',
					left: width / 2,
					top: height / 2,
					width: 0,
					height: 0,
					scale: 1.05,
					transformStyle: 'preserve-3d',
					rotate: interpolate(
						frame,
						[fps, 3.1 * fps, 4.4 * fps, 6.5 * fps],
						['x 55deg', 'x 0deg', 'x 0deg', 'x 55deg'],
						motion,
					),
				}}
			>
				<div
					style={{
						transformStyle: 'preserve-3d',
						rotate: interpolate(
							frame,
							[fps, 3.1 * fps, 4.4 * fps, 6.5 * fps],
							['-24deg', '0deg', '0deg', '-24deg'],
							motion,
						),
					}}
				>
					<FeatureScene
						name="Feature overview"
						style={{translate: '-760px 0px'}}
					/>
					<Interactive.Div
						name="Transition"
						style={{
							position: 'absolute',
							left: -380,
							width: 0,
							height: 0,
							transformStyle: 'preserve-3d',
						}}
					>
						<svg
							viewBox={`0 0 ${connectorLength} 64`}
							width={connectorLength}
							height={64}
							fill="none"
							stroke={BLUE}
							strokeWidth={2}
							strokeLinecap="round"
							strokeLinejoin="round"
							style={{
								position: 'absolute',
								left: -connectorLength / 2,
								top: -32,
								overflow: 'visible',
							}}
						>
							<path
								d={`M0 32H${connectorLength / 2 - 32} M${connectorLength / 2 + 32} 32H${connectorLength}`}
							/>
							<rect
								x={connectorLength / 2 - 32}
								y={0}
								width={64}
								height={64}
								rx={12}
								fill={BLUE}
								stroke="none"
							/>
							<g
								transform={`translate(${connectorLength / 2} 32) scale(4) translate(-12 -8)`}
								stroke="white"
							>
								<path d="M7.5 4.5 16.5 11.5v-7l-9 7Z" strokeWidth={0.5} />
							</g>
						</svg>
					</Interactive.Div>
					<ComposedScene name="Second scene" style={{translate: '0px 0px'}} />
				</div>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
