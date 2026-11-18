import {loadFont} from '@remotion/fonts';
import {
	AbsoluteFill,
	Easing,
	Freeze,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
// eslint-disable-next-line no-restricted-imports
import {getStudioHandoffFrame} from '../../../promo-pages/src/components/homepage/studio-handoff/animation';
import {StudioCodeHandoff} from '../video-elements/StudioCodeHandoff';

loadFont({
	family: 'Here GT Planar',
	url: 'https://remotion.media/agentically-programmatically/gt-planar-black-fe8aa1491f7a.woff2',
	weight: '900',
});

const HomepageHeroTitle = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {title} = getStudioHandoffFrame(frame / fps);

	return (
		<Interactive.Div
			name="Homepage headline"
			style={{
				position: 'absolute',
				left: 48,
				top: 96,
				width: 984,
				fontFamily: 'Here GT Planar',
				fontWeight: 900,
				fontSize: 96,
				lineHeight: 0.95,
				letterSpacing: -3,
				fontFeatureSettings: '"ss03" 1',
				color: '#111111',
				textAlign: 'left',
			}}
		>
			Make videos
			<Interactive.Div
				name="Rotating creation method"
				style={{
					whiteSpace: 'nowrap',
					opacity: title.opacity,
					translate: `${title.offset}px 0px`,
				}}
			>
				{title.mode}.
			</Interactive.Div>
		</Interactive.Div>
	);
};

const HomepageHeroZoomContent = () => {
	const frame = useCurrentFrame();

	return (
		<>
			<AbsoluteFill style={{backgroundColor: '#fff'}} />
			<Interactive.Div
				name="Homepage hero and headline"
				style={{
					position: 'absolute',
					inset: 0,
					transformOrigin: interpolate(
						frame,
						[174, 276, 502, 562],
						['32px 880px', '1048px 880px', '1048px 880px', '32px 880px'],
						{
							easing: Easing.bezier(0.42, 0, 0.58, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					scale: interpolate(
						frame,
						[20, 42, 70, 92, 150, 186, 264, 300, 390, 412, 480, 502],
						[1, 1.5335, 1.5335, 1, 1, 1.5335, 1.5335, 1, 1, 1.5335, 1.5335, 1],
						{
							easing: Easing.bezier(0.42, 0, 0.58, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							output: 'perceptual-scale',
						},
					),
				}}
			>
				<Freeze
					frame={
						(Math.round(
							interpolate(
								frame,
								[0, 90, 135, 300, 345, 420, 502, 562],
								[255, 225, 165, 120, 60, 15, 15, -105],
								{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
							),
						) +
							360) %
						360
					}
				>
					<HomepageHeroTitle />
					<Interactive.Div
						name="Homepage hero graphic"
						style={{
							position: 'absolute',
							left: 32,
							bottom: 0,
							width: 1016,
							height: 552.9989,
						}}
					>
						<StudioCodeHandoff />
					</Interactive.Div>
				</Freeze>
			</Interactive.Div>
		</>
	);
};

export const HomepageHeroZoom = Interactive.create({
	Component: HomepageHeroZoomContent,
	layout: 'absolute-fill',
	schema: {},
});
