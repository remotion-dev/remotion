import {
	helpers,
	type GeoJSONSource,
	type PointLayerOptions,
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

export type MapPointProps = InteractiveBaseProps &
	Omit<PointLayerOptions, 'layerId' | 'sourceId'> & {
		readonly controls?: SequenceControls;
		readonly layerId: string;
		readonly sourceId?: string;
	};

type MapPointLayerIds = {
	readonly clusterLayerId: string;
	readonly labelLayerId: string;
	readonly pointLayerId: string;
	readonly pointSourceId: string;
};

const MapPointDrawing = ({
	alignOnViewport,
	beforeId,
	cluster,
	data,
	labelColor,
	labelSize,
	layerId,
	maxPointRadius,
	maxzoom,
	minPointRadius,
	minzoom,
	outline,
	outlineColor,
	outlineOpacity,
	outlineWidth,
	pointColor,
	pointOpacity,
	pointRadius,
	property,
	showLabel,
	sourceId = `${layerId}-source`,
	zoomCompensation,
}: MapPointProps) => {
	const {map, styleRevision} = useContext(MapTilerContext);
	const {continueRender, delayRender} = useDelayRender();
	const layerIdsRef = useRef<MapPointLayerIds | null>(null);
	const optionsRef = useRef<PointLayerOptions | null>(null);
	const outlineColorIsDynamic = typeof outlineColor === 'string';
	const outlineOpacityIsDynamic = typeof outlineOpacity === 'number';
	const outlineWidthIsDynamic = typeof outlineWidth === 'number';
	const pointColorIsDynamic = typeof pointColor === 'string';
	const pointOpacityIsDynamic = typeof pointOpacity === 'number';
	const pointRadiusIsDynamic = typeof pointRadius === 'number';
	const structuralKey = JSON.stringify({
		alignOnViewport,
		beforeId,
		cluster,
		data: typeof data === 'string' ? data : null,
		maxPointRadius,
		maxzoom,
		minPointRadius,
		minzoom,
		outline,
		outlineColor: outlineColorIsDynamic ? null : outlineColor,
		outlineOpacity: outlineOpacityIsDynamic ? null : outlineOpacity,
		outlineWidth: outlineWidthIsDynamic ? null : outlineWidth,
		pointColor: pointColorIsDynamic ? null : pointColor,
		pointOpacity: pointOpacityIsDynamic ? null : pointOpacity,
		pointRadius: pointRadiusIsDynamic ? null : pointRadius,
		property,
		showLabel,
		zoomCompensation,
	});

	optionsRef.current = {
		...(alignOnViewport === undefined ? {} : {alignOnViewport}),
		...(beforeId === undefined ? {} : {beforeId}),
		...(cluster === undefined ? {} : {cluster}),
		data,
		...(labelColor === undefined ? {} : {labelColor}),
		...(labelSize === undefined ? {} : {labelSize}),
		layerId,
		...(maxPointRadius === undefined ? {} : {maxPointRadius}),
		...(maxzoom === undefined ? {} : {maxzoom}),
		...(minPointRadius === undefined ? {} : {minPointRadius}),
		...(minzoom === undefined ? {} : {minzoom}),
		...(outline === undefined ? {} : {outline}),
		...(outlineColor === undefined ? {} : {outlineColor}),
		...(outlineOpacity === undefined ? {} : {outlineOpacity}),
		...(outlineWidth === undefined ? {} : {outlineWidth}),
		...(pointColor === undefined ? {} : {pointColor}),
		...(pointOpacity === undefined ? {} : {pointOpacity}),
		...(pointRadius === undefined ? {} : {pointRadius}),
		...(property === undefined ? {} : {property}),
		...(showLabel === undefined ? {} : {showLabel}),
		sourceId,
		...(zoomCompensation === undefined ? {} : {zoomCompensation}),
	};

	useEffect(() => {
		if (!map || !optionsRef.current) {
			return;
		}

		const loadingHandle = delayRender(
			`Loading MapTiler point layer ${layerId}`,
		);
		let hasFinished = false;
		const finish = () => {
			if (hasFinished) {
				return;
			}

			hasFinished = true;
			continueRender(loadingHandle);
		};

		layerIdsRef.current = helpers.addPoint(map, optionsRef.current);
		map.once('idle', finish);
		map.triggerRepaint();

		return () => {
			map.off('idle', finish);
			finish();
			const ids = layerIdsRef.current;
			if (!ids) {
				return;
			}

			for (const id of [
				ids.labelLayerId,
				ids.clusterLayerId,
				ids.pointLayerId,
			]) {
				if (id && map.getLayer(id)) {
					map.removeLayer(id);
				}
			}

			if (map.getSource(ids.pointSourceId)) {
				map.removeSource(ids.pointSourceId);
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
		if (ids && map.getSource(ids.pointSourceId)) {
			(map.getSource(ids.pointSourceId) as GeoJSONSource).setData(data);
			return delayMapRender({
				continueRender,
				delayRender,
				label: `Updating MapTiler point source ${layerId}`,
				map,
			});
		}
	}, [continueRender, data, delayRender, layerId, map]);

	useEffect(() => {
		if (!map) {
			return;
		}

		const ids = layerIdsRef.current;
		if (!ids) {
			return;
		}

		for (const id of [ids.pointLayerId, ids.clusterLayerId]) {
			if (!id || !map.getLayer(id)) {
				continue;
			}

			if (pointColorIsDynamic) {
				map.setPaintProperty(id, 'circle-color', pointColor);
			}

			if (pointOpacityIsDynamic) {
				map.setPaintProperty(id, 'circle-opacity', pointOpacity);
			}

			if (pointRadiusIsDynamic) {
				map.setPaintProperty(id, 'circle-radius', pointRadius);
			}

			if (outlineColorIsDynamic) {
				map.setPaintProperty(id, 'circle-stroke-color', outlineColor);
			}

			if (outlineOpacityIsDynamic) {
				map.setPaintProperty(id, 'circle-stroke-opacity', outlineOpacity);
			}

			if (outlineWidthIsDynamic) {
				map.setPaintProperty(id, 'circle-stroke-width', outlineWidth);
			}
		}

		if (ids.labelLayerId && map.getLayer(ids.labelLayerId)) {
			if (labelColor !== undefined) {
				map.setPaintProperty(ids.labelLayerId, 'text-color', labelColor);
			}

			if (labelSize !== undefined) {
				map.setLayoutProperty(ids.labelLayerId, 'text-size', labelSize);
			}
		}

		return delayMapRender({
			continueRender,
			delayRender,
			label: `Drawing MapTiler point layer ${layerId}`,
			map,
		});
	}, [
		continueRender,
		delayRender,
		labelColor,
		labelSize,
		layerId,
		map,
		outlineColor,
		outlineColorIsDynamic,
		outlineOpacity,
		outlineOpacityIsDynamic,
		outlineWidth,
		outlineWidthIsDynamic,
		pointColor,
		pointColorIsDynamic,
		pointOpacity,
		pointOpacityIsDynamic,
		pointRadius,
		pointRadiusIsDynamic,
	]);

	return null;
};

export const MapPoint = (props: MapPointProps) => {
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
			name={name ?? '<MapPoint>'}
			showInTimeline={showInTimeline ?? true}
			controls={controls}
		>
			<MapPointDrawing {...props} />
		</Sequence>
	);
};
