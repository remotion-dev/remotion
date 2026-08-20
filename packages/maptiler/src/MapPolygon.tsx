import {
	helpers,
	type GeoJSONSource,
	type PolygonLayerOptions,
} from '@maptiler/sdk';
import {useContext, useEffect, useMemo, useRef} from 'react';
import {
	Sequence,
	type InteractiveBaseProps,
	type SequenceControls,
	useDelayRender,
} from 'remotion';
import {delayMapRender} from './delay-map-render';
import {
	MapPolyline,
	type MapPolylineData,
	type MapPolylineFeature,
} from './MapPolyline';
import {MapTilerContext} from './MapTilerContext';

export type MapPolygonFeature = {
	readonly geometry:
		| {readonly coordinates: number[][][]; readonly type: 'Polygon'}
		| {readonly coordinates: number[][][][]; readonly type: 'MultiPolygon'};
	readonly properties: Record<string, unknown> | null;
	readonly type: 'Feature';
};

export type MapPolygonData = MapPolygonFeature | PolygonLayerOptions['data'];

export type MapPolygonProps = InteractiveBaseProps &
	Omit<
		PolygonLayerOptions,
		'data' | 'fillOpacity' | 'layerId' | 'outlinePosition' | 'sourceId'
	> & {
		readonly controls?: SequenceControls;
		readonly data: MapPolygonData;
		readonly fillOpacity?: number | PolygonLayerOptions['fillOpacity'];
		readonly layerId: string;
		readonly outlinePosition?: PolygonLayerOptions['outlinePosition'];
		readonly progress?: number;
		readonly sourceId?: string;
	};

type MapPolygonLayerIds = {
	readonly polygonLayerId: string;
	readonly polygonOutlineLayerId: string;
	readonly polygonSourceId: string;
};

const normalizeData = (data: MapPolygonData): PolygonLayerOptions['data'] => {
	if (typeof data === 'string' || data.type === 'FeatureCollection') {
		return data;
	}

	return {features: [data], type: 'FeatureCollection'};
};

const getOutlineData = (data: MapPolygonData): MapPolylineData | null => {
	if (typeof data === 'string') {
		return null;
	}

	const normalizedData = normalizeData(data);
	if (typeof normalizedData === 'string') {
		return null;
	}

	const features: MapPolylineFeature[] = [];
	for (const feature of normalizedData.features) {
		if (feature.geometry.type === 'Polygon') {
			for (const coordinates of feature.geometry.coordinates) {
				features.push({
					geometry: {coordinates, type: 'LineString'},
					properties: feature.properties,
					type: 'Feature',
				});
			}
		}

		if (feature.geometry.type === 'MultiPolygon') {
			for (const polygon of feature.geometry.coordinates) {
				for (const coordinates of polygon) {
					features.push({
						geometry: {coordinates, type: 'LineString'},
						properties: feature.properties,
						type: 'Feature',
					});
				}
			}
		}
	}

	return {features, type: 'FeatureCollection'};
};

const MapPolygonDrawing = ({
	beforeId,
	data,
	fillColor,
	fillOpacity,
	layerId,
	maxzoom,
	minzoom,
	outline,
	outlineBlur,
	outlineCap,
	outlineColor,
	outlineDashArray,
	outlineJoin,
	outlineOpacity,
	outlinePosition,
	outlineWidth,
	pattern,
	progress,
	sourceId = `${layerId}-source`,
}: MapPolygonProps) => {
	const {map, styleRevision} = useContext(MapTilerContext);
	const {continueRender, delayRender} = useDelayRender();
	const layerIdsRef = useRef<MapPolygonLayerIds | null>(null);
	const optionsRef = useRef<PolygonLayerOptions | null>(null);
	const fillColorIsDynamic = typeof fillColor === 'string';
	const fillOpacityIsDynamic = typeof fillOpacity === 'number';
	const outlineBlurIsDynamic = typeof outlineBlur === 'number';
	const outlineColorIsDynamic = typeof outlineColor === 'string';
	const outlineOpacityIsDynamic = typeof outlineOpacity === 'number';
	const outlineWidthIsDynamic = typeof outlineWidth === 'number';
	const shouldAnimateOutline = progress !== undefined;
	const outlineData = useMemo(
		() => (shouldAnimateOutline ? getOutlineData(data) : null),
		[data, shouldAnimateOutline],
	);
	const hasAnimatedOutline = outlineData !== null && outline !== false;
	const structuralKey = JSON.stringify({
		beforeId,
		data: typeof data === 'string' ? data : null,
		fillColor: fillColorIsDynamic ? null : fillColor,
		fillOpacity: fillOpacityIsDynamic ? null : fillOpacity,
		maxzoom,
		minzoom,
		outline,
		outlineBlur: outlineBlurIsDynamic ? null : outlineBlur,
		outlineCap,
		outlineColor: outlineColorIsDynamic ? null : outlineColor,
		outlineDashArray,
		outlineJoin,
		outlineOpacity: outlineOpacityIsDynamic ? null : outlineOpacity,
		outlinePosition,
		outlineWidth: outlineWidthIsDynamic ? null : outlineWidth,
		pattern,
		hasAnimatedOutline,
	});

	optionsRef.current = {
		...(beforeId === undefined ? {} : {beforeId}),
		data: normalizeData(data),
		...(fillColor === undefined ? {} : {fillColor}),
		...(fillOpacity === undefined || typeof fillOpacity === 'number'
			? {}
			: {fillOpacity}),
		layerId,
		...(maxzoom === undefined ? {} : {maxzoom}),
		...(minzoom === undefined ? {} : {minzoom}),
		...(hasAnimatedOutline
			? {outline: false}
			: outline === undefined
				? {}
				: {outline}),
		...(outlineBlur === undefined ? {} : {outlineBlur}),
		...(outlineCap === undefined ? {} : {outlineCap}),
		...(outlineColor === undefined ? {} : {outlineColor}),
		...(outlineDashArray === undefined ? {} : {outlineDashArray}),
		...(outlineJoin === undefined ? {} : {outlineJoin}),
		...(outlineOpacity === undefined ? {} : {outlineOpacity}),
		outlinePosition: outlinePosition ?? 'center',
		...(outlineWidth === undefined ? {} : {outlineWidth}),
		...(pattern === undefined ? {} : {pattern}),
		sourceId,
	};

	useEffect(() => {
		if (!map || !optionsRef.current) {
			return;
		}

		const loadingHandle = delayRender(`Loading MapTiler polygon ${layerId}`);
		let hasFinished = false;
		const finish = () => {
			if (hasFinished) {
				return;
			}

			hasFinished = true;
			continueRender(loadingHandle);
		};

		layerIdsRef.current = helpers.addPolygon(map, optionsRef.current);
		map.once('idle', finish);
		map.triggerRepaint();

		return () => {
			map.off('idle', finish);
			finish();
			const ids = layerIdsRef.current;
			if (!ids) {
				return;
			}

			for (const id of [ids.polygonOutlineLayerId, ids.polygonLayerId]) {
				if (id && map.getLayer(id)) {
					map.removeLayer(id);
				}
			}

			if (map.getSource(ids.polygonSourceId)) {
				map.removeSource(ids.polygonSourceId);
			}

			layerIdsRef.current = null;
			map.triggerRepaint();
		};
	}, [continueRender, delayRender, layerId, map, structuralKey, styleRevision]);

	useEffect(() => {
		if (!map || typeof data === 'string') {
			return;
		}

		const ids = layerIdsRef.current;
		if (ids && map.getSource(ids.polygonSourceId)) {
			(map.getSource(ids.polygonSourceId) as GeoJSONSource).setData(
				normalizeData(data),
			);
			return delayMapRender({
				continueRender,
				delayRender,
				label: `Updating MapTiler polygon source ${layerId}`,
				map,
			});
		}
	}, [continueRender, data, delayRender, layerId, map]);

	useEffect(() => {
		if (!map) {
			return;
		}

		const ids = layerIdsRef.current;
		if (!ids || !map.getLayer(ids.polygonLayerId)) {
			return;
		}

		if (fillColorIsDynamic) {
			map.setPaintProperty(ids.polygonLayerId, 'fill-color', fillColor);
		}

		if (fillOpacityIsDynamic) {
			map.setPaintProperty(ids.polygonLayerId, 'fill-opacity', fillOpacity);
		}

		if (ids.polygonOutlineLayerId && map.getLayer(ids.polygonOutlineLayerId)) {
			if (outlineBlurIsDynamic) {
				map.setPaintProperty(
					ids.polygonOutlineLayerId,
					'line-blur',
					outlineBlur,
				);
			}

			if (outlineColorIsDynamic) {
				map.setPaintProperty(
					ids.polygonOutlineLayerId,
					'line-color',
					outlineColor,
				);
			}

			if (outlineOpacityIsDynamic) {
				map.setPaintProperty(
					ids.polygonOutlineLayerId,
					'line-opacity',
					outlineOpacity,
				);
			}

			if (outlineWidthIsDynamic) {
				map.setPaintProperty(
					ids.polygonOutlineLayerId,
					'line-width',
					outlineWidth,
				);
			}
		}

		return delayMapRender({
			continueRender,
			delayRender,
			label: `Drawing MapTiler polygon ${layerId}`,
			map,
		});
	}, [
		continueRender,
		delayRender,
		fillColor,
		fillColorIsDynamic,
		fillOpacity,
		fillOpacityIsDynamic,
		layerId,
		map,
		outlineBlur,
		outlineBlurIsDynamic,
		outlineColor,
		outlineColorIsDynamic,
		outlineOpacity,
		outlineOpacityIsDynamic,
		outlineWidth,
		outlineWidthIsDynamic,
	]);

	if (!hasAnimatedOutline) {
		return null;
	}

	return (
		<MapPolyline
			beforeId={beforeId}
			data={outlineData}
			layerId={`${layerId}-outline`}
			lineBlur={outlineBlur}
			lineCap={outlineCap}
			lineColor={outlineColor ?? '#ffffff'}
			lineDashArray={outlineDashArray}
			lineJoin={outlineJoin}
			lineOpacity={outlineOpacity}
			lineWidth={outlineWidth}
			maxzoom={maxzoom}
			minzoom={minzoom}
			name="Map polygon outline"
			progress={progress}
			showInTimeline={false}
			sourceId={`${sourceId}-outline`}
		/>
	);
};

export const MapPolygon = (props: MapPolygonProps) => {
	const {
		controls,
		durationInFrames,
		freeze,
		from,
		hidden,
		name,
		showInTimeline,
		trimBefore,
	} = props;

	return (
		<Sequence
			layout="none"
			from={from ?? 0}
			trimBefore={trimBefore}
			durationInFrames={durationInFrames ?? Infinity}
			freeze={freeze}
			hidden={hidden}
			name={name ?? '<MapPolygon>'}
			showInTimeline={showInTimeline ?? true}
			controls={controls}
		>
			<MapPolygonDrawing {...props} />
		</Sequence>
	);
};
