import {Gif} from '@remotion/gif';
import {LightLeak} from '@remotion/light-leaks';
import {Lottie} from '@remotion/lottie';
import {MapRegion, MapRoute, MapViewport} from '@remotion/maptiler';
import type {MapRegionFeature, MapRouteFeature} from '@remotion/maptiler';
import {RemotionRiveCanvas} from '@remotion/rive';
import {
	Box,
	Bracket,
	Circle,
	CrossedOff,
	Highlight,
	StrikeThrough,
	Underline,
} from '@remotion/rough-notation';
import {Starburst} from '@remotion/starburst';
import {ThreeCanvas} from '@remotion/three';
import {ThreeWebGPUCanvas} from '@remotion/three/webgpu';
import {
	Suspense,
	useCallback,
	useLayoutEffect,
	useRef,
	useState,
	type ReactNode,
} from 'react';
import {
	AbsoluteFill,
	AnimatedImage,
	Freeze,
	IFrame,
	Sequence,
	staticFile,
	useCurrentFrame,
	useDelayRender,
} from 'remotion';

export const COMMITTED_HOLDS_WIDTH = 1280;
export const COMMITTED_HOLDS_HEIGHT = 960;
export const COMMITTED_HOLDS_DURATION = 84;
const COMMITTED_HOLDS_MOUNTS = [6, 30, 54];
const COMMITTED_HOLDS_VISIBLE_DURATION = 18;
const COMMITTED_HOLDS_TILE_WIDTH = 298;
const COMMITTED_HOLDS_TILE_HEIGHT = 174;

const animationData = {
	v: '5.7.4',
	fr: 30,
	ip: 0,
	op: 60,
	w: 298,
	h: 174,
	nm: 'Red solid',
	ddd: 0,
	assets: [],
	layers: [
		{
			ddd: 0,
			ind: 1,
			ty: 1,
			nm: 'Red solid',
			sr: 1,
			ks: {
				o: {a: 0, k: 100},
				r: {a: 0, k: 0},
				p: {a: 0, k: [149, 87, 0]},
				a: {a: 0, k: [149, 87, 0]},
				s: {a: 0, k: [100, 100, 100]},
			},
			sw: 298,
			sh: 174,
			sc: '#ff0000',
			ip: 0,
			op: 60,
			st: 0,
			bm: 0,
		},
	],
};

const region: MapRegionFeature = {
	type: 'Feature',
	properties: {name: 'Local region', source: 'Test fixture'},
	geometry: {
		type: 'Polygon',
		coordinates: [
			[
				[-12, -6],
				[-2, -6],
				[-2, 6],
				[-12, 6],
				[-12, -6],
			],
		],
	},
};
const route: MapRouteFeature = {
	type: 'Feature',
	properties: {name: 'Local route', source: 'Test fixture'},
	geometry: {
		type: 'LineString',
		coordinates: [
			[2, -6],
			[8, 0],
			[12, 6],
		],
	},
};
const mapStyle = {
	version: 8 as const,
	sources: {},
	layers: [
		{
			id: 'background',
			type: 'background' as const,
			paint: {'background-color': '#13263d'},
		},
	],
};

const Tile = ({title, children}: {title: string; children: ReactNode}) => (
	<div
		style={{
			width: 300,
			height: 206,
			border: '1px solid #526078',
			overflow: 'hidden',
		}}
	>
		<div
			style={{
				height: 30,
				paddingLeft: 8,
				lineHeight: '30px',
				background: '#24324a',
				color: 'white',
				fontSize: 15,
			}}
		>
			{title}
		</div>
		<div
			style={{
				width: COMMITTED_HOLDS_TILE_WIDTH,
				height: COMMITTED_HOLDS_TILE_HEIGHT,
				position: 'relative',
				background: '#0b1020',
				overflow: 'hidden',
			}}
		>
			{children}
		</div>
	</div>
);

const SuspendedSibling = ({
	gate,
	onCommit,
}: {
	gate: {ready: boolean; promise: Promise<void>};
	onCommit: () => void;
}) => {
	useLayoutEffect(onCommit, [onCommit]);
	if (!gate.ready) {
		throw gate.promise;
	}

	return null;
};

const SuspendedPanel = () => {
	const {delayRender, continueRender} = useDelayRender();
	// Hold the committed parent until the panel acquires its own layout-effect holds.
	const handle = useRef<number | null>(null);
	const [gate] = useState(() => {
		let resolve: () => void = () => undefined;
		const promise = new Promise<void>((release) => {
			resolve = release;
		});
		return {promise, resolve, ready: false};
	});
	const onCommit = useCallback(() => {
		if (handle.current !== null) {
			continueRender(handle.current);
			handle.current = null;
		}
	}, [continueRender]);
	useLayoutEffect(() => {
		const currentHandle = delayRender(
			'Waiting for the sibling Suspense fixture',
		);
		handle.current = currentHandle;
		const timeout = setTimeout(() => {
			gate.ready = true;
			gate.resolve();
		}, 100);
		return () => {
			clearTimeout(timeout);
			continueRender(currentHandle);
			handle.current = null;
		};
	}, [continueRender, delayRender, gate]);

	return (
		<Suspense fallback={null}>
			{/* The later sibling suspends after these components have rendered. */}
			<Panel />
			<SuspendedSibling gate={gate} onCommit={onCommit} />
		</Suspense>
	);
};

const Panel = () => {
	const frame = useCurrentFrame();
	const width = COMMITTED_HOLDS_TILE_WIDTH;
	const height = COMMITTED_HOLDS_TILE_HEIGHT;
	const gif = staticFile('committed-render-holds/colors.gif');
	return (
		<div
			style={{
				position: 'absolute',
				left: 20,
				top: 70,
				display: 'grid',
				gridTemplateColumns: 'repeat(4, 300px)',
				gap: 12,
			}}
		>
			<Tile title="Lottie">
				<Lottie animationData={animationData} style={{width, height}} />
			</Tile>
			<Tile title="Gif">
				<Gif src={gif} width={width} height={height} fit="fill" />
			</Tile>
			<Tile title="Gif · intrinsic duration">
				<Gif src={gif} loop width={width} height={height} fit="fill" />
			</Tile>
			<Tile title="AnimatedImage">
				<AnimatedImage src={gif} width={width} height={height} fit="fill" />
			</Tile>
			<Tile title="AnimatedImage · intrinsic duration">
				<AnimatedImage
					src={gif}
					loop
					width={width}
					height={height}
					fit="fill"
				/>
			</Tile>
			<Tile title="IFrame">
				<IFrame
					src={staticFile('committed-render-holds/frame.html')}
					style={{width, height, border: 0}}
				/>
			</Tile>
			<Tile title="Rough notation · all 7 annotations">
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: '1fr 1fr',
						gap: 12,
						padding: 14,
						color: 'white',
						fontSize: 18,
					}}
				>
					{[
						Box,
						Bracket,
						Circle,
						CrossedOff,
						Highlight,
						StrikeThrough,
						Underline,
					].map((Annotation, index) => (
						<div key={index}>
							<Annotation
								progress={1}
								color="#ff0000"
								strokeWidth={3}
								seed={42}
							>
								{
									[
										'Box',
										'Bracket',
										'Circle',
										'Crossed',
										'Highlight',
										'Strike',
										'Underline',
									][index]
								}
							</Annotation>
						</div>
					))}
				</div>
			</Tile>
			<Tile title="Rive · real runtime">
				<RemotionRiveCanvas
					src={staticFile('committed-render-holds/vehicles.riv')}
					style={{width, height}}
				/>
			</Tile>
			<Tile title="Starburst">
				<Starburst
					width={width}
					height={height}
					rays={12}
					colors={['#ff0000', '#00ff00']}
					rotation={frame * 2}
					vignette={1}
				/>
			</Tile>
			<Tile title="LightLeak">
				<Freeze frame={8 + frame / 8}>
					<LightLeak
						width={width}
						height={height}
						durationInFrames={18}
						seed={3}
					/>
				</Freeze>
			</Tile>
			<Tile title="MapViewport + MapRegion + MapRoute">
				<MapViewport
					apiKey="local-fixture"
					mapStyle={mapStyle}
					zoom={2}
					centerLatitude={0}
					centerLongitude={0}
					style={{width, height}}
				>
					<MapRegion
						id="fixture-region"
						feature={region}
						fill={1}
						fillColor="#ff0000"
						progress={1}
						strokeColor="#ff0000"
						strokeWidth={3}
						glow={0}
					/>
					<MapRoute
						id="fixture-route"
						feature={route}
						progress={1}
						strokeColor="#00ff00"
						strokeWidth={8}
						glow={0}
					/>
				</MapViewport>
			</Tile>
			<Tile title="ThreeCanvas">
				<ThreeCanvas
					width={width}
					height={height}
					camera={{position: [0, 0, 4]}}
				>
					<mesh rotation={[0, frame * 0.03, 0]}>
						<boxGeometry args={[1.8, 1.8, 1.8]} />
						<meshBasicMaterial color="#ff0000" />
					</mesh>
				</ThreeCanvas>
			</Tile>
			<Tile title="ThreeWebGPUCanvas">
				<ThreeWebGPUCanvas
					width={width}
					height={height}
					camera={{position: [0, 0, 4]}}
				>
					<mesh rotation={[0, frame * 0.03, 0]}>
						<boxGeometry args={[1.8, 1.8, 1.8]} />
						<meshBasicMaterial color="#00ff00" />
					</mesh>
				</ThreeWebGPUCanvas>
			</Tile>
		</div>
	);
};

export const CommittedRenderHolds = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill
			style={{background: '#0b1020', fontFamily: 'Arial, sans-serif'}}
		>
			<div
				style={{
					position: 'absolute',
					left: 20,
					top: 20,
					color: 'white',
					fontSize: 26,
				}}
			>
				Committed render holds · frame {frame} · mount at 6 / 30 / 54
			</div>
			{COMMITTED_HOLDS_MOUNTS.map((from) => (
				<Sequence
					key={from}
					from={from}
					durationInFrames={COMMITTED_HOLDS_VISIBLE_DURATION}
				>
					<SuspendedPanel />
				</Sequence>
			))}
		</AbsoluteFill>
	);
};
