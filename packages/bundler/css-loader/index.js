/**
 * Forked from css-loader v5.2.7
 * MIT License http://www.opensource.org/licenses/mit-license.php
 * Author Tobias Koppers @sokra
 *
 * Simplified for Remotion's use case:
 * - No CSS Modules support
 * - No ICSS support
 * - No schema-utils validation (we control the options)
 * - No semver postcss version check
 * - Hardcoded default options (url: true, import: true, esModule: true)
 */
'use strict';

const {getOptions, stringifyRequest} = require('loader-utils');
const postcss = require('postcss');
const CssSyntaxError = require('./CssSyntaxError');
const Warning = require('./Warning');
const {importParser, urlParser} = require('./plugins');
const {
	normalizeUrl,
	requestify,
	getFilter,
	getPreRequester,
	getImportCode,
	getModuleCode,
	getExportCode,
	resolveRequests,
	isUrlRequestable,
	normalizeSourceMap,
	sort,
	combineRequests,
	WEBPACK_IGNORE_COMMENT_REGEXP,
} = require('./utils');

async function loader(content, map, meta) {
	const callback = this.async();

	const sourceMap = this.sourceMap || false;
	const esModule = true;

	const replacements = [];

	// Import plugin
	const importPluginImports = [];
	const importPluginApi = [];

	const importResolver = this.getResolve({
		conditionNames: ['style'],
		extensions: ['.css'],
		mainFields: ['css', 'style', 'main', '...'],
		mainFiles: ['index', '...'],
	});

	const plugins = [
		importParser({
			imports: importPluginImports,
			api: importPluginApi,
			context: this.context,
			rootContext: this.rootContext,
			filter: getFilter(true, this.resourcePath),
			resolver: importResolver,
			urlHandler: (url) =>
				stringifyRequest(
					this,
					combineRequests(getPreRequester(this)(undefined), url),
				),
		}),
	];

	// URL plugin
	const urlPluginImports = [];

	const urlResolver = this.getResolve({
		conditionNames: ['asset'],
		mainFields: ['asset'],
		mainFiles: [],
		extensions: [],
	});

	plugins.push(
		urlParser({
			imports: urlPluginImports,
			replacements,
			context: this.context,
			rootContext: this.rootContext,
			filter: getFilter(true, this.resourcePath),
			resolver: urlResolver,
			urlHandler: (url) => stringifyRequest(this, url),
		}),
	);

	const {resourcePath} = this;
	let result;

	try {
		result = await postcss(plugins).process(content, {
			hideNothingWarning: true,
			from: resourcePath,
			to: resourcePath,
			map: sourceMap
				? {
						prev: map ? normalizeSourceMap(map, resourcePath) : null,
						inline: false,
						annotation: false,
					}
				: false,
		});
	} catch (error) {
		if (error.file) {
			this.addDependency(error.file);
		}

		callback(
			error.name === 'CssSyntaxError' ? new CssSyntaxError(error) : error,
		);
		return;
	}

	for (const warning of result.warnings()) {
		this.emitWarning(new Warning(warning));
	}

	const imports = []
		.concat(importPluginImports.sort(sort))
		.concat(urlPluginImports.sort(sort));
	const api = [].concat(importPluginApi.sort(sort));

	imports.unshift({
		importName: '___CSS_LOADER_API_IMPORT___',
		url: stringifyRequest(this, require.resolve('./runtime/api')),
	});

	if (sourceMap) {
		imports.unshift({
			importName: '___CSS_LOADER_API_SOURCEMAP_IMPORT___',
			url: stringifyRequest(
				this,
				require.resolve('./runtime/cssWithMappingToString'),
			),
		});
	}

	const options = {
		sourceMap,
		esModule,
		modules: false,
	};

	const importCode = getImportCode(imports, options);
	const moduleCode = getModuleCode(result, api, replacements, options, this);
	const exportCode = getExportCode([], replacements, false, options);

	callback(null, `${importCode}${moduleCode}${exportCode}`);
}

module.exports = loader;
module.exports.default = loader;
