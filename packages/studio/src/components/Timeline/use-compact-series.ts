import {useContext} from 'react';
import {Internals} from 'remotion';
import {getStudioShowPremounting} from '../../helpers/studio-runtime-config';

export const useCompactSeries = () => {
	const experimentalTracks = useContext(
		Internals.ExperimentalTracksEnabledContext,
	);
	const activitySettings = useContext(
		Internals.SequenceActivitySettingsContext,
	);
	return (
		experimentalTracks &&
		activitySettings?.enabled === true &&
		!getStudioShowPremounting()
	);
};
