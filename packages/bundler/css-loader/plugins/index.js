/**
 * Forked from css-loader v5.2.7
 * MIT License http://www.opensource.org/licenses/mit-license.php
 *
 * Removed ICSS parser (not used in Remotion).
 */
"use strict";

const importParser = require("./postcss-import-parser");
const urlParser = require("./postcss-url-parser");

exports.importParser = importParser;
exports.urlParser = urlParser;
