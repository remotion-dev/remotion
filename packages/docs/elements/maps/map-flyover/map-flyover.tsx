import * as turf from '@turf/turf';
import maplibregl, {type GeoJSONSource, type Map} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
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
	type InteractivitySchema,
	type SequenceControls,
	useCurrentFrame,
	useDelayRender,
	useVideoConfig,
} from 'remotion';

// Reference: https://www.youtube.com/watch?v=D_PtYPnKBJs&t=76s
// A world map establishes the route before the camera moves in.
type MapFlyoverLayerProps = InteractiveBaseProps & {
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
} as const satisfies InteractivitySchema;

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
			trimBefore,
		},
		ref,
	) => {
		const frame = useCurrentFrame();
		const {height, width} = useVideoConfig();
		const {continueRender, delayRender} = useDelayRender();
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
		const route = useMemo(() => {
			if (
				Math.abs(startCoordinates[0] - endCoordinates[0]) < 0.000001 &&
				Math.abs(startCoordinates[1] - endCoordinates[1]) < 0.000001
			) {
				return turf.lineString([
					startCoordinates,
					[startCoordinates[0] + 0.0001, startCoordinates[1]],
				]);
			}

			const greatCircle = turf.greatCircle(startCoordinates, endCoordinates, {
				npoints: 200,
			});

			if (greatCircle.geometry.type === 'LineString') {
				return turf.lineString(greatCircle.geometry.coordinates);
			}

			const longestSegment = greatCircle.geometry.coordinates.reduce(
				(longest, segment) =>
					segment.length > longest.length ? segment : longest,
			);

			return turf.lineString(longestSegment);
		}, [endCoordinates, startCoordinates]);
		const routeDistance = useMemo(() => turf.length(route), [route]);

		useEffect(() => {
			if (!mapContainerRef.current || mapRef.current) {
				return;
			}

			const mapInstance = new maplibregl.Map({
				container: mapContainerRef.current,
				style: 'https://demotiles.maplibre.org/style.json',
				center: [0, 0],
				zoom: Math.log2(width / 512),
				interactive: false,
				fadeDuration: 0,
				renderWorldCopies: false,
				canvasContextAttributes: {
					preserveDrawingBuffer: true,
				},
			});
			mapRef.current = mapInstance;

			mapInstance.on('load', () => {
				mapInstance.addSource('flyover-route', {
					type: 'geojson',
					data: turf.lineString([
						[0, 0],
						[0.0001, 0],
					]),
				});
				mapInstance.addLayer({
					id: 'flyover-route-glow',
					type: 'line',
					source: 'flyover-route',
					layout: {
						'line-cap': 'round',
						'line-join': 'round',
					},
					paint: {
						'line-blur': 8,
						'line-color': '#ff5c4d',
						'line-opacity': 0.35,
						'line-width': 24,
					},
				});
				mapInstance.addLayer({
					id: 'flyover-route-line',
					type: 'line',
					source: 'flyover-route',
					layout: {
						'line-cap': 'round',
						'line-join': 'round',
					},
					paint: {
						'line-color': '#ff5c4d',
						'line-width': 8,
					},
				});
				mapInstance.addSource('flyover-endpoints', {
					type: 'geojson',
					data: turf.featureCollection([]),
				});
				mapInstance.addLayer({
					id: 'flyover-endpoint-dots',
					type: 'circle',
					source: 'flyover-endpoints',
					paint: {
						'circle-color': '#ff5c4d',
						'circle-radius': 14,
						'circle-stroke-color': '#ffffff',
						'circle-stroke-width': 5,
					},
				});
				mapInstance.addLayer({
					id: 'flyover-endpoint-numbers',
					type: 'symbol',
					source: 'flyover-endpoints',
					layout: {
						'text-allow-overlap': true,
						'text-field': ['get', 'marker'],
						'text-size': 20,
					},
					paint: {
						'text-color': '#111827',
					},
				});
				mapInstance.addLayer({
					id: 'flyover-endpoint-labels',
					type: 'symbol',
					source: 'flyover-endpoints',
					layout: {
						'text-allow-overlap': true,
						'text-anchor': 'top',
						'text-field': ['get', 'label'],
						'text-offset': [0, 1.1],
						'text-size': 28,
					},
					paint: {
						'text-color': '#111827',
						'text-halo-color': '#ffffff',
						'text-halo-width': 3,
					},
				});
				mapInstance.addSource('flyover-traveler', {
					type: 'geojson',
					data: turf.featureCollection([]),
				});
				mapInstance.addLayer({
					id: 'flyover-traveler-dot',
					type: 'circle',
					source: 'flyover-traveler',
					paint: {
						'circle-color': '#ffffff',
						'circle-radius': 9,
						'circle-stroke-color': '#111827',
						'circle-stroke-width': 4,
					},
				});
				mapInstance.jumpTo({center: [0, 0], zoom: Math.log2(width / 512)});
				mapInstance.once('idle', () => {
					setMap(mapInstance);
					continueRender(loadingHandle);
				});
				mapInstance.triggerRepaint();
			});
		}, [continueRender, loadingHandle, width]);

		useEffect(() => {
			if (!map) {
				return;
			}

			const frameHandle = delayRender('Rendering MapLibre flyover frame');
			const travelProgress = interpolate(frame, [50, 215], [0, 1], {
				easing: Easing.inOut(Easing.cubic),
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			});
			const currentDistance = Math.min(
				routeDistance,
				Math.max(0.001, routeDistance * travelProgress),
			);
			const partialRoute = turf.lineSliceAlong(route, 0, currentDistance);
			const currentPoint = turf.along(route, currentDistance).geometry
				.coordinates as [number, number];
			const cameraAltitudeMeters = interpolate(
				routeDistance,
				[100, 10000],
				[180000, 2400000],
				{
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				},
			);
			const cameraLatitudeOffset = interpolate(
				routeDistance,
				[100, 10000],
				[0.8, 8],
				{
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				},
			);
			const flightCamera = map.calculateCameraOptionsFromTo(
				new maplibregl.LngLat(
					currentPoint[0],
					Math.max(-85, Math.min(85, currentPoint[1] - cameraLatitudeOffset)),
				),
				cameraAltitudeMeters,
				new maplibregl.LngLat(currentPoint[0], currentPoint[1]),
			);
			const flightCenter = maplibregl.LngLat.convert(
				flightCamera.center ?? currentPoint,
			);
			const cameraTransition = interpolate(frame, [15, 50], [0, 1], {
				easing: Easing.inOut(Easing.cubic),
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			});

			(map.getSource('flyover-route') as GeoJSONSource).setData(partialRoute);
			(map.getSource('flyover-endpoints') as GeoJSONSource).setData(
				turf.featureCollection([
					turf.point(startCoordinates, {
						label: originLabel,
						marker: '1',
					}),
					turf.point(endCoordinates, {
						label: destinationLabel,
						marker: '2',
					}),
				]),
			);
			(map.getSource('flyover-traveler') as GeoJSONSource).setData(
				turf.featureCollection(frame < 50 ? [] : [turf.point(currentPoint)]),
			);
			map.setPaintProperty('flyover-route-glow', 'line-color', routeColor);
			map.setPaintProperty('flyover-route-glow', 'line-width', lineWidth + 16);
			map.setPaintProperty('flyover-route-line', 'line-color', routeColor);
			map.setPaintProperty('flyover-route-line', 'line-width', lineWidth);
			map.setPaintProperty('flyover-endpoint-dots', 'circle-color', routeColor);
			map.jumpTo({
				bearing: interpolate(
					cameraTransition,
					[0, 1],
					[0, flightCamera.bearing ?? 0],
				),
				center: [
					interpolate(cameraTransition, [0, 1], [0, flightCenter.lng]),
					interpolate(cameraTransition, [0, 1], [0, flightCenter.lat]),
				],
				pitch: interpolate(
					cameraTransition,
					[0, 1],
					[0, flightCamera.pitch ?? 0],
				),
				zoom: interpolate(
					cameraTransition,
					[0, 1],
					[Math.log2(width / 512), flightCamera.zoom ?? 4],
				),
			});
			map.once('idle', () => continueRender(frameHandle));
			map.triggerRepaint();
		}, [
			continueRender,
			delayRender,
			destinationLabel,
			endCoordinates,
			frame,
			lineWidth,
			map,
			originLabel,
			route,
			routeColor,
			routeDistance,
			startCoordinates,
			width,
		]);

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
					}}
				>
					<div
						ref={mapContainerRef}
						style={{height, position: 'absolute', width}}
					/>
					<div
						style={{
							background:
								'radial-gradient(circle, transparent 45%, rgba(10, 20, 28, 0.22) 130%)',
							inset: 0,
							pointerEvents: 'none',
							position: 'absolute',
						}}
					/>
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

export const MapFlyover: React.FC = () => {
	return (
		<InteractiveMapFlyoverLayer
			name="Container"
			origin={[-0.1276, 51.5072]}
			destination={[139.6917, 35.6895]}
			originLabel="London"
			destinationLabel="Tokyo"
			routeColor={'#564dff'}
			lineWidth={24}
		/>
	);
};
