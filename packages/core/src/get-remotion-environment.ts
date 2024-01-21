export type RemotionEnvironment = {
	isStudio: boolean;
	isRendering: boolean;
	isPlayer: boolean;
};

/**
 * @description Provides information about the Remotion Environment
 * @see [Documentation](https://www.remotion.dev/docs/get-remotion-environment)
 */
export const getRemotionEnvironment = (): RemotionEnvironment => {
	const isPlayer = typeof window !== 'undefined' && window.remotion_isPlayer;
	const isRendering =
		process.env.NODE_ENV === 'test' ||
		(process.env.NODE_ENV === 'production' &&
			typeof window !== 'undefined' &&
			typeof window.remotion_puppeteerTimeout !== 'undefined');
	const isStudio = typeof window !== 'undefined' && window.remotion_isStudio;

	return {
		isStudio,
		isRendering,
		isPlayer,
	};
};
