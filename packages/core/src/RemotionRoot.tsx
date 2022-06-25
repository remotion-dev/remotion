import React, {useEffect, useMemo, useState} from 'react';
import {SharedAudioContextProvider} from './audio/shared-audio-tags';
import {CompositionManagerProvider} from './CompositionManager';
import type {TNonceContext} from './nonce';
import {NonceContext} from './nonce';

export const RemotionRoot: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	const [fastRefreshes, setFastRefreshes] = useState(0);

	const nonceContext = useMemo((): TNonceContext => {
		let counter = 0;
		return {
			getNonce: () => counter++,
			fastRefreshes,
		};
	}, [fastRefreshes]);

	useEffect(() => {
		if (module.hot) {
			module.hot.addStatusHandler((status) => {
				if (status === 'idle') {
					setFastRefreshes((i) => i + 1);
				}
			});
		}
	}, []);

	return (
		<NonceContext.Provider value={nonceContext}>
			<CompositionManagerProvider>
				<SharedAudioContextProvider
					// In the preview, which is mostly played on Desktop, we opt out of the autoplay policy fix as described in https://github.com/remotion-dev/remotion/pull/554, as it mostly applies to mobile.
					numberOfAudioTags={0}
				>
					{children}
				</SharedAudioContextProvider>
			</CompositionManagerProvider>
		</NonceContext.Provider>
	);
};
