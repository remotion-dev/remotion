import {useCallback, useContext} from 'react';
import {CompositionRenderErrorContext} from './composition-render-error-context.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';
import type {MediaPlaybackError} from './video/MediaPlaybackError.js';

export const useReportMediaPlaybackError = () => {
	const {setError} = useContext(CompositionRenderErrorContext);
	const {isStudio} = useRemotionEnvironment();

	return useCallback(
		({
			error,
			onError,
		}: {
			error: MediaPlaybackError;
			onError: ((error: Error) => void) | undefined;
		}) => {
			if (onError) {
				onError(error);
				return;
			}

			if (isStudio) {
				setError(error);
				return;
			}

			throw error;
		},
		[isStudio, setError],
	);
};
