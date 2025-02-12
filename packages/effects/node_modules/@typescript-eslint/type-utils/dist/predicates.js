"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnyType = void 0;
exports.isNullableType = isNullableType;
exports.isTypeArrayTypeOrUnionOfArrayTypes = isTypeArrayTypeOrUnionOfArrayTypes;
exports.isTypeNeverType = isTypeNeverType;
exports.isTypeUnknownType = isTypeUnknownType;
exports.isTypeReferenceType = isTypeReferenceType;
exports.isTypeAnyType = isTypeAnyType;
exports.isTypeAnyArrayType = isTypeAnyArrayType;
exports.isTypeUnknownArrayType = isTypeUnknownArrayType;
exports.discriminateAnyType = discriminateAnyType;
exports.typeIsOrHasBaseType = typeIsOrHasBaseType;
exports.isTypeBigIntLiteralType = isTypeBigIntLiteralType;
exports.isTypeTemplateLiteralType = isTypeTemplateLiteralType;
const debug_1 = __importDefault(require("debug"));
const tsutils = __importStar(require("ts-api-utils"));
const ts = __importStar(require("typescript"));
const typeFlagUtils_1 = require("./typeFlagUtils");
const log = (0, debug_1.default)('typescript-eslint:type-utils:predicates');
/**
 * Checks if the given type is (or accepts) nullable
 */
function isNullableType(type) {
    return (0, typeFlagUtils_1.isTypeFlagSet)(type, ts.TypeFlags.Any |
        ts.TypeFlags.Unknown |
        ts.TypeFlags.Null |
        ts.TypeFlags.Undefined |
        ts.TypeFlags.Void);
}
/**
 * Checks if the given type is either an array type,
 * or a union made up solely of array types.
 */
function isTypeArrayTypeOrUnionOfArrayTypes(type, checker) {
    for (const t of tsutils.unionTypeParts(type)) {
        if (!checker.isArrayType(t)) {
            return false;
        }
    }
    return true;
}
/**
 * @returns true if the type is `never`
 */
function isTypeNeverType(type) {
    return (0, typeFlagUtils_1.isTypeFlagSet)(type, ts.TypeFlags.Never);
}
/**
 * @returns true if the type is `unknown`
 */
function isTypeUnknownType(type) {
    return (0, typeFlagUtils_1.isTypeFlagSet)(type, ts.TypeFlags.Unknown);
}
// https://github.com/microsoft/TypeScript/blob/42aa18bf442c4df147e30deaf27261a41cbdc617/src/compiler/types.ts#L5157
const Nullable = ts.TypeFlags.Undefined | ts.TypeFlags.Null;
// https://github.com/microsoft/TypeScript/blob/42aa18bf442c4df147e30deaf27261a41cbdc617/src/compiler/types.ts#L5187
const ObjectFlagsType = ts.TypeFlags.Any |
    Nullable |
    ts.TypeFlags.Never |
    ts.TypeFlags.Object |
    ts.TypeFlags.Union |
    ts.TypeFlags.Intersection;
function isTypeReferenceType(type) {
    if ((type.flags & ObjectFlagsType) === 0) {
        return false;
    }
    const objectTypeFlags = type.objectFlags;
    return (objectTypeFlags & ts.ObjectFlags.Reference) !== 0;
}
/**
 * @returns true if the type is `any`
 */
function isTypeAnyType(type) {
    if ((0, typeFlagUtils_1.isTypeFlagSet)(type, ts.TypeFlags.Any)) {
        if (type.intrinsicName === 'error') {
            log('Found an "error" any type');
        }
        return true;
    }
    return false;
}
/**
 * @returns true if the type is `any[]`
 */
function isTypeAnyArrayType(type, checker) {
    return (checker.isArrayType(type) &&
        isTypeAnyType(checker.getTypeArguments(type)[0]));
}
/**
 * @returns true if the type is `unknown[]`
 */
function isTypeUnknownArrayType(type, checker) {
    return (checker.isArrayType(type) &&
        isTypeUnknownType(checker.getTypeArguments(type)[0]));
}
var AnyType;
(function (AnyType) {
    AnyType[AnyType["Any"] = 0] = "Any";
    AnyType[AnyType["PromiseAny"] = 1] = "PromiseAny";
    AnyType[AnyType["AnyArray"] = 2] = "AnyArray";
    AnyType[AnyType["Safe"] = 3] = "Safe";
})(AnyType || (exports.AnyType = AnyType = {}));
/**
 * @returns `AnyType.Any` if the type is `any`, `AnyType.AnyArray` if the type is `any[]` or `readonly any[]`, `AnyType.PromiseAny` if the type is `Promise<any>`,
 *          otherwise it returns `AnyType.Safe`.
 */
function discriminateAnyType(type, checker, program, tsNode) {
    if (isTypeAnyType(type)) {
        return AnyType.Any;
    }
    if (isTypeAnyArrayType(type, checker)) {
        return AnyType.AnyArray;
    }
    for (const part of tsutils.typeParts(type)) {
        if (tsutils.isThenableType(checker, tsNode, part)) {
            const awaitedType = checker.getAwaitedType(part);
            if (awaitedType) {
                const awaitedAnyType = discriminateAnyType(awaitedType, checker, program, tsNode);
                if (awaitedAnyType === AnyType.Any) {
                    return AnyType.PromiseAny;
                }
            }
        }
    }
    return AnyType.Safe;
}
/**
 * @returns Whether a type is an instance of the parent type, including for the parent's base types.
 */
function typeIsOrHasBaseType(type, parentType) {
    const parentSymbol = parentType.getSymbol();
    if (!type.getSymbol() || !parentSymbol) {
        return false;
    }
    const typeAndBaseTypes = [type];
    const ancestorTypes = type.getBaseTypes();
    if (ancestorTypes) {
        typeAndBaseTypes.push(...ancestorTypes);
    }
    for (const baseType of typeAndBaseTypes) {
        const baseSymbol = baseType.getSymbol();
        if (baseSymbol && baseSymbol.name === parentSymbol.name) {
            return true;
        }
    }
    return false;
}
function isTypeBigIntLiteralType(type) {
    return (0, typeFlagUtils_1.isTypeFlagSet)(type, ts.TypeFlags.BigIntLiteral);
}
function isTypeTemplateLiteralType(type) {
    return (0, typeFlagUtils_1.isTypeFlagSet)(type, ts.TypeFlags.TemplateLiteral);
}
//# sourceMappingURL=predicates.js.map