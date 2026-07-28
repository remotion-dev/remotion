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

export type MapRegionFeature = {
	type: 'Feature';
	properties: {name: string; source: string};
	geometry: {type: 'Polygon'; coordinates: number[][][]};
};

type MapRegionProps = InteractiveBaseProps & {
	readonly controls?: SequenceControls;
	readonly feature: MapRegionFeature;
	readonly fill?: number;
	readonly fillColor: string;
	readonly glow?: number;
	readonly id: string;
	readonly progress?: number;
	readonly stack?: string;
	readonly strokeColor?: string;
	readonly strokeWidth?: number;
};

const mapRegionSchema = {
	...Interactive.baseSchema,
	fill: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: 0,
		description: 'Fill opacity',
		hiddenFromList: false,
	},
	fillColor: {
		type: 'color',
		default: '#d52b1e',
		description: 'Fill color',
		keyframable: true,
	},
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
		description: 'Outline drawing progress',
		hiddenFromList: false,
	},
	strokeColor: {
		type: 'color',
		default: '#8f1712',
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

type MapRegionDrawingProps = Pick<
	MapRegionProps,
	| 'feature'
	| 'fill'
	| 'fillColor'
	| 'glow'
	| 'id'
	| 'progress'
	| 'strokeColor'
	| 'strokeWidth'
>;

const MapRegionDrawing = ({
	feature,
	fill = 0,
	fillColor,
	glow = 0.72,
	id,
	progress = 1,
	strokeColor = '#8f1712',
	strokeWidth = 9,
}: MapRegionDrawingProps) => {
	const {map} = useContext(MapTilerContext);
	const {continueRender, delayRender} = useDelayRender();
	const [isReady, setIsReady] = useState(false);
	const [loadingHandle] = useState(() =>
		delayRender(`Loading ${feature.properties.name} geometry`),
	);
	const outline = useMemo(
		() => lineString(feature.geometry.coordinates[0]),
		[feature],
	);
	const outlineLength = useMemo(() => getLineLength(outline), [outline]);
	const fillSourceId = `${id}-fill`;
	const outlineSourceId = `${id}-outline`;
	const outlineGlowLayerId = `${id}-outline-glow`;

	useEffect(() => {
		if (!map) {
			return;
		}

		if (!map.getSource(fillSourceId)) {
			map.addSource(fillSourceId, {
				data: feature,
				type: 'geojson',
			});
		}

		if (!map.getLayer(fillSourceId)) {
			map.addLayer({
				id: fillSourceId,
				paint: {
					'fill-color': fillColor,
					'fill-opacity': 0,
				},
				source: fillSourceId,
				type: 'fill',
			});
		}
		map.setPaintProperty(fillSourceId, 'fill-color', fillColor);

		if (!map.getSource(outlineSourceId)) {
			map.addSource(outlineSourceId, {
				data: lineSliceAlong(outline, 0, 0.001),
				type: 'geojson',
			});
		}

		if (!map.getLayer(outlineGlowLayerId)) {
			map.addLayer({
				id: outlineGlowLayerId,
				layout: {'line-cap': 'round', 'line-join': 'round'},
				paint: {
					'line-blur': 8,
					'line-color': '#ffffff',
					'line-opacity': glow,
					'line-width': 22,
				},
				source: outlineSourceId,
				type: 'line',
			});
		}
		map.setPaintProperty(
			outlineGlowLayerId,
			'line-opacity',
			Math.min(1, Math.max(0, glow)),
		);

		if (!map.getLayer(outlineSourceId)) {
			map.addLayer({
				id: outlineSourceId,
				layout: {'line-cap': 'round', 'line-join': 'round'},
				paint: {
					'line-color': strokeColor,
					'line-opacity': 1,
					'line-width': strokeWidth,
				},
				source: outlineSourceId,
				type: 'line',
			});
		}
		map.setPaintProperty(outlineSourceId, 'line-color', strokeColor);
		map.setPaintProperty(outlineSourceId, 'line-width', strokeWidth);

		map.once('idle', () => {
			setIsReady(true);
			continueRender(loadingHandle);
		});
		map.triggerRepaint();
	}, [
		continueRender,
		feature,
		fillColor,
		fillSourceId,
		glow,
		loadingHandle,
		map,
		outline,
		outlineGlowLayerId,
		outlineSourceId,
		strokeColor,
		strokeWidth,
	]);

	useEffect(() => {
		if (!isReady || !map) {
			return;
		}

		const frameHandle = delayRender(`Drawing ${feature.properties.name}`);

		(map.getSource(outlineSourceId) as GeoJSONSource).setData(
			lineSliceAlong(
				outline,
				0,
				Math.max(0.001, outlineLength * Math.min(1, Math.max(0, progress))),
			),
		);
		map.setPaintProperty(
			fillSourceId,
			'fill-opacity',
			Math.min(1, Math.max(0, fill)),
		);
		map.once('idle', () => continueRender(frameHandle));
		map.triggerRepaint();
	}, [
		continueRender,
		delayRender,
		feature.properties.name,
		fill,
		fillSourceId,
		isReady,
		map,
		outline,
		outlineLength,
		outlineSourceId,
		progress,
	]);

	useEffect(() => {
		if (!map) {
			return;
		}

		return () => {
			if (map.getLayer(outlineSourceId)) {
				map.removeLayer(outlineSourceId);
			}

			if (map.getLayer(outlineGlowLayerId)) {
				map.removeLayer(outlineGlowLayerId);
			}

			if (map.getLayer(fillSourceId)) {
				map.removeLayer(fillSourceId);
			}

			if (map.getSource(outlineSourceId)) {
				map.removeSource(outlineSourceId);
			}

			if (map.getSource(fillSourceId)) {
				map.removeSource(fillSourceId);
			}

			map.triggerRepaint();
		};
	}, [fillSourceId, map, outlineGlowLayerId, outlineSourceId]);

	return null;
};

const MapRegionBounds = ({
	feature,
	refForOutline,
}: {
	readonly feature: MapRegionFeature;
	readonly refForOutline: RefObject<HTMLDivElement | null>;
}) => {
	const {map} = useContext(MapTilerContext);

	if (!map) {
		return <div ref={refForOutline} />;
	}

	const points = feature.geometry.coordinates
		.flat()
		.map(([longitude, latitude]) => map.project([longitude, latitude]));
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

const MapRegionInner = forwardRef<
	HTMLDivElement,
	MapRegionProps & {
		readonly stack?: undefined;
	}
>(
	(
		{
			feature,
			fill = 0,
			fillColor,
			glow = 0.72,
			id,
			progress = 1,
			strokeColor = '#8f1712',
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
				<MapRegionDrawing
					feature={feature}
					fill={fill}
					fillColor={fillColor}
					glow={glow}
					id={id}
					progress={progress}
					strokeColor={strokeColor}
					strokeWidth={strokeWidth}
				/>
				<MapRegionBounds feature={feature} refForOutline={refForOutline} />
			</Sequence>
		);
	},
);

export const MapRegion = Interactive.withSchema({
	Component: MapRegionInner,
	componentName: '<MapRegion>',
	componentIdentity: null,
	schema: mapRegionSchema,
	supportsEffects: false,
});
