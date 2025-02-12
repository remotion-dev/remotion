import { Language, LanguagePlugin } from '@volar/language-core';
import type * as ts from 'typescript';
export declare function createAsyncLanguageServicePlugin(extensions: string[], getScriptKindForExtraExtensions: ts.ScriptKind | ((fileName: string) => ts.ScriptKind), create: (ts: typeof import('typescript'), info: ts.server.PluginCreateInfo) => Promise<{
    languagePlugins: LanguagePlugin<string>[];
    setup?: (language: Language<string>) => void;
}>): ts.server.PluginModuleFactory;
