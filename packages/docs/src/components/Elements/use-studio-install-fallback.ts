import {useCallback, useState} from 'react';

export const useStudioInstallFallback = (actionLabel: string) => {
	const [fallbackState, setFallbackState] = useState({
		failureCount: 0,
		isOpen: false,
	});

	const showFallback = useCallback(() => {
		setFallbackState((state) => ({
			failureCount: state.failureCount + 1,
			isOpen: true,
		}));
	}, []);

	const closeFallback = useCallback(() => {
		setFallbackState({failureCount: 0, isOpen: false});
	}, []);

	return {
		buttonLabel: fallbackState.failureCount > 1 ? 'Oops!' : actionLabel,
		closeFallback,
		failureCount: fallbackState.failureCount,
		isFallbackOpen: fallbackState.isOpen,
		showFallback,
	};
};
