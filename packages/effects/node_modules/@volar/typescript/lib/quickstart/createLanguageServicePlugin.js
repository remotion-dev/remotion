"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decoratedLanguageServiceHosts = exports.decoratedLanguageServices = exports.projectExternalFileExtensions = exports.externalFiles = void 0;
exports.createLanguageServicePlugin = createLanguageServicePlugin;
exports.arrayItemsEqual = arrayItemsEqual;
const language_core_1 = require("@volar/language-core");
const common_1 = require("../common");
const proxyLanguageService_1 = require("../node/proxyLanguageService");
const decorateLanguageServiceHost_1 = require("../node/decorateLanguageServiceHost");
exports.externalFiles = new WeakMap();
exports.projectExternalFileExtensions = new WeakMap();
exports.decoratedLanguageServices = new WeakSet();
exports.decoratedLanguageServiceHosts = new WeakSet();
function createLanguageServicePlugin(create) {
    return modules => {
        const { typescript: ts } = modules;
        const pluginModule = {
            create(info) {
                if (!exports.decoratedLanguageServices.has(info.languageService)
                    && !exports.decoratedLanguageServiceHosts.has(info.languageServiceHost)) {
                    exports.decoratedLanguageServices.add(info.languageService);
                    exports.decoratedLanguageServiceHosts.add(info.languageServiceHost);
                    const { languagePlugins, setup } = create(ts, info);
                    const extensions = languagePlugins
                        .map(plugin => plugin.typescript?.extraFileExtensions.map(ext => '.' + ext.extension) ?? [])
                        .flat();
                    exports.projectExternalFileExtensions.set(info.project, extensions);
                    const getScriptSnapshot = info.languageServiceHost.getScriptSnapshot.bind(info.languageServiceHost);
                    const language = (0, language_core_1.createLanguage)([
                        ...languagePlugins,
                        { getLanguageId: common_1.resolveFileLanguageId },
                    ], new language_core_1.FileMap(ts.sys.useCaseSensitiveFileNames), (fileName, _, shouldRegister) => {
                        let snapshot;
                        if (shouldRegister) {
                            // We need to trigger registration of the script file with the project, see #250
                            snapshot = getScriptSnapshot(fileName);
                        }
                        else {
                            snapshot = getScriptInfo(fileName)?.getSnapshot();
                            if (!snapshot) {
                                // trigger projectService.getOrCreateScriptInfoNotOpenedByClient
                                info.project.getScriptVersion(fileName);
                                snapshot = getScriptInfo(fileName)?.getSnapshot();
                            }
                        }
                        if (snapshot) {
                            language.scripts.set(fileName, snapshot);
                        }
                        else {
                            language.scripts.delete(fileName);
                        }
                    });
                    const { proxy, initialize } = (0, proxyLanguageService_1.createProxyLanguageService)(info.languageService);
                    info.languageService = proxy;
                    initialize(language);
                    (0, decorateLanguageServiceHost_1.decorateLanguageServiceHost)(ts, language, info.languageServiceHost);
                    setup?.(language);
                }
                return info.languageService;
                function getScriptInfo(fileName) {
                    // getSnapshot could be crashed if the file is too large
                    try {
                        return info.project.getScriptInfo(fileName);
                    }
                    catch { }
                }
            },
            getExternalFiles(project, updateLevel = 0) {
                if (updateLevel >= 1
                    || !exports.externalFiles.has(project)) {
                    const oldFiles = exports.externalFiles.get(project);
                    const extensions = exports.projectExternalFileExtensions.get(project);
                    const newFiles = extensions?.length ? (0, decorateLanguageServiceHost_1.searchExternalFiles)(ts, project, extensions) : [];
                    exports.externalFiles.set(project, newFiles);
                    if (oldFiles && !arrayItemsEqual(oldFiles, newFiles)) {
                        project.refreshDiagnostics();
                    }
                }
                return exports.externalFiles.get(project);
            },
        };
        return pluginModule;
    };
}
function arrayItemsEqual(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    const set = new Set(a);
    for (const file of b) {
        if (!set.has(file)) {
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=createLanguageServicePlugin.js.map