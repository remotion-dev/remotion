import {
	helpers,
	type GeoJSONSource,
	type HeatmapLayerOptions,
} from '@maptiler/sdk';
import {useContext, useEffect, useRef} from 'react';
import {
	Sequence,
	type InteractiveBaseProps,
	type SequenceControls,
	useDelayRender,
} from 'remotion';
import {delayMapRender} from './delay-map-render';
import {MapTilerContext} from './MapTilerContext';

export type MapHeatmapProps = InteractiveBaseProps &
	Omit<HeatmapLayerOptions, 'layerId' | 'sourceId'> & {
		readonly controls?: SequenceControls;
		readonly layerId: string;
		readonly sourceId?: string;
	};

type MapHeatmapLayerIds = {
	readonly heatmapLayerId: string;
	readonly heatmapSourceId: string;
};

const MapHeatmapDrawing = ({
	beforeId,
	colorRamp,
	data,
	intensity,
	layerId,
	maxzoom,
	minzoom,
	opacity,
	property,
	radius,
	sourceId = `${layerId}-source`,
	weight,
	zoomCompensation,
}: MapHeatmapProps) => {
	const {map, styleRevision} = useContext(MapTilerContext);
	const {continueRender, delayRender} = useDelayRender();
	const layerIdsRef = useRef<MapHeatmapLayerIds | null>(null);
	const optionsRef = useRef<HeatmapLayerOptions | null>(null);
	const intensityIsDynamic = typeof intensity === 'number';
	const opacityIsDynamic = typeof opacity === 'number';
	const radiusIsDynamic = typeof radius === 'number';
	const structuralKey = JSON.stringify({
		beforeId,
		colorRamp,
		data: typeof data === 'string' ? data : null,
		intensity: intensityIsDynamic ? null : intensity,
		maxzoom,
		minzoom,
		opacity: opacityIsDynamic ? null : opacity,
		property,
		radius: radiusIsDynamic ? null : radius,
		weight,
		zoomCompensation,
	});

	optionsRef.current = {
		...(beforeId === undefined ? {} : {beforeId}),
		...(colorRamp === undefined ? {} : {colorRamp}),
		data,
		...(intensity === undefined ? {} : {intensity}),
		layerId,
		...(maxzoom === undefined ? {} : {maxzoom}),
		...(minzoom === undefined ? {} : {minzoom}),
		...(opacity === undefined ? {} : {opacity}),
		...(property === undefined ? {} : {property}),
		...(radius === undefined ? {} : {radius}),
		sourceId,
		...(weight === undefined ? {} : {weight}),
		...(zoomCompensation === undefined ? {} : {zoomCompensation}),
	};

	useEffect(() => {
		if (!map || !optionsRef.current) {
			return;
		}

		const loadingHandle = delayRender(`Loading MapTiler heatmap ${layerId}`);
		let hasFinished = false;
		const finish = () => {
			if (hasFinished) {
				return;
			}

			hasFinished = true;
			continueRender(loadingHandle);
		};

		layerIdsRef.current = helpers.addHeatmap(map, optionsRef.current);
		map.once('idle', finish);
		map.triggerRepaint();

		return () => {
			map.off('idle', finish);
			finish();
			const ids = layerIdsRef.current;
			if (!ids) {
				return;
			}

			if (map.getLayer(ids.heatmapLayerId)) {
				map.removeLayer(ids.heatmapLayerId);
			}

			if (map.getSource(ids.heatmapSourceId)) {
				map.removeSource(ids.heatmapSourceId);
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
		if (ids && map.getSource(ids.heatmapSourceId)) {
			(map.getSource(ids.heatmapSourceId) as GeoJSONSource).setData(data);
			return delayMapRender({
				continueRender,
				delayRender,
				label: `Updating MapTiler heatmap source ${layerId}`,
				map,
			});
		}
	}, [continueRender, data, delayRender, layerId, map]);

	useEffect(() => {
		if (!map) {
			return;
		}

		const id = layerIdsRef.current?.heatmapLayerId;
		if (!id || !map.getLayer(id)) {
			return;
		}

		if (intensityIsDynamic) {
			map.setPaintProperty(id, 'heatmap-intensity', intensity);
		}

		if (opacityIsDynamic) {
			map.setPaintProperty(id, 'heatmap-opacity', opacity);
		}

		if (radiusIsDynamic) {
			map.setPaintProperty(id, 'heatmap-radius', radius);
		}

		return delayMapRender({
			continueRender,
			delayRender,
			label: `Drawing MapTiler heatmap ${layerId}`,
			map,
		});
	}, [
		continueRender,
		delayRender,
		intensity,
		intensityIsDynamic,
		layerId,
		map,
		opacity,
		opacityIsDynamic,
		radius,
		radiusIsDynamic,
	]);

	return null;
};

export const MapHeatmap = (props: MapHeatmapProps) => {
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
			name={name ?? '<MapHeatmap>'}
			showInTimeline={showInTimeline ?? true}
			controls={controls}
		>
			<MapHeatmapDrawing {...props} />
		</Sequence>
	);
};
