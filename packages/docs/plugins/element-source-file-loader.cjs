/**
 * Webpack loader that exports an Element .tsx file as a trimmed string.
 * Used so MDX modules depend on the Element source and hot-reload when it changes.
 *
 * @param {string | Buffer} source
 * @returns {string}
 */
module.exports = function elementSourceFileLoader(source) {
	if (this.cacheable) {
		this.cacheable(true);
	}

	const text =
		typeof source === 'string' ? source : Buffer.from(source).toString('utf8');

	return `module.exports = ${JSON.stringify(text.trimEnd())}`;
};
