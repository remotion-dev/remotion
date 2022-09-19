export type RemotionEnvironment =
	| 'preview'
	| 'rendering'
	| 'player-development'
	| 'player-production';

export const getRemotionEnvironment = (): RemotionEnvironment => {
	if (process.env.NODE_ENV === 'production') {
		if (typeof window !== 'undefined' && window.remotion_isPlayer) {
			return 'player-production';
		}

		return 'rendering';
	}

	// The Jest framework sets NODE_ENV as test.
	// Right now we don't need to treat it in a special
	// way which is good - defaulting to `rendering`.
	if (process.env.NODE_ENV === 'test') {
		return 'rendering';
	}

	if (typeof window !== 'undefined' && window.remotion_isPlayer) {
		return 'player-development';
	}

	return 'preview';
};
