export const getSkillPrefix = (): '$' | '/' => {
	const isInCodex =
		(typeof window !== 'undefined' && 'oai' in window && Boolean(window.oai)) ||
		(typeof document !== 'undefined' &&
			'oai' in document &&
			Boolean(document.oai));

	return isInCodex ? '$' : '/';
};
