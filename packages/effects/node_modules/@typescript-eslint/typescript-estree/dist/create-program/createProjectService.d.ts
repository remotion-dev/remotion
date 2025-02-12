import type * as ts from 'typescript/lib/tsserverlibrary';
import type { ProjectServiceOptions } from '../parser-options';
export type TypeScriptProjectService = ts.server.ProjectService;
export interface ProjectServiceSettings {
    allowDefaultProject: string[] | undefined;
    lastReloadTimestamp: number;
    maximumDefaultProjectFileMatchCount: number;
    service: TypeScriptProjectService;
}
export declare function createProjectService(optionsRaw: boolean | ProjectServiceOptions | undefined, jsDocParsingMode: ts.JSDocParsingMode | undefined, tsconfigRootDir: string | undefined): ProjectServiceSettings;
//# sourceMappingURL=createProjectService.d.ts.map