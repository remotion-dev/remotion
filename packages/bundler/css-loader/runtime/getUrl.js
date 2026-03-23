/**
 * Forked from css-loader v5.2.7
 * MIT License http://www.opensource.org/licenses/mit-license.php
 */
"use strict";

module.exports = function (url, options) {
	if (!options) {
		options = {};
	}

	url = url && url.__esModule ? url.default : url;

	if (typeof url !== "string") {
		return url;
	}

	// If url is already wrapped in quotes, remove them
	if (/^['"].*['"]$/.test(url)) {
		url = url.slice(1, -1);
	}

	if (options.hash) {
		url += options.hash;
	}

	// Should url be wrapped?
	// See https://drafts.csswg.org/css-values-3/#urls
	if (/["'() \t\n]/.test(url) || options.needQuotes) {
		return '"'.concat(url.replace(/"/g, '\\"').replace(/\n/g, "\\n"), '"');
	}

	return url;
};
