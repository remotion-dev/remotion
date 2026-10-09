import type * as RspackBrowser from '@rspack/browser';

export const createBrowserReactRefreshPlugin = ({
	rspack,
	refreshRuntime,
	refreshUtils,
}: {
	rspack: typeof RspackBrowser;
	refreshRuntime: string;
	refreshUtils: string;
}): RspackBrowser.RspackPluginInstance => ({
	name: 'remotion-browser-react-refresh',
	apply: (compiler) => {
		new rspack.ProvidePlugin({
			$ReactRefreshRuntime$: refreshRuntime,
			__react_refresh_utils__: refreshUtils,
		}).apply(compiler);
		new rspack.DefinePlugin({
			__react_refresh_error_overlay__: false,
			__react_refresh_library__: JSON.stringify('remotion-browser'),
			__react_refresh_socket__: false,
			__reload_on_runtime_errors__: false,
		}).apply(compiler);

		compiler.hooks.compilation.tap(
			'remotion-browser-react-refresh',
			(compilation) => {
				compilation.hooks.additionalTreeRuntimeRequirements.tap(
					'remotion-browser-react-refresh',
					(_chunk, runtimeRequirements) => {
						runtimeRequirements.add(rspack.RuntimeGlobals.moduleCache);
					},
				);
			},
		);
	},
});

export const createBrowserHmrRuntimePlugin = ({
	rspack,
	bridgeName,
}: {
	rspack: typeof RspackBrowser;
	bridgeName: string;
}): RspackBrowser.RspackPluginInstance => {
	const bridge = `globalThis[${JSON.stringify(bridgeName)}]`;
	class BrowserHmrManifestRuntimeModule extends rspack.RuntimeModule {
		constructor() {
			super(
				'remotion browser hmr manifest',
				rspack.RuntimeModule.STAGE_TRIGGER,
			);
		}

		generate() {
			return `${rspack.RuntimeGlobals.hmrDownloadManifest} = function() {
	return ${bridge}.getManifest(${rspack.RuntimeGlobals.getUpdateManifestFilename}());
};`;
		}
	}

	return {
		name: 'remotion-browser-hmr-runtime',
		apply: (compiler) => {
			compiler.hooks.compilation.tap(
				'remotion-browser-hmr-runtime',
				(compilation) => {
					compilation.hooks.runtimeRequirementInTree
						.for(rspack.RuntimeGlobals.hmrDownloadManifest)
						.tap('remotion-browser-hmr-runtime', (chunk) => {
							compilation.addRuntimeModule(
								chunk,
								new BrowserHmrManifestRuntimeModule(),
							);
						});

					rspack.RuntimePlugin.getCompilationHooks(
						compilation,
					).createScript.tap(
						'remotion-browser-hmr-runtime',
						(code) =>
							`${code}\nscript.src = ${bridge}.resolveScriptUrl(script.src);`,
					);
				},
			);
		},
	};
};
