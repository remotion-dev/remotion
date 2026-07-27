import {GeoJSONSource} from '@maptiler/sdk';
import {length as getLineLength, lineSliceAlong, lineString} from '@turf/turf';
import {
	forwardRef,
	useContext,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
	type RefObject,
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

export type MapRouteFeature = {
	type: 'Feature';
	properties: {name: string; source: string};
	geometry: {type: 'LineString'; coordinates: number[][]};
};

type MapRouteProps = InteractiveBaseProps & {
	readonly controls?: SequenceControls;
	readonly feature: MapRouteFeature;
	readonly glow?: number;
	readonly id: string;
	readonly progress?: number;
	readonly stack?: string;
	readonly strokeColor?: string;
	readonly strokeWidth?: number;
};

const mapRouteSchema = {
	...Interactive.baseSchema,
	glow: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: 0.72,
		description: 'Glow intensity',
		hiddenFromList: false,
		keyframable: true,
	},
	progress: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: 1,
		description: 'Route drawing progress',
		hiddenFromList: false,
	},
	strokeColor: {
		type: 'color',
		default: '#006cff',
		description: 'Stroke color',
	},
	strokeWidth: {
		type: 'number',
		min: 0,
		max: 50,
		step: 1,
		default: 9,
		description: 'Stroke width',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

type MapRouteDrawingProps = Pick<
	MapRouteProps,
	'feature' | 'glow' | 'id' | 'progress' | 'strokeColor' | 'strokeWidth'
>;

const MapRouteDrawing = ({
	feature,
	glow = 0.72,
	id,
	progress = 1,
	strokeColor = '#006cff',
	strokeWidth = 9,
}: MapRouteDrawingProps) => {
	const {map} = useContext(MapTilerContext);
	const {continueRender, delayRender} = useDelayRender();
	const [isReady, setIsReady] = useState(false);
	const [loadingHandle] = useState(() =>
		delayRender(`Loading ${feature.properties.name} route`),
	);
	const route = useMemo(
		() => lineString(feature.geometry.coordinates),
		[feature],
	);
	const routeLength = useMemo(() => getLineLength(route), [route]);
	const sourceId = `${id}-route`;
	const glowLayerId = `${id}-route-glow`;

	useEffect(() => {
		if (!map) {
			return;
		}

		if (!map.getSource(sourceId)) {
			map.addSource(sourceId, {
				data: lineSliceAlong(route, 0, 0.001),
				type: 'geojson',
			});
		}

		if (!map.getLayer(glowLayerId)) {
			map.addLayer({
				id: glowLayerId,
				layout: {'line-cap': 'round', 'line-join': 'round'},
				paint: {
					'line-blur': 8,
					'line-color': '#ffffff',
					'line-opacity': glow,
					'line-width': 22,
				},
				source: sourceId,
				type: 'line',
			});
		}
		map.setPaintProperty(
			glowLayerId,
			'line-opacity',
			Math.min(1, Math.max(0, glow)),
		);

		if (!map.getLayer(sourceId)) {
			map.addLayer({
				id: sourceId,
				layout: {'line-cap': 'round', 'line-join': 'round'},
				paint: {
					'line-color': strokeColor,
					'line-opacity': 1,
					'line-width': strokeWidth,
				},
				source: sourceId,
				type: 'line',
			});
		}
		map.setPaintProperty(sourceId, 'line-color', strokeColor);
		map.setPaintProperty(sourceId, 'line-width', strokeWidth);

		map.once('idle', () => {
			setIsReady(true);
			continueRender(loadingHandle);
		});
		map.triggerRepaint();
	}, [
		continueRender,
		glow,
		glowLayerId,
		loadingHandle,
		map,
		route,
		sourceId,
		strokeColor,
		strokeWidth,
	]);

	useEffect(() => {
		if (!isReady || !map) {
			return;
		}

		const frameHandle = delayRender(`Drawing ${feature.properties.name} route`);

		(map.getSource(sourceId) as GeoJSONSource).setData(
			lineSliceAlong(
				route,
				0,
				Math.max(0.001, routeLength * Math.min(1, Math.max(0, progress))),
			),
		);
		map.once('idle', () => continueRender(frameHandle));
		map.triggerRepaint();
	}, [
		continueRender,
		delayRender,
		feature.properties.name,
		isReady,
		map,
		progress,
		route,
		routeLength,
		sourceId,
	]);

	useEffect(() => {
		if (!map) {
			return;
		}

		return () => {
			if (map.getLayer(sourceId)) {
				map.removeLayer(sourceId);
			}

			if (map.getLayer(glowLayerId)) {
				map.removeLayer(glowLayerId);
			}

			if (map.getSource(sourceId)) {
				map.removeSource(sourceId);
			}

			map.triggerRepaint();
		};
	}, [glowLayerId, map, sourceId]);

	return null;
};

const MapRouteBounds = ({
	feature,
	refForOutline,
}: {
	readonly feature: MapRouteFeature;
	readonly refForOutline: RefObject<HTMLDivElement | null>;
}) => {
	const {map} = useContext(MapTilerContext);

	if (!map) {
		return <div ref={refForOutline} />;
	}

	const points = feature.geometry.coordinates.map(([longitude, latitude]) =>
		map.project([longitude, latitude]),
	);
	const left = Math.min(...points.map((point) => point.x));
	const right = Math.max(...points.map((point) => point.x));
	const top = Math.min(...points.map((point) => point.y));
	const bottom = Math.max(...points.map((point) => point.y));

	return (
		<div
			ref={refForOutline}
			style={{
				height: bottom - top,
				left,
				opacity: 0,
				pointerEvents: 'none',
				position: 'absolute',
				top,
				width: right - left,
				zIndex: 1,
			}}
		/>
	);
};

const MapRouteInner = forwardRef<
	HTMLDivElement,
	MapRouteProps & {
		readonly stack?: undefined;
	}
>(
	(
		{
			feature,
			glow = 0.72,
			id,
			progress = 1,
			strokeColor = '#006cff',
			strokeWidth = 9,
			durationInFrames,
			from,
			trimBefore,
			freeze,
			hidden,
			name,
			showInTimeline,
			controls,
			stack,
		},
		ref,
	) => {
		const refForOutline = useRef<HTMLDivElement>(null);

		useImperativeHandle(ref, () => refForOutline.current as HTMLDivElement, []);

		return (
			<Sequence
				layout="none"
				from={from ?? 0}
				trimBefore={trimBefore}
				durationInFrames={durationInFrames ?? Infinity}
				freeze={freeze}
				hidden={hidden}
				name={name ?? `<${feature.properties.name}>`}
				showInTimeline={showInTimeline ?? true}
				controls={controls}
				outlineRef={refForOutline}
				_remotionInternalStack={stack}
			>
				<MapRouteDrawing
					feature={feature}
					glow={glow}
					id={id}
					progress={progress}
					strokeColor={strokeColor}
					strokeWidth={strokeWidth}
				/>
				<MapRouteBounds feature={feature} refForOutline={refForOutline} />
			</Sequence>
		);
	},
);

export const MapRoute = Interactive.withSchema({
	Component: MapRouteInner,
	componentName: '<MapRoute>',
	componentIdentity: null,
	schema: mapRouteSchema,
	supportsEffects: false,
});
