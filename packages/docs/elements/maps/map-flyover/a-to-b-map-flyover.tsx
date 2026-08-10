import * as turf from '@turf/turf';
import maplibregl, {type Map} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	Easing,
	Interactive,
	Sequence,
	interpolate,
	type InteractiveBaseProps,
	type InteractiveTransformProps,
	type InteractivitySchema,
	type SequenceControls,
	useBufferState,
	useCurrentFrame,
	useDelayRender,
	useVideoConfig,
} from 'remotion';

// Reference: https://www.youtube.com/watch?v=D_PtYPnKBJs&t=76s
// A world map establishes the route before the camera moves in.
type MapFlyoverLayerProps = InteractiveBaseProps &
	InteractiveTransformProps & {
		readonly destination?: readonly [number, number];
		readonly destinationLabel?: string;
		readonly lineWidth?: number;
		readonly origin?: readonly [number, number];
		readonly originLabel?: string;
		readonly routeColor?: string;
	};

const mapFlyoverSchema = {
	...Interactive.baseSchema,
	origin: {
		type: 'array',
		item: {type: 'number', step: 0.0001},
		default: [-0.1276, 51.5072],
		minLength: 2,
		maxLength: 2,
		newItemDefault: 0,
		description: 'Origin [longitude, latitude]',
	},
	destination: {
		type: 'array',
		item: {type: 'number', step: 0.0001},
		default: [139.6917, 35.6895],
		minLength: 2,
		maxLength: 2,
		newItemDefault: 0,
		description: 'Destination [longitude, latitude]',
	},
	originLabel: {
		type: 'text-content',
		default: 'London',
		description: 'Origin label',
	},
	destinationLabel: {
		type: 'text-content',
		default: 'Tokyo',
		description: 'Destination label',
	},
	routeColor: {
		type: 'color',
		default: '#ff5c4d',
		description: 'Route color',
	},
	lineWidth: {
		type: 'number',
		min: 2,
		max: 24,
		step: 1,
		default: 8,
		description: 'Route width',
		hiddenFromList: false,
	},
	...Interactive.transformSchema,
} as const satisfies InteractivitySchema;

const unwrapLongitude = (longitude: number, reference: number) => {
	let unwrapped = longitude;
	while (unwrapped - reference > 180) {
		unwrapped -= 360;
	}

	while (unwrapped - reference < -180) {
		unwrapped += 360;
	}

	return unwrapped;
};

const createFlyoverRoute = (start: [number, number], end: [number, number]) => {
	if (
		Math.abs(start[0] - end[0]) < 0.000001 &&
		Math.abs(start[1] - end[1]) < 0.000001
	) {
		return turf.lineString([start, [start[0] + 0.0001, start[1]]]);
	}

	const greatCircle = turf.greatCircle(start, end, {npoints: 200});
	const splitCoordinates =
		greatCircle.geometry.type === 'LineString'
			? greatCircle.geometry.coordinates
			: greatCircle.geometry.coordinates.flat();
	const coordinates: [number, number][] = [];
	for (const coordinate of splitCoordinates) {
		const previousLongitude = coordinates.at(-1)?.[0] ?? coordinate[0];
		coordinates.push([
			unwrapLongitude(coordinate[0], previousLongitude),
			coordinate[1],
		]);
	}

	const startMercator = maplibregl.MercatorCoordinate.fromLngLat({
		lng: coordinates[0][0],
		lat: coordinates[0][1],
	});
	const lastCoordinate = coordinates[coordinates.length - 1];
	const endMercator = maplibregl.MercatorCoordinate.fromLngLat({
		lng: lastCoordinate[0],
		lat: lastCoordinate[1],
	});

	return turf.lineString(
		coordinates.map((coordinate, index) => {
			const progress = index / (coordinates.length - 1);
			const greatCirclePoint = maplibregl.MercatorCoordinate.fromLngLat({
				lng: coordinate[0],
				lat: coordinate[1],
			});
			const straightX =
				startMercator.x + (endMercator.x - startMercator.x) * progress;
			const straightY =
				startMercator.y + (endMercator.y - startMercator.y) * progress;
			const reducedBend = new maplibregl.MercatorCoordinate(
				straightX + (greatCirclePoint.x - straightX) * 0.5,
				straightY + (greatCirclePoint.y - straightY) * 0.5,
			).toLngLat();

			return [reducedBend.lng, reducedBend.lat];
		}),
	);
};

const calculateMapPlate = ({
	height,
	route,
	routeDistance,
	width,
}: {
	height: number;
	route: ReturnType<typeof createFlyoverRoute>;
	routeDistance: number;
	width: number;
}) => {
	const mercatorPoints = route.geometry.coordinates.map((coordinate) =>
		maplibregl.MercatorCoordinate.fromLngLat({
			lng: coordinate[0],
			lat: coordinate[1],
		}),
	);
	const minX = Math.min(...mercatorPoints.map((point) => point.x));
	const maxX = Math.max(...mercatorPoints.map((point) => point.x));
	const minY = Math.min(...mercatorPoints.map((point) => point.y));
	const maxY = Math.max(...mercatorPoints.map((point) => point.y));
	const spanX = Math.max(0.000001, maxX - minX);
	const spanY = Math.max(0.000001, maxY - minY);
	const center = new maplibregl.MercatorCoordinate(
		(minX + maxX) / 2,
		(minY + maxY) / 2,
	).toLngLat();
	const plateMultiplier = Math.min(4096 / width, 4096 / height);
	const plateWidth = Math.floor(width * plateMultiplier);
	const plateHeight = Math.floor(height * plateMultiplier);
	const maximumOverviewZoom = interpolate(routeDistance, [100, 10000], [7, 3], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const overviewZoom = Math.min(
		Math.log2((width * 0.82) / (512 * spanX)),
		Math.log2((height * 0.72) / (512 * spanY)),
		maximumOverviewZoom,
	);
	const maximumPlateZoom = Math.min(
		Math.log2(Math.max(1, plateWidth - width) / (512 * spanX)),
		Math.log2(Math.max(1, plateHeight - height) / (512 * spanY)),
	);
	const maximumCoveredZoom =
		overviewZoom +
		Math.log2(Math.min(plateWidth / width, plateHeight / height));
	const zoom = Math.max(
		overviewZoom,
		Math.min(overviewZoom + 1.25, maximumPlateZoom, maximumCoveredZoom),
	);

	return {
		center,
		height: plateHeight,
		overviewZoom,
		width: plateWidth,
		zoom,
	};
};

const projectToMapPlate = (
	coordinate: readonly [number, number],
	mapPlate: ReturnType<typeof calculateMapPlate>,
) => {
	const center = maplibregl.MercatorCoordinate.fromLngLat(mapPlate.center);
	const mercator = maplibregl.MercatorCoordinate.fromLngLat({
		lng: coordinate[0],
		lat: coordinate[1],
	});
	const worldSize = 512 * 2 ** mapPlate.zoom;

	return {
		x: (mercator.x - center.x) * worldSize + mapPlate.width / 2,
		y: (mercator.y - center.y) * worldSize + mapPlate.height / 2,
	};
};

const projectFlyoverRoute = (
	route: ReturnType<typeof createFlyoverRoute>,
	mapPlate: ReturnType<typeof calculateMapPlate>,
) => {
	let routeLength = 0;
	let previousProjected: {x: number; y: number} | null = null;
	const points = route.geometry.coordinates.map((coordinate) => {
		const projected = projectToMapPlate(
			coordinate as [number, number],
			mapPlate,
		);
		if (previousProjected) {
			routeLength += Math.hypot(
				projected.x - previousProjected.x,
				projected.y - previousProjected.y,
			);
		}

		previousProjected = projected;
		return {distance: routeLength, ...projected};
	});

	return {
		end: points[points.length - 1],
		pointAtProgress: (progress: number) => {
			const targetLength = routeLength * progress;
			const foundPointIndex = points.findIndex(
				(point) => point.distance >= targetLength,
			);
			const nextPointIndex =
				foundPointIndex === -1
					? points.length - 1
					: Math.max(1, foundPointIndex);
			const nextPoint = points[nextPointIndex];
			const previousPoint = points[nextPointIndex - 1];
			const segmentProgress =
				nextPoint.distance === previousPoint.distance
					? 0
					: (targetLength - previousPoint.distance) /
						(nextPoint.distance - previousPoint.distance);

			return {
				x: interpolate(segmentProgress, [0, 1], [previousPoint.x, nextPoint.x]),
				y: interpolate(segmentProgress, [0, 1], [previousPoint.y, nextPoint.y]),
			};
		},
		routePath: points
			.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
			.join(' '),
		start: points[0],
	};
};

const MapFlyoverLayerInner = forwardRef<
	HTMLDivElement,
	MapFlyoverLayerProps & {readonly controls: SequenceControls | undefined}
>(
	(
		{
			controls,
			destination = [139.6917, 35.6895],
			destinationLabel = 'Tokyo',
			durationInFrames: sequenceDurationInFrames,
			freeze,
			from,
			hidden,
			lineWidth = 8,
			name,
			origin = [-0.1276, 51.5072],
			originLabel = 'London',
			routeColor = '#ff5c4d',
			showInTimeline,
			style,
			trimBefore,
		},
		ref,
	) => {
		const frame = useCurrentFrame();
		const {height, width} = useVideoConfig();
		const {continueRender, delayRender} = useDelayRender();
		const {delayPlayback} = useBufferState();
		const mapContainerRef = useRef<HTMLDivElement>(null);
		const mapRef = useRef<Map | null>(null);
		const outlineRef = useRef<HTMLDivElement>(null);
		const [map, setMap] = useState<Map | null>(null);
		const [loadingHandle] = useState(() =>
			delayRender('Loading MapLibre flyover'),
		);

		useImperativeHandle(ref, () => outlineRef.current as HTMLDivElement, []);

		const startCoordinates = useMemo(
			() => [origin[0], origin[1]] as [number, number],
			[origin],
		);
		const endCoordinates = useMemo(
			() => [destination[0], destination[1]] as [number, number],
			[destination],
		);
		const route = useMemo(
			() => createFlyoverRoute(startCoordinates, endCoordinates),
			[endCoordinates, startCoordinates],
		);
		const routeDistance = useMemo(() => turf.length(route), [route]);

		// Render the basemap once at the closest camera zoom. Per-frame CSS
		// transforms move this oversized plate without loading new map tiles.
		const mapPlate = useMemo(
			() => calculateMapPlate({height, route, routeDistance, width}),
			[height, route, routeDistance, width],
		);
		const projectedOverlay = useMemo(
			() => projectFlyoverRoute(route, mapPlate),
			[mapPlate, route],
		);
		const travelStart = 50;
		const travelEnd = 205;
		const travelProgress = interpolate(
			frame,
			[travelStart, travelEnd],
			[0, 1],
			{
				easing: Easing.inOut(Easing.quad),
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			},
		);
		const originLabelOpacity = interpolate(
			frame,
			[travelStart, travelStart + 14],
			[1, 0],
			{
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			},
		);
		const markerRadius = Math.max(14, lineWidth * 0.8);
		const markerCenterRadius = markerRadius * 0.27;
		const destinationMarkerScale = interpolate(
			frame,
			[travelEnd + 5, travelEnd + 17],
			[lineWidth / 2 / markerRadius, 1],
			{
				easing: Easing.inOut(Easing.cubic),
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			},
		);
		const destinationMarkerCenterScale = interpolate(
			frame,
			[travelEnd + 19, travelEnd + 29],
			[0, 1],
			{
				easing: Easing.inOut(Easing.cubic),
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			},
		);
		const destinationLabelOpacity = interpolate(
			frame,
			[travelEnd + 27, travelEnd + 35],
			[0, 1],
			{
				easing: Easing.inOut(Easing.quad),
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			},
		);
		const currentPoint = projectedOverlay.pointAtProgress(travelProgress);
		const cameraTransition = interpolate(frame, [15, 50], [0, 1], {
			easing: Easing.inOut(Easing.cubic),
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});
		const projectedCameraCenter = {
			x: interpolate(
				cameraTransition,
				[0, 1],
				[mapPlate.width / 2, currentPoint.x],
			),
			y: interpolate(
				cameraTransition,
				[0, 1],
				[mapPlate.height / 2, currentPoint.y],
			),
		};
		const cameraZoom = interpolate(
			cameraTransition,
			[0, 1],
			[mapPlate.overviewZoom, mapPlate.zoom],
		);
		const plateScale = 2 ** (cameraZoom - mapPlate.zoom);

		// Keep frame-reactive graphics out of MapLibre's async render pipeline.
		// The SVG and basemap use the exact same deterministic plate transform.
		const plateTransform = `translate(${width / 2 - projectedCameraCenter.x * plateScale}px, ${
			height / 2 - projectedCameraCenter.y * plateScale
		}px) scale(${plateScale})`;

		useLayoutEffect(() => {
			if (map) {
				return;
			}

			return delayPlayback().unblock;
		}, [delayPlayback, map]);

		useEffect(() => {
			if (!mapContainerRef.current || mapRef.current) {
				return;
			}

			const mapInstance = new maplibregl.Map({
				container: mapContainerRef.current,
				// NASA Blue Marble is satellite imagery without political borders.
				// Source: NASA EOSDIS GIBS, accessed August 2026.
				style: {
					version: 8,
					sources: {
						'nasa-blue-marble': {
							type: 'raster',
							tiles: [
								'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_NextGeneration/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg',
							],
							tileSize: 256,
							maxzoom: 8,
							attribution: 'NASA EOSDIS / GIBS',
						},
					},
					layers: [
						{
							id: 'nasa-blue-marble',
							type: 'raster',
							source: 'nasa-blue-marble',
							paint: {
								'raster-fade-duration': 0,
							},
						},
					],
				},
				center: mapPlate.center,
				zoom: mapPlate.zoom,
				interactive: false,
				attributionControl: false,
				fadeDuration: 0,
				pixelRatio: 1,
				renderWorldCopies: true,
				canvasContextAttributes: {
					preserveDrawingBuffer: true,
				},
			});
			mapRef.current = mapInstance;

			mapInstance.on('load', () => {
				mapInstance.jumpTo({
					bearing: 0,
					center: mapPlate.center,
					pitch: 0,
					zoom: mapPlate.zoom,
				});
				mapInstance.once('idle', () => {
					setMap(mapInstance);
					continueRender(loadingHandle);
				});
				mapInstance.triggerRepaint();
			});
		}, [continueRender, loadingHandle, mapPlate]);

		useEffect(() => {
			if (!map) {
				return;
			}

			const mapPlateHandle = delayRender('Reframing MapLibre map plate');
			map.resize();
			map.jumpTo({
				bearing: 0,
				center: mapPlate.center,
				pitch: 0,
				zoom: mapPlate.zoom,
			});
			map.once('idle', () => continueRender(mapPlateHandle));
			map.triggerRepaint();
		}, [continueRender, delayRender, map, mapPlate.center, mapPlate.zoom]);

		return (
			<Sequence
				layout="none"
				from={from ?? 0}
				trimBefore={trimBefore}
				durationInFrames={sequenceDurationInFrames ?? Infinity}
				freeze={freeze}
				hidden={hidden}
				name={name ?? '<MapFlyover>'}
				showInTimeline={showInTimeline ?? true}
				controls={controls}
				outlineRef={outlineRef}
			>
				<div
					ref={outlineRef}
					style={{
						backgroundColor: '#dbe4e8',
						height,
						overflow: 'hidden',
						position: 'absolute',
						width,
						...style,
					}}
				>
					<div
						ref={mapContainerRef}
						style={{
							height: mapPlate.height,
							opacity: map ? 1 : 0,
							position: 'absolute',
							transform: plateTransform,
							transformOrigin: '0 0',
							width: mapPlate.width,
							willChange: 'transform',
						}}
					/>
					<svg
						viewBox={`0 0 ${mapPlate.width} ${mapPlate.height}`}
						style={{
							height: mapPlate.height,
							opacity: map ? 1 : 0,
							overflow: 'visible',
							pointerEvents: 'none',
							position: 'absolute',
							transform: plateTransform,
							transformOrigin: '0 0',
							width: mapPlate.width,
							willChange: 'transform',
						}}
					>
						<path
							d={projectedOverlay.routePath}
							fill="none"
							pathLength={1}
							stroke={routeColor}
							strokeDasharray={1}
							strokeDashoffset={1 - travelProgress}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={lineWidth}
						/>
						<g
							transform={`translate(${projectedOverlay.start.x} ${projectedOverlay.start.y})`}
						>
							<circle fill={routeColor} r={markerRadius} />
						</g>
						<text
							x={projectedOverlay.start.x}
							y={projectedOverlay.start.y + markerRadius + 26}
							fill="#ffffff"
							fontFamily="sans-serif"
							fontSize={26}
							fontWeight={600}
							opacity={originLabelOpacity}
							style={{
								filter: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.9))',
							}}
							textAnchor="middle"
						>
							{originLabel}
						</text>
						{frame >= travelEnd + 5 ? (
							<g
								transform={`translate(${projectedOverlay.end.x} ${projectedOverlay.end.y})`}
							>
								<circle
									fill={routeColor}
									r={markerRadius}
									transform={`scale(${destinationMarkerScale})`}
								/>
								<circle
									fill="#ffffff"
									r={markerCenterRadius}
									transform={`scale(${destinationMarkerCenterScale})`}
								/>
							</g>
						) : null}
						<text
							x={projectedOverlay.end.x}
							y={projectedOverlay.end.y + markerRadius + 26}
							fill="#ffffff"
							fontFamily="sans-serif"
							fontSize={26}
							fontWeight={600}
							opacity={destinationLabelOpacity}
							style={{
								filter: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.9))',
							}}
							textAnchor="middle"
						>
							{destinationLabel}
						</text>
					</svg>
					<div
						style={{
							background:
								'radial-gradient(circle, transparent 45%, rgba(10, 20, 28, 0.22) 130%)',
							inset: 0,
							pointerEvents: 'none',
							position: 'absolute',
						}}
					/>
					<div
						style={{
							backgroundColor: 'rgba(255, 255, 255, 0.8)',
							borderRadius: 4,
							bottom: 8,
							color: '#111827',
							fontFamily: 'sans-serif',
							fontSize: 12,
							padding: '3px 6px',
							position: 'absolute',
							right: 8,
						}}
					>
						NASA EOSDIS / GIBS
					</div>
				</div>
			</Sequence>
		);
	},
);

const InteractiveMapFlyoverLayer = Interactive.withSchema({
	Component: MapFlyoverLayerInner,
	componentName: '<MapFlyover>',
	componentIdentity: null,
	schema: mapFlyoverSchema,
	supportsEffects: false,
}) as React.FC<MapFlyoverLayerProps>;

export const MapFlyover: React.FC<MapFlyoverLayerProps> = (props) => {
	return (
		<InteractiveMapFlyoverLayer
			name="A-to-B Map Flyover"
			origin={[-0.1276, 51.5072]}
			destination={[139.6917, 35.6895]}
			originLabel="London"
			destinationLabel="Tokyo"
			routeColor={'#ff5c4d'}
			lineWidth={24}
			{...props}
		/>
	);
};
