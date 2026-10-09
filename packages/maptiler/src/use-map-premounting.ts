import {useCallback, useContext, useEffect, useRef} from 'react';
import {Internals} from 'remotion';
import {MapTilerContext} from './MapTilerContext';

// Generated layers have no DOM element to hide. Also apply this immediately
// after asynchronous layer creation, using the latest sequence state.
export const useMapPremounting = (getLayerIds: () => string[]) => {
	const {map} = useContext(MapTilerContext);
	const sequence = useContext(Internals.SequenceContext);
	const hidden = Boolean(sequence?.premounting || sequence?.postmounting);
	const hiddenRef = useRef(hidden);
	const layerIdsRef = useRef(getLayerIds);
	hiddenRef.current = hidden;
	layerIdsRef.current = getLayerIds;

	const applyPremountVisibility = useCallback(() => {
		if (!map) {
			return;
		}

		for (const id of layerIdsRef.current()) {
			if (!id || !map.getLayer(id)) {
				continue;
			}

			const visibility = hiddenRef.current ? 'none' : 'visible';
			if (map.getLayoutProperty(id, 'visibility') !== visibility) {
				map.setLayoutProperty(id, 'visibility', visibility);
			}
		}
	}, [map]);

	useEffect(() => {
		applyPremountVisibility();
	}, [applyPremountVisibility, hidden]);

	return applyPremountVisibility;
};
