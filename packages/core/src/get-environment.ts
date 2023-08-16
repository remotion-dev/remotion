import {useIsPlayer} from './is-player.js';

export type RemotionEnvironment = {
	isStudio: boolean;
	isRendering: boolean;
	isPlayer: boolean;
	isProduction: boolean;
};

export const getRemotionEnvironment = (): RemotionEnvironment => {
	if (process.env.NODE_ENV === 'production') {
		if (typeof window !== 'undefined' && window.remotion_isPlayer) {
			return {
				isStudio: false,
				isRendering: false,
				isPlayer: true,
				isProduction: true,
			};
		}

		return {
			isStudio: false,
			isRendering: true,
			isPlayer: false,
			isProduction: true,
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
			isProduction: false,
		};
	}

	if (typeof window !== 'undefined' && window.remotion_isPlayer) {
		return {
			isStudio: false,
			isRendering: false,
			isPlayer: true,
			isProduction: false,
		};
	}

	return {
		isStudio: true,
		isRendering: false,
		isPlayer: false,
		isProduction: false,
	};
};

export const useRemotionEnvironment = (): RemotionEnvironment => {
	const isPlayer = useIsPlayer();
	if (isPlayer) {
		if (process.env.NODE_ENV === 'production') {
			return {
				isStudio: false,
				isRendering: false,
				isPlayer: true,
				isProduction: true,
			};
		}

		return {
			isStudio: false,
			isRendering: false,
			isPlayer: true,
			isProduction: false,
		};
	}

	return getRemotionEnvironment();
};
