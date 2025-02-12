import { Language } from '@volar/language-core';
import type * as ts from 'typescript';
export declare function createProxyLanguageService(languageService: ts.LanguageService): {
    initialize(language: Language<string>): void;
    proxy: ts.LanguageService;
};
