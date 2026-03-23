/**
 * Forked from css-loader v5.2.7
 * MIT License http://www.opensource.org/licenses/mit-license.php
 */
"use strict";

module.exports = function cssWithMappingToString(item) {
	var content = item[1];
	var cssMapping = item[3];

	if (!cssMapping) {
		return content;
	}

	if (typeof btoa === "function") {
		var base64 = btoa(
			unescape(encodeURIComponent(JSON.stringify(cssMapping))),
		);
		var data =
			"sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(
				base64,
			);
		var sourceMapping = "/*# ".concat(data, " */");

		var sourceURLs = cssMapping.sources.map(function (source) {
			return "/*# sourceURL="
				.concat(cssMapping.sourceRoot || "")
				.concat(source, " */");
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join("\n");
	}

	return [content].join("\n");
};
