import {createHash} from 'node:crypto';
import path from 'node:path';
import {javascript, sources, type LoaderDefinition} from 'webpack';

type JsxSources = {file: string; mappings: string[]; insertions: number[]};

// The parser walks each module synchronously and restores its state afterwards.
const parser = new javascript.JavascriptParser('module');
const plugin = 'RemotionJsxSource';
const jsxDev = Symbol(plugin);

parser.hooks.importSpecifier.tap(
	plugin,
	(statement, source, imported, name) => {
		const {loc} = statement;
		const {mappings}: JsxSources = parser.state.jsxSources;
		// SWC's automatic runtime import has no authored mapping. A handwritten
		// import of the very same function has its own source location.
		if (
			source === 'react/jsx-dev-runtime' &&
			imported === 'jsxDEV' &&
			loc &&
			loc.start.line === loc.end.line &&
			mappings[loc.start.line - 1] === ''
		) {
			parser.tagVariable(name, jsxDev);
			return true;
		}
	},
);

parser.hooks.call.for(jsxDev).tap(plugin, (call) => {
	const source = call.arguments[4];
	const {file, insertions}: JsxSources = parser.state.jsxSources;
	if (
		source?.type === 'ObjectExpression' &&
		source.range &&
		source.properties.some(
			(p) =>
				p.type === 'Property' &&
				p.key.type === 'Identifier' &&
				p.key.name === 'fileName' &&
				p.value.type === 'Literal' &&
				p.value.value === file,
		)
	) {
		insertions.push(source.range[0] + 1);
	}
});

const RspackJsxSourceLoader: LoaderDefinition = function (
	code,
	inputMap,
	data,
) {
	const passThrough = () => this.callback(null, code, inputMap, data);
	if (!inputMap || !this._module || !this._compilation) return passThrough();
	const map: Exclude<typeof inputMap, string> =
		typeof inputMap === 'string' ? JSON.parse(inputMap) : inputMap;
	// The native SWC map describes one authored module. A composed or indexed
	// map supplied by an override cannot prove which bytes were compiled here.
	if (
		map.sources?.length !== 1 ||
		typeof map.mappings !== 'string' ||
		path.resolve(this.rootContext, map.sourceRoot ?? '', map.sources[0]) !==
			this.resourcePath
	)
		return passThrough();
	const authored = map.sourcesContent?.[0];
	if (typeof authored !== 'string') return passThrough();
	const jsxSources: JsxSources = {
		file: this.resourcePath,
		mappings: map.mappings.split(';'),
		insertions: [],
	};
	try {
		parser.parse(code, {
			source: code,
			module: this._module,
			current: this._module,
			compilation: this._compilation,
			options: this._compilation.options,
			jsxSources,
		});
	} catch {
		// An override can supply syntax which this parser does not recognize.
		return passThrough();
	}

	if (jsxSources.insertions.length === 0) return passThrough();
	const hash = createHash('sha256').update(authored).digest('hex');
	const changed = new sources.ReplaceSource(
		new sources.SourceMapSource(code, this.resourcePath, map),
	);
	for (const index of jsxSources.insertions) {
		changed.insert(index, `__remotionCompiledSourceHash:"${hash}",`);
	}

	const result = changed.sourceAndMap();
	this.callback(null, result.source, result.map ?? inputMap, data);
};

export default RspackJsxSourceLoader;
