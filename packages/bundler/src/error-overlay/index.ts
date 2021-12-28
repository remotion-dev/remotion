import {Router} from 'express';
import webpack from 'webpack';

const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware');

const chunkPathBasic = require.resolve('./entry-basic.js');
const chunkPathDevServer = require.resolve('./entry-devserver.js');
let deps: string[] = [];

type SockOptions = {
	sockHost?: string;
	sockPath?: string;
	sockPort?: string;
};

export class ErrorOverlayPlugin {
	apply(compiler: webpack.Compiler) {
		const className = this.constructor.name;

		if (compiler.options.mode !== 'development') {
			return;
		}

		if (!compiler.options.devServer) {
			return;
		}

		const devServerEnabled = Boolean(compiler.options.devServer);
		const usingSocket =
			devServerEnabled && typeof compiler.options.devServer.socket === 'string';

		const sockOptions: SockOptions = {};
		if (devServerEnabled && usingSocket) {
			sockOptions.sockHost = compiler.options.devServer.sockHost;
			sockOptions.sockPath = compiler.options.devServer.sockPath;
			sockOptions.sockPort = compiler.options.devServer.sockPort;
		}

		compiler.hooks.entryOption.tap(
			className,
			// @ts-expect-error
			(context: unknown, entry: webpack.EntryNormalized) => {
				if (typeof entry !== 'function') {
					Object.keys(entry).forEach((entryName) => {
						if (deps.includes(entryName)) {
							// Skip dependencies, only inject real entry points
							return;
						}

						const _entry = entry[entryName];

						function adjustEntry(enableDevServer: boolean) {
							if (_entry.dependOn) {
								deps = [...deps, ..._entry.dependOn];
							}

							if (_entry.library) {
								// skip libraries
								return _entry;
							}

							if (typeof _entry.import === 'string') {
								_entry.import = [_entry.import];
							}

							if (enableDevServer && usingSocket) {
								const sockHost = sockOptions.sockHost
									? `&sockHost=${sockOptions.sockHost}`
									: '';
								const sockPath = sockOptions.sockPath
									? `&sockPath=${sockOptions.sockPath}`
									: '';
								const sockPort = sockOptions.sockPort
									? `&sockPort=${sockOptions.sockPort}`
									: '';
								const chunkPathDevServerWithParams = `${chunkPathDevServer}?${sockHost}${sockPath}${sockPort}`;
								if (!_entry.import?.includes(chunkPathDevServerWithParams)) {
									_entry.import?.unshift(chunkPathDevServerWithParams);
								}
							}

							if (!_entry.import?.includes(chunkPathBasic)) {
								_entry.import?.unshift(chunkPathBasic);
							}

							return _entry;
						}

						entry[entryName] = adjustEntry(devServerEnabled);
					});
				}
			}
		);

		compiler.hooks.afterResolvers.tap(className, ({options}) => {
			if (devServerEnabled && options.devServer) {
				const originalBefore = options.devServer.before;
				options.devServer.before = (app: Router, server: unknown) => {
					if (originalBefore) {
						originalBefore(app, server);
					}

					app.use(errorOverlayMiddleware());
				};
			}
		});
	}
}
