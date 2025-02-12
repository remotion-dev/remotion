import { ApiModel, ApiPackage } from '@microsoft/api-extractor-model';
import type { Collector } from '../collector/Collector';
export declare class ApiModelGenerator {
    private readonly _collector;
    private readonly _apiModel;
    private readonly _referenceGenerator;
    constructor(collector: Collector);
    get apiModel(): ApiModel;
    buildApiPackage(): ApiPackage;
    private _processAstEntity;
    private _processAstNamespaceImport;
    private _processDeclaration;
    private _tryFindFunctionDeclaration;
    private _processChildDeclarations;
    private _processApiCallSignature;
    private _processApiConstructor;
    private _processApiClass;
    private _processApiConstructSignature;
    private _processApiEnum;
    private _processApiEnumMember;
    private _processApiFunction;
    private _processApiIndexSignature;
    private _processApiInterface;
    private _processApiMethod;
    private _processApiMethodSignature;
    private _processApiNamespace;
    private _processApiProperty;
    private _processApiPropertySignature;
    private _processApiTypeAlias;
    private _processApiVariable;
    /**
     * @param nodesToCapture - A list of child nodes whose token ranges we want to capture
     */
    private _buildExcerptTokens;
    private _captureTypeParameters;
    private _captureParameters;
    private _isReadonly;
    private _getFileUrlPath;
}
//# sourceMappingURL=ApiModelGenerator.d.ts.map