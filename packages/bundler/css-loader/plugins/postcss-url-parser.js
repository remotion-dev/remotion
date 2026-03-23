/**
 * Forked from css-loader v5.2.7
 * MIT License http://www.opensource.org/licenses/mit-license.php
 */
"use strict";

const valueParser = require("postcss-value-parser");
const {
	normalizeUrl,
	isUrlRequestable,
	requestify,
	resolveRequests,
	WEBPACK_IGNORE_COMMENT_REGEXP,
} = require("../utils");

const isUrlFunc = /url/i;
const isImageSetFunc = /^(?:-webkit-)?image-set$/i;
const needParseDeclaration = /(?:url|(?:-webkit-)?image-set)\(/i;

function getNodeFromUrlFunc(node) {
	return node.nodes && node.nodes[0];
}

function getWebpackIgnoreCommentValue(index, nodes, inBetween) {
	if (index === 0 && typeof inBetween !== "undefined") {
		return inBetween;
	}

	let prevValueNode = nodes[index - 1];

	if (!prevValueNode) {
		return;
	}

	if (prevValueNode.type === "space") {
		if (!nodes[index - 2]) {
			return;
		}

		prevValueNode = nodes[index - 2];
	}

	if (prevValueNode.type !== "comment") {
		return;
	}

	const matched = prevValueNode.value.match(WEBPACK_IGNORE_COMMENT_REGEXP);
	return matched && matched[2] === "true";
}

function shouldHandleURL(url, declaration, result) {
	if (url.length === 0) {
		result.warn(`Unable to find uri in '${declaration.toString()}'`, {
			node: declaration,
		});
		return false;
	}

	if (!isUrlRequestable(url)) {
		return false;
	}

	return true;
}

function parseDeclaration(declaration, key, result) {
	if (!needParseDeclaration.test(declaration[key])) {
		return;
	}

	const parsed = valueParser(
		declaration.raws &&
			declaration.raws.value &&
			declaration.raws.value.raw
			? declaration.raws.value.raw
			: declaration[key],
	);
	let inBetween;

	if (declaration.raws && declaration.raws.between) {
		const lastCommentIndex = declaration.raws.between.lastIndexOf("/*");
		const matched = declaration.raws.between
			.slice(lastCommentIndex)
			.match(WEBPACK_IGNORE_COMMENT_REGEXP);

		if (matched) {
			inBetween = matched[2] === "true";
		}
	}

	let isIgnoreOnDeclaration = false;
	const prevNode = declaration.prev();

	if (prevNode && prevNode.type === "comment") {
		const matched = prevNode.text.match(WEBPACK_IGNORE_COMMENT_REGEXP);

		if (matched) {
			isIgnoreOnDeclaration = matched[2] === "true";
		}
	}

	let needIgnore;
	const parsedURLs = [];
	parsed.walk((valueNode, index, valueNodes) => {
		if (valueNode.type !== "function") {
			return;
		}

		if (isUrlFunc.test(valueNode.value)) {
			needIgnore = getWebpackIgnoreCommentValue(
				index,
				valueNodes,
				inBetween,
			);

			if (
				(isIgnoreOnDeclaration && typeof needIgnore === "undefined") ||
				needIgnore
			) {
				if (needIgnore) {
					needIgnore = undefined;
				}

				return;
			}

			const {nodes} = valueNode;
			const isStringValue =
				nodes.length !== 0 && nodes[0].type === "string";
			let url = isStringValue
				? nodes[0].value
				: valueParser.stringify(nodes);
			url = normalizeUrl(url, isStringValue);

			if (!shouldHandleURL(url, declaration, result)) {
				return false;
			}

			const queryParts = url.split("!");
			let prefix;

			if (queryParts.length > 1) {
				url = queryParts.pop();
				prefix = queryParts.join("!");
			}

			parsedURLs.push({
				declaration,
				parsed,
				node: getNodeFromUrlFunc(valueNode),
				prefix,
				url,
				needQuotes: false,
			});

			return false;
		} else if (isImageSetFunc.test(valueNode.value)) {
			for (const [innerIndex, nNode] of valueNode.nodes.entries()) {
				const {type, value} = nNode;

				if (type === "function" && isUrlFunc.test(value)) {
					needIgnore = getWebpackIgnoreCommentValue(
						innerIndex,
						valueNode.nodes,
					);

					if (
						(isIgnoreOnDeclaration &&
							typeof needIgnore === "undefined") ||
						needIgnore
					) {
						if (needIgnore) {
							needIgnore = undefined;
						}

						continue;
					}

					const {nodes} = nNode;
					const isStringValue =
						nodes.length !== 0 && nodes[0].type === "string";
					let url = isStringValue
						? nodes[0].value
						: valueParser.stringify(nodes);
					url = normalizeUrl(url, isStringValue);

					if (!shouldHandleURL(url, declaration, result)) {
						return false;
					}

					const queryParts = url.split("!");
					let prefix;

					if (queryParts.length > 1) {
						url = queryParts.pop();
						prefix = queryParts.join("!");
					}

					parsedURLs.push({
						declaration,
						parsed,
						node: getNodeFromUrlFunc(nNode),
						prefix,
						url,
						needQuotes: false,
					});
				} else if (type === "string") {
					needIgnore = getWebpackIgnoreCommentValue(
						innerIndex,
						valueNode.nodes,
					);

					if (
						(isIgnoreOnDeclaration &&
							typeof needIgnore === "undefined") ||
						needIgnore
					) {
						if (needIgnore) {
							needIgnore = undefined;
						}

						continue;
					}

					let url = normalizeUrl(value, true);

					if (!shouldHandleURL(url, declaration, result)) {
						return false;
					}

					const queryParts = url.split("!");
					let prefix;

					if (queryParts.length > 1) {
						url = queryParts.pop();
						prefix = queryParts.join("!");
					}

					parsedURLs.push({
						declaration,
						parsed,
						node: nNode,
						prefix,
						url,
						needQuotes: true,
					});
				}
			}

			return false;
		}
	});

	return parsedURLs;
}

const plugin = (options = {}) => {
	return {
		postcssPlugin: "postcss-url-parser",

		prepare(result) {
			const parsedDeclarations = [];
			return {
				Declaration(declaration) {
					const parsedURL = parseDeclaration(
						declaration,
						"value",
						result,
					);

					if (!parsedURL) {
						return;
					}

					parsedDeclarations.push(...parsedURL);
				},

				async OnceExit() {
					if (parsedDeclarations.length === 0) {
						return;
					}

					const resolvedDeclarations = await Promise.all(
						parsedDeclarations.map(async (parsedDeclaration) => {
							const {url} = parsedDeclaration;

							if (options.filter) {
								const needKeep = await options.filter(url);

								if (!needKeep) {
									return;
								}
							}

							const splittedUrl = url.split(/(\?)?#/);
							const [pathname, query, hashOrQuery] = splittedUrl;
							let hash = query ? "?" : "";
							hash += hashOrQuery ? `#${hashOrQuery}` : "";
							const request = requestify(
								pathname,
								options.rootContext,
							);
							const {resolver, context} = options;
							const resolvedUrl = await resolveRequests(
								resolver,
								context,
								[...new Set([request, url])],
							);

							if (!resolvedUrl) {
								return;
							}

							return {...parsedDeclaration, url: resolvedUrl, hash};
						}),
					);
					const urlToNameMap = new Map();
					const urlToReplacementMap = new Map();
					let hasUrlImportHelper = false;

					for (
						let index = 0;
						index <= resolvedDeclarations.length - 1;
						index++
					) {
						const item = resolvedDeclarations[index];

						if (!item) {
							continue;
						}

						if (!hasUrlImportHelper) {
							options.imports.push({
								importName: "___CSS_LOADER_GET_URL_IMPORT___",
								url: options.urlHandler(
									require.resolve("../runtime/getUrl.js"),
								),
								index: -1,
							});
							hasUrlImportHelper = true;
						}

						const {url, prefix} = item;
						const newUrl = prefix ? `${prefix}!${url}` : url;
						let importName = urlToNameMap.get(newUrl);

						if (!importName) {
							importName = `___CSS_LOADER_URL_IMPORT_${urlToNameMap.size}___`;
							urlToNameMap.set(newUrl, importName);
							options.imports.push({
								importName,
								url: options.urlHandler(newUrl),
								index,
							});
						}

						const {hash, needQuotes} = item;
						const replacementKey = JSON.stringify({
							newUrl,
							hash,
							needQuotes,
						});
						let replacementName =
							urlToReplacementMap.get(replacementKey);

						if (!replacementName) {
							replacementName = `___CSS_LOADER_URL_REPLACEMENT_${urlToReplacementMap.size}___`;
							urlToReplacementMap.set(
								replacementKey,
								replacementName,
							);
							options.replacements.push({
								replacementName,
								importName,
								hash,
								needQuotes,
							});
						}

						item.node.type = "word";
						item.node.value = replacementName;
						item.declaration.value = item.parsed.toString();
					}
				},
			};
		},
	};
};

plugin.postcss = true;
module.exports = plugin;
