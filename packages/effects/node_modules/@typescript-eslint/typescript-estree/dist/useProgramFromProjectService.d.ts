import type { ProjectServiceSettings } from './create-program/createProjectService';
import type { ASTAndDefiniteProgram, ASTAndNoProgram, ASTAndProgram } from './create-program/shared';
import type { MutableParseSettings } from './parseSettings';
export declare function useProgramFromProjectService(settings: ProjectServiceSettings, parseSettings: Readonly<MutableParseSettings>, hasFullTypeInformation: boolean, defaultProjectMatchedFiles: Set<string>): ASTAndProgram | undefined;
export declare function useProgramFromProjectService(settings: ProjectServiceSettings, parseSettings: Readonly<MutableParseSettings>, hasFullTypeInformation: true, defaultProjectMatchedFiles: Set<string>): ASTAndDefiniteProgram | undefined;
export declare function useProgramFromProjectService(settings: ProjectServiceSettings, parseSettings: Readonly<MutableParseSettings>, hasFullTypeInformation: false, defaultProjectMatchedFiles: Set<string>): ASTAndNoProgram | undefined;
//# sourceMappingURL=useProgramFromProjectService.d.ts.map