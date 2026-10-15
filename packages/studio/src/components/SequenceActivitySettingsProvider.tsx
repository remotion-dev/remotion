import React, {useContext, useEffect, useState} from 'react';
import {Internals} from 'remotion';
import {FastRefreshContext} from '../fast-refresh-context';
import {subscribeToPreviewServerEvents} from '../helpers/preview-server-events';
import {getStudioSequenceActivitySettings} from '../helpers/studio-runtime-config';

export const SequenceActivitySettingsProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [settings, setSettings] = useState(getStudioSequenceActivitySettings);
	const {fastRefreshes, manualRefreshes} = useContext(FastRefreshContext);

	useEffect(() => {
		return subscribeToPreviewServerEvents((event) => {
			if (event.type !== 'config-file-changed') {
				return;
			}

			const {
				experimentalSequenceActivityEnabled,
				experimentalSequenceActivityLimit,
			} = event.studioRuntimeConfig;
			setSettings((current) =>
				current.enabled === experimentalSequenceActivityEnabled &&
				current.limit === experimentalSequenceActivityLimit
					? current
					: {
							enabled: experimentalSequenceActivityEnabled,
							limit: experimentalSequenceActivityLimit,
						},
			);
		});
	}, []);

	return (
		<Internals.SequenceActivitySourceRevisionContext.Provider
			value={fastRefreshes + manualRefreshes}
		>
			<Internals.SequenceActivitySettingsContext.Provider value={settings}>
				{children}
			</Internals.SequenceActivitySettingsContext.Provider>
		</Internals.SequenceActivitySourceRevisionContext.Provider>
	);
};
