import {getIsRendering} from './is-rendering.js';
import type {RemotionEnvironment} from './remotion-environment-context';

/*
 * @description Provides information about the Remotion Environment.
 * @note Prefer using the `useRemotionEnvironment()` hook as it will support future scoped contexts for browser rendering scenarios.
 * @see [Documentation](https://remotion.dev/docs/get-remotion-environment)
 */
export const getRemotionEnvironment = (): RemotionEnvironment => {
	const isPlayer = typeof window !== 'undefined' && window.remotion_isPlayer;
	const isRendering = getIsRendering();
	const isStudio = typeof window !== 'undefined' && window.remotion_isStudio;
	const isReadOnlyStudio =
		typeof window !== 'undefined' && window.remotion_isReadOnlyStudio;

	return {
		isStudio,
		isRendering,
		isPlayer,
		isReadOnlyStudio,
		isClientSideRendering: false,
	};
};
