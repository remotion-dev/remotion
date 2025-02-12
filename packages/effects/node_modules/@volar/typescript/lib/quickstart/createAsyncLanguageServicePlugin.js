"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAsyncLanguageServicePlugin = createAsyncLanguageServicePlugin;
const language_core_1 = require("@volar/language-core");
const common_1 = require("../common");
const proxyLanguageService_1 = require("../node/proxyLanguageService");
const decorateLanguageServiceHost_1 = require("../node/decorateLanguageServiceHost");
const createLanguageServicePlugin_1 = require("./createLanguageServicePlugin");
function createAsyncLanguageServicePlugin(extensions, getScriptKindForExtraExtensions, create) {
    return modules => {
        const { typescript: ts } = modules;
        const pluginModule = {
            create(info) {
                if (!createLanguageServicePlugin_1.decoratedLanguageServices.has(info.languageService)
                    && !createLanguageServicePlugin_1.decoratedLanguageServiceHosts.has(info.languageServiceHost)) {
                    createLanguageServicePlugin_1.decoratedLanguageServices.add(info.languageService);
                    createLanguageServicePlugin_1.decoratedLanguageServiceHosts.add(info.languageServiceHost);
                    const emptySnapshot = ts.ScriptSnapshot.fromString('');
                    const getScriptSnapshot = info.languageServiceHost.getScriptSnapshot.bind(info.languageServiceHost);
                    const getScriptVersion = info.languageServiceHost.getScriptVersion.bind(info.languageServiceHost);
                    const getScriptKind = info.languageServiceHost.getScriptKind?.bind(info.languageServiceHost);
                    const getProjectVersion = info.languageServiceHost.getProjectVersion?.bind(info.languageServiceHost);
                    let initialized = false;
                    info.languageServiceHost.getScriptSnapshot = fileName => {
                        if (!initialized) {
                            if (extensions.some(ext => fileName.endsWith(ext))) {
                                return emptySnapshot;
                            }
                            if (getScriptInfo(fileName)?.isScriptOpen()) {
                                return emptySnapshot;
                            }
                        }
                        return getScriptSnapshot(fileName);
                    };
                    info.languageServiceHost.getScriptVersion = fileName => {
                        if (!initialized) {
                            if (extensions.some(ext => fileName.endsWith(ext))) {
                                return 'initializing...';
                            }
                            if (getScriptInfo(fileName)?.isScriptOpen()) {
                                return getScriptVersion(fileName) + ',initializing...';
                            }
                        }
                        return getScriptVersion(fileName);
                    };
                    if (getScriptKind) {
                        info.languageServiceHost.getScriptKind = fileName => {
                            if (!initialized && extensions.some(ext => fileName.endsWith(ext))) {
                                // bypass upstream bug https://github.com/microsoft/TypeScript/issues/57631
                                // TODO: check if the bug is fixed in 5.5
                                if (typeof getScriptKindForExtraExtensions === 'function') {
                                    return getScriptKindForExtraExtensions(fileName);
                                }
                                else {
                                    return getScriptKindForExtraExtensions;
                                }
                            }
                            return getScriptKind(fileName);
                        };
                    }
                    if (getProjectVersion) {
                        info.languageServiceHost.getProjectVersion = () => {
                            if (!initialized) {
                                return getProjectVersion() + ',initializing...';
                            }
                            return getProjectVersion();
                        };
                    }
                    const { proxy, initialize } = (0, proxyLanguageService_1.createProxyLanguageService)(info.languageService);
                    info.languageService = proxy;
                    create(ts, info).then(({ languagePlugins, setup }) => {
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
                        initialize(language);
                        (0, decorateLanguageServiceHost_1.decorateLanguageServiceHost)(ts, language, info.languageServiceHost);
                        setup?.(language);
                        initialized = true;
                        if ('markAsDirty' in info.project && typeof info.project.markAsDirty === 'function') {
                            info.project.markAsDirty();
                        }
                    });
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
                    || !createLanguageServicePlugin_1.externalFiles.has(project)) {
                    const oldFiles = createLanguageServicePlugin_1.externalFiles.get(project);
                    const newFiles = extensions.length ? (0, decorateLanguageServiceHost_1.searchExternalFiles)(ts, project, extensions) : [];
                    createLanguageServicePlugin_1.externalFiles.set(project, newFiles);
                    if (oldFiles && !(0, createLanguageServicePlugin_1.arrayItemsEqual)(oldFiles, newFiles)) {
                        project.refreshDiagnostics();
                    }
                }
                return createLanguageServicePlugin_1.externalFiles.get(project);
            },
        };
        return pluginModule;
    };
}
//# sourceMappingURL=createAsyncLanguageServicePlugin.js.map