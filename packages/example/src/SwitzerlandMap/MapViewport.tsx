import {
	config as mapTilerConfig,
	Map as MapTilerMap,
	MapStyle,
} from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from 'react';
import {
	Interactive,
	Sequence,
	type InteractiveBaseProps,
	type InteractivitySchema,
	type SequenceControls,
	useDelayRender,
} from 'remotion';
import {MapTilerContext} from './MapTilerContext';

type MapViewportProps = InteractiveBaseProps & {
	readonly backgroundColor?: string;
	readonly bearing?: number;
	readonly centerLatitude?: number;
	readonly centerLongitude?: number;
	readonly children?: ReactNode;
	readonly controls?: SequenceControls;
	readonly stack?: string;
	readonly zoom?: number;
};

const mapViewportSchema = {
	...Interactive.baseSchema,
	centerLongitude: {
		type: 'number',
		min: -180,
		max: 180,
		step: 0.0001,
		default: 0,
		description: 'Center longitude',
		hiddenFromList: false,
		keyframable: true,
	},
	centerLatitude: {
		type: 'number',
		min: -90,
		max: 90,
		step: 0.0001,
		default: 0,
		description: 'Center latitude',
		hiddenFromList: false,
		keyframable: true,
	},
	zoom: {
		type: 'number',
		min: 0,
		max: 22,
		step: 0.01,
		default: 4,
		description: 'Zoom',
		hiddenFromList: false,
		keyframable: true,
	},
	bearing: {
		type: 'number',
		min: -360,
		max: 360,
		step: 1,
		default: 0,
		description: 'Bearing',
		hiddenFromList: false,
		keyframable: true,
	},
	backgroundColor: {
		type: 'color',
		default: '#dfe7e2',
		description: 'Background color',
	},
} as const satisfies InteractivitySchema;

const MissingApiKey = () => {
	return (
		<div
			style={{
				alignItems: 'center',
				color: '#171a1f',
				display: 'flex',
				flexDirection: 'column',
				fontFamily: 'Arial, sans-serif',
				inset: 0,
				justifyContent: 'center',
				padding: 100,
				position: 'absolute',
				textAlign: 'center',
			}}
		>
			<div style={{fontSize: 64, fontWeight: 700}}>MapTiler key needed</div>
			<div style={{fontSize: 32, lineHeight: 1.4, marginTop: 24}}>
				Add REMOTION_MAPTILER_KEY to a .env file in packages/example.
			</div>
		</div>
	);
};

const MapViewportInner = forwardRef<
	HTMLDivElement,
	MapViewportProps & {
		readonly stack?: undefined;
	}
>(
	(
		{
			backgroundColor = '#dfe7e2',
			bearing = 0,
			centerLatitude = 0,
			centerLongitude = 0,
			children,
			durationInFrames,
			from,
			trimBefore,
			freeze,
			hidden,
			name,
			showInTimeline,
			zoom = 4,
			controls,
			stack,
		},
		ref,
	) => {
		const mapContainerRef = useRef<HTMLDivElement>(null);
		const mapRef = useRef<MapTilerMap | null>(null);
		const viewportRef = useRef<HTMLDivElement>(null);
		const initialCameraRef = useRef({
			bearing,
			centerLatitude,
			centerLongitude,
			zoom,
		});
		const {continueRender, delayRender} = useDelayRender();
		const [map, setMap] = useState<MapTilerMap | null>(null);
		const [cameraRevision, setCameraRevision] = useState(0);
		const [loadingHandle] = useState(() => delayRender('Loading MapTiler map'));
		const apiKey = process.env.REMOTION_MAPTILER_KEY;
		const contextValue = useMemo(
			() => ({cameraRevision, map}),
			[cameraRevision, map],
		);

		useImperativeHandle(ref, () => viewportRef.current as HTMLDivElement, []);

		useEffect(() => {
			if (!apiKey) {
				continueRender(loadingHandle);
				return;
			}

			if (!mapContainerRef.current || mapRef.current) {
				return;
			}

			const initialCamera = initialCameraRef.current;
			mapTilerConfig.apiKey = apiKey;
			// Keep MapTiler's logo and attribution visible:
			// https://docs.maptiler.com/guides/map-design/attribution/remove-attribution/
			const mapInstance = new MapTilerMap({
				bearing: initialCamera.bearing,
				canvasContextAttributes: {preserveDrawingBuffer: true},
				center: [initialCamera.centerLongitude, initialCamera.centerLatitude],
				container: mapContainerRef.current,
				fadeDuration: 0,
				fullscreenControl: false,
				geolocateControl: false,
				interactive: false,
				navigationControl: false,
				scaleControl: false,
				style: MapStyle.BASIC,
				terrainControl: false,
				zoom: initialCamera.zoom,
			});
			mapRef.current = mapInstance;

			mapInstance.on('load', () => {
				for (const layer of [...(mapInstance.getStyle().layers ?? [])]) {
					if (layer.type === 'symbol' || /other border/i.test(layer.id)) {
						mapInstance.removeLayer(layer.id);
					}
				}

				mapInstance.once('idle', () => {
					setMap(mapInstance);
					continueRender(loadingHandle);
				});
				mapInstance.triggerRepaint();
			});

			return () => {
				mapInstance.remove();
				mapRef.current = null;
			};
		}, [apiKey, continueRender, loadingHandle]);

		useEffect(() => {
			if (!map) {
				return;
			}

			const currentCenter = map.getCenter();
			const cameraIsCurrent =
				Math.abs(currentCenter.lng - centerLongitude) < 0.0000001 &&
				Math.abs(currentCenter.lat - centerLatitude) < 0.0000001 &&
				Math.abs(map.getZoom() - zoom) < 0.0000001 &&
				Math.abs(map.getBearing() - bearing) < 0.0000001;

			if (cameraIsCurrent) {
				return;
			}

			const cameraHandle = delayRender('Updating MapTiler camera');
			let hasFinished = false;
			const finish = () => {
				if (hasFinished) {
					return;
				}

				hasFinished = true;
				continueRender(cameraHandle);
			};
			const onIdle = () => finish();

			map.once('idle', onIdle);
			map.jumpTo({
				bearing,
				center: [centerLongitude, centerLatitude],
				zoom,
			});
			setCameraRevision((revision) => revision + 1);
			map.triggerRepaint();

			return () => {
				map.off('idle', onIdle);
				finish();
			};
		}, [
			bearing,
			centerLatitude,
			centerLongitude,
			continueRender,
			delayRender,
			map,
			zoom,
		]);

		return (
			<Sequence
				layout="none"
				from={from ?? 0}
				trimBefore={trimBefore}
				durationInFrames={durationInFrames ?? Infinity}
				freeze={freeze}
				hidden={hidden}
				name={name ?? '<MapViewport>'}
				showInTimeline={showInTimeline ?? true}
				controls={controls}
				_remotionInternalStack={stack}
			>
				<div
					ref={viewportRef}
					style={{
						backgroundColor,
						inset: 0,
						overflow: 'hidden',
						position: 'absolute',
					}}
				>
					{apiKey ? (
						<>
							<div
								ref={mapContainerRef}
								style={{
									inset: 0,
									position: 'absolute',
								}}
							/>
							<MapTilerContext.Provider value={contextValue}>
								{children}
							</MapTilerContext.Provider>
						</>
					) : (
						<MissingApiKey />
					)}
				</div>
			</Sequence>
		);
	},
);

export const MapViewport = Interactive.withSchema({
	Component: MapViewportInner,
	componentName: '<MapViewport>',
	componentIdentity: null,
	schema: mapViewportSchema,
	supportsEffects: false,
});
