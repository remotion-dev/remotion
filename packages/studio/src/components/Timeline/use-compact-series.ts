import {useContext} from 'react';
import {Internals} from 'remotion';
import {getStudioShowPremounting} from '../../helpers/studio-runtime-config';

export const useCompactSeries = () => {
	const activitySettings = useContext(
		Internals.SequenceActivitySettingsContext,
	);
	return (
		(activitySettings?.limit ?? Internals.DEFAULT_SEQUENCE_ACTIVITY_LIMIT) >
			0 && !getStudioShowPremounting()
	);
};
