export type RemotionEnvironment = {
	isStudio: boolean;
	isRendering: boolean;
	isPlayer: boolean;
};

// Avoid VITE obfuscation
function getNodeEnvString() {
	return ['NOD', 'E_EN', 'V'].join('');
}

const getEnvString = (): 'env' => {
	return ['e', 'nv'].join('') as 'env';
};

/**
 * @description Provides information about the Remotion Environment
 * @see [Documentation](https://www.remotion.dev/docs/get-remotion-environment)
 */
export const getRemotionEnvironment = (): RemotionEnvironment => {
	const isPlayer = typeof window !== 'undefined' && window.remotion_isPlayer;
	const isRendering =
		typeof window !== 'undefined' &&
		typeof window.process !== 'undefined' &&
		typeof window.process.env !== 'undefined' &&
		(window.process[getEnvString()][getNodeEnvString()] === 'test' ||
			(window.process[getEnvString()][getNodeEnvString()] === 'production' &&
				typeof window !== 'undefined' &&
				typeof window.remotion_puppeteerTimeout !== 'undefined'));
	const isStudio = typeof window !== 'undefined' && window.remotion_isStudio;

	return {
		isStudio,
		isRendering,
		isPlayer,
	};
};
