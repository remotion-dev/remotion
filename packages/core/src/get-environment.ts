export type RemotionEnvironment =
	| 'preview'
	| 'rendering'
	| 'player-development'
	| 'player-production';

export const getRemotionEnvironment = (): RemotionEnvironment => {
	if (process.env.NODE_ENV === 'production') {
		if (window.remotion_isPlayer) {
			return 'player-production';
		}

		return 'rendering';
	}

	if (process.env.NODE_ENV === 'development') {
		if (window.remotion_isPlayer) {
			return 'player-development';
		}

		return 'preview';
	}

	// The Jest framework sets NODE_ENV as test.
	// Right now we don't need to treat it in a special
	// way which is good - defaulting to `rendering`.
	if (process.env.NODE_ENV === 'test') {
		return 'rendering';
	}

	throw new Error('Cannot determine Remotion environment');
};
