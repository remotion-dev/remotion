import type * as ts from 'typescript/lib/tsserverlibrary';
/**
 * Utility offered by parser to help consumers parse a config file.
 *
 * @param configFile the path to the tsconfig.json file, relative to `projectDirectory`
 * @param projectDirectory the project directory to use as the CWD, defaults to `process.cwd()`
 */
export declare function getParsedConfigFile(tsserver: typeof ts, configFile: string, projectDirectory?: string): ts.ParsedCommandLine;
//# sourceMappingURL=getParsedConfigFile.d.ts.map