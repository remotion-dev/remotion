/**
 * Forked from css-loader v5.2.7
 * MIT License http://www.opensource.org/licenses/mit-license.php
 * Author Tobias Koppers @sokra
 *
 * Removed CSS Modules plugin dependencies (postcss-modules-*).
 */
"use strict";

const {fileURLToPath} = require("url");
const path = require("path");
const {urlToRequest} = require("loader-utils");

const WEBPACK_IGNORE_COMMENT_REGEXP = /webpackIgnore:(\s+)?(true|false)/;

exports.WEBPACK_IGNORE_COMMENT_REGEXP = WEBPACK_IGNORE_COMMENT_REGEXP;

// eslint-disable-next-line no-useless-escape
const regexSingleEscape = /[ -,.\/:-@[\]\^`{-~]/;
const regexExcessiveSpaces =
	/(^|\\+)?(\\[A-F0-9]{1,6})\x20(?![a-fA-F0-9\x20])/g;

function escape(string) {
	let output = "";
	let counter = 0;

	while (counter < string.length) {
		const character = string.charAt(counter++);
		let value;

		if (/[\t\n\f\r\x0B]/.test(character)) {
			const codePoint = character.charCodeAt();
			value = `\\${codePoint.toString(16).toUpperCase()} `;
		} else if (character === "\\" || regexSingleEscape.test(character)) {
			value = `\\${character}`;
		} else {
			value = character;
		}

		output += value;
	}

	const firstChar = string.charAt(0);

	if (/^-[-\d]/.test(output)) {
		output = `\\-${output.slice(1)}`;
	} else if (/\d/.test(firstChar)) {
		output = `\\3${firstChar} ${output.slice(1)}`;
	}

	output = output.replace(regexExcessiveSpaces, ($0, $1, $2) => {
		if ($1 && $1.length % 2) {
			return $0;
		}

		return ($1 || "") + $2;
	});
	return output;
}

exports.escape = escape;

function gobbleHex(str) {
	const lower = str.toLowerCase();
	let hex = "";
	let spaceTerminated = false;

	for (let i = 0; i < 6 && lower[i] !== undefined; i++) {
		const code = lower.charCodeAt(i);
		const valid = (code >= 97 && code <= 102) || (code >= 48 && code <= 57);
		spaceTerminated = code === 32;

		if (!valid) {
			break;
		}

		hex += lower[i];
	}

	if (hex.length === 0) {
		return undefined;
	}

	const codePoint = parseInt(hex, 16);
	const isSurrogate = codePoint >= 0xd800 && codePoint <= 0xdfff;

	if (isSurrogate || codePoint === 0x0000 || codePoint > 0x10ffff) {
		return ["\uFFFD", hex.length + (spaceTerminated ? 1 : 0)];
	}

	return [
		String.fromCodePoint(codePoint),
		hex.length + (spaceTerminated ? 1 : 0),
	];
}

const CONTAINS_ESCAPE = /\\/;

function unescape(str) {
	const needToProcess = CONTAINS_ESCAPE.test(str);

	if (!needToProcess) {
		return str;
	}

	let ret = "";

	for (let i = 0; i < str.length; i++) {
		if (str[i] === "\\") {
			const gobbled = gobbleHex(str.slice(i + 1, i + 7));

			if (gobbled !== undefined) {
				ret += gobbled[0];
				i += gobbled[1];
				continue;
			}

			if (str[i + 1] === "\\") {
				ret += "\\";
				i += 1;
				continue;
			}

			if (str.length === i + 1) {
				ret += str[i];
			}

			continue;
		}

		ret += str[i];
	}

	return ret;
}

exports.unescape = unescape;

function normalizePath(file) {
	return path.sep === "\\" ? file.replace(/\\/g, "/") : file;
}

const NATIVE_WIN32_PATH = /^[A-Z]:[/\\]|^\\\\/i;

function normalizeUrl(url, isStringValue) {
	let normalizedUrl = url
		.replace(/^( |\t\n|\r\n|\r|\f)*/g, "")
		.replace(/( |\t\n|\r\n|\r|\f)*$/g, "");

	if (isStringValue && /\\(\n|\r\n|\r|\f)/.test(normalizedUrl)) {
		normalizedUrl = normalizedUrl.replace(/\\(\n|\r\n|\r|\f)/g, "");
	}

	if (NATIVE_WIN32_PATH.test(url)) {
		try {
			normalizedUrl = decodeURI(normalizedUrl);
		} catch (error) {
			// Ignore
		}

		return normalizedUrl;
	}

	normalizedUrl = unescape(normalizedUrl);

	try {
		normalizedUrl = decodeURI(normalizedUrl);
	} catch (error) {
		// Ignore
	}

	return normalizedUrl;
}

exports.normalizeUrl = normalizeUrl;

function requestify(url, rootContext) {
	if (/^file:/i.test(url)) {
		return fileURLToPath(url);
	}

	return url.charAt(0) === "/"
		? urlToRequest(url, rootContext)
		: urlToRequest(url);
}

exports.requestify = requestify;

function getFilter(filter, resourcePath) {
	return (...args) => {
		if (typeof filter === "function") {
			return filter(...args, resourcePath);
		}

		return true;
	};
}

exports.getFilter = getFilter;

const IS_NATIVE_WIN32_PATH = /^[a-z]:[/\\]|^\\\\/i;
const ABSOLUTE_SCHEME = /^[a-z0-9+\-.]+:/i;

function getURLType(source) {
	if (source[0] === "/") {
		if (source[1] === "/") {
			return "scheme-relative";
		}

		return "path-absolute";
	}

	if (IS_NATIVE_WIN32_PATH.test(source)) {
		return "path-absolute";
	}

	return ABSOLUTE_SCHEME.test(source) ? "absolute" : "path-relative";
}

exports.getURLType = getURLType;

function normalizeSourceMap(map, resourcePath) {
	let newMap = map;

	if (typeof newMap === "string") {
		newMap = JSON.parse(newMap);
	}

	delete newMap.file;
	const {sourceRoot} = newMap;
	delete newMap.sourceRoot;

	if (newMap.sources) {
		newMap.sources = newMap.sources.map((source) => {
			if (source.indexOf("<") === 0) {
				return source;
			}

			const sourceType = getURLType(source);

			if (sourceType === "path-relative" || sourceType === "path-absolute") {
				const absoluteSource =
					sourceType === "path-relative" && sourceRoot
						? path.resolve(sourceRoot, normalizePath(source))
						: normalizePath(source);
				return path.relative(path.dirname(resourcePath), absoluteSource);
			}

			return source;
		});
	}

	return newMap;
}

exports.normalizeSourceMap = normalizeSourceMap;

function getPreRequester({loaders, loaderIndex}) {
	const cache = Object.create(null);
	return (number) => {
		if (cache[number]) {
			return cache[number];
		}

		if (number === false) {
			cache[number] = "";
		} else {
			const loadersRequest = loaders
				.slice(
					loaderIndex,
					loaderIndex + 1 + (typeof number !== "number" ? 0 : number),
				)
				.map((x) => x.request)
				.join("!");
			cache[number] = `-!${loadersRequest}!`;
		}

		return cache[number];
	};
}

exports.getPreRequester = getPreRequester;

function getImportCode(imports, options) {
	let code = "";

	for (const item of imports) {
		const {importName, url} = item;

		if (options.esModule) {
			code += `import ${importName} from ${url};\n`;
		} else {
			code += `var ${importName} = require(${url});\n`;
		}
	}

	return code ? `// Imports\n${code}` : "";
}

exports.getImportCode = getImportCode;

function normalizeSourceMapForRuntime(map, loaderContext) {
	const resultMap = map ? map.toJSON() : null;

	if (resultMap) {
		delete resultMap.file;
		resultMap.sourceRoot = "";
		resultMap.sources = resultMap.sources.map((source) => {
			if (source.indexOf("<") === 0) {
				return source;
			}

			const sourceType = getURLType(source);

			if (sourceType !== "path-relative") {
				return source;
			}

			const resourceDirname = path.dirname(loaderContext.resourcePath);
			const absoluteSource = path.resolve(resourceDirname, source);
			const contextifyPath = normalizePath(
				path.relative(loaderContext.rootContext, absoluteSource),
			);
			return `webpack://./${contextifyPath}`;
		});
	}

	return JSON.stringify(resultMap);
}

function getModuleCode(result, api, replacements, options, loaderContext) {
	const sourceMapValue = options.sourceMap
		? `,${normalizeSourceMapForRuntime(result.map, loaderContext)}`
		: "";
	let code = JSON.stringify(result.css);
	let beforeCode = `var ___CSS_LOADER_EXPORT___ = ___CSS_LOADER_API_IMPORT___(${options.sourceMap ? "___CSS_LOADER_API_SOURCEMAP_IMPORT___" : "function(i){return i[1]}"});\n`;

	for (const item of api) {
		const {url, media, dedupe} = item;
		beforeCode += url
			? `___CSS_LOADER_EXPORT___.push([module.id, ${JSON.stringify(`@import url(${url});`)}${media ? `, ${JSON.stringify(media)}` : ""}]);\n`
			: `___CSS_LOADER_EXPORT___.i(${item.importName}${media ? `, ${JSON.stringify(media)}` : dedupe ? ', ""' : ""}${dedupe ? ", true" : ""});\n`;
	}

	for (const item of replacements) {
		const {replacementName, importName, localName} = item;

		if (localName) {
			code = code.replace(new RegExp(replacementName, "g"), () => {
				return `" + ${importName}.locals[${JSON.stringify(localName)}] + "`;
			});
		} else {
			const {hash, needQuotes} = item;
			const getUrlOptions = []
				.concat(hash ? [`hash: ${JSON.stringify(hash)}`] : [])
				.concat(needQuotes ? "needQuotes: true" : []);
			const preparedOptions =
				getUrlOptions.length > 0 ? `, { ${getUrlOptions.join(", ")} }` : "";
			beforeCode += `var ${replacementName} = ___CSS_LOADER_GET_URL_IMPORT___(${importName}${preparedOptions});\n`;
			code = code.replace(
				new RegExp(replacementName, "g"),
				() => `" + ${replacementName} + "`,
			);
		}
	}

	return `${beforeCode}// Module\n___CSS_LOADER_EXPORT___.push([module.id, ${code}, ""${sourceMapValue}]);\n`;
}

exports.getModuleCode = getModuleCode;

function getExportCode(exports, replacements, needToUseIcssPlugin, options) {
	let code = "// Exports\n";

	if (!needToUseIcssPlugin) {
		code += `${options.esModule ? "export default" : "module.exports ="} ___CSS_LOADER_EXPORT___;\n`;
		return code;
	}

	// Simplified: no ICSS/modules export handling needed
	code += `${options.esModule ? "export default" : "module.exports ="} ___CSS_LOADER_EXPORT___;\n`;
	return code;
}

exports.getExportCode = getExportCode;

async function resolveRequests(resolve, context, possibleRequests) {
	return resolve(context, possibleRequests[0])
		.then((result) => result)
		.catch((error) => {
			const [, ...tailPossibleRequests] = possibleRequests;

			if (tailPossibleRequests.length === 0) {
				throw error;
			}

			return resolveRequests(resolve, context, tailPossibleRequests);
		});
}

exports.resolveRequests = resolveRequests;

function isUrlRequestable(url) {
	if (/^\/\//.test(url)) {
		return false;
	}

	if (/^file:/i.test(url)) {
		return true;
	}

	if (/^[a-z][a-z0-9+.-]*:/i.test(url) && !NATIVE_WIN32_PATH.test(url)) {
		return false;
	}

	if (/^#/.test(url)) {
		return false;
	}

	return true;
}

exports.isUrlRequestable = isUrlRequestable;

function sort(a, b) {
	return a.index - b.index;
}

exports.sort = sort;

function combineRequests(preRequest, url) {
	const idx = url.indexOf("!=!");
	return idx !== -1
		? url.slice(0, idx + 3) + preRequest + url.slice(idx + 3)
		: preRequest + url;
}

exports.combineRequests = combineRequests;
