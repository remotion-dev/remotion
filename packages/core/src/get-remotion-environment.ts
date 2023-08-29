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
	if (process.env.NODE_ENV === 'production') {
		// Check if inside a Remotion bundle.
		// Must be a variable in index-html.ts and be defined before setupEnvVariables()
		if (
			typeof window !== 'undefined' &&
			typeof window.remotion_editorName !== 'undefined' &&
			typeof window.remotion_projectName !== 'undefined'
		) {
			return {
				isStudio: false,
				isRendering: true,
				isPlayer: false,
			};
		}

		return {
			isStudio: false,
			isRendering: false,
			isPlayer: typeof window !== 'undefined' && window.remotion_isPlayer,
		};
	}

	// The Vitest framework sets NODE_ENV as test.
	// Right now we don't need to treat it in a special
	// way which is good - defaulting to `rendering`.
	if (process.env.NODE_ENV === 'test') {
		return {
			isStudio: false,
			isRendering: true,
			isPlayer: false,
		};
	}

	if (typeof window !== 'undefined' && window.remotion_isPlayer) {
		return {
			isStudio: false,
			isRendering: false,
			isPlayer: true,
		};
	}

	return {
		isStudio: true,
		isRendering: false,
		isPlayer: false,
	};
};
