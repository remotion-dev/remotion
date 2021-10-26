import webpack from 'webpack';

// @ts-check
const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware');

const chunkPathBasic = require.resolve('./entry-basic');
const chunkPathDevServer = require.resolve('./entry-devserver');
let deps = [];

/** @typedef {{ sockHost: string, sockPath: string, sockPort: number }} SockOptions */
/** @typedef {{ dependOn?: [string, ...string[]], filename?: any, import: [string, ...string[]], library?: any }} EntryDescriptionNormalized */

export class ErrorOverlayPlugin {
	apply(compiler: webpack.Compiler) {
		const className = this.constructor.name;

		if (compiler.options.mode !== 'development') {
			return;
		}

		const devServerEnabled = Boolean(compiler.options.devServer);
		const usingSocket =
			devServerEnabled && typeof compiler.options.devServer.socket === 'string';

		/** @type { SockOptions } */
		const sockOptions = {};
		if (devServerEnabled && usingSocket) {
			sockOptions.sockHost = compiler.options.devServer.sockHost;
			sockOptions.sockPath = compiler.options.devServer.sockPath;
			sockOptions.sockPort = compiler.options.devServer.sockPort;
		}

		compiler.hooks.entryOption.tap(className, (context, entry) => {
			if (typeof entry !== 'function') {
				Object.keys(entry).forEach((entryName) => {
					if (deps.includes(entryName)) {
						// Skip dependencies, only inject real entry points
						return;
					}

					entry[entryName] = adjustEntry(
						entry[entryName],
						devServerEnabled,
						usingSocket,
						sockOptions
					);
				});
			}
		});

		compiler.hooks.afterResolvers.tap(className, ({options}) => {
			if (devServerEnabled) {
				const originalBefore = options.devServer.before;
				options.devServer.before = (app, server) => {
					if (originalBefore) {
						originalBefore(app, server);
					}

					app.use(errorOverlayMiddleware());
				};
			}
		});
	}
}

/**
 * Puts dev server chunk path in front of other entries
 * @param {EntryDescriptionNormalized} entry
 * @param {boolean} enableDevServer
 * @param {boolean} usingSocket
 * @param {SockOptions} sockOptions
 * @returns {EntryDescriptionNormalized}
 */
function adjustEntry(entry, enableDevServer, usingSocket, sockOptions) {
	if (entry.dependOn) {
		deps = [...deps, ...entry.dependOn];
	}

	if (entry.library) {
		// skip libraries
		return entry;
	}

	if (typeof entry.import === 'string') {
		entry.import = [entry.import];
	}

	if (enableDevServer && usingSocket) {
		const sockHost = sockOptions.sockHost
			? ` & sockHost = ${sockOptions.sockHost}`
			: '';
		const sockPath = sockOptions.sockPath
			? ` & sockPath = ${sockOptions.sockPath}`
			: '';
		const sockPort = sockOptions.sockPort
			? ` & sockPort = ${sockOptions.sockPort}`
			: '';
		const chunkPathDevServerWithParams = `${chunkPathDevServer} ? ${sockHost}
        ${sockPath}
        ${sockPort}`;
		if (!entry.import.includes(chunkPathDevServerWithParams)) {
			entry.import.unshift(chunkPathDevServerWithParams);
		}
	}

	if (!entry.import.includes(chunkPathBasic)) {
		entry.import.unshift(chunkPathBasic);
	}

	return entry;
}
