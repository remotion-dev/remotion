import type {LayerSpecification} from '@maptiler/sdk';
import {useContext, useEffect, useRef} from 'react';
import {useDelayRender} from 'remotion';
import {MapTilerContext} from './MapTilerContext';

export type MapLayerProps = {
	readonly beforeId?: string;
	readonly layer: LayerSpecification;
};

export const MapLayer = ({beforeId, layer}: MapLayerProps) => {
	const {map, styleRevision} = useContext(MapTilerContext);
	const previousLayerRef = useRef<LayerSpecification | null>(null);
	const {continueRender, delayRender} = useDelayRender();

	useEffect(() => {
		if (!map) {
			return;
		}

		const loadingHandle = delayRender(`Drawing MapTiler layer ${layer.id}`);
		let hasFinished = false;
		const finish = () => {
			if (hasFinished) {
				return;
			}

			hasFinished = true;
			continueRender(loadingHandle);
		};

		const previousLayer = previousLayerRef.current;
		const existingLayer = map.getLayer(layer.id);
		const layerWithDefinedProperties = Object.fromEntries(
			Object.entries(layer).filter(([, value]) => value !== undefined),
		) as LayerSpecification;
		const sourceChanged =
			previousLayer !== null &&
			'source' in previousLayer &&
			'source' in layer &&
			(previousLayer.source !== layer.source ||
				previousLayer['source-layer'] !== layer['source-layer']);

		if (existingLayer && (existingLayer.type !== layer.type || sourceChanged)) {
			map.removeLayer(layer.id);
		}

		if (!map.getLayer(layer.id)) {
			map.addLayer(layerWithDefinedProperties, beforeId);
		} else {
			if ('paint' in layer || (previousLayer && 'paint' in previousLayer)) {
				const previousPaint =
					previousLayer && 'paint' in previousLayer
						? previousLayer.paint
						: undefined;
				const paint = 'paint' in layer ? layer.paint : undefined;
				for (const property of new Set([
					...Object.keys(previousPaint ?? {}),
					...Object.keys(paint ?? {}),
				])) {
					map.setPaintProperty(
						layer.id,
						property,
						(paint as Record<string, unknown> | undefined)?.[property] ?? null,
					);
				}
			}

			if ('layout' in layer || (previousLayer && 'layout' in previousLayer)) {
				const previousLayout =
					previousLayer && 'layout' in previousLayer
						? previousLayer.layout
						: undefined;
				const layout = 'layout' in layer ? layer.layout : undefined;
				for (const property of new Set([
					...Object.keys(previousLayout ?? {}),
					...Object.keys(layout ?? {}),
				])) {
					map.setLayoutProperty(
						layer.id,
						property,
						(layout as Record<string, unknown> | undefined)?.[property] ?? null,
					);
				}
			}

			if ('filter' in layer) {
				map.setFilter(layer.id, layer.filter ?? null);
			}

			map.setLayerZoomRange(layer.id, layer.minzoom ?? 0, layer.maxzoom ?? 24);

			if (beforeId && map.getLayer(beforeId)) {
				map.moveLayer(layer.id, beforeId);
			}
		}

		previousLayerRef.current = layer;
		map.once('idle', finish);
		map.triggerRepaint();

		return () => {
			map.off('idle', finish);
			finish();
		};
	}, [beforeId, continueRender, delayRender, layer, map, styleRevision]);

	useEffect(() => {
		if (!map) {
			return;
		}

		return () => {
			if (map.getLayer(layer.id)) {
				map.removeLayer(layer.id);
				map.triggerRepaint();
			}
		};
	}, [layer.id, map]);

	return null;
};
