import {
	helpers,
	type GeoJSONSource,
	type PolylineLayerOptions,
} from '@maptiler/sdk';
import {length as getLineLength, lineSliceAlong, lineString} from '@turf/turf';
import {useContext, useEffect, useRef, useState} from 'react';
import {
	Sequence,
	type InteractiveBaseProps,
	type SequenceControls,
	useDelayRender,
} from 'remotion';
import {delayMapRender} from './delay-map-render';
import {MapTilerContext} from './MapTilerContext';

export type MapPolylineFeature = {
	readonly geometry:
		| {readonly coordinates: number[][]; readonly type: 'LineString'}
		| {readonly coordinates: number[][][]; readonly type: 'MultiLineString'};
	readonly properties: Record<string, unknown> | null;
	readonly type: 'Feature';
};

export type MapPolylineData = MapPolylineFeature | PolylineLayerOptions['data'];

export type MapPolylineProps = InteractiveBaseProps &
	Omit<PolylineLayerOptions, 'data' | 'layerId' | 'sourceId'> & {
		readonly controls?: SequenceControls;
		readonly data: MapPolylineData;
		readonly layerId: string;
		readonly progress?: number;
		readonly sourceId?: string;
	};

type MapPolylineLayerIds = {
	readonly polylineLayerId: string;
	readonly polylineOutlineLayerId: string;
	readonly polylineSourceId: string;
};

const normalizeData = (data: MapPolylineData): PolylineLayerOptions['data'] => {
	if (typeof data === 'string' || data.type === 'FeatureCollection') {
		return data;
	}

	return {features: [data], type: 'FeatureCollection'};
};

const revealData = (
	data: MapPolylineData,
	progress: number,
): PolylineLayerOptions['data'] => {
	if (typeof data === 'string') {
		return data;
	}

	const normalizedData = normalizeData(data);
	if (typeof normalizedData === 'string') {
		return normalizedData;
	}

	const lineCoordinates = normalizedData.features.flatMap((feature) => {
		if (feature.geometry.type === 'LineString') {
			return [feature.geometry.coordinates];
		}

		if (feature.geometry.type === 'MultiLineString') {
			return feature.geometry.coordinates;
		}

		return [];
	});
	const lines = lineCoordinates.map((coordinates) => lineString(coordinates));
	const lineLengths = lines.map((line) => getLineLength(line));
	let remainingLength =
		lineLengths.reduce((sum, lineLength) => sum + lineLength, 0) *
		Math.min(1, Math.max(0, progress));
	let lineIndex = 0;

	return {
		...normalizedData,
		features: normalizedData.features.map((feature) => {
			if (
				feature.geometry.type !== 'LineString' &&
				feature.geometry.type !== 'MultiLineString'
			) {
				return feature;
			}

			const featureLines =
				feature.geometry.type === 'LineString'
					? [feature.geometry.coordinates]
					: feature.geometry.coordinates;
			const revealedLines = featureLines.map(() => {
				const line = lines[lineIndex];
				const lineLength = lineLengths[lineIndex];
				lineIndex++;
				const revealedLength = Math.min(lineLength, remainingLength);
				remainingLength = Math.max(0, remainingLength - lineLength);
				return lineSliceAlong(line, 0, Math.max(0.001, revealedLength)).geometry
					.coordinates;
			});

			return {
				...feature,
				geometry:
					feature.geometry.type === 'LineString'
						? {coordinates: revealedLines[0], type: 'LineString' as const}
						: {
								coordinates: revealedLines,
								type: 'MultiLineString' as const,
							},
			};
		}),
	};
};

const MapPolylineDrawing = ({
	beforeId,
	data,
	layerId,
	lineBlur,
	lineCap,
	lineColor,
	lineDashArray,
	lineGapWidth,
	lineJoin,
	lineOpacity,
	lineWidth,
	maxzoom,
	minzoom,
	outline,
	outlineBlur,
	outlineColor,
	outlineOpacity,
	outlineWidth,
	progress = 1,
	sourceId = `${layerId}-source`,
}: MapPolylineProps) => {
	const {map, styleRevision} = useContext(MapTilerContext);
	const {cancelRender, continueRender, delayRender} = useDelayRender();
	const layerIdsRef = useRef<MapPolylineLayerIds | null>(null);
	const optionsRef = useRef<PolylineLayerOptions | null>(null);
	const [layerRevision, setLayerRevision] = useState(0);
	const lineBlurIsDynamic = typeof lineBlur === 'number';
	const lineColorIsDynamic = typeof lineColor === 'string';
	const lineGapWidthIsDynamic = typeof lineGapWidth === 'number';
	const lineOpacityIsDynamic = typeof lineOpacity === 'number';
	const lineWidthIsDynamic = typeof lineWidth === 'number';
	const outlineBlurIsDynamic = typeof outlineBlur === 'number';
	const outlineColorIsDynamic = typeof outlineColor === 'string';
	const outlineOpacityIsDynamic = typeof outlineOpacity === 'number';
	const outlineWidthIsDynamic = typeof outlineWidth === 'number';
	const structuralKey = JSON.stringify({
		beforeId,
		data: typeof data === 'string' ? data : null,
		lineBlur: lineBlurIsDynamic ? null : lineBlur,
		lineCap,
		lineColor: lineColorIsDynamic ? null : lineColor,
		lineDashArray,
		lineGapWidth: lineGapWidthIsDynamic ? null : lineGapWidth,
		lineJoin,
		lineOpacity: lineOpacityIsDynamic ? null : lineOpacity,
		lineWidth: lineWidthIsDynamic ? null : lineWidth,
		maxzoom,
		minzoom,
		outline,
		outlineBlur: outlineBlurIsDynamic ? null : outlineBlur,
		outlineColor: outlineColorIsDynamic ? null : outlineColor,
		outlineOpacity: outlineOpacityIsDynamic ? null : outlineOpacity,
		outlineWidth: outlineWidthIsDynamic ? null : outlineWidth,
	});

	optionsRef.current = {
		...(beforeId === undefined ? {} : {beforeId}),
		data: revealData(data, progress),
		layerId,
		...(lineBlur === undefined ? {} : {lineBlur}),
		...(lineCap === undefined ? {} : {lineCap}),
		...(lineColor === undefined ? {} : {lineColor}),
		...(lineDashArray === undefined ? {} : {lineDashArray}),
		...(lineGapWidth === undefined ? {} : {lineGapWidth}),
		...(lineJoin === undefined ? {} : {lineJoin}),
		...(lineOpacity === undefined ? {} : {lineOpacity}),
		...(lineWidth === undefined ? {} : {lineWidth}),
		...(maxzoom === undefined ? {} : {maxzoom}),
		...(minzoom === undefined ? {} : {minzoom}),
		...(outline === undefined ? {} : {outline}),
		...(outlineBlur === undefined ? {} : {outlineBlur}),
		...(outlineColor === undefined ? {} : {outlineColor}),
		...(outlineOpacity === undefined ? {} : {outlineOpacity}),
		...(outlineWidth === undefined ? {} : {outlineWidth}),
		sourceId,
	};

	useEffect(() => {
		if (!map || !optionsRef.current) {
			return;
		}

		const loadingHandle = delayRender(`Loading MapTiler polyline ${layerId}`);
		let hasFinished = false;
		let hasCancelled = false;
		const finish = () => {
			if (hasFinished) {
				return;
			}

			hasFinished = true;
			continueRender(loadingHandle);
		};

		const removeLayers = (ids: MapPolylineLayerIds) => {
			for (const id of [ids.polylineLayerId, ids.polylineOutlineLayerId]) {
				if (id && map.getLayer(id)) {
					map.removeLayer(id);
				}
			}

			if (map.getSource(ids.polylineSourceId)) {
				map.removeSource(ids.polylineSourceId);
			}
		};

		helpers
			.addPolyline(map, optionsRef.current)
			.then((ids) => {
				if (hasCancelled) {
					removeLayers(ids);
					finish();
					return;
				}

				layerIdsRef.current = ids;
				setLayerRevision((revision) => revision + 1);
				map.once('idle', finish);
				map.triggerRepaint();
			})
			.catch((error) => {
				finish();
				if (!hasCancelled) {
					cancelRender(error);
				}
			});

		return () => {
			hasCancelled = true;
			map.off('idle', finish);
			finish();
			const ids = layerIdsRef.current;
			if (ids) {
				removeLayers(ids);
				layerIdsRef.current = null;
				map.triggerRepaint();
			}
		};
	}, [
		cancelRender,
		continueRender,
		delayRender,
		layerId,
		map,
		structuralKey,
		styleRevision,
	]);

	useEffect(() => {
		if (!map || typeof data === 'string') {
			return;
		}

		const ids = layerIdsRef.current;
		if (ids && map.getSource(ids.polylineSourceId)) {
			(map.getSource(ids.polylineSourceId) as GeoJSONSource).setData(
				revealData(data, progress),
			);
			return delayMapRender({
				continueRender,
				delayRender,
				label: `Drawing MapTiler polyline ${layerId}`,
				map,
			});
		}
	}, [
		continueRender,
		data,
		delayRender,
		layerId,
		layerRevision,
		map,
		progress,
	]);

	useEffect(() => {
		if (!map) {
			return;
		}

		const ids = layerIdsRef.current;
		if (!ids || !map.getLayer(ids.polylineLayerId)) {
			return;
		}

		if (lineBlurIsDynamic) {
			map.setPaintProperty(ids.polylineLayerId, 'line-blur', lineBlur);
		}

		if (lineColorIsDynamic) {
			map.setPaintProperty(ids.polylineLayerId, 'line-color', lineColor);
		}

		if (lineGapWidthIsDynamic) {
			map.setPaintProperty(ids.polylineLayerId, 'line-gap-width', lineGapWidth);
		}

		if (lineOpacityIsDynamic) {
			map.setPaintProperty(ids.polylineLayerId, 'line-opacity', lineOpacity);
		}

		if (lineWidthIsDynamic) {
			map.setPaintProperty(ids.polylineLayerId, 'line-width', lineWidth);
		}

		if (
			ids.polylineOutlineLayerId &&
			map.getLayer(ids.polylineOutlineLayerId)
		) {
			if (outlineBlurIsDynamic) {
				map.setPaintProperty(
					ids.polylineOutlineLayerId,
					'line-blur',
					outlineBlur,
				);
			}

			if (outlineColorIsDynamic) {
				map.setPaintProperty(
					ids.polylineOutlineLayerId,
					'line-color',
					outlineColor,
				);
			}

			if (outlineOpacityIsDynamic) {
				map.setPaintProperty(
					ids.polylineOutlineLayerId,
					'line-opacity',
					outlineOpacity,
				);
			}

			if (outlineWidthIsDynamic && lineWidthIsDynamic) {
				map.setPaintProperty(
					ids.polylineOutlineLayerId,
					'line-width',
					lineWidth + outlineWidth * 2,
				);
			}
		}

		return delayMapRender({
			continueRender,
			delayRender,
			label: `Styling MapTiler polyline ${layerId}`,
			map,
		});
	}, [
		continueRender,
		delayRender,
		lineBlur,
		lineBlurIsDynamic,
		lineColor,
		lineColorIsDynamic,
		lineGapWidth,
		lineGapWidthIsDynamic,
		lineOpacity,
		lineOpacityIsDynamic,
		lineWidth,
		lineWidthIsDynamic,
		layerId,
		layerRevision,
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

	return null;
};

export const MapPolyline = (props: MapPolylineProps) => {
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
			name={name ?? '<MapPolyline>'}
			showInTimeline={showInTimeline ?? true}
			controls={controls}
		>
			<MapPolylineDrawing {...props} />
		</Sequence>
	);
};
