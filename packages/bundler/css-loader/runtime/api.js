/**
 * Forked from css-loader v5.2.7
 * MIT License http://www.opensource.org/licenses/mit-license.php
 * Author Tobias Koppers @sokra
 */
"use strict";

// css base code, injected by the css-loader
module.exports = function (cssWithMappingToString) {
	var list = [];

	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item);

			if (item[2]) {
				return "@media ".concat(item[2], " {").concat(content, "}");
			}

			return content;
		}).join("");
	};

	list.i = function (modules, mediaQuery, dedupe) {
		if (typeof modules === "string") {
			modules = [[null, modules, ""]];
		}

		var alreadyImportedModules = {};

		if (dedupe) {
			for (var i = 0; i < this.length; i++) {
				var id = this[i][0];

				if (id != null) {
					alreadyImportedModules[id] = true;
				}
			}
		}

		for (var _i = 0; _i < modules.length; _i++) {
			var item = [].concat(modules[_i]);

			if (dedupe && alreadyImportedModules[item[0]]) {
				continue;
			}

			if (mediaQuery) {
				if (!item[2]) {
					item[2] = mediaQuery;
				} else {
					item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
				}
			}

			list.push(item);
		}
	};

	return list;
};
