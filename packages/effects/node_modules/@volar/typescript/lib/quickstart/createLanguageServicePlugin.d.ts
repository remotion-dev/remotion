import { Language, LanguagePlugin } from '@volar/language-core';
import type * as ts from 'typescript';
export declare const externalFiles: WeakMap<ts.server.Project, string[]>;
export declare const projectExternalFileExtensions: WeakMap<ts.server.Project, string[]>;
export declare const decoratedLanguageServices: WeakSet<ts.LanguageService>;
export declare const decoratedLanguageServiceHosts: WeakSet<ts.LanguageServiceHost>;
export declare function createLanguageServicePlugin(create: (ts: typeof import('typescript'), info: ts.server.PluginCreateInfo) => {
    languagePlugins: LanguagePlugin<string>[];
    setup?: (language: Language<string>) => void;
}): ts.server.PluginModuleFactory;
export declare function arrayItemsEqual(a: string[], b: string[]): boolean;
