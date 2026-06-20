// Avoid VITE obfuscation
const getNodeEnvString = () => ['NOD', 'E_EN', 'V'].join('');

const getEnvString = (): 'env' => ['e', 'nv'].join('') as 'env';

export const getIsRendering = () => {
	return (
		typeof window !== 'undefined' &&
		typeof window.process !== 'undefined' &&
		typeof window.process.env !== 'undefined' &&
		(window.process[getEnvString()][getNodeEnvString()] === 'test' ||
			(window.process[getEnvString()][getNodeEnvString()] === 'production' &&
				typeof window.remotion_puppeteerTimeout !== 'undefined'))
	);
};
