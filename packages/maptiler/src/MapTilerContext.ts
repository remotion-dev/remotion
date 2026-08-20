import type {Map as MapTilerMap} from '@maptiler/sdk';
import {createContext} from 'react';

export type MapTilerContextValue = {
	readonly cameraRevision: number;
	readonly map: MapTilerMap | null;
};

export const MapTilerContext = createContext<MapTilerContextValue>({
	cameraRevision: 0,
	map: null,
});
