/**
 * @fileoverview Utility to load config files
 * @author Nicholas C. Zakas
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const path = require("node:path");
const fs = require("node:fs/promises");
const findUp = require("find-up");
const { pathToFileURL } = require("node:url");
const debug = require("debug")("eslint:config-loader");
const { FlatConfigArray } = require("./flat-config-array");

//-----------------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------------

/**
 * @typedef {import("../shared/types").FlatConfigObject} FlatConfigObject
 * @typedef {import("../shared/types").FlatConfigArray} FlatConfigArray
 * @typedef {Object} ConfigLoaderOptions
 * @property {string|false|undefined} configFile The path to the config file to use.
 * @property {string} cwd The current working directory.
 * @property {boolean} ignoreEnabled Indicates if ignore patterns should be honored.
 * @property {FlatConfigArray} [baseConfig] The base config to use.
 * @property {Array<FlatConfigObject>} [defaultConfigs] The default configs to use.
 * @property {Array<string>} [ignorePatterns] The ignore patterns to use.
 * @property {FlatConfigObject|Array<FlatConfigObject>} overrideConfig The override config to use.
 */

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const FLAT_CONFIG_FILENAMES = [
    "eslint.config.js",
    "eslint.config.mjs",
    "eslint.config.cjs",
    "eslint.config.ts",
    "eslint.config.mts",
    "eslint.config.cts"
];

const importedConfigFileModificationTime = new Map();

/**
 * Asserts that the given file path is valid.
 * @param {string} filePath The file path to check.
 * @returns {void}
 * @throws {Error} If `filePath` is not a non-empty string.
 */
function assertValidFilePath(filePath) {
    if (!filePath || typeof filePath !== "string") {
        throw new Error("'filePath' must be a non-empty string");
    }
}

/**
 * Asserts that a configuration exists. A configuration exists if any
 * of the following are true:
 * - `configFilePath` is defined.
 * - `useConfigFile` is `false`.
 * @param {string|undefined} configFilePath The path to the config file.
 * @param {ConfigLoaderOptions} loaderOptions The options to use when loading configuration files.
 * @returns {void}
 * @throws {Error} If no configuration exists.
 */
function assertConfigurationExists(configFilePath, loaderOptions) {

    const {
        configFile: useConfigFile
    } = loaderOptions;

    if (!configFilePath && useConfigFile !== false) {
        const error = new Error("Could not find config file.");

        error.messageTemplate = "config-file-missing";
        throw error;
    }

}

/**
 * Check if the file is a TypeScript file.
 * @param {string} filePath The file path to check.
 * @returns {boolean} `true` if the file is a TypeScript file, `false` if it's not.
 */
function isFileTS(filePath) {
    const fileExtension = path.extname(filePath);

    return /^\.[mc]?ts$/u.test(fileExtension);
}

/**
 * Check if ESLint is running in Bun.
 * @returns {boolean} `true` if the ESLint is running Bun, `false` if it's not.
 */
function isRunningInBun() {
    return !!globalThis.Bun;
}

/**
 * Check if ESLint is running in Deno.
 * @returns {boolean} `true` if the ESLint is running in Deno, `false` if it's not.
 */
function isRunningInDeno() {
    return !!globalThis.Deno;
}

/**
 * Load the config array from the given filename.
 * @param {string} filePath The filename to load from.
 * @returns {Promise<any>} The config loaded from the config file.
 */
async function loadConfigFile(filePath) {

    debug(`Loading config from ${filePath}`);

    const fileURL = pathToFileURL(filePath);

    debug(`Config file URL is ${fileURL}`);

    const mtime = (await fs.stat(filePath)).mtime.getTime();

    /*
     * Append a query with the config file's modification time (`mtime`) in order
     * to import the current version of the config file. Without the query, `import()` would
     * cache the config file module by the pathname only, and then always return
     * the same version (the one that was actual when the module was imported for the first time).
     *
     * This ensures that the config file module is loaded and executed again
     * if it has been changed since the last time it was imported.
     * If it hasn't been changed, `import()` will just return the cached version.
     *
     * Note that we should not overuse queries (e.g., by appending the current time
     * to always reload the config file module) as that could cause memory leaks
     * because entries are never removed from the import cache.
     */
    fileURL.searchParams.append("mtime", mtime);

    /*
     * With queries, we can bypass the import cache. However, when import-ing a CJS module,
     * Node.js uses the require infrastructure under the hood. That includes the require cache,
     * which caches the config file module by its file path (queries have no effect).
     * Therefore, we also need to clear the require cache before importing the config file module.
     * In order to get the same behavior with ESM and CJS config files, in particular - to reload
     * the config file only if it has been changed, we track file modification times and clear
     * the require cache only if the file has been changed.
     */
    if (importedConfigFileModificationTime.get(filePath) !== mtime) {
        delete require.cache[filePath];
    }

    const isTS = isFileTS(filePath);
    const isBun = isRunningInBun();
    const isDeno = isRunningInDeno();

    /*
     * If we are dealing with a TypeScript file, then we need to use `jiti` to load it
     * in Node.js. Deno and Bun both allow native importing of TypeScript files.
     *
     * When Node.js supports native TypeScript imports, we can remove this check.
     */
    if (isTS && !isDeno && !isBun) {

        // eslint-disable-next-line no-use-before-define -- `ConfigLoader.loadJiti` can be overwritten for testing
        const { createJiti } = await ConfigLoader.loadJiti().catch(() => {
            throw new Error("The 'jiti' library is required for loading TypeScript configuration files. Make sure to install it.");
        });

        // `createJiti` was added in jiti v2.
        if (typeof createJiti !== "function") {
            throw new Error("You are using an outdated version of the 'jiti' library. Please update to the latest version of 'jiti' to ensure compatibility and access to the latest features.");
        }

        /*
         * Disabling `moduleCache` allows us to reload a
         * config file when the last modified timestamp changes.
         */

        const jiti = createJiti(__filename, { moduleCache: false, interopDefault: false });
        const config = await jiti.import(fileURL.href);

        importedConfigFileModificationTime.set(filePath, mtime);

        return config?.default ?? config;
    }


    // fallback to normal runtime behavior

    const config = (await import(fileURL)).default;

    importedConfigFileModificationTime.set(filePath, mtime);

    return config;
}

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

/**
 * Encapsulates the loading and caching of configuration files when looking up
 * from the file being linted.
 */
class ConfigLoader {

    /**
     * Map of config file paths to the config arrays for those directories.
     * @type {Map<string, FlatConfigArray|Promise<FlatConfigArray>>}
     */
    #configArrays = new Map();

    /**
     * Map of absolute directory names to the config file paths for those directories.
     * @type {Map<string, {configFilePath:string,basePath:string}|Promise<{configFilePath:string,basePath:string}>>}
     */
    #configFilePaths = new Map();

    /**
     * The options to use when loading configuration files.
     * @type {ConfigLoaderOptions}
     */
    #options;

    /**
     * Creates a new instance.
     * @param {ConfigLoaderOptions} options The options to use when loading configuration files.
     */
    constructor(options) {
        this.#options = options;
    }

    /**
     * Determines which config file to use. This is determined by seeing if an
     * override config file was specified, and if so, using it; otherwise, as long
     * as override config file is not explicitly set to `false`, it will search
     * upwards from `fromDirectory` for a file named `eslint.config.js`.
     * @param {string} fromDirectory The directory from which to start searching.
     * @returns {Promise<{configFilePath:string|undefined,basePath:string}>} Location information for
     *      the config file.
     */
    async #locateConfigFileToUse(fromDirectory) {

        // check cache first
        if (this.#configFilePaths.has(fromDirectory)) {
            return this.#configFilePaths.get(fromDirectory);
        }

        const resultPromise = ConfigLoader.locateConfigFileToUse({
            useConfigFile: this.#options.configFile,
            cwd: this.#options.cwd,
            fromDirectory
        });

        // ensure `ConfigLoader.locateConfigFileToUse` is called only once for `fromDirectory`
        this.#configFilePaths.set(fromDirectory, resultPromise);

        // Unwrap the promise. This is primarily for the sync `getCachedConfigArrayForPath` method.
        const result = await resultPromise;

        this.#configFilePaths.set(fromDirectory, result);

        return result;
    }

    /**
     * Calculates the config array for this run based on inputs.
     * @param {string} configFilePath The absolute path to the config file to use if not overridden.
     * @param {string} basePath The base path to use for relative paths in the config file.
     * @returns {Promise<FlatConfigArray>} The config array for `eslint`.
     */
    async #calculateConfigArray(configFilePath, basePath) {

        // check for cached version first
        if (this.#configArrays.has(configFilePath)) {
            return this.#configArrays.get(configFilePath);
        }

        const configsPromise = ConfigLoader.calculateConfigArray(configFilePath, basePath, this.#options);

        // ensure `ConfigLoader.calculateConfigArray` is called only once for `configFilePath`
        this.#configArrays.set(configFilePath, configsPromise);

        // Unwrap the promise. This is primarily for the sync `getCachedConfigArrayForPath` method.
        const configs = await configsPromise;

        this.#configArrays.set(configFilePath, configs);

        return configs;
    }

    /**
     * Returns the config file path for the given directory or file. This will either use
     * the override config file that was specified in the constructor options or
     * search for a config file from the directory.
     * @param {string} fileOrDirPath The file or directory path to get the config file path for.
     * @returns {Promise<string|undefined>} The config file path or `undefined` if not found.
     * @throws {Error} If `fileOrDirPath` is not a non-empty string.
     * @throws {Error} If `fileOrDirPath` is not an absolute path.
     */
    async findConfigFileForPath(fileOrDirPath) {

        assertValidFilePath(fileOrDirPath);

        const absoluteDirPath = path.resolve(this.#options.cwd, path.dirname(fileOrDirPath));
        const { configFilePath } = await this.#locateConfigFileToUse(absoluteDirPath);

        return configFilePath;
    }

    /**
     * Returns a configuration object for the given file based on the CLI options.
     * This is the same logic used by the ESLint CLI executable to determine
     * configuration for each file it processes.
     * @param {string} filePath The path of the file or directory to retrieve config for.
     * @returns {Promise<ConfigData|undefined>} A configuration object for the file
     *      or `undefined` if there is no configuration data for the file.
     * @throws {Error} If no configuration for `filePath` exists.
     */
    async loadConfigArrayForFile(filePath) {

        assertValidFilePath(filePath);

        debug(`Calculating config for file ${filePath}`);

        const configFilePath = await this.findConfigFileForPath(filePath);

        assertConfigurationExists(configFilePath, this.#options);

        return this.loadConfigArrayForDirectory(filePath);
    }

    /**
     * Returns a configuration object for the given directory based on the CLI options.
     * This is the same logic used by the ESLint CLI executable to determine
     * configuration for each file it processes.
     * @param {string} dirPath The path of the directory to retrieve config for.
     * @returns {Promise<ConfigData|undefined>} A configuration object for the directory
     *      or `undefined` if there is no configuration data for the directory.
     */
    async loadConfigArrayForDirectory(dirPath) {

        assertValidFilePath(dirPath);

        debug(`Calculating config for directory ${dirPath}`);

        const absoluteDirPath = path.resolve(this.#options.cwd, path.dirname(dirPath));
        const { configFilePath, basePath } = await this.#locateConfigFileToUse(absoluteDirPath);

        debug(`Using config file ${configFilePath} and base path ${basePath}`);
        return this.#calculateConfigArray(configFilePath, basePath);
    }

    /**
     * Returns a configuration array for the given file based on the CLI options.
     * This is a synchronous operation and does not read any files from disk. It's
     * intended to be used in locations where we know the config file has already
     * been loaded and we just need to get the configuration for a file.
     * @param {string} filePath The path of the file to retrieve a config object for.
     * @returns {ConfigData|undefined} A configuration object for the file
     *     or `undefined` if there is no configuration data for the file.
     * @throws {Error} If `filePath` is not a non-empty string.
     * @throws {Error} If `filePath` is not an absolute path.
     * @throws {Error} If the config file was not already loaded.
     */
    getCachedConfigArrayForFile(filePath) {
        assertValidFilePath(filePath);

        debug(`Looking up cached config for ${filePath}`);

        return this.getCachedConfigArrayForPath(path.dirname(filePath));
    }

    /**
     * Returns a configuration array for the given directory based on the CLI options.
     * This is a synchronous operation and does not read any files from disk. It's
     * intended to be used in locations where we know the config file has already
     * been loaded and we just need to get the configuration for a file.
     * @param {string} fileOrDirPath The path of the directory to retrieve a config object for.
     * @returns {ConfigData|undefined} A configuration object for the directory
     *     or `undefined` if there is no configuration data for the directory.
     * @throws {Error} If `dirPath` is not a non-empty string.
     * @throws {Error} If `dirPath` is not an absolute path.
     * @throws {Error} If the config file was not already loaded.
     */
    getCachedConfigArrayForPath(fileOrDirPath) {
        assertValidFilePath(fileOrDirPath);

        debug(`Looking up cached config for ${fileOrDirPath}`);

        const absoluteDirPath = path.resolve(this.#options.cwd, fileOrDirPath);

        if (!this.#configFilePaths.has(absoluteDirPath)) {
            throw new Error(`Could not find config file for ${fileOrDirPath}`);
        }

        const configFilePathInfo = this.#configFilePaths.get(absoluteDirPath);

        if (typeof configFilePathInfo.then === "function") {
            throw new Error(`Config file path for ${fileOrDirPath} has not yet been calculated or an error occurred during the calculation`);
        }

        const { configFilePath } = configFilePathInfo;

        const configArray = this.#configArrays.get(configFilePath);

        if (!configArray || typeof configArray.then === "function") {
            throw new Error(`Config array for ${fileOrDirPath} has not yet been calculated or an error occurred during the calculation`);
        }

        return configArray;
    }

    /**
     * Used to import the jiti dependency. This method is exposed internally for testing purposes.
     * @returns {Promise<Record<string, unknown>>} A promise that fulfills with a module object
     *      or rejects with an error if jiti is not found.
     */
    static loadJiti() {
        return import("jiti");
    }

    /**
     * Determines which config file to use. This is determined by seeing if an
     * override config file was specified, and if so, using it; otherwise, as long
     * as override config file is not explicitly set to `false`, it will search
     * upwards from `fromDirectory` for a file named `eslint.config.js`.
     * This method is exposed internally for testing purposes.
     * @param {Object} [options] the options object
     * @param {string|false|undefined} options.useConfigFile The path to the config file to use.
     * @param {string} options.cwd Path to a directory that should be considered as the current working directory.
     * @param {string} [options.fromDirectory] The directory from which to start searching. Defaults to `cwd`.
     * @returns {Promise<{configFilePath:string|undefined,basePath:string}>} Location information for
     *      the config file.
     */
    static async locateConfigFileToUse({ useConfigFile, cwd, fromDirectory = cwd }) {

        // determine where to load config file from
        let configFilePath;
        let basePath = cwd;

        if (typeof useConfigFile === "string") {
            debug(`Override config file path is ${useConfigFile}`);
            configFilePath = path.resolve(cwd, useConfigFile);
            basePath = cwd;
        } else if (useConfigFile !== false) {
            debug("Searching for eslint.config.js");
            configFilePath = await findUp(
                FLAT_CONFIG_FILENAMES,
                { cwd: fromDirectory }
            );

            if (configFilePath) {
                basePath = path.dirname(configFilePath);
            }

        }

        return {
            configFilePath,
            basePath
        };

    }

    /**
     * Calculates the config array for this run based on inputs.
     * This method is exposed internally for testing purposes.
     * @param {string} configFilePath The absolute path to the config file to use if not overridden.
     * @param {string} basePath The base path to use for relative paths in the config file.
     * @param {ConfigLoaderOptions} options The options to use when loading configuration files.
     * @returns {Promise<FlatConfigArray>} The config array for `eslint`.
     */
    static async calculateConfigArray(configFilePath, basePath, options) {

        const {
            cwd,
            baseConfig,
            ignoreEnabled,
            ignorePatterns,
            overrideConfig,
            defaultConfigs = []
        } = options;

        debug(`Calculating config array from config file ${configFilePath} and base path ${basePath}`);

        const configs = new FlatConfigArray(baseConfig || [], { basePath, shouldIgnore: ignoreEnabled });

        // load config file
        if (configFilePath) {

            debug(`Loading config file ${configFilePath}`);
            const fileConfig = await loadConfigFile(configFilePath);

            if (Array.isArray(fileConfig)) {
                configs.push(...fileConfig);
            } else {
                configs.push(fileConfig);
            }
        }

        // add in any configured defaults
        configs.push(...defaultConfigs);

        // append command line ignore patterns
        if (ignorePatterns && ignorePatterns.length > 0) {

            let relativeIgnorePatterns;

            /*
             * If the config file basePath is different than the cwd, then
             * the ignore patterns won't work correctly. Here, we adjust the
             * ignore pattern to include the correct relative path. Patterns
             * passed as `ignorePatterns` are relative to the cwd, whereas
             * the config file basePath can be an ancestor of the cwd.
             */
            if (basePath === cwd) {
                relativeIgnorePatterns = ignorePatterns;
            } else {

                // relative path must only have Unix-style separators
                const relativeIgnorePath = path.relative(basePath, cwd).replace(/\\/gu, "/");

                relativeIgnorePatterns = ignorePatterns.map(pattern => {
                    const negated = pattern.startsWith("!");
                    const basePattern = negated ? pattern.slice(1) : pattern;

                    return (negated ? "!" : "") +
                    path.posix.join(relativeIgnorePath, basePattern);
                });
            }

            /*
             * Ignore patterns are added to the end of the config array
             * so they can override default ignores.
             */
            configs.push({
                ignores: relativeIgnorePatterns
            });
        }

        if (overrideConfig) {
            if (Array.isArray(overrideConfig)) {
                configs.push(...overrideConfig);
            } else {
                configs.push(overrideConfig);
            }
        }

        await configs.normalize();

        return configs;
    }

}

/**
 * Encapsulates the loading and caching of configuration files when looking up
 * from the current working directory.
 */
class LegacyConfigLoader extends ConfigLoader {

    /**
     * The options to use when loading configuration files.
     * @type {ConfigLoaderOptions}
     */
    #options;

    /**
     * The cached config file path for this instance.
     * @type {Promise<{configFilePath:string,basePath:string}|undefined>}
     */
    #configFilePath;

    /**
     * The cached config array for this instance.
     * @type {FlatConfigArray|Promise<FlatConfigArray>}
     */
    #configArray;

    /**
     * Creates a new instance.
     * @param {ConfigLoaderOptions} options The options to use when loading configuration files.
     */
    constructor(options) {
        super(options);
        this.#options = options;
    }

    /**
     * Determines which config file to use. This is determined by seeing if an
     * override config file was specified, and if so, using it; otherwise, as long
     * as override config file is not explicitly set to `false`, it will search
     * upwards from the cwd for a file named `eslint.config.js`.
     * @returns {Promise<{configFilePath:string|undefined,basePath:string}>} Location information for
     *      the config file.
     */
    #locateConfigFileToUse() {
        if (!this.#configFilePath) {
            this.#configFilePath = ConfigLoader.locateConfigFileToUse({
                useConfigFile: this.#options.configFile,
                cwd: this.#options.cwd
            });
        }

        return this.#configFilePath;
    }

    /**
     * Calculates the config array for this run based on inputs.
     * @param {string} configFilePath The absolute path to the config file to use if not overridden.
     * @param {string} basePath The base path to use for relative paths in the config file.
     * @returns {Promise<FlatConfigArray>} The config array for `eslint`.
     */
    async #calculateConfigArray(configFilePath, basePath) {

        // check for cached version first
        if (this.#configArray) {
            return this.#configArray;
        }

        // ensure `ConfigLoader.calculateConfigArray` is called only once
        this.#configArray = ConfigLoader.calculateConfigArray(configFilePath, basePath, this.#options);

        // Unwrap the promise. This is primarily for the sync `getCachedConfigArrayForPath` method.
        this.#configArray = await this.#configArray;

        return this.#configArray;
    }


    /**
     * Returns the config file path for the given directory. This will either use
     * the override config file that was specified in the constructor options or
     * search for a config file from the directory of the file being linted.
     * @param {string} dirPath The directory path to get the config file path for.
     * @returns {Promise<string|undefined>} The config file path or `undefined` if not found.
     * @throws {Error} If `fileOrDirPath` is not a non-empty string.
     * @throws {Error} If `fileOrDirPath` is not an absolute path.
     */
    async findConfigFileForPath(dirPath) {

        assertValidFilePath(dirPath);

        const { configFilePath } = await this.#locateConfigFileToUse();

        return configFilePath;
    }

    /**
     * Returns a configuration object for the given file based on the CLI options.
     * This is the same logic used by the ESLint CLI executable to determine
     * configuration for each file it processes.
     * @param {string} dirPath The path of the directory to retrieve config for.
     * @returns {Promise<ConfigData|undefined>} A configuration object for the file
     *      or `undefined` if there is no configuration data for the file.
     */
    async loadConfigArrayForDirectory(dirPath) {

        assertValidFilePath(dirPath);

        debug(`[Legacy]: Calculating config for ${dirPath}`);

        const { configFilePath, basePath } = await this.#locateConfigFileToUse();

        debug(`[Legacy]: Using config file ${configFilePath} and base path ${basePath}`);
        return this.#calculateConfigArray(configFilePath, basePath);
    }

    /**
     * Returns a configuration array for the given directory based on the CLI options.
     * This is a synchronous operation and does not read any files from disk. It's
     * intended to be used in locations where we know the config file has already
     * been loaded and we just need to get the configuration for a file.
     * @param {string} dirPath The path of the directory to retrieve a config object for.
     * @returns {ConfigData|undefined} A configuration object for the file
     *     or `undefined` if there is no configuration data for the file.
     * @throws {Error} If `dirPath` is not a non-empty string.
     * @throws {Error} If `dirPath` is not an absolute path.
     * @throws {Error} If the config file was not already loaded.
     */
    getCachedConfigArrayForPath(dirPath) {
        assertValidFilePath(dirPath);

        debug(`[Legacy]: Looking up cached config for ${dirPath}`);

        if (!this.#configArray) {
            throw new Error(`Could not find config file for ${dirPath}`);
        }

        if (typeof this.#configArray.then === "function") {
            throw new Error(`Config array for ${dirPath} has not yet been calculated or an error occurred during the calculation`);
        }

        return this.#configArray;
    }
}

module.exports = { ConfigLoader, LegacyConfigLoader };
