import type {Map as MapTilerMap} from '@maptiler/sdk';
import {createContext, useContext} from 'react';

export type MapTilerContextValue = {
	readonly cameraRevision: number;
	readonly map: MapTilerMap | null;
	readonly styleRevision: number;
};

export const MapTilerContext = createContext<MapTilerContextValue>({
	cameraRevision: 0,
	map: null,
	styleRevision: 0,
});

export const useMapTiler = (): MapTilerContextValue => {
	return useContext(MapTilerContext);
};
