const path = require('path');

/**
 * @returns {import("@docusaurus/types").Plugin}
 */
function theme() {
	return {
		name: 'docusaurus-theme-shiki-twoslash',
		getThemePath() {
			return path.resolve(__dirname, './theme');
		},
		getClientModules() {
			return [path.resolve(__dirname, './client.js')];
		},
	};
}

module.exports = theme;
