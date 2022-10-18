// Taken from https://github.com/microsoft/rushstack/blob/main/eslint/eslint-patch/src/modern-module-resolution.ts

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.

// This is a workaround for https://github.com/eslint/eslint/issues/3458
//
// To correct how ESLint searches for plugin packages, add this line to the top of your project's .eslintrc.js file:
//
//    require("@rushstack/eslint-patch/modern-module-resolution");
//
import path from "path";
import fs from "fs";

export const allowESLintShareableConfig = () => {
  const isModuleResolutionError: (ex: unknown) => boolean = (ex) =>
    typeof ex === "object" &&
    !!ex &&
    "code" in ex &&
    (ex as { code: unknown }).code === "MODULE_NOT_FOUND";

  // Module path for eslintrc.cjs
  // Example: ".../@eslint/eslintrc/dist/eslintrc.cjs"
  let eslintrcBundlePath: string | undefined = undefined;

  // Module path for config-array-factory.js
  // Example: ".../@eslint/eslintrc/lib/config-array-factory"
  let configArrayFactoryPath: string | undefined = undefined;

  // Module path for relative-module-resolver.js
  // Example: ".../@eslint/eslintrc/lib/shared/relative-module-resolver"
  let moduleResolverPath: string | undefined = undefined;

  // Folder path where ESLint's package.json can be found
  // Example: ".../node_modules/eslint"
  let eslintFolder: string | undefined = undefined;

  // Probe for the ESLint >=8.0.0 layout:
  for (let currentModule = module; ; ) {
    if (!eslintrcBundlePath) {
      // For ESLint >=8.0.0, all @eslint/eslintrc code is bundled at this path:
      //   .../@eslint/eslintrc/dist/eslintrc.cjs
      try {
        const eslintrcFolder = path.dirname(
          require.resolve("@eslint/eslintrc/package.json", {
            paths: [currentModule.path],
          })
        );

        // Make sure we actually resolved the module in our call path
        // and not some other spurious dependency.
        if (
          path.join(eslintrcFolder, "dist/eslintrc.cjs") ===
          currentModule.filename
        ) {
          eslintrcBundlePath = path.join(eslintrcFolder, "dist/eslintrc.cjs");
        }
      } catch (ex: unknown) {
        // Module resolution failures are expected, as we're walking
        // up our require stack to look for eslint. All other errors
        // are rethrown.
        if (!isModuleResolutionError(ex)) {
          throw ex;
        }
      }
    } else {
      // Next look for a file in ESLint's folder
      //   .../eslint/lib/cli-engine/cli-engine.js
      try {
        const eslintCandidateFolder = path.dirname(
          require.resolve("eslint/package.json", {
            paths: [currentModule.path],
          })
        );

        // Make sure we actually resolved the module in our call path
        // and not some other spurious dependency.
        if (
          path.join(eslintCandidateFolder, "lib/cli-engine/cli-engine.js") ===
          currentModule.filename
        ) {
          eslintFolder = eslintCandidateFolder;
          break;
        }
      } catch (ex: unknown) {
        // Module resolution failures are expected, as we're walking
        // up our require stack to look for eslint. All other errors
        // are rethrown.
        if (!isModuleResolutionError(ex)) {
          throw ex;
        }
      }
    }

    if (!currentModule.parent) {
      break;
    }
    currentModule = currentModule.parent;
  }

  if (!eslintFolder) {
    // Probe for the ESLint >=7.8.0 layout:
    for (let currentModule = module; ; ) {
      if (!configArrayFactoryPath) {
        // For ESLint >=7.8.0, config-array-factory.js is at this path:
        //   .../@eslint/eslintrc/lib/config-array-factory.js
        try {
          const eslintrcFolder = path.dirname(
            require.resolve("@eslint/eslintrc/package.json", {
              paths: [currentModule.path],
            })
          );

          if (
            path.join(eslintrcFolder, "/lib/config-array-factory.js") ==
            currentModule.filename
          ) {
            configArrayFactoryPath = path.join(
              eslintrcFolder,
              "lib/config-array-factory.js"
            );
            moduleResolverPath = path.join(
              eslintrcFolder,
              "lib/shared/relative-module-resolver"
            );
          }
        } catch (ex: unknown) {
          // Module resolution failures are expected, as we're walking
          // up our require stack to look for eslint. All other errors
          // are rethrown.
          if (!isModuleResolutionError(ex)) {
            throw ex;
          }
        }
      } else {
        // Next look for a file in ESLint's folder
        //   .../eslint/lib/cli-engine/cli-engine.js
        try {
          const eslintCandidateFolder = path.dirname(
            require.resolve("eslint/package.json", {
              paths: [currentModule.path],
            })
          );

          if (
            path.join(eslintCandidateFolder, "lib/cli-engine/cli-engine.js") ==
            currentModule.filename
          ) {
            eslintFolder = eslintCandidateFolder;
            break;
          }
        } catch (ex: unknown) {
          // Module resolution failures are expected, as we're walking
          // up our require stack to look for eslint. All other errors
          // are rethrown.
          if (!isModuleResolutionError(ex)) {
            throw ex;
          }
        }
      }

      if (!currentModule.parent) {
        break;
      }
      currentModule = currentModule.parent;
    }
  }

  if (!eslintFolder) {
    // Probe for the <7.8.0 layout:
    for (let currentModule = module; ; ) {
      // For ESLint <7.8.0, config-array-factory.js was at this path:
      //   .../eslint/lib/cli-engine/config-array-factory.js
      if (
        /[\\/]eslint[\\/]lib[\\/]cli-engine[\\/]config-array-factory\.js$/i.test(
          currentModule.filename
        )
      ) {
        eslintFolder = path.join(path.dirname(currentModule.filename), "../..");
        configArrayFactoryPath = path.join(
          eslintFolder,
          "lib/cli-engine/config-array-factory"
        );
        moduleResolverPath = path.join(
          eslintFolder,
          "lib/shared/relative-module-resolver"
        );
        break;
      }

      if (!currentModule.parent) {
        // This was tested with ESLint 6.1.0 .. 7.12.1.
        throw new Error(
          "Failed to patch ESLint because the calling module was not recognized.\n" +
            "If you are using a newer ESLint version that may be unsupported, please create a GitHub issue:\n" +
            "https://github.com/microsoft/rushstack/issues"
        );
      }
      currentModule = currentModule.parent;
    }
  }

  // Detect the ESLint package version
  const eslintPackageJson = fs
    .readFileSync(path.join(eslintFolder, "package.json"))
    .toString();
  const eslintPackageObject = JSON.parse(eslintPackageJson);
  const eslintPackageVersion = eslintPackageObject.version;
  const versionMatch = /^([0-9]+)\./.exec(eslintPackageVersion); // parse the SemVer MAJOR part
  if (!versionMatch) {
    throw new Error("Unable to parse ESLint version: " + eslintPackageVersion);
  }
  const eslintMajorVersion = Number(versionMatch[1]);
  if (!(eslintMajorVersion >= 6 && eslintMajorVersion <= 8)) {
    throw new Error(
      "The patch-eslint.js script has only been tested with ESLint version 6.x, 7.x, and 8.x." +
        ` (Your version: ${eslintPackageVersion})\n` +
        "Consider reporting a GitHub issue:\n" +
        "https://github.com/microsoft/rushstack/issues"
    );
  }

  let ConfigArrayFactory;
  if (eslintMajorVersion === 8) {
    ConfigArrayFactory = require(eslintrcBundlePath!).Legacy.ConfigArrayFactory;
  } else {
    ConfigArrayFactory = require(configArrayFactoryPath!).ConfigArrayFactory;
  }
  if (!ConfigArrayFactory.__patched) {
    ConfigArrayFactory.__patched = true;

    let ModuleResolver: { resolve: any };
    if (eslintMajorVersion === 8) {
      ModuleResolver = require(eslintrcBundlePath!).Legacy.ModuleResolver;
    } else {
      ModuleResolver = require(moduleResolverPath!);
    }
    const originalLoadPlugin = ConfigArrayFactory.prototype._loadPlugin;

    if (eslintMajorVersion === 6) {
      // ESLint 6.x
      ConfigArrayFactory.prototype._loadPlugin = function (
        _name: string,
        importerPath: string,
        _importerName: string
      ) {
        const originalResolve = ModuleResolver.resolve;
        try {
          ModuleResolver.resolve = function (
            moduleName: string,
            _relativeToPath: string
          ) {
            // resolve using importerPath instead of relativeToPath
            return originalResolve.call(this, moduleName, importerPath);
          };
          return originalLoadPlugin.apply(this, arguments);
        } finally {
          ModuleResolver.resolve = originalResolve;
        }
      };
    } else {
      // ESLint 7.x || 8.x
      ConfigArrayFactory.prototype._loadPlugin = function (
        _name: string,
        ctx: Record<string, unknown>
      ) {
        const originalResolve = ModuleResolver.resolve;
        try {
          ModuleResolver.resolve = function (
            moduleName: string,
            _relativeToPath: string
          ) {
            // resolve using ctx.filePath instead of relativeToPath
            return originalResolve.call(this, moduleName, ctx.filePath);
          };
          return originalLoadPlugin.apply(this, arguments);
        } finally {
          ModuleResolver.resolve = originalResolve;
        }
      };
    }
  }
};
