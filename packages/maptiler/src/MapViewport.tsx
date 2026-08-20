import {Map as MapTilerMap, MapStyle, type MapOptions} from '@maptiler/sdk';
import '@maptiler/sdk/style.css';
import type {ComponentType, ForwardRefRenderFunction, ReactNode} from 'react';
import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
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

export type MapViewportMapOptions = Omit<
	MapOptions,
	| 'apiKey'
	| 'bearing'
	| 'center'
	| 'container'
	| 'fadeDuration'
	| 'interactive'
	| 'language'
	| 'padding'
	| 'pitch'
	| 'projection'
	| 'style'
	| 'terrain'
	| 'terrainExaggeration'
	| 'zoom'
>;

export type MapAdministrativeBorders = 'all' | 'country-only' | 'none';

export type MapViewportProps = InteractiveBaseProps & {
	readonly apiKey: string | null;
	readonly backgroundColor?: string;
	readonly bearing?: number;
	readonly centerLatitude?: number;
	readonly centerLongitude?: number;
	readonly children?: ReactNode;
	readonly controls?: SequenceControls;
	readonly language?: MapOptions['language'];
	readonly mapOptions?: MapViewportMapOptions;
	readonly mapStyle?: MapOptions['style'];
	readonly onMapReady?: (map: MapTilerMap) => void;
	readonly paddingBottom?: number;
	readonly paddingLeft?: number;
	readonly paddingRight?: number;
	readonly paddingTop?: number;
	readonly pitch?: number;
	readonly projection?: MapOptions['projection'];
	readonly showLabels?: boolean;
	readonly administrativeBorders?: MapAdministrativeBorders;
	readonly terrain?: boolean;
	readonly terrainExaggeration?: number;
	readonly zoom?: number;
};

const stripStyleLayers = ({
	administrativeBorders,
	map,
	showLabels,
}: {
	readonly administrativeBorders: MapAdministrativeBorders;
	readonly map: MapTilerMap;
	readonly showLabels: boolean;
}) => {
	for (const layer of [...(map.getStyle().layers ?? [])]) {
		const shouldRemoveLabel = !showLabels && layer.type === 'symbol';
		const shouldRemoveAdministrativeBorder =
			administrativeBorders === 'none'
				? /border/i.test(layer.id)
				: administrativeBorders === 'country-only' &&
					/other border/i.test(layer.id);
		if (shouldRemoveLabel || shouldRemoveAdministrativeBorder) {
			map.removeLayer(layer.id);
		}
	}
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
	pitch: {
		type: 'number',
		min: 0,
		max: 85,
		step: 1,
		default: 0,
		description: 'Pitch',
		hiddenFromList: false,
		keyframable: true,
	},
	paddingTop: {
		type: 'number',
		min: 0,
		max: 2000,
		step: 1,
		default: 0,
		description: 'Top camera padding',
		hiddenFromList: false,
		keyframable: true,
	},
	paddingRight: {
		type: 'number',
		min: 0,
		max: 2000,
		step: 1,
		default: 0,
		description: 'Right camera padding',
		hiddenFromList: false,
		keyframable: true,
	},
	paddingBottom: {
		type: 'number',
		min: 0,
		max: 2000,
		step: 1,
		default: 0,
		description: 'Bottom camera padding',
		hiddenFromList: false,
		keyframable: true,
	},
	paddingLeft: {
		type: 'number',
		min: 0,
		max: 2000,
		step: 1,
		default: 0,
		description: 'Left camera padding',
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
				Pass an apiKey prop to &lt;MapViewport&gt;.
			</div>
		</div>
	);
};

const MapViewportRefForwardingFunction: ForwardRefRenderFunction<
	HTMLDivElement,
	MapViewportProps
> = (
	{
		apiKey,
		backgroundColor = '#dfe7e2',
		bearing = 0,
		centerLatitude = 0,
		centerLongitude = 0,
		children,
		language,
		mapOptions,
		mapStyle = MapStyle.BASIC,
		onMapReady,
		paddingBottom = 0,
		paddingLeft = 0,
		paddingRight = 0,
		paddingTop = 0,
		pitch = 0,
		projection,
		showLabels = true,
		administrativeBorders = 'all',
		terrain = false,
		terrainExaggeration = 1,
		durationInFrames,
		from,
		trimBefore,
		freeze,
		hidden,
		name,
		showInTimeline,
		zoom = 4,
		controls,
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
		paddingBottom,
		paddingLeft,
		paddingRight,
		paddingTop,
		pitch,
		zoom,
	});
	const initialMapOptionsRef = useRef({
		administrativeBorders,
		language,
		mapOptions,
		mapStyle,
		projection,
		showLabels,
		terrain,
		terrainExaggeration,
	});
	const lastMapStyleRef = useRef(mapStyle);
	const lastLayerVisibilityRef = useRef({
		administrativeBorders,
		showLabels,
	});
	const onMapReadyRef = useRef(onMapReady);
	onMapReadyRef.current = onMapReady;
	const {continueRender, delayRender} = useDelayRender();
	const [map, setMap] = useState<MapTilerMap | null>(null);
	const [cameraRevision, setCameraRevision] = useState(0);
	const [styleRevision, setStyleRevision] = useState(0);
	const [loadingHandle] = useState(() => delayRender('Loading MapTiler map'));
	const contextValue = useMemo(
		() => ({cameraRevision, map, styleRevision}),
		[cameraRevision, map, styleRevision],
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
		const initialOptions = initialMapOptionsRef.current;
		// Keep MapTiler's logo and attribution visible:
		// https://docs.maptiler.com/guides/map-design/attribution/remove-attribution/
		const mapInstance = new MapTilerMap({
			fullscreenControl: false,
			geolocateControl: false,
			navigationControl: false,
			scaleControl: false,
			terrainControl: false,
			...initialOptions.mapOptions,
			apiKey,
			bearing: initialCamera.bearing,
			canvasContextAttributes: {
				...initialOptions.mapOptions?.canvasContextAttributes,
				preserveDrawingBuffer: true,
			},
			center: [initialCamera.centerLongitude, initialCamera.centerLatitude],
			container: mapContainerRef.current,
			fadeDuration: 0,
			interactive: false,
			language: initialOptions.language,
			pitch: initialCamera.pitch,
			projection: initialOptions.projection,
			style: initialOptions.mapStyle,
			terrain: initialOptions.terrain,
			terrainExaggeration: initialOptions.terrainExaggeration,
			zoom: initialCamera.zoom,
		});
		mapInstance.setPadding({
			bottom: initialCamera.paddingBottom,
			left: initialCamera.paddingLeft,
			right: initialCamera.paddingRight,
			top: initialCamera.paddingTop,
		});
		mapRef.current = mapInstance;

		mapInstance.on('load', () => {
			stripStyleLayers({
				administrativeBorders: initialOptions.administrativeBorders,
				map: mapInstance,
				showLabels: initialOptions.showLabels,
			});

			mapInstance.once('idle', () => {
				setMap(mapInstance);
				onMapReadyRef.current?.(mapInstance);
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
		const currentPadding = map.getPadding();
		const cameraIsCurrent =
			Math.abs(currentCenter.lng - centerLongitude) < 0.0000001 &&
			Math.abs(currentCenter.lat - centerLatitude) < 0.0000001 &&
			Math.abs(map.getZoom() - zoom) < 0.0000001 &&
			Math.abs(map.getBearing() - bearing) < 0.0000001 &&
			Math.abs(map.getPitch() - pitch) < 0.0000001 &&
			Math.abs((currentPadding.top ?? 0) - paddingTop) < 0.0000001 &&
			Math.abs((currentPadding.right ?? 0) - paddingRight) < 0.0000001 &&
			Math.abs((currentPadding.bottom ?? 0) - paddingBottom) < 0.0000001 &&
			Math.abs((currentPadding.left ?? 0) - paddingLeft) < 0.0000001;

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
			padding: {
				bottom: paddingBottom,
				left: paddingLeft,
				right: paddingRight,
				top: paddingTop,
			},
			pitch,
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
		paddingBottom,
		paddingLeft,
		paddingRight,
		paddingTop,
		pitch,
		zoom,
	]);

	useEffect(() => {
		if (
			!map ||
			(lastMapStyleRef.current === mapStyle &&
				lastLayerVisibilityRef.current.showLabels === showLabels &&
				lastLayerVisibilityRef.current.administrativeBorders ===
					administrativeBorders)
		) {
			return;
		}

		const styleHandle = delayRender('Updating MapTiler style');
		let hasFinished = false;
		const finish = () => {
			if (hasFinished) {
				return;
			}

			hasFinished = true;
			lastMapStyleRef.current = mapStyle;
			lastLayerVisibilityRef.current = {
				administrativeBorders,
				showLabels,
			};
			setStyleRevision((revision) => revision + 1);
			continueRender(styleHandle);
		};

		const onStyleLoad = () => {
			stripStyleLayers({administrativeBorders, map, showLabels});
			map.once('idle', finish);
			map.triggerRepaint();
		};

		map.once('style.load', onStyleLoad);
		map.setStyle(mapStyle ?? null);
		map.triggerRepaint();

		return () => {
			map.off('style.load', onStyleLoad);
			map.off('idle', finish);
			finish();
		};
	}, [
		administrativeBorders,
		continueRender,
		delayRender,
		map,
		mapStyle,
		showLabels,
	]);

	useEffect(() => {
		if (map && language) {
			map.setLanguage(language);
			map.triggerRepaint();
		}
	}, [language, map]);

	useEffect(() => {
		if (!map) {
			return;
		}

		if (terrain) {
			map.enableTerrain(terrainExaggeration);
		} else {
			map.disableTerrain();
		}

		map.triggerRepaint();
	}, [map, terrain, terrainExaggeration]);

	useEffect(() => {
		if (map && projection) {
			map.setProjection(projection, {persist: true});
			map.triggerRepaint();
		}
	}, [map, projection]);

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
};

const MapViewportInner = forwardRef(MapViewportRefForwardingFunction);

export const MapViewport: ComponentType<MapViewportProps> =
	Interactive.withSchema({
		Component: MapViewportInner,
		componentName: '<MapViewport>',
		componentIdentity: null,
		schema: mapViewportSchema,
		supportsEffects: false,
	});
